"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[3318],{3318:function(t,e,n){n.r(e),n.d(e,{default:function(){return D}});var r=n(6540),s=n(8587),i=n(8168);var o=n(5540),a=r.createContext(null);function l(t,e){var n=Object.create(null);return t&&r.Children.map(t,(function(t){return t})).forEach((function(t){n[t.key]=function(t){return e&&(0,r.isValidElement)(t)?e(t):t}(t)})),n}function u(t,e,n){return null!=n[e]?n[e]:t.props[e]}function c(t,e,n){var s=l(t.children),i=function(t,e){function n(n){return n in e?e[n]:t[n]}t=t||{},e=e||{};var r,s=Object.create(null),i=[];for(var o in t)o in e?i.length&&(s[o]=i,i=[]):i.push(o);var a={};for(var l in e){if(s[l])for(r=0;r<s[l].length;r++){var u=s[l][r];a[s[l][r]]=n(u)}a[l]=n(l)}for(r=0;r<i.length;r++)a[i[r]]=n(i[r]);return a}(e,s);return Object.keys(i).forEach((function(o){var a=i[o];if((0,r.isValidElement)(a)){var l=o in e,c=o in s,p=e[o],d=(0,r.isValidElement)(p)&&!p.props.in;!c||l&&!d?c||!l||d?c&&l&&(0,r.isValidElement)(p)&&(i[o]=(0,r.cloneElement)(a,{onExited:n.bind(null,a),in:p.props.in,exit:u(a,"exit",t),enter:u(a,"enter",t)})):i[o]=(0,r.cloneElement)(a,{in:!1}):i[o]=(0,r.cloneElement)(a,{onExited:n.bind(null,a),in:!0,exit:u(a,"exit",t),enter:u(a,"enter",t)})}})),i}var p=Object.values||function(t){return Object.keys(t).map((function(e){return t[e]}))},d=function(t){function e(e,n){var r,s=(r=t.call(this,e,n)||this).handleExited.bind(function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(r));return r.state={contextValue:{isMounting:!0},handleExited:s,firstRender:!0},r}(0,o.A)(e,t);var n=e.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},e.getDerivedStateFromProps=function(t,e){var n,s,i=e.children,o=e.handleExited;return{children:e.firstRender?(n=t,s=o,l(n.children,(function(t){return(0,r.cloneElement)(t,{onExited:s.bind(null,t),in:!0,appear:u(t,"appear",n),enter:u(t,"enter",n),exit:u(t,"exit",n)})}))):c(t,i,o),firstRender:!1}},n.handleExited=function(t,e){var n=l(this.props.children);t.key in n||(t.props.onExited&&t.props.onExited(e),this.mounted&&this.setState((function(e){var n=(0,i.A)({},e.children);return delete n[t.key],{children:n}})))},n.render=function(){var t=this.props,e=t.component,n=t.childFactory,i=(0,s.A)(t,["component","childFactory"]),o=this.state.contextValue,l=p(this.state.children).map(n);return delete i.appear,delete i.enter,delete i.exit,null===e?r.createElement(a.Provider,{value:o},l):r.createElement(a.Provider,{value:o},r.createElement(e,i,l))},e}(r.Component);d.propTypes={},d.defaultProps={component:"div",childFactory:function(t){return t}};var f=d,h=n(922),E=n(8995),m=n(961),x=!1,v=function(t){return t.scrollTop},g="unmounted",C="exited",b="entering",N="entered",k="exiting",y=function(t){function e(e,n){var r;r=t.call(this,e,n)||this;var s,i=n&&!n.isMounting?e.enter:e.appear;return r.appearStatus=null,e.in?i?(s=C,r.appearStatus=b):s=N:s=e.unmountOnExit||e.mountOnEnter?g:C,r.state={status:s},r.nextCallback=null,r}(0,o.A)(e,t),e.getDerivedStateFromProps=function(t,e){return t.in&&e.status===g?{status:C}:null};var n=e.prototype;return n.componentDidMount=function(){this.updateStatus(!0,this.appearStatus)},n.componentDidUpdate=function(t){var e=null;if(t!==this.props){var n=this.state.status;this.props.in?n!==b&&n!==N&&(e=b):n!==b&&n!==N||(e=k)}this.updateStatus(!1,e)},n.componentWillUnmount=function(){this.cancelNextCallback()},n.getTimeouts=function(){var t,e,n,r=this.props.timeout;return t=e=n=r,null!=r&&"number"!=typeof r&&(t=r.exit,e=r.enter,n=void 0!==r.appear?r.appear:e),{exit:t,enter:e,appear:n}},n.updateStatus=function(t,e){if(void 0===t&&(t=!1),null!==e)if(this.cancelNextCallback(),e===b){if(this.props.unmountOnExit||this.props.mountOnEnter){var n=this.props.nodeRef?this.props.nodeRef.current:m.findDOMNode(this);n&&v(n)}this.performEnter(t)}else this.performExit();else this.props.unmountOnExit&&this.state.status===C&&this.setState({status:g})},n.performEnter=function(t){var e=this,n=this.props.enter,r=this.context?this.context.isMounting:t,s=this.props.nodeRef?[r]:[m.findDOMNode(this),r],i=s[0],o=s[1],a=this.getTimeouts(),l=r?a.appear:a.enter;!t&&!n||x?this.safeSetState({status:N},(function(){e.props.onEntered(i)})):(this.props.onEnter(i,o),this.safeSetState({status:b},(function(){e.props.onEntering(i,o),e.onTransitionEnd(l,(function(){e.safeSetState({status:N},(function(){e.props.onEntered(i,o)}))}))})))},n.performExit=function(){var t=this,e=this.props.exit,n=this.getTimeouts(),r=this.props.nodeRef?void 0:m.findDOMNode(this);e&&!x?(this.props.onExit(r),this.safeSetState({status:k},(function(){t.props.onExiting(r),t.onTransitionEnd(n.exit,(function(){t.safeSetState({status:C},(function(){t.props.onExited(r)}))}))}))):this.safeSetState({status:C},(function(){t.props.onExited(r)}))},n.cancelNextCallback=function(){null!==this.nextCallback&&(this.nextCallback.cancel(),this.nextCallback=null)},n.safeSetState=function(t,e){e=this.setNextCallback(e),this.setState(t,e)},n.setNextCallback=function(t){var e=this,n=!0;return this.nextCallback=function(r){n&&(n=!1,e.nextCallback=null,t(r))},this.nextCallback.cancel=function(){n=!1},this.nextCallback},n.onTransitionEnd=function(t,e){this.setNextCallback(e);var n=this.props.nodeRef?this.props.nodeRef.current:m.findDOMNode(this),r=null==t&&!this.props.addEndListener;if(n&&!r){if(this.props.addEndListener){var s=this.props.nodeRef?[this.nextCallback]:[n,this.nextCallback],i=s[0],o=s[1];this.props.addEndListener(i,o)}null!=t&&setTimeout(this.nextCallback,t)}else setTimeout(this.nextCallback,0)},n.render=function(){var t=this.state.status;if(t===g)return null;var e=this.props,n=e.children,i=(e.in,e.mountOnEnter,e.unmountOnExit,e.appear,e.enter,e.exit,e.timeout,e.addEndListener,e.onEnter,e.onEntering,e.onEntered,e.onExit,e.onExiting,e.onExited,e.nodeRef,(0,s.A)(e,["children","in","mountOnEnter","unmountOnExit","appear","enter","exit","timeout","addEndListener","onEnter","onEntering","onEntered","onExit","onExiting","onExited","nodeRef"]));return r.createElement(a.Provider,{value:null},"function"==typeof n?n(t,i):r.cloneElement(r.Children.only(n),i))},e}(r.Component);function A(){}y.contextType=a,y.propTypes={},y.defaultProps={in:!1,mountOnEnter:!1,unmountOnExit:!1,appear:!1,enter:!0,exit:!0,onEnter:A,onEntering:A,onEntered:A,onExit:A,onExiting:A,onExited:A},y.UNMOUNTED=g,y.EXITED=C,y.ENTERING=b,y.ENTERED=N,y.EXITING=k;var S=y,O=function(t,e){return t&&e&&e.split(" ").forEach((function(e){return(0,E.A)(t,e)}))},R=function(t){function e(){for(var e,n=arguments.length,r=new Array(n),s=0;s<n;s++)r[s]=arguments[s];return(e=t.call.apply(t,[this].concat(r))||this).appliedClasses={appear:{},enter:{},exit:{}},e.onEnter=function(t,n){var r=e.resolveArguments(t,n),s=r[0],i=r[1];e.removeClasses(s,"exit"),e.addClass(s,i?"appear":"enter","base"),e.props.onEnter&&e.props.onEnter(t,n)},e.onEntering=function(t,n){var r=e.resolveArguments(t,n),s=r[0],i=r[1]?"appear":"enter";e.addClass(s,i,"active"),e.props.onEntering&&e.props.onEntering(t,n)},e.onEntered=function(t,n){var r=e.resolveArguments(t,n),s=r[0],i=r[1]?"appear":"enter";e.removeClasses(s,i),e.addClass(s,i,"done"),e.props.onEntered&&e.props.onEntered(t,n)},e.onExit=function(t){var n=e.resolveArguments(t)[0];e.removeClasses(n,"appear"),e.removeClasses(n,"enter"),e.addClass(n,"exit","base"),e.props.onExit&&e.props.onExit(t)},e.onExiting=function(t){var n=e.resolveArguments(t)[0];e.addClass(n,"exit","active"),e.props.onExiting&&e.props.onExiting(t)},e.onExited=function(t){var n=e.resolveArguments(t)[0];e.removeClasses(n,"exit"),e.addClass(n,"exit","done"),e.props.onExited&&e.props.onExited(t)},e.resolveArguments=function(t,n){return e.props.nodeRef?[e.props.nodeRef.current,t]:[t,n]},e.getClassNames=function(t){var n=e.props.classNames,r="string"==typeof n,s=r?""+(r&&n?n+"-":"")+t:n[t];return{baseClassName:s,activeClassName:r?s+"-active":n[t+"Active"],doneClassName:r?s+"-done":n[t+"Done"]}},e}(0,o.A)(e,t);var n=e.prototype;return n.addClass=function(t,e,n){var r=this.getClassNames(e)[n+"ClassName"],s=this.getClassNames("enter").doneClassName;"appear"===e&&"done"===n&&s&&(r+=" "+s),"active"===n&&t&&v(t),r&&(this.appliedClasses[e][n]=r,function(t,e){t&&e&&e.split(" ").forEach((function(e){return(0,h.A)(t,e)}))}(t,r))},n.removeClasses=function(t,e){var n=this.appliedClasses[e],r=n.base,s=n.active,i=n.done;this.appliedClasses[e]={},r&&O(t,r),s&&O(t,s),i&&O(t,i)},n.render=function(){var t=this.props,e=(t.classNames,(0,s.A)(t,["classNames"]));return r.createElement(S,(0,i.A)({},e,{onEnter:this.onEnter,onEntered:this.onEntered,onEntering:this.onEntering,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}))},e}(r.Component);R.defaultProps={classNames:""},R.propTypes={};var T=R;class D extends r.Component{render(){return r.createElement(f,null,r.createElement(T,{appear:!0,classNames:"anim-fade",addEndListener:(t,e)=>{t.addEventListener("transitionend",e,!1)}},this.props.children))}}},922:function(t,e,n){n.d(e,{A:function(){return s}});var r=n(4243);function s(t,e){t.classList?t.classList.add(e):(0,r.A)(t,e)||("string"==typeof t.className?t.className=t.className+" "+e:t.setAttribute("class",(t.className&&t.className.baseVal||"")+" "+e))}},4243:function(t,e,n){function r(t,e){return t.classList?!!e&&t.classList.contains(e):-1!==(" "+(t.className.baseVal||t.className)+" ").indexOf(" "+e+" ")}n.d(e,{A:function(){return r}})},8995:function(t,e,n){function r(t,e){return t.replace(new RegExp("(^|\\s)"+e+"(?:\\s|$)","g"),"$1").replace(/\s+/g," ").replace(/^\s*|\s*$/g,"")}function s(t,e){t.classList?t.classList.remove(e):"string"==typeof t.className?t.className=r(t.className,e):t.setAttribute("class",r(t.className&&t.className.baseVal||"",e))}n.d(e,{A:function(){return s}})},5540:function(t,e,n){function r(t,e){return r=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},r(t,e)}function s(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,r(t,e)}n.d(e,{A:function(){return s}})}}]);
//# sourceMappingURL=3318.8f7f4e465897a111f2d6.bundle.js.map