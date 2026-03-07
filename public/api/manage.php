<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dataFile = 'data.json';
$ordersFile = 'orders.json';
$uploadDir = 'uploads/'; // Relative to this script (public/api/uploads/)
$config = [
    'username' => 'admin',
    'password' => 'admin123'
];

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

function getRequestData() {
    return json_decode(file_get_contents('php://input'), true);
}

function saveJson($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

function loadJson($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true);
}

$action = $_GET['action'] ?? '';

// --- PUBLIC ACTIONS ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_data') {
    echo file_get_contents($dataFile);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $req = getRequestData();
    if (($req['username'] ?? '') === $config['username'] && ($req['password'] ?? '') === $config['password']) {
        $_SESSION['logged_in'] = true;
        echo json_encode(['status' => 'success', 'token' => session_id()]);
    } else {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create_order') {
    $req = getRequestData();
    $orders = loadJson($ordersFile);
    
    $newOrder = [
        'id' => 'ORD-' . strtoupper(substr(uniqid(), 8, 4)),
        'customer' => $req['customer'] ?? 'Anonymous',
        'whatsapp' => $req['whatsapp'] ?? '',
        'email' => $req['email'] ?? '',
        'product_id' => $req['product_id'],
        'product_name' => $req['product_name'],
        'amount' => $req['amount'],
        'method' => $req['method'],
        'status' => 'PENDING',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $orders[] = $newOrder;
    saveJson($ordersFile, $orders);

    // Kirim notifikasi email ke Admin (jika diaktifkan dan email tujuan ada)
    $data = loadJson($dataFile);
    $notif = $data['notificationSettings'] ?? [];
    if (($notif['emailEnabled'] ?? false) && !empty($notif['adminEmail'])) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $notif['smtpHost'] ?? '';
            $mail->SMTPAuth   = true;
            $mail->Username   = $notif['smtpUser'] ?? '';
            $mail->Password   = $notif['smtpPass'] ?? '';
            $mail->Port       = $notif['smtpPort'] ?? 587;
            
            if ($mail->Port == 587 || $mail->Port == 25) {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            }

            $mail->setFrom($notif['smtpUser'] ?? "noreply@example.com", 'Sistem Katalog Web');
            $mail->addAddress($notif['adminEmail'], $data['name'] ?? 'Admin');

            $mail->isHTML(true);
            $mail->Subject = "Pesanan Baru Masuk: {$newOrder['product_name']} ({$newOrder['customer']})";
            $rawBody = "Halo Admin,\n\nAda pesanan baru yang masuk ke sistem. Berikut rinciannya:\n\n"
                           . "ID Pesanan: {$newOrder['id']}\n"
                           . "Nama Pembeli: {$newOrder['customer']}\n"
                           . "WhatsApp: {$newOrder['whatsapp']}\n"
                           . "Email: {$newOrder['email']}\n"
                           . "Produk: {$newOrder['product_name']}\n"
                           . "Nominal Bayar: Rp " . number_format($newOrder['amount'], 0, ',', '.') . "\n"
                           . "Metode: " . strtoupper($newOrder['method']) . "\n"
                           . "Waktu: {$newOrder['created_at']}\n\n"
                           . "Silakan cek panel admin Anda untuk melakukan verifikasi pembayaran.\n\n"
                           . "Terima kasih.";
            $mail->Body = nl2br($rawBody);
            $mail->AltBody = $rawBody;

            $mail->send();
        } catch (Exception $e) {
            error_log("Gagal kirim notifikasi Order ke Admin: {$mail->ErrorInfo}");
        }
    }

    echo json_encode(['status' => 'success', 'order' => $newOrder]);
    exit;
}

