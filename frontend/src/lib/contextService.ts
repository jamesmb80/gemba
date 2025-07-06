import { supabase } from './supabaseClient';
import { Document } from '../types/document';
import { ChatSession, ChatMessage } from './api';

export interface ContextData {
  manualExcerpts: ManualExcerpt[];
  chatHistory: ChatHistorySummary[];
  relevanceScore: number;
}

export interface ManualExcerpt {
  documentId: string;
  filename: string;
  excerpt: string;
  relevanceScore: number;
  pageNumber?: number;
}

export interface ChatHistorySummary {
  sessionId: string;
  date: string;
  summary: string;
  relevantMessages: string[];
  resolution?: string;
}

/**
 * Retrieves relevant context from manuals and chat history for AI chat
 */
export class ContextService {
  private static readonly MAX_MANUAL_EXCERPTS = 5;
  private static readonly MAX_CHAT_HISTORY = 3;
  private static readonly EXCERPT_LENGTH = 500;

  /**
   * Get comprehensive context for a machine based on user query
   */
  static async getContextForQuery(
    machineId: string,
    userQuery: string,
    currentSessionId?: string
  ): Promise<ContextData> {
    const [manualExcerpts, chatHistory] = await Promise.all([
      this.getRelevantManualExcerpts(machineId, userQuery),
      this.getRelevantChatHistory(machineId, userQuery, currentSessionId),
    ]);

    const relevanceScore = this.calculateRelevanceScore(manualExcerpts, chatHistory);

    return {
      manualExcerpts,
      chatHistory,
      relevanceScore,
    };
  }

