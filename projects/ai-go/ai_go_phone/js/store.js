const LS_KEY = 'ai_go_state_v1';
const listeners = new Set();

const initial = {
  user: null, // 로그인하지 않은 상태로 초기화
  stats: { quizzes:47, accuracy:89, streakDays:12, studyHours:24 },
  // 퀴즈/오답노트 등 필요한 전역 상태 추가
};

let state = (()=> {
  try { return {...initial, ...(JSON.parse(localStorage.getItem(LS_KEY))||{})}; }
  catch { return initial; }
})();

const notify = () => {
  listeners.forEach(fn => fn(state));
  
  // 상단바 사용자 정보 업데이트 - 항상 숨김 (home_logged_in.html의 상단바 사용)
  const mainTopbar = document.getElementById('mainTopbar');
  if (mainTopbar) {
    mainTopbar.style.display = 'none';
  }
  
  // 헤더의 사용자 칩 업데이트
  updateHeaderUserInfo();
};

// 헤더의 사용자 정보 업데이트 함수
const updateHeaderUserInfo = () => {
  const userChip = document.querySelector('#userChip');
  const userAvatar = document.querySelector('#userAvatar');
  const userName = document.querySelector('#userName');
  
  if (!userChip || !userAvatar || !userName) {
    return;
  }

  if (state.user && state.user.name) {
    // 로그인된 상태: 사용자 칩 표시
    userChip.style.display = 'flex';
    userAvatar.textContent = state.user.name.charAt(0); // 이름의 첫 글자
    userName.textContent = state.user.name;
  } else {
    // 로그인하지 않은 상태: 사용자 칩 숨김
    userChip.style.display = 'none !important';
  }
};

export const store = {
  get: () => state,
  set: (patch) => { state = {...state, ...patch}; localStorage.setItem(LS_KEY, JSON.stringify(state)); notify(); },
  update: (fn) => { state = fn(state); localStorage.setItem(LS_KEY, JSON.stringify(state)); notify(); },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
};
