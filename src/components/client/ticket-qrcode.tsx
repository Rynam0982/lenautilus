"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface TicketQRCodeProps {
  code: string;
}

export function TicketQRCode({ code }: TicketQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, code, {
      width: 200,
      margin: 2,
      color: {
        dark: "#080808",
        light: "#f5f5f0",
      },
    });
  }, [code]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
