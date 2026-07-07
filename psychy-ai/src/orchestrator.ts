import { GoogleGenAI } from '@google/genai';
import { ToolRegistry } from './tools';
import { Socket } from 'socket.io';

export interface IDEContext {
  activeFile?: string;
  cursorPosition?: { line: number; column: number };
  openFiles?: string[];
  workspaceRoot?: string;
}

export class AgentOrchestrator {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({});
  }

  async execute(prompt: string, context?: IDEContext, socket?: Socket): Promise<string> {
    console.log(`Executing ReAct Loop for prompt: "${prompt}"`);

    // Basic Routing Logic (Sub-Agents)
    let agentRole = "Elite AI Engineering Agent";
    let additionalInstructions = "";
    
    if (prompt.toLowerCase().includes("design") || prompt.toLowerCase().includes("ui")) {
      agentRole = "UX/UI Design Agent";
      additionalInstructions = "Focus on aesthetic, accessible, and responsive design. You may use visual generation tools if available.";
      if (socket) socket.emit('agent_status', { message: 'Routing to UX/UI Design Agent...' });
    } else if (prompt.toLowerCase().includes("deploy") || prompt.toLowerCase().includes("server")) {
      agentRole = "DevOps & SRE Agent";
      additionalInstructions = "Focus on security, zero-downtime deployments, and infrastructure stability. ALWAYS ask for approval before applying infrastructure changes.";
      if (socket) socket.emit('agent_status', { message: 'Routing to DevOps & SRE Agent...' });
    }

    const systemInstruction = `
      You are an ${agentRole} embedded in an IDE.
      ${additionalInstructions}
      Your goal is to complete the user's task by planning and using tools to explore, edit, and run code.
      Current IDE State: ${JSON.stringify(context, null, 2)}
      You have access to tools for interacting with the file system and terminal.
      Use them to reason about the codebase and make modifications.
    `;

    try {
      const tools = [{
        functionDeclarations: [
          { name: 'read_file', description: 'Read a file', parameters: { type: 'OBJECT', properties: { filePath: { type: 'STRING' } }, required: ['filePath'] } },
          { name: 'write_file', description: 'Write a file', parameters: { type: 'OBJECT', properties: { filePath: { type: 'STRING' }, content: { type: 'STRING' } }, required: ['filePath', 'content'] } },
          { name: 'list_dir', description: 'List a directory', parameters: { type: 'OBJECT', properties: { dirPath: { type: 'STRING' } }, required: ['dirPath'] } },
          { name: 'run_command', description: 'Run a shell command', parameters: { type: 'OBJECT', properties: { command: { type: 'STRING' }, cwd: { type: 'STRING' } }, required: ['command'] } },
          { name: 'semantic_search', description: 'Search AI memory for codebase context', parameters: { type: 'OBJECT', properties: { query: { type: 'STRING' } }, required: ['query'] } },
          { name: 'memorize_file', description: 'Embed and store a file into memory', parameters: { type: 'OBJECT', properties: { filePath: { type: 'STRING' } }, required: ['filePath'] } }
        ]
      }];

      let chatSession = this.ai.chats.create({
        model: 'gemini-2.5-pro',
        config: { systemInstruction, tools: tools as any }
      });

      if (socket) socket.emit('agent_status', { message: 'Thinking...' });
      let response = await chatSession.sendMessage({ message: prompt });
      
      let loopCount = 0;
      const MAX_LOOPS = 15;

      while (response.functionCalls && response.functionCalls.length > 0 && loopCount < MAX_LOOPS) {
        loopCount++;
        const functionResponses = [];

        for (const call of response.functionCalls) {
          const toolName = call.name || 'unknown';
          const toolArgs = call.args || {};
          console.log(`Agent called tool: ${toolName}`);
          if (socket) socket.emit('agent_action', { tool: toolName, args: toolArgs });
          
          let result;
          try {
            // Approval Gate for destructive actions
            if (toolName === 'run_command') {
              const commandArg = (toolArgs as any).command || '';
              const approved = await this.requestUserApproval(socket, commandArg);
              if (!approved) {
                result = 'User rejected this command. The command was NOT executed. Please formulate an alternative plan or ask the user for clarification.';
              } else {
                result = await ToolRegistry.run_command.execute(toolArgs as any);
              }
            } else {
              const tool = (ToolRegistry as any)[toolName];
              if (tool) result = await tool.execute(toolArgs);
              else result = `Error: Tool ${toolName} not found.`;
            }
          } catch (e: any) {
             result = `Tool execution failed: ${e.message}`;
          }
          
          functionResponses.push({
            functionResponse: { name: toolName, response: { result } }
          });
        }
        
        if (socket) socket.emit('agent_status', { message: 'Processing tool results...' });
        response = await chatSession.sendMessage({ message: functionResponses as any });
      }

      if (loopCount >= MAX_LOOPS) {
        return 'Execution terminated: Reached maximum iterations. Last message: ' + (response.text || 'None');
      }

      return response.text || "Execution completed with no text output.";
      
    } catch (error: any) {
       throw error;
    }
  }

  private requestUserApproval(socket: Socket | undefined, command: string): Promise<boolean> {
    if (!socket) return Promise.resolve(true); // Auto-approve if no socket attached
    
    return new Promise((resolve) => {
      socket.emit('request_approval', {
        message: `The agent wants to execute: ${command}`,
        command
      });

      const onApprove = (data: { approved: boolean }) => {
        socket.off('approval_response', onApprove);
        resolve(data.approved);
      };
      
      socket.on('approval_response', onApprove);
    });
  }
}

