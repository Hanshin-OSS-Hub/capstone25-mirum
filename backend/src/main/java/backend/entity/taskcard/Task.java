package backend.entity.taskcard;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "task")
@Getter
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskId;

    @Column(nullable = false)
    private Long boardId;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 30)
    private String status; // TODO, IN_PROGRESS, DONE, DELETED

    // tags를 "tag1,tag2" 문자열로 저장 (가장 단순)
    @Column(length = 1000)
    private String tagsCsv;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes; // 마크다운

    private Long assigneeId;

    private LocalDate createdAt;
    private LocalDate updatedAt;
    private LocalDate dueDate;

    protected Task() {}

    public Task(Long boardId, Long projectId, String title, String description, String status,
                String tagsCsv, String notes, Long assigneeId, LocalDate dueDate,
                LocalDate createdAt, LocalDate updatedAt) {
        this.boardId = boardId;
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.tagsCsv = tagsCsv;
        this.notes = notes;
        this.assigneeId = assigneeId;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }


    // ===== update methods =====
    public void updateBasic(String title, String description, String status, String tagsCsv, String notes,
                            Long assigneeId, LocalDate dueDate, LocalDate updatedAt) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (status != null) this.status = status;
        if (tagsCsv != null) this.tagsCsv = tagsCsv;
        if (notes != null) this.notes = notes;
        if (assigneeId != null) this.assigneeId = assigneeId;
        if (dueDate != null) this.dueDate = dueDate;

        this.updatedAt = updatedAt;
    }

    // tags 변환 헬퍼(원하면 Mapper로 빼도 됨)
    public static String toCsv(List<String> tags) {
        if (tags == null || tags.isEmpty()) return "";
        // 공백 제거 + 빈 문자열 제거
        List<String> cleaned = new ArrayList<>();
        for (String t : tags) {
            if (t == null) continue;
            String s = t.trim();
            if (!s.isEmpty()) cleaned.add(s);
        }
        return String.join(",", cleaned);
    }

    public static List<String> fromCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
