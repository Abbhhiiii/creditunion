# 🤖 CreditAssist AI - LLM Agent Setup Guide

## 100% Open-Source Intelligent Agent with Conversation Memory

Your CreditAssist system now uses a **powerful LLM agent** powered by **Ollama** (fully local, no API limits).

---

## ⚡ Quick Start

### 1. **Install Ollama**
Download and install from: https://ollama.ai

**Windows:** Download the installer and run it
**Mac:** `brew install ollama`
**Linux:** `curl https://ollama.ai/install.sh | sh`

### 2. **Start Ollama Service**
```bash
ollama serve
```
You should see: `Listening on 127.0.0.1:11434`

### 3. **Pull an AI Model**
Open a new terminal and run:
```bash
ollama pull mistral
```

Other available models:
```bash
ollama pull llama2           # Meta's LLaMA 2 (7B)
ollama pull neural-chat      # Neural Chat 7B
ollama pull dolphin-mixtral  # Dolphin Mixtral
ollama pull orca-mini        # Orca Mini (very fast)
```

### 4. **Verify Setup**
```bash
curl http://localhost:11434/api/tags
```
Should return list of installed models.

### 5. **Start CreditAssist Backend**
In the `backend` folder:
```bash
npm run dev
```

You should see:
```
✓ CreditAssist AI Backend running on port 5000
✓ Environment: development
🤖 LLM Agent initialized - Model: mistral
📍 Ollama URL: http://localhost:11434
🔓 100% Open-Source, Zero API Limits
✓ Ollama connected
```

---

## 🎯 How It Works

### **Intelligent Agent Pipeline**

```
User Message
    ↓
[Conversation Memory] (maintains context)
    ↓
[LLM Agent] (Ollama - local, no limits)
    ↓
[Sentiment Analysis] (emotional awareness)
    ↓
[Intent Extraction] (understand user need)
    ↓
[Escalation Logic] (route complex issues)
    ↓
AI Response with Context
```

### **Key Features**

✅ **Conversation Memory** - Agent remembers previous messages in the conversation
✅ **Contextual Responses** - Uses full conversation history for intelligent replies
✅ **Sentiment Aware** - Detects emotion and adjusts tone accordingly
✅ **Smart Escalation** - Automatically escalates complex/urgent issues
✅ **100% Local** - No data leaves your machine
✅ **Zero API Costs** - Run unlimited conversations
✅ **Open-Source Models** - Use Mistral, LLaMA, or any Ollama model

---

## 🧠 Conversation Memory in Action

**Example:**
```
User: "What's my balance?"
Agent: "Your account shows $5,432.10. How can I help?"
[Memory stores: balance inquiry, amount discussed]

User: "Is it enough for a $3,000 purchase?"
Agent: "Yes! With $5,432.10, you have plenty for a $3,000 purchase."
[Agent uses memory - knows the balance without being told again]

User: "Great! Block my card then."
Agent: "I'll block your card. Just to confirm - you still want to keep the $5,432.10 available for emergencies, right?"
[Agent remembers context of the conversation]
```

---

## 📊 Model Performance

| Model | Size | Speed | Quality | Recommended |
|-------|------|-------|---------|------------|
| **mistral** | 7B | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ Good | ✅ Best Balance |
| **llama2** | 7B | ⚡⚡ Medium | ⭐⭐⭐⭐ Good | ✅ Alternative |
| **orca-mini** | 3B | ⚡⚡⚡⚡ Very Fast | ⭐⭐⭐ Okay | For low-power devices |
| **neural-chat** | 7B | ⚡⚡ Medium | ⭐⭐⭐⭐⭐ Excellent | Best Quality |
| **dolphin-mixtral** | 46B | ⚡ Slow | ⭐⭐⭐⭐⭐ Excellent | Needs 16GB+ RAM |

---

## 🔧 Configuration

Edit `.env` to change:
```bash
OLLAMA_URL=http://localhost:11434
LLM_MODEL=mistral    # Change to: llama2, neural-chat, etc
```

Then restart the backend.

---

## 🚀 Test the Agent

### **Via Chat Interface**
1. Open http://localhost:3000
2. Send messages - agent will remember context
3. Try multi-turn conversations

### **Via API**
```bash
# Start conversation
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my balance?",
    "conversation_id": "conv-123"
  }'

# Continue conversation (agent remembers!)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Is that enough for a purchase?",
    "conversation_id": "conv-123"
  }'
```

---

## 🐛 Troubleshooting

### **"Connection refused" error**
```bash
# Make sure Ollama is running
ollama serve
```

### **"Model not found" error**
```bash
# Pull the model
ollama pull mistral
```

### **Slow responses**
- Use a faster model: `ollama pull orca-mini`
- Or get a GPU for Ollama (check ollama.ai docs)

### **Out of memory**
- Use a smaller model: `orca-mini` (3B)
- Or increase system RAM

---

## 📈 Advanced: Custom Models

Use any Ollama-compatible model:
```bash
ollama pull wizard-vicuna
ollama pull openhermes
```

Then update `.env`:
```bash
LLM_MODEL=wizard-vicuna
```

---

## 🎓 Learning More

- **Ollama**: https://github.com/ollama/ollama
- **Mistral AI**: https://www.mistral.ai/
- **Meta LLaMA**: https://www.meta.com/llama/
- **Open-Source LLMs**: https://huggingface.co

---

## ✅ You're All Set!

Your CreditAssist system is now:
- ✅ Powered by intelligent LLM agent
- ✅ Running 100% open-source locally
- ✅ With unlimited conversation potential
- ✅ With conversation memory for context
- ✅ With zero API costs or rate limits

**Start chatting now!** 🚀
