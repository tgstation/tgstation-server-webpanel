"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[9600],{9956:function(e,t,n){n.d(t,{G:function(){return h}});var l=n(6188),a=n(6784),r=n(6540),i=n(6052),o=n(2431),c=n(5038),m=n(3524),s=n(8065),d=n(9589),u=n(2576),E=n(7621),p=n(4717),v=n(6795),g=n(7255),b=n(5282);function f(){return f=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var l in n)({}).hasOwnProperty.call(n,l)&&(e[l]=n[l])}return e},f.apply(null,arguments)}let h=function(e){return e[e.CompileJobs=0]="CompileJobs",e[e.Watchdog=1]="Watchdog",e}({});class w extends r.Component{constructor(e){super(e),this.state={openTestMergesId:null}}render(){return r.createElement("div",null,r.createElement(v.Q,{obj:this.props.viewData}),r.createElement("h3",{className:"text-center"},r.createElement(s.A,{id:"view.instance.server.deployment_info"})),this.props.viewData?this.renderViewData(this.props.viewData):r.createElement(g.default,{text:"loading.compile_jobs"}))}renderViewData(e){let t,n=!1;const l=e,a=e;switch(e.viewDataType){case h.Watchdog:n=!l.activeCompileJob,t=()=>this.renderWatchdog(l);break;case h.CompileJobs:n=!!a.compileJobs&&0===a.compileJobs.length,t=()=>this.renderDeployments(a);break;default:throw new Error("Invalid enum value for ViewDataType!")}return n?r.createElement("h1",null,r.createElement(i.A,{variant:"warning"},r.createElement(s.A,{id:"view.utils.deployment_viewer.no_jobs"}))):t()}renderTable(e){return r.createElement(o.A,{className:"table table-hover"},r.createElement("thead",null,r.createElement("tr",null,r.createElement("th",null),r.createElement("th",null),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.id"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.byond"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.started_at"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.completed_at"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.started_by"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.project"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.revision"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.origin"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.security"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.dmapi"})))),r.createElement("tbody",null,e))}renderWatchdog(e){return this.renderTable(r.createElement(r.Fragment,null,r.createElement("tr",null,r.createElement("td",{colSpan:11},r.createElement("h3",null,r.createElement(i.A,{pill:!0,variant:"success"},r.createElement(s.A,{id:"view.instance.server.deployment_info.active"}))))),this.renderCompileJob(e.activeCompileJob),e.stagedCompileJob?r.createElement(r.Fragment,null,r.createElement("tr",null,r.createElement("td",{colSpan:11},r.createElement("h3",null,r.createElement(i.A,{pill:!0,variant:"warning"},r.createElement(s.A,{id:"view.instance.server.deployment_info.staged"}))))),this.renderCompileJob(e.stagedCompileJob)):r.createElement(r.Fragment,null)))}renderDeployments(e){return r.createElement(r.Fragment,null,this.renderTable(r.createElement(r.Fragment,null,e.compileJobs.map((e=>this.renderCompileJob(e))))),r.createElement(b.A,{className:"mt-4",selectPage:t=>{e.paging.loadPage(t)},totalPages:e.paging.totalPages,currentPage:e.paging.currentPage}))}renderCompileJob(e){const t=p.default.friendlyVersion(e.engineVersion),n={day:"2-digit",year:"numeric",month:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1,timeZoneName:"short"},E=e.revisionInformation.activeTestMerges&&e.revisionInformation.activeTestMerges.length>0,v=this.state.openTestMergesId===e.id,g=!e.dmApiVersion||(0,d.lt)(e.dmApiVersion,this.context?.serverInfo?.dmApiVersion);return r.createElement(r.Fragment,null,r.createElement("tr",{className:"nowrap",onClick:()=>{v?this.setState({openTestMergesId:null}):E&&this.setState({openTestMergesId:e.id})}},r.createElement("td",null,E?r.createElement("h5",{style:{whiteSpace:"nowrap"}},r.createElement(c.A,{overlay:r.createElement(m.A,{id:`${e.id}-tooltip-test-merges`},r.createElement(s.A,{id:"view.utils.deployment_viewer.test_merges_hint."+(v?"hide":"show")}))},(({ref:e,...t})=>r.createElement("span",f({ref:e},t),r.createElement(a.g,{icon:v?l.xBV:l.fU5}))))):null),r.createElement("td",null,g?r.createElement(c.A,{overlay:r.createElement(m.A,{id:`${e.id}-tooltip-dmapi`},r.createElement(s.A,{id:"view.utils.deployment_viewer.dmapi_outdated",values:{codebase:e.dmApiVersion??"N/A",tgs:this.context.serverInfo.dmApiVersion}}))},(({ref:e,...t})=>r.createElement(i.A,f({pill:!0,variant:"danger",style:{cursor:"pointer"},ref:e},t,{onClick:e=>{window.open("https://github.com/tgstation/tgstation-server/releases?q=%23tgs-dmapi-release&expanded=true","_blank")?.focus(),e.stopPropagation()}}),r.createElement(a.g,{icon:l.zpE})))):null),r.createElement("td",null,e.id),r.createElement("td",null,t),r.createElement("td",null,new Date(e.job.startedAt).toLocaleString("en-CA",n)),r.createElement("td",null,new Date(e.job.stoppedAt).toLocaleString("en-CA",n)),r.createElement("td",null,e.job.startedBy.name),r.createElement("td",null,e.dmeName),r.createElement("td",null,e.revisionInformation.commitSha.substring(0,7)),r.createElement("td",null,e.revisionInformation.originCommitSha.substring(0,7)),r.createElement("td",null,null!=e.minimumSecurityLevel?Object.keys(u.GZ).filter((e=>isNaN(Number(e))))[e.minimumSecurityLevel]:r.createElement("i",null,r.createElement(s.A,{id:"generic.not_applicable"}))),r.createElement("td",null,e.dmApiVersion)),v?r.createElement("tr",null,r.createElement("td",{colSpan:10},r.createElement(o.A,null,r.createElement("thead",null,r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.pr.number"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.pr.title"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.revision"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.pr.merged_by"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.pr.merged_at"})),r.createElement("th",null,r.createElement(s.A,{id:"view.utils.deployment_viewer.table.pr.comment"}))),r.createElement("tbody",null,e.revisionInformation.activeTestMerges.map((t=>r.createElement("tr",{key:`test-merge-#${t.number}-cj-${e.id}`},r.createElement("td",null,r.createElement("a",{href:t.url},"#",t.number)),r.createElement("td",null,r.createElement("a",{href:t.url},t.titleAtMerge)),r.createElement("td",null,t.targetCommitSha.substring(0,7)),r.createElement("td",null,t.mergedBy.name),r.createElement("td",null,new Date(t.mergedAt).toLocaleString("en-CA",n)),r.createElement("td",null,t.comment?t.comment:r.createElement("i",null,r.createElement(s.A,{id:"generic.not_applicable"})))))))))):r.createElement(r.Fragment,null))}}w.contextType=E.z,t.A=w},1723:function(e,t,n){n.d(t,{Ay:function(){return w},PU:function(){return E},gH:function(){return h}});var l=n(6188),a=n(6784),r=n(6540),i=n(5615),o=n(1208),c=n(5192),m=n(5038),s=n(3524),d=n(8065);function u(){return u=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var l in n)({}).hasOwnProperty.call(n,l)&&(e[l]=n[l])}return e},u.apply(null,arguments)}let E=function(e){return e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum",e}({});const p=r.forwardRef((function(e,t){return r.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),v=r.forwardRef((function(e,t){return r.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),g=r.forwardRef((function(e,t){const n=Math.random().toString();return r.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},r.createElement(o.A.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),b=r.forwardRef((function(e,t){return r.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),f=r.forwardRef((function(e,t){return r.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?r.createElement("option",{key:n,value:n},t):r.createElement(d.A,{id:`${e.name}.${t}`,key:t},(e=>r.createElement("option",{key:n,value:n},e))))))})),h={[E.Enum]:0,[E.Number]:0,[E.Boolean]:!1,[E.String]:"",[E.Password]:""};function w(e){const[t,n]=(0,r.useState)(e.defaultValue??h[e.type]),o=(0,r.useRef)(null);(0,r.useEffect)((()=>{n(e.defaultValue??h[e.type])}),[e.defaultValue]),(0,r.useEffect)((()=>{switch(o.current&&(o.current.checkValidity()?o.current.classList.remove("is-invalid"):o.current.classList.add("is-invalid")),e.type){case E.Boolean:case E.Enum:case E.Number:case E.String:case E.Password:return void e.onChange(t,o.current?.checkValidity()??!0)}}),[t]);const w={string:p,password:v,boolean:g,[E.Number]:void 0,[E.Enum]:void 0},y=t!=(e.defaultValue??h[e.type]);return r.createElement(c.A,null,r.createElement(m.A,{overlay:(A=e.tooltip,A?r.createElement(s.A,{id:A},r.createElement(d.A,{id:A})):r.createElement(r.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>r.createElement(c.A.Prepend,{className:"w-50 w-xl-40"},r.createElement(c.A.Text,u({className:"flex-grow-1"},n),r.createElement("span",{className:y?"font-weight-bold":""},r.createElement(d.A,{id:e.name})),r.createElement("div",{className:"ml-auto"},e.disabled?r.createElement(d.A,{id:"generic.readonly"}):null,r.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},r.createElement(a.g,{icon:l.ktq}))))))),e.type===E.Number?r.createElement(b,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:o}):e.type===E.Enum?r.createElement(f,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):r.createElement(w[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:o}),r.createElement(c.A.Append,null,r.createElement(i.A,{style:{visibility:!y||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>n(e.defaultValue??h[e.type])},r.createElement(a.g,{icon:"undo"}))));var A}},6113:function(e,t,n){n.d(t,{A:function(){return s}});var l=n(6540),a=n(5615),r=n(5038),i=n(3524),o=n(8065),c=n(1723);function m(){return m=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var l in n)({}).hasOwnProperty.call(n,l)&&(e[l]=n[l])}return e},m.apply(null,arguments)}function s(e){const t=new Map,n=new Map,[s,d]=(0,l.useState)({});(0,l.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{d((t=>({...t,[e]:{}})))}))}),[]);for(const[a,r]of Object.entries(e.fields))n.set(a,r),t.set(r,(0,l.useState)(r.defaultValue??c.gH[r.type]));let u=!1,E=!1;for(const[e,l]of n){const[n]=t.get(l),a=s[e];if((l.defaultValue??c.gH[l.type])!=n&&(u=!0),a?.invalid&&(E=!0),u&&E)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?l.createElement(l.Fragment,null):l.createElement("div",null,Object.entries(e.fields).map((([n,a])=>{const{disabled:r,...i}=a;return e.hideDisabled&&r?null:l.createElement(c.Ay,m({key:n},i,{disabled:e.readOnly||r,onChange:(e,l)=>{t.get(a)[1](e),d((e=>({...e,[n]:{...e[n],invalid:!l}})))}}))})),l.createElement("div",{className:"text-center mt-2"},l.createElement(r.A,{overlay:l.createElement(i.A,{id:"form-invalid"},l.createElement(o.A,{id:"generic.invalid_form"})),show:!!E&&void 0},l.createElement(a.A,{variant:e.readOnly||E?"danger":"success",disabled:e.readOnly||!u||E,onClick:()=>{const l={};for(const[a,r]of n){const[n]=t.get(r);(r.alwaysInclude||n!=(r.defaultValue??c.gH[r.type])||e.includeAll)&&(l[a]=n)}e.onSave(l)}},l.createElement(o.A,{id:e.saveMessageId??"generic.save"})))))}}}]);
//# sourceMappingURL=9600.548cdd57623bd908519a.bundle.js.map