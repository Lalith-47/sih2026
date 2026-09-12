import { createAuthClient } from "better-auth/react";

/**
 * Dynamically resolves the API base URL.
 * If running on client and NEXT_PUBLIC_API_URL points to localhost while accessed from a LAN IP or custom domain,
 * it rewrites the hostname to current window.location.hostname so phones and other devices on the LAN connect properly.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;
    // If accessing via LAN IP or non-localhost, but envUrl points to localhost/127.0.0.1
    if (
      currentHost &&
      currentHost !== "localhost" &&
      currentHost !== "127.0.0.1" &&
      (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))
    ) {
      return `http://${currentHost}:4000`;
    }
  }
  return envUrl || "http://localhost:4000";
}

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
