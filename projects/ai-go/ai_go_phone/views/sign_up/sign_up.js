// /js/views/signup.js
import { api } from '../../js/api.js';

export async function render(){
  // HTML 파일을 fetch하여 반환
  const response = await fetch('./views/sign_up/sign_up.html');
  const html = await response.text();
  return html;
}

export function mount(root){
  const $  = (s,sc=root)=>sc.querySelector(s);
  const $$ = (s,sc=root)=>Array.from(sc.querySelectorAll(s));

  // --- 로고 클릭 차단 (회원가입 페이지에서만)
  let isSignupPage = true; // 회원가입 페이지 상태 플래그
  let logoClickHandler = null;
  
  const blockLogoClick = () => {
    // 기존 이벤트 리스너 제거
    if (logoClickHandler) {
      document.removeEventListener('click', logoClickHandler);
    }
    
    // 로고 클릭 이벤트 차단 (더 높은 우선순위로)
    logoClickHandler = (e) => {
      const logo = e.target.closest('.logo');
      if (logo && isSignupPage) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('회원가입 페이지에서는 로고 클릭이 차단됩니다');
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
          if (isSignupPage) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('직접 로고 클릭 차단됨 (회원가입 페이지)');
            return false;
          }
        };
        logo.addEventListener('click', directHandler, true);
        logo._signupPageBlocker = directHandler; // 나중에 제거하기 위해 저장
      });
    };
    
    // DOM이 로드된 후 실행
    setTimeout(addDirectLogoBlockers, 100);
    
    console.log('로고 클릭 차단 설정됨 (회원가입 페이지)'); // 디버깅용
  };

  // 숫자만 + 자동 이동
  const onlyDigits = (e)=>{ e.target.value = e.target.value.replace(/\D+/g,''); };
  const autoMove = (e)=>{
    const t=e.target, max=t.getAttribute('maxlength');
    if(max && t.value.length>=+max){
      const group=t.closest('.split')?.querySelectorAll('input'); if(!group) return;
      const arr=[...group]; const i=arr.indexOf(t); if(i>-1 && arr[i+1]) arr[i+1].focus();
    }
  };
  // HTML 파일의 실제 ID에 맞게 수정
  $$('#ph1,#ph2,#ph3,#yy,#mm,#dd').forEach(i=>{
    i.addEventListener('input', onlyDigits);
    i.addEventListener('input', autoMove);
  });

  // 비밀번호 보기
  const eyes = $$('.eye');
  const onEye = (btn)=>()=>{
    const target = $(btn.dataset.toggle);
    if(target){ target.type = target.type === 'password' ? 'text' : 'password'; target.focus(); }
  };
  const eyeHandlers = eyes.map(btn => { const fn=onEye(btn); btn.addEventListener('click', fn); return [btn,fn]; });

  // 모달 - HTML 파일의 실제 ID에 맞게 수정
  const modal = $('#modal'); const msg = $('#dialogMsg'); const ok = $('#dialogOk');
  let afterOk = null;
  const openModal = (m, next=null)=>{ msg.textContent=m; modal.classList.add('show'); afterOk=next; ok.focus(); };
  const closeModal = ()=>{ modal.classList.remove('show'); afterOk=null; };
  const onOk = ()=>{ closeModal(); if(afterOk) afterOk(); };
  ok.addEventListener('click', onOk);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  const onEsc = (e)=>{ if(e.key==='Escape' && modal.classList.contains('show')) closeModal(); };
  window.addEventListener('keydown', onEsc);

  // 로고 클릭 차단 초기화
  blockLogoClick();

  // 제출 - HTML 파일의 실제 ID에 맞게 수정
  const form = $('#signupForm');
  const onSubmit = async (e)=>{
    e.preventDefault();
    const name = $('#name').value.trim();
    const ph1=$('#ph1').value.trim(), ph2=$('#ph2').value.trim(), ph3=$('#ph3').value.trim();
    const emailId=$('#emailId').value.trim(), emailDomain=$('#emailDomain').value.trim();
    const yy=$('#yy').value.trim(), mm=$('#mm').value.trim(), dd=$('#dd').value.trim();
    const pw=$('#pw').value, pw2=$('#pw2').value;

    if(!name||!ph1||!ph2||!ph3||!emailId||!emailDomain||!yy||!mm||!dd||!pw||!pw2)
      return openModal('모든 정보를 입력해주세요');

    const email = `${emailId}@${emailDomain}`;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if(!emailOk) return openModal('이메일/비밀번호를 다시 확인해주세요.');

    if(ph1.length!==3 || ph2.length!==4 || ph3.length!==4)
      return openModal('전화번호를 다시 확인해주세요.');

    const y=+yy,m=+mm,d=+dd; const dateOk = y>=1900 && y<=2100 && m>=1 && m<=12 && d>=1 && d<=31;
    if(!dateOk) return openModal('생년월일을 다시 확인해주세요.');

    if(pw.length<8) return openModal('비밀번호는 8자 이상이어야 합니다.');
    if(pw!==pw2)   return openModal('비밀번호가 일치하지 않습니다.');

    const payload = { name, email, phone:`${ph1}-${ph2}-${ph3}`, birth:`${yy}-${mm}-${dd}` };
    try{
      if (typeof api.signup === 'function') {
        await api.signup({ ...payload, password: pw });
      } else {
        await new Promise(r=>setTimeout(r,400)); // mock
      }
      openModal('회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.', ()=>{ 
        location.hash = '#/'; 
      });
    }catch(err){
      console.error(err);
      openModal('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };
  form.addEventListener('submit', onSubmit);

  // 언마운트 클린업
  return ()=> {
    form?.removeEventListener('submit', onSubmit);
    eyeHandlers.forEach(([btn,fn])=>btn.removeEventListener('click', fn));
    ok.removeEventListener('click', onOk);
    window.removeEventListener('keydown', onEsc);
    
    // 로고 클릭 차단 이벤트 정리
    if (logoClickHandler) {
      document.removeEventListener('click', logoClickHandler, true);
      logoClickHandler = null;
    }
    
    // 직접 추가한 로고 이벤트 리스너들 정리
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
      if (logo._signupPageBlocker) {
        logo.removeEventListener('click', logo._signupPageBlocker, true);
        delete logo._signupPageBlocker;
      }
    });
    
    // 회원가입 페이지 상태를 false로 변경하여 다른 페이지에서는 로고 클릭이 정상 작동
    isSignupPage = false;
  };
}
