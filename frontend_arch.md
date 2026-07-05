┌──────────────────────────────────────────────────────────────┐
│                         END USERS                            │
│  Members | Visitors | Pastors | Administrators              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├──────────────────────────────────────────────────────────────┤
│ App.jsx                                                      │
│ React Router                                                 │
│ Theme Provider                                               │
│ Layout System                                                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                     COMPONENT LAYER                          │
├──────────────────────────────────────────────────────────────┤
│ Layout.jsx                                                   │
│ Sidebar.jsx                                                  │
│ Navbar.jsx                                                   │
│ AuthLayout.jsx                                               │
│ AdminDashboardHeader.jsx                                     │
│ AddEventModal.jsx                                            │
│ RaisePrayerModal.jsx                                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                       PAGE LAYER                             │
├──────────────────────────────────────────────────────────────┤
│ Landing                                                      │
│ Login                                                        │
│ Signup                                                       │
│ Forgot Password                                              │
│ Reset Password                                               │
│ Dashboard                                                    │
│ Events                                                       │
│ Add Event                                                    │
│ Donations                                                    │
│ Members                                                      │
│ Prayer Requests                                              │
│ Live Stream                                                  │
│ Services                                                     │
│ Service Details                                              │
│ Profile Settings                                             │
│ Admin Login                                                  │
│ Admin User                                                   │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                  STATE MANAGEMENT LAYER                      │
├──────────────────────────────────────────────────────────────┤
│ AuthContext.jsx                                              │
│ User Session                                                 │
│ Authentication State                                         │
│ Role Management                                               │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼

┌──────────────────────────────────────────────────────────────┐
│                    API COMMUNICATION LAYER                   │
├──────────────────────────────────────────────────────────────┤
│ services/api.js                                              │
│ Axios Client                                                 │
│ Request Interceptors                                         │
│ JWT Token Injection                                           │
│ Error Handling                                                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
                    HTTPS/REST
                        │
                        ▼
                 FastAPI Backend