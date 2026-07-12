<?php
// Secure Form Endpoint for ANSEB Junk Removal
date_default_timezone_set('America/Chicago');
header('Content-Type: application/json; charset=utf-8');

// 1. CORS & Origin Validation
function normalize_origin(string $url): ?string {
    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
        return null;
    }
    $scheme = strtolower($parts['scheme']);
    $host = strtolower($parts['host']);
    $port = isset($parts['port']) ? ':' . $parts['port'] : '';
    return $scheme . '://' . $host . $port;
}

$allowed_origins = [
    'https://ansebjunk.com',
    'https://www.ansebjunk.com',
    'http://localhost:4321', // Local dev allowed
    'http://127.0.0.1:4321'
];

$allowed_hosts = [
    'ansebjunk.com',
    'www.ansebjunk.com',
    'localhost:4321',
    '127.0.0.1:4321'
];

$origin_raw = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer_raw = $_SERVER['HTTP_REFERER'] ?? '';
$host_raw = $_SERVER['HTTP_HOST'] ?? '';

$is_allowed = false;
$origin_normalized = null;

if (!empty($origin_raw)) {
    $origin_normalized = normalize_origin($origin_raw);
    if ($origin_normalized && in_array($origin_normalized, $allowed_origins, true)) {
        $is_allowed = true;
    }
} elseif (!empty($referer_raw)) {
    $origin_normalized = normalize_origin($referer_raw);
    if ($origin_normalized && in_array($origin_normalized, $allowed_origins, true)) {
        $is_allowed = true;
    }
} else {
    // Validate HTTP_HOST explicitly
    $normalizedHost = strtolower(trim($host_raw));
    if (in_array($normalizedHost, $allowed_hosts, true)) {
        $is_allowed = true;
    }
}

if ($is_allowed && $origin_normalized) {
    header("Access-Control-Allow-Origin: $origin_normalized");
}

if (!$is_allowed) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden origin.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed.']);
    exit;
}

// 2. Rate Limiting with probabilistic cleanup
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ip_hash = hash('sha256', $ip);
$tmp_dir = sys_get_temp_dir();
$rate_file = $tmp_dir . '/anseb_rate_' . $ip_hash . '.txt';

// Cleanup old rate files probabilistically (5% chance)
if (random_int(1, 100) <= 5) {
    foreach (glob($tmp_dir . '/anseb_rate_*.txt') as $file) {
        if (is_file($file) && filemtime($file) < time() - 86400) {
            @unlink($file);
        }
    }
}

if (file_exists($rate_file)) {
    $last_time = (int)@file_get_contents($rate_file);
    // Allow 1 request per 30 seconds
    if ($last_time && time() - $last_time < 30) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too Many Requests. Please wait before submitting again.']);
        exit;
    }
}
// Try to write, but don't block if tmp is unwritable
@file_put_contents($rate_file, time(), LOCK_EX);

// 3. Honeypot check
$honeypot = $_POST['website_url'] ?? '';
if (!empty($honeypot)) {
    // Bot. Silently drop.
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Success']);
    exit;
}

// 4. Anti-Spam Minimum Time Check
$form_started_at = $_POST['form_started_at'] ?? '';
if (!is_numeric($form_started_at)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Success']);
    exit;
}
$diff = time() - (int)$form_started_at;
if ($diff < 3 || $diff > 86400 || $diff < 0) { // < 3s, > 24h, or future
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Success']);
    exit;
}

// 5. Sanitize and Validate Inputs
function clean_input($data, $max_len = 1000) {
    $data = trim((string)$data);
    $data = substr($data, 0, $max_len);
    return htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
}

function clean_header($data) {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', trim((string)$data));
}

$name = clean_header(clean_input($_POST['name'] ?? '', 150));
$phone = clean_header(clean_input($_POST['phone'] ?? '', 50));
$email = clean_header(clean_input($_POST['email'] ?? '', 150));
$zip = clean_header(clean_input($_POST['zip'] ?? '', 20));
$serviceType = clean_header(clean_input($_POST['serviceType'] ?? '', 100));
$date = clean_header(clean_input($_POST['date'] ?? '', 20));
$desc = clean_input($_POST['desc'] ?? '', 5000);
$consent = $_POST['consent'] ?? '';
$lang = clean_header(clean_input($_POST['lang'] ?? '', 10));

if (!in_array($lang, ['en', 'es'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid language.']);
    exit;
}

if (empty($name) || strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid name.']);
    exit;
}

$phone_digits = preg_replace('/\D+/', '', $phone);
if (strlen($phone_digits) < 10 || strlen($phone_digits) > 15) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid phone number.']);
    exit;
}

if (!preg_match('/^\d{5}(-\d{4})?$/', $zip)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid ZIP code.']);
    exit;
}

$valid_services = [
    'furniture-removal', 'appliance-removal', 'garage-cleanout',
    'house-cleanout', 'apartment-cleanout', 'yard-waste',
    'construction-debris', 'commercial-junk', 'other'
];
if (!in_array($serviceType, $valid_services)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid service type.']);
    exit;
}

if (empty($desc) || strlen(trim($desc)) < 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Description is too short.']);
    exit;
}

$valid_consents = ['on', '1', 'true', 'yes'];
if (!in_array(strtolower($consent), $valid_consents, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Consent is required.']);
    exit;
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (!empty($date)) {
    $timezone = new DateTimeZone('America/Chicago');
    $dt = DateTime::createFromFormat('!Y-m-d', $date, $timezone);
    $errors = DateTime::getLastErrors();
    
    if (!$dt || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0)) || $dt->format('Y-m-d') !== $date) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid date format or value.']);
        exit;
    }
    
    $today = new DateTime('today', $timezone);
    if ($dt < $today) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Date cannot be in the past.']);
        exit;
    }
}

