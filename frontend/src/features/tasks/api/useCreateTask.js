import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * 작업 카드 생성 요청 DTO (클라이언트 요청 형식)
 * @see TaskRequestDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/Tasks/TaskRequestDTO.java
 * @typedef {Object} TaskRequestDTO
 * @property {number} boardId - 소속 보드 ID (필수)
 * @property {number} projectId - 소속 프로젝트 ID (검증용, 필수)
 * @property {number} [assigneeId] - 담당자 ID
 * @property {string} title - 작업 제목 (필수)
 * @property {string} [description] - 작업 설명
 * @property {taskStatus} [status] - 초기 상태 (기본값: TODO)
 * @property {string} [dueDate] - 마감일 (ISO Date String, YYYY-MM-DD)
 * @property {string[]} [tags] - 태그 목록
 * @property {string} [notes] - 마크다운 노트
 */

/**
 * 프로젝트 생성 응답 (서버 응답 형식)
 * @typedef {Object} CreateTaskResponse
 * @property {number} projectId
 */

/**
 * [CREATE] 새 작업 카드 생성 API
 * @typedef {import('@tanstack/react-query').DefaultError} DefaultError
 * @returns {import('@tanstack/react-query').UseMutationResult<CreateTaskResponse, DefaultError, TaskRequestDTO, unknown>}
 */

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    /** @param {TaskRequestDTO} taskRequest */
    mutationFn: (taskRequest) => {
      return api.post('/tasks', taskRequest);
    },
    // Mock API가 전체 객체를 반환하도록 수정되었으므로, 다시 data.boardId를 사용할 수 있습니다!
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', data.boardId] });
      console.log(data);
      alert('작업 카드가 생성되었습니다.');
    },
    onError: (error) => {
      console.log(error);
      alert(error.message || '작업 카드 생성에 실패하였습니다.');
    },
  });
};
