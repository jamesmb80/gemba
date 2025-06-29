import { createClient } from 'npm:@supabase/supabase-js@2';
import { processPDF } from './pdf-processor.ts';
import { ProcessPDFRequest } from './types.ts';

Deno.serve(async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }
    const body = await req.json();
    const { storage_path, document_id } = body as ProcessPDFRequest;
    if (!storage_path || !document_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers });
    }

    // Auth context for RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Set processing status to 'processing'
    await supabase.from('documents').update({ processing_status: 'processing' }).eq('id', document_id);

    // Process the PDF
    const result = await processPDF(storage_path);

    // Update the documents table with results
    const updateData: Record<string, unknown> = {
      extracted_text: result.extractedText,
      page_count: result.pageCount,
      file_size: result.fileSize,
      processed_at: result.processedAt,
      processing_status: result.error ? 'failed' : 'completed',
    };
    if (result.error) {
      updateData['error_message'] = result.error;
    }
    await supabase.from('documents').update(updateData).eq('id', document_id);

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), { status: 500, headers });
    }
    return new Response(JSON.stringify({ message: 'PDF processed', ...result }), { status: 200, headers });
  } catch (error) {
    console.error('Error in process-pdf handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers });
  }
}); 