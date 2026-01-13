package backend.controller;

import backend.dto.jwt.JWTResponseDTO;
import backend.dto.jwt.RefreshRequestDTO;
import backend.global.response.ApiResponse;
import backend.security.JWT.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JwtController {

    private final JwtService jwtService;

    public JwtController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // 소셜 로그인 쿠키 방식의 Refresh 토큰 헤더 방식으로 교환
    @PostMapping(value = "/jwt/exchange", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<JWTResponseDTO>> jwtExchangeApi(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(jwtService.cookie2Header(request, response)));
    }

    // Refresh 토큰으로 Access 토큰 재발급 (Rotate 포함)
    @PostMapping(value = "/jwt/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<JWTResponseDTO>> jwtRefreshApi(
            @Validated @RequestBody RefreshRequestDTO dto
    ) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.response(jwtService.refreshRotate(dto)));
    }

}