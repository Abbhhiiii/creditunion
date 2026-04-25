# CreditAssist AI - Quick Reference Guide

## 🎯 System Overview

This is a **3-layer autonomous financial resolution engine** for credit unions:
1. **Member Interface** (Chat + Voice)
2. **AI Resolution Engine** (Intent + RAG + Decision)
3. **Staff Dashboard** (Case Management)

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../dashboard && npm install

# 2. Start services (3 terminals)
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm run dev
Terminal 3: cd dashboard && npm run dev

# 3. Access
- Chat: http://localhost:3000
- Dashboard: http://localhost:3001
- API: http://localhost:5000
```

---

## 📊 Data Flow

```
Member Message
    ↓
[Intent Classification]  (What does member want?)
    ↓
[Sentiment Analysis]     (What emotion are they in?)
    ↓
[Decision Engine]        (How should we respond?)
    ├→ Auto-resolve (balance, card block, etc)
    ├→ Retrieve from RAG (policies, rates)
    ├→ Prompt action (account update)
    └→ Escalate (complex issues)
    ↓
[Response Generation]
    ↓
Member Sees Response
    ↓
[If Escalated] → Staff Dashboard → Staff Resolves
```

---

## 🧠 Intent Types (9+)

| Intent | Action | Example |
|--------|--------|---------|
| `balance_inquiry` | Auto-resolve | "What's my balance?" |
| `card_block` | Auto-resolve | "Block my card" |
| `card_unblock` | Auto-resolve | "Unblock my card" |
| `transaction_dispute` | Escalate | "Unauthorized charge" |
| `loan_status` | RAG → Escalate | "Where's my loan?" |
| `account_update` | Action guide | "Update my address" |
| `interest_rate` | RAG | "What's the rate?" |
| `fee_inquiry` | RAG | "How much is the fee?" |
| `complaint` | Escalate | "I'm frustrated!" |
| `greeting` | Auto-respond | "Hello!" |

---

## 🎓 Testing Scenarios

### Test 1: Balance Inquiry
```
Input: "What's my balance?"
→ Classified: balance_inquiry
→ Decision: auto_resolve
→ Response: "Your balance is $5,234.50"
→ Status: ✅ Resolved
```

### Test 2: Angry Customer
```
Input: "I'M FURIOUS! STOLEN CHARGES!"
→ Sentiment: angry
→ Decision: ESCALATE IMMEDIATELY
→ Status: 🔴 High Priority
→ Staff gets: Structured summary
```

### Test 3: Policy Question
```
Input: "What's your interest rate?"
→ Classified: interest_rate
→ RAG retrieval: Searches knowledge base
→ Response: Based on retrieved document
→ Status: ✅ Resolved via RAG
```

### Test 4: Complex Dispute
```
Input: "$500 charge I didn't make"
→ Classified: transaction_dispute
→ Sentiment: frustrated
→ RAG: Gets dispute process
→ Decision: Escalate (complex + emotion)
→ Status: 🔴 Escalated to staff
```

---

## 📁 Key Files

### Backend
- `server.js` - Main API server
- `services/aiService.js` - AI orchestration
- `services/intentClassifier.js` - Intent detection
- `services/sentimentAnalyzer.js` - Emotion detection
- `services/decisionEngine.js` - Routing logic
- `services/ragEngine.js` - Knowledge retrieval

### Frontend
- `components/ChatInterface.jsx` - Main chat
- `components/MessageBubble.jsx` - Message display
- `components/VoiceInput.jsx` - Speech to text
- `pages/chat.jsx` - Chat page

### Dashboard
- `pages/dashboard.jsx` - Main dashboard
- `components/CaseList.jsx` - Case list
- `components/CaseDetail.jsx` - Case detail
- `components/Analytics.jsx` - Stats

### Knowledge Base
- 10 `.txt` files with policies, procedures, rates, etc.

---

## 🔑 Key Features

✅ **Intent Classification** - Detects user intent (9+ types)
✅ **Sentiment Analysis** - Measures emotional tone
✅ **RAG System** - Retrieves answers from knowledge base
✅ **Auto-resolution** - Resolves 40%+ of issues
✅ **Smart Escalation** - Routes complex cases to staff
✅ **Case Management** - Dashboard for staff
✅ **Multi-language** - English, Hindi, Kannada
✅ **Voice Input** - Web Speech API
✅ **Analytics** - Real-time metrics
✅ **Multi-turn Memory** - Remembers context

---

## 🔐 API Endpoints

### Chat
```
POST /api/chat/message
{
  "message": "What's my balance?",
  "conversation_id": "conv-123",
  "language": "en"
}
→ Response with AI answer + metadata
```

### Cases
```
GET /api/cases
→ List all cases for staff

