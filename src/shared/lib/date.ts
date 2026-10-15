/** 서버 날짜(ISO)를 "2026. 10. 15. 오전 9:13" 형식으로 */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** 목록용 짧은 날짜: "10월 15일 09:44" (올해가 아니면 "2025년 10월 15일") */
export function formatShortDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const day = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (!sameYear) return `${date.getFullYear()}년 ${day}`;
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return `${day} ${time}`;
}
