package backend.dto.S3;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DeletedFilesDTO {
    String uuid;
    String originalFilename;
    LocalDateTime deletedDate;
    String createdBy;

    Long size;
    String contentType;
}
