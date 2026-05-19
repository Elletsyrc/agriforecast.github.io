<?php
require_once "../config.php";
session_start();

$input = json_decode(file_get_contents("php://input"), true);
$user = $_SESSION["user"] ?? null;

if (!$user) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$role = strtoupper($user["role"] ?? "FARMER");
if ($role === "USER") $role = "FARMER";
$userId = $user["user_id"] ?? null;
$coopId = $user["cooperative_id"] ?? null;

function farmerInCoopForAssistance($pdo, $farmerId, $coopId) {
    if (!$coopId) return false;
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM farmer_cooperative WHERE farmer_id = ? AND cooperative_id = ?");
    $stmt->execute([$farmerId, $coopId]);
    return (int)$stmt->fetchColumn() > 0;
}

function canManageAssistanceRecord($pdo, $role, $coopId, $assistanceId) {
    if ($role === "ADMIN" || $role === "OFFICER") return true;
    if ($role !== "COOPERATIVE" || !$coopId) return false;

    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM assistance_records ar
        LEFT JOIN farmer_cooperative fc ON fc.farmer_id = ar.farmer_id
        WHERE ar.assistance_id = ? AND (ar.cooperative_id = ? OR fc.cooperative_id = ?)
    ");
    $stmt->execute([$assistanceId, $coopId, $coopId]);
    return (int)$stmt->fetchColumn() > 0;
}

// ======================================================
// GET — Fetch all assistance records
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $baseSql = "
            SELECT 
                ar.assistance_id,
                ar.farmer_id,
                f.full_name AS farmer_name,
                ar.cooperative_id,
                c.name AS cooperative_name,
                ar.program_name,
                ar.support_type,
                ar.value_amount,
                ar.given_by,
                ar.given_by_user_id,
                u.full_name AS officer_name,
                ar.date_given,
                ar.status,
                ar.description,
                ar.created_at,
                ar.updated_at
            FROM assistance_records ar
            LEFT JOIN farmers f ON ar.farmer_id = f.farmer_id
            LEFT JOIN farmer_cooperative fc ON fc.farmer_id = f.farmer_id
            LEFT JOIN cooperatives c ON ar.cooperative_id = c.cooperative_id
            LEFT JOIN users u ON ar.given_by_user_id = u.user_id
        ";

        if ($role === "ADMIN" || $role === "OFFICER") {
            $stmt = $pdo->prepare($baseSql . " ORDER BY ar.assistance_id DESC");
            $stmt->execute();
        } elseif ($role === "COOPERATIVE") {
            $stmt = $pdo->prepare($baseSql . " WHERE ar.cooperative_id = ? OR fc.cooperative_id = ? ORDER BY ar.assistance_id DESC");
            $stmt->execute([$coopId, $coopId]);
        } else {
            $stmt = $pdo->prepare($baseSql . " WHERE f.user_id = ? ORDER BY ar.assistance_id DESC");
            $stmt->execute([$userId]);
        }

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}


// ======================================================
// POST — Add new assistance record
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        if ($role === "FARMER") {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        if ($role === "COOPERATIVE") {
            if (!farmerInCoopForAssistance($pdo, $input["farmer_id"] ?? null, $coopId)) {
                echo json_encode(["success" => false, "message" => "You can only encode assistance for your cooperative members."]);
                exit;
            }
            $input["cooperative_id"] = $coopId;
        }

        $stmt = $pdo->prepare("
            INSERT INTO assistance_records 
            (farmer_id, cooperative_id, program_name, support_type, value_amount, 
             given_by, given_by_user_id, date_given, status, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $ok = $stmt->execute([
            $input["farmer_id"] ?? null,
            $input["cooperative_id"] ?? null,
            $input["program_name"],
            $input["support_type"],
            $input["value_amount"],
            $user["fullName"] ?? $input["given_by"],
            $userId,
            $input["date_given"],
            $input["status"],
            $input["description"]
        ]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}


// ======================================================
// PUT — Update assistance record
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    try {
        if (!canManageAssistanceRecord($pdo, $role, $coopId, $input["assistance_id"])) {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        if ($role === "COOPERATIVE") {
            if (!farmerInCoopForAssistance($pdo, $input["farmer_id"] ?? null, $coopId)) {
                echo json_encode(["success" => false, "message" => "You can only update assistance for your cooperative members."]);
                exit;
            }
            $input["cooperative_id"] = $coopId;
        }

        $stmt = $pdo->prepare("
            UPDATE assistance_records SET
                farmer_id = ?,
                cooperative_id = ?,
                program_name = ?,
                support_type = ?,
                value_amount = ?,
                given_by = ?,
                given_by_user_id = ?,
                date_given = ?,
                status = ?,
                description = ?
            WHERE assistance_id = ?
        ");

        $ok = $stmt->execute([
            $input["farmer_id"] ?? null,
            $input["cooperative_id"] ?? null,
            $input["program_name"],
            $input["support_type"],
            $input["value_amount"],
            $user["fullName"] ?? $input["given_by"],
            $userId,
            $input["date_given"],
            $input["status"],
            $input["description"],
            $input["assistance_id"]
        ]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}


// ======================================================
// DELETE — Remove assistance record
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    try {
        if (!canManageAssistanceRecord($pdo, $role, $coopId, $input["assistance_id"])) {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM assistance_records WHERE assistance_id = ?");
        $ok = $stmt->execute([$input["assistance_id"]]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

?>
