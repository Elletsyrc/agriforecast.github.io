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

function canManageDistributionRecord($pdo, $role, $coopId, $distributionId) {
    if ($role === "ADMIN" || $role === "OFFICER") return true;
    if ($role !== "COOPERATIVE" || !$coopId) return false;

    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM distributions d
        LEFT JOIN farmer_cooperative fc ON fc.farmer_id = d.farmer_id
        WHERE d.distribution_id = ? AND (d.cooperative_id = ? OR fc.cooperative_id = ?)
    ");
    $stmt->execute([$distributionId, $coopId, $coopId]);
    return (int)$stmt->fetchColumn() > 0;
}

function farmerBelongsToCoop($pdo, $farmerId, $coopId) {
    if (!$coopId) return false;
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM farmer_cooperative WHERE farmer_id = ? AND cooperative_id = ?");
    $stmt->execute([$farmerId, $coopId]);
    return (int)$stmt->fetchColumn() > 0;
}

// ======================================================
// POST — Add new distribution
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        if ($role === "FARMER") {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        $recordCoopId = null;
        if ($role === "COOPERATIVE") {
            if (!farmerBelongsToCoop($pdo, $input["farmer_id"], $coopId)) {
                echo json_encode(["success" => false, "message" => "You can only encode distributions for your cooperative members."]);
                exit;
            }
            $recordCoopId = $coopId;
        }

        // Check stock first
        $check = $pdo->prepare("SELECT stock_quantity FROM farm_inputs WHERE input_id = ?");
        $check->execute([$input["input_id"]]);
        $stock = $check->fetchColumn();

        if ($stock < $input["quantity"]) {
            echo json_encode([
                "success" => false,
                "message" => "Insufficient stock"
            ]);
            exit;
        }

        // Insert distribution
        $stmt = $pdo->prepare("
            INSERT INTO distributions 
            (input_id, farmer_id, cooperative_id, distributed_by, quantity, program, distribution_date, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $ok = $stmt->execute([
            $input["input_id"],
            $input["farmer_id"],
            $recordCoopId,
            $userId,
            $input["quantity"],
            $input["program"],
            $input["distribution_date"],
            $input["remarks"] ?? null
        ]);

        // Deduct stock
        $updateStock = $pdo->prepare("
            UPDATE farm_inputs 
            SET stock_quantity = stock_quantity - ? 
            WHERE input_id = ?
        ");
        $updateStock->execute([$input["quantity"], $input["input_id"]]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// ======================================================
// PUT — Update distribution
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    try {
        if (!canManageDistributionRecord($pdo, $role, $coopId, $input["distribution_id"])) {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE distributions SET
                quantity = ?,
                program = ?,
                distribution_date = ?,
                remarks = ?
            WHERE distribution_id = ?
        ");

        $ok = $stmt->execute([
            $input["quantity"],
            $input["program"],
            $input["distribution_date"],
            $input["remarks"],
            $input["distribution_id"]
        ]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// ======================================================
// DELETE — Remove distribution
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    try {
        if (!canManageDistributionRecord($pdo, $role, $coopId, $input["distribution_id"])) {
            echo json_encode(["success" => false, "message" => "Access denied"]);
            exit;
        }

        // Restore stock before deleting
        $getQty = $pdo->prepare("SELECT input_id, quantity FROM distributions WHERE distribution_id = ?");
        $getQty->execute([$input["distribution_id"]]);
        $row = $getQty->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $restore = $pdo->prepare("
                UPDATE farm_inputs 
                SET stock_quantity = stock_quantity + ?
                WHERE input_id = ?
            ");
            $restore->execute([$row["quantity"], $row["input_id"]]);
        }

        // Delete distribution
        $stmt = $pdo->prepare("DELETE FROM distributions WHERE distribution_id = ?");
        $ok = $stmt->execute([$input["distribution_id"]]);

        echo json_encode(["success" => $ok]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// ======================================================
// GET — Fetch all distributions (MUST BE LAST)
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $baseSql = "
            SELECT 
                d.distribution_id,
                d.input_id,
                d.farmer_id,
                d.cooperative_id,
                d.distributed_by,
                f.full_name AS farmer_name,
                i.name AS input_name,
                d.quantity,
                d.program,
                d.distribution_date,
                u.full_name AS officer_name,
                d.remarks
            FROM distributions d
            LEFT JOIN farmers f ON d.farmer_id = f.farmer_id
            LEFT JOIN farmer_cooperative fc ON fc.farmer_id = f.farmer_id
            LEFT JOIN farm_inputs i ON d.input_id = i.input_id
            LEFT JOIN users u ON d.distributed_by = u.user_id
        ";

        if ($role === "ADMIN" || $role === "OFFICER") {
            $stmt = $pdo->prepare($baseSql . " ORDER BY d.distribution_id DESC");
            $stmt->execute();
        } elseif ($role === "COOPERATIVE") {
            $stmt = $pdo->prepare($baseSql . " WHERE d.cooperative_id = ? OR fc.cooperative_id = ? ORDER BY d.distribution_id DESC");
            $stmt->execute([$coopId, $coopId]);
        } else {
            $stmt = $pdo->prepare($baseSql . " WHERE f.user_id = ? ORDER BY d.distribution_id DESC");
            $stmt->execute([$userId]);
        }

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

?>
