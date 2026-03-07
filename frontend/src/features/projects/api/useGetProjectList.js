import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client.js";

/**
 * 프로젝트 목록 DTO
 * @see ProjectsDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectsDTO.java
 * @typedef {Object} ProjectListDTO
 * @property {number} projectId
 * @property {string} projectName
 * @property {string} description
 * @property {number} memberCount
 * @property {number} taskProgress
 * * 업데이트 날짜 필요할 듯?
 * @property {Date} creationDate
 * @property {Date} updateDate
 */

/**
 * [READ] 내(로그인 사용자)가 속한 프로젝트 목록 조회 API
 * @returns {import('@tanstack/react-query').UseQueryResult<ProjectListDTO, Error>}
 */

export const useGetProjectList = () => {
  return useQuery({
    queryKey: ['projects'],
    /** @returns {Promise<ProjectListDTO[]>} */
    queryFn: async () => {
      return await api.get('/projects');
    },
    refetchInterval: 2000,
    initialData: [],
    select: (data) => {
      if (!Array.isArray(data)) {
        return [];
      }
      // 날짜 최신순 정렬
      return [...data].sort((a, b) => {
          ///////////////////
          // 필드명 통일 필요 //
          ///////////////////
          const dateA = new Date(a.updateDate);
          const dateB = new Date(b.updateDate);
          return dateB - dateA;
        }
      )}
  });
}


// [Home.jsx]
// const handleGetProjectList = async () => {
//   api.get('projects')
//       .then(response => {
//         setProjects(response);
//         localStorage.setItem("projects", JSON.stringify(response));
//       })
//       .catch(error => {
//         alert(error.message || '프로젝트 목록을 불러오는 데 실패했습니다. 다시 시도해주세요.');
//       });
// };