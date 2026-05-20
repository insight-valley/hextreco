SHELL := /bin/bash

# Carrega .env e exporta para o ambiente dos targets.
# Sem isto, app-config.local.yaml resolve ${POSTGRES_PASSWORD} como vazio
# e o backend cai com `SASL: client password must be a string`.
-include .env
export

.PHONY: help up down restart logs ps dev backend frontend stop clean reset doctor

help: ## Lista os targets disponíveis
	@awk 'BEGIN{FS=":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Sobe a stack de infra (postgres, prometheus, grafana, langfuse)
	docker-compose up -d

down: ## Derruba a stack de infra
	docker-compose down

restart: down up ## down + up

logs: ## Tail dos containers
	docker-compose logs -f --tail=100

ps: ## Status dos containers
	docker-compose ps

dev: ## Sobe backend + frontend Backstage (yarn dev)
	yarn dev

backend: ## Sobe só o backend (com .env carregado)
	yarn workspace backend start

frontend: ## Sobe só o frontend
	yarn workspace app start

stop: ## Mata processos node ouvindo em :3000 e :7007
	-@pids=$$(lsof -ti :3000 :7007 2>/dev/null); \
	  if [ -n "$$pids" ]; then echo "killing $$pids"; kill $$pids 2>/dev/null || true; sleep 2; fi

clean: stop down ## stop + down

reset: clean up ## Reset completo: mata processos, derruba e sobe a infra
	@echo "ready — run 'make dev' next"

doctor: ## Smoke check rápido do ambiente
	@echo "=> backend /api/metrics"; curl -fsS -o /dev/null -w "  %{http_code}\n" http://localhost:7007/api/metrics || true
	@echo "=> backend /api/auth/.well-known/jwks.json"; curl -fsS -o /dev/null -w "  %{http_code}\n" http://localhost:7007/api/auth/.well-known/jwks.json || true
	@echo "=> frontend /"; curl -fsS -o /dev/null -w "  %{http_code}\n" http://localhost:3000 || true
	@echo "=> prometheus /-/healthy"; curl -fsS -o /dev/null -w "  %{http_code}\n" http://localhost:9090/-/healthy || true
	@echo "=> langfuse /api/public/health"; curl -fsS -o /dev/null -w "  %{http_code}\n" http://localhost:3030/api/public/health || true
