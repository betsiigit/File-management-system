
package com.ecc.ecc_file_management_system;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class OfficeFileService {

    private final OfficeFileRepository officeFileRepository;
    private final CurrentUserService currentUserService;

    public OfficeFileService(
            OfficeFileRepository officeFileRepository,
            CurrentUserService currentUserService) {
        this.officeFileRepository = officeFileRepository;
        this.currentUserService = currentUserService;
    }

    // Register a new file.
    public OfficeFile registerFile(OfficeFile officeFile) {
        AppUser currentUser = currentUserService.getCurrentUser();

        requireFileWritePermission(currentUser);

        Branch userBranch = currentUser.getBranch();

        if (userBranch == null) {
            throw new AccessDeniedException(
                    "Your account must have a branch assigned before registering files.");
        }

        String referenceNumber = officeFile.getReferenceNumber();

        if (referenceNumber == null || referenceNumber.isBlank()) {
            throw new IllegalArgumentException("Reference number is required.");
        }

        referenceNumber = referenceNumber.trim();
        officeFile.setReferenceNumber(referenceNumber);

        if (officeFileRepository.existsByReferenceNumber(referenceNumber)) {
            throw new IllegalArgumentException(
                    "A file with this reference number already exists.");
        }

        if (officeFile.getTitle() == null || officeFile.getTitle().isBlank()) {
            throw new IllegalArgumentException("File title is required.");
        }

        if (officeFile.getFileType() == null || officeFile.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required.");
        }

        if (officeFile.getNumberOfPages() != null
                && officeFile.getNumberOfPages() < 0) {
            throw new IllegalArgumentException(
                    "Number of pages cannot be negative.");
        }

        officeFile.setTitle(officeFile.getTitle().trim());
        officeFile.setFileType(officeFile.getFileType().trim());

        // Always use the authenticated user's branch.
        // Never trust a branch supplied by the frontend.
        officeFile.setBranch(userBranch);
        officeFile.setCreatedAt(LocalDateTime.now());

        return officeFileRepository.save(officeFile);
    }

    // Get all files.
    // System Admin sees every branch.
    // All other users see every file in their own branch.
    @Transactional(readOnly = true)
    public List<OfficeFile> getAllFiles() {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (isSystemAdmin(currentUser)) {
            return officeFileRepository.findAll();
        }

        Long branchId = requireBranchId(currentUser);
        return officeFileRepository.findByBranchId(branchId);
    }

    // Get one file by ID.
    @Transactional(readOnly = true)
    public OfficeFile getFileById(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (isSystemAdmin(currentUser)) {
            return officeFileRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Office file not found with ID: " + id));
        }

        Long branchId = requireBranchId(currentUser);

        return officeFileRepository.findByIdAndBranchId(id, branchId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Office file not found with ID: " + id));
    }

    // Search by reference number.
    @Transactional(readOnly = true)
    public OfficeFile getFileByReferenceNumber(String referenceNumber) {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (referenceNumber == null || referenceNumber.isBlank()) {
            throw new IllegalArgumentException("Reference number is required.");
        }

        String normalizedReference = referenceNumber.trim();

        if (isSystemAdmin(currentUser)) {
            return officeFileRepository
                    .findByReferenceNumber(normalizedReference)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Office file not found with reference number: "
                                    + normalizedReference));
        }

        Long branchId = requireBranchId(currentUser);

        return officeFileRepository
                .findByReferenceNumberAndBranchId(normalizedReference, branchId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Office file not found with reference number: "
                                + normalizedReference));
    }

    // Update an existing file.
    public OfficeFile updateFile(Long id, OfficeFile updatedFile) {
        AppUser currentUser = currentUserService.getCurrentUser();

        requireFileWritePermission(currentUser);

        // This lookup also enforces branch access.
        OfficeFile existingFile = getFileById(id);

        String newReference = updatedFile.getReferenceNumber();

        if (newReference == null || newReference.isBlank()) {
            throw new IllegalArgumentException("Reference number is required.");
        }

        newReference = newReference.trim();

        if (!newReference.equals(existingFile.getReferenceNumber())
                && officeFileRepository.existsByReferenceNumber(newReference)) {
            throw new IllegalArgumentException(
                    "Another file already uses this reference number.");
        }

        if (updatedFile.getTitle() == null || updatedFile.getTitle().isBlank()) {
            throw new IllegalArgumentException("File title is required.");
        }

        if (updatedFile.getFileType() == null
                || updatedFile.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required.");
        }

        if (updatedFile.getNumberOfPages() != null
                && updatedFile.getNumberOfPages() < 0) {
            throw new IllegalArgumentException(
                    "Number of pages cannot be negative.");
        }

        existingFile.setReferenceNumber(newReference);
        existingFile.setTitle(updatedFile.getTitle().trim());
        existingFile.setFileType(updatedFile.getFileType().trim());
        existingFile.setRegistrationDate(updatedFile.getRegistrationDate());
        existingFile.setOutgoingDate(updatedFile.getOutgoingDate());
        existingFile.setNumberOfPages(updatedFile.getNumberOfPages());
        existingFile.setDepartment(updatedFile.getDepartment());
        existingFile.setAssignedOfficer(updatedFile.getAssignedOfficer());
        existingFile.setRemarks(updatedFile.getRemarks());
        existingFile.setDocumentPath(updatedFile.getDocumentPath());

        // Preserve volume and status behavior.
        existingFile.setVolume(updatedFile.getVolume());
        existingFile.setStatus(updatedFile.getStatus());

        // Never change the branch during an update.
        return officeFileRepository.save(existingFile);
    }

    // Delete a file.
    public void deleteFile(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();

        requireFileWritePermission(currentUser);

        // Enforces access to the file before deletion.
        OfficeFile existingFile = getFileById(id);
        officeFileRepository.delete(existingFile);
    }

    // Identify the overall System Admin.
    private boolean isSystemAdmin(AppUser user) {
        return user.getRole() != null
                && "SYSTEM_ADMIN".equalsIgnoreCase(user.getRole().trim());
    }

    // Roles allowed to register, update, and delete files.
    private void requireFileWritePermission(AppUser user) {
        String role = user.getRole() == null
                ? ""
                : user.getRole().trim().toUpperCase(Locale.ROOT);

        if (!role.equals("SYSTEM_ADMIN")
                && !role.equals("BRANCH_ADMIN")
                && !role.equals("REGISTRAR")
                && !role.equals("OFFICER")) {
            throw new AccessDeniedException(
                    "You do not have permission to modify office files.");
        }
    }

    // Get the authenticated user's branch.
    private Long requireBranchId(AppUser user) {

        // System Admin access is handled separately by the calling methods.
        if (isSystemAdmin(user)) {
            return null;
        }

        if (user.getBranch() == null || user.getBranch().getId() == null) {
            throw new AccessDeniedException(
                    "Your account does not have a branch assigned.");
        }

        return user.getBranch().getId();
    }
}
