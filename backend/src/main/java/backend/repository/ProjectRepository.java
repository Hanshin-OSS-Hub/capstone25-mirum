package backend.repository;

import backend.entity.Project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.projectMembers pm LEFT JOIN FETCH pm.user u WHERE p.id = :id")
    Optional<Project> findByIdWithMember(@Param("id") Long id);
}
