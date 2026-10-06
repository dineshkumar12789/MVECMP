package com.mvecm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply.mvecm@gmail.com}")
    private String fromEmail;

    @Value("${app.otp.dev-mode:true}")
    private boolean devMode;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otpCode) {
        // Log prominently for development and testing
        logger.info("\n==================================================");
        logger.info(" [SECURITY OTP] Destination: {}", toEmail);
        logger.info(" [SECURITY OTP CODE]: >>> {} <<< (Valid for 5 mins)", otpCode);
        logger.info("==================================================\n");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Login Verification Code - Multi-Vendor Marketplace");
            message.setText("Hello,\n\n"
                    + "Your 6-digit login verification OTP is: " + otpCode + "\n\n"
                    + "This code is valid for 5 minutes and will expire after 3 failed attempts.\n"
                    + "If you did not request this code, please ignore this email or secure your account.\n\n"
                    + "Best regards,\n"
                    + "Multi-Vendor Marketplace Security Team");

            mailSender.send(message);
            logger.info("Successfully dispatched OTP email to {}", toEmail);
        } catch (Exception e) {
            logger.warn("SMTP delivery failed (Dev mode active: OTP code is {}). Cause: {}", otpCode, e.getMessage());
        }
    }
}
