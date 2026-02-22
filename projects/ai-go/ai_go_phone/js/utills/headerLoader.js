/**
 * 헤더 로더 - 모든 페이지에 일관된 헤더를 제공
 * 
 * 사용법:
 * 1. HTML 파일에 <script src="../../js/utills/headerLoader.js"></script> 추가
 * 2. 자동으로 페이지 상단에 헤더가 삽입됩니다
 */
class HeaderLoader {
  constructor() {
    this.headerHeight = 60; // 헤더 높이 (px)
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    // DOM이 로드된 후 헤더 추가
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadHeader());
    } else {
      this.loadHeader();
    }
  }

  /**
   * 헤더 HTML 로드 및 삽입
   */
  async loadHeader() {
    try {
      // 헤더 파일 경로 계산
      const headerPath = this.getHeaderPath();
      
      // 헤더 HTML 파일 로드
      const response = await fetch(headerPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const headerHTML = await response.text();
      
      // 헤더를 페이지 상단에 삽입
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
      
      // 헤더 이벤트 리스너 등록
      this.setupHeaderEvents();
      
      console.log('헤더가 성공적으로 로드되었습니다.');
      
    } catch (error) {
      console.error('헤더 로드 실패:', error);
      // 폴백: 기본 헤더 생성
      this.createFallbackHeader();
    }
  }

  /**
   * 현재 페이지 위치에 따른 헤더 경로 계산
   * @returns {string} 헤더 파일 경로
   */
  getHeaderPath() {
    // 현재 스크립트의 src를 기반으로 경로 계산
    const scripts = document.querySelectorAll('script[src*="headerLoader.js"]');
    if (scripts.length > 0) {
      const scriptSrc = scripts[scripts.length - 1].src;
      const scriptPath = new URL(scriptSrc).pathname;
      
      if (scriptPath.includes('/views/home/') || scriptPath.includes('/views/sign_up/')) {
        return 'views/components/header.html';
      } else if (scriptPath.includes('/views/')) {
        return '../components/header.html';
      }
    }
    
    // 기본값: 상대 경로로 헤더 파일 찾기
    return 'views/components/header.html';
  }

  /**
   * 폴백 헤더 생성 (로드 실패 시)
   */
  createFallbackHeader() {
    const fallbackHeader = `
      <header class="topbar" role="banner">
        <div class="row">
          <button class="btn-icon" aria-label="메뉴" title="메뉴">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <div class="logo" aria-label="아이-고 홈">
            <img src="img/ai_go_logo.png" class="logo-img" onerror="this.style.display='none'">
            <span>아이-고</span>
          </div>
        </div>
        <div class="chip" id="userChip" role="button" aria-label="내 정보" style="display: none !important;">
          <span class="avatar" aria-hidden="true" id="userAvatar"></span>
          <span id="userName"></span>
        </div>
      </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', fallbackHeader);
    this.setupHeaderEvents();
    console.log('폴백 헤더가 생성되었습니다.');
  }

  /**
   * 헤더 이벤트 리스너 설정
   */
  setupHeaderEvents() {
    // 햄버거 메뉴 버튼 클릭 이벤트
    const menuButton = document.querySelector('.btn-icon');
    if (menuButton) {
      menuButton.addEventListener('click', () => {
        console.log('메뉴 버튼 클릭됨');
        // TODO: 사이드바 열기 기능 구현
      });
    }

    // 사용자 칩 클릭 이벤트
    const userChip = document.querySelector('#userChip');
    if (userChip) {
      userChip.addEventListener('click', () => {
        console.log('사용자 정보 클릭됨');
        // TODO: 마이페이지로 이동
        window.location.hash = '#/mypage';
      });
    }

    // 로고 클릭 이벤트
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        console.log('로고 클릭됨');
        // TODO: 홈으로 이동
        window.location.hash = '#/home';
      });
    }

    // store 상태 구독하여 사용자 정보 업데이트
    this.subscribeToStore();
  }

  /**
   * store 상태 구독하여 사용자 정보 업데이트
   */
  subscribeToStore() {
    // store 모듈 동적 import
    import('../store.js').then(storeModule => {
      const store = storeModule.store;
      
      // store 상태 변경 시 사용자 정보 업데이트
      store.subscribe((state) => {
        this.updateUserInfo(state.user);
      });
      
      // 초기 상태로 사용자 정보 업데이트
      this.updateUserInfo(store.get().user);
    }).catch(error => {
      console.error('store 모듈 로드 실패:', error);
    });
  }

  /**
   * 사용자 정보 업데이트
   * @param {Object|null} user - 사용자 정보 객체 또는 null
   */
  updateUserInfo(user) {
    const userChip = document.querySelector('#userChip');
    const userAvatar = document.querySelector('#userAvatar');
    const userName = document.querySelector('#userName');
    
    if (!userChip || !userAvatar || !userName) {
      return;
    }

    if (user && user.name) {
      // 로그인된 상태: 사용자 칩 표시
      userChip.style.display = 'flex';
      userAvatar.textContent = user.name.charAt(0); // 이름의 첫 글자
      userName.textContent = user.name;
    } else {
      // 로그인하지 않은 상태: 사용자 칩 숨김
      userChip.style.display = 'none !important';
    }
  }

  /**
   * 헤더 높이 반환 (레이아웃 계산용)
   */
  getHeaderHeight() {
    return this.headerHeight;
  }
}

// 자동으로 HeaderLoader 인스턴스 생성
const headerLoader = new HeaderLoader();

// 전역에서 접근 가능하도록 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderLoader;
} else if (typeof window !== 'undefined') {
  window.HeaderLoader = HeaderLoader;
}
