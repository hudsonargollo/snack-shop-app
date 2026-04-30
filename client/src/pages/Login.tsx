import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "register";

// Format phone to E.164: +5511999999999
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.startsWith("+")) return raw.replace(/[^\d+]/g, "");
  return `+55${digits}`;
}

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const phone = formatPhone(form.phone);

    // Validate phone
    if (!/^\+\d{10,15}$/.test(phone)) {
      toast.error("Número de WhatsApp inválido. Use o formato: 11999999999");
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          phone,
          password: form.password,
          options: {
            data: { name: form.name, phone },
          },
        });

        if (error) {
          toast.error(error.message === "User already registered"
            ? "Este número já está cadastrado. Faça login."
            : error.message);
          return;
        }

        // After sign up, sign in immediately
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          phone,
          password: form.password,
        });

        if (loginError || !data.session) {
          toast.error("Conta criada! Faça login para continuar.");
          setMode("login");
          return;
        }

        // Store token in cookie for server-side auth
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=None; Secure`;
        toast.success("Conta criada com sucesso!");
        window.location.href = "/";

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          phone,
          password: form.password,
        });

        if (error) {
          toast.error(error.message === "Invalid login credentials"
            ? "Número ou senha incorretos"
            : error.message);
          return;
        }

        if (!data.session) {
          toast.error("Falha ao criar sessão");
          return;
        }

        // Store token in cookie for server-side auth
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=None; Secure`;
        toast.success("Bem-vindo!");
        window.location.href = "/";
      }
    } catch (err: any) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Snack Shop</h1>
          <p className="text-slate-500 text-sm mt-1">
            {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="11999999999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="pl-9"
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                DDD + número, sem espaços. Ex: 11999999999
              </p>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {mode === "register" && (
                <p className="text-xs text-slate-500 mt-1">Mínimo de 6 caracteres</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-11"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          <a href="/" className="hover:text-amber-500 transition">← Voltar ao início</a>
        </p>
      </div>
    </div>
  );
}
