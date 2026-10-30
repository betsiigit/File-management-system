
package com.ecc.ecc_file_management_system;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final OfficeFileRepository officeFileRepository;
    private final CurrentUserService currentUserService;

    public ReportService(
            OfficeFileRepository officeFileRepository,
            CurrentUserService currentUserService) {
        this.officeFileRepository = officeFileRepository;
        this.currentUserService = currentUserService;
    }

    public Map<String, Object> getSummary(
            LocalDate startDate,
            LocalDate endDate,
            String department) {

        AppUser currentUser = currentUserService.getCurrentUser();

        List<OfficeFile> files;

        // Admin can see files across all branches.
        if (currentUser.getRole() != null
                && "ADMIN".equalsIgnoreCase(
                        currentUser.getRole().trim())) {

            files = officeFileRepository.findAll();

            // Admin may optionally filter by department.
            if (department != null && !department.isBlank()) {
                files = files.stream()
                        .filter(file -> file.getDepartment() != null
                                && file.getDepartment().equalsIgnoreCase(
                                        department.trim()))
                        .toList();
            }

        } else {

            // Ordinary users can only see their assigned branch.
            if (currentUser.getBranch() == null
                    || currentUser.getBranch().getId() == null) {
                throw new AccessDeniedException(
                        "Your account does not have a branch assigned.");
            }

            Long branchId = currentUser.getBranch().getId();

            if (startDate != null && endDate != null) {
                files = officeFileRepository
                        .findByBranchIdAndRegistrationDateBetween(
                                branchId, startDate, endDate);
            } else {
                files = officeFileRepository.findByBranchId(branchId);
            }
        }

        // Apply date filtering for Admin as well.
        if (startDate != null && endDate != null
                && "ADMIN".equalsIgnoreCase(
                        currentUser.getRole().trim())) {

            files = files.stream()
                    .filter(file -> file.getRegistrationDate() != null
                            && !file.getRegistrationDate().isBefore(startDate)
                            && !file.getRegistrationDate().isAfter(endDate))
                    .toList();
        }

        long totalFiles = files.size();

        long incomingFiles = files.stream()
                .filter(file -> "Incoming".equalsIgnoreCase(
                        file.getFileType()))
                .count();

        long outgoingFiles = files.stream()
                .filter(file -> "Outgoing".equalsIgnoreCase(
                        file.getFileType()))
                .count();

        long pendingFiles = files.stream()
                .filter(file -> "Pending".equalsIgnoreCase(
                        file.getStatus()))
                .count();

        long approvedFiles = files.stream()
                .filter(file -> "Approved".equalsIgnoreCase(
                        file.getStatus()))
                .count();

        long archivedFiles = files.stream()
                .filter(file -> "Archived".equalsIgnoreCase(
                        file.getStatus()))
                .count();

        Map<String, Object> report = new LinkedHashMap<>();

        report.put("totalFiles", totalFiles);
        report.put("incomingFiles", incomingFiles);
        report.put("outgoingFiles", outgoingFiles);
        report.put("pendingFiles", pendingFiles);
        report.put("approvedFiles", approvedFiles);
        report.put("archivedFiles", archivedFiles);

        return report;
    }
}
