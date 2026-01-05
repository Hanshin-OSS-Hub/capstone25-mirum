package backend.dto.user;

public record UserResponseDTO(String username, Boolean social, String nickname, String email) {
}