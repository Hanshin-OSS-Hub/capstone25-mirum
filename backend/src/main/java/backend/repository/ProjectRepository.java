package backend.repository;

import backend.entity.Project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.projectMembers pm LEFT JOIN FETCH pm.user u WHERE p.id = :id AND p.isDeleted = FALSE")
    Optional<Project> findByIdWithMember(@Param("id") Long id);

    @Query ("SELECT p FROM Project p JOIN p.projectMembers m WHERE m.user.username = :username AND p.isDeleted = FALSE")
    List<Project> findAllProjectsByUsername(@Param("username") String username);

    @Modifying
    @Query("DELETE FROM Project p WHERE p.deletedDate < :beforeDate")
    void deleteExpiredSoftDeletedDate(@Param("beforeDate") LocalDateTime beforeDate);
}
