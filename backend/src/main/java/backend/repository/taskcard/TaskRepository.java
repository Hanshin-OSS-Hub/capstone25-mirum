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
    void deleteByStatusAndUpdatedAtBefore(TaskStatus status, LocalDateTime cutoffDate);

    //Task 되살리기
    Optional<Task> findByProjectIdAndTaskIdAndStatus(Long projectId, Long TaskId, TaskStatus status);

    //Project 삭제시 task 삭제
    void changeAssigneeToLeader(Long projectId, Long removedmemberId);

    @Modifying
    @Query("""
        update Task t
        set t.status = :deletedStatus,
            t.updatedAt = :now
        where t.projectId = :projectId
          and t.status <> :deletedStatus
    """)
    int softDeleteAllByProjectId(Long projectId, TaskStatus deletedStatus, LocalDate now);

    //해당 멤버가 담당자인 task들 조회
    List<Task> findAllByProjectIdAndAssigneeIdAndStatusNot(Long projectId, Long removedMemberId, TaskStatus taskStatus);
}

