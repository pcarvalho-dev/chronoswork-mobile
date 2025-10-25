# Chronos.work Web Frontend - Comprehensive Analysis

## 1. Dashboard Design and Layout

### Overall Structure
The dashboard follows a modern, responsive grid layout with:
- **Sticky Navigation Bar** at the top with logo and profile menu
- **Main Content Area** with three key sections:
  1. **Check In/Out Card** (2/3 width on desktop)
  2. **Statistics Card** (1/3 width on desktop)
  3. **Time Logs History** (full width below)

### Responsive Breakpoints
- Mobile: Single column layout (1 column)
- Tablet/Desktop: Grid layout (3 columns for stats row)
- Tailwind classes: `grid grid-cols-1 lg:grid-cols-3 gap-6`

### Color Scheme

**Primary Colors:**
- Primary Blue: `#3b82f6` (500) to `#1e3a8a` (900)
- Used for buttons, highlights, and accent elements
- Gradient buttons: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

**Neutral Colors (WarmGrey):**
- 50: `#fafaf9` (very light)
- 900: `#1c1917` (very dark)
- Used for text, backgrounds, and borders

**Status Colors:**
- Active/In Progress: Blue (`#3b82f6`)
- Completed: Green (`#22c55e`)
- Break Time: Orange
- Inactive: Grey

**Background:**
- Animated gradient mesh with purple, pink, and blue blobs
- Base gradient: `linear-gradient(135deg, #e0e7ff 0%, #fce7f3 50%, #ddd6fe 100%)`
- Glassmorphism effects with backdrop blur and transparency

---

## 2. Data/Metrics Displayed

### Dashboard Statistics Card (Right Side)

1. **Último Ponto (Last Checkpoint)**
   - Shows formatted date/time of last check-in or check-out
   - Format: "DD de MMM HH:mm"

2. **Tempo desde último ponto (Time Since Last Checkpoint)**
   - Displays elapsed time since last check-in/checkout
   - Format: "Xh Ym"

3. **Horas trabalhadas hoje (Worked Hours Today)**
   - Sum of completed sessions for current day only
   - Excludes weekends
   - Format: "Xh Ym"

4. **Intervalo do Dia (Break Time Today)**
   - Calculated from gaps between checkouts and next check-ins
   - Shows "Previsto" (Predicted) if less than 2 sessions completed
   - Format: "Xh Ym"

5. **Banco de Horas Total (Hours Bank)**
   - Cumulative calculation from first log date
   - Formula: (Total Worked Hours) - (Expected Hours: 8h/working day)
   - Shows: "+Xh Ym" (surplus) or "-Xh Ym" (deficit)
   - Only counts completed sessions
   - Excludes weekends

### Check In/Out Card (Left Side - Active Session)

When session is active:
- Green notification badge "Sessão Ativa" with pulsing dot
- Check-in timestamp
- Duration (updates in real-time)
- Checkout button

When no active session:
- Empty state message
- Checkin button

### Current Time & Weather Section
- Real-time clock (updates every second)
- OpenWeatherMap integration with:
  - Current temperature (Celsius)
  - Weather description
  - Weather icon

### Inspirational Quote
- Random daily quote from 65+ Portuguese motivational quotes
- Author attribution
- Changes on page reload

### Time Logs History
- Chronological list (newest first)
- For each log:
  - Status badge (Concluída/Completed or Ativa/Active)
  - Check-in time with photo/location icons
  - Check-out time with photo/location icons
  - Duration calculation
  - Interactive photo viewer
  - Google Maps links for locations

---

## 3. UI Components Used

### Built-In Components (React/Next.js)
- `Image` component from Next.js (for logo)
- Native HTML elements with Tailwind styling

### Custom Components (in `/app/components/`)

1. **CameraCapture.tsx**
   - Modal for capturing check-in/checkout photos
   - Features:
     - Access to device camera (front-facing)
     - 16:9 aspect ratio video preview
     - Circular guide overlay for face positioning
     - Retake functionality
     - Converts to JPEG with 0.8 quality

2. **PhotoViewer.tsx**
   - Lightbox for viewing check-in/checkout photos
   - Features:
     - Side-by-side comparison mode for check-in/out photos
     - Navigation arrows (previous/next)
     - Keyboard support (arrows, Escape)
     - Photo counter
     - Timestamp display for each photo
     - Toggle between single and comparison view

3. **InteractiveBackground.tsx**
   - Animated gradient background with mouse-following effect
   - Multiple animated blobs with different colors and animation delays
   - Mouse position tracking (throttled at 30fps)

### Button Styles

1. **btn-primary**
   - Gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
   - White text
   - Hover brightness increase
   - Rounded corners (xl = 1rem)

2. **btn-secondary**
   - White/40 background with backdrop blur
   - Border: white/20
   - Dark grey text
   - Hover state increases opacity to white/60

