package me.savindu.task_manager_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Reads the JWT on each request and, if valid, populates the
 * {@link SecurityContextHolder}. The token is resolved from, in order:
 * <ol>
 *   <li>the {@code Authorization: Bearer <token>} header (cross-origin clients
 *       such as the Vercel frontend);</li>
 *   <li>the HTTP-only auth cookie (same-origin / local dev);</li>
 *   <li>a {@code token} query parameter (Server-Sent Events: the browser's
 *       EventSource cannot set request headers).</li>
 * </ol>
 * Any problem (missing/expired/tampered token, unknown user) simply leaves the
 * request unauthenticated - downstream authorization then decides.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CookieService cookieService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            authenticate(request, token);
        }

        filterChain.doFilter(request, response);
    }

    /** Header (Bearer) -> cookie -> query param. First non-blank wins. */
    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String bearer = header.substring(7).trim();
            if (!bearer.isBlank()) {
                return bearer;
            }
        }

        String cookieToken = cookieService.extractToken(request);
        if (cookieToken != null) {
            return cookieToken;
        }

        String param = request.getParameter("token");
        if (param != null && !param.isBlank()) {
            return param;
        }

        return null;
    }

    private void authenticate(HttpServletRequest request, String token) {
        try {
            String email = jwtService.extractUsername(token);
            AppUserDetails userDetails = (AppUserDetails) userDetailsService.loadUserByUsername(email);

            if (userDetails.isEnabled() && jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
            // Invalid token or unknown user: proceed unauthenticated.
            SecurityContextHolder.clearContext();
        }
    }
}
