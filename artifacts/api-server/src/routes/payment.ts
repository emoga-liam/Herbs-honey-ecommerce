import { Router, type Request, type Response } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { VerifyPaymentBody } from "@workspace/api-zod";

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  gateway_response: string;
  paid_at: string | null;
  metadata?: unknown;
};

async function paystackApi<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  if (!PAYSTACK_SECRET) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const res = await fetch(`https://api.paystack.co${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// POST /payments/verify — called by frontend after Paystack inline success or by admin
router.post("/payments/verify", async (req, res): Promise<void> => {
  if (!PAYSTACK_SECRET) {
    res.status(503).json({ error: "Paystack not configured on server" });
    return;
  }

  const parsedInput = VerifyPaymentBody.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(400).json({ error: "reference required" });
    return;
  }
  const { reference } = parsedInput.data;

  try {
    const { data } = await paystackApi<{
      data: PaystackTransaction;
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.paymentReference, reference));

    if (!order) {
      res.status(404).json({ error: "No order found for this payment reference" });
      return;
    }

    const isSuccess = data.status === "success";
    const amountMatches = data.amount === order.totalKobo;
    const verified = isSuccess && amountMatches;

    if (verified && order.status !== "paid") {
      await db
        .update(ordersTable)
        .set({ status: "paid" })
        .where(eq(ordersTable.id, order.id));
    }

    res.json({
      verified,
      status: data.status,
      amount: data.amount,
      expectedAmount: order.totalKobo,
      amountMatches,
      paidAt: data.paid_at,
      gatewayResponse: data.gateway_response,
      orderId: order.id,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Webhook handler — mounted directly on app (before express.json()) with express.raw()
export async function handlePaystackWebhook(req: Request, res: Response): Promise<void> {
  if (!PAYSTACK_SECRET) {
    res.status(503).json({ error: "Paystack not configured" });
    return;
  }

  const signature = req.headers["x-paystack-signature"] as string | undefined;
  if (!signature) {
    res.status(400).json({ error: "Missing signature" });
    return;
  }

  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: "Webhook body must be raw JSON" });
    return;
  }

  const body = req.body;
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
  const expected = Buffer.from(hash, "utf8");
  const received = Buffer.from(signature, "utf8");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  let event: {
    event: string;
    data?: PaystackTransaction;
  };
  try {
    event = JSON.parse(body.toString("utf8")) as typeof event;
  } catch {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  req.log.info(
    { eventType: event.event, reference: event.data?.reference },
    "Paystack webhook received"
  );

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.paymentReference, reference));

    if (order && event.data.status === "success" && event.data.amount === order.totalKobo) {
      await db
        .update(ordersTable)
        .set({ status: "paid" })
        .where(eq(ordersTable.id, order.id));
      req.log.info({ orderId: order.id, reference }, "Order marked as paid via webhook");
    } else if (order) {
      req.log.warn(
        {
          orderId: order.id,
          reference,
          receivedAmount: event.data.amount,
          expectedAmount: order.totalKobo,
          status: event.data.status,
        },
        "Paystack webhook did not match the order",
      );
    }
  }

  res.json({ received: true });
}

export default router;
