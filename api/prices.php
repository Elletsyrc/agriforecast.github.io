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

// GET — fetch all price records
if ($method === "GET") {
    $stmt = $pdo->query("SELECT * FROM price_records ORDER BY price_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

// POST — add new price record
if ($method === "POST") {
    $stmt = $pdo->prepare("
        INSERT INTO price_records 
        (commodity, price, prev_price, unit, market_area, record_date, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $ok = $stmt->execute([
        $data["commodity"],
        $data["price"],
        $data["prev_price"],
        $data["unit"],
        $data["market_area"],
        $data["record_date"],
        $_SESSION["user"]["user_id"] ?? null
    ]);

    echo json_encode(["success" => $ok]);
    exit;
}

// PUT — update price record
if ($method === "PUT") {
    $stmt = $pdo->prepare("
        UPDATE price_records SET
            commodity = ?,
            price = ?,
            prev_price = ?,
            unit = ?,
            market_area = ?,
            record_date = ?,
            updated_by = ?
        WHERE price_id = ?
    ");

    $ok = $stmt->execute([
        $data["commodity"],
        $data["price"],
        $data["prev_price"],
        $data["unit"],
        $data["market_area"],
        $data["record_date"],
        $_SESSION["user"]["user_id"] ?? null,
        $data["price_id"]
    ]);

    echo json_encode(["success" => $ok]);
    exit;
}

// DELETE — remove price record
if ($method === "DELETE") {
    $stmt = $pdo->prepare("DELETE FROM price_records WHERE price_id = ?");
    $ok = $stmt->execute([$data["price_id"]]);

    echo json_encode(["success" => $ok]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
?>
