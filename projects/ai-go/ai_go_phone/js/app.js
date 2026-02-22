// app/js/app.js
import { createRouter } from './router.js';
import { store } from './store.js';
import { mountDrawer } from '../views/sidebar/drawer.js';

// 전역 드로어 1회 주입 (로그인/회원가입 페이지 제외)
const initializeDrawer = () => {
  // 현재 페이지가 로그인 또는 회원가입 페이지가 아닐 때만 드로어 생성
  if (window.location.hash !== '#/login' && window.location.hash !== '#/signup') {
    mountDrawer();
  }
};

// 초기 로드 시 드로어 초기화
initializeDrawer();

// 해시 변경 시 드로어 상태 업데이트
window.addEventListener('hashchange', () => {
  const drawer = document.getElementById('drawer');
  if (window.location.hash === '#/login' || window.location.hash === '#/signup') {
    // 로그인 또는 회원가입 페이지일 때 드로어 숨김
    if (drawer) {
      drawer.style.display = 'none';
    }
  } else {
    // 다른 페이지일 때 드로어 표시
    if (drawer) {
      drawer.style.display = 'flex';
    } else {
      // 드로어가 없으면 생성
      mountDrawer();
    }
  }
});

const routes = {
  '#/'         : () => import('../views/loading/loading.js'),
  '#/loading'  : () => import('../views/loading/loading.js'),
  '#/login'    : () => import('../views/home/login.js'),
  '#/home'     : () => import('../views/home/home_logged_in.js'),
  '#/signup'   : () => import('../views/sign_up/sign_up.js'),
  '#/quiz'     : () => import('../views/quiz/quiz.js'),
  '#/wrong'    : () => import('../views/wrong_answer_note/wrongNotes.js'),
  '#/wrong-notes': () => import('../views/wrong_answer_note/wrongNotes.js'),
  '#/analytics': () => import('../views/learning_analytics/analytics.js'),
  '#/mypage'   : () => import('../views/mypage/mypage.js'),
  '#/settings' : () => import('../views/settings/settings.js'),
  '#/404'      : async () => ({ render: async () => '<div style="padding:16px">페이지가 없습니다.</div>' }),
};




createRouter(routes, {
  onAfter: (path) => {
    console.debug('navigated:', path, store.get().user);
    
    // 상단바 표시/숨김 처리 - store에서 자동으로 처리됨
    // store.notify()가 호출되어 사용자 상태에 따라 상단바가 표시/숨김됨
  },
});