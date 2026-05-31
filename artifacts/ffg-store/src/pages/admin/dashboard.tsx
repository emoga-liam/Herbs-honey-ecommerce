import { useGetAdminStats, useAdminLogout } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingUp, Clock, LogOut, LayoutDashboard, Archive } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  adminName?: string;
}

export function AdminLayout({ children, title, adminName }: AdminLayoutProps) {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const logout = useAdminLogout();

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="font-serif font-bold text-lg text-sidebar-primary">FFG Foods</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                location === href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          {adminName && <p className="text-xs text-sidebar-foreground/50 px-3 mb-2">{adminName}</p>}
          <button
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/admin/login") })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-red-900/30 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6 gap-3 bg-card">
          <h2 className="font-serif font-bold text-lg">{title}</h2>
          <div className="ml-auto">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">View Store</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card border rounded-xl animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Revenue", value: formatNaira(stats?.totalRevenueKobo ?? 0), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Archive, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 mb-6">
          <h3 className="font-serif font-bold text-lg mb-4">Orders by Status</h3>
          <div className="flex flex-wrap gap-3">
            {stats.ordersByStatus.map(({ status, count }) => (
              <div key={status} className={`rounded-full border px-4 py-2 text-sm font-medium ${STATUS_COLORS[status] ?? "bg-muted text-foreground"}`}>
                {status}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-lg">Recent Orders</h3>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">View All</Link>
          </Button>
        </div>
        {!stats?.recentOrders?.length ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-NG")}</div>
                </div>
                <div className="text-sm font-bold text-primary">{formatNaira(order.totalKobo)}</div>
                <Badge variant="outline" className={`text-xs ${STATUS_COLORS[order.status] ?? ""}`}>
                  {order.status}
                </Badge>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/orders`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
