import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateOrder } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowLeft, ShoppingBag, Lock, CreditCard, Smartphone, Building2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    PaystackPop: new () => {
      newTransaction: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        onSuccess: (transaction: { reference: string }) => void;
        onCancel: () => void;
      }) => void;
    };
  }
}

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
const isPaystackConfigured = !!PAYSTACK_KEY;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, totalPriceKobo, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const [paying, setPaying] = useState(false);

  const [form, setForm] = useState({
    customerName: user?.displayName ?? "",
    customerEmail: user?.email ?? "",
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
          <h2 className="font-cormorant font-bold text-3xl mb-3">Your cart is empty</h2>
          <Button asChild className="bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold rounded-full">
            <Link href="/products">Browse Products</Link>
          </Button>
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

  const placeOrder = (paymentReference: string | null) => {
    createOrder.mutate(
      {
        data: {
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          deliveryAddress: form.deliveryAddress,
          notes: form.notes || null,
          paymentReference,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          navigate(`/order-confirmation?orderId=${order.id}`);
        },
        onError: () => {
          setPaying(false);
          toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const handlePaystack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPaying(true);

    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: PAYSTACK_KEY!,
      email: form.customerEmail,
      amount: totalPriceKobo,
      currency: "NGN",
      ref: `grich20_${Date.now()}`,
      onSuccess: (transaction) => {
        placeOrder(transaction.reference);
      },
      onCancel: () => {
        setPaying(false);
        toast({ title: "Payment cancelled", description: "Your order was not placed.", variant: "destructive" });
      },
    });
  };

  const handleCOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    placeOrder(null);
  };

  const inputClass = "bg-[#060d07] border-amber-900/40 text-amber-100 placeholder:text-amber-200/20 focus:border-amber-600 rounded-xl";

  const field = (id: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-amber-200/70 text-sm font-medium">{label}</Label>
      {id === "notes" ? (
        <Textarea id={id} placeholder={placeholder} value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          rows={3} className={`resize-none ${inputClass}`} />
      ) : (
        <Input id={id} type={type} placeholder={placeholder} value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          className={`${inputClass} ${errors[id] ? "border-red-500" : ""}`} />
      )}
      {errors[id] && <p className="text-xs text-red-400">{errors[id]}</p>}
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-screen-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="text-amber-200/50 hover:text-amber-300 mb-4">
            <Link href="/cart"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart</Link>
          </Button>
          <h1 className="font-cormorant font-bold text-5xl text-amber-100">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl bg-card border border-amber-900/30 p-6">
              <h2 className="font-cormorant font-bold text-2xl text-amber-200 mb-5">Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("customerName", "Full Name", "text", "e.g. Amaka Johnson")}
                {field("customerEmail", "Email Address", "email", "email@example.com")}
                {field("customerPhone", "Phone Number", "tel", "e.g. 0901234567")}
              </div>
              <div className="mt-4">
                {field("deliveryAddress", "Delivery Address", "text", "Street, Estate, City")}
              </div>
              <div className="mt-4">
                {field("notes", "Order Notes (optional)", "text", "Special instructions for your order...")}
              </div>
            </div>

            {/* Payment options */}
            <div className="rounded-2xl bg-card border border-amber-900/30 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="h-4 w-4 text-amber-500" />
                <h2 className="font-cormorant font-bold text-2xl text-amber-200">Payment</h2>
              </div>

              {isPaystackConfigured ? (
                <div className="space-y-4">
                  {/* Paystack payment methods */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { icon: CreditCard, label: "Card" },
                      { icon: Building2, label: "Transfer" },
                      { icon: Smartphone, label: "USSD" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="rounded-xl border border-amber-900/30 bg-amber-900/10 p-3 text-center">
                        <Icon className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-xs text-amber-200/60">{label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-200/40 text-center mb-4">
                    Secured by Paystack · 256-bit SSL encryption
                  </p>
                  <Button
                    onClick={handlePaystack}
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold text-base rounded-xl shadow-lg shadow-amber-900/30"
                    disabled={paying || createOrder.isPending}
                  >
                    {paying || createOrder.isPending
                      ? "Processing..."
                      : `Pay ${formatNaira(totalPriceKobo)} with Paystack`}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleCOD}
                      disabled={paying || createOrder.isPending}
                      className="text-sm text-amber-200/40 hover:text-amber-300 underline-offset-2 hover:underline transition-colors"
                    >
                      Pay on delivery instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-amber-900/10 border border-amber-900/30 p-4">
                    <p className="text-sm text-amber-200/60 text-center">
                      Online payment coming soon. Place your order and pay on delivery.
                    </p>
                  </div>
                  <Button
                    onClick={handleCOD}
                    size="lg"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold text-base rounded-xl"
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Placing Order..." : `Place Order — ${formatNaira(totalPriceKobo)}`}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-card border border-amber-900/30 p-6 sticky top-20">
              <h2 className="font-cormorant font-bold text-2xl text-amber-200 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-amber-200/60 line-clamp-1 flex-1 mr-2">{item.productName} × {item.quantity}</span>
                    <span className="font-medium text-amber-300 whitespace-nowrap">{formatNaira(item.priceKobo * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-amber-900/30 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/60 text-sm">Subtotal</span>
                  <span className="text-amber-300">{formatNaira(totalPriceKobo)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-200/60 text-sm">Delivery</span>
                  <span className="text-green-400 text-sm font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-900/20">
                  <span className="font-bold text-amber-100">Total</span>
                  <span className="font-cormorant font-bold text-3xl text-amber-400">{formatNaira(totalPriceKobo)}</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-green-900/20 border border-green-800/30 p-3 flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-300/80">Our team will confirm your order and arrange delivery within Abuja.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
