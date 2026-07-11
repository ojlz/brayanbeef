const SITE_URL = "https://brayanbeef.vercel.app";

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ButcherShop",
    name: "Brayan Beef",
    image: `${SITE_URL}/img/logo1.png`,
    url: SITE_URL,
    telephone: "+55-00-90000-0009",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Fictícia, 333",
      addressLocality: "Porto Fictício�",
      addressRegion: "MS",
      postalCode: "00000-000",
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -23.0308,
      longitude: -54.1941,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "20:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "08:00",
        closes: "13:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.8,
      reviewCount: 63,
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  unit: string;
  available: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${SITE_URL}${product.image}`,
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "BRL",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Brayan Beef",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/produtos?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
