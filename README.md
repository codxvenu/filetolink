# Thunder File-to-Link Streaming Server (Node.js)

A high-performance Node.js and Express-based Telegram file-to-link and direct media streaming server. It features multi-session bot load balancing, an optimized sliding-window prefetch queue for maximum download speeds, and seamless range-request support for video seeking.

---

## Table of Contents

- [Core Components](#core-components)
- [Features](#features)
  - [HTTP Streaming & Seeking](#http-streaming--seeking)
  - [Multi-Bot Load Balancing](#multi-bot-load-balancing)
  - [Speed & Performance Optimization](#speed--performance-optimization)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)

---

## Core Components

The application is powered by three main files:

1. **[`app.js`](app.js):** The Express application server. It defines the HTTP endpoints for media streaming and downloads, parses Range headers, and manages response streaming pipelines.
2. **[`upload.js`](upload.js):** Contains the core streaming engine. It manages the `Readable` stream, interfaces with the GramJS sender, and implements the concurrent sliding-window prefetch queue.
3. **[`config/db.js`](config/db.js):** The client session manager. It boots up multiple bot clients in parallel, tracks active download workloads, and dynamically load-balances streaming requests to the least busy bot.

---

## Features

### HTTP Streaming & Seeking
- **Range Request Support (HTTP 206):** Correctly handles partial content range headers, enabling seamless video seeking in VLC, Chrome, Safari, and other media players.
- **Direct Attachment Downloads:** Direct attachments are served with appropriate headers (Content-Length, Content-Disposition, attachment filename) via `/download/:id`.

### Multi-Bot Load Balancing
- **Worker Rotation:** Automatically routes file streaming and location requests to the bot client with the lowest active workload.
- **Self-Throttling:** Limits each bot to a maximum of 4 concurrent streams to avoid overloading connection sessions.
- **Failover & Cooldowns:** Captures Telegram `FloodWait` cooldowns and temporarily benches rate-limited bots from the pool until their wait timers expire.

### Speed & Performance Optimization
- **Sliding-Window Prefetching:** Prefetches up to 4MB of chunks concurrently in the background, saturating your network pipe and eliminating latency pauses between blocks.
- **Chunk Alignment:** Aligns prefetch queue keys to exact 1MB block boundaries to guarantee cache hits during arbitrary range seeks.

---

## Project Structure

```text
filetolinkbotjs/
├── app.js               # Express application server and route handlers
├── upload.js            # Custom Readable streams and Telegram GetFile download handlers
└── config/
    └── db.js            # Client manager, concurrent bootstrapper, and load balancer
```

---

## Getting Started

### Prerequisites

* **Node.js** (v16 or higher recommended)
* **Telegram API credentials** (API ID & API Hash from [my.telegram.org](https://my.telegram.org))
* One or more **Telegram Bot Tokens** from [@BotFather](https://t.me/BotFather)

### Installation

1. Install the required Node.js dependencies:
   ```bash
   npm install express telegram dotenv
   ```

2. Start the Express server:
   ```bash
   node app.js
   ```

---

## Environment Setup

Create a `.env` file in the root directory:

```env
apiId=YOUR_TELEGRAM_API_ID
apiHash=YOUR_TELEGRAM_API_HASH

# Multiple bot tokens separated by "|" for load-balancing
botToken=BOT_TOKEN_1|BOT_TOKEN_2|BOT_TOKEN_3
```
