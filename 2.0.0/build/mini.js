/*
combined files : 

kg/scroll-monitor/2.0.0/mini

*/
/**
 * ScrollMonitor
 * @fileoverview 滚动监听器
 * @author 虎牙<ningzbruc@gmail.com>
 * @date 2013-05-06
 * @version 0.0.1
 * @module scroll-monitor
 */

KISSY.add('kg/scroll-monitor/2.0.0/mini',function(S, Node, UA, Base) {

/**
 * 滚动监听器
 * @module scroll-monitor
 * @see http://yuilibrary.com/yui/docs/api/classes/Plugin.ScrollInfo.html 
 */
    
    'use strict';
    
    var win = window,
        doc = document,
        body = doc.body,
        docElem = doc.documentElement,
        winNode = S.one(win),
        
        ios = UA.ios,
        android = UA.android,
        webkit = UA.webkit,
        chrome = UA.chrome,
        
        RUN = 'run',
        NODE = 'node',
        DELAY = 'delay',
        MARGIN = 'margin',
        
        EMPTY = '',
        SPACE = ' ',
        
        EVT_RUN = RUN,
        EVT_STOP = 'stop',
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
                var n = S.one(v),
                    v = n && n[0];
                    
                //body, documentElement，window都当成body统一处理
                if (v === docElem || v === win) {
                    v = body;
                    return S.one(v);
                }
                
                return n;
            },
            getter: function(v) {
                return v || S.one(body);
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
         * @description 滚动距离偏差，上下左右写法类似css
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
        }
    };

    S.extend(ScrollMonitor, Base, {
        
        // -- Lifecycle Methods ----------------------------------------------------
        
        /**
         * 初始化
         * @method init
         * @public
         */
        initializer: function() {
            this._node = this.get(NODE);
            this._elem = this._node[0];
            
            this._isBody = this._elem === body;
            
            //body没有scroll事件，因此绑定到window上
            this._scrollElem = this._isBody ? win : this._elem;
            this._scrollNode = S.one(this._scrollElem);
            
            this._delay = this.get(DELAY);
            this._margin = this.get(MARGIN);
            
            this.publish(EVT_RUN, {
                defaultFn: this._defRunFn
            });
            this.publish(EVT_STOP, {
                defaultFn: this._defStopFn
            });
            
            this.on(AFTER_DELAY_CHANGE, this._afterDelayChange);
            this.on(AFTER_MARGIN_CHANGE, this._afterMarginChange);
            this.on(AFTER_RUN_CHANGE, this._afterRunChange);
            
            this.get(RUN) && this.fire(EVT_RUN);
        },
        
        /**
         * 销毁
         * @method destructor
         * @public
         */
        destructor: function () {
            this.stop();
            
            delete this._node;
            delete this._elem;
            delete this._isBody;
            delete this._scrollElem;
            delete this._scrollNode;
            delete this._margin;
            delete this._delay;
            delete this._lastScroll;
            delete this._scrollTimeout;
        },
        
        // -- Public Methods -------------------------------------------------------
        
        /**
         * 检查当前滚动状态（手动触发scroll事件）
         * @method checkScroll
         * @param {Boolean} force 是否删除lastScroll信息，强制触发scroll事件，默认为true
         * @chainable
         * @public
         */
        checkScroll: function(force) {
            force !== false && (this._lastScroll = null);
            this._scrollNode.fire(EVT_SCROLL);
            return this;
        },
        
        /**
         * 获取滚动信息
         * @method getScrollInfo
         * @return {Object} info 当前滚动信息，包括滚动方向，滚动距离，是否到达边界
         * @public
         */
        getScrollInfo: function () {
            var info = ScrollMonitor.getScrollInfo(this._elem, this._margin),
                lastScroll = this._lastScroll,
                hasLast = !!lastScroll;
            
            //TODO
            //Mac触控板和手机设备触控下拉到边界时，会有一个弹动的效果，这个时候依然发生scroll事件
            //是否增加isBounce等属性
            
            return S.merge(info, {
                isScrollDown : hasLast && info.scrollTop > lastScroll.scrollTop,
                isScrollUp   : hasLast && info.scrollTop < lastScroll.scrollTop,
                isScrollLeft : hasLast && info.scrollLeft < lastScroll.scrollLeft,
                isScrollRight: hasLast && info.scrollLeft > lastScroll.scrollLeft,
                
                lastScroll: lastScroll,
                directionXChange: !lastScroll || (lastScroll.isScrollLeft !== info.isScrollLeft) || (lastScroll.isScrollRight !== info.isScrollRight),
                directionYChange: !lastScroll || (lastScroll.isScrollUp !== info.isScrollUp) || (lastScroll.isScrollDown !== info.isScrollDown)
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
            this._scrollNode.on(EVT_SCROLL, this._afterScroll, this);
            winNode.on(EVT_RESIZE, this._afterResize, this);
        },
        
        /**
         * 解除滚动事件
         * @method _detachScroll
         * @protected
         */
        _detachScroll: function() {
            this._scrollNode.detach(EVT_SCROLL, this._afterScroll, this);
            winNode.detach(EVT_RESIZE, this._afterResize, this);
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
            var info = this.getScrollInfo();
            
            if (info.scrollTop < 0 || (info.scrollHeight - info.viewportHeight < info.scrollTop)) { return; }
            
            var facade = S.mix(info, { domEvent: e }),
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
            
            if (info.atLeft && !(lastScroll && lastScroll.atLeft)) {
                this.fire(EVT_SCROLL_TO_LEFT, facade);
            }
    
            if (info.atRight && (!lastScroll || !lastScroll.atRight || 
                info.scrollWidth > lastScroll.scrollWidth)) {    
                    
                this.fire(EVT_SCROLL_TO_RIGHT, facade);
            }
    
            if (info.atTop && !(lastScroll && lastScroll.atTop)) {
                this.fire(EVT_SCROLL_TO_TOP, facade);
            }
    
            if (info.atBottom && (!lastScroll || !lastScroll.atBottom || 
                info.scrollHeight > lastScroll.scrollHeight)) {
                    
                this.fire(EVT_SCROLL_TO_BOTTOM, facade);
            }
        },
        
        // -- Protected Event Default Handlers ---------------------------------------------
        
        /**
         * 默认run事件
         * @method _defRunFn
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _defRunFn: function(e) {
            this._runMonitor();   
        },
        
        /**
         * 默认stop事件
         * @method _defRunFn
         * @param {EventFacade} e 事件对象
         * @protected
         */
        _defStopFn: function(e) {
            this._stopMonitor();
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
            this.checkScroll(false);
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
                this.fire(EVT_RUN);
            } else {
                this.fire(EVT_STOP);
            }
        }
        
    });
    
    /**
     * 获取滚动信息
     * @method getScrollInfo
     * @param {String|HTMLElement|Node} selector 节点选择器
     * @param {Number} margin 偏移量，四个方向类似css写法，10/10 5/10 5 15/10 5 15 20
     * @return {Object} 当前滚动状态的信息（不包括滚动方向）
     * @static
     */
    ScrollMonitor.getScrollInfo = function(selector, margin) {
        var node = S.one(selector),
            elem = node && node[0],
            isBody = elem === body || elem === docElem || elem === win,
            viewportHack = isBody && (ios || android && chrome),
            
            //webkit只在body上返回正确的scroll信息，其他则是documentElement
            scrollElem   = isBody && !webkit ? docElem : elem,
            
            //webkit只在documentELement上返回正确的窗口尺寸
            //在ios里，documentELement.clientWidth/clientHeight不可靠，因为导航条会被顶上去
            //但是ios里，window.innerWidth/innerHeight能提供实时的窗口大小

            viewportElem = viewportHack ? win : (isBody && webkit ? docElem : scrollElem),
            
            viewportHeight = viewportHack ? viewportElem.innerHeight : viewportElem.clientHeight,
            viewportWidth  = viewportHack ? viewportElem.innerWidth : viewportElem.clientWidth,

            scrollLeft   = scrollElem.scrollLeft,
            scrollHeight = scrollElem.scrollHeight,
            scrollTop    = scrollElem.scrollTop,
            scrollWidth  = scrollElem.scrollWidth,

            scrollBottom = scrollTop + viewportHeight,
            scrollRight  = scrollLeft + viewportWidth,
            
            marginVals   = ((margin || 0) + EMPTY).split(SPACE),
            marginTop    = Number(marginVals[0]),
            marginRight  = Number(marginVals[1]),
            marginBottom = Number(marginVals[2]),
            marginLeft   = Number(marginVals[3]);
            
        switch (marginVals.length) {
            case 1:
                marginRight = marginBottom = marginLeft = marginTop;
                break;
            case 2:
                marginBottom = marginTop;
                marginLeft = marginRight;
                break;
            case 3:
                marginLeft = marginRight;
                break;
        }
        
        return {
            atBottom: scrollBottom >= (scrollHeight - marginBottom),
            atLeft  : scrollLeft <= marginLeft,
            atRight : scrollRight >= (scrollWidth - marginRight),
            atTop   : scrollTop <= marginTop,

            viewportHeight: viewportHeight,
            viewportWidth : viewportWidth,
            
            scrollHeight: scrollHeight,
            scrollWidth : scrollWidth,
            
            scrollable  : scrollHeight > viewportHeight,
            
            scrollTop   : scrollTop,
            scrollBottom: scrollBottom,
            scrollLeft  : scrollLeft,
            scrollRight : scrollRight
        };
    };
    
    return ScrollMonitor;
    
}, {
    requires: ['node', 'ua', 'base']
});
