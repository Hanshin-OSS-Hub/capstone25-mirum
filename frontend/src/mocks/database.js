import mockProjects from './data/projects.json';
import mockDeletedProjects from './data/projects_deleted.json'
// import mockTasks from './data/tasks.json';
import mockUsers from './data/users.json';
import mockInvites from './data/invitations.json'

export const database = {
  users: JSON.parse(JSON.stringify(mockUsers)),
  projects: JSON.parse(JSON.stringify(mockProjects)),
  deleted_projects: JSON.parse(JSON.stringify(mockDeletedProjects)),
  invitations: JSON.parse(JSON.stringify(mockInvites)),
}