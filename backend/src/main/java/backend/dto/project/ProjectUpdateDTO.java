package backend.dto.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectUpdateDTO {
    private Long projectId;
    private String projectName;
    private String description;
}
