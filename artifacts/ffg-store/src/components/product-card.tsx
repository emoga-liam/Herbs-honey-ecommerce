import { Link } from "wouter";
import type { Product } from "@workspace/api-client-react";
import { formatNaira, getProductImage } from "@/lib/utils";
import { Button } from "./ui/button";
import { useCart } from "./cart-context";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const image = getProductImage(product.flavor, product.type, product.imageUrl);

  const getFlavorColor = (flavor: string) => {
    switch (flavor) {
      case 'hibiscus': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      case 'ginger-lemon': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'cinnamon-lemon': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
    }
  };

  const getFlavorLabel = (flavor: string) => {
    return flavor.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Card className="group overflow-hidden flex flex-col h-full bg-card border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-muted/30 p-6 flex items-center justify-center">
        {product.featured && (
          <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className={getFlavorColor(product.flavor)}>
            {getFlavorLabel(product.flavor)}
          </Badge>
        </div>
        <img 
          src={image} 
          alt={product.name}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          className="object-contain max-h-full w-full drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
        />
      </Link>
      <CardContent className="p-5 flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-serif font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="font-medium text-lg whitespace-nowrap text-primary">
            {formatNaira(product.priceKobo)}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {product.description}
        </p>
        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          {product.type === 'box' ? '30 Pieces' : '15ml Sachet'}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto">
        <Button 
          className="w-full font-semibold group-hover:bg-primary/90" 
          disabled={!product.inStock || product.stockCount < 1}
          onClick={() => {
            addToCart({
              productId: product.id,
              productName: product.name,
              productType: product.type,
              priceKobo: product.priceKobo,
              quantity: 1,
              imageUrl: image,
              flavor: product.flavor
            });
          }}
        >
          {product.inStock && product.stockCount > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
