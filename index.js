import express from "express";
import { app as backend } from "./backend/build/src/app.js";
const frontend = `${process.cwd()}/frontend/dist/`;

const PORT = process.env.PORT || 3000;

const server = express();

server.use(express.static(frontend));

server.use(["/data", "/api"], backend);

server.get("/", (req, res) => res.sendFile(frontend));

// Fallback route for frontend requests
server.get("*", (req, res) => {
  if (!req.path.startsWith('/data') && !req.path.startsWith('/api')) {
    res.sendFile(frontend);
  } else {
    res.status(404)
  }
});

server.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
