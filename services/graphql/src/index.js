const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const registerWithConsul = require("./config/consul");
const PingLog = require("./models/pinglog.model");

// GraphQL Schema as a string (not using gql tag)
const typeDefs = `
  type PingEntry {
    statusCode: Int
    latencyMs: Int
    isUp: Boolean!
    error: String
    createdAt: String
  }

  type EndpointStat {
    endpointId: String!
    totalPings: Int
    upPings: Int
    downPings: Int
    uptimePercent: Float
    avgLatencyMs: Float
    p95LatencyMs: Float
    lastPing: String
  }

  type Query {
    endpointStats(endpointId: String!): EndpointStat
    uptimeSummary: [EndpointStat!]!
    recentPings(endpointId: String!, limit: Int): [PingEntry!]!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    endpointStats: async (_, { endpointId }, { userId }) => {
      const pings = await PingLog.find({
        endpointId,
        userId,
      }).sort({ createdAt: -1 });

      if (pings.length === 0) {
        return {
          endpointId,
          totalPings: 0,
          upPings: 0,
          downPings: 0,
          uptimePercent: 0,
          avgLatencyMs: 0,
          p95LatencyMs: 0,
        };
      }

      const upPings = pings.filter((p) => p.isUp).length;
      const downPings = pings.length - upPings;
      const latencies = pings.map((p) => p.latencyMs).sort((a, b) => a - b);
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const p95Index = Math.ceil(latencies.length * 0.95) - 1;
      const p95Latency = latencies[p95Index] || 0;

      return {
        endpointId,
        totalPings: pings.length,
        upPings,
        downPings,
        uptimePercent: Math.round((upPings / pings.length) * 10000) / 100,
        avgLatencyMs: Math.round(avgLatency),
        p95LatencyMs: p95Latency,
        lastPing: pings[0].createdAt,
      };
    },

    uptimeSummary: async (_, __, { userId }) => {
      const pings = await PingLog.find({ userId }).sort({ createdAt: -1 });

      const grouped = {};
      pings.forEach((ping) => {
        const key = ping.endpointId.toString();
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(ping);
      });

      return Object.entries(grouped).map(([endpointId, endpointPings]) => {
        const upPings = endpointPings.filter((p) => p.isUp).length;
        const downPings = endpointPings.length - upPings;
        const latencies = endpointPings.map((p) => p.latencyMs).sort((a, b) => a - b);
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const p95Index = Math.ceil(latencies.length * 0.95) - 1;
        const p95Latency = latencies[p95Index] || 0;

        return {
          endpointId,
          totalPings: endpointPings.length,
          upPings,
          downPings,
          uptimePercent: Math.round((upPings / endpointPings.length) * 10000) / 100,
          avgLatencyMs: Math.round(avgLatency),
          p95LatencyMs: p95Latency,
          lastPing: endpointPings[0].createdAt,
        };
      });
    },

    recentPings: async (_, { endpointId, limit = 20 }, { userId }) => {
      return PingLog.find({ endpointId, userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    },
  },
};

const startServer = async () => {
  await connectDB();

  const server = new ApolloServer({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 3003 },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("No token provided");
      }

      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id };
      } catch (err) {
        throw new Error("Invalid or expired token");
      }
    },
  });

  console.log(`GraphQL service running at ${url}`);
  await registerWithConsul();
};

startServer().catch((err) => {
  console.error("GraphQL startup error:", err);
  process.exit(1);
});