// 6. File Validation using finfo
$allowed_mime = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

$max_file_size = 5 * 1024 * 1024; // 5MB
$max_total_size = 12 * 1024 * 1024; // 12MB
$total_size = 0;
$valid_files = [];

// Count files
$upload_count = 0;
foreach ($_FILES as $key => $file) {
    if (is_array($file['error'])) {
        // We do not allow array uploads like photos[]
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Array uploads are not allowed.']);
        exit;
    }
    if ($file['error'] !== UPLOAD_ERR_NO_FILE) {
        $upload_count++;
        if (!in_array($key, ['photo0', 'photo1', 'photo2'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file key uploaded.']);
            exit;
        }
    }
}

if ($upload_count > 3) {
    http_response_code(413);
    echo json_encode(['success' => false, 'message' => 'A maximum of 3 images is allowed.']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
if (!$finfo) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server misconfiguration (finfo).']);
    exit;
}

$valid_keys = ['photo0', 'photo1', 'photo2'];
foreach ($valid_keys as $fileKey) {
    if (isset($_FILES[$fileKey])) {
        $error = $_FILES[$fileKey]['error'];
        
        if ($error === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        
        if ($error !== UPLOAD_ERR_OK) {
            if (in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE])) {
                http_response_code(413);
                echo json_encode(['success' => false, 'message' => 'File exceeds allowed size limit.']);
            } elseif (in_array($error, [UPLOAD_ERR_PARTIAL, UPLOAD_ERR_EXTENSION])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'File upload was partial or invalid.']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Internal server error processing file.']);
            }
            finfo_close($finfo);
            exit;
        }

        $tmp_path = $_FILES[$fileKey]['tmp_name'];
        if (!is_uploaded_file($tmp_path) || !is_readable($tmp_path)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid uploaded file.']);
            finfo_close($finfo);
            exit;
        }

        $size = $_FILES[$fileKey]['size'];
        
        if ($size > $max_file_size) {
            http_response_code(413);
            echo json_encode(['success' => false, 'message' => "File exceeds 5MB limit."]);
            finfo_close($finfo);
            exit;
        }

        $total_size += $size;
        if ($total_size > $max_total_size) {
            http_response_code(413);
            echo json_encode(['success' => false, 'message' => 'Total file size exceeds 12MB.']);
            finfo_close($finfo);
            exit;
        }

        $real_mime = finfo_file($finfo, $tmp_path);
        if ($real_mime === false || !array_key_exists($real_mime, $allowed_mime)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, and WEBP allowed.']);
            finfo_close($finfo);
            exit;
        }

        $ext = $allowed_mime[$real_mime];
        $safe_name = "photo_" . time() . "_" . bin2hex(random_bytes(4)) . ".$ext";

        $valid_files[] = [
            'path' => $tmp_path,
            'name' => $safe_name,
            'mime' => $real_mime,
            'size' => $size
        ];
    }
}
finfo_close($finfo);

// 7. Email Formatting
$to = 'info@ansebjunk.com';
$subject = "New Estimate Request from " . substr($name, 0, 50);
$boundary = '=_ANSEB_' . bin2hex(random_bytes(16));

$headers = "From: ANSEB Junk Removal <info@ansebjunk.com>\r\n";
if (!empty($email)) {
    $headers .= "Reply-To: $email\r\n";
}
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

$date_str = date('Y-m-d H:i:s');

$messageBody = "You have received a new estimate request.\n\n";
$messageBody .= "Name: $name\n";
$messageBody .= "Phone: $phone\n";
$messageBody .= "Email: " . ($email ? $email : 'N/A') . "\n";
$messageBody .= "ZIP Code: $zip\n";
$messageBody .= "Service: $serviceType\n";
$messageBody .= "Preferred Date: " . ($date ? $date : 'N/A') . "\n";
$messageBody .= "Language: $lang\n";
$messageBody .= "Consent: Yes\n";
$messageBody .= "Submission Date: $date_str\n\n";
$messageBody .= "Description:\n$desc\n";

$body = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $messageBody . "\r\n";

// Append valid files
foreach ($valid_files as $vf) {
    $content = file_get_contents($vf['path']);
    $encoded = chunk_split(base64_encode($content));
    
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: " . $vf['mime'] . "; name=\"" . $vf['name'] . "\"\r\n";
    $body .= "Content-Disposition: attachment; filename=\"" . $vf['name'] . "\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= $encoded . "\r\n";
}

$body .= "--$boundary--\r\n";

// 8. Send Email
$mail_success = @mail($to, $subject, $body, $headers);

if ($mail_success) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Your request has been sent successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error while sending email.']);
}


