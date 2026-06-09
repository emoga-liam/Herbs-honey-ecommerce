import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const deliveryFeesTable = pgTable("delivery_fees", {
  id: serial("id").primaryKey(),
  state: text("state").notNull().unique(),
  feeKobo: integer("fee_kobo").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DeliveryFee = typeof deliveryFeesTable.$inferSelect;
