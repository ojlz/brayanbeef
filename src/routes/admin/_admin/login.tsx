import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, User, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_admin/login")({
  head: () => ({
    meta: [{ title: "Login — Admin Brayan Beef" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [initError, setInitError] = useState("");
  const [initSuccess, setInitSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/auth/init")
      .then((r) => r.json())
      .then((data) => setIsInitialized(data.initialized))
      .catch(() => setIsInitialized(true));
  }, []);

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitError("");

    if (!username || !password) {
      setInitError("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      setInitError("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setInitError("As senhas não conferem");
      return;
    }

    setIsInitializing(true);
    try {
      const response = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setInitError(data.error);
        return;
      }
      setInitSuccess(true);
      setTimeout(() => {
        setIsInitialized(true);
        setUsername("");
        setPassword("");
      }, 1500);
    } catch {
      setInitError("Erro ao inicializar");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      navigate({ to: "/admin" });
    } catch {
      // loginError será exibido automaticamente
    }
  };

  if (isInitialized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl">
            BRAYAN <span className="text-accent">BEEF</span>
          </h1>
          <p className="mt-2 text-sm text-foreground/50">
            {isInitialized ? "Acesso administrativo" : "Configuração inicial"}
          </p>
        </div>

        {/* Init form */}
        {!isInitialized ? (
          <form onSubmit={handleInit} className="space-y-4">
            <p className="text-sm text-foreground/60">
              Primeira vez? Crie sua conta de administrador.
            </p>

            {initSuccess && (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle size={16} />
                Conta criada! Redirecionando...
              </p>
            )}

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Usuário
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none transition-colors"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            {initError && (
              <p className="text-sm text-accent">{initError}</p>
            )}

            <button
              type="submit"
              disabled={isInitializing}
              className="w-full border border-accent bg-accent/10 py-3 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isInitializing ? "Criando..." : "Criar conta"}
            </button>
          </form>
        ) : (
          /* Login form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs uppercase tracking-wider text-foreground/50"
              >
                Usuário
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs uppercase tracking-wider text-foreground/50"
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-line bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus:border-accent focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-accent">Credenciais inválidas.</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full border border-accent bg-accent/10 py-3 text-sm uppercase tracking-wider text-accent hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
