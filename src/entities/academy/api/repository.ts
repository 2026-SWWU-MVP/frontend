import { httpClient } from "@/shared/api/httpClient";
import type { Academy } from "@/shared/academy/academy";

/** GET /api/academy - 현재 X-User-Id 사용자의 학원 정보 */
export function getAcademy(userId: number) {
  return httpClient
    .request<Academy>({
      path: "/api/academy",
      userId,
    })
    .then((response) => {
      if (!response || typeof response !== "object" || !("id" in response)) {
        throw new Error("학원 정보 응답이 올바르지 않습니다.");
      }

      return response;
    });
}
