import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client.js';

/**
 * 프로젝트 생성 요청 DTO (클라이언트 요청 형식)
 * @see ProjectUpdateDTO.java
 * @see ../../../../../backend/src/main/java/backend/dto/project/ProjectUpdateDTO.java
 * @typedef {Object} CreateProjectRequestDTO
 * @property {string} projectName
 * @property {string} description
 */

/**
 * 프로젝트 생성 응답 (서버 응답 형식)
 * @typedef {Object} CreateProjectResponse
 * @property {number} projectId
 */

/**
 * [CREATE] 새 프로젝트 생성 API
 * @typedef {import('@tanstack/react-query').DefaultError} DefaultError
 * @returns {import('@tanstack/react-query').UseMutationResult<CreateProjectResponse, DefaultError, CreateProjectRequestDTO, ?>}
 */

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @param {CreateProjectRequestDTO} variables
     * @returns {Promise<CreateProjectResponse>}
     */
    mutationFn: async (variables) => {
      return await api.post('project', variables);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      alert('프로젝트를 생성했습니다.');
    },
    onError: (error) => {
      console.log('프로젝트 생성 실패: ', error.message);
      alert(error.message || '프로젝트 생성에 실패했습니다.');
    },
  });
};

// [CreateProject.jsx]
// const handleCreateProjectApi = async () => {
//   return api.post('project', {
//     projectName: projectTitle,
//     description: projectDesc,
//   });
// }

// const handleSubmit = async (event) =>  {
//   event.preventDefault();
//   setError("");
//
//   if (!projectTitle.trim()) {
//     setError("프로젝트 제목을 입력해주세요.");
//     return;
//   }
//
//   try {
//     const data = await handleCreateProject();
//     // 성공 콜백 함수 호출
//     if (props.onCreateProjectSuccess) {
//       props.onCreateProjectSuccess(data); // 생성된 프로젝트 데이터를 전달
//     }
//     handleClose();
//   }
//   catch (error) {
//     alert(error.message || "프로젝트 생성에 실패했습니다.")
//   }
// }
