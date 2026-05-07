import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 위에서 만든 핸들러들을 워커에 등록합니다.
export const worker = setupWorker(...handlers);
