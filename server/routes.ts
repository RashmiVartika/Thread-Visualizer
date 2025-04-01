import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";
import { ThreadData, ThreadState } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    perMessageDeflate: false
  });

  // Get all concepts
  app.get("/api/concepts", async (_req, res) => {
    const concepts = await storage.getConcepts();
    res.json(concepts);
  });

  // Get specific concept
  app.get("/api/concepts/:id", async (req, res) => {
    const concept = await storage.getConcept(parseInt(req.params.id));
    if (!concept) {
      res.status(404).json({ message: "Concept not found" });
      return;
    }
    res.json(concept);
  });

  // WebSocket Connection Management
  wss.on("connection", (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    let simulationInterval: NodeJS.Timeout;

    ws.on("error", (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on("close", () => {
      console.log('WebSocket connection closed');
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    });

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);

        if (message.type === "START_EXECUTION") {
          if (simulationInterval) {
            clearInterval(simulationInterval);
          }

          const numThreads = message.numThreads || 3;
          const conceptId = message.conceptId;
          const concept = await storage.getConcept(conceptId);

          // Initialize threads with roles for Producer-Consumer pattern
          let threads: ThreadData[] = [];
          if (concept?.title === "Producer-Consumer") {
            const producerCount = Math.floor(numThreads / 2);
            const consumerCount = numThreads - producerCount;

            // Create producer threads
            for (let i = 0; i < producerCount; i++) {
              threads.push({
                id: `thread-${i}`,
                name: `Thread ${i + 1}`,
                state: "NEW" as ThreadState,
                progress: 0,
                role: "PRODUCER"
              });
            }

            // Create consumer threads
            for (let i = 0; i < consumerCount; i++) {
              threads.push({
                id: `thread-${producerCount + i}`,
                name: `Thread ${producerCount + i + 1}`,
                state: "NEW" as ThreadState,
                progress: 0,
                role: "CONSUMER"
              });
            }
          } else {
            // For other concepts, create regular threads
            threads = Array.from({ length: numThreads }, (_, i) => ({
              id: `thread-${i}`,
              name: `Thread ${i + 1}`,
              state: "NEW" as ThreadState,
              progress: 0
            }));
          }

          console.log(`Starting thread simulation with ${numThreads} threads for concept ${conceptId}`);

          // Different simulation behavior based on concept
          simulationInterval = setInterval(() => {
            if (ws.readyState !== WebSocket.OPEN) {
              clearInterval(simulationInterval);
              return;
            }

            threads.forEach((thread) => {
              if (thread.state === "TERMINATED") return;

              // Concept-specific behaviors
              if (concept?.title === "Deadlock" && thread.progress > 50) {
                // Simulate deadlock by setting all threads to BLOCKED
                thread.state = "BLOCKED";
                return;
              }

              // Producer-Consumer specific behavior
              if (concept?.title === "Producer-Consumer") {
                if (thread.role === "PRODUCER" && Math.random() < 0.3) {
                  thread.state = "WAITING"; // Simulate waiting when buffer is full
                } else if (thread.role === "CONSUMER" && Math.random() < 0.3) {
                  thread.state = "WAITING"; // Simulate waiting when buffer is empty
                } else {
                  thread.state = "RUNNABLE";
                }
              } else {
                // Random state transitions for other concepts
                const random = Math.random();
                if (random < 0.2) {
                  const states: ThreadState[] = ["RUNNABLE", "BLOCKED", "WAITING"];
                  thread.state = states[Math.floor(Math.random() * states.length)];
                }
              }

              // Progress update
              if (thread.state === "RUNNABLE") {
                thread.progress += Math.random() * 15;
                if (thread.progress >= 100) {
                  thread.progress = 100;
                  thread.state = "TERMINATED";
                }
              }
            });

            try {
              ws.send(JSON.stringify({ 
                type: "THREAD_UPDATE", 
                threads,
                conceptId
              }));
            } catch (error) {
              console.error('Error sending WebSocket message:', error);
              clearInterval(simulationInterval);
            }

            // Stop simulation when all threads are terminated
            if (threads.every(t => t.state === "TERMINATED")) {
              console.log('Thread simulation completed');
              clearInterval(simulationInterval);
            }
          }, 1000);

          // Clean up interval on connection close
          ws.on("close", () => {
            if (simulationInterval) {
              clearInterval(simulationInterval);
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  });

  return httpServer;
}