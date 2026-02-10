package backend.scheduler;

import backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProjectCleanScheduler {
    private final ProjectRepository projectRepository;

    @Scheduled(cron = "0 0 3 * * *")
    public void cleanProjects(){
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        projectRepository.deleteExpiredSoftDeletedDate(thirtyDaysAgo);

        log.info("영구 삭제 작업 완료");
    }
}
