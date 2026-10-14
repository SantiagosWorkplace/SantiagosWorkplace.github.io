// Gorilla News — selector global de versión (2022 💾 / 2026 ☁)
// Se carga en ambas versiones. Cada página tiene su equivalente con el mismo nombre de archivo.

(function () {
  const CLAVE = 'version';
  const en2022 = /\/2022\//.test(location.pathname);
  const archivo = location.pathname.split('/').pop() || 'index.html';

  const leer = () => { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } };
  const guardar = (v) => { try { localStorage.setItem(CLAVE, v); } catch (e) {} };
  const destino = (v) => v === '2022'
    ? (en2022 ? archivo : '2022/' + archivo)
    : (en2022 ? '../' + archivo : archivo);

  // Si elegiste 2022, las páginas nuevas te llevan a su equivalente antiguo
  if (leer() === '2022' && !en2022) {
    location.replace(destino('2022'));
    return;
  }

  const ICONOS = {
    '2022': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8V3"/><rect x="7" y="13" width="10" height="6" rx="1"/></svg>',
    '2026': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 19h10.5a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5.5 9.6 4.75 4.75 0 0 0 7 19z"/></svg>',
  };

  const estilos = `
    .ver-toggle { display: inline-flex; flex: none; padding: 3px; gap: 2px; border-radius: 999px;
      border: 1px solid var(--border, #bdbdbd); background: var(--surface, #fff); font-family: system-ui, sans-serif; }
    .ver-toggle button { display: grid; place-items: center; width: 34px; height: 32px; padding: 0; border: 0;
      border-radius: 999px; background: none; color: var(--muted, #555); cursor: pointer; }
    .ver-toggle button:hover { color: var(--text, #111); background: var(--bg-alt, #eee); }
    .ver-toggle button[aria-pressed="true"] { background: var(--accent, #2f4f4f); color: var(--accent-ink, #fff); cursor: default; }
    .ver-toggle svg { width: 18px; height: 18px; }
    .ver-toggle.flotante { position: fixed; top: 12px; right: 12px; z-index: 1000;
      box-shadow: 0 4px 16px rgb(0 0 0 / .25); --accent: darkslategrey; --accent-ink: wheat; }
  `;

  function crear() {
    const style = document.createElement('style');
    style.textContent = estilos;
    document.head.appendChild(style);

    const actual = en2022 ? '2022' : '2026';
    const grupo = document.createElement('div');
    grupo.className = 'ver-toggle';
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Versión del sitio');

    ['2022', '2026'].forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = ICONOS[v];
      b.title = v === '2022' ? 'Ver el diseño de 2022' : 'Ver el diseño de 2026';
      b.setAttribute('aria-label', b.title);
      b.setAttribute('aria-pressed', v === actual);
      b.addEventListener('click', () => {
        if (v === actual) return;
        guardar(v);
        location.href = destino(v);
      });
      grupo.appendChild(b);
    });

    const tema = document.querySelector('#tema');
    if (tema) {
      tema.before(grupo);
    } else {
      grupo.classList.add('flotante');
      document.body.appendChild(grupo);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crear);
  else crear();
})();
