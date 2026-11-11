/* Gerador de cartazes da equipe do Teatro Municipal.
   Usa o mesmo desenho do site (cartaz.js) e baixa PNG em post, story ou banner. */
function iniciarGerador() {
  'use strict';
  var form = document.querySelector('[data-gerador]');
  if (!form || !window.Cartaz) return;

  var lista = [];
  try { lista = JSON.parse(document.querySelector('[data-espetaculos]').textContent).filter(function (x) { return x && x.titulo; }); } catch (e) {}
  var geral = {};
  try { geral = JSON.parse(document.querySelector('[data-geral]').textContent); } catch (e) {}

  var tela = document.querySelector('[data-g-tela]');
  var palco = document.querySelector('[data-g-palco]');
  var aviso = document.querySelector('[data-g-aviso]');
  var legenda = document.querySelector('[data-g-legenda]');
  var seletor = form.querySelector('[data-g-espetaculo]');
  var arquivo = form.querySelector('[data-g-arquivo]');
  var fotoSite = form.querySelector('[data-g-foto-site]');

  var LEGENDAS = { post: 'Post para o feed, 1080 × 1350.', story: 'Story, 1080 × 1920. As faixas de cima e de baixo ficam livres para os botões do Instagram.', banner: 'Banner, 1920 × 1080. Serve para telão, site e capa de evento.' };
  var estado = { formato: 'post', d: Cartaz.dadosDoEspetaculo({}, geral), fotoDoSite: '', slug: 'cartaz' };
  estado.d.foto = geral.foto_padrao || '';

  // Lista de espetáculos (os que estão em cartaz vêm primeiro)
  lista.forEach(function (e, i) {
    var o = document.createElement('option');
    o.value = String(i);
    o.textContent = e.titulo + (e.data ? ' (' + e.data.split('-').reverse().join('/') + ')' : '');
    seletor.appendChild(o);
  });

  var CAMPOS_TEXTO = ['titulo', 'genero', 'companhia', 'linha1', 'linha2', 'faixa', 'classificacao'];

  function preencher() {
    CAMPOS_TEXTO.forEach(function (n) { form.elements[n].value = estado.d[n] || ''; });
    form.elements.zoom.value = estado.d.zoom || 1;
    form.elements.focoX.value = estado.d.focoX == null ? 0.5 : estado.d.focoX;
    form.elements.focoY.value = estado.d.focoY == null ? 0.5 : estado.d.focoY;
    form.elements.fotoColorida.checked = !!estado.d.fotoColorida;
    var cor = form.querySelector('input[name="cor"][value="' + (estado.d.cor || 'tijolo') + '"]');
    if (cor) cor.checked = true;
  }

  function escolher(indice) {
    var raw = lista[indice];
    if (!raw) {
      estado.d = Cartaz.dadosDoEspetaculo({}, geral);
      estado.d.foto = geral.foto_padrao || '';
      estado.fotoDoSite = estado.d.foto;
      estado.slug = 'cartaz';
    } else {
      estado.d = Cartaz.dadosDoEspetaculo(raw, geral);
      estado.fotoDoSite = estado.d.foto;
      estado.slug = raw.slug || 'cartaz';
    }
    fotoSite.hidden = true;
    arquivo.value = '';
    preencher();
    desenhar();
  }

  // Prévia do tamanho da tela, sem passar da altura da janela
  var pedido = 0;
  function desenhar() {
    var f = Cartaz.FORMATOS[estado.formato];
    var cs = getComputedStyle(palco);
    var largMax = (palco.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) || 600;
    var altMax = Math.max(320, window.innerHeight * 0.78);
    var larg = Math.min(largMax, altMax * f.w / f.h);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    tela.style.width = Math.round(larg) + 'px';
    tela.style.height = Math.round(larg * f.h / f.w) + 'px';
    var meu = ++pedido;
    Cartaz.desenhar(tela, estado.d, estado.formato, { largura: Math.round(larg * dpr) }).then(function (alerta) {
      if (meu !== pedido) return;
      aviso.textContent = alerta === 'foto-externa'
        ? 'Esta foto vem de outro site e não pode ser baixada no cartaz. Use o botão Trocar foto e envie o arquivo do seu computador.'
        : '';
    });
    legenda.textContent = LEGENDAS[estado.formato];
  }

  var agendado = false;
  function agendar() { if (!agendado) { agendado = true; requestAnimationFrame(function () { agendado = false; desenhar(); }); } }

  form.addEventListener('input', function (ev) {
    var n = ev.target.name;
    if (CAMPOS_TEXTO.indexOf(n) > -1) estado.d[n] = ev.target.value;
    else if (n === 'zoom' || n === 'focoX' || n === 'focoY') estado.d[n] = parseFloat(ev.target.value);
    else if (n === 'fotoColorida') estado.d.fotoColorida = ev.target.checked;
    else if (n === 'cor') estado.d.cor = ev.target.value;
    else if (n === 'formato') estado.formato = ev.target.value;
    else return;
    agendar();
  });
  form.addEventListener('change', function (ev) {
    if (ev.target === seletor) escolher(seletor.value === '' ? -1 : +seletor.value);
    if (ev.target.name === 'formato' || ev.target.name === 'cor' || ev.target.name === 'fotoColorida' || ev.target.name === 'classificacao') {
      if (ev.target.name === 'formato') estado.formato = ev.target.value;
      if (ev.target.name === 'cor') estado.d.cor = ev.target.value;
      if (ev.target.name === 'classificacao') estado.d.classificacao = ev.target.value;
      if (ev.target.name === 'fotoColorida') estado.d.fotoColorida = ev.target.checked;
      agendar();
    }
  });

  arquivo.addEventListener('change', function () {
    var f = arquivo.files && arquivo.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { aviso.textContent = 'Esse arquivo não é uma imagem. Escolha uma foto em JPG ou PNG.'; return; }
    estado.d.foto = URL.createObjectURL(f);
    estado.d.zoom = 1; estado.d.focoX = 0.5; estado.d.focoY = 0.5;
    fotoSite.hidden = !estado.fotoDoSite;
    preencher();
    desenhar();
  });
  fotoSite.addEventListener('click', function () {
    estado.d.foto = estado.fotoDoSite;
    fotoSite.hidden = true;
    arquivo.value = '';
    desenhar();
  });

  function baixar(formato) {
    var c = document.createElement('canvas');
    return Cartaz.desenhar(c, estado.d, formato, {}).then(function () {
      return new Promise(function (ok, erro) {
        try {
          c.toBlob(function (blob) {
            if (!blob) { erro(new Error('vazio')); return; }
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'cartaz-' + estado.slug + '-' + formato + '.png';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
            ok();
          }, 'image/png');
        } catch (e) { erro(e); }
      });
    });
  }
  function falhou() {
    aviso.textContent = 'Não consegui gerar o arquivo com essa foto. Use o botão Trocar foto e envie a imagem do seu computador.';
  }
  form.querySelector('[data-g-baixar]').addEventListener('click', function () {
    aviso.textContent = 'Gerando o cartaz…';
    baixar(estado.formato).then(function () { aviso.textContent = 'Cartaz baixado.'; }, falhou);
  });
  form.querySelector('[data-g-baixar-todos]').addEventListener('click', function () {
    aviso.textContent = 'Gerando os três formatos…';
    baixar('post').then(function () { return baixar('story'); }).then(function () { return baixar('banner'); })
      .then(function () { aviso.textContent = 'Os três cartazes foram baixados.'; }, falhou);
  });

  window.addEventListener('resize', agendar);

  // Começa pelo primeiro espetáculo em cartaz, ou pelo indicado no endereço (#nome-do-espetaculo)
  var inicial = 0;
  var hash = decodeURIComponent((location.hash || '').slice(1));
  if (hash) lista.forEach(function (e, i) { if (e.slug === hash) inicial = i; });
  if (lista.length) { seletor.value = String(inicial); escolher(inicial); }
  else escolher(-1);
}
// cartaz.js é carregado no fim da página; espera tudo estar pronto
if (window.Cartaz) iniciarGerador();
else document.addEventListener('DOMContentLoaded', iniciarGerador);
