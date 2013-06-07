## ScrollMonitor

- BY 虎牙

## 简介

> 滚动监视器，提供各种scroll的相关事件，实时获取滚动信息，PC与移动端同时支持，适用于无限滚动加载，SideBar滚动至某处显示/隐藏等等场景，非常方便。

## 开始使用

    <script>
        
        KISSY.use('gallery/scroll-monitor/1.0/', function(S, ScrollMonitor) {
            // 你的代码
        });
        
    </script>

## 简单例子

    KISSY.use('gallery/scroll-monitor/1.0/', function(S, ScrollMonitor) {
        
        // 初始化
        var monitor = new ScrollMonitor();
        
        // 绑定监听滚动到底部事件
        monitor.on('scrollToBottom', function(e) {
            
            // 加载更多内容
            var hasMore = loadMore();
            
            // 如果没有更多内容，停止监听
            if (hasMore) {
                this.stop();
            }
        });
        
        // 开始监听
        monitor.run();
        
    });

## 配置参数

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th width="100">参数名</th>
            <th width="130">默认值</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>node</td>
            <td>body</td>
            <td>滚动的元素，默认为body，documentElement与window也统一作body处理</td>
        </tr>
        <tr>
            <td>margin</td>
            <td>10</td>
            <td>距离边界多少距离触发到达事件，如滚动至底部还有10px时触发scrollToBottom事件，写法类似CSS里的margin（不带px），可定义四个方向的边界值，如<code>'10 5 20 15'</code></td>
        </tr>
        <tr>
            <td>delay</td>
            <td>15</td>
            <td>延迟触发滚动事件的时间，用于性能优化</td>
        </tr>
        <tr>
            <td>run</td>
            <td>false</td>
            <td>是否在初始化时就开始监听滚动事件，可以通过run/stop方法开始/停止监听</td>
        </tr>
    </tbody>
</table>

    var monitor = new ScrollMonitor({
        node: '.box',
        margin: '10 20 5 15',
        delay: 20,
        run: true
    });

## 事件列表

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th width="150">事件名</th>
            <th width="300">触发时机</th>
            <th>事件对象<code>e</code></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>scroll</td>
            <td>元素发生滚动时</td>
            <td>
                <dl>
                    <dt>
                        <code>scrollable</code>
                        <i>Boolean</i>
                    </dt>
                    <dd>
                        元素是否可滚动
                    </dd>
                    <dt>
                        <code>atTop/atBottom/atLeft/atRight</code>
                        <i>(Boolean)</i>
                    </dt>
                    <dd>
                        是否到达上下左右四个边界
                    </dd>
                    <dt>
                        <code>isScrollUp/isScrollBottom/isScrollLeft/isScrollRight</code>
                        <i>(Boolean)</i>
                    </dt>
                    <dd>
                        是否往上下左右四个方向滚动
                    </dd>
                    <dt>
                        <code>viewportWidth/viewportHeight</code>
                        <i>(Number)</i>
                    </dt>
                    <dd>
                        元素可视尺寸
                    </dd>
                    <dt>
                        <code>scrollWidth/scrollHeight</code>
                        <i>(Number)</i>
                    </dt>
                    <dd>
                        元素可滚动尺寸
                    </dd>
                    <dt>
                        <code>scrollTop/scrollBottom/scrollLeft/scrollRight</code>
                        <i>(Number)</i>
                    </dt>
                    <dd>
                        上下左右四个方向已滚动的距离
                    </dd>
                </dl>
            </td>
        </tr>
        <tr>
            <td>
                <p>scrollTop/scrollBottom</p>
                <p>scrollLeft/scrollRight</p>
            </td>
            <td>元素往上下左右四个方向滚动时</td>
            <td>同上</td>
        </tr>
        <tr>
            <td>
                <p>scrollToTop/scrollToBottom</p>
                <p>scrollToLeft/scrollToRight</p>
            </td>
            <td>元素滚动至上下左右四个边界时</td>
            <td>同上</td>
        </tr>
        <tr>
            <td>run/stop</td>
            <td>开始/停止监听滚动事件时</td>
            <td>无，如需知道当前滚动信息时，请使用getScrollInfo方法</td>
        </tr>
    </tbody>
</table>

## 常用方法

<div class="method-list">
    <div class="method-item">
        <h3>checkScroll <code>(force)</code></h3>
        <p>检查当前滚动状态，手动触发scroll事件</p>
        <h4>参数</h4>
        <ul>
            <li>
                <code>force</code>
                <i>(Boolean)</i>
                <p>强制触发scroll相关事件，默认为true，如果传入false，并且当前已到达边界处（如atBottom），则不会再次触发scrollBottom事件，true则反之</p>
            </li>
        </ul>
        <h4>返回值</h4>
        <ul>
            <li><code>this</code></li>
        </ul>
    </div>
    <div class="method-item">
        <h3>getScrollInfo <code>()</code></h3>
        <p>获取当前滚动信息</p>
        <h4>返回值</h4>
        <ul>
            <li>
                <code>scrollable</code>
                <i>(Boolean)</i>
                <p>元素是否可滚动</p>
            </li>
            <li>
                <code>atTop/atBottom/atLeft/atRight</code>
                <i>(Boolean)</i>
                <p>是否到达上下左右四个边界</p>
            </li>
            <li>
                <code>isScrollUp/isScrollBottom/isScrollLeft/isScrollRight</code>
                <i>(Boolean)</i>
                <p>是否往上下左右四个方向滚动</p>
            </li>
            <li>
                <code>viewportWidth/viewportHeight</code>
                <i>(Number)</i>
                <p>元素可视尺寸</p>
            </li>
            <li>
                <code>scrollWidth/scrollHeight</code>
                <i>(Number)</i>
                <p>元素可滚动尺寸</p>
            </li>
            <li>
                <code>scrollTop/scrollBottom/scrollLeft/scrollRight</code>
                <i>(Number)</i>
                <p>上下左右四个方向已滚动的距离</p>
            </li>
        </ul>
    </div>
    <div class="method-item">
        <h3>run <code>()</code></h3>
        <p>开始监听滚动事件</p>
        <h4>返回值</h4>
        <ul>
            <li><code>this</code></li>
        </ul>
    </div>
    <div class="method-item">
        <h3>stop <code>()</code></h3>
        <p>停止监听滚动事件</p>
        <h4>返回值</h4>
        <ul>
            <li><code>this</code></li>
        </ul>
    </div>
    <div class="method-item">
        <h3>ScrollMonitor.getScrollInfo <code>(node, margin)</code></h3>
        <p>获取当前节点滚动信息（构造器静态方法）</p>
        <h4>参数</h4>
        <ul>
            <li>
                <code>node</code>
                <i>(String/HTMLElement/Node)</i>
                <p>元素节点，同配置参数</p>
            </li>
            <li>
                <code>margin</code>
                <i>(String/Number)</i>
                <p>距离边界值，同配置参数</p>
            </li>
        </ul>
        <h4>返回值</h4>
        <p>同原型方法getScrollInfo，除<code>isScrollUp/isScrollBottom/isScrollLeft/isScrollRight</code>之外<p>
    </div>
</div>








