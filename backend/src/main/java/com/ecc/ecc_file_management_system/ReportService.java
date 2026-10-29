 
package com.ecc.ecc_file_management_system;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ReportService {

    private final OfficeFileRepository officeFileRepository;

    public ReportService(OfficeFileRepository officeFileRepository) {
        this.officeFileRepository = officeFileRepository;
    }

    public Map<String, Object> getSummary(
            LocalDate startDate,
            LocalDate endDate) {

        Map<String, Object> report = new LinkedHashMap<>();

        long totalFiles;
        long incomingFiles;
        long outgoingFiles;
        long pendingFiles;
        long approvedFiles;
        long archivedFiles;

        if (startDate != null && endDate != null) {
            totalFiles = officeFileRepository
                    .countByRegistrationDateBetween(startDate, endDate);

            incomingFiles = countByTypeInDateRange(
                    "Incoming", startDate, endDate);

            outgoingFiles = countByTypeInDateRange(
                    "Outgoing", startDate, endDate);

            pendingFiles = countByStatusInDateRange(
                    "Pending", startDate, endDate);

            approvedFiles = countByStatusInDateRange(
                    "Approved", startDate, endDate);

            archivedFiles = countByStatusInDateRange(
                    "Archived", startDate, endDate);
        } else {
            totalFiles = officeFileRepository.count();

            incomingFiles = officeFileRepository
                    .countByFileTypeIgnoreCase("Incoming");

            outgoingFiles = officeFileRepository
                    .countByFileTypeIgnoreCase("Outgoing");

            pendingFiles = officeFileRepository
                    .countByStatusIgnoreCase("Pending");

            approvedFiles = officeFileRepository
                    .countByStatusIgnoreCase("Approved");

            archivedFiles = officeFileRepository
                    .countByStatusIgnoreCase("Archived");
        }

        report.put("totalFiles", totalFiles);
        report.put("incomingFiles", incomingFiles);
        report.put("outgoingFiles", outgoingFiles);
        report.put("pendingFiles", pendingFiles);
        report.put("approvedFiles", approvedFiles);
        report.put("archivedFiles", archivedFiles);

        return report;
    }

    private long countByTypeInDateRange(
            String fileType,
            LocalDate startDate,
            LocalDate endDate) {

        return officeFileRepository
                .findByFileTypeIgnoreCase(fileType)
                .stream()
                .filter(file -> file.getRegistrationDate() != null)
                .filter(file ->
                        !file.getRegistrationDate().isBefore(startDate)
                        && !file.getRegistrationDate().isAfter(endDate))
                .count();
    }

    private long countByStatusInDateRange(
            String status,
            LocalDate startDate,
            LocalDate endDate) {

        return officeFileRepository
                .findAll()
                .stream()
                .filter(file ->
                        file.getStatus() != null
                        && file.getStatus().equalsIgnoreCase(status))
                .filter(file -> file.getRegistrationDate() != null)
                .filter(file ->
                        !file.getRegistrationDate().isBefore(startDate)
                        && !file.getRegistrationDate().isAfter(endDate))
                .count();
    }
}

