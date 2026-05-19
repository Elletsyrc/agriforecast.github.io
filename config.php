<?php
// ================================================================
// AGRIFORECAST - Database Configuration
// ================================================================

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'agriforecast');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password (leave empty for XAMPP)

// Optional external price feed. Leave blank to use the bundled DA PDF-derived feed.
// Expected JSON shape:
// {"source":"Agency/API name","prices":[{"commodity":"Rice","price":42,"unit":"/kg","market_area":"Daet Market","record_date":"2026-05-18"}]}
define('PRICE_FEED_URL', '');

// Create connection using PDO (secure)
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    die(json_encode(['error' => 'Connection failed: ' . $e->getMessage()]));
}

// Function to get database connection
function getDB() {
    global $pdo;
    return $pdo;
}

// Function to hash passwords (use this when inserting users)
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}
?>
