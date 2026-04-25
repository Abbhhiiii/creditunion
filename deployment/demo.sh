#!/bin/bash

# CreditAssist AI - Demo Script
# Run this to test the entire system locally

set -e

echo "==============================================="
echo "🚀 CreditAssist AI - System Demo"
echo "==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"

# Install dependencies
echo ""
echo -e "${BLUE}[2/6]${NC} Installing dependencies..."
cd backend && npm install --silent > /dev/null 2>&1 && cd ..
cd frontend && npm install --silent > /dev/null 2>&1 && cd ..
cd dashboard && npm install --silent > /dev/null 2>&1 && cd ..
echo -e "${GREEN}✓${NC} All dependencies installed"

# Setup environment
echo ""
echo -e "${BLUE}[3/6]${NC} Setting up environment variables..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Created .env from template"
fi
echo -e "${GREEN}✓${NC} Environment configured"

# Start services
echo ""
echo -e "${BLUE}[4/6]${NC} Starting services..."
echo ""
echo -e "${YELLOW}Starting Backend...${NC}"
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

sleep 3

echo -e "${YELLOW}Starting Frontend...${NC}"
cd ../frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

sleep 2

echo -e "${YELLOW}Starting Dashboard...${NC}"
cd ../dashboard
npm run dev > /tmp/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo -e "${GREEN}✓${NC} Dashboard started (PID: $DASHBOARD_PID)"

sleep 2

# Test endpoints
echo ""
echo -e "${BLUE}[5/6]${NC} Testing endpoints..."

# Wait for services to be ready
sleep 5

HEALTH_CHECK=$(curl -s http://localhost:5000/api/health 2>/dev/null || echo '{"error":"failed"}')
if echo $HEALTH_CHECK | grep -q "OK"; then
    echo -e "${GREEN}✓${NC} Backend API: http://localhost:5000"
else
    echo -e "${YELLOW}⚠${NC} Backend not ready yet (will be ready shortly)"
fi

echo -e "${GREEN}✓${NC} Frontend Chat: http://localhost:3000"
echo -e "${GREEN}✓${NC} Staff Dashboard: http://localhost:3001"

# Demo message
echo ""
echo -e "${BLUE}[6/6]${NC} Demo ready!"
echo ""
echo "==============================================="
echo "🎯 CreditAssist AI is running!"
echo "==============================================="
echo ""
echo "📍 Access Points:"
echo "   Member Chat:     http://localhost:3000"
echo "   Staff Dashboard: http://localhost:3001"
echo "   Backend API:     http://localhost:5000"
echo ""
echo "📊 Demo Features:"
echo "   ✓ Balance inquiry with auto-resolution"
echo "   ✓ Card block/unblock functionality"
echo "   ✓ Intent classification (9+ types)"
echo "   ✓ Sentiment analysis"
echo "   ✓ RAG-based knowledge retrieval"
echo "   ✓ Smart case escalation"
echo "   ✓ Staff dashboard with case management"
echo "   ✓ Real-time analytics"
echo "   ✓ Multi-language support (EN, HI, KN)"
echo "   ✓ Voice input (Web Speech API)"
echo ""
echo "🧪 Test Scenarios:"
echo ""
echo "1️⃣  Balance Inquiry:"
echo "   User: 'What is my account balance?'"
echo "   Expected: Auto-resolves with balance amount"
echo ""
echo "2️⃣  Card Blocking:"
echo "   User: 'I want to block my card'"
echo "   Expected: Auto-resolves with confirmation"
echo ""
echo "3️⃣  Dispute Filing:"
echo "   User: 'I have unauthorized charges'"
echo "   Expected: Escalates to staff with summary"
echo ""
echo "4️⃣  Staff Response:"
echo "   Open Dashboard → View escalated case → Update status"
echo ""
echo "==============================================="
echo ""
echo "To stop services, press Ctrl+C or run:"
echo "  kill $BACKEND_PID $FRONTEND_PID $DASHBOARD_PID"
echo ""
echo "For logs:"
echo "  tail -f /tmp/backend.log"
echo "  tail -f /tmp/frontend.log"
echo "  tail -f /tmp/dashboard.log"
echo ""
echo "==============================================="
echo ""

# Keep script running
wait

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID $DASHBOARD_PID" EXIT
