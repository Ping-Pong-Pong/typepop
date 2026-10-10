/* TypePop shared app logic: i18n, language toggle, helpers */
(function () {
  'use strict';
  var LANG_KEY = 'typepop_lang';

  var UI = {
    en: {
      nav_home: 'Home', nav_types: '16 Types', nav_about: 'About',
      hero_kicker: '🎉 The 3-minute personality quiz',
      hero_title: 'What\'s <span class="hl">your type?</span>',
      hero_sub: 'Answer 32 fun questions and discover your 4-letter personality type — then share your result card with friends.',
      cta_start: 'Find my type 🚀', cta_browse: 'Browse the 16 types',
      how_title: 'How it works',
      step1_t: '1. Answer honestly', step1_d: '32 quick questions. No right or wrong answers — go with your gut.',
      step2_t: '2. Get your type', step2_d: 'We crunch your answers into one of 16 personality types with playful, shareable results.',
      step3_t: '3. Share & compare', step3_d: 'Download your result card and send it to the group chat. Settle the debate once and for all.',
      types_title: 'Meet the 16 types', types_sub: 'Every type, one card. Tap any type for the full profile.',
      footer_tag: 'Made for group chats everywhere.',
      footer_rights: '© 2026 TypePop · For fun & self-reflection — not a clinical instrument.',
      // quiz
      q_of: 'Question {n} of {total}',
      l1: 'Strongly disagree', l2: 'Disagree', l3: 'Neutral', l4: 'Agree', l5: 'Strongly agree',
      btn_back: '← Back', btn_restart: '↺ Retake quiz',
      // result
      your_type: 'Your type is',
      strengths_t: '💪 Strengths', growth_t: '🌱 Watch out', celebs_t: 'Famous {code}s',
      celebs_note: 'Community-reported typings — for fun, not facts.',
      share_title: 'Share your result',
      btn_download: '⬇ Download card', btn_copy: '🔗 Copy link', copied: 'Link copied! ✅',
      share_x: '𝕏 Post on X', share_kakao: '💬 KakaoTalk',
      kakao_soon: 'KakaoTalk sharing is coming soon.',
      retake: '↺ Retake the quiz', see_all: 'See all 16 types →',
      dim_EI: 'Energy', dim_SN: 'Mind', dim_TF: 'Decisions', dim_JP: 'Lifestyle',
      // types page
      all_types_t: 'All 16 personality types', all_types_d: 'Tap any card for strengths, watch-outs, and famous lookalikes.'
    },
    ko: {
      nav_home: '홈', nav_types: '16 유형', nav_about: '소개',
      hero_kicker: '🎉 3분 성격 테스트',
      hero_title: '너의 <span class="hl">유형은?</span>',
      hero_sub: '재미있는 32개 질문에 답하고 4글자 성격 유형을 찾아보세요. 결과 카드를 친구들에게 공유해 보세요!',
      cta_start: '내 유형 찾기 🚀', cta_browse: '16 유형 둘러보기',
      how_title: '이용 방법',
      step1_t: '1. 솔직하게 답하기', step1_d: '32개의 간단한 질문. 정답은 없어요 — 느낌 가는 대로!',
      step2_t: '2. 유형 확인', step2_d: '답변을 분석해 16가지 성격 유형 중 하나를 재미있는 결과 카드로 보여드려요.',
      step3_t: '3. 공유 & 비교', step3_d: '결과 카드를 저장해서 단톡방에 공유해 보세요. 누가 어떤 유형인지 논쟁 종결!',
      types_title: '16 유형 만나보기', types_sub: '모든 유형을 한눈에. 카드를 눌러 전체 프로필을 확인하세요.',
      footer_tag: '단톡방을 위해 만들었어요.',
      footer_rights: '© 2026 TypePop · 재미와 자기 성찰용 — 임상 검사가 아니에요.',
      // quiz
      q_of: '{total}개 중 {n}번째 질문',
      l1: '전혀 아니다', l2: '아니다', l3: '보통이다', l4: '그렇다', l5: '매우 그렇다',
      btn_back: '← 뒤로', btn_restart: '↺ 다시 하기',
      // result
      your_type: '당신의 유형은',
      strengths_t: '💪 강점', growth_t: '🌱 주의할 점', celebs_t: '유명한 {code}들',
      celebs_note: '팬들이 추측하는 유형 — 재미로만 보세요!',
      share_title: '결과 공유하기',
      btn_download: '⬇ 카드 저장', btn_copy: '🔗 링크 복사', copied: '링크 복사됨! ✅',
      share_x: '𝕏 X에 공유', share_kakao: '💬 카카오톡',
      kakao_soon: '카카오톡 공유는 곧 지원될 예정이에요.',
      retake: '↺ 다시 하기', see_all: '16 유형 모두 보기 →',
      dim_EI: '에너지', dim_SN: '인식', dim_TF: '판단', dim_JP: '생활',
      // types page
      all_types_t: '16가지 성격 유형', all_types_d: '카드를 눌러 강점, 주의할 점, 유명인을 확인하세요.'
    }
  };

  function getLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ko') return saved;
    } catch (e) {}
    if (typeof navigator !== 'undefined' && navigator.language &&
        navigator.language.toLowerCase().indexOf('ko') === 0) return 'ko';
    return 'en';
  }

  function setLang(l) {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    document.documentElement.setAttribute('lang', l === 'ko' ? 'ko' : 'en');
    document.body.classList.remove('lang-en', 'lang-ko');
    document.body.classList.add(l === 'ko' ? 'lang-ko' : 'lang-en');
    applyI18n(l);
    var btns = document.querySelectorAll('.lang-toggle button');
    btns.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === l);
    });
    if (typeof window.__onLangChange === 'function') window.__onLangChange(l);
  }

  function t(key, vars) {
    var l = getLang();
    var s = (UI[l] && UI[l][key]) || UI.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) {
      s = s.split('{' + k + '}').join(vars[k]);
    });
    return s;
  }

  function applyI18n(l) {
    l = l || getLang();
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = (UI[l] && UI[l][key]) || UI.en[key];
      if (val != null) el.innerHTML = val;
    });
  }

  function initLangToggle() {
    var btns = document.querySelectorAll('.lang-toggle button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
  }

  // Type accent colors (stable per type, used for dots/badges)
  var TYPE_COLORS = {
    ENFP: '#FF6B6B', ENFJ: '#FF8E53', ENTP: '#FFD93D', ENTJ: '#E85555',
    INFP: '#B388FF', INFJ: '#7C5CFF', INTP: '#64B5F6', INTJ: '#5C6BC0',
    ESFP: '#FFB74D', ESFJ: '#FFA726', ESTP: '#FF8A65', ESTJ: '#A1887F',
    ISFP: '#81C784', ISFJ: '#AED581', ISTP: '#90A4AE', ISTJ: '#78909C'
  };

  function typeColor(code) { return TYPE_COLORS[code] || '#7C5CFF'; }

  function getType(code) {
    var types = window.TP_TYPES || [];
    for (var i = 0; i < types.length; i++) {
      if (types[i].code === code) return types[i];
    }
    return null;
  }

  // expose
  window.TP = {
    getLang: getLang, setLang: setLang, t: t,
    applyI18n: applyI18n, initLangToggle: initLangToggle,
    typeColor: typeColor, getType: getType
  };

  document.addEventListener('DOMContentLoaded', function () {
    setLang(getLang());
    initLangToggle();
  });
})();
