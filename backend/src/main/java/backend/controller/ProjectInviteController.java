package backend.controller;

import backend.dto.project.InviteRequestDTO;
import backend.dto.project.InviteResponseDTO;
import backend.global.response.ApiResponse;
import backend.service.ProjectInviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invitations")
@RequiredArgsConstructor
public class ProjectInviteController {
    private final ProjectInviteService projectInviteService;

    // 초대 발송
    // 초대 번호 반환
    @PostMapping("/")
    public ResponseEntity<ApiResponse<Map<String, Long>>> inviteMember(
            @AuthenticationPrincipal String username,
            @RequestBody InviteRequestDTO inviteRequestDTO
    ) {
        inviteRequestDTO.setInviterName(username);
        Map<String, Long> response = Map.of("invitationNumber",  projectInviteService.inviteMember(inviteRequestDTO));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.response(response));
    }

    // 초대 수락
    // 반환값 없음
    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvite(@PathVariable Long id, @AuthenticationPrincipal String username){
        projectInviteService.acceptInvite(id, username);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(null));
    }

    // 초대 거절
    // 반환값 없음
    @PutMapping("/{id}/decline")
    public ResponseEntity<ApiResponse<Void>> declineInvite(@PathVariable Long id, @AuthenticationPrincipal String username){
        projectInviteService.declineInvite(id, username);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(null));
    }

    // 수신한 초대 확인
    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<InviteResponseDTO>>> getReceivedInvites(
            @AuthenticationPrincipal String username
    ) {
        List<InviteResponseDTO> invites = projectInviteService.getReceivedInvites(username);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(invites));
    }

    // 발신한 초대 확인
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<InviteResponseDTO>>> getSentInvites(
            @AuthenticationPrincipal String username
    ) {
        List<InviteResponseDTO> invites = projectInviteService.getSentInvites(username);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(invites));
    }
}
