
package com.ecc.ecc_file_management_system;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
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

    @GetMapping
    public List<UserResponse> getUsers() {
        return appUserRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request) {

        if (request.fullName() == null
                || request.fullName().isBlank()
                || request.email() == null
                || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 12
                || request.role() == null
                || request.branchId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Name, email, role, branch, and a password of at least 12 characters are required."));
        }

        String email = request.email().trim();
        String fullName = request.fullName().trim();
        String role = request.role().trim()
                .toUpperCase(Locale.ROOT);

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Enter a valid email address."));
        }

        if (!List.of("ADMIN", "REGISTRAR", "OFFICER", "VIEWER")
                .contains(role)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid user role."));
        }

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "An account with this email already exists."));
        }

        Branch branch = branchRepository.findById(request.branchId())
                .filter(Branch::isActive)
                .orElse(null);

        if (branch == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Select a valid active branch."));
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

    private UserResponse toResponse(AppUser user) {
        Branch branch = user.getBranch();

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                branch == null ? null : branch.getId(),
                branch == null ? null : branch.getName());
    }

    public record CreateUserRequest(
            String fullName,
            String email,
            String password,
            String role,
            Long branchId) {
    }

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            String role,
            boolean active,
            Long branchId,
            String branchName) {
    }
}
