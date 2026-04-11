package backend.dto.project;

import backend.entity.Project.InviteStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InviteResponseDTO {
    private Long inviteId;
    private String projectName;
    private String inviterName;
    private String invitedName;
    private InviteStatus status;
}
