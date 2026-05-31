package backend.service.chat;

import backend.dto.chat.ChatMessageResponseDTO;
import backend.dto.chat.SendChatMessageDTO;
import backend.entity.chat.ChatMessage;
import backend.repository.chat.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final backend.repository.taskcard.TaskRepository taskRepository;
    private final backend.repository.ProjectMemberRepository projectMemberRepository;
    private final backend.repository.UserRepository userRepository;
    
    // taskId -> List of SseEmitters
    private final Map<Long, List<SseEmitter>> taskEmitters = new ConcurrentHashMap<>();

    private void validateTaskAccess(Long taskId, String username) {
        backend.entity.taskcard.Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Task not found"));
        if (!projectMemberRepository.existsByProjectIdAndUserUsername(task.getProjectId(), username)) {
            throw new org.springframework.security.access.AccessDeniedException("해당 태스크의 채팅에 접근 권한이 없습니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getChatHistory(Long taskId, String username) {
        validateTaskAccess(taskId, username);
        return chatMessageRepository.findByTaskIdOrderByTimestampAsc(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponseDTO saveAndSendMessage(Long taskId, SendChatMessageDTO dto, String username) {
        validateTaskAccess(taskId, username);
        
        backend.entity.User user = null;
        String authorName = dto.getAuthor();
        
        if (!dto.isAi()) {
            user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
            authorName = (user.getNickname() != null && !user.getNickname().isEmpty()) ? user.getNickname() : user.getUsername();
        }

        ChatMessage message = ChatMessage.builder()
                .taskId(taskId)
                .user(user)
                .author(authorName)
                .message(dto.getMessage())
                .isAi(dto.isAi())
                .build();
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        ChatMessageResponseDTO responseDTO = convertToDTO(savedMessage);

        broadcastMessage(taskId, responseDTO);

        return responseDTO;
    }

    public SseEmitter subscribe(Long taskId, String username) {
        validateTaskAccess(taskId, username);
        SseEmitter emitter = new SseEmitter(60 * 1000 * 30L); // 30 minutes timeout
        
        taskEmitters.computeIfAbsent(taskId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(taskId, emitter));
        emitter.onTimeout(() -> removeEmitter(taskId, emitter));
        emitter.onError(e -> removeEmitter(taskId, emitter));

        try {
            // Send initial dummy event to establish connection
            emitter.send(SseEmitter.event().name("init").data("Connected to Task " + taskId));
        } catch (IOException e) {
            removeEmitter(taskId, emitter);
        }

        return emitter;
    }

    private void broadcastMessage(Long taskId, ChatMessageResponseDTO message) {
        List<SseEmitter> emitters = taskEmitters.getOrDefault(taskId, new CopyOnWriteArrayList<>());
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("message").data(message));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        
        emitters.removeAll(deadEmitters);
    }

    private void removeEmitter(Long taskId, SseEmitter emitter) {
        List<SseEmitter> emitters = taskEmitters.get(taskId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                taskEmitters.remove(taskId);
            }
        }
    }

    private ChatMessageResponseDTO convertToDTO(ChatMessage message) {
        String nickname = message.getAuthor();
        if (message.getUser() != null) {
            nickname = (message.getUser().getNickname() != null && !message.getUser().getNickname().isEmpty()) 
                    ? message.getUser().getNickname() 
                    : message.getUser().getUsername();
        }

        return ChatMessageResponseDTO.builder()
                .id(message.getId())
                .author(nickname)
                .message(message.getMessage())
                .timestamp(message.getTimestamp())
                .isAi(message.isAi())
                .build();
    }
}
