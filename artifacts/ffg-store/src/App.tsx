import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { AdminGuard } from "@/pages/admin/guard";
import { StoreAuthGuard } from "@/components/auth-guard";
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
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Auth-protected store routes */}
      <Route path="/products">
        {() => <StoreAuthGuard><ProductsPage /></StoreAuthGuard>}
      </Route>
      <Route path="/products/:id">
        {() => <StoreAuthGuard><ProductDetailPage /></StoreAuthGuard>}
      </Route>
      <Route path="/cart">
        {() => <StoreAuthGuard><CartPage /></StoreAuthGuard>}
      </Route>
      <Route path="/checkout">
        {() => <StoreAuthGuard><CheckoutPage /></StoreAuthGuard>}
      </Route>
      <Route path="/order-confirmation">
        {() => <StoreAuthGuard><OrderConfirmationPage /></StoreAuthGuard>}
      </Route>
      <Route path="/account">
        {() => <StoreAuthGuard><AccountPage /></StoreAuthGuard>}
      </Route>

      {/* Admin routes */}
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
