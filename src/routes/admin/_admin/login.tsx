import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, User, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_admin/login")({
  head: () => ({ meta: [{ title: "Login — Admin Brayan Beef" }] }),
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
    if (!username || !password) { setInitError("Preencha todos os campos"); return; }
    if (password.length < 8) { setInitError("Senha deve ter pelo menos 8 caracteres"); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setInitError("Senha deve conter maiúsculas, minúsculas e números"); return;
    }
    if (password !== confirmPassword) { setInitError("As senhas não conferem"); return; }
    setIsInitializing(true);
    try {
      const response = await fetch("/api/auth/init", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) { setInitError(data.error); return; }
      setInitSuccess(true);
      setTimeout(() => { setIsInitialized(true); setUsername(""); setPassword(""); }, 1500);
    } catch { setInitError("Erro ao inicializar"); } finally { setIsInitializing(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await login({ username, password }); navigate({ to: "/admin" }); } catch {}
  };

  if (isInitialized === null) {
    return <div className="flex min-h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin border-2 border-accent border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Background blob */}
      <div className="fixed -right-40 -top-40 h-[500px] w-[500px] bg-accent/20 rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm relative z-10">
        <div className="mb-8 text-center">
          <img src="/img/logo1.png" alt="Brayan Beef" className="mx-auto h-16 w-16 rounded-full object-cover mb-4" />
          <h1 className="font-display text-3xl font-black">BRAYAN <span className="text-accent">BEEF</span></h1>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1,2,3,4,5].map((i) => <Star key={i} size={12} className={i <= 4 ? "fill-accent text-accent" : "text-white/20"} />)}
          </div>
          <p className="mt-3 text-sm text-white/50">{isInitialized ? "Acesso administrativo" : "Configuração inicial"}</p>
        </div>

        {!isInitialized ? (
          <form onSubmit={handleInit} className="space-y-4">
            <p className="text-sm text-white/60 text-center">Primeira vez? Crie sua conta de administrador.</p>
            {initSuccess && <p className="flex items-center justify-center gap-2 text-sm text-emerald-400"><CheckCircle size={16} />Conta criada!</p>}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Usuário</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                  className="w-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none rounded-xl transition-colors" placeholder="admin" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none rounded-xl transition-colors" placeholder="Mínimo 8 caracteres" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none rounded-xl transition-colors" placeholder="Repita a senha" />
              </div>
            </div>
            {initError && <p className="text-sm text-accent text-center">{initError}</p>}
            <button type="submit" disabled={isInitializing}
              className="w-full btn-primary !rounded-xl">{isInitializing ? "Criando..." : "Criar conta"}</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Usuário</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                  className="w-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none rounded-xl transition-colors" placeholder="admin" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none rounded-xl transition-colors" placeholder="••••••••" />
              </div>
            </div>
            {loginError && <p className="text-sm text-accent text-center">Credenciais inválidas.</p>}
            <button type="submit" disabled={isLoggingIn}
              className="w-full btn-primary !rounded-xl">{isLoggingIn ? "Entrando..." : "Entrar"}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
