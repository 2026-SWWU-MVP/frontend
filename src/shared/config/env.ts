// 개발에서는 Vite 프록시, 배포 빌드에서는 배포 API에 연결한다.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  ?? (import.meta.env.DEV ? "" : "https://testfit.duckdns.org");

export const appConfig = {
  apiBaseUrl,
} as const;
