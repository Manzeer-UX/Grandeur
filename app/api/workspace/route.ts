import {read,write} from '../../../lib/store.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(read())}catch{return Response.json({error:'Unable to read local workspace.'},{status:500})}}
export async function POST(request:Request){try{const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origin not allowed.'},{status:403});const input=await request.json();return Response.json(write(input));}catch(e){return Response.json({error:e instanceof Error?e.message:'Unable to save.'},{status:400})}}
