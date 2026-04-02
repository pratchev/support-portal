'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const request = useCallback(
    async <T>(
      endpoint: string,
      config: RequestInit & { params?: Record<string, string> } = {}
    ): Promise<T> => {
      const { params, ...fetchConfig } = config;

      // Use same-origin requests through the Next.js proxy
      let url = endpoint;
      if (params) {
        const qs = new URLSearchParams(
          Object.fromEntries(Object.entries(params).filter(([, v]) => v))
        ).toString();
        if (qs) url += `?${qs}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeaders,
      };
      if (fetchConfig.headers) {
        Object.assign(headers, fetchConfig.headers);
      }

      const res = await fetch(url, {
        ...fetchConfig,
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: 'An error occurred' }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      return res.json();
    },
    [token]
  );

  const get = useCallback(
    <T>(endpoint: string, params?: Record<string, string>) =>
      request<T>(endpoint, { method: 'GET', params }),
    [request]
  );

  const post = useCallback(
    <T>(endpoint: string, data?: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request]
  );

  const patch = useCallback(
    <T>(endpoint: string, data?: unknown) =>
      request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request]
  );

  const del = useCallback(
    <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
    [request]
  );

  return { get, post, patch, del, isAuthenticated: !!token };
}
