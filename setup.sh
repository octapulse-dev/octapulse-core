#!/bin/bash

# OctaPulse Platform Setup Script
# Sets up the development environment for both frontend and backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[Setup]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[Setup]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Setup]${NC} $1"
}

print_error() {
    echo -e "${RED}[Setup]${NC} $1"
}

print_status "🔧 Setting up OctaPulse Development Environment"
print_status "=============================================="

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "server" ]] || [[ ! -d "client" ]]; then
    print_error "Please run this script from the octapulse-core root directory"
    exit 1
fi

# Setup Backend
print_status "Setting up Python backend..."
cd server

# Check Python version
python_version=$(python --version 2>&1 | cut -d' ' -f2)
print_status "Python version: $python_version"

# Create virtual environment if it doesn't exist
if [[ ! -d "venv" ]]; then
    print_status "Creating Python virtual environment..."
    python -m venv venv
    print_success "✓ Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
print_success "✓ Python dependencies installed"

# Check model file
if [[ ! -f "documents/best.pt" ]]; then
    print_warning "⚠️  Model file 'documents/best.pt' not found!"
    print_warning "Please ensure you have the YOLO model file in server/documents/"
    print_warning "The application will not work without this file."
else
    print_success "✓ Model file found"
fi

# Create environment file
if [[ ! -f ".env" ]]; then
    print_status "Creating backend .env file..."
    cp .env.example .env
    print_success "✓ Created .env from .env.example"
    print_warning "Please review and update .env file if needed"
else
    print_status ".env file already exists"
fi

cd ../

# Setup Frontend
print_status "Setting up Node.js frontend..."
cd client

# Check Node.js version
if command -v node > /dev/null 2>&1; then
    node_version=$(node --version)
    print_status "Node.js version: $node_version"
else
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "✓ Frontend dependencies installed"

# Create environment file
if [[ ! -f ".env.local" ]]; then
    print_status "Creating frontend .env.local file..."
    cp .env.example .env.local
    print_success "✓ Created .env.local from .env.example"
else
    print_status ".env.local file already exists"
fi

cd ../

print_status "=============================================="
print_success "🎉 Setup completed successfully!"
print_status "=============================================="
print_status ""
print_status "Next steps:"
print_status "1. Review configuration files:"
print_status "   • server/.env"
print_status "   • client/.env.local" 
print_status ""
print_status "2. Ensure you have the YOLO model file:"
print_status "   • server/documents/best.pt"
print_status ""
print_status "3. Start the platform:"
print_status "   ./start.sh"
print_status ""
print_status "4. Open your browser:"
print_status "   • Frontend: http://localhost:3000"
print_status "   • API Docs: http://localhost:8000/docs"
print_status "=============================================="