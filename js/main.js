// Gorilla News — comportamiento común (menú, tema, reloj, carrusel, formulario)

(function () {
  const root = document.documentElement;

  // ---------- Tema claro / oscuro ----------
  try {
    const guardado = localStorage.getItem('tema');
    if (guardado) root.dataset.theme = guardado;
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', () => {
    const botonTema = document.querySelector('#tema');
    if (botonTema) {
      botonTema.addEventListener('click', () => {
        const oscuroActual = root.dataset.theme
          ? root.dataset.theme === 'dark'
          : matchMedia('(prefers-color-scheme: dark)').matches;
        root.dataset.theme = oscuroActual ? 'light' : 'dark';
        try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {}
      });
    }

    // ---------- Menú ----------
    const nav = document.querySelector('.nav');
    const botonMenu = document.querySelector('.menu-btn');
    if (botonMenu) {
      botonMenu.addEventListener('click', () => {
        const abierto = nav.classList.toggle('open');
        botonMenu.setAttribute('aria-expanded', abierto);
      });
    }

    const drop = document.querySelector('.nav-drop');
    if (drop) {
      const botonDrop = drop.querySelector('button');
      botonDrop.addEventListener('click', (e) => {
        e.stopPropagation();
        const abierto = drop.classList.toggle('open');
        botonDrop.setAttribute('aria-expanded', abierto);
      });
      document.addEventListener('click', (e) => {
        if (!drop.contains(e.target)) {
          drop.classList.remove('open');
          botonDrop.setAttribute('aria-expanded', false);
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          drop.classList.remove('open');
          botonDrop.setAttribute('aria-expanded', false);
        }
      });
    }

    // ---------- Fecha y hora ----------
    const botonHora = document.querySelector('#ver-hora');
    const salidaHora = document.querySelector('#fecha-hora');
    if (botonHora && salidaHora) {
      let reloj;
      const formato = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeStyle: 'medium' });
      botonHora.addEventListener('click', () => {
        if (reloj) {
          clearInterval(reloj);
          reloj = null;
          salidaHora.textContent = '';
          botonHora.textContent = 'Ver fecha y hora';
          return;
        }
        const pintar = () => { salidaHora.textContent = formato.format(new Date()); };
        pintar();
        reloj = setInterval(pintar, 1000);
        botonHora.textContent = 'Ocultar';
      });
    }

    iniciarCarrusel();
    iniciarFormulario();
  });

  // ---------- Carrusel ----------
  function iniciarCarrusel() {
    const carrusel = document.querySelector('.carousel');
    if (!carrusel) return;

    const TIEMPO_INTERVALO_MS = 3000;
    const imagenes = [...carrusel.querySelectorAll('.stage img')];
    const botonRetroceder = carrusel.querySelector('.prev');
    const botonAvanzar = carrusel.querySelector('.next');
    const botonPlay = carrusel.querySelector('#play');
    const contador = carrusel.querySelector('.counter');
    const puntos = carrusel.querySelector('.dots');
    let posicionActual = 0;
    let intervalo = null;

    imagenes.forEach((_, i) => {
      const punto = document.createElement('button');
      punto.type = 'button';
      punto.setAttribute('aria-label', `Imagen ${i + 1}`);
      punto.addEventListener('click', () => irA(i));
      puntos.appendChild(punto);
    });

    function render() {
      imagenes.forEach((img, i) => img.classList.toggle('active', i === posicionActual));
      [...puntos.children].forEach((p, i) => p.setAttribute('aria-current', i === posicionActual));
      contador.textContent = `${String(posicionActual + 1).padStart(2, '0')} / ${String(imagenes.length).padStart(2, '0')}`;
    }

    function irA(i) {
      posicionActual = (i + imagenes.length) % imagenes.length;
      render();
    }

    function play() {
      intervalo = setInterval(() => irA(posicionActual + 1), TIEMPO_INTERVALO_MS);
      botonPlay.textContent = '❚❚ Pausar';
      botonPlay.setAttribute('aria-pressed', true);
    }

    function stop() {
      clearInterval(intervalo);
      intervalo = null;
      botonPlay.textContent = '▶ Reproducir';
      botonPlay.setAttribute('aria-pressed', false);
    }

    botonAvanzar.addEventListener('click', () => irA(posicionActual + 1));
    botonRetroceder.addEventListener('click', () => irA(posicionActual - 1));
    botonPlay.addEventListener('click', () => (intervalo ? stop() : play()));
    carrusel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') irA(posicionActual + 1);
      if (e.key === 'ArrowLeft') irA(posicionActual - 1);
    });

    render();
  }

  // ---------- Formulario de contacto ----------
  function iniciarFormulario() {
    const form = document.querySelector('#formulario');
    if (!form) return;

    const patronUsuario = /^[a-zA-Z0-9_\- áéíóúÁÉÍÓÚüÜñÑ]{4,20}$/;
    const patronMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const reglas = {
      nombre: (v) => v === '' ? 'El campo "Nombre" debe ser rellenado.'
        : !patronUsuario.test(v) ? 'El nombre debe tener entre 4 y 20 caracteres (letras, números, espacios, - o _).'
        : '',
      correo: (v) => !patronMail.test(v) ? 'El correo es inválido. Volvé a ingresarlo.' : '',
      edad: (v) => {
        const n = Number(v);
        return v === '' || !Number.isInteger(n) ? '"Edad" debe ser un número.'
          : n < 1 || n > 120 ? 'Ingresá una edad entre 1 y 120.'
          : '';
      },
    };

    function validarCampo(nombre) {
      const input = form.elements[nombre];
      const campo = input.closest('.field');
      const pista = campo.querySelector('.hint');
      const error = reglas[nombre](input.value.trim());
      campo.classList.toggle('invalid', !!error);
      campo.classList.toggle('valid', !error);
      input.setAttribute('aria-invalid', !!error);
      pista.textContent = error;
      return error;
    }

    Object.keys(reglas).forEach((nombre) => {
      const input = form.elements[nombre];
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('invalid') || input.value.trim().length > 2) validarCampo(nombre);
      });
      input.addEventListener('blur', () => { if (input.value.trim() !== '') validarCampo(nombre); });
    });

    const mensaje = document.querySelector('#form-msg');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errores = Object.keys(reglas).map(validarCampo).filter(Boolean);

      mensaje.className = 'form-msg show';
      mensaje.replaceChildren();

      if (errores.length) {
        mensaje.classList.add('err');
        const titulo = document.createElement('strong');
        titulo.textContent = 'Revisá estos campos:';
        const lista = document.createElement('ul');
        errores.forEach((err) => {
          const li = document.createElement('li');
          li.textContent = err;
          lista.appendChild(li);
        });
        mensaje.append(titulo, lista);
        form.querySelector('.invalid input').focus();
        return;
      }

      const nombre = form.elements.nombre.value.trim();
      const correo = form.elements.correo.value.trim();
      const plataformas = [...form.querySelectorAll('input[name="plataforma"]:checked')].map((c) => c.value);

      mensaje.classList.add('ok');
      const texto = document.createElement('p');
      texto.textContent = `¡Gracias, ${nombre}! Tu solicitud (${correo}) fue enviada correctamente.`;
      mensaje.appendChild(texto);
      if (plataformas.length) {
        const extra = document.createElement('p');
        extra.textContent = `Plataformas favoritas: ${plataformas.join(', ')}.`;
        mensaje.appendChild(extra);
      }

      form.reset();
      form.querySelectorAll('.field').forEach((c) => c.classList.remove('valid', 'invalid'));
      form.querySelectorAll('.hint').forEach((h) => (h.textContent = ''));
    });
  }
})();
