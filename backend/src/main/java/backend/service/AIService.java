package backend.service;

import backend.dto.LLM.AIAssistantRequestDTO;
import backend.dto.LLM.AIReviewRequestDTO;
import backend.dto.LLM.AIRequestDTO;
import backend.dto.LLM.GeminiDTO;
import backend.entity.Project.Project;
import backend.entity.Project.ProjectMember;
import backend.entity.S3File;
import backend.entity.taskcard.Task;
import backend.entity.taskcard.TaskStatus;
import backend.repository.ProjectMemberRepository;
import backend.repository.ProjectRepository;
import backend.repository.S3FileRepository;
import backend.repository.taskcard.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final ObjectMapper objectMapper;
    private final S3Client s3Client;
    private final S3FileRepository s3FileRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    private static final String TEXT_SUMMARY_PROMPT = "다음 작업 메모를 핵심 위주로 깔끔하게 요약해줘. 마크다운 형식을 사용해.\n\n내용:\n";

    private static final String ASSISTANT_SYSTEM_INSTRUCTION = String.join("\n",
            "너는 미룸(MIRUM) 프로젝트 관리 비서다.",
            "반드시 제공된 프로젝트 정보만 기반으로 답해라.",
            "정보가 없으면 추측하지 말고 \"현재 프로젝트 데이터만으로는 확인할 수 없습니다.\" 라고 답해라.",
            "답변은 짧고 명확한 한국어로 해라.",
            "가능하면 날짜, 개수, 남은 일수 등을 함께 정리해라."
    );

    private static final String REVIEW_SYSTEM_INSTRUCTION = String.join("\n",
            "너는 프로젝트 동료 리뷰어다.",
            "문제점과 개선점을 분석해라.",
            "결과는 bullet point 형태로 작성해라.",
            "너무 길지 않게 작성해라.",
            "마지막에는 반드시 긍정적인 한 줄을 포함해라.",
            "답변은 한국어로 작성해라."
    );

    private static final String REPORT_SYSTEM_INSTRUCTION = String.join("\n",
            "너는 프로젝트 관리 전문가이자 데이터 분석가다.",
            "주어진 프로젝트 데이터(프로젝트 정보, 작업 현황, 멤버 등)를 바탕으로 종합적인 건강도 및 현황 리포트를 작성해라.",
            "리포트는 마크다운 형식으로 작성하고, 다음 항목들을 포함해라:",
            "1. 프로젝트 건강도 요약 (상태 아이콘 포함)",
            "2. 작업 진행 현황 분석",
            "3. 주요 이슈 및 권고사항",
            "문체는 전문적이고 명확한 한국어로 작성해라."
    );

    // 테스크 분석
    @Async
    public CompletableFuture<String> asyncTextSummary(String notes) {
        try {
            GeminiDTO.Part part = GeminiDTO.Part.ofText(TEXT_SUMMARY_PROMPT + notes);
            GeminiDTO.Content content = new GeminiDTO.Content(List.of(part));
            GeminiDTO.Request request = new GeminiDTO.Request(null, List.of(content), null);

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            log.error("AI 요약 분석 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("AI 텍스트 요약 실패", e));
        }
    }

    //파일 분석
    @Async
    public CompletableFuture<String> asyncFileAnalyze(AIRequestDTO requestDTO, String username) {
        try {
            List<GeminiDTO.Part> parts = new ArrayList<>();
            parts.add(GeminiDTO.Part.ofText(requestDTO.getPrompt()));
            List<S3File> s3Files = s3FileRepository.findAllByUuidInAndIsDeletedFalse(requestDTO.getFileUuids());

            // 권한 체크: 모든 파일의 프로젝트에 대해 멤버인지 확인
            for (S3File f : s3Files) {
                if (!projectMemberRepository.existsByProjectIdAndUserUsername(f.getProject().getId(), username)) {
                    throw new org.springframework.security.access.AccessDeniedException("파일에 대한 접근 권한이 없습니다: " + f.getOriginalFilename());
                }
            }

            for (S3File s3File : s3Files) {
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3File.getUuid())
                        .build();

                byte[] fileBytes = s3Client.getObjectAsBytes(getObjectRequest).asByteArray();
                String base64Data = Base64.getEncoder().encodeToString(fileBytes);

                parts.add(GeminiDTO.Part.ofFile(s3File.getContentType(), base64Data));
            }

            GeminiDTO.Content content = new GeminiDTO.Content(parts);
            GeminiDTO.Request request = new GeminiDTO.Request(null, List.of(content), null);

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);

        } catch (Exception e) {
            log.error("AI 파일 분석 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("AI 파일 분석 실패", e));
        }
    }

    // AI 비서 기능 (프로젝트 기반 Q&A)
    @Async
    public CompletableFuture<String> asyncAssistant(AIAssistantRequestDTO dto, String username) {
        try {
            if (!projectMemberRepository.existsByProjectIdAndUserUsername(dto.getProjectId(), username)) {
                throw new org.springframework.security.access.AccessDeniedException("해당 프로젝트에 접근 권한이 없습니다.");
            }
            Project project = projectRepository.findByIdAndIsDeletedFalse(dto.getProjectId())
                    .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

            List<Task> tasks = taskRepository.findAllByProjectIdAndStatusNot(dto.getProjectId(), TaskStatus.DELETED);
            List<ProjectMember> members = projectMemberRepository.findAllByProjectId(dto.getProjectId());

            Map<String, Object> projectContext = new HashMap<>();
            projectContext.put("projectName", project.getProjectName());
            projectContext.put("description", project.getDescription());
            projectContext.put("memberCount", members.size());
            projectContext.put("members", members.stream().map(m -> m.getUser().getNickname()).toList());

            Map<String, Object> summary = new HashMap<>();
            summary.put("total", tasks.size());
            summary.put("completed", tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count());
            summary.put("todo", tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count());
            summary.put("inProgress", tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count());
            projectContext.put("summary", summary);

            projectContext.put("tasks", tasks.stream().map(t -> {
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("title", t.getTitle());
                taskMap.put("status", t.getStatus());
                taskMap.put("assignee", t.getAssigneeName());
                return taskMap;
            }).toList());

            GeminiDTO.Content systemInstruction = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(ASSISTANT_SYSTEM_INSTRUCTION)));

            String userMessage = String.join("\n",
                    "질문: " + dto.getQuestion(),
                    "",
                    "현재 프로젝트 데이터(JSON):",
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(projectContext)
            );

            GeminiDTO.Content userContent = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(userMessage)));

            GeminiDTO.Request request = new GeminiDTO.Request(
                    systemInstruction,
                    List.of(userContent),
                    new GeminiDTO.GenerationConfig(0.2, 1024)
            );

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            log.error("AI 비서 호출 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("AI 비서 응답 실패", e));
        }
    }

    // 작업 리뷰 기능
    @Async
    public CompletableFuture<String> asyncReview(AIReviewRequestDTO dto, String username) {
        try {
            if (!projectMemberRepository.existsByProjectIdAndUserUsername(dto.getProjectId(), username)) {
                throw new org.springframework.security.access.AccessDeniedException("해당 프로젝트에 접근 권한이 없습니다.");
            }
            Task task = taskRepository.findByProjectIdAndTaskIdAndStatusNot(dto.getProjectId(), dto.getTaskId(), TaskStatus.DELETED)
                    .orElseThrow(() -> new EntityNotFoundException("작업을 찾을 수 없습니다."));

            Map<String, Object> safeTask = new HashMap<>();
            safeTask.put("title", task.getTitle());
            safeTask.put("description", task.getDescription());
            safeTask.put("notes", task.getNotes());
            safeTask.put("assignee", task.getAssigneeName());
            safeTask.put("status", task.getStatus());
            safeTask.put("dueDate", task.getDueDate());
            safeTask.put("tags", Task.fromCsv(task.getTagsCsv()));

            GeminiDTO.Content systemInstruction = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(REVIEW_SYSTEM_INSTRUCTION)));

            String userMessage = String.join("\n",
                    "다음 Task를 동료 관점에서 리뷰해줘.",
                    "반드시 간결한 bullet point로 작성해줘.",
                    "",
                    "Task 데이터(JSON):",
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(safeTask)
            );

            GeminiDTO.Content userContent = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(userMessage)));

            GeminiDTO.Request request = new GeminiDTO.Request(
                    systemInstruction,
                    List.of(userContent),
                    new GeminiDTO.GenerationConfig(0.3, 1024)
            );

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            log.error("AI 작업 리뷰 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("AI 작업 리뷰 실패", e));
        }
    }

    // 프로젝트 리포트 생성
    @Async
    public CompletableFuture<String> asyncProjectReport(Long projectId, String username) {
        try {
            if (!projectMemberRepository.existsByProjectIdAndUserUsername(projectId, username)) {
                throw new org.springframework.security.access.AccessDeniedException("해당 프로젝트에 접근 권한이 없습니다.");
            }
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다."));

            List<Task> tasks = taskRepository.findAllByProjectIdAndStatusNot(projectId, TaskStatus.DELETED);
            List<ProjectMember> members = projectMemberRepository.findAllByProjectId(projectId);

            Map<String, Object> projectData = new HashMap<>();
            projectData.put("title", project.getProjectName());
            projectData.put("description", project.getDescription());
            projectData.put("startDate", project.getCreatedDate());
            
            Map<String, Long> taskStatusCounts = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
            projectData.put("taskStatusCounts", taskStatusCounts);
            projectData.put("totalTasks", tasks.size());
            projectData.put("totalMembers", members.size());

            GeminiDTO.Content systemInstruction = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(REPORT_SYSTEM_INSTRUCTION)));

            String userMessage = String.join("\n",
                    "다음 프로젝트 데이터를 분석해서 종합 리포트를 작성해줘.",
                    "",
                    "프로젝트 데이터(JSON):",
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(projectData)
            );

            GeminiDTO.Content userContent = new GeminiDTO.Content(List.of(GeminiDTO.Part.ofText(userMessage)));

            GeminiDTO.Request request = new GeminiDTO.Request(
                    systemInstruction,
                    List.of(userContent),
                    new GeminiDTO.GenerationConfig(0.3, 2048)
            );

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            log.error("AI 프로젝트 리포트 생성 중 오류 발생: {}", e.getMessage(), e);
            return CompletableFuture.failedFuture(new RuntimeException("AI 프로젝트 리포트 생성 실패", e));
        }
    }

    private String callGeminiApi(GeminiDTO.Request requestBody) {
        try {
            String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey;

            String jsonBody = objectMapper.writeValueAsString(requestBody);

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(urlWithKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() >= 400) {
                 throw new IllegalArgumentException("Gemini API Error: " + response.statusCode() + " - " + response.body());
            }

            GeminiDTO.Response geminiResponse = objectMapper.readValue(response.body(), GeminiDTO.Response.class);

            if (geminiResponse != null && geminiResponse.candidates() != null && !geminiResponse.candidates().isEmpty()) {
                return geminiResponse.candidates().get(0).content().parts().get(0).text();
            }

            throw new IllegalStateException("Gemini API 응답이 비어있습니다.");

        } catch (Exception e) {
            throw new RuntimeException("Gemini API 호출 오류: " + e.getMessage(), e);
        }
    }
}