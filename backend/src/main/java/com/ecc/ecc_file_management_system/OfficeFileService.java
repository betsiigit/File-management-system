
package com.ecc.ecc_file_management_system;

import jakarta.persistence.EntityManager;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class OfficeFileService {

    private static final Long HEAD_OFFICE_BRANCH_ID = 1L;

    // Ethiopian calendar epoch, expressed as a Julian Day Number.
    private static final long ETHIOPIAN_EPOCH_JDN = 1724221L;

    private final OfficeFileRepository officeFileRepository;
    private final CurrentUserService currentUserService;
    private final EntityManager entityManager;

    public OfficeFileService(
            OfficeFileRepository officeFileRepository,
            CurrentUserService currentUserService,
            EntityManager entityManager) {

        this.officeFileRepository = officeFileRepository;
        this.currentUserService = currentUserService;
        this.entityManager = entityManager;
    }

    // Register a new file with an automatically generated reference.
    public OfficeFile registerFile(OfficeFile officeFile) {

        AppUser currentUser = currentUserService.getCurrentUser();

        requireFileWritePermission(currentUser);

        Branch userBranch = currentUser.getBranch();

        if (userBranch == null || userBranch.getId() == null) {
            throw new AccessDeniedException(
                    "Your account must have a branch assigned before registering files.");
        }

        if (!userBranch.isActive()) {
            throw new AccessDeniedException(
                    "Your branch is inactive. You cannot register files.");
        }

        // Validate required fields.
        if (officeFile.getTitle() == null
                || officeFile.getTitle().isBlank()) {
            throw new IllegalArgumentException("File title is required.");
        }

        if (officeFile.getFileType() == null
                || officeFile.getFileType().isBlank()) {
            throw new IllegalArgumentException("File type is required.");
        }

        if (officeFile.getDepartment() == null
                || officeFile.getDepartment().isBlank()) {
            throw new IllegalArgumentException("Department is required.");
        }

        if (officeFile.getVolume() == null
                || officeFile.getVolume().isBlank()) {
            throw new IllegalArgumentException("Volume is required.");
        }

        if (officeFile.getRegistrationDate() == null) {
            throw new IllegalArgumentException(
                    "Registration date is required.");
        }

        if (officeFile.getNumberOfPages() != null
                && officeFile.getNumberOfPages() < 0) {
            throw new IllegalArgumentException(
                    "Number of pages cannot be negative.");
        }

        String department = officeFile.getDepartment().trim();
        String volume = officeFile.getVolume().trim();

        officeFile.setDepartment(department);
        officeFile.setVolume(volume);
        officeFile.setTitle(officeFile.getTitle().trim());
        officeFile.setFileType(officeFile.getFileType().trim());

        // Calculate Ethiopian registration year from Gregorian date.
        int ethiopianYear =
                getEthiopianYear(officeFile.getRegistrationDate());

        String yearSuffix = String.format(
                "%02d", ethiopianYear % 100);

        // Head Office (ID 1) has no branch suffix.
        // Other branches use their database ID, padded to two digits.
        String branchSuffix = userBranch.getId()
                .equals(HEAD_OFFICE_BRANCH_ID)
                ? ""
                : String.format("%02d", userBranch.getId());

        // Lock registrations for the same department, year and branch.
        // Volume is intentionally excluded.
        String lockKey = department
                + "|" + yearSuffix
                + "|" + branchSuffix;

        entityManager.createNativeQuery(
                "SELECT pg_advisory_xact_lock("
                        + "hashtextextended(CAST(:lockKey AS text), 0))")
                .setParameter("lockKey", lockKey)
                .getSingleResult();

        // Find the highest sequence across all volumes.
        Integer highestSequence =
                officeFileRepository.findHighestReferenceSequence(
                        department,
                        yearSuffix,
                        branchSuffix);

        int nextSequence = (highestSequence == null
                ? 0
                : highestSequence) + 1;

        String sequence = String.format("%03d", nextSequence);

        // Generate the reference number.
        String referenceNumber = department
                + "/" + sequence
                + "/" + yearSuffix;

        if (!branchSuffix.isEmpty()) {
            referenceNumber += "/" + branchSuffix;
        }

        officeFile.setReferenceNumber(referenceNumber);

        // Always use the authenticated user's branch.
        // Never trust a branch supplied by the frontend.
        officeFile.setBranch(userBranch);
        officeFile.setCreatedAt(LocalDateTime.now());

        return officeFileRepository.save(officeFile);
    }

    // Convert a Gregorian date to the Ethiopian calendar year.
    private int getEthiopianYear(LocalDate gregorianDate) {

        long julianDayNumber =
                gregorianDate.toEpochDay() + 2440588L;

        long daysSinceEthiopianEpoch =
                julianDayNumber - ETHIOPIAN_EPOCH_JDN;

        if (daysSinceEthiopianEpoch < 0) {
            throw new IllegalArgumentException(
                    "Registration date is outside the supported Ethiopian calendar range.");
        }

        // Each Ethiopian four-year cycle contains 1461 days.
        long fourYearCycle =
                Math.floorDiv(daysSinceEthiopianEpoch, 1461L);

        long dayWithinCycle =
                Math.floorMod(daysSinceEthiopianEpoch, 1461L);

        int yearWithinCycle = Math.min(
                3,
                (int) (dayWithinCycle / 365L));

        return (int) (fourYearCycle * 4L)
                + yearWithinCycle
                + 1;
    }

    // Get all files.
    // System Admin sees every branch.
    // Other users see files in their own branch.
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
            throw new IllegalArgumentException(
                    "Reference number is required.");
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
                .findByReferenceNumberAndBranchId(
                        normalizedReference, branchId)
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
            throw new IllegalArgumentException(
                    "Reference number is required.");
        }

        newReference = newReference.trim();

        if (!newReference.equals(existingFile.getReferenceNumber())
                && officeFileRepository.existsByReferenceNumber(newReference)) {
            throw new IllegalArgumentException(
                    "Another file already uses this reference number.");
        }

        if (updatedFile.getTitle() == null
                || updatedFile.getTitle().isBlank()) {
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
        existingFile.setRegistrationDate(
                updatedFile.getRegistrationDate());
        existingFile.setOutgoingDate(updatedFile.getOutgoingDate());
        existingFile.setNumberOfPages(
                updatedFile.getNumberOfPages());
        existingFile.setDepartment(updatedFile.getDepartment());
        existingFile.setAssignedOfficer(
                updatedFile.getAssignedOfficer());
        existingFile.setRemarks(updatedFile.getRemarks());
        existingFile.setDocumentPath(updatedFile.getDocumentPath());

        // Preserve existing volume and status behavior.
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
                && "SYSTEM_ADMIN".equalsIgnoreCase(
                        user.getRole().trim());
    }

    // Roles allowed to register, update and delete files.
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

        // System Admin access is handled separately.
        if (isSystemAdmin(user)) {
            return null;
        }

        if (user.getBranch() == null
                || user.getBranch().getId() == null) {

            throw new AccessDeniedException(
                    "Your account does not have a branch assigned.");
        }

        return user.getBranch().getId();
    }
}
