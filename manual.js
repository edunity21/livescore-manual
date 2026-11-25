/* 실시간 악보 플랫폼 매뉴얼 — 동작 */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. 단락 마지막 줄에 한 글자만 남지 않게 끝 세 글자를 붙인다 */
  $$('p, li, td, figcaption').forEach(function (el) {
    if (el.querySelector('p, li, td, label')) return;
    var d = getComputedStyle(el).display;
    if (d.indexOf('flex') > -1 || d.indexOf('grid') > -1) return;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), last = null, n;
    while ((n = w.nextNode())) { if (n.nodeValue.trim()) last = n; }
    if (!last || el.textContent.trim().length < 8) return;
    var t = last.nodeValue, m = t.match(/\S{1,3}\s*$/);
    if (!m) return;
    var cut = t.length - m[0].length, sp = document.createElement('span');
    sp.className = 'nw'; sp.textContent = t.slice(cut);
    last.nodeValue = t.slice(0, cut);
    last.parentNode.insertBefore(sp, last.nextSibling);
  });

  /* 2. 차례: 지금 읽는 부분 표시 */
  var links = $$('.toc a');
  if (links.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('main .sec').forEach(function (s) { io.observe(s); });
  }

  /* 3. 인쇄 */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* 4. 확인 목록 (이 기기에만 저장) */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  $$('[data-store]').forEach(function (ul) {
    var key = 'livescore-' + ul.getAttribute('data-store');
    var boxes = $$('input[type="checkbox"]', ul);
    var cnt = document.querySelector('[data-count="' + ul.getAttribute('data-store') + '"]');
    var saved = (store.get(key) || '').split('');
    var count = function () { if (cnt) cnt.textContent = boxes.filter(function (b) { return b.checked; }).length + ' / ' + boxes.length; };
    boxes.forEach(function (b, i) {
      b.checked = saved[i] === '1';
      b.addEventListener('change', function () {
        store.set(key, boxes.map(function (x) { return x.checked ? '1' : '0'; }).join(''));
        count();
      });
    });
    count();
  });
})();
