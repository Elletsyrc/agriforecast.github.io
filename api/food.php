<?php
header("Content-Type: application/json");
require_once "../config.php";
session_start();

$pdo = getDB();
$user = $_SESSION["user"] ?? null;
$role = strtoupper($user["role"] ?? "FARMER");
if ($role === "USER") $role = "FARMER";

if (!$user || !in_array($role, ["ADMIN", "OFFICER"], true)) {
    echo json_encode(["success" => false, "message" => "Access denied"]);
    exit;
}

$stmt = $pdo->query("SELECT * FROM staple_food ORDER BY food_id ASC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
