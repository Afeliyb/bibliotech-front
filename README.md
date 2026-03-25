# 📚 ESGIS Library

Application web de gestion de bibliothèque permettant aux administrateurs de gérer les livres, les emprunts, les réservations et les membres, et aux adhérents de suivre leurs activités.

---

## 🚀 Stack technique

| Couche          | Technologie                              |
| --------------- | ---------------------------------------- |
| Frontend        | React + TypeScript + Vite                |
| UI              | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend         | FastAPI (Python)                         |
| Base de données | SQLite (via SQLModel)                    |
| Auth            | Système de rôles (admin / adhérent)      |

---

## ✨ Fonctionnalités

### 👤 Adhérent

- Connexion avec email et mot de passe
- Consultation de ses emprunts en cours
- Suivi du statut de ses réservations
- Réception de notifications (réservation prête, retour confirmé, pénalité)
- Gestion de son profil (paramètres)

### 🛠️ Administrateur

- Gestion complète des livres (ajout, consultation)
- Gestion des emprunts (création, retour)
- Gestion des réservations (changement de statut)
- Gestion des pénalités (paiement)
- Consultation de tous les membres et de leurs informations
- Tableau de bord avec statistiques globales

---

## 🔐 Comptes de test

| Rôle     | Email                  | Mot de passe |
| -------- | ---------------------- | ------------ |
| Admin    | admin@ESGIS Library.tg | admin123     |
| Adhérent | marie@example.com      | member123    |
| Adhérent | jean@example.com       | member123    |

---

## ⚙️ Installation et lancement

### Prérequis

- Node.js >= 18
- Python >= 3.11
- pip

### 1. Cloner les projets

lien du backend : https://github.com/Afeliyb/ESGIS Library-back

```bash
git clone https://github.com/Afeliyb/ESGIS Library-front.git
git clone https://github.com/Afeliyb/ESGIS Library-back.git
```

### 2. Lancer le backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera disponible sur : `http://localhost:8000`  
Documentation API : `http://localhost:8000/docs`

### 3. Lancer le frontend

Dans un nouveau terminal :

```bash
cd frontend   # ou le dossier racine selon ta structure
npm install
npm run dev
```

Le frontend sera disponible sur : `http://localhost:8080`

---

## 📁 Structure du projet

```
ESGIS Library/
├── backend/
│   └── app/
│       ├── main.py        # Routes FastAPI
│       ├── crud.py        # Logique métier
│       ├── models.py      # Modèles SQLModel
│       └── database.py    # Connexion SQLite
└── src/
    ├── pages/             # Pages de l'application
    ├── components/        # Composants UI réutilisables
    ├── context/           # AuthContext
    └── lib/
        └── api.ts         # Appels vers le backend
```

---

## 📡 Principaux endpoints API

| Méthode | Endpoint                    | Description                    |
| ------- | --------------------------- | ------------------------------ |
| POST    | `/auth/login`               | Connexion utilisateur          |
| GET     | `/books`                    | Liste des livres               |
| POST    | `/books`                    | Ajouter un livre               |
| GET     | `/users`                    | Liste des membres              |
| GET     | `/borrowings`               | Liste des emprunts             |
| PUT     | `/borrowings/{id}/return`   | Retourner un livre             |
| GET     | `/reservations`             | Liste des réservations         |
| PUT     | `/reservations/{id}/status` | Changer le statut              |
| GET     | `/penalties`                | Liste des pénalités            |
| PUT     | `/penalties/{id}/pay`       | Payer une pénalité             |
| GET     | `/notifications`            | Notifications d'un utilisateur |
| GET     | `/stats`                    | Statistiques globales          |

---

## 📝 Notes

- Les deux serveurs (frontend et backend) doivent tourner en même temps.
- La base de données SQLite est créée automatiquement au premier lancement du backend.
- Le CORS est configuré pour autoriser `http://localhost:8080`.
