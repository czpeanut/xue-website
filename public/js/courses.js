// 課程介紹頁：分齡切換
(function () {
  var tabsEl = document.getElementById('stage-tabs');
  var listEl = document.getElementById('course-list');
  if (!tabsEl || !listEl) return;

  var stages = {
    elementary: {
      label: '國小高年級',
      courses: [
        { subject: '數學', title: '國小高年級數學銜接班', desc: '從分數、比例到基礎代數概念，為國中數學打底。', schedule: '每週二、四　17:30–19:00' },
        { subject: '國語文', title: '國小閱讀寫作班', desc: '強化閱讀理解與寫作表達，培養國語文素養。', schedule: '每週三　17:30–19:00' },
      ],
    },
    junior: {
      label: '國中',
      courses: [
        { subject: '數學', title: '國中數學會考衝刺班', desc: '依會考題型系統化訓練，掌握各單元解題策略。', schedule: '每週一、三、五　18:30–20:30' },
        { subject: '英文', title: '國中英文文法閱讀班', desc: '文法系統整理，搭配閱讀測驗與寫作練習。', schedule: '每週二、四　18:30–20:00' },
        { subject: '理化', title: '國中理化實驗班', desc: '結合實驗操作與觀念講解，理解物理化學核心概念。', schedule: '每週六　14:00–16:00' },
        { subject: '國文', title: '國中國文閱讀寫作班', desc: '文言文、白話文閱讀理解與作文技巧訓練。', schedule: '每週三　18:30–20:00' },
      ],
    },
    senior: {
      label: '高中',
      courses: [
        { subject: '數學', title: '高中數學學測分科班', desc: '學測與分科測驗雙軌準備，強化解題速度與精準度。', schedule: '每週一、四　19:00–21:30' },
        { subject: '英文', title: '高中英文閱讀寫作班', desc: '長篇閱讀理解、寫作與口說能力綜合訓練。', schedule: '每週二、五　19:00–21:00' },
        { subject: '物理', title: '高中物理分科加強班', desc: '針對分科測驗重點單元深化解題能力。', schedule: '每週六　9:00–11:30' },
        { subject: '化學', title: '高中化學學測衝刺班', desc: '有機、無機化學重點整理與大量題型演練。', schedule: '每週日　9:00–11:30' },
      ],
    },
  };

  var current = 'elementary';

  function renderTabs() {
    tabsEl.innerHTML = Object.keys(stages)
      .map(function (key) {
        return (
          '<button class="tab-btn' +
          (current === key ? ' active' : '') +
          '" data-stage="' +
          key +
          '">' +
          stages[key].label +
          '</button>'
        );
      })
      .join('');
    tabsEl.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute('data-stage');
        renderTabs();
        renderCourses();
      });
    });
  }

  function renderCourses() {
    listEl.innerHTML = stages[current].courses
      .map(function (c) {
        return (
          '<div class="card">' +
          '<span class="card-tag">' + c.subject + '</span>' +
          '<h3>' + c.title + '</h3>' +
          '<p>' + c.desc + '</p>' +
          '<div class="card-meta">' + c.schedule + '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  renderTabs();
  renderCourses();
})();
