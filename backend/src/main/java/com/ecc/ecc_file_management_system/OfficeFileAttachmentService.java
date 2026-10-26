
package com.ecc.ecc_file_management_system;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OfficeFileAttachmentService {

    private final OfficeFileAttachmentRepository attachmentRepository;

    public OfficeFileAttachmentService(
            OfficeFileAttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    @Transactional
    public OfficeFileAttachment saveAttachment(
            OfficeFile officeFile,
            String fileName,
            String documentPath) {

        OfficeFileAttachment attachment = new OfficeFileAttachment();
        attachment.setOfficeFile(officeFile);
        attachment.setFileName(fileName);
        attachment.setDocumentPath(documentPath);

        return attachmentRepository.save(attachment);
    }

    @Transactional(readOnly = true)
    public List<OfficeFileAttachment> getAttachments(Long officeFileId) {
        return attachmentRepository.findByOfficeFileId(officeFileId);
    }
}
