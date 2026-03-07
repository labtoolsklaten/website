<?php
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Menyesuaikan jika dijalankan di public/api atau dist/api
$dataFile = 'data.json';
if (!file_exists($dataFile)) {
    die("File data.json tidak ditemukan!");
}

$data = json_decode(file_get_contents($dataFile), true);
$notif = $data['notificationSettings'] ?? [];

echo "<pre>";
echo "=== HASIL TESTER SMTP ===\n\n";
echo "Host: " . ($notif['smtpHost'] ?? '') . "\n";
echo "Port: " . ($notif['smtpPort'] ?? '') . "\n";
echo "User: " . ($notif['smtpUser'] ?? '') . "\n";
echo "Pass: " . (!empty($notif['smtpPass']) ? '***[SET]***' : '[NOT SET]') . "\n";
echo "===============================\n\n";

$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host       = !empty($notif['smtpHost']) ? $notif['smtpHost'] : 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $notif['smtpUser'] ?? '';
    $mail->Password   = $notif['smtpPass'] ?? '';
    $mail->Port       = !empty($notif['smtpPort']) ? $notif['smtpPort'] : 587;
    
    // Setting enkripsi sesuai port
    if ($mail->Port == 587 || $mail->Port == 25) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }

    // Default target: Ke email User itu sendiri sebagai Test
    $fromEmail = !empty($notif['smtpUser']) ? $notif['smtpUser'] : 'noreply@example.com';
    $targetEmail = !empty($notif['smtpUser']) ? $notif['smtpUser'] : 'tester@example.com'; 
    $fromName = $data['name'] ?? 'Admin Website';
    
    $mail->setFrom($fromEmail, $fromName);
    
    // Kirim email test kembali ke email pengirim (agar tidak terdeteksi spam dan pasti terkirim)
    $mail->addAddress($targetEmail, 'Admin');

    $mail->isHTML(false);
    $mail->Subject = 'Test Ekstensi: Notifikasi Sistem Berhasil';
    $mail->Body    = "Halo,\n\nJika Anda membaca pesan ini, maka settingan SMTP Web Katalog Anda sudah berfungsi dengan sempurna!\n\nKonfigurasi App Password berhasil digunakan.\n\nSalam,\nSistem Katalog";

    echo "Mencoba menyambungkan ke SMTP Server dan mengirim email ke: {$targetEmail}...\n\n";
    $mail->send();
    echo "\n\n===============================\n";
    echo "> SUCCESS: EMAIL BERHASIL DIKIRIM!\n";
    echo "===============================\n";
    echo "Pesan Percobaan telah terkirim ke kotak masuk Anda ({$targetEmail}).\n";

} catch (Exception $e) {
    echo "\n\n===============================\n";
    echo "> GAGAL: EMAIL TIDAK TERKIRIM.\n";
    echo "===============================\n";
    echo "Detail Error: {$mail->ErrorInfo}\n\n";
    echo "KEMUNGKINAN PENYEBAB:\n";
    echo "1. App Password salah huruf/spasi (Pastikan persis 16 karakter tanpa spasi misal: abcdefghijklmnop)\n";
    echo "2. Port SMTP terblokir internet (Jika menggunakan localhost, coba tethering HP)\n";
    echo "3. Akun Google Anda melarang akses meski memakai App Password.\n";
}
echo "</pre>";
