import { ProductCard } from './ProductCard.jsx'

export function ProductGrid({ products }) {
  if (!products?.length) {
    return <p className="py-12 text-center text-niagara-muted">Aucun produit pour le moment.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  )
}
