<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$dbname = 'snackapp'; // le nom exact de ta base
$user = 'root';
$pass = 'root'; // MAMP par défaut

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );

    echo "✅ Connexion MySQL OK";

} catch (PDOException $e) {
    echo "❌ Erreur MySQL : " . $e->getMessage();
}
