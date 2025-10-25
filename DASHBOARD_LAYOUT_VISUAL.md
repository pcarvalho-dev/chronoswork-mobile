# Chronos.work Dashboard - Visual Layout & Component Map

## Dashboard Page Layout (Desktop View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NAVIGATION BAR                                  │
│  [Logo] Chronos.work                                    [Avatar] [Dropdown]  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            MAIN CONTENT AREA                                 │
│                                                                               │
│  [Title] Painel                                                              │
│  [Subtitle] Gerencie seu tempo de trabalho                                   │
│                                                                               │
│  ┌──────────────────────────────────────┬──────────────────────────────────┐ │
│  │                                      │                                  │ │
│  │  CHECK IN/OUT CARD (2/3 width)      │  STATISTICS CARD (1/3 width)    │ │
│  │  ┌────────────────────────────────┐ │  ┌──────────────────────────────┐ │ │
│  │  │ 🕐 Controle de Tempo           │ │  │ 📊 Estatísticas              │ │ │
│  │  │ Registre suas horas de trabalho │ │  │ Resumo geral                 │ │ │
│  │  ├────────────────────────────────┤ │  ├──────────────────────────────┤ │ │
│  │  │                                │ │  │                              │ │ │
│  │  │ [ACTIVE STATE]                │ │  │ Último Ponto                 │ │ │
│  │  │ 🟢 Sessão Ativa               │ │  │ [Date/Time]                  │ │ │
│  │  │ Iniciado em: [DATE/TIME]      │ │  ├──────────────────────────────┤ │ │
│  │  │ ⬆️ Duração: [2h 30m]          │ │  │ Tempo desde último ponto      │ │ │
│  │  │                                │ │  │ [2h 30m]                     │ │ │
│  │  │ [Registrar Saída] Button       │ │  ├──────────────────────────────┤ │ │
│  │  │                                │ │  │ Horas trabalhadas hoje       │ │ │
│  │  │ ┌────────────────────────────┐ │ │  │ [6h 45m]                     │ │ │
│  │  │ │ "Citação inspiradora..."   │ │ │  ├──────────────────────────────┤ │ │
│  │  │ │ — Autor da Citação         │ │ │  │ Intervalo do Dia             │ │ │
│  │  │ │                            │ │ │  │ [1h 0m] (Previsto)           │ │ │
│  │  │ │ 🕐 14:30:45  28°C 🌤️      │ │ │  ├──────────────────────────────┤ │ │
│  │  │ └────────────────────────────┘ │ │  │ Banco de Horas Total         │ │ │
│  │  │                                │ │  │ +5h 30m                      │ │ │
│  │  └────────────────────────────────┘ │  └──────────────────────────────┘ │ │
│  │                                      │                                  │ │
│  └──────────────────────────────────────┴──────────────────────────────────┘ │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     TIME LOGS HISTORY (Full Width)                      │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 🕐 Histórico de Registros                                           │ │ │
│  │  │ Todas as suas sessões de trabalho                                   │ │ │
│  │  ├─────────────────────────────────────────────────────────────────────┤ │ │
│  │  │                                                                     │ │ │
│  │  │ [✓ Concluída] Log Entry #1                          Duração: 8h 0m │ │ │
│  │  │ ⬆️ Entrada: 08:00 - 15 Oct [📷] [📍]                               │ │ │
│  │  │ ⬇️ Saída: 16:00 - 15 Oct [📷] [📍]                                │ │ │
│  │  │                                                                     │ │ │
│  │  │ [✓ Concluída] Log Entry #2                          Duração: 7h 30m │ │ │
│  │  │ ⬆️ Entrada: 08:30 - 14 Oct [📷] [📍]                               │ │ │
│  │  │ ⬇️ Saída: 16:00 - 14 Oct [📷] [📍]                                │ │ │
│  │  │                                                                     │ │ │
│  │  │ [🔵 Ativa] Log Entry #3                             Duração: 2h 45m │ │ │
│  │  │ ⬆️ Entrada: 12:00 - 15 Oct [📷] [📍]                               │ │ │
│  │  │ ⬇️ Saída: Em andamento...                                           │ │ │
│  │  │                                                                     │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile View (Single Column)

