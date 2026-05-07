package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class S3InfoResponseDTO {
    private String uuid;
    private String originalFilename;
    private Long size;
    private String contentType;
    private LocalDateTime createdDate;
    private String createdBy;
    private Boolean isDeleted;
}
