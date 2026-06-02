import { Link } from "wouter";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { useSettings } from "@/contexts/settings-context";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import defaultBannerImg from "@assets/a19fa264-b1a2-4592-a852-d2e2934d4852_1780225496305.jpeg";
import defaultBoxImg from "@assets/1bb59fff-c60a-495a-a645-92b6f7c19b0c_1780225496305.jpeg";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

const BENEFITS = [
  { icon: "🍯", flavor: "Original Honey", tag: "Natural Sweetener", desc: "A healthier alternative to processed sugar — pure, rich and golden.", border: "border-amber-700/40", glow: "hover:border-amber-500/60" },
  { icon: "🌺", flavor: "Hibiscus Honey", tag: "Heart Health", desc: "Supports heart health and helps maintain healthy blood pressure.", border: "border-red-800/40", glow: "hover:border-red-500/60" },
  { icon: "🫚", flavor: "Ginger Lemon", tag: "Digestive Boost", desc: "Boosts digestion, eases bloating and warms from within.", border: "border-green-800/40", glow: "hover:border-green-500/60" },
  { icon: "🍋", flavor: "Cinnamon Lemon", tag: "Blood Sugar Balance", desc: "Supports metabolic wellness and blood sugar regulation.", border: "border-purple-800/40", glow: "hover:border-purple-500/60" },
];

const USES = ["Morning Tea", "Yoghurt Topping", "Bread & Cereals", "Cocktail Mixer", "Marinade for Meats", "Natural Sweetener", "Hot Chocolate", "Salad Dressings"];

const STATS = [
  { val: "4", label: "Flavors" },
  { val: "15ml", label: "Per Sachet" },
  { val: "30pcs", label: "Per Box" },
  { val: "100%", label: "Natural" },
];

export default function HomePage() {
  const settings = useSettings();
  const { data: featured = [], isLoading } = useGetFeaturedProducts();
  const heroImage = settings.heroImageUrl || defaultBannerImg;
  const heroSecondaryImage = settings.heroSecondaryImageUrl || defaultBoxImg;

  return (
    <Layout>
      {/* ── Hero ──────────────────────────────────────────────── */}
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
                <img src={grich20Logo} alt="Grich20" className="h-4 w-4 rounded-sm object-cover" />
                {settings.companyTagline}
              </div>

              <h1 className="font-cormorant font-bold leading-[1.1] text-5xl md:text-6xl lg:text-7xl">
                <span className="text-amber-50">{settings.heroTitle.split(",")[0]?.trim()},</span>
                <br />
                <span className="gold-gradient">{settings.heroTitle.split(",")[1]?.trim() ?? "Herb-Infused"}</span>
              </h1>

              <p className="text-amber-200/60 text-lg leading-relaxed max-w-lg">{settings.heroSubtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button asChild size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-[#0a1500] font-bold text-base px-8 rounded-full shadow-lg shadow-amber-900/40 animate-glow-pulse">
                  <Link href="/products">{settings.heroCtaText}</Link>
                </Button>
                <Button asChild variant="outline" size="lg"
                  className="border-amber-700/60 text-amber-300 hover:bg-amber-900/30 hover:border-amber-500 text-base px-8 rounded-full">
                  <Link href="/products?type=box">{settings.heroCtaSecondaryText}</Link>
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
                  <img src={heroImage} alt="Grich20 Herbs-Infused Honey" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1500]/40 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -left-8 rounded-xl overflow-hidden shadow-xl w-36 hidden md:block ring-1 ring-amber-700/30 animate-float-subtle">
                  <img src={heroSecondaryImage} alt="Honey Product" className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 bg-amber-500 text-[#0a1500] rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg">
                  <span className="font-cormorant font-bold text-lg leading-none">100%</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight">Natural</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#080f09] border-y border-amber-900/20">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-3">Four Distinct Varieties</p>
            <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-amber-50">Every Flavor, A Purpose</h2>
            <p className="text-amber-200/50 mt-4 max-w-xl mx-auto">Each variety is crafted to deliver specific health benefits alongside nature's sweetness.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.flavor} className={`rounded-2xl border ${b.border} ${b.glow} bg-card p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20`}>
                <div className="text-3xl">{b.icon}</div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500">{b.tag}</span>
                  <h3 className="font-cormorant font-bold text-xl text-amber-100 mt-1">{b.flavor}</h3>
                </div>
                <p className="text-sm text-amber-200/50 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────── */}
      <section className="py-20">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-2">Our Bestsellers</p>
              <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-amber-50">Featured Products</h2>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex border-amber-700/60 text-amber-400 hover:bg-amber-900/20 rounded-full">
              <Link href="/products">View All →</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-card border border-amber-900/20 animate-pulse h-80" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Ways to Use ───────────────────────────────────────── */}
      <section className="py-20 bg-[#060d07] border-y border-amber-900/20">
        <div className="container max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold mb-3">Versatile & Delicious</p>
          <h2 className="font-cormorant font-bold text-4xl md:text-5xl text-amber-50 mb-4">Many Ways to Enjoy</h2>
          <p className="text-amber-200/50 mb-10 max-w-xl mx-auto">Grich20 honey sachets fit perfectly into your daily routine — wherever you need natural sweetness.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {USES.map((use) => (
              <span key={use} className="rounded-full border border-amber-700/40 bg-amber-900/20 px-5 py-2 text-sm font-medium text-amber-300 hover:border-amber-500/60 hover:text-amber-200 transition-colors">
                {use}
              </span>
            ))}
          </div>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold px-10 rounded-full shadow-lg shadow-amber-900/40">
            <Link href="/products">Order Now</Link>
          </Button>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-3xl p-10 md:p-14">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-2xl bg-amber-600/20 blur-xl" />
                  <img src={grich20Logo} alt="Grich20" className="relative w-36 h-36 rounded-2xl object-contain shadow-2xl ring-1 ring-amber-600/30" />
                </div>
              </div>
              <div className="text-center md:text-left space-y-4">
                <p className="text-amber-500 text-xs uppercase tracking-widest font-semibold">About Us</p>
                <h2 className="font-cormorant font-bold text-4xl text-amber-50">Grich20 International</h2>
                <p className="text-amber-200/60 leading-relaxed">{settings.aboutText}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
                  <Button asChild className="bg-amber-500 hover:bg-amber-400 text-[#060d07] font-bold rounded-full">
                    <Link href="/products">Shop Now</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-amber-700/60 text-amber-400 hover:bg-amber-900/20 rounded-full">
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
