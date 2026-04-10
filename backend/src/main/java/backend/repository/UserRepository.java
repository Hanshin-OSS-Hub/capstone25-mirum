package backend.repository;

import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Boolean existsByUsername(String name);
    Optional<User> findByUsernameAndIsLockAndIsSocial(String username, Boolean isLock, Boolean isSocial);

    @Transactional
    void deleteByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameAndIsLock(String username, Boolean isLock);
}
