(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{357:function(e,t,a){"use strict";a.r(t);var r=a(225),n=a(230),i=a(56),s=a(0),o=a.n(s),c=a(158),l=a(694),u=a(37),d=a(138),m=a(74),p=a(224),f=a(690),h=a(120),E=a(697),v=a(693),g=a(692),y=a(119),b=a(71),O=a(709),w=a(17),j=a(137),S=a(10),x=a(7),N=a(3),A=a(9),C=a(46),k=a(717),P=a(713),I=a(34),R=a(13),U=a(72),G=a(55);function K(e){return(K="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _(e){return function(e){if(Array.isArray(e))return B(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||z(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function T(){return(T=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e}).apply(this,arguments)}function D(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}function L(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function F(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?L(Object(a),!0).forEach((function(t){V(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):L(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function V(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function M(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var a=[],r=!0,n=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(r=(s=o.next()).done)&&(a.push(s.value),!t||a.length!==t);r=!0);}catch(e){n=!0,i=e}finally{try{r||null==o.return||o.return()}finally{if(n)throw i}}return a}(e,t)||z(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function z(e,t){if(e){if("string"==typeof e)return B(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);return"Object"===a&&e.constructor&&(a=e.constructor.name),"Map"===a||"Set"===a?Array.from(e):"Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?B(e,t):void 0}}function B(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,r=new Array(t);a<t;a++)r[a]=e[a];return r}function J(e,t,a,r,n,i,s){try{var o=e[i](s),c=o.value}catch(e){return void a(e)}o.done?t(c):Promise.resolve(c).then(r,n)}function W(e){return function(){var t=this,a=arguments;return new Promise((function(r,n){var i=e.apply(t,a);function s(e){J(i,r,n,s,o,"next",e)}function o(e){J(i,r,n,s,o,"throw",e)}s(void 0)}))}}function $(e,t){for(var a=0;a<t.length;a++){var r=t[a];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function q(e,t){return(q=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function H(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var a,r=Y(e);if(t){var n=Y(this).constructor;a=Reflect.construct(r,arguments,n)}else a=r.apply(this,arguments);return Q(this,a)}}function Q(e,t){return!t||"object"!==K(t)&&"function"!=typeof t?X(e):t}function X(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function Y(e){return(Y=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}t.default=Object(w.f)(function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&q(e,t)}(Q,e);var t,a,s,w,K,L,z,B,J=H(Q);function Q(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,Q),(t=J.call(this,e)).createGroup=t.createGroup.bind(X(t)),t.changeGroup=t.changeGroup.bind(X(t)),t.state={errors:[],loading:!0,saving:!1,permsadmin:{},permsinstance:{},canRead:!1,canEdit:!1,canEditOwnPassword:!1,canEditOwnOAuth:!1,tab:e.match.params.tab||"info",groups:[],createGroupName:"",newOAuthConnections:[]},R.c.selecteduserid=parseInt(e.match.params.id),R.c.selectedusertab=e.match.params.tab,t}return t=Q,(a=[{key:"componentDidUpdate",value:function(e){e.match.params.tab!==this.props.match.params.tab&&this.setState({tab:this.props.match.params.tab||"info"})}},{key:"componentDidMount",value:(B=W((function*(){var e=parseInt(this.props.match.params.id),t=yield C.a.getUser(e);switch(t.code){case N.a.ERROR:this.addError(t.error);break;case N.a.OK:this.loadUser(t.payload)}var a=yield C.a.getCurrentUser();a.code==N.a.OK?this.setState({canEdit:!!(Object(I.d)(a.payload).administrationRights&S.a.WriteUsers),canRead:!!(Object(I.d)(a.payload).administrationRights&S.a.ReadUsers),canEditOwnPassword:!!(Object(I.d)(a.payload).administrationRights&S.a.EditOwnPassword)&&a.payload.id===e,canEditOwnOAuth:!!(Object(I.d)(a.payload).administrationRights&S.a.EditOwnOAuthConnections)&&a.payload.id===e,groups:a.payload.group?[Object.assign({users:[]},a.payload.group)]:[]}):this.addError(a.error);var r=yield A.a.getServerInfo();r.code==N.a.OK?this.setState({serverinfo:r.payload}):this.addError(r.error),yield this.loadGroups(),this.setState({loading:!1})})),function(){return B.apply(this,arguments)})},{key:"loadGroups",value:(z=W((function*(){if(this.state.canRead){var e=yield k.a.listGroups();e.code===N.a.OK?this.setState({groups:e.payload}):this.addError(e.error)}})),function(){return z.apply(this,arguments)})},{key:"loadUser",value:function(e){this.setState({user:e,newOAuthConnections:e.oAuthConnections?Array.from(e.oAuthConnections):[]}),this.loadEnums()}},{key:"loadEnums",value:function(){var e=this;Object.entries(S.a).forEach((function(t){var a=M(t,2),r=a[0],n=a[1];if(isNaN(parseInt(r))){var i=r.toLowerCase(),s=n;if("none"!=i){var o=!!(Object(I.d)(e.state.user).administrationRights&s);e.setState((function(e){return{permsadmin:F(F({},e.permsadmin),{},V({},i,{currentVal:o,bitflag:s}))}}))}}})),Object.entries(S.e).forEach((function(t){var a=M(t,2),r=a[0],n=a[1];if(isNaN(parseInt(r))){var i=r.toLowerCase(),s=n;if("none"!=i){var o=!!(Object(I.d)(e.state.user).instanceManagerRights&s);e.setState((function(e){return{permsinstance:F(F({},e.permsinstance),{},V({},i,{currentVal:o,bitflag:s}))}}))}}}))}},{key:"addError",value:function(e){this.setState((function(t){var a=Array.from(t.errors);return a.push(e),{errors:a}}))}},{key:"render",value:function(){var e=this;return this.state.loading?o.a.createElement(G.a,{text:"loading.user.load"}):this.state.saving?o.a.createElement(G.a,{text:"loading.user.save"}):o.a.createElement("div",{className:"text-center"},this.state.errors.map((function(t,a){if(t)return o.a.createElement(U.a,{key:a,error:t,onClose:function(){return e.setState((function(e){var t=Array.from(e.errors);return t[a]=void 0,{errors:t}}))}})})),this.state.user?o.a.createElement(o.a.Fragment,null,this.state.canEdit?"":o.a.createElement(c.a,{className:"clearfix",variant:"error"},o.a.createElement(b.a,{id:"view.user.edit.cantedit"})),this.state.user.systemIdentifier?o.a.createElement(l.a,{variant:"primary",className:"mx-1"},o.a.createElement(b.a,{id:"generic.system.short"})):o.a.createElement(l.a,{variant:"primary",className:"mx-1"},o.a.createElement(b.a,{id:"generic.tgs"})),this.state.user.enabled?o.a.createElement(l.a,{variant:"success",className:"mx-1"},o.a.createElement(b.a,{id:"generic.enabled"})):o.a.createElement(l.a,{variant:"danger",className:"mx-1"},o.a.createElement(b.a,{id:"generic.disabled"})),this.state.user.group?o.a.createElement(l.a,{variant:"warning",className:"mx-1"},o.a.createElement(b.a,{id:"generic.grouped"})):null,o.a.createElement("h3",{className:"text-capitalize"},this.state.user.name),o.a.createElement(u.a,{as:j.b,to:R.b.userlist.link||R.b.userlist.route},o.a.createElement(b.a,{id:"generic.goback"})),o.a.createElement(g.a,{activeKey:this.state.tab,onSelect:function(t){t&&(R.c.selectedusertab=t,P.a.setupMode||e.props.history.push(R.b.useredit.link||R.b.useredit.route),e.setState({tab:t}))},id:"test",className:"justify-content-center mb-3 mt-4 flex-column flex-md-row"},o.a.createElement(v.a,{eventKey:"info",title:o.a.createElement(b.a,{id:"generic.info"})},o.a.createElement(d.a,{lg:5,className:"text-center text-md-left mx-auto"},o.a.createElement(E.a,{xs:1,md:2},o.a.createElement(d.a,null,o.a.createElement("h5",{className:"m-0"},o.a.createElement(b.a,{id:"generic.userid"}))),o.a.createElement(d.a,{className:"text-capitalize mb-2"},this.state.user.id)),this.state.user.systemIdentifier?o.a.createElement(E.a,{xs:1,md:2},o.a.createElement(d.a,null,o.a.createElement("h5",{className:"m-0"},o.a.createElement(b.a,{id:"generic.systemidentifier"}))),o.a.createElement(d.a,{className:"mb-2 text-sm-break"},this.state.user.systemIdentifier)):"",o.a.createElement(E.a,{xs:1,md:2},o.a.createElement(d.a,null,o.a.createElement("h5",{className:"m-0"},o.a.createElement(b.a,{id:"generic.enabled"}))),o.a.createElement(d.a,{className:"text-capitalize mb-2"},this.state.user.enabled.toString())),o.a.createElement(E.a,{xs:1,md:2},o.a.createElement(d.a,null,o.a.createElement("h5",{className:"m-0"},o.a.createElement(b.a,{id:"generic.created"}))),o.a.createElement(h.a,{overlay:o.a.createElement(y.a,{id:"".concat(this.state.user.name,"-tooltip")},new Date(this.state.user.createdAt).toLocaleString())},(function(t){var a=t.ref,r=D(t,["ref"]);return o.a.createElement(d.a,T({className:"text-capitalize mb-2"},r),o.a.createElement("span",{ref:a},o.a.createElement(O.a,{value:(new Date(e.state.user.createdAt).getTime()-Date.now())/1e3,numeric:"auto",updateIntervalInSeconds:1})))}))),o.a.createElement(E.a,{xs:1,md:2},o.a.createElement(d.a,null,o.a.createElement("h5",{className:"m-0"},o.a.createElement(b.a,{id:"generic.createdby"}))),o.a.createElement(h.a,{overlay:o.a.createElement(y.a,{id:"".concat(this.state.user.name,"-tooltip-createdby")},o.a.createElement(b.a,{id:"generic.userid"}),this.state.user.createdBy.id)},(function(t){var a=t.ref,r=D(t,["ref"]);return o.a.createElement(d.a,T({className:"text-capitalize mb-2"},r),o.a.createElement("span",{ref:a},e.state.user.createdBy.name))}))),o.a.createElement("div",{className:"text-center mt-3"},this.state.canEdit||this.state.canEditOwnPassword?o.a.createElement(u.a,{className:"mr-2",as:j.b,to:(R.b.passwd.link||R.b.passwd.route)+this.state.user.id.toString()},o.a.createElement(b.a,{id:"routes.passwd"})):"",this.state.canEdit?o.a.createElement(u.a,{variant:this.state.user.enabled?"danger":"success",onClick:W((function*(){e.setState({saving:!0});var t=yield C.a.editUser({enabled:!e.state.user.enabled,id:e.state.user.id});t.code==N.a.OK?e.loadUser(t.payload):e.addError(t.error),e.setState({saving:!1})}))},o.a.createElement(b.a,{id:this.state.user.enabled?"generic.disable":"generic.enable"})):""))),o.a.createElement(v.a,{eventKey:"adminperms",title:o.a.createElement(b.a,{id:"perms.admin"})},this.renderPerms("permsadmin","admin")),o.a.createElement(v.a,{eventKey:"instanceperms",title:o.a.createElement(b.a,{id:"perms.instance"})},this.renderPerms("permsinstance","instance")),o.a.createElement(v.a,{eventKey:"group",title:o.a.createElement(b.a,{id:"perms.group"})},this.renderGroups()),this.renderOAuth())):"")}},{key:"renderOAuth",value:function(){var e,t,a,r,s,c=this,l=null===(e=this.state.serverinfo)||void 0===e?void 0:e.oAuthProviderInfos,d=this.state.newOAuthConnections||(null===(t=this.state.user)||void 0===t?void 0:t.oAuthConnections);if("admin"===(null===(a=this.state.user)||void 0===a?void 0:a.name.toLowerCase())||null==d||!l||!Object.keys(l).length)return null;var h=function(){var e=W((function*(){if(c.setState({saving:!0}),c.state.user){var e=yield C.a.editUser({id:c.state.user.id,oAuthConnections:c.state.newOAuthConnections});e.code==N.a.OK?c.loadUser(e.payload):c.addError(e.error),c.setState({saving:!1})}else c.addError(new x.c(x.b.APP_FAIL,{jsError:Error("this.state.user is null in user edit save")}))}));return function(){return e.apply(this,arguments)}}(),E=this.state.canEdit||this.state.canEditOwnOAuth;return o.a.createElement(v.a,{eventKey:"oauth",title:o.a.createElement(b.a,{id:"view.user.edit.oauth.connections"})},o.a.createElement("h3",{className:"mb-3"},o.a.createElement(b.a,{id:"view.user.edit.oauth.current"})),o.a.createElement("div",null,this.state.newOAuthConnections.map((function(e,t){return o.a.createElement("div",{className:"justify-content-center d-flex",key:t},o.a.createElement(f.a,{className:"w-75 mb-1"},o.a.createElement(f.a.Prepend,null,o.a.createElement(f.a.Text,null,o.a.createElement("span",null,o.a.createElement(b.a,{id:"view.user.edit.oauth.provider"})))),o.a.createElement(m.a.Control,{className:"flex-grow-1 flex-md-grow-0 w-50 w-md-auto ",as:"select",custom:!0,disabled:!E,onChange:function(e){var a=e.target.value;c.setState((function(e){return{newOAuthConnections:e.newOAuthConnections.map((function(e,r){return r!==t?e:F(F({},e),{},{provider:a})}))}}))}},Object.keys(l).map((function(t){return o.a.createElement(b.a,{key:t,id:"view.user.edit.oauth.provider.".concat(t.toLowerCase())},(function(a){return o.a.createElement("option",{value:t,selected:e.provider===t},a)}))}))),o.a.createElement(f.a.Text,{className:"rounded-0"},o.a.createElement(b.a,{id:"view.user.edit.oauth.id"})),o.a.createElement(p.a,{className:"",value:e.externalUserId,onChange:function(e){var a=e.target.value;c.setState((function(e){return{newOAuthConnections:e.newOAuthConnections.map((function(e,r){return r!==t?e:F(F({},e),{},{externalUserId:a})}))}}))},disabled:!E}),o.a.createElement(f.a.Append,{className:""},o.a.createElement(u.a,{variant:"danger",className:"text-darker",hidden:!E,onClick:function(){c.setState((function(e){return{newOAuthConnections:e.newOAuthConnections.filter((function(e,a){return t!==a}))}}))}},o.a.createElement("div",null,o.a.createElement(i.a,{icon:n.faTrash}))))))}))),E?o.a.createElement("div",{className:"text-center mt-3"},o.a.createElement(u.a,{className:"mr-2",onClick:function(){c.setState((function(e){return{newOAuthConnections:[].concat(_(e.newOAuthConnections),[{provider:Object.keys(l)[0],externalUserId:""}])}}))}},o.a.createElement(b.a,{id:"view.user.edit.oauth.add"})),o.a.createElement(u.a,{onClick:h,variant:"success",disabled:this.state.newOAuthConnections.some((function(e){return 0===e.externalUserId.trim().length}))||this.state.newOAuthConnections.every((function(e,t){var a,r,n,i;return e.externalUserId===(null===(a=((null===(r=c.state.user)||void 0===r?void 0:r.oAuthConnections)||[])[t])||void 0===a?void 0:a.externalUserId)&&e.provider===(null===(n=((null===(i=c.state.user)||void 0===i?void 0:i.oAuthConnections)||[])[t])||void 0===n?void 0:n.provider)}))&&this.state.newOAuthConnections.length===(null===(r=this.state.user)||void 0===r||null===(s=r.oAuthConnections)||void 0===s?void 0:s.length)},o.a.createElement(b.a,{id:"generic.savepage"}))):"")}},{key:"renderGroups",value:function(){var e,t=this;return this.state.user&&this.state.groups?o.a.createElement("div",null,this.state.canRead?null:o.a.createElement(c.a,{className:"clearfix",variant:"error"},o.a.createElement(b.a,{id:"perms.group.cantlist"})),o.a.createElement("h3",{className:"mb-3"},o.a.createElement(b.a,{id:"perms.group.current"}),this.state.user.group?this.state.user.group.name:o.a.createElement(b.a,{id:"perms.group.none"})),o.a.createElement("div",{onChange:this.changeGroup},o.a.createElement(f.a,{className:"justify-content-center mb-3",as:"label",htmlFor:"group_none"},o.a.createElement(f.a.Prepend,null,o.a.createElement(f.a.Radio,{id:"group_none",name:"group",defaultChecked:void 0===(null===(e=this.state.user.group)||void 0===e?void 0:e.id),disabled:!this.state.canEdit})),o.a.createElement(f.a.Append,{className:"w-40 overflow-auto"},o.a.createElement(f.a.Text,{className:"flex-fill"},o.a.createElement(b.a,{id:"perms.group.none"})))),this.state.groups.map((function(e){var a,r,s,c;return o.a.createElement(f.a,{className:"justify-content-center mb-1",key:e.id},o.a.createElement(f.a.Prepend,null,o.a.createElement(f.a.Radio,{id:"group-"+e.id.toString(),name:"group",defaultChecked:(null===(a=t.state.user.group)||void 0===a?void 0:a.id)===e.id,disabled:!t.state.canEdit})),o.a.createElement(f.a.Append,{className:"w-40 overflow-auto"},o.a.createElement(f.a.Text,{className:"flex-fill",as:"label",htmlFor:"group-"+e.id.toString()},o.a.createElement("span",null,e.name),o.a.createElement("div",{className:"text-right ml-auto"},o.a.createElement(b.a,{id:"generic.numusers",values:{count:t.state.canRead?null===(r=e.users)||void 0===r?void 0:r.length:"???"}}))),o.a.createElement(h.a,{overlay:o.a.createElement(y.a,{id:"".concat(e.id,"-tooltip")},o.a.createElement(b.a,{id:"perms.group.delete.warning"})),show:!!(null!==(s=e.users)&&void 0!==s&&s.length&&t.state.canEdit||e.id===(null===(c=t.state.user.group)||void 0===c?void 0:c.id))&&void 0},(function(a){var r,s,c=a.ref,l=D(a,["ref"]);return o.a.createElement(u.a,T({variant:"danger",className:"text-darker",disabled:!(null===(r=e.users)||void 0===r||!r.length)||!t.state.canEdit||e.id===(null===(s=t.state.user.group)||void 0===s?void 0:s.id),onClick:function(){t.deleteGroup(e.id)}},l),o.a.createElement("div",{ref:c},o.a.createElement(i.a,{icon:n.faTrash})))}))))}))),o.a.createElement(f.a,{className:"justify-content-center mb-1 mt-5"},o.a.createElement(f.a.Prepend,null,o.a.createElement(u.a,{variant:"primary",onClick:this.createGroup,disabled:!this.state.canEdit||!this.state.createGroupName.length},o.a.createElement(i.a,{icon:r.faPlus}))),o.a.createElement(p.a,{className:"w-40 overflow-auto flex-grow-0",value:this.state.createGroupName,onChange:function(e){t.setState({createGroupName:e.target.value})},disabled:!this.state.canEdit}))):o.a.createElement(U.a,{error:new x.c(x.b.APP_FAIL,{jsError:Error("Assertion failed, user or group is null")})})}},{key:"changeGroup",value:(L=W((function*(e){if(this.state.user){this.setState({loading:!0});var t=e.target.id;if("group_none"===t){var a=yield C.a.editUser({id:this.state.user.id,permissionSet:Object(I.d)(this.state.user)});a.code===N.a.OK?(yield this.loadGroups(),this.loadUser(a.payload)):this.addError(a.error)}else{var r=parseInt(t.substr(6)),n=yield C.a.editUser({id:this.state.user.id,group:{id:r}});n.code===N.a.OK?(yield this.loadGroups(),this.loadUser(n.payload)):this.addError(n.error)}this.setState({loading:!1})}else this.addError(new x.c(x.b.APP_FAIL,{jsError:Error("this.state.user is null in changegroup")}))})),function(e){return L.apply(this,arguments)})},{key:"deleteGroup",value:(K=W((function*(e){this.setState({loading:!0});var t=yield k.a.deleteGroup(e);t.code===N.a.OK?this.setState((function(t){return{groups:t.groups.filter((function(t){return t.id!==e}))}})):this.addError(t.error),this.setState({loading:!1})})),function(e){return K.apply(this,arguments)})},{key:"createGroup",value:(w=W((function*(){this.setState({loading:!0});var e=yield k.a.createGroup(this.state.createGroupName,Object(I.d)(this.state.user));e.code===N.a.OK?this.setState((function(t){return{groups:t.groups.concat([e.payload])}})):this.addError(e.error),this.setState({loading:!1})})),function(){return w.apply(this,arguments)})},{key:"renderPerms",value:function(e,t){var a,r=this,n={},s=function(e,t,a){e.current&&t.current&&(e.current.checked!==a?t.current.classList.add("font-weight-bold"):t.current.classList.remove("font-weight-bold"))},l=function(t){return function(){for(var a=0,i=Object.entries(n);a<i.length;a++){var o=M(i[a],2),c=o[0],l=o[1];if(!l.input.current)return;l.input.current.checked=t,s(l.input,l.field,r.state[e][c].currentVal)}}},p=function(){var t=W((function*(){r.setState({saving:!0});for(var t=0,a=0,i=Object.entries(n);a<i.length;a++){var s=M(i[a],2),o=s[0],c=s[1];c.input.current&&(t+=c.input.current.checked?r.state[e][o].bitflag:0)}if(r.state.user){if(r.state.user.group){var l=Object.assign(Object.assign({},r.state.user.group.permissionSet),V({},"permsadmin"==e?"AdministrationRights":"InstanceManagerRights",t)),u=yield k.a.updateGroup({id:r.state.user.group.id,permissionSet:l});if(u.code==N.a.OK){var d=yield C.a.getUser(r.state.user.id);d.code==N.a.OK?r.loadUser(d.payload):r.addError(d.error)}else r.addError(u.error)}else{var m=Object.assign(Object.assign({},r.state.user.permissionSet),V({},"permsadmin"==e?"AdministrationRights":"InstanceManagerRights",t)),p=yield C.a.editUser({id:r.state.user.id,permissionSet:m});p.code==N.a.OK?r.loadUser(p.payload):r.addError(p.error)}r.setState({saving:!1})}else r.addError(new x.c(x.b.APP_FAIL,{jsError:Error("this.state.user is null in user edit save")}))}));return function(){return t.apply(this,arguments)}}();return o.a.createElement(o.a.Fragment,null,null!==(a=this.state.user)&&void 0!==a&&a.group?o.a.createElement(c.a,{variant:"warning"},o.a.createElement(b.a,{id:"perms.group.warning",values:{group:"".concat(this.state.user.group.name," (").concat(this.state.user.group.id,")")}})):null,this.state.canEdit?o.a.createElement(o.a.Fragment,null,o.a.createElement("h5",null,o.a.createElement(b.a,{id:"generic.setall"})),o.a.createElement(u.a,{onClick:l(!0)},o.a.createElement(b.a,{id:"generic.true"}))," ",o.a.createElement(u.a,{onClick:l(!1)},o.a.createElement(b.a,{id:"generic.false"}))," ",o.a.createElement(u.a,{onClick:function(){for(var t=0,a=Object.entries(n);t<a.length;t++){var i=M(a[t],2),o=i[0],c=i[1];c.input.current&&(c.input.current.checked=r.state[e][o].currentVal,s(c.input,c.field,r.state[e][o].currentVal))}}},o.a.createElement(b.a,{id:"generic.reset"}))):"",o.a.createElement(d.a,{md:8,lg:7,xl:6,className:"mx-auto"},o.a.createElement("hr",null),Object.entries(this.state[e]).map((function(e){var a=M(e,2),c=a[0],l=a[1],u=o.a.createRef(),d=o.a.createRef();return n[c]={input:u,field:d},o.a.createElement(f.a,{key:c,as:"label",htmlFor:c,className:"mb-0"},o.a.createElement(f.a.Prepend,{className:"flex-grow-1 overflow-auto"},o.a.createElement(h.a,{overlay:o.a.createElement(y.a,{id:"perms.".concat(t,".").concat(c,".desc")},o.a.createElement(b.a,{id:"perms.".concat(t,".").concat(c,".desc")}))},(function(e){var a=e.ref,n=D(e,["ref"]);return o.a.createElement(f.a.Text,{className:"flex-fill",ref:d},o.a.createElement("div",n,o.a.createElement(b.a,{id:"perms.".concat(t,".").concat(c)})),o.a.createElement("div",{className:"ml-auto d-flex align-items-center"},o.a.createElement(m.a.Check,{inline:!0,type:"switch",custom:!0,id:c,className:"d-flex justify-content-center align-content-center mx-2",label:"",ref:u,disabled:!r.state.canEdit,defaultChecked:l.currentVal,onChange:function(){s(u,d,l.currentVal)}}),o.a.createElement("div",T({},n,{ref:a}),o.a.createElement(i.a,{fixedWidth:!0,icon:"info"}))))}))))})),o.a.createElement("hr",null)),this.state.canEdit?o.a.createElement(u.a,{onClick:p},o.a.createElement(b.a,{id:"generic.savepage"})):"")}}])&&$(t.prototype,a),s&&$(t,s),Q}(o.a.Component))},713:function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));var r={}}}]);
//# sourceMappingURL=10.f398a31eb44cc9ba15ca.js.map