package backend.controller;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import backend.service.taskcard.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/project/{projectId}/task")
public class TaskCardController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskRequestDTO req
    ) {
        Long taskId = taskService.createTask(req, projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("taskId", taskId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> getTask(
            //이것도 pathVariable로 써야 할 것 같은ep...
            @PathVariable Long projectId,
            @PathVariable Long taskId

    ) {
        TaskDetailDTO dto = taskService.getTask(projectId, taskId);
        return ResponseEntity.ok(dto);
    }


    //DELETE제외 모두 조회
    @GetMapping
    public ResponseEntity<List<TaskSummaryDTO>> listTasks(
            @PathVariable Long projectId

            ) {
        List<TaskSummaryDTO> result = taskService.listTasks(projectId);
        return ResponseEntity.ok(result);
    }


    //DELETE포함 상태별 조회
    @GetMapping("/status")
    public ResponseEntity<List<TaskSummaryDTO>> listTasksByStatus(
            @PathVariable Long projectId,
            @RequestParam TaskStatus status
    ) {
        List<TaskSummaryDTO> result = taskService.listTasksByStatus(projectId, status);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO req
    ) {
        TaskDetailDTO updated = taskService.updateTask(projectId, taskId, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        taskService.deleteTask(projectId, taskId);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{taskId}/restore")
    public ResponseEntity<Void> restoreTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId
    ) {
        taskService.restoreTask(projectId, taskId);
        return ResponseEntity.noContent().build();
    }


}
