# Multi-stage Dockerfile for Insurance Claim System (Backend Directory)
# Stage 1: Build the Maven application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven POM and source code (which includes static frontend)
COPY pom.xml ./pom.xml
COPY src ./src

# Build JAR package (skipping tests)
RUN mvn clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/app.jar app.jar

# Create directory for uploads
RUN mkdir -p /app/uploads

# Set upload directory and default port
ENV APP_UPLOAD_DIR=/app/uploads
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
