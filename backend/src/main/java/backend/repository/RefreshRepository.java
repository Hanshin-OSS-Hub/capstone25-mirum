package backend.repository;

import backend.entity.Refresh;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface RefreshRepository extends JpaRepository<Refresh, Long> {
    //JWT  Refresh토큰 기반 존재 확인
    Boolean existsByRefresh(String refreshToken);

    @Transactional
    void deleteByRefresh(String refresh);

    @Transactional
    void deleteByUsername(String username);

    // 특정일 지난 refresh 토큰 삭제
    @Transactional
    void deleteByCreateDateBefore(LocalDateTime createdDate);


}
