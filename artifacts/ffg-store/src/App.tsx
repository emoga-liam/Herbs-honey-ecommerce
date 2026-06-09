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
import ForgotPasswordPage from "@/pages/forgot-password";
import MyOrdersPage from "@/pages/my-orders";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminProductsPage from "@/pages/admin/products";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminSiteSettingsPage from "@/pages/admin/site-settings";
import AdminChangePasswordPage from "@/pages/admin/change-password";
import AdminCategoriesPage from "@/pages/admin/categories";
import AdminDeliveryFeesPage from "@/pages/admin/delivery-fees";
import AdminCategoryDetailPage from "@/pages/admin/category-detail";

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
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />

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
      <Route path="/my-orders">
        {() => <StoreAuthGuard><MyOrdersPage /></StoreAuthGuard>}
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
      <Route path="/admin/change-password">
        {() => <AdminGuard><AdminChangePasswordPage /></AdminGuard>}
      </Route>
      <Route path="/admin/categories/:id">
        {() => <AdminGuard><AdminCategoryDetailPage /></AdminGuard>}
      </Route>
      <Route path="/admin/categories">
        {() => <AdminGuard><AdminCategoriesPage /></AdminGuard>}
      </Route>
      <Route path="/admin/delivery-fees">
        {() => <AdminGuard><AdminDeliveryFeesPage /></AdminGuard>}
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
