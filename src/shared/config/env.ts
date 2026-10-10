const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://testfit.duckdns.org'

export const appConfig = {
  apiBaseUrl,
} as const
