package backend.service;

import backend.dto.S3.*;
import backend.entity.Project.Project;
import backend.entity.Project.ProjectMember;
import backend.entity.Project.ProjectMemberRoleType;
import backend.entity.S3File;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.S3FileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class S3Service {
    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final S3FileRepository s3FileRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Transactional
    public UploadUrlResponseDTO getUploadUrl(UploadUrlRequestDTO request, String username) {
        List<String> urls = new ArrayList<>();
        List<String> uuids = new ArrayList<>();
        List<S3File> files = new ArrayList<>();
        Project project = projectRepository.findByIdAndIsDeletedFalse(request.getProjectId()).orElseThrow(EntityNotFoundException::new);

        request.getFilenames().forEach(f -> {
            // 1. 원본 파일명에서 확장자 추출 (.png, .jpg 등)
            String extension = "";
            int dotIndex = f.lastIndexOf(".");

            // 점(.)이 존재하고, 파일명 맨 앞이 아닌 경우에만 확장자 추출
            if (dotIndex > 0) {
                extension = f.substring(dotIndex);
            }

            // 중복 방지 위한 고유 id
            String uuid = UUID.randomUUID().toString() + extension;

            // AWS에서 제공하는 허가증
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uuid)
                    .build();

            //URL 발급 요청
            PutObjectPresignRequest putObjectPresignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(5))  // URL 유효시간 5분
                    .putObjectRequest(putObjectRequest)
                    .build();

            S3File s3File = S3File.builder()
                    .project(project)
                    .uuid(uuid)
                    .originalFilename(f)
                    .createdBy(username)
                    .isDeleted(false)
                    .build();

            files.add(s3File);

            urls.add(s3Presigner.presignPutObject(putObjectPresignRequest).url().toString());
            uuids.add(uuid);
        });

        s3FileRepository.saveAll(files);

        return UploadUrlResponseDTO.builder()
                .urls(urls)
                .uuids(uuids)
                .build();
    }

    public List<DownloadUrlResponseDTO> getDownloadUrl(List<String> uuids, String username) {
        List<S3File> s3File = s3FileRepository.findAllByUuidInAndIsDeletedFalse(uuids);
        if (s3File.isEmpty() || uuids.size() != s3File.size()) throw  new EntityNotFoundException();

        // 권한 체크: 모든 파일의 프로젝트에 대해 멤버인지 확인
        s3File.forEach(f -> {
            if (!projectMemberRepository.existsByProjectIdAndUserUsername(f.getProject().getId(), username)) {
                throw new AccessDeniedException("파일에 대한 접근 권한이 없습니다: " + f.getOriginalFilename());
            }
        });

        List<DownloadUrlResponseDTO> urls = new ArrayList<>();

        s3File.forEach(f -> {
            String filename = URLEncoder.encode(f.getOriginalFilename(), StandardCharsets.UTF_8)
                    .replaceAll("\\+", "%20");

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(f.getUuid())
                    .responseContentDisposition("attachment; filename=\"" + filename + "\"")
                    .build();
            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10))
                    .getObjectRequest(getObjectRequest)
                    .build();

            urls.add(DownloadUrlResponseDTO.builder()
                    .filename(f.getOriginalFilename())
                    .url(s3Presigner.presignGetObject(getObjectPresignRequest).url().toString())
                    .build());
        });


        return urls;
    }

    // C
    @Transactional
    public void uploadComplete(List<String> uuids, String username) {
        List<S3File> s3files =  s3FileRepository.findAllByUuidInAndIsDeletedFalse(uuids);
        
        // 권한 체크
        s3files.forEach(f -> {
            if (!projectMemberRepository.existsByProjectIdAndUserUsername(f.getProject().getId(), username)) {
                throw new AccessDeniedException("파일 업로드 권한이 없습니다.");
            }
        });

        s3files.forEach(f -> {
            try {
                HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                        .bucket(bucketName)
                        .key(f.getUuid())
                        .build();
                HeadObjectResponse metadata = s3Client.headObject(headObjectRequest);

                f.setMetadata(metadata.contentLength(), metadata.contentType());
            } catch (Exception e) {
                log.error("업로드 완료 처리 중 에러 발생 : {} 파일에서 에러발생",  f.getUuid());
            }
        });

    }

    // R
    // 프로젝트에 속한 모든 파일 반환
    public List<S3InfoResponseDTO> getAllFilesInProject(Long projectId, String username) {
        if (!projectMemberRepository.existsByProjectIdAndUserUsername(projectId, username)) {
            throw new AccessDeniedException("해당 프로젝트에 접근 권한이 없습니다.");
        }
        List<S3File> s3Files = s3FileRepository.findAllFilesInProject(projectId);

        return s3Files.stream().map(s -> S3InfoResponseDTO.builder()
                .uuid(s.getUuid())
                .originalFilename(s.getOriginalFilename())
                .size(s.getSize())
                .contentType(s.getContentType())
                .createdDate(s.getCreatedDate())
                .createdBy(s.getCreatedBy())
                .isDeleted(s.isDeleted())
                        //task id 넣을 것
                .build()).toList();
    }

    public List<DeletedFilesDTO> getDeletedFiles(Long projectId, String username) {
        if (!projectMemberRepository.existsByProjectIdAndUserUsername(projectId, username)) {
            throw new AccessDeniedException("해당 프로젝트에 접근 권한이 없습니다.");
        }
        List<S3File> s3Files = s3FileRepository.findAllByProjectIdAndIsDeletedTrue(projectId);

        return s3Files.stream().map(s -> DeletedFilesDTO.builder()
                .uuid(s.getUuid())
                .originalFilename(s.getOriginalFilename())
                .size(s.getSize())
                .deletedDate(s.getDeletedDate())
                .contentType(s.getContentType())
                .createdBy(s.getCreatedBy())
                .build()).toList();
    }

    // 테스크에 속한 모든 파일 가져오기
    // task 구현 완료 후 수정

    // 휴지통
    @Transactional
    public Map<String, String> softDelete(DeleteDTO files, String username) {
        Map<String, String> response = new HashMap<>();

        List<S3File> s3Files = s3FileRepository.findAllByUuidInAndIsDeletedFalse(files.getUuid());
        List<String> leaders = projectMemberRepository.findLeader(files.getProjectId(), ProjectMemberRoleType.LEADER);

        s3Files.forEach(f -> {
            if (leaders.contains(username) || f.getCreatedBy().equals(username)) {
                f.deleteFile();
                response.put(f.getOriginalFilename(), "삭제 성공");
            } else response.put(f.getOriginalFilename(), "권한 없음");
        });

        if (files.getUuid().size() != s3Files.size()) {
            String a = (files.getUuid().size() - s3Files.size()) + "개의 파일";
            response.put(a, "존재하지 않는 파일");
        }

        return response;
    }

    // 진짜 삭제
    @Transactional
    public Map<String, String> realDelete(DeleteDTO files, String username) {
        Map<String, String> response = new HashMap<>();

        List<S3File> s3Files = s3FileRepository.findAllByUuidInAndIsDeletedTrue(files.getUuid());
        List<String> leaders = projectMemberRepository.findLeader(files.getProjectId(), ProjectMemberRoleType.LEADER);
        List<S3File> delete = new ArrayList<>();

        s3Files.forEach(f -> {
            if (leaders.contains(username) || f.getCreatedBy().equals(username)) {
                DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(f.getUuid())
                        .build();
                s3Client.deleteObject(deleteRequest);

                delete.add(f);
                response.put(f.getOriginalFilename(), "삭제 성공");
            } else response.put(f.getOriginalFilename(), "권한 없음");
        });
        s3FileRepository.deleteAll(delete);

        if (files.getUuid().size() != s3Files.size()) {
            String a = (files.getUuid().size() - s3Files.size()) + "개의 파일";
            response.put(a, "존재하지 않는 파일");
        }

        return response;
    }

    @Transactional
    public Map<String, String> restoreFiles(List<String> uuids, String username) {
        Map<String, String> response = new HashMap<>();

        List<S3File> s3Files = s3FileRepository.findAllByUuidInAndIsDeletedTrue(uuids);
        if (s3Files.isEmpty()) {
            response.put("error", "존재하지 않는 파일");
            return response;
        }

        Long projectId = s3Files.get(0).getProject().getId();
        List<String> leaders = projectMemberRepository.findLeader(projectId, ProjectMemberRoleType.LEADER);

        s3Files.forEach(f -> {
            if (leaders.contains(username) || f.getCreatedBy().equals(username)) {
                f.restoreFile();
                response.put(f.getOriginalFilename(), "복구 성공");
            } else response.put(f.getOriginalFilename(), "권한 없음");
        });

        if (uuids.size() != s3Files.size()) {
            String a = (uuids.size() - s3Files.size()) + "개의 파일";
            response.put(a, "존재하지 않는 파일");
        }

        return response;
    }

    private Boolean isNotCreatorOrLeader(S3File s3File, String username, Long projectId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUsername(projectId, username).orElseThrow(() -> new AccessDeniedException("해당 프로젝트의 맴버가 아닙니다."));
        return !s3File.getCreatedBy().equals(username) && !member.getRole().equals(ProjectMemberRoleType.LEADER);
    }
}
