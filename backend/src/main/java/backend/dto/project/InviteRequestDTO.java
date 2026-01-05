package backend.dto.project;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Builder
public class InviteRequestDTO {
    private Long projectId;

    // 초대 보낸 사람
    @Setter
    private String inviterName;

    // 초대 받은 사람
    private String invitedName;
}
