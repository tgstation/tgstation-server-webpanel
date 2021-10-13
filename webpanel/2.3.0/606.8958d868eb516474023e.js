"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[606],{9657:function(e,t,r){r.d(t,{Z:function(){return B}});var n=r(67814),o=r(67294),a=r(35005),i=r(32258),s=r(15293),c=r(87462),l=r(63366),u=r(94184),p=r.n(u),f=r(76792),m=r(48358),d=["active","disabled","className","style","activeLabel","children"],h=["children"],v=o.forwardRef((function(e,t){var r=e.active,n=e.disabled,a=e.className,i=e.style,s=e.activeLabel,u=e.children,f=(0,l.Z)(e,d),h=r||n?"span":m.Z;return o.createElement("li",{ref:t,style:i,className:p()(a,"page-item",{active:r,disabled:n})},o.createElement(h,(0,c.Z)({className:"page-link",disabled:n},f),u,r&&s&&o.createElement("span",{className:"sr-only"},s)))}));v.defaultProps={active:!1,disabled:!1,activeLabel:"(current)"},v.displayName="PageItem";var y=v;function g(e,t,r){function n(e){var n=e.children,a=(0,l.Z)(e,h);return o.createElement(v,a,o.createElement("span",{"aria-hidden":"true"},n||t),o.createElement("span",{className:"sr-only"},r))}return void 0===r&&(r=e),n.displayName=e,n}var b=g("First","«"),P=g("Prev","‹","Previous"),E=g("Ellipsis","…","More"),w=g("Next","›"),x=g("Last","»"),N=["bsPrefix","className","children","size"],O=o.forwardRef((function(e,t){var r=e.bsPrefix,n=e.className,a=e.children,i=e.size,s=(0,l.Z)(e,N),u=(0,f.vE)(r,"pagination");return o.createElement("ul",(0,c.Z)({ref:t},s,{className:p()(n,u,i&&u+"-"+i)}),a)}));O.First=b,O.Prev=P,O.Ellipsis=E,O.Item=y,O.Next=w,O.Last=x;var Z=O,j=(r(55638),["as","bsPrefix","className","children"]),S=o.forwardRef((function(e,t){var r=e.as,n=void 0===r?"div":r,a=e.bsPrefix,i=e.className,s=e.children,u=(0,l.Z)(e,j);return a=(0,f.vE)(a,"popover-header"),o.createElement(n,(0,c.Z)({ref:t},u,{className:p()(a,i)}),s)})),C=["as","bsPrefix","className","children"],k=o.forwardRef((function(e,t){var r=e.as,n=void 0===r?"div":r,a=e.bsPrefix,i=e.className,s=e.children,u=(0,l.Z)(e,C);return a=(0,f.vE)(a,"popover-body"),o.createElement(n,(0,c.Z)({ref:t},u,{className:p()(i,a)}),s)})),_=["bsPrefix","placement","className","style","children","content","arrowProps","popper","show"],M=o.forwardRef((function(e,t){var r=e.bsPrefix,n=e.placement,a=e.className,i=e.style,s=e.children,u=e.content,m=e.arrowProps,d=(e.popper,e.show,(0,l.Z)(e,_)),h=(0,f.vE)(r,"popover"),v=((null==n?void 0:n.split("-"))||[])[0];return o.createElement("div",(0,c.Z)({ref:t,role:"tooltip",style:i,"x-placement":v,className:p()(a,h,v&&"bs-popover-"+v)},d),o.createElement("div",(0,c.Z)({className:"arrow"},m)),u?o.createElement(k,null,s):s)}));M.defaultProps={placement:"right"},M.Title=S,M.Content=k;var I=M,R=r(44012);function A(e){return A="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},A(e)}var G=["selectPage","totalPages","currentPage"];function T(){return T=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},T.apply(this,arguments)}function L(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function V(e,t){return V=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},V(e,t)}function q(e,t){if(t&&("object"===A(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e)}function z(e){return z=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},z(e)}var B=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&V(e,t)}(p,e);var t,r,c,l,u=(c=p,l=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=z(c);if(l){var r=z(this).constructor;e=Reflect.construct(t,arguments,r)}else e=t.apply(this,arguments);return q(this,e)});function p(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,p),(t=u.call(this,e)).state={showGoto:!1,gotoValue:e.currentPage},t}return t=p,(r=[{key:"render",value:function(){for(var e=this,t=[],r=Math.max(this.props.totalPages-this.props.currentPage-1,0),c=Math.max(this.props.currentPage-2,0),l=Math.max(this.props.currentPage-Math.max(5-Number(this.props.currentPage!==this.props.totalPages)-r,2),2),u=Math.min(this.props.currentPage+Math.max(5-Number(1!==this.props.currentPage)-c,2),this.props.totalPages-1),p=function(r){t.push(o.createElement(Z.Item,{key:r,active:r===e.props.currentPage,onClick:function(){return e.props.selectPage(r)}},r))},f=l;f<=u;f++)p(f);var m=this.props.totalPages>7?o.createElement(Z.Ellipsis,{disabled:!0}):null,d=o.createElement(I,{id:"popover-gotopage"},o.createElement(I.Title,null,o.createElement(R.Z,{id:"generic.goto.title"})),o.createElement(I.Content,null,o.createElement("form",{className:"d-flex",onSubmit:function(t){t.preventDefault(),e.props.selectPage(e.state.gotoValue),e.setState({showGoto:!1})}},o.createElement(i.Z.Control,{className:"mr-2",type:"number",min:1,max:this.props.totalPages,value:this.state.gotoValue,onChange:function(t){return e.setState({gotoValue:parseInt(t.target.value)})},custom:!0}),o.createElement(a.Z,{type:"submit"},o.createElement(R.Z,{id:"generic.goto"}))))),h=this.props,v=(h.selectPage,h.totalPages,h.currentPage,function(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}(h,G));return o.createElement("div",T({className:"text-center",style:{position:"sticky",bottom:"1.5em"}},v),o.createElement(Z,{className:"justify-content-center"},o.createElement(Z.Prev,{disabled:this.props.currentPage<=1,onClick:function(){return e.props.selectPage(Math.max(e.props.currentPage-1,1))}}),o.createElement(Z.Item,{active:this.props.currentPage<=1,onClick:function(){return e.props.selectPage(1)}},"1"),m,t,m,this.props.totalPages>=2?o.createElement(Z.Item,{active:this.props.currentPage>=this.props.totalPages,onClick:function(){return e.props.selectPage(e.props.totalPages)}},this.props.totalPages):null,this.props.totalPages>7?o.createElement(s.Z,{show:this.state.showGoto,placement:"top",overlay:d},o.createElement(Z.Item,{onClick:function(){return e.setState((function(e){return{showGoto:!e.showGoto}}))}},o.createElement(n.G,{icon:"search"}))):null,o.createElement(Z.Next,{disabled:this.props.currentPage>=this.props.totalPages,onClick:function(){return e.props.selectPage(Math.min(e.props.currentPage+1,e.props.totalPages))}})))}}])&&L(t.prototype,r),p}(o.PureComponent)},41606:function(e,t,r){r.r(t),r.d(t,{default:function(){return y}});var n=r(67294),o=r(41106),a=r(38592),i=r(71460),s=r(49896),c=r(3429),l=r(43307),u=r(33543),p=r(71739),f=r(9657);function m(e,t,r,n,o,a,i){try{var s=e[a](i),c=s.value}catch(e){return void r(e)}s.done?t(c):Promise.resolve(c).then(n,o)}function d(e){return function(){var t=this,r=arguments;return new Promise((function(n,o){var a=e.apply(t,r);function i(e){m(a,n,o,i,s,"next",e)}function s(e){m(a,n,o,i,s,"throw",e)}i(void 0)}))}}function h(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,o,a=[],i=!0,s=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(a.push(n.value),!t||a.length!==t);i=!0);}catch(e){s=!0,o=e}finally{try{i||null==r.return||r.return()}finally{if(s)throw o}}return a}}(e,t)||function(e,t){if(e){if("string"==typeof e)return v(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?v(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function y(){var e,t=n.useContext(s.g),r=h((0,n.useState)([]),2),m=r[0],v=r[1],y=h((0,n.useState)([]),2),g=y[0],b=y[1],P=h((0,n.useState)(!0),2),E=P[0],w=P[1],x=h((0,n.useState)(null!==(e=c.Mq.jobhistorypage.get(t.instance.id))&&void 0!==e?e:1),2),N=x[0],O=x[1],Z=h((0,n.useState)(void 0),2),j=Z[0],S=Z[1];function C(){return(C=d((function*(){var e=yield o.Z.listJobs(t.instance.id,{page:N});e.code===a.G.OK?(N>e.payload.totalPages&&0!==e.payload.totalPages&&O(1),v(e.payload.content),S(e.payload.totalPages)):k(e.error),w(!1)}))).apply(this,arguments)}function k(e){b((function(t){var r=Array.from(t);return r.push(e),r}))}function _(e){return M.apply(this,arguments)}function M(){return(M=d((function*(e){var t=yield o.Z.deleteJob(e.instanceid,e.id);t.code===a.G.OK?i.Z.fastmode=5:k(t.error)}))).apply(this,arguments)}return(0,n.useEffect)((function(){c.Mq.jobhistorypage.set(t.instance.id,N),w(!0),function(){C.apply(this,arguments)}()}),[N]),(0,n.useEffect)((function(){}),[g]),E?n.createElement(p.Z,{text:"loading.instance.jobs.list"}):n.createElement("div",null,g.map((function(e,t){if(e)return n.createElement(l.Z,{key:t,error:e,onClose:function(){return b((function(e){var r=Array.from(e);return r[t]=void 0,r}))}})})),m.sort((function(e,t){return t.id-e.id})).map((function(e){return n.createElement(u.Z,{job:e,key:e.id,onCancel:_})})),n.createElement(f.Z,{selectPage:function(e){return O(e)},totalPages:null!=j?j:1,currentPage:N}))}},49896:function(e,t,r){r.d(t,{g:function(){return n}});var n=r(67294).createContext(void 0)}}]);
//# sourceMappingURL=606.8958d868eb516474023e.js.map