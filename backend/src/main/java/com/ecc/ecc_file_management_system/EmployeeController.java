
package com.ecc.ecc_file_management_system;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        if (employee.getEmployeeId() == null
                || employee.getEmployeeId().isBlank()
                || employee.getFullName() == null
                || employee.getFullName().isBlank()
                || employee.getDepartment() == null
                || employee.getDepartment().isBlank()
                || employee.getPosition() == null
                || employee.getPosition().isBlank()
                || employee.getStatus() == null
                || !(employee.getStatus().equals("Active")
                || employee.getStatus().equals("Inactive"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please provide valid employee details."));
        }

        if (employeeRepository
                .findByEmployeeIdIgnoreCase(employee.getEmployeeId().trim())
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This employee ID already exists."));
        }

        employee.setEmployeeId(employee.getEmployeeId().trim());
        employee.setFullName(employee.getFullName().trim());
        employee.setDepartment(employee.getDepartment().trim());
        employee.setPosition(employee.getPosition().trim());

        if (employee.getGender() != null) {
    employee.setGender(employee.getGender().trim());
}

        Employee savedEmployee = employeeRepository.save(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEmployee);
    }
}
