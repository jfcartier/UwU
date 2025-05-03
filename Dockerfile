# Utiliser une image Node.js officielle
FROM node:22-alpine

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer les ports nécessaires
EXPOSE 5173 3001

# Commande pour démarrer à la fois le serveur Express et le serveur Vite
CMD ["sh", "-c", "npm run server & npm run dev"]
