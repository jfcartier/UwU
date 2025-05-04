# UwU

L'idée initiale du projet m'est venu lorsque j'ai installé pour la première fois Komga sur mon Raspberri Pi. Mes fichiers n'étaient pas classés comme je le voulais, alors j'ai essayé pleins d'affaires comme komf, manga tagger, calibre, etc. Rien ne fesait exactement ce que je voulais.

En vérité, je cherchais une équivalence de mediaElch, mais pour les mangas.

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

---

J'avais commencé le projet en anglais et j'ai changé d'avis.