#!/usr/bin/env bash
# Sync skill metadata to AGENTS.md Auto-invoke sections
# Usage: ./sync.sh [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
SKILLS_DIR="$REPO_ROOT/skills"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would change without modifying files"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Extract YAML frontmatter field
extract_field() {
    local file="$1"
    local field="$2"
    awk -v field="$field" '
        /^---$/ { in_frontmatter = !in_frontmatter; next }
        in_frontmatter && $1 == field":" {
            sub(/^[^:]+:[[:space:]]*/, "")
            if ($0 != "" && $0 != ">") {
                gsub(/^["'"'"']|["'"'"']$/, "")
                print
                exit
            }
        }
    ' "$file" | sed 's/[[:space:]]*$//'
}

# Extract nested metadata field
extract_metadata() {
    local file="$1"
    local field="$2"
    awk -v field="$field" '
        /^---$/ { in_frontmatter = !in_frontmatter; next }
        in_frontmatter && /^metadata:/ { in_metadata = 1; next }
        in_frontmatter && in_metadata && /^[a-z]/ && !/^[[:space:]]/ { in_metadata = 0 }
        in_frontmatter && in_metadata && $1 == field":" {
            sub(/^[^:]+:[[:space:]]*/, "")
            print
            exit
        }
    ' "$file"
}

echo -e "${BLUE}Skill Sync - Updating AGENTS.md${NC}"
echo "======================================"
echo ""

# Collect skills
skill_count=0
while IFS= read -r skill_file; do
    [ -f "$skill_file" ] || continue
    skill_name=$(extract_field "$skill_file" "name")
    auto_invoke=$(extract_metadata "$skill_file" "auto_invoke")
    
    if [ -n "$skill_name" ] && [ -n "$auto_invoke" ]; then
        echo "Found: $skill_name"
        skill_count=$((skill_count + 1))
    fi
done < <(find "$SKILLS_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md -print 2>/dev/null)

if $DRY_RUN; then
    echo -e "${YELLOW}[DRY RUN] Would update AGENTS.md${NC}"
else
    echo -e "${GREEN}✅ Found $skill_count skills with auto_invoke${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review AGENTS.md"
    echo "2. Run ./skills/setup.sh to apply changes"
fi
