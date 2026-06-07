package com.career.skillanalyzer.security;

import com.career.skillanalyzer.Model.UserSession;
import com.career.skillanalyzer.util.TokenStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtSessionFilter extends OncePerRequestFilter {

    private final TokenStore tokenStore;

    public JwtSessionFilter(TokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String sessionId = request.getHeader("Session-Id");

        if (authHeader != null && sessionId != null) {
            UserSession session = tokenStore.getSession(sessionId);
            if (session == null || !session.isActive()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Session expired or invalid\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
