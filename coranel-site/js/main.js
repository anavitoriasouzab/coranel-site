/* ===== Lívia Coranel · interações e movimento =====
   Dependências (CDN, no index.html): GSAP 3.13 + ScrollTrigger + SplitText, Lenis 1.1.
   Se o CDN falhar, a página continua funcionando sem animações. */

(() => {
  const root = document.documentElement;
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const fecharMenu = () => {
    nav.classList.remove('aberto');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const aberto = nav.classList.toggle('aberto');
      toggle.setAttribute('aria-expanded', aberto);
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', fecharMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('aberto')) { fecharMenu(); toggle.focus(); } });
    document.addEventListener('click', (e) => { if (nav.classList.contains('aberto') && !e.target.closest('.header')) fecharMenu(); });
  }

  // ---------- FAQ: uma pergunta aberta por vez ----------
  const perguntas = document.querySelectorAll('.pergunta');
  perguntas.forEach((p) => p.addEventListener('toggle', () => {
    if (p.open) perguntas.forEach((o) => { if (o !== p) o.open = false; });
  }));

  // ---------- Brilho que segue o mouse nos cards ----------
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // ---------- Contato: montador de mensagem para o WhatsApp ----------
  // Sem JS, o <form> envia a mensagem padrão direto para o wa.me.
  const montador = document.querySelector('.montador');
  if (montador) {
    const NUMERO = '5500000000000';
    const situacoes = {
      negado: 'Meu pedido foi negado pelo INSS e gostaria de entender quais caminhos eu tenho.',
      pedir: 'Vou pedir um benefício ao INSS e gostaria de uma orientação antes.',
      revisao: 'Gostaria de saber se o meu benefício pode ser revisado.',
      outro: 'Tenho uma dúvida sobre o INSS e gostaria de conversar.',
    };
    const formatos = {
      online: 'Prefiro uma conversa online.',
      presencial: 'Prefiro uma conversa presencial em Manaus.',
    };
    const balao = montador.querySelector('.previa__balao');
    const montar = () => {
      const d = new FormData(montador);
      const nome = String(d.get('nome') || '').trim().replace(/\s+/g, ' ');
      return ['Olá, Dra. Lívia!', nome && `Meu nome é ${nome}.`, situacoes[d.get('situacao')], formatos[d.get('formato')]]
        .filter(Boolean).join(' ');
    };
    const atualizar = (animar) => {
      const texto = montar();
      if (balao.textContent === texto) return;
      balao.textContent = texto;
      if (animar && !reduzir && balao.animate) {
        balao.animate([{ opacity: 0.35, transform: 'translateY(6px) scale(.98)' }, { opacity: 1, transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    };
    montador.addEventListener('input', (e) => atualizar(e.target.type === 'radio'));
    montador.addEventListener('submit', (e) => {
      e.preventDefault();
      window.open(`https://wa.me/${NUMERO}?text=${encodeURIComponent(montar())}`, '_blank', 'noopener');
    });
    atualizar(false);
  }

  // ---------- Fecho: ajusta o viewBox da assinatura ao tamanho real do texto ----------
  const assinaturaSvg = document.querySelector('.fecho__svg');
  const ajustarAssinatura = () => {
    const texto = assinaturaSvg?.querySelector('text');
    if (!texto) return;
    try {
      const b = texto.getBBox();
      if (b.width) assinaturaSvg.setAttribute('viewBox', `${b.x - 8} ${b.y - 4} ${b.width + 16} ${b.height * 0.8}`);
    } catch (e) { /* SVG ainda não renderizado */ }
  };
  ajustarAssinatura();
  if (document.fonts) {
    document.fonts.ready.then(ajustarAssinatura);
    document.fonts.addEventListener?.('loadingdone', () => { ajustarAssinatura(); window.ScrollTrigger?.refresh(); });
  }

  // ---------- Sem GSAP: mostra tudo e encerra ----------
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    document.querySelector('.intro')?.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const temSplit = !!window.SplitText;
  if (temSplit) gsap.registerPlugin(SplitText);

  // Espera as fontes (no máximo 1,2 s) para quebrar as linhas dos títulos no lugar certo
  const fontes = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1200)),
  ]);
  fontes.then(iniciar);

  function iniciar() {
    // ---------- Scroll suave (Lenis sincronizado com o ScrollTrigger) ----------
    let lenis = null;
    if (!reduzir && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#' || id === '#conteudo') return;
        const alvo = id === '#topo' ? 0 : document.querySelector(id);
        if (alvo === null) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(alvo, { offset: alvo === 0 ? 0 : -100, duration: 1.4 });
        else if (alvo === 0) window.scrollTo({ top: 0 });
        else alvo.scrollIntoView();
      });
    });

    if (reduzir) {
      document.querySelector('.intro')?.remove();
      historiaModoLista(false);
    } else {
      movimento(lenis);
    }

    interface_();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  // =====================================================================
  //  Movimento (só sem prefers-reduced-motion)
  // =====================================================================
  function movimento(lenis) {
    // ---------- Intro + entrada do hero ----------
    const intro = document.querySelector('.intro');
    let jaViu = false;
    try { jaViu = sessionStorage.getItem('lc-intro') === '1'; sessionStorage.setItem('lc-intro', '1'); } catch (e) { /* sem storage */ }

    const tl = gsap.timeline();
    if (intro && !jaViu) {
      lenis?.stop();
      tl.from('.intro__lc', { autoAlpha: 0, scale: 0.85, duration: 0.9, ease: 'power3.out' })
        .from('.intro__linha', { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.5')
        .from('.intro__nome', { autoAlpha: 0, y: 10, letterSpacing: '14px', duration: 0.8, ease: 'power3.out' }, '<')
        .to('.intro__lc, .intro__linha, .intro__nome', { autoAlpha: 0, y: -14, duration: 0.4, stagger: 0.05, delay: 0.2 })
        .to(intro, { yPercent: -100, duration: 1, ease: 'power4.inOut' })
        .add(() => { intro.remove(); lenis?.start(); });
    } else {
      intro?.remove();
    }

    const h1 = document.querySelector('.hero h1');
    const pos = intro && !jaViu ? '-=0.55' : 0;
    tl.fromTo('.hero__bg', { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, pos);
    if (temSplit) {
      const split = SplitText.create(h1, { type: 'lines', mask: 'lines' });
      tl.from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '<0.15');
      gsap.set(h1, { autoAlpha: 1 });
    } else {
      tl.fromTo(h1, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, '<0.15');
    }
    tl.fromTo('.hero-anim:not(h1)', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '<0.3')
      .from('.header__bar', { yPercent: -150, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, '<');

    // Hero ao rolar: foto desce devagar, texto sobe e some
    gsap.to('.hero__bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__conteudo', { y: -80, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

    // ---------- Títulos: revelação palavra por palavra ----------
    if (temSplit) {
      document.querySelectorAll('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'words,lines', mask: 'lines', autoSplit: true,
          onSplit: (self) => gsap.from(self.words, {
            yPercent: 110, duration: 1.1, stagger: 0.04, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
        });
      });
    }

    // ---------- Faixa: palavras andam com o scroll ----------
    gsap.utils.toArray('.faixa__linha').forEach((linha) => {
      const dir = Number(linha.dataset.dir) || -1;
      gsap.fromTo(linha, { xPercent: dir < 0 ? 0 : -30 }, {
        xPercent: dir < 0 ? -30 : 0, ease: 'none',
        scrollTrigger: { trigger: '.faixa', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    });

    // ---------- Sobre: a seção da Dra. Lívia ----------
    // Entrada da foto: o arco se abre de baixo para cima e a foto sai de um zoom suave
    gsap.timeline({ scrollTrigger: { trigger: '.sobre__foto', start: 'top 82%', once: true } })
      .fromTo('.sobre__arco',
        { clipPath: 'inset(100% 0% 0% 0% round 300px 300px 18px 18px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 300px 300px 18px 18px)', duration: 1.5, ease: 'power4.inOut', clearProps: 'clipPath' })
      .from('.sobre__moldura picture', { scale: 1.35, duration: 2, ease: 'power3.out' }, '<0.1')
      .from('.selo', { scale: 0, rotate: -140, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)' }, '-=1.2')
      .from('.cartao', { x: -30, y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out' }, '-=0.9');

    // Parallax: a foto desliza dentro do arco; selo e cartão flutuam em velocidades diferentes
    const naSobre = { trigger: '.sobre', start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.sobre__moldura img', { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: naSobre });
    gsap.fromTo('.cartao', { yPercent: 40 }, { yPercent: -60, ease: 'none', scrollTrigger: naSobre });
    gsap.fromTo('.selo__giro', { rotate: 0 }, { rotate: 180, ease: 'none', scrollTrigger: naSobre });
    gsap.fromTo('.selo', { yPercent: 30 }, { yPercent: -40, ease: 'none', scrollTrigger: naSobre });
    gsap.fromTo('.sobre__marca', { yPercent: 18, rotate: -6 }, { yPercent: -18, rotate: 4, ease: 'none', scrollTrigger: naSobre });

    // Citação: linhas sobem e o grifo prateado se desenha sob "ouço a sua história"
    const citacao = document.querySelector('.sobre__citacao p');
    if (citacao) {
      const animarCitacao = (linhas) => gsap.timeline({ scrollTrigger: { trigger: citacao, start: 'top 85%', once: true } })
        .from(linhas, { yPercent: 105, duration: 1.1, stagger: 0.12, ease: 'power4.out' })
        .fromTo(citacao.querySelectorAll('.grifo'), { backgroundSize: '0% 38%' }, { backgroundSize: '100% 38%', duration: 1.2, ease: 'power2.inOut' }, '-=0.5');
      if (temSplit) SplitText.create(citacao, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) => animarCitacao(self.lines) });
      else animarCitacao([citacao]);
    }
    gsap.from('.ident__lc', { rotate: -25, ease: 'none', scrollTrigger: { trigger: '.ident', start: 'top bottom', end: 'center center', scrub: true } });

    // ---------- Números contando ----------
    document.querySelectorAll('[data-contar]').forEach((el) => {
      const fim = Number(el.dataset.contar);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: fim, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // ---------- Cards: inclinação 3D suave ----------
    if (ponteiroFino) {
      document.querySelectorAll('.card').forEach((card) => {
        gsap.set(card, { transformPerspective: 900 });
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
    }

    // ---------- Como funciona: storytime ----------
    const mm = gsap.matchMedia();
    mm.add({
      fixo: '(min-width: 901px) and (min-height: 700px)',
      lista: '(max-width: 900px), (max-height: 699px)',
    }, (ctx) => {
      if (ctx.conditions.fixo) return historiaFixa();
      historiaModoLista(true);
      return undefined;
    });

    // ---------- Compromisso: placa de prata ----------
    // As 15 marcas do mostrador acendem uma a uma (um "dia" cada), o anel fecha o ciclo e o brilho passa
    const placa = document.querySelector('.placa');
    if (placa) {
      gsap.timeline({ scrollTrigger: { trigger: placa, start: 'top 75%', once: true } })
        .fromTo('.relogio__marcas line', { stroke: 'rgba(26,28,30,.16)' }, { stroke: '#1a1c1e', duration: 0.25, stagger: 0.09, ease: 'none' })
        .fromTo('.relogio__progresso', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, 0)
        .fromTo('.relogio', { rotate: -12 }, { rotate: 0, duration: 1.6, ease: 'power3.out' }, 0)
        .fromTo('.placa__brilho', { xPercent: -120 }, { xPercent: 220, duration: 1.6, ease: 'power2.inOut' }, '-=0.6');
      // Ao passar o mouse, o brilho corre de novo pela placa
      if (ponteiroFino) {
        placa.addEventListener('pointerenter', () => {
          gsap.fromTo('.placa__brilho', { xPercent: -120 }, { xPercent: 220, duration: 1.3, ease: 'power2.inOut', overwrite: true });
        });
      }
    }

    // ---------- Rodapé ----------
    // Botão magnético
    if (ponteiroFino) {
      document.querySelectorAll('.magnetico').forEach((btn) => {
        const x = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' });
        const y = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' });
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * 0.3);
          y((e.clientY - r.top - r.height / 2) * 0.4);
        });
        btn.addEventListener('pointerleave', () => { x(0); y(0); });
      });
    }
    // Montador sobe levemente ao entrar
    gsap.from('.montador', {
      y: 60, ease: 'none',
      scrollTrigger: { trigger: '.contato', start: 'top bottom', end: 'top 30%', scrub: 0.8 },
    });

    // Fecho: a assinatura se escreve da esquerda para a direita, com uma "pena" de luz na ponta
    const caixa = document.querySelector('.fecho__assinatura');
    if (caixa) {
      const pena = caixa.querySelector('.fecho__pena');
      gsap.timeline({
        scrollTrigger: { trigger: '.fecho', start: 'top 80%', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true },
        defaults: { ease: 'none' },
      })
        .fromTo('.fecho__svg', { clipPath: 'inset(-30% 100% -30% -5%)' }, { clipPath: 'inset(-30% -5% -30% -5%)', duration: 1 })
        .fromTo(pena, { x: 0, autoAlpha: 1 }, { x: () => caixa.offsetWidth, duration: 1 }, 0)
        .to(pena, { keyframes: { y: [0.1, -0.22, 0.18, -0.12, 0.14, -0.05].map((v) => v * caixa.offsetHeight) }, duration: 1 }, 0)
        .to(pena, { autoAlpha: 0, duration: 0.08 });
      gsap.from('.fecho__linha', {
        autoAlpha: 0, y: 20, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.fecho__linha', start: 'top 98%', once: true },
      });
    }

    // ---------- Entradas genéricas (.reveal) ----------
    gsap.set('.reveal', { autoAlpha: 0, y: 36 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', overwrite: true }),
    });
  }

  // ---------- Storytime: versão fixa (desktop) ----------
  function historiaFixa() {
    const secao = document.querySelector('.historia');
    const caps = gsap.utils.toArray('.capitulo');
    const pontos = gsap.utils.toArray('.trilha__ponto');
    secao.classList.add('historia--pin');

    const partes = (c) => ({
      texto: c.querySelector('.capitulo__texto'),
      visual: c.querySelector('.capitulo__visual'),
      passos: c.querySelectorAll('[data-passo]'),
      traco: c.querySelector('.assinatura path'),
    });

    const inicios = [];
    const tl = gsap.timeline({ defaults: { ease: 'none' } });

    caps.forEach((cap, i) => {
      const p = partes(cap);
      inicios.push(tl.duration());
      if (i > 0) {
        const ant = partes(caps[i - 1]);
        tl.to(ant.texto, { autoAlpha: 0, y: -50, duration: 0.5 })
          .to(ant.visual, { autoAlpha: 0, y: -70, rotate: -3, scale: 0.95, duration: 0.5 }, '<')
          .fromTo(p.texto, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.15')
          .fromTo(p.visual, { autoAlpha: 0, y: 100, rotate: 3, scale: 0.95 }, { autoAlpha: 1, y: 0, rotate: 0, scale: 1, duration: 0.6 }, '<');
      }
      if (p.passos.length) tl.fromTo(p.passos, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.18 });
      if (p.traco) {
        const len = p.traco.getTotalLength();
        tl.fromTo(p.traco, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7 });
      }
      tl.addLabel(`cap${i}`).to({}, { duration: 0.7 }); // pausa para leitura
    });
    tl.fromTo('.trilha__fill', { scaleY: 0 }, { scaleY: 1, duration: tl.duration() }, 0);

    const ativar = (idx) => pontos.forEach((pt, k) => pt.classList.toggle('ativo', k <= idx));

    ScrollTrigger.create({
      animation: tl,
      trigger: '.historia__pin',
      pin: true,
      start: 'top top',
      end: () => `+=${window.innerHeight * caps.length}`,
      scrub: 0.7,
      snap: { snapTo: 'labelsDirectional', duration: { min: 0.3, max: 0.9 }, delay: 0.15, ease: 'power1.inOut' },
      invalidateOnRefresh: true,
      onUpdate: () => {
        const t = tl.time();
        let idx = 0;
        inicios.forEach((s, k) => { if (t >= s + 0.25) idx = k; });
        ativar(idx);
      },
    });

    return () => { secao.classList.remove('historia--pin'); ativar(0); };
  }

  // ---------- Storytime: versão em lista (celular / tela baixa / movimento reduzido) ----------
  function historiaModoLista(animar) {
    if (!animar) return;
    gsap.utils.toArray('.capitulo').forEach((cap) => {
      gsap.from(cap.querySelectorAll('.capitulo__texto, .capitulo__visual'), {
        autoAlpha: 0, y: 50, duration: 1, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: cap, start: 'top 82%', once: true },
      });
      const passos = cap.querySelectorAll('[data-passo]');
      if (passos.length) {
        gsap.from(passos, {
          autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.15, delay: 0.35, ease: 'power2.out',
          scrollTrigger: { trigger: cap, start: 'top 75%', once: true },
        });
      }
      const traco = cap.querySelector('.assinatura path');
      if (traco) {
        const len = traco.getTotalLength();
        gsap.fromTo(traco, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.6,
          scrollTrigger: { trigger: cap, start: 'top 70%', once: true },
        });
      }
    });
  }

  // =====================================================================
  //  Interface (roda com ou sem movimento)
  // =====================================================================
  function interface_() {
    // Header: esconde ao descer, volta ao subir
    const header = document.querySelector('.header');
    ScrollTrigger.create({
      start: 140, end: 'max',
      onUpdate: (self) => {
        const menuAberto = nav?.classList.contains('aberto');
        header.classList.toggle('header--oculto', self.direction === 1 && !menuAberto);
      },
      onToggle: (self) => {
        header.classList.toggle('header--rolado', self.isActive);
        if (!self.isActive) header.classList.remove('header--oculto');
      },
    });
    header.addEventListener('focusin', () => header.classList.remove('header--oculto'));

    // Link ativo no menu
    document.querySelectorAll('.nav a[href^="#"]:not(.btn)').forEach((a) => {
      const secao = document.querySelector(a.getAttribute('href'));
      if (!secao) return;
      ScrollTrigger.create({
        trigger: secao, start: 'top 45%', end: 'bottom 45%',
        onToggle: (self) => a.classList.toggle('ativo', self.isActive),
      });
    });

    // WhatsApp flutuante: aparece depois do hero e some no rodapé
    const whats = document.querySelector('.whats-flutuante');
    if (whats) {
      let depoisDoHero = false;
      let noRodape = false;
      const atualizar = () => whats.classList.toggle('visivel', depoisDoHero && !noRodape);
      ScrollTrigger.create({ trigger: '.hero', start: 'bottom 70%', onToggle: (s) => { depoisDoHero = s.isActive; atualizar(); }, end: 'max' });
      ScrollTrigger.create({ trigger: '#contato', start: 'top 85%', end: 'max', onToggle: (s) => { noRodape = s.isActive; atualizar(); } });
    }

    // "Voltar ao início": anel mostra o quanto da página já foi lido
    const anel = document.querySelector('.voltar__progresso');
    if (anel) {
      const total = 2 * Math.PI * 20;
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { anel.style.strokeDashoffset = total * (1 - s.progress); } });
    }
  }
})();
