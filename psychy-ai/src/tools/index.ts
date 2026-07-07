import { FileSystemTools } from './filesystem';
import { TerminalTools } from './terminal';
import { VectorStore } from '../memory/vectorStore';

export const vectorStore = new VectorStore();
// In a real app, you would call vectorStore.init() on server start

export const ToolRegistry = {
  read_file: {
    description: 'Read the contents of a file',
    execute: async (args: { filePath: string }) => FileSystemTools.readFile(args.filePath)
  },
  write_file: {
    description: 'Write content to a file',
    execute: async (args: { filePath: string; content: string }) => FileSystemTools.writeFile(args.filePath, args.content)
  },
  list_dir: {
    description: 'List the contents of a directory',
    execute: async (args: { dirPath: string }) => FileSystemTools.listDir(args.dirPath)
  },
  run_command: {
    description: 'Run a shell command in the terminal',
    execute: async (args: { command: string; cwd?: string }) => TerminalTools.runCommand(args.command, args.cwd)
  },
  semantic_search: {
    description: 'Search the AI Long-Term Memory (vector database) for codebase context, past decisions, or relevant files.',
    execute: async (args: { query: string }) => {
      const results = await vectorStore.semanticSearch(args.query);
      if (results.length === 0) return "No relevant memory found.";
      return results.map((r: any) => `[File: ${r.metadata.filePath}]\n${r.text}`).join('\n\n');
    }
  },
  memorize_file: {
    description: 'Embed and store a file into Long-Term Memory so you can recall it later.',
    execute: async (args: { filePath: string }) => {
      const content = await FileSystemTools.readFile(args.filePath);
      const success = await vectorStore.embedAndStore(content, { filePath: args.filePath, type: 'code' });
      return success ? `Successfully memorized ${args.filePath}` : `Failed to memorize ${args.filePath}`;
    }
  }
};
