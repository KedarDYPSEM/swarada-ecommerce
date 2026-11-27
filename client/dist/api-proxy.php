<?php
// Transparent API Reverse Proxy for Node.js on Hostinger with Multipart / File Upload support
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['__api_path'] ?? '';
unset($_GET['__api_path']);

$queryString = http_build_query($_GET);
$socketPath = '/home/u739095470/domains/swaradasareecenter.in/node.sock';
$isUpload = (strpos($path, 'uploads/') === 0 || strpos($path, 'uploads') === 0);
$urlPrefix = $isUpload ? '/' : '/api/';
$targetUrl = 'http://localhost' . $urlPrefix . $path;
if (!empty($queryString)) {
    $targetUrl .= (strpos($targetUrl, '?') === false ? '?' : '&') . $queryString;
}

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Connect via high-speed UNIX socket if available, otherwise TCP port 5000
if (file_exists($socketPath)) {
    curl_setopt($ch, CURLOPT_UNIX_SOCKET_PATH, $socketPath);
} else {
    $backendPort = getenv('BACKEND_PORT') ?: '5000';
    curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:{$backendPort}{$urlPrefix}" . $path . (!empty($queryString) ? "?$queryString" : ''));
}

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

$hasFiles = !empty($_FILES);

foreach ($requestHeaders as $key => $val) {
    $lower = strtolower($key);
    if ($lower !== 'host' && $lower !== 'content-length') {
        // When forwarding files with CURLFile, do NOT forward client Content-Type header
        // because cURL will generate a fresh, valid multipart boundary automatically!
        if ($hasFiles && $lower === 'content-type') {
            continue;
        }
        $forwardHeaders[] = "$key: $val";
    }
}

// Ensure Cookie header is always forwarded
$hasCookie = false;
foreach ($forwardHeaders as $h) {
    if (stripos($h, 'Cookie:') === 0) { $hasCookie = true; break; }
}
if (!$hasCookie && !empty($_SERVER['HTTP_COOKIE'])) {
    $forwardHeaders[] = 'Cookie: ' . $_SERVER['HTTP_COOKIE'];
}

// Ensure Authorization header is forwarded (Apache FastCGI often sets REDIRECT_HTTP_AUTHORIZATION)
$hasAuth = false;
foreach ($forwardHeaders as $h) {
    if (stripos($h, 'Authorization:') === 0) { $hasAuth = true; break; }
}
if (!$hasAuth) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!empty($auth)) {
        $forwardHeaders[] = 'Authorization: ' . $auth;
    }
}

$forwardHeaders[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$forwardHeaders[] = 'X-Forwarded-Proto: ' . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http');
// Prevent cURL from waiting for 100-continue on POST/multipart
$forwardHeaders[] = 'Expect:';

curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

// Forward body
if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
    if ($hasFiles) {
        $postData = $_POST;
        foreach ($_FILES as $field => $file) {
            if (is_array($file['tmp_name'])) {
                foreach ($file['tmp_name'] as $idx => $tmpName) {
                    if (!empty($tmpName) && is_uploaded_file($tmpName)) {
                        $postData["{$field}[{$idx}]"] = new CURLFile(
                            $tmpName,
                            $file['type'][$idx] ?? 'application/octet-stream',
                            $file['name'][$idx] ?? "file_{$idx}"
                        );
                    }
                }
            } else if (!empty($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
                $postData[$field] = new CURLFile(
                    $file['tmp_name'],
                    $file['type'] ?? 'application/octet-stream',
                    $file['name'] ?? 'file'
                );
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    } else {
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
}

// Timeout (allow up to 60s for image/video uploads)
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

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
            stripos($header, 'Connection') === false &&
            stripos($header, 'HTTP/') !== 0) {
            header($header, false);
        }
    }
}

echo $bodyContent;
exit;
