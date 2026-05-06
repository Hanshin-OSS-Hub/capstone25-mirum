import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';
import { getErrorMessage } from '@/utils/getErrorMessage.js';
import { notify } from '@/utils/notify.js';

/**
 * [DELETE] 파일 소프트 삭제 API 훅
 * - 선택된 파일들의 uuid 배열을 /model/softDelete 로 전달하여 논리 삭제 처리
 * - 성공 시 해당 프로젝트의 파일 목록 쿼리를 무효화하여 UI를 갱신합니다.
 */
export const useDeleteFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // params: { selectedFiles: NormalizedFileItem[], projectId: number }
    mutationFn: ({ selectedFiles }) => {
      if (!selectedFiles || selectedFiles.length <= 0) return;

      const uuids = selectedFiles.map((file) => file.uuid);
      return api.post(`/files/softDelete`, uuids);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['files', variables.projectId] });
      notify.success('삭제가 완료되었습니다.');
    },
    onError: (error) => {
      notify.error(getErrorMessage(error, '삭제에 실패하였습니다.'));
    },
  });
};
