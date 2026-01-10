export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
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
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Flavortown-Ext': projectId
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          return new Response(JSON.stringify({ 
            error: data.error || 'API request failed',
            status: response.status
          }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch devlogs', details: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (url.pathname.startsWith('/api/project')) {
      const projectId = url.searchParams.get('project_id');
      const apiKey = url.searchParams.get('api_key');
      
      if (!projectId || !apiKey) {
        return new Response(JSON.stringify({ error: 'project_id and api_key are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      try {
        const apiUrl = `https://flavortown.hackclub.com/api/v1/projects/${projectId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Flavortown-Ext': projectId
          }
        });
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch project' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (url.pathname.startsWith('/api/github')) {
      const repoUrl = url.searchParams.get('repo_url');
      
      if (!repoUrl) {
        return new Response(JSON.stringify({ error: 'repo_url is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid GitHub URL' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      
      try {
        const [repoResponse, languagesResponse, contributorsResponse] = await Promise.all([
          fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: { 'User-Agent': 'Flavortown-Journey' } }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers: { 'User-Agent': 'Flavortown-Journey' } }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=5`, { headers: { 'User-Agent': 'Flavortown-Journey' } })
        ]);
        
        const repoData = await repoResponse.json();
        const languages = await languagesResponse.json();
        const contributors = await contributorsResponse.json();
        const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
        
        return new Response(JSON.stringify({
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          open_issues: repoData.open_issues_count,
          size: repoData.size,
          total_code_bytes: totalBytes,
          languages: languages,
          contributors: Array.isArray(contributors) ? contributors.slice(0, 5) : [],
          html_url: repoData.html_url
        }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch GitHub data' }), {
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
  <title>Flavortown Journey</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      min-height: 100vh;
      color: #fff;
      overflow-x: hidden;
    }
    
    .bg-images {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    
    .bg-images img {
      position: absolute;
      border-radius: 12px;
      opacity: 0.08;
      filter: blur(1px) grayscale(30%);
      object-fit: cover;
      animation: drift 20s ease-in-out infinite;
    }
    
    @keyframes drift {
      0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
      25% { transform: translateY(-15px) rotate(1deg) scale(1.02); }
      50% { transform: translateY(-5px) rotate(-1deg) scale(0.98); }
      75% { transform: translateY(-20px) rotate(2deg) scale(1.01); }
    }
    
    .wrap { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    
    .login {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: linear-gradient(180deg, #1a0a0a 0%, #0a0a0a 100%);
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 1rem;
      animation: bob 2s ease-in-out infinite;
    }
    
    .logo img { width: 100%; height: 100%; object-fit: contain; }
    
    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 50%, #f1c40f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
      text-align: center;
    }
    
    .subtitle { color: #888; font-size: 1.1rem; margin-bottom: 3rem; }
    
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
    }
    
    .field { margin-bottom: 1.5rem; }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #aaa;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .card input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      font-size: 1rem;
      background: rgba(255,255,255,0.05);
      color: #fff;
      transition: all 0.3s;
    }
    
    .card input:focus {
      outline: none;
      border-color: #ec3750;
      background: rgba(236,55,80,0.1);
    }
    
    .card input::placeholder { color: #666; }
    
    .btn {
      width: 100%;
      padding: 1.1rem;
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 40px rgba(236,55,80,0.4);
    }
    
    .main { display: none; }
    .main.show { display: block; animation: fadein 0.8s ease-out; }
    
    @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
    
    .back {
      position: fixed;
      top: 1.5rem;
      left: 1.5rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      z-index: 100;
      backdrop-filter: blur(10px);
    }
    
    .back:hover { background: rgba(255,255,255,0.2); transform: translateX(-3px); }
    
    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(180deg, #1a0505 0%, #0a0a0a 100%);
      border-radius: 32px;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(236,55,80,0.15) 0%, transparent 50%);
      animation: spin 20s linear infinite;
    }
    
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    .hero-inner { position: relative; z-index: 1; }
    .hero-icon { font-size: 5rem; margin-bottom: 1rem; animation: pulse 2s ease-in-out infinite; }
    
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    
    .hero-label { font-size: 1.2rem; color: #888; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 0.5rem; }
    
    .hero-value {
      font-size: 5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 50%, #f1c40f 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
      margin-bottom: 0.5rem;
    }
    
    .hero-sub { font-size: 1.5rem; color: #aaa; font-weight: 500; }
    
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
    
    .stat {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s;
    }
    
    .stat:hover { transform: translateY(-5px); background: rgba(255,255,255,0.08); border-color: #ec3750; }
    .stat-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .stat-num { font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; }
    .stat-name { font-size: 0.85rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    
    .gh {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .gh-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    
    .gh-icon {
      width: 40px;
      height: 40px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .gh-meta h3 { font-size: 1.25rem; color: #fff; margin-bottom: 0.25rem; }
    .gh-meta a { color: #ec3750; text-decoration: none; font-size: 0.9rem; }
    .gh-meta a:hover { text-decoration: underline; }
    
    .gh-nums { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    
    .gh-num { text-align: center; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; }
    .gh-num-val { font-size: 1.5rem; font-weight: 700; color: #fff; }
    .gh-num-lbl { font-size: 0.75rem; color: #888; text-transform: uppercase; margin-top: 0.25rem; }
    
    .langs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
    
    .lang {
      padding: 0.4rem 0.8rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(236,55,80,0.2);
      color: #ec3750;
    }
    
    .lang:nth-child(2) { background: rgba(255,140,55,0.2); color: #ff8c37; }
    .lang:nth-child(3) { background: rgba(241,196,15,0.2); color: #f1c40f; }
    .lang:nth-child(4) { background: rgba(46,204,113,0.2); color: #2ecc71; }
    .lang:nth-child(5) { background: rgba(52,152,219,0.2); color: #3498db; }
    
    .langbar { height: 8px; border-radius: 4px; overflow: hidden; display: flex; background: rgba(255,255,255,0.1); }
    .langbar div { height: 100%; transition: width 0.5s; }
    
    .contribs { display: flex; gap: 0.5rem; align-items: center; margin-top: 1rem; }
    
    .contrib {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      transition: transform 0.2s;
    }
    
    .contrib:hover { transform: scale(1.2); z-index: 10; }
    
    .heading { display: flex; align-items: center; justify-content: space-between; margin: 3rem 0 1.5rem; }
    .heading h2 { font-size: 1.5rem; font-weight: 700; color: #fff; }
    
    .badge {
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 100%);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .entry {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    
    .entry:hover { background: rgba(255,255,255,0.06); border-color: rgba(236,55,80,0.3); transform: translateX(5px); }
    
    .entry-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
    .entry-date { font-size: 0.85rem; color: #888; }
    
    .entry-time {
      background: linear-gradient(135deg, #ec3750 0%, #ff8c37 100%);
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    
    .entry-time::before { content: '⏱️'; }
    
    .entry-body { font-size: 1rem; line-height: 1.7; color: #ddd; margin-bottom: 1rem; }
    .entry-body strong { color: #fff; font-weight: 700; }
    
    .entry-body code {
      background: rgba(236,55,80,0.2);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', monospace;
      font-size: 0.9em;
      color: #ff8c37;
    }
    
    .entry-body hr {
      border: none;
      height: 2px;
      background: linear-gradient(90deg, transparent, #ec3750, transparent);
      margin: 1.5rem 0;
    }
    
    .entry-body h1, .entry-body h2, .entry-body h3,
    .entry-body h4, .entry-body h5, .entry-body h6 {
      color: #fff;
      margin: 1rem 0 0.5rem 0;
      line-height: 1.3;
    }
    
    .entry-body h1 { font-size: 1.5em; }
    .entry-body h2 { font-size: 1.3em; }
    .entry-body h3 { font-size: 1.15em; }
    .entry-body h4, .entry-body h5, .entry-body h6 { font-size: 1em; }
    
    .entry-body a { color: #ec3750; text-decoration: none; font-weight: 600; }
    .entry-body a:hover { text-decoration: underline; }
    
    .media { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
    
    .media img, .media video {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    
    .media img:hover, .media video:hover { transform: scale(1.03); border-color: #ec3750; }
    
    .entry-bottom {
      display: flex;
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 0.9rem;
      color: #888;
    }
    
    .entry-stat { display: flex; align-items: center; gap: 0.4rem; }
    .entry-link { margin-left: auto; }
    .entry-link a { color: #ec3750; text-decoration: none; font-weight: 600; transition: color 0.3s; }
    .entry-link a:hover { color: #ff8c37; }
    
    .spinner { text-align: center; padding: 4rem 2rem; }
    
    .spinner-circle {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(236,55,80,0.2);
      border-top-color: #ec3750;
      border-radius: 50%;
      animation: rotate 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    
    @keyframes rotate { to { transform: rotate(360deg); } }
    
    .spinner-text { color: #888; font-size: 1.1rem; }
    
    .err {
      background: rgba(255,71,87,0.2);
      border: 1px solid rgba(255,71,87,0.3);
      color: #ff6b7a;
      padding: 1.5rem;
      border-radius: 16px;
      text-align: center;
      margin: 2rem 0;
    }
    
    .empty { text-align: center; padding: 4rem 2rem; color: #888; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
    
    @media (max-width: 768px) {
      .title { font-size: 2rem; }
      .hero-value { font-size: 3.5rem; }
      .stats { grid-template-columns: 1fr; }
      .stat { display: flex; align-items: center; gap: 1rem; text-align: left; }
      .stat-icon { margin-bottom: 0; }
      .back { top: 1rem; left: 1rem; padding: 0.6rem 1rem; font-size: 0.9rem; }
      .gh-nums { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="bg-images" id="bgImages"></div>
  
  <div class="login" id="loginScreen">
    <div class="logo"><img src="https://flavortown.hackclub.com/assets/landing/hero/logo-b28e0e8b.avif" alt="Flavortown"></div>
    <h1 class="title">Flavortown Journey</h1>
    <p class="subtitle">See your coding journey come to life</p>
    
    <div class="card">
      <div class="field">
        <label for="apiKey">API Key</label>
        <input type="password" id="apiKey" placeholder="Enter your Flavortown API key..." onkeypress="if(event.key==='Enter')document.getElementById('projectInput').focus()">
      </div>
      <div class="field">
        <label for="projectInput">Project URL or ID</label>
        <input type="text" id="projectInput" placeholder="https://flavortown.hackclub.com/projects/6677" onkeypress="if(event.key==='Enter')loadDevlogs()">
      </div>
      <button class="btn" onclick="loadDevlogs()">Explore My Journey 🚀</button>
    </div>
  </div>
  
  <div class="main" id="mainView">
    <button class="back" onclick="showLogin()">← Back</button>
    <div class="wrap" id="content"></div>
  </div>

  <script>
    let projectId = null;
    let apiKey = null;
    let devlogs = [];
    
    function showLogin() {
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('mainView').classList.remove('show');
      devlogs = [];
    }
    
    function showMain() {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainView').classList.add('show');
    }
    
    function extractId(input) {
      input = input.trim();
      const m = input.match(/flavortown\\.hackclub\\.com\\/projects\\/(\\d+)/);
      return m ? m[1] : input;
    }
    
    async function loadDevlogs() {
      const inputVal = document.getElementById('projectInput').value.trim();
      apiKey = document.getElementById('apiKey').value.trim();
      const content = document.getElementById('content');
      
      if (!apiKey) { alert('Please enter your API key'); return; }
      if (!inputVal) { alert('Please enter a project URL or ID'); return; }
      
      projectId = extractId(inputVal);
      if (!projectId) { alert('Could not extract project ID'); return; }
      
      showMain();
      content.innerHTML = '<div class="spinner"><div class="spinner-circle"></div><div class="spinner-text">Loading your journey...</div></div>';
      
      try {
        const projectPromise = fetch('/api/project?project_id=' + projectId + '&api_key=' + encodeURIComponent(apiKey));
        
        devlogs = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const res = await fetch('/api/devlogs?project_id=' + projectId + '&api_key=' + encodeURIComponent(apiKey) + '&page=' + page);
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error || 'Failed to fetch devlogs');
          
          if (data.devlogs && data.devlogs.length > 0) {
            devlogs = devlogs.concat(data.devlogs);
            page++;
            if (data.devlogs.length < 10) hasMore = false;
          } else {
            hasMore = false;
          }
        }
        
        const projectRes = await projectPromise;
        const project = await projectRes.json();
        
        setupBackground(devlogs);
        
        let github = null;
        if (project.repo_url && project.repo_url.includes('github.com')) {
          try {
            const ghRes = await fetch('/api/github?repo_url=' + encodeURIComponent(project.repo_url));
            if (ghRes.ok) github = await ghRes.json();
          } catch (e) {}
        }
        
        if (devlogs.length === 0) {
          content.innerHTML = '<div class="empty"><div class="empty-icon">📭</div><h2>No devlogs found</h2><p>This project does not have any devlogs yet.</p></div>';
          return;
        }
        
        render(devlogs, project, github);
      } catch (err) {
        content.innerHTML = '<div class="err">' + err.message + '</div>';
      }
    }
    
    function setupBackground(logs) {
      const container = document.getElementById('bgImages');
      container.innerHTML = '';
      
      const urls = [];
      logs.forEach(function(log) {
        if (log.media) {
          log.media.forEach(function(m) {
            if (m.content_type && m.content_type.startsWith('image/')) {
              urls.push(fixUrl(m.url));
            }
          });
        }
      });
      
      urls.slice(0, 12).forEach(function(url, i) {
        const img = document.createElement('img');
        img.src = url;
        img.style.left = (i % 4 * 25 + Math.random() * 10) + '%';
        img.style.top = (Math.floor(i / 4) * 33 + Math.random() * 10) + '%';
        img.style.width = (120 + Math.random() * 80) + 'px';
        img.style.animationDelay = (i * 0.5) + 's';
        img.style.animationDuration = (18 + Math.random() * 8) + 's';
        container.appendChild(img);
      });
    }
    
    function render(logs, project, github) {
      const content = document.getElementById('content');
      
      const totalSec = logs.reduce((a, d) => a + (d.duration_seconds || 0), 0);
      const likes = logs.reduce((a, d) => a + (d.likes_count || 0), 0);
      const comments = logs.reduce((a, d) => a + (d.comments_count || 0), 0);
      
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const timeStr = hrs > 0 ? hrs + ' hours' : mins + ' mins';
      
      let html = '<div class="hero"><div class="hero-inner"><div class="hero-icon">🔥</div><div class="hero-label">Total Time Invested</div><div class="hero-value">' + timeStr + '</div><div class="hero-sub">Of Creating Code</div></div></div>';
      
      html += '<div class="stats"><div class="stat"><div class="stat-icon">📝</div><div class="stat-num">' + logs.length + '</div><div class="stat-name">Devlogs</div></div><div class="stat"><div class="stat-icon">❤️</div><div class="stat-num">' + likes + '</div><div class="stat-name">Likes</div></div><div class="stat"><div class="stat-icon">💬</div><div class="stat-num">' + comments + '</div><div class="stat-name">Comments</div></div></div>';
      
      if (github && github.name) {
        const langs = github.languages || {};
        const langNames = Object.keys(langs);
        const totalBytes = Object.values(langs).reduce((a, b) => a + b, 0);
        
        const colors = { 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'HTML': '#e34c26', 'CSS': '#563d7c', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584', 'Java': '#b07219', 'C': '#555555', 'C++': '#f34b7d', 'Swift': '#F05138', 'Kotlin': '#A97BFF', 'PHP': '#4F5D95', 'Shell': '#89e051' };
        
        const langTags = langNames.slice(0, 5).map(function(l) { return '<span class="lang">' + l + '</span>'; }).join('');
        
        const barParts = langNames.map(function(l) {
          const pct = (langs[l] / totalBytes * 100).toFixed(1);
          return '<div style="width:' + pct + '%;background:' + (colors[l] || '#888') + '" title="' + l + ' ' + pct + '%"></div>';
        }).join('');
        
        const contribs = github.contributors && github.contributors.length > 0 ? '<div class="contribs">' + github.contributors.map(function(c) { return '<a href="' + c.html_url + '" target="_blank"><img src="' + c.avatar_url + '" class="contrib" title="' + c.login + '"></a>'; }).join('') + '</div>' : '';
        
        html += '<div class="gh"><div class="gh-top"><div class="gh-icon">⚡</div><div class="gh-meta"><h3>' + github.name + '</h3><a href="' + github.html_url + '" target="_blank">' + github.full_name + '</a></div></div><div class="gh-nums"><div class="gh-num"><div class="gh-num-val">⭐ ' + (github.stars || 0) + '</div><div class="gh-num-lbl">Stars</div></div><div class="gh-num"><div class="gh-num-val">🍴 ' + (github.forks || 0) + '</div><div class="gh-num-lbl">Forks</div></div><div class="gh-num"><div class="gh-num-val">📄 ' + fmtBytes(github.total_code_bytes || 0) + '</div><div class="gh-num-lbl">Code</div></div><div class="gh-num"><div class="gh-num-val">🔧 ' + (github.open_issues || 0) + '</div><div class="gh-num-lbl">Issues</div></div></div><div class="langs">' + langTags + '</div><div class="langbar">' + barParts + '</div>' + contribs + '</div>';
      }
      
      html += '<div class="heading"><h2>Your Journey</h2><span class="badge">' + logs.length + ' entries</span></div>';
      
      logs.forEach(function(log) {
        const pics = log.media && log.media.length > 0 ? '<div class="media">' + log.media.map(function(m) {
          const u = fixUrl(m.url);
          if (m.content_type.startsWith('image/')) return '<img src="' + u + '" alt="" onclick="window.open(\\'' + u + '\\',\\'_blank\\')">';
          if (m.content_type.startsWith('video/')) return '<video src="' + u + '" controls></video>';
          return '';
        }).join('') + '</div>' : '';
        
        const dur = log.duration_seconds ? '<div class="entry-time">' + fmtDur(log.duration_seconds) + '</div>' : '';
        const scrap = log.scrapbook_url ? '<div class="entry-link"><a href="' + log.scrapbook_url + '" target="_blank">View on Scrapbook →</a></div>' : '';
        
        html += '<div class="entry"><div class="entry-top"><div class="entry-date">' + fmtDate(log.created_at) + '</div>' + dur + '</div><div class="entry-body">' + md(log.body) + '</div>' + pics + '<div class="entry-bottom"><div class="entry-stat">❤️ ' + log.likes_count + '</div><div class="entry-stat">💬 ' + log.comments_count + '</div>' + scrap + '</div></div>';
      });
      
      content.innerHTML = html;
    }
    
    function fmtDate(str) {
      const d = new Date(str);
      const now = new Date();
      const diff = Math.ceil(Math.abs(now - d) / 86400000);
      if (diff < 1) return 'Today';
      if (diff === 1) return 'Yesterday';
      if (diff < 7) return diff + ' days ago';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    function fmtDur(sec) {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      return h > 0 ? h + 'h ' + m + 'm' : m + 'm';
    }
    
    function fmtBytes(b) {
      if (b === 0) return '0 B';
      const k = 1024;
      const s = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(b) / Math.log(k));
      return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
    }
    
    function esc(t) {
      const d = document.createElement('div');
      d.textContent = t;
      return d.innerHTML;
    }
    
    function md(text) {
      let h = esc(text);
      h = h.replace(/^######\\s+(.+)$/gm, '<h6>$1</h6>');
      h = h.replace(/^#####\\s+(.+)$/gm, '<h5>$1</h5>');
      h = h.replace(/^####\\s+(.+)$/gm, '<h4>$1</h4>');
      h = h.replace(/^###\\s+(.+)$/gm, '<h3>$1</h3>');
      h = h.replace(/^##\\s+(.+)$/gm, '<h2>$1</h2>');
      h = h.replace(/^#\\s+(.+)$/gm, '<h1>$1</h1>');
      h = h.replace(/^---+$/gm, '<hr>');
      h = h.replace(/^===+$/gm, '<hr>');
      h = h.replace(/^\\*\\*\\*+$/gm, '<hr>');
      h = h.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
      h = h.replace(/__(.+?)__/g, '<strong>$1</strong>');
      h = h.replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
      h = h.replace(/_([^_]+)_/g, '<em>$1</em>');
      h = h.replace(new RegExp('\\x60([^\\x60]+)\\x60', 'g'), '<code>$1</code>');
      h = h.replace(/\\[(.*?)\\]\\((https?:\\/\\/[^)]+)\\)/g, '<a href="$2" target="_blank">$1</a>');
      h = h.replace(/\\n/g, '<br>');
      return h;
    }
    
    function fixUrl(url) {
      if (url.includes('/rails/active_storage/blobs/proxy/')) {
        const m = url.match(/\\/blobs\\/proxy\\/([^/]+)\\/(.+)$/);
        if (m) return 'https://flavortown.hackclub.com/rails/active_storage/representations/proxy/' + m[1] + '/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJ3ZWJwIiwicmVzaXplX3RvX2xpbWl0IjpbODAwLDgwMF0sInNhdmVyIjp7InN0cmlwIjp0cnVlLCJxdWFsaXR5Ijo3NX19LCJwdXIiOiJ2YXJpYXRpb24ifX0=--b31f00576a4e60a9662bd00307d0a77b5bfc6d7e/' + m[2];
      }
      return url;
    }
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('project_id')) document.getElementById('projectInput').value = params.get('project_id');
    if (params.get('api_key')) document.getElementById('apiKey').value = params.get('api_key');
    if (params.get('project_id') && params.get('api_key')) loadDevlogs();
  </script>
  
  <footer style="text-align:center;padding:2rem 1rem;color:#555;font-size:0.85rem;position:relative;z-index:10;">
    Made with ❤️ by <a href="https://github.com/Will10145" target="_blank" style="color:#ec3750;text-decoration:none;">Will</a>
  </footer>
</body>
</html>`;
}
