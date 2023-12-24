"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[732],{8425:function(e,t,r){r.d(t,{t:function(){return l}});var n=r(67294),o=r(55171),a=r.n(o),s=r(27961);function i(e){return n.createElement(a(),{src:e.obj,name:"JSON",theme:"tube",iconStyle:"triangle",collapsed:!0,displayDataTypes:!1})}function l(e){return s.ZP.showjson.value?n.createElement("div",{className:"text-left"},n.createElement(i,{obj:e.obj})):n.createElement(n.Fragment,null)}},80732:function(e,t,r){r.r(t),r.d(t,{default:function(){return _}});var n=r(51436),o=r(67814),a=r(67294),s=r(37959),i=r(35005),l=r(31555),c=r(94716),u=r(62318),d=r(15293),m=r(43489),p=r(44012),h=r(30724),g=r.n(h),w=r(5977),f=r(81249),v=r(55006),E=r.n(v),y=r(22480),b=r(48509),C=r(96846),Z=r(53803),R=r(75631),V=r(16942),A=r(44615),P=r(27428),j=r(16964),O=r(1320);let I;!function(e){e.Configuration="Configuration",e.Core="Core",e.HostWatchdog="HostWatchdog",e.WebControlPanel="WebControlPanel",e.HttpApi="HttpApi",e.DreamMakerApi="DreamMakerApi",e.InteropApi="InteropApi",e.NugetCommon="NugetCommon",e.NugetApi="NugetApi",e.NugetClient="NugetClient"}(I||(I={}));var k=r(3e3),S=r(8425),$=r(35855);function G(){return G=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},G.apply(this,arguments)}class N extends a.Component{constructor(e){super(e),this.loadNotes=this.loadNotes.bind(this),this.updateServer=this.updateServer.bind(this),this.state={changelog:null,versions:[],errors:[],loading:!0,gitHubOwner:null,gitHubRepo:null}}async componentDidMount(){await this.loadVersions(),this.setState({loading:!1})}componentWillUnmount(){this.state.timer&&window.clearInterval(this.state.timer)}addError(e){this.setState((t=>{const r=Array.from(t.errors);return r.push(e),{errors:r}}))}async loadVersions(){if(!(0,j.N3)((0,j.Zg)(this.context.user),b.oj.ChangeVersion))return;const e=await y.Z.getAdminInfo();switch(e.code){case Z.G.ERROR:return this.addError(e.error);case Z.G.OK:{const t=e.payload.trackedRepositoryUrl,r=/https?:\/\/(github\.com)\/(.*?)\/(.*)/.exec(t);if(!r)return this.addError(new C.ZP(C.jK.APP_FAIL,{jsError:Error(`Unknown repository url format: ${t}`)}));if("github.com"!==r[1])return void this.setState({versions:[{body:"Updates unavailable to non github repos",version:"Updates unavailable to non github repos",current:!0,old:!0}]});this.setState({gitHubOwner:r[2],gitHubRepo:r[3]});const n=this.loadChangelog(r[2],r[3]),o=await P.Z.getVersions({owner:r[2],repo:r[3],current:this.context.serverInfo.version,all:!!this.props.match.params.all});switch(console.log("Version info: ",o),o.code){case Z.G.ERROR:return this.addError(o.error);case Z.G.OK:{const e=await n;this.setState({changelog:e,versions:o.payload})}}}}}async loadChangelog(e,t){const r=await P.Z.getFile(e,t,"changelog.yml","gh-pages");switch(r.code){case Z.G.ERROR:this.addError(r.error);break;case Z.G.OK:try{const e=window.atob(r.payload);return E().parse(e)}catch(e){this.addError(new C.ZP(C.jK.BAD_YML,{void:!0}))}}return null}loadNotes(){for(const e of this.state.versions){if(e.version!==this.state.selectedOption)continue;const t=window.setInterval((()=>{this.setState((e=>void 0===e.secondsLeft||null===e.secondsLeft?e:1===e.secondsLeft?(window.clearInterval(e.timer),{timer:null,secondsLeft:null}):{secondsLeft:e.secondsLeft-1}))}),1e3);return void this.setState({selectedVersion:e,timer:t,secondsLeft:10})}}async uploadVersion(){const e=new Promise((e=>{const t=document.createElement("input");t.type="file",t.onchange=t=>{const r=t.target?.files;e(r?r[0]:null)},t.click()})),t=await e;if(!t)return;if(!t.name.toLowerCase().endsWith(".zip"))return void alert("Invalid zipfile!");const r=await t.arrayBuffer(),n=prompt("Enter the TGS version semver:");if(!n)return;const o=new f.SemVer(n),a=`${o.major}.${o.minor}.${o.patch}`;a==n?confirm(`JUST WHAT DO YOU THINK YOU'RE DOING!? This is your only and final warning: Uploading a TGS Version .zip that is improperly formatted or that does not match the version you just entered (${a}) can brick your installation! Think carefully before pressing OK to continue.`)&&await this.serverUpdated(y.Z.uploadVersion(a,r)):alert("Invalid semver!")}async updateServer(){if(!this.state.selectedOption)return console.error("Attempted to update server to a no version"),void this.setState({selectedVersion:void 0});await this.serverUpdated(y.Z.updateServer(this.state.selectedOption))}async serverUpdated(e){const t=await e;switch(t.code){case Z.G.ERROR:return void this.addError(t.error);case Z.G.OK:}R.Z.autoLogin=!1,window.setInterval((async()=>{if((await V.Z.getCurrentUser(!0)).code===Z.G.ERROR)window.location.reload()}),2e3),this.setState({updating:!0})}buildVersionDiffFromChangelog(e){const t=this.state.changelog;if(!t)return null;const r=this.context.serverInfo.version,n=new f.SemVer(e),o=new f.SemVer(r);let a="";const s=t.Components[I.Core].find((t=>t.Version==e)).ComponentVersions;let i,l;a+=`Please refer to the [README](https://github.com/tgstation/tgstation-server#setup) for setup instructions. Full changelog can be found [here](https://raw.githubusercontent.com/tgstation/tgstation-server/gh-pages/changelog.yml).\n\n#### Component Versions\nCore: ${e}\nConfiguration: ${s.Configuration}\nHTTP API: ${s.HttpApi}\nDreamMaker API: ${s.DreamMakerApi} (Interop: ${s.InteropApi})\n[Web Control Panel](https://github.com/tgstation/tgstation-server-webpanel): ${s.WebControlPanel}\nHost Watchdog: ${s.HostWatchdog}\n\n`,n<o?(a+="## _The version you are switching to is below the current version._\n## _The following changes will be **un**-applied!_",i=e,l=r):(i=r,l=e);const c=new f.SemVer(i),u=new f.SemVer(l),d=t.Components[I.Core].filter((e=>{const t=new f.SemVer(e.Version);return(0,f.gte)(t,c)&&(0,f.lte)(t,u)})).sort(((e,t)=>new f.SemVer(e.Version).compare(t.Version))).reverse(),m=[];for(let e=0;e<d.length-1;++e){const r=new Map;m.push(r);const n=d[e],o=d[e+1];r.set(I.Core,n),Object.keys(n.ComponentVersions).forEach((e=>{const a=e,s=n.ComponentVersions[a];if(!s)return;const i=new f.SemVer(s);if(a==I.Core||a==I.NugetClient||a==I.NugetApi||a==I.NugetCommon)return;const l=new f.SemVer(o.ComponentVersions[a]),c=t.Components[a].filter((e=>{const t=new f.SemVer(e.Version);return t>l&&t<=i})).flatMap((e=>e.Changes)).sort(((e,t)=>e.PullRequest-t.PullRequest)),u={Version:s,Changes:c};c.length>0&&r.set(a,u)}))}return m.forEach((e=>{a+="\n\n";const t=e.get(I.Core),r=new f.SemVer(t.Version);r.patch>0?a+=`## Patch ${r.patch}`:r.minor>0?a+=`# Update ${r.minor}.0`:a+=`# **Major Update ${r.major}.0.0**`;for(const t in I){const r=e.get(t);!r||0==r.Changes?.length&&t!=I.Configuration||(a+="\n\n#### ",t==I.Configuration&&(a+="**"),a+=this.componentDisplayName(t),t==I.Configuration&&(a+=`\n- **The new configuration version is \`${r.Version}\` Please update your \`General:ConfigVersion\` setting appropriately.**`),r.Changes?.forEach((e=>e.Descriptions.forEach((t=>{a+=`\n- ${t} ([#${e.PullRequest}](https://github.com/${this.state.gitHubOwner}/${this.state.gitHubRepo}/pull/${e.PullRequest})) [@${e.Author}](https://github.com/${e.Author})`})))))}})),a}componentDisplayName(e){switch(e){case I.HttpApi:return"HTTP API";case I.InteropApi:return"Interop API";case I.Configuration:return"**Configuration**";case I.DreamMakerApi:return"DreamMaker API";case I.HostWatchdog:return"Host Watchdog (Requires reinstall to apply)";case I.Core:return"Core";case I.WebControlPanel:return"Web Control Panel";default:throw new Error("Unknown component: "+e)}}render(){if(this.state.updating)return a.createElement($.Z,{text:"loading.updating"});if(this.state.loading)return a.createElement($.Z,{text:"loading.version"});const e=e=>{this.setState({selectedOption:e.target.value})},t=(0,j.Zg)(this.context.user),r=(0,j.N3)(t,b.oj.ChangeVersion),h=(0,j.N3)(t,b.oj.UploadVersion),w=this.state.selectedVersion?(this.buildVersionDiffFromChangelog(this.state.selectedVersion.version)??this.state.selectedVersion.body).replaceAll("\r","").replaceAll("\n","\n\n"):null,v=new f.SemVer(this.context.serverInfo.version),E=this.state.selectedVersion&&new f.SemVer(this.state.selectedVersion.version).major!=v.major,y=()=>this.setState({warnedAboutMajorUpdates:!0}),C="number"==typeof this.state.secondsLeft;return a.createElement(a.Fragment,null,a.createElement(S.t,{obj:this.state.versions}),a.createElement("div",{className:"text-center"},this.state.errors.map(((e,t)=>{if(e)return a.createElement(k.ZP,{key:t,error:e,onClose:()=>this.setState((e=>{const r=Array.from(e.errors);return r[t]=void 0,{errors:r}}))})}))),this.state.selectedVersion?a.createElement(a.Fragment,null,a.createElement(s.Z,{centered:!0,show:E&&!this.state.warnedAboutMajorUpdates,onHide:y,size:"lg"},a.createElement(s.Z.Header,{closeButton:!0},a.createElement(s.Z.Title,null,a.createElement(p.Z,{id:"view.admin.update.major_warn.title"}))),a.createElement(s.Z.Body,{className:"text-danger pb-0"},a.createElement(p.Z,{id:"view.admin.update.major_warn.body",values:{currentMajor:v.major,targetMajor:new f.SemVer(this.state.selectedVersion.version).major}})),a.createElement(s.Z.Footer,null,a.createElement(i.Z,{variant:"secondary",onClick:y},a.createElement(p.Z,{id:"generic.close"})))),a.createElement("div",{className:"text-center"},a.createElement("h3",null,a.createElement(p.Z,{id:"view.admin.update.releasenotes"})),a.createElement("hr",null)),a.createElement(g(),null,w),a.createElement("div",{className:"text-center"},a.createElement("hr",null),a.createElement(i.Z,{className:"mr-3",onClick:()=>this.setState({selectedVersion:void 0})},a.createElement(p.Z,{id:"generic.goback"})),a.createElement(d.Z,{overlay:a.createElement(m.Z,{id:"timing-tooltip",placement:"right"},a.createElement(p.Z,{id:"view.admin.update.wait"})),show:C},a.createElement(i.Z,{onClick:this.updateServer,disabled:C},a.createElement(p.Z,{id:"generic.continue"}),C?` [${this.state.secondsLeft}]`:"")))):a.createElement("div",{className:"text-center"},a.createElement("h3",{className:"mb-4"},a.createElement(p.Z,{id:"view.admin.update.selectversion"})),r?a.createElement(l.Z,{xs:8,md:6,className:"mx-auto"},this.state.versions.map(((t,r)=>a.createElement(u.Z,{className:"mb-3",key:t.version},a.createElement(u.Z.Prepend,null,a.createElement(u.Z.Radio,{id:t.version,name:"version",disabled:t.current,value:t.version,checked:this.state.selectedOption===t.version,onChange:e})),a.createElement(c.Z,{as:"label",htmlFor:t.version,disabled:!0},t.version,t.current?a.createElement(p.Z,{id:"view.admin.update.current"}):"",0==r?a.createElement(p.Z,{id:"view.admin.update.latest"}):"")))),a.createElement(i.Z,{variant:"link",onClick:()=>{this.props.history.push((O.$w.admin_update.link??O.$w.admin_update.route)+"all/",{reload:!0})},disabled:!!this.props.match.params.all},a.createElement(p.Z,{id:"view.admin.update.showall"})),a.createElement("br",null),a.createElement(i.Z,{onClick:this.loadNotes,disabled:!this.state.selectedOption},a.createElement(p.Z,{id:"generic.continue"}))):a.createElement("h4",null,a.createElement(p.Z,{id:"view.admin.update.selectversion.deny"})),a.createElement("br",null),a.createElement(d.Z,{overlay:a.createElement(m.Z,{id:"create-instance-tooltip"},a.createElement(p.Z,{id:"view.admin.update.upload.deny"})),show:!h&&void 0},(({ref:e,...t})=>a.createElement(i.Z,G({ref:e,className:"mx-1",variant:"success",onClick:()=>{this.uploadVersion()},disabled:!h},t),a.createElement("div",null,a.createElement(o.G,{className:"mr-2",icon:n.cf$}),a.createElement(p.Z,{id:"view.admin.update.upload"})))))))}}N.contextType=A.f;var _=(0,w.EN)(N)},27428:function(e,t,r){var n=r(6964),o=r(17347),a=r(52638),s=r(12527),i=r(96846),l=r(53803),c=r(27961),u=r(86755);async function d(e,t,r){const n=e.endpoint.merge(t,r);return c.ZP.githubtoken.value&&(n.headers.authorization=`token ${c.ZP.githubtoken.value}`),e(n)}async function m(){return c.ZP.githubtoken.value?{type:"token",tokenType:"pat",token:c.ZP.githubtoken.value}:{type:"unauthenticated"}}const p=()=>Object.assign(m.bind(null),{hook:d.bind(null)}),h=new class extends s.TypedEmitter{constructor(){super(),this.apiClient=void 0;const e=a.v.plugin(n.X,o.O);this.apiClient=new e({authStrategy:p,userAgent:"tgstation-server-control-panel/"+u.q4,baseUrl:"https://api.github.com",throttle:{onRateLimit:(e,t)=>(console.warn(`Request quota exhausted for request ${t.method} ${t.url}`),0===t.request.retryCount&&(console.log(`Retrying after ${e} seconds!`),!0)),onAbuseLimit:(e,t)=>{console.warn(`Abuse detected for request ${t.method} ${t.url}`)}}})}async getVersions({owner:e,repo:t,current:r,all:n}){let o,a=0;try{o=await this.apiClient.paginate(this.apiClient.repos.listReleases,{owner:e,repo:t},((e,t)=>e.data.reduce(((e,o)=>{const s=/tgstation-server-v([\d.]+)/.exec(o.name??"");if(!s)return e;if(parseInt(s[1][0])<4)return e;const i=s[1];let l=!1;if(i<=r){if(a>=3&&!n)return t(),e;a++,l=!0}return e.push({version:i,body:o.body??"",current:i===r,old:l}),e}),[])))}catch(e){return new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:e})})}return new l.Z({code:l.G.OK,payload:o})}transformPR(e){return{number:e.number,title:e.title,author:e.user?.login??"ghost",state:e.merged_at?"merged":e.state,link:e.html_url,head:e.head.sha,tail:e.base.sha,testmergelabel:e.labels.some((e=>e.name?.toLowerCase().includes("testmerge")||e.name?.toLowerCase().includes("test merge")))}}async getPRs({owner:e,repo:t,wantedPRs:r}){let n=[];try{n=(await this.apiClient.paginate(this.apiClient.pulls.list,{owner:e,repo:t,state:"open"})).map(this.transformPR);for(const o of r??[])if(!n.find((e=>e.number==o))){const r=(await this.apiClient.pulls.get({owner:e,repo:t,pull_number:o})).data;n.push(this.transformPR(r))}}catch(e){return console.error(e),new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:e})})}return new l.Z({code:l.G.OK,payload:n})}async getPRCommits({owner:e,repo:t,pr:r,wantedCommit:n}){let o,a=[];try{if(a=await this.apiClient.paginate(this.apiClient.pulls.listCommits,{owner:e,repo:t,pull_number:r.number,per_page:100},(({data:e})=>e.map((e=>({name:e.commit.message.split("\n")[0],sha:e.sha,url:e.html_url}))))),a.reverse(),n&&!a.find((e=>e.sha===n))){const r=(await this.apiClient.repos.getCommit({owner:e,repo:t,ref:n})).data;o={name:r.commit.message.split("\n")[0],sha:r.sha,url:r.html_url}}}catch(e){return console.error(e),new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:e})})}return new l.Z({code:l.G.OK,payload:[a,o]})}async getFile(e,t,r,n){try{const{data:o}=await this.apiClient.repos.getContent({mediaType:{format:"base64"},owner:e,repo:t,path:r,ref:n});if(Array.isArray(o))return new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:new Error(`${r} was a directory!`)})});if("file"!==o.type)return new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:new Error(`${r} has type ${o.type}!`)})});const a=o.content;return new l.Z({code:l.G.OK,payload:a})}catch(e){return console.error(e),new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:e})})}}async getDirectoryContents(e,t,r){try{const{data:n}=await this.apiClient.repos.getContent({owner:e,repo:t,path:r});if(!Array.isArray(n))return new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:new Error(`${r} was not a directory!`)})});const o=[];return n.forEach((e=>o.push({path:e.path,isDirectory:"dir"==e.type}))),new l.Z({code:l.G.OK,payload:o})}catch(e){return console.error(e),new l.Z({code:l.G.ERROR,error:new i.ZP(i.jK.GITHUB_FAIL,{jsError:e})})}}};t.Z=h}}]);
//# sourceMappingURL=732.4dbe33e94e4237549890.bundle.js.map