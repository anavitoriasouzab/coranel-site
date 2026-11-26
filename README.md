# Lívia Coranel · Advocacia previdenciária

Landing page de portfólio para uma advogada previdenciária fictícia de Manaus. O projeto inclui identidade visual (monograma LC em prata, grafite e branco) e site.

## Destaques

- **Storytime em "Como funciona"**: a seção fica fixa na tela e conta o atendimento em quatro capítulos (WhatsApp, parecer, contrato e acompanhamento), com mockups que se montam conforme o scroll.
- **Scroll suave e com movimento**: Lenis + GSAP ScrollTrigger, parallax no hero e no retrato, faixa de áreas de atuação que anda com o scroll e títulos revelados palavra por palavra.
- **Cards interativos**: brilho que segue o cursor e leve inclinação 3D.
- **Contato "monte sua mensagem"**: a pessoa escolhe a situação e o formato, vê a prévia ao vivo e abre o WhatsApp com a mensagem pronta.
- **Rodapé em forma de carta**: termina com "Atenciosamente," e a assinatura manuscrita da advogada, que se escreve com o scroll. O "voltar ao início" tem um anel de progresso da rolagem.
- **Acessibilidade**: respeita `prefers-reduced-motion`, tem link "pular para o conteúdo", foco visível e funciona sem JavaScript.

## Como rodar

```sh
npx serve .
```

Ou simplesmente abra o `index.html` no navegador (precisa de internet para carregar as fontes e as bibliotecas de animação).

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Landing page |
| `css/style.css` | Estilos (tokens, seções, responsivo) |
| `js/main.js` | Menu, FAQ e todas as animações |
| `politica-de-privacidade.html` | Política de privacidade (modelo LGPD) |
| `termos-de-uso.html` | Termos de uso e aviso legal |
| `404.html` | Página de erro |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | Arquivos para SEO e instalação |

## Antes de publicar de verdade

Troque o WhatsApp (`5500000000000`), a OAB (`00.000`), o link do Instagram e o domínio `exemplo.com.br`.
