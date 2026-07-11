import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Save, Lock } from "lucide-react";
import type { BusinessSettings } from "@/types/settings";

export const Route = createFileRoute("/admin/_admin/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — Admin Brayan Beef" }],
  }),
  component: ConfiguracoesPage,
});

const defaultSettings: BusinessSettings = {
  name: "Brayan Beef",
  slogan: "Aqui fazemos do seu jeito!",
  phone: "",
  whatsapp: "",
  address: {
    street: "",
    number: "",
    neighborhood: "",
    city: "Porto Fictício�",
    state: "MS",
    zip: "",
  },
  coordinates: {
    lat: -23.3,
    lng: -54.3,
  },
  hours: {
    seg: { open: "08:00", close: "20:30" },
    ter: { open: "08:00", close: "20:30" },
    qua: { open: "08:00", close: "20:30" },
    qui: { open: "08:00", close: "20:30" },
    sex: { open: "08:00", close: "20:30" },
    sab: { open: "08:00", close: "20:30" },
    dom: { open: "08:00", close: "13:00" },
  },
  rating: {
    value: 4.8,
    reviews: 63,
  },
  social: {
    instagram: "",
    facebook: "",
  },
};

function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const { data, isLoading } = useQuery<BusinessSettings>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=settings/business");
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (data: BusinessSettings) => {
      const response = await fetch("/api/github/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "settings/business",
          data,
          message: "Update business settings",
        }),
      });
      if (!response.ok) throw new Error("Failed to save");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      setPasswordSuccess("Senha alterada com sucesso!");
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      setPasswordError(error.message);
      setPasswordSuccess("");
    },
  });

  const handlePasswordChange = () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Preencha todos os campos");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Nova senha deve ter pelo menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Senha deve conter maiúsculas, minúsculas e números");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não conferem");
      return;
    }

    passwordMutation.mutate({ currentPassword, newPassword });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Configurações</h1>
          <p className="mt-2 text-sm text-foreground/50">
            Dados do negócio e informações de contato
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saveMutation.isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <div className="mt-8 space-y-8">
        {/* General info */}
        <div className="border border-line p-6">
          <h2 className="mb-4 font-display text-lg">Dados gerais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Nome do estabelecimento
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Slogan
              </label>
              <input
                type="text"
                value={settings.slogan || ""}
                onChange={(e) =>
                  setSettings({ ...settings, slogan: e.target.value })
                }
                placeholder="Aqui fazemos do seu jeito!"
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Telefone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                placeholder="(00) 90000-0009"
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                WhatsApp
              </label>
              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(e) =>
                  setSettings({ ...settings, whatsapp: e.target.value })
                }
                placeholder="5500090000009"
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border border-line p-6">
          <h2 className="mb-4 font-display text-lg">Endereço</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Rua
              </label>
              <input
                type="text"
                value={settings.address.street}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, street: e.target.value },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Número
              </label>
              <input
                type="text"
                value={settings.address.number}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, number: e.target.value },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Bairro
              </label>
              <input
                type="text"
                value={settings.address.neighborhood}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: {
                      ...settings.address,
                      neighborhood: e.target.value,
                    },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Cidade
              </label>
              <input
                type="text"
                value={settings.address.city}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, city: e.target.value },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Estado
              </label>
              <input
                type="text"
                value={settings.address.state}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, state: e.target.value },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                CEP
              </label>
              <input
                type="text"
                value={settings.address.zip}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, zip: e.target.value },
                  })
                }
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social media */}
        <div className="border border-line p-6">
          <h2 className="mb-4 font-display text-lg">Redes sociais</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Instagram
              </label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Facebook
              </label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="border border-line p-6">
          <h2 className="mb-4 font-display text-lg">Horário de funcionamento</h2>
          <div className="space-y-3">
            {(["seg","ter","qua","qui","sex","sab","dom"] as const).map((day) => {
              const dayNames: Record<string, string> = {
                seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta",
                sex: "Sexta", sab: "Sábado", dom: "Domingo",
              };
              const dayData = settings.hours[day];
              const isOpen = dayData !== null && dayData !== undefined;
              return (
                <div key={day} className="flex items-center gap-4">
                  <label className="flex items-center gap-2 w-28">
                    <input
                      type="checkbox"
                      checked={isOpen}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          hours: {
                            ...settings.hours,
                            [day]: e.target.checked
                              ? { open: "08:00", close: "18:00" }
                              : null,
                          },
                        })
                      }
                      className="accent-accent"
                    />
                    <span className="text-sm">{dayNames[day]}</span>
                  </label>
                  {isOpen && dayData && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={dayData.open}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            hours: {
                              ...settings.hours,
                              [day]: { ...dayData, open: e.target.value },
                            },
                          })
                        }
                        className="border border-line bg-transparent px-3 py-1.5 text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                      <span className="text-foreground/40">até</span>
                      <input
                        type="time"
                        value={dayData.close}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            hours: {
                              ...settings.hours,
                              [day]: { ...dayData, close: e.target.value },
                            },
                          })
                        }
                        className="border border-line bg-transparent px-3 py-1.5 text-sm focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Password change */}
        <div className="border border-line p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock size={18} className="text-foreground/50" />
            <h2 className="font-display text-lg">Alterar senha</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Senha atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-2 text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-foreground/30">
            Mínimo 8 caracteres, com maiúsculas, minúsculas e números.
          </p>
          {passwordError && (
            <p className="mt-3 text-sm text-red-400">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="mt-3 text-sm text-emerald-400">{passwordSuccess}</p>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={passwordMutation.isPending}
            className="mt-4 flex items-center gap-2 border border-line px-4 py-2 text-sm text-foreground/70 hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <Lock size={14} />
            {passwordMutation.isPending ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
