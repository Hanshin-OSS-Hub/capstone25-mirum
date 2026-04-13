import rawDeletedProjectsData from '../../../../../global/data/dummyDeletedProjects.json';
import rawProjectsData from '../../../../../global/data/dummyProjects.json';

/**
 * @typedef {import('@/types/project.js').ProjectData} ProjectData
 */

/**
 * 프로젝트 리스트 응답 등에서 사용할 수 있는 배열 타입 헬퍼
 * @typedef {ProjectData[]} ProjectList
 */

/**
 * projects.json 데이터를 앱에서 사용할 수 있는 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 */
export const projectsDB = rawProjectsData.map((project) => ({
  ...project,
  // 필요한 경우 날짜 문자열을 Date 객체로 변환 등 데이터 가공
}));

export const deletedProjectsDB = rawDeletedProjectsData.map((project) => ({
  projectId: project.projectId,
  projectName: project.projectName,
  description: project.description,
  taskProgress: project.taskProgress,
  memberCount: project.memberCount,
  createdDate: project.createdDate,
  updatedDate: project.updatedDate,
  isDeleted: project.isDeleted,
  deleteUsername: project.deleteUsername,
  members: project.members,
}));
