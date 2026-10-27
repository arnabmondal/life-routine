import {NextRequest} from 'next/server';import {call} from '../../../../lib/grpc';import {ok,error} from '../../../../lib/api';
export async function PUT(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{return ok(await call('UpdateActivity',{...await req.json(),id:(await params).id}))}catch(e){return error(e)}}
export async function DELETE(_req:NextRequest,{params}:{params:Promise<{id:string}>}){try{return ok(await call('DeleteActivity',{id:(await params).id}))}catch(e){return error(e)}}
