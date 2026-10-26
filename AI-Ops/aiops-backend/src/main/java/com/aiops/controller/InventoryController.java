package com.aiops.controller;

import com.aiops.dto.ApiResponse;
import com.aiops.model.InventoryItem;
import com.aiops.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * INVENTORY SERVICE — Microservice boundary: Spare Parts & Stock Management
 */
@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired private InventoryRepository inventoryRepo;

    @GetMapping
    public ResponseEntity<?> getAllItems(@RequestParam(required = false) String category) {
        List<InventoryItem> items = category != null
            ? inventoryRepo.findByCategory(category)
            : inventoryRepo.findAll();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable Long id) {
        return inventoryRepo.findById(id)
            .map(i -> ResponseEntity.ok(ApiResponse.ok(i)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<?> getLowStockItems() {
        List<InventoryItem> items = inventoryRepo.findLowStockItems();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody InventoryItem item) {
        InventoryItem saved = inventoryRepo.save(item);
        return ResponseEntity.ok(ApiResponse.ok("Item created", saved));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return inventoryRepo.findById(id).map(item -> {
            item.setQtyInStock(body.get("qty"));
            item.setLastUpdated(java.time.LocalDateTime.now());
            inventoryRepo.save(item);
            return ResponseEntity.ok(ApiResponse.ok("Stock updated", item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getInventoryStats() {
        List<InventoryItem> all = inventoryRepo.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalItems", all.size());
        stats.put("totalValue", all.stream().mapToDouble(i -> i.getQtyInStock() * i.getUnitCost()).sum());
        stats.put("lowStockCount", inventoryRepo.findLowStockItems().size());
        stats.put("categories", all.stream().map(InventoryItem::getCategory).distinct().count());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
