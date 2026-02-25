
import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000); // segundos
  const version = "0.1.0"; // ou importe do package.json se preferir
  const environment = process.env.NODE_ENV || "development";
  const timestamp = new Date().toISOString();

  return NextResponse.json(
    {
      status: "ok",
      timestamp,
      version,
      uptime,
      environment,
    },
    { status: 200 }
  );
}
