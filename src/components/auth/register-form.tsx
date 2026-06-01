"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { toast } from "sonner";

interface RegisterFormProps {
  defaultRole?: string;
}

export function RegisterForm({ defaultRole = "CLIENT" }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: defaultRole as "CLIENT" | "ARTIST",
    },
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        toast.error(body.error ?? "Erreur lors de l'inscription");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      toast.success("Compte créé avec succès !");
      router.push(data.role === "ARTIST" ? "/artist/dashboard" : "/dashboard");
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-nautilus-border bg-nautilus-card p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-nautilus-dark border border-nautilus-border mb-2">
          {(["CLIENT", "ARTIST"] as const).map((r) => (
            <label
              key={r}
              className={`flex items-center justify-center py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all ${
                role === r
                  ? "bg-nautilus-gold text-nautilus-black"
                  : "text-nautilus-gray hover:text-nautilus-white"
              }`}
            >
              <input
                type="radio"
                value={r}
                className="sr-only"
                {...register("role")}
              />
              {r === "CLIENT" ? "Public" : "Artiste"}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jean Dupont"
            autoComplete="name"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.fr"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[13px] text-nautilus-gray hover:text-nautilus-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          Créer mon compte
        </Button>

        <p className="text-xs text-nautilus-gray text-center">
          En créant un compte, vous acceptez nos{" "}
          <a href="/cgv" className="text-nautilus-gold hover:underline">CGV</a>{" "}
          et notre{" "}
          <a href="/confidentialite" className="text-nautilus-gold hover:underline">politique de confidentialité</a>.
        </p>
      </form>
    </div>
  );
}
