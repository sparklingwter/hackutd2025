import type { NextRequest } from "next/server";
import { auth0 } from "./src/lib/auth0";

export async function middleware(request: NextRequest) {
  const response = await auth0.middleware(request);
  return response;
}

export const config = {
  matcher: [
    "/auth/:path*",
  ],
};
