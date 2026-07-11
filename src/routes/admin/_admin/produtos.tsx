import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import type { Product, ProductInput } from "@/types/product";
import type { Category } from "@/types/category";

export const Route = createFileRoute("/admin/_admin/produtos")({
  head: () => ({
    meta: [{ title: "Produtos — Admin Brayan Beef" }],
  }),
  component: ProdutosAdminPage,
});

const emptyProduct: ProductInput = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  unit: "kg",
  weight: "",
  category: "",
  images: [],
  featured: false,
  promotion: null,
  available: true,
  meta: [],
};

function ProdutosAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductInput>(emptyProduct);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=products");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=categories");
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductInput }) => {
      const response = await fetch("/api/github/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `products/${id}`,
          data: { ...data, id },
          message: id ? `Update product ${data.name}` : `Create product ${data.name}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
      setEditingProduct(null);
      setFormData(emptyProduct);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/github/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `products/${id}`,
          data: null,
          message: `Delete product ${id}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingProduct?.id || formData.name.toLowerCase().replace(/\s+/g, "-");
    saveMutation.mutate({ id, data: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl">Produtos</h1>
          <p className="mt-2 text-sm text-foreground/50">
            {products.length} produtos cadastrados
          </p>
        </motion.div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      {/* Products table */}
      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">
                Preço
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-foreground/50">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-foreground/50">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 text-sm">{product.name}</td>
                <td className="px-4 py-3 text-sm">
                  R$ {product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground/60">
                  {product.category}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={
                      product.available ? "text-green-500" : "text-red-500"
                    }
                  >
                    {product.available ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-foreground/40 hover:text-foreground transition-colors"
                      aria-label="Editar produto"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este produto?")) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      className="p-2 text-foreground/40 hover:text-accent transition-colors"
                      aria-label="Excluir produto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-4 z-50 overflow-y-auto border border-line bg-background md:inset-x-auto md:inset-y-8 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="font-display text-lg">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full resize-none border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                      Unidade
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unit: e.target.value as "kg" | "un",
                        })
                      }
                      className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="kg">Quilograma (kg)</option>
                      <option value="un">Unidade (un)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                      Peso
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="ex: 1kg, 500g"
                      className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                      Categoria
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                      required
                      className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="">Selecione</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          available: e.target.checked,
                        })
                      }
                      className="accent-accent"
                    />
                    Disponível
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featured: e.target.checked,
                        })
                      }
                      className="accent-accent"
                    />
                    Destaque
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                    Imagens (URL)
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => {
                            const imgs = [...formData.images];
                            imgs[i] = e.target.value;
                            setFormData({ ...formData, images: imgs });
                          }}
                          placeholder="https://..."
                          className="flex-1 border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = formData.images.filter((_, j) => j !== i);
                            setFormData({ ...formData, images: imgs });
                          }}
                          className="px-3 text-foreground/40 hover:text-accent transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, images: [...formData.images, ""] })
                      }
                      className="text-xs text-accent hover:underline"
                    >
                      + Adicionar imagem
                    </button>
                  </div>
                  {formData.images[0] && (
                    <div className="mt-3 h-32 w-32 overflow-hidden border border-line">
                      <img
                        src={formData.images[0]}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Promotion */}
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                    Promoção
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.promotion !== null}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            promotion: e.target.checked
                              ? { discount: 10, label: "Oferta" }
                              : null,
                          })
                        }
                        className="accent-accent"
                      />
                      Tem promoção
                    </label>
                  </div>
                  {formData.promotion && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-foreground/40">
                          Desconto (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={formData.promotion.discount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              promotion: {
                                ...formData.promotion!,
                                discount: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-foreground/40">
                          Texto do label
                        </label>
                        <input
                          type="text"
                          value={formData.promotion.label}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              promotion: {
                                ...formData.promotion!,
                                label: e.target.value,
                              },
                            })
                          }
                          placeholder="ex: Oferta, Promoção"
                          className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="col-span-2 rounded-lg bg-surface p-3">
                        <p className="text-xs text-foreground/50">
                          Preço original:{" "}
                          <span className="text-foreground line-through">
                            R$ {formData.price.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-sm font-bold text-accent">
                          Preço com desconto: R${" "}
                          {(
                            formData.price *
                            (1 - formData.promotion.discount / 100)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="flex flex-1 items-center justify-center gap-2 border border-accent bg-accent/10 py-3 text-sm text-accent hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saveMutation.isPending ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-line py-3 text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
