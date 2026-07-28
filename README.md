# Ciné Planner — site web (cineplanner.fr)

Site marketing de Ciné Planner : logiciel RH et planning pour les exploitants de cinéma.
Opéré par SmartPlanner SAS (40 Allée Eugène Delacroix, 33800 Bordeaux — SIRET 934 294 083).

## Ce que contient ce dépôt

Un site statique **prêt à déployer** (aucun build, aucune dépendance npm).
Chaque page est un fichier HTML autonome qui s'ouvre directement dans un navigateur.

```
index.html                     → page d'accueil (copie de "Cine Planner Landing.dc.html")
Cine Planner Landing.dc.html   → page d'accueil (source de référence)
Tarifs.dc.html                 → tarifs + tableau comparatif + FAQ
Blog.dc.html                   → liste des articles
Article.dc.html                → article (convention collective)
Essai gratuit.dc.html          → formulaire de demande d'essai 14 jours
Feature - *.dc.html            → 6 pages fonctionnalités
Mentions legales / Confidentialite / CGU  → pages légales
SiteNav.dc.html                → barre de navigation partagée (méga-menu + burger mobile)
*Screen.dc.html / AppScreen    → maquettes de l'application recréées en HTML/CSS
support.js                     → runtime des composants (fourni, ne pas modifier)
assets/                        → logos, captures, images de partage
_redirects / netlify.toml      → URLs propres + en-têtes (Netlify)
robots.txt / sitemap.xml       → SEO
```

## Déploiement

**GitHub Pages (en place)**
- Dépôt : `smartplannersas/cineplanner-landing`, branche `main`, racine du dépôt.
- Tout push sur `main` publie le site sur
  https://smartplannersas.github.io/cineplanner-landing/
- `.nojekyll` désactive le traitement Jekyll (sinon les fichiers commençant par `_`
  sont ignorés).
- Les liens internes sont **relatifs** (`Tarifs.dc.html`, `./assets/…`) : indispensable,
  le site est servi depuis le sous-chemin `/cineplanner-landing/`. Ne pas introduire de
  chemins absolus commençant par `/`.
- `_redirects` et `netlify.toml` ne sont **pas** interprétés par GitHub Pages : les URLs
  propres (`/tarifs`, `/blog`, …) et les en-têtes de sécurité ne s'appliquent pas ici.
  Ces fichiers sont conservés pour un futur déploiement Netlify.

**Netlify (optionnel, déjà configuré)**
1. Connecter ce dépôt GitHub à Netlify.
2. Build command : *(aucune)* — Publish directory : `.` (racine).
3. `netlify.toml` gère les en-têtes de sécurité et le cache ; `_redirects` les URLs propres
   (`/tarifs`, `/blog`, `/essai-gratuit`, `/planification`, `/mentions-legales`, …).

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

1. **Formulaire d'essai** (`Essai gratuit.dc.html`) : variable `ENDPOINT` en haut de la logique.
   Vide → ouvre un mail vers `contact@cineplanner.fr`. Renseigner l'URL Tally/Formspree
   (ou un endpoint interne) pour un envoi direct.
2. **Lien Connexion** : pointe vers `https://app.cineplanner.fr` — à confirmer.
3. **Calendly** : `https://calendly.com/thibaud-cineplanner/30min` (démo / expert).
4. **Blog** : un seul article rédigé ; les 12 cartes pointent vers lui. À enrichir.
5. **Photos du blog** : chargées depuis Pexels (licence gratuite, sans attribution).
   Pour supprimer la dépendance externe, les télécharger dans `assets/`.
6. **Analytics** : aucun traqueur installé (la politique de confidentialité mentionne
   Google Analytics — à installer ou à retirer du texte).

## Données de démonstration

Toutes les maquettes produit utilisent des données **fictives et anonymisées**
(cinémas « CINÉ HORIZON », salariés inventés). Ne pas y réintroduire de données réelles.
Seules les références clientes publiques sont citées (Mégarama, Veo, CNC, Confluences,
Panacea, Arvor, Alticiné) avec la citation de François Garces (Mégarama Bordeaux).

## Charte

- Indigo `#5B4FE8` (accent), foncé `#4536c9`, nuit `#241f6b` / `#16152f`
- Typographie : Inter (Google Fonts)
- Dégradés : `linear-gradient(160deg,#241f6b 0%,#16152f 72%)` pour les sections sombres
- Rayons : 12px (boutons), 20–22px (cartes)

## Workflow d'édition

Le site est maintenu depuis **Claude Design** (édition visuelle + code) et peut être
modifié en parallèle avec **Claude Code** sur ce dépôt. Pour éviter les conflits :
faire les modifications d'un seul côté à la fois, puis synchroniser.
