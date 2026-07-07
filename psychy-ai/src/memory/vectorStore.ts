import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';

interface EmbeddedDocument {
  id: string;
  text: string;
  metadata: { filePath: string; type: string };
  embedding: number[];
}

export class VectorStore {
  private ai: GoogleGenAI;
  private storePath: string;
  private documents: EmbeddedDocument[] = [];

  constructor() {
    this.ai = new GoogleGenAI({});
    this.storePath = path.join(process.cwd(), '.psychy_ai_memory.json');
  }

  async init() {
    try {
      const data = await fs.readFile(this.storePath, 'utf-8');
      this.documents = JSON.parse(data);
      console.log(`Loaded ${this.documents.length} embedded documents from memory.`);
    } catch (e) {
      console.log('No existing vector store found, starting fresh.');
      this.documents = [];
    }
  }

  private async save() {
    await fs.writeFile(this.storePath, JSON.stringify(this.documents), 'utf-8');
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async embedAndStore(text: string, metadata: { filePath: string; type: string }) {
    console.log(`Generating embedding for ${metadata.filePath}...`);
    const response = await this.ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text
    });
    
    if (response.embeddings && response.embeddings[0].values) {
      this.documents.push({
        id: Math.random().toString(36).substring(7),
        text,
        metadata,
        embedding: response.embeddings[0].values
      });
      await this.save();
      return true;
    }
    return false;
  }

  async semanticSearch(query: string, topK: number = 3): Promise<EmbeddedDocument[]> {
    console.log(`Searching memory for: "${query}"...`);
    const response = await this.ai.models.embedContent({
      model: 'text-embedding-004',
      contents: query
    });

    const queryEmbedding = response.embeddings?.[0].values;
    if (!queryEmbedding) return [];

    const scoredDocs = this.documents.map(doc => ({
      doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK).map(sd => sd.doc);
  }
}
