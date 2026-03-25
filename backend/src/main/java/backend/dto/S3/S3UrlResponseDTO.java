package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class S3UrlResponseDTO {
    private String url;
    private String filename;
}
