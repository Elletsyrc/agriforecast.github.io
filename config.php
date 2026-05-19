<?php
// ================================================================
// AGRIFORECAST - Database Configuration
// ================================================================

// Database credentials - Multi-environment Setup
// Read environment variables injected by Railway (Cloud), fallback to local settings if empty (XAMPP/Localhost)
define('DB_HOST', getenv('MYSQLHOST') ?: '127.0.0.1');
define('DB_NAME', getenv('MYSQLDATABASE') ?: 'agriforecast');
define('DB_USER', getenv('MYSQLUSER') ?: 'root');         // Your MySQL username
define('DB_PASS', getenv('MYSQLPASSWORD') ?: '');         // Your MySQL password (leave empty for XAMPP)
define('DB_PORT', getenv('MYSQLPORT') ?: '3306');         // Specific port assignment for containerized networking

// Optional external price feed. Leave blank to use the bundled DA PDF-derived feed.
// Expected JSON shape:
// {"source":"Agency/API name","prices":[{"commodity":"Rice","price":42,"unit":"/kg","market_area":"Daet Market","record_date":"2026-05-18"}]}
define('PRICE_FEED_URL', '');

// Create connection using PDO (secure)
try {
    // Establish the connection including the specific port assignment for cloud infrastructure
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    
    $pdo = new PDO(
        $dsn,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch(PDOException $e) {
    // Check connection stability and return proper JSON error for the frontend
    die(json_encode([
        'error' => 'ERROR: Could not connect to the database infrastructure. ' . $e->getMessage()
    ]));
}

// ================================================================
// GLOBAL UTILITY FUNCTIONS
// ================================================================

/**
 * Function to get database connection
 * Returns the active PDO instance for use in API endpoints
 */
function getDB() {
    global $pdo;
    return $pdo;
}

/**
 * Function to hash passwords (use this when inserting users)
 * Encrypts user credentials securely before database insertion
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}
?>