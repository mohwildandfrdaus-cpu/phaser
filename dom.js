const config = {
  type: Phaser.AUTO, width: 800, height: 600, backgroundColor: '#0a0e1a', parent: 'gameWrapper',
  physics: { default: 'arcade', arcade: { gravity: { y: 860 }, debug: false } },
  scene: { init: sceneInit, preload: scenePreload, create: sceneCreate, update: sceneUpdate }
};

// ===== DOM EVENTS =====
document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const toggleMute = document.getElementById('toggleMute');
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump = document.getElementById('btnJump');

  if (settingsBtn && settingsPanel) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        settingsPanel.classList.remove('active');
      }
    });
  }

  if (toggleMute) {
    toggleMute.addEventListener('click', (e) => {
      e.stopPropagation();
      Settings.muted = !Settings.muted;
      toggleMute.classList.toggle('on', Settings.muted);
      Audio.updateMute();
    });
  }

  const addTouch = (elem, key) => {
    if (!elem) return;
    elem.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; if (!Audio.started) Audio.startAll(); });
    elem.addEventListener('touchend', (e) => { e.preventDefault(); keys[key] = false; });
    elem.addEventListener('mousedown', (e) => { e.preventDefault(); keys[key] = true; if (!Audio.started) Audio.startAll(); });
    elem.addEventListener('mouseup', (e) => { e.preventDefault(); keys[key] = false; });
    elem.addEventListener('mouseleave', (e) => { keys[key] = false; });
  };

  addTouch(btnLeft, 'left');
  addTouch(btnRight, 'right');
  addTouch(btnJump, 'up');

  // Canvas focus on click to capture keys
  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.addEventListener('click', () => { if (!Audio.started) Audio.startAll(); canvas.focus(); });
  }
});

// ===== START GAME =====
const game = new Phaser.Game(config);