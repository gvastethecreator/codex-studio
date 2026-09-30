/** V2 reference kernel. Not the production renderer, YAML serializer or persistence adapter.
 * The host validates JSON Schemas first and supplies authoritative (not imported) context.
 * prepareReferenceApply demonstrates a complete in-memory transaction with injected validators.
 */
const forbidden=new Set(['__proto__','prototype','constructor']);
const plain=v=>v!==null&&typeof v==='object'&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const cmp=(a,b)=>a<b?-1:a>b?1:0;
export function parsePointer(path){
 if(typeof path!=='string'||!/^\/(site|template|authoring)(\/|$)/.test(path)||path.length>500)throw Error('E_UNSAFE_PATH');
 return path.slice(1).split('/').map(raw=>{if(!raw||/~(?![01])/.test(raw))throw Error('E_UNSAFE_PATH');const v=raw.replace(/~1/g,'/').replace(/~0/g,'~');if(forbidden.has(v)||/[\u0000-\u001f\u007f]/.test(v))throw Error('E_UNSAFE_PATH');return v;});
}
export function pathsOverlap(a,b){const x=parsePointer(a),y=parsePointer(b);return x.slice(0,Math.min(x.length,y.length)).every((v,i)=>v===y[i]);}
function stringOk(s){for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const d=s.charCodeAt(++i);if(!(d>=0xdc00&&d<=0xdfff))throw Error('E_INVALID_UNICODE');}else if(c>=0xdc00&&c<=0xdfff)throw Error('E_INVALID_UNICODE');}return JSON.stringify(s);}
export function canonicalJson(value){
 const active=new Set();let nodes=0;
 function visit(v,d){
  if(d>30||++nodes>100000)throw Error('E_PAYLOAD_DEPTH');
  if(v===null||typeof v==='boolean')return JSON.stringify(v);
  if(typeof v==='string')return stringOk(v);
  if(typeof v==='number'&&Number.isFinite(v))return JSON.stringify(v);
  if(!Array.isArray(v)&&!plain(v))throw Error('E_NON_JSON_VALUE');
  if(active.has(v))throw Error('E_NON_JSON_VALUE');active.add(v);
  if(Object.getOwnPropertySymbols(v).length)throw Error('E_NON_JSON_VALUE');
  let result;
  if(Array.isArray(v)){
   if(v.length>100000||Object.keys(v).length!==v.length)throw Error('E_NON_JSON_VALUE');
   const items=[];for(let i=0;i<v.length;i++){const desc=Object.getOwnPropertyDescriptor(v,String(i));if(!desc||!('value'in desc))throw Error('E_NON_JSON_VALUE');items.push(visit(desc.value,d+1));}result='['+items.join(',')+']';
  }else{
   result='{'+Object.keys(v).sort(cmp).map(k=>{if(forbidden.has(k))throw Error('E_UNSAFE_KEY');const desc=Object.getOwnPropertyDescriptor(v,k);if(!('value'in desc))throw Error('E_NON_JSON_VALUE');return stringOk(k)+':'+visit(desc.value,d+1);}).join(',')+'}';
  }
  active.delete(v);return result;
 }
 return visit(value,0);
}
export async function fingerprint(value){const bytes=new TextEncoder().encode(canonicalJson(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function sourceBasis(snapshot,projectId){return {algorithm:'gvaste-source/2',projectId,site:snapshot.site,templateAuthored:snapshot.templateAuthored,retained:snapshot.retained??{}};}
export function effectiveCapabilities(registry,metadata,probes){
 return Object.entries(registry.sections??{}).sort(([a],[b])=>cmp(a,b)).flatMap(([id,e])=>{
  if(e.implementationStatus!=='implemented'||!metadata[id]||!e.template)return [];
  const declared=Array.isArray(e.implementedVariants)?e.implementedVariants:e.variants??[];
  const meta=new Set((metadata[id].variants??[]).map(x=>typeof x==='string'?x:x.id));
  const tested=new Set(probes[id]??[]);
  const variants=[...new Set(declared)].filter(v=>meta.has(v)&&tested.has(v)).sort(cmp);
  return variants.length?[{id,variants,maxInstances:1,legacy:e.semanticStatus==='legacy'}]:[];
 });
}
/** Input e comes from the HOST evidence inventory. Imported self-assertions are untrusted. */
export function eligibleEvidence(e,projectId,{verified=true,mustBePublic=false,trustedPublicEvidenceIds=[]}={}){
 if(!e||e.projectId!==projectId||e.availability!=='present')return false;
 if(verified&&!['source-verified','user-approved'].includes(e.verification))return false;
 if(['public-github','public-profile'].includes(e.type))return e.visibility==='public'&&e.verification==='source-verified'&&trustedPublicEvidenceIds.includes(e.id);
 if(mustBePublic&&e.visibility!=='public')return false;
 // For normal material, public availability and permission to publish are distinct.
 return e.publication?.status==='approved'&&typeof e.source?.contentHash==='string'&&e.publication.approvedHash===e.source.contentHash;
}
export function requirementSatisfied(req,evidence,projectId,options={},depth=0){
 if(depth>15||!plain(req))return false;
 const keys=['all','any','type'].filter(k=>Object.hasOwn(req,k));if(keys.length!==1)return false;
 if(keys[0]!=='type'){const xs=req[keys[0]];if(!Array.isArray(xs)||!xs.length||xs.length>30)return false;return keys[0]==='all'?xs.every(x=>requirementSatisfied(x,evidence,projectId,options,depth+1)):xs.some(x=>requirementSatisfied(x,evidence,projectId,options,depth+1));}
 const count=req.minCount??1;if(!Number.isInteger(count)||count<1||count>200)return false;
 const seen=new Set();for(const e of evidence){if(e.type===req.type&&eligibleEvidence(e,projectId,{...options,...req})&&(req.nonemptyDetails??[]).every(k=>typeof e.details?.[k]==='string'&&e.details[k].trim()))seen.add(e.id);}return seen.size>=count;
}
export function linkedOutput(commandId,outputId,evidence){const out=evidence.find(e=>e.id===outputId),command=evidence.find(e=>e.id===commandId);return Boolean(command?.type==='command'&&out?.type==='output'&&command.projectId===out.projectId&&(out.relations??[]).some(r=>r.type==='output-of'&&r.targetId===commandId));}
function allowed(path,paths){const x=parsePointer(path);return paths.some(p=>{const y=parsePointer(p);return y.length<=x.length&&y.every((v,i)=>v===x[i]);});}
function opPaths(op){switch(op.op){case 'set':case 'unset-template':return [op.path];case 'insert-section':case 'hide-section':case 'restore-section':return ['/site/sections',`/site/${op.sectionId}`,`/template/sections/${op.sectionId}`];case 'reorder-sections':return ['/site/sections'];case 'select-template':return ['/template'];default:return [];}}
export function guardPlan(plan,ctx){
 const errors=[];const add=(code,path)=>errors.push({code,...(path?{path}:{})});
 if(!plain(plan)||!Array.isArray(plan.sections)||!Array.isArray(plan.operations))return [{code:'E_INVALID_DOCUMENT'}];
 try{canonicalJson(plan);}catch(e){return [{code:e.message}];}
 for(const [key,code] of [['projectId','E_PROJECT_MISMATCH'],['briefId','E_STALE_BRIEF'],['sourceFingerprint','E_STALE_BASE'],['briefFingerprint','E_STALE_BRIEF'],['evidenceFingerprint','E_STALE_EVIDENCE'],['capabilitiesVersion','E_STALE_CAPABILITIES'],['engineVersion','E_STALE_ENGINE']])if(typeof ctx[key]!=='string'||plan[key]!==ctx[key])add(code);
 if(ctx.documentValid!==true)add('E_INVALID_DOCUMENT');
 if(ctx.localBinding&&(!ctx.liveBinding||canonicalJson(ctx.localBinding)!==canonicalJson(ctx.liveBinding)))add('E_LOCAL_CONFLICT');
 const caps=new Map((ctx.catalog??[]).map(c=>[c.id,c])),decisions=new Map(),evidence=new Map();
 for(const e of ctx.evidence??[]){if(evidence.has(e.id))add('E_EVIDENCE_DUPLICATE');evidence.set(e.id,e);}
 for(const s of plan.sections){
  if(!plain(s)){add('E_INVALID_DOCUMENT');continue;}if(decisions.has(s.id))add('E_DUPLICATE_SECTION');decisions.set(s.id,s);
  if(s.selection==='include'&&s.readiness==='ready'){
   if(!caps.has(s.id))add('E_SECTION_UNSUPPORTED');else if(!caps.get(s.id).variants.includes(s.variant))add('E_VARIANT_UNSUPPORTED');
   const used=(s.evidenceIds??[]).map(id=>evidence.get(id));
   for(const e of used){if(!e)add('E_EVIDENCE_MISSING');else if(e.projectId!==ctx.projectId)add('E_EVIDENCE_PROJECT');else if(!eligibleEvidence(e,ctx.projectId,{trustedPublicEvidenceIds:ctx.trustedPublicEvidenceIds??[]}))add('E_EVIDENCE_INELIGIBLE');}
   const req=ctx.requirements?.[s.id]?.[s.variant];
   if(!req)add('E_REQUIREMENT_UNKNOWN');
   if(req&&!requirementSatisfied(req,used.filter(Boolean),ctx.projectId,{trustedPublicEvidenceIds:ctx.trustedPublicEvidenceIds??[]}))add('E_EVIDENCE_MISSING');
  }
 }
 for(const op of plan.operations){
  if(!plain(op)){add('E_OPERATION_SCOPE');continue;}
  try{
   if(op.op==='set'){
    const seg=parsePointer(op.path);if(!['site','template'].includes(seg[0])||seg.length<2||pathsOverlap(op.path,'/site/sections')||!allowed(op.path,ctx.allowedSetPaths??[]))add('E_OPERATION_SCOPE',op.path);
    canonicalJson(op.value);
   }else if(op.op==='unset-template'){
    const seg=parsePointer(op.path);if(seg[0]!=='template'||seg.length<3||!allowed(op.path,ctx.allowedUnsetPaths??[]))add('E_OPERATION_SCOPE',op.path);
   }else if(['insert-section','restore-section','hide-section'].includes(op.op)){
    if(!/^[A-Za-z0-9._-]+$/.test(op.sectionId??''))add('E_UNSAFE_PATH');
    if(op.op!=='hide-section'&&!caps.has(op.sectionId))add('E_SECTION_UNSUPPORTED');
    const d=decisions.get(op.sectionId);
    if(op.op!=='hide-section'&&(!d||d.selection!=='include'||d.readiness!=='ready'))add('E_EVIDENCE_MISSING');
    if(op.op==='insert-section'&&(op.variant!==d?.variant||!plain(op.content)||!Number.isInteger(op.index)||op.index<0))add('E_INVALID_DOCUMENT');
   }else if(op.op==='reorder-sections'){
    if(!Array.isArray(op.order)){add('E_INVALID_DOCUMENT');continue;}if(new Set(op.order).size!==op.order.length)add('E_DUPLICATE_SECTION');
    for(const id of op.order){const d=decisions.get(id);if(!d||!((d.selection==='include'&&d.readiness==='ready')||d.selection==='preserve'))add('E_EVIDENCE_MISSING');}
   }else if(op.op==='select-template'){
    if(!ctx.templates?.[op.templateId])add('E_TEMPLATE_UNSUPPORTED');
    for(const p of op.retainOverridePaths??[]){const seg=parsePointer(p);if(seg[0]!=='template'||seg.length<2||['schema','name','extends'].includes(seg[1]))add('E_UNSAFE_PATH');}
   }else add('E_OPERATION_SCOPE');
   // For select-template, effective-value checks on the staged snapshot permit harmless retention.
   if(op.op!=='select-template')for(const p of opPaths(op))for(const lock of ctx.locks??[])if(pathsOverlap(p,lock.path))add('E_LOCKED',p);
  }catch(e){add(e.message.startsWith('E_')?e.message:'E_INVALID_DOCUMENT',op.path);}
 }
 return errors;
}
function get(root,path){let v=root;for(const k of parsePointer(path)){if(v===null||typeof v!=='object'||!Object.hasOwn(v,k))return undefined;v=v[k];}return v;}
function set(root,path,value,remove=false){const keys=parsePointer(path);let v=root;for(let i=0;i<keys.length-1;i++){const k=keys[i];if(!Object.hasOwn(v,k))v[k]={};if(!plain(v[k])&&!Array.isArray(v[k]))throw Error('E_PATH_TYPE');v=v[k];}const last=keys.at(-1);if(Array.isArray(v)){if(!/^(0|[1-9][0-9]*)$/.test(last)||Number(last)>=v.length||remove)throw Error('E_ARRAY_PATH');}if(remove){if(Object.hasOwn(v,last))delete v[last];}else v[last]=structuredClone(value);}
const encoded=k=>k.replace(/~/g,'~0').replace(/\//g,'~1');
export function changedPaths(a,b,path=''){
 if(a===b)return [];
 if(plain(a)&&plain(b)){return [...new Set([...Object.keys(a),...Object.keys(b)])].sort(cmp).flatMap(k=>changedPaths(a[k],b[k],path+'/'+encoded(k)));}
 if(a!==undefined&&b!==undefined&&canonicalJson(a)===canonicalJson(b))return [];
 return [path];
}
export function prepareReferenceApply(plan,ctx){
 const diagnostics=guardPlan(plan,ctx);if(diagnostics.length)return {ok:false,diagnostics};
 if(typeof ctx.validateSnapshot!=='function'||typeof ctx.resolvePresentation!=='function'||!ctx.snapshot)return {ok:false,diagnostics:[{code:'E_ADAPTER_REQUIRED'}]};
 const before=ctx.snapshot,next=structuredClone(before);next.retained??={};const envelope={site:next.site,template:next.templateAuthored};
 try{
  for(const op of plan.operations){
   if(op.op==='set'||op.op==='unset-template')set(envelope,op.path,op.value,op.op==='unset-template');
   else if(op.op==='select-template'){
    const old=envelope.template;const selected={schema:'gvaste-pages/template/v1',name:ctx.templates[op.templateId].name,extends:op.templateId};
    // Unknown root authored data must be explicitly handled by the host, never silently dropped.
    for(const k of Object.keys(old))if(!['schema','name','extends','tokens','themes','chrome','sections','responsive'].includes(k))selected[k]=structuredClone(old[k]);
    envelope.template=selected;
    for(const path of op.retainOverridePaths){const value=get({template:old},path);if(value!==undefined)set(envelope,path,value);}
   }else if(op.op==='insert-section'){
    const list=envelope.site.sections??[];if(list.includes(op.sectionId)||Object.hasOwn(next.retained,op.sectionId)||Object.hasOwn(envelope.site,op.sectionId))throw Error('E_SECTION_EXISTS');
    if(op.index>list.length)throw Error('E_SECTION_INDEX');list.splice(op.index,0,op.sectionId);envelope.site.sections=list;envelope.site[op.sectionId]=structuredClone(op.content);set(envelope,`/template/sections/${op.sectionId}/variant`,op.variant);
   }else if(op.op==='hide-section'){
    const list=envelope.site.sections??[],idx=list.indexOf(op.sectionId);if(idx<0)throw Error('E_SECTION_MISSING');next.retained[op.sectionId]={value:structuredClone(envelope.site[op.sectionId]??{}),index:idx};envelope.site.sections=list.filter(x=>x!==op.sectionId);
   }else if(op.op==='restore-section'){
    const r=next.retained[op.sectionId],list=envelope.site.sections??[];if(!r||list.includes(op.sectionId))throw Error('E_RETAINED_MISSING');list.splice(Math.min(r.index,list.length),0,op.sectionId);envelope.site.sections=list;envelope.site[op.sectionId]=structuredClone(r.value);delete next.retained[op.sectionId];set(envelope,`/template/sections/${op.sectionId}/variant`,plan.sections.find(s=>s.id===op.sectionId).variant);
   }else if(op.op==='reorder-sections'){
    const actual=envelope.site.sections??[];if(actual.length!==op.order.length||actual.some(x=>!op.order.includes(x)))throw Error('E_REORDER_NOT_PERMUTATION');envelope.site.sections=[...op.order];
   }
  }
  next.templateAuthored=envelope.template;
  for(const d of plan.sections.filter(s=>s.selection==='preserve'))if(!(before.site.sections??[]).includes(d.id))throw Error('E_PRESERVE_MISSING');
  const selected=plan.sections.filter(s=>(s.selection==='include'&&s.readiness==='ready')||s.selection==='preserve').map(s=>s.id);
  const active=next.site.sections??[];
  if(active.length!==selected.length||active.some(id=>!selected.includes(id)))throw Error('E_FINAL_ACTIVE_SET');
  const resolvedBefore={site:before.site,template:ctx.resolvePresentation(before.templateAuthored)},resolvedNext={site:next.site,template:ctx.resolvePresentation(next.templateAuthored)};
  for(const lock of ctx.locks??[]){
   if(lock.path.startsWith('/authoring'))continue;
   const a=get(resolvedBefore,lock.path),b=get(resolvedNext,lock.path);
   if(a===undefined?b!==undefined:b===undefined||canonicalJson(a)!==canonicalJson(b))throw Error('E_LOCKED_EFFECTIVE');
  }
  const validation=ctx.validateSnapshot(next,plan);if(!Array.isArray(validation))throw Error('E_ADAPTER_FAILED');const errors=validation.filter(d=>d.severity==='error');if(errors.length)return {ok:false,diagnostics:errors};
  // JSON validation callback must be synchronous: browser renderer scripts are not executed here.
  const noop=canonicalJson(sourceBasis(before,ctx.projectId))===canonicalJson(sourceBasis(next,ctx.projectId));
  return {ok:true,snapshot:next,noop};
 }catch(e){return {ok:false,diagnostics:[{code:e.message.startsWith('E_')?e.message:'E_ADAPTER_FAILED'}]};}
}
/** Detach an explicit RECOVERY copy; this retains raw data, not a shareable transport. */
export function unboundRecoverySession(session){const out=structuredClone(session);out.localBinding=null;out.validationRequestId=0;out.status='stale';out.plan=null;return out;}
/** Share an intentionally minimal brief, never a recovery payload. Host supplies a consented
 * brief already scrubbed of private notes/URIs and revalidated after any redaction.
 * Recompute a new plan on import; do not reuse fingerprints of removed evidence.
 */
export function exportTransport({projectId,sourceFingerprint,brief,pendingPaths=[]}){
 if(brief?.projectId!==projectId)throw Error('E_PROJECT_MISMATCH');
 const out={schema:'gvaste-pages/authoring-transport/v2',projectId,sourceFingerprint,brief:structuredClone(brief),plan:null,pendingPaths:[...pendingPaths]};
 canonicalJson(out);return out;
}
/** Serializable CAS model. Production compares+puts within ONE IDB readwrite transaction.
 * Retrying the same writeId+payload succeeds without bumping the revision twice.
 */
export function compareAndSwapRecord(current,expectedRevision,next,writeId){
 const payload=structuredClone(next);delete payload.storageRevision;delete payload.writeId;
 if(typeof writeId!=='string'||!writeId||!Number.isInteger(expectedRevision)||expectedRevision<0)return {ok:false,code:'E_STORAGE_CONFLICT'};
 if(current?.writeId===writeId){const saved=structuredClone(current);delete saved.storageRevision;delete saved.writeId;
  return canonicalJson(saved)===canonicalJson(payload)?{ok:true,record:structuredClone(current),noop:true}:{ok:false,code:'E_WRITE_ID_REUSE'};
 }
 if((current?.storageRevision??0)!==expectedRevision)return {ok:false,code:'E_STORAGE_CONFLICT'};
 return {ok:true,record:{...payload,storageRevision:expectedRevision+1,writeId},noop:false};
}
