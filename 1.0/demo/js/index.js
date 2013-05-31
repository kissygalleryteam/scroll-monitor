S.use('node,sizzle,ajax,rich-base,gallery/scroll-monitor/1.0/,gallery/juicer/1.0/', function (S, Node, Sizzle, Ajax, RichBase, ScrollMonitor, Juicer) {
    
    var DribbbleLoader = RichBase.extend({
        
        initializer: function() {
            this.container = this.get('container');
            this.template = Juicer(this.get('template'));
            this.resultFormatter = this.get('resultFormatter');
            this.pageNum = 0;
            
            this.initScrollMonitor();
        },
        
        destructor: function() {
            this.monitor.destroy()    
        },
        
        initScrollMonitor: function() {
            this.monitor = new ScrollMonitor({
                node: 'body',
                margin: 70
            });
            this.monitor.on('scrollToBottom', function(e) {
                this.load();
            }, this);
        },
        
        run: function() {
            this.monitor.run();
            return this;
        },
        
        stop: function() {
            this.monitor.stop();
            return this;    
        },
        
        add: function(r) {
            this.container.append(this.tpl(r));
            this.fire('add');
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
        
        load: function() {
            var self = this,
                url = this.get('API') + '?' + S.param({
                    'per_page': this.get('pageSize'),
                    'page': ++this.pageNum
                });
            
            S.jsonp(url, function(r) {
                if (r && r.shots && r.shots.length) {
                    self.add(r);
                } else {
                    if (r && (!r.shots || r.shots.length)) {
                        self.fire('end');
                    } else {
                        self.fire('error');
                    }
                }
            });
            
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
                getter: function(v) {
                    return S.UA.mobile ? Math.ceil(v / 2) : v;    
                },
                value: 20
            },
            
            API: {
                value: 'http://api.dribbble.com/shots/popular'
            }
            
        }
        
    });
    
    var loader = new DribbbleLoader({
        container: '.db-list',
        pageSize: 32,
        template: S.one('#J_db_template').html()
    });
    
    var loadingText = S.one('.db-loading span'),
        loadingIcon = S.one('.db-loading b'),
        added = false;
    
    function updateLoadingText(text) {
        loadingText.html(text);
    }
    
    function stopIconAnimation() {
        loadingIcon.addClass('stop');
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
    
    loader.on('add', function() {
        if (!added) {
            updateLoadingText('Loading More Shots...');
        }
        added = true;
        var imgs = S.query('.db-item img'),
            i = imgs.length - 1,
            e = i - 32;
            
        for (; i > e; i--) {
            imgs[i] && bindImageLoad(imgs[i]);
        }
    });
    
    loader.on('end', function() {
        updateLoadingText('No More Shots.');
        stopIconAnimation();
        this.stop();
    });
    
    loader.on('error', function() {
        updateLoadingText('Loading Error!');
        stopIconAnimation();
        this.stop();
    });
    
    loader.run();
        
});