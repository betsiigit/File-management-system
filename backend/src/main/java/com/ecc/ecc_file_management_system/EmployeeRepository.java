
package com.ecc.ecc_file_management_system;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeIdIgnoreCase(String employeeId);

    // Find all employees belonging to a branch
    List<Employee> findByBranchId(Long branchId);

    // Find active employees belonging to a branch
    List<Employee> findByBranchIdAndStatusIgnoreCase(
            Long branchId,
            String status
    );

    // Find all active employees across branches
    List<Employee> findByStatusIgnoreCase(String status);
    
}
