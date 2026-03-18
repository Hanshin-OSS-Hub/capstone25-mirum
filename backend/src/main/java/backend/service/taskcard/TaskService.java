package backend.service.taskcard;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {

    Long createTask(TaskRequestDTO req, Long ProjectId);

    TaskDetailDTO getTask(Long projectId, Long taskId);

    //DELETED 제외 모든 task조회
    Page<TaskSummaryDTO> listTasks(Long ProjectId, Pageable pageable);

    //특정 status 기준 조회(DELETED 포함)
    Page<TaskSummaryDTO> listTasksByStatus(Long ProjectId, TaskStatus status, Pageable pageable);

    TaskDetailDTO updateTask(Long projectId, Long taskId, TaskUpdateRequestDTO req);

    void deleteTask(Long ProjectId, Long taskId);
}
