package backend.domain.user.jwt.dto;

public record JWTResponseDTO(String accessToken, String refreshToken) {
}
