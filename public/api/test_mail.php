<?php
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$dataFile = 'data.json';
$data = [];
if (file_exists($dataFile)) {
    $data = json_decode(file_get_contents($dataFile), true);
}

$notif = $data['notificationSettings'] ?? [];

echo "=== PHPMailer Configuration ===\n";
echo "Host: " . ($notif['smtpHost'] ?? '') . "\n";
echo "Port: " . ($notif['smtpPort'] ?? '') . "\n";
echo "User: " . ($notif['smtpUser'] ?? '') . "\n";
echo "Pass: " . (!empty($notif['smtpPass']) ? '***[SET]***' : '[NOT SET]') . "\n";
echo "===============================\n\n";

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Enable verbose debug output
    $mail->isSMTP();                                            
    $mail->Host       = !empty($notif['smtpHost']) ? $notif['smtpHost'] : 'smtp.gmail.com'; 
    $mail->SMTPAuth   = true;                                   
    $mail->Username   = $notif['smtpUser'] ?? '';               
    $mail->Password   = $notif['smtpPass'] ?? '';               
    $mail->Port       = !empty($notif['smtpPort']) ? $notif['smtpPort'] : 587;              
    
    if ($mail->Port == 587 || $mail->Port == 25) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }

    // Recipients
    $fromEmail = !empty($notif['smtpUser']) ? $notif['smtpUser'] : 'noreply@example.com';
    $fromName = $data['name'] ?? 'Admin Test';
    $mail->setFrom($fromEmail, $fromName);
    
    $mail->addAddress('andreyanuar@poltekindonusa.ac.id', 'Andre Yanuar');

    // Content
    $mail->isHTML(false);
    $mail->Subject = 'Test Email PHPMailer - Debug Trial';
    $mail->Body    = "Halo Andre Yanuar,\n\nIni adalah email percobaan dari script debug untuk memastikan konfigurasi SMTP (PHPMailer) di aplikasi Katalog berjalan normal.\n\nJika email ini sampai di inbox Anda, berarti konfigurasi di data.json sudah berjalan dengan baik.\n\nTerima kasih.";

    $mail->send();
    echo "\n\n> SUCCESS: Message has been sent successfully to andreyanuar@poltekindonusa.ac.id!\n";
} catch (Exception $e) {
    echo "\n\n> ERROR: Message could not be sent.\n> Mailer Error: {$mail->ErrorInfo}\n";
    echo "\n[Saran] Pastikan smtpUser dan smtpPass di file data.json (via panel Admin Notification) sudah terisi dengan benar. Jika menggunakan Gmail, gunakan 'App Password' bukan password login biasa.\n";
}
