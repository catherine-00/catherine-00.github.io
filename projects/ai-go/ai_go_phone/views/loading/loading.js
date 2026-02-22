// 로딩 화면 JavaScript
export async function render() {
  try {
    const response = await fetch('views/loading/loading.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const htmlContent = await response.text();
    
    // HTML에서 body 태그 안의 내용만 추출
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // body 태그가 없으면 전체 내용 반환
    return htmlContent;
  } catch (error) {
    console.error('로딩 화면 HTML 파일 로드 실패:', error);
    // 폴백: 기본 HTML 반환
    return `
      <div class="loading-container">
        <div class="background-gradient"></div>
        <div class="loading-content">
          <div class="logo-container">
            <img src="img/ai_go_logo.png" alt="아이-고 로고" class="logo-image">
          </div>
          <div class="app-title">아이-고</div>
          <div class="loading-indicator">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

export async function mount(root) {
  // root는 라우터가 넘겨준 컨테이너; 이 안에 방금 반환한 마크업이 들어가 있음
  const $ = (sel, sc = root) => sc.querySelector(sel);

  // 헤더와 하단 네비게이션 바 숨기기
  const header = document.querySelector('header');
  const bottomNav = document.querySelector('.bottom-nav, .bottom-navigation, nav, footer');
  
  if (header) {
    header.style.display = 'none';
  }
  if (bottomNav) {
    bottomNav.style.display = 'none';
  }

  // CSS 파일 동적 로드
  if (!document.querySelector('link[href*="loading.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'views/loading/loading.css';
    link.onerror = () => {
      console.warn('로딩 화면 CSS 파일 로드 실패:', link.href);
    };
    document.head.appendChild(link);
  }

  // 로딩 완료 후 메인 페이지로 이동
  const loadingDuration = 3000; // 3초
  
  // 로딩 완료 시뮬레이션 (디자인 확인을 위해 주석처리)
  setTimeout(() => {
    // 로그인 페이지로 이동
    window.location.hash = '#/login';
  }, loadingDuration);

  // 로딩 진행률 표시 (선택사항)
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    overflow: hidden;
    z-index: 10;
  `;
  
  const progressFill = document.createElement('div');
  progressFill.style.cssText = `
    width: 0%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    transition: width 0.1s ease;
  `;
  
  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);

  // 진행률 애니메이션 (디자인 확인을 위해 주석처리)
  // let progress = 0;
  // const progressInterval = setInterval(() => {
  //   progress += 1;
  //   progressFill.style.width = `${progress}%`;
  //   
  //   if (progress >= 100) {
  //     clearInterval(progressInterval);
  //   }
  // }, loadingDuration / 100);

  // 페이지 가시성 변경 감지 (디자인 확인을 위해 주석처리)
  // const handleVisibilityChange = () => {
  //   if (document.hidden) {
  //     // 페이지가 숨겨졌을 때 타이머 일시정지
  //     clearInterval(progressInterval);
  //   } else {
  //     // 페이지가 다시 보일 때 타이머 재시작
  //     const remainingTime = loadingDuration - (progress * loadingDuration / 100);
  //     if (remainingTime > 0) {
  //       setTimeout(() => {
  //         window.location.hash = '#/login';
  //       }, remainingTime);
  //     }
  //   }
  // };

  // document.addEventListener('visibilitychange', handleVisibilityChange);

  // 이벤트 리스너 정리 함수 반환
  return () => {
    // document.removeEventListener('visibilitychange', handleVisibilityChange);
    // clearInterval(progressInterval);
    
    // 헤더와 하단 네비게이션 바 다시 표시
    const header = document.querySelector('header');
    const bottomNav = document.querySelector('.bottom-nav, .bottom-navigation, nav, footer');
    
    if (header) {
      header.style.display = '';
    }
    if (bottomNav) {
      bottomNav.style.display = '';
    }
    
    // CSS 링크 제거
    const cssLink = document.querySelector('link[href*="loading.css"]');
    if (cssLink) {
      cssLink.remove();
    }
    
    // 진행률 바 제거
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
    }
  };
}
