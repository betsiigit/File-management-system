
package com.ecc.ecc_file_management_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeFileRepository
        extends JpaRepository<OfficeFile, Long> {

    Optional<OfficeFile> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    List<OfficeFile> findByDepartmentIgnoreCase(String department);

    List<OfficeFile> findByFileTypeIgnoreCase(String fileType);

    List<OfficeFile> findByAssignedOfficerIgnoreCase(String assignedOfficer);
}

