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

// Enable error reporting for debugging
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// ================================================================
// GET — Fetch all supply records
// ================================================================
if ($method === "GET") {
    $stmt = $pdo->query("
        SELECT s.*, f.name AS food_name
        FROM supply_records s
        LEFT JOIN staple_food f ON s.food_id = f.food_id
        ORDER BY s.supply_id DESC
    ");

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}


// Read JSON body for POST/PUT/DELETE
$data = json_decode(file_get_contents("php://input"), true);

// ================================================================
// POST — Add new supply record
// ================================================================
if ($method === "POST") {

    if (!isset($data["food_id"])) {
        echo json_encode(["success" => false, "message" => "Missing food_id"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO supply_records 
            (food_id, quantity_available, capacity, unit, location, status, record_date, updated_by, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $ok = $stmt->execute([
            $data["food_id"],
            $data["quantity_available"],
            $data["capacity"],
            $data["unit"],
            $data["location"],
            $data["status"],
            date("Y-m-d"),
            $_SESSION["user"]["user_id"] ?? null,
            $data["remarks"] ?? null
        ]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

// ================================================================
// PUT — Update supply record
// ================================================================
if ($method === "PUT") {

    if (!isset($data["supply_id"])) {
        echo json_encode(["success" => false, "message" => "Missing supply_id"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE supply_records SET
                food_id = ?,
                quantity_available = ?,
                capacity = ?,
                unit = ?,
                location = ?,
                status = ?,
                remarks = ?,
                updated_by = ?,
                record_date = ?
            WHERE supply_id = ?
        ");

        $ok = $stmt->execute([
            $data["food_id"],
            $data["quantity_available"],
            $data["capacity"],
            $data["unit"],
            $data["location"],
            $data["status"],
            $data["remarks"] ?? null,
            $_SESSION["user"]["user_id"] ?? null,
            date("Y-m-d"),
            $data["supply_id"]
        ]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

// ================================================================
// DELETE — Remove supply record
// ================================================================
if ($method === "DELETE") {

    if (!isset($data["supply_id"])) {
        echo json_encode(["success" => false, "message" => "Missing supply_id"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM supply_records WHERE supply_id = ?");
        $ok = $stmt->execute([$data["supply_id"]]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }

    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
?>
