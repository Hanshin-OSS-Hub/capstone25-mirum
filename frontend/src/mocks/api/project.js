import { http } from "msw";
import { successResponse, errorResponse } from "./common.js";
import { parseUsername } from "./common.js";
import { database } from '../database.js';

/**
 * @typedef {import('@/features/projects/api/useCreateProject').CreateProjectRequestDTO} CreateProjectRequestDTO
 * @typedef {import('@/features/projects/api/useUpdateProject').UpdateProjectRequestDTO} UpdateProjectRequestDTO
 */

export const projectHandlers = [
    /** {@link useGetProjectList} */
    /** {@link useGetDeletedProject} */
    // [GET] 프로젝트 목록 조회 (삭제된 프로젝트 포함)
    http.get('*/api/projects', ({ request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
        }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);

      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      // 쿼리 파라미터 확인
      const url = new URL(request.url);
      const isDeleted = url.searchParams.get('deleted') === 'true';

      if (isDeleted) {
        // 내(로그인 사용자)가 삭제한 프로젝트 목록 조회
        const myDeletedProjects = database.deleted_projects.filter(p => p.deleteUsername === username);
        console.log('MSW: 삭제된 프로젝트 목록 조회');
        return successResponse(
            myDeletedProjects,
            200,
        );
      }
      // 내(로그인 사용자)가 멤버로 속한 프로젝트만 조회
      const myProjects = database.projects.filter(p => p.members.some(m => m.username === username));
      // 목록 조회 시에는 상세 정보를 제외하고 ProjectsDTO 형태로 가공
      const projectList = myProjects.map(p => ({
        projectId: p.projectId,
        projectName: p.projectName,
        description: p.description,
        memberCount: p.members.length,
        taskProgress: p.taskProgress,
        creationDate: p.creationDate,
      }));
      return successResponse(
          projectList,
          200,
      );
    }),

    /** {@link useGetProjectDetails} */
    // [GET] 프로젝트 상세 조회
    http.get('*/api/project/:id', ({ request, params }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);

      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      const { id } = params;
      const target = database.projects.find((p) => p.projectId === Number(id));
      
      if (target) {
        // 상세 조회 시에는 ProjectResponseDTO 형태로 가공
        const projectDetails = {
          projectId: target.projectId,
          projectName: target.projectName,
          description: target.description,
          creationDate: target.creationDate,
          members: target.members,
        };
        return successResponse(
            projectDetails,
            200,
        );
      } else {
        return errorResponse(
            '해당 프로젝트를 찾을 수 없습니다.',
            404);
      }
    }),

    /** {@link useCreateProject} */
    // [POST] 새 프로젝트 생성
    http.post('*/api/project', async ({ request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);
      
      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }
      /** @type {any} */
      const newProjectData = await request.json();
      
      // ID 생성 전략 개선: Max ID + 1
      const allProjectIds = [...database.projects, ...database.deleted_projects].map(p => p.projectId);
      const maxId = allProjectIds.length > 0 ? Math.max(...allProjectIds) : 0;

      const newProject = {
        projectId: maxId + 1,
        projectName: newProjectData.projectName,
        description: newProjectData.description,
        taskProgress: 0,
        memberCount: 1,
        creationDate: new Date().toISOString(),
        isDeleted: false,
        deleteUsername: null,
        members: [
          {
            username: userData.username,
            nickname: userData.nickname,
            role: 'LEADER'
          }
        ],
      };
      database.projects.push(newProject);

      return successResponse(
          { projectId: newProject.projectId },
          201
      );
    }),
    
    /** {@link useUpdateProject} */
    // [PUT] 프로젝트 정보 수정
    http.put('*/api/project', async ({ request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);

      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      /** @type {any} */
      const updatedData = await request.json();
      const index = database.projects.findIndex((p) => p.projectId === Number(updatedData.projectId));
      
      if (index !== -1) {
        database.projects[index] = { ...database.projects[index], ...updatedData };
        return successResponse(
        // projects[index],
        null, // 명세서에 따라 null 반환
        200,
        );
      } else {
        return errorResponse(
        '해당 프로젝트를 찾을 수 없습니다.',
        404
        );
      }
    }),
    
    /** {@link useDeleteProject} */
    // [DELETE] 프로젝트 삭제 (Soft Delete)
    http.delete('*/api/project/:id', ({ params, request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);

      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      const { id } = params;
      const index = database.projects.findIndex((p) => p.projectId === Number(id));
      
      if (index !== -1) {
        // 삭제 요청된 프로젝트 객체 상태 수정
        const deletedProject = database.projects.splice(index, 1)[0];
        deletedProject.isDeleted = true;
        deletedProject.deleteUsername = username;
        // 삭제 시 updateDate 갱신 (선택 사항)
        deletedProject.updateDate = new Date().toISOString();
        
        database.deleted_projects.push(deletedProject);

        return successResponse(
            null, // 명세서에 따라 null 반환
            200,
            );
      } else {
        return errorResponse(
            '해당 프로젝트를 찾을 수 없습니다.',
            404);
      }
    }),

    /** {@link useRestoreProject} */
    // [POST] 프로젝트 복구
    http.post('*/api/project/restore/:id', async ({ params, request }) => {
      // 1. Authorization 헤더 존재 여부를 확인하여 인증된 요청인지 검증합니다.
      const authHeader = request.headers.get('Authorization');

      if (!authHeader) {
        return errorResponse(
            '로그인이 필요합니다.',
            401);
      }

      // 2. Bearer 스키마로 전달된 Mock 토큰에서 사용자 식별자(username)를 추출합니다. (JWT Payload 디코딩을 흉내 냄)
      const token = authHeader.split(' ')[1];
      const username = parseUsername(token);
      
      // 3. 추출한 식별자가 DB에 존재하는 유효한 사용자인지 확인하여 인가(Authorization)를 처리합니다.
      const userData = database.users.find((u) => u.username === username);

      if (!userData) {
        return errorResponse(
            '유효하지 않은 사용자입니다.',
            401);
      }

      const { id } = params;
      const deletedIndex = database.deleted_projects.findIndex(p => p.projectId === Number(id));
      
      if (deletedIndex === -1) {
        return errorResponse(
            '해당 삭제된 프로젝트를 찾을 수 없습니다.',
            404);
      }
      
      const deletedProject = database.deleted_projects[deletedIndex];
      
      // 권한 체크 (삭제한 사람만 복구 가능)
      if (deletedProject.deleteUsername !== username) {
        return errorResponse(
            '복구 권한이 없습니다.',
            403);
      }
      
      // 데이터 무결성: 기존 projects에 동일 projectId가 없어야 함
      if (database.projects.some(p => p.projectId === deletedProject.projectId)) {
        return errorResponse(
            '이미 복구된 프로젝트입니다.',
            409
        );
      }
      
      // 복구: isDeleted, deleteUsername 초기화
      const restoredProject = database.deleted_projects.splice(deletedIndex, 1)[0];
      restoredProject.isDeleted = false;
      restoredProject.deleteUsername = null;
      restoredProject.memberCount = 1;
      restoredProject.members = [
          {
              username: userData.username,
              nickname: userData.nickname,
              role: 'LEADER'
          }
      ];
      // 복구 시 updateDate 갱신 (선택 사항)
      restoredProject.updateDate = new Date().toISOString();
      
      database.projects.push(restoredProject);
      
      return successResponse(
          { projectId: restoredProject.projectId },
          200
      );
    }),
];
