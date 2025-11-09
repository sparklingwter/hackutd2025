// lib/auth0.ts

import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client.
// The SDK reads most configuration from environment variables by default
// (e.g. AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, APP_BASE_URL, AUTH0_SECRET).
// When using APIs, the v4 SDK does not automatically pick up AUTH0_SCOPE / AUTH0_AUDIENCE,
// so provide them explicitly via `authorizationParameters`.
export const auth0 = new Auth0Client({
	authorizationParameters: {
		// Provide a sensible default scope if none is set.
		scope: process.env.AUTH0_SCOPE ?? "openid profile email",
		// Audience can be undefined if not used; leave as-is to allow SDK defaults.
		audience: process.env.AUTH0_AUDIENCE,
	},
});
