# Blog API - Spring Boot Backend

A RESTful API for a blog application built with Spring Boot.

## Tech Stack

- Java 17
- Spring Boot 3.2.1
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL (production) / H2 (development)
- Swagger/OpenAPI for documentation

## Getting Started

### Prerequisites

- JDK 17+
- Maven 3.6+

### Running locally (H2 Database)

```bash
cd blog-backend
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

### Running with PostgreSQL

1. Create a PostgreSQL database
2. Set environment variables:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/blogdb
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export JWT_SECRET=your-256-bit-secret-key-min-32-characters
export CORS_ORIGINS=http://localhost:3000
```

3. Run with prod profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## API Documentation

Swagger UI: http://localhost:8080/swagger-ui.html

## Default Users (Development)

| Username | Email | Password | Role |
|----------|-------|----------|------|
| admin | admin@blog.com | Password123 | ADMIN |
| author | author@blog.com | Password123 | AUTHOR |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Posts (Public)
- `GET /api/posts` - List published posts
- `GET /api/posts/{slug}` - Get post detail
- `GET /api/posts/search?q={keyword}` - Search posts

### Posts (Authenticated)
- `GET /api/posts/my` - List my posts
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Categories (Public)
- `GET /api/categories` - List categories
- `GET /api/categories/{slug}/posts` - Posts by category

### Categories (Admin)
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Tags (Public)
- `GET /api/tags` - List tags
- `GET /api/tags/{slug}/posts` - Posts by tag

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - List users
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/posts` - All posts (admin view)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_URL | Database JDBC URL | H2 in-memory |
| DB_USERNAME | Database username | sa |
| DB_PASSWORD | Database password | (empty) |
| JWT_SECRET | JWT signing key (min 32 chars) | default-dev-key |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |

## Project Structure

```
src/main/java/com/blog/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/             # Request/Response DTOs
│   ├── request/
│   └── response/
├── entity/          # JPA entities
├── exception/       # Exception handling
├── repository/      # JPA repositories
├── security/        # JWT & Security
├── service/         # Business logic
└── BlogApplication.java
```
