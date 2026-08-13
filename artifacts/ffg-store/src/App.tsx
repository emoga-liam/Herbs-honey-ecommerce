import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { SettingsProvider } from "@/contexts/settings-context";
import { StoreAuthGuard } from "@/components/auth-guard";
import { Spinner } from "@/components/ui/spinner";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";

const ContactPage = lazy(() => import("@/pages/contact"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/forgot-password"));
const TermsPage = lazy(() => import("@/pages/terms"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));
const ProductsPage = lazy(() => import("@/pages/products"));
const ProductDetailPage = lazy(() => import("@/pages/product-detail"));
const CartPage = lazy(() => import("@/pages/cart"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const OrderConfirmationPage = lazy(() => import("@/pages/order-confirmation"));
const AccountPage = lazy(() => import("@/pages/account"));
const MyOrdersPage = lazy(() => import("@/pages/my-orders"));
const AdminLoginPage = lazy(() => import("@/pages/admin/login"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminProductsPage = lazy(() => import("@/pages/admin/products"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/orders"));
const AdminSiteSettingsPage = lazy(() => import("@/pages/admin/site-settings"));
const AdminChangePasswordPage = lazy(() => import("@/pages/admin/change-password"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/categories"));
const AdminDeliveryFeesPage = lazy(() => import("@/pages/admin/delivery-fees"));
const AdminCategoryDetailPage = lazy(() => import("@/pages/admin/category-detail"));
const AdminGuard = lazy(() =>
  import("@/pages/admin/guard").then((m) => ({ default: m.AdminGuard })),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          {() => (
            <StoreAuthGuard>
              <ProductsPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/products/:id">
          {() => (
            <StoreAuthGuard>
              <ProductDetailPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/cart">
          {() => (
            <StoreAuthGuard>
              <CartPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/checkout">
          {() => (
            <StoreAuthGuard>
              <CheckoutPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/order-confirmation">
          {() => (
            <StoreAuthGuard>
              <OrderConfirmationPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/account">
          {() => (
            <StoreAuthGuard>
              <AccountPage />
            </StoreAuthGuard>
          )}
        </Route>
        <Route path="/my-orders">
          {() => (
            <StoreAuthGuard>
              <MyOrdersPage />
            </StoreAuthGuard>
          )}
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin">
          {() => (
            <AdminGuard>
              <AdminDashboardPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/products">
          {() => (
            <AdminGuard>
              <AdminProductsPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/orders">
          {() => (
            <AdminGuard>
              <AdminOrdersPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/site-settings">
          {() => (
            <AdminGuard>
              <AdminSiteSettingsPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/change-password">
          {() => (
            <AdminGuard>
              <AdminChangePasswordPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/categories/:id">
          {() => (
            <AdminGuard>
              <AdminCategoryDetailPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/categories">
          {() => (
            <AdminGuard>
              <AdminCategoriesPage />
            </AdminGuard>
          )}
        </Route>
        <Route path="/admin/delivery-fees">
          {() => (
            <AdminGuard>
              <AdminDeliveryFeesPage />
            </AdminGuard>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme">
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
