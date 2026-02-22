// 설정 페이지 모듈

/** 모듈 기준으로 settings.html을 읽어 <style> 주입 + .app 반환 */
async function loadViewHtml(styleId = 'settings-style') {
  const fileUrl = new URL('./settings.html', import.meta.url);
  const html = await (await fetch(fileUrl, { cache: 'no-cache' })).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

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
  
  const app = doc.querySelector('.app') || doc.body;
  return app.outerHTML;
}

export async function render() {
  return await loadViewHtml();
}

export async function mount(root) {
  const $ = (s, sc = root) => sc.querySelector(s);
  const $$ = (s, sc = root) => Array.from(sc.querySelectorAll(s));

  // DOM 요소들
  const backBtn = $('#backBtn');
  const magnifierToggle = $('#magnifierToggle');
  const saveBtn = $('#saveBtn');

  // 설정 상태
  let settings = {
    magnifierEnabled: false
  };

  // 설정 불러오기
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('ai-go-settings');
      if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.warn('설정 불러오기 실패:', error);
    }
    
    updateToggleUI();
  };

  // 설정 저장
  const saveSettings = () => {
    try {
      localStorage.setItem('ai-go-settings', JSON.stringify(settings));
      console.log('설정 저장됨:', settings);
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  // 토글 UI 업데이트
  const updateToggleUI = () => {
    if (settings.magnifierEnabled) {
      magnifierToggle.classList.add('active');
    } else {
      magnifierToggle.classList.remove('active');
    }
  };

  // 저장 완료 메시지 표시
  const showSaveMessage = () => {
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '저장됨!';
    saveBtn.style.background = '#10b981';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);
  };

  // 이벤트 리스너 설정
  const setupEventListeners = () => {
    // 뒤로가기 버튼
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // 마이페이지로 돌아가기
        window.history.back();
      });
    }

    // 돋보기 토글
    if (magnifierToggle) {
      magnifierToggle.addEventListener('click', () => {
        settings.magnifierEnabled = !settings.magnifierEnabled;
        updateToggleUI();
      });
    }

    // 저장 버튼
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveSettings();
        showSaveMessage();
      });
    }
  };

  // 초기화
  loadSettings();
  setupEventListeners();

  // 언마운트 시 정리
  return () => {
    if (backBtn) backBtn.removeEventListener('click', () => {});
    if (magnifierToggle) magnifierToggle.removeEventListener('click', () => {});
    if (saveBtn) saveBtn.removeEventListener('click', () => {});
  };
}