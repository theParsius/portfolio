let el: HTMLElement | null = null;
let timer = 0;

export function mountToast(): HTMLElement {
  el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  document.body.append(el);
  return el;
}

export function toast(msg: string, ms = 2600): void {
  if (!el) mountToast();
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(timer);
  timer = window.setTimeout(() => el?.classList.remove('show'), ms);
}

export function hideToast(): void {
  el?.classList.remove('show');
}
