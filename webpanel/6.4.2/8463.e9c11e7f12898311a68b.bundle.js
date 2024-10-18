"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[8463,6983],{1512:function(e,t,a){a.d(t,{A:function(){return l}});var n=a(6540),i=a(5038),s=a(3524),r=a(8065);function l(e){return n.createElement(i.A,{show:e.show,overlay:n.createElement(s.A,{id:e.tooltipid},n.createElement(r.A,{id:e.tooltipid}))},e.children)}},5998:function(e,t,a){a.r(t),a.d(t,{Deployment:function(){return E}});var n=a(6540),i=a(5615),s=a(8065),r=a(1930),l=a(2576),o=a(5301),c=a(379),d=a(7621),p=a(4118),m=a(9956),u=a(7567),f=a(5659),v=a(1723),y=a(6113),b=a(6795),A=a(7255),P=a(1512);function E(){const e=(0,n.useContext)(d.z),t=(0,n.useState)([]),[a,E]=(0,n.useState)(!0),[N,h]=(0,n.useState)(null),[g,S]=(0,n.useState)(null),[w,x]=(0,n.useState)(1),[C,R]=(0,n.useState)(0),[V,G]=(0,n.useState)(5),U=(0,p.eG)(e.instancePermissionSet,l.rY.Read),_=(0,p.eG)(e.instancePermissionSet,l.rY.Compile),I=(0,p.eG)(e.instancePermissionSet,l.rY.CompileJobs);async function Y(){if(!U)return E(!1);E(!0);const a=await r.A.getDeployInfo(e.instance.id);E(!1),a.code===o.s.OK?h(a.payload):(0,u.CN)(t,a.error)}async function z(a){if(!I)return;S(null);const n=await r.A.listCompileJobs(e.instance.id,{page:a,pageSize:V});n.code===o.s.OK?(V||G(n.payload.pageSize),R(n.payload.totalPages),x(a),S(n.payload.content)):(0,u.CN)(t,n.error)}let D;(0,n.useEffect)((()=>{Y(),z(1)}),[e.instance.id]);const L=/(?:(?<days>\d+)\.)?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/.exec(N?.timeout??"");if(L){const e=L.groups;D=60*(24*parseInt(e.days??0)+parseInt(e.hours))+parseInt(e.minutes)+parseInt(e.seconds)/60}const M={projectName:{type:v.PU.String,name:"fields.instance.deploy.projectname",tooltip:"fields.instance.deploy.projectname.desc",defaultValue:N?.projectName,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetDme)},compilerAdditionalArguments:{type:v.PU.String,name:"fields.instance.deploy.compilerargs",tooltip:"fields.instance.deploy.compilerargs.desc",defaultValue:N?.compilerAdditionalArguments,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetCompilerArguments)},timeout:{type:v.PU.Number,name:"fields.instance.deploy.timeout",tooltip:"fields.instance.deploy.timeout.desc",defaultValue:D,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetTimeout)},apiValidationPort:{type:v.PU.Number,min:0,max:65535,name:"fields.instance.deploy.apiport",tooltip:"fields.instance.deploy.apiport.desc",defaultValue:N?.apiValidationPort,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetApiValidationPort)},apiValidationSecurityLevel:{type:v.PU.Enum,enum:l.GZ,name:"fields.instance.deploy.seclevel",tooltip:"fields.instance.deploy.seclevel.desc",defaultValue:N?.apiValidationSecurityLevel,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetSecurityLevel)},dmApiValidationMode:{type:v.PU.Enum,enum:l.u3,name:"fields.instance.deploy.validateapi",tooltip:"fields.instance.deploy.validateapi.desc",defaultValue:N?.dmApiValidationMode,disabled:!(0,p.eG)(e.instancePermissionSet,l.rY.SetApiValidationRequirement)}};let $=null;const j={currentPage:w,totalPages:C,loadPage:z,pageSize:V??0};return I?g&&($={viewDataType:m.G.CompileJobs,compileJobs:g,paging:j}):$={viewDataType:m.G.CompileJobs,paging:j},n.createElement("div",{className:"text-center"},n.createElement(b.Q,{obj:{deployInfo:N}}),(0,u.u9)(t),I?n.createElement(m.A,{viewData:$}):n.createElement(f.A,{title:"view.instance.no_compile_jobs"}),n.createElement("hr",null),n.createElement("h3",null,n.createElement(s.A,{id:"view.instance.deploy.title"})),U?null:n.createElement(f.A,{title:"view.instance.no_metadata"}),a?n.createElement(A.default,{text:"loading.deployments"}):n.createElement(n.Fragment,null,n.createElement(y.A,{hideDisabled:!U,fields:M,onSave:async a=>{let n;if(a.timeout){const e=Math.floor(a.timeout/1440);a.timeout-=1440*e;const t=Math.floor(a.timeout/60);a.timeout-=60*t;const i=Math.floor(a.timeout);a.timeout-=i;const s=Math.floor(60*a.timeout);n=e?`${e}.${t}:${i}:${s}`:`${t}:${i}:${s}`}const i={...a,timeout:n};E(!0);const s=await r.A.updateDeployInfo(e.instance.id,i);s.code===o.s.ERROR?(0,u.CN)(t,s.error):await Y(),E(!1)}}),n.createElement("hr",null),n.createElement(P.A,{tooltipid:"generic.no_perm",show:!_&&void 0},n.createElement(i.A,{disabled:!_,onClick:()=>{(async()=>{const a=await r.A.startCompile(e.instance.id);a.code===o.s.ERROR?(0,u.CN)(t,a.error):(c.default.registerJob(a.payload,e.instance.id),c.default.fastmode=5)})()}},n.createElement(s.A,{id:"view.instance.deploy.deploy"})))))}},6052:function(e,t,a){var n=a(8168),i=a(8587),s=a(2485),r=a.n(s),l=a(6540),o=a(6519),c=["bsPrefix","variant","pill","className","as"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,s=e.variant,d=e.pill,p=e.className,m=e.as,u=void 0===m?"span":m,f=(0,i.A)(e,c),v=(0,o.oU)(a,"badge");return l.createElement(u,(0,n.A)({ref:t},f,{className:r()(p,v,d&&v+"-pill",s&&v+"-"+s)}))}));d.displayName="Badge",d.defaultProps={pill:!1},t.A=d},1069:function(e,t,a){a.d(t,{A:function(){return h}});var n=a(8168),i=a(8587),s=a(2485),r=a.n(s),l=a(6540),o=a(6519),c=a(9703),d=["active","disabled","className","style","activeLabel","children"],p=["children"],m=l.forwardRef((function(e,t){var a=e.active,s=e.disabled,o=e.className,p=e.style,m=e.activeLabel,u=e.children,f=(0,i.A)(e,d),v=a||s?"span":c.A;return l.createElement("li",{ref:t,style:p,className:r()(o,"page-item",{active:a,disabled:s})},l.createElement(v,(0,n.A)({className:"page-link",disabled:s},f),u,a&&m&&l.createElement("span",{className:"sr-only"},m)))}));m.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},m.displayName="PageItem";var u=m;function f(e,t,a){function n(e){var n=e.children,s=(0,i.A)(e,p);return l.createElement(m,s,l.createElement("span",{"aria-hidden":"true"},n||t),l.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),n.displayName=e,n}var v=f("First","\xab"),y=f("Prev","\u2039","Previous"),b=f("Ellipsis","\u2026","More"),A=f("Next","\u203a"),P=f("Last","\xbb"),E=["bsPrefix","className","children","size"],N=l.forwardRef((function(e,t){var a=e.bsPrefix,s=e.className,c=e.children,d=e.size,p=(0,i.A)(e,E),m=(0,o.oU)(a,"pagination");return l.createElement("ul",(0,n.A)({ref:t},p,{className:r()(s,m,d&&m+"-"+d)}),c)}));N.First=v,N.Prev=y,N.Ellipsis=b,N.Item=u,N.Next=A,N.Last=P;var h=N},3899:function(e,t,a){a.d(t,{A:function(){return v}});var n=a(8168),i=a(8587),s=a(2485),r=a.n(s),l=a(6540),o=(a(8239),a(6519)),c=["as","bsPrefix","className","children"],d=l.forwardRef((function(e,t){var a=e.as,s=void 0===a?"div":a,d=e.bsPrefix,p=e.className,m=e.children,u=(0,i.A)(e,c);return d=(0,o.oU)(d,"popover-header"),l.createElement(s,(0,n.A)({ref:t},u,{className:r()(d,p)}),m)})),p=["as","bsPrefix","className","children"],m=l.forwardRef((function(e,t){var a=e.as,s=void 0===a?"div":a,c=e.bsPrefix,d=e.className,m=e.children,u=(0,i.A)(e,p);return c=(0,o.oU)(c,"popover-body"),l.createElement(s,(0,n.A)({ref:t},u,{className:r()(d,c)}),m)})),u=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],f=l.forwardRef((function(e,t){var a=e.bsPrefix,s=e.placement,c=e.className,d=e.style,p=e.children,f=e.content,v=e.arrowProps,y=(e.popper,e.show,(0,i.A)(e,u)),b=(0,o.oU)(a,"popover"),A=((null==s?void 0:s.split("-"))||[])[0];return l.createElement("div",(0,n.A)({ref:t,role:"tooltip",style:d,"x-placement":A,className:r()(c,b,A&&"bs-popover-"+A)},y),l.createElement("div",(0,n.A)({className:"arrow"},v)),f?l.createElement(m,null,p):p)}));f.defaultProps={placement:"right"},f.Title=d,f.Content=m;var v=f},2431:function(e,t,a){var n=a(8168),i=a(8587),s=a(2485),r=a.n(s),l=a(6540),o=a(6519),c=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],d=l.forwardRef((function(e,t){var a=e.bsPrefix,s=e.className,d=e.striped,p=e.bordered,m=e.borderless,u=e.hover,f=e.size,v=e.variant,y=e.responsive,b=(0,i.A)(e,c),A=(0,o.oU)(a,"table"),P=r()(s,A,v&&A+"-"+v,f&&A+"-"+f,d&&A+"-striped",p&&A+"-bordered",m&&A+"-borderless",u&&A+"-hover"),E=l.createElement("table",(0,n.A)({},b,{className:P,ref:t}));if(y){var N=A+"-responsive";return"string"==typeof y&&(N=N+"-"+y),l.createElement("div",{className:N},E)}return E}));t.A=d}}]);
//# sourceMappingURL=8463.e9c11e7f12898311a68b.bundle.js.map