import {NextRequest} from 'next/server';
import {call} from '../../../lib/grpc';import {ok,error} from '../../../lib/api';
export async function GET(req:NextRequest){try{const u=req.nextUrl.searchParams;return ok(await call('ListActivities',{from:u.get('from'),to:u.get('to')}))}catch(e){return error(e)}}
export async function POST(req:NextRequest){try{return ok(await call('CreateActivity',await req.json()))}catch(e){return error(e)}}
