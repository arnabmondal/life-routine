import {NextResponse} from 'next/server';
export function ok(data:unknown){return NextResponse.json(data)}
export function error(e:unknown){return NextResponse.json({error:e instanceof Error?e.message:'Unexpected error'},{status:400})}
