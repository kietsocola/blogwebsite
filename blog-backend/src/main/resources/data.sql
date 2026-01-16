-- Sample data for Blog API
-- Password for all users is: Password123

-- Insert admin user (password: Password123)
INSERT INTO users (username, email, password, role, created_at, updated_at)
VALUES ('admin', 'admin@blog.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert author user (password: Password123)
INSERT INTO users (username, email, password, role, created_at, updated_at)
VALUES ('author', 'author@blog.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'AUTHOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert categories
INSERT INTO categories (name, slug, created_at)
VALUES ('Technology', 'technology', CURRENT_TIMESTAMP);

INSERT INTO categories (name, slug, created_at)
VALUES ('Programming', 'programming', CURRENT_TIMESTAMP);

INSERT INTO categories (name, slug, created_at)
VALUES ('Lifestyle', 'lifestyle', CURRENT_TIMESTAMP);

-- Insert tags
INSERT INTO tags (name, slug, created_at)
VALUES ('Java', 'java', CURRENT_TIMESTAMP);

INSERT INTO tags (name, slug, created_at)
VALUES ('Spring Boot', 'spring-boot', CURRENT_TIMESTAMP);

INSERT INTO tags (name, slug, created_at)
VALUES ('Web Development', 'web-development', CURRENT_TIMESTAMP);

INSERT INTO tags (name, slug, created_at)
VALUES ('Tutorial', 'tutorial', CURRENT_TIMESTAMP);

-- Insert sample posts
INSERT INTO posts (title, slug, content, status, author_id, category_id, created_at, updated_at)
VALUES ('Getting Started with Spring Boot', 'getting-started-with-spring-boot', 
'Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can just run. We take an opinionated view of the Spring platform and third-party libraries so you can get started with minimum fuss. Most Spring Boot applications need minimal Spring configuration.

## Features
- Create stand-alone Spring applications
- Embed Tomcat, Jetty or Undertow directly
- Provide opinionated starter dependencies
- Provide production-ready features

## Getting Started
To get started with Spring Boot, you need to have Java installed and a build tool like Maven or Gradle. Then you can create a new project using Spring Initializr.', 
'PUBLISHED', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO posts (title, slug, content, status, author_id, category_id, created_at, updated_at)
VALUES ('Introduction to REST APIs', 'introduction-to-rest-apis', 
'REST (Representational State Transfer) is an architectural style for designing networked applications. It relies on a stateless, client-server, cacheable communications protocol -- and in virtually all cases, the HTTP protocol is used.

## Key Principles
- Stateless: Each request from client to server must contain all the information needed
- Client-Server: Separation of concerns
- Cacheable: Responses must define themselves as cacheable or not
- Uniform Interface: Simplifies and decouples the architecture

## HTTP Methods
- GET: Retrieve data
- POST: Create new resources
- PUT: Update existing resources
- DELETE: Remove resources', 
'PUBLISHED', 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO posts (title, slug, content, status, author_id, category_id, created_at, updated_at)
VALUES ('Draft Post Example', 'draft-post-example', 
'This is a draft post that is not published yet. It contains some placeholder content that will be edited before publication. Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 
'DRAFT', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Link posts with tags
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 1);
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 2);
INSERT INTO post_tags (post_id, tag_id) VALUES (1, 4);
INSERT INTO post_tags (post_id, tag_id) VALUES (2, 3);
INSERT INTO post_tags (post_id, tag_id) VALUES (2, 4);
