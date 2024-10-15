"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[6775],{16775:function(e,n,t){t.r(n),t.d(n,{default:function(){return b}});var r=t(67294),i=t(63366),s=t(87462),o=t(97326),a=t(51721),l=t(220);function p(e,n){var t=Object.create(null);return e&&r.Children.map(e,(function(e){return e})).forEach((function(e){t[e.key]=function(e){return n&&(0,r.isValidElement)(e)?n(e):e}(e)})),t}function c(e,n,t){return null!=t[n]?t[n]:e.props[n]}function u(e,n,t){var i=p(e.children),s=function(e,n){function t(t){return t in n?n[t]:e[t]}e=e||{},n=n||{};var r,i=Object.create(null),s=[];for(var o in e)o in n?s.length&&(i[o]=s,s=[]):s.push(o);var a={};for(var l in n){if(i[l])for(r=0;r<i[l].length;r++){var p=i[l][r];a[i[l][r]]=t(p)}a[l]=t(l)}for(r=0;r<s.length;r++)a[s[r]]=t(s[r]);return a}(n,i);return Object.keys(s).forEach((function(o){var a=s[o];if((0,r.isValidElement)(a)){var l=o in n,p=o in i,u=n[o],d=(0,r.isValidElement)(u)&&!u.props.in;!p||l&&!d?p||!l||d?p&&l&&(0,r.isValidElement)(u)&&(s[o]=(0,r.cloneElement)(a,{onExited:t.bind(null,a),in:u.props.in,exit:c(a,"exit",e),enter:c(a,"enter",e)})):s[o]=(0,r.cloneElement)(a,{in:!1}):s[o]=(0,r.cloneElement)(a,{onExited:t.bind(null,a),in:!0,exit:c(a,"exit",e),enter:c(a,"enter",e)})}})),s}var d=Object.values||function(e){return Object.keys(e).map((function(n){return e[n]}))},f=function(e){function n(n,t){var r,i=(r=e.call(this,n,t)||this).handleExited.bind((0,o.Z)(r));return r.state={contextValue:{isMounting:!0},handleExited:i,firstRender:!0},r}(0,a.Z)(n,e);var t=n.prototype;return t.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},t.componentWillUnmount=function(){this.mounted=!1},n.getDerivedStateFromProps=function(e,n){var t,i,s=n.children,o=n.handleExited;return{children:n.firstRender?(t=e,i=o,p(t.children,(function(e){return(0,r.cloneElement)(e,{onExited:i.bind(null,e),in:!0,appear:c(e,"appear",t),enter:c(e,"enter",t),exit:c(e,"exit",t)})}))):u(e,s,o),firstRender:!1}},t.handleExited=function(e,n){var t=p(this.props.children);e.key in t||(e.props.onExited&&e.props.onExited(n),this.mounted&&this.setState((function(n){var t=(0,s.Z)({},n.children);return delete t[e.key],{children:t}})))},t.render=function(){var e=this.props,n=e.component,t=e.childFactory,s=(0,i.Z)(e,["component","childFactory"]),o=this.state.contextValue,a=d(this.state.children).map(t);return delete s.appear,delete s.enter,delete s.exit,null===n?r.createElement(l.Z.Provider,{value:o},a):r.createElement(l.Z.Provider,{value:o},r.createElement(n,s,a))},n}(r.Component);f.propTypes={},f.defaultProps={component:"div",childFactory:function(e){return e}};var v=f,E=t(58255),m=t(74277),h=t(12666),x=function(e,n){return e&&n&&n.split(" ").forEach((function(n){return(0,m.Z)(e,n)}))},C=function(e){function n(){for(var n,t=arguments.length,r=new Array(t),i=0;i<t;i++)r[i]=arguments[i];return(n=e.call.apply(e,[this].concat(r))||this).appliedClasses={appear:{},enter:{},exit:{}},n.onEnter=function(e,t){var r=n.resolveArguments(e,t),i=r[0],s=r[1];n.removeClasses(i,"exit"),n.addClass(i,s?"appear":"enter","base"),n.props.onEnter&&n.props.onEnter(e,t)},n.onEntering=function(e,t){var r=n.resolveArguments(e,t),i=r[0],s=r[1]?"appear":"enter";n.addClass(i,s,"active"),n.props.onEntering&&n.props.onEntering(e,t)},n.onEntered=function(e,t){var r=n.resolveArguments(e,t),i=r[0],s=r[1]?"appear":"enter";n.removeClasses(i,s),n.addClass(i,s,"done"),n.props.onEntered&&n.props.onEntered(e,t)},n.onExit=function(e){var t=n.resolveArguments(e)[0];n.removeClasses(t,"appear"),n.removeClasses(t,"enter"),n.addClass(t,"exit","base"),n.props.onExit&&n.props.onExit(e)},n.onExiting=function(e){var t=n.resolveArguments(e)[0];n.addClass(t,"exit","active"),n.props.onExiting&&n.props.onExiting(e)},n.onExited=function(e){var t=n.resolveArguments(e)[0];n.removeClasses(t,"exit"),n.addClass(t,"exit","done"),n.props.onExited&&n.props.onExited(e)},n.resolveArguments=function(e,t){return n.props.nodeRef?[n.props.nodeRef.current,e]:[e,t]},n.getClassNames=function(e){var t=n.props.classNames,r="string"==typeof t,i=r?""+(r&&t?t+"-":"")+e:t[e];return{baseClassName:i,activeClassName:r?i+"-active":t[e+"Active"],doneClassName:r?i+"-done":t[e+"Done"]}},n}(0,a.Z)(n,e);var t=n.prototype;return t.addClass=function(e,n,t){var r=this.getClassNames(n)[t+"ClassName"],i=this.getClassNames("enter").doneClassName;"appear"===n&&"done"===t&&i&&(r+=" "+i),"active"===t&&e&&e.scrollTop,r&&(this.appliedClasses[n][t]=r,function(e,n){e&&n&&n.split(" ").forEach((function(n){return(0,E.Z)(e,n)}))}(e,r))},t.removeClasses=function(e,n){var t=this.appliedClasses[n],r=t.base,i=t.active,s=t.done;this.appliedClasses[n]={},r&&x(e,r),i&&x(e,i),s&&x(e,s)},t.render=function(){var e=this.props,n=(e.classNames,(0,i.Z)(e,["classNames"]));return r.createElement(h.ZP,(0,s.Z)({},n,{onEnter:this.onEnter,onEntered:this.onEntered,onEntering:this.onEntering,onExit:this.onExit,onExiting:this.onExiting,onExited:this.onExited}))},n}(r.Component);C.defaultProps={classNames:""},C.propTypes={};var g=C;class b extends r.Component{render(){return r.createElement(v,null,r.createElement(g,{appear:!0,classNames:"anim-fade",addEndListener:(e,n)=>{e.addEventListener("transitionend",n,!1)}},this.props.children))}}}}]);
//# sourceMappingURL=6775.9e67eba23c232e566606.bundle.js.map