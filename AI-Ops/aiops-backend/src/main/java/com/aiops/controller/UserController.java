package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.*;
import com.aiops.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * USER MANAGEMENT SERVICE — Microservice boundary: User & Role Administration
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepo.findAll();
        // Don't expose passwords
        users.forEach(u -> u.setPassword("[PROTECTED]"));
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return userRepo.findById(id).map(u -> {
            u.setPassword("[PROTECTED]");
            return ResponseEntity.ok(ApiResponse.ok(u));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        List<User> all = userRepo.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", all.size());
        stats.put("active", all.stream().filter(User::getIsActive).count());
        stats.put("inactive", all.stream().filter(u -> !u.getIsActive()).count());
        stats.put("mfaEnabled", all.stream().filter(User::getMfaEnabled).count());
        Map<String, Long> byRole = new LinkedHashMap<>();
        for (User.UserRole role : User.UserRole.values()) {
            byRole.put(role.name(), all.stream().filter(u -> u.getRole() == role).count());
        }
        stats.put("byRole", byRole);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
