package backend.service;

import backend.dto.project.MemberRoleDTO;
import backend.dto.project.ProjectMemberDTO;
import backend.entity.Project.ProjectMember;
import backend.entity.Project.ProjectMemberRoleType;
import backend.repository.ProjectInviteRepository;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProjectMemberService {
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectInviteRepository projectInviteRepository;

    // 소속 맴버 리스트
    public List<ProjectMemberDTO> getMembers(Long projectId) {
        if (!projectRepository.existsById(projectId)){
            throw new EntityNotFoundException();
        }
        List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);

        return members.stream().map(m -> ProjectMemberDTO.builder()
                .username(m.getUser().getUsername())
                .role(m.getRole())
                .build()
        ).toList();
    }

    // 맴버 권한 수정
    @Transactional
    public void updateRole(String requesterName ,Long projectId, MemberRoleDTO memberRoleDTO){
        if (isNotLeader(requesterName, projectId)) throw new AccessDeniedException("권한 없음");

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUsername(projectId, memberRoleDTO.getUsername())
                .orElseThrow(EntityNotFoundException::new);

        ProjectMemberRoleType memberRole = ProjectMemberRoleType.fromString(memberRoleDTO.getRole());
        if (memberRole == null) throw new IllegalArgumentException("존재하지 않는 권한입니다.");

        member.updateRole(memberRole);
    }

    // 맴버 퇴출/탈퇴
    @Transactional
    public void deleteMember(String requesterName, Long projectId, String username) {
        if (isNotLeader(requesterName, projectId) && !(username.equals(requesterName))) throw new AccessDeniedException("권한 없음");
        projectMemberRepository.deleteProjectMemberByProjectIdAndUsername(projectId, username);
        projectInviteRepository.deleteByProjectIdAndUserUsername(projectId, username);
    }

    // 관리자 권한 확인
    private boolean isNotLeader(String username, Long projectId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUsername(projectId, username).orElseThrow(EntityNotFoundException::new);
        return !member.getRole().equals(ProjectMemberRoleType.LEADER);
    }
}
