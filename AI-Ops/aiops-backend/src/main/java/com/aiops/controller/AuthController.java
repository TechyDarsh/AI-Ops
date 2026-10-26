package com.aiops.controller;

import com.aiops.dto.*;
import com.aiops.model.User;
import com.aiops.repository.UserRepository;
import com.aiops.security.JwtUtils;
import com.aiops.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

/**
 * AUTH SERVICE — Microservice boundary: Authentication & Session Management
 * Handles: Login, JWT token generation, user info
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserRepository userRepo;
    @Autowired private UserDetailsServiceImpl userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepo.save(user);

            String token = jwtUtils.generateToken(userDetails, user.getRole().name());
            return ResponseEntity.ok(new JwtResponse(
                token, user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getDepartment()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(ApiResponse.error("Account is disabled"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        String email = auth.getName();
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // In production: blacklist JWT in Redis
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }
}
