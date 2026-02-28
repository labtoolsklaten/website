<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

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
        'product_id' => $req['product_id'],
        'product_name' => $req['product_name'],
        'amount' => $req['amount'],
        'method' => $req['method'],
        'status' => 'PENDING',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $orders[] = $newOrder;
    saveJson($ordersFile, $orders);
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

    // Send Email if enabled
    $notif = $data['notificationSettings'] ?? [];
    if ($targetOrder && ($notif['emailEnabled'] ?? false) && !empty($targetOrder['email'])) {
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

        $headers = "From: " . ($notif['smtpUser'] ?? "noreply@example.com") . "\r\n";
        $headers .= "Reply-To: " . ($notif['smtpUser'] ?? "noreply@example.com") . "\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        // Note: Using mail() for simplicity. SMTP settings in Admin are saved but 
        // would requires a library like PHPMailer to be fully functional here.
        mail($targetOrder['email'], $subject, $body, $headers);
    }

    echo json_encode(['status' => 'success']);
    exit;
}

?>
