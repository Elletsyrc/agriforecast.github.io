<?php
header("Content-Type: application/json");

// Read JSON sent from JavaScript
$weather = json_decode(file_get_contents("php://input"), true);

// Send the JSON to the Python API
$ch = curl_init("http://localhost:8000/recommend");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($weather));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Always return valid JSON so the frontend can safely fall back locally.
if ($response === false || trim($response) === "" || $httpCode < 200 || $httpCode >= 300) {
    echo json_encode([
        "advisories" => [],
        "source" => "fallback",
        "message" => $curlError ?: "Recommendation service unavailable",
        "http_code" => $httpCode,
        "raw_response" => $response
    ]);
    exit;
}

$decoded = json_decode($response, true);

if (!is_array($decoded) || !isset($decoded["advisories"]) || !is_array($decoded["advisories"])) {
    echo json_encode([
        "advisories" => [],
        "source" => "fallback",
        "message" => "Invalid recommendation service response"
    ]);
    exit;
}

// Return Python's response back to JavaScript
echo json_encode($decoded);
