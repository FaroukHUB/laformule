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
2. Un clic appelle `openTicketBuilder(productId, variant)` dans `snack-runtime.js`, qui ouvre
   le panneau ticket (bouton flottant 🎟️ en bas à gauche) avec une ligne « en cours de
   personnalisation » :
   - **Tacos** (`tacosConfig`) : taille (M à XXL, le nombre de viandes dépend de la taille),
     viandes, sauces (max. 2), crudités incluses, suppléments.
   - **Kapsalon** (`kapsaloonConfig`) : viandes selon la taille, sauces (max. 2), suppléments.
   - **Burgers, sandwichs, paninis, signatures, galettes** : sauce au choix (max. 2, liste
     `sauces` de la config), suppléments, retrait d'ingrédients de base.
   - **Menu enfant** : plat du menu (`kidsOptions`).
   - **Variante menu** : choix de la boisson incluse dans la catégorie « Boissons ».
3. « Ajouter au ticket » valide la ligne (au moins une viande pour tacos et kapsalon), fusionne
   les lignes identiques et permet d'ajuster les quantités.
4. Le panneau demande prénom et téléphone (obligatoires) et un message libre.
   « Envoyer la commande sur WhatsApp » ouvre une conversation avec le numéro
   `contact.whatsappOrdersNumber` de la config, message pré‑rempli avec chaque ligne, ses
   options et le total. « Partager le ticket » utilise le partage natif du téléphone.

5. **Mode de commande** : sur place, à emporter ou livraison (liste `ordering.modes`). En
   livraison, l'adresse devient obligatoire, le minimum de commande et les frais de
   `ordering.delivery` s'affichent, et l'envoi est bloqué sous le minimum. Un sélecteur
   « Heure souhaitée » propose « Dès que possible » puis des créneaux calculés à partir des
   horaires d'ouverture (aujourd'hui et le prochain jour ouvert).
6. **Sauvegarde locale** : le ticket, le mode, l'adresse et les coordonnées sont conservés dans
   le navigateur pendant 24 h. Après envoi, la commande est mémorisée et un bouton
   « Recommander ma dernière commande » apparaît dans le hero et dans le ticket vide.
7. **Après envoi** : le ticket affiche un bloc de confirmation avec un lien « Laisser un avis
   Google » (`google.reviewUrl`, sinon la fiche Google Maps) et un bouton « Nouvelle commande ».

## Statut ouvert / fermé

Le hero affiche une pastille calculée en direct à partir de `openingHours` et de l'heure de
Paris : « Ouvert · ferme à 14:30 », « Ouvert · ferme dans 15 min » ou « Fermé · ouvre demain
à 11:00 ». Le ticket reprend l'information quand le restaurant est fermé.

## SEO

`index.html` porte désormais en dur le titre, la description, l'URL canonique, les balises
Open Graph et un JSON‑LD `Restaurant` complet (adresse, coordonnées GPS, horaires, liens
Uber Eats / Deliveroo / Facebook). Le runtime ne duplique pas ce JSON‑LD quand il est présent
(`data-static`). Le texte du hero est également écrit dans le HTML.

## Points d'attention connus

- `script.js` référençait un ancien panier (`/cart/actions.php`) et une seconde modale de
  personnalisation qui court‑circuitait le configurateur. Ces blocs ont été retirés ; le fichier
  ne gère plus que la recherche, les onglets, les sliders et la carte.
- `assets.gallery` référence trois images `la-formule-1/2/3.webp` absentes du dossier `images/`.
- Le titre, la description et le JSON‑LD de `index.html` sont neutres et remplis par le runtime,
  ce qui limite le référencement sans JavaScript.
- Le numéro WhatsApp de réception des commandes est celui de `contact.whatsappOrdersNumber`
  dans la config : à vérifier avec le restaurant.
- Les frais de livraison (`ordering.delivery.fee`) sont une valeur de démonstration à
  confirmer avec le restaurant, ainsi que les zones livrées.
- `google.reviewUrl` est vide : renseigner le lien « écrire un avis » de la fiche Google
  (format `https://search.google.com/local/writereview?placeid=…`).
