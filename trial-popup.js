/* Ciné Planner — invitation à l'essai gratuit.
   S'affiche après 30 s de navigation active, cumulées sur l'ensemble de la session.
   Discret : coin bas gauche en desktop (la bulle de chat occupe le coin bas droit),
   carte ancrée en bas en mobile. Ne revient pas une fois fermée. */
(function () {
  'use strict';

  var DELAI_MS = 30000;              // temps de navigation active avant affichage
  var CLE_TEMPS = 'cp_nav_ms';       // cumul du temps de navigation (session)
  var CLE_VU = 'cp_essai_popup';     // mémorise fermeture / clic (30 jours)
  var OUBLI_MS = 30 * 24 * 3600 * 1000;
  var LIEN = 'Essai%20gratuit.dc.html';
  var ACCENT = '#5B4FE8';

  if (window.__cpTrialPopup) return;  // une seule instance par page
  window.__cpTrialPopup = true;

  // --- garde-fous -----------------------------------------------------------
  var chemin = decodeURIComponent(location.pathname);
  if (/essai/i.test(chemin)) return;               // déjà sur la page d'essai

  function memoire(cle) {
    try { return window.localStorage.getItem(cle); } catch (e) { return null; }
  }
  function ecrire(cle, val) {
    try { window.localStorage.setItem(cle, val); } catch (e) { /* mode privé */ }
  }
  var vu = memoire(CLE_VU);
  if (vu && Date.now() - parseInt(vu, 10) < OUBLI_MS) return;

  var lent = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- compteur de navigation active ---------------------------------------
  function ecoule() {
    try { return parseInt(window.sessionStorage.getItem(CLE_TEMPS) || '0', 10) || 0; }
    catch (e) { return compteurLocal; }
  }
  var compteurLocal = 0;
  function cumule(ms) {
    compteurLocal += ms;
    try { window.sessionStorage.setItem(CLE_TEMPS, String(ecoule() + ms)); } catch (e) { /* rien */ }
  }

  var minuteur = setInterval(function () {
    if (document.visibilityState !== 'visible') return;   // onglet en arrière-plan : on ne compte pas
    cumule(1000);
    if (ecoule() >= DELAI_MS) { clearInterval(minuteur); afficher(); }
  }, 1000);

  // --- construction de la carte --------------------------------------------
  function el(tag, style, texte) {
    var n = document.createElement(tag);
    if (style) n.setAttribute('style', style);
    if (texte != null) n.textContent = texte;
    return n;
  }

  function afficher() {
    if (!document.body) return;

    var petit = window.matchMedia('(max-width: 560px)').matches;
    var pos = petit
      ? 'left:14px; right:14px; bottom:96px;'                    // au-dessus de la bulle de chat
      : 'left:26px; bottom:26px; width:340px;';

    var carte = el('div',
      'position:fixed; ' + pos + ' z-index:70; box-sizing:border-box;' +
      "font-family:'Inter',system-ui,-apple-system,sans-serif;" +
      'background:#fff; border:1px solid #e9e9f2; border-radius:20px; padding:20px;' +
      'box-shadow:0 28px 70px -30px rgba(22,22,42,.5);' +
      'opacity:0; transform:translateY(14px);' +
      (lent ? '' : 'transition:opacity .34s ease, transform .34s cubic-bezier(.2,.8,.3,1);'));
    carte.setAttribute('role', 'dialog');
    carte.setAttribute('aria-label', 'Essai gratuit Ciné Planner');

    // fermeture
    var croix = el('button',
      'position:absolute; top:10px; right:10px; width:32px; height:32px; padding:0;' +
      'border:none; background:transparent; color:#a4a4b8; font:400 20px/1 system-ui;' +
      'cursor:pointer; border-radius:9px;', '×');
    croix.setAttribute('aria-label', 'Fermer');
    croix.addEventListener('click', function () { fermer(true); });

    var pastille = el('div',
      'width:38px; height:38px; border-radius:11px; background:#ece9ff; color:' + ACCENT + ';' +
      'display:flex; align-items:center; justify-content:center;');
    pastille.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
      + ' stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<rect x="3" y="4" width="18" height="17" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line>'
      + '<line x1="8" y1="2" x2="8" y2="6"></line><line x1="16" y1="2" x2="16" y2="6"></line></svg>';

    var titre = el('div', "font:800 16px/1.3 'Inter'; color:#16162a; margin:14px 0 0;",
      'Essayez Ciné Planner 14 jours');
    var texte = el('div', "font:400 14px/1.55 'Inter'; color:#5c5c72; margin:7px 0 0;",
      'Un expert paramètre le logiciel à votre cinéma et à la convention collective. Sans carte bancaire.');

    var cta = el('a',
      'display:block; margin:16px 0 0; text-align:center; text-decoration:none;' +
      'background:' + ACCENT + '; color:#fff; border-radius:12px; padding:13px;' +
      "font:700 15px/1 'Inter';", "Démarrer l'essai gratuit");
    cta.href = LIEN;
    cta.addEventListener('click', function () { ecrire(CLE_VU, String(Date.now())); });

    var plusTard = el('button',
      'display:block; width:100%; margin:9px 0 0; padding:8px; border:none; background:transparent;' +
      "font:600 13px/1 'Inter'; color:#8a8aa4; cursor:pointer;", 'Plus tard');
    plusTard.addEventListener('click', function () { fermer(true); });

    carte.appendChild(croix);
    carte.appendChild(pastille);
    carte.appendChild(titre);
    carte.appendChild(texte);
    carte.appendChild(cta);
    carte.appendChild(plusTard);
    document.body.appendChild(carte);

    requestAnimationFrame(function () {
      carte.style.opacity = '1';
      carte.style.transform = 'translateY(0)';
    });

    function auClavier(e) { if (e.key === 'Escape') fermer(true); }
    document.addEventListener('keydown', auClavier);

    function fermer(memoriser) {
      document.removeEventListener('keydown', auClavier);
      if (memoriser) ecrire(CLE_VU, String(Date.now()));
      carte.style.opacity = '0';
      carte.style.transform = 'translateY(14px)';
      setTimeout(function () { if (carte.parentNode) carte.parentNode.removeChild(carte); }, lent ? 0 : 340);
    }
  }
})();
