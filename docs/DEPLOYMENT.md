# Instrukcja wdrożenia i DevOps

Dokument zawiera kompletne instrukcje wdrożenia produkcyjnego systemu **Baza Porad** przy użyciu Dockera oraz platformy **Coolify**.

---

## 🐳 1. Architektura kontenera (Dockerfile)

Aplikacja korzysta z wieloetapowego (*multi-stage*) pliku `Dockerfile` opartego na oficjalnym obrazie `node:22-alpine`:

1. **Etap 1 (`builder`)**: Instalacja zależności, budowanie frontendu (`dist/`) oraz transpilacja serwera TypeScript (`dist-server/`).
2. **Etap 2 (`production`)**: Czysty, odchudzony obraz produkcyjny zawierający wyłącznie pliki wynikowe i zależności produkcyjne.

---

## 💾 2. Trwały magazyn danych (Persistent Storage)

> [!IMPORTANT]
> Całość stanu aplikacji (zarówno baza SQLite `synapsis.sqlite`, jak i wszystkie załączniki na dysku `uploads/attachments/`) znajduje się w jednym katalogu `/app/data`.

W kontenerze wystarczy zamontować **jeden wolumen** wskazujący na `/app/data`:
* `/app/data/synapsis.sqlite`: plik relacyjnej bazy danych SQLite.
* `/app/data/uploads/attachments/`: fizyczny katalog z załącznikami (PDF, obrazy, dokumenty).

---

## 🚀 3. Wdrożenie na platformie Coolify

Platforma Coolify zapewnia automatyczne wdrożenia, certyfikaty SSL/TLS (Let's Encrypt), monitoring kontenerów oraz automatyczny restart.

### Krok 1: Utworzenie zasobu w Coolify
1. W panelu Coolify przejdź do projektu i kliknij **+ Add Resource -> Application**.
2. Wybierz źródło: **Public Repository** lub **GitHub App** i wskaż repozytorium projektu.
3. Wybierz gałąź (np. `main`).

### Krok 2: Konfiguracja Build Pack
1. Jako metodę budowania wybierz **Docker Compose**.
2. Wskaż plik konfiguracyjny: `docker-compose.coolify.yml`.

### Krok 3: Zmienne środowiskowe (Environment Variables)
W zakładce **Environment Variables** skonfiguruj:

| Zmienna | Przykładowa wartość | Opis |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Tryb produkcyjny |
| `PORT` | `3001` | Port wewnętrzny aplikacji |
| `JWT_SECRET` | `twoj_bardzo_bezpieczny_losowy_klucz_jwt_256bit` | Klucz szyfrowania tokenów sesyjnych |
| `DATABASE_ENGINE` | `sqlite` | Domyślny silnik bazy (`sqlite` lub `postgres`) |
| `DATABASE_URL` | *(opcjonalnie)* | Ciąg połączeniowy do zewnętrznej bazy PostgreSQL |

### Krok 4: Uruchomienie (Deploy)
Kliknij **Deploy**. Coolify automatycznie utworzy nazwany wolumen `synapsis_storage`, zbuduje obraz i uruchomi aplikację pod skonfigurowaną domeną z HTTPS.

---

## 💻 4. Samodzielne uruchomienie Docker Compose (Standalone)

Jeśli wdrażasz aplikację na własnym serwerze VPS bez Coolify:

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/damadorPL/BraveUnAItedProject.git
cd BraveUnAItedProject

# 2. Skonfiguruj zmienne środowiskowe w pliku .env
cat <<EOF > .env
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_ENGINE=sqlite
EOF

# 3. Zbuduj i uruchom kontener w tle
docker compose up --build -d
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3001`.

---

## 🛡️ 5. Kopia zapasowa (Backup i Restore)

Aby utworzyć pełną kopię zapasową bazy i załączników:

```bash
# Archiwizacja całego katalogu /app/data
tar -czvf synapsis_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/
```

Przywrócenie z kopii:
```bash
tar -xzvf synapsis_backup_XXXXXX.tar.gz
```