3. **btn-ghost**
   - White/20 background with backdrop blur
   - Primary blue text
   - Subtle hover effect

### Card/Container Styles

1. **glass-container**
   - Background: `bg-white/40` with `backdrop-blur-xl`
   - Border: `border-white/30`
   - Rounded corners: `rounded-3xl`
   - Shadow: `0 8px 32px rgba(31, 38, 135, 0.15)`

2. **badge**
   - Small pill-shaped elements
   - White/40 background, white/30 border
   - Used for status indicators

### Input Styles
- Glass effect with backdrop blur
- Focus state with primary blue ring
- Rounded corners (xl)

---

## 4. Color Scheme and Theme Details

### Tailwind Configuration
```javascript
colors: {
  primary: {
    50-950: Blue gradient (#eff6ff to #172554)
  },
  warmGrey: {
    50-950: Warm neutral gradient (#fafaf9 to #0c0a09)
  }
}
```

### Font Family
- **Primary Font:** Inter (system-ui fallback)
- **Monospace:** JetBrains Mono

### Spacing System
- Base Tailwind spacing (0.25rem, 0.5rem, etc.)
- Custom sizes:
  - `navbar: 64px`
  - `container: 1200px`

### Border Radius Scale
- `sm: 0.25rem`
- `DEFAULT: 0.375rem`
- `md: 0.5rem`
- `lg: 0.75rem`
- `xl: 1rem` (commonly used)

### Animation
- **Blob animation:** 20s ease-in-out infinite
  - Translates and scales smoothly
  - Used for background elements
- **Float animation:** 6s ease-in-out infinite
- **Pulse animation:** Used for active session indicator

---

## 5. Features Available

### Core Time Tracking
1. **Check-in Function**
   - Captures photo from device camera
   - Records latitude/longitude
   - Stores timestamp (ISO format)
   - Shows "Sessão Ativa" notification

2. **Check-out Function**
   - Requires active session
   - Captures photo from device camera
   - Records latitude/longitude
   - Calculates duration automatically

### Photo Management
- Photo capture modal with real-time preview
- Photo viewer with:
  - Single photo view
  - Side-by-side comparison (check-in vs check-out)
  - Keyboard navigation
  - Full-screen compatible aspect ratio

### Location Tracking
- GPS coordinates captured at check-in and check-out
- Google Maps links for viewing check-in location (green marker)
- Google Maps links for viewing check-out location (red marker)

### Statistics & Analytics
- Real-time duration calculation for active sessions
- Daily worked hours (sum of completed sessions)
- Break time calculation between sessions
- Monthly hours bank (positive/negative balance)
- Last checkpoint timestamp

### Profile Management
- Profile photo upload/change
- User profile dropdown in navbar
- Photo display in circular avatar (fallback gradient if no photo)

### Weather Integration
- Real-time weather display with:
  - Current temperature
  - Weather condition description
  - Weather icon from OpenWeatherMap
- Geolocation-based (requests user permission)
- Fallback UI if weather unavailable

### Inspirational Quotes
- 65+ Portuguese motivational quotes
- Random quote displayed daily
- Author attribution

### Error Handling
- Graceful error messages for:
  - Failed camera access
  - Network errors
  - Photo upload failures
  - Geolocation failures

---

## 6. API Endpoints Being Called

### Base URL
- **Development:** `http://localhost:8000`
- Configured via `NEXT_PUBLIC_API_URL`

### Authentication Endpoints
1. `POST /auth/login`
   - Body: `{ email, password }`
   - Returns: `{ message, user, accessToken, refreshToken }`

2. `POST /auth/register`
   - Body: `RegisterData` (see data structure section)
   - Returns: `{ message, user, accessToken, refreshToken }`

3. `POST /auth/refresh-token`
   - Body: `{ refreshToken }`
   - Returns: `{ accessToken, refreshToken }`

4. `POST /auth/logout`
   - Returns: `{ message }`

5. `GET /auth/profile`
   - Returns: `{ user: User }`

6. `POST /auth/upload-photo`
   - Body: FormData with `photo` file
   - Returns: `{ message, profilePhoto: string }`

### Time Logging Endpoints
1. `POST /timelog/checkin`
   - Body: FormData with:
     - `photo` (File)
     - `checkInLatitude` (string)
     - `checkInLongitude` (string)
   - Returns: Check-in response

2. `POST /timelog/checkout`
   - Body: FormData with:
     - `photo` (File)
     - `checkOutLatitude` (string)
     - `checkOutLongitude` (string)
   - Returns: Check-out response

3. `GET /timelog`
   - Returns: `TimeLog[]`

