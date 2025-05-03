# UwU

J'avais commencé le projet en anglais et j'ai changé d'avis. On va y aller juste en français pour faire chier de le plus monde possible.

## Installation

Créer un fichier `.env` à la racine du projet avec le contenu suivant : 

```
FILES_PATH=/c/Users/tonuser/chemin/vers/mangas
VITE_FILES_PATH=/app/files
VITE_BACKEND_URL=http://localhost:3001
VITE_MANGADEX_CLIENT_ID=personal-client-asdf...
VITE_MANGADEX_CLIENT_SECRET=votresupersecretici
VITE_MANGADEX_USERNAME=tonusername
VITE_MANGADEX_PASSWORD=tonmotdepasse
```

Installer Docker Desktop et le démarrer

En ligne de commande, allez dans le dossier du projet et exécutez la commande : `docker-compose up --build`.

Dans votre navigateur : `http://localhost:5173`

Vous devriez voir vos mangas et commencer la gestion de votre librairie
