package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class DownloadUrlResponseDTO {
    private String url;
    private String filename;
}
