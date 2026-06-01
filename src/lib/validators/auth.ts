import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
  role: z.enum(["CLIENT", "ARTIST"]),
});

export const artistProfileSchema = z.object({
  stageName: z.string().min(2).max(100),
  bio: z.string().max(2000).optional(),
  genre: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: z
    .object({
      instagram: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
      soundcloud: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ArtistProfileInput = z.infer<typeof artistProfileSchema>;
