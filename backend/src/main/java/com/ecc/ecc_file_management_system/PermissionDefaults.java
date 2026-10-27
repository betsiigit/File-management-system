
package com.ecc.ecc_file_management_system;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public final class PermissionDefaults {

    public static final String FILE_VIEW = "FILE_VIEW";
    public static final String FILE_REGISTER = "FILE_REGISTER";
    public static final String FILE_EDIT = "FILE_EDIT";
    public static final String FILE_DELETE = "FILE_DELETE";
    public static final String FILE_TRANSFER = "FILE_TRANSFER";
    public static final String FILE_ARCHIVE = "FILE_ARCHIVE";
    public static final String FILE_PRINT = "FILE_PRINT";
    public static final String USER_MANAGE = "USER_MANAGE";
    public static final String EMPLOYEE_MANAGE = "EMPLOYEE_MANAGE";
    public static final String BRANCH_MANAGE = "BRANCH_MANAGE";

    private static final Set<String> ALL_PERMISSIONS = Set.of(
            FILE_VIEW,
            FILE_REGISTER,
            FILE_EDIT,
            FILE_DELETE,
            FILE_TRANSFER,
            FILE_ARCHIVE,
            FILE_PRINT,
            USER_MANAGE,
            EMPLOYEE_MANAGE,
            BRANCH_MANAGE
    );

    private PermissionDefaults() {
    }

    public static Set<String> allPermissions() {
        return ALL_PERMISSIONS;
    }

    public static Map<String, Boolean> forRole(String role) {
        Map<String, Boolean> permissions = new LinkedHashMap<>();

        for (String permission : ALL_PERMISSIONS) {
            permissions.put(permission, false);
        }

        if (role == null) {
            return permissions;
        }

        switch (role.trim().toUpperCase()) {
            case "ADMIN" -> ALL_PERMISSIONS.forEach(
                    permission -> permissions.put(permission, true));

            case "REGISTRAR" -> {
                permissions.put(FILE_VIEW, true);
                permissions.put(FILE_REGISTER, true);
                permissions.put(FILE_EDIT, true);
                permissions.put(FILE_TRANSFER, true);
                permissions.put(FILE_PRINT, true);
            }

            case "OFFICER" -> {
                permissions.put(FILE_VIEW, true);
                permissions.put(FILE_TRANSFER, true);
                permissions.put(FILE_PRINT, true);
            }

            case "VIEWER" -> permissions.put(FILE_VIEW, true);

            default -> {
                // Unknown roles receive no permissions.
            }
        }

        return permissions;
    }
}
