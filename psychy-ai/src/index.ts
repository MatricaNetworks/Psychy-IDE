import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { AgentOrchestrator } from './orchestrator';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const orchestrator = new AgentOrchestrator();

io.on('connection', (socket: Socket) => {
  console.log(`IDE Client connected: ${socket.id}`);

  socket.on('execute', async (data) => {
    const { prompt, context } = data;
    console.log(`Received execution request: ${prompt}`);
    
    try {
      // Pass the socket to orchestrator for streaming and approvals
      const result = await orchestrator.execute(prompt, context, socket);
      socket.emit('execution_complete', { success: true, result });
    } catch (error: any) {
      console.error('Orchestration error:', error);
      socket.emit('execution_complete', { success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`IDE Client disconnected: ${socket.id}`);
  });
});

import { vectorStore } from './tools';

vectorStore.init().then(() => {
  httpServer.listen(port, () => {
    console.log(`🚀 Psychy-AI Agentic Orchestrator (Socket.IO + Memory) running on http://localhost:${port}`);
  });
});
