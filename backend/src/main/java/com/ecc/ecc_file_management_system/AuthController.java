
package com.ecc.ecc_file_management_system;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(
            AuthenticationManager authenticationManager,
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        if (request.getEmail() == null
                || request.getPassword() == null
                || request.getEmail().isBlank()
                || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required."));
        }

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail().trim(),
                                    request.getPassword()));

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context, httpRequest, httpResponse);

            AppUser user = appUserRepository
                    .findByEmailIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new AuthenticationServiceException(
                            "Authenticated user was not found."));

            return ResponseEntity.ok(toAuthResponse(user));

        } catch (AuthenticationException exception) {
            SecurityContextHolder.clearContext();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("message", "Invalid email or password."));
        }
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (!isLoggedIn(authentication)) {
            return unauthorized();
        }

        String fullName = request.get("fullName");

        if (fullName == null || fullName.isBlank()) {
            return badRequest("Full name is required.");
        }

        if (fullName.trim().length() > 100) {
            return badRequest(
                    "Full name must be 100 characters or fewer.");
        }

        AppUser user = getAuthenticatedUser(authentication);
        user.setFullName(fullName.trim());

        return ResponseEntity.ok(toAuthResponse(user));
    }

    // Any authenticated user can change their OWN password.
    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (!isLoggedIn(authentication)) {
            return unauthorized();
        }

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (currentPassword == null || currentPassword.isBlank()) {
            return badRequest("Current password is required.");
        }

        String validationError = validateNewPassword(newPassword);
        if (validationError != null) {
            return badRequest(validationError);
        }

        if (confirmPassword == null
                || !newPassword.equals(confirmPassword)) {
            return badRequest("New passwords do not match.");
        }

        AppUser user = getAuthenticatedUser(authentication);

        if (!passwordEncoder.matches(
                currentPassword, user.getPasswordHash())) {
            return badRequest("Your current password is incorrect.");
        }

        if (passwordEncoder.matches(
                newPassword, user.getPasswordHash())) {
            return badRequest(
                    "Your new password must differ from your current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        return ResponseEntity.ok(
                Map.of("message", "Password changed successfully."));
    }

    // Only Admin can reset another user's password.
    @PutMapping("/admin-reset-password/{userId}")
    @Transactional
    public ResponseEntity<?> adminResetPassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (!isLoggedIn(authentication)) {
            return unauthorized();
        }

        AppUser admin = getAuthenticatedUser(authentication);

        if (admin.getRole() == null
                || !"ADMIN".equalsIgnoreCase(admin.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("message",
                            "Only an Admin can reset another user's password."));
        }

        if (admin.getId().equals(userId)) {
            return badRequest(
                    "Use Change My Password to update your own password.");
        }

        AppUser targetUser = appUserRepository.findById(userId)
                .orElse(null);

        if (targetUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "User not found."));
        }

        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        String validationError = validateNewPassword(newPassword);
        if (validationError != null) {
            return badRequest(validationError);
        }

        if (confirmPassword == null
                || !newPassword.equals(confirmPassword)) {
            return badRequest("New passwords do not match.");
        }

        targetUser.setPasswordHash(passwordEncoder.encode(newPassword));

        return ResponseEntity.ok(
                Map.of("message", "User password reset successfully."));
    }

    private String validateNewPassword(String password) {
        if (password == null || password.isBlank()) {
            return "New password is required.";
        }

        if (password.length() < 8) {
            return "New password must be at least 8 characters long.";
        }

        // BCrypt supports a maximum of 72 UTF-8 bytes.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            return "New password is too long. Use at most 72 UTF-8 bytes.";
        }

        return null;
    }

    private boolean isLoggedIn(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {
        return appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AuthenticationServiceException(
                        "Authenticated user was not found."));
    }

    private AuthResponse toAuthResponse(AppUser user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getBranch() != null ? user.getBranch().getId() : null,
                user.getBranch() != null ? user.getBranch().getName() : null
        );
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", "You must be logged in."));
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest().body(
                Map.of("message", message));
    }
}
