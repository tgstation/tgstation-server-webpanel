"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[2396],{1723:function(e,t,n){n.d(t,{Ay:function(){return v},PU:function(){return p},gH:function(){return A}});var r=n(6188),a=n(6784),o=n(6540),l=n(5615),s=n(1208),i=n(5192),c=n(5038),u=n(3524),d=n(8065);function m(){return m=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},m.apply(null,arguments)}let p=function(e){return e.Boolean="boolean",e.Number="number",e.String="string",e.TextArea="textarea",e.Password="password",e.Enum="enum",e}({});const f=o.forwardRef((function(e,t){return o.createElement(s.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),h=o.forwardRef((function(e){return o.createElement(s.A.Control,{as:"textarea",value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled})})),g=o.forwardRef((function(e,t){return o.createElement(s.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),y=o.forwardRef((function(e,t){const n=Math.random().toString();return o.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},o.createElement(s.A.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),w=o.forwardRef((function(e,t){return o.createElement(s.A.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),b=o.forwardRef((function(e,t){return o.createElement(s.A.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?o.createElement("option",{key:n,value:n},t):o.createElement(d.A,{id:`${e.name}.${t}`,key:t},(e=>o.createElement("option",{key:n,value:n},e))))))})),A={[p.Enum]:0,[p.Number]:0,[p.Boolean]:!1,[p.String]:"",[p.Password]:"",[p.TextArea]:""};function v(e){const[t,n]=(0,o.useState)(e.defaultValue??A[e.type]),s=(0,o.useRef)(null);(0,o.useEffect)((()=>{n(e.defaultValue??A[e.type])}),[e.defaultValue]),(0,o.useEffect)((()=>{switch(s.current&&(s.current.checkValidity()?s.current.classList.remove("is-invalid"):s.current.classList.add("is-invalid")),e.type){case p.Boolean:case p.Enum:case p.Number:case p.String:case p.Password:case p.TextArea:return void e.onChange(t,s.current?.checkValidity()??!0)}}),[t]);const v={string:f,password:g,boolean:y,textarea:h,[p.Number]:void 0,[p.Enum]:void 0},E=t!=(e.defaultValue??A[e.type])||e.forceChanged;return o.createElement(i.A,null,o.createElement(c.A,{overlay:(C=e.tooltip,C?o.createElement(u.A,{id:C},o.createElement(d.A,{id:C})):o.createElement(o.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>o.createElement(i.A.Prepend,{className:"w-50 w-xl-40"},o.createElement(i.A.Text,m({className:"flex-grow-1"},n),o.createElement("span",{className:E?"font-weight-bold":""},o.createElement(d.A,{id:e.name})),o.createElement("div",{className:"ml-auto"},e.disabled&&!e.hideReadOnly?o.createElement(d.A,{id:"generic.readonly"}):null,o.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},o.createElement(a.g,{icon:r.ktq}))))))),e.type===p.Number?o.createElement(w,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:s}):e.type===p.Enum?o.createElement(b,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):o.createElement(v[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:s}),E&&!e.disabled||e.additionalAppend?o.createElement(i.A.Append,null,E&&!e.disabled?o.createElement(l.A,{variant:"danger",onClick:()=>n(e.defaultValue??A[e.type])},o.createElement(a.g,{icon:"undo"})):null,e.additionalAppend):null);var C}},6113:function(e,t,n){n.d(t,{A:function(){return u}});var r=n(6540),a=n(5615),o=n(5038),l=n(3524),s=n(8065),i=n(1723);function c(){return c=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c.apply(null,arguments)}function u(e){const t=new Map,n=new Map,[u,d]=(0,r.useState)({});(0,r.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{d((t=>({...t,[e]:{}})))}))}),[]);for(const[a,o]of Object.entries(e.fields))n.set(a,o),t.set(o,(0,r.useState)(o.defaultValue??i.gH[o.type]));let m=e.alwaysAllowSave,p=!1;for(const[e,r]of n){const[n]=t.get(r),a=u[e];if((r.defaultValue??i.gH[r.type])!=n&&(m=!0),a?.invalid&&(p=!0),m&&p)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?r.createElement(r.Fragment,null):r.createElement("div",null,Object.entries(e.fields).map((([n,a])=>{const{disabled:o,...l}=a;return e.hideDisabled&&o?null:r.createElement(i.Ay,c({key:n},l,{disabled:e.readOnly||o,onChange:(e,r)=>{t.get(a)[1](e),d((e=>({...e,[n]:{...e[n],invalid:!r}})))}}))})),r.createElement("div",{className:"text-center mt-2"},r.createElement(o.A,{overlay:r.createElement(l.A,{id:"form-invalid"},r.createElement(s.A,{id:"generic.invalid_form"})),show:!!p&&void 0},r.createElement(a.A,{variant:e.readOnly||p?"danger":"success",disabled:e.readOnly||!m||p,onClick:()=>{const r={};for(const[a,o]of n){const[n]=t.get(o);(o.alwaysInclude||n!=(o.defaultValue??i.gH[o.type])||e.includeAll)&&(r[a]=n)}e.onSave(r)}},r.createElement(s.A,{id:e.saveMessageId??"generic.save"})))))}},6795:function(e,t,n){n.d(t,{Q:function(){return i}});var r=n(6540),a=n(8785),o=n.n(a),l=n(8437);function s(e){return r.createElement(o(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function i(e){return l.Ay.showjson.value?r.createElement("div",{className:"text-left"},r.createElement(s,{obj:e.obj})):r.createElement(r.Fragment,null)}},7621:function(e,t,n){n.d(t,{z:function(){return r}});const r=n(6540).createContext(void 0)},3782:function(e,t,n){var r=n(9346),a=n(8763),o=n(9757),l=n(4101),s=n(4173),i=n(5301),c=n(8437),u=n(7602);async function d(e,t,n){const r=e.endpoint.merge(t,n);return c.Ay.githubtoken.value&&(r.headers.authorization=`token ${c.Ay.githubtoken.value}`),e(r)}async function m(){return c.Ay.githubtoken.value?{type:"token",tokenType:"pat",token:c.Ay.githubtoken.value}:{type:"unauthenticated"}}const p=()=>Object.assign(m.bind(null),{hook:d.bind(null)}),f=new class extends l.TypedEmitter{constructor(){super(),this.apiClient=void 0;const e=o.E.plugin(r.L,a.A);this.apiClient=new e({authStrategy:p,userAgent:"tgstation-server-control-panel/"+u.xv,baseUrl:"https://api.github.com",throttle:{onRateLimit:(e,t)=>(console.warn(`Request quota exhausted for request ${t.method} ${t.url}`),0===t.request.retryCount&&(console.log(`Retrying after ${e} seconds!`),!0)),onSecondaryRateLimit:(e,t)=>{console.warn(`Abuse detected for request ${t.method} ${t.url}`)}}})}async getLatestDefaultCommit(e,t){try{const n=await this.apiClient.repos.get({owner:e,repo:t}),r=await this.apiClient.repos.getBranch({owner:e,repo:t,branch:n.data.default_branch});return new i.A({code:i.s.OK,payload:r.data.commit.sha})}catch(e){return new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}}async getVersions({owner:e,repo:t,current:n,all:r}){let a,o=0;try{a=await this.apiClient.paginate(this.apiClient.repos.listReleases,{owner:e,repo:t},((e,t)=>e.data.reduce(((e,a)=>{const l=/tgstation-server-v([\d.]+)/.exec(a.name??"");if(!l)return e;if(parseInt(l[1][0])<4)return e;const s=l[1];let i=!1;if(s<=n){if(o>=3&&!r)return t(),e;o++,i=!0}return e.push({version:s,body:a.body??"",current:s===n,old:i}),e}),[])))}catch(e){return new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}return new i.A({code:i.s.OK,payload:a})}transformPR(e){return{number:e.number,title:e.title,author:e.user?.login??"ghost",state:e.merged_at?"merged":e.state,link:e.html_url,head:e.head.sha,tail:e.base.sha,testmergelabel:e.labels.some((e=>e.name?.toLowerCase().includes("testmerge")||e.name?.toLowerCase().includes("test merge")))}}async getPRs({owner:e,repo:t,wantedPRs:n}){let r=[];try{r=(await this.apiClient.paginate(this.apiClient.pulls.list,{owner:e,repo:t,state:"open"})).map(this.transformPR);for(const a of n??[])if(!r.find((e=>e.number==a))){const n=(await this.apiClient.pulls.get({owner:e,repo:t,pull_number:a})).data;r.push(this.transformPR(n))}}catch(e){return console.error(e),new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}return new i.A({code:i.s.OK,payload:r})}async getPRCommits({owner:e,repo:t,pr:n,wantedCommit:r}){let a,o=[];try{if(o=await this.apiClient.paginate(this.apiClient.pulls.listCommits,{owner:e,repo:t,pull_number:n.number,per_page:100},(({data:e})=>e.map((e=>({name:e.commit.message.split("\n")[0],sha:e.sha,url:e.html_url}))))),o.reverse(),r&&!o.find((e=>e.sha===r))){const n=(await this.apiClient.repos.getCommit({owner:e,repo:t,ref:r})).data;a={name:n.commit.message.split("\n")[0],sha:n.sha,url:n.html_url}}}catch(e){return console.error(e),new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}return new i.A({code:i.s.OK,payload:[o,a]})}async getFile(e,t,n,r){try{const{data:a}=await this.apiClient.repos.getContent({mediaType:{format:"base64"},owner:e,repo:t,path:n,ref:r});if(Array.isArray(a))return new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:new Error(`${n} was a directory!`)})});if("file"!==a.type)return new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:new Error(`${n} has type ${a.type}!`)})});const o=a.content;return new i.A({code:i.s.OK,payload:o})}catch(e){return console.error(e),new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}}async getDirectoryContents(e,t,n,r){try{const{data:a}=await this.apiClient.repos.getContent({owner:e,repo:t,path:n,ref:r});if(!Array.isArray(a))return new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:new Error(`${n} was not a directory!`)})});const o=[];return a.forEach((e=>o.push({path:e.path,isDirectory:"dir"==e.type}))),new i.A({code:i.s.OK,payload:o})}catch(e){return console.error(e),new i.A({code:i.s.ERROR,error:new s.Ay(s.O4.GITHUB_FAIL,{jsError:e})})}}};t.A=f}}]);
//# sourceMappingURL=2396.b5dfd37633c3cee2c9ec.bundle.js.map