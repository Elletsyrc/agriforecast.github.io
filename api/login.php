<?php
header("Content-Type: application/json");
require_once "../config.php";

session_start();

$pdo = getDB();

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = trim($data["password"] ?? "");

if ($username === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Please enter username and password."]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit;
}

if (!password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Incorrect password."]);
    exit;
}

$_SESSION['user'] = [
    "user_id" => $user["user_id"],
    "username" => $user["username"],
    "fullName" => $user["full_name"],   // <-- THIS IS WHAT YOUR FRONTEND USES
    "email" => $user["email"],
    "role" => $user["role"],
    "status" => $user["status"],
    "cooperative_id" => $user["cooperative_id"] ?? null
];


echo json_encode([
    "success" => true,
    "user" => $_SESSION['user']
]);

?>
