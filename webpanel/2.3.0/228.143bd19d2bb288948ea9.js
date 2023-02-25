"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[228],{9657:function(e,t,r){r.d(t,{Z:function(){return L}});var n=r(67814),a=r(67294),o=r(35005),i=r(32258),s=r(15293),c=r(87462),l=r(63366),u=r(94184),f=r.n(u),p=r(76792),d=r(48358),m=["active","disabled","className","style","activeLabel","children"],v=["children"],h=a.forwardRef((function(e,t){var r=e.active,n=e.disabled,o=e.className,i=e.style,s=e.activeLabel,u=e.children,p=(0,l.Z)(e,m),v=r||n?"span":d.Z;return a.createElement("li",{ref:t,style:i,className:f()(o,"page-item",{active:r,disabled:n})},a.createElement(v,(0,c.Z)({className:"page-link",disabled:n},p),u,r&&s&&a.createElement("span",{className:"sr-only"},s)))}));h.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},h.displayName="PageItem";var y=h;function g(e,t,r){function n(e){var n=e.children,o=(0,l.Z)(e,v);return a.createElement(h,o,a.createElement("span",{"aria-hidden":"true"},n||t),a.createElement("span",{className:"sr-only"},r))}return void 0===r&&(r=e),n.displayName=e,n}var b=g("First","«"),E=g("Prev","‹","Previous"),P=g("Ellipsis","…","More"),w=g("Next","›"),Z=g("Last","»"),O=["bsPrefix","className","children","size"],N=a.forwardRef((function(e,t){var r=e.bsPrefix,n=e.className,o=e.children,i=e.size,s=(0,l.Z)(e,O),u=(0,p.vE)(r,"pagination");return a.createElement("ul",(0,c.Z)({ref:t},s,{className:f()(n,u,i&&u+"-"+i)}),o)}));N.First=b,N.Prev=E,N.Ellipsis=P,N.Item=y,N.Next=w,N.Last=Z;var x=N,S=(r(55638),["as","bsPrefix","className","children"]),j=a.forwardRef((function(e,t){var r=e.as,n=void 0===r?"div":r,o=e.bsPrefix,i=e.className,s=e.children,u=(0,l.Z)(e,S);return o=(0,p.vE)(o,"popover-header"),a.createElement(n,(0,c.Z)({ref:t},u,{className:f()(o,i)}),s)})),k=["as","bsPrefix","className","children"],C=a.forwardRef((function(e,t){var r=e.as,n=void 0===r?"div":r,o=e.bsPrefix,i=e.className,s=e.children,u=(0,l.Z)(e,k);return o=(0,p.vE)(o,"popover-body"),a.createElement(n,(0,c.Z)({ref:t},u,{className:f()(i,o)}),s)})),_=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],I=a.forwardRef((function(e,t){var r=e.bsPrefix,n=e.placement,o=e.className,i=e.style,s=e.children,u=e.content,d=e.arrowProps,m=(e.popper,e.show,(0,l.Z)(e,_)),v=(0,p.vE)(r,"popover"),h=((null==n?void 0:n.split("-"))||[])[0];return a.createElement("div",(0,c.Z)({ref:t,role:"tooltip",style:i,"x-placement":h,className:f()(o,v,h&&"bs-popover-"+h)},m),a.createElement("div",(0,c.Z)({className:"arrow"},d)),u?a.createElement(C,null,s):s)}));I.defaultProps={placement:"right"},I.Title=j,I.Content=C;var R=I,A=r(44012);function M(e){return M="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},M(e)}var T=["selectPage","totalPages","currentPage"];function G(){return G=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},G.apply(this,arguments)}function D(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function $(e,t){return $=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},$(e,t)}function B(e,t){if(t&&("object"===M(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e)}function K(e){return K=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},K(e)}var L=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&$(e,t)}(f,e);var t,r,c,l,u=(c=f,l=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=K(c);if(l){var r=K(this).constructor;e=Reflect.construct(t,arguments,r)}else e=t.apply(this,arguments);return B(this,e)});function f(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,f),(t=u.call(this,e)).state={showGoto:!1,gotoValue:e.currentPage},t}return t=f,(r=[{key:"render",value:function(){for(var e=this,t=[],r=Math.max(this.props.totalPages-this.props.currentPage-1,0),c=Math.max(this.props.currentPage-2,0),l=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-r,2),2),u=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-c,2),this.props.totalPages-1),f=function(r){t.push(a.createElement(x.Item,{key:r,active:r===e.props.currentPage,onClick:function(){return e.props.selectPage(r)}},r))},p=l;p<=u;p++)f(p);var d=this.props.totalPages>7?a.createElement(x.Ellipsis,{disabled:!0}):null,m=a.createElement(R,{id:"popover-gotopage"},a.createElement(R.Title,null,a.createElement(A.Z,{id:"generic.goto.title"})),a.createElement(R.Content,null,a.createElement("form",{className:"d-flex",onSubmit:function(t){t.preventDefault(),e.props.selectPage(e.state.gotoValue),e.setState({showGoto:!1})}},a.createElement(i.Z.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:function(t){return e.setState({gotoValue:parseInt(t.target.value)})},custom:!0}),a.createElement(o.Z,{type:"submit"},a.createElement(A.Z,{id:"generic.goto"}))))),v=this.props,h=(v.selectPage,v.totalPages,v.currentPage,function(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}(v,T));return a.createElement("div",G({className:"text-center"},h),a.createElement(x,{className:"justify-content-center"},a.createElement(x.Prev,{disabled:this.props.currentPage<=1,onClick:function(){return e.props.selectPage(Math.max(e.props.currentPage-1,1))}}),a.createElement(x.Item,{active:this.props.currentPage<=1,onClick:function(){return e.props.selectPage(1)}},"1"),d,t,d,this.props.totalPages>=2?a.createElement(x.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:function(){return e.props.selectPage(e.props.totalPages)}},this.props.totalPages):null,this.props.totalPages>7?a.createElement(s.Z,{show:this.state.showGoto,placement:"top",overlay:m},a.createElement(x.Item,{onClick:function(){return e.setState((function(e){return{showGoto:!e.showGoto}}))}},a.createElement(n.G,{icon:"search"}))):null,a.createElement(x.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:function(){return e.props.selectPage(Math.min(e.props.currentPage+1,e.props.totalPages))}})))}}])&&D(t.prototype,r),f}(a.PureComponent)},36228:function(e,t,r){r.r(t);var n=r(40098),a=r(67814),o=r(67294),i=r(27977),s=r(35005),c=r(15293),l=r(75147),u=r(43489),f=r(44012),p=r(5977),d=r(81249),m=r(48155),v=r(15402),h=r(60083),y=r(36800),g=r(38592),b=r(65022),E=r(32826),P=r(42540),w=r(3429),Z=r(43307),O=r(71739),N=r(9657);function x(e){return x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},x(e)}var S=["ref"];function j(){return j=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},j.apply(this,arguments)}function k(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function C(e,t,r,n,a,o,i){try{var s=e[o](i),c=s.value}catch(e){return void r(e)}s.done?t(c):Promise.resolve(c).then(n,a)}function _(e){return function(){var t=this,r=arguments;return new Promise((function(n,a){var o=e.apply(t,r);function i(e){C(o,n,a,i,s,"next",e)}function s(e){C(o,n,a,i,s,"throw",e)}i(void 0)}))}}function I(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function R(e,t){return R=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},R(e,t)}function A(e,t){if(t&&("object"===x(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return M(e)}function M(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function T(e){return T=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},T(e)}var G=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&R(e,t)}(B,e);var t,r,p,E,x,C,G,D,$=(G=B,D=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=T(G);if(D){var r=T(this).constructor;e=Reflect.construct(t,arguments,r)}else e=t.apply(this,arguments);return A(this,e)});function B(e){var t,r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,B),(r=$.call(this,e)).setOnline=r.setOnline.bind(M(r)),r.state={loading:!0,instances:[],errors:[],page:null!==(t=w.Mq.instancelistpage)&&void 0!==t?t:1},r}return t=B,r=[{key:"addError",value:function(e){this.setState((function(t){var r=Array.from(t.errors);return r.push(e),{errors:r}}))}},{key:"componentDidUpdate",value:(C=_((function*(e,t){t.page!==this.state.page&&(w.Mq.instancelistpage=this.state.page,yield this.loadInstances())})),function(e,t){return C.apply(this,arguments)})},{key:"loadInstances",value:(x=_((function*(){var e=this;this.setState({loading:!0});var t=yield v.Z.listInstances({page:this.state.page}),r=yield b.Z.getServerInfo(),n=r.code===g.G.OK&&(0,d.satisfies)(r.payload.apiVersion,"<9.1.0"),a=[];if(t.code==g.G.OK){if(this.state.page>t.payload.totalPages&&0!==t.payload.totalPages)return void this.setState({page:1});var o,i=[],s=function(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,t){if(e){if("string"==typeof e)return k(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?k(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,s=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return i=e.done,e},e:function(e){s=!0,o=e},f:function(){try{i||null==r.return||r.return()}finally{if(s)throw o}}}}(t.payload.content);try{var c=function(){var t=o.value,r=t;n?t.online?i.push(h.Z.getCurrentInstancePermissionSet(t.id).then((function(t){t.code==g.G.OK?r.canAccess=!0:(r.canAccess=!1,t.error.code!==y.jK.HTTP_ACCESS_DENIED&&e.addError(t.error)),a.push(r)}))):(r.canAccess=!1,a.push(r)):(r.canAccess=!!r.online&&r.accessible,a.push(r))};for(s.s();!(o=s.n()).done;)c()}catch(e){s.e(e)}finally{s.f()}yield Promise.all(i),this.setState({instances:a.sort((function(e,t){return e.id-t.id})),maxPage:t.payload.totalPages})}else this.addError(t.error);this.setState({loading:!1})})),function(){return x.apply(this,arguments)})},{key:"componentDidMount",value:(E=_((function*(){yield this.loadInstances()})),function(){return E.apply(this,arguments)})},{key:"setOnline",value:(p=_((function*(e){var t=!e.online,r=yield v.Z.editInstance({id:e.id,online:t});r.code===g.G.OK?yield this.loadInstances():this.addError(r.error)})),function(e){return p.apply(this,arguments)})},{key:"render",value:function(){var e,t=this;if(this.state.loading)return o.createElement(O.Z,{text:"loading.instance.list"});var r=!!((0,P.Zg)(this.context.user).instanceManagerRights&m.c2.SetOnline),n={verticalAlign:"middle"};return o.createElement("div",{className:"text-center"},this.state.errors.map((function(e,r){if(e)return o.createElement(Z.Z,{key:r,error:e,onClose:function(){return t.setState((function(e){var t=Array.from(e.errors);return t[r]=void 0,{errors:t}}))}})})),o.createElement("h3",null,o.createElement(f.Z,{id:"view.instance.list.title"})),o.createElement(l.Z,{striped:!0,bordered:!0,hover:!0,variant:"dark",responsive:!0,className:"mb-4"},o.createElement("thead",null,o.createElement("tr",null,o.createElement("th",null,"#"),o.createElement("th",null,o.createElement(f.Z,{id:"generic.name"})),o.createElement("th",null,o.createElement(f.Z,{id:"generic.online"})),o.createElement("th",null,o.createElement(f.Z,{id:"generic.path"})),o.createElement("th",null,o.createElement(f.Z,{id:"generic.configmode"})),o.createElement("th",null,o.createElement(f.Z,{id:"generic.action"})))),o.createElement("tbody",null,this.state.instances.map((function(e){return o.createElement("tr",{key:e.id},o.createElement("td",{style:n},e.id),o.createElement("td",{style:n},e.name),o.createElement("td",{style:n},e.online?o.createElement(i.Z,{variant:"success"},o.createElement(f.Z,{id:"generic.online"})):o.createElement(i.Z,{variant:"danger"},o.createElement(f.Z,{id:"generic.offline"}))),o.createElement("td",{style:n},e.moveJob?o.createElement(f.Z,{id:"view.instance.moving"}):e.path),o.createElement("td",{style:n},o.createElement(f.Z,{id:"view.instance.configmode.".concat(e.configurationType.toString())})),o.createElement("td",{className:"align-middle p-1",style:n},o.createElement(s.Z,{className:"mx-1",onClick:function(){var r;w.Mq.selectedinstanceid=e.id,t.props.history.push(null!==(r=w.$w.instanceedit.link)&&void 0!==r?r:w.$w.instanceedit.route)},disabled:!e.canAccess},o.createElement(f.Z,{id:"generic.edit"})),o.createElement(s.Z,{className:"mx-1",variant:e.online?"danger":"success",onClick:function(){return t.setOnline(e)},disabled:!r},o.createElement(f.Z,{id:"view.instance.list.set.".concat(e.online?"offline":"online")}))))})))),o.createElement(N.Z,{selectPage:function(e){return t.setState({page:e})},totalPages:null!==(e=this.state.maxPage)&&void 0!==e?e:1,currentPage:this.state.page}),o.createElement("div",{className:"align-middle"},o.createElement("div",{className:"mb-4"},this.renderAddInstance()),o.createElement(s.Z,{className:"mx-1",onClick:function(){var e;t.props.history.push(null!==(e=w.$w.instancejobs.link)&&void 0!==e?e:w.$w.instancejobs.route)}},o.createElement(f.Z,{id:"routes.instancejobs"}))))}},{key:"renderAddInstance",value:function(){var e=this,t=!!((0,P.Zg)(this.context.user).instanceManagerRights&m.c2.Create);return o.createElement(c.Z,{overlay:o.createElement(u.Z,{id:"create-instance-tooltip"},o.createElement(f.Z,{id:"perms.instance.create.warning"})),show:!t&&void 0},(function(r){var i=r.ref,c=function(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}(r,S);return o.createElement(s.Z,j({ref:i,className:"mx-1",variant:"success",onClick:function(){var t;e.props.history.push(null!==(t=w.$w.instancecreate.link)&&void 0!==t?t:w.$w.instancecreate.route)},disabled:!t},c),o.createElement("div",null,o.createElement(a.G,{className:"mr-2",icon:n.r8}),o.createElement(f.Z,{id:"routes.instancecreate"})))}))}}],r&&I(t.prototype,r),B}(o.Component);G.contextType=E.f,t.default=(0,p.EN)(G)},27977:function(e,t,r){var n=r(87462),a=r(63366),o=r(94184),i=r.n(o),s=r(67294),c=r(76792),l=["bsPrefix","variant","pill","className","as"],u=s.forwardRef((function(e,t){var r=e.bsPrefix,o=e.variant,u=e.pill,f=e.className,p=e.as,d=void 0===p?"span":p,m=(0,a.Z)(e,l),v=(0,c.vE)(r,"badge");return s.createElement(d,(0,n.Z)({ref:t},m,{className:i()(f,v,u&&v+"-pill",o&&v+"-"+o)}))}));u.displayName="Badge",u.defaultProps={pill:!1},t.Z=u},75147:function(e,t,r){var n=r(87462),a=r(63366),o=r(94184),i=r.n(o),s=r(67294),c=r(76792),l=["bsPrefix","className","striped","bordered","borderless","hover","size","variant","responsive"],u=s.forwardRef((function(e,t){var r=e.bsPrefix,o=e.className,u=e.striped,f=e.bordered,p=e.borderless,d=e.hover,m=e.size,v=e.variant,h=e.responsive,y=(0,a.Z)(e,l),g=(0,c.vE)(r,"table"),b=i()(o,g,v&&g+"-"+v,m&&g+"-"+m,u&&g+"-striped",f&&g+"-bordered",p&&g+"-borderless",d&&g+"-hover"),E=s.createElement("table",(0,n.Z)({},y,{className:b,ref:t}));if(h){var P=g+"-responsive";return"string"==typeof h&&(P=P+"-"+h),s.createElement("div",{className:P},E)}return E}));t.Z=u}}]);
//# sourceMappingURL=228.143bd19d2bb288948ea9.js.map