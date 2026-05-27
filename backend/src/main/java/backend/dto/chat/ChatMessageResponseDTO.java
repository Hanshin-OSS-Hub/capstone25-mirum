package backend.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDTO {
    private Long id;
    private String author;
    private String message;
    private LocalDateTime timestamp;
    private boolean isAi;
}
