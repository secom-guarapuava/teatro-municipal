/* Teatro Municipal de Guarapuava — comportamento do site
   Sem dependências. Tudo funciona sem JavaScript; aqui entram a luz,
   os três sinais, o calendário e as informações que mudam com a data. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  /* ---------- Datas (sempre no horário de Guarapuava) ---------- */
  function hojeISO() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function partes(iso) { var p = iso.split('-'); return { a: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function dataUTC(iso) { var p = partes(iso); return new Date(Date.UTC(p.a, p.m, p.d)); }
  function diaDaSemana(iso) { return dataUTC(iso).getUTCDay(); }
  function diasEntre(a, b) { return Math.round((dataUTC(b) - dataUTC(a)) / 86400000); }
  function dataExtenso(iso, comSemana) {
    var p = partes(iso);
    var t = p.d + ' de ' + MESES[p.m];
    return comSemana ? DIAS[diaDaSemana(iso)] + ', ' + t : t;
  }
  function maiuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var HOJE = hojeISO();

  /* ---------- Topo e menu ---------- */
  var topo = document.querySelector('[data-topo]');
  if (topo) {
    var marcarTopo = function () { topo.classList.toggle('is-rolado', window.scrollY > 24); };
    marcarTopo();
    window.addEventListener('scroll', marcarTopo, { passive: true });
  }

  var botaoMenu = document.querySelector('[data-menu-botao]');
  var menu = document.querySelector('[data-menu]');
  if (botaoMenu && menu) {
    var fecharMenu = function () {
      botaoMenu.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-aberto');
      doc.classList.remove('menu-aberto');
      botaoMenu.querySelector('.topo__abrir-texto').textContent = 'Menu';
    };
    botaoMenu.addEventListener('click', function () {
      var abrir = botaoMenu.getAttribute('aria-expanded') !== 'true';
      if (!abrir) return fecharMenu();
      botaoMenu.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-aberto');
      doc.classList.add('menu-aberto');
      botaoMenu.querySelector('.topo__abrir-texto').textContent = 'Fechar';
      var primeiro = menu.querySelector('a');
      if (primeiro) primeiro.focus();
    });
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) fecharMenu(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.classList.contains('is-aberto')) { fecharMenu(); botaoMenu.focus(); }
    });
  }

  /* ---------- Três sinais ---------- */
  var sinaisFim = new Promise(function (resolver) {
    var sinais = document.querySelector('[data-sinais]');
    if (!sinais || !doc.classList.contains('com-sinais')) { resolver(); return; }
    try { sessionStorage.setItem('tm-sinais', '1'); } catch (e) {}

    var lampadas = sinais.querySelectorAll('.sinais__lampadas span');
    var texto = sinais.querySelector('[data-sinais-texto]');
    var frases = ['Primeiro sinal', 'Segundo sinal', 'Terceiro sinal. Vai começar.'];
    var timers = [];
    var saindo = false;

    function acender(i) {
      lampadas[i].classList.add('is-aceso');
      texto.textContent = frases[i];
    }
    function sair() {
      if (saindo) return;
      saindo = true;
      timers.forEach(clearTimeout);
      for (var i = 0; i < lampadas.length; i++) lampadas[i].classList.add('is-aceso');
      sinais.classList.add('is-saindo');
      resolver();
      setTimeout(function () {
        doc.classList.remove('com-sinais');
        sinais.remove();
      }, 1150);
      document.removeEventListener('keydown', sair);
    }
    texto.textContent = '';
    timers.push(setTimeout(function () { acender(0); }, 300));
    timers.push(setTimeout(function () { acender(1); }, 1000));
    timers.push(setTimeout(function () { acender(2); }, 1700));
    timers.push(setTimeout(sair, 2700));
    sinais.addEventListener('click', sair);
    document.addEventListener('keydown', sair);
  });

  /* ---------- Abertura: poeira dourada no raio de sol da foto ---------- */
  var palco = document.querySelector('[data-palco]');
  var canvasPoeira = palco && palco.querySelector('[data-poeira]');
  if (canvasPoeira && !calmo && canvasPoeira.getContext) {
    var ctxP = canvasPoeira.getContext('2d');
    var largP = 0, altP = 0, dprP = 1, graos = [], visivelP = true;
    var SOL = { x: 0.9, y: 0.12 };
    var novoGrao = function (qualquer) {
      return {
        x: Math.random() * largP, y: qualquer ? Math.random() * altP : altP + 8,
        r: 0.5 + Math.random() * 1.6, vx: -(0.05 + Math.random() * 0.22), vy: -(0.02 + Math.random() * 0.12), f: Math.random() * 6.28
      };
    };
    var medirP = function () {
      var r = palco.getBoundingClientRect();
      largP = r.width; altP = r.height; dprP = Math.min(window.devicePixelRatio || 1, 2);
      canvasPoeira.width = Math.round(largP * dprP); canvasPoeira.height = Math.round(altP * dprP);
      graos = [];
      var n = Math.min(140, Math.round(largP * altP / 12000));
      for (var i = 0; i < n; i++) graos.push(novoGrao(true));
    };
    var quadroP = function () {
      if (!visivelP || document.hidden) return;
      ctxP.setTransform(dprP, 0, 0, dprP, 0, 0);
      ctxP.clearRect(0, 0, largP, altP);
      var sx = SOL.x * largP, sy = SOL.y * altP, alcance = Math.max(largP, altP) * 0.75;
      for (var i = 0; i < graos.length; i++) {
        var g = graos[i];
        g.x += g.vx; g.y += g.vy; g.f += 0.015;
        if (g.y < -10 || g.x < -10) graos[i] = g = novoGrao(false);
        var d = Math.hypot(g.x - sx, g.y - sy) / alcance;
        if (d >= 1) continue;
        var a = Math.pow(1 - d, 1.6) * (0.45 + 0.35 * Math.sin(g.f));
        ctxP.fillStyle = 'rgba(255, 240, 210,' + a.toFixed(3) + ')';
        ctxP.beginPath(); ctxP.arc(g.x, g.y, g.r, 0, 6.2832); ctxP.fill();
      }
      requestAnimationFrame(quadroP);
    };
    medirP();
    window.addEventListener('resize', medirP);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visivelP = en[0].isIntersecting; if (visivelP) requestAnimationFrame(quadroP); }).observe(palco);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) requestAnimationFrame(quadroP); });
    sinaisFim.then(function () { requestAnimationFrame(quadroP); });
  }

  /* ---------- Cartazes desenhados (cartaz.js) ---------- */
  var geral = {};
  try { geral = JSON.parse((document.querySelector('[data-geral]') || {}).textContent || '{}'); } catch (e) {}
  var telas = Array.prototype.slice.call(document.querySelectorAll('canvas[data-cartaz]'));
  if (telas.length && window.Cartaz) {
    var desenharTela = function (c) {
      var larg = c.clientWidth;
      if (!larg) return;
      var alvo = Math.round(larg * Math.min(window.devicePixelRatio || 1, 2));
      if (c._largura && Math.abs(c._largura - alvo) < alvo * 0.1) return;
      c._largura = alvo;
      var raw;
      try { raw = JSON.parse(c.dataset.cartaz); } catch (e) { return; }
      window.Cartaz.desenhar(c, window.Cartaz.dadosDoEspetaculo(raw, geral), 'post', { largura: alvo }).then(function () {
        c.style.width = ''; c.style.height = '';
      });
    };
    if ('IntersectionObserver' in window) {
      var obsTelas = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) desenharTela(x.target); });
      }, { rootMargin: '400px 400px' });
      telas.forEach(function (c) { obsTelas.observe(c); });
    } else telas.forEach(desenharTela);
    var tempoTelas;
    window.addEventListener('resize', function () {
      clearTimeout(tempoTelas);
      tempoTelas = setTimeout(function () { telas.forEach(function (c) { if (c._largura) desenharTela(c); }); }, 250);
    });
  }

  /* ---------- Próximo espetáculo no palco e listas em cartaz ---------- */
  var proximos = document.querySelectorAll('[data-proximo]');
  if (proximos.length) {
    var mostrou = false;
    proximos.forEach(function (a) {
      var valido = a.dataset.fim >= HOJE;
      a.hidden = mostrou || !valido;
      if (valido && !mostrou) mostrou = true;
    });
  }

  document.querySelectorAll('.programa__item[data-fim], .vitrine__item[data-fim]').forEach(function (li) {
    if (li.dataset.fim < HOJE) li.classList.add('is-encerrada');
  });

  function conferirVazio(lista) {
    var vazio = lista.closest('.envelope') && lista.closest('.envelope').querySelector('[data-sessoes-vazio]');
    if (!vazio) return;
    var algum = Array.prototype.some.call(lista.querySelectorAll('.programa__item, .vitrine__item'), function (li) {
      return !li.classList.contains('is-encerrada') && !li.classList.contains('is-filtrada');
    });
    vazio.hidden = algum;
  }
  document.querySelectorAll('[data-sessoes], [data-vitrine-trilho]').forEach(conferirVazio);

  /* Filtros por linguagem na programação */
  var filtros = document.querySelector('[data-filtros]');
  if (filtros) {
    var lista = document.querySelector('[data-sessoes]');
    var aviso = document.querySelector('[data-filtro-vazio]');
    filtros.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-filtro]');
      if (!b) return;
      filtros.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var g = b.dataset.filtro;
      lista.querySelectorAll('.programa__item').forEach(function (li) {
        li.classList.toggle('is-filtrada', g !== '' && li.dataset.genero !== g);
      });
      conferirVazio(lista);
      if (aviso) aviso.textContent = g ? 'Mostrando: ' + g + '.' : 'Mostrando todos os espetáculos.';
    });
  }

  /* Página de um espetáculo que já aconteceu */
  var artigo = document.querySelector('[data-espetaculo]');
  if (artigo && artigo.dataset.fim && artigo.dataset.fim < HOJE) {
    artigo.querySelectorAll('[data-so-futuro]').forEach(function (el) { el.hidden = true; });
    var nota = artigo.querySelector('[data-passou]');
    if (nota) nota.hidden = false;
  }

  /* Copiar link */
  document.querySelectorAll('[data-copiar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = window.location.href;
      var ok = function () {
        var antes = b.textContent;
        b.textContent = 'Link copiado';
        setTimeout(function () { b.textContent = antes; }, 2200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, function () {});
    });
  });

  /* ---------- Vitrine de cartazes: corre sozinha, para quando a pessoa interage ---------- */
  document.querySelectorAll('[data-vitrine]').forEach(function (vit) {
    var trilho = vit.querySelector('[data-vitrine-trilho]');
    var secao = vit.closest('section');
    var controles = secao && secao.querySelector('[data-vitrine-controles]');
    if (!trilho) return;
    var anterior = controles && controles.querySelector('[data-vitrine-anterior]');
    var seguinte = controles && controles.querySelector('[data-vitrine-seguinte]');
    var passo = function () {
      var item = trilho.querySelector('.vitrine__item:not(.is-encerrada)');
      return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(trilho).columnGap || 24) : 300;
    };
    var noFim = function () { return trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4; };
    var atualizar = function () {
      var sobra = trilho.scrollWidth > trilho.clientWidth + 4;
      if (controles) controles.hidden = !sobra;
      if (anterior) anterior.disabled = trilho.scrollLeft <= 2;
      if (seguinte) seguinte.disabled = noFim();
    };
    var mover = function (dir) { trilho.scrollBy({ left: dir * passo(), behavior: calmo ? 'auto' : 'smooth' }); };
    if (anterior) anterior.addEventListener('click', function () { pausar(); mover(-1); });
    if (seguinte) seguinte.addEventListener('click', function () { pausar(); mover(1); });
    trilho.addEventListener('scroll', function () { requestAnimationFrame(atualizar); }, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();

    // passa sozinha a cada 4,5 s; para com mouse em cima, foco, toque ou fora da tela
    if (calmo) return;
    var parado = false, visivel = false, retomar;
    function pausar() { parado = true; clearTimeout(retomar); retomar = setTimeout(function () { parado = false; }, 9000); }
    ['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (ev) { trilho.addEventListener(ev, pausar, { passive: true }); });
    trilho.addEventListener('mouseenter', function () { parado = true; clearTimeout(retomar); });
    trilho.addEventListener('mouseleave', function () { parado = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visivel = en[0].isIntersecting; }, { threshold: 0.4 }).observe(trilho);
    setInterval(function () {
      if (parado || !visivel || document.hidden || trilho.scrollWidth <= trilho.clientWidth + 4) return;
      if (noFim()) trilho.scrollTo({ left: 0, behavior: 'smooth' }); else mover(1);
    }, 4500);
  });

  /* ---------- Entreatos: a frase acende quando o refletor chega ---------- */
  var frasesJSON = document.querySelector('[data-frases]');
  var entreatos = Array.prototype.slice.call(document.querySelectorAll('[data-entreato]'));
  if (frasesJSON && entreatos.length) {
    try {
      var frases = JSON.parse(frasesJSON.textContent).filter(function (f) { return f && f.texto; });
      // embaralha para cada visita trazer frases diferentes
      for (var i = frases.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = frases[i]; frases[i] = frases[j]; frases[j] = tmp;
      }
      entreatos.forEach(function (el, k) {
        var f = frases[k % frases.length];
        if (!f) return;
        el.querySelector('[data-frase-texto]').textContent = f.texto;
        el.querySelector('[data-frase-autor]').textContent = f.autor || '';
        el.querySelector('[data-frase-obra]').textContent = f.obra || '';
        el.classList.toggle('entreato--longa', f.texto.length > 110);
      });
    } catch (e) {}
  }

  if (entreatos.length && !calmo) {
    var pedido = false;
    var facilitar = function (p) { return 1 - Math.pow(1 - p, 3); };
    var iluminar = function () {
      pedido = false;
      var vh = window.innerHeight;
      entreatos.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var centro = r.top + r.height / 2;
        var p = Math.max(0, Math.min(1, (vh - centro) / (vh * 0.5)));
        var e = facilitar(p);
        el.style.setProperty('--lx', (-30 + e * 70).toFixed(2) + '%');
        el.style.setProperty('--raio', (6 + e * 152).toFixed(2) + '%');
        // o ciclorama acende um pouco antes de a frase terminar de acender
        el.style.setProperty('--acende', facilitar(Math.min(1, p * 1.15)).toFixed(3));
      });
    };
    var agendar = function () { if (!pedido) { pedido = true; requestAnimationFrame(iluminar); } };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    iluminar();
  }

  /* ---------- Cai o pano: a cortina desce quando o rodapé aparece ---------- */
  var pano = document.querySelector('[data-pano]');
  if (pano) {
    if (calmo || !('IntersectionObserver' in window)) {
      pano.classList.add('is-caiu');
    } else {
      // observa o rodapé (a cortina recortada não conta como visível para o observador)
      new IntersectionObserver(function (entradas, obs) {
        if (entradas[0].isIntersecting) { pano.classList.add('is-caiu'); obs.disconnect(); }
      }, { rootMargin: '0px 0px -25% 0px' }).observe(pano.parentNode);
    }
  }

  /* ---------- Pautas: a etapa do credenciamento muda sozinha com a data ---------- */
  document.querySelectorAll('[data-pautas]').forEach(function (bloco) {
    var d = bloco.dataset;
    if (!d.abertura || !d.encerramento) return;
    var frase = bloco.querySelector('[data-pautas-frase]');
    var detalhe = bloco.querySelector('[data-pautas-detalhe]');
    var acoes = bloco.querySelector('[data-pautas-acoes]');
    var form = acoes && acoes.querySelector('[data-pautas-form]');
    var passo = 4, proximo = 0;

    if (HOJE < d.abertura) {
      var faltam = diasEntre(HOJE, d.abertura);
      frase.textContent = 'O credenciamento da temporada ' + d.temporada + ' abre em ' + dataExtenso(d.abertura) + '.';
      var contagem = document.createElement('p');
      contagem.className = 'pautas-status__contagem';
      contagem.textContent = faltam === 1 ? 'Falta 1 dia' : 'Faltam ' + faltam + ' dias';
      frase.parentNode.insertBefore(contagem, frase.nextSibling);
      passo = 4; proximo = 1;
      if (form) form.remove();
      if (acoes) {
        var desligado = document.createElement('span');
        desligado.className = 'ingresso ingresso--desligado';
        desligado.textContent = 'Formulário abre em ' + dataExtenso(d.abertura);
        acoes.insertBefore(desligado, acoes.firstChild);
      }
    } else if (HOJE <= d.encerramento) {
      passo = 1;
      frase.textContent = 'Credenciamento aberto. As inscrições para a temporada ' + d.temporada + ' vão até ' + dataExtenso(d.encerramento) + '.';
      detalhe.textContent = 'Faça o credenciamento pelo formulário online e escolha a data em que quer usar o teatro.';
      if (!form && acoes) {
        var aguarde = document.createElement('p');
        aguarde.textContent = 'O link do formulário aparece aqui assim que for publicado.';
        acoes.insertBefore(aguarde, acoes.firstChild);
      }
    } else if (!d.resultado || HOJE < d.resultado) {
      passo = 2;
      frase.textContent = 'Inscrições encerradas. O resultado sai em ' + (d.resultadoTexto || 'breve') + '.';
      detalhe.textContent = 'A Secretaria de Cultura está analisando os pedidos da temporada ' + d.temporada + '.';
      if (form) form.remove();
    } else if (d.readequacao && HOJE <= d.readequacao) {
      passo = 3;
      frase.textContent = 'Resultado publicado. Até ' + dataExtenso(d.readequacao) + ', quem não conseguiu a data pedida escolhe uma nova.';
      detalhe.textContent = 'As datas que ficaram disponíveis estão listadas nesta página.';
      if (form) form.remove();
    } else {
      passo = 4;
      frase.textContent = 'As datas que sobraram da temporada ' + d.temporada + ' podem ser pedidas ao longo do ano.';
      if (form) form.remove();
    }

    var fluxo = bloco.parentNode.querySelector('[data-fluxo]') || document.querySelector('[data-fluxo]');
    if (fluxo) {
      fluxo.querySelectorAll('[data-passo]').forEach(function (li) {
        var n = +li.dataset.passo;
        li.classList.toggle('is-aceso', n === passo);
        li.classList.toggle('is-proximo', n === proximo);
        if (n === passo) li.setAttribute('aria-current', 'step');
        var marca = li.querySelector('.fluxo__marca');
        if (marca) marca.remove();
        if (n === passo || n === proximo) {
          marca = document.createElement('span');
          marca.className = 'fluxo__marca';
          marca.textContent = n === passo ? 'Agora' : 'Abre em ' + dataExtenso(d.abertura);
          li.insertBefore(marca, li.querySelector('.fluxo__titulo'));
        }
      });
    }
  });

  /* ---------- Calendário de datas livres ---------- */
  var cal = document.querySelector('[data-calendario]');
  var fonte = document.querySelector('[data-datas-livres]');
  if (cal && fonte) {
    var livres = {};
    var lista = [];
    try { lista = JSON.parse(fonte.textContent); } catch (e) {}
    lista.forEach(function (x) { if (x && x.data && x.data >= HOJE) livres[x.data] = x; });
    var chaves = Object.keys(livres).sort();

    var h = partes(HOJE);
    var minimo = h.a * 12 + h.m;
    var maximo = chaves.length ? (function () { var u = partes(chaves[chaves.length - 1]); return u.a * 12 + u.m; })() : minimo;
    var atual = chaves.length ? (function () { var f = partes(chaves[0]); return f.a * 12 + f.m; })() : minimo;

    var titulo = cal.querySelector('[data-cal-mes]');
    var grade = cal.querySelector('[data-cal-grade]');
    var detalheCal = cal.querySelector('[data-cal-detalhe]');
    var anterior = cal.querySelector('[data-cal-anterior]');
    var seguinte = cal.querySelector('[data-cal-seguinte]');
    var periodoFrase = { 'Noite': 'no período da noite', 'Tarde': 'no período da tarde', 'Manhã': 'no período da manhã', 'Dia inteiro': 'o dia inteiro' };
    var textoPadrao = chaves.length ? 'Escolha uma data acesa para ver os detalhes.' : 'Não há datas livres no momento.';

    var desenhar = function () {
      var ano = Math.floor(atual / 12), mes = atual % 12;
      titulo.textContent = MESES[mes] + ' de ' + ano;
      anterior.disabled = atual <= minimo;
      seguinte.disabled = atual >= maximo;
      grade.innerHTML = '';
      DIAS_CURTOS.forEach(function (n) {
        var c = document.createElement('span');
        c.className = 'calendario__semana';
        c.setAttribute('aria-hidden', 'true');
        c.textContent = n;
        grade.appendChild(c);
      });
      var primeiroDia = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
      var total = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
      for (var b = 0; b < primeiroDia; b++) {
        var vazio = document.createElement('span');
        vazio.setAttribute('aria-hidden', 'true');
        grade.appendChild(vazio);
      }
      for (var dia = 1; dia <= total; dia++) {
        var iso = ano + '-' + pad(mes + 1) + '-' + pad(dia);
        var info = livres[iso];
        var el;
        if (info) {
          el = document.createElement('button');
          el.type = 'button';
          el.className = 'calendario__dia calendario__dia--livre';
          el.setAttribute('aria-pressed', 'false');
          el.setAttribute('aria-label', dataExtenso(iso, true) + ', data livre' + (info.periodo ? ', ' + info.periodo.toLowerCase() : ''));
          el.dataset.iso = iso;
        } else {
          el = document.createElement('span');
          el.className = 'calendario__dia' + (iso < HOJE ? ' calendario__dia--passado' : '');
          el.setAttribute('aria-hidden', 'true');
        }
        if (iso === HOJE) el.classList.add('calendario__dia--hoje');
        el.textContent = dia;
        grade.appendChild(el);
      }
      detalheCal.textContent = textoPadrao;
    };

    grade.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-iso]');
      if (!b) return;
      grade.querySelectorAll('button[aria-pressed="true"]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      var info = livres[b.dataset.iso];
      var quando = maiuscula(dataExtenso(b.dataset.iso, true));
      var periodo = info.periodo ? (periodoFrase[info.periodo] || info.periodo.toLowerCase()) : '';
      detalheCal.innerHTML = '';
      var forte = document.createElement('strong');
      forte.textContent = quando + '.';
      detalheCal.appendChild(forte);
      detalheCal.appendChild(document.createTextNode(' Livre' + (periodo ? ' ' + periodo : '') + '.' + (info.obs ? ' ' + info.obs + '.' : '')));
    });
    anterior.addEventListener('click', function () { if (atual > minimo) { atual--; desenhar(); } });
    seguinte.addEventListener('click', function () { if (atual < maximo) { atual++; desenhar(); } });

    cal.hidden = false;
    desenhar();
  }
})();
