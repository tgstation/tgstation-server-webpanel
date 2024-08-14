"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[5727],{1723:function(e,t,n){n.d(t,{Ay:function(){return h},PU:function(){return f},gH:function(){return y}});var a=n(6188),r=n(6784),l=n(6540),i=n(5615),o=n(1208),c=n(5192),s=n(5038),u=n(3524),d=n(8065);function m(){return m=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)({}).hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},m.apply(null,arguments)}let f=function(e){return e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum",e}({});const p=l.forwardRef((function(e,t){return l.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),v=l.forwardRef((function(e,t){return l.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),g=l.forwardRef((function(e,t){const n=Math.random().toString();return l.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},l.createElement(o.A.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),b=l.forwardRef((function(e,t){return l.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),E=l.forwardRef((function(e,t){return l.createElement(o.A.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?l.createElement("option",{key:n,value:n},t):l.createElement(d.A,{id:`${e.name}.${t}`,key:t},(e=>l.createElement("option",{key:n,value:n},e))))))})),y={[f.Enum]:0,[f.Number]:0,[f.Boolean]:!1,[f.String]:"",[f.Password]:""};function h(e){const[t,n]=(0,l.useState)(e.defaultValue??y[e.type]),o=(0,l.useRef)(null);(0,l.useEffect)((()=>{n(e.defaultValue??y[e.type])}),[e.defaultValue]),(0,l.useEffect)((()=>{switch(o.current&&(o.current.checkValidity()?o.current.classList.remove("is-invalid"):o.current.classList.add("is-invalid")),e.type){case f.Boolean:case f.Enum:case f.Number:case f.String:case f.Password:return void e.onChange(t,o.current?.checkValidity()??!0)}}),[t]);const h={string:p,password:v,boolean:g,[f.Number]:void 0,[f.Enum]:void 0},A=t!=(e.defaultValue??y[e.type]);return l.createElement(c.A,null,l.createElement(s.A,{overlay:(w=e.tooltip,w?l.createElement(u.A,{id:w},l.createElement(d.A,{id:w})):l.createElement(l.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>l.createElement(c.A.Prepend,{className:"w-50 w-xl-40"},l.createElement(c.A.Text,m({className:"flex-grow-1"},n),l.createElement("span",{className:A?"font-weight-bold":""},l.createElement(d.A,{id:e.name})),l.createElement("div",{className:"ml-auto"},e.disabled?l.createElement(d.A,{id:"generic.readonly"}):null,l.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},l.createElement(r.g,{icon:a.ktq}))))))),e.type===f.Number?l.createElement(b,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:o}):e.type===f.Enum?l.createElement(E,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):l.createElement(h[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:o}),l.createElement(c.A.Append,null,l.createElement(i.A,{style:{visibility:!A||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>n(e.defaultValue??y[e.type])},l.createElement(r.g,{icon:"undo"}))));var w}},6113:function(e,t,n){n.d(t,{A:function(){return u}});var a=n(6540),r=n(5615),l=n(5038),i=n(3524),o=n(8065),c=n(1723);function s(){return s=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)({}).hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},s.apply(null,arguments)}function u(e){const t=new Map,n=new Map,[u,d]=(0,a.useState)({});(0,a.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{d((t=>({...t,[e]:{}})))}))}),[]);for(const[r,l]of Object.entries(e.fields))n.set(r,l),t.set(l,(0,a.useState)(l.defaultValue??c.gH[l.type]));let m=!1,f=!1;for(const[e,a]of n){const[n]=t.get(a),r=u[e];if((a.defaultValue??c.gH[a.type])!=n&&(m=!0),r?.invalid&&(f=!0),m&&f)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?a.createElement(a.Fragment,null):a.createElement("div",null,Object.entries(e.fields).map((([n,r])=>{const{disabled:l,...i}=r;return e.hideDisabled&&l?null:a.createElement(c.Ay,s({key:n},i,{disabled:e.readOnly||l,onChange:(e,a)=>{t.get(r)[1](e),d((e=>({...e,[n]:{...e[n],invalid:!a}})))}}))})),a.createElement("div",{className:"text-center mt-2"},a.createElement(l.A,{overlay:a.createElement(i.A,{id:"form-invalid"},a.createElement(o.A,{id:"generic.invalid_form"})),show:!!f&&void 0},a.createElement(r.A,{variant:e.readOnly||f?"danger":"success",disabled:e.readOnly||!m||f,onClick:()=>{const a={};for(const[r,l]of n){const[n]=t.get(l);(l.alwaysInclude||n!=(l.defaultValue??c.gH[l.type])||e.includeAll)&&(a[r]=n)}e.onSave(a)}},a.createElement(o.A,{id:e.saveMessageId??"generic.save"})))))}},6795:function(e,t,n){n.d(t,{Q:function(){return c}});var a=n(6540),r=n(8785),l=n.n(r),i=n(8437);function o(e){return a.createElement(l(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function c(e){return i.Ay.showjson.value?a.createElement("div",{className:"text-left"},a.createElement(o,{obj:e.obj})):a.createElement(a.Fragment,null)}},7621:function(e,t,n){n.d(t,{z:function(){return a}});const a=n(6540).createContext(void 0)},5192:function(e,t,n){var a=n(8587),r=n(8168),l=n(2485),i=n.n(l),o=n(6540),c=n(6261),s=n(6519),u=["bsPrefix","size","hasValidation","className","as"],d=(0,c.A)("input-group-append"),m=(0,c.A)("input-group-prepend"),f=(0,c.A)("input-group-text",{Component:"span"}),p=o.forwardRef((function(e,t){var n=e.bsPrefix,l=e.size,c=e.hasValidation,d=e.className,m=e.as,f=void 0===m?"div":m,p=(0,a.A)(e,u);return n=(0,s.oU)(n,"input-group"),o.createElement(f,(0,r.A)({ref:t},p,{className:i()(d,n,l&&n+"-"+l,c&&"has-validation")}))}));p.displayName="InputGroup",p.Text=f,p.Radio=function(e){return o.createElement(f,null,o.createElement("input",(0,r.A)({type:"radio"},e)))},p.Checkbox=function(e){return o.createElement(f,null,o.createElement("input",(0,r.A)({type:"checkbox"},e)))},p.Append=d,p.Prepend=m,t.A=p}}]);
//# sourceMappingURL=5727.a4698f417f8d45bc00ce.bundle.js.map