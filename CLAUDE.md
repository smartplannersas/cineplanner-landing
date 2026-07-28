# Instructions pour Claude Code — site Ciné Planner

## Nature du projet
Site statique. **Pas de build, pas de npm, pas de framework à installer.**
Chaque page est un fichier `.dc.html` autonome exécuté par `support.js`.

## Dépôt et déploiement
- Remote : `git@github.com:smartplannersas/cineplanner-landing.git`
- Branche principale : **`main`**
- GitHub Pages est branché sur `main` (racine du dépôt) : **tout push sur `main` publie
  le site** sur https://smartplannersas.github.io/cineplanner-landing/
- Le site est servi depuis le sous-chemin `/cineplanner-landing/` : **toujours des chemins
  relatifs** (`Tarifs.dc.html`, `./assets/logo.png`). Un chemin absolu `/assets/…` casse.
- `.nojekyll` est présent — ne pas le supprimer.
- `_redirects` / `netlify.toml` ne sont pas interprétés par GitHub Pages (URLs propres
  inactives ici) ; les conserver pour un éventuel déploiement Netlify.

## Règles à respecter absolument

1. **Styles en ligne uniquement.** Ne pas créer de fichier CSS, ne pas introduire de classes
   utilitaires. Tous les styles sont dans les attributs `style="…"`. C'est volontaire
   (rendu progressif immédiat).
2. **Ne jamais modifier `support.js`** — c'est le runtime fourni.
3. **Les trous de template `{{ x }}` sont des chemins, pas des expressions.**
   Interdit : `{{ a + b }}`, `{{ !x }}`, `{{ f() }}`.
   Calculer la valeur dans `renderVals()` de la classe de logique et l'exposer par son nom.
4. **Boucles / conditions** : `<sc-for list="{{ items }}" as="item">`, `<sc-if value="{{ flag }}">`.
   Toujours renseigner `hint-placeholder-count` / `hint-placeholder-val`.
5. **Composants enfants** : `<dc-import name="SiteNav" hint-size="100%,84px"></dc-import>`.
   Jamais de balise capitalisée (`<SiteNav />` ne fonctionne pas). Toujours fermer la balise.
6. **Pas de `<script src>` dans le corps du template** — uniquement dans `<helmet>`.
7. **JavaScript classique** dans la classe de logique : pas de TypeScript, pas d'`import`.
   La classe doit s'appeler `Component` et étendre `DCLogic`.

## Pages et adresses
`index.html` est la page d'accueil et l'unique source : la copie
`Cine Planner Landing.dc.html` a été supprimée, il n'y a plus rien à synchroniser.

Les **pages** portent un nom court en `.html` (`tarifs.html`, `export-paie.html`), servi
sans extension par GitHub Pages : `www.cineplanner.fr/tarifs`. Les liens internes utilisent
cette forme courte, avec une barre de début (`href="/tarifs"`).

Les **composants** gardent l'extension `.dc.html` (`SiteNav.dc.html`, `PlanningScreen.dc.html`) :
`support.js` les résout par leur nom de fichier, les renommer casserait les imports.

## Nouvelle page
1. Dupliquer une page existante de structure proche (ex. `tarifs.html`), en la nommant
   d'après son adresse voulue, en minuscules et sans accent.
2. Monter la navigation partagée : `<dc-import name="SiteNav" hint-size="100%,84px"></dc-import>`.
3. Ajouter le pied de page (copier celui de la page dupliquée) avec les liens légaux.
4. Renseigner `<link rel="canonical">`, `og:url` et les données structurées JSON-LD sur
   `https://www.cineplanner.fr/<adresse>`.
5. Ajouter l'entrée correspondante dans `sitemap.xml`.

## Contenu sensible
Les maquettes produit contiennent des données **fictives**. Ne jamais y injecter de vraies
données salariés ni de vrais noms de cinémas clients.

## Vérification
Ouvrir le fichier modifié dans un navigateur et contrôler la console : zéro erreur attendue.
Tester la largeur mobile (< 960 px) : la navigation passe en burger, les grilles en une colonne.
