// pdf-processor.ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import pdfParse from 'npm:pdf-parse';

export async function processPDF(storagePath: string): Promise<{
  extractedText: string;
  pageCount: number;
  fileSize: number;
  processedAt: string;
  error?: string;
}> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    // Download the PDF file from storage
    const { data, error } = await supabase.storage.from('documents').download(storagePath);
    if (error || !data) {
      throw new Error('Failed to download PDF: ' + (error?.message || 'Unknown error'));
    }
    // Read the file as ArrayBuffer
    const buffer = await data.arrayBuffer();
    const uint8 = new Uint8Array(buffer);
    // Extract text using pdf-parse
    const parsed = await pdfParse(uint8);
    return {
      extractedText: parsed.text,
      pageCount: parsed.numpages,
      fileSize: uint8.byteLength,
      processedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('PDF processing failed:', err);
    return {
      extractedText: '',
      pageCount: 0,
      fileSize: 0,
      processedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
    };
  }
} 