// 필요하다면 export (상수 정의 시)
export const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
};

/**
 * @typedef {import('@/features/members/types/member.js').ProjectMemberDTO} ProjectMember
 *
 * @typedef {Object} Project
 * @property {number} projectId - 프로젝트 고유 ID
 * @property {string} projectName - 프로젝트 이름
 * @property {string} description - 프로젝트 설명
 * @property {string} creationDate
 * @property {ProjectMember[]} members
 */