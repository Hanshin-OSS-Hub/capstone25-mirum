package backend.service.taskcard;


import backend.entity.User;
import backend.entity.taskcard.Task;
import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Long createTask(TaskRequestDTO req, Long ProjectId) {
        validateCreateRequest(req);

        // TODO: 권한 체크(예: username이 projectId 멤버인지)
        // TODO: boardId가 projectId에 속하는지 검증

        TaskStatus status =
                (req.getStatus() == null)
                        ? TaskStatus.TODO
                        : req.getStatus();

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
    public TaskDetailDTO getTask(Long projectId, Long taskId) {
        Task task = taskRepository.findByProjectIdAndTaskIdAndStatusNot(projectId, taskId, TaskStatus.DELETED)
                .filter(t -> t.getProjectId().equals(projectId))
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));


        return toDetailDTO(task);
    }

    @Override
    @Transactional(readOnly = true)
    //DELETED 제외 모든 task조회
    public Page<TaskSummaryDTO> listTasks(Long projectId, Pageable pageable) {

        return taskRepository.findAllByProjectIdAndStatusNot(projectId, TaskStatus.DELETED, pageable)
                .map(this::toSummaryDTO);
    }

    @Override
    @Transactional(readOnly = true)
    //특정 status 기준 조회(DELETED 포함)
    public Page<TaskSummaryDTO> listTasksByStatus(Long projectId, TaskStatus status, Pageable pageable) {

        return taskRepository.findByProjectIdAndStatus(projectId, status, pageable)
                .map(this::toSummaryDTO);
    }

    @Override
    @Transactional
    public TaskDetailDTO updateTask(Long projectId,Long taskId, TaskUpdateRequestDTO req) {

        Task task = taskRepository.findByProjectIdAndTaskIdAndStatusNot(
                projectId, taskId, TaskStatus.DELETED
        ).orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

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
    public void deleteTask(Long projectId, Long taskId) {
        Task task = taskRepository.findByProjectIdAndTaskIdAndStatusNot(
                        projectId, taskId, TaskStatus.DELETED
                )
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.updateBasic(
                null,
                null,
                TaskStatus.DELETED,
                null,
                null,
                null,
                null,
                LocalDate.now()
        );
    }

    //Delete 매서드 분리
    public void softDeleteTask(Long taskId, String username) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getStatus() != TaskStatus.DELETED)        // TODO: 권한 체크(삭제 권한)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.updateBasic(
                null, null, TaskStatus.DELETED,
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
        if (task.getAssigneeId() != null) {
            User user = userRepository.findById(task.getAssigneeId())
                    .orElse(null);

            if (user != null) {
                dto.setAssigneeName(user.getUsername());
            } else {
                dto.setAssigneeName("알 수 없음");
            }
        } else {
            dto.setAssigneeName("미배정");
        }
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
        dto.setAssigneeName(task.getAssigneeId()); // TODO: User 조회해서 채우기

        if (task.getAssigneeId() != null) {
            Long assigneeName = Long.valueOf(userRepository.findById(task.getAssigneeId())
                    .map(User::getUsername)
                    .orElse("알 수 없음"));
            dto.setAssigneeName(assigneeName);
        } else dto.setAssigneeName(Long.valueOf("미배정"));
        return dto;
    }
}

