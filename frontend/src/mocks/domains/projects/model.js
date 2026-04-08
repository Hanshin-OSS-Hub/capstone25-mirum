import rawProjectsData from './data.json';
import rawDeletedProjectsData from './data_deleted.json';

// TODO: JSDoc type 정의 (예: ProjectData)

/**
 * projects.json 데이터를 앱에서 사용할 수 있는 타입으로 변환하고 관리하는 메모리 DB 모델입니다.
 */
export const projectsDB = rawProjectsData.map((project) => ({
  ...project,
  // 필요한 경우 날짜 문자열을 Date 객체로 변환 등 데이터 가공
}));

export const deletedProjectsDB = rawDeletedProjectsData.map((project) => ({
  ...project,
}));
