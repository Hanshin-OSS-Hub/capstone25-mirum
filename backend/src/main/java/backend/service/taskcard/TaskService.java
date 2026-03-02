package backend.service.taskcard;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {

    Long createTask(TaskRequestDTO req, String username);

    TaskDetailDTO getTask(Long taskId, String username);

    Page<TaskSummaryDTO> listTasks(Long boardId, Pageable pageable, String username);

    TaskDetailDTO updateTask(Long taskId, TaskUpdateRequestDTO req, String username);

    void deleteTask(Long taskId, String username);
}
