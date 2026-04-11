package backend.scheduler;


import backend.entity.taskcard.TaskStatus;
import backend.repository.ProjectRepository;
import backend.repository.taskcard.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class TaskCleanScheduler {
    private final TaskRepository taskRepository;

    @Scheduled(cron = "0 0 3 * * *")
    public void cleanTasks() {
        LocalDate threeDaysAgo = LocalDate.now().minusDays(3);
        taskRepository.deleteByStatusAndUpdatedAtBefore(TaskStatus.DELETED, threeDaysAgo);
        log.info("영구 삭제 작업 완료");
    }
}

