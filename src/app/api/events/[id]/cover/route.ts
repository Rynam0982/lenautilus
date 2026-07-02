import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Returns the event cover image as an optimized JPEG download.
 *
 * "Best format" logic: we never upscale. We cap the longest edge at 2000px
 * (plenty for print/sharing while keeping a reasonable file size) and re-encode
 * to a high-quality progressive mozjpeg. Smaller originals are passed through at
 * their native resolution.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { coverImage: true, slug: true },
  });

  if (!event?.coverImage) {
    return NextResponse.json({ error: "Aucune image" }, { status: 404 });
  }

  // Anti-SSRF : on ne télécharge que depuis les hébergeurs d'images connus
  // (mêmes domaines que `images.remotePatterns` de next.config.ts).
  let coverUrl: URL;
  try {
    coverUrl = new URL(event.coverImage);
  } catch {
    return NextResponse.json({ error: "URL d'image invalide" }, { status: 400 });
  }
  const host = coverUrl.hostname;
  const allowedHost =
    coverUrl.protocol === "https:" &&
    (host === "cdn.openagenda.com" ||
      host === "images.unsplash.com" ||
      host === "utfs.io" ||
      host.endsWith(".uploadthing.com") ||
      host.endsWith(".ufs.sh"));
  if (!allowedHost) {
    return NextResponse.json({ error: "Hôte d'image non autorisé" }, { status: 400 });
  }

  try {
    const upstream = await fetch(coverUrl);
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
    const input = Buffer.from(await upstream.arrayBuffer());

    const image = sharp(input, { failOn: "none" }).rotate(); // honor EXIF orientation
    const meta = await image.metadata();
    const longestEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    const MAX = 2000;

    if (longestEdge > MAX) {
      image.resize({ width: meta.width! >= meta.height! ? MAX : undefined, height: meta.height! > meta.width! ? MAX : undefined, withoutEnlargement: true });
    }

    const output = await image
      .jpeg({ quality: 90, progressive: true, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${event.slug}-couverture.jpg"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[COVER DOWNLOAD]", err);
    return NextResponse.json({ error: "Traitement impossible" }, { status: 500 });
  }
}
