package backend.controller;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.service.taskcard.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
        Long taskId = taskService.createTask(req, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("taskId", taskId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> getTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal String username
    ) {
        TaskDetailDTO dto = taskService.getTask(taskId, username);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<Page<TaskSummaryDTO>> listTasks(
            @RequestParam Long boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String username
    ) {
        Page<TaskSummaryDTO> result = taskService.listTasks(boardId, PageRequest.of(page, size), username);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<TaskDetailDTO> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO req,
            @AuthenticationPrincipal String username
    ) {
        TaskDetailDTO updated = taskService.updateTask(taskId, req, username);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal String username
    ) {
        taskService.deleteTask(taskId, username);
        return ResponseEntity.noContent().build();
    }
}
