const express = require("express");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "graphql-service" });
});

app.listen(PORT, () => {
  console.log(`GraphQL service running on port ${PORT}`);
});