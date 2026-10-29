
package com.ecc.ecc_file_management_system;

public class AuthResponse {

    private Long id;
    private String email;
    private String fullName;
    private String role;
    private Long branchId;
    private String branchName;

    public AuthResponse() {
    }

    public AuthResponse(
            Long id,
            String email,
            String fullName,
            String role,
            Long branchId,
            String branchName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.branchId = branchId;
        this.branchName = branchName;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public Long getBranchId() {
        return branchId;
    }

    public String getBranchName() {
        return branchName;
    }
}
