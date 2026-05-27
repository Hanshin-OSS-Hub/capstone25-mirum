package backend.entity;

import backend.entity.Project.Project;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class S3File {
    @Id
    private String uuid;
    private String originalFilename;
    private Long size;
    private String contentType;

    @CreatedDate
    private LocalDateTime createdDate;
    private String createdBy;

    private LocalDateTime deletedDate;
    private boolean isDeleted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    public void setMetadata(Long size, String contentType) {
        this.size = size;
        this.contentType = contentType;
    }

    public void deleteFile() {
        this.isDeleted = true;
        this.deletedDate = LocalDateTime.now();
    }

    public void restoreFile() {
        this.isDeleted = false;
    }
}
