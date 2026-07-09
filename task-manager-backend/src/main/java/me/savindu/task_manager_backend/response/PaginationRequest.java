package me.savindu.task_manager_backend.response;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

/** Bindable pagination/sort/search request; defaults applied null-safely in toPageable(). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationRequest {

    @Min(value = 0, message = "Page number must be greater than or equal to 0")
    @Builder.Default
    private Integer page = 0;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    @Builder.Default
    private Integer size = 20;

    private String sortBy;

    @Pattern(regexp = "^(ASC|DESC|asc|desc)$", message = "Sort direction must be ASC or DESC")
    @Builder.Default
    private String sortDirection = "ASC";

    private String multiSort;
    private String searchQuery;
    private String filterBy;
    private String filterValue;

    public Pageable toPageable() {
        int pageNumber = page != null ? page : 0;
        int pageSize = size != null ? size : 20;
        return PageRequest.of(pageNumber, pageSize, createSort());
    }

    private Sort createSort() {
        if (multiSort != null && !multiSort.trim().isEmpty()) {
            return parseMultiSort();
        }
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            String direction = sortDirection != null ? sortDirection : "ASC";
            return Sort.by(Sort.Direction.fromString(direction.toUpperCase()), sortBy);
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    private Sort parseMultiSort() {
        String[] criteria = multiSort.split(",");
        List<Sort.Order> orders = new ArrayList<>();
        for (String c : criteria) {
            String[] parts = c.trim().split(":");
            if (parts.length == 2) {
                try {
                    orders.add(new Sort.Order(Sort.Direction.fromString(parts[1].trim().toUpperCase()), parts[0].trim()));
                } catch (IllegalArgumentException e) {
                    orders.add(new Sort.Order(Sort.Direction.ASC, parts[0].trim()));
                }
            } else if (parts.length == 1) {
                orders.add(new Sort.Order(Sort.Direction.ASC, parts[0].trim()));
            }
        }
        return Sort.by(orders);
    }

    public boolean hasSearchQuery() {
        return searchQuery != null && !searchQuery.trim().isEmpty();
    }

    public boolean hasFilter() {
        return (filterBy != null && !filterBy.trim().isEmpty())
                && (filterValue != null && !filterValue.trim().isEmpty());
    }
}
