// ===== ОБЩИЕ КОМПОНЕНТЫ ===== //

// Переключение темы
const themeToggleBtn = document.getElementById('theme-toggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

function updateThemeIcons() {
  if (!iconSun || !iconMoon) return;
  const isLight = document.body.classList.contains('light');
  iconSun.style.display = isLight ? 'none' : 'inline-block';
  iconMoon.style.display = isLight ? 'inline-block' : 'none';
}

function setTheme(theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);
  updateThemeIcons();
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(currentTheme);
    initParticles();
  });
}

// Частицы на фоне
function initParticles() {
  if (window.pJSDom && window.pJSDom.length) {
    window.pJSDom.forEach(p => p.pJS.fn.vendors.destroypJS());
    window.pJSDom = [];
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
}

// ===== УНИКАЛЬНЫЙ КОД ДЛЯ ГЛАВНОЙ СТРАНИЦЫ ===== //

// Анимация счетчиков
const counters = document.querySelectorAll('.counter');

function animateCounter(el, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (target - start) + start);
    el.innerText = value;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.innerText = target;
    }
  }

  requestAnimationFrame(update);
}

if (counters.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        animateCounter(el, target);
        el.classList.add('counted');
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(counter => {
    counter.innerText = '0';
    observer.observe(counter);
  });
}

// Слайдер отзывов
const reviewCards = document.querySelectorAll('.testimonial');
const prevReviewBtn = document.querySelector('.prev-review');
const nextReviewBtn = document.querySelector('.next-review');

if (reviewCards.length > 0) {
  let currentReviewIndex = 0;
  let reviewTimer;

  function showReviewCard(index) {
    reviewCards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    currentReviewIndex = index;
  }

  function nextReviewCard() {
    showReviewCard((currentReviewIndex + 1) % reviewCards.length);
  }

  function prevReviewCard() {
    showReviewCard((currentReviewIndex - 1 + reviewCards.length) % reviewCards.length);
  }

  function startReviewAutoSlide() {
    reviewTimer = setInterval(nextReviewCard, 5000);
  }

  function stopReviewAutoSlide() {
    clearInterval(reviewTimer);
  }

  if (prevReviewBtn) {
    prevReviewBtn.addEventListener('click', () => {
      stopReviewAutoSlide();
      prevReviewCard();
      startReviewAutoSlide();
    });
  }

  if (nextReviewBtn) {
    nextReviewBtn.addEventListener('click', () => {
      stopReviewAutoSlide();
      nextReviewCard();
      startReviewAutoSlide();
    });
  }

  showReviewCard(currentReviewIndex);
  startReviewAutoSlide();
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  initParticles();
  AOS.init({ duration: 800, once: true });
});