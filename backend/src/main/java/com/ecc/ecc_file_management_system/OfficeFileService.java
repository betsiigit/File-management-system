
package com.ecc.ecc_file_management_system;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OfficeFileService {

    private final OfficeFileRepository officeFileRepository;

    public OfficeFileService(OfficeFileRepository officeFileRepository) {
        this.officeFileRepository = officeFileRepository;
    }

    public OfficeFile registerFile(OfficeFile officeFile) {
        String referenceNumber = officeFile.getReferenceNumber();

        if (referenceNumber == null || referenceNumber.isBlank()) {
            throw new IllegalArgumentException(
                "Reference number is required."
            );
        }

        referenceNumber = referenceNumber.trim();
        officeFile.setReferenceNumber(referenceNumber);

        if (officeFileRepository.existsByReferenceNumber(referenceNumber)) {
            throw new IllegalArgumentException(
                "A file with this reference number already exists."
            );
        }

        if (officeFile.getTitle() == null ||
                officeFile.getTitle().isBlank()) {
            throw new IllegalArgumentException("File title is required.");
        }

        if (officeFile.getFileType() == null ||
                officeFile.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required.");
        }

        if (officeFile.getNumberOfPages() != null &&
                officeFile.getNumberOfPages() < 0) {
            throw new IllegalArgumentException(
                "Number of pages cannot be negative."
            );
        }

        officeFile.setTitle(officeFile.getTitle().trim());
        officeFile.setFileType(officeFile.getFileType().trim());

        officeFile.setCreatedAt(LocalDateTime.now());

        return officeFileRepository.save(officeFile);
    }

    @Transactional(readOnly = true)
    public List<OfficeFile> getAllFiles() {
        return officeFileRepository.findAll();
    }

    @Transactional(readOnly = true)
    public OfficeFile getFileById(Long id) {
        return officeFileRepository.findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Office file not found with ID: " + id
                )
            );
    }

    @Transactional(readOnly = true)
    public OfficeFile getFileByReferenceNumber(String referenceNumber) {
        return officeFileRepository
            .findByReferenceNumber(referenceNumber.trim())
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "Office file not found with reference number: "
                        + referenceNumber
                )
            );
    }

    public OfficeFile updateFile(Long id, OfficeFile updatedFile) {
        OfficeFile existingFile = getFileById(id);

        String newReference = updatedFile.getReferenceNumber();

        if (newReference == null || newReference.isBlank()) {
            throw new IllegalArgumentException(
                "Reference number is required."
            );
        }

        newReference = newReference.trim();

        if (!newReference.equals(existingFile.getReferenceNumber())
                && officeFileRepository.existsByReferenceNumber(newReference)) {
            throw new IllegalArgumentException(
                "Another file already uses this reference number."
            );
        }

        if (updatedFile.getTitle() == null ||
                updatedFile.getTitle().isBlank()) {
            throw new IllegalArgumentException("File title is required.");
        }

        if (updatedFile.getFileType() == null ||
                updatedFile.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required.");
        }

        if (updatedFile.getNumberOfPages() != null &&
                updatedFile.getNumberOfPages() < 0) {
            throw new IllegalArgumentException(
                "Number of pages cannot be negative."
            );
        }

        existingFile.setReferenceNumber(newReference);
        existingFile.setTitle(updatedFile.getTitle().trim());
        existingFile.setFileType(updatedFile.getFileType().trim());
        existingFile.setRegistrationDate(updatedFile.getRegistrationDate());
        existingFile.setNumberOfPages(updatedFile.getNumberOfPages());
        existingFile.setDepartment(updatedFile.getDepartment());
        existingFile.setAssignedOfficer(updatedFile.getAssignedOfficer());
        existingFile.setRemarks(updatedFile.getRemarks());
        existingFile.setDocumentPath(updatedFile.getDocumentPath());

        return officeFileRepository.save(existingFile);
    }

    public void deleteFile(Long id) {
        OfficeFile existingFile = getFileById(id);
        officeFileRepository.delete(existingFile);
    }
}

