package com.career.skillanalyzer.service.auth;

import com.career.skillanalyzer.repository.SessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional
    public void logoutOtherDevices(String userId, String currentSessionId) {
        sessionRepository.logoutOtherSessions(userId, currentSessionId);
    }
}
