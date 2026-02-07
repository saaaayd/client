# DormSync System Documentation

## Overview
DormSync is a comprehensive dormitory management system designed to streamline operations for administrators and students. This document outlines the key system integrations, technology stack, and architectural flow.

## System Integrations

### 1. Authentication & Security
*   **Google OAuth 2.0**: Handles secure user registration and login.
    *   **Frontend**: `@react-oauth/google` manages the user consent flow.
    *   **Backend**: `google-auth-library` verifies ID tokens to authenticate users.
*   **JWT (JSON Web Tokens)**: Manages secure user sessions and protects API routes.
*   **BCrypt**: Secures user passwords through hashing (`bcryptjs`).

### 2. Database
*   **MongoDB**: An unstructured database used for storing application data.
*   **Mongoose**: An Object Data Modeling (ODM) library acting as the bridge between the Node.js backend and MongoDB.

### 3. Communication
*   **Nodemailer**: A module for sending emails (SMTP).
    *   Used for sending OTPs (One-Time Passwords).
    *   Sends notifications for account approvals and rejections.

### 4. File Storage
*   **Local File System (Multer)**:
    *   Handles file uploads such as payment receipts.
    *   Files are stored locally in the `server/uploads/` directory.
    *   `uploadMiddleware.js` manages file validation and storage paths.

### 5. Frontend UI & Utilities
*   **Framework**: React 19 with Vite.
*   **Styling**: Tailwind CSS (v4) & Radix UI (for accessible primitives).
*   **Icons**: Lucide React.
*   **HTTP Client**: Axios.
*   **Utilities**: `date-fns` (dates), `sweetalert2` (notifications), `react-qr-code` (QR generation).

### 6. Backend Utilities
*   **Server**: Express.js.
*   **Security**: `helmet` (HTTP headers), `cors` (Cross-Origin Resource Sharing).
*   **Logging**: `morgan` (HTTP request logger).

## System Architecture

The following flowchart illustrates how the different components of the DormSync system interact with each other.

```mermaid
graph TD
    %% Nodes
    User([User])
    Client[Client (React/Vite)]
    Google[Google OAuth Server]
    Server[Backend API (Express)]
    AuthConn[Auth Controller]
    PayConn[Payment Controller]
    DB[(MongoDB)]
    EmailServ[Email Service (TSP)]
    LocalStore[Local Storage]

    %% Styles
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Client fill:#bbf,stroke:#333,stroke-width:2px
    style Server fill:#bfb,stroke:#333,stroke-width:2px
    style DB fill:#ff9,stroke:#333,stroke-width:2px

    %% Flow
    User -- Interacts --> Client
    
    subgraph Frontend Logic
        Client -- 1. Login/Register --> Google
        Google -- 2. Returns ID Token --> Client
        Client -- 3. Sends Token/Request --> Server
    end

    subgraph Backend Logic
        Server -- Route: /auth/google --> AuthConn
        AuthConn -- Verify Token --> Google
        AuthConn -- Create/Update User --> DB
        AuthConn -- Send Notification --> EmailServ

        Server -- Route: /payments --> PayConn
        PayConn -- Upload Receipt --> LocalStore
        PayConn -- Save Record --> DB
    end

    EmailServ -- Delivers Email --> User
```

## Data Flow Descriptions

1.  **Authentication**:
    *   The user initiates login via Google on the Client.
    *   Google returns an ID Token.
    *   Client sends this token to the Backend (`/api/auth/google`).
    *   Backend verifies the token with Google, checks the DB for the user, and issues a JWT for session access.

2.  **Payment Processing**:
    *   User submits a payment with a receipt image.
    *   `Multer` middleware intercepts the request, saves the file to disk, and passes file info to the controller.
    *   `PaymentController` creates a record in MongoDB referencing the file path (`/uploads/filename`).

3.  **Notifications**:
    *   When key events occur (e.g., Registration), the Controller calls `emailService`.
    *   `Nodemailer` sends the email via the configured SMTP transport.
