\# APIWatch 🔍



\[!\[Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org)

\[!\[Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://docker.com)

\[!\[MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://mongodb.com)

\[!\[GraphQL](https://img.shields.io/badge/GraphQL-Apollo-pink?logo=graphql)](https://apollographql.com)

\[!\[Consul](https://img.shields.io/badge/Consul-Service\_Discovery-red)](https://consul.io)

\[!\[License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)



\*\*A production-grade distributed microservices platform for monitoring the health of public and private APIs in real time.\*\*



Monitor uptime, latency, and response codes across hundreds of endpoints. Query historical health data via REST or GraphQL. Deploy with Docker. Scale independently. Discover services automatically.



!\[System Architecture](docs/architecture.png)



\## 🚀 Quick Start



\### Prerequisites

\- Docker \& Docker Compose

\- Node.js 20+ (for local development)

\- Git



\### Deploy in 30 seconds



```bash

git clone https://github.com/avk2908/apiwatch.git

cd apiwatch

docker compose up --build

```



Services will be available at:

\- \*\*API Gateway\*\*: http://localhost:3000

\- \*\*Auth Service\*\*: http://localhost:3001 (Swagger docs: `/docs`)

\- \*\*Monitor Service\*\*: http://localhost:3002

\- \*\*GraphQL Service\*\*: http://localhost:3003/graphql

\- \*\*Consul UI\*\*: http://localhost:8500



\## 📋 Features



✅ \*\*Real-time API Monitoring\*\* — Continuously ping registered endpoints every 1-60 minutes  

✅ \*\*Uptime Analytics\*\* — Query historical data via REST or GraphQL  

✅ \*\*Distributed Architecture\*\* — 4 independent microservices, scale each independently  

✅ \*\*Service Discovery\*\* — Consul-powered automatic service registry and health checks  

✅ \*\*JWT Authentication\*\* — Stateless token-based auth, bcrypt password hashing  

✅ \*\*GraphQL Analytics\*\* — Flexible queries for uptime %, latency percentiles, aggregations  

✅ \*\*Containerized\*\* — Docker Compose orchestration with health checks  

✅ \*\*Auto-documented APIs\*\* — Swagger docs generated from JSDoc comments  

✅ \*\*Production-Ready\*\* — Robust error handling, logging, horizontal scaling support  



\## 🏗️ Architecture



\### System Diagram

┌─────────────────────────────────────────────────────────────┐

│                        Client (Browser)                      │

└────────────────────────┬────────────────────────────────────┘

│ REST / GraphQL

▼

┌────────────────────────────────┐

│      API Gateway (3000)        │

│  JWT Validation + Routing      │

└──┬──────────────────┬─────┬───┘

│                  │     │

┌────▼─────┐  ┌────────▼──┐  └──────┬──────────┐

│Auth      │  │Monitor    │         │GraphQL   │

│Service   │  │Service    │         │Service   │

│(3001)    │  │(3002)     │         │(3003)    │

└────┬─────┘  └──────┬────┘         └──────┬───┘

│               │                      │

└───────────────┼──────────────────────┘

│

┌──────▼──────┐

│  MongoDB    │

│ Users       │

│ Endpoints   │

│ PingLogs    │

└─────────────┘

&#x20;      ┌──────────────────────────┐

&#x20;      │  Consul (Service Reg)    │

&#x20;      │  - Service Discovery     │

&#x20;      │  - Health Checks (10s)   │

&#x20;      └──────────────────────────┘



\### Services



| Service | Port | Purpose | Tech |

|---------|------|---------|------|

| \*\*Auth\*\* | 3001 | User registration, login, JWT issuance | Express + Mongoose + bcryptjs |

| \*\*Monitor\*\* | 3002 | Endpoint CRUD, cron-scheduled pinging, PingLog storage | Express + node-cron + axios |

| \*\*GraphQL\*\* | 3003 | Historical health analytics \& uptime queries | Apollo Server + Mongoose |

| \*\*Gateway\*\* | 3000 | Request routing, JWT validation, Consul-aware service lookup | Express + http-proxy-middleware |



\### Data Flow



1\. \*\*User Registration\*\* → Auth Service hashes password → Stores User in MongoDB → Issues JWT

2\. \*\*Register Endpoint\*\* → Gateway validates JWT → Monitor Service creates Endpoint → Cron scheduler starts

3\. \*\*Continuous Monitoring\*\* → Every N minutes, Monitor Worker pings URL → Records latency, status, uptime → Stores PingLog in MongoDB

4\. \*\*Query Analytics\*\* → Client sends GraphQL query with JWT → GraphQL Service aggregates PingLogs → Returns uptime %, latency percentiles



\## 📖 API Reference



\### REST — Auth Service



```bash

\# Register

curl -X POST http://localhost:3000/auth/register \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'



\# Response

{

&#x20; "status": "success",

&#x20; "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

&#x20; "data": {"user": {"id": "...", "name": "Alice", "email": "alice@example.com"}}

}



\# Login

curl -X POST http://localhost:3000/auth/login \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"email":"alice@example.com","password":"secret"}'



\# Get current user (requires Bearer token)

curl -X GET http://localhost:3000/auth/me \\

&#x20; -H "Authorization: Bearer eyJhbGciOi..."

```



\### REST — Monitor Service (protected)



```bash

TOKEN="eyJhbGciOi..."



\# Register endpoint

curl -X POST http://localhost:3000/endpoints \\

&#x20; -H "Authorization: Bearer $TOKEN" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"name":"GitHub API","url":"https://api.github.com","intervalMinutes":5}'



\# List endpoints

curl -X GET http://localhost:3000/endpoints \\

&#x20; -H "Authorization: Bearer $TOKEN"



\# Get endpoint + recent pings

curl -X GET http://localhost:3000/endpoints/{endpointId} \\

&#x20; -H "Authorization: Bearer $TOKEN"



\# Update endpoint

curl -X PATCH http://localhost:3000/endpoints/{endpointId} \\

&#x20; -H "Authorization: Bearer $TOKEN" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"intervalMinutes":10,"active":true}'



\# Delete endpoint

curl -X DELETE http://localhost:3000/endpoints/{endpointId} \\

&#x20; -H "Authorization: Bearer $TOKEN"

```



\### GraphQL Analytics (protected)



```graphql

\# Uptime summary for all endpoints

query {

&#x20; uptimeSummary {

&#x20;   endpointId

&#x20;   totalPings

&#x20;   upPings

&#x20;   downPings

&#x20;   uptimePercent

&#x20;   avgLatencyMs

&#x20;   p95LatencyMs

&#x20;   lastPing

&#x20; }

}



\# Stats for a specific endpoint

query {

&#x20; endpointStats(endpointId: "507f1f77bcf86cd799439011") {

&#x20;   totalPings

&#x20;   upPings

&#x20;   uptimePercent

&#x20;   avgLatencyMs

&#x20;   p95LatencyMs

&#x20; }

}



\# Recent 20 pings

query {

&#x20; recentPings(endpointId: "507f1f77bcf86cd799439011", limit: 20) {

&#x20;   statusCode

&#x20;   latencyMs

&#x20;   isUp

&#x20;   error

&#x20;   createdAt

&#x20; }

}

```



\*\*GraphQL request:\*\*

```bash

curl -X POST http://localhost:3000/graphql \\

&#x20; -H "Authorization: Bearer $TOKEN" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"query":"{ uptimeSummary { totalPings uptimePercent avgLatencyMs } }"}'

```



\### Swagger Documentation



Open: \*\*http://localhost:3001/docs\*\*



Interactive documentation for all auth endpoints with request/response examples.



\## 🔐 Security



\- \*\*JWT Authentication\*\* — Stateless token-based auth. Each request requires `Authorization: Bearer <token>` header.

\- \*\*Password Hashing\*\* — Bcryptjs with 12-round salt. Passwords never stored in plaintext.

\- \*\*User Isolation\*\* — Each user only sees their own endpoints and ping data. Enforced at service and database layers.

\- \*\*CORS\*\* — Enabled for cross-origin requests.

\- \*\*HTTPS Ready\*\* — Deploy behind Nginx/load balancer for TLS termination.



\## 📊 Monitoring \& Debugging



\### Check Service Health



```bash

\# All services registered with Consul

curl http://localhost:8500/v1/catalog/services | jq



\# Specific service status

curl http://localhost:8500/v1/health/service/auth-service | jq



\# Consul UI

open http://localhost:8500

```



\### View Logs



```bash

\# All services

docker compose logs



\# Specific service

docker compose logs auth-service

docker compose logs monitor-service



\# Follow logs

docker compose logs -f gateway-service

```



\### MongoDB Query



```bash

\# Connect to MongoDB

docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin



\# Select database

use apiwatch



\# View collections

db.getCollectionNames()



\# Query data

db.users.find()

db.endpoints.find()

db.pinglogs.find().limit(5)



\# Count pings for an endpoint

db.pinglogs.countDocuments({ isUp: true })

```



\## 🚢 Deployment



\### Docker Compose (Development)



```bash

docker compose up --build

```



All services start with health checks and auto-restart on failure.



\### Production Deployment



For production, consider:



```bash

\# Use specific image versions (not latest)

docker build -t apiwatch/auth:v1.0 services/auth



\# Push to registry

docker push apiwatch/auth:v1.0



\# Deploy with Kubernetes or Docker Swarm

kubectl apply -f k8s/

```



Key considerations:

\- Use managed MongoDB (AWS DocumentDB, MongoDB Atlas) instead of containerized

\- Run Consul cluster (3+ nodes for HA)

\- Use externalized config (environment variables, secrets manager)

\- Add load balancer (Nginx, HAProxy) in front of gateway

\- Enable logging aggregation (ELK, DataDog)

\- Set resource limits on containers

\- Use private container registry



\## 📚 Technologies



| Layer | Technology | Why |

|-------|-----------|-----|

| \*\*Language\*\* | Node.js 20 | Fast, event-driven, single-language full-stack |

| \*\*HTTP Server\*\* | Express | Minimal, battle-tested, middleware ecosystem |

| \*\*Database\*\* | MongoDB 7 | Document model suits Users, Endpoints, PingLogs |

| \*\*Graph API\*\* | Apollo Server | Type-safe, flexible querying for analytics |

| \*\*Service Discovery\*\* | Consul | Automatic registration, health checks, DNS interface |

| \*\*Authentication\*\* | JWT + bcryptjs | Stateless, scalable, secure password hashing |

| \*\*Scheduling\*\* | node-cron | Simple, in-process job scheduling |

| \*\*Container\*\* | Docker | Reproducible environments, isolation |

| \*\*Orchestration\*\* | Docker Compose | Local dev and small deployments |



\## 🔄 Data Model



\### User

```json

{

&#x20; "\_id": "ObjectId",

&#x20; "name": "string",

&#x20; "email": "string (unique)",

&#x20; "password": "string (bcrypt-hashed)",

&#x20; "createdAt": "Date",

&#x20; "updatedAt": "Date"

}

```



\### Endpoint

```json

{

&#x20; "\_id": "ObjectId",

&#x20; "name": "string",

&#x20; "url": "string",

&#x20; "intervalMinutes": "number (1-60)",

&#x20; "userId": "ObjectId (ref User)",

&#x20; "active": "boolean",

&#x20; "createdAt": "Date",

&#x20; "updatedAt": "Date"

}

```



\### PingLog

```json

{

&#x20; "\_id": "ObjectId",

&#x20; "endpointId": "ObjectId (ref Endpoint)",

&#x20; "userId": "ObjectId",

&#x20; "statusCode": "number or null",

&#x20; "latencyMs": "number",

&#x20; "isUp": "boolean",

&#x20; "error": "string or null",

&#x20; "createdAt": "Date"

}

```



\## 🧪 Testing



Run the test suite:



```bash

\# Auth service tests

docker exec auth-service npm test



\# Monitor service tests

docker exec monitor-service npm test



\# All tests

for service in auth monitor graphql gateway; do

&#x20; docker exec ${service}-service npm test

done

```



\## 📈 Performance



\- \*\*Auth\*\* — \~10ms per request (single DB query + JWT signing)

\- \*\*Monitor\*\* — \~200ms per ping (network latency to external APIs)

\- \*\*GraphQL\*\* — \~50ms aggregate query (MongoDB aggregation)

\- \*\*Gateway\*\* — \~5ms per request (just proxying)



MongoDB Indexes (auto-created on startup):

```javascript

db.users.createIndex({ email: 1 }, { unique: true })

db.endpoints.createIndex({ userId: 1 })

db.pinglogs.createIndex({ endpointId: 1, createdAt: -1 })

db.pinglogs.createIndex({ userId: 1, createdAt: -1 })

```



\## 🛣️ Roadmap



\- \[ ] Kafka event streaming for real-time alerts

\- \[ ] Redis caching for GraphQL results

\- \[ ] ML anomaly detection in latency patterns

\- \[ ] Multi-region replication

\- \[ ] Slack/PagerDuty integrations

\- \[ ] Web dashboard (React)

\- \[ ] Rate limiting \& DDoS protection

\- \[ ] Structured logging (ELK)

\- \[ ] OpenTelemetry tracing

\- \[ ] Mobile app (React Native)



\## 🤝 Contributing



Contributions welcome! Please fork, create a feature branch, and submit a pull request.



```bash

git checkout -b feature/your-feature

git commit -am "Add feature"

git push origin feature/your-feature

```



\## 📄 License



MIT License — See \[LICENSE](LICENSE) file



\## 👨‍💻 Author



Built by Amithava Varma  

\[GitHub](https://github.com/avk2908) | \[LinkedIn](https://linkedin.com/in/amithava-varma-kothapalli-86300434b)



\## 🙏 Acknowledgments



\- Inspired by Uptime Robot and Pingdom

\- Built with Node.js, MongoDB, Consul, Apollo, and Express communities

\- Designed for learning distributed systems and microservices architecture



\---



\*\*⭐ If this helped you, please star the repo!\*\*



\## Quick Reference



```bash

\# Start

docker compose up



\# Stop

docker compose down



\# Rebuild

docker compose up --build



\# View logs

docker compose logs -f



\# Access Consul

http://localhost:8500



\# Register user

curl -X POST http://localhost:3000/auth/register \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"name":"User","email":"user@example.com","password":"pass1234"}'



\# Query GraphQL

curl -X POST http://localhost:3000/graphql \\

&#x20; -H "Authorization: Bearer $TOKEN" \\

&#x20; -H "Content-Type: application/json" \\

&#x20; -d '{"query":"{ uptimeSummary { totalPings uptimePercent } }"}'

```

