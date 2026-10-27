
package com.ecc.ecc_file_management_system;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPermissionRepository
        extends JpaRepository<UserPermission, Long> {

    List<UserPermission> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
