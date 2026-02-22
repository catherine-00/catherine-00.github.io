// app/js/utils/viewLoader.js
export async function renderFromFile(filePath, { styleId, rootSelector = '.app' } = {}) {
  // index.html 기준 경로로 fetch 됨
  const html = await (await fetch(filePath, { cache: 'no-cache' })).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // <style> 가져와서 <head>에 주입 (한 번만)
  const style = doc.querySelector('style');
  if (style && styleId) {
    let s = document.getElementById(styleId);
    if (!s) {
      s = document.createElement('style');
      s.id = styleId;
      document.head.appendChild(s);
    }
    s.textContent = style.textContent;
  }

  // 원하는 루트 선택해서 그대로 반환 (outerHTML로!)
  const root = doc.querySelector(rootSelector) || doc.body;
  return root.outerHTML || root.innerHTML;
}
