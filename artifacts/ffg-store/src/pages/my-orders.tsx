import { useGetOrdersByEmail } from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { formatNaira } from "@/lib/utils";
import { Link } from "wouter";
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  pending: { label: "Order Received", icon: Clock, color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-700/40" },
  processing: { label: "Being Processed", icon: Package, color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-700/40" },
  shipped: { label: "Out for Delivery", icon: Truck, color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-700/40" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-400", bg: "bg-green-900/20", border: "border-green-700/40" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-700/40" },
};

const PROGRESS_STEPS = ["pending", "processing", "shipped", "delivered"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.border} border ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled") return null;
  const current = PROGRESS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-4 mb-1">
      {PROGRESS_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const cfg = STATUS_CONFIG[step];
        const Icon = cfg.icon;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-1 flex-shrink-0 ${i > 0 ? "" : ""}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                ${done ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-[#0a1500] border-amber-900/30 text-amber-200/20"}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] uppercase tracking-wider whitespace-nowrap ${active ? cfg.color : done ? "text-amber-200/40" : "text-amber-200/20"}`}>
                {cfg.label.split(" ")[0]}
              </span>
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded transition-all ${i < current ? "bg-amber-600/50" : "bg-amber-900/20"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const isHistory = order.status === "delivered" || order.status === "cancelled";
  return (
    <div className={`rounded-2xl border bg-card p-5 space-y-4 ${isHistory ? "border-amber-900/20 opacity-80" : "border-amber-900/30"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-cormorant font-bold text-lg text-amber-200">Order #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-amber-200/40">
            Placed {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-cormorant font-bold text-xl text-amber-400">{formatNaira(order.totalKobo)}</div>
          <div className="text-xs text-amber-200/40">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {!isHistory && <OrderProgress status={order.status} />}

      <div className="border-t border-amber-900/20 pt-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-amber-200/50 truncate flex-1 mr-2">{item.productName} × {item.quantity}</span>
            <span className="text-amber-300 font-medium whitespace-nowrap">{formatNaira(item.priceKobo * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-amber-900/20 pt-3 flex items-center justify-between">
        <div className="text-xs text-amber-200/40 truncate flex-1 mr-2">
          🚚 {order.deliveryAddress}
        </div>
        {order.paymentReference && (
          <span className="text-[10px] bg-green-900/20 text-green-400 border border-green-800/30 rounded-full px-2 py-0.5 flex-shrink-0">
            Paid
          </span>
        )}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useGetOrdersByEmail(
    { email: user?.email ?? "" }
  );

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const history = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-16 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card border border-amber-900/20 h-40 animate-pulse" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-2">Your Account</p>
          <h1 className="font-cormorant font-bold text-5xl text-amber-100">My Orders</h1>
          <p className="text-amber-200/40 text-sm mt-2">Logged in as {user?.email}</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-card border border-amber-900/20 p-12 text-center">
            <ShoppingBag className="h-14 w-14 text-amber-900/40 mx-auto mb-4" />
            <h2 className="font-cormorant font-bold text-2xl text-amber-300 mb-2">No orders yet</h2>
            <p className="text-amber-200/50 text-sm mb-6">When you place an order, it will appear here.</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold rounded-full">
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {activeOrders.length > 0 && (
              <section>
                <h2 className="font-cormorant font-bold text-2xl text-amber-300 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Active Orders
                </h2>
                <div className="space-y-4">
                  {activeOrders
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              </section>
            )}

            {history.length > 0 && (
              <section>
                <h2 className="font-cormorant font-bold text-2xl text-amber-200/60 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-900 inline-block" />
                  Order History
                </h2>
                <div className="space-y-4">
                  {history
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((order) => <OrderCard key={order.id} order={order} />)}
                </div>
              </section>
            )}

            <div className="text-center">
              <Link href="/products" className="inline-flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400">
                Continue Shopping <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
