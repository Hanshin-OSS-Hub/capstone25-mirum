package backend.dto.project;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ProjectResponseDTO {
    private String projectName;
    private String description;
    private LocalDateTime creationDate;
    private List<ProjectMemberDTO> members;
}
