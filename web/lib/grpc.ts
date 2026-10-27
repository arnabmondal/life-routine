import 'server-only';
import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';
const definition=loader.loadSync('/proto/routine.proto',{keepCase:false,defaults:true});
const pkg=grpc.loadPackageDefinition(definition) as any;
const client=new pkg.routine.RoutineService(process.env.GRPC_ADDRESS||'localhost:50051',grpc.credentials.createInsecure());
export function call(method:string,request:Record<string,unknown>={}) {return new Promise<any>((resolve,reject)=>client[method](request,{deadline:Date.now()+10000},(error:Error|null,result:unknown)=>error?reject(error):resolve(result)));}
