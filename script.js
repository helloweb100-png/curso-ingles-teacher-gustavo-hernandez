/* =====================================================================
   Teacher Gustavo Hernández · Cursos de inglés
   Interacciones y animaciones (JavaScript puro, sin librerías externas)
   ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
   CONFIGURACIÓN: único lugar donde vive el número de WhatsApp.
   Escribe los 10 dígitos del maestro (sin +52), por ejemplo "5512345678".
   Mientras esté vacío, el botón flotante y el formulario permanecen
   ocultos y la sección de contacto muestra un aviso elegante.
   --------------------------------------------------------------------- */
const WHATSAPP_NUMERO = '';
const MENSAJE_BASE = 'Hola maestro Gustavo, quiero agendar mi clase muestra de inglés.';

(function () {
  const root = document.documentElement;
  const $ = function (s, c) { return (c || document).querySelector(s); };
  const $$ = function (s, c) { return Array.from((c || document).querySelectorAll(s)); };
  const clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  const dormir = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const puntero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const estado = { palabras: [] };

  /* Cada módulo corre aislado: si uno falla, el resto de la página sigue funcionando */
  function seguro(nombre, fn) {
    try {
      fn();
    } catch (e) {
      console.warn('[' + nombre + ']', e);
    }
  }

  /* ---------- WhatsApp ---------- */
  function numeroWA() {
    const d = String(WHATSAPP_NUMERO || '').replace(/\D/g, '');
    if (d.length === 10) return '52' + d;
    if (d.length === 12 && d.indexOf('52') === 0) return d;
    if (d.length === 13 && d.indexOf('521') === 0) return '52' + d.slice(3);
    return '';
  }

  const WA = numeroWA();

  function urlWA(texto) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto);
  }

  function whatsapp() {
    const boton = $('#wa-flotante');
    const form = $('#form-contacto');
    const aviso = $('#aviso-contacto');
    if (!WA) {
      if (boton) boton.hidden = true;
      if (form) form.hidden = true;
      if (aviso) aviso.hidden = false;
      return;
    }
    if (boton) {
      boton.href = urlWA(MENSAJE_BASE);
      boton.hidden = false;
    }
    if (form) form.hidden = false;
    if (aviso) aviso.hidden = true;
  }

  /* ---------- Cargador ---------- */
  function cargador() {
    const el = $('#cargador');
    const num = $('#cargador-num');
    let salio = false;

    function salir() {
      if (salio) return;
      salio = true;
      root.classList.add('listo');
      if (!el) return;
      el.classList.add('sale');
      setTimeout(function () { el.remove(); }, reducido ? 300 : 1000);
    }

    if (!el) {
      root.classList.add('listo');
      return;
    }
    const dur = reducido ? 400 : 1000;
    const t0 = performance.now();

    function paso(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      if (num) num.textContent = Math.round((1 - Math.pow(1 - k, 3)) * 100);
      if (k < 1) requestAnimationFrame(paso);
      else salir();
    }

    requestAnimationFrame(paso);
    setTimeout(salir, dur + 700);
  }

  /* ---------- Cabecera y menú móvil ---------- */
  function cabecera() {
    const cab = $('#cabecera');
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;

    function abrir(si) {
      burger.setAttribute('aria-expanded', si ? 'true' : 'false');
      burger.setAttribute('aria-label', si ? 'Cerrar el menú' : 'Abrir el menú');
      menu.classList.toggle('abierto', si);
      menu.setAttribute('aria-hidden', si ? 'false' : 'true');
      document.body.classList.toggle('menu-abierto', si);
      if (si && cab) cab.classList.remove('oculta');
    }

    burger.addEventListener('click', function () {
      abrir(!menu.classList.contains('abierto'));
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { abrir(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        abrir(false);
        burger.focus();
      }
    });
  }

  /* ---------- Texto: títulos por palabra y manifiesto ---------- */
  function dividir(el, clasePalabra, claseInterior, paso) {
    let n = 0;
    const lista = [];

    function recorrer(nodo) {
      Array.from(nodo.childNodes).forEach(function (h) {
        if (h.nodeType === 3) {
          const frag = document.createDocumentFragment();
          h.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            const a = document.createElement('span');
            a.className = clasePalabra;
            if (claseInterior) {
              const b = document.createElement('span');
              b.className = claseInterior;
              b.textContent = p;
              b.style.setProperty('--d', Math.min(n * paso, 800) + 'ms');
              a.appendChild(b);
            } else {
              a.textContent = p;
            }
            n += 1;
            lista.push(a);
            frag.appendChild(a);
          });
          nodo.replaceChild(frag, h);
        } else if (h.nodeType === 1 && h.tagName !== 'BR') {
          recorrer(h);
        }
      });
    }

    recorrer(el);
    return lista;
  }

  function textos() {
    $$('[data-split]').forEach(function (h) { dividir(h, 'pal', 'pal__i', 55); });
    const m = $('[data-palabras]');
    if (m) {
      estado.palabras = dividir(m, 'mw', null, 0);
      estado.palabras.forEach(function (w) { w.style.setProperty('--l', '0'); });
    }
  }

  /* ---------- Elementos decorativos generados ---------- */
  function decor() {
    $$('.onda').forEach(function (onda) {
      let n = 22;
      if (onda.id === 'onda-alumno') n = 14;
      if (onda.classList.contains('onda--vis')) n = 34;
      for (let i = 0; i < n; i++) {
        const b = document.createElement('i');
        b.style.setProperty('--d', (0.5 + Math.random() * 0.9).toFixed(2) + 's');
        b.style.setProperty('--r', (-Math.random() * 1.4).toFixed(2) + 's');
        onda.appendChild(b);
      }
    });
    const barras = $('#barritas-anios');
    if (barras) {
      for (let i = 0; i < 25; i++) {
        const b = document.createElement('i');
        b.style.setProperty('--i', String(i));
        barras.appendChild(b);
      }
    }
    $$('.sesiones').forEach(function (s) {
      Array.from(s.children).forEach(function (c, i) { c.style.setProperty('--n', String(i)); });
    });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function reveal() {
    $$('[data-lote]').forEach(function (lote) {
      Array.from(lote.children).forEach(function (h, i) {
        if (!h.hasAttribute('data-reveal')) h.setAttribute('data-reveal', '');
        h.style.setProperty('--d', (i * 90) + 'ms');
      });
    });
    if (!('IntersectionObserver' in window)) {
      root.classList.add('modo-seguro');
      return;
    }
    const io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal], [data-split]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores ---------- */
  function animarContador(el) {
    const fin = Number(el.dataset.final);
    const miles = el.hasAttribute('data-miles');
    const t0 = performance.now();
    const dur = 1700;

    function paso(t) {
      const k = clamp((t - t0) / dur, 0, 1);
      const v = Math.round(fin * (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)));
      el.textContent = miles ? v.toLocaleString('es-MX') : String(v);
      if (k < 1) requestAnimationFrame(paso);
    }

    paso(t0);
  }

  function contadores() {
    const els = $$('[data-contar]');
    els.forEach(function (el) { el.dataset.final = el.getAttribute('data-contar'); });
    if (reducido || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        animarContador(e.target);
      });
    }, { threshold: 0.2 });
    els.forEach(function (el) {
      el.textContent = '0';
      io.observe(el);
    });
  }

  /* ---------- Titular rotativo del hero ---------- */
  function rotador() {
    const items = $$('.rotador__item');
    if (items.length < 2 || reducido) return;
    let i = 0;
    setInterval(function () {
      if (document.hidden) return;
      const actual = items[i];
      i = (i + 1) % items.length;
      const siguiente = items[i];
      actual.classList.remove('is-activo');
      actual.classList.add('sale');
      siguiente.classList.add('is-activo');
      setTimeout(function () { actual.classList.remove('sale'); }, 1000);
    }, 3200);
  }

  /* ---------- Máquina de escribir (subtítulos y simulación de entrevista) ---------- */
  function visibilidad(el) {
    const obj = { v: true };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { obj.v = es[0].isIntersecting; }).observe(el);
    }
    return obj;
  }

  async function esperarVisible(obj) {
    while (!obj.v || document.hidden) await dormir(400);
  }

  async function subtitulos() {
    const en = $('#sub-en');
    const es = $('#sub-es');
    if (!en || !es || reducido) return;
    const vis = visibilidad(en);
    const frases = [
      ['Tell me about yourself.', 'Cuéntame sobre ti.'],
      ['I would like to schedule a meeting.', 'Me gustaría programar una reunión.'],
      ['Let’s practice your presentation.', 'Practiquemos tu presentación.'],
      ['What are your goals this year?', '¿Cuáles son tus metas este año?'],
      ['Great job! That sounded natural.', '¡Muy bien! Eso sonó natural.']
    ];
    let i = 0;
    await dormir(2800);
    while (true) {
      await esperarVisible(vis);
      i = (i + 1) % frases.length;
      es.style.opacity = '0';
      en.textContent = '';
      const f = frases[i];
      for (const c of f[0]) {
        en.textContent += c;
        await dormir(34 + Math.random() * 40);
      }
      es.textContent = f[1];
      es.style.opacity = '1';
      await dormir(2600);
    }
  }

  async function maquina(el, textosLista, vel, pausa) {
    if (!el || reducido) return;
    const vis = visibilidad(el);
    let i = 0;
    while (true) {
      await esperarVisible(vis);
      const t = textosLista[i % textosLista.length];
      i += 1;
      el.textContent = '';
      for (const c of t) {
        el.textContent += c;
        await dormir(vel + Math.random() * vel);
      }
      await dormir(pausa);
      for (let k = t.length; k > 0; k -= 3) {
        el.textContent = t.slice(0, Math.max(0, k - 3));
        await dormir(14);
      }
      await dormir(250);
    }
  }

  /* ---------- Constelación de palabras del hero (canvas) ---------- */
  function lienzo() {
    const cv = $('#lienzo');
    const hero = $('#inicio');
    if (!cv || !cv.getContext || !hero) return;
    const ctx = cv.getContext('2d');
    let w = 0;
    let h = 0;
    let nodos = [];
    let raf = 0;
    let visible = true;
    const ptr = { x: -999, y: -999, on: false };
    const palabras = ['Hello', 'Interview', 'Speak', 'Fluent', 'Present', 'Career', 'Listen', 'Goal', 'Confidence', 'Practice', 'Meeting', 'Success', 'Teacher', 'Accent', 'Speech', 'Certificate'];

    function medir() {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.round((w * h) / 24000), 22, 66);
      nodos = [];
      for (let i = 0; i < n; i++) {
        nodos.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1.1 + Math.random() * 1.9,
          t: i % 4 === 0 ? palabras[Math.floor(i / 4) % palabras.length] : null,
          rojo: i % 7 === 3,
          f: Math.random() * 6.28
        });
      }
    }

    function dibujar(tiempo) {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const dist = w < 700 ? 100 : 140;
      const d2 = dist * dist;
      nodos.forEach(function (n) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
        if (ptr.on) {
          const dx = n.x - ptr.x;
          const dy = n.y - ptr.y;
          const q = dx * dx + dy * dy;
          if (q < 22000 && q > 1) {
            const f = ((1 - q / 22000) * 1.2) / Math.sqrt(q);
            n.x += dx * f;
            n.y += dy * f;
          }
        }
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < nodos.length; i++) {
        const a = nodos[i];
        for (let j = i + 1; j < nodos.length; j++) {
          const b = nodos[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const q = dx * dx + dy * dy;
          if (q < d2) {
            ctx.strokeStyle = 'rgba(143,176,255,' + ((1 - q / d2) * 0.32).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (ptr.on) {
          const px = a.x - ptr.x;
          const py = a.y - ptr.y;
          const q2 = px * px + py * py;
          if (q2 < 26000) {
            ctx.strokeStyle = 'rgba(255,90,104,' + ((1 - q2 / 26000) * 0.5).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(ptr.x, ptr.y);
            ctx.stroke();
          }
        }
      }
      ctx.font = '500 11px "JetBrains Mono", monospace';
      nodos.forEach(function (n) {
        const pulso = 0.75 + Math.sin(tiempo / 900 + n.f) * 0.25;
        ctx.fillStyle = n.rojo ? 'rgba(255,90,104,' + pulso.toFixed(2) + ')' : 'rgba(205,220,255,' + (pulso * 0.85).toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (n.rojo ? 1.3 : 1), 0, 6.283);
        ctx.fill();
        if (n.t) {
          ctx.fillStyle = 'rgba(214,226,255,0.5)';
          ctx.fillText(n.t, n.x + 9, n.y + 4);
        }
      });
    }

    function bucle(t) {
      raf = 0;
      if (!visible || document.hidden) return;
      dibujar(t);
      raf = requestAnimationFrame(bucle);
    }

    function arrancar() {
      if (!raf && visible && !document.hidden && !reducido) raf = requestAnimationFrame(bucle);
    }

    hero.addEventListener('pointermove', function (e) {
      const r = cv.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.on = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { ptr.on = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) arrancar();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', arrancar);

    let temporizador = 0;
    function remedir() {
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        medir();
        if (reducido) dibujar(0);
      }, 200);
    }
    if ('ResizeObserver' in window) new ResizeObserver(remedir).observe(hero);
    else window.addEventListener('resize', remedir);

    medir();
    if (reducido) dibujar(0);
    else arrancar();
  }

  /* ---------- Inclinación 3D, luz que sigue al puntero y botones magnéticos ---------- */
  function inclinacion() {
    if (!puntero || reducido) return;
    $$('[data-tilt]').forEach(function (el) {
      const esEscena = el.id === 'escena';
      const max = esEscena ? 8 : 7;
      const zona = esEscena ? ($('#inicio') || el) : el;
      zona.addEventListener('pointermove', function (e) {
        const r = zona.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
      });
      zona.addEventListener('pointerleave', function () {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
  }

  function luz() {
    if (!puntero) return;
    document.addEventListener('pointermove', function (e) {
      const t = e.target && e.target.closest ? e.target.closest('.spot') : null;
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function magnetico() {
    if (!puntero || reducido) return;
    $$('[data-magnetico]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        const r = b.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        b.style.translate = (x * 0.22).toFixed(1) + 'px ' + (y * 0.3).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* ---------- Para quién (paneles que se expanden) ---------- */
  function audiencias() {
    const paneles = $$('.panel');
    if (!paneles.length) return;

    function abrir(p) {
      paneles.forEach(function (x) {
        const si = x === p;
        x.classList.toggle('abierto', si);
        const b = $('.panel__cab', x);
        if (b) b.setAttribute('aria-expanded', si ? 'true' : 'false');
      });
    }

    abrir(paneles[0]);
    paneles.forEach(function (p) {
      const b = $('.panel__cab', p);
      if (!b) return;
      b.addEventListener('click', function () {
        if (p.classList.contains('abierto') && window.innerWidth < 1024) {
          p.classList.remove('abierto');
          b.setAttribute('aria-expanded', 'false');
        } else {
          abrir(p);
        }
      });
      p.addEventListener('pointerenter', function (e) {
        if (puntero && window.innerWidth >= 1024 && e.pointerType === 'mouse') abrir(p);
      });
    });
  }

  /* ---------- Preguntas frecuentes (una abierta a la vez) ---------- */
  function faq() {
    const items = $$('.faq__item');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (o) {
          if (o !== d) o.open = false;
        });
      });
    });
  }

  /* ---------- Formulario → WhatsApp ---------- */
  function formulario() {
    const f = $('#form-contacto');
    if (!f) return;
    const ok = $('#form-ok');
    const err = $('#error-nombre');
    const nombre = $('#f-nombre');

    function poner(sel, valor) {
      const s = $(sel);
      if (!s || !valor) return;
      const hay = Array.from(s.options).some(function (o) { return o.value === valor; });
      if (hay) s.value = valor;
    }

    $$('[data-curso]').forEach(function (a) {
      a.addEventListener('click', function () { poner('#f-curso', a.getAttribute('data-curso')); });
    });
    $$('[data-perfil]').forEach(function (a) {
      a.addEventListener('click', function () { poner('#f-perfil', a.getAttribute('data-perfil')); });
    });

    nombre.addEventListener('input', function () {
      if (nombre.value.trim()) err.hidden = true;
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!WA) return;
      const n = nombre.value.trim();
      if (!n) {
        err.hidden = false;
        nombre.setAttribute('aria-invalid', 'true');
        nombre.focus();
        return;
      }
      err.hidden = true;
      nombre.removeAttribute('aria-invalid');
      const d = new FormData(f);
      const perfil = String(d.get('perfil') || '');
      const curso = String(d.get('curso') || '');
      const horario = String(d.get('horario') || '');
      const extra = String(d.get('mensaje') || '').trim();
      const lineas = ['Hola maestro Gustavo, soy ' + n + '.'];
      lineas.push(perfil && perfil !== 'Otro' ? 'Soy ' + perfil.toLowerCase() + ' y quiero mejorar mi inglés' + (curso !== 'Aún no lo sé' ? ' en: ' + curso + '.' : '.') : 'Quiero mejorar mi inglés' + (curso !== 'Aún no lo sé' ? ' en: ' + curso + '.' : '.'));
      if (horario) lineas.push('Horario que me conviene: ' + horario + '.');
      if (extra) lineas.push(extra);
      lineas.push('Me gustaría agendar mi clase muestra. ¡Gracias!');
      window.open(urlWA(lineas.join('\n')), '_blank', 'noopener');
      if (ok) ok.hidden = false;
    });
  }

  /* ---------- Efectos ligados al scroll (un solo bucle) ---------- */
  function scrollFX() {
    const barra = $('#progreso');
    const cab = $('#cabecera');
    const menu = $('#menu');
    const hero = $('#inicio');
    const heroIn = $('#hero-interior');
    const lienzoEl = $('#lienzo');
    const man = $('#manifiesto');
    const retrato = $('#retrato');
    const marco = $('#retrato-marco');
    const ruta = $('#ruta');
    const linea = $('#ruta-linea');
    const pasos = $$('.paso');
    const cartas = $$('.curso');
    const zonas = $$('main [data-tono], footer[data-tono]');
    const secciones = $$('main section[id]');
    const riel = $$('#riel a');
    const cintas = $$('[data-cinta]');
    const paralajes = [['.manifiesto__fondo', -0.1], ['.contacto__aurora', -0.12], ['.cursos__resplandor', -0.08]].map(function (p) {
      return { el: $(p[0]), v: p[1], cur: 0 };
    }).filter(function (o) { return o.el; });

    let y = window.scrollY;
    let yPrev = y;
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    let docH = document.documentElement.scrollHeight;
    let boost = 0;
    let dirScroll = 1;
    let maxMan = 0;
    let maxRet = 0;
    let maxRuta = 0;
    let tonoActual = '';
    let secActual = '';
    let pilaLimpia = true;
    let raf = 0;
    let hasta = 0;

    if (marco) marco.style.setProperty('--e', reducido ? '1' : '0');
    if (reducido) {
      if (linea) linea.style.setProperty('--p', '1');
      pasos.forEach(function (p) { p.classList.add('activo'); });
    }

    function medir() {
      vh = window.innerHeight;
      vw = window.innerWidth;
      docH = document.documentElement.scrollHeight;
    }

    function tick() {
      y = window.scrollY;
      const d = y - yPrev;
      yPrev = y;
      if (d !== 0) dirScroll = d > 0 ? 1 : -1;

      /* barra de progreso */
      if (barra) barra.style.transform = 'scaleX(' + (docH > vh ? clamp(y / (docH - vh), 0, 1) : 0).toFixed(4) + ')';

      /* cabecera: se esconde al bajar y reaparece al subir; cambia de tono según la sección */
      if (cab && !(menu && menu.classList.contains('abierto'))) {
        if (y > 420 && d > 6) cab.classList.add('oculta');
        else if (d < -6 || y < 200) cab.classList.remove('oculta');
      }
      let tono = tonoActual || 'oscuro';
      zonas.forEach(function (z) {
        const r = z.getBoundingClientRect();
        if (r.top <= 44 && r.bottom > 44) tono = z.getAttribute('data-tono');
      });
      if (cab && tono !== tonoActual) {
        tonoActual = tono;
        cab.setAttribute('data-tono', tono);
      }

      /* índice lateral */
      let sec = secActual;
      secciones.forEach(function (s) {
        const r = s.getBoundingClientRect();
        if (r.top < vh * 0.5 && r.bottom > vh * 0.5) sec = s.id;
      });
      if (sec !== secActual) {
        secActual = sec;
        riel.forEach(function (a) { a.classList.toggle('activo', a.getAttribute('data-sec') === sec); });
      }

      if (reducido) return;

      /* hero: el contenido se aleja suavemente al bajar */
      if (hero && heroIn && y < vh * 1.4) {
        const p = clamp(y / (hero.offsetHeight * 0.9), 0, 1);
        heroIn.style.transform = 'translate3d(0,' + (p * 60).toFixed(1) + 'px,0)';
        heroIn.style.opacity = (1 - p * 0.85).toFixed(3);
        if (lienzoEl) lienzoEl.style.transform = 'translate3d(0,' + (p * 120).toFixed(1) + 'px,0)';
      }

      /* manifiesto: las palabras se iluminan (el avance no retrocede) */
      if (man && estado.palabras.length) {
        const r = man.getBoundingClientRect();
        const p = clamp((vh * 0.85 - r.top) / (r.height * 0.7 + vh * 0.15), 0, 1);
        if (p > maxMan) maxMan = p;
        const total = estado.palabras.length;
        const encendidas = maxMan * (total + 3);
        for (let i = 0; i < total; i++) {
          const l = clamp(encendidas - i, 0, 1);
          const w = estado.palabras[i];
          if (w._l !== l) {
            w._l = l;
            w.style.setProperty('--l', l.toFixed(2));
          }
        }
      }

      /* retrato del maestro: de óvalo a marco completo */
      if (retrato && marco) {
        const r = retrato.getBoundingClientRect();
        const p = clamp((vh * 0.95 - r.top) / (vh * 0.75), 0, 1);
        if (p > maxRet) maxRet = p;
        marco.style.setProperty('--e', (1 - Math.pow(1 - maxRet, 3)).toFixed(3));
      }

      /* ruta: la línea se dibuja y los pasos se encienden */
      if (ruta && linea) {
        const r = ruta.getBoundingClientRect();
        const p = clamp((vh * 0.62 - r.top) / r.height, 0, 1);
        if (p > maxRuta) maxRuta = p;
        linea.style.setProperty('--p', maxRuta.toFixed(3));
        pasos.forEach(function (paso) {
          const rr = paso.getBoundingClientRect();
          if (rr.top + 40 < vh * 0.62) paso.classList.add('activo');
        });
      }

      /* cursos: las tarjetas se apilan, escalan y se oscurecen al quedar debajo de la siguiente */
      if (cartas.length) {
        if (vw >= 1024) {
          pilaLimpia = false;
          cartas.forEach(function (c, i) {
            if (i === cartas.length - 1) return;
            const rc = c.getBoundingClientRect();
            const rs = cartas[i + 1].getBoundingClientRect();
            const solape = clamp((rc.top + c.offsetHeight - rs.top) / c.offsetHeight, 0, 1);
            c.style.transform = 'scale(' + (1 - solape * 0.05).toFixed(4) + ')';
            c.style.setProperty('--vela', (solape * 0.5).toFixed(3));
          });
        } else if (!pilaLimpia) {
          pilaLimpia = true;
          cartas.forEach(function (c) {
            c.style.transform = '';
            c.style.removeProperty('--vela');
          });
        }
      }

      /* paralaje suave en fondos decorativos */
      paralajes.forEach(function (o) {
        const r = o.el.getBoundingClientRect();
        const objetivo = clamp((r.top + r.height / 2 - vh / 2) * o.v, -50, 50);
        o.cur += (objetivo - o.cur) * 0.12;
        o.el.style.translate = '0 ' + o.cur.toFixed(1) + 'px';
      });

      /* listones: aceleran con la velocidad del scroll y cambian de sentido al subir */
      boost += (Math.min(Math.abs(d) * 0.12, 6) - boost) * 0.1;
      cintas.forEach(function (el) {
        const anims = el.getAnimations ? el.getAnimations() : [];
        if (anims[0]) anims[0].playbackRate = dirScroll * (1 + boost);
      });
    }

    function bucle() {
      raf = 0;
      tick();
      if (performance.now() < hasta || boost > 0.02) raf = requestAnimationFrame(bucle);
    }

    function despertar() {
      hasta = performance.now() + 1400;
      if (!raf) raf = requestAnimationFrame(bucle);
    }

    window.addEventListener('scroll', despertar, { passive: true });
    window.addEventListener('resize', function () {
      medir();
      despertar();
    });
    window.addEventListener('load', function () {
      medir();
      despertar();
    });
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { medir(); }).observe(document.body);
    }
    medir();
    despertar();
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    seguro('cargador', cargador);
    seguro('whatsapp', whatsapp);
    seguro('cabecera', cabecera);
    seguro('textos', textos);
    seguro('decor', decor);
    seguro('reveal', reveal);
    seguro('contadores', contadores);
    seguro('rotador', rotador);
    seguro('subtitulos', function () { subtitulos(); });
    seguro('entrevista', function () {
      maquina($('#teclear-entrevista'), [
        'I’m a team leader who loves solving problems.',
        'My biggest strength is clear communication.',
        'I’m excited to keep growing as a professional.'
      ], 38, 2400);
    });
    seguro('lienzo', lienzo);
    seguro('inclinacion', inclinacion);
    seguro('luz', luz);
    seguro('magnetico', magnetico);
    seguro('audiencias', audiencias);
    seguro('faq', faq);
    seguro('formulario', formulario);
    seguro('scroll', scrollFX);
    window.__sitioListo = true;
  }

  iniciar();
})();
