/* Cloudflare Worker — création de sessions Stripe Checkout en mode intégré.
 *
 * Le site est statique (GitHub Pages) : il ne peut pas détenir la clé secrète Stripe.
 * Ce Worker est la seule pièce qui la connaît. Il expose un unique point d'entrée qui
 * crée une session et renvoie son client_secret ; le navigateur monte ensuite le
 * formulaire de paiement dans la page, sans jamais quitter le site.
 *
 * Déploiement : voir worker/README.md
 * Secret attendu : STRIPE_SECRET_KEY (wrangler secret put STRIPE_SECRET_KEY)
 */

// Seuls ces prix peuvent être achetés. Un identifiant absent de cette liste est rejeté :
// sans ce garde-fou, n'importe qui pourrait faire créer une session sur un prix arbitraire.
const PRIX_AUTORISES = {
  'essentielle-1-3': 'price_1Ty8YLKNxIQlauaJMqJYZ2TP', //  51 € / mois
  'essentielle-4+': 'price_1Ty8YqKNxIQlauaJKMqTuqwV',  //  93 € / mois
  'rh-1-3': 'price_1Ty8ZpKNxIQlauaJfiLgk5ez',          //  99 € / mois
  'rh-4+': 'price_1Ty8aGKNxIQlauaJwYHjrTOc'            // 156 € / mois
};

const ORIGINES_AUTORISEES = [
  'https://smartplannersas.github.io',
  'https://cineplanner.fr',
  'https://www.cineplanner.fr',
  'http://localhost:8080'
];

function enTetesCors(origine) {
  const ok = ORIGINES_AUTORISEES.includes(origine);
  return {
    'Access-Control-Allow-Origin': ok ? origine : ORIGINES_AUTORISEES[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(donnees, statut, origine) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { 'Content-Type': 'application/json', ...enTetesCors(origine) }
  });
}

export default {
  async fetch(request, env) {
    const origine = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: enTetesCors(origine) });
    }

    // Consultation de l'état d'une session, pour la page de retour après paiement.
    if (request.method === 'GET') {
      const id = new URL(request.url).searchParams.get('session_id');
      if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) {
        return json({ erreur: 'Session invalide' }, 400, origine);
      }
      if (!env.STRIPE_SECRET_KEY) {
        return json({ erreur: 'Configuration incomplète côté serveur' }, 500, origine);
      }
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, {
        headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY }
      });
      const s = await r.json();
      if (!r.ok) return json({ erreur: 'Session introuvable' }, 404, origine);
      return json({ statut: s.status, paiement: s.payment_status, email: s.customer_details && s.customer_details.email }, 200, origine);
    }

    if (request.method !== 'POST') {
      return json({ erreur: 'Méthode non autorisée' }, 405, origine);
    }
    if (!ORIGINES_AUTORISEES.includes(origine)) {
      return json({ erreur: 'Origine non autorisée' }, 403, origine);
    }
    if (!env.STRIPE_SECRET_KEY) {
      return json({ erreur: 'Configuration incomplète côté serveur' }, 500, origine);
    }

    let corps;
    try {
      corps = await request.json();
    } catch (e) {
      return json({ erreur: 'Requête illisible' }, 400, origine);
    }

    const prix = PRIX_AUTORISES[corps && corps.formule];
    if (!prix) {
      return json({ erreur: 'Formule inconnue' }, 400, origine);
    }

    // L'URL de retour doit appartenir au site : sinon un tiers pourrait rediriger
    // le client vers un domaine qu'il contrôle après un paiement réussi.
    const retour = String((corps && corps.retour) || '');
    if (!ORIGINES_AUTORISEES.some((o) => retour.startsWith(o + '/'))) {
      return json({ erreur: 'URL de retour non autorisée' }, 400, origine);
    }

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('ui_mode', 'embedded');
    params.set('line_items[0][price]', prix);
    params.set('line_items[0][quantity]', '1');
    params.set('return_url', retour + '?session_id={CHECKOUT_SESSION_ID}');
    params.set('automatic_tax[enabled]', 'true');
    params.set('billing_address_collection', 'required');
    params.set('locale', 'fr');

    const reponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2024-06-20'
      },
      body: params
    });

    const donnees = await reponse.json();

    if (!reponse.ok) {
      // On journalise le détail côté Worker mais on ne le renvoie pas au navigateur :
      // les messages d'erreur Stripe peuvent exposer la configuration du compte.
      console.error('Stripe', reponse.status, donnees && donnees.error);
      return json({ erreur: "La session de paiement n'a pas pu être créée" }, 502, origine);
    }

    return json({ clientSecret: donnees.client_secret }, 200, origine);
  }
};
