"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[9538,6983],{8045:function(e,t){var a="plus",n=[10133,61543,"add"],s="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z";t.mw={prefix:"fas",iconName:a,icon:[448,512,n,"2b",s]},t.QL=t.mw},6795:function(e,t,a){a.d(t,{Q:function(){return c}});var n=a(6540),s=a(8785),r=a.n(s),i=a(8437);function l(e){return n.createElement(r(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function c(e){return i.Ay.showjson.value?n.createElement("div",{className:"text-left"},n.createElement(l,{obj:e.obj})):n.createElement(n.Fragment,null)}},5282:function(e,t,a){a.d(t,{A:function(){return p}});var n=a(6784),s=a(6540),r=a(5615),i=a(1208),l=a(5038),c=a(1069),o=a(3899),m=a(8065);function d(){return d=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)({}).hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},d.apply(null,arguments)}class p extends s.PureComponent{constructor(e){super(e),this.state={showGoto:!1,gotoValue:e.currentPage}}render(){const e=[],t=Math.max(this.props.totalPages-this.props.currentPage-1,0),a=Math.max(this.props.currentPage-2,0),p=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-t,2),2),h=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-a,2),this.props.totalPages-1);for(let t=p;t<=h;t++)e.push(s.createElement(c.A.Item,{key:t,active:t===this.props.currentPage,onClick:()=>this.props.selectPage(t)},t));const u=this.props.totalPages>7?s.createElement(c.A.Ellipsis,{disabled:!0}):null,g=s.createElement(o.A,{id:"popover-gotopage"},s.createElement(o.A.Title,null,s.createElement(m.A,{id:"generic.goto.title"})),s.createElement(o.A.Content,null,s.createElement("form",{className:"d-flex",onSubmit:e=>{e.preventDefault(),this.props.selectPage(this.state.gotoValue),this.setState({showGoto:!1})}},s.createElement(i.A.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:e=>this.setState({gotoValue:parseInt(e.target.value)}),custom:!0}),s.createElement(r.A,{type:"submit"},s.createElement(m.A,{id:"generic.goto"}))))),{selectPage:E,totalPages:f,currentPage:v,...A}=this.props;return s.createElement("div",d({className:"text-center",style:{position:"sticky",bottom:"1.5em"}},A),s.createElement(c.A,{className:"justify-content-center"},s.createElement(c.A.Prev,{disabled:this.props.currentPage<=1,onClick:()=>this.props.selectPage(Math.max(this.props.currentPage-1,1))}),s.createElement(c.A.Item,{active:this.props.currentPage<=1,onClick:()=>this.props.selectPage(1)},"1"),u,e,u,this.props.totalPages>=2?s.createElement(c.A.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(this.props.totalPages)},this.props.totalPages):null,this.props.totalPages>7?s.createElement(l.A,{show:this.state.showGoto,placement:"top",overlay:g},s.createElement(c.A.Item,{onClick:()=>this.setState((e=>({showGoto:!e.showGoto})))},s.createElement(n.g,{icon:"search"}))):null,s.createElement(c.A.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:()=>this.props.selectPage(Math.min(this.props.currentPage+1,this.props.totalPages))})))}}},9538:function(e,t,a){a.r(t);var n=a(6188),s=a(8045),r=a(6784),i=a(6540),l=a(6052),c=a(5615),o=a(5038),m=a(2431),d=a(3524),p=a(8065),h=a(4180),u=a(9589),g=a(2576),E=a(1824),f=a(2589),v=a(4173),A=a(5301),b=a(3728),P=a(7864),y=a(4118),N=a(664),w=a(7567),x=a(6795),S=a(7255),k=a(5282);function C(){return C=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)({}).hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},C.apply(null,arguments)}class I extends i.Component{constructor(e){super(e),this.setOnline=this.setOnline.bind(this),this.grantPermissions=this.grantPermissions.bind(this),this.state={loading:!0,instances:[],errors:[],page:N.M2.instancelistpage??1}}addError(e){this.setState((t=>{const a=Array.from(t.errors);return a.push(e),{errors:a}}))}async componentDidUpdate(e,t){t.page!==this.state.page&&(N.M2.instancelistpage=this.state.page,await this.loadInstances())}async loadInstances(){this.setState({loading:!0});const e=await E.A.listInstances({page:this.state.page}),t=await b.A.getServerInfo(),a=t.code===A.s.OK&&(0,u.satisfies)(t.payload.apiVersion,"<9.1.0"),n=[];if(e.code==A.s.OK){if(this.state.page>e.payload.totalPages&&0!==e.payload.totalPages)return void this.setState({page:1});const t=[];for(const s of e.payload.content){const e=s;a?s.online?t.push(f.A.getCurrentInstancePermissionSet(s.id).then((t=>{t.code==A.s.OK?e.canAccess=!0:(e.canAccess=!1,t.error.code!==v.O4.HTTP_ACCESS_DENIED&&this.addError(t.error)),n.push(e)}))):(e.canAccess=!1,n.push(e)):(e.canAccess=e.online&&e.accessible,n.push(e))}await Promise.all(t),this.setState({instances:n.sort(((e,t)=>e.id-t.id)),maxPage:e.payload.totalPages})}else this.addError(e.error);this.setState({loading:!1})}async componentDidMount(){await this.loadInstances()}async grantPermissions(e){const t=await E.A.grantPermissions({id:e.id});t.code===A.s.OK?await this.loadInstances():this.addError(t.error)}async detach(e){if(!!e.online||!confirm(`Are you sure you want to detach the instance "${e.name}"? Once detached, the instance will no longer be managed by TGS and you can delete the files manually or reattach it by creating a new instance at the existing path.`))return;const t=await E.A.detachInstance(e.id);t.code===A.s.OK?await this.loadInstances():this.addError(t.error)}async setOnline(e){const t=!e.online;if(!t&&!confirm(`Are you sure you want to take the instance "${e.name}" offline?`))return;const a=await E.A.editInstance({id:e.id,online:t});a.code===A.s.OK?await this.loadInstances():this.addError(a.error)}render(){if(this.state.loading)return i.createElement(S.default,{text:"loading.instance.list"});const e=!!((0,y.u)(this.context.user).instanceManagerRights&g.cq.SetOnline),t=(0,y.tL)((0,y.u)(this.context.user),g.cq.GrantPermissions),a=(0,y.tL)((0,y.u)(this.context.user),g.cq.Delete),s={verticalAlign:"middle"};return i.createElement("div",{className:"text-center"},i.createElement(x.Q,{obj:this.state.instances}),this.state.errors.map(((e,t)=>{if(e)return i.createElement(w.Ay,{key:t,error:e,onClose:()=>this.setState((e=>{const a=Array.from(e.errors);return a[t]=void 0,{errors:a}}))})})),i.createElement("h3",null,i.createElement(p.A,{id:"view.instance.list.title"})),i.createElement(m.A,{striped:!0,bordered:!0,hover:!0,variant:"dark",responsive:!0,className:"mb-4"},i.createElement("thead",null,i.createElement("tr",null,i.createElement("th",null,"#"),i.createElement("th",null,i.createElement(p.A,{id:"generic.name"})),i.createElement("th",null,i.createElement(p.A,{id:"generic.online"})),i.createElement("th",null,i.createElement(p.A,{id:"generic.path"})),i.createElement("th",null,i.createElement(p.A,{id:"generic.configmode"})),i.createElement("th",null,i.createElement(p.A,{id:"generic.action"})))),i.createElement("tbody",null,this.state.instances.map((m=>i.createElement("tr",{key:m.id},i.createElement("td",{style:s},m.id),i.createElement("td",{style:s},m.name),i.createElement("td",{style:s},m.online?i.createElement(l.A,{variant:"success"},i.createElement(p.A,{id:"generic.online"})):i.createElement(l.A,{variant:"danger"},i.createElement(p.A,{id:"generic.offline"}))),i.createElement("td",{style:s},m.moveJob?i.createElement(p.A,{id:"view.instance.moving"}):m.path),i.createElement("td",{style:s},i.createElement(p.A,{id:`view.instance.configmode.${m.configurationType.toString()}`})),i.createElement("td",{className:"align-middle p-1",style:s},!m.canAccess&&m.online?i.createElement(o.A,{placement:"top",overlay:e=>i.createElement(d.A,C({id:`grant-tooltop-${m.id}`},e),i.createElement(p.A,{id:"view.instance.list.grant"+(t?"":".deny")}))},i.createElement(c.A,{className:"mx-1",variant:"warning",onClick:()=>{this.grantPermissions(m)},disabled:!t},i.createElement(r.g,{icon:t?n.KKb:n.DW4}))):i.createElement(i.Fragment,null),i.createElement(c.A,{className:"mx-1",onClick:()=>{N.M2.selectedinstanceid=m.id,this.props.history.push(N.Sb.instanceedit.link??N.Sb.instanceedit.route)},disabled:!m.canAccess},i.createElement(p.A,{id:"generic.access"})),i.createElement(c.A,{className:"mx-1",variant:m.online?"danger":"success",onClick:()=>{this.setOnline(m)},disabled:!e},i.createElement(p.A,{id:"view.instance.list.set."+(m.online?"offline":"online")})),m.online?null:i.createElement(c.A,{variant:"danger",onClick:()=>{this.detach(m)},disabled:!a},i.createElement(r.g,{icon:n.yLS})))))))),i.createElement(k.A,{selectPage:e=>this.setState({page:e}),totalPages:this.state.maxPage??1,currentPage:this.state.page}),i.createElement("div",{className:"align-middle"},i.createElement("div",{className:"mb-4"},this.renderAddInstance()),i.createElement(c.A,{className:"mx-1",onClick:()=>{this.props.history.push(N.Sb.instancejobs.link??N.Sb.instancejobs.route)}},i.createElement(p.A,{id:"routes.instancejobs"}))))}renderAddInstance(){const e=!!((0,y.u)(this.context.user).instanceManagerRights&g.cq.Create);return i.createElement(o.A,{overlay:i.createElement(d.A,{id:"create-instance-tooltip"},i.createElement(p.A,{id:"perms.instance.create.warning"})),show:!e&&void 0},(({ref:t,...a})=>i.createElement(c.A,C({ref:t,className:"mx-1",variant:"success",onClick:()=>{this.props.history.push(N.Sb.instancecreate.link??N.Sb.instancecreate.route)},disabled:!e},a),i.createElement("div",null,i.createElement(r.g,{className:"mr-2",icon:s.QL}),i.createElement(p.A,{id:"routes.instancecreate"})))))}}I.contextType=P.U,t.default=(0,h.y)(I)},6052:function(e,t,a){var n=a(8168),s=a(8587),r=a(2485),i=a.n(r),l=a(6540),c=a(6519),o=["bsPrefix","variant","pill","className","as"],m=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.variant,m=e.pill,d=e.className,p=e.as,h=void 0===p?"span":p,u=(0,s.A)(e,o),g=(0,c.oU)(a,"badge");return l.createElement(h,(0,n.A)({ref:t},u,{className:i()(d,g,m&&g+"-pill",r&&g+"-"+r)}))}));m.displayName="Badge",m.defaultProps={pill:!1},t.A=m},1069:function(e,t,a){a.d(t,{A:function(){return y}});var n=a(8168),s=a(8587),r=a(2485),i=a.n(r),l=a(6540),c=a(6519),o=a(9703),m=["active","disabled","className","style","activeLabel","children"],d=["children"],p=l.forwardRef((function(e,t){var a=e.active,r=e.disabled,c=e.className,d=e.style,p=e.activeLabel,h=e.children,u=(0,s.A)(e,m),g=a||r?"span":o.A;return l.createElement("li",{ref:t,style:d,className:i()(c,"page-item",{active:a,disabled:r})},l.createElement(g,(0,n.A)({className:"page-link",disabled:r},u),h,a&&p&&l.createElement("span",{className:"sr-only"},p)))}));p.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},p.displayName="PageItem";var h=p;function u(e,t,a){function n(e){var n=e.children,r=(0,s.A)(e,d);return l.createElement(p,r,l.createElement("span",{"aria-hidden":"true"},n||t),l.createElement("span",{className:"sr-only"},a))}return void 0===a&&(a=e),n.displayName=e,n}var g=u("First","\xab"),E=u("Prev","\u2039","Previous"),f=u("Ellipsis","\u2026","More"),v=u("Next","\u203a"),A=u("Last","\xbb"),b=["bsPrefix","className","children","size"],P=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.className,o=e.children,m=e.size,d=(0,s.A)(e,b),p=(0,c.oU)(a,"pagination");return l.createElement("ul",(0,n.A)({ref:t},d,{className:i()(r,p,m&&p+"-"+m)}),o)}));P.First=g,P.Prev=E,P.Ellipsis=f,P.Item=h,P.Next=v,P.Last=A;var y=P},3899:function(e,t,a){a.d(t,{A:function(){return g}});var n=a(8168),s=a(8587),r=a(2485),i=a.n(r),l=a(6540),c=(a(8239),a(6519)),o=["as","bsPrefix","className","children"],m=l.forwardRef((function(e,t){var a=e.as,r=void 0===a?"div":a,m=e.bsPrefix,d=e.className,p=e.children,h=(0,s.A)(e,o);return m=(0,c.oU)(m,"popover-header"),l.createElement(r,(0,n.A)({ref:t},h,{className:i()(m,d)}),p)})),d=["as","bsPrefix","className","children"],p=l.forwardRef((function(e,t){var a=e.as,r=void 0===a?"div":a,o=e.bsPrefix,m=e.className,p=e.children,h=(0,s.A)(e,d);return o=(0,c.oU)(o,"popover-body"),l.createElement(r,(0,n.A)({ref:t},h,{className:i()(m,o)}),p)})),h=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],u=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.placement,o=e.className,m=e.style,d=e.children,u=e.content,g=e.arrowProps,E=(e.popper,e.show,(0,s.A)(e,h)),f=(0,c.oU)(a,"popover"),v=((null==r?void 0:r.split("-"))||[])[0];return l.createElement("div",(0,n.A)({ref:t,role:"tooltip",style:m,"x-placement":v,className:i()(o,f,v&&"bs-popover-"+v)},E),l.createElement("div",(0,n.A)({className:"arrow"},g)),u?l.createElement(p,null,d):d)}));u.defaultProps={placement:"right"},u.Title=m,u.Content=p;var g=u},2431:function(e,t,a){var n=a(8168),s=a(8587),r=a(2485),i=a.n(r),l=a(6540),c=a(6519),o=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],m=l.forwardRef((function(e,t){var a=e.bsPrefix,r=e.className,m=e.striped,d=e.bordered,p=e.borderless,h=e.hover,u=e.size,g=e.variant,E=e.responsive,f=(0,s.A)(e,o),v=(0,c.oU)(a,"table"),A=i()(r,v,g&&v+"-"+g,u&&v+"-"+u,m&&v+"-striped",d&&v+"-bordered",p&&v+"-borderless",h&&v+"-hover"),b=l.createElement("table",(0,n.A)({},f,{className:A,ref:t}));if(E){var P=v+"-responsive";return"string"==typeof E&&(P=P+"-"+E),l.createElement("div",{className:P},b)}return b}));t.A=m}}]);
//# sourceMappingURL=9538.fbc0198dce0ae3679113.bundle.js.map