
package com.ecc.ecc_file_management_system;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {

    Optional<Branch> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
