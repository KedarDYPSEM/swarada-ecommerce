<?php
// Transparent API Reverse Proxy for Node.js on Hostinger with Multipart / File Upload support
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');
@ini_set('memory_limit', '256M');
@ini_set('max_execution_time', '300');

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['__api_path'] ?? '';
unset($_GET['__api_path']);

$queryString = http_build_query($_GET);
$isUpload = (strpos($path, 'uploads/') === 0 || strpos($path, 'uploads') === 0);
$urlPrefix = $isUpload ? '/' : '/api/';

$ports = [54321, 5000];
$backendPort = getenv('BACKEND_PORT') ?: 54321;
if (!in_array($backendPort, $ports)) {
    array_unshift($ports, $backendPort);
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

// Ensure Authorization header is captured even if Apache FastCGI stripped it
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!empty($authHeader) && !isset($requestHeaders['Authorization'])) {
    $requestHeaders['Authorization'] = $authHeader;
}

// Ensure Cookie header is properly assembled
$cookieHeader = $_SERVER['HTTP_COOKIE'] ?? '';
if (empty($cookieHeader) && !empty($_COOKIE)) {
    $cookieParts = [];
    foreach ($_COOKIE as $k => $v) {
        $cookieParts[] = "$k=" . urlencode($v);
    }
    $cookieHeader = implode('; ', $cookieParts);
}
if (!empty($cookieHeader)) {
    $requestHeaders['Cookie'] = $cookieHeader;
}

$hasFiles = !empty($_FILES);

foreach ($requestHeaders as $key => $val) {
    $lower = strtolower($key);
    if ($lower === 'host') {
        $forwardHeaders[] = "Host: swaradasareecenter.in";
        $forwardHeaders[] = "X-Forwarded-Host: swaradasareecenter.in";
    } elseif ($lower === 'connection') {
        continue;
    } elseif ($hasFiles && $lower === 'content-type') {
        // Leave curl to construct multipart boundary
        continue;
    } else {
        $forwardHeaders[] = "$key: $val";
    }
}
$forwardHeaders[] = "X-Forwarded-For: " . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
$forwardHeaders[] = "X-Forwarded-Proto: " . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http');

// Body data
$body = '';
if ($hasFiles) {
    $postFields = $_POST;
    foreach ($_FILES as $fieldName => $fileInfo) {
        if (is_array($fileInfo['tmp_name'])) {
            foreach ($fileInfo['tmp_name'] as $idx => $tmpName) {
                if (file_exists($tmpName) && $fileInfo['error'][$idx] === UPLOAD_ERR_OK) {
                    $mime = !empty($fileInfo['type'][$idx]) ? $fileInfo['type'][$idx] : 'image/jpeg';
                    $postFields["{$fieldName}[$idx]"] = new CURLFile($tmpName, $mime, $fileInfo['name'][$idx]);
                }
            }
        } else {
            if (file_exists($fileInfo['tmp_name']) && $fileInfo['error'] === UPLOAD_ERR_OK) {
                $mime = !empty($fileInfo['type']) ? $fileInfo['type'] : 'image/jpeg';
                $postFields[$fieldName] = new CURLFile($fileInfo['tmp_name'], $mime, $fileInfo['name']);
            }
        }
    }
    $body = $postFields;
} elseif (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
}

// Try connecting to backend TCP ports
$response = false;
$httpCode = 502;
$headerSize = 0;
$lastError = '';

foreach ($ports as $port) {
    $targetUrl = "http://127.0.0.1:{$port}{$urlPrefix}" . $path . (!empty($queryString) ? "?$queryString" : '');
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);

    if (!empty($cookieHeader)) {
        curl_setopt($ch, CURLOPT_COOKIE, $cookieHeader);
    }

    if ($hasFiles) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    } elseif (!empty($body)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $res = curl_exec($ch);
    if ($res !== false) {
        $response = $res;
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);
        break;
    }
    $lastError = curl_error($ch);
    curl_close($ch);
}

// If TCP failed, try socket fallback
if ($response === false) {
    $socketPath = '/home/u739095470/domains/swaradasareecenter.in/node.sock';
    if (file_exists($socketPath)) {
        $ch = curl_init('http://localhost' . $urlPrefix . $path . (!empty($queryString) ? "?$queryString" : ''));
        curl_setopt($ch, CURLOPT_UNIX_SOCKET_PATH, $socketPath);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);

        if (!empty($cookieHeader)) {
            curl_setopt($ch, CURLOPT_COOKIE, $cookieHeader);
        }

        if ($hasFiles || !empty($body)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        $res = curl_exec($ch);
        if ($res !== false) {
            $response = $res;
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        } else {
            $lastError = curl_error($ch);
        }
        curl_close($ch);
    }
}

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Backend gateway temporarily unavailable. Node.js backend starting or restarting.',
        'details' => $lastError
    ]);
    exit;
}

$headerStr = substr($response, 0, $headerSize);
$bodyStr = substr($response, $headerSize);

http_response_code($httpCode);

// Forward response headers
$headers = explode("\r\n", $headerStr);
foreach ($headers as $h) {
    if (empty($h) || stripos($h, 'Transfer-Encoding') === 0 || stripos($h, 'Connection') === 0) continue;
    if (stripos($h, 'HTTP/') === 0) continue;
    header($h, false);
}

echo $bodyStr;
