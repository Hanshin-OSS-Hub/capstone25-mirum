package backend.controller;

import backend.dto.project.MemberRoleDTO;
import backend.dto.project.ProjectMemberDTO;
import backend.dto.project.ProjectMemberDeleteDTO;
import backend.global.response.ApiResponse;
import backend.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class ProjectMemberController {
    private final ProjectMemberService projectMemberService;

    // 소속 맴버 리스트
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<List<ProjectMemberDTO>>> getProjectMembers(@PathVariable Long projectId) {
        List<ProjectMemberDTO> members = projectMemberService.getMembers(projectId);
        return ResponseEntity.ok()
                .body(ApiResponse.response(members));
    }

    // 맴버 권한 수정
    @PutMapping("/{projectId}/role")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long projectId,
            @RequestBody MemberRoleDTO memberRoleDTO,
            @AuthenticationPrincipal String username
    ) {
        projectMemberService.updateRole(username, projectId, memberRoleDTO);
        return ResponseEntity.ok()
                .body(ApiResponse.response(null));
    }

    // 맴버 퇴출 및 탈퇴
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProjectMember(
            @PathVariable Long projectId,
            @AuthenticationPrincipal String username,
            @RequestBody ProjectMemberDeleteDTO targetUsername
            ) {
        projectMemberService.deleteMember(username, projectId, targetUsername.getUsername());
        return ResponseEntity.ok()
                .body(ApiResponse.response(null));
    }
}
