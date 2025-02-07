# eCommerce Backend

This repository contains the backend for a feature-rich eCommerce platform, built using modern technologies and best practices. The system follows the **Model-View-Controller+Service (MVCS)** architectural pattern and offers scalable, secure, and efficient operations.

## 🚀 Features

This platform supports all essential eCommerce functionalities, along with additional advanced features such as:

- **Order Tracking System** – Real-time order tracking with estimated delivery time.
- **Membership Subscription** – Subscription-based user membership with exclusive features.
- **Replenishment System** – Automated orders on predefined intervals.
- **Order Refunds** – Full refunds for unsatisfied customers.
- **User Notifications** – Real-time emails and in-app alerts for orders, payments, and promotions.
- **Ratings & Reviews** – Customers can rate and review products and the platform.
- **Advanced Data Analytics** – Insights into sales, top-performing products, customer trends, etc.
- **Report Generation** – Automated PDF reports for admins and managers.
- **Real-time Data Display** – Live updates on admin operations and critical events.
- **Customer Support (AI & Human)** – 24/7 AI chat and human support during business hours.

## 🏗️ Architecture & Design

The backend is structured using the **MVCS (Model-View-Controller+Service)** pattern:

- **Models** – Defines 13 relational entities and 8 document-based models.
- **Services** – Contains 16 business logic services for data handling and transformation.
- **Controllers** – Manages API route handling with a total of 10 controllers.
- **Routes** – Organizes endpoints into **Public**, **Protected**, and **Private** categories.
- **Middlewares** – Handles authentication, authorization, rate limiting, and validation.

## 🛠️ Technology Stack

| **Category**   | **Technology**                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Runtime**    | Node.js                                                                                                                                    |
| **Language**   | TypeScript                                                                                                                                 |
| **Framework**  | Express.js                                                                                                                                 |
| **Databases**  | MariaDB, MongoDB, Redis                                                                                                                    |
| **ORM/ODM**    | Sequelize, Mongoose                                                                                                                        |
| **Testing**    | Postman (E2E)                                                                                                                              |
| **Deployment** | Docker                                                                                                                                     |
| **Others**     | BullMQ, ElasticSearch, Socket.IO, Stripe, express-validator, express-rate-limit, Handlebars, Nodemailer, OpenRouter, Llama 3.1 8B Instruct |

## 📌 Key Implementations

### Order Tracking System

- **Tech Used:** MariaDB, Sequelize, Google Maps JS API, Socket.IO
- **Description:** Tracks live order locations and estimated delivery time.

### Membership Subscription

- **Tech Used:** Stripe Subscriptions, MongoDB, Mongoose
- **Description:** Manages user subscriptions and membership benefits.

### Replenishment System

- **Tech Used:** BullMQ, MariaDB, Redis, Stripe, Nodemailer, Handlebars
- **Description:** Automates recurring orders at user-defined intervals.

### Order Refunds

- **Tech Used:** Stripe Refunds
- **Description:** Processes full refunds while excluding third-party fees.

### User Notifications

- **Tech Used:** Nodemailer, Socket.IO
- **Description:** Sends real-time email and snackbar notifications.

### Ratings & Reviews

- **Tech Used:** MongoDB, Mongoose
- **Description:** Allows users to review products and the platform.

### Advanced Data Analytics

- **Tech Used:** MariaDB, Sequelize, MongoDB, Mongoose
- **Description:** Provides insights into sales, customer behavior, and platform metrics.

### Report Generation

- **Tech Used:** PDFKit
- **Description:** Generates detailed sales and stock reports in PDF format.

### Real-time Data Display

- **Tech Used:** Socket.IO, Redis, MariaDB, Sequelize, Stripe Webhooks
- **Description:** Streams real-time data for admin operations and critical events.

### Customer Support (AI & Human)

- **Tech Used:** Socket.IO, Redis, OpenRouter, Llama 3.1 8B Instruct
- **Description:** Provides AI-based and human-assisted support chat.

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v16+ recommended)
- **Docker** (for containerized deployment)
- **MariaDB, MongoDB, Redis** (if running without Docker)

### Steps to Run Locally

1.  Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ecommerce-backend.git
    cd ecommerce-backend
    ```
2.  Install Dependencies:
    ```sh
    npm install
    ```
    3. Configure environment variables:
    - Copy `.env.example` to `.env`.
    - Set your database credentials, Stripe API keys, and other necessary variables.
    3. Start the server:
    ```sh
    npm run dev
    ```
    Or, using Docker:
    ```sh
    docker-compose up --build
    ```

## 🧪 Testing

- API testing is done using **Postman (E2E)**
- Run test cases:

```sh
npm run test
```

## API Documentation

The API endpoints follow **RESTful conventions** and are categorized into:

- **Public APIs** (Accessible without authentication)
- **Protected APIs** (User authentication required)
- **Admin APIs** (Restricted to platform administrators)

**Full API documentation** is available in the `/docs` folder.

## 🛡️ Security & Middleware

- **Authentication & Authorization:** Uses JWT-based authentication and role-based access control (RBAC).
- **Rate Limiting:** Prevents excessive requests to protect against abuse.
- **Validation:** Ensures data integrity for incoming requests.
- **CORS Handling:** Configured for secure cross-origin access.

## 🚀 Deployment

- Containerized Deployment: Docker & Docker Compose support.
- Cloud Integration: Easily deployable on AWS, GCP, or DigitalOcean.

## License

This project is licensed under the **MIT License.**
