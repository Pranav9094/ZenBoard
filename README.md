# ZenBoard

A stunning single-page personal productivity dashboard with a desktop OS-inspired interface. Built with pure HTML, CSS, and JavaScript — zero external libraries, zero frameworks, no CDN imports.

![Version](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

![ZenBoard Dashboard](https://img.shields.io/badge/ZenBoard-Productivity%20Dashboard-purple?style=for-the-badge)

## ✨ Features

### Widgets

1. **Live Clock** — Real-time HH:MM:SS display with:
   - CSS 3D digit-flip animation
   - Animated date display
   - Rotating glow effect on hover
   - Gradient text with shimmer

2. **Pomodoro Timer** — 25-minute work / 5-minute break cycles with:
   - Breathing circle animation
   - SVG progress ring with glow effects
   - Web Audio API ascending chime on cycle complete
   - Focus mode toggle button
   - Timer notifications

3. **Sticky Notes** — Draggable notes with:
   - Contenteditable support
   - 8 vibrant color options
   - Smooth slide-in animations
   - Add/delete with animations
   - localStorage persistence
   - Hover reveal action buttons

4. **Todo List** — Task management with:
   - Add tasks with Enter key
   - Click to toggle completion (animated strikethrough)
   - Delete button with rotation animation
   - Glowing priority badges (Low/Medium/High)
   - Slide-in entry animations
   - localStorage persistence

5. **Daily Goals** — Track up to 3 goals with:
   - Animated SVG progress rings
   - 3 subtask checkboxes per goal
   - Smooth progress animations
   - Completion celebration sound
   - localStorage persistence

### Enhanced Visual Features

- **Dark theme base** — Background `#0F0F1A`
- **4 mood themes** — Focus, Chill, Energy, Dark with unique color palettes
- **Glassmorphism cards** — `backdrop-filter: blur(12px)` with animated borders
- **Enhanced particle canvas** — 120 particles with:
  - Wave motion background
  - Mouse repel/attract dynamics
  - Glowing trail effects
  - Connection lines between particles
  - Wall spark effects
  - Theme-based hue shifting
- **Micro-animations**:
  - Widget hover: `translateY(-6px) scale(1.02)`
  - Button click: `scale(0.95)`
  - Logo shimmer effect
  - Theme button pulse
  - Rotating background gradient
- **Notification system** — Toast notifications for actions
- **Stats tracking** — Tasks completed, focus time, sessions

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle focus mode |
| `N` | Create new note |
| `Space` | Pause/resume timer |
| `Esc` | Cancel input / exit focus mode |

## File Structure

```
ZENBOARD/
├── index.html        # Main entry point
├── style.css         # Enhanced styles with animations
├── app.js            # Application logic with notifications
├── canvas.js         # Advanced particle engine
└── README.md         # Documentation
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pranav9094/ZenBoard.git
   cd ZenBoard
   ```

2. Open `index.html` in any modern web browser.

No build process or dependencies required!

## Usage

### Theme Switching
Click the theme buttons in the header to switch between modes:
- **Focus** (🎯) — Purple accent, 1.2x particle speed
- **Chill** (🌙) — Cyan accent, 0.6x particle speed
- **Energy** (⚡) — Pink accent, 1.8x particle speed
- **Dark** (🌑) — Gray accent, 0.8x particle speed

Each theme changes the accent color, glow intensity, and particle animation speed.

### Focus Mode
Press `F` or click the target icon to enter Focus Mode:
- All widgets fade out smoothly
- Full-screen overlay with pulsing icon
- Minimal distraction environment
- Press `F` or `Esc` to exit

### Data Persistence
All data is automatically saved to `localStorage`:
- `zb_notes` — Sticky notes data
- `zb_todos` — Todo list items
- `zb_goals` — Daily goals with progress
- `zb_stats` — Usage statistics
- `zb_settings` — Theme preference

## Visual Enhancements (v2.0)

### UI Improvements & Animations
- **Staggered widget entrance** — Widgets fade in sequentially on page load
- **3D digit flip** — Clock numbers flip with perspective transform
- **Breathing timer ring** — Expands/contracts with glow intensity
- **Streamlined Goals Layout** — Responsive auto-filling horizontal grid for Daily Goals, maximizing screen space and reducing vertical scroll footprint.
- **2-Column Notes Design** — Structured dual-column grid system for perfectly aligned workspaces alongside built-in introductory notes for newcomers.
- **Note slide-in** — New notes slide from the left
- **Todo slide-in** — Tasks animate from the left with stagger
- **Goal fade-in** — Goals scale up smoothly
- **Checkbox pop** — Completion checkmark pops with rotation
- **Delete rotation** — Delete buttons rotate 90° on hover
- **Add button spin** — Plus button rotates 90° on hover

### Particle System Upgrades
- **120 particles** (up from 80)
- **4 particle types**: Normal, Glow, Pulse, Trail
- **Wave motion background** — Flowing sine wave lines
- **Mouse velocity tracking** — Faster movement = stronger repel
- **Trail rendering** — Particles leave glowing trails
- **Glow effects** — Radial gradient glows on special particles
- **Connection gradients** — Lines gradient-matched to particle colors
- **Wall sparks** — Visual feedback on boundary collision
- **Theme hue sync** — Particle colors match selected theme

### Notification System
- Toast notifications for:
  - Task completion (success)
  - Note creation/deletion
  - Goal completion
  - Timer events
  - Errors (max goals, etc.)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires a browser with support for:
- CSS custom properties
- `backdrop-filter`
- `conic-gradient`
- Web Audio API
- `localStorage`
- ES6+ JavaScript

## Changelog

### v2.0 - Enhanced Edition
- ✨ 120 particles with 4 types (Normal, Glow, Pulse, Trail)
- ✨ Wave motion background
- ✨ Toast notification system
- ✨ Stats tracking
- ✨ Enhanced animations (3D flips, spins, pops)
- ✨ Theme-based hue synchronization
- ✨ Mouse velocity tracking
- ✨ Trail effects and wall sparks
- ✨ Success sounds on completions
- ✨ Improved glassmorphism effects

### v1.0 - Initial Release
- Core widgets (Clock, Pomodoro, Notes, Todos, Goals)
- 4 mood themes
- Basic particle system
- localStorage persistence
- Keyboard shortcuts

## License

MIT License — feel free to use and modify for your personal productivity.

---

<p align="center">Made with ❤️ and pure JavaScript</p>
