package backend.controller;

import backend.dto.S3.*;
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

    @PostMapping("/uploadUrl")
    public ResponseEntity<ApiResponse<UploadUrlResponseDTO>> getUploadUrl(@RequestBody UploadUrlRequestDTO request, @AuthenticationPrincipal String username) {
        return ResponseEntity.ok(ApiResponse.response(s3Service.getUploadUrl(request, username)));
    }

    @PostMapping("/downloadUrl")
    public ResponseEntity<ApiResponse<List<DownloadUrlResponseDTO>>> getDownloadUrl(@RequestBody List<String> uuids) {
        return ResponseEntity.ok(ApiResponse.response(s3Service.getDownloadUrl(uuids)));
    }

    // C
    @PostMapping("/upload/complete")
    public ResponseEntity<ApiResponse<Void>> uploadComplete(@RequestBody List<String> uuids) {
        s3Service.uploadComplete(uuids);
        return ResponseEntity.ok(ApiResponse.response(null));
    }

    // R
    @GetMapping("/project")
    public ResponseEntity<ApiResponse<List<S3InfoResponseDTO>>> getAllFilesInProject(@RequestParam Long projectId) {
        return  ResponseEntity.ok(ApiResponse.response(s3Service.getAllFilesInProject(projectId)));
    }

    // soft D
    @PostMapping("/softDelete")
    public ResponseEntity<ApiResponse<Map<String, String>>> softDelete(@AuthenticationPrincipal String username, @RequestBody DeleteDTO files) {
        return ResponseEntity.ok(ApiResponse.response(s3Service.softDelete(files, username)));
    }

    // real D
    @DeleteMapping("/realDelete")
    public ResponseEntity<ApiResponse<Map<String, String>>> realDelete(@AuthenticationPrincipal String username, @RequestBody DeleteDTO files) {
        return ResponseEntity.ok(ApiResponse.response(s3Service.realDelete(files, username)));
    }
}
