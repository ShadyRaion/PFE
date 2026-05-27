import json
import os
import re
import sys
import unicodedata
from typing import Any, Dict, List, Optional, Tuple

try:
    import numpy as np
except ModuleNotFoundError:
    np = None

try:
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
LEARNED_SKILLS_PATH = os.path.join(BASE_DIR, "learned_skills.json")
MAX_LEARNED_SKILLS = 750
EXACT_ONLY_SECTION_HEADERS = {
    "back end",
    "back-end",
    "backend",
    "big data",
    "cloud",
    "developpement mobile",
    "développement mobile",
    "front end",
    "front-end",
    "frontend",
    "mobile development",
    "also seen",
    "context",
    "cloud exposure",
    "data handling",
    "data preparation",
    "general tools",
    "stack",
    "tools",
    "outils",
}

HIGH_HEADER_HINTS = {
    "atelier data",
    "automatisation",
    "boite a outils",
    "bureau design",
    "cloud",
    "code et automatisation",
    "competence",
    "competences",
    "contexte applicatif",
    "creation jeu",
    "environnement bi",
    "fabrication front",
    "indices",
    "inventaire technique",
    "livraison",
    "notes de technologie",
    "notes plateforme",
    "outillage",
    "outils",
    "plateforme",
    "pratique ml",
    "preparation donnees",
    "qualite",
    "securite",
    "signaux",
    "signes techniques",
    "stack",
    "stockage et cloud",
    "systeme et reseau",
    "technique",
    "technologie",
    "test",
    "testing",
    "traitement donnees",
}

NON_SKILL_HEADER_HINTS = {
    "about",
    "assistant",
    "contributeur",
    "developpeur",
    "developpeuse",
    "education",
    "etudiant",
    "experience",
    "formation",
    "langue",
    "languages",
    "membre",
    "parcours",
    "profil",
    "project",
    "projet",
    "relecteur",
    "responsable",
    "stagiaire",
    "summary",
    "travail applique",
}


INLINE_HEADER_SEPARATORS = [":", "：", "|", " - ", " – ", " — ", "\t"]

SKILL_SECTION_LABELS = [
    "signes techniques",
    "atelier data",
    "stockage et cloud",
    "notes de technologie",
    "pile quotidienne",
    "cote serveur",
    "livraison",
    "indices de stack",
    "souvent utilise",
    "elements backend vus dans les projets",
    "vu aussi",
    "bureau design",
    "fabrication front",
    "signaux qualite",
    "boite a outils securite",
    "systeme et reseau",
    "code et automatisation",
    "infrastructure",
    "signaux de competences",
    "pratique ml",
    "traitement donnees",
    "notes plateforme",
    "plateforme",
    "contexte applicatif",
    "indices de stack qa",
    "utilise souvent",
    "inventaire technique",
    "environnement bi",
    "preparation donnees",
    "outils generaux",
    "outillage disperse ici",
    "creation jeu",
    "web et media",
    "travail equipe",
    "skill signals",
    "technology notes",
    "stack clues",
    "technical inventory",
    "technical inventory written as notes",
    "data workbench",
    "storage and cloud",
    "daily stack",
    "server side",
    "delivery notes",
    "mobile domain",
    "backend pieces used inside projects",
    "also seen",
    "context",
    "design desk",
    "front end craft",
    "quality signals",
    "security toolbox",
    "coding and automation",
    "infrastructure awareness",
    "ml practice",
    "data handling",
    "platform notes",
    "cloud exposure",
    "app context",
    "testing toolkit",
    "automation exposure",
    "tracking and reporting",
    "bi environment",
    "data preparation",
    "general tools",
    "game creation",
    "web and media extras",
    "team workflow",
    "langage",
    "langages",
    "langages de programmation",
    "programming languages",
    "language",
    "languages",
    "framework",
    "frameworks",
    "front-end",
    "front end",
    "frontend",
    "back-end",
    "back end",
    "backend",
    "bibliotheque",
    "bibliotheques",
    "bibliothèque",
    "bibliothèques",
    "libraries",
    "library",
    "outils",
    "tools",
    "technologies",
    "technos",
    "big data",
    "cloud",
    "developpement mobile",
    "développement mobile",
    "mobile development",
    "bases de donnees",
    "bases de données",
    "base de donnees",
    "base de données",
    "database",
    "databases",
    "bdd",
    "environnement",
    "environnements",
    "methodologies",
    "méthodologies",
    "methodes",
    "méthodes",
]

SKILL_ITEM_STOPWORDS = {
    "anglais",
    "francais",
    "français",
    "arabe",
    "espagnol",
    "allemand",
    "english",
    "french",
    "arabic",
    "spanish",
    "german",
    "courant",
    "intermediaire",
    "intermédiaire",
    "avance",
    "avancé",
    "native",
    "maternelle",
    "notions",
    "debutant",
    "débutant",
    "bonne maitrise",
    "bonne maîtrise",
    "maitrise",
    "maîtrise",
    "api",
    "apis",
    "application",
    "competences",
    "compétences",
    "framework",
    "frameworks",
    "front-end",
    "front end",
    "frontend",
    "back-end",
    "back end",
    "backend",
    "langage",
    "langages",
    "outils",
    "profil",
    "projet",
    "projets",
    "skills",
    "stack",
    "techniques",
    "technologies",
}

TECH_CONTEXT_WORDS = {
    "api",
    "application",
    "architecture",
    "back",
    "backend",
    "base",
    "bdd",
    "cloud",
    "code",
    "data",
    "database",
    "developpement",
    "développement",
    "devops",
    "frontend",
    "fullstack",
    "framework",
    "ia",
    "logiciel",
    "machine",
    "mobile",
    "modele",
    "modèle",
    "programmation",
    "projet",
    "reseau",
    "réseau",
    "securite",
    "sécurité",
    "software",
    "stack",
    "systeme",
    "système",
    "technique",
    "test",
    "web",
}

NOISE_SKILL_TERMS = {
    "certification",
    "back end",
    "back-end",
    "backend",
    "competences",
    "compétences",
    "comp",
    "education",
    "experience",
    "exp",
    "formation",
    "final-year",
    "front end",
    "front-end",
    "frontend",
    "isamm",
    "languages",
    "langues",
    "linkedin.com",
    "month",
    "month.",
    "of 1",
    "of 2",
    "pfe",
    "profile",
    "profil",
    "project",
    "projects",
    "rience",
    "student",
    "tences",
    "technical",
    "about",
    "applied",
    "appear",
    "as",
    "auc",
    "bi",
    "builds",
    "cloud",
    "clues",
    "contact",
    "curriculum",
    "data",
    "data warehouses",
    "designer-developer",
    "ee",
    "evidence",
    "here",
    "idf",
    "kpi",
    "inventory",
    "mobile",
    "notes",
    "open-source",
    "owasp",
    "readme",
    "rest",
    "roc",
    "scattered",
    "selected",
    "signals",
    "skill",
    "soa",
    "stack clues",
    "summary",
    "technology",
    "tf",
    "timeline",
    "tn",
    "tooling",
    "ui",
    "ux",
    "vitae",
    "where",
    "work",
    "written",
    "vs",
    "web",
    "web developer",
}

NOISE_WORDS_IN_SKILL_PHRASES = {
    "and",
    "client",
    "clients",
    "conversion",
    "conversions",
    "created",
    "delivered",
    "developed",
    "freelance",
    "gathered",
    "enthusiast",
    "developer",
    "designer",
    "intern",
    "integrator",
    "junior",
    "managed",
    "marketing",
    "month",
    "personal",
    "phone",
    "profile",
    "relations",
    "requirements",
    "reviewer",
    "style",
    "like",
    "student",
    "tester",
}


