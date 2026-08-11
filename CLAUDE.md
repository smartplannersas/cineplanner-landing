# Instructions pour Claude Code — site Ciné Planner

## Nature du projet
Site statique. **Pas de build, pas de npm, pas de framework à installer.**
Chaque page est un fichier `.dc.html` autonome exécuté par `support.js`.

## Dépôt et déploiement
- Remote : `git@github.com:smartplannersas/cineplanner-landing.git`
- Branche principale : **`main`**
- GitHub Pages est branché sur `main` (racine du dépôt) : **tout push sur `main` publie
  le site** sur https://www.cineplanner.fr/ (domaine personnalisé, fichier `CNAME`).
- Le site est servi **à la racine du domaine** : les chemins sont **racine-relatifs**
  (`/tarifs`, `/assets/logo.png`, `/support.js`). Ne pas revenir aux chemins relatifs sans
  barre (`tarifs`, `./assets/…`) : ils cassent dès qu'une URL comporte une barre finale.
- `CNAME` contient `www.cineplanner.fr` sur une seule ligne — ne pas le supprimer, GitHub
  Pages perdrait le domaine personnalisé.
- `.nojekyll` est présent — ne pas le supprimer.
- GitHub Pages **complète l'extension tout seul** : `/tarifs` sert `tarifs.html`. Les adresses
  sans extension fonctionnent donc en ligne (vérifié : `/tarifs` répond 200).
- `_redirects` et `netlify.toml` ont été supprimés : inopérants sur GitHub Pages. Les
  redirections de l'ancien site Framer sont des pages HTML (`contact.html`, `services.html`,
  `a-propos.html`) qui font un `location.replace` vers leur cible.

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
cette forme courte **avec une barre de début** (`href="/tarifs"`, `href="/essai-gratuit"`) :
le site est servi à la racine du domaine.
Pour viser l'accueil ou une de ses ancres, écrire `href="/"` et `href="/#feat"`.

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

## Formulaire d'essai gratuit
`essai-gratuit.html` poste en JSON vers FormSubmit
(`https://formsubmit.co/ajax/191c3a86945ea237ab43abbde4eebf0f`), qui relaie vers
`contact@cineplanner.fr`.

**L'activation FormSubmit est liée à l'URL de la page qui poste, pas seulement à
l'endpoint.** Tant qu'elle n'est pas confirmée pour cette URL précise, chaque envoi
reçoit `{"success":"false","message":"This form needs Activation…"}` et la page
bascule sur son repli mailto. Le formulaire a passé plusieurs jours dans cet état :
le lien d'activation cliqué portait sur `https://www.cineplanner.fr/` et non sur
`https://www.cineplanner.fr/essai-gratuit`. Après le clic, **vérifier que la page de
confirmation affiche l'URL complète de la page du formulaire**, pas la racine.

Conséquence : si la page change d'adresse, ou si ce formulaire est repris sur une
autre page, il faut réactiver pour la nouvelle URL.

Piège de diagnostic : appelé sans en-tête `Referer`, FormSubmit répond
« Make sure you open this page through a web server ». Ce message ne parle pas de
l'activation et n'a rien à voir avec des fichiers HTML locaux — c'est simplement sa
réponse à une requête sans `Referer`. Un navigateur en envoie toujours un ; ce cas ne
se rencontre qu'en test depuis la ligne de commande.

Le repli est volontaire : en cas d'échec, le formulaire reste rempli et propose un
`mailto:contact@cineplanner.fr` pré-rempli avec toutes les réponses. Le champ
`societe_web` est un leurre anti-robot : s'il est rempli, la confirmation s'affiche
mais rien n'est envoyé.

## Contenu sensible
Les maquettes produit contiennent des données **fictives**. Ne jamais y injecter de vraies
données salariés ni de vrais noms de cinémas clients.

## Aperçu local
**Ne pas ouvrir les fichiers en `file://`** : les chemins racine-relatifs (`/support.js`,
`/assets/…`) y repartent de la racine du disque, et les liens internes sont sans extension.
Rien ne s'affiche. Servir le dépôt **depuis sa racine** avec un serveur qui gère les URLs
propres, par exemple `npx serve` à la racine : `/tarifs` et `/assets/…` résolvent alors
comme en production.

## Vérification
Ouvrir la page modifiée depuis le serveur local et contrôler la console : zéro erreur attendue.
Tester la largeur mobile (< 960 px) : la navigation passe en burger, les grilles en une colonne.
Contrôler que les boutons d'appel à l'action sont bien des `<a href>` et non des `<span>`
stylisés : le piège s'est déjà produit sur 14 boutons.
