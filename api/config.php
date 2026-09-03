<?php
// ============================================================================
// Configuration de l'API de suivi de commande
// ============================================================================

// Code d'accès à la page cuisine (/cuisine/). ⚠️ À CHANGER avant la mise en ligne.
define('KITCHEN_PIN', '1234');

// Dossier de stockage des commandes (fichier JSON, protégé par .htaccess).
define('DATA_DIR', __DIR__ . '/data');

// Durée de conservation des commandes (en jours).
define('RETENTION_DAYS', 7);
