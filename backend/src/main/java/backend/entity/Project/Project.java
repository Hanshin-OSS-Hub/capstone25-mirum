package backend.entity.Project;

import backend.dto.project.ProjectUpdateDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Project {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String projectName;
    private String description;

    @CreatedDate
    private LocalDateTime createdDate;

    // 삭제 관련
    private boolean isDeleted;
    private LocalDateTime deletedDate;
    private String deleteUsername;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL,  orphanRemoval = true)
    private List<ProjectMember> projectMembers =  new ArrayList<>();

    @Formula("(SELECT count(*) FROM ProjectMember pm WHERE pm.project_id = id)")
    private int memberCount;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL,  orphanRemoval = true)
    private List<ProjectInvite> projectInvites =  new ArrayList<>();

    public void updateProjectInfo(ProjectUpdateDTO projectUpdateDTO){
        this.projectName = projectUpdateDTO.getProjectName();
        this.description = projectUpdateDTO.getDescription();
    }

    public void deleteProject(String username){
        this.isDeleted = true;
        this.deletedDate = LocalDateTime.now();
        this.deleteUsername = username;
    }

    public void restoreProject(){
        this.isDeleted = false;
        this.deletedDate = null;
        this.deleteUsername = null;
    }
}
