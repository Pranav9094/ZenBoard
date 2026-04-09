# ZenBoard

A single-page personal productivity dashboard with a desktop OS-inspired interface. Built with pure HTML, CSS, and JavaScript — zero external libraries, zero frameworks, no CDN imports.

![ZenBoard Dashboard](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Widgets

1. **Live Clock** — Real-time HH:MM:SS display with CSS digit-flip animation and date display

2. **Pomodoro Timer** — 25-minute work / 5-minute break cycles with:
   - Breathing circle animation
   - SVG progress ring
   - Web Audio API beep on cycle complete
   - Focus mode toggle button

3. **Sticky Notes** — Draggable notes with:
   - Contenteditable support
   - 6 color options
   - Add/delete functionality
   - localStorage persistence

4. **Todo List** — Task management with:
   - Add tasks with Enter key
   - Click to toggle completion (strikethrough)
   - Delete button
   - Priority badges (Low/Medium/High)
   - localStorage persistence

5. **Daily Goals** — Track up to 3 goals with:
   - SVG progress rings
   - 3 subtasks per goal
   - Animated stroke-dashoffset on progress update
   - localStorage persistence

### Visual Features

- **Dark theme base** — Background `#0F0F1A`
- **4 mood themes** — Focus, Chill, Energy, Dark (using CSS custom properties)
- **Glassmorphism cards** — `background: rgba(255,255,255,0.05)`, `backdrop-filter: blur(12px)`
- **Particle canvas** — 80 particles at 60fps with mouse repel (80px radius)
- **Micro-animations** — Widget hover (`translateY(-4px)`), button click (`scale(0.97)`)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Toggle focus mode |
| `N` | Create new note |
| `Space` | Pause/resume timer (when active) |
| `Esc` | Cancel active input / exit focus mode |

## File Structure

```
ZENBOARD/
├── index.html    # Main entry point
├── style.css     # All styles and theme definitions
├── app.js        # Application logic and widget controllers
├── canvas.js     # Particle animation engine
└── README.md     # This file
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pranav9094/ZenBoard.git
   ```

2. Open `index.html` in any modern web browser.

No build process or dependencies required!

## Usage

### Theme Switching
Click the theme buttons in the header to switch between Focus, Chill, Energy, and Dark modes. Each theme changes the accent color and particle animation speed.

### Focus Mode
Press `F` or click the target icon to enter Focus Mode, which hides all widgets with a smooth fade animation.

### Data Persistence
All notes, todos, and goals are automatically saved to `localStorage` with keys:
- `zb_notes` — Sticky notes data
- `zb_todos` — Todo list items
- `zb_goals` — Daily goals with progress

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari

Requires a browser with support for:
- CSS custom properties
- `backdrop-filter`
- Web Audio API
- `localStorage`

## License

MIT License — feel free to use and modify for your personal productivity.
