/** Pure recovery migration model. Not an IndexedDB upgrade or a renderer adapter.
 * Returns the exact original text separately. Never executes an old plan or trusts imports.
 */
import {canonicalJson} from './contract.mjs';
export function migrateSessionV1(originalText,{project={name:'',description:'',repo:null},kindMap={},staging=null}={}){
 if(typeof originalText!=='string'||new TextEncoder().encode(originalText).length>4000000)throw Error('E_PAYLOAD_DEPTH');
 const original=JSON.parse(originalText);canonicalJson(original);
 if(original.schema!=='gvaste-pages/authoring-session/v1'||original.brief?.schema!=='gvaste-pages/authoring-brief/v1')throw Error('E_SCHEMA_VERSION');
 const b=structuredClone(original.brief),p=b.preferences??{};
 const brief={schema:'gvaste-pages/authoring-brief/v2',id:b.id,projectId:b.projectId,project:structuredClone(project),primaryAction:{kind:'none',label:'',target:'',evidenceId:null},projectKind:kindMap[b.projectKind]??'unknown',goal:b.goal??'unknown',audience:b.audience??'unknown',construction:b.construction??'ai-assisted',interaction:b.interaction??'guided',preferences:{templateId:p.templateId??null,theme:p.theme??'unknown',frame:p.frame??'unknown',accent:p.accent??null,accentSource:p.accentSource??'legacy',actionStyle:'neutral',shade:null},evidence:(b.evidence??[]).map(e=>({...e,verification:'unverified',source:{kind:'user',locator:e.uri??'',revision:null,contentHash:null},publication:{status:'unknown',approvedHash:null},relations:[]})),locks:b.locks??[],explicitSections:b.explicitSections??[],excludedSections:b.excludedSections??[],variantChoices:{},sectionOrder:[],answerOrigins:[],variationIndex:0,notes:b.notes??''};
 const pending=[...new Set([...(original.pendingPaths??[]),'/authoring/primaryAction','/authoring/variantChoices','/authoring/sectionOrder','/authoring/evidence',...(!project.name?['/authoring/project/name']:[]),...(!project.description?['/authoring/project/description']:[]),...(brief.projectKind==='unknown'?['/authoring/projectKind']:[])])];
 const session={schema:'gvaste-pages/authoring-session/v2',id:original.id,revision:0,targetMode:original.targetMode??'existing',status:'stale',step:Math.min(6,Math.max(1,original.step??1)),brief,plan:null,pendingPaths:pending,staging:staging?structuredClone(staging):{siteText:'',templateText:'',retained:{},lastValidText:null},localBinding:null,validationRequestId:0,lastAppliedPlanId:null};
 return {session,originalText,requiresSourceRecovery:staging===null};
}
