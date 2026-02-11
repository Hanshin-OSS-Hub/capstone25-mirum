package backend.controller;

import backend.dto.project.ProjectResponseDTO;
import backend.dto.project.ProjectUpdateDTO;
import backend.dto.project.ProjectsDTO;
import backend.global.response.ApiResponse;
import backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    // 프로젝트 생성
    // 프로젝트 번호 반환
    @PostMapping("/project")
    public ResponseEntity<ApiResponse<Map<String, Long>>> createProject(@RequestBody ProjectUpdateDTO projectUpdateDTO, @AuthenticationPrincipal String username) {
        Long projectId = projectService.createProject(projectUpdateDTO.getProjectName(), projectUpdateDTO.getDescription(), username);
        Map<String, Long> result = Map.of("projectId", projectId);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.response(result));
    }

    // 프로젝트 정보
    // 프로젝트 정보 반환
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponseDTO>> getProject(@PathVariable Long projectId, @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ApiResponse.response(projectService.getProjectInfo(projectId, username)));
    }

    // 프로젝트 정보 수정
    // 반환값 없음
    @PutMapping("/project")
    public ResponseEntity<ApiResponse<Void>> updateProject(@AuthenticationPrincipal String username, @RequestBody ProjectUpdateDTO projectUpdateDTO) {
        projectService.updateProjectInfo(projectUpdateDTO, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // 프로젝트 삭제
    // 반환값 없음
    @DeleteMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<Void>>  deleteProject(@AuthenticationPrincipal String username, @PathVariable Long projectId) {
        projectService.deleteProject(projectId, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // 프로젝트 복구
    @PostMapping("/project/restore/{projectId}")
    public ResponseEntity<ApiResponse<Void>> restoreProject(@PathVariable Long projectId, @AuthenticationPrincipal String username){
        projectService.restoreProject(projectId, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // 내가 속한 프로젝트 목록 가져오기
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectsDTO>>> getAllProjects(@AuthenticationPrincipal String username){
        return ResponseEntity.ok(ApiResponse.response(projectService.getAllProjects(username)));
    }
}
