import { store } from '../../js/store.js';

/** 모듈 기준으로 quiz.html을 읽어 <style> 주입 + .app + #modal 반환 */
async function loadViewHtml(styleId = 'quiz-style') {
  const fileUrl = new URL('./quiz.html', import.meta.url); // ✅ 경로 안전
  const html = await (await fetch(fileUrl, { cache: 'no-cache' })).text();
  const doc  = new DOMParser().parseFromString(html, 'text/html');

  const style = doc.querySelector('style');
  if (style) {
    let s = document.getElementById(styleId);
    if (!s) { s = document.createElement('style'); s.id = styleId; document.head.appendChild(s); }
    s.textContent = style.textContent;
  }
  const app   = doc.querySelector('.app') || doc.body;
  const modal = doc.querySelector('#modal');
  return app.outerHTML + (modal ? modal.outerHTML : '');
}

export async function render() {
  return await loadViewHtml();
}

export async function mount(root) {
  const $  = (s, sc = root) => sc.querySelector(s);
  const $$ = (s, sc = root) => Array.from(sc.querySelectorAll(s));

  // 유저칩
  const user = store.get()?.user ?? { name: '김운전' };
  const chipDot  = $('.chip-user .dot');
  const chipWrap = $('.chip-user');
  if (chipDot) chipDot.textContent = (user.name || '유저').trim().charAt(0) || '유';
  if (chipWrap) { const t = chipWrap.childNodes[1]; if (t) t.textContent = ` ${user.name || '사용자'}`; }


  // 뷰 노드
  const views = {
    level : $('#view-level'),
    video : $('#view-video'),
    quiz  : $('#view-quiz'),
    result: $('#view-result'),
  };
  const modal = $('#modal');

  // 난이도 선택 뷰에 동적 스타일 적용
  if (views.level) {
    views.level.style.margin = '0px 40px 20px 10px';
    views.level.style.width = 'calc(100% - 50px)';
    views.level.style.boxSizing = 'border-box';
  }

  // 현재 화면 상태
  let currentView = 'level';
  let currentLevel = '초급';
  let currentQuestion = 0;
  let selectedAnswer = null;
  let answers = [];
  let startTime = 0;
  let timerInterval = null;

  // 데모 문제 (난이도별로 다른 문제 제공)
  // 레벨별 로컬 비디오 파일 경로
  const videoLinksByLevel = {
    '초급': 'img/basic_98453.mp4',
    '중급': 'img/middle_110353.mp4',
    '고급': 'img/hard_149112.mp4'
  };

  const questionsByLevel = {
    '초급': [
      {
        id: 1,
        text: '안전한 차간 간격을 위한 올바른 순서는?',
        options: [
          '방향지시등 → 룸미러 확인 → 사각지대 확인 → 차선 변경',
          '사각지대 확인 → 방향지시등 → 룸미러 확인 → 차선 변경',
          '룸미러 확인 → 방향지시등 → 사각지대 확인 → 차선 변경',
          '방향지시등 → 룸미러 확인 → 차선 변경',
        ],
        answer: 2,
        tag: '차선 변경',
        explain: '차선 변경 시에는 먼저 룸미러로 후방을 확인하고, 방향지시등을 켠 후, 사각지대를 확인한 다음 안전하게 차선을 변경해야 합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '방향지시등을 먼저 켜는 것은 좋지만, 룸미러 확인 없이 사각지대를 확인하는 것은 위험합니다. 후방 상황을 먼저 파악해야 합니다.'
          },
          {
            option: 2,
            isCorrect: false,
            text: '사각지대 확인을 먼저 하는 것은 위험합니다. 먼저 룸미러로 후방 상황을 파악한 후 방향지시등을 켜고 사각지대를 확인해야 합니다.'
          },
          {
            option: 3,
            isCorrect: true,
            text: '룸미러로 후방을 확인한 후 방향지시등을 켜고, 사각지대를 확인한 다음 차선을 변경하는 것이 가장 안전한 순서입니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '사각지대 확인 없이 차선을 변경하는 것은 매우 위험합니다. 반드시 사각지대를 확인해야 합니다.'
          }
        ]
      },
      {
        id: 2,
        text: '교차로에서 좌회전 시 올바른 순서는?',
        options: [
          '방향지시등 → 룸미러 확인 → 좌회전',
          '방향지시등 → 안전확인 → 좌회전',
          '안전확인 → 방향지시등 → 좌회전',
          '좌회전 → 방향지시등',
        ],
        answer: 1,
        tag: '교차로 통행',
        explain: '좌회전 시에는 반드시 방향지시등을 켠 후, 주변 안전을 확인하고 천천히 좌회전해야 합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '방향지시등을 켠 후 룸미러만 확인하는 것으로는 충분하지 않습니다. 주변의 모든 방향을 안전하게 확인해야 합니다.'
          },
          {
            option: 2,
            isCorrect: true,
            text: '방향지시등을 켠 후 주변의 안전을 종합적으로 확인한 다음 좌회전하는 것이 가장 안전한 방법입니다.'
          },
          {
            option: 3,
            isCorrect: false,
            text: '안전확인을 먼저 한 후 방향지시등을 켜는 것은 다른 차량에게 의도를 알리지 못하게 됩니다. 방향지시등을 먼저 켜야 합니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '좌회전을 먼저 한 후 방향지시등을 켜는 것은 매우 위험합니다. 다른 차량에게 의도를 미리 알려야 합니다.'
          }
        ]
      }
    ],
    '중급': [
      {
        id: 1,
        text: '고속도로에서 안전한 주행을 위한 올바른 행동은?',
        options: [
          '최고속도로 주행하여 빠르게 이동',
          '적정 속도를 유지하며 주변을 주시',
          '차선 변경을 자주 하며 주행',
          '휴대폰을 사용하며 주행',
        ],
        answer: 1,
        tag: '고속도로 주행',
        explain: '고속도로에서는 적정 속도를 유지하고 주변을 주시하며 안전하게 주행해야 합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '최고속도로 주행하는 것은 매우 위험합니다. 고속도로에서는 제한속도를 준수하고 안전한 속도로 주행해야 합니다.'
          },
          {
            option: 2,
            isCorrect: true,
            text: '적정 속도를 유지하며 주변을 주시하는 것이 고속도로에서 가장 안전한 주행 방법입니다.'
          },
          {
            option: 3,
            isCorrect: false,
            text: '차선 변경을 자주 하는 것은 위험합니다. 필요한 경우에만 안전하게 차선을 변경해야 합니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '휴대폰을 사용하며 주행하는 것은 매우 위험한 행동입니다. 운전에 집중해야 합니다.'
          }
        ]
      },
      {
        id: 2,
        text: '야간 주행 시 안전을 위한 올바른 조치는?',
        options: [
          '전조등을 끄고 주행',
          '상향등을 계속 켜고 주행',
          '상향등과 하향등을 적절히 사용',
          '조명 없이 주행',
        ],
        answer: 2,
        tag: '야간 주행',
        explain: '야간 주행 시에는 상향등과 하향등을 적절히 사용하여 전방을 밝게 비추고 대향차량과의 안전을 확보해야 합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '전조등을 끄고 주행하는 것은 매우 위험합니다. 야간에는 반드시 전조등을 켜고 주행해야 합니다.'
          },
          {
            option: 2,
            isCorrect: false,
            text: '상향등을 계속 켜고 주행하는 것은 대향차량의 시야를 방해하여 위험합니다. 적절히 조절해야 합니다.'
          },
          {
            option: 3,
            isCorrect: true,
            text: '상향등과 하향등을 적절히 사용하는 것이 야간 주행에서 가장 안전한 방법입니다. 대향차량이 있을 때는 하향등을 사용해야 합니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '조명 없이 주행하는 것은 매우 위험합니다. 야간 주행 시에는 반드시 전조등을 사용해야 합니다.'
          }
        ]
      },
      {
        id: 3,
        text: '빗길 주행 시 주의사항으로 올바른 것은?',
        options: [
          '속도를 높여 빠르게 이동',
          '차간 간격을 좁게 유지',
          '속도를 낮추고 차간 간격을 넓게',
          '급제동을 자주 사용',
        ],
        answer: 2,
        tag: '빗길 주행',
        explain: '빗길 주행 시에는 노면이 미끄러우므로 속도를 낮추고 차간 간격을 넓게 유지해야 합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '빗길에서 속도를 높이는 것은 매우 위험합니다. 미끄러운 노면에서는 속도를 낮춰야 합니다.'
          },
          {
            option: 2,
            isCorrect: false,
            text: '빗길에서 차간 간격을 좁게 유지하는 것은 위험합니다. 미끄러운 노면에서는 제동거리가 길어지므로 넓은 간격이 필요합니다.'
          },
          {
            option: 3,
            isCorrect: true,
            text: '빗길에서는 노면이 미끄러우므로 속도를 낮추고 차간 간격을 넓게 유지하는 것이 가장 안전합니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '빗길에서 급제동을 자주 사용하는 것은 위험합니다. 미끄러운 노면에서는 급제동 시 미끄러질 수 있습니다.'
          }
        ]
      }
    ],
    '고급': [
      {
        id: 1,
        text: '교차로의 전방 신호가 빨간색이고, 운전자 차량이 교차로에서 우회전 중 검은색 세단과 충돌한 경우, 충돌 방지 책임을 지는 운전자를 올바르게 기술한 것은?',
        options: [
          '검은색 세단이 다른 차와 충돌해도 운전자의 책임이 있다.',
          '우회전 중인 운전자 차량이 검은색 세단이 진입한 차선과 교차하는 경로를 진행하면, 운전자 차량이 충돌 방지 책임을 진다.',
          '검은색 세단이 교차로에 진입한 경우, 우회전 중인 운전자 차량은 선행권이 없으므로 검은색 세단을 피해 차선을 변경한 후 주행한다.',
          '우회전 중인 운전자 차량은 교차로에서 우선권이 없으므로 검은색 세단과 충돌해도 책임이 없다.',
        ],
        answer: 1,
        tag: '교차로 / 도로 신호',
        explain: '정답은 2번입니다. 도로교통법 시행규칙에 따르면, 차량 신호등이 적색일 때는 반드시 일시정지 후 우회전해야 하며, 그 진행 경로가 다른 차의 경로와 교차할 경우 자신이 충돌을 방지해야 할 의무가 있습니다. 따라서 교차로 내의 충돌이 발생할 경우, 우회전 중인 운전자 차량이 안전 조치를 취하지 않아 발생한 사고로 보고 책임이 인정됩니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '도로교통법 제5조(신호·지시 준수 의무)에 따라 운전자는 신호에 맞춰 안전운전할 의무가 있습니다. 그러나 상대 차량이 다른 차와 충돌했다는 이유만으로 본 차량이 무조건 책임을 진다는 조항은 존재하지 않습니다.'
          },
          {
            option: 2,
            isCorrect: true,
            text: '도로교통법 시행규칙에 따르면, 차량 신호등이 적색일 때는 반드시 일시정지 후 우회전해야 하며, 그 진행 경로가 다른 차의 경로와 교차할 경우 자신이 충돌을 방지해야 할 의무가 있습니다. 따라서 교차로 내의 충돌이 발생할 경우, 우회전 중인 운전자 차량이 안전 조치를 취하지 않아 발생한 사고로 보고 책임이 인정됩니다.'
          },
          {
            option: 3,
            isCorrect: false,
            text: '선행권의 여부와 상관없이, 도로교통법과 도로교통법 시행규칙에 따라 우회전하는 운전자 차량은 우측 가장자리 서행 및 일시정지 적법 여부 (도로교통법 제25조 제1항 - 모든 차의 운전자는 교차로에서 우회전을 하려는 경우에는 미리 도로의 우측 가장자리를 서행하면서 우회전하여야 한다. 이 경우 우회전하는 차의 운전자는 신호에 따라 정지하거나 진행하는 보행자 또는 자전거등에 주의하여야 한다.)등 통행 방법을 준수해야 합니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '우선권 유무와 관계없이 도로교통법상 운전자는 충돌 방지를 위한 주의의무가 있습니다. 도로교통법 제25조 제1항 "모든 차의 운전자는 교차로에서 우회전을 하려는 경우에는 미리 도로의 우측 가장자리를 서행하면서 우회전하여야 한다. 이 경우 우회전하는 차의 운전자는 신호에 따라 정지하거나 진행하는 보행자 또는 자전거등에 주의하여야 한다."과 도로교통법 시행규칙 중 교차로 전방 신호등이 적색일 경우 반드시 일시정지 후 우회전해야 한다는 내용에 따라 운전자가 충돌 책임 원칙을 집니다.'
          }
        ]
      },
      {
        id: 2,
        text: '도로교통법령상 신호의 뜻에 대한 설명으로 옳은 것은?',
        options: [
          '노란불 깜빡임 - 우선 일시정지 후, 다른 교통 또는 안전표지에 주의하면서 주행 가능하다.',
          '빨간불 - 보행자는 주변의 차량을 살핀 후 주의하면서 횡단보도를 횡단할 수 있다.',
          '초록색 화살표 신호 - 차량은 화살표 방향으로 주행 가능하다.',
          '노란불 - 차량이 이미 교차로에 들어가고 있는 경우에는 교차로 안에서 정지해야 한다.',
        ],
        answer: 2, 
        tag: '도로 신호',
        explain: '정답은 3번입니다. 노란불 깜빡임과 초록색 화살표 신호에 대한 설명이 도로교통법 시행규칙에 맞습니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '도로교통법 시행규칙 [별표 2] “차량 신호등 - 황색 등화의 점멸 : 차마는 다른 교통 또는 안전표지의 표시에 주의하면서 진행할수 있다.” 에 따르면 일시정지가 의무화사항으로 규정된 것은 아니므로 선지 1번은 오답입니다.'
          },
          {
            option: 2,
            isCorrect: false,
            text: '도로교통법 시행규칙 [별표 2] "보행 신호등 - 적색의 등화 : 보행자는 횡단보도를 횡단하여서는 아니 된다." 에 따라 보행자는 적색 신호에서 횡단이 불가능합니다.'
          },
          {
            option: 3,
            isCorrect: true,
            text: '도로교통법 시행규칙 [별표 2] "차량 신호등 - 녹색화살표의 등화 : 차마는 화살표로 지정한 차로로 진행할 수 있다." 에 따라 선지 3번은 정답입니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '도로교통법 시행규칙 [별표 2] "차량 신호등 - 황색의 등화 : 차마는 정지선이 있거나 횡단보도가 있을 때에는 그 직전이나 교차로의 직전에 정지하여야 하며, 이미 교차로에 차마의 일부라도 진입한 경우에는 신속히 교차로 밖으로 진행하여야 한다." 에 따라 차량이 이미 교차로에 진입했더라도 신속하게 교차로 밖으로 나와야 합니다.'
          }
        ]
      },
      {
        id: 3,
        text: '다음 중 교차로에서의 우회전 또는 좌회전에 관한 설명으로 도로교통법 및 시행규칙에 가장 부합하는 것은 무엇인가?',
        options: [
          '우회전을 하려는 차는 중앙선을 따라 서행하면서 회전해야 한다.',
          '좌회전을 하려는 차는 도로의 우측 가장자리를 따라 서행하며 교차로를 돌아야 한다.',
          '우회전하려는 차는 정지선, 횡단보도, 교차로 직전에서 반드시 정지한 후, 다른 차량의 통행을 방해하지 않으며 우회전할 수 있다.',
          '좌회전 시 반드시 교차로 중심의 바깥쪽으로 통과해야 한다.',
        ],
        answer: 2,
        tag: '교차로',
        explain: '정답은 3번입니다. 도로교통법 시행규칙에 따르면, 우회전 시 정지선, 횡단보도 및 교차로의 직전에서 정지한 후 우회전할 수 있으며, 특히 적색 신호 시에도 무조건 일시정지 후 우회전이 가능합니다.',
        explanations: [
          {
            option: 1,
            isCorrect: false,
            text: '도로교통법 제25조 제1항은 우회전 시 "도로의 우측 가장자리를 서행하면서 우회전하여야 한다"라고 규정하며, 중앙선에 붙어 서행해야 한다는 내용은 완전히 상반된 위반 규정입니다.'
          },
          {
            option: 2,
            isCorrect: false,
            text: '도로교통법 제25조 제2항은 좌회전 시에는 "도로의 중앙선을 따라 서행하면서 교차로의 중심 안쪽을 이용하여 좌회전하여야 한다"라고 명시합니다. 우측 가장자리를 사용하는 것은 자전거등에만 적용되는 예외 규정입니다.'
          },
          {
            option: 3,
            isCorrect: true,
            text: '도로교통법 시행규칙 개정 규정은, 우회전 시 "정지선, 횡단보도 및 교차로의 직전에서 정지한 후 … 우회전할 수 있다"라고 명확히 규정합니다. 본 규정은 특히 적색 신호 시에도 무조건 일시정지 후 우회전 가능함을 강조하며, 보행자와의 충돌 위험을 최소화하도록 설계 되었습니다.'
          },
          {
            option: 4,
            isCorrect: false,
            text: '도로교통법 제25조 제2항은 좌회전 시 교차로 중심 안쪽을 이용하도록 규정하며, 중심 바깥쪽 통과는 예외적으로 지방경찰처장이 지정한 경우에만 허용됩니다. 따라서 "반드시 바깥쪽"은 정반대의 위반 규정입니다.'
          }
        ]
      },
    ]
  };

  // 현재 문제 목록
  let currentQuestions = questionsByLevel[currentLevel];

  // 화면 전환 함수
  const showView = (viewName) => {
    // 기존 애니메이션 클래스 제거
    Object.values(views).forEach(v => {
      if (v) {
        v.classList.remove('fade-in', 'fade-out');
      }
    });

    if (viewName === 'level') {
      // 난이도 선택 화면으로
      Object.values(views).forEach(v => {
        if (v) v.style.display = 'none';
      });
      views.level.style.display = 'block';
      views.level.classList.add('fade-in');
      currentView = 'level';
      updatePageTitle('운전면허 퀴즈');
    } else if (viewName === 'quiz') {
      // 통합 퀴즈 화면으로 (영상 + 문제)
      views.level.classList.add('fade-out');
      setTimeout(() => {
        views.level.style.display = 'none';
        views.quiz.style.display = 'block';
        views.quiz.classList.add('fade-in');
        currentView = 'quiz';
        updatePageTitle(`${currentLevel} 퀴즈`);
        updateQuizInfo();
        renderQuestion();
        startTimer();
      }, 300);
    } else if (viewName === 'result') {
      // 결과 화면으로
      views.quiz.classList.add('fade-out');
      setTimeout(() => {
        views.quiz.style.display = 'none';
        views.result.style.display = 'block';
        views.result.classList.add('fade-in');
        currentView = 'result';
        updatePageTitle('퀴즈 결과');
        showResult();
      }, 300);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // 페이지 제목 업데이트
  const updatePageTitle = (title) => {
    const pageTitle = $('#pageTitle');
    if (pageTitle) pageTitle.textContent = title;
  };


  // 유튜브 iframe은 자체 컨트롤을 사용하므로 재생/일시정지 버튼 숨김
  const hideVideoControls = () => {
    const playBtn = $('#playVideo');
    const pauseBtn = $('#pauseVideo');
    const videoControls = $('.video-controls');
    
    if (playBtn) playBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (videoControls) videoControls.style.display = 'none';
  };

  // 비디오 영역 중앙 정렬 강제 적용
  const ensureVideoCenterAlignment = () => {
    const videoSection = $('.video-section');
    const videoContainer = $('.video-container');
    const quizVideo = $('#quizVideo');
    
    // 비디오 섹션 스타일 강제 적용
    if (videoSection) {
      videoSection.style.setProperty('width', '100%', 'important');
      videoSection.style.setProperty('margin', '0 auto', 'important');
      videoSection.style.setProperty('padding', '0 16px', 'important');
      videoSection.style.setProperty('display', 'block', 'important');
      videoSection.style.setProperty('box-sizing', 'border-box', 'important');
      videoSection.style.setProperty('text-align', 'center', 'important');
      videoSection.style.setProperty('float', 'none', 'important');
      videoSection.style.setProperty('clear', 'both', 'important');
      videoSection.style.setProperty('visibility', 'visible', 'important');
      videoSection.style.setProperty('opacity', '1', 'important');
    }
    
    // 비디오 컨테이너 스타일 강제 적용
    if (videoContainer) {
      videoContainer.style.setProperty('position', 'relative', 'important');
      videoContainer.style.setProperty('width', '100%', 'important');
      videoContainer.style.setProperty('max-width', '100%', 'important');
      videoContainer.style.setProperty('height', '0', 'important');
      videoContainer.style.setProperty('padding-bottom', '56.25%', 'important');
      videoContainer.style.setProperty('background', '#000', 'important');
      videoContainer.style.setProperty('border-radius', '14px', 'important');
      videoContainer.style.setProperty('overflow', 'hidden', 'important');
      videoContainer.style.setProperty('box-sizing', 'border-box', 'important');
      videoContainer.style.setProperty('margin', '0 auto', 'important');
      videoContainer.style.setProperty('display', 'inline-block', 'important');
      videoContainer.style.setProperty('vertical-align', 'top', 'important');
      videoContainer.style.setProperty('float', 'none', 'important');
      videoContainer.style.setProperty('visibility', 'visible', 'important');
      videoContainer.style.setProperty('opacity', '1', 'important');
    }
    
    // 비디오 요소 스타일 강제 적용
    if (quizVideo) {
      quizVideo.style.setProperty('position', 'absolute', 'important');
      quizVideo.style.setProperty('top', '0', 'important');
      quizVideo.style.setProperty('left', '0', 'important');
      quizVideo.style.setProperty('width', '100%', 'important');
      quizVideo.style.setProperty('height', '100%', 'important');
      quizVideo.style.setProperty('border', 'none', 'important');
      quizVideo.style.setProperty('border-radius', '14px', 'important');
      quizVideo.style.setProperty('display', 'block', 'important');
      quizVideo.style.setProperty('visibility', 'visible', 'important');
      quizVideo.style.setProperty('opacity', '1', 'important');
    }
  };

  // 돋보기 기능 관련 변수
  let currentFontSize = 16; // 기본 폰트 크기
  const minFontSize = 12;   // 최소 폰트 크기
  const maxFontSize = 24;   // 최대 폰트 크기

  // 돋보기 기능 초기화
  const initializeMagnifier = () => {
    // 설정에서 돋보기 기능 활성화 여부 확인
    const settings = getAppSettings();
    const magnifierControls = $('#magnifierControls');
    
    if (settings && settings.magnifierEnabled) {
      // 돋보기 컨트롤 표시
      if (magnifierControls) {
        magnifierControls.style.display = 'flex';
      }
      
      // 저장된 폰트 크기 불러오기
      const savedFontSize = localStorage.getItem('ai-go-font-size');
      if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        // 초기화 시 폰트 크기 적용
        setTimeout(() => {
          updateFontSize();
        }, 100);
      }
      
      // 이벤트 리스너 추가
      const decreaseBtn = $('#magnifierDecrease');
      const increaseBtn = $('#magnifierIncrease');
      
      if (decreaseBtn) {
        decreaseBtn.addEventListener('click', decreaseFontSize);
      }
      
      if (increaseBtn) {
        increaseBtn.addEventListener('click', increaseFontSize);
      }
      
      console.log('돋보기 기능 활성화됨');
    } else {
      // 돋보기 컨트롤 숨김
      if (magnifierControls) {
        magnifierControls.style.display = 'none';
      }
      console.log('돋보기 기능 비활성화됨');
    }
  };

  // 폰트 크기 증가
  const increaseFontSize = () => {
    if (currentFontSize < maxFontSize) {
      currentFontSize += 1;
      updateFontSize();
      saveFontSize();
    }
  };

  // 폰트 크기 감소
  const decreaseFontSize = () => {
    if (currentFontSize > minFontSize) {
      currentFontSize -= 1;
      updateFontSize();
      saveFontSize();
    }
  };

  // 폰트 크기 업데이트
  const updateFontSize = () => {
    // CSS 변수를 사용하여 폰트 크기 변경
    const root = document.documentElement;
    const baseFontSize = 16;
    const scaleFactor = currentFontSize / baseFontSize;
    
    // CSS 변수 설정
    root.style.setProperty('--font-scale', scaleFactor);
    
    // 퀴즈 관련 요소들의 폰트 크기 직접 변경
    const updateElementFontSize = (selector, baseSize, options = {}) => {
      const elements = $$(selector);
      elements.forEach(element => {
        if (element) {
          const newSize = baseSize * scaleFactor;
          element.style.fontSize = newSize + 'px';
          
          // 선택지 버튼의 경우 높이도 함께 조절
          if (selector === '.option') {
            const baseHeight = 48; // 기본 버튼 높이
            const newHeight = baseHeight * scaleFactor;
            element.style.minHeight = newHeight + 'px';
            element.style.padding = `${newHeight * 0.15}px 16px`;
            element.style.lineHeight = '1.4';
            
            // 선택지 내부 텍스트와 번호도 폰트 크기 조절
            const textElement = element.querySelector('.text');
            const numElement = element.querySelector('.num');
            if (textElement) {
              textElement.style.fontSize = newSize + 'px';
            }
            if (numElement) {
              numElement.style.fontSize = (newSize * 0.8) + 'px'; // 번호는 조금 작게
            }
          }
        }
      });
    };
    
    // 각 요소별 기본 크기와 함께 업데이트
    updateElementFontSize('.question-number', 18);
    updateElementFontSize('.question-text', 16);
    updateElementFontSize('.option-text', 16);
    updateElementFontSize('.option', 16);
    updateElementFontSize('.header-title', 20);
    updateElementFontSize('.header-subtitle', 14);
    updateElementFontSize('.level-badge', 14);
    updateElementFontSize('.progress-text', 14);
    updateElementFontSize('.progress-percentage', 12);
    updateElementFontSize('.btn-primary', 16);
    updateElementFontSize('.btn-secondary', 16);
    updateElementFontSize('.btn-ghost', 16);
    updateElementFontSize('.btn-home', 16);
    updateElementFontSize('.btn-wrong-notes', 16);
    updateElementFontSize('.answer-explanation', 14);
    updateElementFontSize('.explanation-text', 14);
    updateElementFontSize('.analysis-header h3', 16);
    updateElementFontSize('.wrong-analysis-card', 14);
    updateElementFontSize('.problem-category', 14);
    updateElementFontSize('.keyword-text', 14);
    
    // 돋보기 크기 표시 업데이트
    const magnifierSize = $('#magnifierSize');
    if (magnifierSize) {
      magnifierSize.textContent = currentFontSize + 'px';
    }
    
    console.log('폰트 크기 변경됨:', currentFontSize + 'px', '스케일:', scaleFactor);
  };

  // 폰트 크기 저장
  const saveFontSize = () => {
    localStorage.setItem('ai-go-font-size', currentFontSize.toString());
  };

  // 앱 설정 가져오기 (전역 함수)
  const getAppSettings = () => {
    try {
      const settings = localStorage.getItem('ai-go-settings');
      return settings ? JSON.parse(settings) : { magnifierEnabled: false };
    } catch (error) {
      console.warn('설정 불러오기 실패:', error);
      return { magnifierEnabled: false };
    }
  };

  // 로컬 비디오 안전한 로딩 함수
  const safeLoadLocalVideo = (videoElement, videoUrl) => {
    if (!videoElement) return;
    
    // 비디오 요소가 iframe인지 video인지 확인하고 적절히 처리
    const loadVideo = () => {
      try {
        if (videoElement.tagName === 'IFRAME') {
          // iframe을 video 태그로 교체
          const video = document.createElement('video');
          video.id = videoElement.id;
          video.className = videoElement.className;
          video.src = videoUrl;
          video.controls = true;
          video.muted = false; // 음소거 해제
          video.playsInline = true;
          video.preload = 'metadata'; // 메타데이터 미리 로드
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'cover';
          
          // 비디오 로드 이벤트 추가
          video.addEventListener('loadedmetadata', () => {
            console.log('비디오 메타데이터 로드됨:', videoUrl);
          });
          
          video.addEventListener('canplay', () => {
            console.log('비디오 재생 준비됨:', videoUrl);
          });
          
          video.addEventListener('error', (e) => {
            console.error('비디오 로드 오류:', e, videoUrl);
          });
          
          // 부모 요소에 video 태그로 교체
          videoElement.parentNode.replaceChild(video, videoElement);
          console.log('로컬 비디오 로드됨:', videoUrl);
        } else if (videoElement.tagName === 'VIDEO') {
          // 이미 video 태그인 경우 src만 변경
          videoElement.src = videoUrl;
          videoElement.muted = false; // 음소거 해제
          videoElement.preload = 'metadata';
          console.log('로컬 비디오 src 업데이트됨:', videoUrl);
        }
      } catch (error) {
        console.warn('로컬 비디오 로드 중 오류:', error);
      }
    };
    
    // 오류 이벤트 리스너 추가
    videoElement.addEventListener('error', (e) => {
      console.warn('로컬 비디오 로드 오류:', e);
    });
    
    // DOM이 준비되면 즉시 로드
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadVideo);
    } else {
      // 약간의 지연을 두고 로드하여 안정성 향상
      setTimeout(loadVideo, 100);
    }
  };

  // 비디오 영역 강제 표시 함수
  const forceVideoDisplay = () => {
    const videoSection = $('.video-section');
    const videoContainer = $('.video-container');
    const quizVideo = $('#quizVideo');
    
    // 요소가 존재하지 않으면 생성
    if (!videoSection) {
      console.warn('비디오 섹션을 찾을 수 없습니다.');
      return;
    }
    
    // 비디오 영역 강제 표시
    videoSection.style.setProperty('display', 'block', 'important');
    videoSection.style.setProperty('visibility', 'visible', 'important');
    videoSection.style.setProperty('opacity', '1', 'important');
    videoSection.style.setProperty('height', 'auto', 'important');
    videoSection.style.setProperty('min-height', '200px', 'important');
    
    if (videoContainer) {
      videoContainer.style.setProperty('display', 'inline-block', 'important');
      videoContainer.style.setProperty('visibility', 'visible', 'important');
      videoContainer.style.setProperty('opacity', '1', 'important');
    }
    
    if (quizVideo) {
      quizVideo.style.setProperty('display', 'block', 'important');
      quizVideo.style.setProperty('visibility', 'visible', 'important');
      quizVideo.style.setProperty('opacity', '1', 'important');
    }
    
    console.log('비디오 영역 강제 표시 완료');
  };

  // 유튜브 iframe은 자체 컨트롤을 사용하므로 별도의 이벤트 핸들러 불필요

  // 통합 퀴즈 화면 정보 업데이트
  const updateQuizInfo = () => {
    // 난이도 배지 업데이트
    const levelBadge = $('#levelBadge');
    if (levelBadge) {
      levelBadge.textContent = currentLevel;
      
      // 난이도별 배지 색상 설정
      levelBadge.className = 'level-badge';
      if (currentLevel === '초급') {
        levelBadge.style.background = '#f0fdf4';
        levelBadge.style.color = '#016630';
      } else if (currentLevel === '중급') {
        levelBadge.style.background = '#fff8b7';
        levelBadge.style.color = '#894b00';
      } else if (currentLevel === '고급') {
        levelBadge.style.background = '#fef2f2';
        levelBadge.style.color = '#9f0712';
      }
    }
    
    // 진행률 업데이트
    updateProgress();
    
    // 로컬 비디오 초기화
    const video = $('#quizVideo');
    if (video) {
      // 현재 레벨에 맞는 로컬 비디오 파일 설정
      const videoLink = videoLinksByLevel[currentLevel];
      if (videoLink) {
        // 안전한 로컬 비디오 로딩 사용
        safeLoadLocalVideo(video, videoLink);
        console.log(`${currentLevel} 레벨 로컬 비디오 설정:`, videoLink);
      }
      
      // 로컬 비디오는 HTML5 video 컨트롤을 사용하므로 커스텀 컨트롤 숨김
      hideVideoControls();
      // 비디오 영역 강제 표시
      forceVideoDisplay();
      // 비디오 영역 중앙 정렬 강제 적용
      ensureVideoCenterAlignment();
      console.log('로컬 비디오 로드됨');
    } else {
      // 비디오 요소가 없어도 영역은 표시
      forceVideoDisplay();
      ensureVideoCenterAlignment();
    }
  };

  // 문제 렌더링
  const renderQuestion = () => {
    const question = currentQuestions[currentQuestion];
    if (!question) return;

    // 문제 번호 업데이트
    const questionNumber = $('#questionNumber');
    if (questionNumber) {
      questionNumber.textContent = `문제 ${currentQuestion + 1}`;
    }

    // 문제 텍스트 업데이트
    const questionText = $('#questionText');
    if (questionText) {
      questionText.textContent = question.text;
    }

    // 상황 키워드 업데이트
    const keywordText = $('#keywordText');
    if (keywordText) {
      keywordText.textContent = question.tag || '운전 상황';
    }

    // 옵션 렌더링
    const optionsContainer = $('#options');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';

      question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'option';
        optionButton.innerHTML = `
          <span class="num">${index + 1}</span>
          <span class="text">${option}</span>
        `;
        
        optionButton.addEventListener('click', () => {
          // 이미 답변이 표시된 경우 클릭 무시
          if ($('#answerExplanation').style.display !== 'none') return;
          
          // 기존 선택 해제
          $$('.option', optionsContainer).forEach(opt => opt.classList.remove('selected'));
          // 현재 선택
          optionButton.classList.add('selected');
          selectedAnswer = index;
          
          // 즉시 정답/오답 표시
          showAnswerExplanation(index);
        });
        
        optionsContainer.appendChild(optionButton);
      });
    }

    selectedAnswer = null;
    $('#btnNext').disabled = true;
    
    // 돋보기 기능이 활성화된 경우 폰트 크기 적용
    const settings = getAppSettings();
    if (settings && settings.magnifierEnabled) {
      setTimeout(() => {
        updateFontSize();
      }, 50);
    }
    
    // 해설 영역 숨기기
    const explanationEl = $('#answerExplanation');
    if (explanationEl) {
      explanationEl.style.display = 'none';
    }
  };

  // 정답/오답 해설 표시 함수
  const showAnswerExplanation = (selectedIndex) => {
    const question = currentQuestions[currentQuestion];
    
    // 정답 판정 로직 수정 (배열과 단일 값 모두 처리)
    let isCorrect = false;
    if (Array.isArray(question.answer)) {
      // 복수 정답인 경우
      isCorrect = question.answer.includes(selectedIndex);
    } else {
      // 단일 정답인 경우
      isCorrect = selectedIndex === question.answer;
    }
    
    // 옵션들에 정답/오답 스타일 적용
    const options = $$('.option');
    options.forEach((option, index) => {
      option.classList.remove('correct', 'incorrect');
      
      // 정답 스타일 적용
      if (Array.isArray(question.answer)) {
        if (question.answer.includes(index)) {
          option.classList.add('correct');
        }
      } else {
        if (index === question.answer) {
          option.classList.add('correct');
        }
      }
      
      // 선택한 답이 오답인 경우 오답 스타일 적용
      if (index === selectedIndex && !isCorrect) {
        option.classList.add('incorrect');
      }
    });
    
    // 해설 영역 표시
    const explainWrap = $('#explainWrap');
    const explanationEl = $('#answerExplanation');
    
    if (explainWrap && explanationEl) {
      const cls = isCorrect ? 'good' : 'bad';
      const title = isCorrect ? '✅ 정답입니다!' : '❌ 오답입니다!';
      
      let explanationContent = '';
      
      if (isCorrect) {
        // 정답일 경우: 정답의 option과 text만 출력
        if (Array.isArray(question.answer)) {
          // 복수 정답인 경우
          const correctExplanations = question.explanations.filter(exp => exp.isCorrect);
          correctExplanations.forEach(exp => {
            explanationContent += `
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">정답: ${exp.option}번</div>
                <div style="color: #0c4a6e; line-height: 1.6;">${exp.text}</div>
              </div>
            `;
          });
        } else {
          // 단일 정답인 경우
          const correctOption = question.explanations.find(exp => exp.isCorrect);
          if (correctOption) {
            explanationContent = `
              <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">정답: ${correctOption.option}번</div>
                <div style="color: #0c4a6e; line-height: 1.6;">${correctOption.text}</div>
              </div>
            `;
          }
        }
      } else {
        // 오답일 경우: 해당 option의 text를 해설로, 그 아래에 정답의 option과 text 출력
        const selectedExplanation = question.explanations.find(exp => exp.option === selectedIndex + 1);
        
        explanationContent = `
          <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">선택한 답: ${selectedIndex + 1}번</div>
            <div style="color: #991b1b; line-height: 1.6; margin-bottom: 12px;">${selectedExplanation ? selectedExplanation.text : '해설이 없습니다.'}</div>
          </div>
        `;
        
        // 정답 해설 추가
        const correctExplanations = question.explanations.filter(exp => exp.isCorrect);
        correctExplanations.forEach(exp => {
          explanationContent += `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">정답: ${exp.option}번</div>
              <div style="color: #0c4a6e; line-height: 1.6;">${exp.text}</div>
            </div>
          `;
        });
      }
      
      explainWrap.innerHTML = `
        <div class="explain ${cls}">
          <div style="font-weight:700;font-size:16px;margin-bottom:12px;display:flex;align-items:center;gap:8px">${title}</div>
          ${explanationContent}
        </div>
      `;
      
      // 해설 영역 표시
      explanationEl.style.display = 'block';
    }
    
    // 다음 버튼 활성화
    $('#btnNext').disabled = false;
    
    // 진행률 업데이트
    updateProgress();
  };

  // 진행률 업데이트
  const updateProgress = () => {
    const progress = Math.round(((currentQuestion + 1) / currentQuestions.length) * 100);
    const progressBar = $('#progressBar');
    const progressText = $('#progressText');
    const progressPercentage = $('#progressPercentage');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${currentQuestion + 1} / ${currentQuestions.length}`;
    if (progressPercentage) progressPercentage.textContent = `진행률: ${progress}%`;
    
    console.log(`진행률 업데이트: ${currentQuestion + 1}/${currentQuestions.length} (${progress}%)`);
  };

  // 타이머 시작
  const startTimer = () => {
    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const timerElement = $('#timer');
      if (timerElement) timerElement.textContent = elapsed.toFixed(1);
    }, 100);
  };

  // 타이머 정지
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // 결과 표시
  const showResult = () => {
    stopTimer();
    
    const totalQuestions = currentQuestions.length;
    const correctAnswers = answers.reduce((count, answer, index) => {
      return count + (answer === currentQuestions[index].answer ? 1 : 0);
    }, 0);
    const wrongAnswers = totalQuestions - correctAnswers;
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    // 결과 업데이트
    const scoreNum = $('#scoreNum');
    const scoreSubtitle = $('#scoreSubtitle');
    const correctQ = $('#correctQ');
    const wrongQ = $('#wrongQ');
    const statTime = $('#statTime');
    
    if (scoreNum) scoreNum.textContent = `${score}점`;
    if (scoreSubtitle) scoreSubtitle.textContent = `총 ${totalQuestions}문제 중 ${correctAnswers}문제 정답`;
    if (correctQ) correctQ.textContent = correctAnswers;
    if (wrongQ) wrongQ.textContent = wrongAnswers;
    if (statTime) statTime.textContent = `${minutes}분 ${seconds}초`;
    
    // 오답 노트 생성
    const wrongAnswersContainer = $('#wrongWrap');
    if (wrongAnswersContainer) {
      wrongAnswersContainer.innerHTML = '';
      
      answers.forEach((answer, index) => {
        const question = currentQuestions[index];
        if (answer === question.answer) return; // 정답은 제외
        
        const wrongCard = document.createElement('div');
        wrongCard.className = 'wrong-card';
        wrongCard.innerHTML = `
          <div class="head">
            <div class="question-title">문제 ${index + 1}</div>
            <span class="tag">${question.tag}</span>
          </div>
          <div class="question-text">${question.text}</div>
          
          <div class="answer-comparison">
            <div class="answer-item wrong-answer">
              <svg class="answer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <div>
                <div class="answer-label">내 답안:</div>
                <div class="answer-text">${typeof answer === 'number' ? question.options[answer] : '-'}</div>
              </div>
            </div>
            
            <div class="answer-item correct-answer">
              <svg class="answer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <div>
                <div class="answer-label">정답:</div>
                <div class="answer-text">${question.options[question.answer]}</div>
              </div>
            </div>
          </div>
          
          <div class="explanation-box">
            <div class="explanation-title">해설</div>
            <div class="explanation-text">${question.explain}</div>
          </div>
        `;
        
        wrongAnswersContainer.appendChild(wrongCard);
      });
    }
  };

  // ===== 이벤트 리스너 =====
  
  // 난이도 선택
  const onLevelClick = (e) => {
    const levelCard = e.target.closest('.level-card[data-level]');
    if (!levelCard || currentView !== 'level') return;
    
    currentLevel = levelCard.dataset.level;
    currentQuestions = questionsByLevel[currentLevel];
    currentQuestion = 0;
    answers = [];
    selectedAnswer = null;
    
    // 진행률 초기화
    updateProgress();
    
    showView('quiz');
  };

  // 뒤로가기 버튼
  const onBackToLevel = (e) => {
    if (e.target.id !== 'backToLevel' || currentView !== 'quiz') return;
    showView('level');
  };

  // 다음 문제
  const onNext = (e) => {
    if (e.target.id !== 'btnNext' || currentView !== 'quiz') return;
    
    if (selectedAnswer === null) return;
    
    answers[currentQuestion] = selectedAnswer;
    currentQuestion++;
    
    if (currentQuestion >= currentQuestions.length) {
      // 모든 문제 완료
      showView('result');
    } else {
      // 다음 문제로
      updatePageTitle(`${currentLevel} 문제 ${currentQuestion + 1}`);
      updateQuizInfo();
      renderQuestion();
    }
  };

  // 다시 도전
  const onRetry = (e) => {
    if (e.target.id !== 'btnRetry' || currentView !== 'result') return;
    
    // 상태 초기화
    currentQuestion = 0;
    answers = [];
    selectedAnswer = null;
    startTime = 0;
    stopTimer();
    
    // 진행률 초기화
    updateProgress();
    
    showView('level');
  };

  // 오답 노트로 이동
  const onWrongNotes = (e) => {
    if (e.target.id !== 'btnWrongNotes' || currentView !== 'result') return;
    
    // 오답 노트 페이지로 이동 (라우터 사용)
    window.location.hash = '#/wrong-notes';
  };

  // 홈으로 이동
  const onHome = (e) => {
    if (e.target.id !== 'btnHome' || currentView !== 'result') return;
    
    // 홈 페이지로 이동 (라우터 사용)
    window.location.hash = '#/';
  };

  // 이벤트 리스너 등록
  root.addEventListener('click', onLevelClick);
  root.addEventListener('click', onBackToLevel);
  root.addEventListener('click', onNext);
  root.addEventListener('click', onRetry);
  root.addEventListener('click', onWrongNotes);
  root.addEventListener('click', onHome);
  // 유튜브 iframe은 자체 컨트롤을 사용하므로 이벤트 리스너 불필요

  // 돋보기 기능 초기화
  initializeMagnifier();

  // 초기화
  showView('level');
  
  // 비디오 영역 강제 표시 및 중앙 정렬 적용
  forceVideoDisplay();
  ensureVideoCenterAlignment();
  
  // 리사이즈 이벤트에도 중앙 정렬 적용
  window.addEventListener('resize', () => {
    forceVideoDisplay();
    ensureVideoCenterAlignment();
  });

  // 언마운트 시 정리
  return () => {
    root.removeEventListener('click', onLevelClick);
    root.removeEventListener('click', onBackToLevel);
    root.removeEventListener('click', onNext);
    root.removeEventListener('click', onRetry);
    root.removeEventListener('click', onWrongNotes);
    root.removeEventListener('click', onHome);
    // 유튜브 iframe 이벤트 리스너 정리 불필요
    window.removeEventListener('resize', ensureVideoCenterAlignment);
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };
}