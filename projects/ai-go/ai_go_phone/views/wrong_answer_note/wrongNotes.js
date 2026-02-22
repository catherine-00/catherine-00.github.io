// app/views/wrong_answer_note/wrongNotes.js

// HTML 렌더링 함수 - 실제 HTML 파일을 읽어서 반환
export async function render() {
  try {
    const response = await fetch('/views/wrong_answer_note/wrong_notes.html');
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
      <div class="app">
        <div style="padding: 20px; text-align: center;">
          <h2>오답노트</h2>
          <p>페이지를 로드하는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    `;
  }
}

// 마운트 함수
export async function mount(root) {
  // CSS 파일 동적 로드 - 실제 CSS 파일 참조
  if (!document.querySelector('link[href*="wrong_notes.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/views/wrong_answer_note/wrong_notes.css';
    link.onerror = () => {
      console.warn('CSS 파일 로드 실패:', link.href);
    };
    document.head.appendChild(link);
  }

  const qs = (s, sc = document) => sc.querySelector(s);
  const qsa = (s, sc = document) => Array.from(sc.querySelectorAll(s));

  // ===== Mock data =====
  const wrongs = [
    {
      id: 5, date: '2024-01-10', tag: '노면 표시',
      ask: '이 영상에서 도로의 "지그재그" 노면표시는 무엇을 의미하는가?',
      options: [
        '차량을 좌우로 흔들며 주행하라는 의미이다.',
        '차량의 속도를 줄이고 보행자 안전을 확보하라는 의미이다.',
        '교통 혼잡을 줄이기 위한 장치다.',
        '오토바이나 자전거만 해당되는 표시다.'
      ],
      answer: 1,
      desc: '지그재그 노면표시는 서행 안전표지로 보행자 보호 및 서행 의무를 강조하는 표시입니다.',
      explanations: [
        {
          option: 1,
          isCorrect: false,
          text: '한국도로교통공단의 "교통안전시설(노면표시) 설치·관리 업무편람"에 따르면 지그재그 노면표시는 보행자 보호 및 서행 의무를 강조하는 표시이므로 해당 선지는 오답입니다.'
        },
        {
          option: 2,
          isCorrect: true,
          text: '지그재그 노면표시는 서행 안전표지는 "교통안전시설(노면표시) 설치·관리 업무편람"에 따라 서행의 의미이며, 도로교통법 제31조(서행 또는 일시정지할 장소)1항 "모든 차 또는 노면전차의 운전자는 다음 각 호의 어느 하나에 해당하는 곳에서는 서행하여야 한다. - 시ㆍ도경찰청장이 도로에서의 위험을 방지하고 교통의 안전과 원활한 소통을 확보하기 위하여 필요하다고 인정하여 안전표지로 지정한 곳"에 따라 법적 효력을 가집니다.'
        },
        {
          option: 3,
          isCorrect: false,
          text: '서행 안전표지는 교통안전시설(노면표시) 설치·관리 업무편람"에 따르면 교통량 조절 목적은 아니며, 보행자 안전 중심입니다.'
        },
        {
          option: 4,
          isCorrect: false,
          text: '도로교통법 제31조1항 : "모든 차 또는 노면전차의 운전자는 다음 각 호의 어느 하나에 해당하는 곳에서는 서행하여야 한다"에 따라 모든 차에 적용되는 표시입니다.'
        }
      ]
    },
    {
      id: 7, date: '2024-01-08', tag: '주차 및 정차',
      ask: '다음 영상과 같이 "전방 정체가 생겼을 때" 운전자 차량이 정지할 수 있는 행위에 대한 설명으로 가장 적절한 것은?',
      options: [
        '전방 정체가 있으면 반드시 정지하고 주변 교통 상황을 살펴야 한다.',
        '전방 정체가 있을 때는 서행만 하면 된다.',
        '전방 정체가 있을 때 원활한 교통 진행을 위해서 차선 변경을 해야 한다.',
        '전방 정체가 있을 때 정지해도 된다.'
      ],
      answer: 3,
      desc: '전방 정체 시 정지 여부에 대한 법적 근거를 확인하는 문제입니다.',
      explanations: [
        {
          option: 1,
          isCorrect: false,
          text: '도로교통법 제31조(서행 또는 일시정지할 장소)는 전방 정체가 일반 도로에서 발생했을 때 반드시 정지할 의무를 규정하고 있지는 않습니다.'
        },
        {
          option: 2,
          isCorrect: false,
          text: '도로교통법 제31조(서행 또는 일시정지할 장소)는 서행·정지의 의무가 특정 장소에 한정되며, 일반 도로에서는 서행만이 필수라는 규정이 없습니다.'
        },
        {
          option: 3,
          isCorrect: false,
          text: '전방 정체 시에 차선을 변경해야 한다는 규정은 존재하지 않습니다. 오히려 도로에 정체가 생긴 상황에서의 무리한 차선 변경으로 인한 사고 위험이 높아질 가능성이 있습니다.'
        },
        {
          option: 4,
          isCorrect: true,
          text: '도로교통법 제31조(서행 또는 일시정지할 장소)에 따르면 특정 장소에서만 일시정지가 요구되는 것을 명시하고 있습니다. 일반 도로에서 발생한 전방 정체(예: 차량 밀집, 교통 체증)는 이 조문에 규정된 "특정 장소"에 해당하지 않으므로, 법적으로 정지를 해야 할 강제적 근거가 존재하지 않습니다. 따라서 정지해도(즉, 정지해도 된다) 라는 선택지가 도로교통법의 요구사항과 가장 부합합니다.'
        }
      ]
    },
    {
      id: 8, date: '2024-01-15', tag: '노면 표시 / 보행자 보호',
      ask: '영상과 같이 운전자 차량이 보행자와 충돌한 경우, 도로교통법상 위반에 해당하는 것은 무엇인가?',
      options: [
        '보행자가 무단횡단했으므로 운전자는 책임이 없다.',
        '버스 전용차로 주행 자체가 위법이 될 수 있다.',
        '보행자가 도로를 점유했으므로 운전자의 위반은 성립하지 않는다.',
        '버스 전용차로는 일시적으로 진입해도 무방하다.'
      ],
      answer: 1,
      desc: '보행자와 충돌 시 도로교통법상 위반 사항을 확인하는 문제입니다.',
      explanations: [
        {
          option: 1,
          isCorrect: false,
          text: '도로교통법 제27조(보행자 보호의무), 보행자가 무단횡단하더라도 운전자는 보행자를 보호해야 할 주의의무 있음. 따라서 "책임 없다"는 잘못된 해석입니다.'
        },
        {
          option: 2,
          isCorrect: true,
          text: '도로교통법 제15조 제2항 "버스전용차로 지정 구간에서는 승용차 등은 진입할 수 없다." 따라서 버스전용차로 주행은 위반입니다.'
        },
        {
          option: 3,
          isCorrect: false,
          text: '보행자가 도로에 진입했더라도 운전자는 도로교통법 제27조에 따른 보행자 보호의무를 면할 수 없습니다.'
        },
        {
          option: 4,
          isCorrect: false,
          text: '버스전용차로는 "예외 차량(버스·승합차 등)" 외에는 어떠한 경우에도 진입 불가(도로교통법 제15조). "잠깐 진입" 허용되지 않습니다.'
        }
      ]
    }
  ];

  // ===== State =====
  let current = null; // 현재 상세 아이템
  let picked = null;
  const saved = new Set(JSON.parse(localStorage.getItem('ai_go_saved_wrong') || '[]'));

  // ===== Views =====
  const vList = qs('#view-list');
  const vDetail = qs('#view-detail');

  function show(view) {
    // 기존 애니메이션 클래스 제거
    vList.classList.remove('fade-in', 'fade-out');
    vDetail.classList.remove('fade-in', 'fade-out');
    
    if (view === 'list') {
      // 문제 목록 화면으로 전환
      vDetail.style.display = 'none';
      setTimeout(() => {
        vList.style.display = 'block';
        vList.classList.add('fade-in');
        document.title = '오답노트 - 문제 목록';
      }, 50);
    } else if (view === 'detail') {
      // 문제 풀이 화면으로 전환
      vList.classList.add('fade-out');
      setTimeout(() => {
        vList.style.display = 'none';
        vDetail.style.display = 'block';
        vDetail.classList.add('fade-in');
        document.title = '오답노트 - 문제 풀이';
      }, 300);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ===== List render =====
  function renderList(items) {
    qs('#totalWrong').textContent = wrongs.length; // 원본과 동일(필터 수가 아님)
    const wrap = qs('#listWrap');
    wrap.innerHTML = '';
    items.forEach(row => {
      const el = document.createElement('article');
      el.className = 'item';
      el.innerHTML = `
        <div class="item-top">
          <div style="display:flex;align-items:center;gap:6px">
            <span class="badge">문제 ${row.id}</span>
            <span>${row.date}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8fa0b5" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        </div>
        <div class="item-ask">${row.ask}</div>
        <div style="display:flex;align-items:center; justify-content:space-between">
          <span class="chip">${row.tag}</span>
          <span class="wrong-flag">✖ 오답</span>
        </div>
      `;
      el.addEventListener('click', () => openDetail(row));
      wrap.appendChild(el);
    });
  }

  // ===== Detail render =====
  function openDetail(row) {
    current = row;
    picked = null;
    // qs('#totalWrong2').textContent = wrongs.length; // 삭제된 요소이므로 주석 처리
    qs('#dNo').textContent = `문제 ${row.id}`;
    qs('#dAsk').textContent = row.ask;
    qs('#dCategory').textContent = row.tag;
    
    // 문제 ID에 따른 로컬 비디오 파일 설정
    const videoUrls = {
      5: 'img/basic_zigzag.mp4',
      7: 'img/middle_87768.mp4',
      8: 'img/hard_busstop.mp4'
    };
    
    const quizVideo = qs('#quizVideo');
    if (quizVideo && videoUrls[row.id]) {
      console.log('비디오 요소 찾음:', quizVideo);
      console.log('비디오 URL:', videoUrls[row.id]);
      
      // 기존 이벤트 리스너 제거
      quizVideo.removeEventListener('loadedmetadata', quizVideo._onLoadedMetadata);
      quizVideo.removeEventListener('canplay', quizVideo._onCanPlay);
      quizVideo.removeEventListener('error', quizVideo._onError);
      
      // 비디오 속성 설정
      quizVideo.muted = false;
      quizVideo.preload = 'auto';
      quizVideo.controls = true;
      
      // 비디오 로드 이벤트 핸들러 정의
      quizVideo._onLoadedMetadata = () => {
        console.log('✅ 오답노트 비디오 메타데이터 로드됨:', videoUrls[row.id]);
        console.log('비디오 지속시간:', quizVideo.duration);
        console.log('비디오 크기:', quizVideo.videoWidth, 'x', quizVideo.videoHeight);
      };
      
      quizVideo._onCanPlay = () => {
        console.log('✅ 오답노트 비디오 재생 준비됨:', videoUrls[row.id]);
      };
      
      quizVideo._onError = (e) => {
        console.error('❌ 오답노트 비디오 로드 오류:', e);
        console.error('비디오 오류 코드:', quizVideo.error?.code);
        console.error('비디오 오류 메시지:', quizVideo.error?.message);
        console.error('비디오 URL:', videoUrls[row.id]);
      };
      
      // 이벤트 리스너 추가
      quizVideo.addEventListener('loadedmetadata', quizVideo._onLoadedMetadata);
      quizVideo.addEventListener('canplay', quizVideo._onCanPlay);
      quizVideo.addEventListener('error', quizVideo._onError);
      
      // 비디오 src 설정 (마지막에)
      console.log('비디오 src 설정 중...');
      quizVideo.src = videoUrls[row.id];
      
      // 강제로 로드 시도
      quizVideo.load();
      
      console.log('오답노트 비디오 설정 완료:', videoUrls[row.id]);
    } else {
      console.warn('비디오 요소 또는 URL을 찾을 수 없음:', {
        videoElement: quizVideo,
        videoUrl: videoUrls[row.id],
        rowId: row.id
      });
    }
    
    // 해설 영역 초기화
    const explainWrap = qs('#explainWrap');
    const answerExplanation = qs('#answerExplanation');
    if (explainWrap) explainWrap.innerHTML = '';
    if (answerExplanation) {
      answerExplanation.style.display = 'none';
      answerExplanation.innerHTML = '';
    }
    
    renderOptions(row);
    updateSaveButton();
    show('detail');
  }

  function renderOptions(row) {
    const box = qs('#dOpts');
    if (!box) {
      console.error('dOpts 요소를 찾을 수 없습니다.');
      return;
    }
    box.innerHTML = '';
    row.options.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'option';
      b.innerHTML = `<span class="num">${i + 1}</span><span class="text">${t}</span>`;
      b.addEventListener('click', () => {
        picked = i;
        // 초기화
        qsa('.option', box).forEach(el => el.classList.remove('correct', 'incorrect', 'selected'));
        if (picked === row.answer) {
          b.classList.add('correct');
          showExplain(true, row);
        } else {
          b.classList.add('incorrect');
          // 정답 강조
          const corr = box.children[row.answer];
          if (corr) corr.classList.add('correct');
          showExplain(false, row);
        }
      });
      box.appendChild(b);
    });
  }

  function showExplain(ok, row) {
    const w = qs('#explainWrap');
    const answerExplanation = qs('#answerExplanation');
    
    if (!w && !answerExplanation) {
      console.error('해설 영역을 찾을 수 없습니다.');
      return;
    }
    
    const cls = ok ? 'good' : 'bad';
    const title = ok ? '✅ 정답입니다!' : '❌ 오답입니다!';
    
    let explanationContent = '';
    
    if (row.explanations && row.explanations.length > 0) {
      // 새로운 해설 로직 (quiz.js와 동일)
      if (ok) {
        // 정답일 경우: 정답의 option과 text만 출력
        const correctExplanations = row.explanations.filter(exp => exp.isCorrect);
        correctExplanations.forEach(exp => {
          explanationContent += `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">정답: ${exp.option}번</div>
              <div style="color: #0c4a6e; line-height: 1.6;">${exp.text}</div>
            </div>
          `;
        });
      } else {
        // 오답일 경우: 해당 option의 text를 해설로, 그 아래에 정답의 option과 text 출력
        const selectedExplanation = row.explanations.find(exp => exp.option === picked + 1);
        
        explanationContent = `
          <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="font-weight: 600; color: #dc2626; margin-bottom: 8px;">선택한 답: ${picked + 1}번</div>
            <div style="color: #991b1b; line-height: 1.6; margin-bottom: 12px;">${selectedExplanation ? selectedExplanation.text : '해설이 없습니다.'}</div>
          </div>
        `;
        
        // 정답 해설 추가
        const correctExplanations = row.explanations.filter(exp => exp.isCorrect);
        correctExplanations.forEach(exp => {
          explanationContent += `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="font-weight: 600; color: #0369a1; margin-bottom: 8px;">정답: ${exp.option}번</div>
              <div style="color: #0c4a6e; line-height: 1.6;">${exp.text}</div>
            </div>
          `;
        });
      }
    } else {
      // 기존 해설 로직 (explanations가 없는 경우)
      explanationContent = `
        <div style="line-height:1.6; margin-bottom: 16px;">${detailText(row)}</div>
        <div class="law">
          <div style="font-weight:800; margin-bottom:4px">관련 법규</div>
          <a href="#" aria-label="도로교통법 제19조 (차로의 변경)">도로교통법 제19조 (차로의 변경)</a>
        </div>
      `;
    }
    
    const explainHtml = `
      <div class="explain ${cls}">
        <div style="font-weight:700;font-size:16px;margin-bottom:12px;display:flex;align-items:center;gap:8px">${title}</div>
        ${explanationContent}
      </div>
    `;
    
    if (w) {
      w.innerHTML = explainHtml;
    }
    
    if (answerExplanation) {
      answerExplanation.style.display = 'block';
      answerExplanation.innerHTML = explainHtml;
    }
  }

  function detailText(row) {
    if (row.tag === '차선 변경') {
      return '차선 변경 시에는 먼저 룸미러를 통해 뒤차와의 거리를 확인하고, 방향지시등을 켠 후, 사각지대 확인을 다음 안전하게 차선을 변경해야 합니다.';
    }
    if (row.tag === '신호 위반') {
      return '신호 위반 상황에서는 속도를 줄이고 안전거리를 유지한 채 정차해야 하며, 신호가 바뀐 후 교차로를 통과해야 합니다.';
    }
    return row.desc;
  }

  // 저장 문제
  function updateSaveButton() {
    if (!current) return;
    const saveBtn = qs('#saveBtn');
    if (saveBtn) {
      const isSaved = saved.has(current.id);
      saveBtn.textContent = isSaved ? '■ 저장 해제' : '□ 저장 문제';
    }
  }
  
  const onSave = () => {
    if (!current) return;
    if (saved.has(current.id)) saved.delete(current.id);
    else saved.add(current.id);
    localStorage.setItem('ai_go_saved_wrong', JSON.stringify(Array.from(saved)));
    updateSaveButton();
  };
  
  // saveBtn이 존재할 때만 이벤트 리스너 추가
  const saveBtn = qs('#saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', onSave);
  }

  // 다시 풀기
  const onRetry = () => {
    if (!current) return;
    const explainWrap = qs('#explainWrap');
    const answerExplanation = qs('#answerExplanation');
    
    if (explainWrap) explainWrap.innerHTML = '';
    if (answerExplanation) {
      answerExplanation.style.display = 'none';
      answerExplanation.innerHTML = '';
    }
    
    renderOptions(current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const retryBtn = qs('#retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', onRetry);
  }

  // 뒤로 가기
  const onBack = () => {
    // 문제 풀이 상태 초기화
    current = null;
    picked = null;
    
    const explainWrap = qs('#explainWrap');
    const answerExplanation = qs('#answerExplanation');
    
    if (explainWrap) explainWrap.innerHTML = '';
    if (answerExplanation) {
      answerExplanation.style.display = 'none';
      answerExplanation.innerHTML = '';
    }
    
    show('list');
  };
  
  const backToList = qs('#backToList');
  if (backToList) {
    backToList.addEventListener('click', onBack);
  }

  // 검색
  const search = qs('#search');
  const onSearch = () => {
    if (!search) return;
    const q = search.value.trim();
    const filtered = q ? wrongs.filter(r => r.ask.includes(q) || r.tag.includes(q)) : wrongs;
    renderList(filtered);
  };
  if (search) {
    search.addEventListener('input', onSearch);
  }

  // AI 추천 문제 클릭 이벤트
  qsa('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const difficulty = pill.dataset.difficulty;
      const name = pill.querySelector('.name').textContent;
      const desc = pill.querySelector('.desc').textContent;
      
      // 여기에 AI 추천 문제로 이동하는 로직을 추가할 수 있습니다
      console.log(`AI 추천 문제: ${difficulty} - ${name}: ${desc}`);
      
      // 예시: 새로운 문제 생성 또는 기존 문제로 이동
      alert(`${name} 난이도의 문제로 이동합니다: ${desc}`);
    });
  });

  // 초기 상태 설정
  vDetail.style.display = 'none';
  vList.style.display = 'block';
  
  // 초기 렌더
  renderList(wrongs);
  show('list');

  // 해시 변경 감지 - 오답노트 페이지로 다시 진입할 때 첫 화면으로 리셋
  const handleHashChange = () => {
    if (location.hash === '#/wrong-notes') {
      // 상세 화면에서 목록 화면으로 리셋
      current = null;
      picked = null;
      qs('#explainWrap').innerHTML = '';
      show('list');
    }
  };

  window.addEventListener('hashchange', handleHashChange);

  // cleanup 함수 반환
  return () => {
    saveBtn.removeEventListener('click', onSave);
    qs('#retryBtn')?.removeEventListener('click', onRetry);
    qs('#backToList')?.removeEventListener('click', onBack);
    search?.removeEventListener('input', onSearch);
    window.removeEventListener('hashchange', handleHashChange);
    
    // CSS 링크 제거
    const cssLink = document.querySelector('link[href*="wrong_notes.css"]');
    if (cssLink) {
      cssLink.remove();
    }
  };
}