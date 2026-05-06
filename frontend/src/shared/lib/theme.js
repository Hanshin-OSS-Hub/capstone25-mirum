export const MIRUM_THEME_KEY = 'mirum-theme';

/**
 * OS 설정 기준으로 라이트/다크만 결정합니다.
 * @returns {'light' | 'dark'}
 */
export function resolveSystemAppearance() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 저장된 값이 있으면 그대로, 없거나 예전 `system` 등은 OS 기준으로 초기값을 씁니다.
 * @returns {'light' | 'dark'}
 */
export function readThemePreference() {
  try {
    const value = localStorage.getItem(MIRUM_THEME_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
  } catch {
    /* ignore */
  }
  return resolveSystemAppearance();
}

/**
 * @param {'light' | 'dark'} preference
 */
export function applyDomTheme(preference) {
  document.documentElement.classList.toggle('dark', preference === 'dark');
}

/**
 * @param {'light' | 'dark'} preference
 */
export function persistThemePreference(preference) {
  try {
    localStorage.setItem(MIRUM_THEME_KEY, preference);
  } catch {
    /* ignore */
  }
}

/**
 * 헤더 등에서 라이트 ↔ 다크만 전환할 때 사용합니다.
 * @param {'light' | 'dark'} current
 * @returns {'light' | 'dark'}
 */
export function toggleThemeAppearance(current) {
  return current === 'light' ? 'dark' : 'light';
}
