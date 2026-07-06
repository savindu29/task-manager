package me.savindu.task_manager_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import me.savindu.task_manager_backend.config.JwtProperties;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Creates and validates signed (HS256) JSON Web Tokens. The token carries the
 * user's email as subject plus {@code role} and {@code uid} claims so the
 * authentication filter can rebuild the security context without a DB hit for
 * the authorities (the user is still reloaded to honour enabled/lock state).
 */
@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] keyBytes = Decoders.BASE64.decode(properties.secret());
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(AppUserDetails userDetails) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + properties.accessTokenExpirationMs());

        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(userDetails.getUsername())
                .claim("uid", userDetails.getId())
                .claim("role", userDetails.getUser().getRole().getCode())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Validates signature + expiry and that the token subject matches the given
     * user. Throws nothing on invalid input - returns false so callers can treat
     * the request as unauthenticated.
     */
    public boolean isTokenValid(String token, AppUserDetails userDetails) {
        try {
            Claims claims = parseClaims(token);
            return claims.getSubject().equals(userDetails.getUsername())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
