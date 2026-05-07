import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

const testGlobal = globalThis;
if (typeof testGlobal.TextEncoder === 'undefined') {
  testGlobal.TextEncoder = TextEncoder;
}
if (typeof testGlobal.TextDecoder === 'undefined') {
  testGlobal.TextDecoder = TextDecoder;
}

// 모든 테스트에서 사용할 localStorage 모의 객체 생성
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// window.localStorage를 모의 객체로 교체
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
