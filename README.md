# 🔮 SkillMatriX

> **AI-Powered Skill Gap Analysis & Career Matrix Platform**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js 15](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java 17](https://img.shields.io/badge/Java%2017-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

SkillMatriX is a full-stack platform designed to analyze technical skillsets, quantify skill gaps, and provide data-driven insights for developers and technical teams.

---

## 🌟 Key Features

* **⚡ Skill Gap Analysis**: Intelligent breakdown of existing competencies vs target job roles.
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
    └── uploads/           # File upload storage
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.x or higher)
* **npm** or **yarn** / **pnpm**
* **Java Development Kit (JDK 17)**
* **Maven** (v3.8+)

---

### 1. Frontend Setup (`frontend2`)

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

### 2. Backend Setup (`backend1`)

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
* **Backend**: Java 17, Spring Boot 3, Maven
* **Tools**: ESLint, PostCSS

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/cyber01012/SkillMatriX/issues).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
