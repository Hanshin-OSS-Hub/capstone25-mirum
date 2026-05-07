package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class DeleteDTO {
    private List<String> uuid;
    private Long projectId;
}
