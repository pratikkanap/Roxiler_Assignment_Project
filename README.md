Store Rating & Dashboard System
A premium, full-stack Store Rating and Dashboard System featuring role-based authentication and authorization, search, ratings submission, and interactive dashboards for Users, Store Owners, and System Administrators.

Built using a modern web architecture, this project allows users to search and rate stores, store owners to analyze reviews for their stores, and system administrators to manage the application and monitor overall analytics.

🚀 Technology Stack
Backend : Node.js, Express.js,
Database: PostgreSQL,
Security & Auth: JSON Web Tokens (JWT),

Frontend : 
Build Tool: Vite,
Library: React.js

🏛️ Project Architecture & File Structure
The workspace is organized into two separate modules for cleaner segregation of concerns:

<img width="840" height="521" alt="image" src="https://github.com/user-attachments/assets/ad91f588-2120-4fc1-b5fa-4a22c167f37a" />



📊 Database Schema (PostgreSQL)

The application models relationships between Users, Stores, and Ratings with built-in validation rules.

1. User Model (User.js)
id: UUID (Primary Key, Default UUIDV4)
name: String (Validated: must be between 20 and 60 characters)
email: String (Unique, validated email format)
password: String 
address: String (Validated: maximum 400 characters)
role: Enum ('Admin', 'User', 'StoreOwner')

3. Store Model (Store.js)
id: UUID (Primary Key, Default UUIDV4)
name: String (Validated: maximum 60 characters)
email: String (Unique, validated email format)
address: String (Validated: maximum 400 characters)
ownerId: UUID (Foreign Key referencing Users.id - nullable if unassigned)

5. Rating Model (Rating.js)
id: UUID (Primary Key, Default UUIDV4)
rating: Integer (Validated: range 1 to 5)
userId: UUID (Foreign Key referencing Users.id)
storeId: UUID (Foreign Key referencing Stores.id)
Constraints: Unique index on ['userId', 'storeId'] prevents multiple ratings by a single user for the same store.
