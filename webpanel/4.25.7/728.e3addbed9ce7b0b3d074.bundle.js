"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[728],{2741:function(e,t,a){a.d(t,{Z:function(){return l}});var n=a(7294),i=a(5293),r=a(3489),s=a(4012);function l(e){return n.createElement(i.Z,{show:e.show,overlay:n.createElement(r.Z,{id:e.tooltipid},n.createElement(s.Z,{id:e.tooltipid}))},e.children)}},4298:function(e,t,a){a.r(t),a.d(t,{Deployment:function(){return h}});var n=a(7294),i=a(5005),r=a(4012),s=a(5856),l=a(8509),o=a(3803),c=a(9521),d=a(6190),p=a(6964),m=a(3918),u=a(3e3),f=a(9635),v=a(9049),b=a(5619),y=a(8425),E=a(5855),Z=a(2741);function h(){const e=(0,n.useContext)(d.g),t=(0,n.useState)([]),[a,h]=(0,n.useState)(!0),[N,P]=(0,n.useState)(null),[g,x]=(0,n.useState)(null),[S,w]=(0,n.useState)(1),[R,V]=(0,n.useState)(0),[$,A]=(0,n.useState)(5),C=(0,p.$A)(e.instancePermissionSet,l.xb.Read),D=(0,p.$A)(e.instancePermissionSet,l.xb.Compile),I=(0,p.$A)(e.instancePermissionSet,l.xb.CompileJobs);async function _(){if(!C)return h(!1);h(!0);const a=await s.Z.getDeployInfo(e.instance.id);h(!1),a.code===o.G.OK?P(a.payload):(0,u.iT)(t,a.error)}async function z(a){if(!I)return;x(null);const n=await s.Z.listCompileJobs(e.instance.id,{page:a,pageSize:$});n.code===o.G.OK?($||A(n.payload.pageSize),V(n.payload.totalPages),w(a),x(n.payload.content)):(0,u.iT)(t,n.error)}let T;(0,n.useEffect)((()=>{_(),z(1)}),[e.instance.id]);const k=/(?:(?<days>\d+)\.)?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/.exec(N?.timeout??"");if(k){const e=k.groups;T=60*(24*parseInt(e.days??0)+parseInt(e.hours))+parseInt(e.minutes)+parseInt(e.seconds)/60}const L={projectName:{type:v.fS.String,name:"fields.instance.deploy.projectname",tooltip:"fields.instance.deploy.projectname.desc",defaultValue:N?.projectName,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetDme)},timeout:{type:v.fS.Number,name:"fields.instance.deploy.timeout",tooltip:"fields.instance.deploy.timeout.desc",defaultValue:T,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetTimeout)},apiValidationPort:{type:v.fS.Number,min:0,max:65535,name:"fields.instance.deploy.apiport",tooltip:"fields.instance.deploy.apiport.desc",defaultValue:N?.apiValidationPort,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetApiValidationPort)},apiValidationSecurityLevel:{type:v.fS.Enum,enum:l.ns,name:"fields.instance.deploy.seclevel",tooltip:"fields.instance.deploy.seclevel.desc",defaultValue:N?.apiValidationSecurityLevel,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetSecurityLevel)},requireDMApiValidation:{type:v.fS.Boolean,name:"fields.instance.deploy.validateapi",tooltip:"fields.instance.deploy.validateapi.desc",defaultValue:N?.requireDMApiValidation,disabled:!(0,p.$A)(e.instancePermissionSet,l.xb.SetApiValidationRequirement)}};let M=null;const j={currentPage:S,totalPages:R,loadPage:z,pageSize:$??0};return I?g&&(M={viewDataType:m.a.CompileJobs,compileJobs:g,paging:j}):M={viewDataType:m.a.CompileJobs,paging:j},n.createElement("div",{className:"text-center"},n.createElement(y.t,{obj:{deployInfo:N}}),(0,u.hP)(t),I?n.createElement(m.Z,{viewData:M}):n.createElement(f.Z,{title:"view.instance.no_compile_jobs"}),n.createElement("hr",null),n.createElement("h3",null,n.createElement(r.Z,{id:"view.instance.deploy.title"})),C?null:n.createElement(f.Z,{title:"view.instance.no_metadata"}),a?n.createElement(E.Z,{text:"loading.deployments"}):n.createElement(n.Fragment,null,n.createElement(b.Z,{hideDisabled:!C,fields:L,onSave:async a=>{let n;if(a.timeout){const e=Math.floor(a.timeout/1440);a.timeout-=1440*e;const t=Math.floor(a.timeout/60);a.timeout-=60*t;const i=Math.floor(a.timeout);a.timeout-=i;const r=Math.floor(60*a.timeout);n=e?`${e}.${t}:${i}:${r}`:`${t}:${i}:${r}`}const i={...a,timeout:n};h(!0);const r=await s.Z.updateDeployInfo(e.instance.id,i);r.code===o.G.ERROR?(0,u.iT)(t,r.error):await _(),h(!1)}}),n.createElement("hr",null),n.createElement(Z.Z,{tooltipid:"generic.no_perm",show:!D&&void 0},n.createElement(i.Z,{disabled:!D,onClick:async()=>{const a=await s.Z.startCompile(e.instance.id);a.code===o.G.ERROR?(0,u.iT)(t,a.error):(c.Z.registerJob(a.payload,e.instance.id),c.Z.fastmode=5)}},n.createElement(r.Z,{id:"view.instance.deploy.deploy"})))))}},7977:function(e,t,a){var n=a(7462),i=a(3366),r=a(4184),s=a.n(r),l=a(7294),o=a(6792),c=["bsPrefix","variant","pill","className","as"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.variant,d=e.pill,p=e.className,m=e.as,u=void 0===m?"span":m,f=(0,i.Z)(e,c),v=(0,o.vE)(a,"badge");return l.createElement(u,(0,n.Z)({ref:t},f,{className:s()(p,v,d&&v+"-pill",r&&v+"-"+r)}))}));d.displayName="Badge",d.defaultProps={pill:!1},t.Z=d},2318:function(e,t,a){var n=a(3366),i=a(7462),r=a(4184),s=a.n(r),l=a(7294),o=a(4680),c=a(6792),d=["bsPrefix","size","hasValidation","className","as"],p=(0,o.Z)("input-group-append"),m=(0,o.Z)("input-group-prepend"),u=(0,o.Z)("input-group-text",{Component:"span"}),f=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.size,o=e.hasValidation,p=e.className,m=e.as,u=void 0===m?"div":m,f=(0,n.Z)(e,d);return a=(0,c.vE)(a,"input-group"),l.createElement(u,(0,i.Z)({ref:t},f,{className:s()(p,a,r&&a+"-"+r,o&&"has-validation")}))}));f.displayName="InputGroup",f.Text=u,f.Radio=function(e){return l.createElement(u,null,l.createElement("input",(0,i.Z)({type:"radio"},e)))},f.Checkbox=function(e){return l.createElement(u,null,l.createElement("input",(0,i.Z)({type:"checkbox"},e)))},f.Append=p,f.Prepend=m,t.Z=f},8966:function(e,t,a){a.d(t,{Z:function(){return P}});var n=a(7462),i=a(3366),r=a(4184),s=a.n(r),l=a(7294),o=a(6792),c=a(8358),d=["active","disabled","className","style","activeLabel","children"],p=["children"],m=l.forwardRef((function(e,t){var a=e.active,r=e.disabled,o=e.className,p=e.style,m=e.activeLabel,u=e.children,f=(0,i.Z)(e,d),v=a||r?"span":c.Z;return l.createElement("li",{ref:t,style:p,className:s()(o,"page-item",{active:a,disabled:r})},l.createElement(v,(0,n.Z)({className:"page-link",disabled:r},f),u,a&&m&&l.createElement("span",{className:"sr-only"},m)))}));m.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},m.displayName="PageItem";var u=m;function f(e,t,a){function n(e){var n=e.children,r=(0,i.Z)(e,p);return l.createElement(m,r,l.createElement("span",{"aria-hidden":"true"},n||t),l.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),n.displayName=e,n}var v=f("First","\xab"),b=f("Prev","\u2039","Previous"),y=f("Ellipsis","\u2026","More"),E=f("Next","\u203a"),Z=f("Last","\xbb"),h=["bsPrefix","className","children","size"],N=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.className,c=e.children,d=e.size,p=(0,i.Z)(e,h),m=(0,o.vE)(a,"pagination");return l.createElement("ul",(0,n.Z)({ref:t},p,{className:s()(r,m,d&&m+"-"+d)}),c)}));N.First=v,N.Prev=b,N.Ellipsis=y,N.Item=u,N.Next=E,N.Last=Z;var P=N},9611:function(e,t,a){a.d(t,{Z:function(){return v}});var n=a(7462),i=a(3366),r=a(4184),s=a.n(r),l=a(7294),o=(a(5638),a(6792)),c=["as","bsPrefix","className","children"],d=l.forwardRef((function(e,t){var a=e.as,r=void 0===a?"div":a,d=e.bsPrefix,p=e.className,m=e.children,u=(0,i.Z)(e,c);return d=(0,o.vE)(d,"popover-header"),l.createElement(r,(0,n.Z)({ref:t},u,{className:s()(d,p)}),m)})),p=["as","bsPrefix","className","children"],m=l.forwardRef((function(e,t){var a=e.as,r=void 0===a?"div":a,c=e.bsPrefix,d=e.className,m=e.children,u=(0,i.Z)(e,p);return c=(0,o.vE)(c,"popover-body"),l.createElement(r,(0,n.Z)({ref:t},u,{className:s()(d,c)}),m)})),u=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],f=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.placement,c=e.className,d=e.style,p=e.children,f=e.content,v=e.arrowProps,b=(e.popper,e.show,(0,i.Z)(e,u)),y=(0,o.vE)(a,"popover"),E=((null==r?void 0:r.split("-"))||[])[0];return l.createElement("div",(0,n.Z)({ref:t,role:"tooltip",style:d,"x-placement":E,className:s()(c,y,E&&"bs-popover-"+E)},b),l.createElement("div",(0,n.Z)({className:"arrow"},v)),f?l.createElement(m,null,p):p)}));f.defaultProps={placement:"right"},f.Title=d,f.Content=m;var v=f},5147:function(e,t,a){var n=a(7462),i=a(3366),r=a(4184),s=a.n(r),l=a(7294),o=a(6792),c=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.className,d=e.striped,p=e.bordered,m=e.borderless,u=e.hover,f=e.size,v=e.variant,b=e.responsive,y=(0,i.Z)(e,c),E=(0,o.vE)(a,"table"),Z=s()(r,E,v&&E+"-"+v,f&&E+"-"+f,d&&E+"-striped",p&&E+"-bordered",m&&E+"-borderless",u&&E+"-hover"),h=l.createElement("table",(0,n.Z)({},y,{className:Z,ref:t}));if(b){var N=E+"-responsive";return"string"==typeof b&&(N=N+"-"+b),l.createElement("div",{className:N},h)}return h}));t.Z=d}}]);
//# sourceMappingURL=728.e3addbed9ce7b0b3d074.bundle.js.map