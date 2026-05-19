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

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

function fetchPriceFeed() {
    $url = defined("PRICE_FEED_URL") ? trim(PRICE_FEED_URL) : "";

    if ($url !== "") {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Accept: application/json"]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false || $httpCode < 200 || $httpCode >= 300) {
            throw new Exception($error ?: "Price feed unavailable");
        }

        return $response;
    }

    $samplePath = __DIR__ . "/da_price_feed_may_11_16_2026.json";
    $response = file_get_contents($samplePath);
    if ($response === false) {
        throw new Exception("Sample price feed not found");
    }

    return $response;
}

function cleanPriceItem($item) {
    $commodity = trim((string)($item["commodity"] ?? $item["name"] ?? ""));
    $price = $item["price"] ?? $item["current_price"] ?? null;
    $unit = trim((string)($item["unit"] ?? "/kg"));
    $market = trim((string)($item["market_area"] ?? $item["market"] ?? "External Feed"));
    $date = trim((string)($item["record_date"] ?? $item["date"] ?? date("Y-m-d")));

    if ($commodity === "" || !is_numeric($price)) {
        return null;
    }

    return [
        "commodity" => $commodity,
        "price" => round((float)$price, 2),
        "unit" => $unit !== "" ? $unit : "/kg",
        "market_area" => $market !== "" ? $market : "External Feed",
        "record_date" => preg_match("/^\d{4}-\d{2}-\d{2}$/", $date) ? $date : date("Y-m-d")
    ];
}

try {
    $raw = fetchPriceFeed();
    $feed = json_decode($raw, true);

    if (!is_array($feed)) {
        throw new Exception("Invalid price feed JSON");
    }

    $items = $feed["prices"] ?? $feed["data"] ?? $feed;
    if (!is_array($items)) {
        throw new Exception("No price data found in feed");
    }

    $pdo->beginTransaction();

    $findExisting = $pdo->prepare("
        SELECT price_id, price
        FROM price_records
        WHERE commodity = ? AND unit = ? AND market_area = ?
        ORDER BY record_date DESC, price_id DESC
        LIMIT 1
    ");

    $insert = $pdo->prepare("
        INSERT INTO price_records
        (commodity, price, prev_price, unit, market_area, record_date, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $update = $pdo->prepare("
        UPDATE price_records
        SET price = ?, prev_price = ?, record_date = ?, updated_by = ?
        WHERE price_id = ?
    ");

    $created = 0;
    $updated = 0;
    $skipped = 0;

    foreach ($items as $item) {
        $price = cleanPriceItem($item);
        if (!$price) {
            $skipped++;
            continue;
        }

        $findExisting->execute([
            $price["commodity"],
            $price["unit"],
            $price["market_area"]
        ]);
        $existing = $findExisting->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $prevPrice = $item["prev_price"] ?? $existing["price"];
            $prevPrice = is_numeric($prevPrice) ? round((float)$prevPrice, 2) : null;

            $update->execute([
                $price["price"],
                $prevPrice,
                $price["record_date"],
                $user["user_id"] ?? null,
                $existing["price_id"]
            ]);
            $updated++;
        } else {
            $prevPrice = $item["prev_price"] ?? null;
            $prevPrice = is_numeric($prevPrice) ? round((float)$prevPrice, 2) : null;

            $insert->execute([
                $price["commodity"],
                $price["price"],
                $prevPrice,
                $price["unit"],
                $price["market_area"],
                $price["record_date"],
                $user["user_id"] ?? null
            ]);
            $created++;
        }
    }

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "source" => $feed["source"] ?? (defined("PRICE_FEED_URL") && PRICE_FEED_URL ? PRICE_FEED_URL : "Bundled DA price feed from PDF"),
        "created" => $created,
        "updated" => $updated,
        "skipped" => $skipped
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
