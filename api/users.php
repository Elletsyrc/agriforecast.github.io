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
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// ======================================================
// GET — FETCH ALL USERS (ADMIN ONLY)
// ======================================================
if ($method === "GET") {

    if ($user_role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    // FIXED: correct column names
    $stmt = $pdo->query("
        SELECT 
            user_id,
            full_name,
            username,
            email,
            role,
            status,
            cooperative_id
        FROM users
        ORDER BY full_name ASC
    ");

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// ======================================================
// POST — CREATE NEW USER (ADMIN ONLY)
// ======================================================
if ($method === "POST") {

    if ($user_role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $full_name = $input['full_name'] ?? "";
    $username = $input['username'] ?? "";
    $password = $input['password'] ?? "";
    $email = $input['email'] ?? "";
    $role = $input['role'] ?? "USER";
    $status = $input['status'] ?? "Active";
    $cooperative_id = $input['cooperative_id'] ?? null;

    if (!$full_name || !$username || !$password) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    // FIXED: your column is password_hash
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, username, password_hash, email, role, status, cooperative_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $ok = $stmt->execute([
        $full_name,
        $username,
        $password_hash,
        $email,
        $role,
        $status,
        $cooperative_id
    ]);

    if (!$ok) {
         echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "User created successfully"]);
    exit;
}

// ======================================================
// PUT - UPDATE USER (ADMIN ONLY)
// ======================================================
if ($method === "PUT") {

    if ($user_role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $user_id = $input['user_id'] ?? null;
    $full_name = trim($input['full_name'] ?? "");
    $username = trim($input['username'] ?? "");
    $password = $input['password'] ?? "";
    $email = trim($input['email'] ?? "");
    $role = $input['role'] ?? "USER";
    $status = $input['status'] ?? "Active";
    $cooperative_id = $input['cooperative_id'] ?? null;

    if (!$user_id || !$full_name || !$username) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    if ($cooperative_id === "") {
        $cooperative_id = null;
    }

    if ($password !== "") {
        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            UPDATE users
            SET full_name = ?, username = ?, password_hash = ?, email = ?, role = ?, status = ?, cooperative_id = ?
            WHERE user_id = ?
        ");

        $ok = $stmt->execute([
            $full_name,
            $username,
            $password_hash,
            $email,
            $role,
            $status,
            $cooperative_id,
            $user_id
        ]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE users
            SET full_name = ?, username = ?, email = ?, role = ?, status = ?, cooperative_id = ?
            WHERE user_id = ?
        ");

        $ok = $stmt->execute([
            $full_name,
            $username,
            $email,
            $role,
            $status,
            $cooperative_id,
            $user_id
        ]);
    }

    if (!$ok) {
        echo json_encode(["success" => false, "message" => "Failed to update user"]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "User updated successfully"]);
    exit;
}

// ======================================================
// DELETE - DELETE USER (ADMIN ONLY)
// ======================================================
if ($method === "DELETE") {

    if ($user_role !== "ADMIN") {
        echo json_encode(["success" => false, "message" => "Access denied"]);
        exit;
    }

    $user_id = $input['user_id'] ?? null;

    if (!$user_id) {
        echo json_encode(["success" => false, "message" => "Missing user ID"]);
        exit;
    }

    if ((int)$user_id === (int)($user['user_id'] ?? 0)) {
        echo json_encode(["success" => false, "message" => "You cannot delete your own account while logged in"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    $ok = $stmt->execute([$user_id]);

    if (!$ok) {
        echo json_encode(["success" => false, "message" => "Failed to delete user"]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    exit;
}

echo json_encode(["success" => false, "message" => "Invalid request"]);
