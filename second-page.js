
// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ ==========
const STATUS_ORDER = ['todo', 'inprogress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];
let tasks = [];

// ========== DOM ЭЛЕМЕНТЫ ==========
const elements = {
  taskModal: document.getElementById('task-modal'),
  taskForm: document.getElementById('task-form'),
  closeModal: document.querySelector('.close-modal'),
  addTaskFloat: document.getElementById('add-task-float'),
  taskTitle: document.getElementById('task-title'),
  taskDesc: document.getElementById('task-desc'),
  taskDate: document.getElementById('task-date'),
  taskPriority: document.getElementById('task-priority'),
  taskStatus: document.getElementById('task-status'),
  todoTasks: document.getElementById('todo-tasks'),
  inprogressTasks: document.getElementById('inprogress-tasks'),
  doneTasks: document.getElementById('done-tasks'),
  todoCount: document.getElementById('todo-count'),
  inprogressCount: document.getElementById('inprogress-count'),
  doneCount: document.getElementById('done-count'),
  urgentCount: document.getElementById('urgent-count'),
  progressPercent: document.getElementById('progress-percent'),
  clearCompleted: document.querySelector('.clear-completed'),
  completedCount: document.getElementById('completed-count'),
  generateIdeaBtn: document.getElementById('generate-idea'),
  aiTaskInput: document.getElementById('ai-task-input'),
  aiSuggestion: document.getElementById('ai-suggestion'),
  aiSubtasksList: document.getElementById('ai-subtasks-list')
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  applyTheme();
  setupModal();
  setupTaskBoard();
  setupDragAndDrop();
  renderTasks();
  updateUI();
  initParticles();
  initChart();
  setupAIAssistant();
});

// ========== ХРАНЕНИЕ ==========
function loadTasks() {
  const stored = localStorage.getItem('tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ========== CRUD ==========
function createTask(data) {
  return {
    id: Date.now().toString(),
    title: data.title,
    description: data.description || '',
    dueDate: data.dueDate || null,
    priority: data.priority || 'medium',
    status: STATUS_ORDER.includes(data.status) ? data.status : 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function addTask(data) {
  const task = createTask(data);
  tasks.push(task);
  saveTasks();
  renderTask(task);
  updateUI();
  showNotification('Задача добавлена!', 'success');
  return true;
}

function updateTask(id, updates) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
  saveTasks();
  renderTasks();
  updateUI();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateUI();
  showNotification('Задача удалена', 'warning');
}

// ========== РЕНДЕРИНГ ==========
function renderTasks() {
  elements.todoTasks.innerHTML = '';
  elements.inprogressTasks.innerHTML = '';
  elements.doneTasks.innerHTML = '';
  tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  tasks.forEach(renderTask);
}

function renderTask(task) {
  const container = elements[`${task.status}Tasks`];
  if (!container) return;

  const taskEl = document.createElement('div');
  taskEl.className = `task-item ${task.status} ${task.priority}`;
  taskEl.dataset.taskId = task.id;
  taskEl.draggable = true;

  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : 'Нет срока';

  taskEl.innerHTML = `
    <div class="task-header">
      <span class="priority-dot ${task.priority}"></span>
      <h4>${task.title}</h4>
      <button class="delete-task">×</button>
    </div>
    ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
    <div class="task-footer">
      <span class="task-date">${due}</span>
      <div class="task-actions">
        <button class="move-task backward" ${task.status === 'todo' ? 'disabled' : ''}>←</button>
        <button class="move-task forward" ${task.status === 'done' ? 'disabled' : ''}>→</button>
      </div>
    </div>
  `;

  container.appendChild(taskEl);

  taskEl.querySelector('.delete-task').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });
  
  taskEl.querySelector('.forward').addEventListener('click', (e) => {
    e.stopPropagation();
    moveTask(task.id, 1);
  });
  
  taskEl.querySelector('.backward').addEventListener('click', (e) => {
    e.stopPropagation();
    moveTask(task.id, -1);
  });
}

// ========== UI ОБНОВЛЕНИЕ ==========
function updateUI() {
  const count = status => tasks.filter(t => t.status === status).length;
  const urgent = tasks.filter(t => t.priority === 'high').length;

  elements.todoCount.textContent = count('todo');
  elements.inprogressCount.textContent = count('inprogress');
  elements.doneCount.textContent = count('done');
  elements.urgentCount.textContent = urgent;
  elements.completedCount.textContent = count('done');

const percent = tasks.length ? Math.round(count('done') / tasks.length * 100) : 0;
  updateChart(percent);   elements.progressPercent.textContent = `${percent}%`;
  updateChart(percent);

  checkAchievements();
  updateChart(percent);
}

// ========== ПЕРЕМЕЩЕНИЕ ==========
function moveTask(id, direction) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const index = STATUS_ORDER.indexOf(task.status) + direction;
  if (index < 0 || index >= STATUS_ORDER.length) return;

  updateTask(id, { status: STATUS_ORDER[index] });
  showNotification(`Задача перемещена в "${getStatusName(STATUS_ORDER[index])}"`, 'info');
}

