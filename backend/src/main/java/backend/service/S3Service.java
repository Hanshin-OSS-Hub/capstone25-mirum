package backend.service;

import backend.dto.S3.S3InfoResponseDTO;
import backend.dto.S3.S3UrlResponseDTO;
import backend.entity.Project.ProjectMember;
import backend.entity.Project.ProjectMemberRoleType;
import backend.entity.S3File;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.S3FileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class S3Service {
    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final S3FileRepository s3FileRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Transactional
    public S3UrlResponseDTO getUploadUrl(String filename, String username,  Long projectId) {
        // 중복 방지 위한 고유 id
        String uuid = UUID.randomUUID().toString();

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
                .project(projectRepository.findByIdAndIsDeletedFalse(projectId).orElseThrow(EntityNotFoundException::new))
                .uuid(uuid)
                .originalFilename(filename)
                .createdBy(username)
                .isDeleted(false)
                .build();

        s3FileRepository.save(s3File);

        return S3UrlResponseDTO.builder()
                .url(s3Presigner.presignPutObject(putObjectPresignRequest).url().toString())
                .filename(uuid)
                .build();
    }

    public String getDownloadUrl(String uuid) {
        S3File s3File = s3FileRepository.findByUuidAndIsDeletedFalse(uuid).orElseThrow(EntityNotFoundException::new);
        String filename = URLEncoder.encode(s3File.getOriginalFilename(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(uuid)
                .responseContentDisposition("attachment; filename=\"" + filename + "\"")
                .build();
        GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(getObjectRequest)
                .build();
        return s3Presigner.presignGetObject(getObjectPresignRequest).url().toString();
    }

    // C
    @Transactional
    public void uploadComplete(String uuid) {
        HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(uuid)
                .build();
        HeadObjectResponse metadata = s3Client.headObject(headObjectRequest);

        S3File s3File = s3FileRepository.findByUuidAndIsDeletedFalse(uuid).orElseThrow(EntityNotFoundException::new);
        s3File.setMetadata(metadata.contentLength(), metadata.contentType());
    }

    // R
    // 프로젝트에 속한 모든 파일 반환
    public List<S3InfoResponseDTO> getAllFilesInProject(Long projectId) {
        List<S3File> s3Files = s3FileRepository.findAllFilesInProject(projectId);

        return s3Files.stream().map(s -> S3InfoResponseDTO.builder()
                        .uuid(s.getUuid())
                        .originalFilename(s.getOriginalFilename())
                        .size(s.getSize())
                        .contentType(s.getContentType())
                        .createdDate(s.getCreatedDate())
                        .createdBy(s.getCreatedBy())
                        .build()).toList();
    }

    // 테스크에 속한 모든 파일 가져오기
    // task 구현 완료 후 수정

    // 휴지통
    @Transactional
    public void softDelete(String uuid, String username, Long projectId) {
        S3File s3File = s3FileRepository.findByUuidAndIsDeletedFalse(uuid).orElseThrow(EntityNotFoundException::new);
        if (isNotCreatorOrLeader(s3File, username, projectId)) throw new AccessDeniedException("권한이 없습니다.");

        s3File.deleteFile();
    }

    // 진짜 삭제
    @Transactional
    public void realDelete(String uuid, String username, Long projectId) {
        S3File s3File = s3FileRepository.findByUuidAndIsDeletedTrue(uuid).orElseThrow(EntityNotFoundException::new);
        if (isNotCreatorOrLeader(s3File, username, projectId)) throw new AccessDeniedException("권한이 없습니다.");

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(uuid)
                .build();
        s3Client.deleteObject(deleteRequest);

        s3FileRepository.delete(s3File);
    }

    private Boolean isNotCreatorOrLeader(S3File s3File, String username, Long projectId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUsername(projectId, username).orElseThrow(EntityNotFoundException::new);
        return !s3File.getCreatedBy().equals(username) && !member.getRole().equals(ProjectMemberRoleType.LEADER);
    }
}
