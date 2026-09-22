/* ==========================================================================
   FATUM AUTO — логика сайта
   Без библиотек. Всё работает при открытии index.html напрямую.
   ========================================================================== */

/* Куда уходит заявка из калькулятора — личка Аршата.
   Канал с автомобилями: https://t.me/korea_auto02                          */
var TELEGRAM_URL = 'https://t.me/yangirovvv_1';

(function () {
  'use strict';

  /* Сообщаем стилям, что JS жив: только после этого включается
     анимация появления блоков */
  document.documentElement.classList.add('js');

  /* ---------- Год в подвале ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Хедер: фон при скролле ---------- */
  var header = document.getElementById('header');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeMenu() {
    if (!burger || !nav) return;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    nav.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var willOpen = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', willOpen);
      burger.classList.toggle('is-open', willOpen);
      burger.setAttribute('aria-expanded', String(willOpen));
      burger.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('is-locked', willOpen);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Появление блоков при скролле ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealables.forEach(function (el) {
      /* Лесенка считается внутри своей группы, а не по сквозному номеру
         в документе: иначе заголовок секции регулярно появлялся позже
         карточек, которые лежат под ним */
      var group = el.parentElement
        ? el.parentElement.querySelectorAll(':scope > .reveal')
        : [el];
      var index = Array.prototype.indexOf.call(group, el);
      el.style.transitionDelay = Math.min(Math.max(index, 0), 5) * 60 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Подсветка активного пункта навигации ---------- */
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var sections = [];

  navLinks.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ el: target, link: link });
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.el === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s.el); });
  }

  /* ---------- FAQ ---------- */
  var faqList = document.getElementById('faqList');

  if (faqList) {
    var items = Array.prototype.slice.call(faqList.querySelectorAll('.faq__item'));

    items.forEach(function (item, index) {
      var btn = item.querySelector('.faq__q');
      var answer = item.querySelector('.faq__a');
      if (!btn || !answer) return;

      /* Связываем вопрос с ответом, чтобы скринридер понимал,
         чем именно управляет кнопка */
      var answerId = 'faq-answer-' + (index + 1);
      answer.id = answerId;
      answer.setAttribute('role', 'region');
      btn.setAttribute('aria-controls', answerId);
      if (!btn.id) btn.id = 'faq-question-' + (index + 1);
      answer.setAttribute('aria-labelledby', btn.id);

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // закрываем остальные — открытым остаётся один
        items.forEach(function (other) {
          if (other === item) return;
          other.classList.remove('is-open');
          var otherBtn = other.querySelector('.faq__q');
          var otherAnswer = other.querySelector('.faq__a');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
      });
    });

    function resyncOpenAnswer() {
      var open = faqList.querySelector('.faq__item.is-open .faq__a');
      if (open) open.style.maxHeight = open.scrollHeight + 'px';
    }

    // при смене ширины экрана пересчитываем высоту открытого ответа
    window.addEventListener('resize', resyncOpenAnswer);

    /* Шрифты грузятся с display=swap: подмена уже после открытия панели
       меняет высоту текста и обрезает ответ. Пересчитываем, когда шрифты
       действительно приехали. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(resyncOpenAnswer);
    }
  }

  /* ---------- Переключатель снимков в карточке кейса ---------- */
  document.querySelectorAll('.case__strip--switch').forEach(function (strip) {
    var card = strip.closest('.case');
    if (!card) return;
    var images = card.querySelectorAll('.case__media--gallery img');
    var buttons = strip.querySelectorAll('button');
    if (!images.length || images.length !== buttons.length) return;

    buttons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        buttons.forEach(function (other, i) {
          var active = i === index;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
          images[i].classList.toggle('is-active', active);
        });
      });
    });
  });

  /* ---------- Тост ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  /* ---------- Калькулятор заявки ---------- */
  var form = document.getElementById('calcForm');

  if (form) {
    var carInput = document.getElementById('f-car');
    var yearInput = document.getElementById('f-year');
    var budgetInput = document.getElementById('f-budget');
    var nameInput = document.getElementById('f-name');
    var previewEl = document.getElementById('calcPreview');

    // Разделяем бюджет пробелами по мере ввода: 2000000 -> 2 000 000
    function groupDigits(value) {
      var digits = String(value).replace(/\D/g, '').slice(0, 12);
      return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    if (budgetInput) {
      budgetInput.addEventListener('input', function () {
        /* Присваивание .value сбрасывает каретку в конец, из-за чего
           нельзя было поправить цифру в середине суммы. Считаем, сколько
           цифр стояло слева от каретки, и возвращаем её на то же место
           уже после переформатирования. */
        var caret = budgetInput.selectionStart;
        var digitsBefore = budgetInput.value.slice(0, caret).replace(/\D/g, '').length;

        budgetInput.value = groupDigits(budgetInput.value);

        var seen = 0;
        var position = budgetInput.value.length;
        for (var i = 0; i < budgetInput.value.length; i++) {
          if (/\d/.test(budgetInput.value[i])) seen++;
          if (seen === digitsBefore) { position = i + 1; break; }
        }
        if (digitsBefore === 0) position = 0;
        try { budgetInput.setSelectionRange(position, position); } catch (err) { /* не критично */ }

        updatePreview();
      });
    }

    if (yearInput) {
      yearInput.addEventListener('input', function () {
        yearInput.value = yearInput.value.replace(/\D/g, '').slice(0, 4);
        updatePreview();
      });
    }

    function val(input) {
      return input && input.value ? input.value.trim() : '';
    }

    function buildMessage() {
      var lines = ['РАСЧЁТ'];
      var car = val(carInput);
      var year = val(yearInput);
      var budget = val(budgetInput);
      var name = val(nameInput);

      lines.push('Автомобиль: ' + (car || '—'));
      lines.push('Год: ' + (year || '—'));
      lines.push('Бюджет: ' + (budget ? budget + ' ₽' : '—'));
      if (name) lines.push('Меня зовут: ' + name);

      return lines.join('\n');
    }

    function updatePreview() {
      if (previewEl) previewEl.textContent = buildMessage();
    }

    [carInput, nameInput].forEach(function (input) {
      if (input) input.addEventListener('input', updatePreview);
    });
    updatePreview();

    /* Копирование текста. navigator.clipboard недоступен на file:// и http,
       поэтому оставляем запасной вариант через скрытое поле. */
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(function () {
          return legacyCopy(text);
        });
      }
      return legacyCopy(text);
    }

    function legacyCopy(text) {
      return new Promise(function (resolve, reject) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(area);
        ok ? resolve() : reject();
      });
    }

    var statusEl = document.getElementById('calcStatus');
    var openEl = document.getElementById('calcOpen');

    if (openEl) openEl.href = TELEGRAM_URL;

    function hideResult() {
      if (statusEl) statusEl.hidden = true;
      if (openEl) openEl.hidden = true;
    }

    /* Текст изменился — значит скопированное устарело, прячем
       подтверждение, чтобы человек не ушёл со старой заявкой в буфере */
    [carInput, yearInput, budgetInput, nameInput].forEach(function (input) {
      if (input) input.addEventListener('input', hideResult);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!val(carInput)) {
        if (carInput) carInput.focus();
        showToast('Напишите, какой автомобиль вас интересует');
        return;
      }

      var message = buildMessage();

      /* Сначала дожидаемся копирования и только потом показываем ссылку
         на Telegram. Раньше чат открывался сразу, и на телефоне человек
         улетал в приложение, не увидев подсказки про вставку: он думал,
         что заявка отправлена, а она оставалась в буфере. */
      copyText(message).then(function () {
        if (statusEl) statusEl.hidden = false;
        if (openEl) {
          openEl.hidden = false;
          openEl.focus();
        }
        /* Тост здесь не нужен: подтверждение уже стоит в форме,
           а всплывашка дублировала его и перекрывала подсказку */
      }).catch(function () {
        hideResult();
        if (previewEl) {
          try {
            var range = document.createRange();
            range.selectNodeContents(previewEl);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (err) { /* выделение не критично */ }
        }
        showToast('Скопировать автоматически не вышло — текст заявки выделен, скопируйте вручную');
      });
    });
  }

  /* ---------- Плавный скролл для браузеров без scroll-behavior ---------- */
  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo(0, target.getBoundingClientRect().top + window.pageYOffset - 88);
      });
    });
  }
})();
