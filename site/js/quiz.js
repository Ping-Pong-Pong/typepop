/* TypePop quiz engine: renders questions, collects Likert answers, scores 4 dichotomies */
(function () {
  'use strict';

  var DIMS = ['EI', 'SN', 'TF', 'JP'];
  var answers = {}; // qid -> 1..5
  var order = [];   // question ids in display order
  var idx = 0;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function questions() { return window.TP_QUESTIONS || []; }

  function score() {
    // net[dim] > 0 favors dim[0] (E/S/T/J), < 0 favors dim[1] (I/N/F/P)
    var net = { EI: 0, SN: 0, TF: 0, JP: 0 };
    var counts = { EI: 0, SN: 0, TF: 0, JP: 0 };
    var strongest = {}; // dim -> {abs, pole} for tie-breaking
    questions().forEach(function (q) {
      if (!(q.id in answers)) return;
      var a = answers[q.id]; // 1..5
      var dev = a - 3;       // -2..+2, positive = agrees with q.pole
      var s = (q.pole === q.dim[0]) ? dev : -dev; // signed toward dim[0]
      net[q.dim] += s;
      counts[q.dim] += 1;
      var abs = Math.abs(dev);
      if (!strongest[q.dim] || abs > strongest[q.dim].abs) {
        var implied = dev > 0 ? q.pole : (q.pole === q.dim[0] ? q.dim[1] : q.dim[0]);
        strongest[q.dim] = { abs: abs, pole: implied };
      }
    });
    var code = '', dims = {};
    DIMS.forEach(function (d) {
      var n = net[d], winner;
      if (n > 0) winner = d[0];
      else if (n < 0) winner = d[1];
      else winner = (strongest[d] && strongest[d].abs > 0) ? strongest[d].pole : d[0];
      code += winner;
      var maxNet = 2 * counts[d] || 1;
      var pctFirst = Math.round(50 + (n / maxNet) * 50); // % toward dim[0]
      pctFirst = Math.max(1, Math.min(99, pctFirst));
      dims[d] = { winner: winner, pctFirst: pctFirst, pctSecond: 100 - pctFirst };
    });
    return { code: code, dims: dims };
  }

  function render() {
    var qs = questions();
    if (!qs.length) {
      document.getElementById('qText').textContent = '…';
      return;
    }
    var q = qs.filter(function (x) { return x.id === order[idx]; })[0];
    var lang = window.TP.getLang();
    document.getElementById('qCount').textContent =
      window.TP.t('q_of', { n: idx + 1, total: order.length });
    document.getElementById('progressFill').style.width =
      Math.round((idx / order.length) * 100) + '%';
    var card = document.getElementById('qCard');
    card.style.animation = 'none';
    void card.offsetWidth; // restart animation
    card.style.animation = '';
    document.getElementById('qText').textContent = q.text[lang] || q.text.en;
    var likert = document.getElementById('likert');
    likert.innerHTML = '';
    [5, 4, 3, 2, 1].forEach(function (v) {
      var b = document.createElement('button');
      b.innerHTML = '<span class="dot"></span><span>' + window.TP.t('l' + v) + '</span>';
      b.addEventListener('click', function () { answer(q.id, v); });
      likert.appendChild(b);
    });
    document.getElementById('backBtn').disabled = (idx === 0);
  }

  function answer(qid, v) {
    answers[qid] = v;
    if (idx < order.length - 1) {
      idx++;
      setTimeout(render, 120);
    } else {
      finish();
    }
  }

  function finish() {
    document.getElementById('progressFill').style.width = '100%';
    var result = score();
    try {
      sessionStorage.setItem('typepop_result', JSON.stringify({
        code: result.code, dims: result.dims, answers: answers, order: order
      }));
    } catch (e) {}
    window.location.href = 'result.html?code=' + result.code;
  }

  function goBack() {
    if (idx > 0) { idx--; render(); }
  }

  function restart() {
    answers = {}; idx = 0;
    order = shuffle(questions().map(function (q) { return q.id; }));
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    order = shuffle(questions().map(function (q) { return q.id; }));
    render();
    document.getElementById('backBtn').addEventListener('click', goBack);
    document.getElementById('restartBtn').addEventListener('click', restart);
    window.__onLangChange = render;
  });
})();
