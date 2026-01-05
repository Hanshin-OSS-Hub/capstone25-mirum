package backend.dto.project;

import backend.entity.Project.ProjectMemberRoleType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectMemberDTO {
    private String username;
    private ProjectMemberRoleType role;
}
