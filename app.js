/**
 * ZenBoard Application Logic
 * Main application controller for all widgets and features
 */

(function() {
  'use strict';

  // ============================================
  // Storage Keys
  // ============================================
  const STORAGE_KEYS = {
    NOTES: 'zb_notes',
    TODOS: 'zb_todos',
    GOALS: 'zb_goals'
  };

  // ============================================
  // Note Colors
  // ============================================
  const NOTE_COLORS = [
    'rgba(255, 255, 255, 0.1)',
    'rgba(108, 92, 231, 0.3)',
    'rgba(0, 206, 201, 0.25)',
    'rgba(253, 121, 168, 0.25)',
    'rgba(253, 203, 110, 0.25)',
    'rgba(0, 184, 148, 0.25)'
  ];

  // ============================================
  // DOM Elements Cache
  // ============================================
  const elements = {};

  // ============================================
  // State
  // ============================================
  const state = {
    notes: [],
    todos: [],
    goals: [],
    timer: {
      mode: 'work',
      timeRemaining: 25 * 60,
      isRunning: false,
      workDuration: 25 * 60,
      breakDuration: 5 * 60
    },
    focusMode: false,
    currentTheme: 'focus'
  };

  // ============================================
  // Utility Functions
  // ============================================

  // Generate unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save data to localStorage
  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Load data from localStorage
  function loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return null;
    }
  }

  // Format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ============================================
  // Clock Widget
  // ============================================

  // Update clock display
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hoursEl = document.getElementById('clock-hours');
    const minutesEl = document.getElementById('clock-minutes');
    const secondsEl = document.getElementById('clock-seconds');
    const dateEl = document.getElementById('clock-date');

    // Update time with flip animation
    const newHours = hours.toString().padStart(2, '0');
    const newMinutes = minutes.toString().padStart(2, '0');
    const newSeconds = seconds.toString().padStart(2, '0');

    if (hoursEl.textContent !== newHours) {
      hoursEl.textContent = newHours;
      hoursEl.classList.add('flip');
      setTimeout(() => hoursEl.classList.remove('flip'), 300);
    }

    if (minutesEl.textContent !== newMinutes) {
      minutesEl.textContent = newMinutes;
      minutesEl.classList.add('flip');
      setTimeout(() => minutesEl.classList.remove('flip'), 300);
    }

    if (secondsEl.textContent !== newSeconds) {
      secondsEl.textContent = newSeconds;
      secondsEl.classList.add('flip');
      setTimeout(() => secondsEl.classList.remove('flip'), 300);
    }

    // Update date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // Initialize clock
  function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ============================================
  // Pomodoro Timer Widget
  // ============================================

  // Audio context for beep sound
  let audioContext = null;

  // Initialize audio context
  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play beep sound
  function playBeep() {
    initAudio();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // Update timer display
  function updateTimerDisplay() {
    const timeEl = document.getElementById('timer-time');
    const modeEl = document.getElementById('timer-mode');
    const progressEl = document.getElementById('timer-progress');
    const startPauseBtn = document.getElementById('timer-start-pause');
    const breathingCircle = document.querySelector('.breathing-circle');

    timeEl.textContent = formatTime(state.timer.timeRemaining);
    modeEl.textContent = state.timer.mode === 'work' ? 'Work' : 'Break';

    // Update progress ring
    const totalDuration = state.timer.mode === 'work'
      ? state.timer.workDuration
      : state.timer.breakDuration;
    const progress = state.timer.timeRemaining / totalDuration;
    const circumference = 2 * Math.PI * 52;
    const offset = circumference * (1 - progress);
    progressEl.style.strokeDashoffset = offset;

    // Update button state
    if (state.timer.isRunning) {
      startPauseBtn.classList.add('running');
      breathingCircle.classList.add('breathing');
    } else {
      startPauseBtn.classList.remove('running');
      breathingCircle.classList.remove('breathing');
    }
  }

  // Timer tick
  function timerTick() {
    if (!state.timer.isRunning) return;

    state.timer.timeRemaining--;

    if (state.timer.timeRemaining <= 0) {
      // Timer complete
      playBeep();

      // Switch mode
      if (state.timer.mode === 'work') {
        state.timer.mode = 'break';
        state.timer.timeRemaining = state.timer.breakDuration;
      } else {
        state.timer.mode = 'work';
        state.timer.timeRemaining = state.timer.workDuration;
      }
    }

    updateTimerDisplay();
  }

  // Start/pause timer
  function toggleTimer() {
    state.timer.isRunning = !state.timer.isRunning;

    if (state.timer.isRunning) {
      // Initialize audio on user interaction
      initAudio();
      setInterval(timerTick, 1000);
    }

    updateTimerDisplay();
  }

  // Reset timer
  function resetTimer() {
    state.timer.isRunning = false;
    state.timer.timeRemaining = state.timer.mode === 'work'
      ? state.timer.workDuration
      : state.timer.breakDuration;
    updateTimerDisplay();
  }

  // Initialize timer
  function initTimer() {
    updateTimerDisplay();

    document.getElementById('timer-start-pause').addEventListener('click', toggleTimer);
    document.getElementById('timer-reset').addEventListener('click', resetTimer);
  }

  // Pause timer (for keyboard shortcut)
  function pauseTimer() {
    if (state.timer.isRunning) {
      state.timer.isRunning = false;
      updateTimerDisplay();
    }
  }

  // Resume timer (for keyboard shortcut)
  function resumeTimer() {
    if (!state.timer.isRunning && state.timer.timeRemaining > 0) {
      state.timer.isRunning = true;
      updateTimerDisplay();
    }
  }

  // ============================================
  // Sticky Notes Widget
  // ============================================

  // Create note element
  function createNoteElement(note) {
    const noteEl = document.createElement('div');
    noteEl.className = 'note-card';
    noteEl.dataset.id = note.id;
    noteEl.style.setProperty('--note-color', note.color || NOTE_COLORS[0]);

    const contentEl = document.createElement('div');
    contentEl.className = 'note-content';
    contentEl.contentEditable = true;
    contentEl.textContent = note.content || '';

    const actionsEl = document.createElement('div');
    actionsEl.className = 'note-actions';

    // Color buttons
    NOTE_COLORS.forEach(color => {
      const colorBtn = document.createElement('button');
      colorBtn.className = 'note-color-btn';
      colorBtn.style.backgroundColor = color;
      colorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        updateNoteColor(note.id, color);
      });
      actionsEl.appendChild(colorBtn);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNote(note.id);
    });
    actionsEl.appendChild(deleteBtn);

    noteEl.appendChild(contentEl);
    noteEl.appendChild(actionsEl);

    // Make draggable
    makeDraggable(noteEl);

    // Save on content change
    contentEl.addEventListener('input', () => {
      updateNoteContent(note.id, contentEl.textContent);
    });

    return noteEl;
  }

  // Make note draggable
  function makeDraggable(noteEl) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    noteEl.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('note-content') ||
          e.target.classList.contains('note-color-btn') ||
          e.target.classList.contains('note-delete-btn')) {
        return;
      }

      isDragging = true;
      noteEl.classList.add('dragging');

      startX = e.clientX;
      startY = e.clientY;

      const rect = noteEl.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      noteEl.style.position = 'absolute';
      noteEl.style.left = `${initialX + dx}px`;
      noteEl.style.top = `${initialY + dy}px`;
      noteEl.style.width = `${rect.width}px`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        noteEl.classList.remove('dragging');
        noteEl.style.position = '';
        noteEl.style.left = '';
        noteEl.style.top = '';
        noteEl.style.width = '';
      }
    });
  }

  // Add new note
  function addNote() {
    const note = {
      id: generateId(),
      content: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: Date.now()
    };

    state.notes.push(note);
    saveNotes();
    renderNotes();
  }

  // Update note content
  function updateNoteContent(id, content) {
    const note = state.notes.find(n => n.id === id);
    if (note) {
      note.content = content;
      saveNotes();
    }
  }

  // Update note color
  function updateNoteColor(id, color) {
    const note = state.notes.find(n => n.id === id);
    if (note) {
      note.color = color;
      saveNotes();
      renderNotes();
    }
  }

  // Delete note
  function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
  }

  // Save notes to localStorage
  function saveNotes() {
    saveToStorage(STORAGE_KEYS.NOTES, state.notes);
  }

  // Render notes
  function renderNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    state.notes.forEach(note => {
      const noteEl = createNoteElement(note);
      container.appendChild(noteEl);
    });
  }

  // Initialize notes
  function initNotes() {
    const saved = loadFromStorage(STORAGE_KEYS.NOTES);
    state.notes = saved || [];
    renderNotes();

    document.getElementById('add-note-btn').addEventListener('click', addNote);
  }

  // ============================================
  // Todo List Widget
  // ============================================

  // Create todo element
  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    checkbox.innerHTML = '<span class="checkmark">✓</span>';
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const badge = document.createElement('span');
    badge.className = `priority-badge ${todo.priority}`;
    badge.textContent = todo.priority;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(badge);
    li.appendChild(deleteBtn);

    return li;
  }

  // Add new todo
  function addTodo(text, priority) {
    if (!text.trim()) return;

    const todo = {
      id: generateId(),
      text: text.trim(),
      completed: false,
      priority: priority || 'medium',
      createdAt: Date.now()
    };

    state.todos.push(todo);
    saveTodos();
    renderTodos();
  }

  // Toggle todo completion
  function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    }
  }

  // Delete todo
  function deleteTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
  }

  // Save todos to localStorage
  function saveTodos() {
    saveToStorage(STORAGE_KEYS.TODOS, state.todos);
  }

  // Render todos
  function renderTodos() {
    const container = document.getElementById('todo-list');
    container.innerHTML = '';

    state.todos.forEach(todo => {
      const todoEl = createTodoElement(todo);
      container.appendChild(todoEl);
    });
  }

  // Initialize todos
  function initTodos() {
    const saved = loadFromStorage(STORAGE_KEYS.TODOS);
    state.todos = saved || [];
    renderTodos();

    const input = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTodo(input.value, prioritySelect.value);
        input.value = '';
      }
    });
  }

  // ============================================
  // Daily Goals Widget
  // ============================================

  // Create goal element
  function createGoalElement(goal) {
    const goalEl = document.createElement('div');
    goalEl.className = 'goal-item';
    goalEl.dataset.id = goal.id;

    // Progress ring
    const progressRing = document.createElement('div');
    progressRing.className = 'goal-progress-ring';

    const svg = document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 50 50');

    const ringBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ringBg.setAttribute('class', 'goal-ring-bg');
    ringBg.setAttribute('cx', '25');
    ringBg.setAttribute('cy', '25');
    ringBg.setAttribute('r', '22');

    const ringProgress = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ringProgress.setAttribute('class', 'goal-ring-progress');
    ringProgress.setAttribute('cx', '25');
    ringProgress.setAttribute('cy', '25');
    ringProgress.setAttribute('r', '22');

    const progressText = document.createElement('div');
    progressText.className = 'goal-ring-text';
    progressText.textContent = `${goal.progress}%`;

    svg.appendChild(ringBg);
    svg.appendChild(ringProgress);
    progressRing.appendChild(svg);
    progressRing.appendChild(progressText);

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'goal-input-container';

    const goalInput = document.createElement('input');
    goalInput.className = 'goal-input';
    goalInput.type = 'text';
    goalInput.placeholder = 'Enter your goal...';
    goalInput.value = goal.text || '';
    goalInput.addEventListener('input', () => {
      updateGoalText(goal.id, goalInput.value);
    });

    const subtasksContainer = document.createElement('div');
    subtasksContainer.className = 'goal-subtasks';

    // Create 3 subtask checkboxes
    for (let i = 0; i < 3; i++) {
      const checkbox = document.createElement('div');
      checkbox.className = `subtask-checkbox ${goal.subtasks[i] ? 'checked' : ''}`;
      checkbox.innerHTML = '<span class="checkmark">✓</span>';
      checkbox.addEventListener('click', () => {
        toggleGoalSubtask(goal.id, i);
      });
      subtasksContainer.appendChild(checkbox);
    }

    inputContainer.appendChild(goalInput);
    inputContainer.appendChild(subtasksContainer);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'goal-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteGoal(goal.id));

    goalEl.appendChild(progressRing);
    goalEl.appendChild(inputContainer);
    goalEl.appendChild(deleteBtn);

    // Update progress ring
    updateGoalProgress(goalEl, goal.progress);

    return goalEl;
  }

  // Update goal progress ring
  function updateGoalProgress(goalEl, progress) {
    const ringProgress = goalEl.querySelector('.goal-ring-progress');
    const progressText = goalEl.querySelector('.goal-ring-text');
    const circumference = 2 * Math.PI * 22;
    const offset = circumference * (1 - progress / 100);

    ringProgress.style.strokeDashoffset = offset;
    progressText.textContent = `${progress}%`;
  }

  // Calculate goal progress
  function calculateGoalProgress(subtasks) {
    const completed = subtasks.filter(s => s).length;
    return Math.round((completed / subtasks.length) * 100);
  }

  // Update goal text
  function updateGoalText(id, text) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.text = text;
      saveGoals();
    }
  }

  // Toggle goal subtask
  function toggleGoalSubtask(id, index) {
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.subtasks[index] = !goal.subtasks[index];
      goal.progress = calculateGoalProgress(goal.subtasks);
      saveGoals();
      renderGoals();
    }
  }

  // Delete goal
  function deleteGoal(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
  }

  // Add new goal
  function addGoal() {
    if (state.goals.length >= 3) return;

    const goal = {
      id: generateId(),
      text: '',
      subtasks: [false, false, false],
      progress: 0,
      createdAt: Date.now()
    };

    state.goals.push(goal);
    saveGoals();
    renderGoals();
  }

  // Save goals to localStorage
  function saveGoals() {
    saveToStorage(STORAGE_KEYS.GOALS, state.goals);
  }

  // Render goals
  function renderGoals() {
    const container = document.getElementById('goals-container');
    container.innerHTML = '';

    state.goals.forEach(goal => {
      const goalEl = createGoalElement(goal);
      container.appendChild(goalEl);
    });

    // Add empty slots if less than 3 goals
    for (let i = state.goals.length; i < 3; i++) {
      const emptyGoal = {
        id: `empty-${i}`,
        text: '',
        subtasks: [false, false, false],
        progress: 0
      };
      const goalEl = createGoalElement(emptyGoal);
      goalEl.querySelector('.goal-input').placeholder = `Goal ${i + 1} (click to add)`;
      goalEl.querySelector('.goal-input').addEventListener('focus', () => {
        if (goalEl.querySelector('.goal-input').placeholder.includes('click to add')) {
          addGoal();
          renderGoals();
        }
      });
      container.appendChild(goalEl);
    }
  }

  // Initialize goals
  function initGoals() {
    const saved = loadFromStorage(STORAGE_KEYS.GOALS);
    state.goals = saved || [];

    // Ensure all goals have progress property
    state.goals.forEach(goal => {
      if (!goal.progress) {
        goal.progress = calculateGoalProgress(goal.subtasks || [false, false, false]);
      }
      if (!goal.subtasks) {
        goal.subtasks = [false, false, false];
      }
    });

    renderGoals();
  }

  // ============================================
  // Theme Switcher
  // ============================================

  // Theme speed multipliers
  const THEME_SPEEDS = {
    focus: 1.2,
    chill: 0.6,
    energy: 1.8,
    dark: 0.8
  };

  // Set theme
  function setTheme(theme) {
    document.body.className = document.body.className
      .replace(/-theme/, '')
      .replace('focus-active', '') + ` ${theme}-theme`;

    state.currentTheme = theme;

    // Update active state on buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Update particle speed
    if (window.ParticleEngine) {
      window.ParticleEngine.updateSpeed(THEME_SPEEDS[theme] || 1);
    }
  }

  // Initialize theme switcher
  function initThemeSwitcher() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
      });
    });

    // Set default theme
    setTheme('focus');
  }

  // ============================================
  // Focus Mode
  // ============================================

  // Toggle focus mode
  function toggleFocusMode() {
    state.focusMode = !state.focusMode;

    if (state.focusMode) {
      document.body.classList.add('focus-active');
      document.getElementById('focus-toggle').classList.add('active');
    } else {
      document.body.classList.remove('focus-active');
      document.getElementById('focus-toggle').classList.remove('active');
    }
  }

  // Initialize focus mode
  function initFocusMode() {
    document.getElementById('focus-toggle').addEventListener('click', toggleFocusMode);
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  // Handle keyboard events
  function handleKeyDown(e) {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' ||
        e.target.tagName === 'SELECT' ||
        e.target.contentEditable === 'true') {
      // Esc still works in inputs
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'f':
        e.preventDefault();
        toggleFocusMode();
        break;

      case 'n':
        e.preventDefault();
        addNote();
        break;

      case ' ':
        e.preventDefault();
        if (state.timer.isRunning) {
          pauseTimer();
        } else {
          resumeTimer();
        }
        break;

      case 'escape':
        e.preventDefault();
        if (state.focusMode) {
          toggleFocusMode();
        }
        break;
    }
  }

  // Initialize keyboard shortcuts
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyDown);
  }

  // ============================================
  // Initialization
  // ============================================

  // Initialize all components
  function init() {
    initClock();
    initTimer();
    initNotes();
    initTodos();
    initGoals();
    initThemeSwitcher();
    initFocusMode();
    initKeyboardShortcuts();
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
