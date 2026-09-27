package com.insurance.claim.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_events")
public class ClaimEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long claimId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String actor;

    @Column(length = 1000)
    private String note;

    @Column(nullable = false)
    private LocalDateTime eventTime;

    public ClaimEvent() {}

    public ClaimEvent(Long claimId, String action, String status, String actor, String note) {
        this.claimId = claimId;
        this.action = action;
        this.status = status;
        this.actor = actor;
        this.note = note;
        this.eventTime = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getClaimId() { return claimId; }
    public String getAction() { return action; }
    public String getStatus() { return status; }
    public String getActor() { return actor; }
    public String getNote() { return note; }
    public LocalDateTime getEventTime() { return eventTime; }
}
