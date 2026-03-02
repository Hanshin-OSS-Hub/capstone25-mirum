package backend.service.taskcard;


import backend.entity.taskcard.Task;
import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.repository.taskcard.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public Long createTask(TaskRequestDTO req, String username) {
        validateCreateRequest(req);

        // TODO: 권한 체크(예: username이 projectId 멤버인지)
        // TODO: boardId가 projectId에 속하는지 검증

        String status = (req.getStatus() == null || req.getStatus().isBlank()) ? "TODO" : req.getStatus();

        LocalDate now = LocalDate.now();

        Task task = new Task(
                req.getBoardId(),
                req.getProjectId(),
                req.getTitle(),
                req.getDescription(),
                status,
                Task.toCsv(req.getTags()),
                req.getNotes(),
                req.getAssigneeId(),
                req.getDueDate(),
                now,
                now
        );

        Task saved = taskRepository.save(task);
        return saved.getTaskId();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskDetailDTO getTask(Long taskId, String username) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !"DELETED".equals(t.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));


        return toDetailDTO(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskSummaryDTO> listTasks(Long boardId, Pageable pageable, String username) {
        // TODO: 권한 체크(username이 board/project 접근 가능한지)

        return taskRepository.findByBoardId(boardId, "DELETED", pageable)
                .map(this::toSummaryDTO);
    }

    @Override
    @Transactional
    public TaskDetailDTO updateTask(Long taskId, TaskUpdateRequestDTO req, String username) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !"DELETED".equals(t.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        // TODO: 권한 체크(수정 권한)
        // TODO: (요구사항에 따라) req.boardId/projectId 변경 허용 여부 결정

        String tagsCsv = (req.getTags() == null) ? null : Task.toCsv(req.getTags());

        task.updateBasic(
                req.getTitle(),
                req.getDescription(),
                req.getStatus(),
                tagsCsv,
                req.getNotes(),
                req.getAssigneeId(),
                req.getDueDate(),
                LocalDate.now()
        );

        return toDetailDTO(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId, String username) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !"DELETED".equals(t.getStatus()))        // TODO: 권한 체크(삭제 권한)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));



        // soft delete
        task.updateBasic(
                null, null, "DELETED",
                null, null, null, null,
                LocalDate.now()
        );
    }

    private void validateCreateRequest(TaskRequestDTO req) {
        if (req.getBoardId() == null) throw new IllegalArgumentException("boardId is required");
        if (req.getProjectId() == null) throw new IllegalArgumentException("projectId is required");
        if (req.getTitle() == null || req.getTitle().isBlank()) throw new IllegalArgumentException("title is required");
    }

    private TaskDetailDTO toDetailDTO(Task task) {
        TaskDetailDTO dto = new TaskDetailDTO();
        dto.setBoardId(task.getBoardId());
        dto.setTaskId(task.getTaskId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setTags(Task.fromCsv(task.getTagsCsv()));
        dto.setNotes(task.getNotes());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setDueDate(task.getDueDate());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setAssigneeName(null);
        dto.setAssigneeProfileImage(null);

        return dto;
    }

    private TaskSummaryDTO toSummaryDTO(Task task) {
        TaskSummaryDTO dto = new TaskSummaryDTO();
        dto.setTaskId(task.getTaskId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setTags(Task.fromCsv(task.getTagsCsv()));
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setDueDate(task.getDueDate());

        dto.setAssigneeId(task.getAssigneeId());
        dto.setAssigneeName(null); // TODO: User 조회해서 채우기

        return dto;
    }
}

