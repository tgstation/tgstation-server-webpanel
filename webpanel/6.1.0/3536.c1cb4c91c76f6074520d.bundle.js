"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[3536],{3536:function(e,t,a){a.r(t),a.d(t,{default:function(){return v}});var n=a(6784),l=a(6540),s=a(5615),r=a(1208),c=a(1364),i=a(5192),o=a(5038),u=a(3524),m=a(8065),d=a(8437),p=a(8325);function f(){return f=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var n in a)({}).hasOwnProperty.call(a,n)&&(e[n]=a[n])}return e},f.apply(null,arguments)}class v extends l.Component{constructor(e){super(e),this.save=this.save.bind(this),this.state={values:{}}}save(){p.default.saveconfig(this.state.values),this.setState({values:{}})}render(){const e=Object.entries(d.Ay);return l.createElement(l.Fragment,null,e.map((([e,t])=>{const a=e,s=l.createRef(),d=l.createRef(),p=this.state.values[a]??t,v=()=>{this.setState((e=>{const n=this.state.values[a]?{...this.state.values[a]}:{...t};return n.value="enum"===p.type?d.current.selectedOptions[0].value:"bool"===p.type?s.current.checked:s.current.value,{values:{...e.values,[a]:n}}}))},h=Math.random().toString();return l.createElement(i.A,{key:p.id},l.createElement(i.A.Prepend,{className:"w-40 flex-grow-1 flex-xl-grow-0 overflow-auto mb-2 mb-xl-0"},l.createElement(o.A,{overlay:(b=p.id+".desc",l.createElement(u.A,{id:b},l.createElement(m.A,{id:b})))},(({ref:e,...t})=>l.createElement(i.A.Text,f({className:"flex-fill "+(this.state.values[a]?"font-weight-bold":"")},t),l.createElement(m.A,{id:p.id}),l.createElement("div",{className:"ml-auto",ref:e},l.createElement(n.g,{fixedWidth:!0,icon:"info"})))))),l.createElement("div",{className:"flex-grow-1 w-100 w-xl-auto d-flex mb-3 mb-xl-0"},"enum"===p.type?l.createElement("select",{className:"flex-fill mb-0 "+(this.state.values[a]?"font-weight-bold":""),ref:d,onChange:v,defaultValue:p.value},Object.values(p.possibleValues).map((e=>l.createElement(m.A,{key:e,id:`${p.id}.enum.${e}`},(t=>l.createElement("option",{value:e},t)))))):"bool"===p.type?l.createElement("label",{htmlFor:h,className:"d-flex justify-content-center align-content-center flex-grow-1 w-100 w-xl-auto mb-0"},l.createElement(r.A.Check,{inline:!0,type:"switch",custom:!0,id:h,className:"m-auto",label:"",ref:s,onChange:v,checked:p.value})):l.createElement(c.A,{custom:!0,type:"num"===p.type?"number":"pwd"===p.type?"password":"text",className:"flex-fill mb-0 "+(this.state.values[a]?"font-weight-bold":""),min:"num"===p.type?p.min:void 0,max:"num"===p.type?p.max:void 0,ref:s,onChange:v,value:p.value}),this.state.values[a]?l.createElement(i.A.Append,{onClick:()=>{this.setState((e=>{const t={};for(const[n,l]of Object.entries(e.values))n!==a&&(t[n]=l);return{values:t}}))}},l.createElement(i.A.Text,null,l.createElement(n.g,{fixedWidth:!0,icon:"undo"}))):""));var b})),l.createElement("br",null),l.createElement("div",{className:"text-center"},l.createElement(s.A,{className:"px-5",onClick:this.save,disabled:!Object.keys(this.state.values).length},l.createElement(m.A,{id:"generic.save"}))))}}},5192:function(e,t,a){var n=a(8587),l=a(8168),s=a(2485),r=a.n(s),c=a(6540),i=a(6261),o=a(6519),u=["bsPrefix","size","hasValidation","className","as"],m=(0,i.A)("input-group-append"),d=(0,i.A)("input-group-prepend"),p=(0,i.A)("input-group-text",{Component:"span"}),f=c.forwardRef((function(e,t){var a=e.bsPrefix,s=e.size,i=e.hasValidation,m=e.className,d=e.as,p=void 0===d?"div":d,f=(0,n.A)(e,u);return a=(0,o.oU)(a,"input-group"),c.createElement(p,(0,l.A)({ref:t},f,{className:r()(m,a,s&&a+"-"+s,i&&"has-validation")}))}));f.displayName="InputGroup",f.Text=p,f.Radio=function(e){return c.createElement(p,null,c.createElement("input",(0,l.A)({type:"radio"},e)))},f.Checkbox=function(e){return c.createElement(p,null,c.createElement("input",(0,l.A)({type:"checkbox"},e)))},f.Append=m,f.Prepend=d,t.A=f}}]);
//# sourceMappingURL=3536.c1cb4c91c76f6074520d.bundle.js.map