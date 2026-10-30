
package com.ecc.ecc_file_management_system;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate,

            @RequestParam(required = false)
            String department) {

        // Require both dates or neither.
        if ((startDate == null) != (endDate == null)) {
            throw new IllegalArgumentException(
                    "Provide both startDate and endDate.");
        }

        // Validate the date range.
        if (startDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "endDate must be on or after startDate.");
        }

        // Treat blank department or "All" as no branch filter.
        if (department != null) {
            department = department.trim();

            if (department.isEmpty()
                    || department.equalsIgnoreCase("All")) {
                department = null;
            }
        }

        return reportService.getSummary(
                startDate,
                endDate,
                department);
    }
}
