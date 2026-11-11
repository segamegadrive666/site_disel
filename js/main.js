/* DieselCars — счётчики, печать прайса, форма записи */
(function () {
  'use strict';

  /* ===== Счётчики: в HTML уже стоят реальные числа, JS только анимирует их при появлении в экране ===== */
  var nums = document.querySelectorAll('.stat-num[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', finalText = el.textContent, dur = 1500, t0 = performance.now();
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      el.textContent = p < 1 ? Math.floor((1 - Math.pow(1 - p, 4)) * target) + suffix : finalText;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ===== Печать / сохранение прайса в PDF ===== */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-action="print"]')) window.print();
  });

  /* ===== Подсветка под курсором для блоков .img ===== */
  document.querySelectorAll('.img').forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ===== Форма записи на диагностику =====
     Если в data-endpoint указан URL обработчика — отправляем POST (FormData).
     Пока там плейсхолдер {{FORM_ENDPOINT}} — открываем письмо на info@dieselcars.by (mailto). */
  var form = document.getElementById('lead-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  function say(t) { if (status) status.textContent = t; }
  function ok() {
    if (window.DCGoals) window.DCGoals.track('submit_diagnostic_form', { place: 'order_form' });
    form.reset();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.website && form.elements.website.value) return;           // honeypot
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var ep = form.getAttribute('data-endpoint') || '';
    var f = form.elements;

    if (ep && ep.charAt(0) !== '{') {
      say('Отправляем…');
      fetch(ep, { method: 'POST', body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); say('Спасибо! Заявка отправлена, перезвоним в рабочее время.'); ok(); })
        .catch(function () { say('Не удалось отправить заявку. Позвоните нам: +375 (29) 619-40-92.'); });
    } else {
      var body = 'Имя: ' + f.name.value + '\nТелефон: ' + f.phone.value + '\nАвтомобиль: ' + f.car.value + '\nПроблема: ' + f.problem.value;
      window.location.href = 'mailto:info@dieselcars.by?subject=' + encodeURIComponent('Запись на диагностику') + '&body=' + encodeURIComponent(body);
      say('Открываем почтовую программу для отправки заявки…');
      ok();
    }
  });
})();
