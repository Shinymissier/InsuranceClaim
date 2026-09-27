package com.insurance.claim.config;

import com.insurance.claim.model.Role;
import com.insurance.claim.model.UserAccount;
import com.insurance.claim.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Value("${app.bootstrap-admin.username:}") private String username;
    @Value("${app.bootstrap-admin.password:}") private String password;
    @Value("${app.bootstrap-admin.name:}") private String name;
    @Value("${app.bootstrap-admin.email:}") private String email;

<<<<<<< HEAD
    // Fallback dev credentials used when no env vars are configured
    private static final String DEV_USERNAME = "admin";
    private static final String DEV_PASSWORD = "Admin@1234";
    private static final String DEV_NAME     = "System Administrator";
    private static final String DEV_EMAIL    = "admin@localhost.dev";

    @Bean
    CommandLineRunner bootstrapAdmin(UserAccountRepository users, PasswordEncoder encoder) {
        return args -> {
            // Use env-configured credentials if all four are supplied
            if (!username.isBlank() && !password.isBlank() && !name.isBlank() && !email.isBlank()) {
                if (users.findByUsername(username.trim()).isEmpty()) {
                    UserAccount admin = new UserAccount(username.trim(), encoder.encode(password),
                            name.trim(), email.trim(), Role.ADMIN, true, true);
                    users.save(admin);
                    System.out.println("[DataSeeder] Admin account created from environment configuration: " + username.trim());
                }
                return;
            }

            // Fallback: ensure a default dev admin always exists
            if (users.findByUsername(DEV_USERNAME).isEmpty()) {
                UserAccount admin = new UserAccount(DEV_USERNAME, encoder.encode(DEV_PASSWORD),
                        DEV_NAME, DEV_EMAIL, Role.ADMIN, true, true);
                users.save(admin);
                System.out.println("=================================================================");
                System.out.println("[DataSeeder] DEFAULT DEV ADMIN CREATED");
                System.out.println("  Username : " + DEV_USERNAME);
                System.out.println("  Password : " + DEV_PASSWORD);
                System.out.println("  WARNING  : Set BOOTSTRAP_ADMIN_* env vars for production use.");
                System.out.println("=================================================================");
=======
    @Bean
    CommandLineRunner bootstrapAdmin(UserAccountRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!username.isBlank() && !password.isBlank() && !name.isBlank() && !email.isBlank()
                    && users.findByUsername(username.trim()).isEmpty()) {
                UserAccount admin = new UserAccount(username.trim(), encoder.encode(password), name.trim(), email.trim(),
                        Role.ADMIN, true, true);
                users.save(admin);
                System.out.println("Bootstrap admin account created from environment configuration.");
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
            }
        };
    }
}
