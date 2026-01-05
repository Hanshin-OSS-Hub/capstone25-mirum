package backend.repository;

import backend.entity.Project.Project;
import backend.entity.Project.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.user WHERE pm.project.id = :projectId")
    List<ProjectMember> findAllByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.user.username = :username AND pm.project.id = :projectId")
    Optional<ProjectMember> findByProjectIdAndUsername(@Param("projectId") Long projectId, @Param("username") String username);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM ProjectMember pm WHERE pm.user.username = :username AND pm.project.id = :projectId")
    void deleteProjectMemberByProjectIdAndUsername(@Param("projectId") Long projectId, @Param("username") String username);

    boolean existsByProjectIdAndUserUsername(Long projectId, String  username);
}
