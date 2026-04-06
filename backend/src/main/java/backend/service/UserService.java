package backend.service;

import backend.dto.user.CustomOAuth2User;
import backend.dto.user.UserRequestDTO;
import backend.dto.user.UserResponseDTO;
import backend.entity.SocialProviderType;
import backend.entity.User;
import backend.entity.UserRoleType;
import backend.security.JWT.JwtService;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService extends DefaultOAuth2UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    //자체 로그인 회원 가입 (존재 여부)
    @Transactional(readOnly = true)
    public Boolean existUser(UserRequestDTO dto) {
        return userRepository.existsByUsername(dto.getUsername());
    }

    // 자체 로그인 회원 가입, (email, id, ps) 받을 예정
    @Transactional
    public Long addUser(UserRequestDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("이미 유저가 존재합니다");
        }

        User entity = User.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .isLock(false)
                .isSocial(false)
                .roleType(UserRoleType.USER) // 우선 일반 유저로 가입
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .build();

        return userRepository.save(entity).getId();

    }

    // 자체 로그인
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User entity = userRepository.findByUsernameAndIsLockAndIsSocial(username, false, false)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(entity.getUsername())
                .password(entity.getPassword())
                .roles(entity.getRoleType().name())
                .accountLocked(entity.getIsLock())
                .build();
    }

    // 자체 로그인 회원 정보 수정
    public Long updateUser(UserRequestDTO dto) throws AccessDeniedException {

        //본인만 수정 가능 검증
        String sessionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!sessionUsername.equals(dto.getUsername())) {
            throw new AccessDeniedException("본인 계정만 수정 가능");
        }

        //조회
        User entity = userRepository.findByUsernameAndIsLockAndIsSocial(dto.getUsername(), false, false)
                .orElseThrow(() -> new UsernameNotFoundException(dto.getUsername()));

        //회원 정보 수정
        entity.updateUser(dto);

        return userRepository.save(entity).getId();
    }

    // 자체/소셜 로그인 회원 탈퇴
    @Transactional
    public void deleteUser(UserRequestDTO dto) throws AccessDeniedException {

        // 본인 및 어드민만 삭제 가능 검증
        SecurityContext context = SecurityContextHolder.getContext();
        String sessionUsername = context.getAuthentication().getName();
        String sessionRole = context.getAuthentication().getAuthorities().iterator().next().getAuthority();

        boolean isOwner = sessionUsername.equals(dto.getUsername());
        boolean isAdmin = sessionRole.equals("ROLE_"+UserRoleType.ADMIN.name());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("본인 혹은 관리자만 삭제할 수 있습니다.");
        }

        // 유저 제거
        userRepository.deleteByUsername(dto.getUsername());

        // Refresh 토큰 제거
        jwtService.removeRefreshUser(dto.getUsername());
    }


    // 소셜 로그인 (매 로그인시 : 신규 = 가입, 기존 = 업데이트)
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//
//        // 부모 메소드 호출
//        OAuth2User oAuth2User = super.loadUser(userRequest);
//
//        // 데이터
//        Map<String, Object> attributes;
//        List<GrantedAuthority> authorities;
//
//        String username;
//        String role = UserRoleType.USER.name();
//        String email;
//        String nickname;
//
//        // provider 제공자별 데이터 획득
//        String registrationId = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
//        if (registrationId.equals(SocialProviderType.KAKAO.name())) {
//
//            attributes = (Map<String, Object>) oAuth2User.getAttributes().get("response");
//            username = registrationId + "_" + attributes.get("id");
//            email = attributes.get("email").toString();
//            nickname = attributes.get("nickname").toString();
//
//        } else if (registrationId.equals(SocialProviderType.GOOGLE.name())) {
//
//            attributes = (Map<String, Object>) oAuth2User.getAttributes();
//            username = registrationId + "_" + attributes.get("sub");
//            email = attributes.get("email").toString();
//            nickname = attributes.get("name").toString();
//
//        } else {
//            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인입니다.");
//        }
//
//        // 데이터베이스 조회 -> 존재하면 업데이트, 없으면 신규 가입
//        Optional<UserEntity> entity = userRepository.findByUsernameAndIsSocial(username, true);
//        if (entity.isPresent()) {
//            // role 조회
//            role = entity.get().getRoleType().name();
//
//            // 기존 유저 업데이트
//            UserRequestDTO dto = new UserRequestDTO();
//            dto.setNickname(nickname);
//            dto.setEmail(email);
//            entity.get().updateUser(dto);
//
//            userRepository.save(entity.get());
//        } else {
//            // 신규 유저 추가
//            UserEntity newUserEntity = UserEntity.builder()
//                    .username(username)
//                    .password("")
//                    .isLock(false)
//                    .isSocial(true)
//                    .socialProviderType(SocialProviderType.valueOf(registrationId))
//                    .roleType(UserRoleType.USER)
//                    .nickname(nickname)
//                    .email(email)
//                    .build();
//
//            userRepository.save(newUserEntity);
//        }
//
//        authorities = List.of(new SimpleGrantedAuthority(role));
//
//        return new CustomOAuth2User(attributes, authorities, username);
//    }
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        Map<String, Object> attributes = oAuth2User.getAttributes();
        List<GrantedAuthority> authorities;

        String username;
        String role = UserRoleType.USER.name();
        String email = null;
        String nickname = null;

        String registrationId = userRequest.getClientRegistration()
                .getRegistrationId()
                .toUpperCase();

        if (registrationId.equals(SocialProviderType.KAKAO.name())) {

            // 최상위 attributes
            Object idObj = attributes.get("id");
            if (idObj == null) {
                throw new OAuth2AuthenticationException("카카오 사용자 식별값(id)이 없습니다.");
            }

            username = registrationId + "_" + idObj.toString();

            // kakao_account
            Map<String, Object> kakaoAccount = castToMap(attributes.get("kakao_account"));

            if (kakaoAccount != null) {
                Object emailObj = kakaoAccount.get("email");
                if (emailObj != null) {
                    email = emailObj.toString();
                }

                Map<String, Object> profile = castToMap(kakaoAccount.get("profile"));
                if (profile != null) {
                    Object nicknameObj = profile.get("nickname");
                    if (nicknameObj != null) {
                        nickname = nicknameObj.toString();
                    }
                }
            }

        } else if (registrationId.equals(SocialProviderType.GOOGLE.name())) {

            username = registrationId + "_" + String.valueOf(attributes.get("sub"));

            Object emailObj = attributes.get("email");
            if (emailObj != null) {
                email = emailObj.toString();
            }

            Object nameObj = attributes.get("name");
            if (nameObj != null) {
                nickname = nameObj.toString();
            }

        } else {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인입니다.");
        }

        Optional<User> entity = userRepository.findByUsernameAndIsSocial(username, true);

        if (entity.isPresent()) {
            role = entity.get().getRoleType().name();

            UserRequestDTO dto = new UserRequestDTO();
            dto.setNickname(nickname);
            dto.setEmail(email);

            entity.get().updateUser(dto);
            userRepository.save(entity.get());

        } else {
            User newUserEntity = User.builder()
                    .username(username)
                    .password("")
                    .isLock(false)
                    .isSocial(true)
                    .socialProviderType(SocialProviderType.valueOf(registrationId))
                    .roleType(UserRoleType.USER)
                    .nickname(nickname)
                    .email(email)
                    .build();

            userRepository.save(newUserEntity);
        }

        authorities = List.of(new SimpleGrantedAuthority(role));

        // 최종 attributes는 원본 전체를 넣는 쪽이 안전
        return new CustomOAuth2User(attributes, authorities, username);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castToMap(Object obj) {
        if (obj instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    // 자체/소셜 유저 정보 조회
    @Transactional(readOnly = true)
    public UserResponseDTO readUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User entity = userRepository.findByUsernameAndIsLock(username, false)
                .orElseThrow(() -> new UsernameNotFoundException("해당 유저를 찾을 수 없습니다: " + username));

        return new UserResponseDTO(username, entity.getIsSocial(), entity.getNickname(), entity.getEmail());
    }
}
