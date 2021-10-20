"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[711],{76515:function(t,e,n){n.d(e,{Z:function(){return m}});var r=n(67294),o=n(15881),a=n(44012),i=n(2486);function c(t){return c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},c(t)}function u(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function s(t,e){return s=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},s(t,e)}function f(t,e){if(e&&("object"===c(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t)}function d(t){return d=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},d(t)}var m=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&s(t,e)}(y,t);var e,n,c,m,p=(c=y,m=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=d(c);if(m){var n=d(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return f(this,t)});function y(){return u(this,y),p.apply(this,arguments)}return e=y,(n=[{key:"render",value:function(){return r.createElement(o.Z,{className:"bg-transparent",border:"info"},r.createElement(o.Z.Header,{className:"bg-info text-dark font-weight-bold"},r.createElement(a.Z,{id:"generic.wip"})),r.createElement(o.Z.Body,null,r.createElement(o.Z.Title,null,r.createElement(a.Z,{id:"generic.wip.desc"}),r.createElement("a",{href:"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest"},"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest")),r.createElement(o.Z.Text,{as:"pre",className:"bg-transparent text-info"},r.createElement("code",null,"Version: ".concat(i.q4,"\nWebpanel Mode: ").concat(i.IK,"\nCurrent route: ").concat(window.location.toString())))))}}])&&l(e.prototype,n),y}(r.Component)},41606:function(t,e,n){n.r(e),n.d(e,{default:function(){return h}});var r=n(67294),o=n(41106),a=n(38592),i=n(71460),c=n(49896),u=n(3429),l=n(43307),s=n(33543),f=n(71739),d=n(9657);function m(t,e,n,r,o,a,i){try{var c=t[a](i),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}function p(t){return function(){var e=this,n=arguments;return new Promise((function(r,o){var a=t.apply(e,n);function i(t){m(a,r,o,i,c,"next",t)}function c(t){m(a,r,o,i,c,"throw",t)}i(void 0)}))}}function y(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,a=[],i=!0,c=!1;try{for(n=n.call(t);!(i=(r=n.next()).done)&&(a.push(r.value),!e||a.length!==e);i=!0);}catch(t){c=!0,o=t}finally{try{i||null==n.return||n.return()}finally{if(c)throw o}}return a}}(t,e)||function(t,e){if(t){if("string"==typeof t)return v(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?v(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function v(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function h(){var t,e=r.useContext(c.g),n=y((0,r.useState)([]),2),m=n[0],v=n[1],h=y((0,r.useState)([]),2),b=h[0],E=h[1],g=y((0,r.useState)(!0),2),w=g[0],x=g[1],S=y((0,r.useState)(null!==(t=u.Mq.jobhistorypage.get(e.instance.id))&&void 0!==t?t:1),2),O=S[0],Z=S[1],P=y((0,r.useState)(void 0),2),C=P[0],I=P[1];function j(){return(j=p((function*(){var t=yield o.Z.listJobs(e.instance.id,{page:O});t.code===a.G.OK?(O>t.payload.totalPages&&0!==t.payload.totalPages&&Z(1),v(t.payload.content),I(t.payload.totalPages)):k(t.error),x(!1)}))).apply(this,arguments)}function k(t){E((function(e){var n=Array.from(e);return n.push(t),n}))}function _(t){return K.apply(this,arguments)}function K(){return(K=p((function*(t){var e=yield o.Z.deleteJob(t.instanceid,t.id);e.code===a.G.OK?i.Z.fastmode=5:k(e.error)}))).apply(this,arguments)}return(0,r.useEffect)((function(){u.Mq.jobhistorypage.set(e.instance.id,O),x(!0),function(){j.apply(this,arguments)}()}),[O]),(0,r.useEffect)((function(){}),[b]),w?r.createElement(f.Z,{text:"loading.instance.jobs.list"}):r.createElement("div",null,b.map((function(t,e){if(t)return r.createElement(l.Z,{key:e,error:t,onClose:function(){return E((function(t){var n=Array.from(t);return n[e]=void 0,n}))}})})),m.sort((function(t,e){return e.id-t.id})).map((function(t){return r.createElement(s.Z,{job:t,key:t.id,onCancel:_})})),r.createElement(d.Z,{selectPage:function(t){return Z(t)},totalPages:null!=C?C:1,currentPage:O}))}},63711:function(t,e,n){n.r(e);var r=n(67814),o=n(67294),a=n(15881),i=n(13361),c=n(56841),u=n(44012),l=n(5977),s=n(48155),f=n(15402),d=n(60083),m=n(38592),p=n(32826),y=n(49896),v=n(3429),h=n(3652),b=n(71739),E=n(76515),g=n(59012),w=n(80478),x=n(41606);function S(t){return S="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},S(t)}function O(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var r,o,a=[],i=!0,c=!1;try{for(n=n.call(t);!(i=(r=n.next()).done)&&(a.push(r.value),!e||a.length!==e);i=!0);}catch(t){c=!0,o=t}finally{try{i||null==n.return||n.return()}finally{if(c)throw o}}return a}}(t,e)||function(t,e){if(t){if("string"==typeof t)return Z(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Z(t,e):void 0}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Z(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function P(t,e,n,r,o,a,i){try{var c=t[a](i),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}function C(t){return function(){var e=this,n=arguments;return new Promise((function(r,o){var a=t.apply(e,n);function i(t){P(a,r,o,i,c,"next",t)}function c(t){P(a,r,o,i,c,"throw",t)}i(void 0)}))}}function I(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function j(t,e){return j=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},j(t,e)}function k(t,e){if(e&&("object"===S(e)||"function"==typeof e))return e;if(void 0!==e)throw new TypeError("Derived constructors may only return object or undefined");return _(t)}function _(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function K(t){return K=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},K(t)}var N=s.D8.ReadActive|s.D8.ListInstalled|s.D8.InstallOfficialOrChangeActiveVersion|s.D8.InstallCustomVersion,T=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&j(t,e)}(x,t);var e,n,l,s,p,g,w=(p=x,g=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}(),function(){var t,e=K(p);if(g){var n=K(this).constructor;t=Reflect.construct(e,arguments,n)}else t=e.apply(this,arguments);return k(this,t)});function x(t){var e,n;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,x),(n=w.call(this,t)).reloadInstance=n.reloadInstance.bind(_(n)),n.deleteContextError=n.deleteContextError.bind(_(n)),v.Mq.selectedinstanceid=parseInt(n.props.match.params.id),n.state={tab:null!==(e=t.match.params.tab)&&void 0!==e?e:x.tabs[0][0],errors:new Set,instance:null,instancePermissionSet:null,reloadInstance:n.reloadInstance,deleteError:n.deleteContextError,instanceid:parseInt(n.props.match.params.id)},n}return e=x,n=[{key:"deleteContextError",value:function(t){this.setState((function(e){var n=new Set(e.errors);return n.delete(t),{errors:n}}))}},{key:"componentDidMount",value:(s=C((function*(){yield this.reloadInstance()})),function(){return s.apply(this,arguments)})},{key:"componentDidUpdate",value:function(t){this.props.match.params.tab&&t.match.params.tab!=this.props.match.params.tab&&this.setState({tab:this.props.match.params.tab})}},{key:"reloadInstance",value:(l=C((function*(){this.setState({instance:null,instancePermissionSet:null});var t=yield f.Z.getInstance(this.state.instanceid);if(t.code===m.G.OK){this.setState({instance:t.payload});var e=yield d.Z.getCurrentInstancePermissionSet(this.state.instanceid);e.code===m.G.OK?this.setState({instancePermissionSet:e.payload}):this.setState((function(t){var n=new Set(t.errors);return n.add(e.error),{instancePermissionSet:null,errors:n}}))}else this.setState((function(e){var n=new Set(e.errors);return n.add(t.error),{instance:null,errors:n}}))})),function(){return l.apply(this,arguments)})},{key:"render",value:function(){var t=this;return this.state.instance&&this.state.instancePermissionSet?o.createElement(y.g.Provider,{value:Object.assign({user:this.context.user,serverInfo:this.context.serverInfo},this.state)},o.createElement(a.Z,null,o.createElement(a.Z.Header,{className:"text-center mb-2 sticky-top"},o.createElement("h3",null,o.createElement(u.Z,{id:"view.instanceedit.title",values:{instanceid:this.props.match.params.id,instancename:this.state.instance.name}})),o.createElement("h5",{className:"text-white-50"},o.createElement(u.Z,{id:"view.instanceedit.tabs.".concat(this.state.tab)}))),o.createElement(c.Z.Container,{mountOnEnter:!0,unmountOnExit:!0,id:"instanceedit",activeKey:this.state.tab},o.createElement("div",{className:"d-flex flex-row"},o.createElement(a.Z.Body,{className:"flex-grow-0"},o.createElement(i.Z,{defaultActiveKey:t.state.tab,onSelect:function(e){var n,r,o;e=null!==(n=e)&&void 0!==n?n:x.tabs[0][0],v.Mq.selectedinstanceedittab=e,t.props.history.push(null!==(r=v.$w.instanceedit.link)&&void 0!==r?r:v.$w.instanceedit.route),t.setState({tab:null!==(o=e)&&void 0!==o?o:x.tabs[0][0]})},fill:!0,variant:"pills",activeKey:t.state.tab,className:"flex-nowrap text-nowrap flex-column hover-bar sticky-top",style:{top:"8em"}},x.tabs.map((function(e){var n=O(e,4),a=n[0],c=n[1],l=n[2],s=n[3];if(!t.state.instancePermissionSet)throw Error("this.state.instancePermissionSet is null in instanceedit nav map");var f=!s,d=!l(t.state.instancePermissionSet,t.context);return o.createElement(i.Z.Item,{key:a},o.createElement(i.Z.Link,{eventKey:a,bsPrefix:"nav-link instanceedittab",className:(f?"no-access text-white":"")+(d?"no-access text-white font-italic":"")+" text-left"},o.createElement(o.Fragment,null,o.createElement(r.G,{icon:d?"lock":c,fixedWidth:!0}),o.createElement("div",{className:"tab-text d-inline-block "+(d?"font-weight-lighter":"")},o.createElement("span",{className:"pl-1"},o.createElement(u.Z,{id:"view.instanceedit.tabs.".concat(a)}))))))})))),o.createElement(a.Z.Body,{className:"bg-body"},o.createElement(c.Z.Content,null,x.tabs.map((function(e){var n=O(e,4),r=n[0],a=n[2],i=n[3];if(!t.state.instancePermissionSet)throw Error("this.state.instancePermissionSet is null in render card map");return o.createElement(c.Z.Pane,{eventKey:r,key:r},i?a(t.state.instancePermissionSet,t.context)?o.createElement(i,null):o.createElement(h.Z,null):o.createElement(E.Z,null))})))))))):o.createElement(b.Z,{text:"loading.instance"})}}],n&&I(e.prototype,n),x}(o.Component);T.tabs=[["info","info",function(){return!0}],["repository","code-branch",function(){return!0}],["deployment","hammer",function(){return!0}],["dd","server",function(){return!0}],["byond","list-ul",function(t){return!!(t.byondRights&N)},g.default],["chatbots","comments",function(){return!0}],["files","folder-open",function(){return!0}],["users","users",function(){return!0}],["jobs","stream",function(){return!0},x.default],["config","cogs",function(){return!0},w.default]],T.contextType=p.f,e.default=(0,l.EN)(T)},56841:function(t,e,n){var r=n(51721),o=n(67294),a=n(97184),i=n(28752),c=n(75103),u=function(t){function e(){return t.apply(this,arguments)||this}return(0,r.Z)(e,t),e.prototype.render=function(){throw new Error("ReactBootstrap: The `Tab` component is not meant to be rendered! It's an abstract component that is only valid as a direct Child of the `Tabs` Component. For custom tabs components use TabPane and TabsContainer directly")},e}(o.Component);u.Container=a.Z,u.Content=i.Z,u.Pane=c.Z,e.Z=u},97184:function(t,e,n){var r=n(67294),o=n(14289),a=n(24426),i=n(45017);e.Z=function(t){var e=(0,o.Ch)(t,{activeKey:"onSelect"}),n=e.id,c=e.generateChildId,u=e.onSelect,l=e.activeKey,s=e.transition,f=e.mountOnEnter,d=e.unmountOnExit,m=e.children,p=(0,r.useMemo)((function(){return c||function(t,e){return n?n+"-"+e+"-"+t:null}}),[n,c]),y=(0,r.useMemo)((function(){return{onSelect:u,activeKey:l,transition:s,mountOnEnter:f||!1,unmountOnExit:d||!1,getControlledId:function(t){return p(t,"tabpane")},getControllerId:function(t){return p(t,"tab")}}}),[u,l,s,f,d,p]);return r.createElement(a.Z.Provider,{value:y},r.createElement(i.Z.Provider,{value:u||null},m))}},28752:function(t,e,n){var r=n(87462),o=n(63366),a=n(94184),i=n.n(a),c=n(67294),u=n(76792),l=["bsPrefix","as","className"],s=c.forwardRef((function(t,e){var n=t.bsPrefix,a=t.as,s=void 0===a?"div":a,f=t.className,d=(0,o.Z)(t,l),m=(0,u.vE)(n,"tab-content");return c.createElement(s,(0,r.Z)({ref:e},d,{className:i()(f,m)}))}));e.Z=s},75103:function(t,e,n){var r=n(87462),o=n(63366),a=n(94184),i=n.n(a),c=n(67294),u=n(76792),l=n(24426),s=n(45017),f=n(41068),d=["activeKey","getControlledId","getControllerId"],m=["bsPrefix","className","active","onEnter","onEntering","onEntered","onExit","onExiting","onExited","mountOnEnter","unmountOnExit","transition","as","eventKey"],p=c.forwardRef((function(t,e){var n=function(t){var e=(0,c.useContext)(l.Z);if(!e)return t;var n=e.activeKey,a=e.getControlledId,i=e.getControllerId,u=(0,o.Z)(e,d),m=!1!==t.transition&&!1!==u.transition,p=(0,s.h)(t.eventKey);return(0,r.Z)({},t,{active:null==t.active&&null!=p?(0,s.h)(n)===p:t.active,id:a(t.eventKey),"aria-labelledby":i(t.eventKey),transition:m&&(t.transition||u.transition||f.Z),mountOnEnter:null!=t.mountOnEnter?t.mountOnEnter:u.mountOnEnter,unmountOnExit:null!=t.unmountOnExit?t.unmountOnExit:u.unmountOnExit})}(t),a=n.bsPrefix,p=n.className,y=n.active,v=n.onEnter,h=n.onEntering,b=n.onEntered,E=n.onExit,g=n.onExiting,w=n.onExited,x=n.mountOnEnter,S=n.unmountOnExit,O=n.transition,Z=n.as,P=void 0===Z?"div":Z,C=(n.eventKey,(0,o.Z)(n,m)),I=(0,u.vE)(a,"tab-pane");if(!y&&!O&&S)return null;var j=c.createElement(P,(0,r.Z)({},C,{ref:e,role:"tabpanel","aria-hidden":!y,className:i()(p,I,{active:y})}));return O&&(j=c.createElement(O,{in:y,onEnter:v,onEntering:h,onEntered:b,onExit:E,onExiting:g,onExited:w,mountOnEnter:x,unmountOnExit:S},j)),c.createElement(l.Z.Provider,{value:null},c.createElement(s.Z.Provider,{value:null},j))}));p.displayName="TabPane",e.Z=p}}]);
//# sourceMappingURL=711.2dd172e722c38b0fc9e5.js.map