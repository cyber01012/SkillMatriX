package com.career.skillanalyzer.security;

import com.career.skillanalyzer.Model.UserSession;
import com.career.skillanalyzer.util.TokenStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class SessionActivityInterceptor implements HandlerInterceptor {

    @Autowired
    private TokenStore tokenStore;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response, Object handler) throws Exception {

        String sessionId = request.getHeader("Session-Id"); // ya token se extract
        if (sessionId != null) {
            UserSession session = tokenStore.getSession(sessionId);
            if (session != null && session.isActive()) {
                // 🔥 update lastActivity
                session.setLastActivity(LocalDateTime.now());

                // ✅ optional idle check (auto logout if > 45 mins)
                Duration idle = Duration.between(session.getLastActivity(), LocalDateTime.now());
                if (idle.toMinutes() > 45) {
                    session.setActive(false);
                    tokenStore.removeSession(sessionId);
                    response.setStatus(401);
                    return false;
                }
            }
        }

        return true;
    }
}
