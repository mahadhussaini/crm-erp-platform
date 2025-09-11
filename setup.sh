#!/bin/bash

# CRM/ERP Platform Setup Script
# This script helps set up the development environment quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18.x or higher."
        exit 1
    fi

    NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi

    log_success "System requirements met"
}

setup_environment() {
    log_info "Setting up development environment..."

    # Install dependencies
    log_info "Installing dependencies..."
    npm install

    # Generate Prisma client
    log_info "Generating Prisma client..."
    npm run db:generate

    # Create environment file if it doesn't exist
    if [ ! -f .env.local ]; then
        log_warning ".env.local not found. Creating from template..."
        if [ -f environment-config.md ]; then
            log_info "Please configure your environment variables in .env.local"
            echo "# Copy configuration from environment-config.md" > .env.local
        fi
    fi

    log_success "Environment setup completed"
}

setup_database() {
    log_info "Setting up SQLite database..."

    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        log_info "Creating .env.local file..."
        cat > .env.local << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"

# Optional: Add your third-party service keys here
# STRIPE_SECRET_KEY=""
# TWILIO_ACCOUNT_SID=""
# TWILIO_AUTH_TOKEN=""
EOF
        log_success ".env.local created with SQLite configuration"
    fi

    # Run database migrations
    log_info "Running database migrations..."
    npm run db:migrate

    # Seed database (optional)
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Seeding database..."
        npm run db:seed
    fi

    log_success "SQLite database setup completed"
}

start_development() {
    log_info "Starting development server..."

    # Check if port 3000 is available
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        log_warning "Port 3000 is already in use"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_info "Development server starting at http://localhost:3000"
    log_info "Press Ctrl+C to stop the server"

    npm run dev
}

show_help() {
    echo "CRM/ERP Platform Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Complete setup (default)"
    echo "  env       - Setup environment only"
    echo "  db        - Setup database only"
    echo "  dev       - Start development server"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 db"
    echo "  $0 dev"
}

# Main script
case "${1:-setup}" in
    "setup")
        log_info "Starting complete setup..."
        check_requirements
        setup_environment
        setup_database && start_development || log_warning "Database setup skipped. Run '$0 db' to set up database later."
        ;;
    "env")
        check_requirements
        setup_environment
        ;;
    "db")
        check_requirements
        setup_database
        ;;
    "dev")
        check_requirements
        start_development
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
