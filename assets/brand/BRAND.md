# Hextreco — brand kit

Marca da Hextreco, o IDP da Insight Valley construído em cima de Backstage.

## Conceito

O nome junta **Hextech** (a engenharia mística de Arcane/Runeterra) com **treco**, gíria br pra "coisa/troço". A identidade carrega os dois lados:

- Hexágono central, faceted gem, runas perimetrais e glow radial vêm do lado Hextech. É também a forma que o Backstage usa nos seus motifs, então a referência amarra duas vezes.
- Uma faísca amarela no centro da gema e uma pequena saliência assimétrica no flanco direito quebram o tom solene. É o "treco": ferramenta de oficina, não relíquia de templo.

A paleta é 100% da Insight Valley mãe, sem azul/ciano. Hextech canônico é ciano, mas a marca-filha não pode brigar com o sistema visual da casa. Violeta e rosa da Insight cobrem a mesma função semântica.

## Cores

Tokens herdados de [`brand/BRAND.md`](../../../../core-context/insight-valley/brand/BRAND.md) da Insight Valley:

| Token             | Hex       | Onde aparece                                  |
|-------------------|-----------|-----------------------------------------------|
| `ink`             | `#110e1b` | Fundo padrão da marca                         |
| `ink-2`           | `#1a1528` | Preenchimento do hexágono interno             |
| `paper`           | `#f8f8f9` | Outline da gem, spark core, wordmark          |
| `accent-violet`   | `#9650c0` | Stroke do hexágono externo, facetas mid       |
| `accent-violet-2` | `#7a409b` | Sombras da gem                                |
| `accent-pink`     | `#c83ea7` | Hexágono interno, rune ticks, glow halo       |
| `accent-yellow`   | `#dea627` | Spark central, notch assimétrico, tick do "O" |

## Variantes

| Arquivo | ViewBox | Quando usar |
|---------|---------|-------------|
| `hextreco-mark.svg` | 512×512 | Símbolo full-color sobre `ink`. Avatar, app icon grande, badge. |
| `hextreco-mark-mono-light.svg` | 512×512 | Mono `paper` sobre fundo escuro. Stamps, embossing, single-channel print. |
| `hextreco-mark-mono-dark.svg` | 512×512 | Mono `ink` sobre fundo claro. Mesma função invertida. |
| `hextreco-lockup-horizontal.svg` | 1600×380 | Header, README, slides. Símbolo + wordmark lado a lado. |
| `hextreco-favicon.svg` | 32×32 | Favicon e qualquer renderização ≤48px. Geometria simplificada. |

O wordmark "HEXTRECO" foi desenhado como paths geométricos no próprio SVG. Não depende de webfont ou fonte de sistema. O "O" é um hexágono e não um círculo, pra ecoar o símbolo de propósito.

## Decisões deliberadas

- **Ausência de azul/ciano**, apesar de Hextech canônico de LoL ser ciano. Subordinar à paleta da Insight vence consistência de família contra fidelidade de referência.
- **Hexágono pointy-top** (não flat-top). Casa com o motif do Backstage e dá mais altura visual em lockups horizontais.
- **Gema como octaedro projetado** (4 facetas planas), não cristal multifacetado. Mantém legibilidade em 32px e não exige raster.
- **Faísca amarela no núcleo da gema** é o single point onde `accent-yellow` aparece. Lê como "calor humano dentro do cristal frio", que é exatamente a ponte semântica Hextech↔treco.
- **Notch amarelo no flanco direito** quebra a simetria sextavada. Sem ele a marca fica solene demais. Com ele vira "ferramenta com ranhura de fábrica".
- **Wordmark em paths**, não em font-face. Custa alguns KB a mais por SVG, mas elimina fallback de fonte e garante render idêntico em qualquer ambiente.

## Limitações conhecidas

- Wordmark via path é mais pesado que `font-family` numa stack tipográfica. Aceito.
- Em 16×16, o spark amarelo do favicon some perceptualmente. Fica como ponto de tensão, não bug — a geometria do hexágono e da gem é o que carrega o reconhecimento nessa escala.
- Mono variants perdem a hierarquia entre hexágono externo e interno (ambos viram stroke). É a natureza do mono, não tem como contornar sem introduzir tom intermediário.

## Cross-link

Cópia espelhada do kit fica em `core-context/insight-valley/hextreco/brand/` no control-plane do Gabriel, pra rastreabilidade junto das outras vertentes.
