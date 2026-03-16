import mockBoards from './data/boards.json';
import mockInvitations from './data/invitations.json';
import mockProjects from './data/projects.json';
import mockDeletedProjects from './data/projects_deleted.json';
import mockTasks from './data/tasks.json';
import mockUsers from './data/users.json';

export const database = {
  users: JSON.parse(JSON.stringify(mockUsers)),
  projects: JSON.parse(JSON.stringify(mockProjects)),
  deleted_projects: JSON.parse(JSON.stringify(mockDeletedProjects)),
  boards: JSON.parse(JSON.stringify(mockBoards)), // 추가됨
  tasks: JSON.parse(JSON.stringify(mockTasks)),
  invitations: JSON.parse(JSON.stringify(mockInvitations)),
};
