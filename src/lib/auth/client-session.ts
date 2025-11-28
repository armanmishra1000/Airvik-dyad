"use client";

import { supabase } from "@/integrations/supabase/client";

export async function getValidSession() {
  const { data, error } = await supabase.auth.getSession();
  if (!error && data.session) {
    return data.session;
  }

  const { data: refreshed, error: refreshError } =
    await supabase.auth.refreshSession();
  if (refreshError || !refreshed.session) {
    return null;
  }
  return refreshed.session;
}

export type AuthorizedFetchOptions = RequestInit & { retryOnUnauthorized?: boolean };

export async function authorizedFetch(
  input: RequestInfo | URL,
  options: AuthorizedFetchOptions = {}
) {
  const session = await getValidSession();
  if (!session) {
    throw new Error("Please sign in again to continue.");
  }

  const { retryOnUnauthorized = true, headers, ...rest } = options;
  const response = await fetch(input, {
    ...rest,
    headers: {
      ...(headers || {}),
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await getValidSession();
    if (!refreshed) {
      throw new Error("Session expired. Please sign in again.");
    }
    return fetch(input, {
      ...rest,
      headers: {
        ...(headers || {}),
        Authorization: `Bearer ${refreshed.access_token}`,
      },
    });
  }

  return response;
}
