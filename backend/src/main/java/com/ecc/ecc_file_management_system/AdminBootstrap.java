
package com.ecc.ecc_file_management_system;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    @Value("${app.bootstrap-admin.full-name:}")
    private String adminFullName;

    public AdminBootstrap(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.count() > 0) {
            logger.info("Admin bootstrap skipped: user accounts already exist.");
            return;
        }

        if (adminEmail.isBlank()
                || adminPassword.isBlank()
                || adminFullName.isBlank()) {
            logger.warn(
                    "No users exist. Configure bootstrap Admin credentials "
                    + "before attempting to log in.");
            return;
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "The initial Admin password must be at least 12 characters.");
        }

        if (appUserRepository.existsByEmailIgnoreCase(adminEmail.trim())) {
            throw new IllegalStateException(
                    "The configured initial Admin email already exists.");
        }

        AppUser admin = new AppUser();
        admin.setEmail(adminEmail.trim());
        admin.setFullName(adminFullName.trim());
        admin.setRole("ADMIN");
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setActive(true);

        appUserRepository.save(admin);

        logger.info("Initial Admin account created successfully.");
    }
}

