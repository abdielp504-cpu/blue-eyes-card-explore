# Blue-Eyes Card Explorer

Examen práctico – Aplicaciones Web (Angular)

Carrera: Ingeniería en Desarrollo y Gestión de Software

**Integrante:** Abdiel Farid Pech Tec

(Realizado de forma individual)

## Cómo ejecutarlo

Requisitos: Node.js 20.19 o posterior y npm.

```bash
npm install
ng serve
```

Abre [http://localhost:4200](http://localhost:4200).

## Qué hace

Buscar carta → Consultar API → Mostrar resultados → Ver características → Explorar Blue-Eyes → Consultar impresiones → Filtrar por expansión

La información de cartas, expansiones e impresiones se obtiene en tiempo real de la API pública de YGOPRODeck.

## Estructura

- `YugiohService`: toda la comunicación HTTP con la API de YGOPRODeck.
- `SearchComponent` / `SearchPageComponent`: buscador reactivo con RxJS y página de resultados.
- `CardComponent`: tarjeta reutilizable para mostrar resultados.
- `CardPageComponent` / `CardDetailComponent`: consulta y presentación del detalle de una carta.
- `BlueEyesComponent`: colección, expansiones, filtro e impresiones.
- `ExplorerHeroComponent`: hero compartido por las páginas principales.

## Rutas

- `/`: búsqueda de cartas por nombre.
- `/card/89631139`: detalle de carta por ID.
- `/blue-eyes`: colección del arquetipo Blue-Eyes.

## Verificar

```bash
npm test -- --watch=false
npm run build
```
