<?php
// High-performance API Reverse Proxy for Node.js on Hostinger
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['__api_path'] ?? '';
unset($_GET['__api_path']);

$queryString = http_build_query($_GET);
$backendPort = getenv('BACKEND_PORT') ?: '54321';
$targetUrl = "http://127.0.0.1:{$backendPort}/api/" . $path;
if (!empty($queryString)) {
    $targetUrl .= (strpos($targetUrl, '?') === false ? '?' : '&') . $queryString;
}

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward request headers
$forwardHeaders = [];
if (function_exists('getallheaders')) {
    $requestHeaders = getallheaders();
} else {
    $requestHeaders = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))));
            $requestHeaders[$name] = $value;
        } elseif ($name == 'CONTENT_TYPE') {
            $requestHeaders['Content-Type'] = $value;
        } elseif ($name == 'CONTENT_LENGTH') {
            $requestHeaders['Content-Length'] = $value;
        }
    }
}

foreach ($requestHeaders as $key => $val) {
    $lower = strtolower($key);
    if ($lower !== 'host' && $lower !== 'content-length') {
        $forwardHeaders[] = "$key: $val";
    }
}
$forwardHeaders[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$forwardHeaders[] = 'X-Forwarded-Proto: https';
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

// Forward body for mutations
if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Timeout
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Backend gateway temporarily unavailable. Node.js backend starting or restarting.',
        'details' => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$headerContent = substr($response, 0, $headerSize);
$bodyContent = substr($response, $headerSize);

http_response_code($httpCode);

// Send back headers (Set-Cookie, Content-Type, etc.)
$headers = explode("\r\n", $headerContent);
foreach ($headers as $header) {
    if (!empty($header)) {
        if (stripos($header, 'Transfer-Encoding') === false &&
            stripos($header, 'Connection') === false) {
            header($header, false);
        }
    }
}

echo $bodyContent;