// --- PROTECTED ADMIN ACTIONS ---
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
        exit;
    }
    
    $file = $_FILES['file'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!in_array($ext, $allowed)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type']);
        exit;
    }

    $filename = time() . '_' . uniqid() . '.' . $ext;
    $target = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $target)) {
        // Return URL relative to the dist root
        echo json_encode(['status' => 'success', 'url' => 'api/uploads/' . $filename]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save file']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save_data') {
    $data = getRequestData();
    if (saveJson($dataFile, $data)) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
    exit;
}

if ($action === 'get_orders') {
    $orders = loadJson($ordersFile);
    $data = loadJson($dataFile);
    $notif = $data['notificationSettings'] ?? [];
    $waTemplate = $notif['waTemplate'] ?? "Halo {customer}!\n\nPembayaran Anda untuk *{product_name}* telah kami terima. ✅\n\nSilakan akses produk Anda melalui link di bawah ini:\n{drive_link}\n\nTerima kasih telah berbelanja!";

    foreach ($orders as &$order) {
        $driveLink = "";
        foreach($data['products'] as $p) {
            if ($p['id'] == $order['product_id']) {
                $driveLink = $p['driveUrl'];
                break;
            }
        }
        
        $message = str_replace(
            ['{customer}', '{product_name}', '{drive_link}'],
            [$order['customer'], $order['product_name'], $driveLink],
            $waTemplate
        );

        $waNumber = preg_replace('/[^0-9]/', '', $order['whatsapp']);
        if (strpos($waNumber, '0') === 0) $waNumber = '62' . substr($waNumber, 1);
        $order['wa_link'] = "https://wa.me/" . $waNumber . "?text=" . urlencode($message);
    }
    echo json_encode($orders);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete_order') {
    $req = getRequestData();
    $orders = loadJson($ordersFile);
    $newOrders = [];
    
    foreach ($orders as $order) {
        if ($order['id'] !== $req['order_id']) {
            $newOrders[] = $order;
        }
    }
    
    saveJson($ordersFile, $newOrders);
    echo json_encode(['status' => 'success']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'approve_order') {
    $req = getRequestData();
    $orders = loadJson($ordersFile);
    $data = loadJson($dataFile);
    $targetOrder = null;

    foreach ($orders as &$order) {
        if ($order['id'] === $req['order_id']) {
            $order['status'] = 'PAID';
            $targetOrder = $order;
            break;
        }
    }
    saveJson($ordersFile, $orders);

    echo json_encode(['status' => 'success']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'send_email_order') {
    $req = getRequestData();
    $orders = loadJson($ordersFile);
    $data = loadJson($dataFile);
    $targetOrder = null;

    foreach ($orders as $order) {
        if ($order['id'] === $req['order_id']) {
            $targetOrder = $order;
            break;
        }
    }

    if (!$targetOrder || empty($targetOrder['email'])) {
        echo json_encode(['status' => 'error', 'message' => 'Pesanan tidak ditemukan atau tidak memiliki alamat email']);
        exit;
    }

    $notif = $data['notificationSettings'] ?? [];
    if (!($notif['emailEnabled'] ?? false)) {
        echo json_encode(['status' => 'error', 'message' => 'Fitur notifikasi email belum diaktifkan di panel admin']);
        exit;
    }

    $driveLink = "";
    foreach($data['products'] as $p) {
        if ($p['id'] == $targetOrder['product_id']) {
            $driveLink = $p['driveUrl'];
            break;
        }
    }

    $subject = str_replace(
        ['{customer}', '{product_name}', '{drive_link}'],
        [$targetOrder['customer'], $targetOrder['product_name'], $driveLink],
        $notif['emailSubject'] ?? "Akses Produk: {product_name}"
    );

    $body = str_replace(
        ['{customer}', '{product_name}', '{drive_link}', '{admin_name}'],
        [$targetOrder['customer'], $targetOrder['product_name'], $driveLink, $data['name'] ?? 'Admin'],
        $notif['emailTemplate'] ?? "Halo {customer}, berikut link produk Anda: {drive_link}"
    );

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $notif['smtpHost'] ?? '';
        $mail->SMTPAuth   = true;
        $mail->Username   = $notif['smtpUser'] ?? '';
        $mail->Password   = $notif['smtpPass'] ?? '';
        $mail->Port       = $notif['smtpPort'] ?? 587;
        
        if ($mail->Port == 587 || $mail->Port == 25) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        }

        // Wajib menggunakan SMTP User sebagai From Email untuk menghindari rejection DMARC/Spam filter Google
        $fromEmail = !empty($notif['smtpUser']) ? $notif['smtpUser'] : 'noreply@example.com';
        $mail->setFrom($fromEmail, $data['name'] ?? 'Admin Website');
        $mail->addReplyTo($fromEmail, $data['name'] ?? 'Admin Website');
        $mail->addAddress($targetOrder['email'], $targetOrder['customer']);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        
        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>{$subject}</title>
        </head>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            " . nl2br($body) . "
        </body>
        </html>
        ";
        
        $mail->Body    = $htmlBody;
        $mail->AltBody = $body;

        $mail->send();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        echo json_encode(['status' => 'error', 'message' => $mail->ErrorInfo]);
    }
    
    exit;
}

?>
