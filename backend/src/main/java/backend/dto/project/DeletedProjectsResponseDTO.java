package backend.dto.project;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class DeletedProjectsResponseDTO {
    private Long projectId;
    private String projectName;
    private String description;
    private Long memberCount;
    private LocalDateTime deletedDate;
}
