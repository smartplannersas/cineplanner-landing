# Worker de paiement — Ciné Planner

Petit service qui crée les sessions Stripe Checkout pour le paiement intégré à la page
Abonnement. C'est la seule pièce de l'ensemble qui détient la clé secrète Stripe : le site
lui-même est statique et ne peut rien garder de secret.

## Pourquoi ce Worker existe

Stripe exige qu'une session de paiement soit créée avec la clé secrète avant de pouvoir
afficher un formulaire. Sur GitHub Pages, aucun code ne s'exécute côté serveur. Ce Worker
comble ce trou, et rien d'autre : il ne stocke aucune donnée, ne tient aucun état.

## Déploiement (une fois)

```bash
npm install -g wrangler          # si wrangler n'est pas déjà installé
cd worker
wrangler login                   # ouvre le navigateur, connecte votre compte Cloudflare
wrangler secret put STRIPE_SECRET_KEY   # colle la clé sk_live_… : elle n'apparaît nulle part dans le dépôt
wrangler deploy
```

`wrangler deploy` affiche l'URL publique du Worker, de la forme
`https://cineplanner-checkout.<votre-sous-domaine>.workers.dev`.

**Reportez cette URL dans `checkout-embed.js`** à la racine du dépôt (constante `ENDPOINT`),
puis poussez sur `main`.

## La clé secrète

- Elle se dépose uniquement via `wrangler secret put`, jamais dans un fichier.
- Elle commence par `sk_live_`. Si elle fuite, révoquez-la immédiatement dans Stripe
  (Développeurs → Clés API → Révoquer) et redéposez-en une nouvelle.
- La clé *publiable* (`pk_live_`), elle, est faite pour être visible dans les pages.

## Ce que le Worker accepte

Une seule requête : `POST` avec `{"formule": "...", "retour": "https://..."}`.

| `formule` | Prix Stripe | Montant |
|---|---|---|
| `essentielle-1-3` | `price_1Ty8YLKNxIQlauaJMqJYZ2TP` | 51 € / mois |
| `essentielle-4+` | `price_1Ty8YqKNxIQlauaJKMqTuqwV` | 93 € / mois |
| `rh-1-3` | `price_1Ty8ZpKNxIQlauaJfiLgk5ez` | 99 € / mois |
| `rh-4+` | `price_1Ty8aGKNxIQlauaJwYHjrTOc` | 156 € / mois |

Toute autre formule est refusée, et l'URL de retour doit appartenir au site. Ces deux
contrôles évitent qu'un tiers se serve du Worker pour créer des sessions arbitraires ou
détourner les clients après paiement.

**Si vous changez un prix dans Stripe**, l'ancien identifiant est archivé et le paiement
cesse de fonctionner : mettez à jour `PRIX_AUTORISES` dans `checkout.js`, puis redéployez.
C'est exactement ce qui a cassé les anciens liens de paiement.

## Formules annuelles

Elles ne passent pas encore par ce Worker : la page Abonnement utilise toujours les liens
de paiement Stripe, qui fonctionnent. Pour les basculer ici, ajoutez leurs identifiants de
prix à `PRIX_AUTORISES` et étendez le sélecteur côté page.

## Vérifier après déploiement

```bash
curl -X POST https://cineplanner-checkout.<sous-domaine>.workers.dev \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://smartplannersas.github.io' \
  -d '{"formule":"essentielle-1-3","retour":"https://smartplannersas.github.io/cineplanner-landing/merci.html"}'
```

Une réponse contenant `clientSecret` signifie que tout est en place. Utilisez d'abord une
clé de test (`sk_test_…`) avec des prix de test si vous voulez essayer sans encaisser.
