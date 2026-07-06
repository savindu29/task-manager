package me.savindu.task_manager_backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Envelope for paginated collections: content plus pagination, sort and
 * response metadata. Build from a Spring Data {@link Page} via {@link #from}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaginatedResponse<T> {

    @JsonProperty("content")
    private List<T> content;

    @JsonProperty("pagination")
    private PaginationMetadata pagination;

    @JsonProperty("sort")
    private SortMetadata sort;

    @JsonProperty("metadata")
    @Builder.Default
    private ResponseMetadata metadata = ResponseMetadata.builder()
            .timestamp(LocalDateTime.now())
            .build();

    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return PaginatedResponse.<T>builder()
                .content(page.getContent())
                .pagination(PaginationMetadata.from(page))
                .sort(SortMetadata.from(page.getSort()))
                .metadata(ResponseMetadata.builder()
                        .timestamp(LocalDateTime.now())
                        .totalElements(page.getTotalElements())
                        .build())
                .build();
    }

    public static <S, T> PaginatedResponse<T> from(Page<S> page, Function<S, T> mapper) {
        List<T> transformed = page.getContent().stream().map(mapper).collect(Collectors.toList());
        return PaginatedResponse.<T>builder()
                .content(transformed)
                .pagination(PaginationMetadata.from(page))
                .sort(SortMetadata.from(page.getSort()))
                .metadata(ResponseMetadata.builder()
                        .timestamp(LocalDateTime.now())
                        .totalElements(page.getTotalElements())
                        .build())
                .build();
    }

    public static <T> PaginatedResponse<T> empty() {
        return PaginatedResponse.<T>builder()
                .content(List.of())
                .pagination(PaginationMetadata.builder()
                        .currentPage(0)
                        .pageSize(0)
                        .totalPages(0)
                        .totalElements(0L)
                        .hasNext(false)
                        .hasPrevious(false)
                        .isFirst(true)
                        .isLast(true)
                        .build())
                .sort(SortMetadata.builder().sorted(false).build())
                .metadata(ResponseMetadata.builder().timestamp(LocalDateTime.now()).totalElements(0L).build())
                .build();
    }

    public boolean isEmpty() {
        return content == null || content.isEmpty();
    }

    public boolean hasContent() {
        return !isEmpty();
    }

    public int getContentSize() {
        return content != null ? content.size() : 0;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaginationMetadata {
        @JsonProperty("currentPage")
        private Integer currentPage;
        @JsonProperty("pageSize")
        private Integer pageSize;
        @JsonProperty("totalPages")
        private Integer totalPages;
        @JsonProperty("totalElements")
        private Long totalElements;
        @JsonProperty("hasNext")
        private Boolean hasNext;
        @JsonProperty("hasPrevious")
        private Boolean hasPrevious;
        @JsonProperty("isFirst")
        private Boolean isFirst;
        @JsonProperty("isLast")
        private Boolean isLast;
        @JsonProperty("numberOfElements")
        private Integer numberOfElements;

        public static PaginationMetadata from(Page<?> page) {
            return PaginationMetadata.builder()
                    .currentPage(page.getNumber())
                    .pageSize(page.getSize())
                    .totalPages(page.getTotalPages())
                    .totalElements(page.getTotalElements())
                    .hasNext(page.hasNext())
                    .hasPrevious(page.hasPrevious())
                    .isFirst(page.isFirst())
                    .isLast(page.isLast())
                    .numberOfElements(page.getNumberOfElements())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SortMetadata {
        @JsonProperty("sorted")
        private Boolean sorted;
        @JsonProperty("unsorted")
        private Boolean unsorted;
        @JsonProperty("empty")
        private Boolean empty;
        @JsonProperty("sortOrders")
        private List<SortOrder> sortOrders;

        public static SortMetadata from(Sort sort) {
            List<SortOrder> orders = sort.stream()
                    .map(o -> SortOrder.builder()
                            .property(o.getProperty())
                            .direction(o.getDirection().name())
                            .ignoreCase(o.isIgnoreCase())
                            .nullHandling(o.getNullHandling().name())
                            .build())
                    .collect(Collectors.toList());
            return SortMetadata.builder()
                    .sorted(sort.isSorted())
                    .unsorted(sort.isUnsorted())
                    .empty(sort.isEmpty())
                    .sortOrders(orders.isEmpty() ? null : orders)
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        @JsonInclude(JsonInclude.Include.NON_NULL)
        public static class SortOrder {
            @JsonProperty("property")
            private String property;
            @JsonProperty("direction")
            private String direction;
            @JsonProperty("ignoreCase")
            private Boolean ignoreCase;
            @JsonProperty("nullHandling")
            private String nullHandling;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ResponseMetadata {
        @JsonProperty("timestamp")
        private LocalDateTime timestamp;
        @JsonProperty("totalElements")
        private Long totalElements;
        @JsonProperty("requestId")
        private String requestId;
        @JsonProperty("apiVersion")
        @Builder.Default
        private String apiVersion = "v1";
        @JsonProperty("processingTime")
        private Long processingTimeMs;
        @JsonProperty("message")
        private String message;
    }
}
