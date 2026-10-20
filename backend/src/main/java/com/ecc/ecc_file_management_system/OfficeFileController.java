
package com.ecc.ecc_file_management_system;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office-files")
public class OfficeFileController {

    private final OfficeFileService officeFileService;

    public OfficeFileController(OfficeFileService officeFileService) {
        this.officeFileService = officeFileService;
    }

    // Register a new office file
    @PostMapping
    public ResponseEntity<OfficeFile> registerFile(
            @Valid @RequestBody OfficeFile officeFile) {

        OfficeFile savedFile = officeFileService.registerFile(officeFile);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedFile);
    }

    // Get all office files
    @GetMapping
    public ResponseEntity<List<OfficeFile>> getAllFiles() {
        return ResponseEntity.ok(officeFileService.getAllFiles());
    }

    // Get one file by ID
    @GetMapping("/{id}")
    public ResponseEntity<OfficeFile> getFileById(@PathVariable Long id) {
        return ResponseEntity.ok(officeFileService.getFileById(id));
    }

    // Search by reference number
    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<OfficeFile> getFileByReferenceNumber(
            @PathVariable String referenceNumber) {

        return ResponseEntity.ok(
            officeFileService.getFileByReferenceNumber(referenceNumber)
        );
    }

    // Update an existing file
    @PutMapping("/{id}")
    public ResponseEntity<OfficeFile> updateFile(
            @PathVariable Long id,
            @Valid @RequestBody OfficeFile officeFile) {

        return ResponseEntity.ok(
            officeFileService.updateFile(id, officeFile)
        );
    }

    // Delete a file
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable Long id) {

        officeFileService.deleteFile(id);

        return ResponseEntity.ok(
            Map.of("message", "Office file deleted successfully.")
        );
    }
}
