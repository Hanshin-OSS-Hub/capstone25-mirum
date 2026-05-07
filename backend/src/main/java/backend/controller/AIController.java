package backend.controller;

import backend.dto.LLM.AIRequestDTO;
import backend.global.response.ApiResponse;
import backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AIController {

    private final AIService aiService;

    // 테스크 분석
    @PostMapping("/summary")
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> askGeminiAsync(@RequestBody String prompt) {
        return aiService.asyncTextSummary(prompt)
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
    public CompletableFuture<ResponseEntity<ApiResponse<String>>> analyzeFilesAsync(@RequestBody AIRequestDTO requestDTO) { //[cite: 1]
        return aiService.asyncFileAnalyze(requestDTO)
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
}
