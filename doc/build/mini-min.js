/*!build time : 2014-07-31 8:56:50 PM*/
KISSY.add("kg/scroll-monitor/2.0.0/mini",function(a,b,c,d){"use strict";function e(){e.superclass.constructor.apply(this,arguments)}var f=window,g=document,h=g.body,i=g.documentElement,j=a.one(f),k=c.ios,l=c.android,m=c.webkit,n=c.chrome,o="run",p="node",q="delay",r="margin",s="",t=" ",u=o,v="stop",w="resize",x="scroll",y="scrollDown",z="scrollLeft",A="scrollRight",B="scrollUp",C="scrollToBottom",D="scrollToLeft",E="scrollToRight",F="scrollToTop",G="afterDelayChange",H="afterMarginChange",I="afterRunChange";return e.ATTRS={node:{setter:function(b){var c=a.one(b),b=c&&c[0];return b===i||b===f?(b=h,a.one(b)):c},getter:function(b){return b||a.one(h)}},delay:{value:15},margin:{value:30},run:{value:!1}},a.extend(e,d,{initializer:function(){this._node=this.get(p),this._elem=this._node[0],this._isBody=this._elem===h,this._scrollElem=this._isBody?f:this._elem,this._scrollNode=a.one(this._scrollElem),this._delay=this.get(q),this._margin=this.get(r),this.publish(u,{defaultFn:this._defRunFn}),this.publish(v,{defaultFn:this._defStopFn}),this.on(G,this._afterDelayChange),this.on(H,this._afterMarginChange),this.on(I,this._afterRunChange),this.get(o)&&this.fire(u)},destructor:function(){this.stop(),delete this._node,delete this._elem,delete this._isBody,delete this._scrollElem,delete this._scrollNode,delete this._margin,delete this._delay,delete this._lastScroll,delete this._scrollTimeout},checkScroll:function(a){return a!==!1&&(this._lastScroll=null),this._scrollNode.fire(x),this},getScrollInfo:function(){var b=e.getScrollInfo(this._elem,this._margin),c=this._lastScroll,d=!!c;return a.merge(b,{isScrollDown:d&&b.scrollTop>c.scrollTop,isScrollUp:d&&b.scrollTop<c.scrollTop,isScrollLeft:d&&b.scrollLeft<c.scrollLeft,isScrollRight:d&&b.scrollLeft>c.scrollLeft,lastScroll:c,directionXChange:!c||c.isScrollLeft!==b.isScrollLeft||c.isScrollRight!==b.isScrollRight,directionYChange:!c||c.isScrollUp!==b.isScrollUp||c.isScrollDown!==b.isScrollDown})},run:function(){return this.set(o,!0),this},stop:function(){return this.set(o,!1),this},_bindScroll:function(){this._scrollNode.on(x,this._afterScroll,this),j.on(w,this._afterResize,this)},_detachScroll:function(){this._scrollNode.detach(x,this._afterScroll,this),j.detach(w,this._afterResize,this)},_runMonitor:function(){this._bindScroll(),this.checkScroll()},_stopMonitor:function(){clearTimeout(this._scrollTimeout),this._lastScroll=null,this._detachScroll()},_triggerScroll:function(b){var c=this.getScrollInfo();if(!(c.scrollTop<0||c.scrollHeight-c.viewportHeight<c.scrollTop)){var d=a.mix(c,{domEvent:b}),e=this._lastScroll;this._lastScroll=c,b&&(this.fire(x,d),c.isScrollLeft?this.fire(z,d):c.isScrollRight&&this.fire(A,d),c.isScrollUp?this.fire(B,d):c.isScrollDown&&this.fire(y,d)),!c.atLeft||e&&e.atLeft||this.fire(D,d),c.atRight&&(!e||!e.atRight||c.scrollWidth>e.scrollWidth)&&this.fire(E,d),!c.atTop||e&&e.atTop||this.fire(F,d),c.atBottom&&(!e||!e.atBottom||c.scrollHeight>e.scrollHeight)&&this.fire(C,d)}},_defRunFn:function(){this._runMonitor()},_defStopFn:function(){this._stopMonitor()},_afterResize:function(){this.checkScroll(!1)},_afterScroll:function(a){var b=this;clearTimeout(this._scrollTimeout),this._scrollTimeout=setTimeout(function(){b._triggerScroll(a)},this._delay)},_afterDelayChange:function(a){this._delay=a.newVal},_afterMarginChange:function(a){this._margin=a.newVal},_afterRunChange:function(a){this.fire(a.newVal?u:v)}}),e.getScrollInfo=function(b,c){var d=a.one(b),e=d&&d[0],g=e===h||e===i||e===f,j=g&&(k||l&&n),o=g&&!m?i:e,p=j?f:g&&m?i:o,q=j?p.innerHeight:p.clientHeight,r=j?p.innerWidth:p.clientWidth,u=o.scrollLeft,v=o.scrollHeight,w=o.scrollTop,x=o.scrollWidth,y=w+q,z=u+r,A=((c||0)+s).split(t),B=Number(A[0]),C=Number(A[1]),D=Number(A[2]),E=Number(A[3]);switch(A.length){case 1:C=D=E=B;break;case 2:D=B,E=C;break;case 3:E=C}return{atBottom:y>=v-D,atLeft:E>=u,atRight:z>=x-C,atTop:B>=w,viewportHeight:q,viewportWidth:r,scrollHeight:v,scrollWidth:x,scrollable:v>q,scrollTop:w,scrollBottom:y,scrollLeft:u,scrollRight:z}},e},{requires:["node","ua","base"]});