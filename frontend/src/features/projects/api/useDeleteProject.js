import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [DELETE] 프로젝트 삭제 API
 * @typedef {import('@/types/common.js').ApiResponse<null>} ProjectDeleteResponse
 * @returns {import('@tanstack/react-query').UseMutationResult<ProjectDeleteResponse, DefaultError, {readonly projectId?: *}, unknown>}
 */

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId) => {
      return await api.delete(`/api/project/${projectId}`);
    },
    onSuccess: async (_data, projectId) => {
      const pId = Number(projectId);
      await queryClient.invalidateQueries({ queryKey: ['project', pId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify.success('프로젝트를 제거했습니다.');
    },
    onError: async (error) => {
      notify.error(getErrorMessage(error, '프로젝트 제거에 실패했습니다.'));
    },
  });
};

// [Project.jsx]
// const handleDeleteProjectAPI = () => {
//   if (window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
//     api.delete(`project/${id}`)
//         .then(() => {
//           alert("프로젝트가 삭제되었습니다.");
//           navigate("/dashboard");
//         })
//         .catch((error) => {
//           alert(error.message || "프로젝트 삭제 중 오류가 발생했습니다.");
//         });
//   }
// };
