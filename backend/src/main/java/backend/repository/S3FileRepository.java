package backend.repository;

import backend.entity.S3File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface S3FileRepository extends JpaRepository<S3File, String> {
    List<S3File> findAllByUuidInAndIsDeletedFalse(List<String> uuid);
    List<S3File> findAllByUuidInAndIsDeletedTrue(List<String> uuid);

    List<S3File> findAllByProjectIdAndIsDeletedTrue(Long projectId);

    @Query("SELECT s FROM S3File s JOIN FETCH s.project p WHERE s.isDeleted = FALSE AND p.id = :projectId")
    List<S3File> findAllFilesInProject(@Param("projectId")Long projectId);

    List<S3File> findBySizeIsNullAndCreatedDateBefore(LocalDateTime threshold);
}
