# UwU

L'idée initiale du projet m'est venu lorsque j'ai installé pour la première fois Komga sur mon Raspberri Pi. Mes fichiers n'étaient pas classés comme je le voulais, alors j'ai essayé pleins d'affaires comme komf, manga tagger, calibre, etc. Rien ne fesait exactement ce que je voulais.

En vérité, je cherchais une équivalence de mediaElch, mais pour les mangas.

## Installation

Installer Docker Desktop et le démarrer

Créer un fichier `.env` à la racine du projet avec le contenu suivant :

```
FILES_PATH=/c/Users/tonuser/chemin/vers/mangas
VITE_BACKEND_URL=http://localhost:3001
```

En ligne de commande, allez dans le dossier du projet et exécutez la commande : `docker-compose up --build`.

Dans votre navigateur : `http://localhost:5173`

Vous devriez voir vos mangas et commencer la gestion de votre librairie

---

https://atsumeru.xyz/

Todo : 

Formats a supporter :  CBZ, CBR, CB7, PDF, ePub (with limitations), FB2 (with limitations) and Djvu file formats.

Réglages

	Répertoires 

	CTA : Ajouter, Enlever
	Pour chaque répertoire, il faut un fichier nfo pour stocker les informations configurés. Par exemple, quand on traite les dossiers, on doit voir dans l'interface si le dossier a été traité ou non (comicInfo.xml)

	Pattern de renommage
	- Dossier
	- Manga

Scraper / API

	- Mangadex : Client ID, Client Secret
	- Ajouter https://www.nautiljon.com/ API ou scraper (https://github.com/iambluedev1/nautiljon-api) (https://github.com/barthofu/nautiljon-scraper)
	- Scraper par langue : 
		- liste des champs recueillis (comicinfo) et le ou les API/site utilisés pour chacun en fonction de la langue

Note : Ajouter une notion de sauvegarde pour se souvenir des répertoires.