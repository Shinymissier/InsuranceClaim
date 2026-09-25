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

    @Bean
    CommandLineRunner bootstrapAdmin(UserAccountRepository users, PasswordEncoder encoder) {
        return args -> {
            if (!username.isBlank() && !password.isBlank() && !name.isBlank() && !email.isBlank()
                    && users.findByUsername(username.trim()).isEmpty()) {
                UserAccount admin = new UserAccount(username.trim(), encoder.encode(password), name.trim(), email.trim(),
                        Role.ADMIN, true, true);
                users.save(admin);
                System.out.println("Bootstrap admin account created from environment configuration.");
            }
        };
    }
}
