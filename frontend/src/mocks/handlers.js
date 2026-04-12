// import { boardHandlers } from './domains/boards/tokenHandlers.js';
import { authHandlers } from './domains/api/authHandlers.js';
import { fileHandlers } from './domains/api/fileHandlers.js';
import { taskHandlers } from './domains/api/taskHandlers.js';
import { userHandlers } from './domains/api/userHandlers.js';
import { invitationHandlers } from './domains/invitations/index.js';
import { memberHandlers } from './domains/members/index.js';
import { projectHandlers } from './domains/projects/index.js';

export const handlers = [
  ...userHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...invitationHandlers,
  ...authHandlers,
  ...taskHandlers,
  ...fileHandlers,
];
