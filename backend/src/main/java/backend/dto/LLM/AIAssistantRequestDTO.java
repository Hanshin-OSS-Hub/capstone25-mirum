package backend.dto.LLM;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.extern.jackson.Jacksonized;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Jacksonized
public class AIAssistantRequestDTO {
    private Long projectId;
    private Long taskId; // Optional: context for a specific task
    private String question;
}
