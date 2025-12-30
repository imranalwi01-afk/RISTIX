# Makefile for IFRS9 Backend Management

.PHONY: help dev local iaf vps clean-port

# Default target
.DEFAULT_GOAL := help

# Colors
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)

## Show help
help:
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@echo '  ${GREEN}local${RESET}      Start backend in Local Development mode (localhost)'
	@echo '  ${GREEN}iaf${RESET}        Start backend in IAF Tenant mode'
	@echo '  ${GREEN}vps${RESET}        Start backend in VPS mode (Remote DB at 10.8.0.2)'
	@echo '  ${GREEN}clean-port${RESET} Kill any process running on port 4232'
	@echo ''

## Start in Local Mode
local: clean-port
	@echo "${YELLOW}🚀 Starting Local Environment...${RESET}"
	@pnpm dev:local

## Start in IAF Tenant Mode
iaf: clean-port
	@echo "${YELLOW}🚀 Starting IAF Tenant Environment...${RESET}"
	@pnpm dev:iaf

## Start in VPS Mode
vps: clean-port
	@echo "${YELLOW}🚀 Starting VPS Environment (Remote DB)...${RESET}"
	@pnpm dev:vps

## Helper to kill port 4232
clean-port:
	@echo "${YELLOW}🔍 Checking port 4232...${RESET}"
	@lsof -ti:4232 | xargs kill -9 2>/dev/null || true
	@echo "${GREEN}✅ Port 4232 is clean.${RESET}"
