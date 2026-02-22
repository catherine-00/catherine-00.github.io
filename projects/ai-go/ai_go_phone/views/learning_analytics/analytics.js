// app/views/learning_analytics/analytics.js
import { store } from '../../js/store.js';

// HTML 렌더링 함수 - 실제 HTML 파일을 읽어서 반환
export async function render() {
  try {
    const response = await fetch('views/learning_analytics/analytics.html');
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
    console.error('HTML 파일 로드 실패:', error);
    // 폴백: 기본 HTML 반환
    return `
      <div class="ago-analytics">
        <div style="padding: 20px; text-align: center;">
          <h2>학습 분석</h2>
          <p>페이지를 로드하는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    `;
  }
}

export async function mount(root){
  // root는 라우터가 넘겨준 컨테이너; 이 안에 방금 반환한 마크업이 들어가 있음
  const $ = (sel, sc = root) => sc.querySelector(sel);

  // CSS 파일 동적 로드 - 실제 CSS 파일 참조
  if (!document.querySelector('link[href*="analytics.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'views/learning_analytics/analytics.css';
    link.onerror = () => {
      console.warn('CSS 파일 로드 실패:', link.href);
    };
    document.head.appendChild(link);
  }

  // 하단 네비게이션 동적 로드
  try {
    const { mountDrawer } = await import('../../views/sidebar/drawer.js');
    await mountDrawer();
  } catch (error) {
    console.warn('하단 네비게이션 로드 실패:', error);
  }

  // 사용자 정보 업데이트
  const user = store.get()?.user ?? { name: '김운전', email: '' };
  const userProfile = $('.user-profile');
  const userAvatar = $('.user-avatar');
  const userName = $('.user-name');
  
  if (userProfile && userAvatar && userName) {
    userAvatar.textContent = (user.name || '유').charAt(0);
    userName.textContent = user.name || '사용자';
  }

  // 사용자 프로필 클릭 시 마이페이지로 이동
  if (userProfile) {
    userProfile.addEventListener('click', () => {
      location.hash = '#/mypage';
    });
  }


  // 주간 학습 현황 그래프 생성
  const createWeeklyChart = () => {
    const weekly = [
      {d:'월', good:12, bad:3},
      {d:'화', good:15, bad:2},
      {d:'수', good:18, bad:4},
      {d:'목', good:14, bad:1},
      {d:'금', good:20, bad:3},
      {d:'토', good:16, bad:2},
      {d:'일', good:22, bad:1},
    ];

    const list = $('#weekList');
    console.log('weekList 요소 찾기:', list); // 디버깅용
    
    if (list) {
      // 기존 내용 제거
      list.innerHTML = '';
      
      weekly.forEach(({d,good,bad})=>{
        const total = good + bad;
        const goodPct = total ? (good/total*100) : 0;
        const badPct  = total ? (bad/total*100)  : 0;
        
        // li 요소 생성
        const li = document.createElement('li');
        li.style.cssText = 'display: flex !important; align-items: center !important; gap: 1rem !important; padding: 0.75rem 0 !important; border-bottom: 1px solid #f3f4f6 !important; width: 100% !important; box-sizing: border-box !important;';
        
        // 요일 표시
        const daySpan = document.createElement('span');
        daySpan.className = 'd';
        daySpan.style.cssText = 'width: 2rem !important; font-weight: 600 !important; color: #6b7280 !important; font-size: 0.875rem !important; flex-shrink: 0 !important; text-align: center !important;';
        daySpan.textContent = d;
        
        // 스택 컨테이너
        const stackDiv = document.createElement('div');
        stackDiv.className = 'stack';
        stackDiv.style.cssText = 'flex: 1 !important; height: 0.75rem !important; background-color: #f3f4f6 !important; border-radius: 0.375rem !important; position: relative !important; overflow: hidden !important; display: block !important; min-width: 0 !important;';
        stackDiv.setAttribute('aria-label', `${d} 요일 진행`);
        
        // 정답 바
        const goodDiv = document.createElement('div');
        goodDiv.className = 'good';
        goodDiv.style.cssText = `position: absolute !important; left: 0 !important; top: 0 !important; height: 100% !important; background-color: #10b981 !important; border-radius: 0.375rem 0 0 0.375rem !important; z-index: 1 !important; min-width: 0 !important; width: ${goodPct}% !important;`;
        
        // 오답 바
        const badDiv = document.createElement('div');
        badDiv.className = 'bad';
        badDiv.style.cssText = `position: absolute !important; left: ${goodPct}% !important; top: 0 !important; height: 100% !important; background-color: #ef4444 !important; border-radius: 0 0.375rem 0.375rem 0 !important; z-index: 2 !important; min-width: 0 !important; width: ${badPct}% !important;`;
        
        // 총 문제 수
        const totalSpan = document.createElement('span');
        totalSpan.className = 'total';
        totalSpan.style.cssText = 'width: 3rem !important; text-align: right !important; font-size: 0.875rem !important; color: #6b7280 !important; font-weight: 500 !important; flex-shrink: 0 !important;';
        totalSpan.textContent = `${total}문제`;
        
        // 요소 조립
        stackDiv.appendChild(goodDiv);
        stackDiv.appendChild(badDiv);
        li.appendChild(daySpan);
        li.appendChild(stackDiv);
        li.appendChild(totalSpan);
        list.appendChild(li);
      });
      
      console.log('주간 학습 현황 그래프 생성 완료');
    } else {
      console.warn('weekList 요소를 찾을 수 없습니다');
    }
  };

  // DOM이 완전히 로드된 후 그래프 생성
  setTimeout(createWeeklyChart, 100);

  // 해시 변경 감지 - 학습 분석 페이지로 다시 진입할 때 첫 화면으로 리셋
  const handleHashChange = () => {
    if (location.hash === '#/analytics') {
      // 학습 분석 페이지 상태 초기화 (필요한 경우)
      console.log('학습 분석 페이지로 이동 - 상태 초기화');
      // 그래프 다시 생성
      setTimeout(createWeeklyChart, 100);
    }
  };

  window.addEventListener('hashchange', handleHashChange);

  // 이벤트 리스너 정리 함수 반환
  return () => {
    if (userProfile) {
      userProfile.removeEventListener('click', () => {});
    }
    window.removeEventListener('hashchange', handleHashChange);
    
    // CSS 링크 제거
    const cssLink = document.querySelector('link[href*="analytics.css"]');
    if (cssLink) {
      cssLink.remove();
    }
  };
}
