package com.aiops.repository;

import com.aiops.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySku(String sku);
    List<InventoryItem> findByCategory(String category);

    @Query("SELECT i FROM InventoryItem i WHERE i.qtyInStock <= i.reorderPoint")
    List<InventoryItem> findLowStockItems();
}
