# Chronos.work Mobile App - Quick Reference Guide

## Colors & Design System

### Brand Colors
```
Primary Blue:       #3b82f6 (used for buttons, highlights)
Gradient Button:    #667eea → #764ba2 (purple to purple-dark)
Active/Status:      #22c55e (green)
Inactive/Neutral:   #78716c (warm grey)
Text Dark:          #1c1917 (warm grey 900)
Text Light:         #78716c (warm grey 500)
Background:         Animated gradient with purple, pink, blue blobs
```

### Status Badge Colors
- Ativa (Active): Blue background with pulsing animation
- Concluída (Completed): Green background with checkmark
- Break Time: Orange text with light background

---

## API Quick Reference

### Base URL
```
Development: http://localhost:8000
Production: (to be configured)
```

### Authentication
```
POST /auth/login
  Input: { email, password }
  Output: { message, user, accessToken, refreshToken }

POST /auth/register
  Input: { name, email, password, ...otherFields }
  Output: { message, user, accessToken, refreshToken }

POST /auth/refresh-token
  Input: { refreshToken }
  Output: { accessToken, refreshToken }

GET /auth/profile
  Output: { user: User }

POST /auth/upload-photo
  Input: FormData { photo: File }
  Output: { message, profilePhoto: string }
```

### Time Logging
```
POST /timelog/checkin
  Input: FormData { photo: File, latitude, longitude }
  Output: { timeLog data }

POST /timelog/checkout
  Input: FormData { photo: File, latitude, longitude }
  Output: { timeLog data }

GET /timelog
  Output: TimeLog[]
```

---

## Data Model Summary

### TimeLog
```
{
  id: number,
  checkIn: string (ISO datetime),
  checkOut: string | null (ISO datetime),
  checkInPhoto: string (URL path),
  checkOutPhoto: string (URL path),
  latitude: number,
  longitude: number,
  outLatitude: number | null,
  outLongitude: number | null,
  user?: { id, name, email }
}
```

### User
```
{
  id: number,
  name: string,
  email: string,
  profilePhoto: string (URL path),
  // ... 40+ other optional fields (personal, employment, financial info)
}
```

---

## Key Features Checklist

### Core Features (Must Have)
- [ ] Check-in with photo + GPS
- [ ] Check-out with photo + GPS
- [ ] Real-time duration display
- [ ] Time logs history
- [ ] Statistics (hours today, break time, hours bank)
- [ ] Profile photo upload
- [ ] Authentication (login/register/logout)

### Nice-to-Have Features
- [ ] Weather integration
- [ ] Inspirational quotes
- [ ] Photo comparison (check-in vs check-out)
- [ ] Google Maps link for locations
- [ ] Real-time clock display
- [ ] Predictive break time indicator

---

## Time Calculations

### Format Constants
```
Date Format: "DD de MMM HH:mm" (e.g., "15 de oct 14:30")
Duration Format: "Xh Ym" (e.g., "8h 30m")
Locale: Portuguese Brazil (pt-BR)
Time Unit: Milliseconds for calculations
```

### Working Hours Logic
```
Working Days: Monday-Friday (excluding weekends)
Daily Target: 8 hours per working day
Hours Bank Calculation:
  = Total Worked Hours - Expected Hours (8h × working days)
  = Positive if surplus, Negative if deficit
  Shows as "+5h 30m" or "-2h 15m"
```

### Statistics Calculations
```
Tempo desde último ponto:
  = Current time - (Last checkout OR Last checkin)

Horas trabalhadas hoje:
  = Sum of all completed sessions for today
  = Excludes weekends
  = Only includes sessions with both checkin AND checkout

Intervalo do Dia:
  = Sum of gaps between checkout and next checkin
  = Shows "Previsto" (Predicted) if < 2 sessions
  = Default prediction: 1h

Último Ponto:
  = Max(all checkouts) OR Max(all checkins if no checkout)
```

---

## Mobile UI Recommendations

### Screen Layout (Recommended Order)
1. **Top Bar** - Sticky navigation
2. **Check-in/out Control** - Primary action (hero section)
3. **Statistics** - Key metrics (collapsible on mobile)
4. **Time Logs** - History with pagination or "Load More"

### Touch-Friendly Sizes
- Button height: 48px minimum
- Touch target size: 44x44px minimum
- Padding: 16px between elements
- Font sizes: 16px+ for body text

### Navigation Pattern
- Bottom tab navigation (preferred for mobile)
  - Home (dashboard)
  - Time Logs (history)
  - Profile (user settings)
- OR Hamburger menu with drawer

### Photo Viewer on Mobile
- Full-screen modal
- Swipe left/right to navigate
- Tap to close
- Consider: comparison view as optional "expand" button

### Camera Integration
- Use native camera (not web camera API)
- Optimize for device capabilities
- Handle permission prompts gracefully
- Show preview before upload

---

## State Management Pattern

### Recommended Approach
```
Global State (Context):
- User authentication state
- User profile data
- Auth tokens (access + refresh)

Local Component State:
- UI state (loading, errors, modals)
- Time logs data
- Form inputs
- Modal visibility flags

Auto-refresh Intervals:
- Time display: every 1 second
- Statistics: every 60 seconds
- Time logs: after user actions
```

