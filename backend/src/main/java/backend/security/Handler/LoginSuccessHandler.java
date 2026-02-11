package backend.security.Handler;

import backend.global.response.ApiResponse;
import backend.security.JWT.JwtService;
import backend.security.JWT.JWTUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@Qualifier("LoginSuccessHandler")
public class LoginSuccessHandler implements AuthenticationSuccessHandler {


    private final JwtService jwtService;

    public LoginSuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        // username, role
        String username =  authentication.getName();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // JWT(Access/Refresh) 발급
        String accessToken = JWTUtil.createJWT(username, role, true);
        String refreshToken = JWTUtil.createJWT(username, role, false);

        // 발급한 Refresh DB 테이블 저장 (Refresh whitelist)
        jwtService.addRefresh(username, refreshToken);

        // 응답 객체 설정
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        ApiResponse<Map<String, String>> apiResponse = ApiResponse.response(tokens);

        // 응답
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_OK);

        ObjectMapper objectMapper = new ObjectMapper();
        String json = objectMapper.writeValueAsString(apiResponse);

        response.getWriter().write(json);
        response.getWriter().flush();
    }

}
