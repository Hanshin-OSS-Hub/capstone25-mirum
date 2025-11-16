FROM openjdk:[version]-jdk-slim AS build

WORKDIR /workspace/app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

RUN chmod +x ./gradlew

RUN ./gradlew dependencies

COPY src src

RUN ./gradlew bootjar -x test

FROM openjdk:[version]-jre-slim

WORKDIR /app

RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=build /workspace/app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
