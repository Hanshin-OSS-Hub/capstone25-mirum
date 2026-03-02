package backend.dto.taskcard;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TaskRequestDTO {
    // 외래키
    private Long boardId;
    private Long projectId;     // 검증용

    // 작업 카드 기본 정보
    private Long taskId;         // 작업 카드 고유 ID
    private String title;        // 작업 카드 제목
    private String description;  // 작업 설명
    private String status;       // TODO, IN_PROGRESS, DONE, DELETED
    private List<String> tags;   // "tag1,tag2" -> ["tag1", "tag2"]
    private String notes;        // 마크다운 전체 내용

    private Long assigneeId;     // 담당자 지정
    private LocalDate dueDate;
}

