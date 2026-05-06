import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return false;
}

/**
 * `<html class="dark">` 변화에 반응하는 다크모드 플래그 (차트·Canvas 등에 사용)
 * @returns {boolean}
 */
export function useIsDarkTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
