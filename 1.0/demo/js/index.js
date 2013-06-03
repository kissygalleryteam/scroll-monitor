S.use('node,sizzle,ajax,rich-base,gallery/scroll-monitor/1.0/,gallery/juicer/1.0/', function (S, Node, Sizzle, Ajax, RichBase, ScrollMonitor, Juicer) {
    
    var DribbbleLoader = RichBase.extend({
        
        initializer: function() {
            this.container = this.get('container');
            this.template = Juicer(this.get('template'));
            this.resultFormatter = this.get('resultFormatter');
            this.pageNum = 0;
        },
        
        destructor: function() {
            this.monitor.destroy()    
        },
        
        empty: function() {
            this.abort();
            this.pageNum = 0;
            this.container.empty();
            this.fire('empty');  
            return this;
        },
        
        add: function(r, l) {
            this.container.append(this.tpl(r));
            this.fire('add', {
                size: l
            });
            return this;
        },
        
        tpl: function(r) {
            var data = this.resultFormatter ? this.resultFormatter.call(this, r) || null : r,
                html = '';
            
            if (data) {
                html = this.template.render(data);
            }
            
            return html;
        },
        
        setAPI: function(api, data) {
            if (DribbbleLoader.APIS[api]) {
                this.set('API', S.substitute(DribbbleLoader.APIS[api], data));
            }
            return this;
        },
        
        abort: function() {
            if (this._io) {
                this._io.aborted = true;   
                this._io = null;
                this.fire('abort');
            }
            return this;
        },
        
        load: function() {
            var self = this,
                url = DribbbleLoader.DOMAIN + this.get('API') + '?' + S.param({
                    'per_page': this.get('pageSize'),
                    'page': ++this.pageNum
                }),
                io = { aborted: false };
            
            this._io = io;
            
            S.jsonp(url, function(r) {
                if (io.aborted) { return; }
                if (r && r.shots && r.shots.length) {
                    self.add(r, r.shots.length);
                    if (Number(r.page) === r.pages) {
                        self.fire('end');
                    }
                } else {
                    if (r && (!r.shots || !r.shots.length)) {
                        self.fire('end');
                    } else {
                        self.fire('error');
                    }
                }
            });
            
            this.fire('load');
            
            return this;
        }
        
    }, {
        
        ATTRS: {
            
            container: {
                setter: function(v) {
                    return S.one(v);
                }
            },
            
            template: {
                value: ''    
            },
            
            resultFormatter: {
                value: null
            },
            
            pageSize: {
                value: 20
            },
            
            API: {
                value: '/shots/popular'
            }
            
        },
        
        APIS: {
            list     : '/shots/{list}',
            player   : '/players/{id}/shots',
            following: '/players/{id}/shots/following',
            likes    : '/players/{id}/shots/likes'
        },
        
        DOMAIN: 'http://api.dribbble.com'
        
    });
    
    var params = S.unparam(location.search.substring(1)),
        type = params['type'] || 'popular';
    
    var loader = new DribbbleLoader({
        container: '.db-list',
        pageSize: S.UA.mobile ? 16 : 32,
        template: S.one('#J_db_template').html()
    });
    
    var monitor = new ScrollMonitor({
        node: 'body',
        margin: 70
    });
    
    var loadingText = S.one('.db-loading span'),
        loadingIcon = S.one('.db-loading b'),
        added = false;
    
    function updateLoadingText(text) {
        loadingText.html(text);
    }
    
    function bindImageLoad(img) {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.onload = img.onerror = function() {
                img.onload = img.onerror = null;
                img.style.opacity = '1';    
            };
        }
    }
    
    monitor.on('scrollToBottom', function(e) {
        loader.load();
    });
    
    loader.on('add', function(e) {
        if (!added) {
            updateLoadingText('Loading More Shots...');
        }
        added = true;
        var imgs = S.query('.db-link img'),
            i = imgs.length - 1,
            end = i - e.size;
            
        for (; i > end; i--) {
            imgs[i] && bindImageLoad(imgs[i]);
        }

        monitor.checkScroll();
    });
    
    loader.on('empty', function() {
        updateLoadingText('Loading Shots...');
        added = false;
    });
    
    loader.on('load', function(e) {
        loadingIcon.removeClass('stop');
    });
    
    loader.on('end', function() {
        updateLoadingText('No More Shots.');
        loadingIcon.addClass('stop');
        monitor.stop();
    });
    
    loader.on('error', function() {
        updateLoadingText('Loading Error!');
        loadingIcon.addClass('stop');
        monitor.stop();
    });
    
    monitor.run();
    
    var dbList = S.one('.db-list'),
        tabs = S.one('.tabs'),
        tabItems = tabs.all('li'),
        playerTabs = tabs.all('.player');
    
    function load(target) {
        var api = target.attr('data-api'),
            cfg = target.attr('data-cfg').split(':'),
            data = {};
        
        data[cfg[0]] = cfg[1];
        monitor.stop();
        loader.empty();
        loader.setAPI(api, data);
        monitor.run();
    }
    
    tabs.delegate('click', 'li', function(e) {
        var target = S.one(e.currentTarget);
        if (!target.hasClass('active')) {
            tabItems.removeClass('active');
            target.addClass('active');
            if (!target.hasClass('player')) {
                 playerTabs.addClass('hidden');
            }
            load(target);
        }
    });
    
    dbList.delegate('click', '.db-over strong', function(e) {
        var target = S.one(e.currentTarget);
        e.halt();
        tabItems.removeClass('active');
        playerTabs.item(0).addClass('active');
        playerTabs.item(0).html(target.attr('data-player'));
        playerTabs.removeClass('hidden');
        playerTabs.attr('data-cfg', 'id:' + target.attr('data-id'));
        load(target);
    });
        
});