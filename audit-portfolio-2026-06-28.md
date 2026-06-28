# Website Audit — Portfolio Helio Martone

**URL :** https://heliomrt95.github.io/portfolio/
**Date :** 2026-06-28
**Stack :** Site statique HTML/CSS/JS vanilla, déployé sur GitHub Pages (workflow `static.yml`). Formulaire de contact via EmailJS.
**Scope :** SEO · Performance · Accessibilité · Sécurité & technique (audit complet, code + site live)

---

## Note globale : D — 42/100

| Domaine | Score | Verdict |
|---|---|---|
| SEO | 55/100 | Bases présentes mais `lang` erroné, pas de description, titre générique, aucun partage social. |
| Performance | 25/100 | Critique : ~280 Mo de médias non optimisés, le preloader bloque l'affichage sur ~123 Mo d'images. |
| Accessibilité | 55/100 | Bon usage des `aria-label`, mais `lang="en"` sur un site français, pas de `<main>`, formulaire sans `<label>`. |
| Sécurité & technique | 52/100 | HTTPS OK, mais aucun en-tête de sécurité, code mort PHP exposé, IDs dupliqués. |

Le site est soigné visuellement et bien structuré côté interactions (modales, carrousel, menu). Le problème dominant est la **performance** : la page pèse plusieurs centaines de Mo et le preloader force le téléchargement de toute la galerie photo (~123 Mo) *avant* d'afficher quoi que ce soit. C'est, de loin, ce qu'il faut corriger en premier — l'expérience réelle d'un visiteur mobile est aujourd'hui une attente de plusieurs dizaines de secondes sur un écran « Chargement… ».

---

## À corriger en priorité

1. **Le preloader attend ~123 Mo d'images avant d'afficher la page** (Critique) — `index.html:812-865`. Le `Promise.all` du preloader précharge les 10 photos de la galerie (jusqu'à 19 Mo l'unité) qui ne sont même pas visibles au départ. → Retirer `galleryImages` du preloader ; ne charger ces images qu'à l'ouverture de la modale galerie.
2. **~170 Mo d'images, ~110 Mo de vidéos, non optimisées** (Critique) — `assets/img/`, `videos/`. Plusieurs PNG de 13 à 19 Mo (`gallery/photo5.png` 19 Mo, `photo3.png` 19 Mo, `photo7.png` 19 Mo). → Convertir en WebP/AVIF et redimensionner à la taille d'affichage réelle. Gain attendu : 90 %+ de poids.
3. **`lang="en"` sur un site entièrement en français** (Élevé) — `index.html:2`. Pénalise le SEO (mauvaise langue ciblée) et l'accessibilité (synthèse vocale en anglais sur du texte français). → `<html lang="fr">`.
4. **Image hero LCP de 2,9 Mo préchargée** (Élevé) — `index.html:10` + `index.html:236` (`assets/img/image2.png`). C'est l'élément LCP, en PNG lourd, préchargé donc téléchargé immédiatement. → Optimiser en WebP (~200-400 Ko) et adapter le `preload`.
5. **Pas de meta description + titre générique « Portfolio Website »** (Moyen) — `index.html:7`. → Titre type « Helio Martone — Développeur Web » + `<meta name="description">` de 120-160 caractères.
6. **`send_email.php` : code mort servi en clair, avec faille d'injection** (Moyen) — fichier inutilisé (le formulaire passe par EmailJS) mais publié tel quel et vulnérable à l'injection d'en-tête mail. → Supprimer le fichier.
7. **Aucun en-tête de sécurité (CSP, X-Frame-Options…)** (Élevé/Moyen) — limite de GitHub Pages qui ne permet pas d'en-têtes personnalisés. → Envisager un hébergeur supportant les en-têtes (Cloudflare Pages, Netlify, Vercel) si la sécurité est un objectif.

---

## SEO — 55/100

Site mono-page bien rédigé sur le fond, mais l'enrobage technique SEO est largement absent.

| Sévérité | Constat | Emplacement | Correction |
|---|---|---|---|
| Élevé | `lang="en"` alors que tout le contenu est en français | `index.html:2` | `<html lang="fr">` |
| Moyen | Titre générique « Portfolio Website », sans nom ni mot-clé | `index.html:7` | Ex. `Helio Martone — Développeur Web \| Portfolio` |
| Moyen | Aucune `<meta name="description">` | `<head>` | Ajouter une description unique de 120-160 caractères |
| Moyen | Pas de `robots.txt` (confirmé 404 en live) | racine | Ajouter `robots.txt` autorisant le crawl + lien sitemap |
| Faible | Pas de `sitemap.xml` | racine | Générer un sitemap minimal (1 URL) |
| Faible | Pas de `<link rel="canonical">` | `<head>` | `<link rel="canonical" href="https://heliomrt95.github.io/portfolio/">` |
| Moyen | Aucune balise Open Graph / Twitter Card | `<head>` | Ajouter `og:title`, `og:description`, `og:image`, `og:url` + `twitter:card` — important pour un portfolio partagé sur les réseaux |

