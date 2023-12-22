"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[608,318,939],{79049:function(e,t,n){n.d(t,{Pg:function(){return b},ZP:function(){return v},fS:function(){return m}});var i=n(51436),a=n(67814),r=n(67294),o=n(35005),s=n(32258),l=n(62318),c=n(15293),f=n(43489),u=n(44012);function d(){return d=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},d.apply(this,arguments)}let m;!function(e){e.Boolean="boolean",e.Number="number",e.String="string",e.Password="password",e.Enum="enum"}(m||(m={}));const g=r.forwardRef((function(e,t){return r.createElement(s.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),p=r.forwardRef((function(e,t){return r.createElement(s.Z.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),y=r.forwardRef((function(e,t){const n=Math.random().toString();return r.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},r.createElement(s.Z.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),A=r.forwardRef((function(e,t){return r.createElement(s.Z.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),h=r.forwardRef((function(e,t){return r.createElement(s.Z.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?r.createElement("option",{key:n,value:n},t):r.createElement(u.Z,{id:`${e.name}.${t}`,key:t},(e=>r.createElement("option",{key:n,value:n},e))))))})),b={[m.Enum]:0,[m.Number]:0,[m.Boolean]:!1,[m.String]:"",[m.Password]:""};function v(e){const[t,n]=(0,r.useState)(e.defaultValue??b[e.type]),s=(0,r.useRef)(null);(0,r.useEffect)((()=>{n(e.defaultValue??b[e.type])}),[e.defaultValue]),(0,r.useEffect)((()=>{switch(s.current&&(s.current.checkValidity()?s.current.classList.remove("is-invalid"):s.current.classList.add("is-invalid")),e.type){case m.Boolean:case m.Enum:case m.Number:case m.String:case m.Password:return void e.onChange(t,s.current?.checkValidity()??!0)}}),[t]);const v={string:g,password:p,boolean:y,[m.Number]:void 0,[m.Enum]:void 0},E=t!=(e.defaultValue??b[e.type]);return r.createElement(l.Z,null,r.createElement(c.Z,{overlay:(w=e.tooltip,w?r.createElement(f.Z,{id:w},r.createElement(u.Z,{id:w})):r.createElement(r.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>r.createElement(l.Z.Prepend,{className:"w-50 w-xl-40"},r.createElement(l.Z.Text,d({className:"flex-grow-1"},n),r.createElement("span",{className:E?"font-weight-bold":""},r.createElement(u.Z,{id:e.name})),r.createElement("div",{className:"ml-auto"},e.disabled?r.createElement(u.Z,{id:"generic.readonly"}):null,r.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},r.createElement(a.G,{icon:i.YHc}))))))),e.type===m.Number?r.createElement(A,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:s}):e.type===m.Enum?r.createElement(h,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):r.createElement(v[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:s}),r.createElement(l.Z.Append,null,r.createElement(o.Z,{style:{visibility:!E||e.disabled?"hidden":void 0},variant:"danger",onClick:()=>n(e.defaultValue??b[e.type])},r.createElement(a.G,{icon:"undo"}))));var w}},35619:function(e,t,n){n.d(t,{Z:function(){return f}});var i=n(67294),a=n(35005),r=n(15293),o=n(43489),s=n(44012),l=n(79049);function c(){return c=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&(e[i]=n[i])}return e},c.apply(this,arguments)}function f(e){const t=new Map,n=new Map,[f,u]=(0,i.useState)({});(0,i.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{u((t=>({...t,[e]:{}})))}))}),[]);for(const[a,r]of Object.entries(e.fields))n.set(a,r),t.set(r,(0,i.useState)(r.defaultValue??l.Pg[r.type]));let d=!1,m=!1;for(const[e,i]of n){const[n]=t.get(i),a=f[e];if((i.defaultValue??l.Pg[i.type])!=n&&(d=!0),a?.invalid&&(m=!0),d&&m)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?i.createElement(i.Fragment,null):i.createElement("div",null,Object.entries(e.fields).map((([n,a])=>{const{disabled:r,...o}=a;return e.hideDisabled&&r?null:i.createElement(l.ZP,c({key:n},o,{disabled:e.readOnly||r,onChange:(e,i)=>{t.get(a)[1](e),u((e=>({...e,[n]:{...e[n],invalid:!i}})))}}))})),i.createElement("div",{className:"text-center mt-2"},i.createElement(r.Z,{overlay:i.createElement(o.Z,{id:"form-invalid"},i.createElement(s.Z,{id:"generic.invalid_form"})),show:!!m&&void 0},i.createElement(a.Z,{variant:e.readOnly||m?"danger":"success",disabled:e.readOnly||!d||m,onClick:()=>{const i={};for(const[a,r]of n){const[n]=t.get(r);(r.alwaysInclude||n!=(r.defaultValue??l.Pg[r.type])||e.includeAll)&&(i[a]=n)}e.onSave(i)}},i.createElement(s.Z,{id:e.saveMessageId??"generic.save"})))))}},8425:function(e,t,n){n.d(t,{t:function(){return l}});var i=n(67294),a=n(55171),r=n.n(a),o=n(27961);function s(e){return i.createElement(r(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function l(e){return o.ZP.showjson.value?i.createElement("div",{className:"text-left"},i.createElement(s,{obj:e.obj})):i.createElement(i.Fragment,null)}},96190:function(e,t,n){n.d(t,{g:function(){return i}});const i=n(67294).createContext(void 0)},48256:function(e,t,n){n.d(t,{RZ:function(){return C}}),"stream"in Blob.prototype||Object.defineProperty(Blob.prototype,"stream",{value(){return new Response(this).body}}),"setBigUint64"in DataView.prototype||Object.defineProperty(DataView.prototype,"setBigUint64",{value(e,t,n){const i=Number(0xffffffffn&t),a=Number(t>>32n);this.setUint32(e+(n?0:4),i,n),this.setUint32(e+(n?4:0),a,n)}});var i=e=>new DataView(new ArrayBuffer(e)),a=e=>new Uint8Array(e.buffer||e),r=e=>(new TextEncoder).encode(String(e)),o=e=>Math.min(4294967295,Number(e)),s=e=>Math.min(65535,Number(e));function l(e,t){if(void 0===t||t instanceof Date||(t=new Date(t)),e instanceof File)return{isFile:1,t:t||new Date(e.lastModified),i:e.stream()};if(e instanceof Response)return{isFile:1,t:t||new Date(e.headers.get("Last-Modified")||Date.now()),i:e.body};if(void 0===t)t=new Date;else if(isNaN(t))throw new Error("Invalid modification date.");if(void 0===e)return{isFile:0,t:t};if("string"==typeof e)return{isFile:1,t:t,i:r(e)};if(e instanceof Blob)return{isFile:1,t:t,i:e.stream()};if(e instanceof Uint8Array||e instanceof ReadableStream)return{isFile:1,t:t,i:e};if(e instanceof ArrayBuffer||ArrayBuffer.isView(e))return{isFile:1,t:t,i:a(e)};if(Symbol.asyncIterator in e)return{isFile:1,t:t,i:c(e)};throw new TypeError("Unsupported input format.")}function c(e){const t="next"in e?e:e[Symbol.asyncIterator]();return new ReadableStream({async pull(e){let n=0;for(;e.desiredSize>n;){const i=await t.next();if(!i.value){e.close();break}{const t=f(i.value);e.enqueue(t),n+=t.byteLength}}}})}function f(e){return"string"==typeof e?r(e):e instanceof Uint8Array?e:a(e)}function u(e,t,n){if(void 0===t||t instanceof Uint8Array||(t=r(t)),e instanceof File)return{o:m(t||r(e.name)),A:BigInt(e.size)};if(e instanceof Response){const i=e.headers.get("content-disposition"),a=i&&i.match(/;\s*filename\*?=["']?(.*?)["']?$/i),o=a&&a[1]||e.url&&new URL(e.url).pathname.split("/").findLast(Boolean),s=o&&decodeURIComponent(o),l=n||+e.headers.get("content-length");return{o:m(t||r(s)),A:BigInt(l)}}return t=m(t,void 0!==e||void 0!==n),"string"==typeof e?{o:t,A:BigInt(r(e).length)}:e instanceof Blob?{o:t,A:BigInt(e.size)}:e instanceof ArrayBuffer||ArrayBuffer.isView(e)?{o:t,A:BigInt(e.byteLength)}:{o:t,A:d(e,n)}}function d(e,t){return t>-1?BigInt(t):e?void 0:0n}function m(e,t=1){if(!e||e.every((e=>47===e)))throw new Error("The file must have a name.");if(t)for(;47===e[e.length-1];)e=e.subarray(0,-1);else 47!==e[e.length-1]&&(e=new Uint8Array([...e,47]));return e}var g=new WebAssembly.Instance(new WebAssembly.Module(Uint8Array.from(atob("AGFzbQEAAAABCgJgAABgAn9/AXwDAwIAAQUDAQACBwkCAW0CAAFjAAEIAQAKlQECSQEDfwNAIAEhAEEAIQIDQCAAQQF2IABBAXFBoIbi7X5scyEAIAJBAWoiAkEIRw0ACyABQQJ0IAA2AgAgAUEBaiIBQYACRw0ACwtJAQF/IAFBf3MhAUGAgAQhAkGAgAQgAGohAANAIAFB/wFxIAItAABzQQJ0KAIAIAFBCHZzIQEgAkEBaiICIABJDQALIAFBf3O4Cw"),(e=>e.charCodeAt(0))))),{c:p,m:y}=g.exports,A=a(y).subarray(65536);function h(e,t=0){for(const n of function*(e){for(;e.length>65536;)yield e.subarray(0,65536),e=e.subarray(65536);e.length&&(yield e)}(e))A.set(n),t=p(n.length,t);return t}function b(e,t,n=0){const i=e.getSeconds()>>1|e.getMinutes()<<5|e.getHours()<<11,a=e.getDate()|e.getMonth()+1<<5|e.getFullYear()-1980<<9;t.setUint16(n,i,1),t.setUint16(n+2,a,1)}function v(e){const t=i(30);return t.setUint32(0,1347093252),t.setUint32(4,754976768),b(e.t,t,10),t.setUint16(26,e.o.length,1),a(t)}async function*E(e){let{i:t}=e;if("then"in t&&(t=await t),t instanceof Uint8Array)yield t,e.u=h(t,0),e.A=BigInt(t.length);else{e.A=0n;const n=t.getReader();for(;;){const{value:t,done:i}=await n.read();if(i)break;e.u=h(t,e.u),e.A+=BigInt(t.length),yield t}}}function w(e,t){const n=i(16+(t?8:0));return n.setUint32(0,1347094280),n.setUint32(4,e.isFile?e.u:0,1),t?(n.setBigUint64(8,e.A,1),n.setBigUint64(16,e.A,1)):(n.setUint32(8,o(e.A),1),n.setUint32(12,o(e.A),1)),a(n)}function B(e,t,n=0){const r=i(46);return r.setUint32(0,1347092738),r.setUint32(4,755182848),r.setUint16(8,2048),b(e.t,r,12),r.setUint32(16,e.isFile?e.u:0,1),r.setUint32(20,o(e.A),1),r.setUint32(24,o(e.A),1),r.setUint16(28,e.o.length,1),r.setUint16(30,n,1),r.setUint16(40,e.isFile?33204:16893,1),r.setUint32(42,o(t),1),a(r)}function U(e,t,n){const r=i(n);return r.setUint16(0,1,1),r.setUint16(2,n-4,1),16&n&&(r.setBigUint64(4,e.A,1),r.setBigUint64(12,e.A,1)),r.setBigUint64(n-8,t,1),a(r)}function I(e){return e instanceof File||e instanceof Response?[[e],[e]]:[[e.input,e.name,e.size],[e.input,e.lastModified]]}function C(e,t={}){const n={"Content-Type":"application/zip","Content-Disposition":"attachment"};return("bigint"==typeof t.length||Number.isInteger(t.length))&&t.length>0&&(n["Content-Length"]=String(t.length)),t.metadata&&(n["Content-Length"]=String((e=>function(e){let t=BigInt(22),n=0n,i=0;for(const a of e){if(!a.o)throw new Error("Every file must have a non-empty name.");if(void 0===a.A)throw new Error(`Missing size for file "${(new TextDecoder).decode(a.o)}".`);const e=a.A>=0xffffffffn,r=n>=0xffffffffn;n+=BigInt(46+a.o.length+(e&&8))+a.A,t+=BigInt(a.o.length+46+(12*r|28*e)),i||(i=e)}return(i||n>=0xffffffffn)&&(t+=BigInt(76)),t+n}(function*(e){for(const t of e)yield u(...I(t)[0])}(e)))(t.metadata))),new Response(N(e),{headers:n})}function N(e){return c(async function*(e){const t=[];let n=0n,r=0n,l=0;for await(const i of e){yield v(i),yield i.o,i.isFile&&(yield*E(i));const e=i.A>=0xffffffffn,a=12*(n>=0xffffffffn)|28*e;yield w(i,e),t.push(B(i,n,a)),t.push(i.o),a&&t.push(U(i,n,a)),e&&(n+=8n),r++,n+=BigInt(46+i.o.length)+i.A,l||(l=e)}let c=0n;for(const e of t)yield e,c+=BigInt(e.length);if(l||n>=0xffffffffn){const e=i(76);e.setUint32(0,1347094022),e.setBigUint64(4,BigInt(44),1),e.setUint32(12,755182848),e.setBigUint64(24,r,1),e.setBigUint64(32,r,1),e.setBigUint64(40,c,1),e.setBigUint64(48,n,1),e.setUint32(56,1347094023),e.setBigUint64(64,n+c,1),e.setUint32(72,1,1),yield a(e)}const f=i(22);f.setUint32(0,1347093766),f.setUint16(8,s(r),1),f.setUint16(10,s(r),1),f.setUint32(12,o(c),1),f.setUint32(16,o(n),1),yield a(f)}(async function*(e){for await(const t of e){const[e,n]=I(t);yield Object.assign(l(...n),u(...e))}}(e)))}},2086:function(e,t,n){var i=n(87462),a=n(63366),r=n(94184),o=n.n(r),s=n(67294),l=n(76792),c=["bsPrefix","size","toggle","vertical","className","as"],f=s.forwardRef((function(e,t){var n=e.bsPrefix,r=e.size,f=e.toggle,u=e.vertical,d=e.className,m=e.as,g=void 0===m?"div":m,p=(0,a.Z)(e,c),y=(0,l.vE)(n,"btn-group"),A=y;return u&&(A=y+"-vertical"),s.createElement(g,(0,i.Z)({},p,{ref:t,className:o()(d,A,r&&y+"-"+r,f&&y+"-toggle")}))}));f.displayName="ButtonGroup",f.defaultProps={vertical:!1,toggle:!1,role:"group"},t.Z=f},62318:function(e,t,n){var i=n(63366),a=n(87462),r=n(94184),o=n.n(r),s=n(67294),l=n(44680),c=n(76792),f=["bsPrefix","size","hasValidation","className","as"],u=(0,l.Z)("input-group-append"),d=(0,l.Z)("input-group-prepend"),m=(0,l.Z)("input-group-text",{Component:"span"}),g=s.forwardRef((function(e,t){var n=e.bsPrefix,r=e.size,l=e.hasValidation,u=e.className,d=e.as,m=void 0===d?"div":d,g=(0,i.Z)(e,f);return n=(0,c.vE)(n,"input-group"),s.createElement(m,(0,a.Z)({ref:t},g,{className:o()(u,n,r&&n+"-"+r,l&&"has-validation")}))}));g.displayName="InputGroup",g.Text=m,g.Radio=function(e){return s.createElement(m,null,s.createElement("input",(0,a.Z)({type:"radio"},e)))},g.Checkbox=function(e){return s.createElement(m,null,s.createElement("input",(0,a.Z)({type:"checkbox"},e)))},g.Append=u,g.Prepend=d,t.Z=g}}]);
//# sourceMappingURL=608.6252a0603da3d74cae0a.bundle.js.map