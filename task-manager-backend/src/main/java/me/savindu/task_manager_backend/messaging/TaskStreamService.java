package me.savindu.task_manager_backend.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Registry of Server-Sent Events connections for real-time task updates.
 *
 * <p>Two audiences are tracked:
 * <ul>
 *   <li>per-owner emitters (keyed by user id) - a user receives changes to their
 *       own tasks only;</li>
 *   <li>admin emitters - receive every task change.</li>
 * </ul>
 * A user may hold several connections (multiple tabs), so each key maps to a set.
 * SSE is one-directional (server to client); clients still perform all writes via
 * the REST API.
 */
@Slf4j
@Service
public class TaskStreamService {

    /** Emitter lifetime; the browser's EventSource reconnects automatically. */
    private static final long TIMEOUT_MS = 30 * 60 * 1000L;

    private final Map<Long, Set<SseEmitter>> ownerEmitters = new ConcurrentHashMap<>();
    private final Set<SseEmitter> adminEmitters = new CopyOnWriteArraySet<>();

    public SseEmitter subscribeOwner(Long userId) {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        ownerEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(emitter);
        emitter.onCompletion(() -> removeOwner(userId, emitter));
        emitter.onTimeout(() -> removeOwner(userId, emitter));
        emitter.onError(e -> removeOwner(userId, emitter));
        sendInit(emitter);
        return emitter;
    }

    public SseEmitter subscribeAdmin() {
        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        adminEmitters.add(emitter);
        emitter.onCompletion(() -> adminEmitters.remove(emitter));
        emitter.onTimeout(() -> adminEmitters.remove(emitter));
        emitter.onError(e -> adminEmitters.remove(emitter));
        sendInit(emitter);
        return emitter;
    }

    public void sendToOwner(Long ownerId, TaskEvent event) {
        Set<SseEmitter> emitters = ownerEmitters.get(ownerId);
        if (emitters != null) {
            emitters.forEach(emitter -> send(emitter, event, () -> removeOwner(ownerId, emitter)));
        }
    }

    public void sendToAdmins(TaskEvent event) {
        adminEmitters.forEach(emitter -> send(emitter, event, () -> adminEmitters.remove(emitter)));
    }

    /** Keeps idle connections alive through proxies/load balancers. */
    @Scheduled(fixedRate = 25_000L)
    public void heartbeat() {
        ownerEmitters.forEach((userId, emitters) ->
                emitters.forEach(emitter -> ping(emitter, () -> removeOwner(userId, emitter))));
        adminEmitters.forEach(emitter -> ping(emitter, () -> adminEmitters.remove(emitter)));
    }

    private void send(SseEmitter emitter, TaskEvent event, Runnable onFailure) {
        try {
            emitter.send(SseEmitter.event().name("task").data(event));
        } catch (IOException | IllegalStateException ex) {
            onFailure.run();
        }
    }

    private void sendInit(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException ex) {
            log.debug("Failed to send SSE init event", ex);
        }
    }

    private void ping(SseEmitter emitter, Runnable onFailure) {
        try {
            emitter.send(SseEmitter.event().comment("ping"));
        } catch (IOException | IllegalStateException ex) {
            onFailure.run();
        }
    }

    private void removeOwner(Long userId, SseEmitter emitter) {
        Set<SseEmitter> emitters = ownerEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                ownerEmitters.remove(userId);
            }
        }
    }
}