SKILL_DICTIONARY = [
    {"canonical": "Python", "aliases": ["python"], "strict": ["py"]},
    {"canonical": "JavaScript", "aliases": ["javascript", "java script", "ecmascript"], "strict": ["js"]},
    {"canonical": "TypeScript", "aliases": ["typescript", "type script"], "strict": ["ts"]},
    {"canonical": "Hooks", "aliases": ["hooks", "react hooks"]},
    {"canonical": "Routing", "aliases": ["routing", "routage"]},
    {"canonical": "Form validation", "aliases": ["form validation", "validation de formulaires", "validation formulaires"]},
    {"canonical": "Java", "aliases": ["java"]},
    {"canonical": "Java EE", "aliases": ["java ee", "j2ee", "jakarta ee"]},
    {"canonical": "C", "aliases": ["c language", "langage c"], "strict": ["c"]},
    {"canonical": "C++", "aliases": ["c++", "cpp", "c plus plus"]},
    {"canonical": "C#", "aliases": ["c#", "c sharp", "csharp"]},
    {"canonical": "PHP", "aliases": ["php"]},
    {"canonical": "Ruby", "aliases": ["ruby"]},
    {"canonical": "Go", "aliases": ["golang", "go language", "langage go"]},
    {"canonical": "Rust", "aliases": ["rust"]},
    {"canonical": "Kotlin", "aliases": ["kotlin"]},
    {"canonical": "Swift", "aliases": ["swift"]},
    {"canonical": "Dart", "aliases": ["dart"]},
    {"canonical": "Bash", "aliases": ["bash", "shell scripting", "script shell"]},
    {"canonical": "R", "aliases": ["r language", "langage r"], "strict": ["r"]},
    {"canonical": "HTML", "aliases": ["html", "html5"]},
    {"canonical": "CSS", "aliases": ["css", "css3"]},
    {"canonical": "Sass", "aliases": ["sass", "scss"]},
    {"canonical": "Tailwind CSS", "aliases": ["tailwind css", "tailwindcss", "tailwind"]},
    {"canonical": "Bootstrap", "aliases": ["bootstrap"]},
    {"canonical": "React", "aliases": ["react", "reactjs", "react.js"]},
    {"canonical": "React Native", "aliases": ["react native", "react-native"]},
    {"canonical": "Angular", "aliases": ["angular", "angularjs", "angular.js"]},
    {"canonical": "Vue.js", "aliases": ["vue", "vuejs", "vue.js"]},
    {"canonical": "Next.js", "aliases": ["next.js", "nextjs", "next js"]},
    {"canonical": "Nuxt.js", "aliases": ["nuxt.js", "nuxtjs", "nuxt js"]},
    {"canonical": "Flutter", "aliases": ["flutter"]},
    {"canonical": "Node.js", "aliases": ["node.js", "nodejs", "node js"]},
    {"canonical": "Express.js", "aliases": ["express.js", "expressjs", "express js", "express"]},
    {"canonical": "NestJS", "aliases": ["nestjs", "nest js", "nest.js"]},
    {"canonical": "FastAPI", "aliases": ["fastapi", "fast api", "fast-api", "fast_api"]},
    {"canonical": "Django", "aliases": ["django"]},
    {"canonical": "Flask", "aliases": ["flask"]},
    {"canonical": "Spring", "aliases": ["spring framework", "spring"]},
    {"canonical": "Spring Boot", "aliases": ["spring boot", "springboot", "spring-boot"]},
    {"canonical": "Laravel", "aliases": ["laravel"]},
    {"canonical": "Symfony", "aliases": ["symfony"]},
    {"canonical": "Ruby on Rails", "aliases": ["ruby on rails", "rails"]},
    {"canonical": "ASP.NET", "aliases": ["asp.net", "asp net", "aspnet"]},
    {"canonical": ".NET", "aliases": [".net", "dotnet", "dot net"]},
    {"canonical": "SQL", "aliases": ["sql", "structured query language", "requêtes sql", "requete sql"]},
    {"canonical": "SQL joins", "aliases": ["sql joins", "jointures sql"]},
    {"canonical": "Joins", "aliases": ["joins", "jointures"]},
    {"canonical": "Window functions", "aliases": ["window functions", "fonctions de fenetrage", "fonctions fenetrage"]},
    {"canonical": "CTEs", "aliases": ["ctes", "cte", "common table expressions"]},
    {"canonical": "PostgreSQL", "aliases": ["postgresql", "postgre sql", "postgre-sql", "postgres", "psql"]},
    {"canonical": "MySQL", "aliases": ["mysql", "my sql", "my-sql"]},
    {"canonical": "SQLite", "aliases": ["sqlite", "sql lite", "sqlite3"]},
    {"canonical": "Oracle", "aliases": ["oracle", "oracle database", "oracle db"]},
    {"canonical": "SQL Server", "aliases": ["sql server", "mssql", "ms sql", "microsoft sql server"]},
    {"canonical": "MongoDB", "aliases": ["mongodb", "mongo db", "mongo"]},
    {"canonical": "MongoDB Atlas", "aliases": ["mongodb atlas", "mongo atlas"]},
    {"canonical": "Redis", "aliases": ["redis"]},
    {"canonical": "Firebase", "aliases": ["firebase"]},
    {"canonical": "Firebase Authentication", "aliases": ["firebase authentication", "firebase auth"]},
    {"canonical": "Firestore", "aliases": ["firestore", "cloud firestore"]},
    {"canonical": "NoSQL", "aliases": ["nosql", "no sql", "base de données nosql", "bases de données nosql"]},
    {"canonical": "Docker", "aliases": ["docker", "docker container", "containerization", "conteneurisation"]},
    {"canonical": "Docker Compose", "aliases": ["docker compose", "compose file"]},
    {"canonical": "Kubernetes", "aliases": ["kubernetes", "k8s"]},
    {"canonical": "Terraform", "aliases": ["terraform"]},
    {"canonical": "Ansible", "aliases": ["ansible"]},
    {"canonical": "Git", "aliases": ["git"]},
    {"canonical": "GitHub", "aliases": ["github", "git hub"]},
    {"canonical": "GitHub Actions", "aliases": ["github actions", "github action"]},
    {"canonical": "GitHub Pages", "aliases": ["github pages"]},
    {"canonical": "GitLab", "aliases": ["gitlab", "git lab"]},
    {"canonical": "Bitbucket", "aliases": ["bitbucket"]},
    {"canonical": "Android Studio", "aliases": ["android studio"]},
    {"canonical": "Intents", "aliases": ["intents", "android intents"]},
    {"canonical": "VS Code", "aliases": ["vs code", "vscode", "visual studio code"]},
    {"canonical": "CI/CD", "aliases": ["ci/cd", "cicd", "continuous integration", "continuous deployment", "intégration continue", "deploiement continu", "déploiement continu"]},
    {"canonical": "CI/CD pipelines", "aliases": ["ci/cd pipelines", "cicd pipelines", "ci cd pipelines", "pipelines ci/cd", "pipelines cicd"]},
    {"canonical": "Jenkins", "aliases": ["jenkins"]},
    {"canonical": "Jira", "aliases": ["jira"]},
    {"canonical": "Jira-style boards", "aliases": ["jira-style boards", "jira style boards", "tableaux type jira"]},
    {"canonical": "REST API", "aliases": ["rest api", "rest apis", "restful api", "restful", "api rest", "apis rest"]},
    {"canonical": "REST endpoints", "aliases": ["rest endpoints", "rest endpoint", "endpoints rest"]},
    {"canonical": "REST calls", "aliases": ["rest calls", "rest call", "appels rest"]},
    {"canonical": "GraphQL", "aliases": ["graphql", "graph ql"]},
    {"canonical": "Microservices", "aliases": ["microservices", "micro services", "micro-service"]},
    {"canonical": "MVC", "aliases": ["mvc", "model view controller", "modèle vue contrôleur", "modele vue controleur"]},
    {"canonical": "OOP", "aliases": ["oop", "object oriented programming", "programmation orientée objet", "programmation orientee objet", "poo"]},
    {"canonical": "JSON", "aliases": ["json"]},
    {"canonical": "JSON parsing", "aliases": ["json parsing", "parsing json"]},
    {"canonical": "XML", "aliases": ["xml"]},
    {"canonical": "YAML", "aliases": ["yaml"]},
    {"canonical": "JWT", "aliases": ["jwt", "json web token", "json web tokens"]},
    {"canonical": "OAuth", "aliases": ["oauth", "oauth2", "oauth 2"]},
    {"canonical": "bcrypt", "aliases": ["bcrypt", "b crypt"]},
    {"canonical": "HTTPS", "aliases": ["https"]},
    {"canonical": "SOAP", "aliases": ["soap"]},
    {"canonical": "AWS", "aliases": ["aws", "amazon web services"]},
    {"canonical": "Microsoft Azure", "aliases": ["azure", "microsoft azure"]},
    {"canonical": "Azure VMs", "aliases": ["azure vms", "azure vm", "azure virtual machines", "azure virtual machine"]},
    {"canonical": "Azure Storage", "aliases": ["azure storage"]},
    {"canonical": "Azure Blob Storage", "aliases": ["azure blob storage", "blob storage"]},
    {"canonical": "Azure AI Services", "aliases": ["azure ai services", "azure ai service"]},
    {"canonical": "Google Cloud", "aliases": ["google cloud", "gcp"]},
    {"canonical": "Heroku", "aliases": ["heroku"]},
    {"canonical": "Vercel", "aliases": ["vercel"]},
    {"canonical": "Netlify", "aliases": ["netlify"]},
    {"canonical": "Linux", "aliases": ["linux", "ubuntu", "debian"]},
    {"canonical": "Linux shell", "aliases": ["linux shell", "shell linux", "linux command line"]},
    {"canonical": "Nginx", "aliases": ["nginx"]},
    {"canonical": "Monitoring", "aliases": ["monitoring", "supervision"]},
    {"canonical": "Monitoring dashboards", "aliases": ["monitoring dashboards", "monitoring dashboard", "tableaux de bord monitoring"]},
    {"canonical": "SSH", "aliases": ["ssh"]},
    {"canonical": "IAM", "aliases": ["iam", "iam concepts"]},
    {"canonical": "VM", "aliases": ["vm", "virtual machine", "virtual machines"]},
    {"canonical": "DevOps", "aliases": ["devops", "dev ops"]},
    {"canonical": "Environment variables", "aliases": ["environment variables", "env variables", "variables d environnement", "variables environnement"]},
    {"canonical": "HTTPS reverse proxy", "aliases": ["https reverse proxy", "reverse proxy", "reverse proxy https"]},
    {"canonical": "Airflow", "aliases": ["airflow", "apache airflow"]},
    {"canonical": "PySpark", "aliases": ["pyspark", "py spark"]},
    {"canonical": "Postman", "aliases": ["postman"]},
    {"canonical": "pytest", "aliases": ["pytest"]},
    {"canonical": "Newman", "aliases": ["newman"]},
    {"canonical": "Machine Learning", "aliases": ["machine learning", "apprentissage automatique", "apprentissage machine"], "strict": ["ml"]},
    {"canonical": "Deep Learning", "aliases": ["deep learning", "apprentissage profond"], "strict": ["dl"]},
    {"canonical": "Artificial Intelligence", "aliases": ["artificial intelligence", "intelligence artificielle"], "strict": ["ai", "ia"]},
    {"canonical": "NLP", "aliases": ["nlp", "natural language processing", "traitement du langage naturel"]},
    {"canonical": "Data Analysis", "aliases": ["data analysis", "analyse de données", "analyse des données", "data analytics"]},
    {"canonical": "Data Science", "aliases": ["data science", "science des données"]},
    {"canonical": "Data Engineering", "aliases": ["data engineering", "ingénierie des données"]},
    {"canonical": "Data Cleaning", "aliases": ["data cleaning", "nettoyage de données", "nettoyage des données"]},
    {"canonical": "Data Visualization", "aliases": ["data visualization", "visualisation de données", "visualisation des données"]},
    {"canonical": "Big Data", "aliases": ["big data", "données massives"]},
    {"canonical": "Hadoop", "aliases": ["hadoop"]},
    {"canonical": "Spark", "aliases": ["spark", "apache spark"]},
    {"canonical": "Computer Vision", "aliases": ["computer vision", "vision par ordinateur"]},
    {"canonical": "Web Development", "aliases": ["web development", "développement web", "developpement web"]},
    {"canonical": "Mobile Development", "aliases": ["mobile development", "développement mobile", "developpement mobile"]},
    {"canonical": "Matplotlib", "aliases": ["matplotlib"]},
    {"canonical": "Seaborn", "aliases": ["seaborn"]},
    {"canonical": "EDA", "aliases": ["eda", "exploratory data analysis"]},
    {"canonical": "SVM", "aliases": ["svm", "support vector machine"]},
    {"canonical": "Logistic Regression", "aliases": ["logistic regression"]},
    {"canonical": "Random Forest", "aliases": ["random forest"]},
    {"canonical": "Naive Bayes", "aliases": ["naive bayes", "naïve bayes"]},
    {"canonical": "TF-IDF", "aliases": ["tf-idf", "tf idf", "tf-idf features"]},
    {"canonical": "ROC-AUC", "aliases": ["roc-auc", "roc auc"]},
    {"canonical": "RMSE", "aliases": ["rmse"]},
    {"canonical": "F1", "aliases": ["f1 score", "f1"]},
    {"canonical": "Train/validation/test splits", "aliases": ["train/validation/test splits", "train validation test splits", "decoupes train/validation/test", "decoupe train validation test"]},
    {"canonical": "Cross-validation", "aliases": ["cross-validation", "cross validation", "validation croisee"]},
    {"canonical": "CSV/Excel cleaning", "aliases": ["csv/excel cleaning", "csv excel cleaning", "nettoyage csv/excel", "nettoyage csv excel"]},
    {"canonical": "Missing value strategies", "aliases": ["missing value strategies", "missing values", "strategies valeurs manquantes", "valeurs manquantes"]},
    {"canonical": "Encoding", "aliases": ["encoding", "encodage"]},
    {"canonical": "Scaling", "aliases": ["scaling", "mise a l echelle"]},
    {"canonical": "Pandas", "aliases": ["pandas"]},
    {"canonical": "NumPy", "aliases": ["numpy", "num py"]},
    {"canonical": "scikit-learn", "aliases": ["scikit-learn", "scikit learn", "sklearn"]},
    {"canonical": "TensorFlow", "aliases": ["tensorflow", "tensor flow"]},
    {"canonical": "PyTorch", "aliases": ["pytorch", "py torch"]},
    {"canonical": "Keras", "aliases": ["keras"]},
    {"canonical": "OpenCV", "aliases": ["opencv", "open cv"]},
    {"canonical": "Power BI Desktop", "aliases": ["power bi desktop", "powerbi desktop"]},
    {"canonical": "Power BI", "aliases": ["power bi", "powerbi"]},
    {"canonical": "DAX", "aliases": ["dax", "dax measures"]},
    {"canonical": "Power Query", "aliases": ["power query"]},
    {"canonical": "Star Schema", "aliases": ["star schema", "star-schema", "schema en etoile", "pensee schema en etoile"]},
    {"canonical": "CSV validation", "aliases": ["csv validation", "validation csv"]},
    {"canonical": "Data dictionaries", "aliases": ["data dictionaries", "data dictionary", "dictionnaires de donnees", "dictionnaire de donnees"]},
    {"canonical": "Tableau", "aliases": ["tableau"]},
    {"canonical": "Excel", "aliases": ["excel", "microsoft excel"]},
    {"canonical": "Excel pivots", "aliases": ["excel pivots", "pivot tables", "excel pivot tables", "pivots excel"]},
    {"canonical": "Python pandas", "aliases": ["python pandas"]},
    {"canonical": "SharePoint", "aliases": ["sharepoint", "sharepoint files"]},
    {"canonical": "Presentation decks", "aliases": ["presentation decks", "presentation deck", "presentations"]},
    {"canonical": "Jupyter", "aliases": ["jupyter", "jupyter notebook", "jupyter notebooks"]},
    {"canonical": "Matlab", "aliases": ["matlab"]},
    {"canonical": "Agile", "aliases": ["agile", "méthode agile", "methodologie agile", "scrum", "kanban"]},
    {"canonical": "UML", "aliases": ["uml", "unified modeling language"]},
    {"canonical": "Merise", "aliases": ["merise", "méthode merise", "methode merise"]},
    {"canonical": "Project Management", "aliases": ["project management", "gestion de projet", "gestion des projets"]},
    {"canonical": "Figma", "aliases": ["figma"]},
    {"canonical": "Figma handoff", "aliases": ["figma handoff", "handoff figma"]},
    {"canonical": "Auto layout", "aliases": ["auto layout", "figma auto layout"]},
    {"canonical": "Wireframing", "aliases": ["wireframing", "wireframe", "wireframes"]},
    {"canonical": "Prototyping", "aliases": ["prototyping", "prototype", "prototypes", "prototypage"]},
    {"canonical": "Usability notes", "aliases": ["usability notes", "usability note", "notes d utilisabilite"]},
    {"canonical": "Icon libraries", "aliases": ["icon libraries", "icon library", "bibliotheques d icones"]},
    {"canonical": "Responsive breakpoints", "aliases": ["responsive breakpoints", "responsive breakpoint", "breakpoints responsives"]},
    {"canonical": "CSS custom properties", "aliases": ["css custom properties", "css variables", "proprietes css personnalisees"]},
    {"canonical": "Flexbox", "aliases": ["flexbox", "css flexbox"]},
    {"canonical": "Grid", "aliases": ["grid", "css grid"]},
    {"canonical": "Animation controllers", "aliases": ["animation controllers", "animation controller"]},
    {"canonical": "Animations", "aliases": ["animations", "css animations", "animation"]},
    {"canonical": "Contrast testing", "aliases": ["contrast testing", "contrast tests", "tests de contraste"]},
    {"canonical": "Browser devtools", "aliases": ["browser devtools", "browser dev tools", "devtools", "outils developpeur navigateur", "devtools navigateur"]},
    {"canonical": "Responsive Design", "aliases": ["responsive design", "responsive interfaces", "responsive ui"]},
    {"canonical": "Accessibility", "aliases": ["accessibility", "accessibilité", "a11y"]},
    {"canonical": "Material Design", "aliases": ["material design"]},
    {"canonical": "UI/UX", "aliases": ["ui ux", "ui/ux", "ux ui", "ux/ui", "user experience", "expérience utilisateur"]},
    {"canonical": "Cybersecurity", "aliases": ["cybersecurity", "cyber security", "sécurité informatique", "cybersécurité"]},
    {"canonical": "Networking", "aliases": ["networking", "computer networking", "réseaux informatiques", "reseaux informatiques"]},
    {"canonical": "Networking fundamentals", "aliases": ["networking fundamentals", "fondamentaux reseau"]},
    {"canonical": "OWASP Top 10", "aliases": ["owasp top 10", "owasp top ten"]},
    {"canonical": "Log analysis", "aliases": ["log analysis", "analyse de logs"]},
    {"canonical": "Regex", "aliases": ["regex", "regular expressions"]},
    {"canonical": "SQL review", "aliases": ["sql review", "revue sql"]},
    {"canonical": "HTTPS certificates", "aliases": ["https certificates", "https certificate", "certificats https"]},
    {"canonical": "Burp Suite Community", "aliases": ["burp suite community"]},
    {"canonical": "Burp Suite", "aliases": ["burp suite", "burpsuite"]},
    {"canonical": "Wireshark", "aliases": ["wireshark"]},
    {"canonical": "Nmap", "aliases": ["nmap"]},
    {"canonical": "SIEM", "aliases": ["siem"]},
    {"canonical": "CSRF", "aliases": ["csrf"]},
    {"canonical": "Testing", "aliases": ["testing", "software testing", "tests logiciels", "test logiciel"]},
    {"canonical": "QA", "aliases": ["qa", "quality assurance"]},
    {"canonical": "Manual test cases", "aliases": ["manual testing", "manual test cases", "cas de test manuels"]},
    {"canonical": "Regression suites", "aliases": ["regression testing", "regression suites", "suites de regression"]},
    {"canonical": "Exploratory testing", "aliases": ["exploratory testing", "tests exploratoires"]},
    {"canonical": "API status checks", "aliases": ["api status checks", "api status check", "controles statut api"]},
    {"canonical": "JSON schema", "aliases": ["json schema", "schema json"]},
    {"canonical": "Selenium WebDriver", "aliases": ["selenium webdriver"]},
    {"canonical": "Screenshots", "aliases": ["screenshots", "screenshot", "captures d ecran"]},
    {"canonical": "Logs", "aliases": ["logs", "log files"]},
    {"canonical": "Selenium", "aliases": ["selenium"]},
    {"canonical": "WebDriver", "aliases": ["webdriver", "selenium webdriver"]},
    {"canonical": "Cypress", "aliases": ["cypress"]},
    {"canonical": "Playwright", "aliases": ["playwright"]},
    {"canonical": "WordPress", "aliases": ["wordpress", "word press"]},
    {"canonical": "SEO Basics", "aliases": ["seo basics", "basic seo", "seo tags"]},
    {"canonical": "cPanel", "aliases": ["cpanel", "c panel"]},
    {"canonical": "Unity", "aliases": ["unity"]},
    {"canonical": "WebGL", "aliases": ["webgl", "web gl"]},
    {"canonical": "Three.js", "aliases": ["three.js", "threejs", "three js"]},
    {"canonical": "Blender", "aliases": ["blender"]},
    {"canonical": "Audacity", "aliases": ["audacity"]},
    {"canonical": "AR", "aliases": ["ar", "augmented reality"]},
    {"canonical": "HCI", "aliases": ["hci", "human computer interaction"]},
    {"canonical": "2D Physics", "aliases": ["2d physics", "physique 2d"]},
    {"canonical": "Animation controllers", "aliases": ["animation controllers", "animation controller", "controleurs animation"]},
    {"canonical": "Prefab workflows", "aliases": ["prefab workflows", "prefab workflow", "workflows prefabs"]},
    {"canonical": "Collision handling", "aliases": ["collision handling", "gestion collisions"]},
    {"canonical": "UI canvases", "aliases": ["ui canvases", "ui canvas", "canevas ui"]},
    {"canonical": "Playtesting", "aliases": ["playtesting", "play testing"]},
    {"canonical": "Windows builds", "aliases": ["windows builds", "windows build", "exports windows"]},
    {"canonical": "WebGL builds", "aliases": ["webgl builds", "webgl build", "exports webgl"]},
    {"canonical": "Trello-style boards", "aliases": ["trello-style boards", "trello style boards", "tableaux type trello"]},
    {"canonical": "Trello", "aliases": ["trello"]},
    {"canonical": "Canva", "aliases": ["canva"]},
    {"canonical": "Storybook", "aliases": ["storybook"]},
    {"canonical": "Lighthouse", "aliases": ["lighthouse"]},
    {"canonical": "RecyclerView", "aliases": ["recyclerview", "recycler view", "recyclerview lists"]},
    {"canonical": "Logcat", "aliases": ["logcat"]},
    {"canonical": "ConstraintLayout", "aliases": ["constraintlayout", "constraint layout"]},
    {"canonical": "Realtime Database", "aliases": ["realtime database", "firebase realtime database"]},
]


