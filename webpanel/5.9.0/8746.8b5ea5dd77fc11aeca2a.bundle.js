"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[8746,9657],{8425:function(e,t,a){a.d(t,{t:function(){return c}});var r=a(67294),s=a(55171),n=a.n(s),l=a(27961);function i(e){return r.createElement(n(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function c(e){return l.ZP.showjson.value?r.createElement("div",{className:"text-left"},r.createElement(i,{obj:e.obj})):r.createElement(r.Fragment,null)}},89929:function(e,t,a){a.d(t,{Z:function(){return d}});var r=a(67814),s=a(67294),n=a(35005),l=a(32258),i=a(15293),c=a(38966),o=a(19611),m=a(44012);function p(){return p=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},p.apply(this,arguments)}class d extends s.PureComponent{constructor(e){super(e),this.state={showGoto:!1,gotoValue:e.currentPage}}render(){const e=[],t=Math.max(this.props.totalPages-this.props.currentPage-1,0),a=Math.max(this.props.currentPage-2,0),d=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-t,2),2),u=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-a,2),this.props.totalPages-1);for(let t=d;t<=u;t++)e.push(s.createElement(c.Z.Item,{key:t,active:t===this.props.currentPage,onClick:()=>this.props.selectPage(t)},t));const h=this.props.totalPages>7?s.createElement(c.Z.Ellipsis,{disabled:!0}):null,g=s.createElement(o.Z,{id:"popover-gotopage"},s.createElement(o.Z.Title,null,s.createElement(m.Z,{id:"generic.goto.title"})),s.createElement(o.Z.Content,null,s.createElement("form",{className:"d-flex",onSubmit:e=>{e.preventDefault(),this.props.selectPage(this.state.gotoValue),this.setState({showGoto:!1})}},s.createElement(l.Z.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:e=>this.setState({gotoValue:parseInt(e.target.value)}),custom:!0}),s.createElement(n.Z,{type:"submit"},s.createElement(m.Z,{id:"generic.goto"}))))),{selectPage:E,totalPages:v,currentPage:f,...Z}=this.props;return s.createElement("div",p({className:"text-center",style:{position:"sticky",bottom:"1.5em"}},Z),s.createElement(c.Z,{className:"justify-content-center"},s.createElement(c.Z.Prev,{disabled:this.props.currentPage<=1,onClick:()=>this.props.selectPage(Math.max(this.props.currentPage-1,1))}),s.createElement(c.Z.Item,{active:this.props.currentPage<=1,onClick:()=>this.props.selectPage(1)},"1"),h,e,h,this.props.totalPages>=2?s.createElement(c.Z.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(this.props.totalPages)},this.props.totalPages):null,this.props.totalPages>7?s.createElement(i.Z,{show:this.state.showGoto,placement:"top",overlay:g},s.createElement(c.Z.Item,{onClick:()=>this.setState((e=>({showGoto:!e.showGoto})))},s.createElement(r.G,{icon:"search"}))):null,s.createElement(c.Z.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(Math.min(this.props.currentPage+1,this.props.totalPages))})))}}},1841:function(e,t,a){a.d(t,{Z:function(){return l}});var r=a(67294),s=a(27977),n=a(44012);class l extends r.Component{render(){const e=this.props.user;return r.createElement(r.Fragment,null,e.systemIdentifier?r.createElement(s.Z,{variant:"primary",className:"mx-1"},r.createElement(n.Z,{id:"generic.system.short"})):r.createElement(s.Z,{variant:"primary",className:"mx-1"},r.createElement(n.Z,{id:"generic.tgs"})),e.enabled?r.createElement(s.Z,{variant:"success",className:"mx-1"},r.createElement(n.Z,{id:"generic.enabled"})):r.createElement(s.Z,{variant:"danger",className:"mx-1"},r.createElement(n.Z,{id:"generic.disabled"})),e.group?r.createElement(s.Z,{variant:"warning",className:"mx-1"},r.createElement(n.Z,{id:"generic.grouped"})):null)}}},8746:function(e,t,a){a.r(t);var r=a(67294),s=a(88375),n=a(35005),l=a(15293),i=a(75147),c=a(43489),o=a(44012),m=a(48272),p=a(5977),d=a(73727),u=a(48509),h=a(53803),g=a(16942),E=a(16964),v=a(1320),f=a(3e3),Z=a(8425),P=a(35855),b=a(89929),y=a(1841);t.default=(0,p.EN)(class extends r.Component{constructor(e){super(e),this.state={errors:[],users:[],loading:!0,canList:!1,page:v.Mq.userlistpage??1}}addError(e){this.setState((t=>{const a=Array.from(t.errors);return a.push(e),{errors:a}}))}async loadUsers(){if(this.setState({loading:!0}),this.state.canList){const e=await g.Z.listUsers({page:this.state.page});switch(e.code){case h.G.OK:this.state.page>e.payload.totalPages&&0!==e.payload.totalPages&&this.setState({page:1}),this.setState({users:e.payload.content,maxPage:e.payload.totalPages});break;case h.G.ERROR:this.addError(e.error)}}else{const e=await g.Z.getCurrentUser();e.code===h.G.OK?this.setState({users:[e.payload]}):this.addError(e.error)}this.setState({loading:!1})}async componentDidUpdate(e,t){t.page!==this.state.page&&(v.Mq.userlistpage=this.state.page,await this.loadUsers())}async componentDidMount(){const e=await g.Z.getCurrentUser();if(e.code==h.G.OK){const t=!!((0,E.Zg)(e.payload).administrationRights&u.oj.ReadUsers);this.setState({canList:t}),await this.loadUsers()}else this.addError(e.error);this.setState({loading:!1})}render(){return this.state.loading?r.createElement(P.default,{text:"loading.userlist"}):r.createElement("div",{className:"text-center"},r.createElement(Z.t,{obj:this.state.users}),this.state.canList?"":r.createElement(s.Z,{className:"clearfix",variant:"error"},r.createElement(o.Z,{id:"view.user.list.cantlist"})),this.state.errors.map(((e,t)=>{if(e)return r.createElement(f.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const a=Array.from(e.errors);return a[t]=void 0,{errors:a}}))})})),r.createElement(i.Z,{striped:!0,bordered:!0,hover:!0,variant:"dark",responsive:!0},r.createElement("thead",null,r.createElement("tr",null,r.createElement("th",null,"#"),r.createElement("th",null,r.createElement(o.Z,{id:"generic.name"})),r.createElement("th",null,r.createElement(o.Z,{id:"generic.details"})),r.createElement("th",null,r.createElement(o.Z,{id:"generic.group"})),r.createElement("th",null,r.createElement(o.Z,{id:"generic.created"})),r.createElement("th",null,r.createElement(o.Z,{id:"generic.createdby"})),r.createElement("th",null,r.createElement(o.Z,{id:"generic.action"})))),r.createElement("tbody",null,this.state.users.map((e=>{const t=new Date(e.createdAt),a=(t.getTime()-Date.now())/1e3;return r.createElement("tr",{key:e.id},r.createElement("td",null,e.id),r.createElement("td",null,e.name),r.createElement("td",null,r.createElement(y.Z,{user:e})),e.group?r.createElement(l.Z,{overlay:r.createElement(c.Z,{id:`${e.name}-tooltip-group`},r.createElement(o.Z,{id:"generic.groupid",values:{id:e.group.id}}))},(({ref:t,...a})=>r.createElement("td",a,r.createElement("span",{ref:t},e.group.name)))):r.createElement("td",null),r.createElement(l.Z,{overlay:r.createElement(c.Z,{id:`${e.name}-tooltip`},t.toLocaleString())},(({ref:e,...t})=>r.createElement("td",t,r.createElement("span",{ref:e},r.createElement(m.Z,{value:a,numeric:"auto",updateIntervalInSeconds:1}))))),r.createElement(l.Z,{overlay:r.createElement(c.Z,{id:`${e.name}-tooltip-createdby`},r.createElement(o.Z,{id:"generic.userid"}),e.createdBy.id)},(({ref:t,...a})=>r.createElement("td",a,r.createElement("span",{ref:t},e.createdBy.name)))),r.createElement("td",{className:"align-middle p-0"},r.createElement(n.Z,{onClick:()=>{v.Mq.selecteduserid=e.id,this.props.history.push(v.$w.useredit.link??v.$w.useredit.route)}},r.createElement(o.Z,{id:"generic.edit"}))))})))),r.createElement(b.Z,{selectPage:e=>this.setState({page:e}),totalPages:this.state.maxPage??1,currentPage:this.state.page}),r.createElement(n.Z,{as:d.rU,to:v.$w.usercreate.link??v.$w.usercreate.route},r.createElement(o.Z,{id:"routes.usercreate"})))}})},27977:function(e,t,a){var r=a(87462),s=a(63366),n=a(94184),l=a.n(n),i=a(67294),c=a(76792),o=["bsPrefix","variant","pill","className","as"],m=i.forwardRef((function(e,t){var a=e.bsPrefix,n=e.variant,m=e.pill,p=e.className,d=e.as,u=void 0===d?"span":d,h=(0,s.Z)(e,o),g=(0,c.vE)(a,"badge");return i.createElement(u,(0,r.Z)({ref:t},h,{className:l()(p,g,m&&g+"-pill",n&&g+"-"+n)}))}));m.displayName="Badge",m.defaultProps={pill:!1},t.Z=m},38966:function(e,t,a){a.d(t,{Z:function(){return y}});var r=a(87462),s=a(63366),n=a(94184),l=a.n(n),i=a(67294),c=a(76792),o=a(48358),m=["active","disabled","className","style","activeLabel","children"],p=["children"],d=i.forwardRef((function(e,t){var a=e.active,n=e.disabled,c=e.className,p=e.style,d=e.activeLabel,u=e.children,h=(0,s.Z)(e,m),g=a||n?"span":o.Z;return i.createElement("li",{ref:t,style:p,className:l()(c,"page-item",{active:a,disabled:n})},i.createElement(g,(0,r.Z)({className:"page-link",disabled:n},h),u,a&&d&&i.createElement("span",{className:"sr-only"},d)))}));d.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},d.displayName="PageItem";var u=d;function h(e,t,a){function r(e){var r=e.children,n=(0,s.Z)(e,p);return i.createElement(d,n,i.createElement("span",{"aria-hidden":"true"},r||t),i.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),r.displayName=e,r}var g=h("First","\xab"),E=h("Prev","\u2039","Previous"),v=h("Ellipsis","\u2026","More"),f=h("Next","\u203a"),Z=h("Last","\xbb"),P=["bsPrefix","className","children","size"],b=i.forwardRef((function(e,t){var a=e.bsPrefix,n=e.className,o=e.children,m=e.size,p=(0,s.Z)(e,P),d=(0,c.vE)(a,"pagination");return i.createElement("ul",(0,r.Z)({ref:t},p,{className:l()(n,d,m&&d+"-"+m)}),o)}));b.First=g,b.Prev=E,b.Ellipsis=v,b.Item=u,b.Next=f,b.Last=Z;var y=b},19611:function(e,t,a){a.d(t,{Z:function(){return g}});var r=a(87462),s=a(63366),n=a(94184),l=a.n(n),i=a(67294),c=(a(55638),a(76792)),o=["as","bsPrefix","className","children"],m=i.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,m=e.bsPrefix,p=e.className,d=e.children,u=(0,s.Z)(e,o);return m=(0,c.vE)(m,"popover-header"),i.createElement(n,(0,r.Z)({ref:t},u,{className:l()(m,p)}),d)})),p=["as","bsPrefix","className","children"],d=i.forwardRef((function(e,t){var a=e.as,n=void 0===a?"div":a,o=e.bsPrefix,m=e.className,d=e.children,u=(0,s.Z)(e,p);return o=(0,c.vE)(o,"popover-body"),i.createElement(n,(0,r.Z)({ref:t},u,{className:l()(m,o)}),d)})),u=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],h=i.forwardRef((function(e,t){var a=e.bsPrefix,n=e.placement,o=e.className,m=e.style,p=e.children,h=e.content,g=e.arrowProps,E=(e.popper,e.show,(0,s.Z)(e,u)),v=(0,c.vE)(a,"popover"),f=((null==n?void 0:n.split("-"))||[])[0];return i.createElement("div",(0,r.Z)({ref:t,role:"tooltip",style:m,"x-placement":f,className:l()(o,v,f&&"bs-popover-"+f)},E),i.createElement("div",(0,r.Z)({className:"arrow"},g)),h?i.createElement(d,null,p):p)}));h.defaultProps={placement:"right"},h.Title=m,h.Content=d;var g=h},75147:function(e,t,a){var r=a(87462),s=a(63366),n=a(94184),l=a.n(n),i=a(67294),c=a(76792),o=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],m=i.forwardRef((function(e,t){var a=e.bsPrefix,n=e.className,m=e.striped,p=e.bordered,d=e.borderless,u=e.hover,h=e.size,g=e.variant,E=e.responsive,v=(0,s.Z)(e,o),f=(0,c.vE)(a,"table"),Z=l()(n,f,g&&f+"-"+g,h&&f+"-"+h,m&&f+"-striped",p&&f+"-bordered",d&&f+"-borderless",u&&f+"-hover"),P=i.createElement("table",(0,r.Z)({},v,{className:Z,ref:t}));if(E){var b=f+"-responsive";return"string"==typeof E&&(b=b+"-"+E),i.createElement("div",{className:b},P)}return P}));t.Z=m}}]);
//# sourceMappingURL=8746.8b5ea5dd77fc11aeca2a.bundle.js.map