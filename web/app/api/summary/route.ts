import {NextRequest} from 'next/server';import {call} from '../../../lib/grpc';import {ok,error} from '../../../lib/api';
export async function GET(req:NextRequest){try{const p=req.nextUrl.searchParams;return ok(await call('GetSummary',{from:p.get('from'),to:p.get('to')}))}catch(e){return error(e)}}
