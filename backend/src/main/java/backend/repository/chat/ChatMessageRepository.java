package backend.repository.chat;

import backend.entity.chat.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    List<ChatMessage> findByTaskIdOrderByTimestampAsc(Long taskId);
}
