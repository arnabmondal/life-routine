import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const proto = grpc.loadPackageDefinition(protoLoader.loadSync('/proto/routine.proto',{keepCase:false,defaults:true})).routine;
const fail = (cb,err) => { console.error(err); cb({code:grpc.status.INVALID_ARGUMENT,message:err.message}); };
const activityFields='id,title,category,start_at,end_at,status,notes,completed_at,created_at';
const mapActivity = row => Object.fromEntries(Object.entries(row).map(([k,v])=>[k.replace(/_([a-z])/g,(_,x)=>x.toUpperCase()),v instanceof Date?v.toISOString():v??'']));
const mapTemplate = row => ({...row,startTime:String(row.start_time).slice(0,5),endTime:String(row.end_time).slice(0,5)});
const isDate = s => typeof s==='string' && !Number.isNaN(Date.parse(s));
const validate = a => {if(!a.title?.trim()||a.title.length>200) throw Error('Title must be 1–200 characters');if(!isDate(a.startAt)||!isDate(a.endAt)||Date.parse(a.endAt)<=Date.parse(a.startAt))throw Error('Invalid start/end time');};
const seeds=[
['Dog walk','Health','05:40','06:00'],['Breakfast / school prep','Family','07:00','07:35'],['School drop-off','Family','07:35','08:15'],['Career deep work','Career','08:45','10:45'],['AI learning','Learning','11:00','12:15'],['Lunch / short walk','Health','12:15','13:00'],['Interview / flex block','Career','13:00','14:25'],['School pickup','Family','14:25','15:15'],['Dog walk','Health','15:15','16:00'],['Reading / household','Personal','16:00','17:00'],['Protected family time','Family','17:00','21:00']
];
const workouts={1:'Upper-body weights',2:'Cycling + mobility',3:'Lower-body weights',4:'Easy run + yoga',5:'Full-body weights + calisthenics'};
const methods={
 async ListActivities({request},cb){try{if(!isDate(request.from)||!isDate(request.to))throw Error('Invalid date range');const r=await pool.query(`SELECT ${activityFields} FROM activities WHERE start_at >= $1 AND start_at < $2 ORDER BY start_at`,[request.from,request.to]);cb(null,{activities:r.rows.map(mapActivity)});}catch(e){fail(cb,e)}},
 async CreateActivity({request:a},cb){try{validate(a);const r=await pool.query(`INSERT INTO activities(title,category,start_at,end_at,notes) VALUES($1,$2,$3,$4,$5) RETURNING ${activityFields}`,[a.title.trim(),a.category||'Personal',a.startAt,a.endAt,a.notes||'']);cb(null,{activity:mapActivity(r.rows[0])});}catch(e){fail(cb,e)}},
 async UpdateActivity({request:a},cb){try{if(!['planned','completed','skipped'].includes(a.status))throw Error('Invalid status');validate(a);const r=await pool.query(`UPDATE activities SET title=$2,category=$3,start_at=$4,end_at=$5,notes=$6,status=$7,completed_at=CASE WHEN $7='completed' THEN COALESCE(completed_at,now()) ELSE NULL END WHERE id=$1 RETURNING ${activityFields}`,[a.id,a.title.trim(),a.category||'Personal',a.startAt,a.endAt,a.notes||'',a.status]);if(!r.rows.length)throw Error('Activity not found');cb(null,{activity:mapActivity(r.rows[0])});}catch(e){fail(cb,e)}},
 async DeleteActivity({request},cb){try{await pool.query('DELETE FROM activities WHERE id=$1',[request.id]);cb(null,{})}catch(e){fail(cb,e)}},
 async ListTemplates(_,cb){try{const r=await pool.query('SELECT * FROM templates ORDER BY weekday,start_time');cb(null,{templates:r.rows.map(mapTemplate)});}catch(e){fail(cb,e)}},
 async SeedTemplates(_,cb){try{for(let day=1;day<=5;day++){const items=[...seeds,['Workout: '+workouts[day],'Health','06:00','07:00']];for(const [title,category,start,end] of items){await pool.query('INSERT INTO templates(title,category,weekday,start_time,end_time) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[title,category,day,start,end]);}}const r=await pool.query('SELECT * FROM templates ORDER BY weekday,start_time');cb(null,{templates:r.rows.map(mapTemplate)});}catch(e){fail(cb,e)}},
 async GetSummary({request},cb){try{if(!isDate(request.from)||!isDate(request.to))throw Error('Invalid date range');const r=await pool.query(`SELECT category, count(*)::int planned, count(*) FILTER (WHERE status='completed')::int completed, count(*) FILTER (WHERE status='skipped')::int skipped, COALESCE(sum(extract(epoch from(end_at-start_at))/60) FILTER(WHERE status='completed'),0)::int minutes FROM activities WHERE start_at >= $1 AND start_at < $2 GROUP BY category ORDER BY category`,[request.from,request.to]);cb(null,{planned:r.rows.reduce((a,x)=>a+x.planned,0),completed:r.rows.reduce((a,x)=>a+x.completed,0),skipped:r.rows.reduce((a,x)=>a+x.skipped,0),categories:r.rows.map(({category,planned,completed,minutes})=>({category,planned,completed,minutes}))});}catch(e){fail(cb,e)}}
};
const server=new grpc.Server();server.addService(proto.RoutineService.service,methods);server.bindAsync(`0.0.0.0:${process.env.GRPC_PORT||50051}`,grpc.ServerCredentials.createInsecure(),(err,port)=>{if(err)throw err;console.log(`Routine gRPC listening on ${port}`)});
process.on('SIGTERM',async()=>{server.tryShutdown(()=>{});await pool.end();});
