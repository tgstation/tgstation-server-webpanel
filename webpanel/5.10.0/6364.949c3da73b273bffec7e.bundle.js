(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[6364],{96845:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return ne}});var n=r(67294),o=r(10682),s=r(88375),a=r(44012),i=r(73727),l="5.10.0",c=r(75631),d=r(42522),u=r(51436),m=r(67814),h=r(24214),p=r(15293),g=r(43489),E=r(35005),f=r(75040),v=r(13361),b=r(95602),y=r(5977),Z=r(81249),w=r(22480),I=r(48509),C=r(53803),x=r(16942),k=r(50452),A=r(44615),N=r(16964),j=r(70601),S=r(1320);function L(){return L=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},L.apply(this,arguments)}class P extends n.Component{constructor(e){super(e),this.logoutClick=this.logoutClick.bind(this),this.loginSuccess=this.loginSuccess.bind(this),this.logout=this.logout.bind(this),this.refresh=this.refresh.bind(this),this.state={routes:[],categories:S.Nz,updateAvailable:!1}}loginSuccess(){this.checkShowServerUpdateIcon()}async checkShowServerUpdateIcon(){await c.Z.wait4Init();const e=await x.Z.getCurrentUser();if(e.code===C.G.ERROR)return;const t=e.payload,r=(0,N.Zg)(t);if((0,N.N3)(r,I.oj.ChangeVersion)){const e=await w.Z.getAdminInfo();if(e.code==C.G.OK){const t=new Z.SemVer(e.payload.latestVersion),r=new Z.SemVer(this.context.serverInfo.version),n=1===t.compare(r);this.setState({updateAvailable:n})}}}logout(){this.setState({updateAvailable:!1})}refresh(e){this.setState({routes:e})}async componentDidMount(){k.Z.on("loginSuccess",this.loginSuccess),c.Z.on("logout",this.logout),this.setState({routes:await j.Z.getRoutes()}),j.Z.on("refresh",this.refresh)}componentWillUnmount(){k.Z.removeListener("loginSuccess",this.loginSuccess),c.Z.removeListener("logout",this.logout),j.Z.removeListener("refresh",this.refresh)}render(){return n.createElement(n.Fragment,null,n.createElement(b.Z,{className:"shadow-lg",expand:this.props.loggedIn?"lg":void 0,collapseOnSelect:!0,variant:"dark",bg:"primary"},n.createElement(b.Z.Brand,{onClick:()=>{this.props.history.push(S.$w.home.link??S.$w.home.route,{reload:!0})},className:"mr-auto"},this.renderVersion()),n.createElement(b.Z.Toggle,{className:"mr-2","aria-controls":"responsive-navbar-nav"}),n.createElement(b.Z.Collapse,{className:"text-right mr-2",style:{minWidth:"0px"}},n.createElement(v.Z,null,this.props.loggedIn?Object.values(this.state.categories).map((e=>{if(e.leader.cachedAuth)return 1==e.routes.length?n.createElement(v.Z.Item,{key:e.name},n.createElement(v.Z.Link,{onClick:()=>{this.props.history.push(e.leader.link??e.leader.route,{reload:!0})},active:(0,N.JW)(this.props.location.pathname,e.leader.route,!e.leader.navbarLoose)},n.createElement(a.Z,{id:e.leader.name}))):n.createElement(v.Z.Item,{key:e.name},n.createElement(h.Z,{id:e.name+"-dropdown",title:n.createElement(a.Z,{id:e.leader.name})},Object.values(e.routes).filter((e=>e.cachedAuth)).length>=2?n.createElement(n.Fragment,null,n.createElement(h.Z.Item,{onClick:()=>{this.props.history.push(e.leader.link??e.leader.route,{reload:!0})},active:(0,N.JW)(this.props.location.pathname,e.leader.route,!0)},n.createElement(a.Z,{id:e.leader.name})),e.routes.map((e=>{if(!e.catleader&&e.cachedAuth&&e.visibleNavbar)return n.createElement(h.Z.Item,{key:e.name,onClick:()=>{this.props.history.push(e.link??e.route,{reload:!0})},active:(0,N.JW)(this.props.location.pathname,e.route,!e.navbarLoose)},n.createElement(a.Z,{id:e.name}))}))):""))})):n.createElement(v.Z.Item,null,n.createElement(v.Z.Link,{onClick:()=>{this.props.history.push(S.$w.home.link??S.$w.home.route,{reload:!0})},active:!0},n.createElement(a.Z,{id:"routes.login"})))),this.state.updateAvailable?n.createElement(p.Z,{placement:"right",overlay:e=>n.createElement(g.Z,L({id:"tgs-updated-tooltip"},e),n.createElement(a.Z,{id:"navbar.update"}))},n.createElement("h3",null,n.createElement(m.G,{className:"tgs-update-notification",onClick:()=>this.props.history.push(S.$w.admin_update.link??S.$w.admin_update.route,{reload:!0}),icon:u.RLE}))):n.createElement(n.Fragment,null),this.renderUser())))}renderVersion(){return this.context.serverInfo?.version?n.createElement(n.Fragment,null,n.createElement(a.Z,{id:"generic.appname"})," v",this.context.serverInfo.version):n.createElement(a.Z,{id:"loading.loading"})}renderUser(){return this.props.loggedIn?n.createElement(v.Z.Item,{className:"ml-auto"},n.createElement(f.Z,null,n.createElement(f.Z.Toggle,{id:"user-dropdown",type:"button",variant:"primary","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"},this.context.user?this.context.user.name:n.createElement(a.Z,{id:"loading.loading"})),n.createElement(f.Z.Menu,{alignRight:!0,className:"text-right"},n.createElement(f.Z.Item,{onClick:()=>{this.props.history.push(S.$w.info.link??S.$w.info.route,{reload:!0})}},n.createElement(a.Z,{id:"routes.info"})),n.createElement(f.Z.Item,{onClick:()=>{this.props.history.push(S.$w.config.link??S.$w.config.route,{reload:!0})}},n.createElement(a.Z,{id:"routes.config"})),S.$w.passwd.cachedAuth?n.createElement(f.Z.Item,{onClick:()=>{this.props.history.push(S.$w.passwd.link??S.$w.passwd.route,{reload:!0})}},n.createElement(a.Z,{id:"routes.passwd"})):"",n.createElement(f.Z.Item,{onClick:()=>{c.Z.emit("purgeCache"),this.props.history.replace(this.props.location.pathname,{reload:!0})}},n.createElement(a.Z,{id:"navbar.purgecache"})),n.createElement(f.Z.Item,{onClick:()=>{this.props.history.replace(this.props.location.pathname,{reload:!0})}},n.createElement(a.Z,{id:"navbar.refresh"})),n.createElement(f.Z.Item,{onClick:this.logoutClick},n.createElement(a.Z,{id:"navbar.logout"}))))):n.createElement(n.Fragment,null,n.createElement(E.Z,{onClick:()=>{this.props.history.push(S.$w.config.link??S.$w.config.route,{reload:!0})},variant:"primary"},n.createElement(m.G,{icon:"cogs"})),n.createElement(E.Z,{onClick:()=>{this.props.history.push(S.$w.info.link??S.$w.info.route,{reload:!0})},variant:"primary"},n.createElement(m.G,{icon:"info-circle"})))}logoutClick(){c.Z.logout()}}P.contextType=A.f;var $=(0,y.EN)(P);function O(){return O=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},O.apply(this,arguments)}class U extends n.Component{render(){let e=4;return n.createElement(p.Z,{placement:"left",onToggle:t=>{t&&(e=Math.round(100*Math.random())%26)},overlay:t=>n.createElement(g.Z,O({id:"report-issue-tooltip"},t),n.createElement(a.Z,{id:`view.meme_${e}`}))},n.createElement("img",{className:"nowrap corner-logo",width:50,height:50,src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/5.10.0/b5616c99bf2052a6bbd7.svg"}))}}function R(){return R=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},R.apply(this,arguments)}class T extends n.Component{render(){return n.createElement(p.Z,{placement:"top",overlay:e=>n.createElement(g.Z,R({id:"report-issue-tooltip"},e),n.createElement(a.Z,{id:"view.report"}))},n.createElement(E.Z,{className:"nowrap report-issue",onClick:()=>window.open("https://github.com/tgstation/tgstation-server-webpanel/issues/new")},n.createElement(m.G,{icon:u.eHv})))}}var _=r(3e3),D=r(15881),G=r(86755);class F extends n.Component{constructor(e){super(e),this.state={}}componentDidUpdate(e){this.props.location.key!==e.location.key&&this.setState({error:void 0,errorInfo:void 0})}componentDidCatch(e,t){this.setState({error:e,errorInfo:t})}render(){return this.state.error?n.createElement(o.Z,{className:"mt-5 mb-5"},n.createElement(D.Z,{className:"bg-transparent",border:"danger"},n.createElement(D.Z.Header,{className:"bg-danger"},n.createElement(a.Z,{id:"error.somethingwentwrong"})),n.createElement(D.Z.Body,null,n.createElement(D.Z.Title,null,this.state.error.name,": ",this.state.error.message),n.createElement(D.Z.Text,{as:"pre",className:"bg-transparent text-danger"},n.createElement("code",null,`Webpanel Version: ${G.q4}\nWebpanel Mode: ${G.IK}\nStack trace: ${this.state.errorInfo?.componentStack??"Unable to get stack info"}`))))):this.props.children}}var z=(0,y.EN)(F),H=r(20271),K=r(35855),B=r(40684),W=r(11895),M=r(96846),V=r(97888);class J extends n.Component{constructor(e){super(e),this.state={clear:!1}}componentDidUpdate(e){this.state.clear?this.setState({clear:!1}):e.match.path==this.props.match.path&&e.location.key!=this.props.location.key&&this.props.location.state?.reload&&this.setState({clear:!0})}render(){return this.state.clear?"":this.props.children}}var q=(0,y.EN)(J),Q=r(9310);const X=e=>n.createElement(K.default,{text:"loading.page"},n.createElement(a.Z,{id:e})),Y=(0,B.ZP)((()=>r.e(6370).then(r.bind(r,56370))),{fallback:X("loading.page.notfound")});class ee extends n.Component{constructor(e){super(e),this.refreshListener=this.refreshListener.bind(this);const t=new Map;j.Z.getImmediateRoutes(!1).forEach((e=>{t.set(e.name,(0,B.ZP)((()=>r(66235)(`./${e.file}`)),{fallback:X(e.name)}))})),this.state={loading:!!new URLSearchParams(window.location.search).get("state"),routes:j.Z.getImmediateRoutes(!1),components:t}}refreshListener(e){this.setState({routes:e})}async componentDidMount(){j.Z.on("refreshAll",this.refreshListener),this.props.history.listen((e=>{this.listener(e.pathname)})),this.listener(this.props.location.pathname);const e=new URLSearchParams(window.location.search),t=e.get("state");if(!t)return void this.setState({loading:!1});window.history.replaceState(null,document.title,window.location.pathname);const r=JSON.parse(window.sessionStorage.getItem("oauth")??"{}")[t];if(!r)return this.setErrorAndEnd(new M.ZP(M.jK.LOGIN_BAD_OAUTH,{jsError:Error(`State(${t}) cannot be resolved to a provider.`)}));const n=e.get("code");if(!n)return this.setErrorAndEnd(new M.ZP(M.jK.LOGIN_BAD_OAUTH,{jsError:Error("Code not found.")}));this.props.history.replace(r.url);const o=await c.Z.login({type:W.P.OAuth,provider:r.provider,token:n});if(window.sessionStorage.removeItem("oauth"),o.code!==C.G.OK)return this.setErrorAndEnd(o.error);this.setState({loading:!1})}componentWillUnmount(){j.Z.removeListener("refreshAll",this.refreshListener)}setErrorAndEnd(e){S.Mq.oautherrors=[e],this.setState({loading:!1})}listener(e){const t=j.Z.getImmediateRoutes(!1);for(const r of t)if(r.category&&r.navbarLoose&&(0,N.JW)(e,r.route)){this.props.selectCategory(r.category);break}}render(){return this.state.loading?n.createElement(K.default,{text:"loading.routes"}):n.createElement(z,null,n.createElement(q,null,n.createElement("div",null,n.createElement(y.rs,null,this.state.routes.map((e=>{if(e.loginless||this.props.loggedIn)return n.createElement(y.AW,{exact:!e.loose,path:e.route,key:e.name,render:t=>{let r;return r=e.cachedAuth?this.state.components.get(e.name):V.Z,this.context?.user||e.loginless?this.context?.serverInfo||e==S.$w.config?e.noContainer?n.createElement(n.Fragment,null,n.createElement(r,t)):n.createElement(o.Z,{className:"mt-5 mb-5"},n.createElement(r,t)):n.createElement(o.Z,null,n.createElement(_.ZP,{error:new M.ZP(M.jK.APP_FAIL,{jsError:Error("Router has no server info in the general context")})})):n.createElement(o.Z,null,n.createElement(_.ZP,{error:new M.ZP(M.jK.APP_FAIL,{jsError:Error("Router has no user in the general context")})}))}})})),n.createElement(o.Z,{className:"mt-5 mb-5"},n.createElement(y.AW,{key:"notfound"},this.props.loggedIn?n.createElement(Y,null):n.createElement(Q.default,{loggedOut:this.props.loggedOut})))))))}}ee.contextType=A.f;var te=(0,y.EN)(ee);class re extends n.Component{constructor(e){super(e),this.state={}}componentDidMount(){document.title="TGS Webpanel v"+l,document.addEventListener("keydown",(e=>{"L"===e.key&&e.ctrlKey&&e.shiftKey&&(c.Z.logout(),c.Z.login(d.Z.default))}))}render(){return n.createElement(i.VK,{basename:window.publicPath?new URL(window.publicPath,window.location.href).pathname:G.UG},n.createElement(z,null,n.createElement($,{category:this.state.passdownCat,loggedIn:this.props.loggedIn}),this.props.loading?n.createElement(o.Z,{className:"mt-5 mb-5"},n.createElement(K.default,{text:"loading.app"})):n.createElement(n.Fragment,null,n.createElement(o.Z,{className:"mt-5"},n.createElement(s.Z,{variant:"warning",className:"d-block d-lg-none"},n.createElement(s.Z.Heading,null,n.createElement(a.Z,{id:"warning.screensize.header"})),n.createElement("hr",null),n.createElement(a.Z,{id:"warning.screensize"})),Array.from(this.context.errors.values()).map(((e,t)=>n.createElement(_.ZP,{error:e,key:t,onClose:()=>this.context.deleteError(e)})))),n.createElement(te,{loggedIn:this.props.loggedIn,loggedOut:this.props.loggedOut,selectCategory:e=>{this.setState({passdownCat:{name:e,key:Math.random().toString()}})}})),this.props.loggedIn?n.createElement(H.Z,null):null),n.createElement(T,null),n.createElement(U,null))}}re.contextType=A.f;var ne=re},97888:function(e,t,r){"use strict";var n=r(67294),o=r(35005),s=r(44012),a=r(5977),i=r(9635);class l extends n.Component{render(){return n.createElement(i.Z,{title:"generic.accessdenied"},n.createElement(o.Z,{variant:"danger",className:"float-right",onClick:()=>{this.props.history.goBack()}},n.createElement(s.Z,{id:"generic.goback"})))}}t.Z=(0,a.EN)(l)},3e3:function(e,t,r){"use strict";r.d(t,{hP:function(){return h},iT:function(){return m}});var n=r(28359),o=r(67294),s=r(88375),a=r(35005),i=r(37959),l=r(44012),c=r(96846),d=r(86755);class u extends o.Component{constructor(e){super(e),this.state={popup:!1}}render(){if(!this.props.error)return"";const e=()=>this.setState({popup:!1});return o.createElement(s.Z,{className:"clearfix",variant:"error",dismissible:!!this.props.onClose,onClose:this.props.onClose},o.createElement(l.Z,{id:this.props.error.code||"error.app.undefined"}),o.createElement("hr",null),o.createElement(a.Z,{variant:"danger",className:"float-right",onClick:()=>this.setState({popup:!0})},o.createElement(l.Z,{id:"generic.details"})),o.createElement(i.Z,{centered:!0,show:this.state.popup,onHide:e,size:"lg"},o.createElement(i.Z.Header,{closeButton:!0},o.createElement(i.Z.Title,null,o.createElement(l.Z,{id:this.props.error.code||"error.app.undefined"}))),o.createElement(i.Z.Body,{className:"text-danger pb-0"},this.props.error.desc?.type===c._T.LOCALE?o.createElement(l.Z,{id:this.props.error.desc.desc||"error.api.empty"}):this.props.error.desc?.desc?this.props.error.desc.desc:"",o.createElement("hr",null),o.createElement(n.Z,null,o.createElement("code",{className:"bg-darker d-block pre-wrap p-2 pre-scrollable"},`Webpanel Version: ${d.q4}\nWebpanel Mode: ${d.IK}\nAPI Version: ${d.Gn}\n\nError Code: ${this.props.error.code}\nError Description: ${this.props.error.desc?this.props.error.desc.desc:"No description"}\n\nAdditional Information:\n${this.props.error.extendedInfo}`.replace(/\\/g,"\\\\")))),o.createElement(i.Z.Footer,null,o.createElement("span",{className:"font-italic mr-auto"},o.createElement(l.Z,{id:"generic.debugwarn"})),o.createElement(a.Z,{variant:"secondary",onClick:e},o.createElement(l.Z,{id:"generic.close"})))))}}function m([,e],t){e((e=>{const r=Array.from(e);return r.push(t),r}))}function h([e,t]){return e.map(((e,r)=>{if(e)return o.createElement(u,{key:r,error:e,onClose:()=>t((e=>{const t=Array.from(e);return t[r]=void 0,t}))})}))}t.ZP=u},9635:function(e,t,r){"use strict";r.d(t,{Z:function(){return a}});var n=r(67294),o=r(88375),s=r(44012);function a(e){return n.createElement(o.Z,{className:"clearfix",variant:"error"},n.createElement(s.Z,{id:e.title}),e.body?n.createElement(n.Fragment,null,n.createElement("hr",null),n.createElement(s.Z,{id:e.body})):e.children?n.createElement(n.Fragment,null,n.createElement("hr",null),e.children):null)}},93128:function(e,t,r){"use strict";r.d(t,{Z:function(){return b}});var n=r(67814),o=r(67294),s=r(35005),a=r(15293),i=r(51479),l=r(10729),c=r(61318),d=r(17863),u=r(43489),m=r(44012),h=r(48272),p=r(28359),g=r(37959),E=r(48509);function f(e){const[t,r]=(0,o.useState)(!1);return o.createElement(o.Fragment,null,o.createElement(s.Z,{variant:"danger",className:"d-inline-block",onClick:()=>r(!0),size:"sm"},o.createElement(m.Z,{id:"generic.errordetails",values:{info:void 0!==e.job.errorCode&&null!==e.job.errorCode?E.jK[e.job.errorCode]:"NoCode"}})),o.createElement(g.Z,{centered:!0,show:t,onHide:()=>r(!1),size:"lg"},o.createElement(g.Z.Header,{closeButton:!0},o.createElement(g.Z.Title,null,o.createElement(m.Z,{id:e.job.description}))),o.createElement(g.Z.Body,{className:"text-danger pb-0"},o.createElement(m.Z,{id:"view.instance.jobs.error"}),":"," ",void 0!==e.job.errorCode&&null!==e.job.errorCode?E.jK[e.job.errorCode]:"NoCode",o.createElement("hr",null),o.createElement(p.Z,null,o.createElement("code",{className:"bg-darker d-block pre-wrap p-2 pre-scrollable"},e.job.exceptionDetails))),o.createElement(g.Z.Footer,null,o.createElement(s.Z,{variant:"secondary",onClick:()=>r(!1)},o.createElement(m.Z,{id:"generic.close"})))))}function v(){return v=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},v.apply(this,arguments)}class b extends o.Component{render(){const e=this.props.job,t=new Date(e.startedAt),r=(t.getTime()-Date.now())/1e3,p=(new Date(e.stoppedAt??0).getTime()-Date.now())/1e3,g=void 0!==e.errorCode||void 0!==e.exceptionDetails?"danger":e.cancelled?"warning":e.stoppedAt?"success":"info";return o.createElement(l.Z,{className:"mx-auto",key:e.id,style:{maxWidth:this.props.width},onClose:()=>{this.props.onClose&&this.props.onClose(e)}},o.createElement(d.Z,{closeButton:!!e.stoppedAt&&!!this.props.onClose,className:`bg-${g}`},"#",e.id,": ",e.description),o.createElement(c.Z,{className:"pt-1 text-white"},e.stage?o.createElement("div",{className:"mb-2"},"\u25b6",e.stage):null,o.createElement(m.Z,{id:"app.job.started"}),o.createElement(a.Z,{overlay:o.createElement(u.Z,{id:`${e.id}-tooltip-started`},t.toLocaleString())},(({ref:e,...t})=>o.createElement("span",v({},t,{ref:e}),o.createElement(h.Z,{value:r,numeric:"auto",updateIntervalInSeconds:1})))),o.createElement("br",null),o.createElement(m.Z,{id:"app.job.startedby"}),o.createElement(a.Z,{overlay:o.createElement(u.Z,{id:`${e.id}-tooltip-startedby`},o.createElement(m.Z,{id:"generic.userid"}),e.startedBy.id)},(({ref:t,...r})=>o.createElement("span",v({ref:t},r),e.startedBy.name))),o.createElement("br",null),o.createElement("br",null),e.stoppedAt?o.createElement(o.Fragment,null,o.createElement(m.Z,{id:e.cancelled?"app.job.cancelled":"app.job.completed"}),o.createElement(a.Z,{overlay:o.createElement(u.Z,{id:`${e.id}-tooltip-stopped`},t.toLocaleString())},(({ref:e,...t})=>o.createElement("span",v({},t,{ref:e}),o.createElement(h.Z,{value:p,numeric:"auto",updateIntervalInSeconds:1})))),o.createElement("br",null)):"",e.cancelledBy?o.createElement(o.Fragment,null,o.createElement(m.Z,{id:"app.job.cancelledby"}),o.createElement(a.Z,{overlay:o.createElement(u.Z,{id:`${e.id}-tooltip-createdby`},o.createElement(m.Z,{id:"generic.userid"}),e.startedBy.id)},(({ref:t,...r})=>o.createElement("span",v({ref:t},r),e.cancelledBy.name))),o.createElement("br",null)):"",void 0!==e.errorCode||void 0!==e.exceptionDetails?o.createElement(f,{job:e}):"",null==e.stoppedAt?o.createElement("div",{className:"d-flex mt-2",style:{height:"1.5rem"}},o.createElement(i.Z,{className:"text-darker font-weight-bold flex-grow-1 h-unset",animated:!e.stoppedAt,label:"number"==typeof e.progress?`${e.progress.toString()}%`:void 0,now:"number"==typeof e.progress?e.progress:100,striped:!0,variant:g}),e.canCancel&&!e.stoppedAt?o.createElement(s.Z,{style:{padding:"0 1em"},className:"ml-1",variant:"danger",onClick:()=>this.props.onCancel(e)},o.createElement(n.G,{icon:"times",className:"d-block"})):null):""))}}},20271:function(e,t,r){"use strict";r.d(t,{Z:function(){return v}});var n=r(51436),o=r(67814),s=r(67294),a=r(15881),i=r(35005),l=r(15293),c=r(43489),d=r(44012),u=r(61090),m=r(27961),h=r(39521),p=r(3e3),g=r(93128),E=r(35855);function f(){return f=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},f.apply(this,arguments)}class v extends s.Component{constructor(e){super(e),this.widgetRef=s.createRef(),this.currentTimeout=void 0,this.handleUpdate=this.handleUpdate.bind(this),this.onCancel=this.onCancel.bind(this),this.onClose=this.onClose.bind(this),this.state={jobs:h.default.jobsByInstance,errors:[],nextRetrySeconds:null,ownerrors:[],loading:!0,instances:new Map}}addError(e){this.setState((t=>{const r=Array.from(t.ownerrors);return r.push(e),this.widgetRef.current&&(this.widgetRef.current.scrollTop=0),{ownerrors:r}}))}componentDidMount(){h.default.on("jobsLoaded",this.handleUpdate),this.handleUpdate()}componentWillUnmount(){h.default.removeListener("jobsLoaded",this.handleUpdate)}handleUpdate(){let e;this.currentTimeout&&(clearTimeout(this.currentTimeout),this.currentTimeout=null),h.default.nextRetry?(e=h.default.nextRetry.getSeconds()>(new Date).getSeconds()?h.default.nextRetry.getSeconds()-(new Date).getSeconds():0,this.currentTimeout=setTimeout((()=>this.handleUpdate()),1e3)):e=null,this.setState({jobs:h.default.jobsByInstance,errors:h.default.errors,nextRetrySeconds:e,loading:!1,instances:h.default.accessibleInstances})}async onCancel(e){await h.default.cancelJob(e.id,(e=>this.addError(e)))&&(h.default.fastmode=5)}onClose(e){h.default.clearJob(e.id)}render(){if(!this.props.widget)return this.nested();let e,t=0;for(const e of this.state.jobs.values())t+=e.size;return e=m.ZP.jobswidgetdisplay.value!==m.zQ.NEVER&&(m.ZP.jobswidgetdisplay.value===m.zQ.ALWAYS||(t>0||this.state.errors.length>0)),s.createElement("div",{style:{position:"fixed",top:0,bottom:0,right:0,left:0,pointerEvents:"none",zIndex:5}},s.createElement(u.s,{className:"jobswidget "+(e?"":"invisible"),style:{pointerEvents:"auto",bottom:0,right:0},default:{width:"30vw",height:"50vh",x:document.documentElement.clientWidth-Math.min(.3*document.documentElement.clientWidth,350)-20,y:document.documentElement.clientHeight-.5*document.documentElement.clientHeight-20},maxWidth:350,minHeight:50,minWidth:110,bounds:"parent"},s.createElement("div",{className:"fancyscroll overflow-auto h-100",ref:this.widgetRef},s.createElement("h5",{className:"text-center text-darker font-weight-bold"},s.createElement(d.Z,{id:"view.instance.jobs.title"})),this.nested())))}nested(){return s.createElement("div",{className:this.props.widget?"d-sm-block":""},this.state.loading?s.createElement(E.default,{text:"loading.instance.jobs.list"}):"",this.state.ownerrors.map(((e,t)=>{if(e)return s.createElement(p.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const r=Array.from(e.ownerrors);return r[t]=void 0,{ownerrors:r}}))})})),this.state.errors.length>0?s.createElement(s.Fragment,null,this.state.errors.map(((e,t)=>s.createElement("div",{key:t,style:{maxWidth:this.props.widget?350:"unset"}},s.createElement(p.ZP,{error:e})))),s.createElement(a.Z,null,0===this.state.nextRetrySeconds?s.createElement(d.Z,{id:"view.instance.jobs.reconnect_now"}):null!=this.state.nextRetrySeconds?s.createElement(d.Z,{id:"view.instance.jobs.reconnect_in",values:{seconds:this.state.nextRetrySeconds}}):s.createElement(d.Z,{id:"view.instance.jobs.reconnected_auth"}))):null,Array.from(this.state.jobs).sort(((e,t)=>e[0]-t[0])).map((([e,t])=>{let r=!1;t.forEach((e=>{e.stoppedAt&&(r=!0)}));const a=r?{marginTop:"5px",marginLeft:"20px"}:void 0;return s.createElement(s.Fragment,{key:e},s.createElement("div",{className:"bg-dark p-2 row"},s.createElement("div",{className:`col-${r?9:12} text-center`},s.createElement("div",{style:a},s.createElement(l.Z,{overlay:(e=>t=>s.createElement(c.Z,f({id:`tooltip-instance-${e}`},t),e))(e)},s.createElement(s.Fragment,null,this.state.instances.get(e)?.name??"Unknown"," ","(",s.createElement(d.Z,{id:"view.instance.jobs.jobtotal",values:{amount:t.size}}),")")))),r?s.createElement("div",{className:"col-3 text-right"},s.createElement(l.Z,{placement:"top",overlay:e=>s.createElement(c.Z,f({id:"clear-instance-jobs"},e),s.createElement(d.Z,{id:"view.instance.jobs.clearfinished"}))},s.createElement(i.Z,{variant:"outline-secondary",onClick:()=>t.forEach((e=>{e.stoppedAt&&h.default.clearJob(e.id)})),className:"nowrap"},s.createElement(o.G,{icon:n.NBC})))):s.createElement(s.Fragment,null)),Array.from(t,(([,e])=>e)).sort(((e,t)=>t.id-e.id)).map((e=>s.createElement(g.Z,{job:e,width:this.props.width,key:e.id,onClose:this.onClose,onCancel:this.onCancel}))))})))}}v.defaultProps={widget:!0}},9310:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return k}});var n=r(51417),o=r(16566),s=r(38658),a=r(67814),i=r(67294),l=r(35005),c=r(31555),d=r(15881),u=r(32258),m=r(44012),h=r(5977),p=r(48509),g=r(11895),E=r(96846),f=r(53803),v=r(75631),b=r(42522),y=r(44615),Z=r(86755),w=r(1320),I=r(3e3),C=r(35855);class x extends i.Component{constructor(e){super(e),this.submit=this.submit.bind(this),console.log(w.Mq.oautherrors),this.state={busy:!1,validated:!1,username:"",password:"",errors:Array.from(w.Mq.oautherrors)}}async componentDidMount(){(window.sessionStorage.getItem("oauth")??b.Z.credentials?.type===g.P.OAuth)||"GITHUB"!==Z.IK||await this.tryLoginDefault()}async tryLoginDefault(){if(this.props.loggedOut)return;(await v.Z.login(b.Z.default)).code===f.G.OK&&this.setState({redirectSetup:!0})}addError(e){this.setState((t=>{const r=Array.from(t.errors);return r.push(e),{errors:r}}))}render(){if(this.state.busy||b.Z.hasToken())return i.createElement(C.default,{text:"loading.login"});if(!this.context.serverInfo)return i.createElement(C.default,{text:"loading.serverinfo"});const e={[p.O4.GitHub]:i.createElement(a.G,{icon:s.zh,style:{width:"1.2em"}}),[p.O4.Discord]:i.createElement(a.G,{icon:o.om,style:{width:"1.2em"}}),[p.O4.TGForums]:i.createElement("img",{src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/5.10.0/c97e39e417e48a3282f9.svg",alt:"tglogo",style:{width:"1.2em"}}),[p.O4.Keycloak]:i.createElement("img",{src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/5.10.0/995a88a72fd6520c8505.png",alt:"keycloaklogo",style:{width:"1.2em"}}),[p.O4.InvisionCommunity]:i.createElement(a.G,{icon:n.n5f,style:{width:"1.2em"}})},t={GitHub:"#161b22",Discord:"#7289da",TGForums:void 0,Keycloak:void 0,InvisionCommunity:void 0};return i.createElement(c.Z,{className:"mx-auto",lg:5,md:8},this.state.errors.map(((e,t)=>{if(e)return i.createElement(I.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const r=Array.from(e.errors);return r[t]=void 0,{errors:r}}))})})),i.createElement(d.Z,{body:!0},i.createElement(d.Z.Title,null,i.createElement(m.Z,{id:"login.header"})),i.createElement(d.Z,{body:!0},i.createElement(d.Z.Title,null,i.createElement(m.Z,{id:"login.type.generic"})),i.createElement(u.Z,{validated:this.state.validated,onSubmit:this.submit},i.createElement(u.Z.Group,{controlId:"username"},i.createElement(u.Z.Label,null,i.createElement(m.Z,{id:"login.username"})),i.createElement(u.Z.Control,{type:"text",placeholder:"Enter username",onChange:e=>this.setState({username:e.target.value}),value:this.state.username,required:!0})),i.createElement(u.Z.Group,{controlId:"password"},i.createElement(u.Z.Label,null,i.createElement(m.Z,{id:"login.password"})),i.createElement(u.Z.Control,{type:"password",placeholder:"Password",onChange:e=>this.setState({password:e.target.value}),value:this.state.password,required:!0})),i.createElement(l.Z,{type:"submit",block:!0},i.createElement(m.Z,{id:"login.submit"})))),(this.context.serverInfo?.oAuthProviderInfos?.Discord||this.context.serverInfo?.oAuthProviderInfos?.GitHub||this.context.serverInfo?.oAuthProviderInfos?.Keycloak||this.context.serverInfo?.oAuthProviderInfos?.TGForums||this.context.serverInfo?.oAuthProviderInfos?.InvisionCommunity)&&i.createElement(i.Fragment,null,i.createElement("hr",null),i.createElement(d.Z,{body:!0},i.createElement(d.Z.Title,null,i.createElement(m.Z,{id:"login.type.oauth"})),Object.keys(this.context.serverInfo.oAuthProviderInfos??{}).map((r=>{const n=t[r];return i.createElement(l.Z,{key:r,block:!0,style:n?{background:n}:void 0,onClick:()=>this.startOAuth(r)},e[r],i.createElement("span",{className:"ml-1"},i.createElement(m.Z,{id:"login.oauth",values:{provider:r}})))}))))))}async startOAuth(e){if(!this.context.serverInfo)return void this.addError(new E.ZP(E.jK.APP_FAIL,{jsError:Error("serverInfo is null in startOAuth")}));const t=new Uint8Array(10);window.crypto.getRandomValues(t);const r=Array.from(t,(e=>e.toString(16).padStart(2,"0"))).join("");let n;const o=encodeURIComponent;switch(e){case p.O4.Discord:n=`https://discord.com/api/oauth2/authorize?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.Discord.clientId)}&scope=identify&state=${o(r)}`;this.context.serverInfo.oAuthProviderInfos.Discord.redirectUri&&(n=`${n}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.Discord.redirectUri)}`);break;case p.O4.GitHub:n=`https://github.com/login/oauth/authorize?client_id=${o(this.context.serverInfo.oAuthProviderInfos.GitHub.clientId)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.GitHub.redirectUri)}&state=${o(r)}&allow_signup=false`;break;case p.O4.Keycloak:n=`${this.context.serverInfo.oAuthProviderInfos.Keycloak.serverUrl}/protocol/openid-connect/auth?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.Keycloak.clientId)}&scope=openid&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.Keycloak.redirectUri)}`;break;case p.O4.TGForums:n=`https://tgstation13.org/phpBB/app.php/tgapi/oauth/auth?scope=user&client_id=${o(this.context.serverInfo.oAuthProviderInfos.TGForums.clientId)}&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.TGForums.redirectUri)}`;break;case p.O4.InvisionCommunity:n=`${this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.serverUrl}/oauth/authorize/?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.clientId)}&scope=profile&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.redirectUri)}`}const s=JSON.parse(window.sessionStorage.getItem("oauth")??"{}");return s[r]={provider:e,url:this.props.location.pathname},window.sessionStorage.setItem("oauth",JSON.stringify(s)),window.location.href=n,new Promise((e=>e()))}async submit(e){e.preventDefault(),this.setState({busy:!0});const t=await v.Z.login({type:g.P.Password,userName:this.state.username,password:this.state.password});t.code==f.G.ERROR&&(this.setState({busy:!1}),this.addError(t.error))}}x.contextType=y.f;var k=(0,h.EN)(x)},70601:function(e,t,r){"use strict";var n=r(12527),o=r(50452),s=r(1320);class a extends n.TypedEmitter{constructor(){super(),this.refreshing=!1,window.rtcontroller=this,this.refreshRoutes=this.refreshRoutes.bind(this),o.Z.addHook(this.refreshRoutes),this.refreshRoutes().catch(console.error),console.time("Category mapping");const e=new Map;for(const[t,r]of Object.entries(s.XT))r.routes=[],e.set(r.name,r),s.Nz[t]=r;for(const t of Object.values(s.$w)){if(!t.category)continue;const r=e.get(t.category);if(r){if(r.routes.push(t),t.catleader){if(r.leader){console.error("Category has two leaders",r.leader,t);continue}r.leader=t}}else console.error("Route has invalid category",t)}console.log("Categories mapped",e),console.timeEnd("Category mapping")}async refreshRoutes(){if(this.refreshing)return void console.log("Already refreshing");this.refreshing=!0;const e=[],t=this.getImmediateRoutes(!1);for(const r of t)r.cachedAuth=void 0,r.isAuthorized?e.push(r.isAuthorized().then((e=>{r.cachedAuth=e}))):r.cachedAuth=!0;await Promise.all(e),this.emit("refresh",this.getImmediateRoutes(!0));const r=this.getImmediateRoutes(!1);return this.emit("refreshAll",r),this.refreshing=!1,console.log("Routes refreshed",r),await this.getRoutes()}wait4refresh(){return new Promise((e=>{this.refreshing?this.on("refresh",(()=>{e()})):e()}))}async getRoutes(e=!0){return await this.wait4refresh(),this.getImmediateRoutes(e)}getImmediateRoutes(e=!0){const t=[];for(const r of Object.values(s.$w))r.isAuthorized&&!r.cachedAuth&&e||t.push(r);return t}}t.Z=new a},1320:function(e,t,r){"use strict";r.d(t,{$w:function(){return d},Mq:function(){return h},Nz:function(){return m},XT:function(){return u}});var n=r(48509),o=r(53803),s=r(16942),a=r(42522),i=r(16964);function l(e){return async()=>{if(!a.Z.hasToken())return!1;const t=await s.Z.getCurrentUser();return t.code==o.G.OK&&!!((0,i.Zg)(t.payload).administrationRights&e)}}function c(e){return async()=>{if(!a.Z.hasToken())return!1;const t=await s.Z.getCurrentUser();return t.code==o.G.OK&&!!((0,i.Zg)(t.payload).instanceManagerRights&e)}}const d={home:{name:"routes.home",route:"/",file:"Home",loose:!1,navbarLoose:!1,visibleNavbar:!0,homeIcon:void 0,category:"home",catleader:!0},instancecreate:{name:"routes.instancecreate",route:"/instances/create",file:"Instance/Create",loose:!1,navbarLoose:!1,isAuthorized:c(n.c2.Create),visibleNavbar:!1,category:"instance",catleader:!1},instancelist:{name:"routes.instancelist",route:"/instances/",file:"Instance/List",loose:!1,navbarLoose:!0,isAuthorized:c(n.c2.List|n.c2.Read),visibleNavbar:!0,homeIcon:"hdd",category:"instance",catleader:!0},instanceedit:{name:"routes.instanceedit",route:"/instances/edit/:id(\\d+)/:tab?/",file:"Instance/InstanceEdit",get link(){return void 0!==h.selectedinstanceid?`/instances/edit/${h.selectedinstanceid}/${void 0!==h.selectedinstanceedittab?`${h.selectedinstanceedittab}/`:""}`:d.instancelist.link??d.instancelist.route},loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"instance"},instancejobs:{name:"routes.instancejobs",route:"/instances/jobs/",file:"Instance/Jobs",loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"instance"},userlist:{name:"routes.usermanager",route:"/users/",file:"User/List",loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:"user",category:"user",catleader:!0},useredit:{name:"routes.useredit",route:"/users/edit/user/:id(\\d+)/:tab?/",get link(){return void 0!==h.selecteduserid?`/users/edit/user/${h.selecteduserid}/${void 0!==h.selectedusertab?`${h.selectedusertab}/`:""}`:d.userlist.link??d.userlist.route},file:"User/Edit",loose:!0,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"user"},usercreate:{name:"routes.usercreate",route:"/users/create/",link:"/users/create/",file:"User/Create",loose:!0,navbarLoose:!0,isAuthorized:l(n.oj.WriteUsers),visibleNavbar:!0,homeIcon:void 0,category:"user"},admin:{name:"routes.admin",route:"/admin/",file:"Administration",loose:!1,navbarLoose:!0,isAuthorized:l(n.oj.ChangeVersion|n.oj.DownloadLogs|n.oj.UploadVersion),visibleNavbar:!0,homeIcon:"tools",category:"admin",catleader:!0},admin_update:{name:"routes.admin.update",route:"/admin/update/:all?/",file:"Admin/Update",link:"/admin/update/",loose:!0,navbarLoose:!0,isAuthorized:l(n.oj.ChangeVersion|n.oj.UploadVersion),visibleNavbar:!0,homeIcon:void 0,category:"admin"},admin_logs:{name:"routes.admin.logs",route:"/admin/logs/:name?/",link:"/admin/logs/",file:"Admin/Logs",loose:!1,navbarLoose:!0,isAuthorized:l(n.oj.DownloadLogs),visibleNavbar:!0,homeIcon:void 0,category:"admin",noContainer:!0},passwd:{name:"routes.passwd",route:"/users/passwd/:id(\\d+)?/",link:"/users/passwd/",file:"ChangePassword",loose:!0,navbarLoose:!0,isAuthorized:l(n.oj.EditOwnPassword),visibleNavbar:!1,homeIcon:"key"},config:{name:"routes.config",route:"/config/",file:"Configuration",loose:!0,navbarLoose:!0,loginless:!0,visibleNavbar:!1,homeIcon:"cogs"},setup:{name:"routes.setup",route:"/setup/",file:"Setup",loose:!0,navbarLoose:!0,loginless:!0,visibleNavbar:!1},oAuth:{name:"routes.oauth",route:"/oauth/:provider?/",file:"Login",loose:!0,navbarLoose:!1,loginless:!0,visibleNavbar:!1},info:{name:"routes.info",route:"/info",file:"Info",loose:!1,navbarLoose:!1,loginless:!0,visibleNavbar:!0,homeIcon:"info-circle",category:void 0,catleader:!1}},u={home:{name:"home"},instance:{name:"instance"},user:{name:"user"},admin:{name:"admin"}},m={},h={selecteduserid:void 0,selectedusertab:void 0,selectedinstanceid:void 0,selectedinstanceedittab:void 0,instancelistpage:void 0,loglistpage:void 0,byondlistpage:void 0,userlistpage:void 0,jobhistorypage:new Map,oautherrors:[]}},66235:function(e,t,r){var n={"./Admin/Logs":[43408,5171,3408],"./Admin/Logs.tsx":[43408,5171,3408],"./Admin/Update":[80732,5171,5578,5006,724,732],"./Admin/Update.tsx":[80732,5171,5578,5006,724,732],"./Administration":[29363,5171,9363],"./Administration.tsx":[29363,5171,9363],"./ChangePassword":[61304,799],"./ChangePassword.tsx":[61304,799],"./Configuration":[67671,7806,7671],"./Configuration.tsx":[67671,7806,7671],"./Home":[59638,9638],"./Home.tsx":[59638,9638],"./Info":[41051,5171,1051],"./Info.tsx":[41051,5171,1051],"./Instance/Create":[38747,9899,5856,3637,7179,7611,5578,5006,8747],"./Instance/Create.tsx":[38747,9899,5856,3637,7179,7611,5578,5006,8747],"./Instance/Edit/ChatBots":[90740,1767,5171,740,3318],"./Instance/Edit/ChatBots.tsx":[90740,1767,5171,740,3318],"./Instance/Edit/Config":[62685,5171,2685],"./Instance/Edit/Config.tsx":[62685,5171,2685],"./Instance/Edit/Deployment":[44298,9899,5856,5171,5578,2240,8067,9356],"./Instance/Edit/Deployment.tsx":[44298,9899,5856,5171,5578,2240,8067,9356],"./Instance/Edit/Engine":[32240,9899,5171,5578,2240,9657],"./Instance/Edit/Engine.tsx":[32240,9899,5171,5578,2240,9657],"./Instance/Edit/Files":[20926,3637,5171,926,3608],"./Instance/Edit/Files.tsx":[20926,3637,5171,926,3608],"./Instance/Edit/InstancePermissions":[87345,4803,5171,7345,246],"./Instance/Edit/InstancePermissions.tsx":[87345,4803,5171,7345,246],"./Instance/Edit/JobHistory":[25921,5171,5921],"./Instance/Edit/JobHistory.tsx":[25921,5171,5921],"./Instance/Edit/Repository":[18264,5856,7611,5171,5578,4757,8264,5233],"./Instance/Edit/Repository.tsx":[18264,5856,7611,5171,5578,4757,8264,5233],"./Instance/Edit/Server":[86046,9899,7179,5171,5578,2240,8067,4792],"./Instance/Edit/Server.tsx":[86046,9899,7179,5171,5578,2240,8067,4792],"./Instance/InstanceEdit":[9182,9899,5856,3637,7179,7611,4803,1767,5171,5578,4757,3165,2240,8067,8264,740,926,7345,9182],"./Instance/InstanceEdit.tsx":[9182,9899,5856,3637,7179,7611,4803,1767,5171,5578,4757,3165,2240,8067,8264,740,926,7345,9182],"./Instance/Jobs":[41818,1818],"./Instance/Jobs.tsx":[41818,1818],"./Instance/List":[70670,5171,670],"./Instance/List.tsx":[70670,5171,670],"./Login":[9310],"./Login.tsx":[9310],"./Setup":[12757,2757],"./Setup.tsx":[12757,2757],"./User/Create":[14898,4898],"./User/Create.tsx":[14898,4898],"./User/Edit":[11404,4803,5171,1404],"./User/Edit.tsx":[11404,4803,5171,1404],"./User/List":[8746,5171,8746],"./User/List.tsx":[8746,5171,8746]};function o(e){if(!r.o(n,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=n[e],o=t[0];return Promise.all(t.slice(1).map(r.e)).then((function(){return r(o)}))}o.keys=function(){return Object.keys(n)},o.id=66235,e.exports=o}}]);
//# sourceMappingURL=6364.949c3da73b273bffec7e.bundle.js.map