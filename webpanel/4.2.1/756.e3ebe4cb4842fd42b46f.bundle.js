"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[756],{7179:function(e,a,t){var r=t(653),n=t(6846),o=t(3803),s=t(5631);a.Z=new class extends r.S{async getWatchdogStatus(e){let a;await s.Z.wait4Init();try{a=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerRead({headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}switch(a.status){case 200:return new o.Z({code:o.G.OK,payload:a.data});case 410:return new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.NO_DB_ENTITY,{errorMessage:a.data},a)});default:return new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:a},a)})}}async updateWatchdogStatus(e,a){let t;await s.Z.wait4Init();try{t=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerUpdate(a,{headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}switch(t.status){case 200:return new o.Z({code:o.G.OK,payload:t.data});case 410:return new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.NO_DB_ENTITY,{errorMessage:t.data},t)});default:return new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:t},t)})}}async startWatchdog(e){let a;await s.Z.wait4Init();try{a=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerCreate({headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}return 202===a.status?new o.Z({code:o.G.OK,payload:a.data}):new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:a},a)})}async stopWatchdog(e){let a;await s.Z.wait4Init();try{a=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerDelete({headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}return 204===a.status?new o.Z({code:o.G.OK,payload:null}):new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:a},a)})}async restartWatchdog(e){let a;await s.Z.wait4Init();try{a=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerRestart({headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}return 202===a.status?new o.Z({code:o.G.OK,payload:a.data}):new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:a},a)})}async dumpWatchdog(e){let a;await s.Z.wait4Init();try{a=await s.Z.apiClient.dreamDaemon.dreamDaemonControllerCreateDump({headers:{Instance:e.toString()}})}catch(e){return new o.Z({code:o.G.ERROR,error:e})}return 202===a.status?new o.Z({code:o.G.OK,payload:a.data}):new o.Z({code:o.G.ERROR,error:new n.ZP(n.jK.UNHANDLED_RESPONSE,{axiosResponse:a},a)})}}}}]);
//# sourceMappingURL=756.e3ebe4cb4842fd42b46f.bundle.js.map