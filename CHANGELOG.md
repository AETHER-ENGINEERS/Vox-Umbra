# Changelog — Vox Umbra

All notable changes to Vox Umbra will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial repository structure with OMARG-AIR-AID + AETHER-ENGINEERS license
- GitHub repository: `https://github.com/AETHER-ENGINEERS/Vox-Umbra`
- SSH key generation for GitHub access

### Changed
- Refactored from initial memory-based summarizer → search-based context retrieval
- Updated README to reflect new search-based architecture

---

## [1.0.0] - 2026-02-27

### Added
- **Search-based context summarizer** — On-demand Discord API search with intent extraction
- **Intent detection** — Auto-detects time-based (`last 24 hours`), user-based (`from @user`), and topic-based queries
- **Memory infrastructure** — Search results saved to `data/searches/` for debugging/audit
- **Thread-aware search** — Can target specific channels or threads
- **Search API wrapper** — Ready for real Discord search integration

### Changed
- **File structure updated:**
  - `src/handlers/message.js` — Now uses search-based context preparation
  - `src/handlers/context.js` → `src/handlers/search.js` — Renamed to reflect search-first approach
  - `src/commands/hello.js` → `src/commands/ping.js` — Updated command name
  - `data/summaries/` → `data/searches/` — Updated directory name

### Removed
- Old memory-based summarization (`context.js`)
- `/summary` slash command (replaced by invisible summarization)

---

## [0.1.0] - 2026-02-26

### Added
- **Initial repository setup** with OMARG-AIR-AID + AETHER-ENGINEERS license
- **Project structure:**
  - `src/index.js` — Main entry point
  - `src/handlers/message.js` — Text message handling
  - `src/commands/` — Slash commands
  - `config/` — Configuration templates
  - `data/summaries/` — Summary storage (gitignored)
- **Multimodal support** — Text + image upload handling
- **Commands:**
  - `/ping` — Test bot responsiveness
  - `/setup` — Status report

### Changed
- **Context tracking** — Early memory-based approach with 50-message sliding window

### Removed
- N/A (initial release)

---

## 📝 Notes

### Design Philosophy
- **Invisible summarization** — No user-facing commands needed
- **Search-first approach** — On-demand retrieval instead of holding context in memory
- **Thread-aware** — Separate context per channel/thread
- **Memory evolution** — Future: bot writes and retrieves "interesting" memories

### Upcoming Features
- ✅ Real Discord search API integration
- 🔄 Memory persistence system (save "interesting" moments)
- 🔄 Memory retrieval when bot is pinged
- 🔄 Caching strategy (short-term + long-term)
- 🔄 Kimi K2 integration for context-aware responses

---

*Generated automatically — last updated: 2026-02-27*
