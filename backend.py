from flask import Flask, jsonify, request, Response # Import Response
from flask_cors import CORS # Import CORS
import os
import zipfile
import rarfile
import requests # Import requests library
import re
import urllib.parse
from bs4 import BeautifulSoup # Import BeautifulSoup
from unidecode import unidecode # Import unidecode
import Levenshtein # Import Levenshtein
import asyncio # Import asyncio for running async functions if needed elsewhere, but remove from scraping logic

app = Flask(__name__)
# Ensure CORS allows headers like Authorization
CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "allow_headers": "*"}})

FILES_PATH = os.getenv('FILES_PATH', './files')

# --- Manga-News Scraping Logic --- START ---

def normalize_text(text):
    """Normalize text: remove accents, lowercase, keep alphanumeric."""
    return re.sub(r'[^a-z0-9]', '', unidecode(text).lower())

def title_to_slug(title):
    """Convert title to a URL slug."""
    normalized = unidecode(title)
    no_symbols = re.sub(r'[^a-zA-Z0-9 ]', '', normalized)
    slug = re.sub(r'\s+', '-', no_symbols.strip())
    return slug

def check_slug_exists(slug):
    """Check if a direct slug URL exists on Manga-News."""
    url = f"https://www.manga-news.com/index.php/serie/{slug}"
    print(f'Trying slug URL: {url}')
    try:
        response = requests.get(url, timeout=10)
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f'Error checking slug existence: {e}')
        return False

def search_slug_with_duckduckgo(title):
    """Search DuckDuckGo HTML version for the Manga-News slug and path type.""" # Updated docstring
    query = urllib.parse.quote(f"site:manga-news.com {title}")
    search_url = f"https://html.duckduckgo.com/html/?q={query}"
    print(f'[DDG Search] Searching URL: {search_url}')

    try:
        headers = {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9'}
        response = requests.get(search_url, headers=headers, timeout=15)
        response.raise_for_status()
        print(f'[DDG Search] Response status: {response.status_code}')

        soup = BeautifulSoup(response.text, 'html.parser')
        potential_matches = [] # Store tuples of (link, path_type, slug)
        # Allow optional trailing slash
        link_pattern = re.compile(r'https://www\\.manga-news\\.com/index\\.php/(serie|serie-vo)/([^/]+)/?$')

        print("[DDG Search] Raw links found:") # Log header
        all_links = soup.find_all('a', class_='result__url')
        if not all_links:
            print("[DDG Search]   Selector 'a.result__url' found no elements.")
        else:
            for a_tag in all_links:
                href = a_tag.get_text(strip=True)
                print(f"[DDG Search]   Raw href: {href}") # Log each raw link
                match = link_pattern.search(href)
                if match:
                     path_type = match.group(1)
                     slug = match.group(2)
                     print(f'[DDG Search]     -> Matched! Path: {path_type}, Slug: {slug}') # Log match success
                     potential_matches.append({'link': href, 'path_type': path_type, 'slug': slug})
                # else: # Optional: Log non-matches
                #     print(f'[DDG Search]     -> No match with regex.')

        print(f'[DDG Search] Filtered potential matches: {potential_matches}')

        if not potential_matches:
            print('[DDG Search] No valid links found on DuckDuckGo.')
            return None # Return None if no matches

        normalized_title = normalize_text(title)
        print(f'[DDG Search] Normalized title: {normalized_title}')
        best_match_info = None # Will store {'path_type': ..., 'slug': ...}
        best_distance = float('inf')
        max_allowed_distance = len(normalized_title) * 0.4
        print(f'[DDG Search] Max allowed distance for fuzzy match: {max_allowed_distance}')

        for match_info in potential_matches:
            slug = match_info['slug']
            path_type = match_info['path_type']
            link = match_info['link']

            # Normalize only for comparison
            normalized_slug_for_comparison = normalize_text(slug.replace('-', ' '))
            distance = Levenshtein.distance(normalized_title, normalized_slug_for_comparison)
            print(f'[DDG Search] Testing link: {link} | Extracted slug: {slug} | Path: {path_type} | Normalized slug for comparison: {normalized_slug_for_comparison} | distance = {distance}')
            if distance < best_distance:
                best_distance = distance
                best_match_info = {'path_type': path_type, 'slug': slug} # Store path and original case slug
                print(f'[DDG Search] New best match: Slug={best_match_info["slug"]}, Path={best_match_info["path_type"]} (distance {best_distance})')

        final_match_info = None
        if best_match_info is not None and best_distance <= max_allowed_distance:
            print(f'[DDG Search] Selected best fuzzy match: Slug={best_match_info["slug"]}, Path={best_match_info["path_type"]} (distance {best_distance})')
            final_match_info = best_match_info
        else:
            print(f'[DDG Search] No good fuzzy match found (best distance {best_distance} > {max_allowed_distance}). Trying fallback.')
            if potential_matches:
                fallback_match = potential_matches[0] # Use the first found match
                print(f'[DDG Search] Using fallback: Slug={fallback_match["slug"]}, Path={fallback_match["path_type"]}')
                final_match_info = {'path_type': fallback_match['path_type'], 'slug': fallback_match['slug']}
            else:
                print('[DDG Search] Fallback failed: No potential matches were available.')

        if final_match_info:
            print(f"[DDG Search] Returning final match: Slug='{final_match_info['slug']}', Path='{final_match_info['path_type']}'")
        else:
            print("[DDG Search] Failed to determine final slug and path.")
        return final_match_info # Return dict {'path_type': ..., 'slug': ...} or None

    except requests.exceptions.RequestException as e:
        print(f'[DDG Search] DuckDuckGo request error: {e}')
        return None
    except Exception as e:
        import traceback
        print(f'[DDG Search] Error during DuckDuckGo parsing: {e}\n{traceback.format_exc()}')
        return None

def search_manga_news_slug(title):
    """Find the Manga-News slug and path type, trying DuckDuckGo first then direct URL checks."""
    # First try DuckDuckGo search
    match_info = search_slug_with_duckduckgo(title)
    if match_info:
        print(f'Slug and path found via DuckDuckGo: Slug={match_info["slug"]}, Path={match_info["path_type"]}')
        return match_info

    print(f'DuckDuckGo search failed for title: {title}. Trying direct URL checks...')
    
    # If DuckDuckGo fails, try direct URL patterns with the original title casing
    # Preserve original casing, just replace spaces with hyphens
    direct_slug = title.replace(' ', '-')
    
    # Try both paths (serie and serie-vo) with the direct slug
    paths_to_try = ['serie', 'serie-vo']
    for path_type in paths_to_try:
        url = f"https://www.manga-news.com/index.php/{path_type}/{direct_slug}"
        print(f'Trying direct URL: {url}')
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f'Direct URL successful: {url}')
                return {'path_type': path_type, 'slug': direct_slug}
        except Exception as e:
            print(f'Error checking direct URL {url}: {e}')
    
    # If all direct URL attempts fail as well
    print(f'No slug/path found for title: {title}')
    return None

