import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { AdminGuard } from "@/pages/admin/guard";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/product-detail";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import OrderConfirmationPage from "@/pages/order-confirmation";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import AccountPage from "@/pages/account";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminProductsPage from "@/pages/admin/products";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminSiteSettingsPage from "@/pages/admin/site-settings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/order-confirmation" component={OrderConfirmationPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/account" component={AccountPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        {() => <AdminGuard><AdminDashboardPage /></AdminGuard>}
      </Route>
      <Route path="/admin/products">
        {() => <AdminGuard><AdminProductsPage /></AdminGuard>}
      </Route>
      <Route path="/admin/orders">
        {() => <AdminGuard><AdminOrdersPage /></AdminGuard>}
      </Route>
      <Route path="/admin/site-settings">
        {() => <AdminGuard><AdminSiteSettingsPage /></AdminGuard>}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </CartProvider>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
