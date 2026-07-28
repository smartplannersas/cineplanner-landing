/* Paiement intégré à la page Abonnement.
 *
 * Le visiteur ne quitte jamais le site : le formulaire Stripe s'affiche dans la page.
 * Tant que ENDPOINT est vide, ce script ne fait rien et la table de tarification Stripe
 * reste en place — le paiement continue donc de fonctionner pendant la mise en service.
 *
 * Renseigner ENDPOINT avec l'URL renvoyée par « wrangler deploy » (voir worker/README.md).
 */
(function () {
  'use strict';

  var ENDPOINT = ''; // ex. 'https://cineplanner-checkout.votre-sous-domaine.workers.dev'
  var CLE_PUBLIABLE = 'pk_live_51QFD4EKNxIQlauaJjANl6SguR2aC6BUilGzqVxYwBxUgTnv7unldxnaBKm04SoSaQOmhBzn3MS7ZxGQIxQI6eiIF00pkSGosRI';
  var PAGE_RETOUR = 'merci.html';

  window.CP_CHECKOUT_ENDPOINT = ENDPOINT;
  if (!ENDPOINT) return;

  var checkout = null;   // instance Stripe en cours, à détruire avant d'en monter une autre
  var enCours = false;

  function conteneur() {
    var section = document.getElementById('paiement');
    if (!section) return null;
    var hote = document.getElementById('cp-checkout');
    if (!hote) {
      hote = document.createElement('div');
      hote.id = 'cp-checkout';
      hote.setAttribute('style', 'max-width:1100px; margin:0 auto; min-height:320px;');
      var table = section.querySelector('stripe-pricing-table');
      if (table && table.parentNode) {
        table.parentNode.style.display = 'none';        // la table devient le repli
        table.parentNode.parentNode.appendChild(hote);
      } else {
        section.appendChild(hote);
      }
    }
    return hote;
  }

  function message(hote, texte) {
    hote.innerHTML = '';
    var p = document.createElement('p');
    p.setAttribute('style', "text-align:center; font:500 15px/1.6 'Inter',system-ui,sans-serif; color:#5c5c72; padding:40px 20px;");
    p.textContent = texte;
    hote.appendChild(p);
  }

  function replier(hote) {
    // En cas d'échec, on réaffiche la table Stripe plutôt que de laisser un trou :
    // le visiteur doit toujours pouvoir payer.
    var section = document.getElementById('paiement');
    var table = section && section.querySelector('stripe-pricing-table');
    if (table && table.parentNode) table.parentNode.style.display = '';
    if (hote && hote.parentNode) hote.parentNode.removeChild(hote);
  }

  async function ouvrir(formule) {
    if (enCours) return;
    enCours = true;
    var hote = conteneur();
    if (!hote) { enCours = false; return; }

    hote.scrollIntoView({ behavior: 'smooth', block: 'start' });
    message(hote, 'Préparation du paiement sécurisé…');

    try {
      var base = location.href.replace(/[^/]*$/, '');
      var reponse = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formule: formule, retour: base + PAGE_RETOUR })
      });
      var donnees = await reponse.json();
      if (!reponse.ok || !donnees.clientSecret) throw new Error(donnees.erreur || 'réponse inattendue');

      if (checkout) { try { checkout.destroy(); } catch (e) { /* déjà démonté */ } }
      hote.innerHTML = '';
      var stripe = window.Stripe(CLE_PUBLIABLE);
      checkout = await stripe.initEmbeddedCheckout({ clientSecret: donnees.clientSecret });
      checkout.mount('#cp-checkout');
    } catch (e) {
      console.error('[checkout]', e);
      replier(hote);
    } finally {
      enCours = false;
    }
  }

  document.addEventListener('click', function (e) {
    var bouton = e.target.closest ? e.target.closest('[data-formule]') : null;
    if (!bouton) return;
    var formule = bouton.getAttribute('data-formule');
    // Les formules annuelles gardent leurs liens de paiement Stripe : on ne les intercepte pas.
    if (!formule || bouton.getAttribute('href') !== '#paiement') return;
    e.preventDefault();
    ouvrir(formule);
  });
})();
