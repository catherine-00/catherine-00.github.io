// app/views/mypage/mypage.js
import { store } from '../../js/store.js';

/** HTML 파일을 로드해 <style>을 head에 주입하고 .app 영역만 반환 */
async function loadViewHtml(filePath, styleId = 'mypage-style') {
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
  return await loadViewHtml('./views/mypage/mypage.html');
}

export async function mount(root) {
  const $ = (s, sc = root) => sc.querySelector(s);
  const $$ = (s, sc = root) => Array.from(sc.querySelectorAll(s));

  // 사용자 정보 업데이트
  const user = store.get()?.user ?? { name: '김운전', email: 'driverKim@email.com' };
  
  // 프로필 정보 업데이트
  const nameElement = $('.name');
  const emailElement = $('.meta span');
  
  if (nameElement) nameElement.textContent = user.name || '사용자';
  if (emailElement) emailElement.textContent = user.email || 'user@email.com';

  // 통계 데이터 업데이트 (실제로는 API에서 가져와야 함)
  const quizCount = $('#quizCount');
  const accuracy = $('#accuracy');
  const streakDays = $('#streakDays');
  const studyHours = $('#studyHours');

  if (quizCount) quizCount.textContent = '47';
  if (accuracy) accuracy.textContent = '89%';
  if (streakDays) streakDays.textContent = '12일';
  if (studyHours) studyHours.textContent = '24시간';

  // 로그아웃 버튼 이벤트
  const logoutBtn = $('#logoutBtn');
  const logoutModal = $('#logoutModal');
  const cancelBtn = $('#cancelBtn');
  const confirmBtn = $('#confirmBtn');

  const showLogoutModal = () => {
    if (logoutModal) {
      logoutModal.style.display = 'flex';
      logoutModal.setAttribute('aria-hidden', 'false');
    }
  };

  const hideLogoutModal = () => {
    if (logoutModal) {
      logoutModal.style.display = 'none';
      logoutModal.setAttribute('aria-hidden', 'true');
    }
  };

  const handleLogout = () => {
    // store에서 사용자 정보 제거
    store.update((s) => ({ ...s, user: null }));
    // 로그인 페이지로 이동
    location.hash = '#/login';
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      hideLogoutModal();
    }
  };

  // 이벤트 리스너 등록
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', hideLogoutModal);
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', handleLogout);
  }

  // 모달 외부 클릭 시 닫기
  if (logoutModal) {
    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) {
        hideLogoutModal();
      }
    });
  }

  // ESC 키로 모달 닫기
  window.addEventListener('keydown', handleKeydown);

  // 설정 메뉴 아이템들 이벤트
  const menuItems = $$('.item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.i-title')?.textContent;
      console.log(`${title} 메뉴 클릭됨`);
      
      // 앱 설정 메뉴 클릭 시 설정 페이지로 이동
      if (title === '앱 설정') {
        location.hash = '#/settings';
      }
      // 다른 메뉴들은 필요에 따라 구현
    });
  });

  // 언마운트 시 정리
  return () => {
    if (logoutBtn) {
      logoutBtn.removeEventListener('click', showLogoutModal);
    }
    if (cancelBtn) {
      cancelBtn.removeEventListener('click', hideLogoutModal);
    }
    if (confirmBtn) {
      confirmBtn.removeEventListener('click', handleLogout);
    }
    if (logoutModal) {
      logoutModal.removeEventListener('click', () => {});
    }
    window.removeEventListener('keydown', handleKeydown);
    
    menuItems.forEach(item => {
      item.removeEventListener('click', () => {});
    });
  };
}
