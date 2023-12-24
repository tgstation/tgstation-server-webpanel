"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[157],{2741:function(e,t,a){a.d(t,{Z:function(){return l}});var n=a(7294),i=a(5293),o=a(3489),s=a(4012);function l(e){return n.createElement(i.Z,{show:e.show,overlay:n.createElement(o.Z,{id:e.tooltipid},n.createElement(s.Z,{id:e.tooltipid}))},e.children)}},4298:function(e,t,a){a.r(t),a.d(t,{Deployment:function(){return Z}});var n=a(7294),i=a(5005),o=a(4012),s=a(5856),l=a(8509),r=a(3803),c=a(9521),d=a(6190),p=a(6964),u=a(3918),m=a(3e3),f=a(9635),v=a(9049),y=a(5619),b=a(8425),E=a(5855),S=a(2741);function Z(){const e=(0,n.useContext)(d.g),t=(0,n.useState)([]),[a,Z]=(0,n.useState)(!0),[g,h]=(0,n.useState)(null),[P,x]=(0,n.useState)(null),[w,N]=(0,n.useState)(1),[V,$]=(0,n.useState)(0),[A,C]=(0,n.useState)(5),R=(0,p.$A)(e.instancePermissionSet,l.xb.Read),D=(0,p.$A)(e.instancePermissionSet,l.xb.Compile),_=(0,p.$A)(e.instancePermissionSet,l.xb.CompileJobs);async function I(){if(!R)return Z(!1);Z(!0);const a=await s.Z.getDeployInfo(e.instance.id);Z(!1),a.code===r.G.OK?h(a.payload):(0,m.iT)(t,a.error)}async function T(a){if(!_)return;x(null);const n=await s.Z.listCompileJobs(e.instance.id,{page:a,pageSize:A});n.code===r.G.OK?(A||C(n.payload.pageSize),$(n.payload.totalPages),N(a),x(n.payload.content)):(0,m.iT)(t,n.error)}let k;(0,n.useEffect)((()=>{I(),T(1)}),[e.instance.id]);const z=/(?:(?<days>\d+)\.)?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/.exec(g?.timeout??"");if(z){const e=z.groups;k=60*(24*parseInt(e.days??0)+parseInt(e.hours))+parseInt(e.minutes)+parseInt(e.seconds)/60}const j={projectName:{type:v.fS.String,name:"fields.instance.deploy.projectname",tooltip:"fields.instance.deploy.projectname.desc",defaultValue:g?.projectName,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetDme)},timeout:{type:v.fS.Number,name:"fields.instance.deploy.timeout",tooltip:"fields.instance.deploy.timeout.desc",defaultValue:k,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetTimeout)},apiValidationPort:{type:v.fS.Number,min:1,max:65535,name:"fields.instance.deploy.apiport",tooltip:"fields.instance.deploy.apiport.desc",defaultValue:g?.apiValidationPort,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetApiValidationPort)},apiValidationSecurityLevel:{type:v.fS.Enum,enum:l.ns,name:"fields.instance.deploy.seclevel",tooltip:"fields.instance.deploy.seclevel.desc",defaultValue:g?.apiValidationSecurityLevel,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetSecurityLevel)},requireDMApiValidation:{type:v.fS.Boolean,name:"fields.instance.deploy.validateapi",tooltip:"fields.instance.deploy.validateapi.desc",defaultValue:g?.requireDMApiValidation,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetApiValidationRequirement)}};let J=null;const M={currentPage:w,totalPages:V,loadPage:T,pageSize:A??0};return _?P&&(J={viewDataType:u.a.CompileJobs,compileJobs:P,paging:M}):J={viewDataType:u.a.CompileJobs,paging:M},n.createElement("div",{className:"text-center"},n.createElement(b.t,{obj:{deployInfo:g}}),(0,m.hP)(t),_?n.createElement(u.Z,{viewData:J}):n.createElement(f.Z,{title:"view.instance.no_compile_jobs"}),n.createElement("hr",null),n.createElement("h3",null,n.createElement(o.Z,{id:"view.instance.deploy.title"})),R?null:n.createElement(f.Z,{title:"view.instance.no_metadata"}),a?n.createElement(E.Z,{text:"loading.deployments"}):n.createElement(n.Fragment,null,n.createElement(y.Z,{hideDisabled:!R,fields:j,onSave:async a=>{let n;if(a.timeout){const e=Math.floor(a.timeout/1440);a.timeout-=1440*e;const t=Math.floor(a.timeout/60);a.timeout-=60*t;const i=Math.floor(a.timeout);a.timeout-=i;const o=Math.floor(60*a.timeout);n=e?`${e}.${t}:${i}:${o}`:`${t}:${i}:${o}`}const i={...a,timeout:n};Z(!0);const o=await s.Z.updateDeployInfo(e.instance.id,i);o.code===r.G.ERROR?(0,m.iT)(t,o.error):await I(),Z(!1)}}),n.createElement("hr",null),n.createElement(S.Z,{tooltipid:"generic.no_perm",show:!D&&void 0},n.createElement(i.Z,{disabled:!D,onClick:async()=>{const a=await s.Z.startCompile(e.instance.id);a.code===r.G.ERROR?(0,m.iT)(t,a.error):(c.Z.registerJob(a.payload,e.instance.id),c.Z.fastmode=5)}},n.createElement(o.Z,{id:"view.instance.deploy.deploy"})))))}},7977:function(e,t,a){var n=a(7462),i=a(3366),o=a(4184),s=a.n(o),l=a(7294),r=a(6792),c=["bsPrefix","variant","pill","className","as"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,o=e.variant,d=e.pill,p=e.className,u=e.as,m=void 0===u?"span":u,f=(0,i.Z)(e,c),v=(0,r.vE)(a,"badge");return l.createElement(m,(0,n.Z)({ref:t},f,{className:s()(p,v,d&&v+"-pill",o&&v+"-"+o)}))}));d.displayName="Badge",d.defaultProps={pill:!1},t.Z=d},2318:function(e,t,a){var n=a(3366),i=a(7462),o=a(4184),s=a.n(o),l=a(7294),r=a(4680),c=a(6792),d=["bsPrefix","size","hasValidation","className","as"],p=(0,r.Z)("input-group-append"),u=(0,r.Z)("input-group-prepend"),m=(0,r.Z)("input-group-text",{Component:"span"}),f=l.forwardRef((function(e,t){var a=e.bsPrefix,o=e.size,r=e.hasValidation,p=e.className,u=e.as,m=void 0===u?"div":u,f=(0,n.Z)(e,d);return a=(0,c.vE)(a,"input-group"),l.createElement(m,(0,i.Z)({ref:t},f,{className:s()(p,a,o&&a+"-"+o,r&&"has-validation")}))}));f.displayName="InputGroup",f.Text=m,f.Radio=function(e){return l.createElement(m,null,l.createElement("input",(0,i.Z)({type:"radio"},e)))},f.Checkbox=function(e){return l.createElement(m,null,l.createElement("input",(0,i.Z)({type:"checkbox"},e)))},f.Append=p,f.Prepend=u,t.Z=f},5147:function(e,t,a){var n=a(7462),i=a(3366),o=a(4184),s=a.n(o),l=a(7294),r=a(6792),c=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,o=e.className,d=e.striped,p=e.bordered,u=e.borderless,m=e.hover,f=e.size,v=e.variant,y=e.responsive,b=(0,i.Z)(e,c),E=(0,r.vE)(a,"table"),S=s()(o,E,v&&E+"-"+v,f&&E+"-"+f,d&&E+"-striped",p&&E+"-bordered",u&&E+"-borderless",m&&E+"-hover"),Z=l.createElement("table",(0,n.Z)({},b,{className:S,ref:t}));if(y){var g=E+"-responsive";return"string"==typeof y&&(g=g+"-"+y),l.createElement("div",{className:g},Z)}return Z}));t.Z=d}}]);
//# sourceMappingURL=157.a132334a7a035486f21f.bundle.js.map