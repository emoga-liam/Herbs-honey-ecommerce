import { useSearch, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { CheckCircle, Package, Phone } from "lucide-react";

export default function OrderConfirmationPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = Number(params.get("orderId"));

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) },
  });

  return (
    <Layout>
      <div className="container max-w-screen-md mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-serif font-bold text-4xl text-foreground mb-3">Order Placed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. Our team will contact you shortly to confirm delivery.
          </p>
        </div>

        {isLoading && <div className="rounded-xl bg-card border animate-pulse h-48 mb-8" />}

        {order && (
          <div className="rounded-xl bg-card border border-border p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-bold text-xl">Order #{order.id}</h2>
              <span className="text-sm bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-3 py-1 font-medium capitalize">
                {order.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                  <span className="font-medium">{formatNaira(item.priceKobo * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatNaira(order.totalKobo)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Deliver to:</span> {order.deliveryAddress}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-muted/50 p-5 text-left">
            <Package className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">What happens next?</h3>
            <p className="text-sm text-muted-foreground">We'll review your order and reach out to confirm your delivery details and arrange payment on delivery.</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-5 text-left">
            <Phone className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold mb-1">Need help?</h3>
            <p className="text-sm text-muted-foreground">Call us on <span className="font-semibold text-primary">09061602332</span> or visit us at 68 Trade More Avenue, Lugbe, Abuja.</p>
          </div>
        </div>

        <Button asChild size="lg" className="font-bold">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </Layout>
  );
}
