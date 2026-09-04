<?php
/**
 * API de suivi de commande – La Formule / SnackApp
 *
 * Stockage : un fichier JSON verrouillé (flock), aucune base de données requise.
 *
 * Endpoints (paramètre ?action=…) :
 *   POST create            → crée une commande (client)          → {id, token, status}
 *   GET  status&id&token   → statut d'une commande (client)
 *   GET  list&pin          → commandes des dernières 24 h (cuisine)
 *   POST update            → {pin, id, status, eta?} (cuisine)
 *   GET  ping              → vérification de disponibilité
 */
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const STATUSES = ['recue', 'preparation', 'prete', 'en_route', 'terminee', 'annulee'];
const TERMINAL = ['terminee', 'annulee'];

function respond(int $code, array $payload): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readBody(): array
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw ?: '', true);
    return is_array($json) ? $json : [];
}

function clean($value, int $max): string
{
    $s = trim(strip_tags((string) $value));
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function storagePath(): string
{
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0750, true);
    }
    return DATA_DIR . '/orders.json';
}

/** Exécute $fn(&$orders) sous verrou exclusif, puis réécrit le fichier. */
function withStore(callable $fn)
{
    $path = storagePath();
    $fh = fopen($path, 'c+');
    if (!$fh) {
        respond(500, ['error' => 'Stockage indisponible']);
    }
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $orders = json_decode($raw ?: '[]', true);
    if (!is_array($orders)) {
        $orders = [];
    }

    $result = $fn($orders);

    $limit = time() - RETENTION_DAYS * 86400;
    $orders = array_values(array_filter($orders, fn($o) => ($o['createdAt'] ?? 0) >= $limit));

    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $result;
}

