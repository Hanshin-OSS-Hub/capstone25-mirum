package backend.service;

import backend.dto.LLM.AIRequestDTO;
import backend.dto.LLM.GeminiDTO;
import backend.entity.S3File;
import backend.repository.S3FileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class AIService {

    private final ObjectMapper objectMapper;
    private final S3Client s3Client;
    private final S3FileRepository s3FileRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    // 테스크 분석
    @Async
    public CompletableFuture<String> asyncTextSummary(String prompt) {
        try {
            GeminiDTO.Part part = GeminiDTO.Part.ofText(prompt);
            GeminiDTO.Content content = new GeminiDTO.Content(List.of(part));
            GeminiDTO.Request request = new GeminiDTO.Request(List.of(content));

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }

    //파일 분석
    @Async
    public CompletableFuture<String> asyncFileAnalyze(AIRequestDTO requestDTO) {
        try {
            List<GeminiDTO.Part> parts = new ArrayList<>();
            parts.add(GeminiDTO.Part.ofText(requestDTO.getPrompt()));
            List<S3File> s3Files = s3FileRepository.findAllByUuidInAndIsDeletedFalse(requestDTO.getFileUuids());

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
            GeminiDTO.Request request = new GeminiDTO.Request(List.of(content));

            String response = callGeminiApi(request);
            return CompletableFuture.completedFuture(response);

        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
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

            GeminiDTO.Response geminiResponse = objectMapper.readValue(response.body(), GeminiDTO.Response.class);

            if (geminiResponse != null && geminiResponse.candidates() != null && !geminiResponse.candidates().isEmpty()) {
                return geminiResponse.candidates().get(0).content().parts().get(0).text();
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }
}