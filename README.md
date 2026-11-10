# Site do Teatro Municipal de Guarapuava

Site estático (Jekyll) publicado no GitHub Pages, com painel de edição pelo Pages CMS para a equipe do teatro atualizar sem mexer em código.

- Guia da equipe do teatro: [COMO-ATUALIZAR.md](COMO-ATUALIZAR.md)
- Configuração do painel: [`.pages.yml`](.pages.yml)
- Publicação automática: [`.github/workflows/publicar.yml`](.github/workflows/publicar.yml)

## Colocar no ar (uma vez só)

1. **Criar o repositório** na organização `secom-guarapuava` (sugestão: `teatro-municipal`, público) e enviar estes arquivos para a branch `main`.
2. **Ativar o GitHub Pages**: Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.
   A primeira publicação roda sozinha. O endereço fica `https://secom-guarapuava.github.io/teatro-municipal/`.
3. **Conectar o painel**:
   - Entrar em https://app.pagescms.org com a conta do GitHub que administra a organização.
   - Instalar o app do Pages CMS no repositório `teatro-municipal` quando ele pedir.
   - Abrir o repositório no painel e, em **Collaborators**, convidar por e-mail cada pessoa da equipe do teatro. Elas não precisam de conta no GitHub.
4. **Preencher os dados que faltam** (pelo painel, menu *Contatos e aviso do topo* e *Pautas e datas livres*): WhatsApp, e-mail para ofícios, link do formulário e a logo oficial da Prefeitura.
5. **Trocar o conteúdo de exemplo**: os espetáculos, as datas livres e os álbuns que vieram no pacote são ilustrativos.

## Como funciona

| O quê | Onde fica | Quem edita |
|---|---|---|
| Espetáculos | `_espetaculos/*.md` | Painel → Espetáculos |
| Datas livres e credenciamento | `_data/pautas.yml` | Painel → Pautas e datas livres |
| Acervo (capa + link do álbum externo) | `_acervo/*.md` | Painel → Acervo de fotos |
| Frases dos entreatos | `_data/frases.yml` | Painel → Frases |
| Página “O teatro” | `o-teatro.md` | Painel → Página O teatro |
| Contatos, aviso do topo, logo | `_data/geral.yml` | Painel → Contatos e aviso do topo |
| Fotos enviadas pelo painel | `assets/uploads/` | Painel (upload) |

- Cada salvamento no painel vira um commit e dispara a publicação (1–2 min).
- A publicação também roda todo dia às 3h17 para tirar da programação o que já passou. Além disso, o próprio navegador esconde sessões encerradas no mesmo dia.
- A etapa do credenciamento (contagem, inscrições abertas, análise, readequação, pedidos ao longo do ano) é calculada pela data, no navegador.
- As fotos enviadas são reduzidas para no máximo 2000 px na hora de publicar (`scripts/otimizar_imagens.py`). Os originais ficam no repositório.
- O acervo guarda só a capa de cada evento; o álbum completo fica fora (Flickr/Drive/site da Prefeitura). Isso mantém o site bem abaixo do limite de 1 GB do GitHub Pages.

## Rodar no computador

```bash
bundle install
bundle exec jekyll serve
```

Abre em http://localhost:4000.

## Identidade

- Tipografia: Bodoni Moda (títulos e frases, herança dos cartazes de teatro) e Hanken Grotesk (textos). Arquivos locais em `assets/fonts/`, sem Google Fonts.
- Cores (`assets/css/site.css`): preto de rotunda, creme da luz de plateia, âmbar dos refletores, tijolo da fachada e o vermelho da cortina.
- Fotos do prédio: Zaca.
