"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[182],{161:function(e,t,a){a.r(t);var n=a(1436),i=a(7814),s=a(7294),r=a(5005),o=a(2258),l=a(4716),c=a(2318),d=a(5293),m=a(3489),u=a(4012),p=a(6222),h=a(8509),f=a(6846),y=a(3803),S=a(9521),g=a(6190),v=a(6964),E=a(1320),b=a(3e3),w=a(9635),Z=a(8425),x=a(5855),P=a(9929);function R(){return R=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)Object.prototype.hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},R.apply(this,arguments)}class C extends s.Component{constructor(e){super(e),this.state={versions:[],errors:[],activeVersion:"",latestVersion:"",selectedVersion:"",loading:!0,page:E.Mq.byondlistpage??1}}addError(e){this.setState((t=>{const a=Array.from(t.errors);return a.push(e),{errors:a}}))}async loadVersions(){if((0,v.n5)(this.context.instancePermissionSet,h.D8.ListInstalled)){const e=await p.Z.listAllVersions(this.context.instance.id,{page:this.state.page});if(e.code===y.G.OK){if(this.state.page>e.payload.totalPages&&0!==e.payload.totalPages)return void this.setState({page:1});this.setState({versions:e.payload.content,maxPage:e.payload.totalPages})}else this.addError(e.error)}if((0,v.n5)(this.context.instancePermissionSet,h.D8.ReadActive)){const e=await p.Z.getActiveVersion(this.context.instance.id);e.code===y.G.OK?this.setState({activeVersion:e.payload.version}):this.addError(e.error)}}async switchVersion(e,t){this.setState({loading:!0});const a=await p.Z.switchActive(this.context.instance.id,e,t&&this.state.customFile?await this.state.customFile.arrayBuffer():void 0);a.code===y.G.ERROR?this.addError(a.error):(t&&this.setState({customFile:null}),a.payload.installJob?(S.Z.registerJob(a.payload.installJob,this.context.instance.id),S.Z.registerCallback(a.payload.installJob.id,(()=>{this.loadVersions()}))):await this.loadVersions()),this.setState({loading:!1})}async componentDidUpdate(e,t){t.page!==this.state.page&&(E.Mq.byondlistpage=this.state.page,await this.loadVersions())}async componentDidMount(){await this.loadVersions(),fetch("https://secure.byond.com/download/version.txt").then((e=>e.text())).then((e=>e.split("\n"))).then((e=>e[0])).then((e=>{this.setState({latestVersion:e,selectedVersion:e,loading:!1})})).catch((e=>{this.addError(new f.ZP(f.jK.APP_FAIL,{jsError:Error(e)})),this.setState({loading:!1})}))}render(){if(this.state.loading)return s.createElement(x.Z,{text:"loading.byond"});const e=(0,v.n5)(this.context.instancePermissionSet,h.D8.ListInstalled),t=(0,v.n5)(this.context.instancePermissionSet,h.D8.ReadActive),a=(0,v.n5)(this.context.instancePermissionSet,h.D8.InstallCustomVersion),f=(0,v.n5)(this.context.instancePermissionSet,h.D8.InstallOfficialOrChangeActiveVersion),g=(0,v.n5)(this.context.instancePermissionSet,h.D8.DeleteInstall),E=e=>e?s.createElement(m.Z,{id:e},s.createElement(u.Z,{id:e})):s.createElement(s.Fragment,null);return s.createElement("div",{className:"text-center"},s.createElement(Z.t,{obj:this.state.versions}),s.createElement("h1",null,s.createElement(u.Z,{id:"view.instance.byond"})),this.state.errors.map(((e,t)=>{if(e)return s.createElement(b.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const a=Array.from(e.errors);return a[t]=void 0,{errors:a}}))})})),e?s.createElement(s.Fragment,null,t?null:s.createElement(w.Z,{title:"view.instance.byond.current_denied"}),s.createElement("div",null,this.state.versions.map((e=>s.createElement(c.Z,{className:"w-md-25 mb-1 mx-auto d-flex",key:e.version},f||t?s.createElement(c.Z.Prepend,null,s.createElement(c.Z.Radio,{name:"byond",id:e.version,value:e.version,disabled:!f,checked:e.version===this.state.activeVersion,onChange:async()=>{await this.switchVersion(e.version,!1)}})):null,s.createElement("label",{className:"flex-grow-1 m-0",htmlFor:e.version},s.createElement(d.Z,{overlay:E("view.instance.byond.custom"),show:!e.version.endsWith(".0")&&void 0},(({ref:t,...a})=>s.createElement(c.Z.Text,R({className:"w-100"},a),e.version.endsWith(".0")?e.version.substr(0,e.version.length-2):e.version,e.version.endsWith(".0")?null:s.createElement("div",{className:"ml-auto",ref:t},s.createElement(i.G,{fixedWidth:!0,icon:"info"})))))),e.version!==this.state.activeVersion?s.createElement(c.Z.Append,null,s.createElement(d.Z,{overlay:E("generic.no_perm"),show:!g&&void 0},s.createElement(r.Z,{variant:"danger",disabled:!g,onClick:async()=>{this.setState({loading:!0});const t=await p.Z.deleteVersion(this.context.instance.id,e.version);t.code===y.G.ERROR?this.addError(t.error):(S.Z.registerJob(t.payload,this.context.instance.id),S.Z.registerCallback(t.payload.id,(()=>{this.loadVersions()}))),this.setState({loading:!1})}},s.createElement(i.G,{icon:n.$aW})))):null)))),s.createElement(P.Z,{className:"mt-4",selectPage:e=>this.setState({page:e}),totalPages:this.state.maxPage??1,currentPage:this.state.page})):t?s.createElement(s.Fragment,null,s.createElement(w.Z,{title:"view.instance.byond.list_denied"}),s.createElement(u.Z,{id:"view.instance.byond.current_version",values:{version:this.state.activeVersion}})):s.createElement(w.Z,{title:"view.instance.byond.current_and_list_denied"}),s.createElement("hr",null),s.createElement("h4",null,s.createElement(u.Z,{id:"view.instance.byond.add"})),s.createElement(c.Z,{className:"w-md-50 w-lg-25 mb-3 mx-auto"},s.createElement(l.Z,{type:"number",defaultValue:this.state.latestVersion.split(".")[0],onChange:e=>{this.setState((t=>{const a=t.selectedVersion.split(".");return a[0]=e.target.value,{selectedVersion:a.join(".")}}))}}),s.createElement(c.Z.Text,{className:"rounded-0"},"."),s.createElement(l.Z,{type:"number",defaultValue:this.state.latestVersion.split(".")[1],onChange:e=>{this.setState((t=>{const a=t.selectedVersion.split(".");return a[1]=e.target.value,{selectedVersion:a.join(".")}}))}}),s.createElement(c.Z.Append,null,s.createElement(d.Z,{overlay:E("generic.no_perm"),show:!f&&void 0},s.createElement(r.Z,{variant:"success",disabled:!f,onClick:async()=>{await this.switchVersion(this.state.selectedVersion,!0)}},s.createElement(i.G,{icon:n.r8p}))))),s.createElement(o.Z,null,s.createElement(d.Z,{overlay:E("generic.no_perm"),show:!a&&void 0},s.createElement(o.Z.File,{custom:!0,id:"test",disabled:!a,className:"w-md-50 w-lg-25 text-left",label:this.state.customFile?this.state.customFile.name:s.createElement(u.Z,{id:"view.instance.byond.upload"}),accept:".zip",onChange:e=>{this.setState({customFile:e.target.files?e.target.files[0]:null})}}))))}}C.contextType=g.g,t.default=C},2685:function(e,t,a){a.r(t);var n=a(7294),i=a(4012),s=a(5977),r=a(8509),o=a(6352),l=a(3803),c=a(9521),d=a(6190),m=a(6964),u=a(3e3),p=a(9049),h=a(5619),f=a(8425),y=a(5855);class S extends n.Component{constructor(e){super(e),this.editInstance=this.editInstance.bind(this),this.state={errors:[],moving:!1}}addError(e){this.setState((t=>{const a=Array.from(t.errors);return a.push(e),{errors:a}}))}async editInstance(e){const t=this.context.instance.id;let a;e.path&&e.path!=this.context.instance.path&&(a=e.path,e.path=null,e.online=!1,this.setState({moving:!0}));const n=await o.Z.editInstance({...e,id:t});if(n.code!==l.G.OK)return this.addError(n.error),void this.setState({moving:!1});if(a){const e=await o.Z.editInstance({id:this.context.instance.id,path:a});if(e.code!==l.G.OK)return this.addError(e.error),this.setState({moving:!1}),void await this.context.reloadInstance();let n;do{if(await new Promise((e=>setTimeout(e,1e3))),n=await o.Z.getInstance(t),n.code!==l.G.OK)return this.addError(n.error),this.setState({moving:!1}),void await this.context.reloadInstance()}while(n.payload.moveJob);const i=await o.Z.editInstance({online:!0,id:t});i.code!==l.G.OK?(this.addError(i.error),this.setState({moving:!1})):c.Z.registerJob(e.payload.moveJob,t)}await this.context.reloadInstance()}render(){const e=e=>(0,m.D0)((0,m.Zg)(this.context.user),e),t={name:{name:"fields.instance.name",type:p.fS.String,defaultValue:this.context.instance.name,disabled:!e(r.c2.Rename)},path:{name:"fields.instance.path",type:p.fS.String,defaultValue:this.context.instance.path,disabled:!e(r.c2.Relocate)},chatBotLimit:{name:"fields.instance.chatbotlimit",type:p.fS.Number,min:0,defaultValue:this.context.instance.chatBotLimit,disabled:!e(r.c2.SetChatBotLimit)},autoUpdateInterval:{name:"fields.instance.autoupdate",type:p.fS.Number,min:0,defaultValue:this.context.instance.autoUpdateInterval,disabled:!e(r.c2.SetAutoUpdate)},configurationType:{name:"fields.instance.filemode",type:p.fS.Enum,enum:r.c7,defaultValue:this.context.instance.configurationType,disabled:!e(r.c2.SetConfiguration)}};return n.createElement("div",{className:"text-center"},n.createElement("h1",null,n.createElement(i.Z,{id:"view.instance.info"})),n.createElement(f.t,{obj:this.context}),this.state.errors.map(((e,t)=>{if(e)return n.createElement(u.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const a=Array.from(e.errors);return a[t]=void 0,{errors:a}}))})})),this.state.moving?n.createElement(y.Z,{text:"loading.instance.move"}):n.createElement(h.Z,{fields:t,onSave:this.editInstance}))}}S.contextType=d.g,t.default=(0,s.EN)(S)},4298:function(e,t,a){a.r(t),a.d(t,{Deployment:function(){return E}});var n=a(7294),i=a(5005),s=a(4012),r=a(5856),o=a(8509),l=a(3803),c=a(9521),d=a(6190),m=a(6964),u=a(3918),p=a(3e3),h=a(9635),f=a(9049),y=a(5619),S=a(8425),g=a(5855),v=a(2741);function E(){const e=(0,n.useContext)(d.g),t=(0,n.useState)([]),[a,E]=(0,n.useState)(!0),[b,w]=(0,n.useState)(null),[Z,x]=(0,n.useState)(null),[P,R]=(0,n.useState)(1),[C,V]=(0,n.useState)(0),[N,I]=(0,n.useState)(5),O=(0,m.$A)(e.instancePermissionSet,o.xb.Read),A=(0,m.$A)(e.instancePermissionSet,o.xb.Compile),D=(0,m.$A)(e.instancePermissionSet,o.xb.CompileJobs);async function T(){if(!O)return E(!1);E(!0);const a=await r.Z.getDeployInfo(e.instance.id);E(!1),a.code===l.G.OK?w(a.payload):(0,p.iT)(t,a.error)}async function _(a){if(!D)return;x(null);const n=await r.Z.listCompileJobs(e.instance.id,{page:a,pageSize:N});n.code===l.G.OK?(N||I(n.payload.pageSize),V(n.payload.totalPages),R(a),x(n.payload.content)):(0,p.iT)(t,n.error)}let k;(0,n.useEffect)((()=>{T(),_(1)}),[e.instance.id]);const G=/(?:(?<days>\d+)\.)?(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+)/.exec(b?.timeout??"");if(G){const e=G.groups;k=60*(24*parseInt(e.days??0)+parseInt(e.hours))+parseInt(e.minutes)+parseInt(e.seconds)/60}const j={projectName:{type:f.fS.String,name:"fields.instance.deploy.projectname",tooltip:"fields.instance.deploy.projectname.desc",defaultValue:b?.projectName,disabled:!(0,m.$A)(e.instancePermissionSet,o.xb.SetDme)},timeout:{type:f.fS.Number,name:"fields.instance.deploy.timeout",tooltip:"fields.instance.deploy.timeout.desc",defaultValue:k,disabled:!(0,m.$A)(e.instancePermissionSet,o.xb.SetTimeout)},apiValidationPort:{type:f.fS.Number,min:1,max:65535,name:"fields.instance.deploy.apiport",tooltip:"fields.instance.deploy.apiport.desc",defaultValue:b?.apiValidationPort,disabled:!(0,m.$A)(e.instancePermissionSet,o.xb.SetApiValidationPort)},apiValidationSecurityLevel:{type:f.fS.Enum,enum:o.ns,name:"fields.instance.deploy.seclevel",tooltip:"fields.instance.deploy.seclevel.desc",defaultValue:b?.apiValidationSecurityLevel,disabled:!(0,m.$A)(e.instancePermissionSet,o.xb.SetSecurityLevel)},requireDMApiValidation:{type:f.fS.Boolean,name:"fields.instance.deploy.validateapi",tooltip:"fields.instance.deploy.validateapi.desc",defaultValue:b?.requireDMApiValidation,disabled:!(0,m.$A)(e.instancePermissionSet,o.xb.SetApiValidationRequirement)}};let $=null;const J={currentPage:P,totalPages:C,loadPage:_,pageSize:N??0};return D?Z&&($={viewDataType:u.a.CompileJobs,compileJobs:Z,paging:J}):$={viewDataType:u.a.CompileJobs,paging:J},n.createElement("div",{className:"text-center"},n.createElement(S.t,{obj:{deployInfo:b}}),(0,p.hP)(t),D?n.createElement(u.Z,{viewData:$}):n.createElement(h.Z,{title:"view.instance.no_compile_jobs"}),n.createElement("hr",null),n.createElement("h3",null,n.createElement(s.Z,{id:"view.instance.deploy.title"})),O?null:n.createElement(h.Z,{title:"view.instance.no_metadata"}),a?n.createElement(g.Z,{text:"loading.deployments"}):n.createElement(n.Fragment,null,n.createElement(y.Z,{hideDisabled:!O,fields:j,onSave:async a=>{let n;if(a.timeout){const e=Math.floor(a.timeout/1440);a.timeout-=1440*e;const t=Math.floor(a.timeout/60);a.timeout-=60*t;const i=Math.floor(a.timeout);a.timeout-=i;const s=Math.floor(60*a.timeout);n=e?`${e}.${t}:${i}:${s}`:`${t}:${i}:${s}`}const i={...a,timeout:n};E(!0);const s=await r.Z.updateDeployInfo(e.instance.id,i);s.code===l.G.ERROR?(0,p.iT)(t,s.error):await T(),E(!1)}}),n.createElement("hr",null),n.createElement(v.Z,{tooltipid:"generic.no_perm",show:!A&&void 0},n.createElement(i.Z,{disabled:!A,onClick:async()=>{const a=await r.Z.startCompile(e.instance.id);a.code===l.G.ERROR?(0,p.iT)(t,a.error):(c.Z.registerJob(a.payload,e.instance.id),c.Z.fastmode=5)}},n.createElement(s.Z,{id:"view.instance.deploy.deploy"})))))}},5921:function(e,t,a){a.r(t),a.d(t,{default:function(){return h}});var n=a(7294),i=a(3204),s=a(3803),r=a(9521),o=a(6190),l=a(1320),c=a(3e3),d=a(3128),m=a(8425),u=a(5855),p=a(9929);function h(){const e=n.useContext(o.g),[t,a]=(0,n.useState)([]),[h,f]=(0,n.useState)([]),[y,S]=(0,n.useState)(!0),[g,v]=(0,n.useState)(l.Mq.jobhistorypage.get(e.instance.id)??1),[E,b]=(0,n.useState)(void 0);function w(e){f((t=>{const a=Array.from(t);return a.push(e),a}))}async function Z(e){const t=await i.Z.deleteJob(e.instanceid,e.id);t.code===s.G.OK?r.Z.fastmode=5:w(t.error)}return(0,n.useEffect)((()=>{l.Mq.jobhistorypage.set(e.instance.id,g),S(!0),async function(){const t=await i.Z.listJobs(e.instance.id,{page:g});t.code===s.G.OK?(g>t.payload.totalPages&&0!==t.payload.totalPages&&v(1),a(t.payload.content),b(t.payload.totalPages)):w(t.error),S(!1)}()}),[g,e.instance.id]),(0,n.useEffect)((()=>{}),[h]),y?n.createElement(u.Z,{text:"loading.instance.jobs.list"}):n.createElement("div",null,n.createElement(m.t,{obj:t}),h.map(((e,t)=>{if(e)return n.createElement(c.ZP,{key:t,error:e,onClose:()=>f((e=>{const a=Array.from(e);return a[t]=void 0,a}))})})),t.sort(((e,t)=>t.id-e.id)).filter((e=>!!e.stoppedAt)).map((e=>n.createElement(d.Z,{job:e,key:e.id,onCancel:Z}))),n.createElement(p.Z,{selectPage:e=>v(e),totalPages:E??1,currentPage:g}))}},6046:function(e,t,a){a.r(t),a.d(t,{default:function(){return Z}});var n,i=a(7294),s=a(7977),r=a(5005),o=a(5293),l=a(3489),c=a(4012),d=a(7179),m=a(8509),u=a(3803),p=a(9521),h=a(6190),f=a(6964),y=a(3918),S=a(3e3),g=a(9635),v=a(9049),E=a(5619),b=a(8425),w=a(5855);function Z(){const e=(0,i.useContext)(h.g),[t,a]=(0,i.useState)(),[Z,x]=(0,i.useState)(!1),P=(0,i.useState)([]);async function R(){if(!(0,f.mg)(e.instancePermissionSet,m.py.ReadMetadata))return a({});const t=await d.Z.getWatchdogStatus(e.instance.id);t.code===u.G.ERROR?(0,S.iT)(P,t.error):a(t.payload)}async function C(t){x(!0);const a=await d.Z.updateWatchdogStatus(e.instance.id,t);a.code===u.G.ERROR&&(0,S.iT)(P,a.error),await R(),x(!1)}if((0,i.useEffect)((()=>{R()}),[e.instance.id]),!t)return i.createElement(i.Fragment,null,(0,S.hP)(P));if(Z)return i.createElement(w.Z,null);const V={autoStart:{type:v.fS.Boolean,name:"fields.instance.watchdog.autostart",defaultValue:t.autoStart,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetAutoStart)},startProfiler:{type:v.fS.Boolean,name:"fields.instance.watchdog.autostartprofiler",defaultValue:t.startProfiler,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetProfiler)},logOutput:{type:v.fS.Boolean,name:"fields.instance.watchdog.logoutput",defaultValue:t.logOutput,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetLogOutput)},port:{type:v.fS.Number,name:"fields.instance.watchdog.port",defaultValue:t.port,min:0,max:65535,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetPort)},visibility:{type:v.fS.Enum,name:"fields.instance.watchdog.visibility",defaultValue:t.visibility,enum:m.Ye,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetVisibility)},securityLevel:{type:v.fS.Enum,name:"fields.instance.watchdog.securitylevel",defaultValue:t.securityLevel,enum:m.ns,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetSecurity)},startupTimeout:{type:v.fS.Number,name:"fields.instance.watchdog.timeout.startup",defaultValue:t.startupTimeout,min:0,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetStartupTimeout)},topicRequestTimeout:{type:v.fS.Number,name:"fields.instance.watchdog.timeout.topic",defaultValue:t.topicRequestTimeout,min:0,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetTopicTimeout)},heartbeatSeconds:{type:v.fS.Number,name:"fields.instance.watchdog.heartbeat",defaultValue:t.heartbeatSeconds,min:0,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetHeartbeatInterval)},dumpOnHeartbeatRestart:{type:v.fS.Boolean,name:"fields.instance.watchdog.dumpOnHeartbeatRestart",defaultValue:t.dumpOnHeartbeatRestart,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.CreateDump)},allowWebClient:{type:v.fS.Boolean,name:"fields.instance.watchdog.allowwebclient",defaultValue:t.allowWebClient,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetWebClient)},additionalParameters:{type:v.fS.String,name:"fields.instance.watchdog.additionalparams",defaultValue:t.additionalParameters,disabled:!(0,f.mg)(e.instancePermissionSet,m.py.SetAdditionalParameters)}},N=Object.values(V).some((e=>!e.disabled)),I=i.createElement(l.Z,{id:"generic.no_perm"},i.createElement(c.Z,{id:"generic.no_perm"})),O=(0,f.mg)(e.instancePermissionSet,m.py.Start),A=(0,f.mg)(e.instancePermissionSet,m.py.Shutdown),D=(0,f.mg)(e.instancePermissionSet,m.py.Restart),T=(0,f.mg)(e.instancePermissionSet,m.py.CreateDump),_=(0,f.mg)(e.instancePermissionSet,m.py.ReadMetadata),k=(0,f.mg)(e.instancePermissionSet,m.py.SoftShutdown)||(0,f.mg)(e.instancePermissionSet,m.py.SoftRestart),G=O||A||D||T,j=(0,f.mg)(e.instancePermissionSet,m.py.ReadRevision);let $=null;return t&&($={viewDataType:y.a.Watchdog,activeCompileJob:t.activeCompileJob,stagedCompileJob:t.stagedCompileJob}),i.createElement("div",{className:"text-center"},i.createElement(b.t,{obj:t}),(0,S.hP)(P),i.createElement("h2",{className:"text-center"},i.createElement(c.Z,{id:"view.instance.server.status"}),i.createElement(s.Z,{pill:!0,variant:t.status===m.Ni.Online?"success":t.status===m.Ni.Offline?"danger":"warning"},i.createElement(c.Z,{id:`view.instance.server.status.${m.Ni[t.status]}`}))),i.createElement("hr",null),j?i.createElement(y.Z,{viewData:$}):i.createElement(g.Z,{title:"view.instance.no_compile_jobs"}),i.createElement("hr",null),i.createElement("h3",{className:"text-center"},i.createElement(c.Z,{id:"view.instance.server.settings"})),_?null:N?i.createElement(g.Z,{title:"view.instance.no_metadata"}):i.createElement(g.Z,{title:"view.instance.server.no_metadata_and_no_settings"}),i.createElement(E.Z,{fields:V,onSave:C,hideDisabled:!_}),i.createElement("hr",null),i.createElement("h3",{className:"text-center"},i.createElement(c.Z,{id:"view.instance.server.actions"})),G?i.createElement(i.Fragment,null,_?null:i.createElement(g.Z,{title:"view.instance.server.no_metadata_actions"}),i.createElement("div",{className:"text-center mb-3"},i.createElement(o.Z,{overlay:I,show:!O&&void 0},i.createElement(r.Z,{variant:"success",className:"mx-2",onClick:async function(){x(!0);const t=await d.Z.startWatchdog(e.instance.id);t.code===u.G.ERROR?(0,S.iT)(P,t.error):(p.Z.registerCallback(t.payload.id,(()=>{R()})),p.Z.fastmode=5,await R()),x(!1)},disabled:_&&t.status!=m.Ni.Offline||!O},i.createElement(c.Z,{id:"view.instance.server.start"}))),i.createElement(o.Z,{overlay:I,show:!A&&void 0},i.createElement(r.Z,{variant:"danger",className:"mx-2",onClick:async function(){if(!confirm())return;x(!0);const t=await d.Z.stopWatchdog(e.instance.id);t.code===u.G.ERROR?(0,S.iT)(P,t.error):await R(),x(!1)},disabled:_&&t.status!=m.Ni.Online||!A},i.createElement(c.Z,{id:"view.instance.server.stop"}))),i.createElement(o.Z,{overlay:I,show:!D&&void 0},i.createElement(r.Z,{variant:"warning",className:"mx-2",onClick:async function(){if(!confirm())return;x(!0);const t=await d.Z.restartWatchdog(e.instance.id);t.code===u.G.ERROR?(0,S.iT)(P,t.error):(p.Z.registerCallback(t.payload.id,(()=>{R()})),p.Z.fastmode=5,await R()),x(!1)},disabled:_&&t.status!=m.Ni.Online||!D},i.createElement(c.Z,{id:"view.instance.server.restart"}))),i.createElement(o.Z,{overlay:I,show:!T&&void 0},i.createElement(r.Z,{variant:"info",className:"mx-2",onClick:async function(){x(!0);const t=await d.Z.dumpWatchdog(e.instance.id);t.code===u.G.ERROR?(0,S.iT)(P,t.error):p.Z.fastmode=5,x(!1)},disabled:_&&t.status!=m.Ni.Online||!T},i.createElement(c.Z,{id:"view.instance.server.dump"}))))):i.createElement(g.Z,{title:"view.instance.server.no_actions"}),!_&&k?i.createElement(g.Z,{title:"view.instance.server.no_metadata_graceful"}):null,_||k?i.createElement("div",{className:"w-75 mx-auto"},i.createElement(v.ZP,{name:"view.instance.graceful",type:v.fS.Enum,enum:n,tooltip:"view.instance.graceful.desc",defaultValue:t.softRestart?n.Restart:t.softShutdown?n.Stop:n.None,disabled:!k,onChange:e=>{switch(e){case n.None:if(!t?.softRestart&&!t?.softShutdown)return;C({softShutdown:!t.softShutdown&&void 0,softRestart:!t.softRestart&&void 0});break;case n.Stop:if(t?.softShutdown)return;C({softShutdown:!0});break;case n.Restart:if(t?.softRestart)return;C({softRestart:!0})}}})):G?i.createElement(g.Z,{title:"view.instance.server.no_graceful"}):null)}!function(e){e[e.None=0]="None",e[e.Stop=1]="Stop",e[e.Restart=2]="Restart"}(n||(n={}))},9182:function(e,t,a){a.r(t);var n=a(7814),i=a(7294),s=a(5881),r=a(3361),o=a(6841),l=a(4012),c=a(5977),d=a(8509),m=a(6352),u=a(5870),p=a(3803),h=a(7961),f=a(4615),y=a(6190),S=a(1320),g=a(7888),v=a(5855),E=a(6642),b=a(161),w=a(740),Z=a(2685),x=a(4298),P=a(926),R=a(7345),C=a(5921),V=a(8264),N=a(6046);const I=d.D8.ReadActive|d.D8.ListInstalled|d.D8.InstallOfficialOrChangeActiveVersion|d.D8.InstallCustomVersion,O=d.py.SetPort|d.py.SetAutoStart|d.py.SetSecurity|d.py.ReadMetadata|d.py.SetWebClient|d.py.SoftRestart|d.py.SoftShutdown|d.py.Restart|d.py.Shutdown|d.py.Start|d.py.SetStartupTimeout|d.py.SetHeartbeatInterval|d.py.CreateDump|d.py.SetTopicTimeout|d.py.SetAdditionalParameters|d.py.SetVisibility,A=d.nX.SetOrigin|d.nX.SetSha|d.nX.MergePullRequest|d.nX.UpdateBranch|d.nX.ChangeCommitter|d.nX.ChangeTestMergeCommits|d.nX.ChangeCredentials|d.nX.SetReference|d.nX.Read|d.nX.ChangeAutoUpdateSettings|d.nX.Delete|d.nX.ChangeSubmoduleUpdate,D=d.xb.Read|d.xb.Compile|d.xb.SetApiValidationPort|d.xb.SetDme|d.xb.SetApiValidationRequirement|d.xb.SetTimeout|d.xb.SetSecurityLevel,T=d.xr.Read|d.xr.Create,_=d.TI.Read|d.TI.List|d.TI.Write;class k extends i.Component{constructor(e){super(e),this.reloadInstance=this.reloadInstance.bind(this),this.deleteContextError=this.deleteContextError.bind(this),S.Mq.selectedinstanceid=parseInt(this.props.match.params.id),this.state={tab:e.match.params.tab??k.tabs[0][0],errors:new Set,instance:null,instancePermissionSet:null,reloadInstance:this.reloadInstance,deleteError:this.deleteContextError,instanceid:parseInt(this.props.match.params.id)}}deleteContextError(e){this.setState((t=>{const a=new Set(t.errors);return a.delete(e),{errors:a}}))}async componentDidMount(){await this.reloadInstance()}componentDidUpdate(e){this.props.match.params.tab&&e.match.params.tab!=this.props.match.params.tab&&this.setState({tab:this.props.match.params.tab})}async reloadInstance(){this.setState({instance:null,instancePermissionSet:null});const e=await m.Z.getInstance(this.state.instanceid);if(e.code===p.G.OK){this.setState({instance:e.payload});const t=await u.Z.getCurrentInstancePermissionSet(this.state.instanceid,!0);t.code===p.G.OK?this.setState({instancePermissionSet:t.payload}):this.setState((e=>{const a=new Set(e.errors);return a.add(t.error),{instancePermissionSet:null,errors:a}}))}else this.setState((t=>{const a=new Set(t.errors);return a.add(e.error),{instance:null,errors:a}}))}render(){if(!this.state.instance||!this.state.instancePermissionSet)return i.createElement(v.Z,{text:"loading.instance"});return i.createElement(y.g.Provider,{value:Object.assign({user:this.context.user,serverInfo:this.context.serverInfo},this.state)},i.createElement(s.Z,{className:"behind-nav"},i.createElement(s.Z.Header,{className:"text-center mb-2 sticky-top"},i.createElement("h3",null,i.createElement(l.Z,{id:"view.instanceedit.title",values:{instanceid:this.props.match.params.id,instancename:this.state.instance.name}})),i.createElement("h5",{className:"text-white-50"},i.createElement(l.Z,{id:`view.instanceedit.tabs.${this.state.tab}`}))),i.createElement(o.Z.Container,{mountOnEnter:!0,unmountOnExit:!0,id:"instanceedit",activeKey:this.state.tab},i.createElement("div",{className:"d-flex flex-row z-front"},i.createElement(s.Z.Body,{className:"flex-grow-0"},(()=>i.createElement(r.Z,{defaultActiveKey:this.state.tab,onSelect:e=>{e=e??k.tabs[0][0],S.Mq.selectedinstanceedittab=e,this.props.history.push(S.$w.instanceedit.link??S.$w.instanceedit.route),this.setState({tab:e??k.tabs[0][0]})},fill:!0,variant:"pills",activeKey:this.state.tab,className:"flex-nowrap text-nowrap flex-column hover-bar sticky-top "+(h.ZP.instanceeditsidebar.value===h.mf.COLLAPSE?"pin-close":h.ZP.instanceeditsidebar.value===h.mf.EXPAND?"pin-open":""),style:{top:"8em"}},k.tabs.map((([e,t,a,s])=>{if(!this.state.instancePermissionSet)throw Error("this.state.instancePermissionSet is null in instanceedit nav map");const o=!s,c=!a(this.state.instancePermissionSet,this.context);return i.createElement(r.Z.Item,{key:e},i.createElement(r.Z.Link,{eventKey:e,bsPrefix:"nav-link instanceedittab",className:(o?"no-access text-white":"")+(c?"no-access text-white font-italic":"")+" text-left"},i.createElement(i.Fragment,null,i.createElement(n.G,{icon:c?"lock":t,fixedWidth:!0}),i.createElement("div",{className:"tab-text d-inline-block "+(c?"font-weight-lighter":"")},i.createElement("span",{className:"pl-1"},i.createElement(l.Z,{id:`view.instanceedit.tabs.${e}`}))))))}))))()),i.createElement(s.Z.Body,{className:"bg-body"},i.createElement(o.Z.Content,null,k.tabs.map((([e,,t,a])=>{if(!this.state.instancePermissionSet)throw Error("this.state.instancePermissionSet is null in render card map");return i.createElement(o.Z.Pane,{eventKey:e,key:e},a?t(this.state.instancePermissionSet,this.context)?i.createElement(a,null):i.createElement(g.Z,null):i.createElement(E.Z,null))}))))))))}}k.tabs=[["info","info",()=>!0,Z.default],["repository","code-branch",e=>!!(e.repositoryRights&A),V.default],["byond","list-ul",e=>!!(e.byondRights&I),b.default],["deployment","hammer",e=>!!(e.dreamMakerRights&D),x.Deployment],["dreamdaemon","server",e=>!!(e.dreamDaemonRights&O),N.default],["chatbots","comments",e=>!!(e.chatBotRights&T),w.default],["files","folder-open",e=>!!(e.configurationRights&_),P.default],["users","users",()=>!0,R.default],["jobs","stream",()=>!0,C.default]],k.contextType=f.f,t.default=(0,c.EN)(k)}}]);
//# sourceMappingURL=182.3a3889b7afbadbd69498.bundle.js.map