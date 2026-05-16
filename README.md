# hextreco

Backstage IDP da [Insight Valley](https://insight-valley.com.br). Lab aberto, em construção.

## O que é

Hextreco é o Internal Developer Portal da Insight, baseado em [Backstage](https://backstage.io). Hoje vive só na máquina de quem clona. AWS é destino futuro, não presente.

O nome é um mashup de "Hextech" (do Arcane / League of Legends) com "treco" (gíria br pra "coisa"). Engenharia séria, nome que não se leva a sério.

## Status

Fase 1: ambiente local. Repo recém-criado, Backstage ainda não scaffolded.

## Como rodar

Pré-requisitos: Node 22 (via `nvm use`), Yarn (via Corepack), Docker. Depois:

```sh
cp .env.example .env   # preencha LANGFUSE_* e POSTGRES_*
make reset             # mata procs órfãos em :3000/:7007 + sobe infra
make dev               # backend (:7007) + frontend (:3000)
make doctor            # smoke check em outro terminal
```

`make help` lista todos os targets. O `Makefile` carrega o `.env` antes de subir o backend — sem isso, `app-config.local.yaml` resolve `${POSTGRES_PASSWORD}` como vazio e o backend morre com `SASL: client password must be a string`.

## Doc-as-blog

Cada etapa significativa do projeto vira post no blog do mantenedor. As lab notes cruas vivem no repositório de controle interno; os posts saem no Medium, Substack e blog próprio.

## Licença

MIT. Ver [LICENSE](./LICENSE).
