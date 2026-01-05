package backend.service;

import backend.dto.project.InviteRequestDTO;
import backend.dto.project.InviteResponseDTO;
import backend.entity.Project.*;
import backend.entity.User;
import backend.repository.ProjectInviteRepository;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProjectInviteService {
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectInviteRepository projectInviteRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    //초대 발송
    @Transactional
    public Long inviteMember(InviteRequestDTO inviteRequestDTO) {
        Long projectId = inviteRequestDTO.getProjectId();
        String invitee = inviteRequestDTO.getInvitedName();

        if (projectMemberRepository.existsByProjectIdAndUserUsername(projectId, invitee)) {
            throw new IllegalArgumentException("이미 참여 중인 멤버입니다.");
        }

        ProjectInvite existingInvite = projectInviteRepository.findByProjectIdAndUserUsername(projectId, invitee).orElse(null);
        ProjectInvite savedInvite;

        if (existingInvite != null) {
            if (existingInvite.getStatus() == InviteStatus.INVITED) {
                throw new IllegalArgumentException("이미 초대가 발송되었습니다.");
            }
            if (existingInvite.getStatus() == InviteStatus.ACCEPTED) {
                throw new IllegalArgumentException("이미 수락된 사용자입니다.");
            }
            existingInvite.setStatus(InviteStatus.INVITED);
            existingInvite.setInviterName(inviteRequestDTO.getInviterName());
            savedInvite = existingInvite;
        } else {
            User user = userRepository.findByUsername(invitee).orElseThrow(EntityNotFoundException::new);
            Project project = projectRepository.getReferenceById(projectId);

            ProjectInvite newInvite = ProjectInvite.builder()
                    .user(user)
                    .project(project)
                    .inviterName(inviteRequestDTO.getInviterName())
                    .status(InviteStatus.INVITED)
                    .build();

            savedInvite = projectInviteRepository.save(newInvite);
        }

        return savedInvite.getId();
    }

    //초대 수락
    @Transactional
    public void acceptInvite(Long inviteId, String username) {
        if (isNotMyInvitation(inviteId,  username)) throw new IllegalArgumentException("본인에게 발송된 초대가 아닙니다.");

        LocalDateTime now = LocalDateTime.now();
        ProjectInvite invite = projectInviteRepository.findById(inviteId).orElseThrow(EntityNotFoundException::new);

        ProjectMember member = ProjectMember.builder()
                .user(invite.getUser())
                .project(invite.getProject())
                .role(ProjectMemberRoleType.MEMBER)
                .build();
        projectMemberRepository.save(member);

        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setResponseDate(now);
    }

    //초대 거절
    @Transactional
    public void declineInvite(Long inviteId, String username) {
        if (isNotMyInvitation(inviteId,  username)) throw new IllegalArgumentException("본인에게 발송된 초대가 아닙니다.");

        LocalDateTime now = LocalDateTime.now();
        ProjectInvite invite = projectInviteRepository.getReferenceById(inviteId);
        invite.setStatus(InviteStatus.DECLINED);
        invite.setResponseDate(now);
    }

    // 수신한 초대 확인
    public List<InviteResponseDTO> getReceivedInvites(String username) {
        List<ProjectInvite> invite = projectInviteRepository.findAllByUserUsername(username);

        return invite.stream().map(i -> InviteResponseDTO.builder()
                    .projectName(i.getProject().getProjectName())
                    .inviteeName(i.getUser().getUsername())
                    .status(i.getStatus())
                    .inviterName(i.getInviterName())
                    .build()
        ).toList();
    }

    // 발송한 초대 확인
    public List<InviteResponseDTO> getSentInvites(String username) {
        List<ProjectInvite> invite = projectInviteRepository.findAllByInviterName(username);

        return invite.stream().map(i -> InviteResponseDTO.builder()
                .projectName(i.getProject().getProjectName())
                .inviteeName(i.getUser().getUsername())
                .status(i.getStatus())
                .inviterName(i.getInviterName())
                .build()
        ).toList();
    }

    //본인 확인
    private boolean isNotMyInvitation(Long id, String username) {
        ProjectInvite invite = projectInviteRepository.findById(id).orElseThrow(EntityNotFoundException::new);
        return !invite.getUser().getUsername().equals(username);
    }
}
