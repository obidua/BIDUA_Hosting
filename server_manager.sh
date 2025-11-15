#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BIDUA Hosting - Server Manager${NC}"
echo ""

# Check current status
echo -e "${BLUE}📊 Checking current server status...${NC}"
BACKEND_RUNNING=$(lsof -ti:8000 2>/dev/null)
FRONTEND_RUNNING=$(lsof -ti:4333 2>/dev/null)

if [ ! -z "$BACKEND_RUNNING" ]; then
    echo -e "${GREEN}✅ Backend running on port 8000${NC}"
else
    echo -e "${RED}❌ Backend not running${NC}"
fi

if [ ! -z "$FRONTEND_RUNNING" ]; then
    echo -e "${GREEN}✅ Frontend running on port 4333${NC}"
else
    echo -e "${RED}❌ Frontend not running${NC}"
fi

echo ""
echo "What would you like to do?"
echo "1) Start both servers"
echo "2) Stop both servers"
echo "3) Restart both servers"
echo "4) Clear cache and restart"
echo "5) Check status only"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Starting servers...${NC}"
        
        # Start backend in background
        cd backend_template
        source venv/bin/activate
        uvicorn app.main:app --reload --port 8000 > /dev/null 2>&1 &
        BACKEND_PID=$!
        cd ..
        
        # Start frontend in background
        cd BIDUA_Hosting-main
        npm run dev > /dev/null 2>&1 &
        FRONTEND_PID=$!
        cd ..
        
        sleep 2
        echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
        echo ""
        echo -e "${BLUE}🌐 Access your application:${NC}"
        echo "  Backend:  http://127.0.0.1:8000"
        echo "  Frontend: http://localhost:4333"
        ;;
        
    2)
        echo -e "${BLUE}🛑 Stopping servers...${NC}"
        lsof -ti:8000 | xargs kill -9 2>/dev/null
        lsof -ti:4333 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✅ All servers stopped${NC}"
        ;;
        
    3)
        echo -e "${BLUE}🔄 Restarting servers...${NC}"
        lsof -ti:8000 | xargs kill -9 2>/dev/null
        lsof -ti:4333 | xargs kill -9 2>/dev/null
        sleep 2
        
        # Start backend
        cd backend_template
        source venv/bin/activate
        uvicorn app.main:app --reload --port 8000 > /dev/null 2>&1 &
        cd ..
        
        # Start frontend
        cd BIDUA_Hosting-main
        npm run dev > /dev/null 2>&1 &
        cd ..
        
        sleep 2
        echo -e "${GREEN}✅ Servers restarted${NC}"
        ;;
        
    4)
        echo -e "${BLUE}🧹 Clearing cache and restarting...${NC}"
        
        # Clear caches
        cd BIDUA_Hosting-main
        rm -rf node_modules/.vite dist .vite 2>/dev/null
        cd ../backend_template
        find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
        find . -name "*.pyc" -delete 2>/dev/null
        cd ..
        
        echo -e "${GREEN}✅ Cache cleared${NC}"
        
        # Stop servers
        lsof -ti:8000 | xargs kill -9 2>/dev/null
        lsof -ti:4333 | xargs kill -9 2>/dev/null
        sleep 2
        
        # Start servers
        cd backend_template
        source venv/bin/activate
        uvicorn app.main:app --reload --port 8000 > /dev/null 2>&1 &
        cd ../BIDUA_Hosting-main
        npm run dev > /dev/null 2>&1 &
        cd ..
        
        sleep 2
        echo -e "${GREEN}✅ Servers restarted with clean cache${NC}"
        ;;
        
    5)
        echo -e "${BLUE}📊 Current status shown above${NC}"
        ;;
        
    6)
        echo -e "${BLUE}👋 Goodbye!${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        ;;
esac
