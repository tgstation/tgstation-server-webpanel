"use strict";(self.webpackChunktgstation_server_control_panel=self.webpackChunktgstation_server_control_panel||[]).push([[638],{9638:function(e,t,s){s.r(t),s.d(t,{default:function(){return h}});var n=s(7814),o=s(7294),r=s(5881),a=s(1555),c=s(4051),l=s(4012),u=s(3727),i=s(601),m=s(1320);class h extends o.Component{constructor(e){super(e),this.setRoutes=this.setRoutes.bind(this),this.state={routes:[]}}setRoutes(e){this.setState({routes:e})}async componentDidMount(){this.setState({routes:await i.Z.getRoutes(!1)}),i.Z.on("refreshAll",this.setRoutes)}componentWillUnmount(){i.Z.removeListener("refreshAll",this.setRoutes)}render(){return o.createElement(c.Z,{xs:1,sm:2,md:3,lg:4,className:"justify-content-center"},this.state.routes.map((e=>{if(e.homeIcon&&e!==m.$w.home)return o.createElement(a.Z,{key:e.link??e.route,className:"mb-1 home"},o.createElement(r.Z,{as:e.cachedAuth?u.rU:"div",to:e.link??e.route,className:"text-decoration-none m-1 h-75 "+(e.cachedAuth?"text-primary":"text-danger d-sm-flex d-none")},o.createElement(r.Z.Body,{style:{height:"245px"}},o.createElement(n.G,{fixedWidth:!0,icon:e.homeIcon,className:"d-block w-100 h-100 m-auto"})),o.createElement(r.Z.Footer,{className:"text-center font-weight-bold "+(e.cachedAuth?"":"text-danger font-italic")},o.createElement(l.Z,{id:e.name}))))})))}}h.Route="/"},4051:function(e,t,s){var n=s(7462),o=s(3366),r=s(4184),a=s.n(r),c=s(7294),l=s(6792),u=["bsPrefix","className","noGutters","as"],i=["xl","lg","md","sm","xs"],m=c.forwardRef((function(e,t){var s=e.bsPrefix,r=e.className,m=e.noGutters,h=e.as,d=void 0===h?"div":h,f=(0,o.Z)(e,u),p=(0,l.vE)(s,"row"),x=p+"-cols",v=[];return i.forEach((function(e){var t,s=f[e];delete f[e];var n="xs"!==e?"-"+e:"";null!=(t=null!=s&&"object"==typeof s?s.cols:s)&&v.push(""+x+n+"-"+t)})),c.createElement(d,(0,n.Z)({ref:t},f,{className:a().apply(void 0,[r,p,m&&"no-gutters"].concat(v))}))}));m.displayName="Row",m.defaultProps={noGutters:!1},t.Z=m}}]);
//# sourceMappingURL=638.dc5029c071ca3f081732.bundle.js.map