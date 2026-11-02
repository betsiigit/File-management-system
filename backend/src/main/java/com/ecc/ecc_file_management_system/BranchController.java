
package com.ecc.ecc_file_management_system;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchRepository branchRepository;
    private final AppUserRepository appUserRepository;

    public BranchController(
            BranchRepository branchRepository,
            AppUserRepository appUserRepository) {
        this.branchRepository = branchRepository;
        this.appUserRepository = appUserRepository;
    }

    // SYSTEM_ADMIN can view all branches.
    // BRANCH_ADMIN can view only their assigned branch.
    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'BRANCH_ADMIN', 'REGISTRAR', 'OFFICER', 'VIEWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBranches(Authentication authentication) {

        AppUser user = getAuthenticatedUser(authentication);

        if ("SYSTEM_ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(
                    branchRepository.findAll().stream()
                            .map(this::toResponse)
                            .toList()
            );
        }

        Branch branch = user.getBranch();

        if (branch == null || !branch.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "You are not assigned to an active branch."));
        }

        return ResponseEntity.ok(List.of(toResponse(branch)));
    }

    // Only SYSTEM_ADMIN can create branches.
    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> createBranch(
            @RequestBody CreateBranchRequest request) {

        if (request == null
                || request.name() == null
                || request.name().isBlank()) {
            return badRequest("Branch name is required.");
        }

        String name = request.name().trim();

        if (name.length() > 100) {
            return badRequest(
                    "Branch name must be 100 characters or fewer.");
        }

        if (branchRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "A branch with this name already exists."));
        }

        Branch branch = new Branch();
        branch.setName(name);
        branch.setActive(true);

        Branch savedBranch = branchRepository.save(branch);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(savedBranch));
    }

    // Only SYSTEM_ADMIN can update branch details.
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Transactional
    public ResponseEntity<?> updateBranch(
            @PathVariable Long id,
            @RequestBody UpdateBranchRequest request) {

        if (request == null
                || request.name() == null
                || request.name().isBlank()) {
            return badRequest("Branch name is required.");
        }

        String name = request.name().trim();

        if (name.length() > 100) {
            return badRequest(
                    "Branch name must be 100 characters or fewer.");
        }

        Branch branch = branchRepository.findById(id).orElse(null);

        if (branch == null) {
            return ResponseEntity.notFound().build();
        }

        boolean duplicate = branchRepository.findByNameIgnoreCase(name)
                .filter(existing -> !existing.getId().equals(id))
                .isPresent();

        if (duplicate) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "Another branch already uses this name."));
        }

        branch.setName(name);

        return ResponseEntity.ok(toResponse(branch));
    }

    // Only SYSTEM_ADMIN can activate or deactivate branches.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @Transactional
    public ResponseEntity<?> updateBranchStatus(
            @PathVariable Long id,
            @RequestBody UpdateBranchStatusRequest request) {

        if (request == null) {
            return badRequest("Branch status is required.");
        }

        Branch branch = branchRepository.findById(id).orElse(null);

        if (branch == null) {
            return ResponseEntity.notFound().build();
        }

        if (!request.active() && branch.getName()
                .equalsIgnoreCase("Head Office")) {
            return badRequest(
                    "The Head Office branch cannot be deactivated.");
        }

        branch.setActive(request.active());

        return ResponseEntity.ok(toResponse(branch));
    }

    private AppUser getAuthenticatedUser(Authentication authentication) {
        return appUserRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Authenticated user was not found."));
    }

    private BranchResponse toResponse(Branch branch) {
        return new BranchResponse(
                branch.getId(),
                branch.getName(),
                branch.isActive()
        );
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", message));
    }

    public record CreateBranchRequest(String name) {}

    public record UpdateBranchRequest(String name) {}

    public record UpdateBranchStatusRequest(boolean active) {}

    public record BranchResponse(
            Long id,
            String name,
            boolean active) {}
}
