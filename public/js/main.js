// 共用行為：手機選單開關、大考倒數計算、首頁公告彈窗
(function () {
  // 116 學年度會考／學測日期（可依實際考試公告調整）
  var EXAM_DATE = new Date('2027-05-18');
  var STUDY_DATE = new Date('2027-01-17');

  function daysUntil(target) {
    var now = new Date();
    var diff = Math.ceil((target - now) / 86400000);
    return Math.max(0, diff);
  }

  function renderCountdowns() {
    var examDays = daysUntil(EXAM_DATE);
    var studyDays = daysUntil(STUDY_DATE);
    document.querySelectorAll('[data-countdown="exam"]').forEach(function (el) {
      el.textContent = examDays;
    });
    document.querySelectorAll('[data-countdown="study"]').forEach(function (el) {
      el.textContent = studyDays;
    });
  }

  function initMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initPopup() {
    var popup = document.getElementById('popup');
    if (!popup) return;
    var closeBtn = popup.querySelector('.popup-close');
    var dismissed = sessionStorage.getItem('popupDismissed');
    if (dismissed) {
      popup.hidden = true;
      return;
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        popup.hidden = true;
        sessionStorage.setItem('popupDismissed', '1');
      });
    }
    popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        popup.hidden = true;
        sessionStorage.setItem('popupDismissed', '1');
      }
    });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var success = document.getElementById('contact-success');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true;
      if (success) success.hidden = false;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCountdowns();
    initMobileNav();
    initPopup();
    initContactForm();
  });
})();
