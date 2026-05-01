package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UploadUrlResponseDTO {
    private List<String> uuids;
    private List<String> urls;
}
