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

export function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("sih_auth_token");
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined" && token) {
    try {
      localStorage.setItem("sih_auth_token", token);
    } catch {
      // Storage access blocked or restricted
    }
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("sih_auth_token");
    } catch {
      // Storage access blocked or restricted
    }
  }
}

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: () => getStoredToken() || undefined,
    },
    onRequest: (context) => {
      const token = getStoredToken();
      if (token && context.headers) {
        context.headers.set("Authorization", `Bearer ${token}`);
      }
    },
    onResponse: (context) => {
      const tokenHeader = context.response.headers.get("set-auth-token");
      if (tokenHeader) {
        setStoredToken(tokenHeader);
      }
    },
  },
});

export const { signIn, signUp, useSession } = authClient;

export const signOut = async (...args: Parameters<typeof authClient.signOut>) => {
  clearStoredToken();
  return authClient.signOut(...args);
};

/**
 * Resilient fetch wrapper for all backend API calls.
 * Automatically injects credentials: 'include' and Authorization: Bearer <token>
 * so that cross-origin requests work seamlessly in Google Chrome, Brave, Safari, etc.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    credentials: init?.credentials || "include",
    headers,
  });
}
