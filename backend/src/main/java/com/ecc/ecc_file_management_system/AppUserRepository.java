
package com.ecc.ecc_file_management_system;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    // Find all users belonging to a specific branch.
    List<AppUser> findByBranchId(Long branchId);

    // Find active users belonging to a specific branch.
    List<AppUser> findByBranchIdAndActiveTrue(Long branchId);

    // Find active users across all branches.
    List<AppUser> findByActiveTrue();
}