**Ce qui fonctionne :** un seul `<h1>` clair, balise `viewport` présente, HTTPS, favicon défini, contenu textuel riche et original (parcours, projets), structure sémantique (`header`/`footer`/`section`/`article`/`nav`).

---

## Performance — 25/100

Mesures Lighthouse non exécutées ici, mais l'analyse du code et du poids des assets suffit à conclure : la page est **extrêmement lourde** et son chargement est volontairement bloqué derrière un téléchargement massif. Recommandation : lancer PageSpeed Insights pour les données terrain (LCP/INP/CLS).

| Sévérité | Constat | Emplacement | Correction |
|---|---|---|---|
| Critique | Le preloader précharge toute la galerie (~123 Mo) avant d'afficher la page | `index.html:812-823`, `849-865` | Retirer `galleryImages` du `Promise.all` ; charger à l'ouverture de la modale |
| Critique | ~170 Mo d'images, dont plusieurs PNG de 13-19 Mo | `assets/img/gallery/` (`photo3/5/7.png` ≈ 19 Mo, `photo1.png` 17 Mo, `photo12.png` 16 Mo) | Convertir en WebP/AVIF, redimensionner, viser < 300 Ko/image |
| Élevé | Image LCP hero de 2,9 Mo préchargée en PNG | `index.html:10`, `index.html:236` | WebP optimisé + `srcset` responsive |
| Élevé | ~110 Mo de vidéos commitées dans le repo (`video2.mp4` 74 Mo) | `videos/` | Héberger sur un service vidéo (YouTube/Vimeo non listé) ou compresser fortement ; garder les `poster` |
| Moyen | 18 graisses de Poppins chargées (100→900 + italiques) | `index.html:18` | Ne charger que les 2-3 graisses réellement utilisées |
| Moyen | Aucune image n'a d'attributs `width`/`height` (risque de CLS) | `index.html` (18 `<img>`) | Ajouter `width`/`height` pour réserver l'espace |
| Moyen | CSS Boxicons chargé en bloquant depuis unpkg | `index.html:20` | Auto-héberger un sous-ensemble d'icônes, ou charger en non-bloquant |
| Faible | JS/CSS non minifiés (`carousel.js` 61 Ko, `carousel.css` 41 Ko) | `js/`, `assets/css/` | Minifier en production |

**Ce qui fonctionne :** `loading="lazy"` sur 13 des 18 images, `fetchpriority="high"` + `decoding="async"` sur le hero, `preconnect` vers Google Fonts, `&display=swap` sur la police, vidéos chargées à la demande (au clic) et non au démarrage.

---

## Accessibilité — 55/100

Cible : WCAG 2.1 AA / RGAA (site français). Plusieurs bons réflexes, mais des bases manquent.

| Sévérité | Constat | Emplacement | Correction |
|---|---|---|---|
| Élevé | `lang="en"` : la synthèse vocale lira le français avec une prononciation anglaise | `index.html:2` | `lang="fr"` |
| Moyen | Pas de balise `<main>` (un seul `<footer>` comme repère) | `index.html` | Envelopper le contenu principal dans `<main>` |
| Moyen | Champs du formulaire sans `<label>` (placeholder seul) | `index.html:167-169` | Ajouter des `<label>` associés (`for`/`id`) ; le placeholder n'est pas un label |
| Moyen | Animations nombreuses sans respect de `prefers-reduced-motion` | `assets/css/`, `js/script.js` | Ajouter `@media (prefers-reduced-motion: reduce)` pour neutraliser scroll-reveal, spinner, carrousel |
| Faible | Hiérarchie des titres : `h2` (modale galerie) avant le `h1` dans le DOM ; saut `h2`→`h4` dans la timeline | `index.html:113`, `203`, `252-317` | Réordonner ; utiliser `h3` dans la timeline |
| Faible | Pas de lien d'évitement « Aller au contenu » | haut du `<body>` | Ajouter un skip-link visible au focus |
| Faible | `outline: none` sur les champs de formulaire | `assets/css/style.css:1071` | Vérifier qu'un focus visible (box-shadow) le remplace bien — sinon le rétablir |

