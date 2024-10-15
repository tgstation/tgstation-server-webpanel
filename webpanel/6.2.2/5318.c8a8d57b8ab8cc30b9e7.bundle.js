"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[5318,5727],{1723:function(e,t,n){n.d(t,{Ay:function(){return A},PU:function(){return m},gH:function(){return w}});var a=n(6188),r=n(6784),i=n(6540),o=n(5615),l=n(1208),s=n(5192),u=n(5038),c=n(3524),f=n(8065);function d(){return d=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)({}).hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},d.apply(null,arguments)}let m=function(e){return e.Boolean="boolean",e.Number="number",e.String="string",e.TextArea="textarea",e.Password="password",e.Enum="enum",e}({});const g=i.forwardRef((function(e,t){return i.createElement(l.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,ref:t})})),p=i.forwardRef((function(e){return i.createElement(l.A.Control,{as:"textarea",value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled})})),y=i.forwardRef((function(e,t){return i.createElement(l.A.Control,{value:e.value,onChange:t=>e.onChange(t.target.value),disabled:e.disabled,type:"password",ref:t})})),v=i.forwardRef((function(e,t){const n=Math.random().toString();return i.createElement("label",{htmlFor:n,className:"d-flex m-0 flex-grow-1 justify-content-center align-content-center"},i.createElement(l.A.Check,{id:n,checked:e.value,onChange:t=>e.onChange(t.target.checked),type:"switch",className:"m-auto",disabled:e.disabled,ref:t}))})),h=i.forwardRef((function(e,t){return i.createElement(l.A.Control,{value:e.value,onChange:t=>e.onChange(isNaN(t.target.valueAsNumber)?t.target.value:t.target.valueAsNumber),disabled:e.disabled,min:e.min,max:e.max,type:"number",ref:t})})),b=i.forwardRef((function(e,t){return i.createElement(l.A.Control,{value:e.value,onChange:t=>e.onChange(parseInt(t.target.value)),disabled:e.disabled,as:"select",custom:!0,ref:t},Object.entries(e.enum).filter((([e])=>isNaN(parseInt(e)))).map((([t,n])=>e.noLocalize?i.createElement("option",{key:n,value:n},t):i.createElement(f.A,{id:`${e.name}.${t}`,key:t},(e=>i.createElement("option",{key:n,value:n},e))))))})),w={[m.Enum]:0,[m.Number]:0,[m.Boolean]:!1,[m.String]:"",[m.Password]:"",[m.TextArea]:""};function A(e){const[t,n]=(0,i.useState)(e.defaultValue??w[e.type]),l=(0,i.useRef)(null);(0,i.useEffect)((()=>{n(e.defaultValue??w[e.type])}),[e.defaultValue]),(0,i.useEffect)((()=>{switch(l.current&&(l.current.checkValidity()?l.current.classList.remove("is-invalid"):l.current.classList.add("is-invalid")),e.type){case m.Boolean:case m.Enum:case m.Number:case m.String:case m.Password:case m.TextArea:return void e.onChange(t,l.current?.checkValidity()??!0)}}),[t]);const A={string:g,password:y,boolean:v,textarea:p,[m.Number]:void 0,[m.Enum]:void 0},E=t!=(e.defaultValue??w[e.type])||e.forceChanged;return i.createElement(s.A,null,i.createElement(u.A,{overlay:(U=e.tooltip,U?i.createElement(c.A,{id:U},i.createElement(f.A,{id:U})):i.createElement(i.Fragment,null)),show:!!e.tooltip&&void 0},(({ref:t,...n})=>i.createElement(s.A.Prepend,{className:"w-50 w-xl-40"},i.createElement(s.A.Text,d({className:"flex-grow-1"},n),i.createElement("span",{className:E?"font-weight-bold":""},i.createElement(f.A,{id:e.name})),i.createElement("div",{className:"ml-auto"},e.disabled&&!e.hideReadOnly?i.createElement(f.A,{id:"generic.readonly"}):null,i.createElement("div",{ref:t,className:"d-inline-block ml-2",style:{visibility:e.tooltip?"unset":"hidden"}},i.createElement(r.g,{icon:a.ktq}))))))),e.type===m.Number?i.createElement(h,{value:t,onChange:e=>n(e),name:e.name,disabled:e.disabled,max:e.max,min:e.min,ref:l}):e.type===m.Enum?i.createElement(b,{value:t,onChange:e=>n(e),name:e.name,enum:e.enum,noLocalize:e.noLocalize,disabled:e.disabled}):i.createElement(A[e.type],{value:t,onChange:e=>n(e),disabled:e.disabled,name:e.type,ref:l}),E&&!e.disabled||e.additionalAppend?i.createElement(s.A.Append,null,E&&!e.disabled?i.createElement(o.A,{variant:"danger",onClick:()=>n(e.defaultValue??w[e.type])},i.createElement(r.g,{icon:"undo"})):null,e.additionalAppend):null);var U}},6113:function(e,t,n){n.d(t,{A:function(){return c}});var a=n(6540),r=n(5615),i=n(5038),o=n(3524),l=n(8065),s=n(1723);function u(){return u=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)({}).hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},u.apply(null,arguments)}function c(e){const t=new Map,n=new Map,[c,f]=(0,a.useState)({});(0,a.useEffect)((()=>{Object.keys(e.fields).forEach((e=>{f((t=>({...t,[e]:{}})))}))}),[]);for(const[r,i]of Object.entries(e.fields))n.set(r,i),t.set(i,(0,a.useState)(i.defaultValue??s.gH[i.type]));let d=e.alwaysAllowSave,m=!1;for(const[e,a]of n){const[n]=t.get(a),r=c[e];if((a.defaultValue??s.gH[a.type])!=n&&(d=!0),r?.invalid&&(m=!0),d&&m)break}return e.hideDisabled&&!Object.values(e.fields).some((e=>!e.disabled))?a.createElement(a.Fragment,null):a.createElement("div",null,Object.entries(e.fields).map((([n,r])=>{const{disabled:i,...o}=r;return e.hideDisabled&&i?null:a.createElement(s.Ay,u({key:n},o,{disabled:e.readOnly||i,onChange:(e,a)=>{t.get(r)[1](e),f((e=>({...e,[n]:{...e[n],invalid:!a}})))}}))})),a.createElement("div",{className:"text-center mt-2"},a.createElement(i.A,{overlay:a.createElement(o.A,{id:"form-invalid"},a.createElement(l.A,{id:"generic.invalid_form"})),show:!!m&&void 0},a.createElement(r.A,{variant:e.readOnly||m?"danger":"success",disabled:e.readOnly||!d||m,onClick:()=>{const a={};for(const[r,i]of n){const[n]=t.get(i);(i.alwaysInclude||n!=(i.defaultValue??s.gH[i.type])||e.includeAll)&&(a[r]=n)}e.onSave(a)}},a.createElement(l.A,{id:e.saveMessageId??"generic.save"})))))}},6795:function(e,t,n){n.d(t,{Q:function(){return s}});var a=n(6540),r=n(8785),i=n.n(r),o=n(8437);function l(e){return a.createElement(i(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function s(e){return o.Ay.showjson.value?a.createElement("div",{className:"text-left"},a.createElement(l,{obj:e.obj})):a.createElement(a.Fragment,null)}},7621:function(e,t,n){n.d(t,{z:function(){return a}});const a=n(6540).createContext(void 0)},616:function(e,t,n){var a=n(8168),r=n(8587),i=n(2485),o=n.n(i),l=n(6540),s=n(6519),u=["bsPrefix","size","toggle","vertical","className","as"],c=l.forwardRef((function(e,t){var n=e.bsPrefix,i=e.size,c=e.toggle,f=e.vertical,d=e.className,m=e.as,g=void 0===m?"div":m,p=(0,r.A)(e,u),y=(0,s.oU)(n,"btn-group"),v=y;return f&&(v=y+"-vertical"),l.createElement(g,(0,a.A)({},p,{ref:t,className:o()(d,v,i&&y+"-"+i,c&&y+"-toggle")}))}));c.displayName="ButtonGroup",c.defaultProps={vertical:!1,toggle:!1,role:"group"},t.A=c},5192:function(e,t,n){var a=n(8587),r=n(8168),i=n(2485),o=n.n(i),l=n(6540),s=n(6261),u=n(6519),c=["bsPrefix","size","hasValidation","className","as"],f=(0,s.A)("input-group-append"),d=(0,s.A)("input-group-prepend"),m=(0,s.A)("input-group-text",{Component:"span"}),g=l.forwardRef((function(e,t){var n=e.bsPrefix,i=e.size,s=e.hasValidation,f=e.className,d=e.as,m=void 0===d?"div":d,g=(0,a.A)(e,c);return n=(0,u.oU)(n,"input-group"),l.createElement(m,(0,r.A)({ref:t},g,{className:o()(f,n,i&&n+"-"+i,s&&"has-validation")}))}));g.displayName="InputGroup",g.Text=m,g.Radio=function(e){return l.createElement(m,null,l.createElement("input",(0,r.A)({type:"radio"},e)))},g.Checkbox=function(e){return l.createElement(m,null,l.createElement("input",(0,r.A)({type:"checkbox"},e)))},g.Append=f,g.Prepend=d,t.A=g},1941:function(e,t,n){n.d(t,{_6:function(){return C}}),"stream"in Blob.prototype||Object.defineProperty(Blob.prototype,"stream",{value(){return new Response(this).body}}),"setBigUint64"in DataView.prototype||Object.defineProperty(DataView.prototype,"setBigUint64",{value(e,t,n){const a=Number(0xffffffffn&t),r=Number(t>>32n);this.setUint32(e+(n?0:4),a,n),this.setUint32(e+(n?4:0),r,n)}});var a=e=>new DataView(new ArrayBuffer(e)),r=e=>new Uint8Array(e.buffer||e),i=e=>(new TextEncoder).encode(String(e)),o=e=>Math.min(4294967295,Number(e)),l=e=>Math.min(65535,Number(e));function s(e,t){if(void 0===t||t instanceof Date||(t=new Date(t)),e instanceof File)return{isFile:1,t:t||new Date(e.lastModified),i:e.stream()};if(e instanceof Response)return{isFile:1,t:t||new Date(e.headers.get("Last-Modified")||Date.now()),i:e.body};if(void 0===t)t=new Date;else if(isNaN(t))throw new Error("Invalid modification date.");if(void 0===e)return{isFile:0,t:t};if("string"==typeof e)return{isFile:1,t:t,i:i(e)};if(e instanceof Blob)return{isFile:1,t:t,i:e.stream()};if(e instanceof Uint8Array||e instanceof ReadableStream)return{isFile:1,t:t,i:e};if(e instanceof ArrayBuffer||ArrayBuffer.isView(e))return{isFile:1,t:t,i:r(e)};if(Symbol.asyncIterator in e)return{isFile:1,t:t,i:u(e[Symbol.asyncIterator]())};throw new TypeError("Unsupported input format.")}function u(e,t=e){return new ReadableStream({async pull(t){let n=0;for(;t.desiredSize>n;){const a=await e.next();if(!a.value){t.close();break}{const e=c(a.value);t.enqueue(e),n+=e.byteLength}}},cancel(e){t.throw?.(e)}})}function c(e){return"string"==typeof e?i(e):e instanceof Uint8Array?e:r(e)}function f(e,t,n){let[a,o]=function(e){return e?e instanceof Uint8Array?[e,1]:ArrayBuffer.isView(e)||e instanceof ArrayBuffer?[r(e),1]:[i(e),0]:[void 0,0]}(t);if(e instanceof File)return{o:m(a||i(e.name)),u:BigInt(e.size),l:o};if(e instanceof Response){const t=e.headers.get("content-disposition"),r=t&&t.match(/;\s*filename\*?=["']?(.*?)["']?$/i),l=r&&r[1]||e.url&&new URL(e.url).pathname.split("/").findLast(Boolean),s=l&&decodeURIComponent(l),u=n||+e.headers.get("content-length");return{o:m(a||i(s)),u:BigInt(u),l:o}}return a=m(a,void 0!==e||void 0!==n),"string"==typeof e?{o:a,u:BigInt(i(e).length),l:o}:e instanceof Blob?{o:a,u:BigInt(e.size),l:o}:e instanceof ArrayBuffer||ArrayBuffer.isView(e)?{o:a,u:BigInt(e.byteLength),l:o}:{o:a,u:d(e,n),l:o}}function d(e,t){return t>-1?BigInt(t):e?void 0:0n}function m(e,t=1){if(!e||e.every((e=>47===e)))throw new Error("The file must have a name.");if(t)for(;47===e[e.length-1];)e=e.subarray(0,-1);else 47!==e[e.length-1]&&(e=new Uint8Array([...e,47]));return e}var g=new Uint32Array(256);for(let e=0;e<256;++e){let t=e;for(let e=0;e<8;++e)t=t>>>1^(1&t&&3988292384);g[e]=t}function p(e,t=0){t^=-1;for(var n=0,a=e.length;n<a;n++)t=t>>>8^g[255&t^e[n]];return~t>>>0}function y(e,t,n=0){const a=e.getSeconds()>>1|e.getMinutes()<<5|e.getHours()<<11,r=e.getDate()|e.getMonth()+1<<5|e.getFullYear()-1980<<9;t.setUint16(n,a,1),t.setUint16(n+2,r,1)}function v({o:e,l:t},n){return 8*(!t||(n??function(e){try{h.decode(e)}catch{return 0}return 1}(e)))}var h=new TextDecoder("utf8",{fatal:1});function b(e,t=0){const n=a(30);return n.setUint32(0,1347093252),n.setUint32(4,754976768|t),y(e.t,n,10),n.setUint16(26,e.o.length,1),r(n)}async function*w(e){let{i:t}=e;if("then"in t&&(t=await t),t instanceof Uint8Array)yield t,e.m=p(t,0),e.u=BigInt(t.length);else{e.u=0n;const n=t.getReader();for(;;){const{value:t,done:a}=await n.read();if(a)break;e.m=p(t,e.m),e.u+=BigInt(t.length),yield t}}}function A(e,t){const n=a(16+(t?8:0));return n.setUint32(0,1347094280),n.setUint32(4,e.isFile?e.m:0,1),t?(n.setBigUint64(8,e.u,1),n.setBigUint64(16,e.u,1)):(n.setUint32(8,o(e.u),1),n.setUint32(12,o(e.u),1)),r(n)}function E(e,t,n=0,i=0){const l=a(46);return l.setUint32(0,1347092738),l.setUint32(4,755182848),l.setUint16(8,2048|n),y(e.t,l,12),l.setUint32(16,e.isFile?e.m:0,1),l.setUint32(20,o(e.u),1),l.setUint32(24,o(e.u),1),l.setUint16(28,e.o.length,1),l.setUint16(30,i,1),l.setUint16(40,e.isFile?33204:16893,1),l.setUint32(42,o(t),1),r(l)}function U(e,t,n){const i=a(n);return i.setUint16(0,1,1),i.setUint16(2,n-4,1),16&n&&(i.setBigUint64(4,e.u,1),i.setBigUint64(12,e.u,1)),i.setBigUint64(n-8,t,1),r(i)}function B(e){return e instanceof File||e instanceof Response?[[e],[e]]:[[e.input,e.name,e.size],[e.input,e.lastModified]]}var x=e=>function(e){let t=BigInt(22),n=0n,a=0;for(const r of e){if(!r.o)throw new Error("Every file must have a non-empty name.");if(void 0===r.u)throw new Error(`Missing size for file "${(new TextDecoder).decode(r.o)}".`);const e=r.u>=0xffffffffn,i=n>=0xffffffffn;n+=BigInt(46+r.o.length+(e&&8))+r.u,t+=BigInt(r.o.length+46+(12*i|28*e)),a||(a=e)}return(a||n>=0xffffffffn)&&(t+=BigInt(76)),t+n}(function*(e){for(const t of e)yield f(...B(t)[0])}(e));function C(e,t={}){const n={"Content-Type":"application/zip","Content-Disposition":"attachment"};return("bigint"==typeof t.length||Number.isInteger(t.length))&&t.length>0&&(n["Content-Length"]=String(t.length)),t.metadata&&(n["Content-Length"]=String(x(t.metadata))),new Response(N(e,t),{headers:n})}function N(e,t={}){const n=function(e){const t=e[Symbol.iterator in e?Symbol.iterator:Symbol.asyncIterator]();return{async next(){const e=await t.next();if(e.done)return e;const[n,a]=B(e.value);return{done:0,value:Object.assign(s(...a),f(...n))}},throw:t.throw?.bind(t),[Symbol.asyncIterator](){return this}}}(e);return u(async function*(e,t){const n=[];let i=0n,s=0n,u=0;for await(const a of e){const e=v(a,t.buffersAreUTF8);yield b(a,e),yield new Uint8Array(a.o),a.isFile&&(yield*w(a));const r=a.u>=0xffffffffn,o=12*(i>=0xffffffffn)|28*r;yield A(a,r),n.push(E(a,i,e,o)),n.push(a.o),o&&n.push(U(a,i,o)),r&&(i+=8n),s++,i+=BigInt(46+a.o.length)+a.u,u||(u=r)}let c=0n;for(const e of n)yield e,c+=BigInt(e.length);if(u||i>=0xffffffffn){const e=a(76);e.setUint32(0,1347094022),e.setBigUint64(4,BigInt(44),1),e.setUint32(12,755182848),e.setBigUint64(24,s,1),e.setBigUint64(32,s,1),e.setBigUint64(40,c,1),e.setBigUint64(48,i,1),e.setUint32(56,1347094023),e.setBigUint64(64,i+c,1),e.setUint32(72,1,1),yield r(e)}const f=a(22);f.setUint32(0,1347093766),f.setUint16(8,l(s),1),f.setUint16(10,l(s),1),f.setUint32(12,o(c),1),f.setUint32(16,o(i),1),yield r(f)}(n,t),n)}}}]);
//# sourceMappingURL=5318.c8a8d57b8ab8cc30b9e7.bundle.js.map