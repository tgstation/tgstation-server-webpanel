(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[7194],{572:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return ne}});var n=r(6540),o=r(3048),s=r(5677),a=r(8065),i=r(4625),l="6.4.3",c=r(3728),d=r(6192),u=r(6188),m=r(6784),h=r(5531),p=r(5038),g=r(3524),E=r(5615),f=r(5855),A=r(6867),v=r(3946),b=r(4180),y=r(9589),w=r(3490),I=r(2576),C=r(5301),x=r(1552),k=r(536),S=r(7864),L=r(4118),N=r(7505),O=r(664);function j(){return j=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},j.apply(null,arguments)}class U extends n.Component{constructor(e){super(e),this.logoutClick=this.logoutClick.bind(this),this.loginSuccess=this.loginSuccess.bind(this),this.logout=this.logout.bind(this),this.refresh=this.refresh.bind(this),this.state={routes:[],categories:O.I9,updateAvailable:!1}}loginSuccess(){this.checkShowServerUpdateIcon()}async checkShowServerUpdateIcon(){await c.A.wait4Init();const e=await x.A.getCurrentUser();if(e.code===C.s.ERROR)return;const t=e.payload,r=(0,L.u)(t);if((0,L.CM)(r,I.O4.ChangeVersion)){const e=await w.A.getAdminInfo();if(e.code==C.s.OK){const t=new y.SemVer(e.payload.latestVersion),r=new y.SemVer(this.context.serverInfo.version),n=1===t.compare(r);this.setState({updateAvailable:n})}}}logout(){this.setState({updateAvailable:!1})}refresh(e){this.setState({routes:e})}componentDidMount(){k.A.on("loginSuccess",this.loginSuccess),c.A.on("logout",this.logout),(async()=>{this.setState({routes:await N.A.getRoutes()}),N.A.on("refresh",this.refresh)})()}componentWillUnmount(){k.A.removeListener("loginSuccess",this.loginSuccess),c.A.removeListener("logout",this.logout),N.A.removeListener("refresh",this.refresh)}render(){return n.createElement(n.Fragment,null,n.createElement(v.A,{className:"shadow-lg",expand:this.props.loggedIn?"lg":void 0,collapseOnSelect:!0,variant:"dark",bg:"primary"},n.createElement(v.A.Brand,{onClick:()=>{this.props.history.push(O.Sb.home.link??O.Sb.home.route,{reload:!0})},className:"mr-auto"},this.renderVersion()),n.createElement(v.A.Toggle,{className:"mr-2","aria-controls":"responsive-navbar-nav"}),n.createElement(v.A.Collapse,{className:"text-right mr-2",style:{minWidth:"0px"}},n.createElement(A.A,null,this.props.loggedIn?Object.values(this.state.categories).map((e=>{if(e.leader.cachedAuth)return 1==e.routes.length?n.createElement(A.A.Item,{key:e.name},n.createElement(A.A.Link,{onClick:()=>{this.props.history.push(e.leader.link??e.leader.route,{reload:!0})},active:(0,L.$h)(this.props.location.pathname,e.leader.route,!e.leader.navbarLoose)},n.createElement(a.A,{id:e.leader.name}))):n.createElement(A.A.Item,{key:e.name},n.createElement(h.A,{id:e.name+"-dropdown",title:n.createElement(a.A,{id:e.leader.name})},Object.values(e.routes).filter((e=>e.cachedAuth)).length>=2?n.createElement(n.Fragment,null,n.createElement(h.A.Item,{onClick:()=>{this.props.history.push(e.leader.link??e.leader.route,{reload:!0})},active:(0,L.$h)(this.props.location.pathname,e.leader.route,!0)},n.createElement(a.A,{id:e.leader.name})),e.routes.map((e=>{if(!e.catleader&&e.cachedAuth&&e.visibleNavbar)return n.createElement(h.A.Item,{key:e.name,onClick:()=>{this.props.history.push(e.link??e.route,{reload:!0})},active:(0,L.$h)(this.props.location.pathname,e.route,!e.navbarLoose)},n.createElement(a.A,{id:e.name}))}))):""))})):n.createElement(A.A.Item,null,n.createElement(A.A.Link,{onClick:()=>{this.props.history.push(O.Sb.home.link??O.Sb.home.route,{reload:!0})},active:!0},n.createElement(a.A,{id:"routes.login"})))),this.state.updateAvailable?n.createElement(p.A,{placement:"right",overlay:e=>n.createElement(g.A,j({id:"tgs-updated-tooltip"},e),n.createElement(a.A,{id:"navbar.update"}))},n.createElement("h3",null,n.createElement(m.g,{className:"tgs-update-notification",onClick:()=>this.props.history.push(O.Sb.admin_update.link??O.Sb.admin_update.route,{reload:!0}),icon:u.tUE}))):n.createElement(n.Fragment,null),this.renderUser())))}renderVersion(){return this.context.serverInfo?.version?n.createElement(n.Fragment,null,n.createElement(a.A,{id:"generic.appname"})," v",this.context.serverInfo.version):n.createElement(a.A,{id:"loading.loading"})}renderUser(){return this.props.loggedIn?n.createElement(A.A.Item,{className:"ml-auto"},n.createElement(f.A,null,n.createElement(f.A.Toggle,{id:"user-dropdown",type:"button",variant:"primary","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"},this.context.user?this.context.user.name:n.createElement(a.A,{id:"loading.loading"})),n.createElement(f.A.Menu,{alignRight:!0,className:"text-right"},n.createElement(f.A.Item,{onClick:()=>{this.props.history.push(O.Sb.info.link??O.Sb.info.route,{reload:!0})}},n.createElement(a.A,{id:"routes.info"})),n.createElement(f.A.Item,{onClick:()=>{this.props.history.push(O.Sb.config.link??O.Sb.config.route,{reload:!0})}},n.createElement(a.A,{id:"routes.config"})),O.Sb.passwd.cachedAuth?n.createElement(f.A.Item,{onClick:()=>{this.props.history.push(O.Sb.passwd.link??O.Sb.passwd.route,{reload:!0})}},n.createElement(a.A,{id:"routes.passwd"})):"",n.createElement(f.A.Item,{onClick:()=>{c.A.emit("purgeCache"),this.props.history.replace(this.props.location.pathname,{reload:!0})}},n.createElement(a.A,{id:"navbar.purgecache"})),n.createElement(f.A.Item,{onClick:()=>{this.props.history.replace(this.props.location.pathname,{reload:!0})}},n.createElement(a.A,{id:"navbar.refresh"})),n.createElement(f.A.Item,{onClick:this.logoutClick},n.createElement(a.A,{id:"navbar.logout"}))))):n.createElement(n.Fragment,null,n.createElement(E.A,{onClick:()=>{this.props.history.push(O.Sb.config.link??O.Sb.config.route,{reload:!0})},variant:"primary"},n.createElement(m.g,{icon:"cogs"})),n.createElement(E.A,{onClick:()=>{this.props.history.push(O.Sb.info.link??O.Sb.info.route,{reload:!0})},variant:"primary"},n.createElement(m.g,{icon:"info-circle"})))}logoutClick(){c.A.logout()}}U.contextType=S.U;var R=(0,b.y)(U);function $(){return $=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},$.apply(null,arguments)}class P extends n.Component{render(){let e=4;return n.createElement(p.A,{placement:"left",onToggle:t=>{t&&(e=Math.round(100*Math.random())%26)},overlay:t=>n.createElement(g.A,$({id:"report-issue-tooltip"},t),n.createElement(a.A,{id:`view.meme_${e}`}))},n.createElement("img",{className:"nowrap corner-logo",width:50,height:50,src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/6.4.3/b5616c99bf2052a6bbd7.svg"}))}}function D(){return D=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},D.apply(null,arguments)}class T extends n.Component{render(){return n.createElement(p.A,{placement:"top",overlay:e=>n.createElement(g.A,D({id:"report-issue-tooltip"},e),n.createElement(a.A,{id:"view.report"}))},n.createElement(E.A,{className:"nowrap report-issue",onClick:()=>window.open("https://github.com/tgstation/tgstation-server-webpanel/issues/new")},n.createElement(m.g,{icon:u.zpE})))}}var _=r(7567),F=r(472),H=r(7602);class M extends n.Component{constructor(e){super(e),this.state={}}componentDidUpdate(e){this.props.location.key!==e.location.key&&this.setState({error:void 0,errorInfo:void 0})}componentDidCatch(e,t){this.setState({error:e,errorInfo:t})}render(){return this.state.error?n.createElement(o.A,{className:"mt-5 mb-5"},n.createElement(F.A,{className:"bg-transparent",border:"danger"},n.createElement(F.A.Header,{className:"bg-danger"},n.createElement(a.A,{id:"error.somethingwentwrong"})),n.createElement(F.A.Body,null,n.createElement(F.A.Title,null,this.state.error.name,": ",this.state.error.message),n.createElement(F.A.Text,{as:"pre",className:"bg-transparent text-danger"},n.createElement("code",null,`Webpanel Version: ${H.xv}\nWebpanel Mode: ${H.g}\nStack trace: ${this.state.errorInfo?.componentStack??"Unable to get stack info"}`))))):this.props.children}}var z=(0,b.y)(M),B=r(875),G=r(7255),W=r(7225),V=r(6382),K=r(4173),J=r(992);class q extends n.Component{constructor(e){super(e),this.state={clear:!1}}componentDidUpdate(e){this.state.clear?this.setState({clear:!1}):e.match.path==this.props.match.path&&e.location.key!=this.props.location.key&&this.props.location.state?.reload&&this.setState({clear:!0})}render(){return this.state.clear?"":this.props.children}}var X=(0,b.y)(q),Y=r(1241);const Z=e=>n.createElement(G.default,{text:"loading.page"},n.createElement(a.A,{id:e})),Q=(0,W.Ay)((()=>r.e(3718).then(r.bind(r,3718))),{fallback:Z("loading.page.notfound")});class ee extends n.Component{constructor(e){super(e),this.refreshListener=this.refreshListener.bind(this);const t=new Map;N.A.getImmediateRoutes(!1).forEach((e=>{t.set(e.name,(0,W.Ay)((()=>r(2212)(`./${e.file}`)),{fallback:Z(e.name)}))})),this.state={loading:!!new URLSearchParams(window.location.search).get("state"),routes:N.A.getImmediateRoutes(!1),components:t}}refreshListener(e){this.setState({routes:e})}componentDidMount(){N.A.on("refreshAll",this.refreshListener),this.props.history.listen((e=>{this.listener(e.pathname)})),this.listener(this.props.location.pathname);const e=new URLSearchParams(window.location.search),t=e.get("state");if(!t)return void this.setState({loading:!1});window.history.replaceState(null,document.title,window.location.pathname);const r=JSON.parse(window.sessionStorage.getItem("oauth")??"{}")[t];if(!r)return this.setErrorAndEnd(new K.Ay(K.O4.LOGIN_BAD_OAUTH,{jsError:Error(`State(${t}) cannot be resolved to a provider.`)}));const n=e.get("code");if(!n)return this.setErrorAndEnd(new K.Ay(K.O4.LOGIN_BAD_OAUTH,{jsError:Error("Code not found.")}));this.props.history.replace(r.url),(async()=>{const e=await c.A.login({type:V.$.OAuth,provider:r.provider,token:n});window.sessionStorage.removeItem("oauth"),e.code===C.s.OK?this.setState({loading:!1}):this.setErrorAndEnd(e.error)})()}componentWillUnmount(){N.A.removeListener("refreshAll",this.refreshListener)}setErrorAndEnd(e){O.M2.oautherrors=[e],this.setState({loading:!1})}listener(e){const t=N.A.getImmediateRoutes(!1);for(const r of t)if(r.category&&r.navbarLoose&&(0,L.$h)(e,r.route)){this.props.selectCategory(r.category);break}}render(){return this.state.loading?n.createElement(G.default,{text:"loading.routes"}):n.createElement(z,null,n.createElement(X,null,n.createElement("div",null,n.createElement(b.dO,null,this.state.routes.map((e=>{if(e.loginless||this.props.loggedIn)return n.createElement(b.qh,{exact:!e.loose,path:e.route,key:e.name,render:t=>{let r;return r=e.cachedAuth?this.state.components.get(e.name):J.A,this.context?.user||e.loginless?this.context?.serverInfo||e==O.Sb.config?e.noContainer?n.createElement(n.Fragment,null,n.createElement(r,t)):n.createElement(o.A,{className:"mt-5 mb-5"},n.createElement(r,t)):n.createElement(o.A,null,n.createElement(_.Ay,{error:new K.Ay(K.O4.APP_FAIL,{jsError:Error("Router has no server info in the general context")})})):n.createElement(o.A,null,n.createElement(_.Ay,{error:new K.Ay(K.O4.APP_FAIL,{jsError:Error("Router has no user in the general context")})}))}})})),n.createElement(o.A,{className:"mt-5 mb-5"},n.createElement(b.qh,{key:"notfound"},this.props.loggedIn?n.createElement(Q,null):n.createElement(Y.default,{loggedOut:this.props.loggedOut})))))))}}ee.contextType=S.U;var te=(0,b.y)(ee);class re extends n.Component{constructor(e){super(e),this.state={}}componentDidMount(){document.title="TGS Webpanel v"+l,document.addEventListener("keydown",(e=>{"L"===e.key&&e.ctrlKey&&e.shiftKey&&(c.A.logout(),c.A.login(d.A.default))}))}render(){return n.createElement(i.Kd,{basename:window.publicPath?new URL(window.publicPath,window.location.href).pathname:H.Jk},n.createElement(z,null,n.createElement(R,{category:this.state.passdownCat,loggedIn:this.props.loggedIn}),this.props.loading?n.createElement(o.A,{className:"mt-5 mb-5"},n.createElement(G.default,{text:"loading.app"})):n.createElement(n.Fragment,null,n.createElement(o.A,{className:"mt-5"},n.createElement(s.A,{variant:"warning",className:"d-block d-lg-none"},n.createElement(s.A.Heading,null,n.createElement(a.A,{id:"warning.screensize.header"})),n.createElement("hr",null),n.createElement(a.A,{id:"warning.screensize"})),Array.from(this.context.errors.values()).map(((e,t)=>n.createElement(_.Ay,{error:e,key:t,onClose:()=>this.context.deleteError(e)})))),n.createElement(te,{loggedIn:this.props.loggedIn,loggedOut:this.props.loggedOut,selectCategory:e=>{this.setState({passdownCat:{name:e,key:Math.random().toString()}})}})),this.props.loggedIn?n.createElement(B.A,null):null),n.createElement(T,null),n.createElement(P,null))}}re.contextType=S.U;var ne=re},992:function(e,t,r){"use strict";var n=r(6540),o=r(5615),s=r(8065),a=r(4180),i=r(5659);class l extends n.Component{render(){return n.createElement(i.A,{title:"generic.accessdenied"},n.createElement(o.A,{variant:"danger",className:"float-right",onClick:()=>{this.props.history.goBack()}},n.createElement(s.A,{id:"generic.goback"})))}}t.A=(0,a.y)(l)},7567:function(e,t,r){"use strict";r.d(t,{CN:function(){return m},u9:function(){return h}});var n=r(9181),o=r(6540),s=r(5677),a=r(5615),i=r(1274),l=r(8065),c=r(4173),d=r(7602);class u extends o.Component{constructor(e){super(e),this.state={popup:!1}}render(){if(!this.props.error)return"";const e=()=>this.setState({popup:!1});return o.createElement(s.A,{className:"clearfix",variant:"error",dismissible:!!this.props.onClose,onClose:this.props.onClose},o.createElement(l.A,{id:this.props.error.code||"error.app.undefined"}),o.createElement("hr",null),o.createElement(a.A,{variant:"danger",className:"float-right",onClick:()=>this.setState({popup:!0})},o.createElement(l.A,{id:"generic.details"})),o.createElement(i.A,{centered:!0,show:this.state.popup,onHide:e,size:"lg"},o.createElement(i.A.Header,{closeButton:!0},o.createElement(i.A.Title,null,o.createElement(l.A,{id:this.props.error.code||"error.app.undefined"}))),o.createElement(i.A.Body,{className:"text-danger pb-0"},this.props.error.desc?.type===c.MZ.LOCALE?o.createElement(l.A,{id:this.props.error.desc.desc||"error.api.empty"}):this.props.error.desc?.desc?this.props.error.desc.desc:"",o.createElement("hr",null),o.createElement(n.A,null,o.createElement("code",{className:"bg-darker d-block pre-wrap p-2 pre-scrollable"},`Webpanel Version: ${d.xv}\nWebpanel Mode: ${d.g}\nAPI Version: ${d.mG}\n\nError Code: ${this.props.error.code}\nError Description: ${this.props.error.desc?this.props.error.desc.desc:"No description"}\n\nAdditional Information:\n${this.props.error.extendedInfo}`.replace(/\\/g,"\\\\")))),o.createElement(i.A.Footer,null,o.createElement("span",{className:"font-italic mr-auto"},o.createElement(l.A,{id:"generic.debugwarn"})),o.createElement(a.A,{variant:"secondary",onClick:e},o.createElement(l.A,{id:"generic.close"})))))}}function m([,e],t){e((e=>{const r=Array.from(e);return r.push(t),r}))}function h([e,t]){return e.map(((e,r)=>{if(e)return o.createElement(u,{key:r,error:e,onClose:()=>t((e=>{const t=Array.from(e);return t[r]=void 0,t}))})}))}t.Ay=u},5659:function(e,t,r){"use strict";r.d(t,{A:function(){return a}});var n=r(6540),o=r(5677),s=r(8065);function a(e){return n.createElement(o.A,{className:"clearfix",variant:"error"},n.createElement(s.A,{id:e.title}),e.body?n.createElement(n.Fragment,null,n.createElement("hr",null),n.createElement(s.A,{id:e.body})):e.children?n.createElement(n.Fragment,null,n.createElement("hr",null),e.children):null)}},2306:function(e,t,r){"use strict";r.d(t,{A:function(){return v}});var n=r(6784),o=r(6540),s=r(5615),a=r(5038),i=r(3399),l=r(2928),c=r(4360),d=r(485),u=r(3524),m=r(8065),h=r(4916),p=r(9181),g=r(1274),E=r(2576);function f(e){const[t,r]=(0,o.useState)(!1);return o.createElement(o.Fragment,null,o.createElement(s.A,{variant:"danger",className:"d-inline-block",onClick:()=>r(!0),size:"sm"},o.createElement(m.A,{id:"generic.errordetails",values:{info:void 0!==e.job.errorCode&&null!==e.job.errorCode?E.vH[e.job.errorCode]:"NoCode"}})),o.createElement(g.A,{centered:!0,show:t,onHide:()=>r(!1),size:"lg"},o.createElement(g.A.Header,{closeButton:!0},o.createElement(g.A.Title,null,o.createElement(m.A,{id:e.job.description}))),o.createElement(g.A.Body,{className:"text-danger pb-0"},o.createElement(m.A,{id:"view.instance.jobs.error"}),":"," ",void 0!==e.job.errorCode&&null!==e.job.errorCode?E.vH[e.job.errorCode]:"NoCode",o.createElement("hr",null),o.createElement(p.A,null,o.createElement("code",{className:"bg-darker d-block pre-wrap p-2 pre-scrollable"},e.job.exceptionDetails))),o.createElement(g.A.Footer,null,o.createElement(s.A,{variant:"secondary",onClick:()=>r(!1)},o.createElement(m.A,{id:"generic.close"})))))}function A(){return A=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},A.apply(null,arguments)}class v extends o.Component{render(){const e=this.props.job,t=new Date(e.startedAt),r=(t.getTime()-Date.now())/1e3,p=(new Date(e.stoppedAt??0).getTime()-Date.now())/1e3,g=void 0!==e.errorCode||void 0!==e.exceptionDetails?"danger":e.cancelled?"warning":e.stoppedAt?"success":"info";return o.createElement(l.A,{className:"mx-auto",key:e.id,style:{maxWidth:this.props.width},onClose:()=>{this.props.onClose&&this.props.onClose(e)}},o.createElement(d.A,{closeButton:!!e.stoppedAt&&!!this.props.onClose,className:`bg-${g}`},"#",e.id,": ",e.description),o.createElement(c.A,{className:"pt-1 text-white"},e.stage?o.createElement("div",{className:"mb-2"},"\u25b6",e.stage):null,o.createElement(m.A,{id:"app.job.started"}),o.createElement(a.A,{overlay:o.createElement(u.A,{id:`${e.id}-tooltip-started`},t.toLocaleString())},(({ref:e,...t})=>o.createElement("span",A({},t,{ref:e}),o.createElement(h.A,{value:r,numeric:"auto",updateIntervalInSeconds:1})))),o.createElement("br",null),o.createElement(m.A,{id:"app.job.startedby"}),o.createElement(a.A,{overlay:o.createElement(u.A,{id:`${e.id}-tooltip-startedby`},o.createElement(m.A,{id:"generic.userid"}),e.startedBy.id)},(({ref:t,...r})=>o.createElement("span",A({ref:t},r),e.startedBy.name))),o.createElement("br",null),o.createElement("br",null),e.stoppedAt?o.createElement(o.Fragment,null,o.createElement(m.A,{id:e.cancelled?"app.job.cancelled":"app.job.completed"}),o.createElement(a.A,{overlay:o.createElement(u.A,{id:`${e.id}-tooltip-stopped`},t.toLocaleString())},(({ref:e,...t})=>o.createElement("span",A({},t,{ref:e}),o.createElement(h.A,{value:p,numeric:"auto",updateIntervalInSeconds:1})))),o.createElement("br",null)):"",e.cancelledBy?o.createElement(o.Fragment,null,o.createElement(m.A,{id:"app.job.cancelledby"}),o.createElement(a.A,{overlay:o.createElement(u.A,{id:`${e.id}-tooltip-createdby`},o.createElement(m.A,{id:"generic.userid"}),e.startedBy.id)},(({ref:t,...r})=>o.createElement("span",A({ref:t},r),e.cancelledBy.name))),o.createElement("br",null)):"",void 0!==e.errorCode||void 0!==e.exceptionDetails?o.createElement(f,{job:e}):"",null==e.stoppedAt?o.createElement("div",{className:"d-flex mt-2",style:{height:"1.5rem"}},o.createElement(i.A,{className:"text-darker font-weight-bold flex-grow-1 h-unset",animated:!e.stoppedAt,label:"number"==typeof e.progress?`${e.progress.toString()}%`:void 0,now:"number"==typeof e.progress?e.progress:100,striped:!0,variant:g}),e.canCancel&&!e.stoppedAt?o.createElement(s.A,{style:{padding:"0 1em"},className:"ml-1",variant:"danger",onClick:()=>this.props.onCancel(e)},o.createElement(n.g,{icon:"times",className:"d-block"})):null):""))}}},875:function(e,t,r){"use strict";r.d(t,{A:function(){return A}});var n=r(6188),o=r(6784),s=r(6540),a=r(472),i=r(5615),l=r(5038),c=r(3524),d=r(8065),u=r(7698),m=r(8437),h=r(379),p=r(7567),g=r(2306),E=r(7255);function f(){return f=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},f.apply(null,arguments)}class A extends s.Component{constructor(e){super(e),this.widgetRef=s.createRef(),this.currentTimeout=void 0,this.handleUpdate=this.handleUpdate.bind(this),this.onCancel=this.onCancel.bind(this),this.onClose=this.onClose.bind(this),this.state={jobs:h.default.jobsByInstance,errors:[],nextRetrySeconds:null,ownerrors:[],loading:!0,instances:new Map}}addError(e){this.setState((t=>{const r=Array.from(t.ownerrors);return r.push(e),this.widgetRef.current&&(this.widgetRef.current.scrollTop=0),{ownerrors:r}}))}componentDidMount(){h.default.on("jobsLoaded",this.handleUpdate),this.handleUpdate()}componentWillUnmount(){h.default.removeListener("jobsLoaded",this.handleUpdate)}handleUpdate(){let e;this.currentTimeout&&(clearTimeout(this.currentTimeout),this.currentTimeout=null),h.default.nextRetry?(e=h.default.nextRetry.getSeconds()>(new Date).getSeconds()?h.default.nextRetry.getSeconds()-(new Date).getSeconds():0,this.currentTimeout=setTimeout((()=>this.handleUpdate()),1e3)):e=null,this.setState({jobs:h.default.jobsByInstance,errors:h.default.errors,nextRetrySeconds:e,loading:!1,instances:h.default.accessibleInstances})}async onCancel(e){await h.default.cancelJob(e.id,(e=>this.addError(e)))&&(h.default.fastmode=5)}onClose(e){h.default.clearJob(e.id)}render(){if(!this.props.widget)return this.nested();let e,t=0;for(const e of this.state.jobs.values())t+=e.size;return e=m.Ay.jobswidgetdisplay.value!==m.jL.NEVER&&(m.Ay.jobswidgetdisplay.value===m.jL.ALWAYS||(t>0||this.state.errors.length>0)),s.createElement("div",{style:{position:"fixed",top:0,bottom:0,right:0,left:0,pointerEvents:"none",zIndex:5}},s.createElement(u.p,{cancel:".btn,.close",className:"jobswidget "+(e?"":"invisible"),style:{pointerEvents:"auto",bottom:0,right:0},default:{width:"30vw",height:"50vh",x:document.documentElement.clientWidth-Math.min(.3*document.documentElement.clientWidth,350)-20,y:document.documentElement.clientHeight-.5*document.documentElement.clientHeight-20},maxWidth:350,minHeight:50,minWidth:110,bounds:"parent"},s.createElement("div",{className:"fancyscroll overflow-auto h-100",ref:this.widgetRef},s.createElement("h5",{className:"text-center text-darker font-weight-bold"},s.createElement(d.A,{id:"view.instance.jobs.title"})),this.nested())))}nested(){return s.createElement("div",{className:this.props.widget?"d-sm-block":""},this.state.loading?s.createElement(E.default,{text:"loading.instance.jobs.list"}):"",this.state.ownerrors.map(((e,t)=>{if(e)return s.createElement(p.Ay,{key:t,error:e,onClose:()=>this.setState((e=>{const r=Array.from(e.ownerrors);return r[t]=void 0,{ownerrors:r}}))})})),this.state.errors.length>0?s.createElement(s.Fragment,null,this.state.errors.map(((e,t)=>s.createElement("div",{key:t,style:{maxWidth:this.props.widget?350:"unset"}},s.createElement(p.Ay,{error:e})))),s.createElement(a.A,null,0===this.state.nextRetrySeconds?s.createElement(d.A,{id:"view.instance.jobs.reconnect_now"}):null!=this.state.nextRetrySeconds?s.createElement(d.A,{id:"view.instance.jobs.reconnect_in",values:{seconds:this.state.nextRetrySeconds}}):s.createElement(d.A,{id:"view.instance.jobs.reconnected_auth"}))):null,Array.from(this.state.jobs).sort(((e,t)=>e[0]-t[0])).map((([e,t])=>{let r=!1;t.forEach((e=>{e.stoppedAt&&(r=!0)}));const a=r?{marginTop:"5px",marginLeft:"20px"}:void 0;return s.createElement(s.Fragment,{key:e},s.createElement("div",{className:"bg-dark p-2 row"},s.createElement("div",{className:`col-${r?9:12} text-center`},s.createElement("div",{style:a},s.createElement(l.A,{overlay:t=>s.createElement(c.A,f({id:`tooltip-instance-${e}`},t),e)},s.createElement(s.Fragment,null,this.state.instances.get(e)?.name??"Unknown"," ","(",s.createElement(d.A,{id:"view.instance.jobs.jobtotal",values:{amount:t.size}}),")")))),r?s.createElement("div",{className:"col-3 text-right"},s.createElement(l.A,{placement:"top",overlay:e=>s.createElement(c.A,f({id:"clear-instance-jobs"},e),s.createElement(d.A,{id:"view.instance.jobs.clearfinished"}))},s.createElement(i.A,{variant:"outline-secondary",onClick:()=>t.forEach((e=>{e.stoppedAt&&h.default.clearJob(e.id)})),className:"nowrap"},s.createElement(o.g,{icon:n.GRI})))):s.createElement(s.Fragment,null)),Array.from(t,(([,e])=>e)).sort(((e,t)=>t.id-e.id)).map((e=>s.createElement(g.A,{job:e,width:this.props.width,key:e.id,onClose:this.onClose,onCancel:e=>{this.onCancel(e)}}))))})))}}A.defaultProps={widget:!0}},1241:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return k}});var n=r(7875),o=r(3238),s=r(3827),a=r(6784),i=r(6540),l=r(5615),c=r(1105),d=r(472),u=r(1208),m=r(8065),h=r(4180),p=r(2576),g=r(6382),E=r(4173),f=r(5301),A=r(3728),v=r(6192),b=r(7864),y=r(7602),w=r(664),I=r(7567),C=r(7255);class x extends i.Component{constructor(e){super(e),this.submit=this.submit.bind(this),console.log(w.M2.oautherrors),this.state={busy:!1,validated:!1,username:"",password:"",errors:Array.from(w.M2.oautherrors)}}componentDidMount(){(window.sessionStorage.getItem("oauth")??v.A.credentials?.type===g.$.OAuth)||"GITHUB"!==y.g||this.tryLoginDefault()}async tryLoginDefault(){if(this.props.loggedOut)return;(await A.A.login(v.A.default)).code===f.s.OK&&this.setState({redirectSetup:!0})}addError(e){this.setState((t=>{const r=Array.from(t.errors);return r.push(e),{errors:r}}))}render(){if(this.state.busy||v.A.hasToken())return i.createElement(C.default,{text:"loading.login"});if(!this.context.serverInfo)return i.createElement(C.default,{text:"loading.serverinfo"});const e={[p.LD.GitHub]:i.createElement(a.g,{icon:s.Vz,style:{width:"1.2em"}}),[p.LD.Discord]:i.createElement(a.g,{icon:o._2,style:{width:"1.2em"}}),[p.LD.TGForums]:i.createElement("img",{src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/6.4.3/c97e39e417e48a3282f9.svg",alt:"tglogo",style:{width:"1.2em"}}),[p.LD.Keycloak]:i.createElement("img",{src:"https://tgstation.github.io/tgstation-server-webpanel/webpanel/6.4.3/995a88a72fd6520c8505.png",alt:"keycloaklogo",style:{width:"1.2em"}}),[p.LD.InvisionCommunity]:i.createElement(a.g,{icon:n.LUY,style:{width:"1.2em"}})},t={GitHub:"#161b22",Discord:"#7289da",TGForums:void 0,Keycloak:void 0,InvisionCommunity:void 0};return i.createElement(c.A,{className:"mx-auto",lg:5,md:8},this.state.errors.map(((e,t)=>{if(e)return i.createElement(I.Ay,{key:t,error:e,onClose:()=>this.setState((e=>{const r=Array.from(e.errors);return r[t]=void 0,{errors:r}}))})})),i.createElement(d.A,{body:!0},i.createElement(d.A.Title,null,i.createElement(m.A,{id:"login.header"})),i.createElement(d.A,{body:!0},i.createElement(d.A.Title,null,i.createElement(m.A,{id:"login.type.generic"})),i.createElement(u.A,{validated:this.state.validated,onSubmit:e=>{this.submit(e)}},i.createElement(u.A.Group,{controlId:"username"},i.createElement(u.A.Label,null,i.createElement(m.A,{id:"login.username"})),i.createElement(u.A.Control,{type:"text",placeholder:"Enter username",onChange:e=>this.setState({username:e.target.value}),value:this.state.username,required:!0})),i.createElement(u.A.Group,{controlId:"password"},i.createElement(u.A.Label,null,i.createElement(m.A,{id:"login.password"})),i.createElement(u.A.Control,{type:"password",placeholder:"Password",onChange:e=>this.setState({password:e.target.value}),value:this.state.password,required:!0})),i.createElement(l.A,{type:"submit",block:!0},i.createElement(m.A,{id:"login.submit"})))),(this.context.serverInfo?.oAuthProviderInfos?.Discord||this.context.serverInfo?.oAuthProviderInfos?.GitHub||this.context.serverInfo?.oAuthProviderInfos?.Keycloak||this.context.serverInfo?.oAuthProviderInfos?.TGForums||this.context.serverInfo?.oAuthProviderInfos?.InvisionCommunity)&&i.createElement(i.Fragment,null,i.createElement("hr",null),i.createElement(d.A,{body:!0},i.createElement(d.A.Title,null,i.createElement(m.A,{id:"login.type.oauth"})),Object.keys(this.context.serverInfo.oAuthProviderInfos??{}).map((r=>{const n=t[r];return i.createElement(l.A,{key:r,block:!0,style:n?{background:n}:void 0,onClick:()=>{this.startOAuth(r)}},e[r],i.createElement("span",{className:"ml-1"},i.createElement(m.A,{id:"login.oauth",values:{provider:r}})))}))))))}async startOAuth(e){if(!this.context.serverInfo)return void this.addError(new E.Ay(E.O4.APP_FAIL,{jsError:Error("serverInfo is null in startOAuth")}));const t=new Uint8Array(10);window.crypto.getRandomValues(t);const r=Array.from(t,(e=>e.toString(16).padStart(2,"0"))).join("");let n;const o=encodeURIComponent;switch(e){case p.LD.Discord:n=`https://discord.com/api/oauth2/authorize?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.Discord.clientId)}&scope=identify&state=${o(r)}`;this.context.serverInfo.oAuthProviderInfos.Discord.redirectUri&&(n=`${n}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.Discord.redirectUri)}`);break;case p.LD.GitHub:n=`https://github.com/login/oauth/authorize?client_id=${o(this.context.serverInfo.oAuthProviderInfos.GitHub.clientId)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.GitHub.redirectUri)}&state=${o(r)}&allow_signup=false`;break;case p.LD.Keycloak:n=`${this.context.serverInfo.oAuthProviderInfos.Keycloak.serverUrl}/protocol/openid-connect/auth?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.Keycloak.clientId)}&scope=openid&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.Keycloak.redirectUri)}`;break;case p.LD.TGForums:n=`https://tgstation13.org/phpBB/app.php/tgapi/oauth/auth?scope=user&client_id=${o(this.context.serverInfo.oAuthProviderInfos.TGForums.clientId)}&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.TGForums.redirectUri)}`;break;case p.LD.InvisionCommunity:n=`${this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.serverUrl}/oauth/authorize/?response_type=code&client_id=${o(this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.clientId)}&scope=profile&state=${o(r)}&redirect_uri=${o(this.context.serverInfo.oAuthProviderInfos.InvisionCommunity.redirectUri)}`}const s=JSON.parse(window.sessionStorage.getItem("oauth")??"{}");return s[r]={provider:e,url:this.props.location.pathname},window.sessionStorage.setItem("oauth",JSON.stringify(s)),window.location.href=n,new Promise((e=>e()))}async submit(e){e.preventDefault(),this.setState({busy:!0});const t=await A.A.login({type:g.$.Password,userName:this.state.username,password:this.state.password});t.code==f.s.ERROR&&(this.setState({busy:!1}),this.addError(t.error))}}x.contextType=b.U;var k=(0,h.y)(x)},7505:function(e,t,r){"use strict";var n=r(4101),o=r(536),s=r(664);class a extends n.TypedEmitter{constructor(){super(),this.refreshing=!1,window.rtcontroller=this,this.refreshRoutes=this.refreshRoutes.bind(this),o.A.addHook(this.refreshRoutes),this.refreshRoutes().catch(console.error),console.time("Category mapping");const e=new Map;for(const[t,r]of Object.entries(s.XG))r.routes=[],e.set(r.name,r),s.I9[t]=r;for(const t of Object.values(s.Sb)){if(!t.category)continue;const r=e.get(t.category);if(r){if(r.routes.push(t),t.catleader){if(r.leader){console.error("Category has two leaders",r.leader,t);continue}r.leader=t}}else console.error("Route has invalid category",t)}console.log("Categories mapped",e),console.timeEnd("Category mapping")}async refreshRoutes(){if(this.refreshing)return void console.log("Already refreshing");this.refreshing=!0;const e=[],t=this.getImmediateRoutes(!1);for(const r of t)r.cachedAuth=void 0,r.isAuthorized?e.push(r.isAuthorized().then((e=>{r.cachedAuth=e}))):r.cachedAuth=!0;await Promise.all(e),this.emit("refresh",this.getImmediateRoutes(!0));const r=this.getImmediateRoutes(!1);return this.emit("refreshAll",r),this.refreshing=!1,console.log("Routes refreshed",r),await this.getRoutes()}wait4refresh(){return new Promise((e=>{this.refreshing?this.on("refresh",(()=>{e()})):e()}))}async getRoutes(e=!0){return await this.wait4refresh(),this.getImmediateRoutes(e)}getImmediateRoutes(e=!0){const t=[];for(const r of Object.values(s.Sb))r.isAuthorized&&!r.cachedAuth&&e||t.push(r);return t}}t.A=new a},664:function(e,t,r){"use strict";r.d(t,{I9:function(){return m},M2:function(){return h},Sb:function(){return d},XG:function(){return u}});var n=r(2576),o=r(5301),s=r(1552),a=r(6192),i=r(4118);function l(e){return async()=>{if(!a.A.hasToken())return!1;const t=await s.A.getCurrentUser();return t.code==o.s.OK&&!!((0,i.u)(t.payload).administrationRights&e)}}function c(e){return async()=>{if(!a.A.hasToken())return!1;const t=await s.A.getCurrentUser();return t.code==o.s.OK&&!!((0,i.u)(t.payload).instanceManagerRights&e)}}const d={home:{name:"routes.home",route:"/",file:"Home",loose:!1,navbarLoose:!1,visibleNavbar:!0,homeIcon:void 0,category:"home",catleader:!0},instancecreate:{name:"routes.instancecreate",route:"/instances/create",file:"Instance/Create",loose:!1,navbarLoose:!1,isAuthorized:c(n.cq.Create),visibleNavbar:!1,category:"instance",catleader:!1},instancelist:{name:"routes.instancelist",route:"/instances/",file:"Instance/List",loose:!1,navbarLoose:!0,isAuthorized:c(n.cq.List|n.cq.Read),visibleNavbar:!0,homeIcon:"hdd",category:"instance",catleader:!0},instanceedit:{name:"routes.instanceedit",route:"/instances/edit/:id(\\d+)/:tab?/",file:"Instance/InstanceEdit",get link(){return void 0!==h.selectedinstanceid?`/instances/edit/${h.selectedinstanceid}/${void 0!==h.selectedinstanceedittab?`${h.selectedinstanceedittab}/`:""}`:d.instancelist.link??d.instancelist.route},loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"instance"},instancejobs:{name:"routes.instancejobs",route:"/instances/jobs/",file:"Instance/Jobs",loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"instance"},userlist:{name:"routes.usermanager",route:"/users/",file:"User/List",loose:!1,navbarLoose:!0,visibleNavbar:!0,homeIcon:"user",category:"user",catleader:!0},useredit:{name:"routes.useredit",route:"/users/edit/user/:id(\\d+)/:tab?/",get link(){return void 0!==h.selecteduserid?`/users/edit/user/${h.selecteduserid}/${void 0!==h.selectedusertab?`${h.selectedusertab}/`:""}`:d.userlist.link??d.userlist.route},file:"User/Edit",loose:!0,navbarLoose:!0,visibleNavbar:!0,homeIcon:void 0,category:"user"},usercreate:{name:"routes.usercreate",route:"/users/create/",link:"/users/create/",file:"User/Create",loose:!0,navbarLoose:!0,isAuthorized:l(n.O4.WriteUsers),visibleNavbar:!0,homeIcon:void 0,category:"user"},admin:{name:"routes.admin",route:"/admin/",file:"Administration",loose:!1,navbarLoose:!0,isAuthorized:l(n.O4.ChangeVersion|n.O4.DownloadLogs|n.O4.UploadVersion),visibleNavbar:!0,homeIcon:"tools",category:"admin",catleader:!0},admin_update:{name:"routes.admin.update",route:"/admin/update/:all?/",file:"Admin/Update",link:"/admin/update/",loose:!0,navbarLoose:!0,isAuthorized:l(n.O4.ChangeVersion|n.O4.UploadVersion),visibleNavbar:!0,homeIcon:void 0,category:"admin"},admin_logs:{name:"routes.admin.logs",route:"/admin/logs/:name?/",link:"/admin/logs/",file:"Admin/Logs",loose:!1,navbarLoose:!0,isAuthorized:l(n.O4.DownloadLogs),visibleNavbar:!0,homeIcon:void 0,category:"admin",noContainer:!0},passwd:{name:"routes.passwd",route:"/users/passwd/:id(\\d+)?/",link:"/users/passwd/",file:"ChangePassword",loose:!0,navbarLoose:!0,isAuthorized:l(n.O4.EditOwnPassword),visibleNavbar:!1,homeIcon:"key"},config:{name:"routes.config",route:"/config/",file:"Configuration",loose:!0,navbarLoose:!0,loginless:!0,visibleNavbar:!1,homeIcon:"cogs"},setup:{name:"routes.setup",route:"/setup/",file:"Setup",loose:!0,navbarLoose:!0,loginless:!0,visibleNavbar:!1},oAuth:{name:"routes.oauth",route:"/oauth/:provider?/",file:"Login",loose:!0,navbarLoose:!1,loginless:!0,visibleNavbar:!1},info:{name:"routes.info",route:"/info",file:"Info",loose:!1,navbarLoose:!1,loginless:!0,visibleNavbar:!0,homeIcon:"info-circle",category:void 0,catleader:!1}},u={home:{name:"home"},instance:{name:"instance"},user:{name:"user"},admin:{name:"admin"}},m={},h={selecteduserid:void 0,selectedusertab:void 0,selectedinstanceid:void 0,selectedinstanceedittab:void 0,instancelistpage:void 0,loglistpage:void 0,byondlistpage:void 0,userlistpage:void 0,jobhistorypage:new Map,oautherrors:[]}},2212:function(e,t,r){var n={"./Admin/Logs":[8153,8785,8153],"./Admin/Logs.tsx":[8153,8785,8153],"./Admin/Update":[784,8785,7236,6670,5331,784],"./Admin/Update.tsx":[784,8785,7236,6670,5331,784],"./Administration":[1266,8785,1266],"./Administration.tsx":[1266,8785,1266],"./ChangePassword":[6643,6643],"./ChangePassword.tsx":[6643,6643],"./Configuration":[3536,8325,3536],"./Configuration.tsx":[3536,8325,3536],"./Home":[997,997],"./Home.tsx":[997,997],"./Info":[2852,8785,2852],"./Info.tsx":[2852,8785,2852],"./Instance/Create":[6822,9013,1930,6105,8143,4366,7236,6670,6822],"./Instance/Create.tsx":[6822,9013,1930,6105,8143,4366,7236,6670,6822],"./Instance/Edit/ChatBots":[3763,4614,8785,3763,5727],"./Instance/Edit/ChatBots.tsx":[3763,4614,8785,3763,5727],"./Instance/Edit/Config":[2153,8785,2153],"./Instance/Edit/Config.tsx":[2153,8785,2153],"./Instance/Edit/Deployment":[5998,9013,1930,8785,7236,4717,9600,8463],"./Instance/Edit/Deployment.tsx":[5998,9013,1930,8785,7236,4717,9600,8463],"./Instance/Edit/Engine":[4717,9013,8785,7236,4717,6983],"./Instance/Edit/Engine.tsx":[4717,9013,8785,7236,4717,6983],"./Instance/Edit/Files":[1606,6105,8785,1606,5318],"./Instance/Edit/Files.tsx":[1606,6105,8785,1606,5318],"./Instance/Edit/InstancePermissions":[9496,1903,8785,9496,8284],"./Instance/Edit/InstancePermissions.tsx":[9496,1903,8785,9496,8284],"./Instance/Edit/JobHistory":[9272,8785,9272],"./Instance/Edit/JobHistory.tsx":[9272,8785,9272],"./Instance/Edit/Repository":[3649,1930,8143,8785,7236,6805,3649,6970],"./Instance/Edit/Repository.tsx":[3649,1930,8143,8785,7236,6805,3649,6970],"./Instance/Edit/Server":[8018,9013,4366,8785,7236,4717,9600,8018,5846],"./Instance/Edit/Server.tsx":[8018,9013,4366,8785,7236,4717,9600,8018,5846],"./Instance/InstanceEdit":[9248,9013,1930,6105,8143,4366,1903,4614,8785,7236,6805,9642,4717,9600,3649,3763,1606,9496,8018,6867],"./Instance/InstanceEdit.tsx":[9248,9013,1930,6105,8143,4366,1903,4614,8785,7236,6805,9642,4717,9600,3649,3763,1606,9496,8018,6867],"./Instance/Jobs":[2554,2554],"./Instance/Jobs.tsx":[2554,2554],"./Instance/List":[9538,8785,9538],"./Instance/List.tsx":[9538,8785,9538],"./Login":[1241],"./Login.tsx":[1241],"./Setup":[3773,3773],"./Setup.tsx":[3773,3773],"./User/Create":[3890,3890],"./User/Create.tsx":[3890,3890],"./User/Edit":[7148,1903,8785,7148],"./User/Edit.tsx":[7148,1903,8785,7148],"./User/List":[7458,8785,7458],"./User/List.tsx":[7458,8785,7458]};function o(e){if(!r.o(n,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=n[e],o=t[0];return Promise.all(t.slice(1).map(r.e)).then((function(){return r(o)}))}o.keys=function(){return Object.keys(n)},o.id=2212,e.exports=o}}]);
//# sourceMappingURL=7194.c7d61250623e89e638dd.bundle.js.map