function readStore(): array
{
    $path = storagePath();
    if (!is_file($path)) {
        return [];
    }
    $fh = fopen($path, 'r');
    if (!$fh) {
        return [];
    }
    flock($fh, LOCK_SH);
    $raw = stream_get_contents($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    $orders = json_decode($raw ?: '[]', true);
    return is_array($orders) ? $orders : [];
}

function requirePin(array $body): void
{
    $pin = (string) ($_GET['pin'] ?? $body['pin'] ?? '');
    if ($pin === '' || !hash_equals(KITCHEN_PIN, $pin)) {
        respond(401, ['error' => 'Code cuisine invalide']);
    }
}

function publicOrder(array $o): array
{
    unset($o['token']);
    return $o;
}

function generateId(array $orders): string
{
    $existing = array_column($orders, 'id');
    for ($i = 0; $i < 50; $i++) {
        $id = 'LF-' . str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        if (!in_array($id, $existing, true)) {
            return $id;
        }
    }
    return 'LF-' . strtoupper(bin2hex(random_bytes(3)));
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($action) {
    // ------------------------------------------------------------------ ping
    case 'ping':
        respond(200, ['ok' => true, 'time' => time()]);

    // ---------------------------------------------------------------- create
    case 'create':
        if ($method !== 'POST') {
            respond(405, ['error' => 'POST attendu']);
        }
        $b = readBody();

        $lines = [];
        foreach (array_slice(is_array($b['lines'] ?? null) ? $b['lines'] : [], 0, 50) as $l) {
            if (!is_array($l)) {
                continue;
            }
            $lines[] = [
                'name'    => clean($l['name'] ?? '', 80),
                'qty'     => max(1, min(99, (int) ($l['qty'] ?? 1))),
                'variant' => clean($l['variant'] ?? '', 10),
                'category' => clean($l['category'] ?? '', 40),
                'details' => clean($l['details'] ?? '', 400),
                'total'   => round((float) ($l['total'] ?? 0), 2),
            ];
        }
        if (!$lines) {
            respond(422, ['error' => 'Commande vide']);
        }

        $name  = clean($b['name'] ?? '', 60);
        $phone = clean($b['phone'] ?? '', 30);
        if ($name === '' || $phone === '') {
            respond(422, ['error' => 'Nom et téléphone requis']);
        }

        $mode = clean($b['mode'] ?? 'emporter', 20);
        $wantedId = strtoupper(clean($b['id'] ?? '', 12));

        $order = withStore(function (array &$orders) use ($lines, $name, $phone, $mode, $b, $wantedId) {
            $existing = array_column($orders, 'id');
            $id = (preg_match('/^[A-Z0-9-]{4,12}$/', $wantedId) && !in_array($wantedId, $existing, true))
                ? $wantedId
                : generateId($orders);

            $now = time();
            $order = [
                'id'        => $id,
                'token'     => bin2hex(random_bytes(12)),
                'status'    => 'recue',
                'createdAt' => $now,
                'updatedAt' => $now,
                'eta'       => null,
                'name'      => $name,
                'phone'     => $phone,
                'mode'      => $mode,
                'address'   => clean($b['address'] ?? '', 200),
                'time'      => clean($b['time'] ?? '', 40),
                'message'   => clean($b['message'] ?? '', 300),
                'phoneIntl' => clean($b['phoneIntl'] ?? '', 30),
                'payment'   => clean($b['payment'] ?? '', 20),
                'paymentLabel' => clean($b['paymentLabel'] ?? '', 120),
                'cash'      => isset($b['cash']) && $b['cash'] !== null && $b['cash'] !== '' ? round((float) $b['cash'], 2) : null,
                'change'    => isset($b['change']) && $b['change'] !== null && $b['change'] !== '' ? round((float) $b['change'], 2) : null,
                'lines'     => $lines,
                'subtotal'  => round((float) ($b['subtotal'] ?? 0), 2),
                'fee'       => round((float) ($b['fee'] ?? 0), 2),
                'total'     => round((float) ($b['total'] ?? 0), 2),
                'history'   => [['status' => 'recue', 'at' => $now]],
            ];
            $orders[] = $order;
            return $order;
        });

        respond(201, [
            'id'        => $order['id'],
            'token'     => $order['token'],
            'status'    => $order['status'],
            'createdAt' => $order['createdAt'],
        ]);

    // ---------------------------------------------------------------- status
    case 'status':
        $id = strtoupper(clean($_GET['id'] ?? '', 12));
        $token = clean($_GET['token'] ?? '', 64);
        foreach (readStore() as $o) {
            if (($o['id'] ?? '') === $id) {
                if (!hash_equals((string) ($o['token'] ?? ''), $token)) {
                    respond(403, ['error' => 'Jeton invalide']);
                }
                respond(200, [
                    'id'        => $o['id'],
                    'status'    => $o['status'],
                    'eta'       => $o['eta'],
                    'mode'      => $o['mode'],
                    'updatedAt' => $o['updatedAt'],
                    'createdAt' => $o['createdAt'],
                    'history'   => $o['history'] ?? [],
                ]);
            }
        }
        respond(404, ['error' => 'Commande introuvable']);

    // ------------------------------------------------------------------ list
    case 'list':
        requirePin([]);
        $since = time() - 86400;
        $list = array_values(array_filter(readStore(), fn($o) => ($o['createdAt'] ?? 0) >= $since));
        usort($list, fn($a, $b) => ($b['createdAt'] ?? 0) <=> ($a['createdAt'] ?? 0));
        respond(200, ['orders' => array_map('publicOrder', $list), 'time' => time()]);

    // ---------------------------------------------------------------- update
    case 'update':
        if ($method !== 'POST') {
            respond(405, ['error' => 'POST attendu']);
        }
        $b = readBody();
        requirePin($b);

        $id = strtoupper(clean($b['id'] ?? '', 12));
        $status = clean($b['status'] ?? '', 20);
        if (!in_array($status, STATUSES, true)) {
            respond(422, ['error' => 'Statut inconnu']);
        }
        $eta = isset($b['eta']) && $b['eta'] !== '' && $b['eta'] !== null ? (int) $b['eta'] : null;

        $updated = withStore(function (array &$orders) use ($id, $status, $eta) {
            foreach ($orders as &$o) {
                if (($o['id'] ?? '') === $id) {
                    $o['status'] = $status;
                    $o['updatedAt'] = time();
                    if ($eta !== null) {
                        $o['eta'] = time() + max(0, min(180, $eta)) * 60;
                    }
                    if (in_array($status, TERMINAL, true)) {
                        $o['eta'] = null;
                    }
                    $o['history'][] = ['status' => $status, 'at' => time()];
                    return $o;
                }
            }
            return null;
        });

        if (!$updated) {
            respond(404, ['error' => 'Commande introuvable']);
        }
        respond(200, ['order' => publicOrder($updated)]);

    default:
        respond(404, ['error' => 'Action inconnue']);
}
