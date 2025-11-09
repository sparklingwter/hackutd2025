/**
 * Auth0 Integration - DISABLED
 * 
 * Per research.md: "Removed Auth0 SDK and authentication implementation - using local browser storage only"
 * 
 * This file is kept as a placeholder for future authentication integration if needed.
 * For now, all user data is stored locally in browser storage (localStorage).
 */

// TODO: If authentication is needed in the future, install @auth0/nextjs-auth0 and uncomment:
// import { Auth0Client } from '@auth0/nextjs-auth0/server';
// export const auth0 = new Auth0Client();

export const authDisabled = true;
