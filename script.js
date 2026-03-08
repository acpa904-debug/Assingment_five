// Images stored as variables — no placeholder replacement conflict
const IMAGES = {
  github:"./assets/github-logo.png",
  aperture:"./assets/Aperture.png",
  open:"./assets/Open-Status.png",
  closed:"./assets/closed-status.png"

};

// Set images on DOM elements directly
document.getElementById('login-logo').src = IMAGES.github;
document.getElementById('nav-logo').src = IMAGES.github;
document.getElementById('aperture-img').src = IMAGES.aperture;



let allIssues = [];
let currentTab = 'all';
let searchTimer = null;

function handleLogin() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const err = document.getElementById('login-error');
  if (u === 'admin' && p === 'admin123') {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('main-page').style.display = 'block';
    loadIssues();
  } else {
    err.style.display = 'block';
    setTimeout(function(){ err.style.display = 'none'; }, 3000);
  }
}

document.getElementById('username').addEventListener('keydown', function(e){ if(e.key==='Enter') handleLogin(); });
document.getElementById('password').addEventListener('keydown', function(e){ if(e.key==='Enter') handleLogin(); });

async function loadIssues() {
  showLoading();
  try {
    const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
    const data = await res.json();
    allIssues = Array.isArray(data) ? data : (data.issues || data.data || []);
    renderIssues();
  } catch(e) {
    document.getElementById('issues-container').innerHTML = '<div class="no-results">Failed to load issues. Please try again.</div>';
  }
}

function showLoading() {
  document.getElementById('issues-container').innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
}

function setTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('search-input').value = '';
  renderIssues();
}

function handleSearch(val) {
  clearTimeout(searchTimer);
  if (!val.trim()) { renderIssues(); return; }
  searchTimer = setTimeout(async function() {
    showLoading();
    try {
      const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=' + encodeURIComponent(val.trim()));
      const data = await res.json();
      const results = Array.isArray(data) ? data : (data.issues || data.data || []);
      renderIssuesList(results);
    } catch(e) { renderIssues(); }
  }, 400);
}

function renderIssues() {
  let issues = allIssues;
  if (currentTab === 'open') issues = allIssues.filter(function(i){ return (i.status||i.state||'').toLowerCase() === 'open'; });
  else if (currentTab === 'closed') issues = allIssues.filter(function(i){ return (i.status||i.state||'').toLowerCase() === 'closed'; });
  renderIssuesList(issues);
}