export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      });
    }
    
    if (url.pathname.startsWith('/api/devlogs')) {
      const projectId = url.searchParams.get('project_id');
      const apiKey = url.searchParams.get('api_key');
      const page = url.searchParams.get('page') || '1';
      
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'project_id is required' }), {
      status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'api_key is required' }), {
          status: 400,
    headers: { 'Content-Type': 'application/json' },
        });
      }
      
      try {
          const apiUrl = `https://flavortown.hackclub.com/api/v1/projects/${projectId}/devlogs?page=${page}`;
        const headers = {
          'Authorization': `Bearer ${apiKey}`
        };
        const response = await fetch(apiUrl, { headers });
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch devlogs' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flavortown Devlog Timeline</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
      padding: 2rem 1rem;
      color: #333;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      color: #1a1a1a;
      animation: fadeInDown 0.6s ease-out;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header p {
      font-size: 1.1rem;
      color: #666;
    }
    
    .search-box {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .input-group {
      margin-bottom: 1rem;
    }
    
    .input-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    
    .search-box input {
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: 2px solid #e8e8e8;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #fafafa;
    }
    
    .search-box input:focus {
      outline: none;
      border-color: #ec3750;
      background: white;
      box-shadow: 0 0 0 3px rgba(236, 55, 80, 0.1);
      transform: translateY(-1px);
    }
    
    .search-box input::placeholder {
      color: #aaa;
    }
    
    .search-box button {
      width: 100%;
      margin-top: 0.5rem;
      padding: 1rem;
      background: #ec3750;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .search-box button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    .search-box button:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .search-box button:hover {
      background: #d62d47;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(236, 55, 80, 0.3);
    }
    
    .search-box button:active {
      transform: translateY(0);
    }
    
    .loading {
      text-align: center;
      color: #666;
      font-size: 1.2rem;
      padding: 2rem;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .error {
      background: #ff4757;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 1rem;
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .timeline {
      position: relative;
      padding-left: 2rem;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, #ec3750 0%, #ff8c37 100%);
      border-radius: 3px;
    }
    
    .devlog {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      animation: slideIn 0.5s ease-out;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #f0f0f0;
    }
    
    .devlog:hover {
      transform: translateX(8px) translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
      border-color: #ec3750;
    }
    
    .devlog::before {
      content: '';
      position: absolute;
      left: -2.625rem;
      top: 1.75rem;
      width: 14px;
      height: 14px;
      background: white;
      border: 3px solid #ec3750;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(236, 55, 80, 0.15);
      transition: all 0.3s ease;
    }
    
    .devlog:hover::before {
      transform: scale(1.3);
      box-shadow: 0 0 0 6px rgba(236, 55, 80, 0.2);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .devlog-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    
    .devlog-date {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }
    
    .devlog-duration {
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 100%);
      color: white;
      padding: 0.3rem 0.85rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(236, 55, 80, 0.3);
    }
    
    .devlog-body {
      font-size: 1rem;
      line-height: 1.6;
      color: #444;
      margin-bottom: 1rem;
      white-space: pre-wrap;
    }
    
    .devlog-media {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .devlog-media img,
    .devlog-media video {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .devlog-media img:hover,
    .devlog-media video:hover {
      transform: scale(1.05) rotate(1deg);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .devlog-footer {
      display: flex;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      font-size: 0.9rem;
      color: #666;
    }
    
    .devlog-stat {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    
    .devlog-stat svg {
      width: 18px;
      height: 18px;
    }
    
    .scrapbook-link {
      margin-left: auto;
    }
    
    .scrapbook-link a {
      color: #ec3750;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .scrapbook-link a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: #ec3750;
      transition: width 0.3s ease;
    }
    
    .scrapbook-link a:hover {
      color: #d62d47;
    }
    
    .scrapbook-link a:hover::after {
      width: 100%;
    }
    
    .pagination {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .pagination button {
      padding: 0.875rem 1.75rem;
      background: white;
      color: #ec3750;
      border: 2px solid #ec3750;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .pagination button:hover:not(:disabled) {
      background: #ec3750;
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(236, 55, 80, 0.3);
    }
    
    .pagination button:active:not(:disabled) {
      transform: translateY(-1px);
    }
    
    .pagination button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: #ccc;
      color: #ccc;
    }
    
    .empty-state {
      text-align: center;
      color: #666;
      padding: 3rem 1rem;
      animation: fadeInUp 0.6s ease-out;
    }
    
    .empty-state svg {
      width: 80px;
      height: 80px;
      margin-bottom: 1rem;
      opacity: 0.8;
    }
    
    .empty-state h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .empty-state p {
      opacity: 0.9;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 2rem;
      }
      
      .timeline {
        padding-left: 1.5rem;
      }
      
      .devlog::before {
        left: -2.125rem;
      }
      
      .devlog-footer {
        flex-wrap: wrap;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍔 Flavortown Devlog Timeline</h1>
      <p>Track your project's journey</p>
    </div>
    
    <div class="search-box">
      <div class="input-group">
        <label for="apiKey">API Key</label>
        <input 
          type="password" 
          id="apiKey" 
          placeholder="Enter your Flavortown API key..."
          onkeypress="if(event.key === 'Enter') document.getElementById('projectInput').focus()"
        />
      </div>
      <div class="input-group">
        <label for="projectInput">Project URL or ID</label>
        <input 
          type="text" 
          id="projectInput" 
          placeholder="https://flavortown.hackclub.com/projects/6677 or just 6677"
          onkeypress="if(event.key === 'Enter') loadDevlogs()"
        />
      </div>
      <button onclick="loadDevlogs()">Load Devlogs</button>
    </div>
    
    <div id="content"></div>
  </div>

  <script>
    let currentProjectId = null;
    let currentApiKey = null;
    let currentPage = 1;
    
    function extractProjectId(input) {
      // Remove whitespace
      input = input.trim();
      
      // Check if it's a URL
      const urlMatch = input.match(/flavortown\\.hackclub\\.com\\/projects\\/(\\d+)/);
      if (urlMatch) {
        return urlMatch[1];
      }
      
      // Otherwise assume it's just the ID
      return input;
    }
    
    async function loadDevlogs(page = 1) {
      const projectInput = document.getElementById('projectInput');
      const apiKeyInput = document.getElementById('apiKey');
      const projectInputValue = projectInput.value.trim();
      const apiKey = apiKeyInput.value.trim();
      const content = document.getElementById('content');
      
      if (!apiKey) {
        content.innerHTML = '<div class="error">Please enter your API key</div>';
        return;
      }
      
      if (!projectInputValue) {
        content.innerHTML = '<div class="error">Please enter a project URL or ID</div>';
        return;
      }
      
      const projectId = extractProjectId(projectInputValue);
      
      if (!projectId || projectId === '') {
        content.innerHTML = '<div class="error">Could not extract project ID from input</div>';
        return;
      }
      
      currentProjectId = projectId;
      currentApiKey = apiKey;
      currentPage = page;
      
      content.innerHTML = '<div class="loading">Loading devlogs...</div>';
      
      try {
        const response = await fetch(\`/api/devlogs?project_id=\${projectId}&api_key=\${encodeURIComponent(apiKey)}&page=\${page}\`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch devlogs');
        }
        
        if (!data.devlogs || data.devlogs.length === 0) {
          content.innerHTML = \`
            <div class="empty-state">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <h2>No devlogs found</h2>
              <p>This project doesn't have any devlogs yet.</p>
            </div>
          \`;
          return;
        }
        
        renderDevlogs(data.devlogs, page);
      } catch (error) {
        content.innerHTML = \`<div class="error">\${error.message}</div>\`;
      }
    }
    
    function renderDevlogs(devlogs, page) {
      const content = document.getElementById('content');
      
      const devlogsHTML = devlogs.map(devlog => \`
        <div class="devlog">
          <div class="devlog-header">
            <div class="devlog-date">\${formatDate(devlog.created_at)}</div>
            \${devlog.duration_seconds ? \`<div class="devlog-duration">\${formatDuration(devlog.duration_seconds)}</div>\` : ''}
          </div>
          
          <div class="devlog-body">\${escapeHtml(devlog.body)}</div>
          
          \${devlog.media && devlog.media.length > 0 ? \`
            <div class="devlog-media">
              \${devlog.media.map(media => {
                if (media.content_type.startsWith('image/')) {
                  return \`<img src="\${media.url}" alt="Devlog media" onclick="window.open('\${media.url}', '_blank')">\`;
                } else if (media.content_type.startsWith('video/')) {
                  return \`<video src="\${media.url}" controls></video>\`;
                }
                return '';
              }).join('')}
            </div>
          \` : ''}
          
          <div class="devlog-footer">
            <div class="devlog-stat">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
              <span>\${devlog.likes_count}</span>
            </div>
            <div class="devlog-stat">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              <span>\${devlog.comments_count}</span>
            </div>
            \${devlog.scrapbook_url ? \`
              <div class="scrapbook-link">
                <a href="\${devlog.scrapbook_url}" target="_blank">View on Scrapbook →</a>
              </div>
            \` : ''}
          </div>
        </div>
      \`).join('');
      
      const paginationHTML = \`
        <div class="pagination">
          <button onclick="loadDevlogs(\${page - 1})" \${page === 1 ? 'disabled' : ''}>
            ← Previous
          </button>
          <button onclick="loadDevlogs(\${page + 1})" \${devlogs.length < 10 ? 'disabled' : ''}>
            Next →
          </button>
        </div>
      \`;
      
      content.innerHTML = \`
        <div class="timeline">
          \${devlogsHTML}
        </div>
        \${paginationHTML}
      \`;
    }
    
    function formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return \`\${diffDays} days ago\`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    }
    
    function formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return \`\${hours}h \${minutes}m\`;
      }
      return \`\${minutes}m\`;
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Check for project ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdFromUrl = urlParams.get('project_id');
    const apiKeyFromUrl = urlParams.get('api_key');
    
    if (projectIdFromUrl) {
      document.getElementById('projectInput').value = projectIdFromUrl;
    }
    if (apiKeyFromUrl) {
      document.getElementById('apiKey').value = apiKeyFromUrl;
    }
    if (projectIdFromUrl && apiKeyFromUrl) {
      loadDevlogs();
    }
  </script>
</body>
</html>`;
}
