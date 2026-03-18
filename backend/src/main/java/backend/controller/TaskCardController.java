package backend.controller;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import backend.service.taskcard.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tasks")
public class TaskCardController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestBody TaskRequestDTO req,
            @AuthenticationPrincipal String username
    ) {
        Long taskId = taskService.createTask(req, req.getProjectId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("taskId", taskId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> getTask(
            @PathVariable Long taskId,
            @RequestParam Long projectId
    ) {
        TaskDetailDTO dto = taskService.getTask(projectId, taskId);
        return ResponseEntity.ok(dto);
    }


    //DELETE제외 모두 조회
    @GetMapping
    public ResponseEntity<Page<TaskSummaryDTO>> listTasks(
            @RequestParam Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size

            ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskSummaryDTO> result = taskService.listTasks(projectId, pageable);
        return ResponseEntity.ok(result);
    }


    //DELETE포함 상태별 조회
    @GetMapping("/status")
    public ResponseEntity<Page<TaskSummaryDTO>> listTasksByStatus(
            @RequestParam Long projectId,
            @RequestParam TaskStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TaskSummaryDTO> result = taskService.listTasksByStatus(projectId, status, pageable);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> updateTask(
            @PathVariable Long taskId,
            @RequestParam Long projectId,
            @RequestBody TaskUpdateRequestDTO req
    ) {
        TaskDetailDTO updated = taskService.updateTask(projectId, taskId, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long taskId,
            @RequestParam Long projectId
    ) {
        taskService.deleteTask(taskId, projectId);
        return ResponseEntity.noContent().build();
    }
}
