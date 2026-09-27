package com.insurance.claim.service;

import com.insurance.claim.model.Role;
import com.insurance.claim.model.UserAccount;
import com.insurance.claim.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class RealtimeEventService {
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final UserAccountRepository users;

    public RealtimeEventService(UserAccountRepository users) { this.users = users; }

    public SseEmitter subscribe(String username) {
        if (users.findByUsername(username).filter(UserAccount::isEnabled).isEmpty()) {
            throw new IllegalArgumentException("Unknown or inactive user");
        }
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(username, k -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(username, emitter));
        emitter.onTimeout(() -> remove(username, emitter));
        emitter.onError(ex -> remove(username, emitter));
        try { emitter.send(SseEmitter.event().name("connected").data("connected")); }
        catch (IOException e) { remove(username, emitter); }
        return emitter;
    }

    public void notifyUser(String username, Object payload) { send(username, "claim-update", payload); }

    public void notifyStaff(Object payload) {
        for (UserAccount user : users.findAll()) {
            if (user.isEnabled() && user.isEmailVerified() && user.getRole() != Role.CLAIMANT) {
                send(user.getUsername(), "claim-update", payload);
            }
        }
    }

    private void send(String username, String eventName, Object payload) {
        List<SseEmitter> list = emitters.get(username);
        if (list == null) return;
        for (SseEmitter emitter : list) {
            try { emitter.send(SseEmitter.event().name(eventName).data(payload)); }
            catch (Exception e) { remove(username, emitter); }
        }
    }

    private void remove(String username, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(username);
        if (list != null) { list.remove(emitter); if (list.isEmpty()) emitters.remove(username); }
    }
}
