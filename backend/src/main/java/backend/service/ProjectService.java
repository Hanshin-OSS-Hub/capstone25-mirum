package backend.service;

import backend.dto.project.ProjectResponseDTO;
import backend.dto.project.ProjectMemberDTO;
import backend.dto.project.ProjectUpdateDTO;
import backend.entity.Project.Project;
import backend.entity.Project.ProjectMember;
import backend.entity.Project.ProjectMemberRoleType;
import backend.entity.User;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    //C
    @Transactional
    public Long createProject(String projectName, String description, String username) {
        User user = userRepository.findByUsername(username).orElseThrow(EntityNotFoundException::new);

        //프로젝트 객체 만들기
        Project project = Project.builder()
                .projectName(projectName)
                .projectMembers(new ArrayList<>())
                .description(description)
                .build();
        Project savedProject = projectRepository.save(project);

        //프로젝트 만든사람을 관리자로 추가
        ProjectMember projectMember = ProjectMember.builder()
                .user(user)
                .project(savedProject)
                .role(ProjectMemberRoleType.LEADER)
                .build();
        projectMemberRepository.save(projectMember);

        savedProject.getProjectMembers().add(projectMember);
        return savedProject.getId();
    }

    //R
    public ProjectResponseDTO getProjectInfo(Long projectId) {
        Project project = projectRepository.findByIdWithMember(projectId).orElseThrow(EntityNotFoundException::new);
        List<ProjectMember> projectMembers = project.getProjectMembers();

        //맴버 목록 가져와서 이름, 권한만 뽑은 뒤 DTO로 맵핑
        List<ProjectMemberDTO> projectMemberDTOS = projectMembers.stream()
                .map(a -> ProjectMemberDTO.builder()
                        .role(a.getRole())
                        .username(a.getUser().getUsername())
                        .build()
                )
                .toList();

        //DTO에 값 넣고 반환e
        return ProjectResponseDTO.builder()
                .creationDate(project.getCreatedDate())
                .description(project.getDescription())
                .projectName(project.getProjectName())
                .members(projectMemberDTOS)
                .build();
    }

    //U
    @Transactional
    public void updateProjectInfo(ProjectUpdateDTO projectUpdateDTO, String username) {
        if (isNotLeader(username, projectUpdateDTO.getProjectId())) throw new AccessDeniedException("권한 없음");

        Project project = projectRepository.findById(projectUpdateDTO.getProjectId())
                .orElseThrow(EntityNotFoundException::new);
        project.updateProjectInfo(projectUpdateDTO);
    }

    //D
    @Transactional
    public void deleteProject(Long projectId, String username){
        if (isNotLeader(username, projectId)) throw new AccessDeniedException("권한 없음");

        projectRepository.deleteById(projectId);
    }

    //권한 검증
    private boolean isNotLeader(String username, Long projectId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUsername(projectId, username).orElseThrow(EntityNotFoundException::new);
        return !member.getRole().equals(ProjectMemberRoleType.LEADER);
    }
}
