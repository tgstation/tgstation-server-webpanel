"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[318,939],{9049:function(e,t,n){n.d(t,{fS:function(){return f},Pg:function(){return h},ZP:function(){return y}});var a=n(1436),r=n(7814),l=n(7294),i=n(5005),o=n(2258),c=n(2318),s=n(5293),u=n(3489),d=n(4012);function m(){return m=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},m.apply(this,arguments)}let f;!function(e){e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum"}(f||(f={}));const p=l.forwardRef((function(e,t){return l.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),v=l.forwardRef((function(e,t){return l.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),b=l.forwardRef((function(e,t){const n=Math.random().toString();return l.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},l.createElement(o.Z.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),g=l.forwardRef((function(e,t){return l.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),E=l.forwardRef((function(e,t){return l.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?l.createElement("option",{key:n,value:n},t):l.createElement(d.Z,{id:`${e.name}.${t}`,key:t},(e=>l.createElement("option",{key:n,value:n},e))))))})),h={[f.Enum]:0,[f.Number]:0,[f.Boolean]:!1,[f.String]:"",[f.Password]:""};function y(e){const[t,n]=(0,l.useState)(e.defaultValue??h[e.type]),o=(0,l.useRef)(null);(0,l.useEffect)((()=>{n(e.defaultValue??h[e.type])}),[e.defaultValue]),(0,l.useEffect)((()=>{switch(o.current&&(o.current.checkValidity()?o.current.classList.remove("is-invalid"):o.current.classList.add("is-invalid")),e.type){case f.Boolean:case f.Enum:case f.Number:case f.String:case f.Password:return void e.onChange(t,o.current?.checkValidity()??!0)}}),[t]);const y={string:p,password:v,boolean:b,[f.Number]:void 0,[f.Enum]:void 0},Z=t!=(e.defaultValue??h[e.type]);return l.createElement(c.Z,null,l.createElement(s.Z,{overlay:(w=e.tooltip,w?l.createElement(u.Z,{id:w},l.createElement(d.Z,{id:w})):l.createElement(l.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>l.createElement(c.Z.Prepend,{className:"w-50 w-xl-40"},l.createElement(c.Z.Text,m({className:"flex-grow-1"},n),l.createElement("span",{className:Z?"font-weight-bold":""},l.createElement(d.Z,{id:e.name})),l.createElement("div",{className:"ml-auto"},e.disabled?l.createElement(d.Z,{id:"generic.readonly"}):null,l.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},l.createElement(r.G,{icon:a.YHc}))))))),e.type===f.Number?l.createElement(g,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:o}):e.type===f.Enum?l.createElement(E,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):l.createElement(y[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:o}),l.createElement(c.Z.Append,null,l.createElement(i.Z,{style:{visibility:!Z||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>n(e.defaultValue??h[e.type])},l.createElement(r.G,{icon:"undo"}))));var w}},5619:function(e,t,n){n.d(t,{Z:function(){return u}});var a=n(7294),r=n(5005),l=n(5293),i=n(3489),o=n(4012),c=n(9049);function s(){return s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},s.apply(this,arguments)}function u(e){const t=new Map,n=new Map,[u,d]=(0,a.useState)({});(0,a.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{d((t=>({...t,[e]:{}})))}))}),[]);for(const[r,l]of Object.entries(e.fields))n.set(r,l),t.set(l,(0,a.useState)(l.defaultValue??c.Pg[l.type]));let m=!1,f=!1;for(const[e,a]of n){const[n]=t.get(a),r=u[e];if((a.defaultValue??c.Pg[a.type])!=n&&(m=!0),r?.invalid&&(f=!0),m&&f)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?a.createElement(a.Fragment,null):a.createElement("div",null,Object.entries(e.fields).map((([n,r])=>{const{disabled:l,...i}=r;return e.hideDisabled&&l?null:a.createElement(c.ZP,s({key:n},i,{disabled:e.readOnly||l,onChange:(e,a)=>{t.get(r)[1](e),d((e=>({...e,[n]:{...e[n],invalid:!a}})))}}))})),a.createElement("div",{className:"text-center mt-2"},a.createElement(l.Z,{overlay:a.createElement(i.Z,{id:"form-invalid"},a.createElement(o.Z,{id:"generic.invalid_form"})),show:!!f&&void 0},a.createElement(r.Z,{variant:e.readOnly||f?"danger":"success",disabled:e.readOnly||!m||f,onClick:()=>{const a={};for(const[r,l]of n){const[n]=t.get(l);(l.alwaysInclude||n!=(l.defaultValue??c.Pg[l.type])||e.includeAll)&&(a[r]=n)}e.onSave(a)}},a.createElement(o.Z,{id:e.saveMessageId??"generic.save"})))))}},8425:function(e,t,n){n.d(t,{t:function(){return c}});var a=n(7294),r=n(5171),l=n.n(r),i=n(7961);function o(e){return a.createElement(l(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function c(e){return i.ZP.showjson.value?a.createElement("div",{className:"text-left"},a.createElement(o,{obj:e.obj})):a.createElement(a.Fragment,null)}},6190:function(e,t,n){n.d(t,{g:function(){return a}});const a=n(7294).createContext(void 0)},2318:function(e,t,n){var a=n(3366),r=n(7462),l=n(4184),i=n.n(l),o=n(7294),c=n(4680),s=n(6792),u=["bsPrefix","size","hasValidation","className","as"],d=(0,c.Z)("input-group-append"),m=(0,c.Z)("input-group-prepend"),f=(0,c.Z)("input-group-text",{Component:"span"}),p=o.forwardRef((function(e,t){var n=e.bsPrefix,l=e.size,c=e.hasValidation,d=e.className,m=e.as,f=void 0===m?"div":m,p=(0,a.Z)(e,u);return n=(0,s.vE)(n,"input-group"),o.createElement(f,(0,r.Z)({ref:t},p,{className:i()(d,n,l&&n+"-"+l,c&&"has-validation")}))}));p.displayName="InputGroup",p.Text=f,p.Radio=function(e){return o.createElement(f,null,o.createElement("input",(0,r.Z)({type:"radio"},e)))},p.Checkbox=function(e){return o.createElement(f,null,o.createElement("input",(0,r.Z)({type:"checkbox"},e)))},p.Append=d,p.Prepend=m,t.Z=p}}]);
//# sourceMappingURL=318.22a26d5c32f16255207a.bundle.js.map