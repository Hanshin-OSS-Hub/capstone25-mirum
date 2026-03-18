package backend.repository.taskcard;

import backend.entity.taskcard.Task;
import backend.entity.taskcard.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    //프로젝트에 속한 모든 task 조회(DELETED 제외)
    Page<Task> findAllByProjectIdAndStatusNot(Long projectId,TaskStatus status, Pageable pageable);


    //프로젝트에 속한 특정 task 조회(DELETED 제외)
    Optional<Task> findByProjectIdAndTaskIdAndStatusNot(Long projectId, Long taskId, TaskStatus status);


    //프로젝트에 속한 특정 상태 목록 조회(DELETED 포함)
    Page<Task> findByProjectIdAndStatus(Long projectId,TaskStatus status, Pageable pageable);

    //DELETED Task 영구 삭제
    void deleteByStatusAndUpdatedAtBefore(TaskStatus status, LocalDate cutoffDate);

    //Project 삭제시 task 삭제
    @Modifying
    @Query("""
        update Task t
        set t.status = :deletedStatus,
            t.updatedAt = :now
        where t.projectId = :projectId
          and t.status <> :deletedStatus
    """)
    int softDeleteAllByProjectId(Long projectId, TaskStatus deletedStatus, LocalDate now);


}

