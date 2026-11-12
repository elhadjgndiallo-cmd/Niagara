const ROW1 = ['Zara', 'Nike', 'Adidas', "Levi's", 'Mango', 'Uniqlo', 'H&M', 'Puma', 'ONLY']
const ROW2 = ['New Balance', 'Tommy Hilfiger', 'Calvin Klein', 'Vans', 'Gap', 'Reebok', 'Decathlon', 'Converse']

function BrandCells({ brands, suffix }) {
  return brands.map((b, i) => (
    <span
      key={`${suffix}-${i}-${b}`}
      className="shrink-0 px-5 text-sm font-bold uppercase tracking-[0.2em] text-niagara-text/50 grayscale transition duration-200 hover:grayscale-0 hover:text-niagara-primary"
    >
      {b}
    </span>
  ))
}

function Row({ brands, reverse }) {
  return (
    <div className="overflow-hidden py-2">
      <div className={`flex w-max ${reverse ? 'niagara-marquee-reverse' : 'niagara-marquee'}`}>
        <div className="flex items-center">
          <BrandCells brands={brands} suffix="a" />
        </div>
        <div className="flex items-center" aria-hidden="true">
          <BrandCells brands={brands} suffix="b" />
        </div>
      </div>
    </div>
  )
}

export function BrandsMarquee() {
  return (
    <section className="border-y border-black/5 bg-niagara-surface">
      <Row brands={ROW1} />
      <div className="border-t border-black/5">
        <Row brands={ROW2} reverse />
      </div>
    </section>
  )
}
