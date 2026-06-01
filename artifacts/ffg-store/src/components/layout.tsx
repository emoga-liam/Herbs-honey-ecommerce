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
    <header className="sticky top-0 z-50 w-full border-b border-amber-900/30 bg-[#0a1a0d]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a1a0d]/80">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={grich20Logo}
              alt="Grich20"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-amber-600/30 group-hover:ring-amber-500/60 transition-all"
            />
            <div className="hidden sm:block">
              <div className="font-cormorant font-bold text-lg text-amber-400 leading-tight tracking-wide">Grich20</div>
              <div className="text-[9px] text-amber-200/40 leading-none tracking-widest uppercase">Herbs-Infused Honey</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  location === link.href
                    ? "text-amber-400 font-semibold"
                    : "text-amber-200/60 hover:text-amber-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-amber-200 hover:text-amber-400 hover:bg-amber-900/30">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-[#0a1a0d] text-xs font-bold flex items-center justify-center animate-float-subtle">
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
                  className="gap-2 text-amber-200 hover:text-amber-400 hover:bg-amber-900/30"
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
                  <div className="absolute right-0 top-10 bg-[#1a2e1e] border border-amber-900/40 rounded-xl shadow-2xl w-44 py-1 z-50">
                    <Link href="/account" onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-900/30 cursor-pointer">My Account</div>
                    </Link>
                    <div className="border-t border-amber-900/30 my-1" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-amber-200/70 hover:text-amber-300" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-[#0a1a0d] font-bold" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-amber-200 hover:text-amber-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-amber-900/30 bg-[#0a1a0d] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                className={`transition-colors ${location === link.href ? "text-amber-400" : "text-amber-200/60"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          {isConfigured && (
            <div className="pt-3 border-t border-amber-900/30 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/account" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2 border-amber-700 text-amber-300">
                      <User className="h-4 w-4" /> {user.displayName ?? "My Account"}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm"
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-red-400">Sign Out</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="w-full border-amber-700 text-amber-300">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="w-full bg-amber-500 text-[#0a1a0d] font-bold">
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
    <footer className="border-t border-amber-900/30 bg-[#060f09] mt-auto">
      <div className="container px-4 py-14 mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={grich20Logo} alt="Grich20" className="h-11 w-11 rounded-xl object-cover ring-1 ring-amber-700/30" />
              <div>
                <h3 className="font-cormorant font-bold text-xl text-amber-400">Grich20</h3>
                <p className="text-[10px] text-amber-200/40 uppercase tracking-widest">International General Services Ltd</p>
              </div>
            </div>
            <p className="text-sm text-amber-200/50 leading-relaxed max-w-xs">
              Premium herbs-infused honey sachets — crafted with care, delivered fresh across Abuja.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-amber-400 mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2 text-sm text-amber-200/50">
              <li><Link href="/products" className="hover:text-amber-400 transition-colors">All Products</Link></li>
              <li><Link href="/products?type=sachet" className="hover:text-amber-400 transition-colors">Sachets</Link></li>
              <li><Link href="/products?type=box" className="hover:text-amber-400 transition-colors">Boxes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-amber-400 mb-4 text-sm tracking-wide uppercase">Contact</h4>
            <div className="space-y-2 text-sm text-amber-200/50">
              <p>{settings.contactPhone}</p>
              <p>{settings.contactEmail}</p>
              <p>{settings.contactAddress}</p>
            </div>
            <Link href="/contact" className="inline-block mt-3 text-xs text-amber-500 hover:text-amber-400 font-medium">
              Send us a message →
            </Link>
          </div>
        </div>
        <div className="border-t border-amber-900/20 mt-12 pt-8 text-center text-xs text-amber-200/30">
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
