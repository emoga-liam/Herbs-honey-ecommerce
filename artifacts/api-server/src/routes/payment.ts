import { Router, type Request, type Response } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

async function paystackApi<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
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

  const { reference } = req.body as { reference?: string };
  if (!reference || typeof reference !== "string") {
    res.status(400).json({ error: "reference required" });
    return;
  }

  try {
    const { data } = await paystackApi<{
      data: {
        status: string;
        reference: string;
        amount: number;
        gateway_response: string;
        paid_at: string | null;
        metadata?: unknown;
      };
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);

    const isSuccess = data.status === "success";

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.paymentReference, reference));

    if (order) {
      await db
        .update(ordersTable)
        .set({ status: isSuccess ? "paid" : order.status })
        .where(eq(ordersTable.id, order.id));
    }

    res.json({
      verified: isSuccess,
      status: data.status,
      amount: data.amount,
      paidAt: data.paid_at,
      gatewayResponse: data.gateway_response,
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

  const body = req.body as Buffer;
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
  if (hash !== signature) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const event = JSON.parse(body.toString()) as {
    event: string;
    data: { reference: string; status: string };
  };

  req.log.info(
    { eventType: event.event, reference: event.data?.reference },
    "Paystack webhook received"
  );

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.paymentReference, reference));

    if (order) {
      await db
        .update(ordersTable)
        .set({ status: "paid" })
        .where(eq(ordersTable.id, order.id));
      req.log.info({ orderId: order.id, reference }, "Order marked as paid via webhook");
    }
  }

  res.json({ received: true });
}

export default router;
