package backend.security.JWT;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JWTUtilTest {

    @BeforeEach
    void setUp() {
        JWTUtil jwtUtil = new JWTUtil();

        // HS256용으로 충분히 긴 테스트 secret
        jwtUtil.setSecretKey("test-secret-key-test-secret-key-1234567890");
    }

    @Test
    void accessToken_생성_검증_성공() {
        // given
        String username = "testUser";
        String role = "ROLE_USER";

        // when
        String token = JWTUtil.createJWT(username, role, true);

        // then
        assertTrue(JWTUtil.isValid(token, true));
        assertFalse(JWTUtil.isValid(token, false));

        assertEquals(username, JWTUtil.getUsername(token));
        assertEquals(role, JWTUtil.getRole(token));
    }

    @Test
    void refreshToken_생성_검증_성공() {
        // given
        String username = "testUser";
        String role = "ROLE_USER";

        // when
        String token = JWTUtil.createJWT(username, role, false);

        // then
        assertTrue(JWTUtil.isValid(token, false));
        assertFalse(JWTUtil.isValid(token, true));

        assertEquals(username, JWTUtil.getUsername(token));
        assertEquals(role, JWTUtil.getRole(token));
    }

    @Test
    void 잘못된_토큰은_검증_실패() {
        // given
        String invalidToken = "invalid.jwt.token";

        // when & then
        assertFalse(JWTUtil.isValid(invalidToken, true));
        assertFalse(JWTUtil.isValid(invalidToken, false));
    }
}
