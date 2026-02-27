# Vox-Umbra — Lightweight Personality Bot Framework

**Project Status:** ✅ **V1.0 - Framework Core Complete**  
**License:** OMARG-AIR-AID + AETHER-ENGINEERS Multiversal License  
**Current Model:** Groq/Kimi K2 (multimodal)  
**Target:** Multiple independent personality bots for #OneMoment & Thelema  

---

## 🎯 Core Concept

**Deploy multiple independent bots**, each hosting its own distinct personality:

- ✅ **Lightweight bots** — no full OpenClaw inside them
- ✅ **Discord as workspace** — bots live in Discord
- ✅ **Delegation to OMARG Agent** — they ask you (Qi OS) for complex tasks
- ✅ **Personality-driven memory** — each bot has its own memory schema

---

## 📁 Project Structure

```
Vox-Umbra/
├── core/                       # Framework core (personality-agnostic)
│   ├── delegation/            # Delegation system (to OMARG Agent)
│   ├── memory/                # Memory store, writer, retriever
│   ├── search/                # Discord search API wrapper
│   ├── context/               # Context builder
│   └── utils/                 # Safe file utilities
├── personalities/             # Drop-in personalities (config + logic)
│   ├── voxumbra/              # Default personality
│   ├── alastor/               # Alastor personality
│   ├── omarg/                 # OMARG Agent personality
│   └── <new_personality>/     # Add your own!
├── src/                       # Bot entry point
│   ├── index.js               # Main entry
│   ├── handlers/
│   │   ├── message.js         # Message handling
│   │   └── search.js          # Search integration
│   └── commands/              # Slash commands
├── config/
│   └── bot.json               # Bot config + personality selector
├── data/                      # Generated data (gitignored)
│   ├── memories/              # Personality memories
│   ├── searches/              # Search results
│   └── images/                # Saved favorite images
├── dashboard/                 # Web dashboard (Coming Soon)
├── LICENSE_BLOCK.md           # Full license block (preserve!)
├── CHANGELOG.md
└── README.md                  # This file
```

---

## 🚀 Quick Start: Create a New Personality Bot

### Step 1: Clone the Repo

```bash
git clone git@github.com:AETHER-ENGINEERS/Vox-Umbra.git
cd Vox-Umbra
cp -r personalities/voxumbra personalities/YOUR_PERSONALITY_NAME
```

### Step 2: Customize Personality

Edit `personalities/YOUR_PERSONALITY_NAME/schema.json`:

```json
{
  "personality": "YOUR_PERSONALITY_NAME",
  "description": "Your personality description",
  "schema": {
    "required": ["content", "significance", "type"],
    "allowedTypes": ["event", "insight", "pattern", "emotion", "connection"],
    "allowedSignificances": ["low", "medium", "high", "critical"]
  }
}
```

### Step 3: Configure Bot

Edit `config/bot.json`:

```json
{
  "bot": {
    "name": "YOUR_PERSONALITY_BOT_NAME"
  },
  "personality": "YOUR_PERSONALITY_NAME",
  "framework": {
    "memory": {
      "enabled": true,
      "limit": 10
    }
  }
}
```

### Step 4: Set Discord Token

```bash
cp config/bot_token.example config/bot_token.json
# Add your Discord bot token to config/bot_token.json
```

### Step 5: Run the Bot

```bash
npm install
npm start
```

---

## 🔧 Delegation System

Personality bots delegate complex tasks to OMARG Agent (Qi OS):

| Task Type | Delegate Function | OMARG Handles |
|-----------|------------------|---------------|
| `web_search` | `webSearch(personality, query)` | Web browsing, real-time search |
| `image_generation` | `generateImage(personality, prompt)` | Image generation |
| `image_save` | `saveFavoriteImage(personality, imageUrl, prompt)` | Save favorite images |
| `voice_synthesis` | (Coming Soon) | Voice generation |
| `linux_command` | `linuxCommand(personality, command)` | Linux shell commands |
| `python_exec` | `pythonExec(personality, code)` | Python execution |

### Example Usage

```javascript
const { webSearch, generateImage, linuxCommand } = require('../core/delegation');

// Search the web
const searchResult = await webSearch('voxumbra', 'Thelema definitions');

// Generate an image
const imageResult = await generateImage('voxumbra', 'A golden thread coiling through a hex grid', 'thelema');

// Execute a Linux command
const commandResult = await linuxCommand('voxumbra', 'ls -la');
```

---

## 📊 Personality Memory System

Each personality has its own memory store:

```
data/memories/
├── voxumbra/
│   ├── abc123def456.json
│   └── ...
├── alastor/
│   ├── xyz789abc012.json
│   └── ...
└── omarg/
    └── ...
```

**Memory Schema** (in `personalities/NAME/schema.json`):

- Define required fields
- Allowed types
- Allowed significances
- Optional metadata (tags, entity_state, context)

---

## 🛠️ Technical Details

### Model Agnostic

Currently uses **Kimi K2 (groq/moonshotai/kimi-k2-instruct-0905)** via OpenClaw.

Framework is **model-agnostic** — easy to swap later:
- Local models (GGUF/Ollama)
- Offline models
- Different API providers

### Search Integration

- **Discord API search** — real-time channel/thread search
- **Intent detection** — auto-detects time/user/topic queries
- **Context summarization** — search results + memory blend

### Safety Features

- ✅ No hardcoded tokens (config/bot_token.json gitignored)
- ✅ Safe file utilities (error handling)
- ✅ Memory validation per schema
- ✅ Full license preservation

---

## 📋 Next Steps

1. **Personalities** — Add more personalities (each = config + schema)
2. **Dashboard** — Web UI for monitoring/personality management
3. **Voice Support** — Voice synthesis integration
4. **Image Gallery** — Browse saved favorite images
5. **Webhook Delegation** — Real OMARG API integration

---

## 🧪 Local Testing Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
# Edit .env with your OMARG_API_TOKEN and Discord bot token
```

3. **Run the mock OMARG server (in one terminal):**
```bash
node mock-omarg-server.js
```

4. **Run the bot (in another terminal):**
```bash
node src/index.js
```

### Testing Delegation

Run the delegation test script:
```bash
node test-delegation.js
```

This will test all delegation types:
- ✅ Web search
- ✅ Image generation
- ✅ Linux commands
- ✅ Python execution
- ✅ Weather check

---

## 📜 License

> **Full license block preserved in `LICENSE_BLOCK.md`**
>
> This project is open-source and is licensed under the Conditional OMARG and AETHER-ENGINEERS multiversal license...

**YOU ARE FULLY PROTECTED UNDER THE LICENSE.**  
Go all-in with maximum creativity, speed, and joy. 🦞⚡

---

*Vox Umbra v1.0.0 — AETHER-ENGINEERS*
