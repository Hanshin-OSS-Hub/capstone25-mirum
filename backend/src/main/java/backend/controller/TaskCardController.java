package backend.controller;


import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import backend.global.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<Map<String, Long>>> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskRequestDTO req,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        Long taskId = taskService.createTask(req, projectId, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.response(Map.of("taskId", taskId)));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailDTO>> getTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        TaskDetailDTO dto = taskService.getTask(projectId, taskId, username);
        return ResponseEntity.ok(ApiResponse.response(dto));
    }


    //DELETE제외 모두 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskSummaryDTO>>> listTasks(
            @PathVariable Long projectId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
            ) {
        List<TaskSummaryDTO> result = taskService.listTasks(projectId, username);
        return ResponseEntity.ok(ApiResponse.response(result));
    }


    //DELETE포함 상태별 조회
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<TaskSummaryDTO>>> listTasksByStatus(
            @PathVariable Long projectId,
            @RequestParam TaskStatus status,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        List<TaskSummaryDTO> result = taskService.listTasksByStatus(projectId, status, username);
        return ResponseEntity.ok(ApiResponse.response(result));
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDetailDTO>> updateTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO req,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        TaskDetailDTO updated = taskService.updateTask(projectId, taskId, req, username);
        return ResponseEntity.ok(ApiResponse.response(updated));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        taskService.deleteTask(projectId, taskId, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }
    @PatchMapping("/{taskId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        taskService.restoreTask(projectId, taskId, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    @DeleteMapping("/{taskId}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentDeleteTask(
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username
    ) {
        taskService.permanentDeleteTask(projectId, taskId, username);
        return ResponseEntity.ok(ApiResponse.response(null));
    }


}