  /**
   * Search for relevant manual excerpts based on user query
   */
  private static async getRelevantManualExcerpts(
    machineId: string,
    userQuery: string
  ): Promise<ManualExcerpt[]> {
    try {
      // Get all documents for the machine with extracted text
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('machine_id', machineId)
        .eq('processing_status', 'completed')
        .not('extracted_text', 'is', null);

      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }

      if (!documents || documents.length === 0) {
        return [];
      }

      // Extract keywords from user query for better matching
      const keywords = this.extractKeywords(userQuery);
      const excerpts: ManualExcerpt[] = [];

      for (const doc of documents) {
        const relevantExcerpts = this.findRelevantExcerpts(
          doc,
          keywords,
          userQuery
        );
        excerpts.push(...relevantExcerpts);
      }

      // Sort by relevance score and take top results
      return excerpts
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, this.MAX_MANUAL_EXCERPTS);
    } catch (error) {
      console.error('Error getting manual excerpts:', error);
      return [];
    }
  }

  /**
   * Get relevant chat history for context
   */
  private static async getRelevantChatHistory(
    machineId: string,
    userQuery: string,
    currentSessionId?: string
  ): Promise<ChatHistorySummary[]> {
    try {
      // Get recent chat sessions for the machine (excluding current session)
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('machine_id', machineId)
        .neq('id', currentSessionId || '')
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionError || !sessions) {
        console.error('Error fetching chat sessions:', sessionError);
        return [];
      }

      const keywords = this.extractKeywords(userQuery);
      const historySummaries: ChatHistorySummary[] = [];

      for (const session of sessions) {
        const { data: messages, error: messageError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('timestamp', { ascending: true });

        if (messageError || !messages) {
          continue;
        }

        const summary = this.createChatHistorySummary(
          session,
          messages,
          keywords
        );

        if (summary && summary.relevantMessages.length > 0) {
          historySummaries.push(summary);
        }
      }

      return historySummaries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, this.MAX_CHAT_HISTORY);
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  /**
   * Extract keywords from user query for better context matching
   */
  private static extractKeywords(query: string): string[] {
    // Remove common words and extract meaningful terms
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with',
      'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that',
      'these', 'those', 'what', 'how', 'when', 'where', 'why', 'who'
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Find relevant excerpts in a document based on keywords
   */
  private static findRelevantExcerpts(
    document: Document,
    keywords: string[],
    originalQuery: string
  ): ManualExcerpt[] {
    if (!document.extracted_text) {
      return [];
    }

    const text = document.extracted_text.toLowerCase();
    const excerpts: ManualExcerpt[] = [];

    // Find sections containing keywords
    for (const keyword of keywords) {
      const keywordIndex = text.indexOf(keyword.toLowerCase());
      if (keywordIndex !== -1) {
        const startIndex = Math.max(0, keywordIndex - this.EXCERPT_LENGTH / 2);
        const endIndex = Math.min(text.length, keywordIndex + this.EXCERPT_LENGTH / 2);
        const excerpt = document.extracted_text.substring(startIndex, endIndex);
        
        // Calculate relevance score based on keyword frequency and position
        const keywordCount = keywords.filter(k => 
          excerpt.toLowerCase().includes(k.toLowerCase())
        ).length;
        
        const relevanceScore = this.calculateExcerptRelevance(
          excerpt,
          keywords,
          originalQuery
        );

        excerpts.push({
          documentId: document.id,
          filename: document.filename,
          excerpt: excerpt.trim(),
          relevanceScore,
          pageNumber: undefined, // Could be enhanced with page number extraction
        });
      }
    }

    // Remove duplicates and return top excerpts
    const uniqueExcerpts = excerpts.filter((excerpt, index, self) => 
      index === self.findIndex(e => e.excerpt === excerpt.excerpt)
    );

    return uniqueExcerpts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Max 3 excerpts per document
  }

  /**
   * Calculate relevance score for an excerpt
   */
  private static calculateExcerptRelevance(
    excerpt: string,
    keywords: string[],
    originalQuery: string
  ): number {
    const lowerExcerpt = excerpt.toLowerCase();
    const lowerQuery = originalQuery.toLowerCase();
    
    let score = 0;
    
    // Exact query match gets highest score
    if (lowerExcerpt.includes(lowerQuery)) {
      score += 100;
    }
    
    // Keyword matches
    for (const keyword of keywords) {
      const keywordCount = (lowerExcerpt.match(new RegExp(keyword, 'g')) || []).length;
      score += keywordCount * 10;
    }
    
    // Bonus for technical terms (error codes, model numbers, etc.)
    const technicalTerms = /\b(error|code|model|part|serial|maintenance|repair|troubleshoot|fix|problem|issue)\b/gi;
    const technicalMatches = (lowerExcerpt.match(technicalTerms) || []).length;
    score += technicalMatches * 5;
    
    return score;
  }

  /**
   * Create a summary of a chat session
   */
  private static createChatHistorySummary(
    session: ChatSession,
    messages: ChatMessage[],
    keywords: string[]
  ): ChatHistorySummary | null {
    if (messages.length === 0) {
      return null;
    }

    const relevantMessages = messages
      .filter(msg => {
        const lowerText = msg.text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
      })
      .map(msg => msg.text);

    if (relevantMessages.length === 0) {
      return null;
    }

    // Find potential resolution (last AI message in the session)
    const lastAIMessage = messages
      .filter(msg => msg.sender === 'ai')
      .pop();

    const resolution = lastAIMessage && lastAIMessage.text && lastAIMessage.text.length > 100 
      ? lastAIMessage.text.substring(0, 200) + '...'
      : lastAIMessage?.text;

    // Create a brief summary of the session
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const aiMessages = messages.filter(msg => msg.sender === 'ai');
    
    const summary = `Session with ${userMessages.length} user messages and ${aiMessages.length} AI responses. ` +
      `Topics discussed: ${keywords.join(', ')}`;

    return {
      sessionId: session.id,
      date: session.created_at,
      summary,
      relevantMessages: relevantMessages.slice(0, 5), // Limit to 5 most relevant messages
      resolution,
    };
  }

  /**
   * Calculate overall relevance score for context data
   */
  private static calculateRelevanceScore(
    manualExcerpts: ManualExcerpt[],
    chatHistory: ChatHistorySummary[]
  ): number {
    const manualScore = manualExcerpts.reduce((sum, excerpt) => sum + excerpt.relevanceScore, 0);
    const historyScore = chatHistory.length * 20; // 20 points per relevant historical session
    
    return manualScore + historyScore;
  }

  /**
   * Format context data for AI prompt
   */
  static formatContextForAI(context: ContextData): string {
    let formattedContext = '';

    if (context.manualExcerpts.length > 0) {
      formattedContext += '\n\n## RELEVANT MANUAL SECTIONS:\n';
      context.manualExcerpts.forEach((excerpt, index) => {
        formattedContext += `\n### Manual ${index + 1}: ${excerpt.filename}\n`;
        formattedContext += `${excerpt.excerpt}\n`;
      });
    }

    if (context.chatHistory.length > 0) {
      formattedContext += '\n\n## PREVIOUS TROUBLESHOOTING SESSIONS:\n';
      context.chatHistory.forEach((history, index) => {
        formattedContext += `\n### Session ${index + 1} (${new Date(history.date).toLocaleDateString()}):\n`;
        formattedContext += `Summary: ${history.summary}\n`;
        if (history.resolution) {
          formattedContext += `Resolution: ${history.resolution}\n`;
        }
        if (history.relevantMessages.length > 0) {
          formattedContext += `Key messages: ${history.relevantMessages.join(' | ')}\n`;
        }
      });
    }

    if (formattedContext) {
      formattedContext = '## CONTEXT INFORMATION:' + formattedContext;
      formattedContext += '\n\n## INSTRUCTIONS:\n';
      formattedContext += 'Use the above context information to provide more accurate and helpful responses. ';
      formattedContext += 'Reference specific manual sections or previous solutions when applicable. ';
      formattedContext += 'If the context contains a solution to a similar problem, mention it.';
    }

    return formattedContext;
  }
}