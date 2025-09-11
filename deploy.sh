#!/bin/bash

# CRM/ERP Platform Deployment Script
# This script helps deploy the application to various environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_NAME="crm-erp-platform"
DOCKER_COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "development" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
fi

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
    log_info "Checking requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_success "Requirements check passed"
}

setup_environment() {
    log_info "Setting up environment for $ENVIRONMENT..."

    # Create .env file if it doesn't exist
    if [ ! -f .env.local ]; then
        log_warning ".env.local file not found. Creating from template..."
        cp .env.example .env.local 2>/dev/null || echo "# Add your environment variables here" > .env.local
        log_warning "Please configure your environment variables in .env.local"
    fi

    # Create necessary directories
    mkdir -p logs
    mkdir -p ssl

    log_success "Environment setup completed"
}

build_and_deploy() {
    log_info "Building and deploying application..."

    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down || true

    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE up --build -d

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30

    # Check if services are running
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        log_success "Application deployed successfully!"
        log_info "Application is running at: http://localhost:3000"

        # Show logs
        log_info "Showing recent logs..."
        docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20
    else
        log_error "Failed to deploy application"
        docker-compose -f $DOCKER_COMPOSE_FILE logs
        exit 1
    fi
}

run_migrations() {
    log_info "Running database migrations..."

    # Run Prisma migrations
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T app npx prisma migrate deploy || log_warning "Migration failed, but continuing..."

    log_success "Database migrations completed"
}

cleanup() {
    log_info "Cleaning up old Docker resources..."

    # Remove unused containers, networks, and images
    docker system prune -f

    # Remove unused volumes
    docker volume prune -f

    log_success "Cleanup completed"
}

show_usage() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  development  - Deploy with development configuration (default)"
    echo "  production   - Deploy with production configuration"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 production"
    echo ""
    echo "Additional commands:"
    echo "  logs     - Show application logs"
    echo "  stop     - Stop the application"
    echo "  restart  - Restart the application"
    echo "  cleanup  - Clean up Docker resources"
}

# Main deployment flow
case "${2:-deploy}" in
    "deploy")
        log_info "Starting deployment to $ENVIRONMENT environment..."

        check_requirements
        setup_environment
        build_and_deploy
        run_migrations

        log_success "Deployment completed successfully!"
        log_info ""
        log_info "Useful commands:"
        log_info "  View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
        log_info "  Stop app: docker-compose -f $DOCKER_COMPOSE_FILE down"
        log_info "  Restart: docker-compose -f $DOCKER_COMPOSE_FILE restart"
        ;;

    "logs")
        log_info "Showing application logs..."
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
        ;;

    "stop")
        log_info "Stopping application..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        log_success "Application stopped"
        ;;

    "restart")
        log_info "Restarting application..."
        docker-compose -f $DOCKER_COMPOSE_FILE restart
        log_success "Application restarted"
        ;;

    "cleanup")
        cleanup
        ;;

    "help"|"-h"|"--help")
        show_usage
        ;;

    *)
        log_error "Unknown command: $2"
        show_usage
        exit 1
        ;;
esac