PATCH /api/cases/:caseId
{
  "status": "resolved",
  "resolution": "...",
  "notes": "..."
}
→ Update case status
```

### Analytics
```
GET /api/analytics/dashboard
→ Dashboard statistics
```

### Auth
```
POST /api/auth/login
POST /api/auth/register
→ JWT token
```

---

## 🎨 UI Components

### Chat Interface
- Message bubbles (user + AI)
- Suggested prompts (quick actions)
- Voice input button
- Language selector
- Metadata display (sentiment, status)

### Staff Dashboard
- Case list with filtering
- Tabs (all, pending, resolved, escalated)
- Case detail panel
- Analytics sidebar
- Action buttons

---

## 📊 Database Schema

**Tables:**
- `users` - Members and staff
- `conversations` - Chat sessions
- `messages` - Individual messages
- `cases` - Escalated issues
- `knowledge_docs` - Knowledge base
- `analytics` - Metrics
- `audit_log` - Activity log

---

## 🚀 Deployment

### Local (Docker)
```bash
docker-compose -f deployment/docker-compose.yml up
```

### Cloud (Free)
```bash
Frontend  → Vercel
Backend   → Render
Database  → Supabase
```

See `deployment/DEPLOYMENT-GUIDE.md` for details.

---

## 🧪 Testing

### Run Demo
```bash
bash deployment/demo.sh
```

### Manual Testing
1. Open http://localhost:3000
2. Type "What's my balance?"
3. See AI response
4. Check dashboard at http://localhost:3001

---

## 🐛 Debugging

### Backend Logs
```bash
cd backend && npm run dev
# Logs to console
```

### Database
```bash
# Connect to local DB
psql creditassist

# List tables
\dt

# View messages
SELECT * FROM messages LIMIT 5;
```

### Frontend Console
```javascript
// Open DevTools (F12)
// Check Console for errors
```

---

## 📈 Performance Tips

1. **Cache RAG Results** - Don't re-retrieve same docs
2. **Batch Analytics** - Update dashboard every 30s
3. **Connection Pooling** - Use `pg.Pool`
4. **Message Pagination** - Load 50 at a time
5. **Lazy Loading** - Components on demand

---

## 🔐 Security Checklist

- [ ] JWT token expiry set (24h)
- [ ] CORS whitelist configured
- [ ] Database password secure (changed from example)
- [ ] HTTPS enforced in production
- [ ] Input validation on all routes
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting enabled
- [ ] Audit logging active

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `kill -9 $(lsof -ti :5000)` |
| DB connection error | Check DATABASE_URL in .env |
| CORS error | Update FRONTEND_URL in backend .env |
| Vercel build fails | Run `npm install` locally first |
| Dashboard not loading | Ensure backend is running |

---

## 📚 Knowledge Base Files

1. **account-policies.txt** - Account types, fees, rules
2. **loan-products.txt** - All loan types and terms
3. **dispute-resolution.txt** - Dispute process steps
4. **card-services.txt** - Card features and management
5. **interest-rates.txt** - All interest rates
6. **account-procedures.txt** - How to do things
7. **credit-scores.txt** - CIBIL and credit info
8. **digital-banking.txt** - Online banking features
9. **customer-support.txt** - Support channels
10. **security-fraud-prevention.txt** - Security tips

---

## 🎯 Success Metrics

- **Intent Accuracy:** 90%+
- **Auto-resolution:** 40%+ of issues
- **Sentiment Detection:** 85%+ accuracy
- **Response Time:** <2 seconds
- **Staff Satisfaction:** Easy to use dashboard

---

## 🚀 Next Steps

1. Deploy to cloud (see deployment guide)
2. Train on real conversations
3. Expand knowledge base
4. Add more intent types
5. Integrate with bank systems
6. Monitor and optimize

---

**Made with ❤️ for credit unions | Production-ready AI | Free deployment**
