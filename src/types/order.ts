export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
  };
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt: string;
  notes: string;
}