**Ce qui fonctionne :** tous les boutons-icônes ont un `aria-label`, toutes les `<img>` ont un `alt`, fermeture du menu au clavier (`Escape`, `script.js:166`), repères `header`/`nav`/`footer`/`section`/`article` présents. Vérification recommandée avec un lecteur d'écran réel (VoiceOver/NVDA) et axe DevTools — l'automatique ne couvre que ~30-40 % des cas.

---

## Sécurité & technique — 52/100

Le plus gros risque réel est faible (site statique, pas de backend actif), mais l'hygiène technique laisse passer plusieurs éléments.

| Sévérité | Constat | Emplacement | Correction |
|---|---|---|---|
| Élevé | Aucun `Content-Security-Policy` (live) | en-têtes serveur | Limite de GitHub Pages → migrer vers Cloudflare Pages/Netlify/Vercel pour poser une CSP |
| Moyen | `send_email.php` : code mort (le formulaire utilise EmailJS), servi en source brute, vulnérable à l'injection d'en-tête mail (`From: $email` non assaini) + expose un e-mail | `send_email.php`, servi sur `/send_email.php` | Supprimer le fichier du repo |
| Moyen | Pas de protection anti-clickjacking (X-Frame-Options / CSP frame-ancestors) | en-têtes serveur | Idem CSP (dépend de l'hébergeur) |
| Moyen | Clés EmailJS exposées sans restriction + formulaire sans anti-spam | `js/script.js:96-98`, `index.html:791-796` | Restreindre la clé publique EmailJS au domaine + ajouter un honeypot/captcha |
| Faible | IDs `#video-modal` dupliqués (HTML invalide, risque de bug JS) | `index.html:139` et `index.html:738` | Conserver une seule modale vidéo |
| Faible | `emailjs.init("service_jb956ot")` initialise avec un ID de service au lieu de la clé publique | `index.html:794` | Corriger (ou supprimer, l'init correct étant déjà dans `script.js:96`) |
| Faible | 17 liens `target="_blank"` sans `rel="noopener noreferrer"` | `index.html` (ex. `360`, `378`, `414`…) | Ajouter `rel="noopener noreferrer"` (les navigateurs récents le font par défaut, mais à expliciter) |
| Faible | Lien projet en `http://` (non sécurisé) | `index.html:396` | Passer en `https://` si la cible le supporte |
| Faible | 2 `console.log` résiduels | `js/carousel.js` | Retirer en production |
| Faible | Pas de `.gitignore` | racine | Ajouter un `.gitignore` (`.DS_Store`, `.env`, `*.pem`, `*.key`) — des `.DS_Store` sont déjà commités |

**Ce qui fonctionne :** HTTPS forcé et certificat valide (GitHub Pages), le formulaire poste en HTTPS via EmailJS, aucune vraie clé secrète/API committée dans le source, `htmlspecialchars` utilisé côté PHP.

---

## Notes & limites

- **Lighthouse non exécuté** dans cet audit : les scores Core Web Vitals (LCP/INP/CLS) n'ont pas été mesurés en conditions réelles. Vu le poids des assets, lancez [PageSpeed Insights](https://pagespeed.web.dev/) sur l'URL pour confirmer — le LCP est très probablement bien au-delà de 2,5 s sur mobile.
- **Plusieurs problèmes de sécurité sont des limites de GitHub Pages**, pas du code : impossible d'y définir des en-têtes HTTP personnalisés (CSP, HSTS, X-Frame-Options). Si ces en-têtes sont un objectif, un hébergeur statique avec configuration d'en-têtes (Cloudflare Pages, Netlify, Vercel) résout tout le bloc « en-têtes » d'un coup.
- **`.DS_Store` commités** dans plusieurs dossiers (`assets/`, `videos/`, etc.) — à supprimer et à ignorer.
- **À vérifier manuellement :** rendu/contraste réel des textes gris, parcours clavier complet dans les modales (piège de focus + retour du focus à la fermeture), et test du formulaire de contact de bout en bout via EmailJS.
- **Attention au déploiement de ce rapport :** le workflow GitHub Pages publie *tout* le repo (`path: '.'`). Si vous committez ce fichier, il sera accessible publiquement à `/audit-portfolio-2026-06-28.md`. À déplacer hors du repo ou à ignorer via `.gitignore` si vous ne le souhaitez pas en ligne.
