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




function renderIssuesList(issues) {
  document.getElementById('issues-count').textContent = issues.length + ' Issue' + (issues.length !== 1 ? 's' : '');
  if (!issues.length) {
    document.getElementById('issues-container').innerHTML = '<div class="no-results">No issues found.</div>';
    return;
  }
  let html = '<div class="issues-grid">';
  for (let i = 0; i < issues.length; i++) { html += buildCard(issues[i]); }
  html += '</div>';
  document.getElementById('issues-container').innerHTML = html;
}

function getStatus(issue) { return ((issue.status || issue.state) || 'open').toLowerCase(); }
function getPriority(issue) { return ((issue.priority) || 'LOW').toUpperCase(); }
function getLabels(issue) {
  if (Array.isArray(issue.labels)) return issue.labels;
  if (typeof issue.labels === 'string') return issue.labels.split(',').map(function(l){ return l.trim(); }).filter(Boolean);
  return [];
}
function labelClass(label) {
  var l = label.toLowerCase();
  if (l.includes('bug')) return 'label-bug';
  if (l.includes('enhanc')) return 'label-enhancement';
  if (l.includes('help')) return 'label-help';
  return 'label-default';
}
function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US'); } catch(e) { return d; }
}
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getIssueId(issue) { return issue.id || issue._id || 0; }

function buildCard(issue) {
  var status = getStatus(issue);
  var priority = getPriority(issue);
  var labels = getLabels(issue);
  var statusImg = status === 'open' ? IMAGES.open : IMAGES.closed;
  let labelsHTML = labels.map(function(l){ return '<span class="label-tag ' + labelClass(l) + '">' + esc(l.toUpperCase()) + '</span>'; }).join('');
  var author = esc(issue.author || issue.user || issue.assignee || 'Unknown');
  return '<div class="issue-card ' + status + '-card" onclick="openModal(' + getIssueId(issue) + ')">' +
    '<div class="card-top"><img src="' + statusImg + '" class="card-status-icon" alt="' + status + '"/><span class="priority-badge priority-' + priority + '">' + priority + '</span></div>' +
    '<div class="card-title">' + esc(issue.title || 'Untitled') + '</div>' +
    '<div class="card-desc">' + esc(issue.description || issue.body || '') + '</div>' +
    '<div class="card-labels">' + labelsHTML + '</div>' +
    '<div class="card-footer"><span>#' + (issue.number || getIssueId(issue)) + ' by ' + author + '</span><span>' + formatDate(issue.createdAt || issue.created_at) + '</span></div>' +
    '</div>';
}

async function openModal(id) {
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('modal-inner').innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
  try {
    const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issue/' + id);
    const raw = await res.json();
    const data = raw.issue || raw.data || raw;
    const status = getStatus(data);
    const priority = getPriority(data);
    const labels = getLabels(data);
    const labelsHTML = labels.map(function(l){ return '<span class="label-tag ' + labelClass(l) + '">' + esc(l.toUpperCase()) + '</span>'; }).join('');
    document.getElementById('modal-inner').innerHTML =
      '<div class="modal-title">' + esc(data.title || 'Untitled') + '</div>' +
      '<div class="modal-meta">' +
        '<span class="modal-status-badge badge-' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span>' +
        '<span>Opened by <strong>' + esc(data.author || data.user || data.assignee || 'Unknown') + '</strong></span>' +
        '<span>&bull; ' + formatDate(data.createdAt || data.created_at) + '</span>' +
      '</div>' +
      '<div class="modal-labels">' + labelsHTML + '</div>' +
      '<div class="modal-body-text">' + esc(data.description || data.body || 'No description provided.') + '</div>' +
      '<div class="modal-info-grid">' +
        '<div class="modal-info-item"><label>Assignee</label><span>' + esc(data.assignee || data.author || data.user || '—') + '</span></div>' +
        '<div class="modal-info-item"><label>Priority</label><span class="priority-badge priority-' + priority + '">' + priority + '</span></div>' +
      '</div>' +
      '<button class="btn-close-modal" onclick="closeModal()">Close</button><div style="clear:both"></div>';
  } catch(e) {
    document.getElementById('modal-inner').innerHTML = '<div class="no-results">Failed to load issue.</div>';
  }
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function closeModalOutside(e) { if (e.target === document.getElementById('modal-overlay')) closeModal(); }


