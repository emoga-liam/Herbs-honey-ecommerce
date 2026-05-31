import { Link } from "wouter";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { useSettings } from "@/contexts/settings-context";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import bannerImg from "@assets/a19fa264-b1a2-4592-a852-d2e2934d4852_1780225496305.jpeg";
import boxImg from "@assets/1bb59fff-c60a-495a-a645-92b6f7c19b0c_1780225496305.jpeg";
import grich20Logo from "@assets/669d7800-ae3f-4716-a7df-e3960f397008_1780226804105.jpeg";

const BENEFITS = [
  { flavor: "Original Honey", color: "bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800", label: "Natural Sweetener", desc: "A healthier alternative to sugar — pure, rich, and golden." },
  { flavor: "Hibiscus Honey", color: "bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800", label: "Heart Health", desc: "Supports heart health and helps regulate blood pressure." },
  { flavor: "Ginger Lemon", color: "bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-800", label: "Digestive Boost", desc: "Boosts digestion and eases bloating naturally." },
  { flavor: "Cinnamon Lemon", color: "bg-purple-100 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800", label: "Blood Sugar Balance", desc: "Supports blood sugar balance and metabolic wellness." },
];

const USES = ["Morning Tea", "Yoghurt Topping", "Bread & Cereals", "Cocktail Mixer", "Marinade for Meats", "Natural Sweetener"];

export default function HomePage() {
  const settings = useSettings();
  const { data: featured = [], isLoading } = useGetFeaturedProducts();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/30 dark:via-[#0d1b12] dark:to-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/30">
        <div className="container max-w-screen-2xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-800 border border-amber-300 font-semibold tracking-wide dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                  {settings.companyTagline}
                </Badge>
                <h1 className="font-cormorant font-bold text-5xl md:text-6xl text-amber-900 dark:text-amber-100 leading-tight">
                  {settings.heroTitle.split(",").map((part, i, arr) => (
                    <span key={i}>
                      {part.trim()}
                      {i < arr.length - 1 && <span className="text-primary">,</span>}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
              </div>
              <p className="text-lg text-amber-800/70 dark:text-amber-200/60 leading-relaxed max-w-lg">
                {settings.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-semibold text-base px-8 animate-float-subtle">
                  <Link href="/products">{settings.heroCtaText}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold text-base px-8 border-amber-300 text-amber-900 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20">
                  <Link href="/products?type=box">{settings.heroCtaSecondaryText}</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                {[["4", "Flavors"], ["15ml", "Per Sachet"], ["30pcs", "Per Box"]].map(([val, lbl]) => (
                  <div key={lbl} className="text-center">
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-300 font-cormorant">{val}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{lbl}</div>
                  </div>
                )).reduce((acc, el, i) => (
                  i === 0 ? [el] : [...acc, <div key={`sep-${i}`} className="w-px h-10 bg-amber-200 dark:bg-amber-800" />, el]
                ), [] as React.ReactNode[])}
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-float">
                <img src={bannerImg} alt="FFG Foods Herbs Infused Honey" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl overflow-hidden shadow-xl w-40 hidden md:block">
                <img src={boxImg} alt="Honey Box" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-cormorant font-bold text-4xl text-foreground mb-3">Every Flavor, A Purpose</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Each variety is crafted to deliver specific health benefits alongside natural sweetness.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.flavor} className={`rounded-xl border p-6 space-y-3 ${b.color} transition-shadow hover:shadow-md`}>
                <Badge variant="outline" className="font-semibold border-current">{b.label}</Badge>
                <h3 className="font-cormorant font-bold text-xl">{b.flavor}</h3>
                <p className="text-sm leading-relaxed opacity-80">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-cormorant font-bold text-4xl text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Our bestselling honey varieties, ready to order.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/products">View All</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-card border animate-pulse h-80" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* Uses */}
      <section className="py-16 bg-amber-900 dark:bg-amber-950 text-amber-50">
        <div className="container max-w-screen-2xl mx-auto px-4 text-center">
          <h2 className="font-cormorant font-bold text-4xl mb-4">Versatile. Delicious. Natural.</h2>
          <p className="text-amber-200 mb-10 max-w-xl mx-auto">FFG Honey sachets fit perfectly into your daily routine — wherever you need a touch of sweetness.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {USES.map((use) => (
              <span key={use} className="rounded-full border border-amber-500/50 bg-amber-800/60 px-5 py-2 text-sm font-medium">{use}</span>
            ))}
          </div>
          <div className="mt-12">
            <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold px-8">
              <Link href="/products">Order Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-background">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-shrink-0">
                <img src={grich20Logo} alt="GRICH20 International General Services Limited" className="w-40 h-40 rounded-2xl object-contain shadow-xl border border-border" />
              </div>
              <div className="text-center md:text-left space-y-3">
                <h2 className="font-cormorant font-bold text-4xl text-foreground">About Us</h2>
                <p className="text-muted-foreground leading-relaxed">{settings.aboutText}</p>
                <p className="text-muted-foreground">
                  Contact: <span className="font-semibold text-primary">{settings.contactPhone}</span>
                </p>
                <Button asChild variant="outline">
                  <Link href="/contact">Get In Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
