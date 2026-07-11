# FoodRoute

A smart food security routing platform for Ontario. FoodRoute helps both **government planners** optimize food bank placement and **households** find the best food bank based on their needs, live traffic, and real-time demand.

> Rebuilt from [ERoute](https://github.com/phintruong/ERoute) (Hack Canada 2025) — same architecture, food-bank flavored.

## Features

### Civilian Mode (Household Routing)
- **Location detection** via browser geolocation or postal code geocoding (Mapbox)
- **Household intake** — household size, children, accessibility needs, urgency note
- **Needs intake** — preferred language(s), dietary needs (halal/kosher/vegetarian/gluten-free), cultural food preference, free text
- **AI-powered need classification** — Claude (Sonnet 5) classifies urgency as critical / high / moderate
- **Multi-factor smart routing** that scores every food bank using:
  - **Live driving time** via Mapbox Directions API (`driving-traffic` profile)
  - **Time-of-day traffic patterns** — rush hour penalties
  - **Demand adjustments** — projects wait based on hourly demand patterns
  - **Food bank capacity** — penalizes food banks near capacity
  - **Language / dietary fit** — matches household needs to food bank offerings
  - **Urgency-based weight profiles** — critical households prioritize drive time; moderate-urgency households prioritize lowest total wait
- **Top 3 recommendations** with driving time, wait time, total estimated time, and reasoning
- **Route visualization** on the map
- **211 Ontario button** for critical-urgency cases (community & social services referral line)

### Government Mode (Food Bank Planning)
- **Interactive map** — click to place a proposed new food bank
- **Capacity slider**
- **Voronoi simulation** — recalculates client distribution across the network
- **Before/after analysis** — shows demand impact on every existing food bank
- **Flow arcs** — visualizes client redistribution on the map

### Map Visualization
- **Mapbox GL** with dark theme and 3D building extrusions
- **Food bank demand circles** — color-coded by capacity (green → yellow → orange → red)

### 3D Building Editor (`/editor`)
- Create and edit 3D building models with React Three Fiber (inherited from ERoute — still labeled with some hospital-editor internals; safe to use, cosmetic-only polish pending)
- Export to GLB format for map integration

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Maps**: Mapbox GL
- **AI**: Anthropic Claude (Sonnet 5) — need classification
- **Database**: MongoDB (food banks, demand snapshots)
- **3D**: React Three Fiber + Three.js
- **Animations**: Framer Motion
- **GIS**: Turf.js, Mapbox Directions API

## Setup

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)

### Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your own keys (MongoDB URI, Anthropic API key, Mapbox token).

### Install & Run
```
npm install
npm run dev
```

### Seed the Database
After starting the dev server, seed food banks and demand data:
```
curl -X POST http://localhost:3000/api/foodroute/seed
```

### Pages
| Route     | Description                                         |
| --------- | ---------------------------------------------------- |
| `/`       | Landing page with hero and feature carousel          |
| `/map`    | Main FoodRoute map with civilian & government modes  |
| `/editor` | 3D building editor                                   |

### API Endpoints
| Endpoint                    | Method | Description                              |
| ---------------------------- | ------ | ----------------------------------------- |
| `/api/foodroute/foodbanks`  | GET    | Fetch food banks by city                  |
| `/api/foodroute/demand`     | GET    | Get real-time food bank demand data       |
| `/api/foodroute/needs`      | POST   | AI-powered need urgency classification    |
| `/api/foodroute/route`      | POST   | Smart multi-factor food bank routing      |
| `/api/foodroute/simulate`   | POST   | Voronoi simulation for new site placement |
| `/api/foodroute/seed`       | POST   | Seed database with GTA food banks         |
| `/api/foodroute/converse`   | POST   | Voice-driven conversational intake        |

## Routing Algorithm
```
score = w_drive * drivingTime + w_wait * adjustedWaitTime + w_demand * demandPenalty + w_fit * fitMismatch
```

**Weights by urgency:**

| Factor     | Critical | High | Moderate |
| ---------- | -------- | ---- | -------- |
| Drive time | 5.0      | 2.0  | 1.0      |
| Wait time  | 0.5      | 3.0  | 4.0      |
| Demand     | 0.3      | 1.5  | 2.0      |
| Fit        | 3.0      | 1.5  | 0.5      |

- **Critical**: Get to the nearest food bank as fast as possible
- **High**: Balance drive time with demand
- **Moderate**: Minimize total time (drive + wait), prefer best language/dietary fit

## Food Banks (GTA mock data)
12 food banks across Toronto, Mississauga, Brampton, Markham, and Vaughan with language and dietary tags — see `lib/foodroute/mockData.ts`. Swap for a real API/dataset whenever you're ready.

## Known follow-ups
- `/editor` (3D building editor), voice utilities, and sound design were carried over from ERoute mostly as-is — functional, but some internal variable names and labels still reference "hospital" terminology. Safe to use; cosmetic polish pending.
