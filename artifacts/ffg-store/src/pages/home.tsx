import { useState } from "react";
import { Link } from "wouter";
import { useGetFeaturedProducts } from "@/hooks/use-supabase-products";
import type { Product } from "@workspace/api-client-react";
import { useSettings } from "@/contexts/settings-context";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira, getProductImage } from "@/lib/utils";
import { CheckCircle, ShoppingBag } from "lucide-react";
import defaultBannerImg from "@assets/a19fa264-b1a2-4592-a852-d2e2934d4852_1780225496305.jpeg";
import defaultBoxImg from "@assets/1bb59fff-c60a-495a-a645-92b6f7c19b0c_1780225496305.jpeg";

const BENEFITS = [
  { icon: "🍯", flavor: "Original Honey", tag: "Natural Sweetener", desc: "A healthier alternative to processed sugar — pure, rich and golden.", border: "border-amber-300 dark:border-amber-700/40", glow: "hover:border-amber-500/60" },
  { icon: "🌺", flavor: "Hibiscus Honey", tag: "Heart Health", desc: "Supports heart health and helps maintain healthy blood pressure.", border: "border-red-300 dark:border-red-800/40", glow: "hover:border-red-500/60" },
  { icon: "🫚", flavor: "Ginger Lemon", tag: "Digestive Boost", desc: "Boosts digestion, eases bloating and warms from within.", border: "border-green-300 dark:border-green-800/40", glow: "hover:border-green-500/60" },
  { icon: "🍋", flavor: "Cinnamon Lemon", tag: "Blood Sugar Balance", desc: "Supports metabolic wellness and blood sugar regulation.", border: "border-purple-300 dark:border-purple-800/40", glow: "hover:border-purple-500/60" },
];

const USES = ["Morning Tea", "Yoghurt Topping", "Bread & Cereals", "Cocktail Mixer", "Marinade for Meats", "Natural Sweetener", "Hot Chocolate", "Salad Dressings"];

const STATS = [
  { val: "4", label: "Flavors" },
  { val: "15ml", label: "Per Sachet" },
  { val: "10 sachets", label: "in a pack" },
  { val: "100%", label: "Natural" },
];

const FLAVOR_COLORS: Record<string, string> = {
  hibiscus: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700/50",
  "ginger-lemon": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700/50",
  "cinnamon-lemon": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700/50",
  original: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50",
};

const outlineBtn =
  "border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:border-amber-700/60 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-full";

// ─── Single-product hero shown when exactly 1 product is featured ─────────────

