
KISSY.add(function(S, Node, Event, Ajax, RichBase) {
    
    var DOM = S.DOM,
    
    InfiniteScroll = RichBase.extend({
        
        initializer: function() {
                
        },
        
        destructor: function() {
            
        }
            
    }, {
        
        ATTRS: {
            
            container: {
                setter: function(v) {
                    return S.one(v);
                }
            }
            
        }
            
    });
    
    return InfiniteScroll;
    
}, {
    requires: ['node', 'event', 'ajax', 'rich-base']    
});
