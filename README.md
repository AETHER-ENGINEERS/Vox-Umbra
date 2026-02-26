# Vox Umbra — Multimodal Discord Bot

**Bot Name:** `Vox Umbra`  
**Purpose:** Support #OneMoment and AETHER-ENGINEERS interactions on Discord with multimodal capabilities  
**Primary Model:** Kimi K2 (groq/moonshotai/kimi-k2-instruct-0905)  
**Interface:** OpenClaw → Discord  

---

## 📜 License

> This project preserves the full [LICENSE_BLOCK.md](LICENSE_BLOCK.md) at the top of all outputs, code, and configurations.

---

## 🛠️ Setup Steps Completed

- ✅ SSH key generated for GitHub (`ssh/voxumbra_github`)
- ✅ Repo cloned: `https://github.com/AETHER-ENGINEERS/Vox-Umbra`
- 🟡 Discord bot app creation pending (next step)
- 🟡 Multimodal config setup pending

---

## 📁 Project Structure

```
Vox-Umbra/
├── LICENSE_BLOCK.md          # OMARG-AIR-AID + AETHER-ENGINEERS license
├── README.md                 # This file
├── config/
│   ├── bot_token.example     # Template (DO NOT commit real tokens)
│   └── multimodal_settings.json
├── src/
│   ├── index.js              # Main entry point
│   ├── handlers/
│   │   ├── message.js        # Text message handling + channel summarizer
│   │   └── interaction.js    # Slash commands + modals
│   ├── commands/
│   │   ├── hello.js          # /hello test command
│   │   ├── setup.js          # /setup status report
│   │   └── summary.js        # /summary channel/thread summaries
│   └── utils/
│       └── discord.js        # Utility functions
├── data/
│   └── summaries/            # Auto-generated summaries (gitignored)
└── README.md
```

---

## 📥 Next Steps (What We Need From You)

1. **Create Discord Bot App**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click **New Application**
   - Name: `Vox Umbra`
   - Click **Add Bot**
   - Under **Bot** tab:
     - Enable **MESSAGE CONTENT INTENT**
     - Enable **PRIVILEGED GATEWAY INTENTS** (for multimodal)
   - Copy the **Bot Token** and paste it here (I’ll save it securely in `config/bot_token.example`)

2. **Once token is ready**, I’ll:
   - Set up multimodal config (text + image support)
   - Write starter code
   - Push to GitHub

---

## 📊 Channel Summarizer Feature

**How it works:**
- Tracks all messages per channel/thread
- Auto-summarizes every 25 messages or after 15 min idle
- Saves summaries to `data/summaries/` (gitignored)
- Provides `/summary` slash command to query recent summaries

**Commands:**
- `/summary` — Get latest summary for current channel
- `/summary --hours=24` — Custom time range (1-24 hours)
- `/summary --thread=true` — Summarize current thread

**Why it matters:**
- Reduces token usage (summarized context instead of raw messages)
- Preserves important discussion threads
- Enables "memory" for Kimi K2 model integration

---

## 💬 multimodal Capabilities Plan

| Feature | Status |
|---------|--------|
| Text responses | ✅ Completed |
| Image uploads/reactions | ✅ Completed |
| Image analysis (caption, OCR) | ✅ Implemented |
| Channel summarizer | ✅ Implemented |
| Voice responses (TTS) | 🟡 Later |
| Video/URL previews | 🟡 Later |

---

Let me know when the bot token is ready — I’ll handle the rest! 🚀
