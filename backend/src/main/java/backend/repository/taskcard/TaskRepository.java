package backend.repository.taskcard;

import backend.entity.taskcard.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface TaskRepository extends JpaRepository<Task, Long> {

    //Board 단위 작업 카드 조회
    Page<Task> findByBoardId(Long boardId, String excludedStatus, Pageable pageable);

}

