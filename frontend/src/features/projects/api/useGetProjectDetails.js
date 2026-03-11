import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client.js";

/**
 * 프로젝트 상세 정보 DTO (서버 응답 형식)
 * @see ProjectResponseDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectResponseDTO.java
 * @typedef {import('@/features/projects/types/project.js').Project} ProjectDetailDTO
 */

/**
 * [READ] 프로젝트 상세 정보 조회 API
 * @param projectId
 * @typedef {import('@tanstack/react-query').DefaultError} DefaultError
 * @returns {import('@tanstack/react-query').UseQueryResult<ProjectDetailDTO, DefaultError>}
 */

export const useGetProjectDetails = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    /** @returns {Promise<ProjectDetailDTO>} */
    queryFn: async () => {
      return await api.get(`/project/${projectId}`)
    },
    enabled: !!projectId,
    // initialData 제거! (객체이므로 빈 배열 X)
    // initialData: [],
  });
}

// [Project.jsx]
// const handleGetProjectDetailsAPI = useCallback(() => {
//   api.get(`project/${id}`)
//       .then((data) => {
//         setProject(data); // 프로젝트 정보 설정
//         setProjectError(""); // 프로젝트 에러 초기화
//       })
//       .catch((error) => {
//         setProject(null);
//         alert(error.message || "프로젝트 정보를 불러오는데 실패했습니다.");
//       });
// }, [id]);