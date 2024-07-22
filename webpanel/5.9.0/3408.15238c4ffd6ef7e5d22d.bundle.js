"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[3408,9657],{15727:function(e,t,a){a.d(t,{i:function(){return i}});var r=a(67294),s=a(9966),n=a(88375),o=a(51479),l=a(44012);class i extends r.Component{constructor(e){super(e),this.state={animatedOpen:!1,closeTriggered:!1}}componentDidMount(){this.setState({animatedOpen:!0}),this.isCompleted()&&this.close()}componentDidUpdate(){this.isCompleted()&&this.close()}isCompleted(e){e??=this.props;return e.progress.loaded===e.progress.total||0===e.progress.total}close(){this.state.closeTriggered||(this.setState({closeTriggered:!0}),setTimeout((()=>{this.setState({animatedOpen:!1}),setTimeout(this.props.onClose,1e3)}),3e3))}render(){const e=this.props.progress.loaded===this.props.progress.total||0===this.props.progress.total;return r.createElement(s.Z,{in:this.state.animatedOpen,dimension:"height"},r.createElement("div",null,r.createElement(n.Z,{className:"clearfix",variant:e?"success":"primary",transition:!0},r.createElement(l.Z,{id:e?"generic.downloaded":"generic.downloading",values:{file:this.props.filename}}),r.createElement("hr",null),r.createElement(o.Z,{min:0,now:Math.max(1,this.props.progress.loaded),max:Math.max(1,this.props.progress.total),variant:e?"success":"warning",animated:!e}))))}}},8425:function(e,t,a){a.d(t,{t:function(){return i}});var r=a(67294),s=a(55171),n=a.n(s),o=a(27961);function l(e){return r.createElement(n(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function i(e){return o.ZP.showjson.value?r.createElement("div",{className:"text-left"},r.createElement(l,{obj:e.obj})):r.createElement(r.Fragment,null)}},89929:function(e,t,a){a.d(t,{Z:function(){return p}});var r=a(67814),s=a(67294),n=a(35005),o=a(32258),l=a(15293),i=a(38966),c=a(19611),m=a(44012);function d(){return d=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},d.apply(this,arguments)}class p extends s.PureComponent{constructor(e){super(e),this.state={showGoto:!1,gotoValue:e.currentPage}}render(){const e=[],t=Math.max(this.props.totalPages-this.props.currentPage-1,0),a=Math.max(this.props.currentPage-2,0),p=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-t,2),2),h=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-a,2),this.props.totalPages-1);for(let t=p;t<=h;t++)e.push(s.createElement(i.Z.Item,{key:t,active:t===this.props.currentPage,onClick:()=>this.props.selectPage(t)},t));const u=this.props.totalPages>7?s.createElement(i.Z.Ellipsis,{disabled:!0}):null,g=s.createElement(c.Z,{id:"popover-gotopage"},s.createElement(c.Z.Title,null,s.createElement(m.Z,{id:"generic.goto.title"})),s.createElement(c.Z.Content,null,s.createElement("form",{className:"d-flex",onSubmit:e=>{e.preventDefault(),this.props.selectPage(this.state.gotoValue),this.setState({showGoto:!1})}},s.createElement(o.Z.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:e=>this.setState({gotoValue:parseInt(e.target.value)}),custom:!0}),s.createElement(n.Z,{type:"submit"},s.createElement(m.Z,{id:"generic.goto"}))))),{selectPage:E,totalPages:v,currentPage:f,...P}=this.props;return s.createElement("div",d({className:"text-center",style:{position:"sticky",bottom:"1.5em"}},P),s.createElement(i.Z,{className:"justify-content-center"},s.createElement(i.Z.Prev,{disabled:this.props.currentPage<=1,onClick:()=>this.props.selectPage(Math.max(this.props.currentPage-1,1))}),s.createElement(i.Z.Item,{active:this.props.currentPage<=1,onClick:()=>this.props.selectPage(1)},"1"),u,e,u,this.props.totalPages>=2?s.createElement(i.Z.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(this.props.totalPages)},this.props.totalPages):null,this.props.totalPages>7?s.createElement(l.Z,{show:this.state.showGoto,placement:"top",overlay:g},s.createElement(i.Z.Item,{onClick:()=>this.setState((e=>({showGoto:!e.showGoto})))},s.createElement(r.G,{icon:"search"}))):null,s.createElement(i.Z.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(Math.min(this.props.currentPage+1,this.props.totalPages))})))}}},43408:function(e,t,a){a.r(t);var r=a(67294),s=a(35005),n=a(10682),o=a(15293),l=a(75147),i=a(43489),c=a(44012),m=a(48272),d=a(5977),p=a(73727),h=a(22480),u=a(96846),g=a(53803),E=a(16964),v=a(1320),f=a(15727),P=a(3e3),Z=a(8425),w=a(35855),b=a(89929);function y(){return y=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},y.apply(this,arguments)}t.default=(0,d.EN)(class extends r.Component{constructor(e){super(e),this.state={errors:[],loading:!0,logs:[],page:v.Mq.loglistpage??1,downloads:[]}}async componentDidUpdate(e,t){t.page!==this.state.page&&(v.Mq.loglistpage=this.state.page,await this.loadLogs())}async componentDidMount(){const e=this.props.match.params.name;if(e){const t=await h.Z.getLog(e,this.allocateDownload(e));switch(t.code){case g.G.OK:{const e=RegExp(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}[-+]\d{2}:\d{2})\s+(.*?)(?=(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{7}[-+]\d{2}:\d{2}|$))/,"gs");let a;const r=[];for(;null!==(a=e.exec(t.payload.content));)r.push({time:a[1],content:a[2]});this.setState({viewedLog:{logFile:t.payload,entries:r}});break}case g.G.ERROR:this.addError(t.error)}}await this.loadLogs()}async loadLogs(){this.setState({loading:!0});const e=await h.Z.getLogs({page:this.state.page});switch(e.code){case g.G.OK:if(this.state.page>e.payload.totalPages&&0!==e.payload.totalPages)return void this.setState({page:1});this.setState({logs:e.payload.content,maxPage:e.payload.totalPages});break;case g.G.ERROR:this.addError(e.error)}this.setState({loading:!1})}addError(e){this.setState((t=>{const a=Array.from(t.errors);return a.push(e),{errors:a}}))}async downloadLog(e){const t=await h.Z.getLog(e,this.allocateDownload(e));switch(t.code){case g.G.OK:(0,E.LR)(e,t.payload.content);break;case g.G.ERROR:this.addError(t.error)}}allocateDownload(e){const t=new Promise((e=>{this.setState((t=>{const a=[...t.downloads];return e(a.push(null)-1),{downloads:a}}))}));let a=0;return r=>{const s=++a;t.then((t=>{a===s&&this.setState((a=>{const s=[...a.downloads];return s[t]={filename:e,progress:r,onClose:()=>{this.setState((e=>{const a=[...e.downloads];return a[t]=null,{downloads:a}}))}},{downloads:s}}))}))}}render(){return r.createElement("div",{className:"text-center"},this.state.errors.map(((e,t)=>{if(e)return r.createElement(P.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const a=Array.from(e.errors);return a[t]=void 0,{errors:a}}))})})),this.state.downloads.map(((e,t)=>{if(e)return r.createElement(f.i,y({key:t},e))})),this.state.loading?r.createElement(w.default,{text:"loading.logs"}):this.props.match.params.name&&this.state.viewedLog?r.createElement("div",{className:"mx-5 mt-5"},r.createElement(Z.t,{obj:this.state.viewedLog}),r.createElement("h3",null,this.props.match.params.name),r.createElement(s.Z,{className:"mr-1",as:p.rU,to:v.$w.admin_logs.link??v.$w.admin_logs.route},r.createElement(c.Z,{id:"generic.goback"})),r.createElement(s.Z,{onClick:()=>{(0,E.LR)(this.props.match.params.name,this.state.viewedLog.logFile.content)}},r.createElement(c.Z,{id:"generic.download"})),r.createElement("hr",null),r.createElement("div",{style:{height:"60vh",display:"block"},className:"table-responsive"},r.createElement(l.Z,{striped:!0,hover:!0,variant:"dark",className:"text-left"},r.createElement("thead",{className:"bg-dark",style:{position:"sticky",top:0}},r.createElement("th",null,r.createElement(c.Z,{id:"generic.datetime"})),r.createElement("th",null,r.createElement(c.Z,{id:"generic.entry"}))),r.createElement("tbody",null,this.state.viewedLog.entries.map((e=>r.createElement("tr",{key:e.time},r.createElement("td",{className:"py-1"},e.time),r.createElement("td",{className:"py-1"},r.createElement("pre",{className:"mb-0"},e.content))))))))):r.createElement(n.Z,{className:"mt-5 mb-5"},r.createElement(Z.t,{obj:this.state.logs}),r.createElement(l.Z,{striped:!0,bordered:!0,hover:!0,variant:"dark",responsive:!0},r.createElement("thead",null,r.createElement("tr",null,r.createElement("th",null,"#"),r.createElement("th",null,r.createElement(c.Z,{id:"generic.name"})),r.createElement("th",null,r.createElement(c.Z,{id:"generic.datetime"})),r.createElement("th",null,r.createElement(c.Z,{id:"generic.action"})))),r.createElement("tbody",null,this.state.logs.map(((e,t)=>{const a=new Date(e.lastModified),n=(a.getTime()-Date.now())/1e3;return r.createElement("tr",{key:e.name},r.createElement("td",null,t),r.createElement("td",null,e.name),r.createElement(o.Z,{overlay:r.createElement(i.Z,{id:`${e.name}-tooltip`},a.toLocaleString())},(({ref:e,...t})=>r.createElement("td",t,r.createElement("span",{ref:e},r.createElement(m.Z,{value:n,numeric:"auto",updateIntervalInSeconds:1}))))),r.createElement("td",{className:"align-middle p-0"},r.createElement(s.Z,{className:"mr-1",onClick:()=>{this.props.history.push((v.$w.admin_logs.link??v.$w.admin_logs.route)+e.name+"/",{reload:!0})}},r.createElement(c.Z,{id:"generic.view"})),r.createElement(s.Z,{onClick:()=>{this.downloadLog(e.name).catch((e=>{this.addError(new u.ZP(u.jK.APP_FAIL,{jsError:e}))}))}},r.createElement(c.Z,{id:"generic.download"}))))})))),r.createElement(b.Z,{selectPage:e=>this.setState({page:e}),totalPages:this.state.maxPage??1,currentPage:this.state.page})))}})},38966:function(e,t,a){a.d(t,{Z:function(){return b}});var r=a(87462),s=a(63366),n=a(94184),o=a.n(n),l=a(67294),i=a(76792),c=a(48358),m=["active","disabled","className","style","activeLabel","children"],d=["children"],p=l.forwardRef((function(e,t){var a=e.active,n=e.disabled,i=e.className,d=e.style,p=e.activeLabel,h=e.children,u=(0,s.Z)(e,m),g=a||n?"span":c.Z;return l.createElement("li",{ref:t,style:d,className:o()(i,"page-item",{active:a,disabled:n})},l.createElement(g,(0,r.Z)({className:"page-link",disabled:n},u),h,a&&p&&l.createElement("span",{className:"sr-only"},p)))}));p.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},p.displayName="PageItem";var h=p;function u(e,t,a){function r(e){var r=e.children,n=(0,s.Z)(e,d);return l.createElement(p,n,l.createElement("span",{"aria-hidden":"true"},r||t),l.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),r.displayName=e,r}var g=u("First","\xab"),E=u("Prev","\u2039","Previous"),v=u("Ellipsis","\u2026","More"),f=u("Next","\u203a"),P=u("Last","\xbb"),Z=["bsPrefix","className","children","size"],w=l.forwardRef((function(e,t){var a=e.bsPrefix,n=e.className,c=e.children,m=e.size,d=(0,s.Z)(e,Z),p=(0,i.vE)(a,"pagination");return l.createElement("ul",(0,r.Z)({ref:t},d,{className:o()(n,p,m&&p+"-"+m)}),c)}));w.First=g,w.Prev=E,w.Ellipsis=v,w.Item=h,w.Next=f,w.Last=P;var b=w},19611:function(e,t,a){a.d(t,{Z:function(){return g}});var r=a(87462),s=a(63366),n=a(94184),o=a.n(n),l=a(67294),i=(a(55638),a(76792)),c=["as","bsPrefix","className","children"],m=l.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,m=e.bsPrefix,d=e.className,p=e.children,h=(0,s.Z)(e,c);return m=(0,i.vE)(m,"popover-header"),l.createElement(n,(0,r.Z)({ref:t},h,{className:o()(m,d)}),p)})),d=["as","bsPrefix","className","children"],p=l.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,c=e.bsPrefix,m=e.className,p=e.children,h=(0,s.Z)(e,d);return c=(0,i.vE)(c,"popover-body"),l.createElement(n,(0,r.Z)({ref:t},h,{className:o()(m,c)}),p)})),h=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],u=l.forwardRef((function(e,t){var a=e.bsPrefix,n=e.placement,c=e.className,m=e.style,d=e.children,u=e.content,g=e.arrowProps,E=(e.popper,e.show,(0,s.Z)(e,h)),v=(0,i.vE)(a,"popover"),f=((null==n?void 0:n.split("-"))||[])[0];return l.createElement("div",(0,r.Z)({ref:t,role:"tooltip",style:m,"x-placement":f,className:o()(c,v,f&&"bs-popover-"+f)},E),l.createElement("div",(0,r.Z)({className:"arrow"},g)),u?l.createElement(p,null,d):d)}));u.defaultProps={placement:"right"},u.Title=m,u.Content=p;var g=u},75147:function(e,t,a){var r=a(87462),s=a(63366),n=a(94184),o=a.n(n),l=a(67294),i=a(76792),c=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],m=l.forwardRef((function(e,t){var a=e.bsPrefix,n=e.className,m=e.striped,d=e.bordered,p=e.borderless,h=e.hover,u=e.size,g=e.variant,E=e.responsive,v=(0,s.Z)(e,c),f=(0,i.vE)(a,"table"),P=o()(n,f,g&&f+"-"+g,u&&f+"-"+u,m&&f+"-striped",d&&f+"-bordered",p&&f+"-borderless",h&&f+"-hover"),Z=l.createElement("table",(0,r.Z)({},v,{className:P,ref:t}));if(E){var w=f+"-responsive";return"string"==typeof E&&(w=w+"-"+E),l.createElement("div",{className:w},Z)}return Z}));t.Z=m}}]);
//# sourceMappingURL=3408.15238c4ffd6ef7e5d22d.bundle.js.map