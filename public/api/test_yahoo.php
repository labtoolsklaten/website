<?php
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'crysenoii@gmail.com';
    $mail->Password   = 'fyws kjjp wftz ymjj'; // as provided by user
    $mail->Port       = 587;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->setFrom('crysenoii@gmail.com', 'Admin Website');
    $mail->addAddress('yanuar.andre@yahoo.co.id', 'Andre');

    $mail->isHTML(true);
    $mail->Subject = 'Akses Produk Digital: Test';
    $mail->Body    = 'Halo, ini test dari PHP. Mohon konfirmasi apabila masuk.';
    
    $mail->send();
    echo "SUCCESS\n";
} catch (Exception $e) {
    echo "ERROR: {$mail->ErrorInfo}\n";
}
