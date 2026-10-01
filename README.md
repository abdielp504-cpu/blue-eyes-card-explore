# Blue-Eyes Card Explorer

Explorador de cartas de Yu-Gi-Oh! hecho con Angular y TypeScript. La colección y las búsquedas consultan directamente la API pública de YGOPRODeck; no se usan datos locales.

## Requisitos

- Node.js 20.19 o posterior
- npm

## Ejecutar

```bash
npm install
npm start
```

Abre la URL que muestra Angular CLI (por defecto, `http://localhost:4200`).

## Verificar

```bash
npm test -- --watch=false
npm run build
```

## Estructura

- `src/app/services/yugioh.service.ts`: solicitudes HTTP a YGOPRODeck.
- `src/app/models/card.model.ts`: interfaces de carta y respuesta de la API.
- `src/app/components/search`: entrada de búsqueda reactiva.
- `src/app/components/card`: tarjeta reutilizable para la cuadrícula.
- `src/app/components/card-detail`: ficha completa de una carta.
- `src/app/components/blue-eyes`: colección del arquetipo, con filtro de expansiones e historial de impresiones obtenidos de la API.
- `src/app/components/search-page`: página de búsqueda y resultados.
- `src/app/components/explorer-hero`: encabezado editorial compartido por las páginas de búsqueda y Blue-Eyes.
- `src/app/components/card-page`: detalle de carta consultado por ID.
- `src/app/utils/error-message.ts`: mensaje de error compartido por búsqueda y colección.

La búsqueda espera 400 ms después de escribir, omite términos de menos de dos caracteres y cancela solicitudes anteriores cuando cambia el término.

## Rutas

- `/`: buscador por nombre parcial.
- `/blue-eyes`: cartas del arquetipo `Blue-Eyes`.
- `/card/:id`: detalle de una carta.
