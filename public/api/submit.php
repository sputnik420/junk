<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// 1. Honeypot check (Anti-spam)
$honeypot = $_POST['website_url'] ?? '';
if (!empty($honeypot)) {
    // It's a bot. Silently accept but do nothing.
    echo json_encode(['success' => true, 'message' => 'Success']);
    exit;
}

// 2. Sanitize Inputs
$name = htmlspecialchars(strip_tags($_POST['name'] ?? ''));
$phone = htmlspecialchars(strip_tags($_POST['phone'] ?? ''));
$email = htmlspecialchars(strip_tags($_POST['email'] ?? ''));
$zip = htmlspecialchars(strip_tags($_POST['zip'] ?? ''));
$serviceType = htmlspecialchars(strip_tags($_POST['serviceType'] ?? ''));
$date = htmlspecialchars(strip_tags($_POST['date'] ?? ''));
$desc = htmlspecialchars(strip_tags($_POST['desc'] ?? ''));

if (empty($name) || empty($phone) || empty($zip) || empty($serviceType) || empty($desc)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

$to = 'info@ansebjunk.com';
$subject = "New Estimate Request from $name";

// 3. Email Boundaries for attachments
$boundary = md5(time());
$headers = "From: ANSEB Junk Removal <info@ansebjunk.com>\r\n";
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "Reply-To: $email\r\n";
}
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

// 4. Message Body
$messageBody = "You have received a new estimate request.\n\n";
$messageBody .= "Name: $name\n";
$messageBody .= "Phone: $phone\n";
$messageBody .= "Email: $email\n";
$messageBody .= "ZIP: $zip\n";
$messageBody .= "Service: $serviceType\n";
$messageBody .= "Date: $date\n\n";
$messageBody .= "Description:\n$desc\n";

$body = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= $messageBody . "\r\n";

// 5. Attachments
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
for ($i = 0; $i < 3; $i++) {
    $fileKey = "photo$i";
    if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] == UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES[$fileKey]['tmp_name'];
        $fileName = $_FILES[$fileKey]['name'];
        $fileSize = $_FILES[$fileKey]['size'];
        
        // Use mime_content_type to get actual MIME type, fallback to the one provided by user
        $fileType = function_exists('mime_content_type') ? mime_content_type($fileTmpPath) : $_FILES[$fileKey]['type'];

        // Strict MIME type check
        if (in_array($fileType, $allowedMimeTypes)) {
            // Limit size (e.g. 5MB)
            if ($fileSize <= 5 * 1024 * 1024) {
                $handle = fopen($fileTmpPath, "r");
                if ($handle) {
                    $content = fread($handle, $fileSize);
                    fclose($handle);
                    $encodedContent = chunk_split(base64_encode($content));

                    $body .= "--$boundary\r\n";
                    $body .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
                    $body .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n";
                    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
                    $body .= $encodedContent . "\r\n";
                }
            }
        }
    }
}

$body .= "--$boundary--\r\n";

// 6. Send Email
if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Your request has been sent successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'There was an error sending your request. Please try again later.']);
}
?>
