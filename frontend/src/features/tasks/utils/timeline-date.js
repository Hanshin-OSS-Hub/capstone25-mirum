// 타임라인에서 사용하는 날짜/기간 관련 유틸 함수 모음

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * 서버/모킹에서 내려오는 LocalDateTime 문자열(예: "2026-04-15T00:00:00")을 Date 객체로 변환한다.
 * 파싱에 실패하면 null을 반환하여 상위 로직에서 필터링할 수 있도록 한다.
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Date 객체를 `YYYY-MM-DD` 형식의 ISO 날짜 문자열로 변환한다.
 * 키값으로 사용하거나 logging 시에 활용된다.
 */
export function formatISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 주어진 날짜가 속한 달의 1일(Date)을 반환한다.
 */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 주어진 날짜가 속한 달의 마지막 날(Date)을 반환한다.
 */
export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * 기준 날짜에 특정 일(day)을 더한 새로운 Date를 반환한다.
 */
export function addDays(date, days) {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
}

/**
 * 해당 월의 일(day) 수를 반환한다.
 */
export function getDaysInMonth(date) {
  return endOfMonth(date).getDate();
}

/**
 * date가 [min, max] 범위를 벗어나지 않도록 보정(clamp)한다.
 */
export function clampDate(date, min, max) {
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

/**
 * 두 날짜 사이의 일(day) 수 차이를 반환한다. (UTC 기준, 시간 정보는 무시)
 */
export function differenceInDays(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcA - utcB) / DAY_MS);
}

/**
 * 작업 기간(taskStart~taskEnd)이 주어진 월 범위(monthStart~monthEnd)와 1일이라도 겹치는지 여부를 반환한다.
 */
export function intersectsMonth(taskStart, taskEnd, monthStart, monthEnd) {
  return taskStart <= monthEnd && taskEnd >= monthStart;
}

/**
 * "YYYY년 M월" 형식의 월 라벨 문자열을 반환한다.
 */
export function formatMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

/**
 * "M/D" 형식의 짧은 날짜 문자열을 반환한다. (툴팁 등에 사용)
 */
export function formatShortDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

