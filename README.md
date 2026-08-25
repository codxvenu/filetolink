# Thunder File-to-Link Streaming Server & Bot (Node.js)

A high-performance Node.js and Express-based Telegram file-to-link, direct media streaming server, and interactive Telegram bot. It features multi-session bot load balancing, an optimized sliding-window prefetch queue for maximum download speeds, and seamless range-request support for video seeking, alongside automated backup channel storage and an interactive command interface.

---

## Table of Contents

- [Core Components](#core-components)
- [Features](#features)
  - [HTTP Streaming & Seeking](#http-streaming--seeking)
  - [Multi-Bot Load Balancing](#multi-bot-load-balancing)
  - [Speed & Performance Optimization](#speed--performance-optimization)
  - [Interactive Telegram Bot Interface](#interactive-telegram-bot-interface)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [HTTP Web API Endpoints](#http-web-api-endpoints)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Core Components

The application is powered by these main layers:

1. **[`app.js`](app.js):** The Express application server. It defines HTTP endpoints for streaming, downloads, and workload stats, and initializes both the client balancing pool and the Telegram bot.
2. **[`streamer.js`](streamer.js):** Contains the core streaming engine. It manages the `Readable` stream, interfaces with the GramJS client sender, and implements the aligned concurrent sliding-window prefetch queue.
3. **[`config/db.js`](config/db.js):** The client session manager. It boots up multiple bot clients in parallel, tracks active download workloads, and dynamically load-balances streaming requests.
4. **[`tgbot/`](tgbot/):** The Telegram Bot interface application. It listens for files sent to the bot, automatically forwards them to a private backup channel to obtain persistent IDs, and responds to users with download & streaming links.

---

## Features

### HTTP Streaming & Seeking
- **Range Request Support (HTTP 206):** Correctly handles partial content range headers, enabling seamless video seeking in VLC, Chrome, Safari, and other media players.
- **Direct Attachment Downloads:** Direct attachments are served with appropriate headers (Content-Length, Content-Disposition, and original filename/MIME-type) via `/download/:id`.

### Multi-Bot Load Balancing
- **Worker Rotation:** Automatically routes file streaming and location requests to the bot client with the lowest active workload.
- **Self-Throttling:** Limits each bot to a maximum of 4 concurrent streams to avoid overloading connection sessions.
- **Failover & Cooldowns:** Captures Telegram `FloodWait` cooldowns and temporarily benches rate-limited bots from the pool using timestamp-based recovery.

### Speed & Performance Optimization
- **Sliding-Window Prefetching:** Prefetches up to 4MB of chunks concurrently in the background, saturating your network pipe and eliminating latency pauses between blocks.
- **Chunk Alignment:** Aligns prefetch queue keys to exact 1MB block boundaries to guarantee cache hits during arbitrary range seeks.

### Interactive Telegram Bot Interface
- **Auto Link Generation:** Send any file to the bot in private chat to instantly get seekable stream and high-speed download links.
- **Auto Backup Forwarding:** Media files sent to the bot are forwarded to a private backup channel to store the message and generate a static file reference ID.
- **Interactive Commands & Buttons:** Includes inline keyboard buttons and full Markdown response guides.

---

## Project Structure

```text
filetolinkbotjs/
├── app.js               # Express application server and route headers
├── streamer.js          # Custom Readable streams and Telegram GetFile download handlers
├── bot.json             # Registry storing authenticated bot StringSessions
├── config/
│   └── db.js            # Client manager, concurrent bootstrapper, and load balancer
└── tgbot/               # Telegram Bot codebase
    ├── app.js           # Event handlers for commands and new messages
    ├── commands.js      # Configuration and logic for bot commands
    ├── db.js            # Main TelegramClient instance for the bot interaction
    ├── constants/       # Markdown template files for bot responses (.md format)
    │   ├── about.md     # /about command reply
    │   ├── help.md      # /help command reply
    │   ├── welcome.md   # /start command reply
    │   ├── stat.md      # /stats command reply layout
    │   └── link.md      # Link response layout
    └── utility/
        └── tg.js        # Formatting, link builder, and stats utilities
```

---

## Getting Started

### Prerequisites

* **Node.js** (v16 or higher recommended)
* **Telegram API credentials** (API ID & API Hash from [my.telegram.org](https://my.telegram.org))
* One or more **Telegram Bot Tokens** from [@BotFather](https://t.me/BotFather)
* A **Private Backup Channel** (where the bot is an admin with post privileges)

### Installation

1. Install the required Node.js dependencies:
   ```bash
   npm install express telegram dotenv
   ```

2. Start the application:
   ```bash
   node app.js
   ```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
apiId=YOUR_TELEGRAM_API_ID
apiHash=YOUR_TELEGRAM_API_HASH

# Multiple bot tokens separated by "|" for stream load-balancing
botToken=BOT_TOKEN_1|BOT_TOKEN_2|BOT_TOKEN_3

# The main interaction bot StringSession
session=YOUR_BOT_STRING_SESSION

# Backup channel ID where media files are stored/forwarded
backupChannel=-100XXXXXXXXXX
```

---

## HTTP Web API Endpoints

The server exposes the following web endpoints:

* **Stream / Seek Endpoint:** `GET /stream/:id`
* **Direct Download Endpoint:** `GET /download/:id`
* **Workload Monitoring Console:** `GET /stats` - Returns a real-time status table of bot client IDs and their active streaming workloads.

---

## Bot Commands

Users can interact with the Telegram bot using the following commands:

* `/start` 👋 - Welcome message, quick-start guide, and inline keyboard helper.
* `/help` 📖 - Shows the help menu with step-by-step usage guidelines.
* `/about` ℹ️ - Technical information about the bot backend.
* `/ping` 📡 - Verifies bot responsiveness and measures network latency.
* `/stats` 📊 - (Admin/Utility) Shows system uptime, registered bots, and active workload load statistics.

---

## Contributing

We welcome contributions! To contribute to this project:
1. **Raise an Issue First:** Open an issue in the repository explaining what you want to add or change. Let us know your proposal so we can align.
2. **Fork the Repo:** Fork the repository and create your feature branch.
3. **Submit a Pull Request:** Implement your changes and submit a pull request back to the main branch for review.

---

## Disclaimer

This software is provided for educational and research purposes only. The authors do not encourage or condone the downloading, streaming, or sharing of copyrighted media. Any use of this application for copyright infringement or in violation of Telegram's Terms of Service is entirely at the user's own risk and responsibility.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


