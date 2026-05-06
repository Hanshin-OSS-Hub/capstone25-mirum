import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * 프로젝트 수정 요청 DTO (클라이언트 요청 형식)
 * @see ProjectUpdateDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectUpdateDTO.java
 * @typedef {object} UpdateProjectRequestDTO
 * @property {number} projectId
 * @property {string} projectName
 * @property {string} description
 */

/**
 * 프로젝트 수정 응답 (서버 응답 형식)
 * null
 */

/**
 * [UPDATE] 프로젝트 정보 수정 API
 * @typedef {import('@tanstack/react-query').DefaultError} DefaultError
 * @returns {import('@tanstack/react-query').UseMutationResult<void, DefaultError, UpdateProjectRequestDTO, unknown>}
 */

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @param {UpdateProjectRequestDTO} variables
     * @returns {null}
     */
    mutationFn: async (variables) => {
      return await api.put(`project`, variables);
    },
    onSuccess: async (_data, { projectId }) => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      notify.success('프로젝트 정보를 업데이트했습니다.');
    },
    onError: async (error) => {
      notify.error(getErrorMessage(error, '프로젝트 업데이트에 실패했습니다.'));
    },
  });
};

// [Project.jsx]
// const handleUpdateProjectAPI = (data) => {
//   // 백엔드 엔드포인트는 /project이고, projectId는 body에 포함되어야 함
//   api.put(`project`, {
//     ...data,
//     projectId: Number(id) // id를 숫자로 변환하여 포함
//   }) // projectId를 Number로 변환하여 전달
//       .then(() => {
//         alert("프로젝트 정보를 업데이트했습니다.");
//         setIsUpdateModalOpen(false);
//         // 서버에서 최신 프로젝트 정보를 다시 가져옴 (서버가 최종 데이터 소스)
//         handleGetProjectDetailsAPI();
//       })
//       .catch((error) => {
//         alert(error.message || "프로젝트 정보 업데이트에 실패했습니다.");
//       });
// };