```
┌─────────────────────────────┐
│   NAVIGATION BAR           │
│ [Logo]            [Avatar] │
└─────────────────────────────┘

┌─────────────────────────────┐
│  CHECK IN/OUT CARD          │
│  🕐 Controle de Tempo       │
│  ┌─────────────────────────┐ │
│  │ 🟢 Sessão Ativa         │ │
│  │ Iniciado em: [DATE]     │ │
│  │ ⬆️ Duração: [2h 30m]    │ │
│  │ [Registrar Saída]       │ │
│  │                         │ │
│  │ [Citação...]            │ │
│  │ 🕐 14:30  28°C 🌤️      │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│  STATISTICS CARD            │
│  📊 Estatísticas            │
│  ┌─────────────────────────┐ │
│  │ Último Ponto            │ │
│  │ [Date/Time]             │ │
│  ├─────────────────────────┤ │
│  │ Tempo último ponto      │ │
│  │ [2h 30m]                │ │
│  ├─────────────────────────┤ │
│  │ Horas trabalhadas hoje  │ │
│  │ [6h 45m]                │ │
│  ├─────────────────────────┤ │
│  │ Intervalo do Dia        │ │
│  │ [1h 0m]                 │ │
│  ├─────────────────────────┤ │
│  │ Banco de Horas Total    │ │
│  │ +5h 30m                 │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘

┌─────────────────────────────┐
│  TIME LOGS HISTORY          │
│  🕐 Histórico de Registros  │
│  ┌─────────────────────────┐ │
│  │ [✓ Concluída]           │ │
│  │ ⬆️ 08:00 - 15 Oct      │ │
│  │    [📷] [📍]            │ │
│  │ ⬇️ 16:00 - 15 Oct      │ │
│  │    [📷] [📍]            │ │
│  │ Duração: 8h 0m          │ │
│  ├─────────────────────────┤ │
│  │ [✓ Concluída]           │ │
│  │ ⬆️ 08:30 - 14 Oct      │ │
│  │    [📷] [📍]            │ │
│  │ ⬇️ 16:00 - 14 Oct      │ │
│  │    [📷] [📍]            │ │
│  │ Duração: 7h 30m         │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

## Component Hierarchy

```
Dashboard Page (page.tsx)
├── InteractiveBackground
│   └── Animated gradient mesh with blobs
│
├── Navigation Bar
│   ├── Logo (Next.js Image)
│   └── Profile Menu
│       ├── Upload Photo Button
│       └── Logout Button
│
├── Main Content Container
│   │
│   ├── Page Title & Subtitle
│   │
│   ├── Error Alert (if present)
│   │
│   ├── Check In/Out Card (glass-container)
│   │   ├── Card Header with icon
│   │   ├── Active Session State
│   │   │   ├── Green notification badge
│   │   │   ├── Check-in info
│   │   │   ├── Duration display
│   │   │   └── Check-out button
│   │   ├── OR Inactive State
│   │   │   ├── Empty state message
│   │   │   └── Check-in button
│   │   └── Quote & Weather Section
│   │       ├── Inspirational quote
│   │       ├── Real-time clock
│   │       └── Weather widget
│   │
│   ├── Statistics Card (glass-container)
│   │   ├── Card Header with icon
│   │   ├── Stat Item: Last Checkpoint
│   │   ├── Stat Item: Time Since Last
│   │   ├── Stat Item: Today's Hours
│   │   ├── Stat Item: Break Time
│   │   └── Stat Item: Hours Bank
│   │
│   └── Time Logs History (glass-container)
│       ├── Card Header with icon
│       ├── Loading State (spinner) | Empty State | Logs List
│       └── Time Log Item (repeated)
│           ├── Status badge
│           ├── Check-in row
│           │   ├── Time & date
│           │   ├── Photo button (if available)
│           │   └── Location button (if available)
│           ├── Check-out row
│           │   ├── Time & date (or "Em andamento...")
│           │   ├── Photo button (if available)
│           │   └── Location button (if available)
│           └── Duration display
│
├── CameraCapture Modal (conditional)
│   ├── Video preview with guide circle
│   ├── Captured photo preview
│   ├── Retake/Confirm buttons
│   └── Cancel button
│
└── PhotoViewer Modal (conditional)
    ├── Header with title & close button
    ├── Compare mode toggle
    ├── Single Photo View
    │   ├── Full-size photo
    │   ├── Navigation arrows
    │   ├── Photo info (type & timestamp)
    │   └── Keyboard shortcuts info
    └── Compare View
        ├── Check-in photo (left)
        ├── Check-out photo (right)
        └── Both with timestamps
