
package com.ecc.ecc_file_management_system;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;
    private final BranchRepository branchRepository;

    public EmployeeController(
            EmployeeRepository employeeRepository,
            AppUserRepository appUserRepository,
            BranchRepository branchRepository) {

        this.employeeRepository = employeeRepository;
        this.appUserRepository = appUserRepository;
        this.branchRepository = branchRepository;
    }

    // ==========================================
    // GET ALL EMPLOYEES
    // ADMIN: All branches
    // OTHER USERS: Their assigned branch only
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getAllEmployees(
            Authentication authentication) {

        AppUser currentUser = appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);

        if (currentUser == null || !currentUser.isActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User account not found or inactive."
                    ));
        }

        // Admin can see all employees.
        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.ok(employeeRepository.findAll());
        }

        // Other users must have an assigned branch.
        if (currentUser.getBranch() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Your account has no assigned branch."
                    ));
        }

        return ResponseEntity.ok(
                employeeRepository.findByBranchId(
                        currentUser.getBranch().getId()
                )
        );
    }

    // ==========================================
    // REGISTER EMPLOYEE
    // ADMIN: Can register in any active branch
    // REGISTRAR: Can register only in own branch
    // ==========================================

    @PreAuthorize("hasAnyRole('ADMIN', 'REGISTRAR')")
    @PostMapping
    public ResponseEntity<?> createEmployee(
            @RequestBody Employee employee,
            Authentication authentication) {

        // Validate employee details.
        if (employee.getEmployeeId() == null
                || employee.getEmployeeId().isBlank()
                || employee.getFullName() == null
                || employee.getFullName().isBlank()
                || employee.getDepartment() == null
                || employee.getDepartment().isBlank()
                || employee.getPosition() == null
                || employee.getPosition().isBlank()
                || employee.getStatus() == null
                || !(employee.getStatus().equals("Active")
                || employee.getStatus().equals("Inactive"))) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please provide valid employee details."
                    ));
        }

        // Check duplicate employee ID.
        if (employeeRepository
                .findByEmployeeIdIgnoreCase(
                        employee.getEmployeeId().trim()
                )
                .isPresent()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This employee ID already exists."
                    ));
        }

        // Get the currently authenticated user.
        AppUser currentUser = appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);

        if (currentUser == null || !currentUser.isActive()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "User account not found or inactive."
                    ));
        }

        Branch branch;

        // ADMIN can choose any active branch.
        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {

            if (employee.getBranch() == null
                    || employee.getBranch().getId() == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please select a branch."
                        ));
            }

            branch = branchRepository
                    .findById(employee.getBranch().getId())
                    .orElse(null);

        }
        // REGISTRAR automatically uses their own branch.
        else if ("REGISTRAR".equalsIgnoreCase(currentUser.getRole())) {

            branch = currentUser.getBranch();

            if (branch == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "message",
                                "Your account has no assigned branch."
                        ));
            }

        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "You cannot register employees."
                    ));
        }

        // Verify that the selected branch exists and is active.
        if (branch == null || !branch.isActive()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Please select a valid active branch."
                    ));
        }

        // Assign the verified branch.
        employee.setBranch(branch);

        // Clean employee information.
        employee.setEmployeeId(employee.getEmployeeId().trim());
        employee.setFullName(employee.getFullName().trim());
        employee.setDepartment(employee.getDepartment().trim());
        employee.setPosition(employee.getPosition().trim());

        if (employee.getGender() != null) {
            employee.setGender(employee.getGender().trim());
        }

        Employee savedEmployee = employeeRepository.save(employee);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedEmployee);
    }

    // ==========================================
    // UPDATE EMPLOYEE STATUS
    // ADMIN ONLY
    // ==========================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        Employee employee = employeeRepository
                .findById(id)
                .orElse(null);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message",
                            "Employee not found."
                    ));
        }

        Object statusValue = request.get("status");

        if (!(statusValue instanceof String)) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "A valid employee status is required."
                    ));
        }

        String status = ((String) statusValue).trim();

        if (!status.equals("Active")
                && !status.equals("Inactive")) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Status must be Active or Inactive."
                    ));
        }

        if (status.equals("Inactive")) {

            Object reasonValue = request.get("inactiveReason");
            Object dateValue = request.get("inactiveDate");
            Object remarksValue = request.get("inactiveRemarks");

            if (!(reasonValue instanceof String)
                    || ((String) reasonValue).isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "An inactive reason is required."
                        ));
            }

            String reason = ((String) reasonValue).trim();

            List<String> allowedReasons = List.of(
                    "Retired",
                    "Resigned",
                    "Deceased",
                    "Transferred",
                    "Other"
            );

            if (!allowedReasons.contains(reason)) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please select a valid inactive reason."
                        ));
            }

            if (!(dateValue instanceof String)
                    || ((String) dateValue).isBlank()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "An effective date is required."
                        ));
            }

            LocalDate inactiveDate;

            try {
                inactiveDate = LocalDate.parse(
                        (String) dateValue
                );

            } catch (Exception exception) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "The inactive date must use YYYY-MM-DD format."
                        ));
            }

            String remarks = remarksValue instanceof String
                    ? ((String) remarksValue).trim()
                    : null;

            employee.setStatus("Inactive");
            employee.setInactiveReason(reason);
            employee.setInactiveDate(inactiveDate);

            employee.setInactiveRemarks(
                    remarks == null || remarks.isBlank()
                            ? null
                            : remarks
            );

        } else {

            employee.setStatus("Active");
            employee.setInactiveReason(null);
            employee.setInactiveDate(null);
            employee.setInactiveRemarks(null);
        }

        Employee savedEmployee = employeeRepository.save(employee);

        return ResponseEntity.ok(savedEmployee);
    }
}
