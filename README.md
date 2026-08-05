# Ciné Planner — site web (cineplanner.fr)

Site marketing de Ciné Planner : logiciel RH et planning pour les exploitants de cinéma.
Opéré par SmartPlanner SAS (40 Allée Eugène Delacroix, 33800 Bordeaux — SIRET 934 294 083 00019).

## Ce que contient ce dépôt

Un site statique **prêt à déployer** (aucun build, aucune dépendance npm).
Chaque page est un fichier HTML autonome qui s'ouvre directement dans un navigateur.

```
index.html                     → page d'accueil (source unique)
tarifs.html                    → tarifs + tableau comparatif + FAQ
blog.html                      → liste des articles
convention-collective-cinema.html → article de fond
abonnement.html                → souscription, liens de paiement Stripe
essai-gratuit.html             → formulaire de demande d'essai 14 jours
planification.html             → 6 pages fonctionnalités
suivi-des-temps.html
contrats.html
export-paie.html
espace-equipe.html
coffre-fort-documents.html
mentions-legales.html / confidentialite.html / cgu.html  → pages légales
SiteNav.dc.html                → barre de navigation partagée (composant)
*Screen.dc.html / AppScreen    → maquettes de l'application (composants)
support.js                     → runtime des composants (fourni, ne pas modifier)
trial-popup.js                 → invitation à l'essai après 30 s de navigation
assets/                        → logos, captures, images de partage
robots.txt / sitemap.xml / llms.txt  → référencement classique et génératif
netlify.toml                   → en-têtes et cache (inactif sur GitHub Pages)
```

## Déploiement

**GitHub Pages (en place)**
- Dépôt : `smartplannersas/cineplanner-landing`, branche `main`, racine du dépôt.
- Tout push sur `main` publie le site sur
  https://smartplannersas.github.io/cineplanner-landing/
- `.nojekyll` désactive le traitement Jekyll (sinon les fichiers commençant par `_`
  sont ignorés).
- Les pages sont servies **sans extension** : `tarifs.html` répond aussi sur `/tarifs`.
  C'est un comportement natif de GitHub Pages, vérifié ; les liens internes utilisent
  donc la forme courte avec une barre de début (`/tarifs`).
- Les assets restent en relatif (`./assets/…`) pour fonctionner quel que soit le préfixe.
- `netlify.toml` n'est pas interprété par GitHub Pages : les en-têtes de sécurité ne
  s'appliquent pas ici. Le fichier est conservé pour un éventuel déploiement Netlify.

**Netlify (optionnel, déjà configuré)**
1. Connecter ce dépôt GitHub à Netlify.
2. Build command : *(aucune)* — Publish directory : `.` (racine).
3. `netlify.toml` gère les en-têtes de sécurité et le cache. Les adresses courtes ne
   demandent aucune configuration : elles découlent du nom des fichiers.

## Architecture des pages

Les pages sont des **Design Components** : un fichier HTML contient un template
(`<x-dc>…</x-dc>`) et une classe de logique (`class Component extends DCLogic`) exécutée par
`support.js`. Points importants :

- **Tous les styles sont en ligne** (`style="…"`), volontairement — aucun fichier CSS.
- `<sc-for list="{{ items }}" as="item">` = boucle ; `<sc-if value="{{ flag }}">` = condition.
- `{{ chemin }}` = valeur renvoyée par `renderVals()` dans la classe de logique.
  Ce sont des **chemins uniquement**, pas des expressions JS.
- `<dc-import name="SiteNav">` monte un autre composant du même dossier.
- Les écrans de l'application (planning, retards, contrats, congés, documents) sont
  **recréés en HTML/CSS**, pas des captures : ils se mettent à l'échelle via un
  `ResizeObserver` (voir `PlanningScreen.dc.html`).

## Points à traiter côté développement

1. **Formulaire d'essai** (`essai-gratuit.html`) : variable `ENDPOINT` en haut de la logique.
   Vide → ouvre un mail vers `contact@cineplanner.fr`. Renseigner l'URL Tally/Formspree
   (ou un endpoint interne) pour un envoi direct.
2. **Lien Connexion** : pointe vers `https://app.cineplanner.fr` — à confirmer.
3. **Calendly** : `https://calendly.com/thibaud-cineplanner/30min` (démo / expert).
4. **Blog** : en cours de refonte — voir `blog.html` et les articles à la racine.
5. **Photos du blog** : chargées depuis Pexels (licence gratuite, sans attribution).
   Pour supprimer la dépendance externe, les télécharger dans `assets/`.
6. **Analytics** : aucun traqueur installé (la politique de confidentialité mentionne
   Google Analytics — à installer ou à retirer du texte).

## Données de démonstration

Toutes les maquettes produit utilisent des données **fictives et anonymisées**
(cinémas « CINÉ HORIZON », salariés inventés). Ne pas y réintroduire de données réelles.
Seules les références clientes publiques sont citées (Megarama, Veo, CNC, Confluences,
Panacea, Arvor, Alticiné) avec la citation de François Garces (Megarama Bordeaux).

## Charte

- Indigo `#5B4FE8` (accent), foncé `#4536c9`, nuit `#241f6b` / `#16152f`
- Typographie : Inter (Google Fonts)
- Dégradés : `linear-gradient(160deg,#241f6b 0%,#16152f 72%)` pour les sections sombres
- Rayons : 12px (boutons), 20–22px (cartes)

## Workflow d'édition

Le site est maintenu depuis **Claude Design** (édition visuelle + code) et peut être
modifié en parallèle avec **Claude Code** sur ce dépôt. Pour éviter les conflits :
faire les modifications d'un seul côté à la fois, puis synchroniser.
