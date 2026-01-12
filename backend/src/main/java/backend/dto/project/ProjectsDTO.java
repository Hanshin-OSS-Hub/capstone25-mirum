package backend.dto.project;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectsDTO {
    private String projectName;
    private String description;
    private Long memberCount;
    private int taskProgress;
}
