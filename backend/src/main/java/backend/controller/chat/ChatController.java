package backend.controller.chat;

import backend.dto.chat.ChatMessageResponseDTO;
import backend.dto.chat.SendChatMessageDTO;
import backend.global.response.ApiResponse;
import backend.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tasks/{taskId}/chat")
public class ChatController {

    private final ChatService chatService;

    // SSE Subscription Endpoint
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToChat(@PathVariable Long taskId, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        return chatService.subscribe(taskId, username);
    }

    // Get Chat History (Initial Load)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageResponseDTO>>> getChatHistory(@PathVariable Long taskId, @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        List<ChatMessageResponseDTO> history = chatService.getChatHistory(taskId, username);
        return ResponseEntity.ok(ApiResponse.response(history));
    }

    // Send New Message (Triggers SSE broadcast)
    @PostMapping
    public ResponseEntity<ApiResponse<ChatMessageResponseDTO>> sendMessage(
            @PathVariable Long taskId,
            @RequestBody SendChatMessageDTO requestDTO,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String username) {
        ChatMessageResponseDTO savedMessage = chatService.saveAndSendMessage(taskId, requestDTO, username);
        return ResponseEntity.ok(ApiResponse.response(savedMessage));
    }
}
