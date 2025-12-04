package backend.domain.user.entity;
import backend.domain.user.dto.UserRequestDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Entity
@EntityListeners(AuditingEntityListener.class) //변경시 자동 업데이트
@Table(name = "user_user_entity")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false, updatable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "is_lock", nullable = false)
    //계정밴 여부
    private Boolean isLock;

    @Column(name = "is_social", nullable = false)
    //소셜로그인 or 자체로그인 설정
    private Boolean isSocial;

    @Enumerated(EnumType.STRING)
    @Column(name = "social_provider_type")
    //소셜 로그인 종류(naver, google...)
    private SocialProviderType socialProviderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false)
    //admin? or user?
    private UserRoleType roleType;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "email")
    private String email;

    @CreatedDate
    @Column(name = "created_date", updatable = false)
    //계정 생성일
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "updated_date")
    //최종 수정일
    private LocalDateTime updatedDate;

    public void updateUser(UserRequestDTO dto) {
        //Setter는 최대한 지양
        this.email = dto.getEmail();
        this.nickname = dto.getNickname();
    }

}
