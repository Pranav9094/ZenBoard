/**
 * ZenBoard Application Logic - Enhanced
 * Main application controller with advanced features and animations
 */

(function() {
  'use strict';

  // ============================================
  // Storage Keys
  // ============================================
  const STORAGE_KEYS = {
    NOTES: 'zb_notes',
    TODOS: 'zb_todos',
    GOALS: 'zb_goals',
    STATS: 'zb_stats',
    SETTINGS: 'zb_settings'
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
    'rgba(0, 184, 148, 0.25)',
    'rgba(231, 76, 60, 0.2)',
    'rgba(155, 89, 182, 0.25)'
  ];

  // Theme configurations with hue values for particles
  const THEME_CONFIG = {
    focus: { hue: 260, speed: 1.2, name: 'Focus' },
    chill: { hue: 175, speed: 0.6, name: 'Chill' },
    energy: { hue: 340, speed: 1.8, name: 'Energy' },
    dark: { hue: 200, speed: 0.8, name: 'Dark' }
  };

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
      breakDuration: 5 * 60,
      completedCycles: 0
    },
    focusMode: false,
    currentTheme: 'focus',
    currentTaskFilter: 'all',
    stats: {
      totalTasksCompleted: 0,
      totalFocusTime: 0,
      sessionsToday: 0,
      lastSessionDate: new Date().toDateString()
    }
  };

  // Timer interval reference
  let timerInterval = null;

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

  // Play success sound
  function playSuccessSound() {
    initAudio();
    const now = audioContext.currentTime;

    // Play a pleasant ascending chime
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, now + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

      oscillator.start(now + i * 0.1);
      oscillator.stop(now + i * 0.1 + 0.3);
    });
  }

  // ============================================
  // Audio Context
  // ============================================
  let audioContext = null;

  function initAudio() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play timer complete beep
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

  // Create confetti effect
  function triggerConfetti() {
    const colors = ['#6c5ce7', '#00cec9', '#fd79a8', '#00b894', '#fdcb6e'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 8 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.opacity = Math.random();
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      
      const animationDuration = Math.random() * 2 + 1;
      confetti.style.animation = `confetti-fall ${animationDuration}s linear forwards`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, animationDuration * 1000);
    }
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

    if (hoursEl && hoursEl.textContent !== newHours) {
      hoursEl.textContent = newHours;
      hoursEl.classList.add('flip');
      setTimeout(() => hoursEl.classList.remove('flip'), 400);
    }

    if (minutesEl && minutesEl.textContent !== newMinutes) {
      minutesEl.textContent = newMinutes;
      minutesEl.classList.add('flip');
      setTimeout(() => minutesEl.classList.remove('flip'), 400);
    }

    if (secondsEl && secondsEl.textContent !== newSeconds) {
      secondsEl.textContent = newSeconds;
      secondsEl.classList.add('flip');
      setTimeout(() => secondsEl.classList.remove('flip'), 400);
    }

    // Update date with animation
    if (dateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  }

  // Initialize clock
  function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ============================================
  // Pomodoro Timer Widget
  // ============================================

  // Update timer display
  function updateTimerDisplay() {
    const timeEl = document.getElementById('timer-time');
    const modeEl = document.getElementById('timer-mode');
    const progressEl = document.getElementById('timer-progress');
    const startPauseBtn = document.getElementById('timer-start-pause');
    const breathingCircle = document.querySelector('.breathing-circle');

    if (!timeEl || !modeEl || !progressEl) return;

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
    if (startPauseBtn) {
      if (state.timer.isRunning) {
        startPauseBtn.classList.add('running');
        if (breathingCircle) breathingCircle.classList.add('breathing');
      } else {
        startPauseBtn.classList.remove('running');
        if (breathingCircle) breathingCircle.classList.remove('breathing');
      }
    }
  }

  // Timer tick
  function timerTick() {
    if (!state.timer.isRunning) return;

    state.timer.timeRemaining--;

    // Update stats
    if (state.timer.mode === 'work') {
      state.stats.totalFocusTime++;
    }

    if (state.timer.timeRemaining <= 0) {
      // Timer complete
      playBeep();

      // Switch mode
      if (state.timer.mode === 'work') {
        state.timer.mode = 'break';
        state.timer.timeRemaining = state.timer.breakDuration;
        state.timer.completedCycles++;
        state.stats.sessionsToday++;
        playSuccessSound();
        showNotification('Work session complete! Time for a break.');
      } else {
        state.timer.mode = 'work';
        state.timer.timeRemaining = state.timer.workDuration;
        showNotification('Break over! Ready to focus?');
      }

      saveStats();
    }

    updateTimerDisplay();
  }

  // Start/pause timer
  function toggleTimer() {
    state.timer.isRunning = !state.timer.isRunning;

    if (state.timer.isRunning) {
      // Initialize audio on user interaction
      initAudio();

      // Clear any existing interval
      if (timerInterval) clearInterval(timerInterval);

      // Start new interval
      timerInterval = setInterval(timerTick, 1000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    updateTimerDisplay();
  }

  // Reset timer
  function resetTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    state.timer.isRunning = false;
    state.timer.timeRemaining = state.timer.mode === 'work'
      ? state.timer.workDuration
      : state.timer.breakDuration;
    updateTimerDisplay();
  }

  // Initialize timer
  function initTimer() {
    updateTimerDisplay();

    const startPauseBtn = document.getElementById('timer-start-pause');
    const resetBtn = document.getElementById('timer-reset');

    if (startPauseBtn) startPauseBtn.addEventListener('click', toggleTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  }

  // Pause timer (for keyboard shortcut)
  function pauseTimer() {
    if (state.timer.isRunning) {
      state.timer.isRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      updateTimerDisplay();
    }
  }

  // Resume timer (for keyboard shortcut)
  function resumeTimer() {
    if (!state.timer.isRunning && state.timer.timeRemaining > 0) {
      state.timer.isRunning = true;
      timerInterval = setInterval(timerTick, 1000);
      updateTimerDisplay();
    }
  }

  // ============================================
  // Notification System
  // ============================================

  // Show notification toast
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
      <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="notification-message">${message}</span>
    `;

    // Add styles dynamically
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 2000;
      box-shadow: 0 8px 32px var(--card-shadow);
      animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px;
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.4s ease forwards';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Add notification styles to document
  function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .notification-toast.success {
        border-left: 3px solid var(--success-color);
      }
      .notification-toast.error {
        border-left: 3px solid var(--danger-color);
      }
      .notification-toast.info {
        border-left: 3px solid var(--accent-color);
      }
    `;
    document.head.appendChild(style);
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
      colorBtn.style.border = color === 'rgba(255, 255, 255, 0.1)'
        ? '2px solid rgba(255,255,255,0.5)'
        : '2px solid transparent';
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

    // Add enter animation
    noteEl.style.animationDelay = `${state.notes.indexOf(note) * 0.05}s`;

    return noteEl;
  }

  // Make note draggable
  function makeDraggable(noteEl) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    let rect;

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

      rect = noteEl.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      noteEl.style.position = 'fixed';
      noteEl.style.left = `${initialX + dx}px`;
      noteEl.style.top = `${initialY + dy}px`;
      noteEl.style.width = `${rect.width}px`;
      noteEl.style.zIndex = '1000';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        noteEl.classList.remove('dragging');
        noteEl.style.position = '';
        noteEl.style.left = '';
        noteEl.style.top = '';
        noteEl.style.width = '';
        noteEl.style.zIndex = '';
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

    // Focus on the new note
    setTimeout(() => {
      const newNoteEl = document.querySelector(`[data-id="${note.id}"] .note-content`);
      if (newNoteEl) {
        newNoteEl.focus();
      }
    }, 100);

    showNotification('New note created!', 'success');
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
      showNotification('Note color updated!', 'success');
    }
  }

  // Delete note
  function deleteNote(id) {
    const noteEl = document.querySelector(`[data-id="${id}"]`);
    if (noteEl) {
      noteEl.classList.add('deleting');
      setTimeout(() => {
        state.notes = state.notes.filter(n => n.id !== id);
        saveNotes();
        renderNotes();
        showNotification('Note deleted', 'info');
      }, 300);
    } else {
      state.notes = state.notes.filter(n => n.id !== id);
      saveNotes();
      renderNotes();
    }
  }

  // Save notes to localStorage
  function saveNotes() {
    saveToStorage(STORAGE_KEYS.NOTES, state.notes);
  }

  // Render notes
  function renderNotes() {
    const container = document.getElementById('notes-container');
    if (!container) return;

    container.innerHTML = '';

    state.notes.forEach(note => {
      const noteEl = createNoteElement(note);
      container.appendChild(noteEl);
    });
  }

  // Initialize notes
  function initNotes() {
    const saved = loadFromStorage(STORAGE_KEYS.NOTES);
    if (saved && saved.length > 0) {
      state.notes = saved;
    } else {
      // Pre-built notes
      state.notes = [
        {
          id: generateId(),
          content: 'Welcome to ZenBoard! 🚀',
          color: NOTE_COLORS[1],
          createdAt: Date.now()
        },
        {
          id: generateId(),
          content: 'You can drag and drop these notes! ✨',
          color: NOTE_COLORS[2],
          createdAt: Date.now()
        }
      ];
      saveNotes();
    }
    renderNotes();

    const addNoteBtn = document.getElementById('add-note-btn');
    if (addNoteBtn) addNoteBtn.addEventListener('click', addNote);
  }

  // ============================================
  // Todo List Widget
  // ============================================

  // Create todo element
  function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    li.draggable = true;

    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    checkbox.innerHTML = '<span class="checkmark">✓</span>';
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTodo(todo.id);
    });

    const textWrapper = document.createElement('div');
    textWrapper.className = 'todo-text-wrapper';
    textWrapper.style.flex = '1';

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('dblclick', () => {
      enterEditMode(li, todo);
    });

    const badge = document.createElement('span');
    badge.className = `priority-badge ${todo.priority}`;
    badge.textContent = todo.priority;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(todo.id);
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(badge);
    li.appendChild(deleteBtn);

    // Drag events
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

    // Add stagger animation
    li.style.animationDelay = `${state.todos.indexOf(todo) * 0.05}s`;

    return li;
  }

  // Edit Mode Logic
  function enterEditMode(li, todo) {
    if (li.classList.contains('editing')) return;
    
    li.classList.add('editing');
    const textSpan = li.querySelector('.todo-text');
    const originalText = textSpan.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = originalText;
    
    textSpan.replaceWith(input);
    input.focus();
    
    const finishEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== originalText) {
        todo.text = newText;
        saveTodos();
      }
      renderTodos();
    };
    
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') finishEdit();
    });
  }

  // Drag and Drop Logic
  let draggedItemId = null;

  function handleDragStart(e) {
    draggedItemId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    const targetId = this.dataset.id;
    if (draggedItemId === targetId) return;

    const fromIndex = state.todos.findIndex(t => t.id === draggedItemId);
    const toIndex = state.todos.findIndex(t => t.id === targetId);

    const [movedTodo] = state.todos.splice(fromIndex, 1);
    state.todos.splice(toIndex, 0, movedTodo);

    saveTodos();
    renderTodos();
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItemId = null;
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

    showNotification('Task added!', 'success');
  }

  // Toggle todo completion
  function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;

      if (todo.completed) {
        state.stats.totalTasksCompleted++;
        saveStats();
        playSuccessSound();
        triggerConfetti();
        showNotification('Task completed! 🎉', 'success');
      }

      saveTodos();
      renderTodos();
    }
  }

  // Delete todo
  function deleteTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    showNotification('Task deleted', 'info');
  }

  // Save todos to localStorage
  function saveTodos() {
    saveToStorage(STORAGE_KEYS.TODOS, state.todos);
  }

  // Render todos
  function renderTodos() {
    const container = document.getElementById('todo-list');
    const progressBar = document.getElementById('task-progress-bar');
    const compCountEl = document.getElementById('completed-count');
    const totalCountEl = document.getElementById('total-count');
    
    if (!container) return;

    container.innerHTML = '';

    // Filter todos
    let filteredTodos = state.todos;
    if (state.currentTaskFilter === 'active') {
      filteredTodos = state.todos.filter(t => !t.completed);
    } else if (state.currentTaskFilter === 'completed') {
      filteredTodos = state.todos.filter(t => t.completed);
    }

    filteredTodos.forEach(todo => {
      const todoEl = createTodoElement(todo);
      container.appendChild(todoEl);
    });

    // Update progress
    const total = state.todos.length;
    const completed = state.todos.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressBar) progressBar.style.width = `${percent}%`;
    if (compCountEl) compCountEl.textContent = completed;
    if (totalCountEl) totalCountEl.textContent = total;
  }

  // Initialize todos
  function initTodos() {
    const saved = loadFromStorage(STORAGE_KEYS.TODOS);
    state.todos = saved || [];
    renderTodos();

    const input = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');

    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addTodo(input.value, prioritySelect ? prioritySelect.value : 'medium');
          input.value = '';
        }
      });
    }
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
      checkbox.className = `subtask-checkbox ${goal.subtasks && goal.subtasks[i] ? 'checked' : ''}`;
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

    // Add animation delay
    goalEl.style.animationDelay = `${state.goals.indexOf(goal) * 0.1}s`;

    return goalEl;
  }

  // Update goal progress ring
  function updateGoalProgress(goalEl, progress) {
    const ringProgress = goalEl.querySelector('.goal-ring-progress');
    const progressText = goalEl.querySelector('.goal-ring-text');

    if (ringProgress && progressText) {
      const circumference = 2 * Math.PI * 22;
      const offset = circumference * (1 - progress / 100);

      ringProgress.style.strokeDashoffset = offset;
      progressText.textContent = `${progress}%`;
    }
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

      if (goal.progress === 100) {
        playSuccessSound();
        showNotification('Goal completed! 🎯', 'success');
      }
    }
  }

  // Delete goal
  function deleteGoal(id) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
    showNotification('Goal removed', 'info');
  }

  // Add new goal
  function addGoal() {
    if (state.goals.length >= 3) {
      showNotification('Maximum 3 goals allowed', 'error');
      return;
    }

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

    // Focus on the new goal input
    setTimeout(() => {
      const newGoalInput = document.querySelector(`[data-id="${goal.id}"] .goal-input`);
      if (newGoalInput) {
        newGoalInput.readOnly = false; // Ensure it's not read-only
        newGoalInput.focus();
      }
    }, 100);

    showNotification('New goal added!', 'success');
  }

  // Save goals to localStorage
  function saveGoals() {
    saveToStorage(STORAGE_KEYS.GOALS, state.goals);
  }

  // Render goals
  function renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;

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
      const input = goalEl.querySelector('.goal-input');
      const progressRing = goalEl.querySelector('.goal-progress-ring');
      
      const onPlaceholderClick = (e) => {
        e.stopPropagation();
        addGoal();
      };

      if (input) {
        input.placeholder = `Goal ${i + 1} (click to add)`;
        input.readOnly = true;
        input.style.cursor = 'pointer';
        input.addEventListener('click', onPlaceholderClick);
      }
      
      goalEl.addEventListener('click', onPlaceholderClick);
      goalEl.style.cursor = 'pointer';
      
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
  // Stats Management
  // ============================================

  // Save stats
  function saveStats() {
    // Reset daily stats if new day
    const today = new Date().toDateString();
    if (state.stats.lastSessionDate !== today) {
      state.stats.sessionsToday = 0;
      state.stats.lastSessionDate = today;
    }
    saveToStorage(STORAGE_KEYS.STATS, state.stats);
  }

  // Load stats
  function loadStats() {
    const saved = loadFromStorage(STORAGE_KEYS.STATS);
    if (saved) {
      state.stats = { ...state.stats, ...saved };

      // Reset daily stats if new day
      const today = new Date().toDateString();
      if (state.stats.lastSessionDate !== today) {
        state.stats.sessionsToday = 0;
        state.stats.lastSessionDate = today;
      }
    }
  }

  // ============================================
  // Theme Switcher
  // ============================================

  // Set theme
  function setTheme(theme) {
    // Remove existing theme classes
    document.body.classList.remove('focus-theme', 'chill-theme', 'energy-theme', 'dark-theme');

    // Add new theme class
    document.body.classList.add(`${theme}-theme`);

    state.currentTheme = theme;

    // Update active state on buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // Update particle speed and hue
    const config = THEME_CONFIG[theme];
    if (config && window.ParticleEngine) {
      window.ParticleEngine.updateSpeed(config.speed);
      window.ParticleEngine.updateThemeHue(config.hue);
    }

    // Save theme preference
    saveToStorage(STORAGE_KEYS.SETTINGS, { theme });
  }

  // Initialize theme switcher
  function initThemeSwitcher() {
    // Load saved theme
    const settings = loadFromStorage(STORAGE_KEYS.SETTINGS);
    const savedTheme = settings ? settings.theme : 'focus';

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
      });
    });

    // Set initial theme
    setTheme(savedTheme);
  }

  // ============================================
  // Focus Mode
  // ============================================

  // Toggle focus mode
  function toggleFocusMode() {
    state.focusMode = !state.focusMode;

    if (state.focusMode) {
      document.body.classList.add('focus-active');
      const focusToggle = document.getElementById('focus-toggle');
      if (focusToggle) focusToggle.classList.add('active');
    } else {
      document.body.classList.remove('focus-active');
      const focusToggle = document.getElementById('focus-toggle');
      if (focusToggle) focusToggle.classList.remove('active');
    }
  }

  // Initialize focus mode
  function initFocusMode() {
    const focusToggle = document.getElementById('focus-toggle');
    if (focusToggle) {
      focusToggle.addEventListener('click', toggleFocusMode);
    }
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
        if (state.focusMode) toggleFocusMode();
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'f':
        if (e.ctrlKey || e.metaKey) return; // Allow browser search
        e.preventDefault();
        toggleFocusMode();
        break;

      case 'n':
        if (e.ctrlKey || e.metaKey) return; // Allow browser new window
        e.preventDefault();
        addNote();
        break;

      case ' ':
        // Only trigger if not in a button or focused element
        if (e.target === document.body) {
          e.preventDefault();
          if (state.timer.isRunning) {
            pauseTimer();
            showNotification('Timer paused', 'info');
          } else {
            resumeTimer();
            showNotification('Timer resumed', 'success');
          }
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
  // Page Load Animations
  // ============================================

  // Add entrance animations to widgets
  function initPageAnimations() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach((widget, index) => {
      widget.style.animationDelay = `${index * 0.1}s`;
    });
  }

  // ============================================
  // Initialization
  // ============================================

  // Initialize all components
  function init() {
    // Add notification styles
    addNotificationStyles();

    // Initialize components
    initClock();
    initTimer();
    initNotes();
    initTodos();
    initGoals();
    initThemeSwitcher();
    initFocusMode();
    initKeyboardShortcuts();
    initPageAnimations();
    initTaskFilters();
    initDragTilt();

    // Load stats
    loadStats();

    // Welcome notification
    setTimeout(() => {
      showNotification('Welcome to ZenBoard! 🚀', 'success');
    }, 500);
  }

  // Task Filter Initialization
  function initTaskFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clear-completed');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentTaskFilter = btn.dataset.filter;
        renderTodos();
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.todos = state.todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        showNotification('Cleared completed tasks', 'info');
      });
    }
  }

  // 3D Tilt Effect Initialization
  function initDragTilt() {
    const widgets = document.querySelectorAll('.widget');
    
    widgets.forEach(widget => {
      widget.addEventListener('mousemove', (e) => {
        const rect = widget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 25; // Less aggressive
        const rotateY = (centerX - x) / 25;
        
        widget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
      });
      
      widget.addEventListener('mouseleave', () => {
        widget.style.transform = '';
      });
    });
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
