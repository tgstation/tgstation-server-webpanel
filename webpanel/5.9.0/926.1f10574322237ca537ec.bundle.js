"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[926],{15727:function(e,t,s){s.d(t,{i:function(){return o}});var i=s(67294),n=s(9966),a=s(88375),r=s(51479),l=s(44012);class o extends i.Component{constructor(e){super(e),this.state={animatedOpen:!1,closeTriggered:!1}}componentDidMount(){this.setState({animatedOpen:!0}),this.isCompleted()&&this.close()}componentDidUpdate(){this.isCompleted()&&this.close()}isCompleted(e){e??=this.props;return e.progress.loaded===e.progress.total||0===e.progress.total}close(){this.state.closeTriggered||(this.setState({closeTriggered:!0}),setTimeout((()=>{this.setState({animatedOpen:!1}),setTimeout(this.props.onClose,1e3)}),3e3))}render(){const e=this.props.progress.loaded===this.props.progress.total||0===this.props.progress.total;return i.createElement(n.Z,{in:this.state.animatedOpen,dimension:"height"},i.createElement("div",null,i.createElement(a.Z,{className:"clearfix",variant:e?"success":"primary",transition:!0},i.createElement(l.Z,{id:e?"generic.downloaded":"generic.downloading",values:{file:this.props.filename}}),i.createElement("hr",null),i.createElement(r.Z,{min:0,now:Math.max(1,this.props.progress.loaded),max:Math.max(1,this.props.progress.total),variant:e?"success":"warning",animated:!e}))))}}},66642:function(e,t,s){s.d(t,{Z:function(){return l}});var i=s(67294),n=s(15881),a=s(44012),r=s(86755);class l extends i.Component{render(){return i.createElement(n.Z,{className:"bg-transparent",border:"info"},i.createElement(n.Z.Header,{className:"bg-info text-dark font-weight-bold"},i.createElement(a.Z,{id:"generic.wip"})),i.createElement(n.Z.Body,null,i.createElement(n.Z.Title,null,i.createElement(a.Z,{id:"generic.wip.desc"}),i.createElement("a",{href:"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest"},"https://github.com/tgstation/Tgstation.Server.ControlPanel/releases/latest")),i.createElement(n.Z.Text,{as:"pre",className:"bg-transparent text-info"},i.createElement("code",null,`Version: ${r.q4}\nWebpanel Mode: ${r.IK}\nCurrent route: ${window.location.toString()}`))))}}},20926:function(e,t,s){s.r(t);var i=s(51436),n=s(67814),a=s(48256),r=s(67294),l=s(35005),o=s(2086),c=s(15293),d=s(43489),h=s(44012),p=s(74806),m=s(63637),f=s(48509),u=s(53803),y=s(77626),w=s(96190),g=s(16964),E=s(15727),v=s(3e3),x=s(9635),Z=s(79049),R=s(35619),D=s(8425),S=s(35855),C=s(66642);function F(){return F=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var i in s)Object.prototype.hasOwnProperty.call(s,i)&&(e[i]=s[i])}return e},F.apply(this,arguments)}const b=(e,t)=>{const s=window.navigator;if(s&&s.msSaveOrOpenBlob)s.msSaveOrOpenBlob(t,e);else{const s=document.createElement("a");document.body.appendChild(s);const i=URL.createObjectURL(t);s.href=i,s.download=e,s.click(),URL.revokeObjectURL(s.href),s.remove()}};class N{constructor(e,t){this.parent=void 0,this.children=void 0,this.fileResponse=void 0,this.totalFiles=void 0,this.fullyLoaded=!1,this.fileResponse=e,this.parent=t??null,e.isDirectory||(this.fullyLoaded=!0),this.children=[]}}class O extends r.Component{constructor(e){super(e),this.state={errors:[],rootDirectory:null,loading:!0,selectedFile:null,selectedCreateNode:null,downloads:[]},this.createEntity=this.createEntity.bind(this),this.selectFile=this.selectFile.bind(this),this.shortAsyncAction=this.shortAsyncAction.bind(this),this.deleteFile=this.deleteFile.bind(this),this.loadDirectory=this.loadDirectory.bind(this),this.clearDirectory=this.clearDirectory.bind(this)}addError(e){this.setState((t=>{const s=Array.from(t.errors);return s.push(e),{errors:s}}))}async componentDidMount(){await this.loadRootDir()}async loadRootDir(){if((0,g.H5)(this.context.instancePermissionSet,f.TI.List)){this.setState({loading:!0});const e=new N({path:"/",isDirectory:!0,fileTicket:""});await this.loadDirectory(e),this.setState({rootDirectory:e,loading:!1})}else this.setState({loading:!1})}async shortAsyncAction(e){const t=e();let s=!1;const i=new Promise((e=>setTimeout(e,750))).then((()=>{s=!0}));await Promise.race([t,i]),s?(this.setState({loading:!0}),await t,this.setState({loading:!1})):this.forceUpdate()}async deleteDirectory(e){const t=await m.Z.deleteDirectory(this.context.instance.id,{path:e.fileResponse.path});if(t.code===u.G.OK){if(null!=e.parent){const t=e.parent.children.indexOf(e);e.parent.children.splice(t,1),this.forceUpdate()}}else this.addError(t.error)}async loadDirectory(e){if((0,g.H5)(this.context.instancePermissionSet,f.TI.List)){this.clearDirectory(e);const t="\\"===e.fileResponse.path[0]||"/"===e.fileResponse.path[0]?e.fileResponse.path.slice(1):e.fileResponse.path;let s=1;for(let i=1;i<=s;++i){const n=await m.Z.getDirectory(this.context.instance.id,t,{page:i});if(n.code!==u.G.OK){this.addError(n.error);break}{s=n.payload.totalPages,s<=i&&(e.fullyLoaded=!0);const t=n.payload.content.map((t=>new N(t,e)));for(const s of t)e.children.push(s)}}}}async selectFile(e){if(this.state.selectedFile===e)return void this.setState({selectedFile:null});let t=e.fileResponse.path;for(;t.startsWith("/");)t=t.substring(1);if(!e.fileResponse.isDirectory){const s=await m.Z.getConfigFile(this.context.instance.id,t,null);s.code===u.G.OK?e.fileResponse=s.payload:(this.addError(s.error),e.fileResponse.lastReadHash=null)}this.setState({selectedFile:e,selectedCreateNode:null})}async deleteFile(){const e=this.state.selectedFile,t=await m.Z.writeConfigFile(this.context.instance.id,{path:e.fileResponse.path,lastReadHash:e.fileResponse.lastReadHash},new Uint8Array);if(t.code===u.G.OK){const t=e.parent,s=t.children.indexOf(e);t.children.splice(s,1),this.setState({selectedFile:null})}else this.addError(t.error)}async downloadDirectory(e){if(!confirm(this.props.intl.formatMessage({id:"view.instance.files.zip.confirm"},{path:e.fileResponse.path})))return;this.setState({loading:!0});const t=async e=>{let t=[],s=1;const i="\\"===e.path[0]||"/"===e.path[0]?e.path.slice(1):e.path;for(let e=1;e<=s;++e){const n=await m.Z.getDirectory(this.context.instance.id,i,{page:e});if(n.code!==u.G.OK)return this.addError(n.error),null;s=n.payload.totalPages,t=t.concat(n.payload.content)}return t};let s=!1;const i=async t=>{const i=await m.Z.getConfigFile(this.context.instance.id,t.path,null),n=t.path.substring(e.fileResponse.path.length);if(i.code===u.G.OK){return async()=>{const e=await y.Z.Download(i.payload.fileTicket,this.allocateDownload(n));if(e.code!=u.G.OK)return this.addError(e.error),null;const t=e.payload;return new File([t],n)}}return this.addError(i.error),s=!0,()=>Promise.resolve(null)};let n=[e.fileResponse];const r=[];for(;n.length>0;){const e=[];for(const s of n){const i=t(s);await i,e.push(i)}if(n=[],s)return void this.setState({loading:!1});for(const t of e){const e=await t;if(null==e)return void this.setState({loading:!1});for(const t of e)if(t.isDirectory)n.push(t);else{const e=await i(t);r.push(e())}}}if(await Promise.all(r),s)return void this.setState({loading:!1});const l=[];for(const e of r)l.push(await e);const o=await(0,a.RZ)(l).blob(),c=Math.max(e.fileResponse.path.lastIndexOf("\\"),e.fileResponse.path.lastIndexOf("/")),d=e.fileResponse.path.slice(c+1)+".zip";b(d,o),this.setState({loading:!1})}async downloadFile(){this.setState({loading:!0});const e=this.state.selectedFile,t=Math.max(e.fileResponse.path.lastIndexOf("\\"),e.fileResponse.path.lastIndexOf("/")),s=e.fileResponse.path.slice(t+1),i=await m.Z.getConfigFile(this.context.instance.id,e.fileResponse.path,this.allocateDownload(s));i.code===u.G.OK?b(s,i.payload.content):this.addError(i.error),this.setState({loading:!1})}async createEntity(e,t){let s;if(e.isDirectory)s=new Uint8Array;else{const e=new Promise((e=>{const t=document.createElement("input");t.type="file",t.onchange=t=>{const s=t.target?.files;e(s?s[0]:null)},t.click()})),t=await e;if(!t)return;s=await t.arrayBuffer()}this.setState({loading:!0});let i=t.fileResponse.path;e.replace?i="/"+i:i+="/"+e.entityName,i.startsWith("//")&&(i=i.substring(1)),e.isDirectory&&(i+="/webpanel.dir.create.tmp");const n=await m.Z.writeConfigFile(this.context.instance.id,{path:i,lastReadHash:e.replace?t.fileResponse.lastReadHash:null},s);n.code!==u.G.OK?this.addError(n.error):e.replace&&(t.fileResponse=n.payload),e.replace||(t.fullyLoaded=!1,await this.loadDirectory(t));let a=i.replace("\\","/");a.startsWith("/")&&(a=a.substring(1));const r=t.children.find((e=>a.startsWith(e.fileResponse.path.replace("\\","/"))))??null;r&&(e.isDirectory?(await this.loadDirectory(r),this.setState({selectedCreateNode:null,selectedFile:null})):await this.selectFile(r)),this.setState({loading:!1})}clearDirectory(e){e.fullyLoaded=!1,e.children.forEach((e=>{e===this.state.selectedFile?this.setState({selectedFile:null}):e===this.state.selectedCreateNode&&this.setState({selectedCreateNode:null}),e.fileResponse.isDirectory&&this.clearDirectory(e)})),e.children=[]}allocateDownload(e){const t=new Promise((e=>{this.setState((t=>{const s=[...t.downloads];return e(s.push(null)-1),{downloads:s}}))}));let s=0;return i=>{const n=++s;t.then((t=>{s===n&&this.setState((s=>{const n=[...s.downloads];return n[t]={filename:e,progress:i,onClose:()=>{this.setState((e=>{const s=[...e.downloads];return s[t]=null,{downloads:s}}))}},{downloads:n}}))}))}}render(){const e=r.createElement(r.Fragment,null,this.state.downloads.map(((e,t)=>{if(e)return r.createElement(E.i,F({key:t},e))})));if(this.state.loading)return r.createElement(r.Fragment,null,e,r.createElement(S.default,{text:"loading.instance.files"}));if(this.context.instance.configurationType===f.c7.Disallowed)return r.createElement("div",{className:"text-center"},r.createElement(x.Z,{title:"view.instance.files.disallowed"}));const t=(0,g.H5)(this.context.instancePermissionSet,f.TI.List),s=(0,g.H5)(this.context.instancePermissionSet,f.TI.Write);return r.createElement("div",null,r.createElement(D.t,{obj:this.state}),r.createElement("h2",{className:"text-center"},r.createElement(h.Z,{id:"view.instance.files.file_browser"})),this.state.errors.map(((e,t)=>{if(e)return r.createElement(v.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const s=Array.from(e.errors);return s[t]=void 0,{errors:s}}))})})),e,r.createElement("div",{className:"d-flex flex-row"},t?r.createElement("div",{className:"text-left",style:{paddingRight:"16px",maxHeight:"800px",minWidth:"200px",overflowY:"scroll"}},this.renderDirectory(this.state.rootDirectory)):r.createElement("div",{style:{maxWidth:"200px"}},r.createElement(x.Z,{title:"view.instance.files.disallowed.directory"})),r.createElement("div",{className:"flex-fill flex-column text-center align-self-center",style:{padding:"16px"}},s?r.createElement(r.Fragment,null):r.createElement(x.Z,{title:"view.instance.files.disallowed.write"}),this.state.selectedCreateNode?this.renderCreate():this.state.selectedFile?this.renderSelectedFile():t?r.createElement("h4",null,r.createElement(h.Z,{id:"view.instance.files.select_item"})):this.renderBrowserlessForms())))}renderDirectory(e){const t=Math.max(e.fileResponse.path.lastIndexOf("\\"),e.fileResponse.path.lastIndexOf("/")),s=e===this.state.selectedFile;if(!e.fileResponse.isDirectory){const a=e.fileResponse.path.slice(t+1);return r.createElement("li",{className:"browser-li"},r.createElement(l.Z,{variant:s?"secondary":"primary",onClick:()=>{this.shortAsyncAction((()=>this.selectFile(e)))},className:"nowrap"},r.createElement(n.G,{icon:i.cwv}),"\xa0",a))}const a=e==this.state.rootDirectory?"Configuration":e.fileResponse.path.slice(t+1);return r.createElement("div",{className:"mb-2"},r.createElement(o.Z,null,r.createElement(l.Z,{variant:e.fullyLoaded?"primary":"secondary",onClick:()=>{e.fullyLoaded?(this.clearDirectory(e),this.forceUpdate()):this.shortAsyncAction((()=>this.loadDirectory(e)))}},r.createElement(n.G,{icon:e.fullyLoaded?i.Jvx:i.x58})),r.createElement(l.Z,{className:"nowrap",variant:s?"secondary":"primary",onClick:()=>{this.shortAsyncAction((()=>this.selectFile(e)))}},a)),r.createElement("ul",{className:"browser-ul"},e.children.map((e=>r.createElement("li",{key:e.fileResponse.path},this.renderDirectory(e))))))}renderCreate(){const e={entityName:{type:Z.fS.String,name:"fields.instance.files.create.name",tooltip:"fields.instance.files.create.name.tip",defaultValue:""},isDirectory:{type:Z.fS.Boolean,name:"fields.instance.files.create.directory",defaultValue:!1}},t=this.state.selectedCreateNode;return r.createElement(r.Fragment,null,r.createElement("h5",null,t.fileResponse.path,t.parent?"/":""),r.createElement("h5",null,r.createElement(h.Z,{id:"view.instance.files.create"})),r.createElement("hr",null),r.createElement(R.Z,{fields:e,onSave:e=>{this.createEntity(e,t)},saveMessageId:"fields.instance.files.create"}))}renderSelectedFile(){const e=(0,g.H5)(this.context.instancePermissionSet,f.TI.Read),t=(0,g.H5)(this.context.instancePermissionSet,f.TI.Write),s=this.state.selectedFile,a=Math.max(s.fileResponse.path.lastIndexOf("\\"),s.fileResponse.path.lastIndexOf("/")),o=s.fileResponse.path.slice(a+1),p=!s.fileResponse.isDirectory&&!s.fileResponse.lastReadHash,m=s==this.state.rootDirectory?"Configuration":s.fileResponse.path.slice(a+1),u=this.state.selectedCreateNode===s,y=(0,g.H5)(this.context.instancePermissionSet,f.TI.Delete);let w=s.fileResponse.path.replaceAll("\\","/");return w.startsWith("/")||(w="/"+w),r.createElement(r.Fragment,null,r.createElement("h5",null,w),r.createElement("hr",null),r.createElement("div",{className:"mb-3"},s.fileResponse.isDirectory?r.createElement(r.Fragment,null,r.createElement(l.Z,{variant:"primary",className:"mx-2 nowrap",onClick:()=>{this.downloadDirectory(s)}},r.createElement(n.G,{icon:i.q7m}),"\xa0",r.createElement(h.Z,{id:"view.instance.files.download.directory"})),r.createElement(l.Z,{variant:u?"secondary":"primary",className:"mx-2 nowrap",onClick:()=>{this.state.selectedCreateNode!=s&&this.setState({selectedCreateNode:s})}},r.createElement(n.G,{icon:i.gMD}),"\xa0",r.createElement(h.Z,{id:"view.instance.files.create"})),r.createElement(c.Z,{placement:"top",show:(!y||!s.fullyLoaded||0!==s.children.length)&&void 0,overlay:e=>r.createElement(d.Z,F({id:"cant-delete-dir-tooltip"},e),r.createElement(h.Z,{id:s.fullyLoaded?y?"view.instance.files.delete.directory.populated":"view.instance.files.disallowed.directory.delete":"view.instance.files.delete.directory.populated.unloaded"}))},r.createElement(l.Z,{variant:"danger",className:"mx-2 nowrap",disabled:!s.fullyLoaded||!y||s.children.length>0||s==this.state.rootDirectory,onClick:()=>{confirm(this.props.intl.formatMessage({id:"view.instance.files.delete.directory.confirm"},{directoryName:m}))&&this.shortAsyncAction((()=>this.deleteDirectory(s)))}},r.createElement(n.G,{icon:i.NBC}),"\xa0",r.createElement(h.Z,{id:"view.instance.files.delete.directory"})))):r.createElement(r.Fragment,null,r.createElement(c.Z,{placement:"top",overlay:e=>r.createElement(d.Z,F({id:"file-download-location-tooltip"},e),r.createElement(h.Z,{id:"view.instance.files.download.location"}))},r.createElement(l.Z,{className:"mx-2",disabled:!e,onClick:()=>{this.downloadFile()}},r.createElement(h.Z,{id:"view.instance.files.download"}))),r.createElement(c.Z,{placement:"top",show:!(!t||!p)&&void 0,overlay:e=>r.createElement(d.Z,F({id:"file-not-refreshed-tooltip"},e),r.createElement(h.Z,{id:"view.instance.files.replace.stale"}))},r.createElement(l.Z,{variant:"warning",className:"mx-2",disabled:!t||p,onClick:()=>{this.createEntity({entityName:o,isDirectory:!1,replace:!0},s)}},r.createElement(h.Z,{id:"view.instance.files.replace"}))),r.createElement(c.Z,{placement:"top",show:!(!t||!p)&&void 0,overlay:e=>r.createElement(d.Z,F({id:"file-not-refreshed-tooltip-delete"},e),r.createElement(h.Z,{id:"view.instance.files.replace.stale"}))},r.createElement(l.Z,{variant:"danger",className:"mx-2",disabled:!t||p,onClick:()=>{confirm(this.props.intl.formatMessage({id:"view.instance.files.delete.confirm"},{path:s.fileResponse.path}))&&this.shortAsyncAction((()=>this.deleteFile()))}},r.createElement(h.Z,{id:"view.instance.files.delete"}))))))}renderBrowserlessForms(){return r.createElement(C.Z,null)}}O.contextType=w.g,t.default=(0,p.ZP)(O)}}]);
//# sourceMappingURL=926.1f10574322237ca537ec.bundle.js.map