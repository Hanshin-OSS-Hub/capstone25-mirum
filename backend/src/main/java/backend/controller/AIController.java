package backend.controller;

import backend.dto.LLM.AIAssistantRequestDTO;
import backend.dto.LLM.AIRequestDTO;
import backend.dto.LLM.AIReviewRequestDTO;
import backend.dto.LLM.AITaskSummaryRequestDTO;
import backend.global.response.ApiResponse;
import backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AIController {

    private final AIService aiService;

    // 메모 분석
    @PostMapping("/summary")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> askMemo(@RequestBody AITaskSummaryRequestDTO requestDTO) {
        return aiService.asyncTextSummary(requestDTO.getNotes())
                .thenApply(response -> {
                    if (response != null && !response.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.response(response));
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<String>exception("응답을 생성하지 못했습니다."));
                    }
                })
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>exception("AI 처리 중 오류가 발생했습니다: " + ex.getMessage())));
    }

    // 파일 분석
    @PostMapping("/analyze")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> analyzeFilesAsync(@RequestBody AIRequestDTO requestDTO, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        return aiService.asyncFileAnalyze(requestDTO, username)
                .thenApply(response -> {
                    if (response != null && !response.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.response(response));
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<String>exception("파일 분석 응답을 생성하지 못했습니다."));
                    }
                })
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>exception("파일 분석 중 오류가 발생했습니다: " + ex.getMessage())));
    }

    // AI 비서 질문
    @PostMapping("/assistant")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> assistantAsync(@RequestBody AIAssistantRequestDTO requestDTO, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        return aiService.asyncAssistant(requestDTO, username)
                .thenApply(response -> {
                    if (response != null && !response.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.response(response));
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<String>exception("응답을 생성하지 못했습니다."));
                    }
                })
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>exception("AI 비서 처리 중 오류가 발생했습니다: " + ex.getMessage())));
    }

    // 작업 리뷰
    @PostMapping("/review")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> reviewAsync(@RequestBody AIReviewRequestDTO requestDTO, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        return aiService.asyncReview(requestDTO, username)
                .thenApply(response -> {
                    if (response != null && !response.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.response(response));
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<String>exception("리뷰를 생성하지 못했습니다."));
                    }
                })
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>exception("AI 리뷰 처리 중 오류가 발생했습니다: " + ex.getMessage())));
    }

    // 프로젝트 리포트 생성
    @PostMapping("/report")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> reportAsync(@RequestBody backend.dto.LLM.AIProjectReportRequestDTO requestDTO, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        return aiService.asyncProjectReport(requestDTO.getProjectId(), username)
                .thenApply(response -> {
                    if (response != null && !response.isEmpty()) {
                        return ResponseEntity.ok(ApiResponse.response(response));
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.<String>exception("리포트를 생성하지 못했습니다."));
                    }
                })
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.<String>exception("AI 리포트 처리 중 오류가 발생했습니다: " + ex.getMessage())));
    }
}
