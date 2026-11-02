
package com.ecc.ecc_file_management_system;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
    // SYSTEM_ADMIN: All branches
    // OTHER USERS: Their assigned branch only
    // ==========================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN', 'REGISTRAR', 'OFFICER', 'VIEWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllEmployees(
            Authentication authentication) {

        AppUser currentUser = getCurrentUser(authentication);

        if (currentUser == null || !currentUser.isActive()) {
            return unauthorized();
        }

        if (isSystemAdmin(currentUser)) {
            return ResponseEntity.ok(employeeRepository.findAll());
        }

        Branch branch = currentUser.getBranch();

        if (branch == null || !branch.isActive()) {
            return forbidden("Your account has no assigned active branch.");
        }

        return ResponseEntity.ok(
                employeeRepository.findByBranchId(branch.getId())
        );
    }

    // ==========================================
    // REGISTER EMPLOYEE
    // SYSTEM_ADMIN: Any active branch
    // BRANCH_ADMIN: Own branch
    // REGISTRAR: Own branch
    // ==========================================

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN', 'REGISTRAR')")
    @PostMapping
    @Transactional
    public ResponseEntity<?> createEmployee(
            @RequestBody Employee employee,
            Authentication authentication) {

        if (employee == null
                || employee.getEmployeeId() == null
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

            return badRequest("Please provide valid employee details.");
        }

        if (employeeRepository
                .findByEmployeeIdIgnoreCase(
                        employee.getEmployeeId().trim())
                .isPresent()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "This employee ID already exists."
                    ));
        }

        AppUser currentUser = getCurrentUser(authentication);

        if (currentUser == null || !currentUser.isActive()) {
            return unauthorized();
        }

        Branch branch;

        if (isSystemAdmin(currentUser)) {

            if (employee.getBranch() == null
                    || employee.getBranch().getId() == null) {
                return badRequest("Please select a branch.");
            }

            branch = branchRepository
                    .findById(employee.getBranch().getId())
                    .orElse(null);

        } else if (isBranchAdmin(currentUser)
                || isRegistrar(currentUser)) {

            branch = currentUser.getBranch();

            if (branch == null || !branch.isActive()) {
                return forbidden(
                        "Your account has no assigned active branch.");
            }

        } else {
            return forbidden("You cannot register employees.");
        }

        if (branch == null || !branch.isActive()) {
            return badRequest("Please select a valid active branch.");
        }

        employee.setBranch(branch);

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
    // SYSTEM_ADMIN: All branches
    // BRANCH_ADMIN: Own branch
    // ==========================================

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN')")
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        AppUser currentUser = getCurrentUser(authentication);

        if (currentUser == null || !currentUser.isActive()) {
            return unauthorized();
        }

        Employee employee = employeeRepository
                .findById(id)
                .orElse(null);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Employee not found."));
        }

        // Branch Admin cannot update employees belonging to another branch.
        if (isBranchAdmin(currentUser)) {
            if (currentUser.getBranch() == null
                    || employee.getBranch() == null
                    || !currentUser.getBranch().getId()
                            .equals(employee.getBranch().getId())) {
                return forbidden(
                        "You cannot update employees outside your branch.");
            }
        } else if (!isSystemAdmin(currentUser)) {
            return forbidden("You cannot update employee status.");
        }

        if (request == null) {
            return badRequest("Employee status is required.");
        }

        Object statusValue = request.get("status");

        if (!(statusValue instanceof String)) {
            return badRequest("A valid employee status is required.");
        }

        String status = ((String) statusValue).trim();

        if (!status.equals("Active") && !status.equals("Inactive")) {
            return badRequest("Status must be Active or Inactive.");
        }

        if (status.equals("Inactive")) {

            Object reasonValue = request.get("inactiveReason");
            Object dateValue = request.get("inactiveDate");
            Object remarksValue = request.get("inactiveRemarks");

            if (!(reasonValue instanceof String)
                    || ((String) reasonValue).isBlank()) {
                return badRequest("An inactive reason is required.");
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
                return badRequest("Please select a valid inactive reason.");
            }

            if (!(dateValue instanceof String)
                    || ((String) dateValue).isBlank()) {
                return badRequest("An effective date is required.");
            }

            LocalDate inactiveDate;

            try {
                inactiveDate = LocalDate.parse((String) dateValue);
            } catch (Exception exception) {
                return badRequest(
                        "The inactive date must use YYYY-MM-DD format.");
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

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private AppUser getCurrentUser(Authentication authentication) {

        if (authentication == null) {
            return null;
        }

        return appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);
    }

    private boolean isSystemAdmin(AppUser user) {
        return user.getRole() != null
                && "SYSTEM_ADMIN".equalsIgnoreCase(user.getRole().trim());
    }

    private boolean isBranchAdmin(AppUser user) {
        return user.getRole() != null
                && "BRANCH_ADMIN".equalsIgnoreCase(user.getRole().trim());
    }

    private boolean isRegistrar(AppUser user) {
        return user.getRole() != null
                && "REGISTRAR".equalsIgnoreCase(user.getRole().trim());
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                        "User account not found or inactive."));
    }

    private ResponseEntity<?> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", message));
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", message));
    }
}
