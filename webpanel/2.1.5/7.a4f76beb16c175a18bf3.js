(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{353:function(t,e,n){"use strict";n.r(e);var r=n(212),a=n(0),o=n.n(a),i=n(37),c=n(694),s=n(693),u=n(72),l=n(138),f=n(17),p=n(713),y=n(84),m=n(3),d=n(121),h=n(714),b=n(34),v=n(14),g=n(63),E=n(54),w=n(712);function S(t){return(S="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function O(t,e,n,r,a,o,i){try{var c=t[o](i),s=c.value}catch(t){return void n(t)}c.done?e(s):Promise.resolve(s).then(r,a)}function P(t){return function(){var e=this,n=arguments;return new Promise((function(r,a){var o=t.apply(e,n);function i(t){O(o,r,a,i,c,"next",t)}function c(t){O(o,r,a,i,c,"throw",t)}i(void 0)}))}}function j(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function x(t,e){return(x=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function k(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=I(t);if(e){var a=I(this).constructor;n=Reflect.construct(r,arguments,a)}else n=r.apply(this,arguments);return _(this,n)}}function _(t,e){return!e||"object"!==S(e)&&"function"!=typeof e?R(t):e}function R(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function I(t){return(I=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var C=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&x(t,e)}(_,t);var e,a,f,d,S,O=k(_);function _(t){var e;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,_),(e=O.call(this,t)).loadInstance=e.loadInstance.bind(R(e)),v.c.instanceid=t.match.params.id,v.c.selectedinstancehostingtab=t.match.params.tab,e.state={tab:t.match.params.tab||"byond",errors:[],loading:!0},e}return e=_,(a=[{key:"componentDidUpdate",value:function(t){t.match.params.tab!==this.props.match.params.tab&&this.setState({tab:this.props.match.params.tab||"byond"})}},{key:"componentDidMount",value:(S=P((function*(){this.setState({loading:!0}),yield this.loadInstance()})),function(){return S.apply(this,arguments)})},{key:"addError",value:function(t){this.setState((function(e){var n=Array.from(e.errors);return n.push(t),{errors:n}}))}},{key:"loadInstance",value:(d=P((function*(){this.setState({loading:!0});var t=yield p.a.getInstance(parseInt(this.props.match.params.id));if(t.code===m.a.OK){this.setState({instance:t.payload});var e=yield y.a.getCurrentInstancePermissionSet(t.payload.id);e.code===m.a.OK?this.setState({currentInstanceUser:e.payload}):this.addError(e.error)}else this.addError(t.error);this.setState({loading:!1})})),function(){return d.apply(this,arguments)})},{key:"render",value:function(){var t=this;if(this.state.loading)return o.a.createElement(E.a,{text:"loading.instance"});if(!this.context.user)throw Error("Hosting: this.context.user is null!");var e=o.a.createElement(E.a,{text:"loading.page"}),a=Object(r.a)((function(){return Promise.all([n.e(2),n.e(4),n.e(0),n.e(5)]).then(n.bind(null,343))}),{fallback:e});return o.a.createElement("div",{className:"text-center"},this.state.errors.map((function(e,n){if(e)return o.a.createElement(g.a,{key:n,error:e,onClose:function(){return t.setState((function(t){var e=Array.from(t.errors);return e[n]=void 0,{errors:e}}))}})})),this.state.instance?o.a.createElement("h3",null,"".concat(this.state.instance.name," (").concat(this.state.instance.id,")")):o.a.createElement("h3",null,o.a.createElement(u.a,{id:"generic.assert.noinstance"})),o.a.createElement(i.a,{as:l.b,to:v.b.instancelist.link||v.b.instancelist.route},o.a.createElement(u.a,{id:"generic.goback"})),this.state.instance?this.state.currentInstanceUser?o.a.createElement(s.a,{className:"justify-content-center mb-3 mt-4 flex-column flex-md-row",activeKey:this.state.tab,onSelect:function(e){e&&(v.c.instanceid=t.props.match.params.id,v.c.selectedinstancehostingtab=e,h.a.setupMode||window.history.pushState(null,window.document.title,v.b.instancehosting.link||v.b.instancehosting.route),t.setState({tab:e}))}},o.a.createElement(c.a,{eventKey:"byond",title:o.a.createElement(u.a,{id:"view.instance.hosting.byond"})},o.a.createElement(a,{instance:this.state.instance,selfPermissionSet:Object(b.d)(this.context.user),selfInstancePermissionSet:this.state.currentInstanceUser})),o.a.createElement(c.a,{eventKey:"users",title:o.a.createElement(u.a,{id:"view.instance.config.instanceusers"})},o.a.createElement(w.a,null)),o.a.createElement(c.a,{eventKey:"chatbots",title:o.a.createElement(u.a,{id:"view.instance.config.chatbots"})},o.a.createElement(w.a,null))):o.a.createElement(u.a,{id:"generic.assert.nopermissionset"}):o.a.createElement(u.a,{id:"generic.assert.noinstance"}))}}])&&j(e.prototype,a),f&&j(e,f),_}(o.a.Component);C.contextType=d.a,e.default=Object(f.f)(C)},712:function(t,e,n){"use strict";n.d(e,"a",(function(){return d}));var r=n(0),a=n.n(r),o=n(96),i=n(72),c=n(20);function s(t){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function u(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function l(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function f(t,e){return(f=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function p(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=m(t);if(e){var a=m(this).constructor;n=Reflect.construct(r,arguments,a)}else n=r.apply(this,arguments);return y(this,n)}}function y(t,e){return!e||"object"!==s(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function m(t){return(m=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}var d=function(t){!function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&f(t,e)}(y,t);var e,n,r,s=p(y);function y(){return u(this,y),s.apply(this,arguments)}return e=y,(n=[{key:"render",value:function(){return a.a.createElement(o.a,{className:"bg-transparent",border:"info"},a.a.createElement(o.a.Header,{className:"bg-info text-dark font-weight-bold"},a.a.createElement(i.a,{id:"generic.wip"})),a.a.createElement(o.a.Body,null,a.a.createElement(o.a.Title,null,a.a.createElement(i.a,{id:"generic.wip.desc"}),a.a.createElement("a",{href:"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest"},"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest")),a.a.createElement(o.a.Text,{as:"pre",className:"bg-transparent text-info"},a.a.createElement("code",null,"Version: ".concat(c.e,"\nWebpanel Mode: ").concat(c.d,"\nCurrent route: ").concat(window.location.toString())))))}}])&&l(e.prototype,n),r&&l(e,r),y}(a.a.Component)},714:function(t,e,n){"use strict";n.d(e,"a",(function(){return r}));var r={}}}]);
//# sourceMappingURL=7.a4f76beb16c175a18bf3.js.map