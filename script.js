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
