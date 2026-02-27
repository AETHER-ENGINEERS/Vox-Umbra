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
│   │   ├── message.js        # Text message handling + context summarizer
│   │   └── context.js        # Core summarization logic (invisible infrastructure)
│   └── commands/
│       ├── hello.js          # /hello test command
│       └── setup.js          # /setup status report
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

## 📊 Channel Context Summarizer (Invisible Infrastructure)

**Design Philosophy:**
- Summarization is **silent and automatic** — no user-facing commands needed
- Only the last 10 messages are kept in full; older context is summarized
- When bot is pinged, it prepares context with summary + recent messages for Kimi K2
- **Thread awareness:** Separate summaries per channel/thread

**How it works:**
1. Bot tracks all messages per channel/thread
2. When pinged, it auto-summarizes everything before last 10 messages
3. Passes summary + last 10 messages to Kimi K2
4. Trims old context to avoid token bloat

**Why it matters:**
- Prevents context window overflow in busy channels
- Preserves only relevant conversation flow for Kimi K2
- "Invisible memory" — model remembers without cluttering chat
- Thread-specific — doesn't mix up different discussion topics

**No user commands needed** — this is all infrastructure for Kimi K2 model integration.

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
