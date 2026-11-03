
package com.ecc.ecc_file_management_system;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OfficeFileRepository
        extends JpaRepository<OfficeFile, Long> {

    // Find a file by its reference number.
    Optional<OfficeFile> findByReferenceNumber(String referenceNumber);

    // Check whether a reference number already exists.
    boolean existsByReferenceNumber(String referenceNumber);

    // Find all files belonging to a branch.
    List<OfficeFile> findByBranchId(Long branchId);

    // Find files belonging to a branch within a registration date range.
    List<OfficeFile> findByBranchIdAndRegistrationDateBetween(
            Long branchId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Find a file by ID and branch.
    Optional<OfficeFile> findByIdAndBranchId(
            Long id,
            Long branchId
    );

    // Find a file by reference number and branch.
    Optional<OfficeFile> findByReferenceNumberAndBranchId(
            String referenceNumber,
            Long branchId
    );

    // Find files by department.
    List<OfficeFile> findByDepartmentIgnoreCase(String department);

    // Find files by file type.
    List<OfficeFile> findByFileTypeIgnoreCase(String fileType);

    // Find files by assigned officer.
    List<OfficeFile> findByAssignedOfficerIgnoreCase(
            String assignedOfficer
    );

    // Count files by status.
    long countByStatusIgnoreCase(String status);

    // Count files by file type.
    long countByFileTypeIgnoreCase(String fileType);

    // Count files registered within a date range.
    long countByRegistrationDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    /*
     * Find the highest generated reference sequence.
     *
     * Sequence is separated by:
     * 1. Department
     * 2. Ethiopian registration year
     * 3. Branch
     *
     * Volume is intentionally NOT included.
     *
     * This supports department codes containing slashes,
     * for example: 7.3.1/ሀ
     *
     * Example:
     * Department: 4.3.4
     * References:
     * 4.3.4/001/15
     * 4.3.4/002/15
     *
     * Highest sequence = 2
     */
    @Query(value = """
        SELECT COALESCE(
            MAX(CAST(split_part(reference_rest, '/', 1) AS INTEGER)),
            0
        )
        FROM (
            SELECT substring(
                reference_number FROM char_length(:department) + 2
            ) AS reference_rest
            FROM office_files
            WHERE department = :department
        ) AS matching_files
        WHERE split_part(reference_rest, '/', 2) = :yearSuffix
          AND COALESCE(
              split_part(reference_rest, '/', 3), ''
          ) = :branchSuffix
          AND split_part(reference_rest, '/', 1) ~ '^[0-9]+$'
        """, nativeQuery = true)
    Integer findHighestReferenceSequence(
            @Param("department") String department,
            @Param("yearSuffix") String yearSuffix,
            @Param("branchSuffix") String branchSuffix
    );
}
