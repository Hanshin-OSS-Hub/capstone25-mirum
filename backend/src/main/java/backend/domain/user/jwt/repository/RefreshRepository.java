package backend.domain.user.jwt.repository;

import backend.domain.user.jwt.eneity.RefreshEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshRepository extends JpaRepository<RefreshEntity, Long> {
}