def scrape_synopsis(slug, path_type):
    """Scrape the synopsis from the Manga-News series page using the correct path type."""
    url = f"https://www.manga-news.com/index.php/{path_type}/{slug}"
    print(f'Scraping URL: {url}')
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try to find the synopsis in the correct structure: div.bigsize inside div#summary after h2
        summary_div = soup.select_one('div#summary div.bigsize')
        if summary_div:
            print(f'Found synopsis using div#summary div.bigsize selector')
            summary = summary_div.get_text(strip=True)
            return summary

        # Fallback selectors if the first one fails
        # Try the "card-body" approach
        summary_p = soup.select_one('div#summary div.card-body p')
        if summary_p:
            print('Found synopsis using div#summary div.card-body p selector')
            summary = summary_p.get_text(strip=True)
            return summary
            
        # Try the "card-text" approach
        summary_div = soup.select_one('div#summary div.card-text')
        if summary_div:
            print('Found synopsis using div#summary div.card-text selector')
            summary = summary_div.get_text(strip=True)
            return summary

        # Try the "description" approach
        desc_span = soup.select_one('div#synopsis span[itemprop="description"]')
        if desc_span:
            print('Found synopsis using div#synopsis span[itemprop="description"] selector')
            summary = desc_span.get_text(strip=True)
            return summary

        # Try the "resume" approach
        resume_div = soup.select_one('div.resume')
        if resume_div:
            print('Found synopsis using div.resume selector')
            summary = resume_div.get_text(strip=True)
            return summary

        print('All selectors failed to find synopsis.')
        return None

    except requests.exceptions.RequestException as e:
        if isinstance(e, requests.exceptions.HTTPError):
             print(f'Scraping error Manga-News: HTTP {e.response.status_code} for URL {url}')
        else:
             print(f'Scraping error Manga-News: {e}')
        return None
    except Exception as e:
        print(f'Error during synopsis parsing: {e}')
        return None

# --- Manga-News Scraping Logic --- END ---

