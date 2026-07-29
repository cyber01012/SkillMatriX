
# 🔮 SkillMatriX<img width="938" height="398" alt="skillmatrix" src="https://github.com/user-attachments/assets/69f09600-2361-4bcc-adfd-63a7d98096e8" />


> **AI-Powered Skill Gap Analysis & Career Matrix Platform**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js 15](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java 17](https://img.shields.io/badge/Java%2017-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

SkillMatriX is a full-stack platform designed to analyze technical skillsets, quantify skill gaps, and provide data-driven insights for developers and technical teams, backed by a **MySQL** relational database engine.

---

## 🌟 Key Features

* **⚡ Skill Gap Analysis**: Intelligent breakdown of existing competencies vs target job roles.
* **🐬 MySQL Relational Database**: Structured database schema storing developer profiles, skill metrics, roadmaps, and historical matrix progress.
* **📊 Interactive Matrix Dashboard**: Visual representations of skill proficiencies, strengths, and areas for improvement.
* **🎯 Career Growth Roadmap**: Personalized recommendations for courses, projects, and certifications.
* **💻 Monorepo Architecture**: Clean separation between Next.js frontend (`frontend2`) and Spring Boot backend (`backend1`).

---

## 📁 Repository Structure

```
SkillMatriX/
├── frontend2/             # Next.js 15 + React 19 + TypeScript Frontend
│   ├── src/               # UI components, pages, and hooks
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies & scripts
│   └── next.config.ts     # Next.js Configuration
│
└── backend1/              # Spring Boot / Java Backend Service
    ├── skillanalyzer/     # Core Skill Analyzer engine microservice
    │   └── src/main/resources/application.properties  # MySQL DB configuration
    └── uploads/           # File upload storage
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.x or higher)
* **npm** or **yarn** / **pnpm**
* **Java Development Kit (JDK 17)**
* **MySQL Server** (v8.0+)
* **Maven** (v3.8+)

---

### 1. Database Configuration (MySQL)

Ensure MySQL is running. Configure connection settings in `backend1/skillanalyzer/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillmatrix_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

### 2. Frontend Setup (`frontend2`)

```bash
# Navigate to the frontend directory
cd frontend2

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser to view the frontend application.

---

### 3. Backend Setup (`backend1`)

```bash
# Navigate to the backend directory
cd backend1/skillanalyzer/skillanalyzer

# Build the Spring Boot application
mvn clean install

# Run the backend server
mvn spring-boot:run
```

The backend server will run on `http://localhost:8080`.

---

## 🛠️ Built With

* **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React
* **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Maven
* **Database**: MySQL Relational Database
* **Tools**: ESLint, PostCSS

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/cyber01012/SkillMatriX/issues).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

PICTURES
<img width="949" height="413" alt="skill9" src="https://github.com/user-attachments/assets/1939aced-675e-4f2d-bff2-d0ac319e1f68" />
<img width="697" height="398" alt="skill8" src="https://github.com/user-attachments/assets/7544b608-ac50-47dd-8ae0-f7ad825d7b1b" />
<img width="586" height="292" alt="skill7" src="https://github.com/user-attachments/assets/0cd94b05-4f52-4324-b9d0-346d8de5eefc" />
<img width="915" height="412" alt="skill6" src="https://github.com/user-attachments/assets/b0ae2bb3-8d61-4dfa-b392-7e2c06b5ba3d" />
<img width="931" height="350" alt="skill5" src="https://github.com/user-attachments/assets/dcfe9e41-c154-4eca-8022-e8911ff232cb" />
<img width="440" height="208" alt="skill4" src="https://github.com/user-attachments/assets/928babda-e604-4a7e-9e06-6a45c37449d7" />
<img width="940" height="401" alt="skill3" src="https://github.com/user-attachments/assets/f8c10b90-51d2-49ef-9324-e7a19d23b8ea" />
<img width="916" height="395" alt="skill2" src="https://github.com/user-attachments/assets/22eae0b0-3ea6-4d2b-8b61-b8c4af7bf800" />
<img width="938" height="398" alt="skillmatrix" src="https://github.com/user-attachments/assets/e1e9cd10-7d84-413e-996a-5f96b0540211" />
<img width="923" height="398" alt="skill10" src="https://github.com/user-attachments/assets/0523b50a-4e58-4f3e-9fb8-15fc5477e5fd" />


