"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[921,657],{8425:function(e,t,a){a.d(t,{t:function(){return c}});var r=a(67294),s=a(55171),n=a.n(s),o=a(27961);function l(e){return r.createElement(n(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function c(e){return o.ZP.showjson.value?r.createElement("div",{className:"text-left"},r.createElement(l,{obj:e.obj})):r.createElement(r.Fragment,null)}},89929:function(e,t,a){a.d(t,{Z:function(){return m}});var r=a(67814),s=a(67294),n=a(35005),o=a(32258),l=a(15293),c=a(38966),i=a(19611),p=a(44012);function u(){return u=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},u.apply(this,arguments)}class m extends s.PureComponent{constructor(e){super(e),this.state={showGoto:!1,gotoValue:e.currentPage}}render(){const e=[],t=Math.max(this.props.totalPages-this.props.currentPage-1,0),a=Math.max(this.props.currentPage-2,0),m=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-t,2),2),d=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-a,2),this.props.totalPages-1);for(let t=m;t<=d;t++)e.push(s.createElement(c.Z.Item,{key:t,active:t===this.props.currentPage,onClick:()=>this.props.selectPage(t)},t));const h=this.props.totalPages>7?s.createElement(c.Z.Ellipsis,{disabled:!0}):null,f=s.createElement(i.Z,{id:"popover-gotopage"},s.createElement(i.Z.Title,null,s.createElement(p.Z,{id:"generic.goto.title"})),s.createElement(i.Z.Content,null,s.createElement("form",{className:"d-flex",onSubmit:e=>{e.preventDefault(),this.props.selectPage(this.state.gotoValue),this.setState({showGoto:!1})}},s.createElement(o.Z.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:e=>this.setState({gotoValue:parseInt(e.target.value)}),custom:!0}),s.createElement(n.Z,{type:"submit"},s.createElement(p.Z,{id:"generic.goto"}))))),{selectPage:g,totalPages:v,currentPage:P,...E}=this.props;return s.createElement("div",u({className:"text-center",style:{position:"sticky",bottom:"1.5em"}},E),s.createElement(c.Z,{className:"justify-content-center"},s.createElement(c.Z.Prev,{disabled:this.props.currentPage<=1,onClick:()=>this.props.selectPage(Math.max(this.props.currentPage-1,1))}),s.createElement(c.Z.Item,{active:this.props.currentPage<=1,onClick:()=>this.props.selectPage(1)},"1"),h,e,h,this.props.totalPages>=2?s.createElement(c.Z.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(this.props.totalPages)},this.props.totalPages):null,this.props.totalPages>7?s.createElement(l.Z,{show:this.state.showGoto,placement:"top",overlay:f},s.createElement(c.Z.Item,{onClick:()=>this.setState((e=>({showGoto:!e.showGoto})))},s.createElement(r.G,{icon:"search"}))):null,s.createElement(c.Z.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(Math.min(this.props.currentPage+1,this.props.totalPages))})))}}},25921:function(e,t,a){a.r(t),a.d(t,{default:function(){return h}});var r=a(67294),s=a(23204),n=a(53803),o=a(39521),l=a(96190),c=a(1320),i=a(3e3),p=a(93128),u=a(8425),m=a(35855),d=a(89929);function h(){const e=r.useContext(l.g),[t,a]=(0,r.useState)([]),[h,f]=(0,r.useState)([]),[g,v]=(0,r.useState)(!0),[P,E]=(0,r.useState)(c.Mq.jobhistorypage.get(e.instance.id)??1),[b,Z]=(0,r.useState)(void 0);function y(e){f((t=>{const a=Array.from(t);return a.push(e),a}))}async function N(e){const t=await s.Z.deleteJob(e.instanceId,e.id);t.code===n.G.OK?o.Z.fastmode=5:y(t.error)}return(0,r.useEffect)((()=>{c.Mq.jobhistorypage.set(e.instance.id,P),v(!0),async function(){const t=await s.Z.listJobs(e.instance.id,{page:P});t.code===n.G.OK?(P>t.payload.totalPages&&0!==t.payload.totalPages&&E(1),a(t.payload.content),Z(t.payload.totalPages)):y(t.error),v(!1)}()}),[P,e.instance.id]),(0,r.useEffect)((()=>{}),[h]),g?r.createElement(m.Z,{text:"loading.instance.jobs.list"}):r.createElement("div",null,r.createElement(u.t,{obj:t}),h.map(((e,t)=>{if(e)return r.createElement(i.ZP,{key:t,error:e,onClose:()=>f((e=>{const a=Array.from(e);return a[t]=void 0,a}))})})),t.sort(((e,t)=>t.id-e.id)).filter((e=>!!e.stoppedAt)).map((e=>r.createElement(p.Z,{job:e,key:e.id,onCancel:N}))),r.createElement(d.Z,{selectPage:e=>E(e),totalPages:b??1,currentPage:P}))}},96190:function(e,t,a){a.d(t,{g:function(){return r}});const r=a(67294).createContext(void 0)},38966:function(e,t,a){a.d(t,{Z:function(){return y}});var r=a(87462),s=a(63366),n=a(94184),o=a.n(n),l=a(67294),c=a(76792),i=a(48358),p=["active","disabled","className","style","activeLabel","children"],u=["children"],m=l.forwardRef((function(e,t){var a=e.active,n=e.disabled,c=e.className,u=e.style,m=e.activeLabel,d=e.children,h=(0,s.Z)(e,p),f=a||n?"span":i.Z;return l.createElement("li",{ref:t,style:u,className:o()(c,"page-item",{active:a,disabled:n})},l.createElement(f,(0,r.Z)({className:"page-link",disabled:n},h),d,a&&m&&l.createElement("span",{className:"sr-only"},m)))}));m.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},m.displayName="PageItem";var d=m;function h(e,t,a){function r(e){var r=e.children,n=(0,s.Z)(e,u);return l.createElement(m,n,l.createElement("span",{"aria-hidden":"true"},r||t),l.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),r.displayName=e,r}var f=h("First","\xab"),g=h("Prev","\u2039","Previous"),v=h("Ellipsis","\u2026","More"),P=h("Next","\u203a"),E=h("Last","\xbb"),b=["bsPrefix","className","children","size"],Z=l.forwardRef((function(e,t){var a=e.bsPrefix,n=e.className,i=e.children,p=e.size,u=(0,s.Z)(e,b),m=(0,c.vE)(a,"pagination");return l.createElement("ul",(0,r.Z)({ref:t},u,{className:o()(n,m,p&&m+"-"+p)}),i)}));Z.First=f,Z.Prev=g,Z.Ellipsis=v,Z.Item=d,Z.Next=P,Z.Last=E;var y=Z},19611:function(e,t,a){a.d(t,{Z:function(){return f}});var r=a(87462),s=a(63366),n=a(94184),o=a.n(n),l=a(67294),c=(a(55638),a(76792)),i=["as","bsPrefix","className","children"],p=l.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,p=e.bsPrefix,u=e.className,m=e.children,d=(0,s.Z)(e,i);return p=(0,c.vE)(p,"popover-header"),l.createElement(n,(0,r.Z)({ref:t},d,{className:o()(p,u)}),m)})),u=["as","bsPrefix","className","children"],m=l.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,i=e.bsPrefix,p=e.className,m=e.children,d=(0,s.Z)(e,u);return i=(0,c.vE)(i,"popover-body"),l.createElement(n,(0,r.Z)({ref:t},d,{className:o()(p,i)}),m)})),d=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],h=l.forwardRef((function(e,t){var a=e.bsPrefix,n=e.placement,i=e.className,p=e.style,u=e.children,h=e.content,f=e.arrowProps,g=(e.popper,e.show,(0,s.Z)(e,d)),v=(0,c.vE)(a,"popover"),P=((null==n?void 0:n.split("-"))||[])[0];return l.createElement("div",(0,r.Z)({ref:t,role:"tooltip",style:p,"x-placement":P,className:o()(i,v,P&&"bs-popover-"+P)},g),l.createElement("div",(0,r.Z)({className:"arrow"},f)),h?l.createElement(m,null,u):u)}));h.defaultProps={placement:"right"},h.Title=p,h.Content=m;var f=h}}]);
//# sourceMappingURL=921.d5768a750d900f116d8c.bundle.js.map