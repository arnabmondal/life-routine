import {call} from '../../../lib/grpc';import {ok,error} from '../../../lib/api';
export async function GET(){try{return ok(await call('ListTemplates'))}catch(e){return error(e)}}
export async function POST(){try{return ok(await call('SeedTemplates'))}catch(e){return error(e)}}
