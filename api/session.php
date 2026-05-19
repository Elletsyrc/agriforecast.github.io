<?php
header("Content-Type: application/json");
session_start();

if (isset($_SESSION["user"])) {
    echo json_encode([
        "logged_in" => true,
        "user" => [
            "user_id" => $_SESSION["user"]["user_id"],
            "username" => $_SESSION["user"]["username"],
            "fullName" => $_SESSION["user"]["fullName"],   // <-- IMPORTANT
            "email" => $_SESSION["user"]["email"],
            "role" => $_SESSION["user"]["role"],
            "status" => $_SESSION["user"]["status"],
            "cooperative_id" => $_SESSION["user"]["cooperative_id"]
        ]
    ]);
} else {
    echo json_encode(["logged_in" => false]);
}
?>
