import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "helpers-microservice", timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.HELPERS_PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[helpers-microservice] server listening on port ${PORT}`);
});
