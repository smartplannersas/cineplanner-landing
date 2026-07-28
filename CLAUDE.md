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

## Après toute modification de la page d'accueil
`index.html` est une copie de `Cine Planner Landing.dc.html`. Les deux doivent rester
identiques :
```bash
cp "Cine Planner Landing.dc.html" index.html
```

## Nouvelle page
1. Dupliquer une page existante de structure proche (ex. `Tarifs.dc.html`).
2. Monter la navigation partagée : `<dc-import name="SiteNav" hint-size="100%,84px"></dc-import>`.
3. Ajouter le pied de page (copier celui de la page dupliquée) avec les liens légaux.
4. Mettre à jour `sitemap.xml`, et `_redirects` si l'URL doit être propre.

## Contenu sensible
Les maquettes produit contiennent des données **fictives**. Ne jamais y injecter de vraies
données salariés ni de vrais noms de cinémas clients.

## Vérification
Ouvrir le fichier modifié dans un navigateur et contrôler la console : zéro erreur attendue.
Tester la largeur mobile (< 960 px) : la navigation passe en burger, les grilles en une colonne.
