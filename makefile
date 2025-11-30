# Makefile for OBDscribe dev workflow
# Usage examples:
#   make dev
#   make prisma-generate
#   make prisma-migrate name=init_schema
#   make db-shell

SHELL := /bin/bash

# Default env file (Next.js + your setup uses .env.local)
ENV_FILE ?= .env.local

.PHONY: help dev build start lint test prisma-generate prisma-migrate prisma-studio db-shell check-env

help:
	@echo ""
	@echo "OBDscribe – Dev Commands"
	@echo "------------------------"
	@echo "make dev                # Run Next.js dev server (pnpm dev)"
	@echo "make build              # Build Next app (pnpm build)"
	@echo "make start              # Start production server (pnpm start)"
	@echo "make lint               # Run lint (pnpm lint) if configured"
	@echo "make test               # Run tests (pnpm test) if configured"
	@echo ""
	@echo "make prisma-generate    # Run prisma generate"
	@echo "make prisma-migrate name=init_schema"
	@echo "                        # Run prisma migrate dev with a name"
	@echo "make prisma-studio      # Open Prisma Studio"
	@echo ""
	@echo "make db-shell           # Open psql shell using $$DATABASE_URL"
	@echo "make check-env          # Show which env file & DATABASE_URL are in effect"
	@echo ""

# -------------------------
# App lifecycle
# -------------------------

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	# Requires a "lint" script in package.json
	pnpm lint

test:
	# Requires a "test" script in package.json
	pnpm test

# -------------------------
# Prisma / Database
# -------------------------

prisma-generate:
	pnpx prisma generate

# Usage: make prisma-migrate name=init_schema
prisma-migrate:
	@if [ -z "$(name)" ]; then \
		echo "Error: please provide a migration name, e.g."; \
		echo "  make prisma-migrate name=init_schema"; \
		exit 1; \
	fi
	pnpx prisma migrate dev --name "$(name)"

prisma-studio:
	pnpx prisma studio

# -------------------------
# DB convenience
# -------------------------

# Open a psql shell using DATABASE_URL from env
db-shell: check-env
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "Error: DATABASE_URL is not set in environment."; \
		echo "Load it first, e.g.:"; \
		echo "  export $$(grep DATABASE_URL $(ENV_FILE) | xargs)"; \
		echo "then run: make db-shell"; \
		exit 1; \
	fi
	psql "$$DATABASE_URL"

# Show which env file is being used and what DATABASE_URL is visible
check-env:
	@echo "ENV_FILE: $(ENV_FILE)"
	@if [ -f "$(ENV_FILE)" ]; then \
		echo "$(ENV_FILE) exists"; \
	else \
		echo "$(ENV_FILE) does NOT exist"; \
	fi
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "DATABASE_URL: (not set in current shell)"; \
	else \
		echo "DATABASE_URL: $$DATABASE_URL"; \
	fi