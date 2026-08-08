import nodemailer from "nodemailer";

export type ContactMailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

function smtpConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function createMailTransport() {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1"
      : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendContactEmail(payload: ContactMailPayload): Promise<void> {
  if (!smtpConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_USER and SMTP_PASS (Hostinger mailbox credentials).",
    );
  }

  const from = process.env.SMTP_USER!;
  const to = process.env.CONTACT_TO_EMAIL || from || "info@grich20.online";
  const transport = createMailTransport();

  const text = [
    `New contact form message from GRICH20`,
    ``,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone?.trim() || "(not provided)"}`,
    `Subject: ${payload.subject}`,
    ``,
    `Message:`,
    payload.message,
  ].join("\n");

  await transport.sendMail({
    from: `"GRICH20 Contact" <${from}>`,
    to,
    replyTo: payload.email,
    subject: `[GRICH20 Contact] ${payload.subject}`,
    text,
  });
}
