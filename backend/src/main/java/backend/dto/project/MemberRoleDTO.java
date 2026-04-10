package backend.dto.project;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberRoleDTO {
    // 맴버 권한 수정 요청
    private String username;
    private String role;
}
