package backend.scheduler;

import backend.entity.S3File;
import backend.repository.S3FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PendingS3CleanScheduler {
    private final S3FileRepository s3FileRepository;
    private final S3Client s3Client;
    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanS3(){
        LocalDateTime thirtyMinuteAgo = LocalDateTime.now().minusMinutes(30);
        List<S3File> pendingFiles = s3FileRepository.findBySizeIsNullAndCreatedDateBefore(thirtyMinuteAgo);

        if (pendingFiles.isEmpty()) {
            log.info("[Scheduler] 정리할 좀비 파일이 없습니다.");
            return;
        }

        List<ObjectIdentifier> objectIdentifiers = pendingFiles.stream()
                .map(file -> ObjectIdentifier.builder().key(file.getUuid()).build())
                .toList();

        try {
            DeleteObjectsRequest deleteObjectsRequest = DeleteObjectsRequest.builder()
                    .bucket(bucketName)
                    .delete(Delete.builder().objects(objectIdentifiers).build())
                    .build();

            DeleteObjectsResponse response = s3Client.deleteObjects(deleteObjectsRequest);

            // 실패 시 로그
            if (response.hasErrors() && !response.errors().isEmpty()) {
                response.errors().forEach(error ->
                        log.error("[Scheduler] S3 파일 삭제 실패 - UUID: {}, 사유: {}", error.key(), error.message())
                );
            }

            Set<String> successfullyDeletedKeys = response.deleted().stream()
                    .map(DeletedObject::key)
                    .collect(Collectors.toSet());

            List<S3File> filesToDeleteFromDb = pendingFiles.stream()
                    .filter(file -> successfullyDeletedKeys.contains(file.getUuid()))
                    .toList();

            if (!filesToDeleteFromDb.isEmpty()) {
                s3FileRepository.deleteAllInBatch(filesToDeleteFromDb);
            }

            log.info("[Scheduler] 총 {}개의 미완료 S3 파일 정리 성공", filesToDeleteFromDb.size());

        } catch (Exception e) {
            log.error("[Scheduler] S3 다중 삭제 API 호출 자체 실패", e);
        }
    }
}