function getStatusName(status) {
  const names = {
    todo: 'В ожидании',
    inprogress: 'В работе',
    done: 'Выполнено'
  };
  return names[status] || status;
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function setupModal() {
  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.taskStatus.value = btn.dataset.status;
      showModal();
    });
  });

  elements.addTaskFloat.addEventListener('click', () => {
    elements.taskStatus.value = 'todo';
    showModal();
  });

  elements.closeModal.addEventListener('click', hideModal);
  elements.taskModal.addEventListener('click', e => {
    if (e.target === elements.taskModal) hideModal();
  });

  elements.taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      title: elements.taskTitle.value.trim(),
      description: elements.taskDesc.value.trim(),
      dueDate: elements.taskDate.value,
      priority: elements.taskPriority.value,
      status: elements.taskStatus.value
    };
    
    if (!data.title) {
      showNotification('Пожалуйста, укажите название задачи', 'error');
      return;
    }
    
    if (addTask(data)) {
      hideModal();
    }
  });
}

function showModal() {
  elements.taskModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  elements.taskTitle.focus();
}

function hideModal() {
  elements.taskModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  elements.taskForm.reset();
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(msg, type = 'info') {
  const note = document.getElementById('notification');
  note.className = `notification ${type}`;
  note.textContent = msg;
  note.classList.add('show');
  
  setTimeout(() => {
    note.classList.remove('show');
  }, 3000);
}

// ========== ДРАГ И ДРОП ==========
function setupDragAndDrop() {
  const drake = dragula([
    elements.todoTasks,
    elements.inprogressTasks,
    elements.doneTasks
  ]);

  drake.on('drop', (el, target) => {
    const id = el.dataset.taskId;
    const newStatus = target.id.replace('-tasks', '');
    updateTask(id, { status: newStatus });
    showNotification(`Задача перемещена в "${getStatusName(newStatus)}"`, 'info');
  });

  drake.on('drag', el => {
    el.style.transform = 'rotate(3deg) scale(1.05)';
    el.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  });

  drake.on('dragend', el => {
    el.style.transform = '';
    el.style.boxShadow = '';
  });
}



// ========== ОБНОВЛЕНИЕ ПРОГРЕССА ==========
// ========== ОБНОВЛЕНИЕ ПРОГРЕССА ==========
function updateChart(percent) {
  const fill = document.querySelector('.progress-fill');
  const percentText = document.getElementById('progress-percent');
  
  if (!fill || !percentText) return;
  
  // Устанавливаем ширину заполнения
  fill.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
  
  // Меняем цвет в зависимости от прогресса
  fill.className = 'progress-fill'; // Сбрасываем классы
  if (percent > 70) {
    fill.classList.add('high');
  } else if (percent > 30) {
    fill.classList.add('medium');
  } else {
    fill.classList.add('low');
  }
}

// ========== ДОПОЛНИТЕЛЬНО ==========
function checkAchievements() {
  const done = tasks.filter(t => t.status === 'done').length;
  if (done === 5) showNotification('🎉 Вы выполнили 5 задач!', 'success');
  if (done === 10) showNotification('🔥 Уже 10 задач выполнено!', 'success');
}

function applyTheme() {
  const toggle = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  const setTheme = theme => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    iconSun.style.display = theme === 'light' ? 'none' : 'inline-block';
    iconMoon.style.display = theme === 'light' ? 'inline-block' : 'none';
  };

  toggle.addEventListener('click', () => {
    const current = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(current);
  });

  setTheme(localStorage.getItem('theme') || 'dark');
}

function setupTaskBoard() {
  elements.clearCompleted.addEventListener('click', () => {
    if (confirm('Удалить выполненные задачи?')) {
      tasks = tasks.filter(t => t.status !== 'done');
      saveTasks();
      renderTasks();
      updateUI();
      showNotification('Выполненные задачи удалены', 'success');
    }
  });
}

function initParticles() {
  const container = document.querySelector('.floating-particles');
  if (!container) return;

  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.width = `${Math.random() * 10 + 5}px`;
    p.style.height = `${Math.random() * 10 + 5}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDelay = `${Math.random() * 15}s`;
    p.style.animationDuration = `${Math.random() * 10 + 10}s`;
    container.appendChild(p);
  }
}

function setupAIAssistant() {
  elements.generateIdeaBtn?.addEventListener('click', () => {
    const task = elements.aiTaskInput.value.trim();
    if (!task) {
      showNotification('Пожалуйста, опишите задачу', 'error');
      return;
    }

    elements.aiSuggestion.textContent = 'Генерация подзадач...';
    elements.aiSubtasksList.innerHTML = '';

    setTimeout(() => {
      const subtasks = [
        `Исследование по теме "${task}"`,
        'Создание прототипа',
        'Тестирование решения',
        'Сбор отзывов',
        'Финальная доработка'
      ];
      
      elements.aiSuggestion.textContent = 'Вот разбивка задачи на подзадачи:';
      
      subtasks.forEach((subtask, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${subtask}`;
        elements.aiSubtasksList.appendChild(li);
      });
      
      showNotification('Подзадачи сгенерированы!', 'success');
    }, 1500);
  });
}

  particlesJS('particles-js', {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 900 } },
      color: { value: document.body.classList.contains('light') ? '#313300' : '#ffffff' },
      shape: { type: "circle" },
      opacity: { value: 0.7, random: true, anim: { enable: false } },
      size: { value: 5, random: true, anim: { enable: false } },
      line_linked: {
        enable: true,
        distance: 140,
        color: document.body.classList.contains('light') ? '#313300' : '#ffffff',
        opacity: 0.4,
        width: 2
      },
      move: {
        enable: true,
        speed: 3,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  });
