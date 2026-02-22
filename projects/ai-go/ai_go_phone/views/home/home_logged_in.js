// app/views/home/home_logged_in.js
import { api }  from '../../js/api.js';
import { store } from '../../js/store.js';

/** HTML 파일을 읽어 <style>을 head에 주입하고 .app 영역만 반환 */
async function loadViewHtml(filePath, styleId = 'home-logged-style') {
  const html = await (await fetch(filePath, { cache: 'no-cache' })).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // <style> 주입(한 번만)
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
  return await loadViewHtml('./views/home/home_logged_in.html');
}

export async function mount(root) {
  const $  = (s, sc = root) => sc.querySelector(s);
  const $$ = (s, sc = root) => Array.from(sc.querySelectorAll(s));


  // 2) 사용자 이름 클릭 시 마이페이지로 이동
  const userChip = $('.chip');
  const goToMypage = () => {
    location.hash = '#/mypage';
  };
  if (userChip) {
    userChip.style.cursor = 'pointer';
    userChip.addEventListener('click', goToMypage);
  }

  // 3) 사용자명/아바타 채우기 (store 기준)
  const user = store.get()?.user ?? { name: '김운전', email: '' };
  const avatar = $('.chip .avatar');
  const nameChip = $('.chip span:last-child');
  const nameInHello = $('.hello .name');

  if (avatar) avatar.textContent = (user.name || '유저').trim().charAt(0) || '유';
  if (nameChip) nameChip.textContent = user.name || '사용자';
  if (nameInHello) nameInHello.textContent = user.name || '사용자';

  // 4) 비디오 섹션 16:9 비율 강제 적용
  const videoSection = $('.video-section');
  const videoPlayer = $('.video-player');
  
  function ensureVideoAspectRatio() {
    // 비디오 섹션 스타일 강제 적용
    if (videoSection) {
      videoSection.style.setProperty('background', '#000', 'important');
      videoSection.style.setProperty('position', 'relative', 'important');
      videoSection.style.setProperty('width', '100%', 'important');
      videoSection.style.setProperty('height', '0', 'important');
      videoSection.style.setProperty('padding-bottom', '56.25%', 'important');
      videoSection.style.setProperty('overflow', 'hidden', 'important');
      videoSection.style.setProperty('border-radius', 'var(--radius-xl)', 'important');
      videoSection.style.setProperty('margin', '0 auto', 'important');
      videoSection.style.setProperty('display', 'block', 'important');
    }
    
    // 비디오 플레이어 스타일 강제 적용
    if (videoPlayer) {
      videoPlayer.style.setProperty('position', 'absolute', 'important');
      videoPlayer.style.setProperty('top', '0', 'important');
      videoPlayer.style.setProperty('left', '0', 'important');
      videoPlayer.style.setProperty('width', '100%', 'important');
      videoPlayer.style.setProperty('height', '100%', 'important');
      videoPlayer.style.setProperty('border', 'none', 'important');
      videoPlayer.style.setProperty('border-radius', 'var(--radius-xl)', 'important');
      videoPlayer.style.setProperty('display', 'block', 'important');
    }
  }
  
  // 마운트 시 비디오 비율 적용
  ensureVideoAspectRatio();
  
  // 리사이즈 이벤트에도 비율 유지
  window.addEventListener('resize', ensureVideoAspectRatio);

  // 5) 비디오 컨트롤 기능
  const volumeSlider = $('.volume-slider');
  const fullscreenBtn = $('#fullscreenBtn');
  
  if (videoPlayer && volumeSlider) {
    // 볼륨 조절
    volumeSlider.addEventListener('input', (e) => {
      videoPlayer.volume = e.target.value / 100;
    });
    
    // 초기 볼륨 설정
    videoPlayer.volume = 0.5;
    volumeSlider.value = 50;
  }
  
  if (fullscreenBtn && videoPlayer) {
    // 전체화면 기능
    fullscreenBtn.addEventListener('click', () => {
      if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
      } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
      } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
      }
    });
  }

  // 5) 퀴즈 옵션 선택 기능
  const quizOptions = $$('.quiz-option');
  quizOptions.forEach(option => {
    option.addEventListener('click', () => {
      // 기존 선택 해제
      quizOptions.forEach(opt => opt.classList.remove('selected'));
      // 현재 옵션 선택
      option.classList.add('selected');
      
      // 선택된 옵션 정보 로깅 (실제로는 API 호출 등)
      const selectedOption = option.dataset.option;
      console.log(`선택된 답변: ${selectedOption}`);
    });
  });

  // 6) 하단 액션 버튼들 이벤트 핸들러
  const quizButton = $('#quizButton');
  const wrongNotesButton = $('#wrongNotesButton');
  const analyticsButton = $('#analyticsButton');

  const navigateTo = (hash) => (e) => {
    e.preventDefault();
    location.hash = hash;
  };

  if (quizButton) {
    quizButton.addEventListener('click', navigateTo('#/quiz'));
  }

  if (wrongNotesButton) {
    wrongNotesButton.addEventListener('click', navigateTo('#/wrong'));
  }

  if (analyticsButton) {
    analyticsButton.addEventListener('click', navigateTo('#/analytics'));
  }

  // 7) 비디오 자동 재생 및 반복 설정
  if (videoPlayer) {
    // 비디오 로드 완료 후 자동 재생
    videoPlayer.addEventListener('loadeddata', () => {
      videoPlayer.play().catch(e => {
        console.log('자동 재생 실패:', e);
        // 자동 재생이 차단된 경우 사용자 상호작용 후 재생
        const playOnClick = () => {
          videoPlayer.play();
          document.removeEventListener('click', playOnClick);
        };
        document.addEventListener('click', playOnClick);
      });
    });
    
    // 비디오 끝나면 자동으로 처음부터 재생 (loop 속성과 함께)
    videoPlayer.addEventListener('ended', () => {
      videoPlayer.currentTime = 0;
      videoPlayer.play();
    });
  }

  // 언마운트 시 이벤트 정리
  return () => {
    // 리사이즈 이벤트 정리
    window.removeEventListener('resize', ensureVideoAspectRatio);
    
    // 비디오 컨트롤 이벤트 정리
    if (volumeSlider) {
      volumeSlider.removeEventListener('input', () => {});
    }
    if (fullscreenBtn) {
      fullscreenBtn.removeEventListener('click', () => {});
    }
    
    // 퀴즈 옵션 이벤트 정리
    quizOptions.forEach(option => {
      option.removeEventListener('click', () => {});
    });
    
    // 하단 액션 버튼들 이벤트 정리
    if (quizButton) {
      quizButton.removeEventListener('click', navigateTo('#/quiz'));
    }
    if (wrongNotesButton) {
      wrongNotesButton.removeEventListener('click', navigateTo('#/wrong'));
    }
    if (analyticsButton) {
      analyticsButton.removeEventListener('click', navigateTo('#/analytics'));
    }
    
    // 사용자 이름 클릭 이벤트 정리
    if (userChip) {
      userChip.removeEventListener('click', goToMypage);
    }
  };
}