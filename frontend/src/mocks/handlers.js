// import { boardHandlers } from './domains/boards/tokenHandlers.js';
import { authHandlers } from './domains/api/authHandlers.js';
import { chatHandlers } from './domains/api/chatHandlers.js';
import { fileHandlers } from './domains/api/fileHandlers.js';
import { invitationHandlers } from './domains/api/inviteHandlers.js';
import { memberHandlers } from './domains/api/memberHandlers.js';
import { oauthHandlers } from './domains/api/oauthHandlers.js';
import { projectHandlers } from './domains/api/projectHandlers.js';
import { taskHandlers } from './domains/api/taskHandlers.js';
import { userHandlers } from './domains/api/userHandlers.js';

export const handlers = [
  ...oauthHandlers,   // OAuth 소셜 로그인 (임시 목 핸들러)
  ...userHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...invitationHandlers,
  ...authHandlers,
  ...taskHandlers,
  ...fileHandlers,
  ...chatHandlers,
];
