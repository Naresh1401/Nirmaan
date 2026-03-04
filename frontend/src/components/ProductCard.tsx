interface ProductCardProps {
  id: string;
  name: string;
  brand?: string;
  price: number;
  mrp?: number;
  unit: string;
  supplierName: string;
  supplierCity: string;
  rating: number;
  imageUrl?: string;
  inStock: boolean;
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  mrp,
  unit,
  supplierName,
  supplierCity,
  rating,
  imageUrl,
  inStock,
}: ProductCardProps) {
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div className="card group overflow-hidden transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-gray-300">
            📦
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-red-500 px-3 py-1 text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {brand && (
          <p className="text-xs font-medium text-brand-600">{brand}</p>
        )}
        <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
          {name}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-gray-500">/{unit}</span>
          {mrp && mrp > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Supplier */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{supplierName}</span>
          <span>📍 {supplierCity}</span>
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-xs">
          <span className="text-yellow-500">★</span>
          <span className="font-medium text-gray-700">{rating.toFixed(1)}</span>
        </div>

        {/* Add to Cart */}
        <button
          disabled={!inStock}
          className="btn-primary mt-4 w-full text-sm"
        >
          {inStock ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </div>
  );
}
