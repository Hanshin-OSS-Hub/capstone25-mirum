package backend.repository.chat;

import backend.entity.chat.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    List<ChatMessage> findByTaskTaskIdOrderByTimestampAsc(Long taskId);

    @Modifying
    @Query("DELETE FROM ChatMessage c WHERE c.task.taskId IN (SELECT t.taskId FROM Task t WHERE t.projectId = :projectId)")
    void deleteAllByProjectId(@Param("projectId") Long projectId);
}
