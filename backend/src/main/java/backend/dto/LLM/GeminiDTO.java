package backend.dto.LLM;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class GeminiDTO {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Request(
            Content system_instruction,
            List<Content> contents,
            GenerationConfig generationConfig
    ) {}

    public record Content(List<Part> parts) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Part(String text, InlineData inlineData) {
        public static Part ofText(String text) {
            return new Part(text, null);
        }
        public static Part ofFile(String mimeType, String base64Data) {
            return new Part(null, new InlineData(mimeType, base64Data));
        }
    }

    public record InlineData(String mimeType, String data) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GenerationConfig(
            Double temperature,
            Integer maxOutputTokens
    ) {}

    public record Response(List<Candidate> candidates) {}
    public record Candidate(Content content) {}
}
