# NEXDEALS

Plataforma inteligente de ofertas y comparación de videojuegos (Steam + Epic Games).

## Estructura
- `backend/` Spring Boot 3 (Java 21)
- `frontend/` React + Vite + TypeScript + Tailwind
- `docker-compose.yml`

## Ejecutar en desarrollo

### Backend
Requiere Java 21 y Maven.

```bash
cd backend
mvn spring-boot:run
```
Backend en http://localhost:8080. Swagger: http://localhost:8080/swagger-ui.html
H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:file:./data/nexdeals)

Credenciales admin por defecto: admin@nexdeals.com / admin123

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend en http://localhost:5173 (proxy /api -> 8080)

## Producción (Docker)
```bash
docker compose up --build
```

## Descarga (Windows)
Última versión:
https://github.com/Bryanmgomez/nexdeals/releases/latest/download/NEXDEALS-1.0.Setup.exe

Nota: el nombre exacto del instalador puede incluir el número de versión; consulta GitHub Releases para versiones anteriores.

## Variables de entorno
- `STEAM_API_KEY` (opcional, no requerido para endpoints públicos usados)
- `OPENAI_API_KEY` (opcional, para NEX AI con OpenAI; sin ella usa modo heurístico)
- `JWT_SECRET`
- `DB_*` para PostgreSQL

## Integraciones
- Steam: Store API pública (appdetails, storesearch, featuredcategories). Precios reales por región.
- Epic Games: promociones públicas de freeGamesPromotions. Comparación de precios Epic limitada a ofertas promocionales disponibles; si no hay datos se muestra "No disponible".

## Pruebas
```bash
cd backend && mvn test
cd frontend && npm run build
```

## Limitaciones honestas
- Las notificaciones push/email requieren configuración de Firebase/SMTP (no incluida por defecto).
- El modo de desarrollo usa H2; producción usa PostgreSQL.
- Epic no expone API pública completa de precios; solo promociones.