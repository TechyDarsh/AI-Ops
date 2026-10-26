# ========================================================
# Dockerfile: Spring Boot Backend Service (Port 8080)
# ========================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build the Spring Boot application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
