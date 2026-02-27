<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Replace with actual Xendit Secret Key
$apiKey = 'xnd_development_...';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $productId = $data['product_id'] ?? null;
    $method = $data['method'] ?? 'manual';
    
    if (!$productId) {
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }

    // Mock product data (In real app, fetch from DB)
    $products = [
        1 => ['name' => 'Lightroom Presets Pack', 'price' => 150000],
        2 => ['name' => 'Product Design Handbook', 'price' => 250000]
    ];

    $product = $products[$productId] ?? null;

    if ($method === 'xendit') {
        // Create Xendit Invoice
        $externalId = 'inv-' . time();
        $payload = [
            'external_id' => $externalId,
            'amount' => $product['price'],
            'description' => 'Payment for ' . $product['name'],
            'invoice_duration' => 86400,
            'customer' => [
                'given_names' => 'Customer',
                'email' => 'customer@example.com'
            ],
            'success_redirect_url' => 'http://localhost/katalog/dist/?status=success',
            'failure_redirect_url' => 'http://localhost/katalog/dist/?status=error'
        ];

        $ch = curl_init('https://api.xendit.co/v2/invoices');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($apiKey . ':')
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 201 || $httpCode === 200) {
            echo $response;
        } else {
            echo json_encode(['error' => 'Failed to create Xendit invoice', 'details' => json_decode($response)]);
        }
    } else {
        // Manual Flow
        echo json_encode([
            'status' => 'PENDING',
            'message' => 'Please transfer to the provided bank account or scan QRIS',
            'instructions' => [
                'bank' => 'BCA 1234567890 a/n Ahmad',
                'qris' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SamplePayment'
            ]
        ]);
    }
}
?>
