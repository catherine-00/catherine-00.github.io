// app/views/home/login.js
import { api } from '../../js/api.js';
import { store } from '../../js/store.js';

/** HTML 파일을 로드해 <style>을 head에 주입하고 .app 영역만 반환 */
async function loadViewHtml(filePath, styleId = 'login-style') {
  const html = await (await fetch(filePath, { cache: 'no-cache' })).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // <style> 주입(중복 방지)
  const style = doc.querySelector('style');
  if (style) {
    let s = document.getElementById(styleId);
    if (!s) {
      s = document.createElement('style');
      s.id = styleId;
      document.head.appendChild(s);
    }
    s.textContent = style.textContent;
  }
  const root = doc.querySelector('.app') || doc.body;
  return root.outerHTML;
}

export async function render() {
  // index.html 기준 경로
  return await loadViewHtml('./views/home/login.html');
}

export async function mount(root) {
  const $  = (s, sc = root) => sc.querySelector(s);

  // 하단 네비게이션 바 숨기기
  const drawer = document.getElementById('drawer');
  if (drawer) {
    drawer.style.display = 'none';
  }

  // 로그인 페이지에서는 사용자 칩만 숨김 처리
  const hideUserChip = () => {
    const userChip = document.querySelector('.topbar .chip');
    if (userChip) {
      userChip.style.display = 'none !important';
    }
  };

  // 페이지 로드 시 사용자 칩 숨김
  hideUserChip();

  // --- 로고 클릭 차단 (로그인 페이지에서만)
  let isLoginPage = true; // 로그인 페이지 상태 플래그
  let logoClickHandler = null;
  
  const blockLogoClick = () => {
    // 기존 이벤트 리스너 제거
    if (logoClickHandler) {
      document.removeEventListener('click', logoClickHandler);
    }
    
    // 로고 클릭 이벤트 차단 (더 높은 우선순위로)
    logoClickHandler = (e) => {
      const logo = e.target.closest('.logo');
      if (logo && isLoginPage) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('로그인 페이지에서는 로고 클릭이 차단됩니다');
        return false;
      }
    };
    
    // capture 단계에서 이벤트 리스너 등록 (더 높은 우선순위)
    document.addEventListener('click', logoClickHandler, true);
    
    // 추가적으로 로고 요소에 직접 이벤트 리스너 추가
    const addDirectLogoBlockers = () => {
      const logos = document.querySelectorAll('.logo');
      logos.forEach(logo => {
        const directHandler = (e) => {
          if (isLoginPage) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('직접 로고 클릭 차단됨');
            return false;
          }
        };
        logo.addEventListener('click', directHandler, true);
        logo._loginPageBlocker = directHandler; // 나중에 제거하기 위해 저장
      });
    };
    
    // DOM이 로드된 후 실행
    setTimeout(addDirectLogoBlockers, 100);
    
    console.log('로고 클릭 차단 설정됨'); // 디버깅용
  };

  // --- 하단 네비게이션 바 동적 생성
  const createBottomNavigation = () => {
    // 이미 네비게이션이 있으면 제거
    const existingNav = document.getElementById('bottomNav');
    if (existingNav) {
      existingNav.remove();
    }

    // 네비게이션 HTML 생성
    const navHTML = `
      <aside id="bottomNav" class="drawer" role="navigation" aria-label="메인 네비게이션">
        <nav>
          <ul>
            <li><a href="#/home" class="nav-item" data-route="home">
              <span class="ic"><img src="img/home_icon.png" alt="홈" width="20" height="20"></span>
              <span class="txt">홈</span>
            </a></li>
            <li><a href="#/quiz" class="nav-item theme-green" data-route="quiz">
              <span class="ic"><img src="img/quiz_icon.png" alt="퀴즈" width="20" height="20"></span>
              <span class="txt">퀴즈</span>
            </a></li>
            <li><a href="#/wrong-notes" class="nav-item theme-red" data-route="wrong-notes">
              <span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
              <span class="txt">오답노트</span>
            </a></li>
            <li><a href="#/analytics" class="nav-item theme-purple" data-route="analytics">
              <span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 13h2v5H7zM11 9h2v9h-2zM15 6h2v12h-2z"/></svg></span>
              <span class="txt">분석</span>
            </a></li>
            <li><a href="#/mypage" class="nav-item theme-orange" data-route="mypage">
              <span class="ic"><img src="img/robot_icon.png" alt="내 정보" width="20" height="20"></span>
              <span class="txt">내 정보</span>
            </a></li>
          </ul>
        </nav>
      </aside>
    `;

    // CSS 스타일 추가
    const styleHTML = `
      <style id="bottomNavStyle">
        /* ===================== Bottom Navigation (모바일 하단 작업표시줄) ===================== */
        .drawer{
          position:fixed;bottom:0;left:0;right:0;height:80px;background:var(--card);
          border-top:1px solid var(--line);box-shadow:0 -4px 20px rgba(0,0,0,0.1);
          z-index:21;display:flex;align-items:center;justify-content:space-around;
          padding:0 16px;box-sizing:border-box;
        }

        .drawer nav ul{
          display:flex;align-items:center;justify-content:space-around;width:100%;
          list-style:none;margin:0;padding:0;gap:8px;
        }

        .drawer nav li{
          flex:1;display:flex;justify-content:center;
        }

        .nav-item{
          display:flex;flex-direction:column;align-items:center;gap:4px;
          padding:8px 4px;border-radius:12px;text-decoration:none;
          color:var(--muted);transition:all 0.2s ease;min-width:0;flex:1;
          border:none;background:none;cursor:pointer;
        }

        .nav-item:hover{
          background:var(--blue-050);color:var(--blue);
        }

        .nav-item.active{
          background:var(--blue-050);color:var(--blue);
        }

        .nav-item .ic{
          display:flex;align-items:center;justify-content:center;
          width:24px;height:24px;flex-shrink:0;
        }

        .nav-item .txt{
          font-size:11px;font-weight:500;line-height:1.2;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
      </style>
    `;

    // body에 네비게이션과 스타일 추가
    document.head.insertAdjacentHTML('beforeend', styleHTML);
    document.body.insertAdjacentHTML('beforeend', navHTML);
    console.log('하단 네비게이션 생성됨'); // 디버깅용
  };

  // --- 모달 동적 생성
  const createModal = () => {
    // 이미 모달이 있으면 제거
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 HTML 생성
    const modalHTML = `
      <div id="loginModal" class="modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>로그인이 필요합니다</h3>
            <button class="modal-close" aria-label="닫기">&times;</button>
          </div>
          <div class="modal-body">
            <p>해당 기능을 이용하려면 먼저 로그인해주세요.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="modalLoginBtn">로그인하기</button>
            <button class="btn btn-secondary" id="modalCloseBtn">취소</button>
          </div>
        </div>
      </div>
    `;

    // 모달 CSS 스타일 추가
    const modalStyleHTML = `
      <style id="modalStyle">
        /* 모달 스타일 */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: var(--card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow);
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--line);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          font-size: 24px;
          color: var(--muted);
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--blue-050);
          color: var(--blue);
        }

        .modal-body {
          padding: 20px 24px;
        }

        .modal-body p {
          margin: 0;
          color: var(--muted);
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px 24px;
        }

        .btn {
          flex: 1;
          height: 44px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: var(--blue);
          color: white;
        }

        .btn-primary:hover {
          background: var(--blue-700);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--line);
          color: var(--text);
        }

        .btn-secondary:hover {
          background: #d1d5db;
          transform: translateY(-1px);
        }
      </style>
    `;

    // body에 모달과 스타일 추가
    document.head.insertAdjacentHTML('beforeend', modalStyleHTML);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('모달 생성됨'); // 디버깅용
  };

  // --- 모달 관련 요소 참조
  const getModalElements = () => {
    return {
      loginModal: document.getElementById('loginModal'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalLoginBtn: document.getElementById('modalLoginBtn'),
      modalCloseX: document.querySelector('.modal-close'),
      modalOverlay: document.querySelector('.modal-overlay')
    };
  };

  // --- 모달 기능
  const showModal = () => {
    console.log('showModal 호출됨'); // 디버깅용
    
    // 모달이 없으면 생성
    let { loginModal } = getModalElements();
    if (!loginModal) {
      createModal();
      loginModal = document.getElementById('loginModal');
    }
    
    if (loginModal) {
      loginModal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // 스크롤 방지
      console.log('모달 표시됨'); // 디버깅용
    } else {
      console.error('모달을 생성할 수 없습니다');
    }
  };

  const hideModal = () => {
    const { loginModal } = getModalElements();
    if (loginModal) {
      loginModal.style.display = 'none';
      document.body.style.overflow = ''; // 스크롤 복원
    }
  };

  // --- 하단 네비게이션 이벤트 처리 (로그인 페이지에서는 사용하지 않음)
  const setupBottomNavigation = () => {
    // 로그인 페이지에서는 하단 네비게이션 이벤트를 설정하지 않음
    console.log('로그인 페이지에서는 하단 네비게이션 이벤트를 설정하지 않습니다');
  };

  // --- 요소 참조
  const form        = $('.form');
  const emailInput  = form?.querySelector('input[type="email"]');
  const pwInput     = form?.querySelector('input[type="password"]');
  const pwToggleBtn = form?.querySelector('label[aria-label="비밀번호"] button');
  const rememberChk = form?.querySelector('.remember input');
  const signupLink  = $('.signup a');
  const ctaBtn      = $('.cta .cta-btn');
  const loginLink   = $('.link-login'); // 우상단

  // 마지막 이메일 기억
  // const lastEmail = localStorage.getItem('ai_go_last_email');
  // if (lastEmail && emailInput) emailInput.value = lastEmail;

  // --- 핸들러
  const onTogglePw = () => {
    if (!pwInput) return;
    pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
    pwInput.focus();
  };

  const go = (hash) => (e) => { e.preventDefault(); location.hash = hash; };
  const toSignup = go('#/signup');
  const toLogin  = go('#/login');

  const onSubmit = async (e) => {
    e.preventDefault();
    const email = emailInput?.value.trim() || '';
    const password = pwInput?.value || '';

    try {
      const res = await api.login({ email, password });
      store.update((s) => ({ ...s, user: res.user }));

      // remember 체크 시 토큰/이메일 저장(토큰은 api 응답에 따라 선택)
      localStorage.setItem('ai_go_last_email', email);
      if (rememberChk?.checked && res?.token) {
        localStorage.setItem('ai_go_token', res.token);
      }

      location.hash = '#/home';
    } catch (err) {
      // TODO: figma 팝업으로 교체 가능
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.warn('login failed:', err);
    }
  };

  // --- 이벤트 연결
  pwToggleBtn?.addEventListener('click', onTogglePw);
  form?.addEventListener('submit', onSubmit);
  signupLink?.addEventListener('click', toSignup);
  ctaBtn?.addEventListener('click', toSignup);
  loginLink?.addEventListener('click', toLogin);

  // 모달 이벤트 연결
  const setupModalEvents = () => {
    // 모달 생성
    createModal();
    
    // 이벤트 위임을 사용하여 동적으로 생성된 모달 요소에 이벤트 연결
    document.addEventListener('click', (e) => {
      if (e.target.id === 'modalCloseBtn' || e.target.classList.contains('modal-close')) {
        hideModal();
      } else if (e.target.id === 'modalLoginBtn') {
        hideModal();
        // 로그인 폼으로 포커스 이동
        emailInput?.focus();
      } else if (e.target.classList.contains('modal-overlay')) {
        hideModal();
      }
    });
    
    console.log('모달 이벤트 설정됨'); // 디버깅용
  };

  // 하단 네비게이션 초기화 (로그인 페이지에서는 생성하지 않음)
  const setupBottomNavigationInit = () => {
    // 로그인 페이지에서는 하단 네비게이션을 생성하지 않음
    console.log('로그인 페이지에서는 하단 네비게이션을 생성하지 않습니다');
  };

  // ESC 키로 모달 닫기
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      const { loginModal } = getModalElements();
      if (loginModal?.style.display === 'flex') {
        hideModal();
      }
    }
  };
  document.addEventListener('keydown', handleEscape);

  // 모달 이벤트 초기화
  setupModalEvents();

  // 하단 네비게이션 초기화
  setupBottomNavigationInit();

  // 로고 클릭 차단 초기화
  blockLogoClick();

  // 언마운트 시 정리
  return () => {
    pwToggleBtn?.removeEventListener('click', onTogglePw);
    form?.removeEventListener('submit', onSubmit);
    signupLink?.removeEventListener('click', toSignup);
    ctaBtn?.removeEventListener('click', toSignup);
    loginLink?.removeEventListener('click', toLogin);
    
    // ESC 키 이벤트 정리
    document.removeEventListener('keydown', handleEscape);
    
    // 로고 클릭 차단 이벤트 정리
    if (logoClickHandler) {
      document.removeEventListener('click', logoClickHandler, true);
      logoClickHandler = null;
    }
    
    // 직접 추가한 로고 이벤트 리스너들 정리
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
      if (logo._loginPageBlocker) {
        logo.removeEventListener('click', logo._loginPageBlocker, true);
        delete logo._loginPageBlocker;
      }
    });
    
    // 로그인 페이지를 떠날 때 사용자 칩 다시 표시 (로그인 상태에 따라)
    const userChip = document.querySelector('.topbar .chip');
    if (userChip) {
      userChip.style.display = '';
    }
    
    // 로그인 페이지 상태를 false로 변경하여 다른 페이지에서는 로고 클릭이 정상 작동
    isLoginPage = false;
    
    // 모달이 열려있다면 닫기
    hideModal();
    
    // 모달 제거
    const existingModal = document.getElementById('loginModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // 로그인 페이지에서는 하단 네비게이션이 생성되지 않으므로 정리 불필요
    
    const modalStyle = document.getElementById('modalStyle');
    if (modalStyle) {
      modalStyle.remove();
    }
  };
}