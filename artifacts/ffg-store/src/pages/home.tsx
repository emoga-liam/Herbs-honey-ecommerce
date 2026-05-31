import { Link } from "wouter";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import bannerImg from "@assets/a19fa264-b1a2-4592-a852-d2e2934d4852_1780225496305.jpeg";
import boxImg from "@assets/1bb59fff-c60a-495a-a645-92b6f7c19b0c_1780225496305.jpeg";

const BENEFITS = [
  { flavor: "Original Honey", color: "bg-amber-100 border-amber-300", label: "Natural Sweetener", desc: "A healthier alternative to sugar — pure, rich, and golden." },
  { flavor: "Hibiscus Honey", color: "bg-red-100 border-red-300", label: "Heart Health", desc: "Supports heart health and helps regulate blood pressure." },
  { flavor: "Ginger Lemon", color: "bg-green-100 border-green-300", label: "Digestive Boost", desc: "Boosts digestion and eases bloating naturally." },
  { flavor: "Cinnamon Lemon", color: "bg-purple-100 border-purple-300", label: "Blood Sugar Balance", desc: "Supports blood sugar balance and metabolic wellness." },
];

const USES = ["Morning Tea", "Topping for Yoghurt", "Spread on Bread & Cereals", "Cocktail Mixer", "Marinade for Meats", "Natural Sweetener"];

export default function HomePage() {
  const { data: featured = [], isLoading } = useGetFeaturedProducts();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-b border-amber-200/60">
        <div className="container max-w-screen-2xl mx-auto px-4 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-amber-100 text-amber-800 border border-amber-300 font-semibold tracking-wide">
                  Farm Fresh Grocery · Abuja, Nigeria
                </Badge>
                <h1 className="font-serif font-bold text-5xl md:text-6xl text-amber-900 leading-tight">
                  Nature's Sweetness,{" "}
                  <span className="text-primary">Herb-Infused</span>
                </h1>
              </div>
              <p className="text-lg text-amber-800/70 leading-relaxed max-w-lg">
                Premium herbs-infused honey sachets in four delicious flavors — Original, Hibiscus, Ginger Lemon, and Cinnamon Lemon. Each 15ml sachet brings nature's goodness to your cup.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="font-semibold text-base px-8">
                  <Link href="/products">Shop All Products</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="font-semibold text-base px-8 border-amber-300 text-amber-900 hover:bg-amber-50">
                  <Link href="/products?type=box">Buy in Bulk</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">4</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Flavors</div>
                </div>
                <div className="w-px h-10 bg-amber-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">15ml</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Per Sachet</div>
                </div>
                <div className="w-px h-10 bg-amber-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-900">30pcs</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Per Box</div>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full">
                <img src={bannerImg} alt="FFG Foods Herbs Infused Honey" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl overflow-hidden shadow-xl w-40 hidden md:block">
                <img src={boxImg} alt="Sachet Honey Box" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container max-w-screen-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-3">Every Flavor, A Purpose</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Each variety is crafted to deliver specific health benefits alongside natural sweetness.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.flavor} className={`rounded-xl border p-6 space-y-3 ${b.color} transition-shadow hover:shadow-md`}>
                <Badge variant="outline" className="font-semibold border-current">{b.label}</Badge>
                <h3 className="font-serif font-bold text-lg">{b.flavor}</h3>
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
              <h2 className="font-serif font-bold text-3xl text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Our bestselling honey varieties, ready to order.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/products">View All</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl bg-card border animate-pulse h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Uses */}
      <section className="py-16 bg-amber-900 text-amber-50">
        <div className="container max-w-screen-2xl mx-auto px-4 text-center">
          <h2 className="font-serif font-bold text-3xl mb-4">Versatile. Delicious. Natural.</h2>
          <p className="text-amber-200 mb-10 max-w-xl mx-auto">FFG Honey sachets fit perfectly into your daily routine — wherever you need a touch of sweetness.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {USES.map((use) => (
              <span key={use} className="rounded-full border border-amber-500/50 bg-amber-800/60 px-5 py-2 text-sm font-medium">
                {use}
              </span>
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
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="font-serif font-bold text-3xl text-foreground">About FFG Foods</h2>
            <p className="text-muted-foreground leading-relaxed">
              Farm Fresh Grocery (FFG) is a proudly Nigerian brand committed to delivering nature's best. Our herbs-infused honey sachets are distributed across Abuja by <strong>GRICH20 International General Services Limited</strong>, ensuring quality and freshness in every order.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Contact us: <span className="font-semibold text-primary">09061602332</span> · 68 Trade More Avenue, Lugbe, Abuja
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
