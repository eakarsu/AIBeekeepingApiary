'use strict';
const { AsyncLocalStorage } = require('node:async_hooks');
const jwt = require('jsonwebtoken');
const executions = new AsyncLocalStorage();
const failure = (status,message) => Object.assign(new Error(message),{status});
const sourceTables = { hive_id:'hives',apiary_id:'apiaries',queen_id:'queens',outbreak_id:'disease_outbreaks' };
function activeExecution() { return executions.getStore(); }
function ensureActive(context=activeExecution()) {
  if (!context) return;
  if (context.timedOut) throw failure(504,'The native AI request timed out. Please retry.');
  if (context.controller.signal.aborted || context.req.aborted || context.res.destroyed) throw failure(499,'Request cancelled');
}
async function freshRequestActor(req,db,lock=false) {
  let token;
  try { token=jwt.verify(String(req.headers.authorization||'').replace(/^Bearer\s+/i,''),process.env.JWT_SECRET); }
  catch (_) { throw failure(401,'Invalid or expired token'); }
  const actor=(await db.query('SELECT id,email,role FROM users WHERE id=$1'+(lock?' FOR SHARE':''),[token.id])).rows[0];
  if (!actor || actor.email!==token.email || actor.role!==token.role) throw failure(401,'Your account identity has changed. Please sign in again.');
  // Native source collections are shared with authorized app users. Verify the actual
  // business key; do not invent ownership for legacy records without an owner column.
  for (const [key,table] of Object.entries(sourceTables)) {
    const value=req.body?.[key];if(value===undefined||value===null||value==='')continue;
    if(typeof value!=='string'||value.length>50)throw failure(400,'Invalid native '+key);
    const found=await db.query('SELECT '+key+' FROM '+table+' WHERE '+key+'=$1'+(lock?' FOR SHARE':''),[value]);
    if(!found.rows.length)throw failure(404,'The selected '+key.replaceAll('_',' ')+' no longer exists. Reload actual source records.');
  }
  return actor;
}
function createAIExecutionMiddleware({pool,timeoutMs=45000}) {
  return (req,res,next)=>{
    if(req.method!=='POST')return next();
    const context={req,res,controller:new AbortController(),timedOut:false,pool};
    const disconnect=()=>{if(!res.writableEnded)context.controller.abort();cleanup();};
    const timer=setTimeout(()=>{context.timedOut=true;context.controller.abort();},timeoutMs);
    function cleanup(){clearTimeout(timer);req.removeListener('aborted',disconnect);res.removeListener('close',disconnect);res.removeListener('finish',cleanup);}
    req.on('aborted',disconnect);res.on('close',disconnect);res.on('finish',cleanup);
    executions.run(context,()=>next());
  };
}
async function saveAIResult(pool,feature,input,output,afterSave) {
  const context=activeExecution();ensureActive(context);
  const client=await pool.connect();let committed=false,clientEnd;
  const interrupt=()=>{if(!committed&&!clientEnd)clientEnd=client.end().catch(()=>{});};
  context?.controller.signal.addEventListener('abort',interrupt,{once:true});
  try {
    ensureActive(context);await client.query('BEGIN');
    if(context)await freshRequestActor(context.req,client,true);
    ensureActive(context);await client.query('INSERT INTO ai_results (feature,input,output) VALUES ($1,$2,$3)',[feature,input||{},output||{}]);
    if(afterSave)await afterSave(client);
    ensureActive(context);if(context)await freshRequestActor(context.req,client,true);ensureActive(context);
    await client.query('COMMIT');committed=true;
  } catch(error) {
    if(!clientEnd)await client.query('ROLLBACK').catch(()=>{});
    ensureActive(context);throw Object.assign(error,{status:error.status||503});
  } finally {
    context?.controller.signal.removeEventListener('abort',interrupt);
    if(clientEnd)await clientEnd;
    client.release(Boolean(clientEnd));
  }
}
module.exports={activeExecution,ensureActive,freshRequestActor,createAIExecutionMiddleware,saveAIResult};
