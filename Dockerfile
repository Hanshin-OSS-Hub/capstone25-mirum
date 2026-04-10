FROM amazoncorretto:17-alpine-jdk AS build

WORKDIR /workspace/app

COPY backend/build.gradle backend/settings.gradle backend/gradlew ./
COPY backend/gradle gradle

RUN chmod +x ./gradlew

RUN ./gradlew dependencies

COPY backend/src src

RUN ./gradlew bootjar -x test

FROM amazoncorretto:17-alpine-jdk

WORKDIR /app

RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

COPY --from=build /workspace/app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
