"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[8325],{8325:function(e,t,o){o.r(t);var n=o(8437);t.default=new class{loadconfig(){for(const e of Object.values(n.Ay))this.getconfig(e);console.log("Configuration loaded",n.Ay)}saveconfig(e){for(const[t,o]of Object.entries(e))this.setconfig(t,o);console.log("Configuration saved",n.Ay)}getConfigKey(e){return e.site_local?`${window.location.pathname}:${e.id}`:e.id}setconfig(e,t){if(void 0===t?.value)return this.deleteconfig(e);switch(t.type){case"num":{const e=parseInt(t.value);if(Number.isNaN(t.value))return;if(void 0!==t.min&&e<t.min)return;if(void 0!==t.max&&e>t.max)return;t.value=e;break}}t.callback&&t.callback(n.Ay[e].value,t.value),n.Ay[e].value=t.value;try{localStorage.setItem(this.getConfigKey(t),JSON.stringify(t.value))}catch{}}getconfig(e){try{const t=localStorage.getItem(this.getConfigKey(e));if(null!=t){const o=JSON.parse(t);null!=o&&(e.value=o)}}catch{}}deleteconfig(e){try{const t=n.Ay[e];localStorage.removeItem(this.getConfigKey(t))}catch{}}}}}]);
//# sourceMappingURL=8325.f784f0bf9c0f2013a509.bundle.js.map