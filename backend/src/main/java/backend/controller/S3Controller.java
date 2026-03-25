package backend.controller;

import backend.dto.S3.S3InfoResponseDTO;
import backend.dto.S3.S3UrlResponseDTO;
import backend.global.response.ApiResponse;
import backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class S3Controller {
    private final S3Service s3Service;

    @GetMapping("/uploadUrl")
    public ResponseEntity<ApiResponse<S3UrlResponseDTO>> getUploadUrl(@RequestParam String filename, @RequestParam Long projectId, @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ApiResponse.response(s3Service.getUploadUrl(filename, username, projectId)));
    }

    @GetMapping("/downloadUrl")
    public ResponseEntity<ApiResponse<Map<String,String>>> getDownloadUrl(@RequestParam String uuid){
        Map<String, String> result = Map.of("url", s3Service.getDownloadUrl(uuid));
        return ResponseEntity.ok(ApiResponse.response(result));
    }

    // C
    @PostMapping("/upload/complete")
    public ResponseEntity<ApiResponse<Void>> uploadComplete(@RequestParam String uuid) {
        s3Service.uploadComplete(uuid);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // R
    @GetMapping("/project")
    public ResponseEntity<ApiResponse<List<S3InfoResponseDTO>>> getAllFilesInProject(@RequestParam Long projectId) {
        return  ResponseEntity.ok(ApiResponse.response(s3Service.getAllFilesInProject(projectId)));
    }

    // soft D
    @DeleteMapping("/softDelete")
    public ResponseEntity<ApiResponse<Void>> softDelete(@AuthenticationPrincipal String username, @RequestParam String uuid, @RequestParam Long projectId) {
        s3Service.softDelete(uuid, username, projectId);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // real D
    @DeleteMapping("/realDelete")
    public ResponseEntity<ApiResponse<Void>> realDelete(@AuthenticationPrincipal String username, @RequestParam String uuid, @RequestParam Long projectId) {
        s3Service.realDelete(uuid, username, projectId);
        return ResponseEntity.ok(ApiResponse.response(null));
    }
}
