
package com.ecc.ecc_file_management_system;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OfficeFileAttachmentRepository
        extends JpaRepository<OfficeFileAttachment, Long> {

    List<OfficeFileAttachment> findByOfficeFileId(Long officeFileId);
}

