(function () {
  'use strict';

  var showcase = document.querySelector('[data-showcase]');
  var stage = document.querySelector('[data-stage]');
  if (!showcase || !stage) return;

  var tabs = Array.prototype.slice.call(showcase.querySelectorAll('[data-tab]'));
  var cards = Array.prototype.slice.call(showcase.querySelectorAll('[data-card]'));
  var captionType = showcase.querySelector('[data-caption-type]');
  var captionTitle = showcase.querySelector('[data-caption-title]');
  var captionText = showcase.querySelector('[data-caption-text]');
  var AUTO_DELAY = 1800;
  var autoTimer = 0;
  var autoPaused = false;
  var manualTimer = 0;
  var content = {
    product: {
      type: 'Цифровой продукт',
      title: 'Платформа, а не страница',
      text: 'Регистрация, кабинеты, билеты, оплаты и рабочие сценарии собраны в одну систему.'
    },
    ai: {
      type: 'ИИ-помощник',
      title: 'Сайт начинает делать больше',
      text: 'Помощник на базе ИИ отвечает на вопросы по материалам компании и помогает подготовить следующий шаг.'
    },
    growth: {
      type: 'Продвижение',
      title: 'Продукт получает точки входа',
      text: 'Структура, контент и автоматизация помогают сайту оставаться заметным и полезным.'
    }
  };

  function activate(key, focus) {
    var item = content[key];
    if (!item) return;
    showcase.setAttribute('data-active', key);
    tabs.forEach(function (tab) {
      var selected = tab.getAttribute('data-tab') === key;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    stage.setAttribute('aria-labelledby', 'tab-' + key);
    cards.forEach(function (card) {
      card.setAttribute('aria-hidden', card.getAttribute('data-card') === key ? 'false' : 'true');
    });
    captionType.textContent = item.type;
    captionTitle.textContent = item.title;
    captionText.textContent = item.text;
  }

  function nextKey() {
    var active = showcase.getAttribute('data-active');
    var index = tabs.findIndex(function (tab) { return tab.getAttribute('data-tab') === active; });
    return tabs[(index + 1) % tabs.length].getAttribute('data-tab');
  }

  function stopAuto() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = 0;
  }

  function startAuto() {
    stopAuto();
    if (autoPaused || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoTimer = window.setInterval(function () {
      activate(nextKey(), false);
    }, AUTO_DELAY);
  }

  function holdAfterManualChoice() {
    stopAuto();
    window.clearTimeout(manualTimer);
    manualTimer = window.setTimeout(function () {
      manualTimer = 0;
      startAuto();
    }, 8000);
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      activate(tab.getAttribute('data-tab'), false);
      holdAfterManualChoice();
    });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      activate(tabs[next].getAttribute('data-tab'), true);
      holdAfterManualChoice();
    });
  });

  var canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frame = 0;

  if (canTilt && !reduceMotion) {
    stage.addEventListener('pointermove', function (event) {
      var rect = stage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - .5;
      var y = (event.clientY - rect.top) / rect.height - .5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        stage.style.transform = 'rotateX(' + (-y * 3.2) + 'deg) rotateY(' + (x * 4.2) + 'deg)';
      });
    });
    stage.addEventListener('pointerleave', function () {
      cancelAnimationFrame(frame);
      stage.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  if (canTilt) {
    showcase.addEventListener('pointerenter', function () {
      autoPaused = true;
      stopAuto();
    });
    showcase.addEventListener('pointerleave', function () {
      autoPaused = false;
      startAuto();
    });
  }

  showcase.addEventListener('focusin', function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    autoPaused = true;
    stopAuto();
  });
  showcase.addEventListener('focusout', function () {
    window.setTimeout(function () {
      if (showcase.contains(document.activeElement)) return;
      autoPaused = false;
      startAuto();
    }, 0);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  activate('product', false);
  startAuto();
})();
