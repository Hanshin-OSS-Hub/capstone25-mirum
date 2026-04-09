// import { boardHandlers } from './domains/boards/index.js';
import { authHandlers } from './domains/auth/index.js';
import { fileHandlers } from './domains/files/index.js';
import { invitationHandlers } from './domains/invitations/index.js';
import { memberHandlers } from './domains/members/index.js';
import { projectHandlers } from './domains/projects/index.js';
import { taskHandlers } from './domains/tasks/index.js';
import { userHandlers } from './domains/users/index.js';

export const handlers = [
  ...userHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...invitationHandlers,
  ...authHandlers,
  ...taskHandlers,
  ...fileHandlers,
];
