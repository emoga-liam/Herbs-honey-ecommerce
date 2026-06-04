import { useState } from "react";
import { useGetAdminStats, useAdminLogout } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, ShoppingCart, TrendingUp, Clock,
  LogOut, LayoutDashboard, Archive, Settings2, Globe, KeyRound, Menu, X,
} from "lucide-react";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const logout = useAdminLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/site-settings", label: "Site Settings", icon: Settings2 },
    { href: "/admin/change-password", label: "Change Password", icon: KeyRound },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={grich20Logo} alt="Grich20" className="h-8 w-8 rounded-lg object-cover ring-1 ring-amber-700/30" />
          <div>
            <h1 className="font-cormorant font-bold text-base text-amber-400 leading-tight">Grich20</h1>
            <p className="text-[9px] text-sidebar-foreground/40 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
        <button
          className="lg:hidden p-1 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                location === href
                  ? "bg-amber-900/30 text-amber-400"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </div>
          </Link>
        ))}
        <div className="pt-2 border-t border-sidebar-border/50 mt-2">
          <Link href="/">
            <div
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
            >
              <Globe className="h-4 w-4 flex-shrink-0" />
              View Store
            </div>
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/admin/login") })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:bg-red-900/30 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slide-over on mobile, permanent on desktop */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-64 lg:w-56 flex-shrink-0
          bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border
          transition-transform duration-250 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 bg-card gap-3 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-cormorant font-bold text-xl text-amber-300 truncate">{title}</h2>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  processing: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  shipped: "bg-indigo-900/40 text-indigo-300 border-indigo-700/40",
  delivered: "bg-green-900/40 text-green-300 border-green-700/40",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/40",
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
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-900/30 border-blue-800/40" },
    { label: "Total Revenue", value: formatNaira(stats?.totalRevenueKobo ?? 0), icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-900/30 border-amber-800/40" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-800/40" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Archive, color: "text-purple-400", bg: "bg-purple-900/30 border-purple-800/40" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border ${card.bg} bg-card p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="font-cormorant font-bold text-2xl text-foreground">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { href: "/admin/products", label: "Manage Products", icon: Package, desc: "Add, edit, or remove products" },
          { href: "/admin/orders", label: "View Orders", icon: ShoppingCart, desc: "Track and update order status" },
          { href: "/admin/site-settings", label: "Edit Site Content", icon: Settings2, desc: "Customize homepage, contact & more" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-xl bg-card border border-border hover:border-amber-700/50 hover:shadow-md hover:shadow-amber-900/20 transition-all p-5 cursor-pointer">
              <Icon className="h-5 w-5 text-amber-500 mb-3" />
              <h3 className="font-semibold text-sm mb-1 text-foreground">{label}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5 mb-6">
          <h3 className="font-cormorant font-bold text-lg text-amber-300 mb-4">Orders by Status</h3>
          <div className="flex flex-wrap gap-3">
            {stats.ordersByStatus.map(({ status, count }) => (
              <div key={status} className={`rounded-full border px-4 py-2 text-sm font-medium ${STATUS_COLORS[status] ?? "bg-muted text-foreground"}`}>
                {status}: <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cormorant font-bold text-lg text-amber-300">Recent Orders</h3>
          <Button asChild variant="outline" size="sm" className="border-amber-800/60 text-amber-400">
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
                  <div className="font-medium text-sm text-foreground">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-NG")}</div>
                </div>
                <div className="text-sm font-bold text-amber-400">{formatNaira(order.totalKobo)}</div>
                <Badge variant="outline" className={`text-xs ${STATUS_COLORS[order.status] ?? ""}`}>{order.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
