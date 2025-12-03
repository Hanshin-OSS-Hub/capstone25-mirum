package backend.domain.user.repositoty;

import backend.domain.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Boolean existsByUsername(String name);
    Optional<UserEntity> findByUsernameAndIsLockAndIsSocial(String username, Boolean isLock, Boolean isSocial);

    @Transactional
    void deleteByUsername(String username);

    Optional<UserEntity> findByUsernameAndIsLock(String username, Boolean isLock);
}
