package com.mvecm.config;

import com.mvecm.entity.Role;
import com.mvecm.entity.User;
import com.mvecm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check or initialize Admin user
            userRepository.findByEmail("admin@mvecm.com").ifPresentOrElse(admin -> {
                // Ensure correct password hash
                if (!passwordEncoder.matches("Admin@123", admin.getPassword())) {
                    admin.setPassword(passwordEncoder.encode("Admin@123"));
                    admin.setRole(Role.ADMIN);
                    admin.setVerified(true);
                    admin.setBlocked(false);
                    userRepository.save(admin);
                    logger.info("Updated admin password hash for admin@mvecm.com");
                }
            }, () -> {
                User admin = new User();
                admin.setName("Admin Manager");
                admin.setEmail("admin@mvecm.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setPhone("+1-800-555-0199");
                admin.setVerified(true);
                admin.setBlocked(false);
                userRepository.save(admin);
                logger.info("Bootstrapped default ADMIN user: admin@mvecm.com / Admin@123");
            });

            // Check or initialize Demo Customer
            userRepository.findByEmail("customer@example.com").ifPresentOrElse(customer -> {
                if (!passwordEncoder.matches("Customer@123", customer.getPassword())) {
                    customer.setPassword(passwordEncoder.encode("Customer@123"));
                    customer.setRole(Role.USER);
                    customer.setVerified(true);
                    customer.setBlocked(false);
                    userRepository.save(customer);
                    logger.info("Updated customer password hash for customer@example.com");
                }
            }, () -> {
                User customer = new User();
                customer.setName("John Customer");
                customer.setEmail("customer@example.com");
                customer.setPassword(passwordEncoder.encode("Customer@123"));
                customer.setRole(Role.USER);
                customer.setPhone("+1-800-555-0100");
                customer.setVerified(true);
                customer.setBlocked(false);
                userRepository.save(customer);
                logger.info("Bootstrapped default CUSTOMER user: customer@example.com / Customer@123");
            });
        };
    }
}
