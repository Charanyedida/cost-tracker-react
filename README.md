 deployed project: [https://cost-tracker-react.vercel.app/](https://cost-tracker-react.vercel.app/)

---


# 💰 Project Cost Tracker

Track, manage, and analyze project expenses effortlessly.

🔗 **Live App**: [cost-tracker-react.vercel.app](https://cost-tracker-react.vercel.app/)

## 📦 Features

- 🔐 Firebase Authentication (Email + Google Sign-In)
- 🧾 Add, edit, delete project items and miscellaneous costs
- 📊 Real-time summary of items, costs, and total project expenditure
- 🧠 Smart filtering (High/Medium/Low cost) and sorting (Name, Cost)
- 💾 Local data persistence scoped per user
- ⚙️ Modal-driven UX, responsive design, toast notifications

## 🚀 Tech Stack

- **Frontend**: React, Lucide Icons, CSS Modules
- **Backend/Auth**: Firebase Authentication
- **Deployment**: Vercel

## 🛠️ Setup

1. **Clone the repo**

```bash
git clone https://github.com/your-username/project-cost-tracker.git
cd project-cost-tracker

````

2. **Install dependencies**

```bash
npm install
```

3. **Firebase Setup**

* Create a Firebase project at [firebase.google.com](https://firebase.google.com)
* Enable **Email/Password** and **Google** sign-in in the Authentication section
* Copy your Firebase config into `firebase.js`:

```js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
```

4. **Run locally**

```bash
npm start
```

App will run at `http://localhost:3000`.

## 🧪 Folder Structure

```
src/
├── App.js             # Main logic & components
├── firebase.js        # Firebase configuration
├── App.css            # Styles
└── index.js           # Entry point
```

## ✨ Design Highlights

* Authentication-first access model
* Modular reducer-driven state management
* Toast-based real-time UX feedback
* Responsive and user-friendly design
* Data persists per-user in local storage

## 🙌 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/featureName`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/featureName`)
5. Open Pull Request



🧠 *Built to help teams track costs with clarity and control.*