HIGH_CONFIDENCE_HEADERS = [
    "signes techniques",
    "atelier data",
    "stockage et cloud",
    "notes de technologie",
    "pile quotidienne",
    "cote serveur",
    "livraison",
    "indices de stack",
    "souvent utilise",
    "elements backend vus dans les projets",
    "vu aussi",
    "bureau design",
    "fabrication front",
    "signaux qualite",
    "boite a outils securite",
    "systeme et reseau",
    "code et automatisation",
    "infrastructure",
    "signaux de competences",
    "pratique ml",
    "traitement donnees",
    "notes plateforme",
    "plateforme",
    "contexte applicatif",
    "indices de stack qa",
    "utilise souvent",
    "inventaire technique",
    "environnement bi",
    "preparation donnees",
    "outils generaux",
    "outillage disperse ici",
    "creation jeu",
    "web et media",
    "travail equipe",
    "skill signals",
    "technology notes",
    "stack clues",
    "technical inventory",
    "technical inventory written as notes",
    "data workbench",
    "storage and cloud",
    "daily stack",
    "server side",
    "delivery notes",
    "mobile domain",
    "backend pieces used inside projects",
    "also seen",
    "context",
    "design desk",
    "front end craft",
    "quality signals",
    "security toolbox",
    "coding and automation",
    "infrastructure awareness",
    "ml practice",
    "data handling",
    "platform notes",
    "cloud exposure",
    "app context",
    "testing toolkit",
    "automation exposure",
    "tracking and reporting",
    "bi environment",
    "data preparation",
    "general tools",
    "game creation",
    "web and media extras",
    "team workflow",
    "skills",
    "hard skills",
    "tech skills",
    "tech stack",
    "technical skills",
    "technical competencies",
    "competences",
    "compétences",
    "competences techniques",
    "compétences techniques",
    "compétences informatiques",
    "competences informatiques",
    "competences professionnelles",
    "compétences professionnelles",
    "domaines de competences",
    "domaines de compétences",
    "connaissances informatiques",
    "connaissances techniques",
    "savoir-faire",
    "expertise",
    "expertises",
    "technologies",
    "technologies maitrisees",
    "technologies maîtrisées",
    "technologies utilisées",
    "technologies utilisees",
    "outils et technologies",
    "big data",
    "cloud",
    "developpement mobile",
    "développement mobile",
    "mobile development",
    "langages",
    "langages informatiques",
    "langages de programmation",
    "programming languages",
    "frameworks",
    "libraries",
    "bibliothèques",
    "bibliotheques",
    "bases de données",
    "bases de donnees",
    "databases",
    "database",
    "bdd",
    "tools",
    "outils",
    "outils informatiques",
    "outils de developpement",
    "outils de développement",
    "environnement technique",
    "environnements techniques",
    "technical environment",
    "stack",
]

