#!/bin/bash
#
# FastMem Development Agent Commands
# This script provides agent-accessible commands for dev operations
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="$PROJECT_ROOT/data/fastmem.db"

# Color output for readability
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}${BOLD}$1${NC}"
}

print_done() {
    echo -e "${GREEN}✓${NC} $1"
}

# Agent commands with machine-readable output
case "${1:-help}" in
    dev:start)
        print_status "Starting dev server..."
        cd "$PROJECT_ROOT"
        npm run dev
        ;;
    
    dev:stop)
        print_status "Stopping dev server..."
        pkill -f "vite dev" || print_done "No dev server running"
        ;;
    
    db:init)
        print_status "Initializing database..."
        cd "$PROJECT_ROOT"
        npm run db:init
        print_done "Database initialized with seed data"
        ;;
    
    db:status)
        if [ -f "$DB_PATH" ]; then
            user_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
            set_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM flashcard_sets" 2>/dev/null || echo "0")
            card_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM flashcards" 2>/dev/null || echo "0")
            
            echo "database_status:ok"
            echo "users:$user_count"
            echo "sets:$set_count"
            echo "cards:$card_count"
        else
            echo "database_status:not_found"
        fi
        ;;
    
    build:prod)
        print_status "Building production..."
        cd "$PROJECT_ROOT"
        npm run build
        print_done "Production build complete (dist/)"
        ;;
    
    check:types)
        print_status "Checking types..."
        cd "$PROJECT_ROOT"
        npm run check
        print_done "Type check complete"
        ;;
    
    lint)
        print_status "Running ESLint..."
        cd "$PROJECT_ROOT"
        npm run lint
        print_done "Lint check complete"
        ;;
    
    format)
        print_status "Formatting code..."
        cd "$PROJECT_ROOT"
        npm run format
        print_done "Code formatted"
        ;;
    
    status)
        print_status "Environment Status"
        echo "node_version:$(node --version | cut -d'v' -f2)"
        echo "npm_version:$(npm --version)"
        
        if [ -f "$DB_PATH" ]; then
            echo "database:ready"
        else
            echo "database:not_initialized"
        fi
        
        if lsof -i :5173 >/dev/null 2>&1; then
            echo "dev_server:running"
            echo "dev_url:http://localhost:5173"
        else
            echo "dev_server:stopped"
        fi
        ;;
    
    *)
        echo "Agent commands for FastMem development:"
        echo ""
        echo "Server:"
        echo "  dev:start              Start development server"
        echo "  dev:stop               Stop development server"
        echo ""
        echo "Database:"
        echo "  db:init                Initialize database"
        echo "  db:status              Check database status"
        echo ""
        echo "Build & Quality:"
        echo "  build:prod             Build for production"
        echo "  check:types            Run TypeScript check"
        echo "  lint                   Run ESLint"
        echo "  format                 Format code with Prettier"
        echo ""
        echo "Info:"
        echo "  status                 Show environment status"
        ;;
esac
