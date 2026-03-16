import { authHandlers } from '@/mocks/api/auth.js';
import { boardHandlers } from '@/mocks/api/board.js';
import { invitationHandlers } from '@/mocks/api/invitation.js';
import { memberHandlers } from '@/mocks/api/member.js';
import { projectHandlers } from '@/mocks/api/project.js';
import { taskHandlers } from '@/mocks/api/task.js';

export const handlers = [
  ...authHandlers,
  ...projectHandlers,
  ...memberHandlers,
  ...invitationHandlers,
  ...boardHandlers,
  ...taskHandlers,
];
