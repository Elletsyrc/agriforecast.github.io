<?php
header("Content-Type: application/json");
require_once "test_db.php";

session_start();
$user = $_SESSION['user'] ?? null;

if (!$user) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_role = $user['role'];
if ($user_role === "USER") {
    $user_role = "FARMER";
}
$user_coop = $user['cooperative_id'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// ======================================================
// GET — FETCH FARMERS
// ======================================================

$pdo->query("
    UPDATE cooperatives c
    SET members_count = (
        SELECT COUNT(*) 
        FROM farmer_cooperative fc 
        WHERE fc.cooperative_id = c.cooperative_id
    )
");


if ($method === "GET") {

    // Fetch cooperatives list
    if (isset($_GET['type']) && $_GET['type'] === "cooperatives") {
        $stmt = $pdo->query("SELECT * FROM cooperatives ORDER BY name ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // ADMIN & OFFICER → see ALL farmers with cooperative name
    if ($user_role === "ADMIN" || $user_role === "OFFICER") {
        $stmt = $pdo->query("
            SELECT 
                f.*,
                c.name AS cooperative
            FROM farmers f
            LEFT JOIN farmer_cooperative fc ON fc.farmer_id = f.farmer_id
            LEFT JOIN cooperatives c ON c.cooperative_id = fc.cooperative_id
            ORDER BY f.full_name ASC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // COOPERATIVE → see ONLY their coop members
    if ($user_role === "COOPERATIVE") {
        $stmt = $pdo->prepare("
            SELECT 
                f.*,
                c.name AS cooperative
            FROM farmers f
            JOIN farmer_cooperative fc ON fc.farmer_id = f.farmer_id
            JOIN cooperatives c ON c.cooperative_id = fc.cooperative_id
            WHERE fc.cooperative_id = ?
            ORDER BY f.full_name ASC
        ");
        $stmt->execute([$user_coop]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // FARMER → see ONLY their own profile
    if ($user_role === "FARMER") {
        $stmt = $pdo->prepare("
            SELECT 
                f.*,
                c.name AS cooperative
            FROM farmers f
           JOIN farmer_cooperative fc ON fc.farmer_id = f.farmer_id
           LEFT JOIN cooperatives c ON c.cooperative_id = fc.cooperative_id
            WHERE f.user_id = ?
        ");
        $stmt->execute([$user['user_id']]);

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    echo json_encode([]);
    exit;
}

if ($method === "PUT") {
    if ($user_role !== "ADMIN" && $user_role !== "OFFICER") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $id = $input['farmer_id'];

    $stmt = $pdo->prepare("
        UPDATE farmers SET 
            full_name=?, contact_number=?, farm_location=?, 
            farm_size_ha=?, farm_type=?, status=?
        WHERE farmer_id=?
    ");

    $stmt->execute([
        $input['full_name'],
        $input['contact_number'],
        $input['farm_location'],
        $input['farm_size_ha'],
        $input['farm_type'],
        $input['status'],
        $id
    ]);

    // Update cooperative link
    $pdo->prepare("DELETE FROM farmer_cooperative WHERE farmer_id=?")->execute([$id]);

    if (!empty($input['cooperative_id'])) {
        $pdo->prepare("
            INSERT INTO farmer_cooperative (farmer_id, cooperative_id)
            VALUES (?, ?)
        ")->execute([$id, $input['cooperative_id']]);
    }

    echo json_encode(["success" => true]);
    exit;
}

if ($method === "DELETE") {
    if ($user_role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $id = $input['farmer_id'];

    $pdo->prepare("DELETE FROM farmer_cooperative WHERE farmer_id=?")->execute([$id]);
    $pdo->prepare("DELETE FROM farmers WHERE farmer_id=?")->execute([$id]);

    echo json_encode(["success" => true]);
    exit;
}


// ======================================================
// POST — REGISTER NEW FARMER
// ======================================================
if ($method === "POST") {

    if ($user_role !== "ADMIN" && $user_role !== "OFFICER") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $full_name = $input['full_name'] ?? "";
    $contact_number = $input['contact_number'] ?? "";
    $farm_location = $input['farm_location'] ?? "";
    $farm_size_ha = $input['farm_size_ha'] ?? null;
    $farm_type = $input['farm_type'] ?? "";
    $cooperative_id = $input['cooperative_id'] ?? null;
    $status = $input['status'] ?? "Active";

    // Normalize cooperative_id
    if ($cooperative_id === "" || $cooperative_id === "undefined") {
        $cooperative_id = null;
    }

    // Insert farmer
    $stmt = $pdo->prepare("
        INSERT INTO farmers (full_name, contact_number, farm_location, farm_size_ha, farm_type, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $ok = $stmt->execute([
        $full_name,
        $contact_number,
        $farm_location,
        $farm_size_ha,
        $farm_type,
        $status
    ]);

    if (!$ok) {
        echo json_encode(["success" => false, "message" => "Failed to register farmer"]);
        exit;
    }

    $farmer_id = $pdo->lastInsertId();

    // Insert cooperative link
    if ($cooperative_id !== null) {
        $stmt2 = $pdo->prepare("
            INSERT INTO farmer_cooperative (farmer_id, cooperative_id)
            VALUES (?, ?)
        ");
        $stmt2->execute([$farmer_id, $cooperative_id]);
    }

    echo json_encode(["success" => true, "message" => "Farmer registered successfully"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
