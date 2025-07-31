// Инициализация темы
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function setTheme(theme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    iconSun.style.display = theme === 'light' ? 'none' : 'inline-block';
    iconMoon.style.display = theme === 'light' ? 'inline-block' : 'none';
  }

  toggle.addEventListener('click', () => {
    const current = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(current);
  });

  const saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);
}

// Плавающие частицы
function initParticles() {
  const container = document.getElementById('particles');
  const particleCount = 15;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Случайные параметры
    const size = Math.random() * 10 + 5;
    const posX = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    
    container.appendChild(particle);
  }
}

// Форма редактирования профиля
function initProfileForm() {
  const editBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const form = document.getElementById('edit-profile-form');

  const nameElem = document.querySelector('.user-info h2');
  const emailElem = document.querySelector('.user-info p:nth-of-type(1)');
  const avatarElem = document.querySelector('.user-avatar');

  editBtn.addEventListener('click', () => {
    document.getElementById('edit-name').value = nameElem.textContent;
    document.getElementById('edit-email').value = emailElem.textContent.replace('Email: ', '');
    document.getElementById('edit-avatar').value = avatarElem.textContent;
    
    form.classList.remove('hidden');
    editBtn.classList.add('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    form.classList.add('hidden');
    editBtn.classList.remove('hidden');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    nameElem.textContent = document.getElementById('edit-name').value;
    emailElem.textContent = 'Email: ' + document.getElementById('edit-email').value;
    avatarElem.textContent = document.getElementById('edit-avatar').value || '👤';
    
    form.classList.add('hidden');
    editBtn.classList.remove('hidden');
    
    showNotification('Профиль успешно обновлен!', 'success');
  });
}

// Статистика использования
function initUsageStats() {
  const periods = document.querySelectorAll('.usage-period');
  const stats = {
    day: { ai: '3/5', tasks: '12', productivity: '78%' },
    week: { ai: '15/35', tasks: '48', productivity: '82%' },
    month: { ai: '45/150', tasks: '210', productivity: '75%' }
  };

  periods.forEach(period => {
    period.addEventListener('click', function() {
      // Удаляем active у всех элементов
      periods.forEach(p => p.classList.remove('active'));
      
      // Добавляем active к текущему
      this.classList.add('active');
      
      const periodType = this.dataset.period;
      updateStatsDisplay(stats[periodType]);
    });
  });
}

function updateStatsDisplay(data) {
  document.getElementById('ai-requests').textContent = data.ai;
  document.getElementById('completed-tasks').textContent = data.tasks;
  document.getElementById('productivity').textContent = data.productivity;
  
  // Обновляем прогресс-бары
  document.querySelectorAll('.usage-bar .used').forEach((bar, index) => {
    let width;
    if (index === 0) {
      const [used, total] = data.ai.split('/').map(Number);
      width = (used / total) * 100;
    } else if (index === 1) {
      width = (data.tasks / 20) * 100; // Примерное максимальное значение
    } else {
      width = parseInt(data.productivity);
    }
    bar.style.width = `${width}%`;
  });
}

// Pro-подписка
function showProModal() {
  document.getElementById('pro-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProModal() {
  document.getElementById('pro-modal').classList.remove('show');
  document.body.style.overflow = 'auto';
}

function selectPlan(planType) {
  closeProModal();
  showPaymentModal(planType);
}

// Платежная форма
function showPaymentModal(planType) {
  const modal = document.getElementById('payment-modal');
  const planName = planType === 'monthly' ? 'месячную (199₽/мес)' : 
                   planType === 'yearly' ? 'годовую (1 790₽/год)' : 
                   'бесплатный период (7 дней)';
  
  modal.querySelector('h2').textContent = `Оформление ${planName} подписки`;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Обработка формы оплаты
document.getElementById('payment-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  showNotification('Подписка успешно оформлена!', 'success');
  closePaymentModal();
  
  // Обновляем статус подписки
  document.querySelector('.subscription-status').innerHTML = 
    'Подписка: <strong>Pro</strong>';
});

// Форматирование номера карты
document.getElementById('card-number').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\s+/g, '');
  if (value.length > 0) {
    value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
  }
  e.target.value = value;
});

// Форматирование срока действия
document.getElementById('card-expiry').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  e.target.value = value;
});

// Уведомления
function showNotification(message, type) {
  const note = document.createElement('div');
  note.className = `notification ${type}`;
  note.textContent = message;
  document.body.appendChild(note);
  
  setTimeout(() => {
    note.classList.add('show');
    setTimeout(() => {
      note.classList.remove('show');
      setTimeout(() => note.remove(), 300);
    }, 3000);
  }, 10);
}

// Инициализация всего при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initProfileForm();
  initParticles();
  initUsageStats();
  
  // Обработчики для модальных окон
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    });
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
  });
  
  // Обработчики для кнопок Pro
  document.querySelectorAll('.btn-pro, .locked-card').forEach(el => {
    if (!el.onclick) {
      el.addEventListener('click', showProModal);
    }
  });
  
  // Анимация при загрузке
  setTimeout(() => {
    document.querySelectorAll('.animate__animated').forEach(el => {
      el.style.opacity = '1';
    });
  }, 100);
});
