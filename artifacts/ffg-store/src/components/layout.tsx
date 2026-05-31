import { Link, useLocation } from "wouter";
import { useCart } from "./cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "./ui/button";
import { ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

export function AnnouncementBar() {
  const settings = useSettings();
  if (!settings.announcementBanner) return null;
  return (
    <div className="bg-amber-500 text-amber-950 text-center text-sm font-semibold py-2 px-4">
      {settings.announcementBanner}
    </div>
  );
}

export function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isConfigured } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={grich20Logo}
              alt="GRICH20 / FFG Foods"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <div className="font-serif font-bold text-base text-primary leading-tight tracking-tight">FFG Foods</div>
              <div className="text-[10px] text-muted-foreground leading-none tracking-wider uppercase">by GRICH20</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-foreground/80 ${
                  location === link.href ? "text-foreground font-semibold" : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* User auth */}
          {isConfigured ? (
            user ? (
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="max-w-[100px] truncate text-sm">{user.displayName ?? user.email}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 bg-card border border-border rounded-xl shadow-xl w-44 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-2.5 text-sm hover:bg-muted cursor-pointer">My Account</div>
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )
          ) : null}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                className={`transition-colors hover:text-foreground/80 ${location === link.href ? "text-foreground" : "text-foreground/60"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          {isConfigured && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <User className="h-4 w-4" /> {user.displayName ?? "My Account"}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-destructive">Sign Out</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const settings = useSettings();
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container px-4 py-12 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={grich20Logo} alt="GRICH20" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <h3 className="font-serif font-bold text-base text-primary">FFG Foods</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">by GRICH20</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium herbs-infused honey sourced naturally and crafted with care.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
              <li><Link href="/products?type=sachet" className="hover:text-primary">Sachets</Link></li>
              <li><Link href="/products?type=box" className="hover:text-primary">Boxes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/admin" className="hover:text-primary">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{settings.contactPhone}</p>
              <p>{settings.contactEmail}</p>
              <p>{settings.contactAddress}</p>
            </div>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {settings.footerText}</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col flex-1">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
