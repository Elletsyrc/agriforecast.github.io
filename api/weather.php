<?php
header("Content-Type: application/json");

// 1) CONFIG: API key + dynamic location support
$API_KEY = "f891590c7ef96163c67b3af54f6f3e40";

// Allow JS to pass ?lat=...&lon=...
$lat = $_GET["lat"] ?? "14.1122";     // Default: Daet
$lon = $_GET["lon"] ?? "122.9553";    // Default: Daet

// 2) Call OpenWeatherMap 5‑day / 3‑hour forecast API
$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$API_KEY}&units=metric";

$response = @file_get_contents($url);
$data = $response ? json_decode($response, true) : null;

// 3) If API fails, return fallback so UI still works
if (!$data || !isset($data["list"])) {
    echo json_encode([
        "location" => "Local Area",
        "current" => ["temp" => 28, "condition" => "Partly Cloudy"],
        "forecast" => []
    ]);
    exit;
}

// 4) Extract current weather (first entry)
$current = $data["list"][0];
$currentTemp = round($current["main"]["temp"]);
$currentCondition = $current["weather"][0]["main"];

// 5) Build simple 5‑day forecast (1 entry per day)
$forecast = [];
$daysAdded = [];

foreach ($data["list"] as $entry) {
    $day = date("l", strtotime($entry["dt_txt"]));

    if (!in_array($day, $daysAdded)) {
        $forecast[] = [
            "day" => $day,
            "temp" => round($entry["main"]["temp"]),
            "condition" => $entry["weather"][0]["main"]
        ];
        $daysAdded[] = $day;
    }

    if (count($forecast) >= 5) break;
}

// 6) Reverse‑lookup location name (optional)
$locationName = $data["city"]["name"] . ", " . ($data["city"]["country"] ?? "");

// 7) Return JSON in the exact shape your frontend expects
echo json_encode([
    "location" => $locationName,
    "current" => [
        "temp" => $currentTemp,
        "condition" => $currentCondition
    ],
    "forecast" => $forecast
]);
