# Customer CRUD Application

## 🚀 Starting the Application

This guide provides step-by-step instructions to start the **Customer CRUD** application, which includes:
- **Backend:** Laravel with Elasticsearch, running in Docker containers.
- **Frontend:** React application using Vite.
- **Services:** Nginx, MySQL, and Elasticsearch.

---

## 📋 Prerequisites

Ensure the following are installed on your machine:
- **Docker** & **Docker Compose** (for backend and services)
- **Node.js** and **npm** (for the frontend; Node.js v16+ recommended)
- **Git** (to clone the repository)

---

## 📦 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Jasonyecyec/customer_crud.git
````
### 2. Navigate to project
```bash
cd customer_crud
````

### 3. Start the Backend Services
```bash
docker-compose up -d --build
````
This starts:
- Nginx on http://localhost:80 (for API access).
- Elasticsearch on http://localhost:9200.
- The API will be accessible at http://localhost:80/api/customers.

- Verify the services are running:
```bash
   docker ps
````
-  You should see containers named api, controller, database, and searcher.

### 4. Set Up the Frontend
```bash
cd frontend
npm install
````

- Start the development server:
```bash
npm run dev
````

- The frontend will be available at http://localhost:5173.
- Open this URL in your browser to access the application.

### 5. Stopping the Application
```bash
docker-compose down
````
