import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabaseClient';

// This route: /api/pdf/[...path]
export async function GET(req: NextRequest, { params }: { params: { path: string[] | string } }) {
  // Defensive: handle both string[] and string (should be string[] for catch-all)
  let pathArray: string[];
  if (Array.isArray(params.path)) {
    pathArray = params.path;
  } else if (typeof params.path === 'string') {
    pathArray = [params.path];
  } else {
    return NextResponse.json({ error: 'Invalid path parameter' }, { status: 400 });
  }

  if (!pathArray.length || pathArray.some(seg => !seg)) {
    return NextResponse.json({ error: 'Missing or malformed PDF path' }, { status: 400 });
  }

  const bucket = 'documents';
  const objectKey = pathArray.join('/');

  // Debug log
  console.log('=== PDF API Route Debug ===');
  console.log('Full request URL:', req.url);
  console.log('Params received:', params);
  console.log('Path array:', pathArray);
  console.log('Supabase bucket:', bucket, 'Object key:', objectKey);
  console.log('Supabase URL (from env):', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Service Role Key (from env):', process.env.SUPABASE_SERVICE_ROLE_KEY ? '***set***' : '***missing***');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  const supabase = createSupabaseServerClient(supabaseUrl, supabaseServiceRoleKey);

  // Generate a signed URL for the PDF (60 minute expiry)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(objectKey, 3600);
  if (error) {
    console.error('Supabase createSignedUrl error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create signed URL' }, { status: 500 });
  }
  if (!data?.signedUrl) {
    return NextResponse.json({ error: 'Signed URL is undefined' }, { status: 500 });
  }

  // Fetch the PDF from the signed URL with a User-Agent and Accept header
  const pdfRes = await fetch(data.signedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/pdf',
    },
  });
  if (!pdfRes.ok) {
    const errorText = await pdfRes.text();
    console.error('Supabase fetch error:', pdfRes.status, errorText);
    return NextResponse.json({ error: 'Failed to fetch PDF from Supabase', status: pdfRes.status, details: errorText }, { status: 400 });
  }

  // Remove problematic headers and return the PDF
  const pdfBuffer = await pdfRes.arrayBuffer();
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Cache-Control': 'no-store',
      // Do NOT include X-Frame-Options or CSP headers
    },
  });
} 