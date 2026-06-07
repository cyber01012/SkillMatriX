
package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.service.dashboard.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@CrossOrigin // dev: tighten origins in prod
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    public DashboardController(DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }



    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Login required to access dashboard insights"));
        }
        return ResponseEntity.ok(dashboardService.getSummary(userId));
    }


}
