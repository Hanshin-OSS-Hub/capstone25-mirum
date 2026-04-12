import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * [PATCH] 삭제된 파일 복구 API 훅
 * - 선택된 파일들의 uuid 배열을 /model/restore 로 전달하여 논리 삭제를 해제합니다.
 * - 성공 시 해당 프로젝트의 파일 목록(또는 삭제 목록) 쿼리를 무효화하여 UI를 갱신합니다.
 */
export const useRestoreFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // params: { selectedFiles: NormalizedFileItem[], projectId: number }
    mutationFn: ({ selectedFiles, projectId }) => {
      if (!selectedFiles || selectedFiles.length <= 0) return;

      const uuids = selectedFiles.map((file) => file.uuid);
      return api.patch(`/files/restore`, uuids);
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['files', 'deleted', variables.projectId] });
      await queryClient.invalidateQueries({ queryKey: ['files', variables.projectId] });
      console.log('파일 복구 완료:', data);
      alert('복구가 완료되었습니다.');
    },
    onError: () => {
      console.error('파일 복구 실패');
      alert('복구에 실패하였습니다.');
    },
  });
};
