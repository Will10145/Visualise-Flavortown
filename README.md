# 🍔 Flavortown Devlog Timeline

A beautiful, minimal timeline UI for displaying Flavortown devlogs, built as a Cloudflare Worker.

## Features

- ✨ **Beautiful Timeline UI** - Sleek, animated timeline with gradient backgrounds
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Minimal & Modern** - Clean interface focusing on content
- 🚀 **Fast & Serverless** - Powered by Cloudflare Workers
- 🖼️ **Media Support** - Displays images and videos from devlogs
- 📊 **Engagement Metrics** - Shows likes and comments count
- ⏱️ **Duration Tracking** - Displays work duration for each devlog
- 🔗 **Scrapbook Integration** - Direct links to Scrapbook posts

## Getting Started

### Prerequisites

- Node.js installed
- Cloudflare account (free tier works)
- Wrangler CLI

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Login to Cloudflare:
\`\`\`bash
npx wrangler login
\`\`\`

3. Update `wrangler.toml` with your account ID (optional for development):
   - Find your account ID in the Cloudflare dashboard
   - Uncomment and update the `account_id` line

### Development

Run the worker locally:
\`\`\`bash
npm run dev
\`\`\`

Then open your browser to `http://localhost:8787`

### Deployment

Deploy to Cloudflare Workers:
\`\`\`bash
npm run deploy
\`\`\`

## Usage

1. Enter a Flavortown project ID in the search box
2. Click "Load Devlogs" or press Enter
3. Browse through the beautiful timeline of devlogs
4. Use pagination to navigate through multiple pages
5. Click on media to view full size
6. Click "View on Scrapbook" to see the original post

### URL Parameters

You can also pass the project ID as a URL parameter:
\`\`\`
https://your-worker.workers.dev/?project_id=123
\`\`\`

## API Endpoint

The worker also exposes an API endpoint for fetching devlogs:

\`\`\`
GET /api/devlogs?project_id=<id>&page=<page_number>
\`\`\`

## Tech Stack

- Cloudflare Workers
- Vanilla JavaScript (no frameworks!)
- CSS3 with animations and gradients
- Fetch API for data loading

## Features Breakdown

### Timeline Display
- Vertical timeline with connecting line
- Animated entry of devlog cards
- Hover effects and smooth transitions
- Visual indicators for each devlog

### Devlog Cards
- Creation date (relative and absolute)
- Duration badge
- Rich text body with proper formatting
- Media grid for images and videos
- Engagement metrics (likes, comments)
- Direct links to Scrapbook

### Pagination
- Previous/Next navigation
- Automatic disable when at boundaries
- Maintains project context across pages

## Customization

The UI can be easily customized by modifying the CSS in [worker.js](worker.js):
- Change gradient colors (search for `linear-gradient`)
- Adjust card styling (`.devlog` class)
- Modify animations (search for `@keyframes`)
- Update spacing and typography

## License

MIT
# Visualise-Flavortown
