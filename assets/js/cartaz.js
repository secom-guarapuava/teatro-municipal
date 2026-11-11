/* Cartaz padrão do Teatro Municipal de Guarapuava
   Um só desenho para o site e para o gerador da equipe (post, story e banner).
   Estilo de cartaz clássico de teatro: papel, tinta preta, uma cor de destaque,
   moldura de filetes e a foto dentro de um arco, como as janelas da fachada. */
(function (global) {
  'use strict';

  var PAPEL = '#efe2c6';
  var PAPEL_CLARO = '#f7eedb';
  var TINTA = '#1c1612';
  var CORES = { tijolo: '#b3361f', ambar: '#a86a12', vinho: '#7a1f2b' };
  var FORMATOS = {
    post: { w: 1080, h: 1350, nome: 'Post (1080 × 1350)' },
    story: { w: 1080, h: 1920, nome: 'Story (1080 × 1920)' },
    banner: { w: 1920, h: 1080, nome: 'Banner (1920 × 1080)' }
  };
  // Classificação indicativa: cores oficiais do ClassInd
  var CLASSIND = {
    'Livre': ['L', '#0f9d58'], '10 anos': ['10', '#1a8fd6'], '12 anos': ['12', '#f2b705'],
    '14 anos': ['14', '#ea6a1c'], '16 anos': ['16', '#d7191c'], '18 anos': ['18', '#111111']
  };
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  var F = {
    titulo: function (s) { return '800 ' + s + 'px "Bodoni Moda", Didot, serif'; },
    gotica: function (s) { return '400 ' + s + 'px "League Gothic", "Arial Narrow", sans-serif'; },
    italico: function (s) { return 'italic 400 ' + s + 'px "Newsreader", Georgia, serif'; },
    texto: function (s) { return '500 ' + s + 'px "Hanken Grotesk", system-ui, sans-serif'; }
  };

  /* ---------- Carregamento ---------- */
  var fontes = null;
  function carregarFontes() {
    if (fontes) return fontes;
    if (!document.fonts || !document.fonts.load) return (fontes = Promise.resolve());
    fontes = Promise.all([
      document.fonts.load(F.titulo(100)),
      document.fonts.load(F.gotica(60)),
      document.fonts.load(F.italico(40)),
      document.fonts.load(F.texto(30))
    ]).catch(function () {});
    return fontes;
  }

  var imagens = {};
  function carregarImagem(src) {
    if (!src) return Promise.resolve(null);
    if (typeof src !== 'string') return Promise.resolve(src);
    if (!imagens[src]) {
      imagens[src] = new Promise(function (ok) {
        var im = new Image();
        if (/^https?:/.test(src) && src.indexOf(location.origin) !== 0) im.crossOrigin = 'anonymous';
        im.onload = function () { ok(im); };
        im.onerror = function () { ok(null); };
        im.src = src;
      });
    }
    return imagens[src];
  }

  /* ---------- Textos a partir dos dados do espetáculo ---------- */
  function hora(h) {
    if (!h) return '';
    var p = String(h).split(':');
    var hh = parseInt(p[0], 10);
    if (isNaN(hh)) return String(h).toUpperCase();
    return hh + 'H' + (p[1] && p[1] !== '00' ? p[1] : '');
  }
  function partes(iso) { var p = String(iso).slice(0, 10).split('-'); return { a: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function semana(iso) { var p = partes(iso); return new Date(Date.UTC(p.a, p.m, p.d)).getUTCDay(); }
  function listaE(itens) { return itens.length < 2 ? itens.join('') : itens.slice(0, -1).join(', ') + ' E ' + itens[itens.length - 1]; }

  function datas(raw) {
    var s = [{ data: raw.data, horario: raw.horario }].concat(raw.sessoes_extras || []).filter(function (x) { return x && x.data; });
    s.sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
    if (!s.length) return { linha1: '', linha2: '' };
    var mesmoDia = s.every(function (x) { return String(x.data).slice(0, 10) === String(s[0].data).slice(0, 10); });
    if (mesmoDia) {
      var w0 = semana(s[0].data), p0 = partes(s[0].data);
      return {
        linha1: p0.d + ' DE ' + MESES[p0.m].toUpperCase(),
        linha2: (DIAS[w0] + (w0 > 0 && w0 < 6 ? '-FEIRA' : '') + ' ÀS ' + listaE(s.map(function (x) { return hora(x.horario); }))).toUpperCase()
      };
    }
    var mesmoMes = s.every(function (x) { var p = partes(x.data), q = partes(s[0].data); return p.m === q.m && p.a === q.a; });
    var linha1;
    if (s.length === 1) linha1 = partes(s[0].data).d + ' DE ' + MESES[partes(s[0].data).m].toUpperCase();
    else if (mesmoMes) linha1 = listaE(s.map(function (x) { return String(partes(x.data).d); })) + ' DE ' + MESES[partes(s[0].data).m].toUpperCase();
    else linha1 = listaE(s.map(function (x) { var p = partes(x.data); return p.d + '/' + ('0' + (p.m + 1)).slice(-2); }));
    var linha2;
    if (s.length === 1) linha2 = (DIAS[semana(s[0].data)] + (semana(s[0].data) > 0 && semana(s[0].data) < 6 ? '-FEIRA' : '') + ' ÀS ' + hora(s[0].horario)).toUpperCase();
    else linha2 = s.slice(0, 3).map(function (x) { return (DIAS_CURTOS[semana(x.data)] + ' ' + hora(x.horario)).toUpperCase(); }).join('  •  ');
    return { linha1: linha1, linha2: linha2 };
  }

  function faixaPadrao(tipo) {
    var t = String(tipo || '').toLowerCase();
    if (t.indexOf('retirada') > -1) return 'ENTRADA GRATUITA  •  RETIRE SEU INGRESSO';
    if (t.indexOf('franca') > -1) return 'ENTRADA FRANCA';
    if (t.indexOf('solid') > -1) return 'INGRESSO SOLIDÁRIO';
    if (t.indexOf('pago') > -1) return 'INGRESSOS À VENDA';
    return t ? String(tipo).toUpperCase() : '';
  }

  function corDe(nome) {
    var n = String(nome || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (n.indexOf('ambar') > -1 || n.indexOf('ocre') > -1) return 'ambar';
    if (n.indexOf('vinho') > -1) return 'vinho';
    return 'tijolo';
  }

  function dadosDoEspetaculo(raw, geral) {
    raw = raw || {}; geral = geral || {};
    var d = datas(raw);
    var posicao = { 'Acima': 0.2, 'Abaixo': 0.8 }[raw.foto_posicao] || 0.5;
    return {
      titulo: raw.titulo || '',
      genero: (raw.genero || '').toUpperCase(),
      companhia: raw.companhia ? 'com ' + raw.companhia : '',
      linha1: d.linha1,
      linha2: d.linha2,
      faixa: raw.cartaz_faixa || faixaPadrao(raw.ingresso_tipo),
      classificacao: raw.classificacao || '',
      foto: raw.imagem || geral.foto_padrao || '',
      fotoColorida: raw.foto_cor === true || raw.foto_cor === 'true',
      focoX: 0.5,
      focoY: posicao,
      zoom: 1,
      cor: corDe(raw.cor_luz),
      local1: 'TEATRO MUNICIPAL ' + String(geral.nome_teatro || 'DE GUARAPUAVA').toUpperCase(),
      local2: [geral.endereco, 'Guarapuava (PR)'].filter(Boolean).join(' – '),
      logo: geral.logo_apoio || '',
      apoioTexto: geral.texto_apoio || 'apoio:'
    };
  }

  /* ---------- Desenho ---------- */
  function espaco(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  function quebrar(ctx, texto, larguraMax) {
    var palavras = String(texto).split(/\s+/).filter(Boolean);
    var linhas = [], atual = '';
    palavras.forEach(function (p) {
      var teste = atual ? atual + ' ' + p : p;
      if (ctx.measureText(teste).width <= larguraMax || !atual) atual = teste;
      else { linhas.push(atual); atual = p; }
    });
    if (atual) linhas.push(atual);
    return linhas;
  }

  function ajustar(ctx, texto, fonte, larguraMax, maxLinhas, maior, menor, espacamento) {
    for (var t = maior; t >= menor; t -= 2) {
      ctx.font = fonte(t); espaco(ctx, espacamento ? espacamento(t) : 0);
      var linhas = quebrar(ctx, texto, larguraMax);
      var cabe = linhas.length <= maxLinhas && linhas.every(function (l) { return ctx.measureText(l).width <= larguraMax; });
      if (cabe) {
        // equilibra as linhas (evita uma palavra sozinha na última linha)
        if (linhas.length > 1) {
          var lo = larguraMax * 0.4, hi = larguraMax;
          for (var k = 0; k < 14; k++) {
            var meio = (lo + hi) / 2;
            if (quebrar(ctx, texto, meio).length <= linhas.length && quebrar(ctx, texto, meio).every(function (l) { return ctx.measureText(l).width <= larguraMax; })) hi = meio; else lo = meio;
          }
          var eq = quebrar(ctx, texto, hi);
          if (eq.length === linhas.length) linhas = eq;
        }
        return { tamanho: t, linhas: linhas };
      }
    }
    ctx.font = fonte(menor); espaco(ctx, espacamento ? espacamento(menor) : 0);
    return { tamanho: menor, linhas: quebrar(ctx, texto, larguraMax).slice(0, maxLinhas) };
  }

  function escrever(ctx, texto, x, y, fonte, cor, alinhamento, espacamento) {
    ctx.font = fonte; ctx.fillStyle = cor; ctx.textAlign = alinhamento || 'center'; ctx.textBaseline = 'alphabetic';
    espaco(ctx, espacamento || 0);
    ctx.fillText(texto, x, y);
    espaco(ctx, 0);
  }

  function caminhoArco(ctx, x, y, w, h) {
    var r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  function losango(ctx, cx, cy, r, cor) {
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath();
    ctx.fillStyle = cor; ctx.fill();
  }

  function regua(ctx, x1, x2, y, cor) {
    var cx = (x1 + x2) / 2;
    ctx.strokeStyle = cor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(cx - 18, y); ctx.moveTo(cx + 18, y); ctx.lineTo(x2, y); ctx.stroke();
    losango(ctx, cx, y, 8, cor);
    losango(ctx, x1, y, 4, cor); losango(ctx, x2, y, 4, cor);
  }

  var texturaPapel = null;
  function papel(ctx, W, H) {
    ctx.fillStyle = PAPEL; ctx.fillRect(0, 0, W, H);
    if (!texturaPapel) {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g = c.getContext('2d'), img = g.createImageData(256, 256);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = 120 + Math.random() * 100;
        img.data[i] = v; img.data[i + 1] = v * 0.92; img.data[i + 2] = v * 0.8; img.data[i + 3] = Math.random() * 38;
      }
      g.putImageData(img, 0, 0);
      texturaPapel = c;
    }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5;
    ctx.fillStyle = ctx.createPattern(texturaPapel, 'repeat'); ctx.fillRect(0, 0, W, H);
    ctx.restore();
    var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(120,80,30,0)'); v.addColorStop(1, 'rgba(120,80,30,0.22)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function moldura(ctx, W, H, cor) {
    ctx.strokeStyle = TINTA; ctx.lineWidth = 6; ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.lineWidth = 1.6; ctx.strokeRect(46, 46, W - 92, H - 92);
    [[46, 46], [W - 46, 46], [46, H - 46], [W - 46, H - 46]].forEach(function (p) { losango(ctx, p[0], p[1], 9, cor); });
  }

  // A foto vira duas cores (tinta sobre papel), como num cartaz impresso
  function foto(ctx, escala, img, x, y, w, h, d, cor) {
    ctx.save();
    caminhoArco(ctx, x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#2a221c'; ctx.fillRect(x, y, w, h);
    if (img) {
      var pw = Math.max(1, Math.round(w * escala)), ph = Math.max(1, Math.round(h * escala));
      var off = document.createElement('canvas'); off.width = pw; off.height = ph;
      var o = off.getContext('2d');
      var z = Math.max(pw / img.width, ph / img.height) * (d.zoom || 1);
      var dw = img.width * z, dh = img.height * z;
      o.drawImage(img, (pw - dw) * (d.focoX == null ? 0.5 : d.focoX), (ph - dh) * (d.focoY == null ? 0.5 : d.focoY), dw, dh);
      try {
        if (!d.fotoColorida) {
          var px = o.getImageData(0, 0, pw, ph), a = px.data;
          var t = [0x1c, 0x16, 0x12], p = [0xf7, 0xee, 0xdb];
          for (var i = 0; i < a.length; i += 4) {
            var l = (0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2]) / 255;
            l = Math.min(1, Math.max(0, (l - 0.03) / 0.94));
            l = l * l * (3 - 2 * l) * 0.55 + l * 0.45;
            a[i] = t[0] + (p[0] - t[0]) * l; a[i + 1] = t[1] + (p[1] - t[1]) * l; a[i + 2] = t[2] + (p[2] - t[2]) * l;
          }
          o.putImageData(px, 0, 0);
        }
      } catch (e) {
        d._aviso = 'foto-externa';
      }
      ctx.drawImage(off, x, y, w, h);
      if (d.fotoColorida) {
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(239,226,198,0.35)'; ctx.fillRect(x, y, w, h);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    // leve sombra interna no topo do arco
    var g = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
    g.addColorStop(0, 'rgba(28,22,18,0.35)'); g.addColorStop(1, 'rgba(28,22,18,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.restore();
    // filetes do arco
    ctx.strokeStyle = TINTA; ctx.lineWidth = 4; caminhoArco(ctx, x, y, w, h); ctx.stroke();
    ctx.strokeStyle = cor; ctx.lineWidth = 1.6; caminhoArco(ctx, x - 12, y - 12, w + 24, h + 12); ctx.stroke();
  }

  function selo(ctx, classificacao, x, y, tam) {
    var c = CLASSIND[classificacao];
    if (!c) return;
    ctx.fillStyle = c[1];
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, tam, tam, tam * 0.14); else ctx.rect(x, y, tam, tam);
    ctx.fill();
    ctx.strokeStyle = PAPEL_CLARO; ctx.lineWidth = 3; ctx.stroke();
    escrever(ctx, c[0], x + tam / 2, y + tam * 0.76, F.gotica(tam * 0.74), c[0] === '12' ? TINTA : '#fff', 'center');
  }

  // Logo de apoio (Secretaria de Cultura), usada como é, com o rótulo "apoio:"
  function apoio(ctx, logo, texto, xDireita, yBase, altura) {
    if (logo && logo.width) {
      var h = altura, w = logo.width * (h / logo.height);
      ctx.drawImage(logo, xDireita - w, yBase - h + 6, w, h);
      escrever(ctx, texto || 'apoio:', xDireita - w - 14, yBase - h * 0.32, F.italico(Math.round(altura * 0.42)), TINTA, 'right');
    } else {
      escrever(ctx, 'PREFEITURA DE GUARAPUAVA', xDireita, yBase - 4, F.gotica(30), TINTA, 'right', 2);
    }
  }

  /* Blocos de texto de baixo para cima; a foto ocupa o que sobrar. */
  function blocoTexto(ctx, d, cx, larg, yTopo, yBase, cor, escalaTexto, soMedir) {
    var e = escalaTexto || 1;
    // título
    var tit = ajustar(ctx, d.titulo || 'Título do espetáculo', F.titulo, larg, 2, Math.round(140 * e), Math.round(60 * e));
    var lh = tit.tamanho * 0.98;
    var y = yBase;
    var pos = {};
    // faixa e rodapé são desenhados por quem chama; aqui: datas, companhia, título, gênero
    pos.linha2 = y; y -= Math.round(52 * e);
    pos.linha1 = y; y -= Math.round(84 * e);
    if (d.companhia) { pos.comp = y; y -= Math.round(68 * e); }
    pos.tituloBase = y; y -= lh * (tit.linhas.length - 1) + tit.tamanho * 0.78;
    pos.genero = y - Math.round(28 * e);
    pos.topo = pos.genero - Math.round(46 * e);
    if (soMedir) return pos;

    if (d.genero) {
      ctx.font = F.gotica(Math.round(40 * e)); espaco(ctx, 6 * e);
      var gw = ctx.measureText(d.genero).width; espaco(ctx, 0);
      escrever(ctx, d.genero, cx, pos.genero, F.gotica(Math.round(40 * e)), cor, 'center', 6 * e);
      losango(ctx, cx - gw / 2 - 24 * e, pos.genero - 14 * e, 7 * e, cor);
      losango(ctx, cx + gw / 2 + 24 * e, pos.genero - 14 * e, 7 * e, cor);
    }
    ctx.font = F.titulo(tit.tamanho); ctx.fillStyle = TINTA; ctx.textAlign = 'center'; espaco(ctx, -tit.tamanho * 0.01);
    tit.linhas.forEach(function (l, i) { ctx.fillText(l, cx, pos.tituloBase - (tit.linhas.length - 1 - i) * lh); });
    espaco(ctx, 0);
    if (d.companhia) {
      var comp = ajustar(ctx, d.companhia, F.italico, larg, 1, Math.round(40 * e), Math.round(26 * e));
      escrever(ctx, comp.linhas[0], cx, pos.comp, F.italico(comp.tamanho), TINTA, 'center');
    }
    var l1 = ajustar(ctx, d.linha1 || '', F.gotica, larg, 1, Math.round(88 * e), Math.round(48 * e), function (t) { return t * 0.03; });
    escrever(ctx, l1.linhas[0] || '', cx, pos.linha1, F.gotica(l1.tamanho), TINTA, 'center', l1.tamanho * 0.03);
    var l2 = ajustar(ctx, d.linha2 || '', F.gotica, larg, 1, Math.round(44 * e), Math.round(28 * e), function (t) { return t * 0.08; });
    escrever(ctx, l2.linhas[0] || '', cx, pos.linha2, F.gotica(l2.tamanho), cor, 'center', l2.tamanho * 0.08);
    return pos;
  }

  function faixa(ctx, texto, x, y, w, h, cor) {
    ctx.fillStyle = cor; ctx.fillRect(x, y, w, h);
    // pontas de bandeirola
    ctx.fillStyle = PAPEL;
    [[x, 1], [x + w, -1]].forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(p[0], y); ctx.lineTo(p[0] + p[1] * h * 0.32, y + h / 2); ctx.lineTo(p[0], y + h); ctx.closePath(); ctx.fill();
    });
    var t = ajustar(ctx, texto || '', F.gotica, w - h * 1.2, 1, Math.round(h * 0.62), Math.round(h * 0.36), function (s) { return s * 0.08; });
    escrever(ctx, t.linhas[0] || '', x + w / 2, y + h / 2 + t.tamanho * 0.36, F.gotica(t.tamanho), PAPEL_CLARO, 'center', t.tamanho * 0.08);
  }

  function cabecalho(ctx, cx, y, larg, cor, e) {
    e = e || 1;
    var t = ajustar(ctx, 'TEATRO MUNICIPAL DE GUARAPUAVA', F.gotica, larg, 1, Math.round(54 * e), 30, function (s) { return s * 0.1; });
    escrever(ctx, t.linhas[0], cx, y, F.gotica(t.tamanho), TINTA, 'center', t.tamanho * 0.1);
    regua(ctx, cx - larg * 0.42, cx + larg * 0.42, y + 28 * e, cor);
    escrever(ctx, 'apresenta', cx, y + 76 * e, F.italico(Math.round(38 * e)), cor, 'center');
    return y + 76 * e;
  }

  function rodape(ctx, d, logo, x1, x2, yBase, e) {
    e = e || 1;
    escrever(ctx, d.local1 || '', x1, yBase - 26 * e, F.gotica(Math.round(28 * e)), TINTA, 'left', 2 * e);
    escrever(ctx, d.local2 || '', x1, yBase, F.texto(Math.round(20 * e)), TINTA, 'left');
    apoio(ctx, logo, d.apoioTexto, x2, yBase + 2, 54 * e);
  }

  function desenharPost(ctx, d, img, logo, escala, W, H, story) {
    var cor = CORES[d.cor] || CORES.tijolo;
    papel(ctx, W, H); moldura(ctx, W, H, cor);
    var cx = W / 2, larg = W - 200;
    var topoSeguro = story ? 190 : 0, baseSegura = story ? 210 : 0;
    if (story) {
      // filete decorativo no alto e no pé (as áreas que o Instagram cobre ficam só com ornamento)
      regua(ctx, cx - 160, cx + 160, 118, cor);
      regua(ctx, cx - 160, cx + 160, H - 118, cor);
    }
    var yCab = cabecalho(ctx, cx, 112 + topoSeguro, larg, cor);
    var yRod = H - 70 - baseSegura;
    rodape(ctx, d, logo, 84, W - 84, yRod);
    var fH = 70, fY = yRod - 62 - fH;
    faixa(ctx, d.faixa, 70, fY, W - 140, fH, cor);
    // diminui o texto até a foto ocupar pelo menos um terço do cartaz
    var fotoTopo = yCab + 44, escalaT = story ? 1.08 : 1, minimo = H * (story ? 0.3 : 0.34);
    for (var t = 0; t < 5; t++) {
      var teste = blocoTexto(ctx, d, cx, larg, 0, fY - 34, cor, escalaT, true);
      if (teste.topo - fotoTopo >= minimo) break;
      escalaT -= 0.06;
    }
    var pos = blocoTexto(ctx, d, cx, larg, 0, fY - 34, cor, escalaT);
    var fotoBase = pos.topo;
    var fw = story ? 800 : 700, fh = fotoBase - fotoTopo;
    if (fh < fw * 0.62) { fw = Math.max(420, fh / 0.62); }
    foto(ctx, escala, img, cx - fw / 2, fotoTopo + 12, fw, fh - 12, d, cor);
    selo(ctx, d.classificacao, cx + fw / 2 - 40, fotoBase - 92, 76);
  }

  function desenharBanner(ctx, d, img, logo, escala, W, H) {
    var cor = CORES[d.cor] || CORES.tijolo;
    papel(ctx, W, H); moldura(ctx, W, H, cor);
    var fx = 130, fy = 120, fw = 640, fh = H - 120 - 110;
    foto(ctx, escala, img, fx, fy + 12, fw, fh, d, cor);
    selo(ctx, d.classificacao, fx + fw - 50, fy + fh - 80, 80);
    var colX = 860, colW = W - 100 - colX, cx = colX + colW / 2;
    cabecalho(ctx, cx, 150, colW, cor, 0.95);
    var yRod = H - 82;
    rodape(ctx, d, logo, colX + 10, W - 110, yRod, 0.95);
    var fH = 74, fY = yRod - 60 - fH;
    faixa(ctx, d.faixa, colX, fY, colW, fH, cor);
    blocoTexto(ctx, d, cx, colW - 40, 0, fY - 40, cor, 1.05);
  }

  /* desenhar(canvas, dados, formato, { largura }) — devolve uma Promise */
  function desenhar(canvas, dados, formato, opcoes) {
    opcoes = opcoes || {};
    var f = FORMATOS[formato] || FORMATOS.post;
    var largura = opcoes.largura || f.w;
    var escala = largura / f.w;
    canvas.width = Math.round(f.w * escala);
    canvas.height = Math.round(f.h * escala);
    return Promise.all([carregarFontes(), carregarImagem(dados.foto), carregarImagem(dados.logo)]).then(function (r) {
      var img = r[1], logo = r[2];
      var ctx = canvas.getContext('2d');
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.clearRect(0, 0, f.w, f.h);
      dados._aviso = '';
      if (formato === 'banner') desenharBanner(ctx, dados, img, logo, escala, f.w, f.h);
      else desenharPost(ctx, dados, img, logo, escala, f.w, f.h, formato === 'story');
      canvas.dataset.pronto = '1';
      return dados._aviso;
    });
  }

  global.Cartaz = {
    FORMATOS: FORMATOS,
    CORES: CORES,
    desenhar: desenhar,
    dadosDoEspetaculo: dadosDoEspetaculo,
    faixaPadrao: faixaPadrao,
    carregarFontes: carregarFontes
  };
})(window);
