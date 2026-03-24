package backend.service.taskcard;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TaskService {

    Long createTask(TaskRequestDTO req, Long projectId);

    TaskDetailDTO getTask(Long projectId, Long taskId);

    //DELETED 제외 모든 task조회(단건 조회)
    List<TaskSummaryDTO> listTasks(Long projectId);

    //특정 status 기준 조회(DELETED 포함)
    List<TaskSummaryDTO> listTasksByStatus(Long projectId, TaskStatus status);

    TaskDetailDTO updateTask(Long projectId, Long taskId, TaskUpdateRequestDTO req);

    void deleteTask(Long projectId, Long taskId);

    void restoreTask(Long projectId, Long taskId);

    //담당자가 삭제되었을 때 LEADER로 교체
    void changeAssigneeToLeader(Long projectId, Long username);
}