### External APIs
1. **OpenWeatherMap**
   - Endpoint: `https://api.openweathermap.org/data/2.5/weather`
   - Params: `lat`, `lon`, `units=metric`, `lang=pt_br`, `appid`
   - Returns: Weather data with icon, temp, description

---

## 7. Data Structures

### TimeLog Interface
```typescript
interface TimeLog {
  id: number;
  checkIn: string;                    // ISO timestamp
  checkOut: string | null;            // ISO timestamp or null
  checkInPhoto?: string;              // URL path
  checkOutPhoto?: string;             // URL path
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
```

### User Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  profilePhoto?: string;              // URL path

  // Personal Information
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;

  // Contact Information
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Employment Information
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  workSchedule?: string;
  employmentType?: string;
  directSupervisor?: string;

  // Financial Information
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  bankAccountType?: string;
  pix?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Additional
  education?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### RegisterData Interface
(Same as User, but required fields are: name, email, password)

### AuthResponse Interface
```typescript
interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### Weather Data
```typescript
interface WeatherData {
  temp: number;           // Celsius
  description: string;    // e.g., "partly cloudy"
  icon: string;          // Icon code from OpenWeatherMap
}
```

---

## 8. State Management & Data Flow

### Auth Context
- Manages user login/logout state
- Stores access and refresh tokens in localStorage
- Auto-refreshes token on 401 response
- Loads user profile on app mount

### Dashboard State
```typescript
// Time data
const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
const [currentSession, setCurrentSession] = useState<TimeLog | null>(null);

// UI state
const [loading, setLoading] = useState(true);
const [actionLoading, setActionLoading] = useState(false);
const [error, setError] = useState('');
const [showProfileMenu, setShowProfileMenu] = useState(false);
const [showCamera, setShowCamera] = useState(false);
const [cameraAction, setCameraAction] = useState<'checkin' | 'checkout' | null>(null);

// Display data
const [currentTime, setCurrentTime] = useState('');
const [weather, setWeather] = useState<WeatherData | null>(null);
const [dailyQuote, setDailyQuote] = useState(inspirationalQuotes[0]);

// Photo viewing
const [photoViewerPhotos, setPhotoViewerPhotos] = useState<PhotoData[]>([]);
const [photoViewerInitialIndex, setPhotoViewerInitialIndex] = useState<number>(0);
```

### Data Refresh Strategy
- Auto-fetch time logs on mount
- Auto-refresh stats every 60 seconds
- Update time display every 1 second
- Manual refresh after check-in/out actions

---

## 9. Authentication & Token Management

### Token Storage
- Uses localStorage
- Keys: `accessToken`, `refreshToken`
- JWT tokens (Bearer authentication)

### Token Refresh Flow
1. Request fails with 401 status
2. Client checks if token refresh is already in progress
3. If not, initiates refresh-token request
4. Waits for token refresh promise
5. Retries original request with new token
6. If refresh fails, clears tokens and redirects to login

### Protected Routes
- Dashboard requires authentication
- Failed auth redirects to login page

---

## 10. Key Implementation Details

### Camera Capture
- Uses `navigator.mediaDevices.getUserMedia()`
- Front-facing camera: `facingMode: 'user'`
- Ideal resolution: 1280x720
- Converts to JPEG with 0.8 quality
- Handles permission errors gracefully

### Geolocation
- Uses `navigator.geolocation.getCurrentPosition()`
- High accuracy requested (timeout: 10s)
- Permissions must be granted by user
- Fallback if not supported

### Time Calculations
- Uses JavaScript Date objects
- Locale: Portuguese Brazil (pt-BR)
- All calculations in milliseconds
- Working days: Monday-Friday (0=Sunday, 6=Saturday)

### Photo URL Construction
- Backend URL: `http://localhost:8000{photo_path}`
- Returns relative paths from API
- Full URLs constructed in frontend

---

## 11. Recommended Mobile App Alignment

### Design Consistency
1. Use same color scheme (Primary Blue #3b82f6, WarmGrey)
2. Maintain glassmorphism aesthetic
3. Use similar button styles and spacing
4. Keep gradient text styling

### Feature Parity
1. Check-in/out with photo and location
2. Real-time duration tracking
3. Statistics display (hours, break time, bank)
4. Time logs history
5. Profile photo management
6. Weather integration

### API Integration
1. Use exact same endpoints
2. Same authentication flow
3. Same token management
4. Same data structures
5. Handle same error scenarios

### Data Display
1. Time format: Portuguese locale (pt-BR)
2. Duration format: "Xh Ym"
3. Date format: "DD de MMM HH:mm"
4. Show status badges (Ativa, Concluída)
5. Display map links for locations

### Mobile-Specific Considerations
1. Use native camera (less feature-rich than web version)
2. Simpler photo viewer (full-screen vs comparison)
3. Touch-optimized buttons (larger hit targets)
4. Simplified layout for small screens
5. More compact statistics display

