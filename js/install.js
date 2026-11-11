/* Rasl Estate — put the app on the phone or computer screen.
   A strip on the start screen installs it where the browser allows, and otherwise shows the two taps that do it. */
(function (RE) {
  const t = (s, v) => RE.t(s, v), esc = s => RE.esc(s);
  let offer = null; // the browser's own install prompt, when it has one
  const installed = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const hidden = () => { try { return localStorage.getItem('rasl-install-hide') === '1'; } catch (e) { return false; } };
  const refresh = () => { if (RE.ui && RE.ui.route === 'home' && RE.render) RE.render(); };

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); offer = e; refresh(); });
  window.addEventListener('appinstalled', () => { offer = null; refresh(); });

  function strip() {
    if (installed() || hidden()) return '';
    return `<div class="notice install"><span class="install-t"><span class="logo">${RE.logo()}</span><span><b>${t('Put Rasl on your screen')}</b><small>${t('It opens like an app, full screen, from its own icon.')}</small></span></span>
      <span class="row"><button class="btn small" data-install="go">${RE.icon('download')}${t('Add to screen')}</button><button class="btn small ghost" data-install="hide">${t('Not now')}</button></span></div>`;
  }
  function steps() {
    const ua = navigator.userAgent || '', ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
    const list = ios ? [t('Open this page in Safari.'), t('Press the Share button (the square with an arrow).'), t('Choose “Add to Home Screen”, then “Add”.')]
      : android ? [t('Press the ⋮ menu at the top of Chrome.'), t('Choose “Add to Home screen” or “Install app”.'), t('Press “Install”.')]
      : [t('In Chrome or Edge, press the install icon at the end of the address bar.'), t('Or open the browser menu and choose “Install Rasl Estate”.')];
    const url = location.origin + location.pathname;
    RE.modal(`${RE.dlgHead(t('Put Rasl on your screen'))}<div class="dlg-b"><div class="install-head"><span class="logo">${RE.logo()}</span><p class="sel">${esc(url)}</p></div>
      <ol class="install-steps">${list.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <footer class="dlg-f"><button class="btn ghost" data-act="copyText" data-t="${esc(url)}">${RE.icon('copy')}${t('Copy the link')}</button><span class="grow"></span><button class="btn" data-act="closeDlg">${t('Close')}</button></footer>`, 'small');
  }
  RE.installSteps = steps;

  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-install]'); if (!el) return;
    if (el.dataset.install === 'hide') { try { localStorage.setItem('rasl-install-hide', '1'); } catch (x) { /* shown again next time */ } return refresh(); }
    if (!offer) return steps();
    offer.prompt();
    try { await offer.userChoice; } catch (x) { /* closed */ }
    offer = null; refresh();
  });

  const home = RE.views.home;
  RE.views.home = () => strip() + home();
})(window.RE);
