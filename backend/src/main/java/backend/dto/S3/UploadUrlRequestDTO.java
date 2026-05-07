package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class UploadUrlRequestDTO {
    private Long projectId;
    private List<String> filenames;
}
