const { ipcRenderer } = require('electron');

// In-game options menu: Resume / Windowed-Fullscreen / Reload / Exit.
// Open with F10, Start+Select on a controller, or the small gear that
// appears when the mouse is near the top-right corner.

const ITEMS = [
  { id: 'resume', label: 'Resume' },
  { id: 'fullscreen', label: 'Windowed / Fullscreen' },
  { id: 'zoom-out', label: 'Smaller UI  (Ctrl -)' },
  { id: 'zoom-in', label: 'Larger UI  (Ctrl +)' },
  { id: 'zoom-auto', label: 'Reset UI size (auto)' },
  { id: 'reload', label: 'Reload game' },
  { id: 'quit', label: 'Exit game' },
];

let open = false;
let selected = 0;
let host, root, panel, gear, buttons;

function setSelected(i) {
  selected = (i + ITEMS.length) % ITEMS.length;
  buttons.forEach((b, n) => b.classList.toggle('sel', n === selected));
}

function setOpen(value) {
  open = value;
  panel.style.display = open ? 'flex' : 'none';
  if (open) setSelected(0);
}

function run(id) {
  if (id === 'resume') setOpen(false);
  else if (id === 'fullscreen') ipcRenderer.send('app:toggle-fullscreen');
  else if (id === 'zoom-out') ipcRenderer.send('app:zoom', 'out');
  else if (id === 'zoom-in') ipcRenderer.send('app:zoom', 'in');
  else if (id === 'zoom-auto') ipcRenderer.send('app:zoom', 'auto');
  else if (id === 'reload') ipcRenderer.send('app:reload');
  else if (id === 'quit') ipcRenderer.send('app:quit');
}

function build() {
  host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  root = host.attachShadow({ mode: 'closed' });
  root.innerHTML = `
    <style>
      * { box-sizing: border-box; font-family: system-ui, sans-serif; }
      .gear { position: fixed; bottom: 14px; right: 76px; width: 36px; height: 36px;
        border-radius: 50%; border: 0; background: rgba(0,0,0,.6); color: #fff;
        font-size: 20px; line-height: 1; cursor: pointer; opacity: .55;
        transition: opacity .2s; pointer-events: auto; }
      .gear:hover { opacity: 1; }
      .panel { position: fixed; inset: 0; display: none; align-items: center;
        justify-content: center; flex-direction: column; gap: 10px;
        background: rgba(0,0,0,.6); pointer-events: auto; }
      .title { color: #fff; font-size: 22px; margin-bottom: 8px; }
      .panel button { width: 280px; padding: 14px 18px; font-size: 18px;
        border-radius: 10px; border: 2px solid transparent; cursor: pointer;
        background: #222; color: #fff; }
      .panel button.sel, .panel button:hover { border-color: #ee1515; background: #333; }
      .hint { color: #aaa; font-size: 13px; margin-top: 8px; }
    </style>
    <button class="gear" title="Options (F10)">&#9881;</button>
    <div class="panel">
      <div class="title">Pokebonk</div>
      ${ITEMS.map((it) => `<button data-id="${it.id}">${it.label}</button>`).join('')}
      <div class="hint">F10 or Start+Select to close</div>
    </div>`;
  panel = root.querySelector('.panel');
  gear = root.querySelector('.gear');
  buttons = [...root.querySelectorAll('.panel button')];
  buttons.forEach((b, n) => {
    b.addEventListener('mouseenter', () => setSelected(n));
    b.addEventListener('click', () => run(b.dataset.id));
  });
  gear.addEventListener('click', () => setOpen(!open));
  document.documentElement.appendChild(host);

  // Keyboard: F10 toggles; while open, menu keys don't reach the game.
  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'F10') {
        setOpen(!open);
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      if (!open) return;
      if (e.key === 'ArrowUp') setSelected(selected - 1);
      else if (e.key === 'ArrowDown') setSelected(selected + 1);
      else if (e.key === 'Enter') run(ITEMS[selected].id);
      else if (e.key === 'Escape') setOpen(false);
      e.preventDefault();
      e.stopImmediatePropagation();
    },
    true,
  );

  pollGamepad();
}

// Controller: Start+Select toggles; D-pad/stick up-down moves, A selects, B closes.
let prev = {};
function pollGamepad() {
  const pad = [...(navigator.getGamepads() || [])].find((g) => g);
  if (pad) {
    const b = (i) => !!pad.buttons[i] && pad.buttons[i].pressed;
    const now = {
      combo: b(8) && b(9),
      up: b(12) || pad.axes[1] < -0.6,
      down: b(13) || pad.axes[1] > 0.6,
      a: b(0),
      b: b(1),
    };
    const hit = (k) => now[k] && !prev[k];
    if (hit('combo')) setOpen(!open);
    else if (open) {
      if (hit('up')) setSelected(selected - 1);
      if (hit('down')) setSelected(selected + 1);
      if (hit('a')) run(ITEMS[selected].id);
      if (hit('b')) setOpen(false);
    }
    prev = now;
  }
  requestAnimationFrame(pollGamepad);
}

window.addEventListener('DOMContentLoaded', build);
