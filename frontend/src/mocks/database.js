// import { boardsDB } from './domains/boards/model.js';
import { invitationsDB } from './domains/invitations/model.js';
import { deletedProjectsDB, projectsDB } from './domains/projects/model.js';
import { tasksDB } from './domains/tasks/model.js';
import { usersDB } from './domains/users/model.js';

/**
 * @deprecated 도메인별 model.js를 직접 임포트하여 사용하세요. (예: import { tasksDB } from '@/mocks/domains/tasks/model.js')
 * 레거시 코드와의 호환성을 위해 당분간 유지됩니다.
 */
export const database = {
  users: usersDB,
  projects: projectsDB,
  deleted_projects: deletedProjectsDB,
  // boards: boardsDB,
  tasks: tasksDB,
  invitations: invitationsDB,
};
