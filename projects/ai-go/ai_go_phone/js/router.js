// app/js/router.js
// 해시 기반 초간단 라우터: routes = { '#/path': () => import('...') }
export function createRouter(routes, options = {}) {
  const root   = options.root || document.getElementById('app');
  const onBefore = options.onBefore || (() => {});
  const onAfter  = options.onAfter  || (() => {});
  let cleanup = null;

  // 빈 해시 또는 잘못된 해시는 #/ 으로 정규화 (로그인 화면)
  const normalize = (h) => {
    if (!h || h === '#') return '#/';
    if (!h.startsWith('#/')) return '#/';
    return h;
  };

  async function render(hash) {
    const path  = normalize(hash);
    const match = routes[path] || routes['#/404'] || routes['#/home'];

    document.body.classList.add('loading');
    onBefore(path);

    try {
      const mod = await match(); // 동적 import (각 뷰 모듈)
      // 이전 화면 언마운트
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch (e) { /* noop */ }
      }

      const html = (await mod.render?.()) || '';
      root.innerHTML = html;

      // mount가 반환하는 함수가 cleanup
      cleanup = typeof mod.mount === 'function' ? await mod.mount(root) : null;

      // 스크롤/포커스
      window.scrollTo({ top: 0, behavior: 'instant' });
      const firstH1 = root.querySelector('h1, [data-page-title]');
      if (firstH1) {
        try { firstH1.setAttribute('tabindex', '-1'); firstH1.focus({ preventScroll: true }); } catch {}
      }

      onAfter(path);
    } catch (e) {
      console.error('[router] render error', e);
      root.innerHTML = `<div style="padding:16px">화면을 불러오지 못했습니다.</div>`;
    } finally {
      document.body.classList.remove('loading');
    }
  }

  // 해시 변경 시 렌더
  window.addEventListener('hashchange', () => render(location.hash));

  // 최초 진입
  render(location.hash);

  // 외부에서 이동하고 싶을 때 사용할 수 있는 navigate
  return {
    navigate: (to) => { location.hash = to; }
  };
}
