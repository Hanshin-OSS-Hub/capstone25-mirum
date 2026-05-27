package backend.security.JWT;

import backend.dto.jwt.JWTResponseDTO;
import backend.dto.jwt.RefreshRequestDTO;
import backend.entity.Refresh;
import backend.repository.RefreshRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    RefreshRepository refreshRepository;

    JwtService jwtService;

    @BeforeEach
    void setUp() {
        JWTUtil jwtUtil = new JWTUtil();
        jwtUtil.setSecretKey("test-secret-key-test-secret-key-1234567890");

        jwtService = new JwtService(refreshRepository);
    }

    @Test
    void refreshRotate_성공() {
        // given
        String oldRefreshToken = JWTUtil.createJWT("testUser", "ROLE_USER", false);

        RefreshRequestDTO dto = new RefreshRequestDTO();
        dto.setRefreshToken(oldRefreshToken);

        when(refreshRepository.existsByRefresh(oldRefreshToken)).thenReturn(true);

        // when
        JWTResponseDTO response = jwtService.refreshRotate(dto);

        // then
        assertNotNull(response.accessToken());
        assertNotNull(response.refreshToken());

        assertTrue(JWTUtil.isValid(response.accessToken(), true));
        assertTrue(JWTUtil.isValid(response.refreshToken(), false));

        assertEquals("testUser", JWTUtil.getUsername(response.accessToken()));
        assertEquals("ROLE_USER", JWTUtil.getRole(response.accessToken()));

        verify(refreshRepository).deleteByRefresh(oldRefreshToken);
        verify(refreshRepository).save(any(Refresh.class));
    }

    @Test
    void refreshRotate_DB에_없는_refreshToken이면_실패() {
        // given
        String oldRefreshToken = JWTUtil.createJWT("testUser", "ROLE_USER", false);

        RefreshRequestDTO dto = new RefreshRequestDTO();
        dto.setRefreshToken(oldRefreshToken);

        when(refreshRepository.existsByRefresh(oldRefreshToken)).thenReturn(false);

        // when & then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> jwtService.refreshRotate(dto));

        assertEquals("유효하지 않은 refreshToken입니다.", exception.getMessage());

        verify(refreshRepository, never()).save(any(Refresh.class));
    }

    @Test
    void refreshRotate_accessToken을_넣으면_실패() {
        // given
        String accessToken = JWTUtil.createJWT("testUser", "ROLE_USER", true);

        RefreshRequestDTO dto = new RefreshRequestDTO();
        dto.setRefreshToken(accessToken);

        // when & then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> jwtService.refreshRotate(dto));

        assertEquals("유효하지 않은 refreshToken입니다.", exception.getMessage());

        verify(refreshRepository, never()).existsByRefresh(anyString());
        verify(refreshRepository, never()).save(any(Refresh.class));
    }
}