function FeaturedSoloHero({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const imgSrc = product.images && product.images.length > 0
    ? product.images[0].imageUrl
    : getProductImage(product.flavor || "original", product.type || "sachet", product.imageUrl);

  const flavorLabel = product.flavor
    ? product.flavor.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Honey";

  const minQty = product.minOrderQty ?? 1;

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productType: product.type,
      priceKobo: product.priceKobo,
      quantity: minQty,
      imageUrl: imgSrc,
      flavor: product.flavor || "original",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden ring-1 ring-border dark:ring-amber-700/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="relative bg-gradient-to-br from-amber-100 to-background dark:from-amber-950/60 dark:to-background flex items-center justify-center p-10 md:p-14 min-h-72">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,83,9,0.12),transparent_70%)]" />
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-amber-600/10 blur-2xl" />
            <img
              src={imgSrc}
              alt={product.name}
              width={480}
              height={480}
              loading="lazy"
              decoding="async"
              className="relative max-h-72 md:max-h-96 w-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="text-base px-6 py-2 bg-destructive text-destructive-foreground">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className={FLAVOR_COLORS[product.flavor || "original"] ?? "border-border text-foreground"}>
                {flavorLabel}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground dark:border-amber-800/40 dark:text-amber-400/70">
                {product.type === "box" ? "10 sachets in a pack" : "15ml Sachet"}
              </Badge>
            </div>
            <h3 className="font-cormorant font-bold text-3xl md:text-4xl text-foreground leading-tight">{product.name}</h3>
            <div className="text-2xl font-bold text-primary mt-1">{formatNaira(product.priceKobo)}</div>
          </div>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base line-clamp-3">{product.description}</p>

          {product.benefits && product.benefits.length > 0 && (
            <ul className="space-y-1.5">
              {product.benefits.slice(0, 4).map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {minQty > 1 && (
            <p className="text-xs text-foreground/80 bg-accent border border-border rounded-lg px-3 py-1.5 dark:text-amber-700/80 dark:bg-amber-900/20 dark:border-amber-800/30">
              Minimum order: <strong>{minQty} units</strong>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {product.inStock ? (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full gap-2 shadow-lg shadow-amber-900/20 dark:shadow-amber-900/40"
                onClick={handleAdd}
                disabled={added}
              >
                <ShoppingBag className="h-4 w-4" />
                {added ? "Added to Cart!" : "Add to Cart"}
              </Button>
            ) : null}
            <Button asChild size="lg" variant="outline" className={outlineBtn}>
              <Link href={`/products/${product.id}`}>View Details →</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const settings = useSettings();
  const { data: rawFeatured, isLoading } = useGetFeaturedProducts();

  const featured: Product[] = Array.isArray(rawFeatured) ? rawFeatured : [];

  const heroImage = settings?.heroImageUrl || defaultBannerImg;
  const heroSecondaryImage = settings?.heroSecondaryImageUrl || defaultBoxImg;

  const heroTitleFirst = settings?.heroTitle && settings.heroTitle.includes(",")
    ? settings.heroTitle.split(",")[0]?.trim()
    : (settings?.heroTitle || "Premium Honey");

  const heroTitleSecond = settings?.heroTitle && settings.heroTitle.includes(",")
    ? settings.heroTitle.split(",")[1]?.trim()
    : "Herb-Infused";

  return (
    <Layout>
      {/* Hero — intentional dark full-bleed brand panel */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050e07] via-[#0d1b12] to-[#0a1500]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(180,83,9,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,56,24,0.3),transparent_60%)]" />
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-amber-500/20" />
        <div className="absolute top-40 left-24 w-1 h-1 rounded-full bg-amber-500/30" />
        <div className="absolute bottom-32 right-20 w-3 h-3 rounded-full bg-amber-600/15" />

        <div className="relative container max-w-screen-2xl mx-auto px-4 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/40 bg-amber-900/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
                <BrandLogo
                  frameClassName="h-4 w-4 rounded-sm ring-0"
                  scaleClassName="scale-[1.7]"
                  width={16}
                  height={16}
                />
                {settings?.companyTagline || "Pure Nature"}
              </div>

              <h1 className="font-cormorant font-bold leading-[1.1] text-5xl md:text-6xl lg:text-7xl">
                <span className="text-amber-50">{heroTitleFirst},</span>
                <br />
                <span className="gold-gradient">{heroTitleSecond}</span>
              </h1>

              <p className="text-amber-200/60 text-lg leading-relaxed max-w-lg">{settings?.heroSubtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button asChild size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 rounded-full shadow-lg shadow-amber-900/40 animate-glow-pulse">
                  <Link href="/products">{settings?.heroCtaText || "Shop Now"}</Link>
                </Button>
                <Button asChild variant="outline" size="lg"
                  className="border-amber-700/60 text-amber-300 hover:bg-amber-900/30 hover:border-amber-500 text-base px-8 rounded-full">
                  <Link href="/products?type=box">{settings?.heroCtaSecondaryText || "View Packs"}</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4 border-t border-amber-900/30">
                {STATS.map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <div className="font-cormorant font-bold text-2xl text-amber-400">{val}</div>
                    <div className="text-[10px] uppercase tracking-widest text-amber-200/40">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-600/20 to-amber-900/10 blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-float ring-1 ring-amber-700/30">
                  <img
                    src={heroImage}
                    alt="GRICH20 Herbs-Infused Honey"
                    width={384}
                    height={480}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1500]/40 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-8 rounded-xl overflow-hidden shadow-xl w-36 hidden md:block ring-1 ring-amber-700/30 animate-float-subtle">
                  <img
                    src={heroSecondaryImage}
                    alt="Honey Product"
                    width={144}
                    height={144}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                  <span className="font-cormorant font-bold text-lg leading-none">100%</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight">Natural</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/60 border-y border-border">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-3">Four Distinct Varieties</p>
            <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-foreground">Every Flavor, A Purpose</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Each variety is crafted to deliver specific health benefits alongside nature&apos;s sweetness.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.flavor} className={`rounded-2xl border ${b.border} ${b.glow} bg-card p-6 space-y-4 transition-all duration-300 hover:shadow-lg`}>
                <div className="text-3xl">{b.icon}</div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{b.tag}</span>
                  <h3 className="font-cormorant font-bold text-xl text-foreground mt-1">{b.flavor}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-2">Our Bestsellers</p>
              <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-foreground">Featured Products</h2>
            </div>
            <Button asChild variant="outline" className={`hidden sm:flex ${outlineBtn}`}>
              <Link href="/products">View All →</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-card border border-border animate-pulse h-80" />)}
            </div>
          ) : featured.length === 1 ? (
            <FeaturedSoloHero product={featured[0]} />
          ) : featured.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl text-muted-foreground">
              No featured products found.
            </div>
          )}
        </div>
      </section>

      {/* Ways to Use */}
      <section className="py-20 bg-muted/50 border-y border-border">
        <div className="container max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-3">Versatile &amp; Delicious</p>
          <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-foreground mb-4">Many Ways to Enjoy</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">GRICH20 honey sachets fit perfectly into your daily routine — wherever you need natural sweetness.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {USES.map((use) => (
              <span
                key={use}
                className="rounded-full border border-border bg-muted px-5 py-2 text-sm font-medium text-foreground hover:border-primary/60 hover:text-primary transition-colors dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:border-amber-500/60 dark:hover:text-amber-200"
              >
                {use}
              </span>
            ))}
          </div>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 rounded-full shadow-lg shadow-amber-900/20 dark:shadow-amber-900/40">
            <Link href="/products">Order Now</Link>
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="py-20">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 md:p-14">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl bg-amber-600/20 blur-xl" />
                  <BrandLogo
                    frameClassName="relative w-36 h-36 rounded-2xl shadow-2xl"
                    scaleClassName="scale-[1.45]"
                    width={144}
                    height={144}
                  />
                </div>
              </div>
              <div className="text-center md:text-left space-y-4">
                <p className="text-primary text-xs uppercase tracking-widest font-semibold">About Us</p>
                <h2 className="font-cormorant font-bold text-4xl text-foreground">GRICH20</h2>
                <p className="text-muted-foreground leading-relaxed">{settings?.aboutText || "Loading about details..."}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full">
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button asChild variant="outline" className={outlineBtn}>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
