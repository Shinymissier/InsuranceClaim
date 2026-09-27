package com.insurance.claim.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
<<<<<<< HEAD
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
=======
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
<<<<<<< HEAD

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }
=======
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}
