<?php
header("Content-Type: application/json");
require_once "test_db.php";

session_start();
$user = $_SESSION['user'] ?? null;

if (!$user) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
$role = strtoupper($user["role"] ?? "FARMER");
if ($role === "USER") $role = "FARMER";
$coopId = $user["cooperative_id"] ?? null;

// ======================================================
// GET — LIST COOPERATIVES
// ======================================================
if ($method === "GET") {
    if ($role === "COOPERATIVE" && $coopId) {
        $stmt = $pdo->prepare("SELECT * FROM cooperatives WHERE cooperative_id = ? ORDER BY name ASC");
        $stmt->execute([$coopId]);
    } elseif ($role === "FARMER") {
        $stmt = $pdo->prepare("
            SELECT c.*
            FROM cooperatives c
            JOIN farmer_cooperative fc ON fc.cooperative_id = c.cooperative_id
            JOIN farmers f ON f.farmer_id = fc.farmer_id
            WHERE f.user_id = ?
            ORDER BY c.name ASC
        ");
        $stmt->execute([$user["user_id"]]);
    } else {
        $stmt = $pdo->query("SELECT * FROM cooperatives ORDER BY name ASC");
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// ======================================================
// POST — ADD COOPERATIVE
// ======================================================
if ($method === "POST") {
    if ($role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $name = $input['name'] ?? "";
    $location = $input['location'] ?? "";
    $contact_person = $input['contact_person'] ?? null;
    $contact_number = $input['contact_number'] ?? "";
    $members_count = 0;

    if (!$name) {
        echo json_encode(["success" => false, "message" => "Name required"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO cooperatives (name, location, contact_person, contact_number, members_count)
        VALUES (?, ?, ?, ?, ?)
    ");

    $ok = $stmt->execute([
        $name,
        $location,
        $contact_person,
        $contact_number,
        $members_count
    ]);

    echo json_encode(["success" => $ok]);
    exit;
}

// ======================================================
// PUT — UPDATE COOPERATIVE
// ======================================================
if ($method === "PUT") {
    if ($role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $id = $input['cooperative_id'];

    $stmt = $pdo->prepare("
        UPDATE cooperatives SET 
            name = ?, 
            location = ?, 
            contact_number = ?
        WHERE cooperative_id = ?
    ");

    $stmt->execute([
        $input['name'],
        $input['location'],
        $input['contact_number'],
        $id
    ]);

    echo json_encode(["success" => true]);
    exit;
}

// ======================================================
// DELETE — REMOVE COOPERATIVE
// ======================================================
if ($method === "DELETE") {
    if ($role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $id = $input['cooperative_id'];

    // Remove farmer links
    $pdo->prepare("DELETE FROM farmer_cooperative WHERE cooperative_id=?")
        ->execute([$id]);

    // Delete cooperative
    $pdo->prepare("DELETE FROM cooperatives WHERE cooperative_id=?")
        ->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