```

## State Flow Diagram

```
User Interaction Flow:

1. INITIAL LOAD
   └─> loadUserProfile() → Set user in Auth context
   └─> fetchTimeLogs() → Set timeLogs state
   └─> fetchWeather() → Set weather state
   └─> setDailyQuote() → Random quote selection
   └─> setCurrentTime() → Real-time clock update

2. CHECK-IN FLOW
   User clicks "Registrar Entrada"
   └─> setCameraAction('checkin')
   └─> setShowCamera(true)
   └─> CameraCapture modal opens
   └─> User captures photo
   └─> handlePhotoCapture('checkin')
       ├─> Get geolocation (GPS)
       ├─> POST /timelog/checkin with FormData
       ├─> fetchTimeLogs() → Update time logs
       └─> setCurrentSession() → New session is now active

3. CHECK-OUT FLOW
   User clicks "Registrar Saída" (when session active)
   └─> setCameraAction('checkout')
   └─> setShowCamera(true)
   └─> CameraCapture modal opens
   └─> User captures photo
   └─> handlePhotoCapture('checkout')
       ├─> Get geolocation (GPS)
       ├─> POST /timelog/checkout with FormData
       ├─> fetchTimeLogs() → Update time logs
       └─> setCurrentSession(null) → Session is now complete

4. VIEW PHOTO FLOW
   User clicks photo icon next to check-in/out
   └─> handleViewPhoto()
       ├─> Build photos array from log
       ├─> setPhotoViewerPhotos()
       ├─> setPhotoViewerInitialIndex()
       └─> PhotoViewer modal opens

5. AUTO-REFRESH FLOW
   On component mount:
   └─> timeInterval: Update clock every 1 second
   └─> statsInterval: Refresh time logs every 60 seconds
```

## Key CSS Classes Reference

### Layout Classes
- `.container-custom` - Max width 1200px with horizontal padding
- `.glass-container` - Glassmorphism card with blur and transparency
- `.card` - Standard card with subtle shadow

### Button Classes
- `.btn-primary` - Gradient purple/blue, white text
- `.btn-secondary` - White with backdrop blur
- `.btn-ghost` - Transparent with primary text
- `.btn` - Base button styles

### Text Classes
- `.gradient-text` - Purple-to-blue gradient text
- `.badge` - Small rounded pill for status labels

### Responsive Classes
- `grid grid-cols-1 lg:grid-cols-3` - Mobile: 1 col, Desktop: 3 cols
- `lg:col-span-2` - 2 columns on large screens
- `max-w-container` - Container max width

## Animation Classes
- `.animate-blob` - 20s floating blob animation
- `.animate-pulse` - Pulsing effect for active indicators
- `.animate-spin` - Loading spinner

---

## Mobile App Alignment Recommendations

### Layout Adaptation
1. Keep 1-column layout for all screen sizes
2. Full-width cards (no need for 3-column grid)
3. Larger touch targets for buttons (48px minimum)
4. Adjusted padding/margins for smaller screens

### Component Simplification
1. Camera: Use native camera control
2. Photo Viewer: Single photo view initially, optional comparison
3. Background: Simpler or static background to save resources
4. Quote: Keep optional but simpler display

### Data Display Optimization
1. Collapse statistics into a horizontal scroll or tabbed view
2. Time logs: Show last 5-10 only, with load more option
3. Inline display for quick stats

### Navigation
1. Bottom tab navigation (home, time logs, profile)
2. Simplified profile menu (less complex dropdown)
3. Hamburger menu for additional options if needed
