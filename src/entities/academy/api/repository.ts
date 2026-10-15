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

export interface AcademyMember {
  userId: number;
  loginId: string;
  name: string;
  role: "OWNER" | "TEACHER" | "STUDENT" | null;
}

export interface InviteCode {
  id: number;
  code: string;
  status: "ACTIVE" | "USED" | "EXPIRED" | "CANCELED";
  expiresAt: string;
  usedByName: string | null;
  usedAt: string | null;
  createdAt: string;
}

/** GET /api/academy/members - 원장·강사 목록 */
export function listMembers() {
  return httpClient.request<AcademyMember[]>({ path: "/api/academy/members" });
}

/** DELETE /api/academy/members/{userId} - 원장 전용, 원장 자신은 불가 */
export function removeMember(userId: number) {
  return httpClient.request<void>({
    path: `/api/academy/members/${userId}`,
    init: { method: "DELETE" },
  });
}

/** GET /api/academy/invites - 원장 전용, 최근 발급 순 */
export function listInvites() {
  return httpClient.request<InviteCode[]>({ path: "/api/academy/invites" });
}

/** POST /api/academy/invites - 원장 전용. 강사 수가 요금제 한도면 409 PLAN_LIMIT_EXCEEDED */
export function issueInvite() {
  return httpClient.request<InviteCode>({
    path: "/api/academy/invites",
    init: { method: "POST" },
  });
}

/** DELETE /api/academy/invites/{id} - 사용 전 코드 취소 */
export function cancelInvite(inviteId: number) {
  return httpClient.request<void>({
    path: `/api/academy/invites/${inviteId}`,
    init: { method: "DELETE" },
  });
}

/** PATCH /api/academy - 원장 전용 학원 이름 수정 */
export function renameAcademy(name: string) {
  return httpClient.request<Academy>({
    path: "/api/academy",
    init: { method: "PATCH" },
    json: { name },
  });
}

/** POST /api/academy/logo - 원장 전용 (PNG/JPG, 2MB 이하). 시험지 머리글에 들어간다 */
export function uploadLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return httpClient.request<Academy>({
    path: "/api/academy/logo",
    init: { method: "POST", body: formData },
  });
}

/** DELETE /api/academy/logo - 원장 전용. 시험지 머리글에는 학원명이 들어간다 */
export function deleteLogo() {
  return httpClient.request<void>({
    path: "/api/academy/logo",
    init: { method: "DELETE" },
  });
}

/** GET /api/academy/logo - 로고 이미지 (헤더 인증이 필요해 blob으로 받는다) */
export function getLogo() {
  return httpClient.request<Blob>({
    path: "/api/academy/logo",
    init: { headers: { Accept: "image/png" } },
    responseType: "blob",
  });
}
