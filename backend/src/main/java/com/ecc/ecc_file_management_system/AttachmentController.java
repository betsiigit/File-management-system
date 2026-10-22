
package com.ecc.ecc_file_management_system;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "http://localhost:3000")
public class AttachmentController {

    private final Path uploadPath;

    public AttachmentController(
            @Value("${file.upload-dir:uploads}") String uploadDir)
            throws IOException {

        this.uploadPath = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(this.uploadPath);
    }

    @PostMapping
    public ResponseEntity<List<String>> uploadFiles(
            @RequestParam("files") List<MultipartFile> files)
            throws IOException {

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<String> savedPaths = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String originalName = file.getOriginalFilename();

            if (originalName == null ||
                    !originalName.toLowerCase().endsWith(".pdf") ||
                    !"application/pdf".equalsIgnoreCase(file.getContentType())) {
                return ResponseEntity.badRequest().build();
            }

            String storedName = UUID.randomUUID() + ".pdf";
            Path destination = uploadPath.resolve(storedName).normalize();

            if (!destination.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().build();
            }

            file.transferTo(destination);
            savedPaths.add("/api/attachments/" + storedName);
        }

        return ResponseEntity.ok(savedPaths);
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String filename) throws IOException {

        if (!filename.matches("[a-fA-F0-9-]+\\.pdf")) {
            return ResponseEntity.badRequest().build();
        }

        Path filePath = uploadPath.resolve(filename).normalize();

        if (!filePath.startsWith(uploadPath) ||
                !Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + filename + "\""
                )
                .body(resource);
    }
}
