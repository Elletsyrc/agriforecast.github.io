<?php
// =======================================================
// AgriForecast - Login API (Real Database Login)
// =======================================================

header("Content-Type: application/json");
require_once "../config.php";   // <-- your PDO connection file

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = trim($data["password"] ?? "");

// Validate input
if ($username === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please enter username and password."
    ]);
    exit;
}

try {
    // Fetch user from database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid username."
        ]);
        exit;
    }

    // PASSWORD CHECK (plain text for now)
    if ($password !== $user["password_hash"]) {
        echo json_encode([
            "success" => false,
            "message" => "Incorrect password."
        ]);
        exit;
    }

    // SUCCESS — return user data to frontend
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user["user_id"],
            "username" => $user["username"],
            "fullName" => $user["full_name"],
            "email" => $user["email"],
            "role" => $user["role"],       // ADMIN / OFFICER / FARMER
            "status" => $user["status"]
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
}
