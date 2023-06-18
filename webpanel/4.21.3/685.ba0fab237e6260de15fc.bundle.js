"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[685,318,939],{9049:function(e,t,n){n.d(t,{Pg:function(){return E},ZP:function(){return y},fS:function(){return f}});var a=n(1436),r=n(7814),i=n(7294),l=n(5005),o=n(2258),s=n(2318),c=n(5293),d=n(3489),u=n(4012);function m(){return m=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},m.apply(this,arguments)}let f;!function(e){e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum"}(f||(f={}));const p=i.forwardRef((function(e,t){return i.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),h=i.forwardRef((function(e,t){return i.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),v=i.forwardRef((function(e,t){const n=Math.random().toString();return i.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},i.createElement(o.Z.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),g=i.forwardRef((function(e,t){return i.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),b=i.forwardRef((function(e,t){return i.createElement(o.Z.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?i.createElement("option",{key:n,value:n},t):i.createElement(u.Z,{id:`${e.name}.${t}`,key:t},(e=>i.createElement("option",{key:n,value:n},e))))))})),E={[f.Enum]:0,[f.Number]:0,[f.Boolean]:!1,[f.String]:"",[f.Password]:""};function y(e){const[t,n]=(0,i.useState)(e.defaultValue??E[e.type]),o=(0,i.useRef)(null);(0,i.useEffect)((()=>{n(e.defaultValue??E[e.type])}),[e.defaultValue]),(0,i.useEffect)((()=>{switch(o.current&&(o.current.checkValidity()?o.current.classList.remove("is-invalid"):o.current.classList.add("is-invalid")),e.type){case f.Boolean:case f.Enum:case f.Number:case f.String:case f.Password:return void e.onChange(t,o.current?.checkValidity()??!0)}}),[t]);const y={string:p,password:h,boolean:v,[f.Number]:void 0,[f.Enum]:void 0},Z=t!=(e.defaultValue??E[e.type]);return i.createElement(s.Z,null,i.createElement(c.Z,{overlay:(w=e.tooltip,w?i.createElement(d.Z,{id:w},i.createElement(u.Z,{id:w})):i.createElement(i.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>i.createElement(s.Z.Prepend,{className:"w-50 w-xl-40"},i.createElement(s.Z.Text,m({className:"flex-grow-1"},n),i.createElement("span",{className:Z?"font-weight-bold":""},i.createElement(u.Z,{id:e.name})),i.createElement("div",{className:"ml-auto"},e.disabled?i.createElement(u.Z,{id:"generic.readonly"}):null,i.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},i.createElement(r.G,{icon:a.YHc}))))))),e.type===f.Number?i.createElement(g,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:o}):e.type===f.Enum?i.createElement(b,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):i.createElement(y[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:o}),i.createElement(s.Z.Append,null,i.createElement(l.Z,{style:{visibility:!Z||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>n(e.defaultValue??E[e.type])},i.createElement(r.G,{icon:"undo"}))));var w}},5619:function(e,t,n){n.d(t,{Z:function(){return d}});var a=n(7294),r=n(5005),i=n(5293),l=n(3489),o=n(4012),s=n(9049);function c(){return c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},c.apply(this,arguments)}function d(e){const t=new Map,n=new Map,[d,u]=(0,a.useState)({});(0,a.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{u((t=>({...t,[e]:{}})))}))}),[]);for(const[r,i]of Object.entries(e.fields))n.set(r,i),t.set(i,(0,a.useState)(i.defaultValue??s.Pg[i.type]));let m=!1,f=!1;for(const[e,a]of n){const[n]=t.get(a),r=d[e];if((a.defaultValue??s.Pg[a.type])!=n&&(m=!0),r?.invalid&&(f=!0),m&&f)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?a.createElement(a.Fragment,null):a.createElement("div",null,Object.entries(e.fields).map((([n,r])=>{const{disabled:i,...l}=r;return e.hideDisabled&&i?null:a.createElement(s.ZP,c({key:n},l,{disabled:e.readOnly||i,onChange:(e,a)=>{t.get(r)[1](e),u((e=>({...e,[n]:{...e[n],invalid:!a}})))}}))})),a.createElement("div",{className:"text-center mt-2"},a.createElement(i.Z,{overlay:a.createElement(l.Z,{id:"form-invalid"},a.createElement(o.Z,{id:"generic.invalid_form"})),show:!!f&&void 0},a.createElement(r.Z,{variant:e.readOnly||f?"danger":"success",disabled:e.readOnly||!m||f,onClick:()=>{const a={};for(const[r,i]of n){const[n]=t.get(i);(i.alwaysInclude||n!=(i.defaultValue??s.Pg[i.type])||e.includeAll)&&(a[r]=n)}e.onSave(a)}},a.createElement(o.Z,{id:e.saveMessageId??"generic.save"})))))}},8425:function(e,t,n){n.d(t,{t:function(){return s}});var a=n(7294),r=n(5171),i=n.n(r),l=n(7961);function o(e){return a.createElement(i(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function s(e){return l.ZP.showjson.value?a.createElement("div",{className:"text-left"},a.createElement(o,{obj:e.obj})):a.createElement(a.Fragment,null)}},2685:function(e,t,n){n.r(t);var a=n(7294),r=n(4012),i=n(5977),l=n(8509),o=n(6352),s=n(3803),c=n(9521),d=n(6190),u=n(6964),m=n(3e3),f=n(9049),p=n(5619),h=n(8425),v=n(5855);class g extends a.Component{constructor(e){super(e),this.editInstance=this.editInstance.bind(this),this.state={errors:[],moving:!1}}addError(e){this.setState((t=>{const n=Array.from(t.errors);return n.push(e),{errors:n}}))}async editInstance(e){const t=this.context.instance.id;let n;e.path&&e.path!=this.context.instance.path&&(n=e.path,e.path=null,e.online=!1,this.setState({moving:!0}));const a=await o.Z.editInstance({...e,id:t});if(a.code!==s.G.OK)return this.addError(a.error),void this.setState({moving:!1});if(n){const e=await o.Z.editInstance({id:this.context.instance.id,path:n});if(e.code!==s.G.OK)return this.addError(e.error),this.setState({moving:!1}),void await this.context.reloadInstance();let a;do{if(await new Promise((e=>setTimeout(e,1e3))),a=await o.Z.getInstance(t),a.code!==s.G.OK)return this.addError(a.error),this.setState({moving:!1}),void await this.context.reloadInstance()}while(a.payload.moveJob);const r=await o.Z.editInstance({online:!0,id:t});r.code!==s.G.OK?(this.addError(r.error),this.setState({moving:!1})):c.Z.registerJob(e.payload.moveJob,t)}await this.context.reloadInstance()}render(){const e=e=>(0,u.D0)((0,u.Zg)(this.context.user),e),t={name:{name:"fields.instance.name",type:f.fS.String,defaultValue:this.context.instance.name,disabled:!e(l.c2.Rename)},path:{name:"fields.instance.path",type:f.fS.String,defaultValue:this.context.instance.path,disabled:!e(l.c2.Relocate)},chatBotLimit:{name:"fields.instance.chatbotlimit",type:f.fS.Number,min:0,defaultValue:this.context.instance.chatBotLimit,disabled:!e(l.c2.SetChatBotLimit)},autoUpdateInterval:{name:"fields.instance.autoupdate",type:f.fS.Number,min:0,defaultValue:this.context.instance.autoUpdateInterval,disabled:!e(l.c2.SetAutoUpdate)},configurationType:{name:"fields.instance.filemode",type:f.fS.Enum,enum:l.c7,defaultValue:this.context.instance.configurationType,disabled:!e(l.c2.SetConfiguration)}};return a.createElement("div",{className:"text-center"},a.createElement("h1",null,a.createElement(r.Z,{id:"view.instance.info"})),a.createElement(h.t,{obj:this.context}),this.state.errors.map(((e,t)=>{if(e)return a.createElement(m.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const n=Array.from(e.errors);return n[t]=void 0,{errors:n}}))})})),this.state.moving?a.createElement(v.Z,{text:"loading.instance.move"}):a.createElement(p.Z,{fields:t,onSave:this.editInstance}))}}g.contextType=d.g,t.default=(0,i.EN)(g)},6190:function(e,t,n){n.d(t,{g:function(){return a}});const a=n(7294).createContext(void 0)},2318:function(e,t,n){var a=n(3366),r=n(7462),i=n(4184),l=n.n(i),o=n(7294),s=n(4680),c=n(6792),d=["bsPrefix","size","hasValidation","className","as"],u=(0,s.Z)("input-group-append"),m=(0,s.Z)("input-group-prepend"),f=(0,s.Z)("input-group-text",{Component:"span"}),p=o.forwardRef((function(e,t){var n=e.bsPrefix,i=e.size,s=e.hasValidation,u=e.className,m=e.as,f=void 0===m?"div":m,p=(0,a.Z)(e,d);return n=(0,c.vE)(n,"input-group"),o.createElement(f,(0,r.Z)({ref:t},p,{className:l()(u,n,i&&n+"-"+i,s&&"has-validation")}))}));p.displayName="InputGroup",p.Text=f,p.Radio=function(e){return o.createElement(f,null,o.createElement("input",(0,r.Z)({type:"radio"},e)))},p.Checkbox=function(e){return o.createElement(f,null,o.createElement("input",(0,r.Z)({type:"checkbox"},e)))},p.Append=u,p.Prepend=m,t.Z=p}}]);
//# sourceMappingURL=685.ba0fab237e6260de15fc.bundle.js.map