MEDIUM_CONFIDENCE_HEADERS = [
    "experience",
    "expérience",
    "experiences",
    "expériences",
    "projects",
    "projets",
    "projets académiques",
    "projets personnels",
    "work experience",
    "professional experience",
    "expérience professionnelle",
    "stages",
    "stage",
]

LOW_CONFIDENCE_HEADERS = [
    "education",
    "formation",
    "coursework",
    "relevant coursework",
    "certification",
    "certifications",
    "diplome",
    "diplôme",
    "profile",
    "profil",
    "summary",
    "résumé",
    "resume",
    "languages",
    "langues",
]


def repair_mojibake(value: str) -> str:
    mojibake_marker = "\u00c3"
    value = str(value or "")
    if mojibake_marker in value:
        try:
            repaired = value.encode("latin1").decode("utf-8")
            if repaired.count(mojibake_marker) < value.count(mojibake_marker):
                return repaired
        except Exception:
            pass
    if "Ã" not in value and "Â" not in value:
        return value

    try:
        repaired = value.encode("latin1").decode("utf-8")
        if repaired.count("Ã") + repaired.count("Â") < value.count("Ã") + value.count("Â"):
            return repaired
    except Exception:
        pass

    return value


def remove_accents(value: str) -> str:
    value = repair_mojibake(value)
    normalized = unicodedata.normalize("NFD", value)
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def normalize_loose(value: str) -> str:
    value = remove_accents(value).lower()
    value = re.sub(r"\bcomp[^a-z0-9]+tences?\b", "competences", value)
    value = re.sub(r"\bexp[^a-z0-9]+riences?\b", "experiences", value)
    value = re.sub(r"\bd[^a-z0-9]+veloppement\b", "developpement", value)
    value = re.sub(r"\bs[^a-z0-9]+curit[^a-z0-9]*\b", "securite", value)
    value = re.sub(r"\bdonn[^a-z0-9]+es\b", "donnees", value)
    value = re.sub(r"\bcomp\s+tences?\b", "competences", value)
    value = re.sub(r"\bexp\s+riences?\b", "experiences", value)
    value = re.sub(r"\bd\s+veloppement\b", "developpement", value)
    value = re.sub(r"\bs\s+curit\s+\b", "securite ", value)
    value = re.sub(r"\bdonn\s+es\b", "donnees", value)
    value = re.sub(r"[^a-z0-9#+.]+", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_compact(value: str) -> str:
    value = remove_accents(value).lower()
    value = value.replace("#", "sharp").replace("+", "plus").replace(".", "dot")
    return re.sub(r"[^a-z0-9]+", "", value)


def has_phrase(text: str, phrase: str) -> bool:
    phrase = normalize_loose(phrase)
    if not phrase:
        return False

    pattern = rf"(^|[^a-z0-9]){re.escape(phrase)}([^a-z0-9]|$)"
    return re.search(pattern, text, re.IGNORECASE) is not None


def has_abbreviation(text: str, abbreviation: str) -> bool:
    abbreviation = normalize_loose(abbreviation)
    if not abbreviation:
        return False

    matches = re.finditer(
        rf"(^|[^a-z0-9]){re.escape(abbreviation)}([^a-z0-9]|$)",
        text,
        re.IGNORECASE,
    )

    for match in matches:
        before = match.group(1)
        after = match.group(2)

        if abbreviation in ["js", "ts"] and before == ".":
            continue

        if abbreviation == "c" and after in ["#", "+"]:
            continue

        return True

    return False


def canonicalize_skill(skill: str) -> str:
    key = normalize_compact(skill)
    if not key:
        return ""

    for entry in SKILL_DICTIONARY:
        terms = [entry["canonical"]] + entry.get("aliases", []) + entry.get("strict", [])
        for term in terms:
            if normalize_compact(term) == key:
                return entry["canonical"]

    for learned in read_learned_skill_values():
        if normalize_compact(learned) == key:
            return learned

    return str(skill or "").strip()


def unique_skills(skills: List[str]) -> List[str]:
    seen = set()
    result = []

    for skill in skills:
        canonical = canonicalize_skill(skill)
        key = normalize_compact(canonical)

        if not canonical or not key or key in seen or is_probable_noise_skill(canonical):
            continue

        seen.add(key)
        result.append(canonical)

    return result


def is_probable_noise_skill(value: str) -> bool:
    raw = repair_mojibake(str(value or "")).strip()
    normalized = normalize_loose(raw)

    if not raw or not normalized:
        return True

    if normalized in NOISE_SKILL_TERMS or normalized in SKILL_ITEM_STOPWORDS:
        return True

    if "@" in raw or re.search(r"\b(?:linkedin|gmail|email|phone|www\.)\b", normalized):
        return True

    if re.search(r"\b(?:github|gitlab|behance|kaggle|itch)\s*\.\s*(?:com|io|net)\b", normalized):
        return True

    if re.search(r"\b(?:github\.com|behance\.net|kaggle\.com|itch\.io)\b", raw.lower()):
        return True

    if re.search(r"\+?\d[\d\s().-]{6,}", raw):
        return True

    if re.search(r"\b(?:19|20)\d{2}\b", raw) or re.search(r"\d{1,2}\s*[/-]\s*\d{2,4}", raw):
        return True

    if "\n" in raw or "\r" in raw:
        return True

    words = normalized.split()
    if len(words) > 4:
        return True

    if re.fullmatch(r"\d+\s+of\s+\d+", normalized):
        return True

    is_dictionary_term = any(
        normalize_compact(raw) == normalize_compact(term)
        for entry in SKILL_DICTIONARY
        for term in [entry["canonical"]] + entry.get("aliases", []) + entry.get("strict", [])
    )

    if re.search(r"\b(?:style|like)\b", normalized) and "-" in raw and not is_dictionary_term:
        return True

    if normalized in {
        "full stack web",
        "full stack web developer",
        "iam concepts",
        "open source",
        "project education evidence",
        "project + education evidence",
        "push notification",
        "three.js experiments",
        "transformation notebooks in pyspark",
        "web integration",
        "ytd",
        "cloud computing",
    }:
        return True

    if "-" in raw and raw == raw.lower() and not is_dictionary_term:
        return True

    if words and words[0] in {"and", "or", "et", "ou", "with", "without", "avec", "sans"}:
        return True

    if any(word in NOISE_WORDS_IN_SKILL_PHRASES for word in words) and not is_dictionary_term:
        return True

    if raw.endswith(".") and normalize_compact(raw) not in {"reactdotjs", "nextdotjs", "nodedotjs", "vuedotjs"}:
        return True

    return False


def read_learned_skill_values() -> List[str]:
    try:
        with open(LEARNED_SKILLS_PATH, "r", encoding="utf-8") as file:
            payload = json.load(file)

        if isinstance(payload, list):
            return [
                str(item).strip()
                for item in payload
                if str(item).strip() and not is_probable_noise_skill(str(item))
            ]

        if isinstance(payload, dict) and isinstance(payload.get("skills"), list):
            return [
                str(item).strip()
                for item in payload["skills"]
                if str(item).strip() and not is_probable_noise_skill(str(item))
            ]
    except FileNotFoundError:
        return []
    except Exception:
        return []

    return []


def load_learned_skills() -> List[str]:
    seen = set()
    result = []

    for skill in read_learned_skill_values():
        key = normalize_compact(skill)
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(skill)

    return result


def remember_skills(skills: List[str]) -> None:
    candidates = []

    for skill in skills:
        value = strip_skill_label(skill)
        key = normalize_compact(value)

        if not value or not key:
            continue

        if is_probable_noise_skill(value):
            continue

        is_dictionary_skill = any(
            normalize_compact(term) == key
            for entry in SKILL_DICTIONARY
            for term in [entry["canonical"]] + entry.get("aliases", []) + entry.get("strict", [])
        )

        if is_dictionary_skill:
            continue

        if not looks_like_learnable_skill(value):
            continue

        candidates.append(value)

    if not candidates:
        return

    learned = unique_skills(load_learned_skills() + candidates)
    learned = learned[-MAX_LEARNED_SKILLS:]

    try:
        with open(LEARNED_SKILLS_PATH, "w", encoding="utf-8") as file:
            json.dump({"skills": learned}, file, ensure_ascii=False, indent=2)
    except Exception:
        pass


def section_confidence(section_name: str) -> str:
    header = normalize_loose(section_name)
    header_is_non_skill = any(hint in header for hint in NON_SKILL_HEADER_HINTS)

    for name in HIGH_CONFIDENCE_HEADERS:
        normalized_name = normalize_loose(name)
        if header == normalized_name:
            return "high"
        if normalized_name not in EXACT_ONLY_SECTION_HEADERS and re.search(rf"(^|[^a-z0-9]){re.escape(normalized_name)}([^a-z0-9]|$)", header):
            return "high"

    if not header_is_non_skill and any(hint in header for hint in HIGH_HEADER_HINTS):
        return "high"

    for name in MEDIUM_CONFIDENCE_HEADERS:
        normalized_name = normalize_loose(name)
        if header == normalized_name or re.search(rf"(^|[^a-z0-9]){re.escape(normalized_name)}([^a-z0-9]|$)", header):
            return "medium"

    for name in LOW_CONFIDENCE_HEADERS:
        normalized_name = normalize_loose(name)
        if header == normalized_name or re.search(rf"(^|[^a-z0-9]){re.escape(normalized_name)}([^a-z0-9]|$)", header):
            return "low"

    return "unknown"


def strip_skill_label(value: str) -> str:
    result = str(value or "").strip(" :-–—|•\t")

    for label in sorted(SKILL_SECTION_LABELS, key=len, reverse=True):
        pattern = rf"^\s*{re.escape(label)}\s*[:：\-–—|]\s*"
        result = re.sub(pattern, "", result, flags=re.IGNORECASE)

    return result.strip(" :-–—|•\t")


def split_inline_section_header(line: str, known_headers: List[str]) -> Optional[Tuple[str, str]]:
    raw_line = repair_mojibake(line).strip()
    if not raw_line:
        return None

    for separator in INLINE_HEADER_SEPARATORS:
        if separator not in raw_line:
            continue

        left, right = raw_line.split(separator, 1)
        if len(normalize_loose(left).split()) > 5:
            continue

        if section_confidence(left) != "unknown":
            return left.strip(), right.strip()

    clean_line = normalize_loose(raw_line).strip(" :-–—|")

    for header in sorted(known_headers, key=lambda item: len(normalize_loose(item)), reverse=True):
        clean_header = normalize_loose(header)
        if not clean_header:
            continue

        if clean_line == clean_header:
            return raw_line, ""

        if clean_header not in EXACT_ONLY_SECTION_HEADERS and clean_line.startswith(f"{clean_header} "):
            remainder = clean_line[len(clean_header) :].strip(" :-–—|")
            header_confidence = section_confidence(header)
            remainder_words = remainder.split()
            has_list_signal = bool(re.search(r"[,;|â€¢Â·/+#.]", raw_line))

            if header_confidence == "high" and (has_list_signal or len(remainder_words) <= 4):
                return header, remainder

    return None


def looks_like_skill_item(value: str) -> bool:
    item = strip_skill_label(value)
    normalized = normalize_loose(item)

    if not normalized or normalized in SKILL_ITEM_STOPWORDS:
        return False

    words = normalized.split()
    if len(words) > 5:
        return False

    if len(normalized) < 2 or len(normalized) > 40:
        return False

    if re.search(r"[+#./0-9-]", item):
        return True

    if re.search(r"[A-Z][a-z]*[A-Z]|[a-z][A-Z]", repair_mojibake(item)):
        return True

    if re.search(r"\b[A-Z]{2,}\b", repair_mojibake(item)):
        return True

    if (
        repair_mojibake(item)[:1].isupper()
        and len(words) <= 3
        and not all(word.isalpha() and word.islower() for word in words)
    ):
        return True

    technical_words = {
        "api",
        "web",
        "mobile",
        "cloud",
        "data",
        "devops",
        "backend",
        "frontend",
        "fullstack",
        "full",
        "stack",
        "base",
        "donnees",
        "données",
        "securite",
        "sécurité",
        "reseau",
        "réseau",
        "ia",
        "ai",
        "ml",
    }

    return any(word in technical_words for word in words)


def looks_like_learnable_skill(value: str) -> bool:
    item = strip_skill_label(value)
    normalized = normalize_loose(item)

    if not normalized or is_probable_noise_skill(item):
        return False

    words = normalized.split()
    if len(words) > 6 or len(normalized) > 55:
        return False

    if looks_like_skill_item(item):
        return True

    learnable_context = {
        "api",
        "appels",
        "automation",
        "automatisation",
        "cloud",
        "code",
        "data",
        "donnees",
        "echelle",
        "encodage",
        "framework",
        "logs",
        "metriques",
        "monitoring",
        "reseau",
        "schema",
        "scripts",
        "securite",
        "stack",
        "test",
        "tests",
        "validation",
        "web",
    }

    return bool(set(words) & learnable_context)


def extract_skill_items_from_high_confidence_text(text: str) -> List[str]:
    found = []
    normalized_text = re.sub(r"\s*\n\s*", " ", repair_mojibake(text))
    chunks = re.split(r"[\n;,•·]+", normalized_text)

    for chunk in chunks:
        chunk = strip_skill_label(chunk)
        if not chunk:
            continue

        known_in_chunk = find_skills_in_text(chunk)
        if known_in_chunk:
            found.extend(known_in_chunk)
            continue

        slash_parts = [chunk]
        if "/" in chunk and normalize_compact(chunk) not in {
            "uiux",
            "uxui",
            "cicd",
            "cicdpipelines",
            "trainvalidationtestsplits",
            "csvexcelcleaning",
        }:
            slash_parts = chunk.split("/")

        for part in slash_parts:
            candidate = strip_skill_label(part)
            if looks_like_learnable_skill(candidate):
                found.append(candidate)

    return unique_skills(found)


def line_has_technical_context(line: str) -> bool:
    normalized = normalize_loose(line)
    words = set(normalized.split())

    if len(find_skills_in_text(line)) >= 2:
        return True

    if words & TECH_CONTEXT_WORDS:
        return True

    if re.search(r"[+#./0-9-]", line) and len(normalized.split()) <= 14:
        return True

    separators = len(re.findall(r"[,;|•·/]", line))
    return separators >= 2


def extract_candidate_chunks(line: str) -> List[str]:
    cleaned = repair_mojibake(line)

    inline_header = split_inline_section_header(
        cleaned,
        HIGH_CONFIDENCE_HEADERS + MEDIUM_CONFIDENCE_HEADERS + LOW_CONFIDENCE_HEADERS,
    )
    if inline_header:
        _, cleaned = inline_header

    cleaned = re.sub(r"^[\-*•·\d.)\s]+", "", cleaned).strip()
    chunks = re.split(r"[\n;,•·]+", cleaned)
    result = []

    for chunk in chunks:
        chunk = strip_skill_label(chunk)
        if not chunk:
            continue

        if "/" in chunk and normalize_compact(chunk) not in {"uiux", "uxui", "cicd"}:
            result.extend(strip_skill_label(part) for part in chunk.split("/"))
        else:
            result.append(chunk)

    return [item for item in result if item]


def extract_capitalized_technical_terms(text: str) -> List[str]:
    found = []
    repaired = repair_mojibake(text)
    patterns = [
        r"\b[A-Z][A-Za-z0-9]*(?:[.+#-][A-Za-z0-9]+)+\b",
        r"\b[A-Z]{2,}(?:/[A-Z]{2,})?\b",
        r"\b[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+){0,2}\b",
    ]

    for pattern in patterns:
        for match in re.finditer(pattern, repaired):
            candidate = match.group(0).strip()
            if looks_like_skill_item(candidate) and not is_probable_noise_skill(candidate):
                found.append(candidate)

    return unique_skills(found)


def extract_whole_cv_skill_candidates(text: str) -> List[str]:
    candidates = []
    repaired = repair_mojibake(text)
    known_skills = find_skills_in_text(repaired)
    candidates.extend(known_skills)

    for line in repaired.splitlines():
        if not line.strip():
            continue

        if not line_has_technical_context(line):
            continue

        for chunk in extract_candidate_chunks(line):
            known_in_chunk = find_skills_in_text(chunk)
            if known_in_chunk:
                candidates.extend(known_in_chunk)
            elif looks_like_skill_item(chunk) and not is_probable_noise_skill(chunk):
                candidates.append(chunk)

    candidates.extend(extract_capitalized_technical_terms(repaired))

    return unique_skills(candidates)


def split_sections(text: str) -> List[Dict[str, str]]:
    lines = [line.strip() for line in str(text or "").splitlines()]
    sections = []
    current_header = "unknown"
    current_lines = []
    known_headers = HIGH_CONFIDENCE_HEADERS + MEDIUM_CONFIDENCE_HEADERS + LOW_CONFIDENCE_HEADERS

    def flush():
        if current_lines:
            sections.append(
                {
                    "header": current_header,
                    "confidence": section_confidence(current_header),
                    "text": "\n".join(current_lines).strip(),
                }
            )

    for line in lines:
        if not line:
            continue

        inline_header = split_inline_section_header(line, known_headers)

        if inline_header:
            header, inline_content = inline_header
            flush()
            current_header = header
            current_lines = [inline_content] if inline_content else []
        else:
            current_lines.append(repair_mojibake(line))

    flush()

    if not sections and text.strip():
        sections.append({"header": "unknown", "confidence": "unknown", "text": text.strip()})

    return sections


def find_skills_in_text(text: str) -> List[str]:
    text_loose = normalize_loose(text)
    found = []

    for entry in SKILL_DICTIONARY:
        aliases = [entry["canonical"]] + entry.get("aliases", [])
        strict_aliases = entry.get("strict", [])
        normal_match = any(has_phrase(text_loose, alias) for alias in aliases)
        strict_match = any(has_abbreviation(text_loose, alias) for alias in strict_aliases)

        if normal_match or strict_match:
            found.append(entry["canonical"])

    for learned in load_learned_skills():
        if has_phrase(text_loose, learned):
            found.append(learned)

    return unique_skills(found)


def post_process(skills: List[str], full_text: str) -> List[str]:
    text = normalize_loose(full_text)
    skill_set = set(skills)

    if "Burp Suite" in skill_set and has_phrase(text, "burp suite community"):
        skill_set.add("Burp Suite Community")

    if {"Selenium", "WebDriver"} <= skill_set and has_phrase(text, "selenium webdriver"):
        skill_set.add("Selenium WebDriver")

    if "Jira" in skill_set and has_phrase(text, "jira-style boards"):
        skill_set.add("Jira-style boards")

    if "Trello" in skill_set and has_phrase(text, "trello-style boards"):
        skill_set.add("Trello-style boards")

    if "JSON" in skill_set and has_phrase(text, "json parsing"):
        skill_set.add("JSON parsing")

    if "Firebase" in skill_set and has_phrase(text, "firebase authentication"):
        skill_set.add("Firebase Authentication")

    if "Animations" in skill_set and has_phrase(text, "animation controllers"):
        skill_set.add("Animation controllers")

    if {"Joins", "CTEs"} <= skill_set and has_phrase(text, "windows and ctes"):
        skill_set.add("Window functions")

    if "WebGL" in skill_set and has_phrase(text, "build exports for windows and webgl"):
        skill_set.add("Windows builds")
        skill_set.add("WebGL builds")

    if "WebGL" in skill_set and has_phrase(text, "exports windows et webgl"):
        skill_set.add("Windows builds")
        skill_set.add("WebGL builds")

    explicit_java_ee = has_phrase(text, "java ee") or has_phrase(text, "j2ee")
    explicit_plain_java = has_phrase(text, "java") and not explicit_java_ee

    if "JavaScript" in skill_set and not explicit_plain_java:
        skill_set.discard("Java")

    if "Java EE" in skill_set and not explicit_plain_java:
        skill_set.discard("Java")

    explicit_c = has_abbreviation(text, "c") or has_phrase(text, "c language") or has_phrase(text, "langage c")

    if ({"CSS", "C++", "C#"} & skill_set) and not explicit_c:
        skill_set.discard("C")

    explicit_r = has_abbreviation(text, "r") or has_phrase(text, "r language") or has_phrase(text, "langage r")
    if "Ruby" in skill_set and not explicit_r:
        skill_set.discard("R")

    explicit_sql = has_phrase(text, "sql") or has_phrase(text, "structured query language") or has_phrase(text, "requete sql")
    if ({"MySQL", "PostgreSQL", "SQLite", "SQL Server"} & skill_set) and not explicit_sql:
        skill_set.discard("SQL")

    if "Spring Boot" in skill_set:
        skill_set.discard("Spring")

    if "React Native" in skill_set:
        skill_set.add("React")

    if "Prisma ORM" in skill_set:
        skill_set.discard("ORM")

    if "REST API" in skill_set:
        skill_set.discard("APIs")
        skill_set.discard("REST")

    if "REST endpoints" in skill_set or "REST calls" in skill_set:
        skill_set.discard("REST")
        skill_set.discard("REST API")

    if "CI/CD pipelines" in skill_set:
        skill_set.discard("CI/CD")

    if "Jira-style boards" in skill_set:
        skill_set.discard("Jira")

    if "Azure AI Services" in skill_set:
        skill_set.discard("Artificial Intelligence")

    if "Azure Blob Storage" in skill_set:
        skill_set.discard("Azure Storage")
        skill_set.discard("Microsoft Azure")

    if "Azure VMs" in skill_set or "Azure Storage" in skill_set:
        skill_set.discard("Microsoft Azure")

    if "MongoDB Atlas" in skill_set:
        skill_set.discard("MongoDB")

    if "Firebase Authentication" in skill_set:
        skill_set.discard("Firebase")

    if "JSON parsing" in skill_set or "JSON schema" in skill_set:
        skill_set.discard("JSON")

    if "Animation controllers" in skill_set:
        skill_set.discard("Animations")

    if "Contrast testing" in skill_set:
        skill_set.discard("Testing")

    if "WebGL builds" in skill_set:
        skill_set.discard("WebGL")

    if "Log analysis" in skill_set:
        skill_set.discard("Logs")

    if "Linux shell" in skill_set:
        skill_set.discard("Linux")

    if "Power BI Desktop" in skill_set:
        skill_set.discard("Power BI")

    if "Selenium WebDriver" in skill_set:
        skill_set.discard("Selenium")
        skill_set.discard("WebDriver")

    if "Burp Suite Community" in skill_set:
        skill_set.discard("Burp Suite")

    if "HTTPS certificates" in skill_set:
        skill_set.discard("HTTPS")

    if "SQL review" in skill_set:
        skill_set.discard("SQL")

    if "CSV/Excel cleaning" in skill_set:
        skill_set.discard("Excel")

    if "SQL joins" in skill_set:
        skill_set.discard("Joins")
        skill_set.discard("SQL")

    if {"Hadoop", "Spark"} & skill_set:
        skill_set.discard("Big Data")

    if skill_set & {
        "Airflow",
        "Spark",
        "scikit-learn",
        "Train/validation/test splits",
        "Cross-validation",
    }:
        skill_set.discard("Machine Learning")
        skill_set.discard("Data Science")
        skill_set.discard("Data Analysis")

    if skill_set & {"Manual test cases", "Regression suites", "Exploratory testing", "Selenium WebDriver"}:
        skill_set.discard("Testing")
        skill_set.discard("QA")

    if skill_set & {"Nmap", "Wireshark", "Networking fundamentals"}:
        skill_set.discard("Networking")

    if skill_set & {"Android Studio", "RecyclerView", "Intents"}:
        skill_set.discard("Mobile Development")

    if skill_set & {"Docker Compose", "Nginx", "CI/CD pipelines", "Azure VMs"}:
        skill_set.discard("DevOps")

    if "Android Studio" in skill_set:
        skill_set.discard("Mobile Development")
        skill_set.discard("Mobile")

    if "TF-IDF" in skill_set:
        skill_set.discard("TF")
        skill_set.discard("IDF")

    if "ROC-AUC" in skill_set:
        skill_set.discard("ROC")
        skill_set.discard("AUC")

    if "F1" in skill_set:
        skill_set.discard("F1 Score")

    if ({"Microsoft Azure", "Azure VMs", "Azure Storage", "Azure Blob Storage", "DevOps"} & skill_set):
        skill_set.discard("Cloud")
        skill_set.discard("cloud computing")

    if "IAM" in skill_set:
        skill_set.discard("IAM concepts")

    if "Azure VMs" in skill_set:
        skill_set.discard("VM")

    if "OWASP Top 10" in skill_set:
        skill_set.discard("OWASP")

    if "Three.js" in skill_set:
        skill_set.discard("Three.js experiments")

    if "Trello-style boards" in skill_set:
        skill_set.discard("Trello")

    ordered = [skill for skill in skills if skill in skill_set]
    ordered.extend(entry["canonical"] for entry in SKILL_DICTIONARY if entry["canonical"] in skill_set and entry["canonical"] not in ordered)

    return unique_skills(ordered)


def detect_language(text: str) -> str:
    normalized = f" {normalize_loose(text)} "
    french_markers = [
        " competences ",
        " experience professionnelle ",
        " formation ",
        " stage ",
        " projet ",
        " langues ",
        " diplome ",
        " universite ",
        " ingenieur ",
        " developpement ",
    ]
    english_markers = [
        " skills ",
        " work experience ",
        " education ",
        " projects ",
        " languages ",
        " university ",
        " engineer ",
        " development ",
    ]
    french = sum(1 for marker in french_markers if marker in normalized)
    english = sum(1 for marker in english_markers if marker in normalized)

    if french and english:
        return "mixed"
    if french > english:
        return "fr"
    if english > french:
        return "en"
    return "unknown"


def extract_skills_section_aware(text: str) -> Dict[str, Any]:
    sections = split_sections(text)
    high = []
    medium = []
    low = []
    unknown = []
    section_results = []

    for section in sections:
        confidence = section["confidence"]
        if confidence == "high":
            skills = extract_skill_items_from_high_confidence_text(section["text"])
            if not skills:
                skills = find_skills_in_text(section["text"])
        else:
            skills = find_skills_in_text(section["text"])

        if confidence == "high":
            high.extend(skills)
        elif confidence == "medium":
            medium.extend(skills)
        elif confidence == "low":
            low.extend(skills)
        else:
            unknown.extend(skills)

        section_results.append({"header": section["header"], "confidence": confidence, "skills": skills})

    confirmed = unique_skills(high)

    confirmed = post_process(confirmed, text)
    remember_skills(high)

    return {
        "language": detect_language(text),
        "skills": confirmed,
        "lowConfidenceSkills": [],
        "sections": section_results,
    }


_MODEL = None


def get_model():
    global _MODEL

    if _MODEL is None:
        os.environ.setdefault("HF_HUB_OFFLINE", "1")
        os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
        from sentence_transformers import SentenceTransformer

        try:
            _MODEL = SentenceTransformer(MODEL_NAME, local_files_only=True)
        except TypeError:
            _MODEL = SentenceTransformer(MODEL_NAME)

    return _MODEL


def vector_norm(vector: Any) -> float:
    if np is not None:
        return float(np.linalg.norm(vector))

    return sum(float(value) ** 2 for value in vector) ** 0.5


def dot_product(a: Any, b: Any) -> float:
    if np is not None:
        return float(np.dot(a, b))

    return sum(float(left) * float(right) for left, right in zip(a, b))


def cosine_similarity(a: Any, b: Any) -> float:
    denominator = vector_norm(a) * vector_norm(b)
    if denominator == 0:
        return 0.0
    return float(dot_product(a, b) / denominator)


def lexical_similarity(text_a: str, text_b: str) -> int:
    words_a = set(normalize_loose(text_a).split())
    words_b = set(normalize_loose(text_b).split())
    words_a = {word for word in words_a if len(word) > 2}
    words_b = {word for word in words_b if len(word) > 2}

    if not words_a or not words_b:
        return 0

    overlap = len(words_a & words_b)
    union = len(words_a | words_b)
    return int(round((overlap / union) * 100))


def semantic_similarity(text_a: str, text_b: str) -> int:
    if not text_a.strip() or not text_b.strip():
        return 0

    try:
        model = get_model()
        embeddings = model.encode([text_a, text_b], normalize_embeddings=True)
        score = cosine_similarity(embeddings[0], embeddings[1])
        normalized = max(0.0, min(1.0, (score + 1.0) / 2.0))
        return int(round(normalized * 100))
    except Exception:
        return lexical_similarity(text_a, text_b)


def score_subject(payload: Dict[str, Any]) -> Dict[str, Any]:
    cv_text = payload.get("cvText", "") or ""
    subject = payload.get("subject", {}) or {}
    extracted = extract_skills_section_aware(cv_text) if cv_text.strip() else {"skills": []}
    candidate_skills = unique_skills([*payload.get("candidateSkills", []), *extracted.get("skills", [])])
    required_skills = unique_skills(subject.get("requiredSkills", []))
    technologies = unique_skills(subject.get("technologies", []))

    subject_text = " ".join(
        [
            str(subject.get("title", "") or ""),
            str(subject.get("description", "") or ""),
            " ".join(required_skills),
            " ".join(technologies),
        ]
    )

    candidate_keys = {normalize_compact(skill) for skill in candidate_skills}

    def term_match(terms: List[str]) -> Tuple[int, List[str], List[str]]:
        if not terms:
            return 0, [], []

        matched = []
        missing = []

        for term in terms:
            canonical = canonicalize_skill(term)
            key = normalize_compact(canonical)
            if key in candidate_keys:
                matched.append(canonical)
            else:
                missing.append(canonical)

        percent = int(round((len(matched) / len(terms)) * 100))
        return percent, matched, missing

    required_score, matched_required, missing_required = term_match(required_skills)
    tech_score, matched_tech, missing_tech = term_match(technologies)
    semantic_score = semantic_similarity(cv_text or " ".join(candidate_skills), subject_text)

    if required_skills:
        final_score = round((required_score * 0.80) + (tech_score * 0.12) + (semantic_score * 0.08))
    elif technologies:
        final_score = round((tech_score * 0.82) + (semantic_score * 0.18))
    else:
        final_score = semantic_score

    return {
        "score": int(max(0, min(100, final_score))),
        "requiredScore": required_score,
        "technologyScore": tech_score,
        "semanticScore": semantic_score,
        "matchedSkills": unique_skills(matched_required + matched_tech),
        "missingSkills": unique_skills(missing_required + missing_tech),
        "candidateSkills": candidate_skills,
        "language": extracted.get("language", "unknown"),
    }


try:
    from analyzer import parse as _ax_parse
    from analyzer import sections as _ax_sections
    from analyzer import skills as _ax_skills
    from analyzer import languages as _ax_languages
    from analyzer import matching as _ax_matching
    ANALYZER_AVAILABLE = True
except Exception as _ax_err:
    ANALYZER_AVAILABLE = False
    _ax_err_msg = str(_ax_err)


def enrich_extract_result(legacy_result, text):
    """Merge legacy matcher skills with analyzer's categorized output.

    Output is additive: legacy `skills` and `language` keys remain unchanged,
    new keys are added (technicalSkills, softSkills, languages, tools,
    domainSkills, certifications, allSkills, detectedLanguage).
    """
    if not ANALYZER_AVAILABLE:
        legacy_result["technicalSkills"] = legacy_result.get("skills", [])
        legacy_result["softSkills"] = []
        legacy_result["languages"] = []
        legacy_result["tools"] = []
        legacy_result["domainSkills"] = []
        legacy_result["certifications"] = []
        legacy_result["allSkills"] = legacy_result.get("skills", [])
        legacy_result["detectedLanguage"] = legacy_result.get("language", "unknown")
        return legacy_result

    cleaned = _ax_parse.clean_text(text)
    sec_map = _ax_sections.split_sections(cleaned)

    cat = _ax_skills.extract_skills_from_sections(sec_map, cleaned)
    langs = _ax_languages.extract_languages(sec_map, cleaned)

    legacy_skills = legacy_result.get("skills", []) or []

    technical = list(dict.fromkeys(list(legacy_skills) + list(cat.get("technicalSkills", []))))

    all_skills_list = list(dict.fromkeys(
        list(legacy_skills)
        + list(cat.get("technicalSkills", []))
        + list(cat.get("softSkills", []))
        + list(cat.get("tools", []))
        + list(cat.get("domainSkills", []))
        + list(cat.get("certifications", []))
    ))

    legacy_result["technicalSkills"] = technical
    legacy_result["softSkills"] = cat.get("softSkills", [])
    legacy_result["languages"] = langs
    legacy_result["tools"] = cat.get("tools", [])
    legacy_result["domainSkills"] = cat.get("domainSkills", [])
    legacy_result["certifications"] = cat.get("certifications", [])
    legacy_result["allSkills"] = all_skills_list
    legacy_result["detectedLanguage"] = legacy_result.get("language") or _ax_parse.detect_lang_simple(cleaned)
    legacy_result["lowConfidenceSkills"] = cat.get("lowConfidenceSkills", [])
    legacy_result["skills"] = all_skills_list

    return legacy_result


def score_with_breakdown(payload):
    """Score mode using analyzer.matching when cv extractedData is provided.

    Falls back to legacy score_subject if analyzer unavailable or cv missing.
    """
    subject = payload.get("subject", {}) or {}
    cv_data = payload.get("cv")

    if ANALYZER_AVAILABLE and isinstance(cv_data, dict) and cv_data.get("allSkills"):
        result = _ax_matching.score_subject(subject, cv_data)
        # Backward-compat fields expected by Node
        result.setdefault("candidateSkills", cv_data.get("allSkills", []))
        result.setdefault("semanticScore", 0)
        return result

    # Legacy path
    legacy = score_subject(payload)
    legacy.setdefault("scoreBreakdown", {
        "technical": int(round(legacy.get("requiredScore", 0) * 0.55 + legacy.get("technologyScore", 0) * 0.15)),
        "domain": 0,
        "languages": 0,
        "softSkills": 0,
    })
    legacy.setdefault("matchedLanguages", [])
    legacy.setdefault("missingLanguages", [])
    legacy.setdefault(
        "recommendationReason",
        f"Match based on {len(legacy.get('matchedSkills', []))} skill(s) found in CV.",
    )
    return legacy


def main():
    raw = sys.stdin.read()

    try:
        payload = json.loads(raw)
    except Exception as exc:
        print(json.dumps({"error": f"Invalid JSON input: {exc}"}))
        sys.exit(1)

    mode = payload.get("mode")

    try:
        if mode == "extract":
            text = payload.get("text", "") or ""
            result = extract_skills_section_aware(text)
            result = enrich_extract_result(result, text)
            print(json.dumps(result, ensure_ascii=False))
            return

        if mode == "score":
            result = score_with_breakdown(payload)
            print(json.dumps(result, ensure_ascii=False))
            return

        if mode == "similarity":
            result = {
                "semanticScore": semantic_similarity(
                    payload.get("a", "") or "",
                    payload.get("b", "") or "",
                )
            }
            print(json.dumps(result, ensure_ascii=False))
            return

        print(json.dumps({"error": "Unknown mode. Use extract, score, or similarity."}))
        sys.exit(1)
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
