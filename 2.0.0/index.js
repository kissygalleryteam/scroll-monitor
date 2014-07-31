/**
 * @fileoverview
 * @author
 * @module scroll-monitor
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *
     * @class ScrollMonitor
     * @constructor
     * @extends Base
     */
    function ScrollMonitor(comConfig) {
        var self = this;
        //调用父类构造函数
        ScrollMonitor.superclass.constructor.call(self, comConfig);
    }
    S.extend(ScrollMonitor, Base, /** @lends ScrollMonitor.prototype*/{

    }, {ATTRS : /** @lends ScrollMonitor*/{

    }});
    return ScrollMonitor;
}, {requires:['node', 'base']});



