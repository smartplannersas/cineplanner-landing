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
7. **Le `<helmet>` d'un fichier `.dc.html` ne contient qu'un `<style>`.** Voir la
   section ci-dessous : toute autre balise contamine les pages hôtes.
8. **JavaScript classique** dans la classe de logique : pas de TypeScript, pas d'`import`.
   La classe doit s'appeler `Component` et étendre `DCLogic`.

## Le `<helmet>` d'un composant fuit dans le `<head>` de la page hôte

`support.js` recopie le contenu de chaque `<helmet>` dans `document.head` — celui de
**la page qui importe le composant**, pas un espace isolé. Pour `SCRIPT`, `LINK` et
`META`, c'est un `head.appendChild(child.cloneNode(true))` **sans aucun filtrage**
(`support.js`, lignes 1367-1404).

Conséquence : une balise `meta`, `title` ou `link` placée dans le `<helmet>` d'un
`.dc.html` s'applique aux **20 pages** qui importent ce composant. Un `<title>` y
écraserait le titre de chaque page, un `link rel="canonical"` ferait pointer toutes
les pages vers la même URL.

**Donc : uniquement `<style>` dans le `<helmet>` d'un `.dc.html`.** C'est l'état
actuel des 11 fragments — 10 n'ont qu'un `<style>`, `export-planning.dc.html` n'a
pas de `<helmet>`. Les métadonnées d'une page se déclarent dans la page elle-même.

**Piste déjà explorée et écartée — ne pas la rouvrir.** Pour empêcher l'indexation
des fragments, l'idée d'ajouter `<meta name="robots" content="noindex">` dans leur
`<helmet>` a été testée sur `SiteNav.dc.html` (11 août 2026). Le rendu n'est pas
cassé, mais le `<head>` de `/tarifs` se retrouve avec :

```html
<meta name="robots" content="index,follow">
<meta name="robots" content="noindex" data-dc-tpl="1">   <!-- venu de SiteNav -->
```

Google arbitre deux directives `robots` contradictoires en retenant **la plus
restrictive** : les 20 pages passeraient en `noindex`. Le `Disallow: /*.dc.html$`
dans `robots.txt` n'est pas une alternative non plus — voir le commentaire qui a
remplacé cette règle. Les fragments restent donc accessibles et sans directive.

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
`essai-gratuit.html` poste en JSON vers l'application Ciné Planner :
`POST https://app.cineplanner.fr/trial_requests` (dépôt `smartplannersas/cineplanner`,
`app/controllers/trial_requests_controller.rb`). L'application enregistre la demande
dans son back-office (« Demandes d'essai »), notifie les super admins et envoie un mail
à `contact@cineplanner.fr`. FormSubmit n'est plus utilisé.

Champs envoyés : `prenom`, `nom`, `cinema`, `email`, `telephone`, `etablissements`,
`besoin`, `source`, `societe_web`. L'application répond `{"success":true}` (un booléen).

Ce que l'application refuse, et que la page traite comme un échec d'envoi :
- **403** si l'en-tête `Origin` n'est pas `https://www.cineplanner.fr` ou
  `https://cineplanner.fr`. Le CORS n'est ouvert que pour ces deux origines : le
  formulaire ne peut donc pas aboutir depuis un serveur local ni depuis un autre domaine.
  Si le site change de domaine, il faut l'ajouter côté application
  (`config/initializers/cors.rb`).
- **422** si prénom, nom, cinéma ou email valide manque.
- **429** au-delà de 5 envois par heure depuis la même adresse IP.

Le repli est volontaire : en cas d'échec, le formulaire reste rempli et propose un
`mailto:contact@cineplanner.fr` pré-rempli avec toutes les réponses.

Le champ `societe_web` est un leurre anti-robot. Il est envoyé avec le reste : s'il est
rempli, l'application n'enregistre rien mais répond quand même `{"success":true}`, et la
confirmation s'affiche.

Piège de test : chaque envoi réussi crée une vraie demande en production et un vrai
mail à l'équipe. Pour tester sans cela, intercepter la requête dans le navigateur
(outils de développement ou Playwright) plutôt que d'envoyer le formulaire.

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
