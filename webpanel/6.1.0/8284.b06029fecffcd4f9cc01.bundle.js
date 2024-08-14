"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[8284],{1723:function(e,n,t){t.d(n,{Ay:function(){return y},PU:function(){return v},gH:function(){return A}});var a=t(6188),r=t(6784),o=t(6540),i=t(5615),l=t(1208),u=t(5192),c=t(5038),s=t(3524),d=t(8065);function m(){return m=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var a in t)({}).hasOwnProperty.call(t,a)&&(e[a]=t[a])}return e},m.apply(null,arguments)}let v=function(e){return e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum",e}({});const f=o.forwardRef((function(e,n){return o.createElement(l.A.Control,{value:e.value,onChange:n=>e.onChange(n.target.value),disabled:e.disabled,ref:n})})),E=o.forwardRef((function(e,n){return o.createElement(l.A.Control,{value:e.value,onChange:n=>e.onChange(n.target.value),disabled:e.disabled,type:"password",ref:n})})),p=o.forwardRef((function(e,n){const t=Math.random().toString();return o.createElement("label",{htmlFor:t,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},o.createElement(l.A.Check,{id:t,checked:e.value,onChange:n=>e.onChange(n.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:n}))})),b=o.forwardRef((function(e,n){return o.createElement(l.A.Control,{value:e.value,onChange:n=>e.onChange(isNaN(n.target.valueAsNumber)?n.target.value:n.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:n})})),g=o.forwardRef((function(e,n){return o.createElement(l.A.Control,{value:e.value,onChange:n=>e.onChange(parseInt(n.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:n},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([n,t])=>e.noLocalize?o.createElement("option",{key:t,value:t},n):o.createElement(d.A,{id:`${e.name}.${n}`,key:n},(e=>o.createElement("option",{key:t,value:t},e))))))})),A={[v.Enum]:0,[v.Number]:0,[v.Boolean]:!1,[v.String]:"",[v.Password]:""};function y(e){const[n,t]=(0,o.useState)(e.defaultValue??A[e.type]),l=(0,o.useRef)(null);(0,o.useEffect)((()=>{t(e.defaultValue??A[e.type])}),[e.defaultValue]),(0,o.useEffect)((()=>{switch(l.current&&(l.current.checkValidity()?l.current.classList.remove("is-invalid"):l.current.classList.add("is-invalid")),e.type){case v.Boolean:case v.Enum:case v.Number:case v.String:case v.Password:return void e.onChange(n,l.current?.checkValidity()??!0)}}),[n]);const y={string:f,password:E,boolean:p,[v.Number]:void 0,[v.Enum]:void 0},h=n!=(e.defaultValue??A[e.type]);return o.createElement(u.A,null,o.createElement(c.A,{overlay:(x=e.tooltip,x?o.createElement(s.A,{id:x},o.createElement(d.A,{id:x})):o.createElement(o.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:n,...t})=>o.createElement(u.A.Prepend,{className:"w-50 w-xl-40"},o.createElement(u.A.Text,m({className:"flex-grow-1"},t),o.createElement("span",{className:h?"font-weight-bold":""},o.createElement(d.A,{id:e.name})),o.createElement("div",{className:"ml-auto"},e.disabled?o.createElement(d.A,{id:"generic.readonly"}):null,o.createElement("div",{ref:n,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},o.createElement(r.g,{icon:a.ktq}))))))),e.type===v.Number?o.createElement(b,{value:n,onChange:e=>t(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:l}):e.type===v.Enum?o.createElement(g,{value:n,onChange:e=>t(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):o.createElement(y[e.type],{value:n,onChange:e=>t(e),disabled:e.disabled,name:e.type,ref:l}),o.createElement(u.A.Append,null,o.createElement(i.A,{style:{visibility:!h||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>t(e.defaultValue??A[e.type])},o.createElement(r.g,{icon:"undo"}))));var x}},6795:function(e,n,t){t.d(n,{Q:function(){return u}});var a=t(6540),r=t(8785),o=t.n(r),i=t(8437);function l(e){return a.createElement(o(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function u(e){return i.Ay.showjson.value?a.createElement("div",{className:"text-left"},a.createElement(l,{obj:e.obj})):a.createElement(a.Fragment,null)}},7621:function(e,n,t){t.d(n,{z:function(){return a}});const a=t(6540).createContext(void 0)},5192:function(e,n,t){var a=t(8587),r=t(8168),o=t(2485),i=t.n(o),l=t(6540),u=t(6261),c=t(6519),s=["bsPrefix","size","hasValidation","className","as"],d=(0,u.A)("input-group-append"),m=(0,u.A)("input-group-prepend"),v=(0,u.A)("input-group-text",{Component:"span"}),f=l.forwardRef((function(e,n){var t=e.bsPrefix,o=e.size,u=e.hasValidation,d=e.className,m=e.as,v=void 0===m?"div":m,f=(0,a.A)(e,s);return t=(0,c.oU)(t,"input-group"),l.createElement(v,(0,r.A)({ref:n},f,{className:i()(d,t,o&&t+"-"+o,u&&"has-validation")}))}));f.displayName="InputGroup",f.Text=v,f.Radio=function(e){return l.createElement(v,null,l.createElement("input",(0,r.A)({type:"radio"},e)))},f.Checkbox=function(e){return l.createElement(v,null,l.createElement("input",(0,r.A)({type:"checkbox"},e)))},f.Append=d,f.Prepend=m,n.A=f},1008:function(e,n,t){var a=t(5540),r=t(6540),o=t(9425),i=t(7867),l=t(2014),u=function(e){function n(){return e.apply(this,arguments)||this}return(0,a.A)(n,e),n.prototype.render=function(){throw new Error("ReactBootstrap: The `Tab` component is not meant to be rendered! It's an abstract component that is only valid as a direct Child of the `Tabs` Component. For custom tabs components use TabPane and TabsContainer directly")},n}(r.Component);u.Container=o.A,u.Content=i.A,u.Pane=l.A,n.A=u},9425:function(e,n,t){var a=t(6540),r=t(1558),o=t(4629),i=t(5724);n.A=function(e){var n=(0,r.Zw)(e,{activeKey:"onSelect"}),t=n.id,l=n.generateChildId,u=n.onSelect,c=n.activeKey,s=n.transition,d=n.mountOnEnter,m=n.unmountOnExit,v=n.children,f=(0,a.useMemo)((function(){return l||function(e,n){return t?t+"-"+n+"-"+e:null}}),[t,l]),E=(0,a.useMemo)((function(){return{onSelect:u,activeKey:c,transition:s,mountOnEnter:d||!1,unmountOnExit:m||!1,getControlledId:function(e){return f(e,"tabpane")},getControllerId:function(e){return f(e,"tab")}}}),[u,c,s,d,m,f]);return a.createElement(o.A.Provider,{value:E},a.createElement(i.A.Provider,{value:u||null},v))}},7867:function(e,n,t){var a=t(8168),r=t(8587),o=t(2485),i=t.n(o),l=t(6540),u=t(6519),c=["bsPrefix","as","className"],s=l.forwardRef((function(e,n){var t=e.bsPrefix,o=e.as,s=void 0===o?"div":o,d=e.className,m=(0,r.A)(e,c),v=(0,u.oU)(t,"tab-content");return l.createElement(s,(0,a.A)({ref:n},m,{className:i()(d,v)}))}));n.A=s},2014:function(e,n,t){var a=t(8168),r=t(8587),o=t(2485),i=t.n(o),l=t(6540),u=t(6519),c=t(4629),s=t(5724),d=t(7285),m=["activeKey","getControlledId","getControllerId"],v=["bsPrefix","className","active","onEnter","onEntering","onEntered","onExit","onExiting","onExited","mountOnEnter","unmountOnExit","transition","as","eventKey"];var f=l.forwardRef((function(e,n){var t=function(e){var n=(0,l.useContext)(c.A);if(!n)return e;var t=n.activeKey,o=n.getControlledId,i=n.getControllerId,u=(0,r.A)(n,m),v=!1!==e.transition&&!1!==u.transition,f=(0,s.u)(e.eventKey);return(0,a.A)({},e,{active:null==e.active&&null!=f?(0,s.u)(t)===f:e.active,id:o(e.eventKey),"aria-labelledby":i(e.eventKey),transition:v&&(e.transition||u.transition||d.A),mountOnEnter:null!=e.mountOnEnter?e.mountOnEnter:u.mountOnEnter,unmountOnExit:null!=e.unmountOnExit?e.unmountOnExit:u.unmountOnExit})}(e),o=t.bsPrefix,f=t.className,E=t.active,p=t.onEnter,b=t.onEntering,g=t.onEntered,A=t.onExit,y=t.onExiting,h=t.onExited,x=t.mountOnEnter,C=t.unmountOnExit,N=t.transition,O=t.as,w=void 0===O?"div":O,P=(t.eventKey,(0,r.A)(t,v)),k=(0,u.oU)(o,"tab-pane");if(!E&&!N&&C)return null;var K=l.createElement(w,(0,a.A)({},P,{ref:n,role:"tabpanel","aria-hidden":!E,className:i()(f,k,{active:E})}));return N&&(K=l.createElement(N,{in:E,onEnter:p,onEntering:b,onEntered:g,onExit:A,onExiting:y,onExited:h,mountOnEnter:x,unmountOnExit:C},K)),l.createElement(c.A.Provider,{value:null},l.createElement(s.A.Provider,{value:null},K))}));f.displayName="TabPane",n.A=f},1948:function(e,n,t){var a=t(8168),r=t(8587),o=t(6540),i=(t(8239),t(1558)),l=t(6867),u=t(494),c=t(4501),s=t(9425),d=t(7867),m=t(2014),v=t(9528),f=["id","onSelect","transition","mountOnEnter","unmountOnExit","children","activeKey"];function E(e){var n=e.props,t=n.title,a=n.eventKey,r=n.disabled,i=n.tabClassName,l=n.id;return null==t?null:o.createElement(c.A,{as:u.A,eventKey:a,disabled:r,id:l,className:i},t)}var p=function(e){var n=(0,i.Zw)(e,{activeKey:"onSelect"}),t=n.id,u=n.onSelect,c=n.transition,p=n.mountOnEnter,b=n.unmountOnExit,g=n.children,A=n.activeKey,y=void 0===A?function(e){var n;return(0,v.j)(e,(function(e){null==n&&(n=e.props.eventKey)})),n}(g):A,h=(0,r.A)(n,f);return o.createElement(s.A,{id:t,activeKey:y,onSelect:u,transition:c,mountOnEnter:p,unmountOnExit:b},o.createElement(l.A,(0,a.A)({},h,{role:"tablist",as:"nav"}),(0,v.T)(g,E)),o.createElement(d.A,null,(0,v.T)(g,(function(e){var n=(0,a.A)({},e.props);return delete n.title,delete n.disabled,delete n.tabClassName,o.createElement(m.A,n)}))))};p.defaultProps={variant:"tabs",mountOnEnter:!1,unmountOnExit:!1},p.displayName="Tabs",n.A=p}}]);
//# sourceMappingURL=8284.b06029fecffcd4f9cc01.bundle.js.map