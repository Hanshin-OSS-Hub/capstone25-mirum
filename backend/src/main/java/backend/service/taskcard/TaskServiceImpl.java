package backend.service.taskcard;


import backend.entity.Project.Project;
import backend.entity.Project.ProjectMember;
import backend.entity.Project.ProjectMemberRoleType;
import backend.entity.User;
import backend.entity.taskcard.Task;
import backend.dto.taskcard.TaskDetailDTO;
import backend.dto.taskcard.TaskRequestDTO;
import backend.dto.taskcard.TaskSummaryDTO;
import backend.dto.taskcard.TaskUpdateRequestDTO;
import backend.entity.taskcard.TaskStatus;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.UserRepository;
import backend.repository.taskcard.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static java.time.LocalTime.now;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional
    public Long createTask(TaskRequestDTO req, Long ProjectId) {

        validateCreateRequest(req);

        TaskStatus status =
                (req.getStatus() == null)
                        ? TaskStatus.TODO
                        : req.getStatus();

        LocalDate now = LocalDate.now();

        Task task = new Task(
                req.getProjectId(),
                req.getTitle(),
                req.getDescription(),
                status,
                Task.toCsv(req.getTags()),
                req.getNotes(),
                req.getAssigneeId(),
                req.getDueDate(),
                LocalDateTime.now(),
                LocalDateTime.now()
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
    public List<TaskSummaryDTO> listTasks(Long projectId) {

        return taskRepository.findAllByProjectIdAndStatusNot(projectId, TaskStatus.DELETED)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    //특정 status 기준 조회(DELETED 포함)
    public List<TaskSummaryDTO> listTasksByStatus(Long projectId, TaskStatus status) {

        return taskRepository.findByProjectIdAndStatus(projectId, status)
                .stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Override
    @Transactional
    public TaskDetailDTO updateTask(Long projectId, Long taskId, TaskUpdateRequestDTO req) {

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
                LocalDateTime.now()
        );

        return toDetailDTO(task);
    }

    @Override
    @Transactional
    public void deleteTask(Long projectId, Long taskId) {
        Task task = taskRepository.findByProjectIdAndTaskIdAndStatusNot(
                        projectId, taskId, TaskStatus.DELETED)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.updateBasic(
                null,
                null,
                TaskStatus.DELETED,
                null,
                null,
                null,
                null,
                LocalDateTime.now()
        );
    }

    @Override
    public void restoreTask(Long projectId, Long taskId) {
        Task task = taskRepository.findByProjectIdAndTaskIdAndStatus(
                projectId, taskId, TaskStatus.DELETED)
                .orElseThrow(() -> new IllegalArgumentException("Deleted task not found: " + taskId));

        task.restoreTask(TaskStatus.TODO, LocalDateTime.now());


    }

    @Override
    @Transactional
    public void changeAssigneeToNULL(Long projectId, Long taskId) {

        ProjectMember leader = projectMemberRepository
                .findByProjectIdAndRole(projectId, ProjectMemberRoleType.LEADER)
                .orElseThrow(() -> new IllegalArgumentException("Leader not found"));

        Long leaderId = leader.getUser().getId();

        // 2. 해당 멤버가 담당자인 task 조회
        List<Task> tasks = taskRepository.findAllByProjectIdAndAssigneeIdAndStatusNot(
                projectId, taskId, TaskStatus.DELETED
        );

        // 3. 담당자 null로 변경
        for (Task task : tasks) {
            task.changeAssignee(null, LocalDateTime.now());
        }
    }

    //Delete 매서드 분리
    public void softDeleteTask(Long taskId, String username) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> t.getStatus() != TaskStatus.DELETED)        // TODO: 권한 체크(삭제 권한)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        task.updateBasic(
                null, null, TaskStatus.DELETED,
                null, null, null, null,
                LocalDateTime.now()
        );
    }


    private void validateCreateRequest(TaskRequestDTO req) {
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
        dto.setCreatedDate(task.getCreatedDate());
        dto.setUpdatedDate(task.getUpdatedDate());
        dto.setDueDate(task.getDueDate());
        dto.setAssigneeId(task.getAssigneeId());
        if (task.getAssigneeId() != null) {
            User user = userRepository.findById(task.getAssigneeId())
                    .orElse(null);

            if (user != null) {
                dto.setAssigneeName(user.getNickname());
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
        dto.setCreatedDate(task.getCreatedDate());
        dto.setUpdatedDate(task.getUpdatedDate());
        dto.setDueDate(task.getDueDate());

        dto.setAssigneeId(task.getAssigneeId());
        dto.setAssigneeName(task.getAssigneeId()); // TODO: User 조회해서 채우기

        if (task.getAssigneeId() != null) {
            Long assigneeName = Long.valueOf(userRepository.findById(task.getAssigneeId())
                    .map(User::getNickname)
                    .orElse("알 수 없음"));
            dto.setAssigneeName(assigneeName);
        } else dto.setAssigneeName(Long.valueOf("미배정"));
        return dto;
    }
}

