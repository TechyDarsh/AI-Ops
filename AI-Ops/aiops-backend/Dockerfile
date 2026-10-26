# ========================================================
# Dockerfile: Spring Boot Backend Service (Port 8080)
# ========================================================
FROM maven:3.9-eclipse-temurin-22-alpine AS build

WORKDIR /app

# Copy pom.xml and source code
COPY . .

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage using OpenJDK 22
FROM eclipse-temurin:22-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
