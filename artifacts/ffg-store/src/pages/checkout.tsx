import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, totalPriceKobo, clearCart } = useCart();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container max-w-screen-xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-30" />
          <h2 className="font-serif font-bold text-2xl mb-3">Your cart is empty</h2>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div>
      </Layout>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = "Name is required";
    if (!form.customerEmail.trim() || !form.customerEmail.includes("@")) errs.customerEmail = "Valid email is required";
    if (!form.customerPhone.trim()) errs.customerPhone = "Phone number is required";
    if (!form.deliveryAddress.trim()) errs.deliveryAddress = "Delivery address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createOrder.mutate(
      {
        data: {
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          notes: form.notes || null,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          navigate(`/order-confirmation?orderId=${order.id}`);
        },
        onError: () => {
          toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const field = (id: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-medium">{label}</Label>
      {id === "notes" ? (
        <Textarea
          id={id}
          placeholder={placeholder || label}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          rows={3}
          className="resize-none"
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder || label}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className={errors[id] ? "border-destructive" : ""}
        />
      )}
      {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-screen-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground mb-4">
            <Link href="/cart"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart</Link>
          </Button>
          <h1 className="font-serif font-bold text-4xl">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="rounded-xl bg-card border border-border p-6">
              <h2 className="font-serif font-bold text-xl mb-5">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("customerName", "Full Name", "text", "e.g. Amaka Johnson")}
                {field("customerEmail", "Email Address", "email", "email@example.com")}
                {field("customerPhone", "Phone Number", "tel", "e.g. 0901234567")}
              </div>
              <div className="mt-4">
                {field("deliveryAddress", "Delivery Address", "text", "Street, City, State")}
              </div>
              <div className="mt-4">
                {field("notes", "Order Notes (optional)", "text", "Any special instructions for your order...")}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold text-base"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Placing Order..." : `Place Order — ${formatNaira(totalPriceKobo)}`}
            </Button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-card border border-border p-6 sticky top-20">
              <h2 className="font-serif font-bold text-xl mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{item.productName} × {item.quantity}</span>
                    <span className="font-medium whitespace-nowrap">{formatNaira(item.priceKobo * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatNaira(totalPriceKobo)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Payment on delivery. Our team will contact you to confirm your order.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
