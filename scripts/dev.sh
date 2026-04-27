#!/bin/bash
#
# FastMem Development Environment Helper Script
# Provides convenient commands for common development tasks
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DB_PATH="$PROJECT_ROOT/data/fastmem.db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BOLD}${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Commands
cmd_help() {
    cat << EOF
${BOLD}FastMem Development Environment${NC}

${BOLD}Usage:${NC}
  $(basename "$0") <command> [options]

${BOLD}Commands:${NC}
  help           Show this help message
  status         Show environment status
  init           Initialize everything (deps + db)
  dev            Start development server
  build          Build for production
  format         Format code with Prettier
  lint           Check code quality with ESLint
  types          Check TypeScript types
  db:init        Initialize database with seed data
  db:inspect     Open SQLite database browser
  db:query <sql> Execute SQL query on database
  db:reset       Reset database (deletes all data)
  clean          Clean build artifacts

${BOLD}Examples:${NC}
  $(basename "$0") status          # Show current environment
  $(basename "$0") dev             # Start dev server
  $(basename "$0") db:query "SELECT COUNT(*) FROM users"
  $(basename "$0") init            # First-time setup
EOF
}

cmd_status() {
    print_header "Environment Status"
    
    echo -e "${BOLD}System:${NC}"
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
    echo "  Git: $(git --version | cut -d' ' -f3)"
    
    echo -e "\n${BOLD}Project:${NC}"
    echo "  Root: $PROJECT_ROOT"
    echo "  Database: $DB_PATH"
    if [ -f "$DB_PATH" ]; then
        print_success "Database exists"
        local user_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users" 2>/dev/null || echo "?")
        echo "  Users in database: $user_count"
    else
        print_error "Database not found (run: $(basename "$0") db:init)"
    fi
    
    echo -e "\n${BOLD}Services:${NC}"
    if lsof -i :5173 >/dev/null 2>&1; then
        print_success "Dev server running on http://localhost:5173"
    else
        print_info "Dev server not running"
    fi
    
    echo -e "\n${BOLD}Quick Access:${NC}"
    echo "  App: http://localhost:5173"
    echo "  Default credentials: user / user"
}

cmd_init() {
    print_header "Initializing FastMem"
    
    echo "Step 1: Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
    print_success "Dependencies installed"
    
    echo -e "\nStep 2: Initializing database..."
    npm run db:init
    print_success "Database initialized"
    
    print_success "Setup complete! Run: $(basename "$0") dev"
}

cmd_dev() {
    print_header "Starting Development Server"
    echo "Access the app at: http://localhost:5173"
    echo "Login with: user / user"
    echo "Press Ctrl+C to stop"
    echo ""
    cd "$PROJECT_ROOT"
    npm run dev
}

cmd_build() {
    print_header "Building for Production"
    cd "$PROJECT_ROOT"
    npm run build
    print_success "Build complete in dist/"
}

cmd_format() {
    print_header "Formatting Code"
    cd "$PROJECT_ROOT"
    npm run format
    print_success "Code formatted"
}

cmd_lint() {
    print_header "Linting Code"
    cd "$PROJECT_ROOT"
    npm run lint
    print_success "Lint check complete"
}

cmd_types() {
    print_header "Checking TypeScript Types"
    cd "$PROJECT_ROOT"
    npm run check
    print_success "Type check complete"
}

cmd_db_init() {
    print_header "Initializing Database"
    cd "$PROJECT_ROOT"
    npm run db:init
    print_success "Database initialized"
    echo "Default user: user / user"
}

cmd_db_inspect() {
    if [ ! -f "$DB_PATH" ]; then
        print_error "Database not found at $DB_PATH"
        echo "Run: $(basename "$0") db:init"
        exit 1
    fi
    
    print_header "SQLite Database Browser"
    echo "Common commands:"
    echo "  .tables              - List all tables"
    echo "  SELECT * FROM users; - Show users"
    echo "  .schema              - Show database schema"
    echo "  .quit                - Exit"
    echo ""
    
    sqlite3 "$DB_PATH"
}

cmd_db_query() {
    if [ -z "$1" ]; then
        print_error "SQL query required"
        echo "Usage: $(basename "$0") db:query \"SELECT * FROM users\""
        exit 1
    fi
    
    if [ ! -f "$DB_PATH" ]; then
        print_error "Database not found at $DB_PATH"
        exit 1
    fi
    
    sqlite3 "$DB_PATH" "$1"
}

cmd_db_reset() {
    if [ ! -f "$DB_PATH" ]; then
        print_error "Database not found at $DB_PATH"
        exit 1
    fi
    
    echo -e "${RED}⚠️  WARNING: This will delete all database data!${NC}"
    read -p "Type 'yes' to confirm: " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Cancelled"
        exit 0
    fi
    
    rm "$DB_PATH"
    print_success "Database deleted"
    echo "Run: $(basename "$0") db:init"
}

cmd_clean() {
    print_header "Cleaning Build Artifacts"
    cd "$PROJECT_ROOT"
    
    echo "Removing dist/..."
    rm -rf dist
    echo "Removing .svelte-kit/..."
    rm -rf .svelte-kit
    echo "Removing node_modules/.vite/..."
    rm -rf node_modules/.vite
    
    print_success "Clean complete"
}

# Main command handling
main() {
    local cmd="${1:-help}"
    shift || true
    
    case "$cmd" in
        help) cmd_help ;;
        status) cmd_status ;;
        init) cmd_init ;;
        dev) cmd_dev ;;
        build) cmd_build ;;
        format) cmd_format ;;
        lint) cmd_lint ;;
        types) cmd_types ;;
        db:init) cmd_db_init ;;
        db:inspect) cmd_db_inspect ;;
        db:query) cmd_db_query "$@" ;;
        db:reset) cmd_db_reset ;;
        clean) cmd_clean ;;
        *)
            print_error "Unknown command: $cmd"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