---

## Error Handling Strategy

### Common Error Scenarios
1. **Camera/Geolocation Permission Denied**
   - Show user-friendly message
   - Provide instructions to enable permissions
   - Fallback to manual entry if possible

2. **Network Error**
   - Show error alert with retry button
   - Queue action if offline (optional)
   - Use loading indicator during retry

3. **Token Expired**
   - Automatically refresh token
   - Retry failed request with new token
   - Redirect to login if refresh fails

4. **Failed Check-in/Check-out**
   - Display error message
   - Allow user to retry
   - Show last known state

---

## Portuguese Localization Guide

### Key Terms Used in Web Version
```
Painel = Dashboard
Controle de Tempo = Time Control
Entrada = Check-in
Saída = Check-out
Sessão Ativa = Active Session
Concluída = Completed
Horas trabalhadas = Worked Hours
Intervalo do Dia = Daily Break
Banco de Horas = Hours Bank
Gerencie = Manage
Registre = Register
```

### Date/Time Format (pt-BR)
```
Full: "15 de outubro de 2024 14:30"
Short: "15 de out 14:30"
Duration: "8h 30m"
Examples:
- "01 de jan" = January 1st
- "14:30:45" = 2:30:45 PM
- "+5h 30m" = Plus 5 hours 30 minutes
```

---

## Performance Considerations

### Optimization Tips
1. **Image Optimization**
   - Compress camera photos to ~80% quality JPEG
   - Use WebP if supported
   - Lazy load photo previews

2. **Data Fetching**
   - Pagination for time logs (load 10-20 per page)
   - Cache user profile data
   - Use ETag/Last-Modified for conditional requests

3. **Animation**
   - Reduce animation complexity on mobile
   - Use CSS animations instead of JavaScript
   - Disable animated background on low-end devices

4. **Storage**
   - Store tokens in secure storage (not localStorage on mobile)
   - Cache last session state locally
   - Clear cache on logout

---

## Testing Checklist

### Critical Paths
- [ ] Login flow with valid/invalid credentials
- [ ] Check-in: photo capture + geolocation
- [ ] Check-out: photo capture + geolocation
- [ ] View time log with photos
- [ ] Token refresh on 401 response
- [ ] Logout and clear data

### Edge Cases
- [ ] No internet connection
- [ ] Camera permission denied
- [ ] Geolocation permission denied
- [ ] Empty time logs list
- [ ] Active session persistence across page refresh
- [ ] Token expiration during action
- [ ] Very long session duration (>24 hours)
- [ ] Multiple sessions on same day

### UI/UX Testing
- [ ] Responsive layout on various screen sizes
- [ ] Button touch targets meet 44x44px minimum
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Form validation feedback is immediate
- [ ] Animations don't cause jank

---

## Development Checklist

### Before First Release
- [ ] Set correct API URL in environment config
- [ ] Implement token refresh flow
- [ ] Handle all error scenarios
- [ ] Add loading indicators
- [ ] Test on actual device camera/GPS
- [ ] Verify photo upload limits (5MB max)
- [ ] Test on both portrait and landscape
- [ ] Implement offline fallback (optional)
- [ ] Add analytics/crash reporting
- [ ] Security audit (check token handling)

### Before Deployment
- [ ] Change API URL to production
- [ ] Disable console logs
- [ ] Test on multiple devices
- [ ] Performance profiling
- [ ] Security scanning
- [ ] User acceptance testing
- [ ] Documentation complete
- [ ] Backup/rollback plan ready

---

## Quick Alignment Checklist: Web vs Mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| Check-in/out | Camera modal | Native camera |
| Photos | Web camera + file upload | Device camera |
| Map links | Google Maps | Google Maps |
| Statistics | 5 detailed metrics | Top 3 key metrics |
| Time logs | Full history | Last 10 + load more |
| Background | Animated blobs | Static or simpler |
| Weather | Integrated widget | Optional |
| Quotes | 65+ random quotes | Optional |
| Profile photo | Upload modal | Native file picker |
| Theme | Glassmorphism | Native mobile style |
| Navigation | Top navbar | Bottom tabs |

---

## File Structure Reference

```
Web Frontend Location:
/home/pablo/Projetos/chronoswork-front

Key Files:
- app/dashboard/page.tsx      (Main dashboard component)
- app/lib/api.ts              (API client & types)
- app/contexts/AuthContext.tsx (Auth state management)
- app/components/CameraCapture.tsx
- app/components/PhotoViewer.tsx
- app/globals.css             (Global styles & design tokens)
- tailwind.config.js          (Color scheme & theme)
```

---

## Additional Resources

### Documentation Files in This Directory
- `WEB_FRONTEND_ANALYSIS.md` - Comprehensive 11-section analysis
- `DASHBOARD_LAYOUT_VISUAL.md` - Visual layouts and component hierarchy
- `QUICK_REFERENCE.md` - This file

### Key Code Files to Review
1. `/app/dashboard/page.tsx` - 1040 lines, complete dashboard implementation
2. `/app/lib/api.ts` - 412 lines, API client with all endpoints
3. `/app/contexts/AuthContext.tsx` - Auth state and token management
4. `/app/globals.css` - Design tokens and CSS components

