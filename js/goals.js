/*! DieselCars — передача целей в Яндекс Метрику (ym) и Google Analytics 4 (gtag / dataLayer)
 *
 * Разметка в HTML:  data-goal="имя_цели"  [data-goal-place="header|hero|nav|banner|contacts|footer|..."]
 *
 * Цели (одно имя = цель в Метрике и событие в GA4):
 *   click_phone            — клик по номеру телефона (tel:)
 *   click_call_button      — клик по кнопке «Позвонить»
 *   go_to_price            — переход в прайс-лист
 *   click_viber / click_telegram / click_whatsapp — клик по мессенджерам
 *   click_email            — клик по e-mail
 *   click_route            — «Построить маршрут»
 *   download_price_pdf     — «Скачать / распечатать PDF»
 *   submit_diagnostic_form — отправка формы записи на диагностику
 *   faq_open               — раскрытие вопроса в FAQ (data-goal-toggle)
 */
(function () {
  'use strict';

  /* ЗАПОЛНИТЬ: числовой ID счётчика Яндекс Метрики. Пока 0 — в Метрику ничего не уходит. */
  var YM_ID = 0;

  function track(goal, extra) {
    var params = { page: location.pathname }, k;
    for (k in (extra || {})) params[k] = extra[k];

    try { if (YM_ID && typeof window.ym === 'function') window.ym(YM_ID, 'reachGoal', goal, params); } catch (e) {}

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', goal, params);                    // gtag.js (GA4 напрямую)
      } else if (window.dataLayer) {
        var ev = { event: goal };                              // Google Tag Manager
        for (k in params) ev[k] = params[k];
        window.dataLayer.push(ev);
      }
    } catch (e) {}
  }

  function label(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

  // Клики: телефон, кнопки, прайс, мессенджеры, e-mail, маршрут, PDF
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-goal]');
    if (!el || el.tagName === 'FORM') return;
    track(el.getAttribute('data-goal'), { place: el.getAttribute('data-goal-place') || '', label: label(el) });
  }, true);

  // Раскрытие вопросов FAQ
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d.tagName === 'DETAILS' && d.open && d.hasAttribute('data-goal-toggle')) {
      track(d.getAttribute('data-goal-toggle'), { label: label(d.querySelector('summary')) });
    }
  }, true);

  window.DCGoals = { track: track };
})();
