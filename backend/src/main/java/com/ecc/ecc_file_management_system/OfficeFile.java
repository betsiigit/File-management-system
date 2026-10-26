
package com.ecc.ecc_file_management_system;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "office_files")
public class OfficeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Reference number is required")
    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @Column(name = "volume")
private String volume;

@Column(name = "status", nullable = false)
private String status = "Pending";

    @NotBlank(message = "File title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "File type is required")
    @Column(name = "file_type", nullable = false)
    private String fileType;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @PositiveOrZero(message = "Pages cannot be negative")
    @Column(name = "number_of_pages")
    private Integer numberOfPages;

    @Column
    private String department;

    @Column(name = "assigned_officer")
    private String assignedOfficer;

    @Column(name = "outgoing_date")
private LocalDate outgoingDate;

    @Column(length = 2000)
    private String remarks;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public OfficeFile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public String getVolume() {
    return volume;
}

public void setVolume(String volume) {
    this.volume = volume;
}

public String getStatus() {
    return status;
}

public void setStatus(String status) {
    this.status = status;
}

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Integer getNumberOfPages() {
        return numberOfPages;
    }

    public void setNumberOfPages(Integer numberOfPages) {
        this.numberOfPages = numberOfPages;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public LocalDate getOutgoingDate() {
    return outgoingDate;
}

public void setOutgoingDate(LocalDate outgoingDate) {
    this.outgoingDate = outgoingDate;
}

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = documentPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
