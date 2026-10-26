package com.aiops.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(name = "qty_in_stock")
    @Builder.Default
    private Integer qtyInStock = 0;

    @Column(name = "min_qty")
    private Integer minQty;

    @Column(name = "max_qty")
    private Integer maxQty;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(length = 100)
    private String supplier;

    @Column(name = "last_updated")
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
