import { Link, useLocation } from "wouter";
import { useCart } from "./cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "./ui/button";
import { BrandLogo } from "./brand-logo";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
  Package,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";

export function AnnouncementBar() {
  const settings = useSettings();
  if (!settings.announcementBanner) return null;
  return (
    <div className="bg-amber-500 text-amber-950 text-center text-sm font-semibold py-2 px-4">
      {settings.announcementBanner}
    </div>
  );
}

export function VerificationBanner() {
  const { user, isConfigured, resendVerification } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  if (!isConfigured || !user || user.emailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast({ title: "Verification email sent!", description: "Check your inbox." });
    } catch {
      toast({ title: "Couldn't send email", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-100 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-800/40 px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
      <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
      <span className="text-amber-900/80 dark:text-amber-200/70">
        Please verify your email — check your{" "}
        <span className="text-amber-800 dark:text-amber-300 font-semibold">inbox and spam/junk folder</span>.
      </span>
      <button
        onClick={handleResend}
        disabled={sending}
        className="text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-semibold underline-offset-2 hover:underline text-xs flex-shrink-0"
      >
        {sending ? "Sending…" : "Resend link"}
      </button>
    </div>
  );
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} aria-label="Toggle theme" disabled>
        <Sun className="h-5 w-5 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`text-foreground/70 hover:text-primary hover:bg-accent ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container relative grid h-16 max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center mx-auto px-4">
        {/* Left: logo */}
        <div className="flex items-center justify-start min-w-0">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo
              frameClassName="h-9 w-9 rounded-lg group-hover:ring-primary/60 transition-all"
              scaleClassName="scale-[1.55]"
              loading="eager"
              width={36}
              height={36}
            />
            <div className="hidden sm:block">
              <div className="font-cormorant font-bold text-lg text-primary leading-tight tracking-wide">GRICH20</div>
              <div className="text-[9px] text-muted-foreground leading-none tracking-widest uppercase">
                Herbs-Infused Honey
              </div>
            </div>
          </Link>
        </div>

        {/* Center: nav links (true center on md+) */}
        <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                location === link.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: theme, cart, auth */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/70 hover:text-primary hover:bg-accent"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-float-subtle">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {isConfigured ? (
            user ? (
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-foreground/80 hover:text-primary hover:bg-accent"
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
                  <div className="absolute right-0 top-10 bg-popover border border-border rounded-xl shadow-2xl w-48 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent cursor-pointer flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> My Account
                      </div>
                    </Link>
                    <Link href="/my-orders" onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-2.5 text-sm text-popover-foreground hover:bg-accent cursor-pointer flex items-center gap-2">
                        <Package className="h-3.5 w-3.5" /> My Orders
                      </div>
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground/70 hover:text-primary"
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
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`transition-colors ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-between border-t border-border">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Theme</span>
            <ThemeToggle />
          </div>
          {isConfigured && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/my-orders" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Package className="h-4 w-4" /> My Orders
                    </Button>
                  </Link>
                  <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <User className="h-4 w-4" /> My Account
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-destructive"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="w-full bg-primary text-primary-foreground font-bold">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Create Account
                    </Link>
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
    <footer className="border-t border-border bg-muted/40 mt-auto">
      <div className="container px-4 py-14 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <BrandLogo
                frameClassName="h-11 w-11 rounded-xl"
                scaleClassName="scale-[1.5]"
                width={44}
                height={44}
              />
              <div>
                <h3 className="font-cormorant font-bold text-xl text-primary">GRICH20</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  International General Services Ltd
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium herbs-infused honey sachets — crafted with care, delivered fresh across Abuja.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?type=sachet" className="hover:text-primary transition-colors">
                  Sachets
                </Link>
              </li>
              <li>
                <Link href="/products?type=box" className="hover:text-primary transition-colors">
                  Boxes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4 text-sm tracking-wide uppercase">Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{settings.contactPhone}</li>
              <li>{settings.contactEmail}</li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col flex-1 bg-background text-foreground">
      <AnnouncementBar />
      <VerificationBanner />
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