@app.route('/files', methods=['GET'])
def list_files():
    try:
        folders = []
        for root, dirs, files in os.walk(FILES_PATH):
            if root == FILES_PATH:
                continue
            
            normalized_root = os.path.normpath(root)
            folder = {
                'id': normalized_root,
                'name': os.path.basename(normalized_root),
                'path': normalized_root,
                'files': [
                    {'id': os.path.normpath(os.path.join(normalized_root, f)), 'name': f, 'path': os.path.normpath(os.path.join(normalized_root, f))}
                    for f in files if f.endswith(('.cbz', '.cbr'))
                ]
            }
            if folder['files']:
                folders.append(folder)
        return jsonify(folders)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-cbz', methods=['POST'])
def update_cbz():
    data = request.json
    file_path = data.get('filePath')
    comic_info_xml = data.get('comicInfoXML')

    try:
        if file_path.endswith('.cbz'):
            with zipfile.ZipFile(file_path, 'a') as zip_file:
                zip_file.writestr('ComicInfo.xml', comic_info_xml)
        elif file_path.endswith('.cbr'):
            with rarfile.RarFile(file_path) as rar_file:
                pass
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rename', methods=['POST', 'OPTIONS'])
def rename_file_or_folder():
    """Endpoint pour renommer un fichier ou un dossier."""
    if request.method == 'OPTIONS':
        return Response(status=200)
        
    try:
        data = request.json
        old_path = data.get('oldPath')
        new_name = data.get('newName')
        
        if not old_path or not new_name:
            return jsonify({'error': 'Les chemins source et destination sont requis'}), 400
            
        # Déterminer si c'est un fichier ou un dossier
        is_directory = os.path.isdir(old_path)
        
        # Construire le nouveau chemin
        parent_dir = os.path.dirname(old_path)
        new_path = os.path.join(parent_dir, new_name)
        
        print(f"Renommage demandé: {old_path} -> {new_path} ({'dossier' if is_directory else 'fichier'})")
        
        # Vérifier si la destination existe déjà
        if os.path.exists(new_path):
            return jsonify({'error': f"Le fichier ou dossier '{new_name}' existe déjà"}), 409
            
        # Effectuer le renommage
        os.rename(old_path, new_path)
        
        return jsonify({
            'success': True,
            'oldPath': old_path,
            'newPath': new_path,
            'isDirectory': is_directory
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Erreur de renommage: {e}\n{error_details}")
        return jsonify({'error': str(e), 'details': error_details}), 500

@app.route('/proxy/mangadex/<path:subpath>', methods=['GET', 'OPTIONS'])
def proxy_mangadex(subpath):
    if request.method == 'OPTIONS':
        return Response(status=200)

    params = request.args.to_dict(flat=False)
    headers_to_forward = {}
    if 'Authorization' in request.headers:
        headers_to_forward['Authorization'] = request.headers['Authorization']

    mangadex_url = f"https://api.mangadex.org/{subpath}"

    try:
        response = requests.request(
            method=request.method,
            url=mangadex_url,
            params=params,
            headers=headers_to_forward
        )
        response.raise_for_status()

        content = response.content

        resp_headers = {}
        for h in ['Content-Type', 'Content-Length']:
            if h in response.headers:
                resp_headers[h] = response.headers[h]
        
        return Response(content, status=response.status_code, headers=resp_headers)

    except requests.exceptions.RequestException as e:
        error_message = f"Error proxying to MangaDex: {e}"
        status_code = e.response.status_code if e.response is not None else 500
        if e.response is not None:
            resp_headers = {
                'Content-Type': e.response.headers.get('Content-Type', 'application/json')
            }
            return Response(e.response.content, status=status_code, headers=resp_headers)
        else:
            return jsonify({'error': error_message}), status_code
    except Exception as e:
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/proxy/jikan/<path:subpath>', methods=['GET', 'OPTIONS'])
def proxy_jikan(subpath):
    if request.method == 'OPTIONS':
        return Response(status=200)

    params = request.args.to_dict(flat=False)
    jikan_url = f"https://api.jikan.moe/v4/{subpath}"

    try:
        # Log pour aider au débogage
        print(f"[Jikan Proxy] Forwarding request to: {jikan_url}")
        print(f"[Jikan Proxy] With params: {params}")
        
        response = requests.request(
            method=request.method,
            url=jikan_url,
            params=params,
            timeout=10  # Timeout explicite pour éviter les blocages
        )
        response.raise_for_status()

        content = response.content
        print(f"[Jikan Proxy] Response status: {response.status_code}")

        resp_headers = {}
        for h in ['Content-Type', 'Content-Length']:
            if h in response.headers:
                resp_headers[h] = response.headers[h]
        
        return Response(content, status=response.status_code, headers=resp_headers)

    except requests.exceptions.RequestException as e:
        error_message = f"Error proxying to Jikan API: {e}"
        print(f"[Jikan Proxy] Error: {error_message}")
        status_code = e.response.status_code if hasattr(e, 'response') and e.response is not None else 500
        if hasattr(e, 'response') and e.response is not None:
            resp_headers = {
                'Content-Type': e.response.headers.get('Content-Type', 'application/json')
            }
            return Response(e.response.content, status=status_code, headers=resp_headers)
        else:
            return jsonify({'error': error_message}), status_code
    except Exception as e:
        print(f"[Jikan Proxy] Unexpected error: {str(e)}")
        return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500

# --- Manga-News Route --- START ---
@app.route('/manga-news/<title>', methods=['GET'])
def get_manga_news_synopsis_route(title):
    """API endpoint to get synopsis from Manga-News."""
    try:
        decoded_title = urllib.parse.unquote(title)
        print(f'Received request for Manga-News synopsis: {decoded_title}')
        match_info = search_manga_news_slug(decoded_title) # Returns dict {'path_type': ..., 'slug': ...} or None

        if not match_info:
            print(f'[ERROR] Manga-News slug/path search failed for title: {decoded_title}') # Updated detail
            return jsonify({'error': 'Manga not found on Manga-News'}), 404

        slug = match_info['slug']
        path_type = match_info['path_type']
        print(f'Found Manga-News slug: {slug}, path_type: {path_type}') # Added success log

        synopsis = scrape_synopsis(slug, path_type) # Pass both slug and path_type
        if not synopsis:
            # The error is now more likely caught inside scrape_synopsis due to raise_for_status()
            print(f'[ERROR] Synopsis scraping failed for slug: {slug}, path: {path_type}') # Updated detail
            return jsonify({'error': 'Synopsis not found on Manga-News page (or page inaccessible)'}), 404

        print('Synopsis found and returned')
        return jsonify({'summary': synopsis})

    except Exception as e:
        import traceback
        print(f'API error in /manga-news: {e}\n{traceback.format_exc()}')
        return jsonify({'error': 'Server error processing Manga-News request', 'details': str(e)}), 500
# --- Manga-News Route --- END ---

@app.route('/extract-metadata', methods=['POST'])
def extract_metadata():
    data = request.json
    file_path = data.get('filePath')
    
    if not file_path:
        return jsonify({'error': 'Le chemin du fichier est requis.'}), 400
        
    try:
        xml_content = None
        print(f"Tentative d'extraction des métadonnées de: {file_path}")
        
        # Extraction pour fichier CBZ (ZIP)
        if file_path.endswith('.cbz'):
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_file:
                    file_list = zip_file.namelist()
                    print(f"Contenu du CBZ: {file_list}")
                    if 'ComicInfo.xml' in file_list:
                        xml_content = zip_file.read('ComicInfo.xml').decode('utf-8')
                        print("ComicInfo.xml trouvé et extrait du CBZ")
            except Exception as zip_error:
                print(f"Erreur lors de l'extraction du fichier ZIP: {zip_error}")
                    
        # Extraction pour fichier CBR (RAR)
        elif file_path.endswith('.cbr'):
            try:
                with rarfile.RarFile(file_path) as rar_file:
                    file_list = rar_file.namelist()
                    print(f"Contenu du CBR: {file_list}")
                    if 'ComicInfo.xml' in file_list:
                        xml_content = rar_file.read('ComicInfo.xml').decode('utf-8')
                        print("ComicInfo.xml trouvé et extrait du CBR")
            except Exception as rar_error:
                print(f"Erreur lors de l'extraction du fichier RAR: {rar_error}")
                    
        if xml_content:
            # Parser le XML en dictionnaire pour le retourner comme JSON
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_content)
            metadata = {}
            
            # Extraire tous les éléments du XML
            for child in root:
                if child.text and child.text.strip():
                    metadata[child.tag] = child.text.strip()
            
            print(f"Métadonnées extraites avec succès: {metadata}")
            return jsonify({'metadata': metadata})
        else:
            print("Aucune métadonnée ComicInfo.xml trouvée.")
            return jsonify({'message': 'Aucune métadonnée ComicInfo.xml trouvée.'}), 404
            
    except Exception as e:
        print(f"Erreur lors de l'extraction des métadonnées: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)