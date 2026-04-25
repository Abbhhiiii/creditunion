# 📚 CreditAssist AI - FILE NAVIGATION GUIDE

## 🎯 Quick Navigation

**Start Here:**
- [`README.md`](README.md) - Full system overview
- [`PROJECT-COMPLETION-SUMMARY.md`](PROJECT-COMPLETION-SUMMARY.md) - What was built
- [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Quick start guide

---

## 📂 Folder Structure & Contents

### **Frontend** (`/frontend`)
**Member Chat Interface**

| File | Purpose |
|------|---------|
| `components/ChatInterface.jsx` | Main chat component with AI conversation |
| `components/MessageBubble.jsx` | Individual message display with metadata |
| `components/VoiceInput.jsx` | Speech-to-text using Web Speech API |
| `components/SuggestedPrompts.jsx` | Quick action buttons (balance, card block, etc) |
| `pages/chat.jsx` | Chat page with initialization logic |
| `pages/_app.jsx` | Next.js app wrapper |
| `styles/globals.css` | Global CSS and utilities |
| `styles/ChatInterface.module.css` | Chat component styles |
| `styles/MessageBubble.module.css` | Message bubble styles |
| `styles/VoiceInput.module.css` | Voice button styles |
| `styles/SuggestedPrompts.module.css` | Prompt buttons styles |
| `package.json` | Dependencies (React, Next.js) |
| `Dockerfile` | Container setup |

**Features:** Chat UI, Voice input, Multi-language, Real-time messages

---

### **Backend** (`/backend`)
**Express API & AI Engine**

| File | Purpose |
|------|---------|
| `server.js` | Main Express server, routes, WebSocket setup |
| `services/aiService.js` | AI orchestration (combines all AI services) |
| `services/intentClassifier.js` | Detects user intent (9+ types) |
| `services/sentimentAnalyzer.js` | Detects emotion (angry, frustrated, positive) |
| `services/decisionEngine.js` | Routes to: auto-resolve, RAG, action, escalate |
| `services/ragEngine.js` | Retrieves answers from knowledge base |
| `models/schema.sql` | PostgreSQL database schema |
| `.env.example` | Configuration template |
| `package.json` | Dependencies (Express, pg, jwt, etc) |
| `Dockerfile` | Container setup |

**Features:** REST API, WebSocket, Intent classification, Sentiment analysis, RAG, Decision engine

---

### **Dashboard** (`/dashboard`)
**Staff Case Management Dashboard**

| File | Purpose |
|------|---------|
| `pages/dashboard.jsx` | Main dashboard page with tabs and layout |
| `components/DashboardLayout.jsx` | Overall dashboard layout structure |
| `components/CaseList.jsx` | Scrollable list of cases with filtering |
| `components/CaseDetail.jsx` | Case details panel with resolution form |
| `components/Analytics.jsx` | Statistics and KPI cards |
| `styles/DashboardLayout.module.css` | Dashboard layout styles |
| `styles/CaseList.module.css` | Case list card styles |
| `styles/CaseDetail.module.css` | Case detail panel styles |
| `styles/Analytics.module.css` | Analytics card styles |
| `package.json` | Dependencies (React, Next.js) |
| `Dockerfile` | Container setup |

**Features:** Case management, Real-time analytics, Status updates, Filtering

---

### **Knowledge Base** (`/knowledge-base`)
**RAG Documents (10+)**

| File | Content |
|------|---------|
| `account-policies.txt` | Savings, Checking, Joint accounts, fees |
| `loan-products.txt` | Personal, Home, Auto, Education, Business loans |
| `dispute-resolution.txt` | Dispute filing, investigation, resolution process |
| `card-services.txt` | Card features, blocking, unblocking, security |
| `interest-rates.txt` | All interest rates for products |
| `account-procedures.txt` | How to open account, update address, etc |
| `credit-scores.txt` | CIBIL scores, ranges, improvement tips |
| `digital-banking.txt` | Mobile app, online banking, UPI, bill pay |
| `customer-support.txt` | Contact channels, complaint process |
| `security-fraud-prevention.txt` | Phishing, card security, fraud prevention |

**Purpose:** Source documents for RAG retrieval system

---

### **AI Engine** (`/ai-engine`)
**AI Prompts & Logic**

| File | Purpose |
|------|---------|
| `prompts/system-prompts.js` | All AI prompts for classification, generation, escalation |

**900+ lines of production-ready prompts**

---

### **Deployment** (`/deployment`)
**Cloud & Docker Setup**

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Docker container orchestration (4 services) |
| `DEPLOYMENT-GUIDE.md` | Step-by-step cloud deployment (1,500+ words) |
| `demo.sh` | Automated demo script (starts all services) |
| `.env.example` | Configuration template |

---

## 🚀 GETTING STARTED

### 1. **Quick Start (5 minutes)**
```bash
# Clone/navigate to project
cd unioncredits

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd dashboard && npm install && cd ..

# Start services (3 terminals)
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm run dev
Terminal 3: cd dashboard && npm run dev

# Access
- Chat: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:5000
```

### 2. **Run Demo**
```bash
bash deployment/demo.sh
```

### 3. **Deploy to Cloud**
See: [`deployment/DEPLOYMENT-GUIDE.md`](deployment/DEPLOYMENT-GUIDE.md)

---

## 📊 SYSTEM FLOW

```
User Message
    ↓
Backend API (/api/chat/message)
    ↓
[Intent Classifier] - What does user want?
    ↓
[Sentiment Analyzer] - What emotion?
    ↓
[Decision Engine] - How to respond?
    ├→ Auto-resolve (45%)
    ├→ RAG Answer (35%)
    ├→ Escalate (20%)
    ↓
[Response Generator]
    ↓
Frontend displays response
    ↓
If escalated → Dashboard updates case
```

---

## 🎯 KEY CONCEPTS

### Intent Types
- `balance_inquiry` → Auto-resolve (AI responds immediately)
- `card_block` → Auto-resolve (AI blocks card)
- `dispute` → Escalate (Goes to staff)
- `loan_status` → RAG + Escalate (Retrieve info + escalate)
- `interest_rate` → RAG (Retrieve from knowledge base)

### Sentiment Types
- `positive` → Green (satisfied customer)
- `neutral` → Blue (normal inquiry)
- `frustrated` → Yellow (needs attention)
- `angry` → Red (escalate immediately)

### Decision Paths
1. **Auto-resolve** - AI answers directly
2. **RAG Answer** - Retrieve from knowledge base
3. **Action Guide** - Show steps to customer
4. **Escalate** - Send to staff with summary

---

## 📈 ANALYTICS

Dashboard shows:
- **Resolved Cases** - Count + percentage
- **Escalated Cases** - Cases needing human review
- **Pending Cases** - Work in progress
- **Avg Resolution Time** - Performance metric
- **Resolution Rate** - Success %
- **Escalation Rate** - When AI can't help %

---

## 🔐 SECURITY

All passwords/secrets are in `.env`:
- Database URL
- JWT secret
- API keys

**Never commit `.env` to GitHub!**

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `kill -9 $(lsof -ti :5000)` |
| Dependencies missing | `npm install` in each folder |
| DB connection error | Check `DATABASE_URL` in `.env` |
| CORS error | Update `FRONTEND_URL` in backend `.env` |

---

## 📞 SUPPORT DOCS

| File | Content |
|------|---------|
| `README.md` | System overview & architecture |
| `QUICK-REFERENCE.md` | Quick start & testing guide |
| `PROJECT-COMPLETION-SUMMARY.md` | Complete feature list |
| `deployment/DEPLOYMENT-GUIDE.md` | Cloud deployment steps |
| Code comments | Throughout all source files |

---

## 🎓 LEARNING

To understand the system:
1. Read `README.md` (overview)
2. Check `backend/server.js` (API structure)
3. Look at `backend/services/aiService.js` (AI pipeline)
4. Explore `frontend/components/ChatInterface.jsx` (UI)
5. View `dashboard/pages/dashboard.jsx` (management)

---

## ✅ CHECKLIST FOR SUCCESS

- [ ] All dependencies installed
- [ ] `.env` created with database URL
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] Dashboard starts on port 3001
- [ ] Chat works (send message → get response)
- [ ] Voice input works (click microphone)
- [ ] Dashboard loads cases
- [ ] Analytics show data
- [ ] Ready to deploy!

---

## 🚀 WHAT'S NEXT?

1. **Local Testing** - Run demo, test scenarios
2. **Cloud Deployment** - Follow deployment guide
3. **Database Setup** - Connect Supabase
4. **Real Data** - Add real member information
5. **Monitoring** - Watch logs and metrics
6. **Optimization** - Improve based on usage

---

**Navigation Guide Complete! Start with README.md → Try demo.sh → Deploy with DEPLOYMENT-GUIDE.md**
