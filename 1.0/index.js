/**
 * ScrollMonitor
 * @fileoverview 滚动监听器
 * @author 虎牙<ningzbruc@gmail.com>
 * @date 2013-05-06
 * @version 0.0.1
 * @module scroll-monitor
 */

KISSY.add(function(S, Node, Event, Base) {

/**
 * 滚动监听器
 * @module scroll-monitor
 */
    
    'use strict';
    
    var win = window,
        doc = document,
        body = doc.body,
        docEl = doc.documentElement,
        
        ios = S.UA.ios,
        webkit = S.UA.webkit,
        
        RUN = 'run',
        NODE = 'node',
        DELAY = 'delay',
        MARGIN = 'margin',
        DESTROYED = 'destroyed',
        
        EVT_RESIZE = 'resize',
        EVT_SCROLL = 'scroll',
        EVT_SCROLL_DOWN = 'scrollDown',
        EVT_SCROLL_LEFT = 'scrollLeft',
        EVT_SCROLL_RIGHT = 'scrollRight',
        EVT_SCROLL_UP = 'scrollUp',
        EVT_SCROLL_TO_BOTTOM = 'scrollToBottom',
        EVT_SCROLL_TO_LEFT = 'scrollToLeft',
        EVT_SCROLL_TO_RIGHT = 'scrollToRight',
        EVT_SCROLL_TO_TOP = 'scrollToTop',
        
        AFTER_DELAY_CHANGE = 'afterDelayChange',
        AFTER_MARGIN_CHANGE = 'afterMarginChange',
        AFTER_RUN_CHANGE = 'afterRunChange';
        
    /**
     * 滚动监听器
     	
     	//初始化
        var monitor = new ScrollMonitor({
            node: 'body',
            margin: 50,
            delay: 20,
            run: false
        });
        
        //绑定事件
        monitor.on('scrollToBottom', function(e) {
            doSomething();
        });
        
        //开始监听
        monitor.run();
     
     * @class ScrollMonitor
     * @param {Object} config 配置参数
     * @param {Node|HTMLElemnt} config.node 滚动节点
     * @param {Number} config.delay 滚动时间触发延迟毫秒
     * @param {Number} config.margin 滚动距离偏差
     * @param {Boolean} config.run 是否初始化时监听滚动
     */
    function ScrollMonitor() {
    	ScrollMonitor.superclass.constructor.apply(this, arguments);
    	this.init.apply(this, arguments);
    }
    
    /**
     * 配置属性
     * @property ATTRS
     * @type Object
     * @static
     */
    ScrollMonitor.ATTRS = {
    	
    	/**
         * @attribute node
         * @description 滚动节点
         * @type Node
         */
    	node: {
    	    setter: function(v) {
                v = S.get(v);
                //body, documentElement，window都当成body统一处理
                if (v === docEl || v === win) {
                    v = body;
                }
                
                return S.one(v);
            }
    	},
    	
    	/**
         * @attribute delay
         * @description 滚动事件触发延迟
         * @type Number
         * @default 15
         */
        delay: {
            value: 15
        },
        
        /**
         * @attribute margin
         * @description 滚动距离偏差
         * @type Number
         * @default 30
         */
        margin: {
            value: 30
        },
        
        /**
         * @attribute run
         * @description 是否开始监听
         * @type Boolean
         * @default false
         */
        run: {
            value: false
        },
        
        /**
         * @attribute destroyed
         * @description 是否已经销毁
         * @type Boolean
         * @default false
         */
        destroyed: {
            value: false
        }
    };

    S.extend(ScrollMonitor, Base, {
        
        // -- Lifecycle Methods ----------------------------------------------------
        
        /**
         * 初始化
         * @method init
         * @public
         */
        init: function(node) {
            this._node = this.get(NODE);
            this._domNode = this._node[0];
            
            this._isBody = this._domNode === body;
            
            //body没有scroll事件，因此绑定到window上
            this._scrollNode = this._isBody ? win : this._domNode;
            
            this._margin = this.get(MARGIN);
            this._delay = this.get(DELAY);
            
            this.on(AFTER_DELAY_CHANGE, this._afterDelayChange);
            this.on(AFTER_MARGIN_CHANGE, this._afterMarginChange);
            this.on(AFTER_RUN_CHANGE, this._afterRunChange);
            
            this.get(RUN) && this._runMonitor();
        },
        
        /**
         * 销毁
         * @method destroy
         * @public
         */
        destroy: function () {
            this.stop();
            this.detach();
            
            delete this._node;
            delete this._domNode;
            delete this._isBody;
            delete this._scrollNode;
            delete this._margin;
            delete this._delay;
            delete this._lastScroll;
            delete this._scrollTimeout;
            
            this.set(DESTROYED, true);
        },
        
        // -- Public Methods -------------------------------------------------------
        
        /**
         * 检查当前滚动状态（手动触发scroll事件）
         * @method checkScroll
         * @chainable
         * @public
         */
        checkScroll: function() {
            Event.fire(this._scrollNode, EVT_SCROLL);
            return this;
        },
        
        /**
         * 获取滚动信息
         * @method getScrollInfo
         * @return {Object} info 当前滚动信息，包括滚动方向，滚动距离，是否到达边界
         * @public
         */
        getScrollInfo: function () {
            var info = ScrollMonitor.getScrollInfo(this._domNode, this._margin),
                lastScroll = this._lastScroll,
                hasLast = !!lastScroll;
            //TODO
            //Mac触控板和手机设备触控下拉到边界时，会有一个弹动的效果，这个时候依然发生scroll事件
            //是否增加isBounce等属性
			
            return S.merge(info, {
                isScrollDown : hasLast && info.scrollTop > lastScroll.scrollTop,
                isScrollUp   : hasLast && info.scrollTop < lastScroll.scrollTop,
                isScrollLeft : hasLast && info.scrollLeft < lastScroll.scrollLeft,
                isScrollRight: hasLast && info.scrollLeft > lastScroll.scrollLeft
            });
        },
        
        /**
         * 开始监听滚动
         * @method run
         * @chainable
         * @public
         */
        run: function() {
            this.set(RUN, true);
            return this;
        },
        
        /**
         * 停止监听滚动
         * @method stop
         * @chainable
         * @public
         */
        stop: function() {
            this.set(RUN, false);
            return this;
        },
        
        // -- Protected Methods ----------------------------------------------------
        
        /**
         * 绑定滚动事件
         * @method _bindScroll
         * @protected
         */
        _bindScroll: function () {
            Event.on(this._scrollNode, EVT_SCROLL, this._afterScroll, this);
            Event.on(win, EVT_RESIZE, this._afterResize, this);
        },
        
        /**
         * 解除滚动事件
         * @method _detachScroll
         * @protected
         */
        _detachScroll: function() {
            Event.detach(this._scrollNode, EVT_SCROLL, this._afterScroll, this);
            Event.detach(win, EVT_RESIZE, this._afterResize, this);
        },
        
        /**
         * 开始监听滚动
         * @method _runMonitor
         * @protected
         */
        _runMonitor: function() {
            this._bindScroll();
            this.checkScroll();
        },
        
        /**
         * 停止监听滚动
         * @method _stopMonitor
         * @protected
         */
        _stopMonitor: function() {
            clearTimeout(this._scrollTimeout);
            this._lastScroll = null;
            this._detachScroll();
        },
        
        /**
         * 触发滚动事件
         * @method _triggerScroll
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _triggerScroll: function (e) {
            var info = this.getScrollInfo(),
                facade = S.mix(info, { domEvent: e }),
                lastScroll = this._lastScroll;
    
            this._lastScroll = info;
            
            if (e) {
                this.fire(EVT_SCROLL, facade);
                    
                if (info.isScrollLeft) {
                    this.fire(EVT_SCROLL_LEFT, facade);
                } else if (info.isScrollRight) {
                    this.fire(EVT_SCROLL_RIGHT, facade);
                }
        
                if (info.isScrollUp) {
                    this.fire(EVT_SCROLL_UP, facade);
                } else if (info.isScrollDown) {
                    this.fire(EVT_SCROLL_DOWN, facade);
                }
            }
    
            if (info.atBottom && !(lastScroll && lastScroll.atBottom)) {
                this.fire(EVT_SCROLL_TO_BOTTOM, facade);
            }
    
            if (info.atLeft && !(lastScroll && lastScroll.atLeft)) {
                this.fire(EVT_SCROLL_TO_LEFT, facade);
            }
    
            if (info.atRight && !(lastScroll && lastScroll.atRight)) {    
                this.fire(EVT_SCROLL_TO_RIGHT, facade);
            }
    
            if (info.atTop && !(lastScroll && lastScroll.atTop)) {
                this.fire(EVT_SCROLL_TO_TOP, facade);
            }
        },
    
        // -- Protected Event Handlers ---------------------------------------------
        
        /**
         * 窗口大小重置监听回调
         * @method _afterResize
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _afterResize: function (e) {
            //TODO 是否需要
            this.checkScroll();
        },
        
        /**
         * 滚动监听回调
         * @method _afterScroll
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _afterScroll: function (e) {
            var _this = this;
            
            clearTimeout(this._scrollTimeout);
    
            this._scrollTimeout = setTimeout(function () {
                _this._triggerScroll(e);
            }, this._delay);
        },
        
        /**
         * 延迟值改变回调
         * @method _afterDelayChange
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _afterDelayChange: function(e) {
            this._delay = e.newVal;
        },
        
        /**
         * 偏移值改变回调
         * @method _afterMarginChange
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _afterMarginChange: function(e) {
            this._margin = e.newVal;
        },
        
        /**
         * 监听状态改变回调
         * @method _afterRunChange
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _afterRunChange: function(e) {
            if (e.newVal) {
                this._runMonitor();
            } else {
                this._stopMonitor();
            }
        }
        
    });
    
    /**
     * 获取滚动信息
     * @method getScrollInfo
     * @param {String|HTMLElement|Node} selector 节点选择器
     * @param {Number} margin 偏移量
     * @return {Object} 当前滚动状态的信息（不包括滚动方向）
     * @static
     */
    ScrollMonitor.getScrollInfo = function(selector, margin) {
        var elem = S.get(selector),
        	isBody = elem === body || elem === docEl || elem === win,
        	iosHack = isBody && ios,
        	
            //webkit只在body上返回正确的scroll信息，其他则是documentElement
            scrollElem   = isBody && !webkit ? docEl : elem,
        	
            //TODO Android未测试
            
            //webkit只在documentELement上返回正确的窗口尺寸
            //在ios里，documentELement.clientWidth/clientHeight不可靠，因为导航条会被顶上去
            //但是ios里，window.innerWidth/innerHeight能提供实时的窗口大小

            viewportElem = iosHack ? win : (isBody && webkit ? docEl : scrollElem),
            
            viewportHeight = iosHack ? viewportElem.innerHeight : viewportElem.clientHeight,
            viewportWidth  = iosHack ? viewportElem.innerWidth : viewportElem.clientWidth,

            scrollLeft   = scrollElem.scrollLeft,
            scrollHeight = scrollElem.scrollHeight,
            scrollTop    = scrollElem.scrollTop,
            scrollWidth  = scrollElem.scrollWidth,

            scrollBottom = scrollTop + viewportHeight,
            scrollRight  = scrollLeft + viewportWidth;
        
        margin = margin || 0;
        
        return {
            atBottom: scrollBottom >= (scrollHeight - margin),
            atLeft  : scrollLeft <= margin,
            atRight : scrollRight >= (scrollWidth - margin),
            atTop   : scrollTop <= margin,

            viewportHeight: viewportHeight,
            viewportWidth : viewportWidth,
            
            scrollable  : scrollHeight > viewportHeight,
            
            scrollBottom: scrollBottom,
            scrollHeight: scrollHeight,
            scrollLeft  : scrollLeft,
            scrollRight : scrollRight,
            scrollTop   : scrollTop,
            scrollWidth : scrollWidth
	    };
   	};
    
    return ScrollMonitor;
    
}, {
    requires: ['node', 'event', 'base']
});