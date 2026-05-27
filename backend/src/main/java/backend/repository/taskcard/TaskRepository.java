package backend.repository.taskcard;

import backend.entity.taskcard.Task;
import backend.entity.taskcard.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    //전체 Task 조회(DELETED 제외)
    List<Task> findAllByProjectIdAndStatusNot(Long projectId, TaskStatus status);


    //프로젝트에 속한 특정 task 조회(DELETED 제외) -> getTask, listTasks
    Optional<Task> findByProjectIdAndTaskIdAndStatusNot(Long projectId, Long taskId, TaskStatus status);


    //프로젝트에 속한 특정 상태 목록 조회(DELETED 포함) -> deleteTask, listTasksByStatus, updateTask
    List<Task> findByProjectIdAndStatus(Long projectId,TaskStatus status);

    //DELETED Task 영구 삭제(인증 필수)
    void deleteByStatusAndUpdatedDateBefore(TaskStatus status, LocalDateTime cutoffDate);

    //Task 되살리기
    Optional<Task> findByProjectIdAndTaskIdAndStatus(Long projectId, Long taskId, TaskStatus status);

    //Project 삭제시 task 삭제
    @Modifying
    @Query("""
        update Task t
        set t.status = :deletedStatus,
            t.updatedDate = :now
        where t.projectId = :projectId
          and t.status <> :deletedStatus
    """)
    void softDeleteAllByProjectId(Long projectId, TaskStatus deletedStatus, LocalDateTime now);

    @Modifying
    @Query("delete from Task t where t.projectId = :projectId")
    void deleteAllByProjectId(Long projectId);

    //해당 멤버가 담당자인 task들 조회
    List<Task> findAllByProjectIdAndAssigneeIdAndStatusNot(Long projectId, String assigneeId, TaskStatus taskStatus);
}

