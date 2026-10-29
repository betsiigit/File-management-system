
package com.ecc.ecc_file_management_system;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    /**
     * Admin and Registrar can view the list of branches.
     */
    @GetMapping
    public List<BranchResponse> getBranches() {
        return branchRepository.findAll()
                .stream()
                .map(branch -> new BranchResponse(
                        branch.getId(),
                        branch.getName(),
                        branch.isActive()))
                .toList();
    }

    /**
     * Only Admin can create a branch.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createBranch(
            @RequestBody CreateBranchRequest request) {

        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Branch name is required."));
        }

        String name = request.name().trim();

        if (branchRepository.existsByNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "A branch with this name already exists."));
        }

        Branch branch = new Branch();
        branch.setName(name);
        branch.setActive(true);

        Branch savedBranch = branchRepository.save(branch);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BranchResponse(
                        savedBranch.getId(),
                        savedBranch.getName(),
                        savedBranch.isActive()));
    }

    public record CreateBranchRequest(String name) {
    }

    public record BranchResponse(
            Long id,
            String name,
            boolean active) {
    }
}
