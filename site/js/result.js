/* TypePop result page: profile render, score bars, shareable canvas card */
(function () {
  'use strict';

  var DIMS = ['EI', 'SN', 'TF', 'JP'];
  var POLE_NAMES = {
    en: { E: 'Extraverted', I: 'Introverted', S: 'Sensing', N: 'Intuitive', T: 'Thinking', F: 'Feeling', J: 'Judging', P: 'Perceiving' },
    ko: { E: '외향형', I: '내향형', S: '감각형', N: '직관형', T: '사고형', F: '감정형', J: '판단형', P: '인식형' }
  };

  function getCode() {
    var m = window.location.search.match(/[?&]code=([A-Za-z]{4})/);
    return m ? m[1].toUpperCase() : null;
  }

  function getStored() {
    try {
      var raw = sessionStorage.getItem('typepop_result');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function pills(el, items) {
    el.innerHTML = '';
    items.forEach(function (s) {
      var span = document.createElement('span');
      span.className = 'pill' + (el.id === 'growth' ? ' warn' : '');
      span.textContent = s;
      el.appendChild(span);
    });
  }

  function renderBars(stored) {
    var wrap = document.getElementById('bars');
    var lang = window.TP.getLang();
    wrap.innerHTML = '';
    DIMS.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'bar-row';
      var p0 = d[0], p1 = d[1];
      var pct0 = stored && stored.dims && stored.dims[d] ? stored.dims[d].pctFirst : 50;
      var pct1 = 100 - pct0;
      var names = POLE_NAMES[lang] || POLE_NAMES.en;
      row.innerHTML =
        '<div class="bar-labels"><span>' + p0 + ' · ' + names[p0] +
        ' <span class="pct">' + pct0 + '%</span></span>' +
        '<span><span class="pct">' + pct1 + '%</span> ' + names[p1] + ' · ' + p1 + '</span></div>' +
        '<div class="bar-track"><div class="bar-mid"></div>' +
        '<div class="bar-fill" style="width:' + pct0 + '%"></div></div>';
      wrap.appendChild(row);
    });
    document.getElementById('barsSection').style.display = stored ? '' : 'none';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCard(tp, code) {
    var canvas = document.getElementById('shareCanvas');
    var ctx = canvas.getContext('2d');
    var W = 1080, H = 1080;
    var lang = window.TP.getLang();
    var color = window.TP.typeColor(code);

    // background
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#FFF8F0');
    g.addColorStop(1, '#F6ECFF');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // top color band
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, 300);

    // card
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 90, 220, W - 180, H - 320, 48);
    ctx.fill();
    ctx.strokeStyle = '#F0E6D8';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.textAlign = 'center';
    // kicker
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 44px Poppins, "Noto Sans KR", sans-serif';
    ctx.fillText(lang === 'ko' ? '🎭 나의 성격 유형' : '🎭 My personality type', W / 2, 130);
    // code
    ctx.fillStyle = '#2B2B3A';
    ctx.font = '800 150px Poppins, "Noto Sans KR", sans-serif';
    var spacing = code.split('').join('  ');
    ctx.fillText(code, W / 2, 470);
    // name
    ctx.font = '800 64px Poppins, "Noto Sans KR", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(tp.name[lang] || tp.name.en, W / 2, 580);
    // tagline (wrap)
    ctx.fillStyle = '#6B6B80';
    ctx.font = '600 40px Poppins, "Noto Sans KR", sans-serif';
    wrapText(ctx, tp.tagline[lang] || tp.tagline.en, W / 2, 660, W - 320, 52);
    // footer
    ctx.fillStyle = '#6B6B80';
    ctx.font = '700 36px Poppins, "Noto Sans KR", sans-serif';
    ctx.fillText(lang === 'ko' ? 'TypePop에서 테스트하기 🎉' : 'Take the test at TypePop 🎉', W / 2, H - 150);
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    var words = text.split(' ');
    var line = '', yy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy); line = words[i]; yy += lineH;
      } else line = test;
    }
    ctx.fillText(line, x, yy);
  }

  function render() {
    var code = getCode();
    var tp = code && window.TP.getType(code);
    var stored = getStored();
    var lang = window.TP.getLang();

    if (!tp) {
      document.getElementById('resultName').textContent =
        lang === 'ko' ? '결과를 찾을 수 없어요' : 'Result not found';
      document.getElementById('barsSection').style.display = 'none';
      return;
    }

    document.title = code + ' — ' + (tp.name[lang] || tp.name.en) + ' | TypePop';
    var badge = document.getElementById('resultBadge');
    badge.textContent = code;
    badge.style.background = window.TP.typeColor(code);
    document.getElementById('resultName').textContent = tp.name[lang] || tp.name.en;
    document.getElementById('resultTagline').textContent = tp.tagline[lang] || tp.tagline.en;
    document.getElementById('resultDesc').textContent = tp.desc[lang] || tp.desc.en;
    pills(document.getElementById('strengths'), tp.strengths[lang] || tp.strengths.en);
    pills(document.getElementById('growth'), tp.growth[lang] || tp.growth.en);
    document.getElementById('celebsTitle').textContent = window.TP.t('celebs_t', { code: code });
    pills(document.getElementById('celebs'), tp.celebs[lang] || tp.celebs.en);

    renderBars(stored && stored.code === code ? stored : null);
    drawCard(tp, code);
    wireShare(tp, code);
  }

  function wireShare(tp, code) {
    var lang = window.TP.getLang();
    var pageUrl = window.location.href.split('?')[0] + '?code=' + code;
    var text = lang === 'ko'
      ? '내 성격 유형은 ' + code + ' (' + (tp.name.ko || tp.name.en) + ')! 너의 유형은? 🎭'
      : 'I\'m ' + code + ' (' + (tp.name.en) + ')! What\'s your type? 🎭';

    document.getElementById('dlBtn').onclick = function () {
      var a = document.createElement('a');
      a.download = 'typepop-' + code.toLowerCase() + '.png';
      a.href = document.getElementById('shareCanvas').toDataURL('image/png');
      a.click();
    };
    document.getElementById('copyBtn').onclick = function () {
      var done = function () {
        var b = document.getElementById('copyBtn');
        b.textContent = window.TP.t('copied');
        setTimeout(function () { window.TP.applyI18n(); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pageUrl).then(done, done);
      } else {
        window.prompt('Copy link:', pageUrl); done();
      }
    };
    document.getElementById('xBtn').onclick = function () {
      window.open('https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(text) + '&url=' + encodeURIComponent(pageUrl), '_blank');
    };
    var kakao = document.getElementById('kakaoBtn');
    kakao.title = window.TP.t('kakao_soon');
    kakao.onclick = function () { window.alert(window.TP.t('kakao_soon')); };

    var nsb = document.getElementById('nativeShareBtn');
    if (navigator.share) {
      nsb.style.display = '';
      nsb.textContent = '📤 ' + (lang === 'ko' ? '공유' : 'Share');
      nsb.onclick = function () {
        navigator.share({ title: document.title, text: text, url: pageUrl }).catch(function () {});
      };
    } else {
      nsb.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    window.__onLangChange = render;
  });
})();
