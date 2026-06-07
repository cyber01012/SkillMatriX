package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.repository.ActivityLogRepository;
import com.career.skillanalyzer.util.JwtUtil;
import com.career.skillanalyzer.util.StationLabeler;
import com.career.skillanalyzer.util.TokenStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.career.skillanalyzer.Model.ActivityLog.EventType.*;

@RestController
@RequestMapping("/activity")
public class ActivityMinimalController {

    private final ActivityLogRepository repo;
    private final JwtUtil jwt;
    private final StationLabeler stationLabeler;
    private final TokenStore tokenStore;

    public ActivityMinimalController(ActivityLogRepository repo, JwtUtil jwt,
                                     StationLabeler stationLabeler, TokenStore tokenStore) {
        this.repo = repo;
        this.jwt = jwt;
        this.stationLabeler = stationLabeler;
        this.tokenStore = tokenStore;
    }

    @GetMapping("/me/minimal")
    public ResponseEntity<List<Map<String, ? extends Comparable<? extends Comparable<?>>>>> getMyMinimal(
            @RequestHeader("Authorization") String bearer,
            @RequestParam(required = false, defaultValue = "50") Integer limit) {

        String userId = jwt.extractUserId(bearer.replace("Bearer ", ""));
        var types = List.of(LOGIN_SUCCESS, LOGOUT_CURRENT, LOGOUT_OTHERS);
        var logs = repo.findTop100ByUserIdAndEventTypeInOrderByCreatedAtDesc(userId, types);

        List<Map<String, ? extends Comparable<? extends Comparable<?>>>> minimal = logs.stream()
                .limit(limit != null && limit > 0 ? limit : 50)
                .map(al -> {
                    boolean sessionActive = tokenStore.getSession(al.getSessionId()) != null
                            && tokenStore.getSession(al.getSessionId()).isActive();

                    return Map.of(
                            "title", al.getEventType() == LOGIN_SUCCESS ? "Login" :
                                    al.getEventType() == LOGOUT_CURRENT ? "Logout" : "Logout (Other Device)",
                            "time", al.getCreatedAt(),
                            "station", stationLabeler.label(userId, al.getSessionId(), al.getDevice()),
                            "sessionId", al.getSessionId(),              // <-- NEW
                            "sessionActive", sessionActive,
                            "type", (al.getEventType() == LOGIN_SUCCESS) ? "auth" : "session_end",
                            "riskScore", al.getRiskScore()
                    );


                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(minimal);
    }
}
