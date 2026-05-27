package backend.dto.taskcard;

import backend.entity.taskcard.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class TaskSummaryDTO {
    // 작업 카드 기본 정보
    private Long taskId;          // 작업 카드 고유 ID
    private String title;         // 작업 카드 제목
    private String description;   // 작업 설명
    private TaskStatus status;        // TODO, IN_PROGRESS, DONE, DELETED
    private List<String> tags;    // "tag1,tag2" -> ["tag1", "tag2"]

    // 날짜 정보
    private LocalDateTime createdDate;  // 생성일
    private LocalDateTime updatedDate;  // 수정일
    private LocalDateTime dueDate;    // 마감일

    // 담당자 정보
    private String assigneeId; //담당자 id
    private String assigneeName; //담당자 name
}

