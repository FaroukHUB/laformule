# La Formule – site vitrine et ticket de commande

Site du snack **La Formule** (2 rue Hector Berlioz, 59700 Marcq-en-Barœul), déployé sur
`laformule59.mon-agenceweb.fr`. Il est construit sur le template générique « SnackApp » :
une page HTML unique dont tout le contenu est injecté en JavaScript à partir d'un fichier
de configuration propre au restaurant.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Squelette neutre de la page (header, drawer mobile, hero, menu, livraison, avis, carte, FAQ, footer, pop-up d'accueil, modale de personnalisation). Charge Tailwind via CDN. |
| `config/laformule59.config.js` | Définit `window.SNACK_CONFIG` : identité, adresse, contacts, réseaux, notes Google / Uber Eats, horaires, thème, carte complète, suppléments, FAQ, SEO. **C'est le seul fichier à modifier pour changer le contenu.** |
| `snack-runtime.js` | Moteur générique. Lit `SNACK_CONFIG` et remplit le template : thème, header, hero, menu par onglets, produits mis en avant, plateformes de livraison, slider d'avis, carte Google Maps, FAQ, footer, drawer, bouton d'appel flottant, JSON-LD. Gère aussi la pop-up d'accueil et la bannière d'aide. |
| `script.js` | Recherche dans la carte, navigation onglets / sliders, modale de personnalisation et **ticket de commande actif** (voir ci-dessous). |
| `styles.css` | Thème par défaut du template (variables CSS surchargées par le runtime), boutons, cartes, badges, responsive. |
| `images/` | Visuels des produits, hero et logo (webp / png). |
| `test-db.php` | Test isolé de connexion PDO à une base MySQL locale. Aucun backend n'est présent dans le dépôt. |

Ordre de chargement (en bas de `index.html`) : config → `script.js` → `snack-runtime.js`.

## Fonctionnement du ticket de commande

1. Le runtime génère une carte par produit avec un bouton de prix « seul » et, si `priceMenu`
   est défini, un bouton « en menu ».
2. Un clic appelle `window.openTicketBuilder(productId, variant)`. Cette fonction est celle
   de `script.js` : elle ouvre la modale `#customize-modal` de `index.html`.
3. La modale propose : le choix d'une boisson (variante menu uniquement), les suppléments
   autorisés pour la catégorie (`supplements.defaultForCategories`), et le retrait des
   `baseIngredients` du produit. Le total est recalculé en direct.
4. « Ajouter au ticket » pousse une ligne dans `ticketLines` et affiche le panneau
   `#ticket-panel` (bouton flottant 🎟️ en bas à gauche).
5. Le panneau demande prénom et téléphone (obligatoires) et un message libre, puis
   « Envoyer au resto » construit un texte récapitulatif et l'envoie via le partage natif
   du téléphone, avec repli sur `https://wa.me/?text=…`.

Le ticket est en mémoire uniquement : il est perdu au rechargement de la page.

## Points d'attention connus

- `snack-runtime.js` contient un second système de ticket complet (lignes ~1400 à 2970) avec
  un **configurateur tacos / kapsalon** (taille, viandes, sauces, crudités, quantités) et un
  envoi WhatsApp vers le numéro du restaurant (`contact.whatsappOrdersNumber`). Sa fonction
  d'entrée `openTicketBuilder` est **commentée**, donc tout ce bloc est inactif. En pratique,
  un tacos commandé aujourd'hui part sans taille, viande ni sauce, au prix de la base M.
- L'envoi actif (`script.js`) ouvre WhatsApp **sans numéro de destinataire** : le client doit
  choisir le contact lui‑même. La constante `RESTO_PHONE` de `script.js` n'est pas utilisée
  pour l'envoi et ne correspond pas au numéro de la config.
- `script.js` référence un endpoint `/cart/actions.php` qui n'existe pas dans le dépôt.
- `assets.gallery` référence trois images `la-formule-1/2/3.webp` absentes du dossier `images/`.
- Le titre, la description et le JSON‑LD de `index.html` sont neutres et remplis par le runtime,
  ce qui limite le référencement sans JavaScript.
