
package com.ecc.ecc_file_management_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Repository
public interface OfficeFileRepository
        extends JpaRepository<OfficeFile, Long> {

    Optional<OfficeFile> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    List<OfficeFile> findByBranchId(Long branchId);

    Optional<OfficeFile> findByIdAndBranchId(Long id, Long branchId);

    Optional<OfficeFile> findByReferenceNumberAndBranchId(
            String referenceNumber, Long branchId);

    List<OfficeFile> findByDepartmentIgnoreCase(String department);

    List<OfficeFile> findByFileTypeIgnoreCase(String fileType);

    List<OfficeFile> findByAssignedOfficerIgnoreCase(String assignedOfficer);


    // Report counts
long countByStatusIgnoreCase(String status);

long countByFileTypeIgnoreCase(String fileType);

// Date-filtered report
long countByRegistrationDateBetween(
        LocalDate startDate,
        LocalDate endDate
);
}
