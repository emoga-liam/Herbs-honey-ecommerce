import { useState } from "react";
import { useListOrders, useGetOrder, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { X, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function OrderDetailModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: order, isLoading } = useGetOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  const handleStatus = (status: string) => {
    updateStatus.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Status updated" });
        },
        onError: () => toast({ title: "Error updating status", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-serif font-bold text-xl">Order #{orderId}</h3>
          <button onClick={onClose} className="p-1 hover:text-destructive transition-colors"><X className="h-5 w-5" /></button>
        </div>
        {isLoading ? (
          <div className="p-5 animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-muted rounded" />)}
          </div>
        ) : order ? (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name</span><p className="font-semibold">{order.customerName}</p></div>
              <div><span className="text-muted-foreground">Phone</span><p className="font-semibold">{order.customerPhone}</p></div>
              <div><span className="text-muted-foreground">Email</span><p className="font-semibold break-all">{order.customerEmail}</p></div>
              <div><span className="text-muted-foreground">Date</span><p className="font-semibold">{new Date(order.createdAt).toLocaleDateString("en-NG")}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">Address</span><p className="font-semibold">{order.deliveryAddress}</p></div>
              {order.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes</span><p className="font-semibold">{order.notes}</p></div>}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <h4 className="font-semibold text-sm">Items</h4>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatNaira(item.priceKobo * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatNaira(order.totalKobo)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-sm mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={order.status === status ? "default" : "outline"}
                    onClick={() => handleStatus(status)}
                    disabled={updateStatus.isPending}
                    className="capitalize text-xs"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center text-muted-foreground">Order not found</div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useListOrders(
    { status: statusFilter || undefined },
    { query: { queryKey: ["orders", statusFilter] } }
  );

  return (
    <AdminLayout title="Orders">
      <div className="flex flex-wrap gap-2 mb-6">
        {["", ...STATUSES].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className="capitalize text-xs"
          >
            {s || "All"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card border rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-1">No orders found</p>
          <p className="text-sm">Orders will appear here once customers place them.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold">#{order.id}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{order.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatNaira(order.totalKobo)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ""}`}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrderId(order.id)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrderId !== null && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </AdminLayout>
  );
}
