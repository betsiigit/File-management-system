
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
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository appUserRepository;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(
            AuthenticationManager authenticationManager,
            AppUserRepository appUserRepository) {
        this.authenticationManager = authenticationManager;
        this.appUserRepository = appUserRepository;
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
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Email and password are required."
                    ));
        }

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail().trim(),
                                    request.getPassword()
                            )
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context,
                    httpRequest,
                    httpResponse
            );

            AppUser user = appUserRepository
                    .findByEmailIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new AuthenticationServiceException(
                            "Authenticated user was not found."
                    ));

            return ResponseEntity.ok(
                    new AuthResponse(
                            user.getId(),
                            user.getEmail(),
                            user.getFullName(),
                            user.getRole(),
                            user.getBranch() != null
                                    ? user.getBranch().getId()
                                    : null,
                            user.getBranch() != null
                                    ? user.getBranch().getName()
                                    : null
                    )
            );

        } catch (AuthenticationException exception) {
            SecurityContextHolder.clearContext();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password."
                    ));
        }
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "You must be logged in."
                    ));
        }

        String fullName = request.get("fullName");

        if (fullName == null || fullName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Full name is required."
                    ));
        }

        if (fullName.trim().length() > 100) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Full name must be 100 characters or fewer."
                    ));
        }

        AppUser user = appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AuthenticationServiceException(
                        "Authenticated user was not found."
                ));

        user.setFullName(fullName.trim());

        return ResponseEntity.ok(
                new AuthResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole(),
                        user.getBranch() != null
                                ? user.getBranch().getId()
                                : null,
                        user.getBranch() != null
                                ? user.getBranch().getName()
                                : null
                )
        );
    }
}
