<?php
require_once "../config.php";
session_start();

// Convert JSON body
$input = json_decode(file_get_contents("php://input"), true);
$user = $_SESSION["user"] ?? null;
$role = strtoupper($user["role"] ?? "FARMER");
if ($role === "USER") $role = "FARMER";

function canManageInputs($role) {
    return $role === "ADMIN" || $role === "OFFICER";
}

function normalizeInputCategory($category) {
    $value = strtolower(trim((string)$category));
    $map = [
        "seed" => "Seeds",
        "seeds" => "Seeds",
        "fertilizer" => "Fertilizer",
        "fertiliser" => "Fertilizer",
        "pesticide" => "Pesticide",
        "pesticides" => "Pesticide",
        "equipment" => "Equipment",
        "tool" => "Equipment",
        "tools" => "Equipment",
        "other" => "Other",
        "others" => "Other"
    ];

    return $map[$value] ?? "Other";
}

// ======================================================
// GET — Fetch all input types
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                input_id,
                name,
                category,
                unit,
                stock_quantity,
                supplier,
                description,
                status,
                created_at,
                updated_at
            FROM farm_inputs
            ORDER BY input_id DESC
        ");
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Auto-status logic
        foreach ($rows as &$r) {
            if ($r["stock_quantity"] <= 0) {
                $r["status"] = "Out-of-Stock";
            } else {
                if (!$r["status"]) {
                    $r["status"] = "Available";
                }
            }
        }

        echo json_encode($rows);
    } catch (Exception $e) {
        echo json_encode([]);
    }
    exit;
}

// ======================================================
// POST — Add new input type
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!canManageInputs($role)) {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO farm_inputs (name, category, unit, stock_quantity, supplier, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $ok = $stmt->execute([
            $input["name"],
            normalizeInputCategory($input["category"] ?? "Other"),
            $input["unit"],
            $input["stock_quantity"],
            $input["supplier"],
            $input["description"],
            $input["status"] ?? "Available"
        ]);

        echo json_encode(["success" => $ok]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ======================================================
// PUT — Update input type
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    if (!canManageInputs($role)) {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE farm_inputs SET
                name = ?,
                category = ?,
                unit = ?,
                stock_quantity = ?,
                supplier = ?,
                description = ?,
                status = ?,
                updated_at = NOW()
            WHERE input_id = ?
        ");

        $ok = $stmt->execute([
            $input["name"],
            normalizeInputCategory($input["category"] ?? "Other"),
            $input["unit"],
            $input["stock_quantity"],
            $input["supplier"],
            $input["description"],
            $input["status"],
            $input["input_id"]
        ]);

        echo json_encode(["success" => $ok]);
    } catch (Exception $e) {
        echo json_encode(["success" => false]);
    }
    exit;
}

// ======================================================
// DELETE — Remove input type
// ======================================================
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    if (!canManageInputs($role)) {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    try {
        $used = $pdo->prepare("SELECT COUNT(*) FROM distributions WHERE input_id = ?");
        $used->execute([$input["input_id"]]);

        if ((int)$used->fetchColumn() > 0) {
            echo json_encode([
                "success" => false,
                "message" => "This input type is already used in distribution records and cannot be deleted."
            ]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM farm_inputs WHERE input_id = ?");
        $ok = $stmt->execute([$input["input_id"]]);

        echo json_encode(["success" => $ok]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}
?>
