import rawDeletedProjectsData from '@global/data/dummyDeletedProjects.json';
import rawProjectsData from '@global/data/dummyProjects.json';

/**
 * @typedef {import('@/types/project.js').ProjectData} ProjectData
 */

/**
 * 프로젝트 리스트 응답 등에서 사용할 수 있는 배열 타입 헬퍼
 * @typedef {ProjectData[]} ProjectList
 */

/**
 * projects.json 및 dummyDeletedProjects.json 데이터를 앱에서 사용할 수 있는 타입으로 변환하고
 * 통합 관리하는 메모리 DB 모델입니다.
 */
const initialProjects = rawProjectsData.map((project) => ({
  ...project,
  projectId: Number(project.projectId),
  isDeleted: false,
}));

const initialDeletedProjects = rawDeletedProjectsData.map((project) => ({
  projectId: Number(project.projectId),
  projectName: project.projectName,
  description: project.description,
  taskProgress: project.taskProgress,
  memberCount: 0, // 로직에 맞춰 0명으로 설정
  createdDate: project.createdDate,
  updatedDate: project.updatedDate,
  isDeleted: true,
  deleteUsername: 'qwer', // 로직에 맞춰 현재 데모 유저로 설정
  members: [], // 로직에 맞춰 빈 배열로 설정
}));

// 활성 + 삭제 프로젝트 통합
export const projectsDB = [...initialProjects, ...initialDeletedProjects];

export const deletedProjectsDB = initialDeletedProjects; // 하위 호환성을 위해 유지하되 projectsDB와 동기화됨
