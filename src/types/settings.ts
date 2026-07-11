export interface BusinessSettings {
  name: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: Record<string, { open: string; close: string } | null>;
  rating: {
    value: number;
    reviews: number;
  };
  social: {
    instagram: string;
    facebook: string;
  };
}

export interface SEOSettings {
  title: string;
  description: string;
  ogImage: string;
}
