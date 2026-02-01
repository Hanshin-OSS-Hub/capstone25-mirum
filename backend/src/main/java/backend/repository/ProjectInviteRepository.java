package backend.repository;

import backend.entity.Project.ProjectInvite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectInviteRepository extends JpaRepository<ProjectInvite, Long> {
    Optional<ProjectInvite> findByProjectIdAndUserUsername(Long projectId, String username);

    @Query("SELECT i FROM ProjectInvite i JOIN FETCH i.user JOIN FETCH i.project WHERE i.project.id = :projectId")
    List<ProjectInvite> findAllByProjectId(Long projectId);

    void deleteByProjectIdAndUserUsername(Long projectId, String username);

    @Query("SELECT i FROM ProjectInvite i JOIN FETCH i.user JOIN FETCH i.project WHERE i.user.username = :username")
    List<ProjectInvite> findAllByUserUsername(@Param("username") String username);
}
