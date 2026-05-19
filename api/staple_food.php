<?php
header("Content-Type: application/json");
require_once "../config.php";
session_start();

$pdo = getDB();
$method = $_SERVER["REQUEST_METHOD"];
$user = $_SESSION["user"] ?? null;
$role = strtoupper($user["role"] ?? "FARMER");
if ($role === "USER") $role = "FARMER";

if (!$user || !in_array($role, ["ADMIN", "OFFICER"], true)) {
    echo json_encode(["success" => false, "message" => "Access denied"]);
    exit;
}

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// GET — fetch all staple foods
if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM staple_food ORDER BY food_id ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

// POST — add new food
if ($method === "POST") {
    $stmt = $pdo->prepare("
        INSERT INTO staple_food (name, category, unit)
        VALUES (?, ?, ?)
    ");

    $ok = $stmt->execute([
        $data["name"],
        $data["category"],
        $data["unit"]
    ]);

    echo json_encode(["success" => $ok]);
    exit;
}

// PUT — update food
if ($method === "PUT") {
    $stmt = $pdo->prepare("
        UPDATE staple_food SET
            name = ?,
            category = ?,
            unit = ?
        WHERE food_id = ?
    ");

    $ok = $stmt->execute([
        $data["name"],
        $data["category"],
        $data["unit"],
        $data["food_id"]
    ]);

    echo json_encode(["success" => $ok]);
    exit;
}

// DELETE — remove food
if ($method === "DELETE") {
    $stmt = $pdo->prepare("DELETE FROM staple_food WHERE food_id = ?");
    $ok = $stmt->execute([$data["food_id"]]);

    echo json_encode(["success" => $ok]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
?>
