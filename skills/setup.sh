#!/bin/bash
# Setup AI Skills for NestJS Dashboard Template
# Configures AI coding assistants that follow agentskills.io standard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_SOURCE="$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Selection flags
SETUP_OPENCODE=false
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_COPILOT=false
SETUP_CURSOR=false

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Configure AI coding assistants for NestJS Dashboard Template."
    echo ""
    echo "Options:"
    echo "  --all       Configure all AI assistants"
    echo "  --opencode  Configure OpenCode"
    echo "  --claude    Configure Claude Code"
    echo "  --gemini    Configure Gemini CLI"
    echo "  --codex     Configure Codex (OpenAI)"
    echo "  --copilot   Configure GitHub Copilot"
    echo "  --cursor    Configure Cursor IDE"
    echo "  --help      Show this help message"
    echo ""
    echo "If no options provided, runs in interactive mode."
}

show_menu() {
    echo -e "${BOLD}Which AI assistants do you use?${NC}"
    echo -e "${CYAN}(Use numbers to toggle, Enter to confirm)${NC}"
    echo ""

    local options=("OpenCode" "Claude Code" "Gemini CLI" "Codex (OpenAI)" "GitHub Copilot" "Cursor IDE")
    local selected=(true false false false false false)  # Only OpenCode selected by default

    while true; do
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[x]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Select all"
        echo -e "  ${YELLOW}n${NC}. Select none"
        echo ""
        echo -n "Toggle (1-6, a, n) or Enter to confirm: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            6) selected[5]=$([ "${selected[5]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true true true) ;;
            n|N) selected=(false false false false false false) ;;
            "") break ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
        echo -en "\033[14A\033[J"
    done

    SETUP_OPENCODE=${selected[0]}
    SETUP_CLAUDE=${selected[1]}
    SETUP_GEMINI=${selected[2]}
    SETUP_CODEX=${selected[3]}
    SETUP_COPILOT=${selected[4]}
    SETUP_CURSOR=${selected[5]}
}

setup_opencode() {
    local target="$REPO_ROOT/.opencode/skills"
    if [ ! -d "$REPO_ROOT/.opencode" ]; then mkdir -p "$REPO_ROOT/.opencode"; fi
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .opencode/skills -> skills/${NC}"
}

setup_claude() {
    local target="$REPO_ROOT/.claude/skills"
    if [ ! -d "$REPO_ROOT/.claude" ]; then mkdir -p "$REPO_ROOT/.claude"; fi
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .claude/skills -> skills/${NC}"
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/CLAUDE.md"
        echo -e "${GREEN}  ✓ AGENTS.md -> CLAUDE.md${NC}"
    fi
}

setup_gemini() {
    local target="$REPO_ROOT/.gemini/skills"
    if [ ! -d "$REPO_ROOT/.gemini" ]; then mkdir -p "$REPO_ROOT/.gemini"; fi
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .gemini/skills -> skills/${NC}"
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/GEMINI.md"
        echo -e "${GREEN}  ✓ AGENTS.md -> GEMINI.md${NC}"
    fi
}

setup_codex() {
    local target="$REPO_ROOT/.codex/skills"
    if [ ! -d "$REPO_ROOT/.codex" ]; then mkdir -p "$REPO_ROOT/.codex"; fi
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .codex/skills -> skills/${NC}"
}

setup_copilot() {
    if [ -f "$REPO_ROOT/AGENTS.md" ]; then
        mkdir -p "$REPO_ROOT/.github"
        cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.github/copilot-instructions.md"
        echo -e "${GREEN}  ✓ AGENTS.md -> .github/copilot-instructions.md${NC}"
    fi
}

setup_cursor() {
    local target="$REPO_ROOT/.cursor/skills"
    if [ ! -d "$REPO_ROOT/.cursor" ]; then mkdir -p "$REPO_ROOT/.cursor"; fi
    if [ -L "$target" ]; then rm "$target"; fi
    ln -s "../skills" "$target"
    echo -e "${GREEN}  ✓ .cursor/skills -> skills/${NC}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SETUP_OPENCODE=true
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_COPILOT=true
            SETUP_CURSOR=true
            shift
            ;;
        --opencode) SETUP_OPENCODE=true; shift ;;
        --claude) SETUP_CLAUDE=true; shift ;;
        --gemini) SETUP_GEMINI=true; shift ;;
        --codex) SETUP_CODEX=true; shift ;;
        --copilot) SETUP_COPILOT=true; shift ;;
        --cursor) SETUP_CURSOR=true; shift ;;
        --help|-h) show_help; exit 0 ;;
        *) echo -e "${RED}Unknown option: $1${NC}"; show_help; exit 1 ;;
    esac
done

echo "🤖 NestJS Dashboard Template - AI Skills Setup"
echo "=============================================="
echo ""

SKILL_COUNT=$(find "$SKILLS_SOURCE" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')

echo -e "${BLUE}Found $SKILL_COUNT skills to configure${NC}"
echo ""

if [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ] && [ "$SETUP_CURSOR" = false ]; then
    show_menu
    echo ""
fi

if [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_COPILOT" = false ] && [ "$SETUP_CURSOR" = false ]; then
    echo -e "${YELLOW}No AI assistants selected. Nothing to do.${NC}"
    exit 0
fi

STEP=1
TOTAL=0
[ "$SETUP_OPENCODE" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CLAUDE" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_GEMINI" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CODEX" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_COPILOT" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CURSOR" = true ] && TOTAL=$((TOTAL + 1))

if [ "$SETUP_OPENCODE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up OpenCode...${NC}"
    setup_opencode
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CLAUDE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Claude Code...${NC}"
    setup_claude
    STEP=$((STEP + 1))
fi

if [ "$SETUP_GEMINI" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Gemini CLI...${NC}"
    setup_gemini
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CODEX" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Codex...${NC}"
    setup_codex
    STEP=$((STEP + 1))
fi

if [ "$SETUP_COPILOT" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up GitHub Copilot...${NC}"
    setup_copilot
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CURSOR" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Cursor IDE...${NC}"
    setup_cursor
fi

echo ""
echo -e "${GREEN}✅ Successfully configured $SKILL_COUNT AI skills!${NC}"
echo ""
echo "Restart your AI assistant to load the skills."
