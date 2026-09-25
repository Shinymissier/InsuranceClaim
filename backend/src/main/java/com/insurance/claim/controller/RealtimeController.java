package com.insurance.claim.controller;

import com.insurance.claim.service.AuthService;
import com.insurance.claim.service.RealtimeEventService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/events")
public class RealtimeController {
    private final RealtimeEventService realtime;
    private final AuthService auth;
    public RealtimeController(RealtimeEventService realtime, AuthService auth) { this.realtime = realtime; this.auth = auth; }

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam String username) {
        auth.requireUser(username);
        return realtime.subscribe(username);
    }
}
