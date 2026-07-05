┌──────────────────────────────────────────────────────────────┐
│                         USERS                                │
│ Visitors | Members | Pastors | Admins                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                           │
├──────────────────────────────────────────────────────────────┤
│ Landing Page                                                 │
│ Authentication                                               │
│ Dashboard                                                    │
│ Events                                                       │
│ Donations                                                    │
│ Prayer Requests                                              │
│ Members                                                      │
│ Live Stream                                                  │
│ Profile Settings                                             │
│ Admin Panel                                                  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ HTTPS + JWT
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                         │
├──────────────────────────────────────────────────────────────┤
│ Authentication APIs                                          │
│ User APIs                                                    │
│ Event APIs                                                   │
│ Donation APIs                                                │
│ Prayer APIs                                                  │
│ Admin APIs                                                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                    BUSINESS SERVICES                         │
├──────────────────────────────────────────────────────────────┤
│ OTP Service                                                  │
│ Email Service                                                │
│ Payment Service                                              │
│ Notification Service                                         │
│ Event Management                                             │
│ Donation Management                                          │
└─────────────┬──────────────────────────────┬─────────────────┘
              │                              │
              ▼                              ▼

┌──────────────────────────┐      ┌──────────────────────────┐
│ PostgreSQL Database      │      │ External Integrations    │
├──────────────────────────┤      ├──────────────────────────┤
│ Users                    │      │ SMTP Email              │
│ Churches                 │      │ Stripe         │
│ Events                   │      │ Live Streaming API      │
│ Donations                │      │ SMS Gateway (OTP)       │
│ Prayer Requests          │      └──────────────────────────┘
│ Roles & Permissions      │
└──────────────────────────┘