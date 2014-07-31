KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('scroll-monitor', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','gallery/scroll-monitor/1.1/']});