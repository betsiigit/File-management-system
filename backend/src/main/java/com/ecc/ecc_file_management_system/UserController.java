
package com.ecc.ecc_file_management_system;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository appUserRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(
            AppUserRepository appUserRepository,
            BranchRepository branchRepository,
            PasswordEncoder passwordEncoder) {

        this.appUserRepository = appUserRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // SYSTEM_ADMIN and BRANCH_ADMIN can view available branches.
    // Branch Admin only sees their own branch.
    @GetMapping("/branches")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBranches(Authentication authentication) {

        AppUser currentUser = getAuthenticatedUser(authentication);

        if (isSystemAdmin(currentUser)) {
            return ResponseEntity.ok(
                    branchRepository.findAll().stream()
                            .filter(Branch::isActive)
                            .map(branch -> Map.of(
                                    "id", branch.getId(),
                                    "name", branch.getName(),
                                    "active", branch.isActive()
                            ))
                            .toList()
            );
        }

        Branch branch = currentUser.getBranch();

        if (branch == null || !branch.isActive()) {
            return forbidden("You are not assigned to an active branch.");
        }

        return ResponseEntity.ok(List.of(
                Map.of(
                        "id", branch.getId(),
                        "name", branch.getName(),
                        "active", branch.isActive()
                )
        ));
    }

    // SYSTEM_ADMIN sees all users.
    // BRANCH_ADMIN sees users from their own branch.
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getUsers(Authentication authentication) {

        AppUser currentUser = getAuthenticatedUser(authentication);

        List<AppUser> users;

        if (isSystemAdmin(currentUser)) {
            users = appUserRepository.findAll();
        } else {
            Branch branch = currentUser.getBranch();

            if (branch == null || !branch.isActive()) {
                return forbidden(
                        "You are not assigned to an active branch.");
            }

            users = appUserRepository.findByBranchId(branch.getId());
        }

        return ResponseEntity.ok(
                users.stream()
                        .map(this::toResponse)
                        .toList()
        );
    }

    // SYSTEM_ADMIN can create branch administrators and regular users.
    // BRANCH_ADMIN can create regular users in their own branch only.
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN')")
    @Transactional
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request,
            Authentication authentication) {

        if (request == null) {
            return badRequest("User information is required.");
        }

        if (request.fullName() == null
                || request.fullName().isBlank()
                || request.fullName().trim().length() > 100
                || request.email() == null
                || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 12
                || request.role() == null) {

            return badRequest(
                    "Name, email, role, and a password of at least 12 characters are required.");
        }

        String email = request.email().trim();
        String fullName = request.fullName().trim();
        String role = request.role().trim()
                .toUpperCase(Locale.ROOT);

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return badRequest("Enter a valid email address.");
        }

        if (passwordTooLong(request.password())) {
            return badRequest(
                    "Password must not exceed 72 UTF-8 bytes.");
        }

        AppUser currentUser = getAuthenticatedUser(authentication);

        boolean systemAdmin = isSystemAdmin(currentUser);
        boolean branchAdmin = isBranchAdmin(currentUser);

        if (systemAdmin) {

            if (!List.of(
                    "BRANCH_ADMIN",
                    "REGISTRAR",
                    "OFFICER",
                    "VIEWER"
            ).contains(role)) {
                return badRequest("Invalid user role.");
            }

        } else if (branchAdmin) {

            if (!List.of(
                    "REGISTRAR",
                    "OFFICER",
                    "VIEWER"
            ).contains(role)) {
                return forbidden(
                        "Branch Admin cannot create System Admin or another Branch Admin.");
            }

        } else {
            return forbidden("You cannot create users.");
        }

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "An account with this email already exists."
                    ));
        }

        Branch branch;

        if (systemAdmin) {

            if (request.branchId() == null) {
                return badRequest("Please select a branch.");
            }

            branch = branchRepository.findById(request.branchId())
                    .filter(Branch::isActive)
                    .orElse(null);

            if (branch == null) {
                return badRequest("Select a valid active branch.");
            }

        } else {

            // Never trust the branch ID supplied by a Branch Admin.
            // Always use their own authenticated branch.
            branch = currentUser.getBranch();

            if (branch == null || !branch.isActive()) {
                return forbidden(
                        "You are not assigned to an active branch.");
            }
        }

        AppUser user = new AppUser();

        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        user.setPasswordHash(
                passwordEncoder.encode(request.password()));
        user.setActive(true);
        user.setBranch(branch);

        AppUser savedUser = appUserRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(savedUser));
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {

        return appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user was not found."));
    }

    private boolean isSystemAdmin(AppUser user) {
        return user.getRole() != null
                && "SYSTEM_ADMIN".equalsIgnoreCase(user.getRole());
    }

    private boolean isBranchAdmin(AppUser user) {
        return user.getRole() != null
                && "BRANCH_ADMIN".equalsIgnoreCase(user.getRole());
    }

    private boolean passwordTooLong(String password) {
        return password.getBytes(StandardCharsets.UTF_8).length > 72;
    }

    private UserResponse toResponse(AppUser user) {

        Branch branch = user.getBranch();

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                branch == null ? null : branch.getId(),
                branch == null ? null : branch.getName()
        );
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", message));
    }

    private ResponseEntity<?> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", message));
    }

    public record CreateUserRequest(
            String fullName,
            String email,
            String password,
            String role,
            Long branchId
    ) {}

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            String role,
            boolean active,
            Long branchId,
            String branchName
    ) {}
}
