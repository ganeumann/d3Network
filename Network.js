function Network(el) {
	
	//set up indices
	var nodeIndex = this.nodeIndex = {},
		nodeData = {};
	
	var bldIndex = function() {
		nodeIndex={};
		for (var i=0;i<nodes.length;i++) {nodeIndex[nodes[i]['id']]=i;};
	};
	
	//add/remove functions
    this.addNode = function (id, data) {
    	if (!(id in nodeIndex)) {
    		nodeIndex[id] = nodes.length;
	        nodes.push({'id':id});
	        nodeData[id] = data;
        	redraw();
        };
    };

    this.removeNode = function (id) {
    	if (id in nodeIndex) {	
	    	var n = nodeIndex[id];
    	
    	    // remove edges to/from id
    	    if (links.length>0) {
	        	for	(var i = links.length; i--;){
					if (links[i]['source']['id'] == id || links[i]['target']['id'] == id ) links.splice(i, 1);
				};
        	};
        	
			// remove node
        	nodes.splice(n,1);
        	delete nodeIndex[id];
        	delete nodeData[id];
        	bldIndex();
        	redraw();
        };
    };

    this.addLink = function (from, to) {
    	var f = nodeIndex[from],
    		t = nodeIndex[to];
    	if (f!=undefined && t!=undefined) {
    		var nexists = true;
    		$.each(links,function(i,v) {
    			if ((v.source.id==from&&v.target.id==to)
    				||(v.source.id==to&&v.target.id==from)) 
    				nexists=false
    			});
	        if (nexists) links.push({'source':f,'target':t});
    	    redraw();
    	};
    };
    
    this.removeLink = function (f, t) {
        for	(var i = links.length; i--;){
        	var lf = links[i]['source']['id'],
        		lt = links[i]['target']['id'];
			if ((lf == f && lt == t) || (lf == t && lt == f)) links.splice(i, 1);
		};
		redraw();
	};

	// info functions
	this.degree = function(id) {
		// return how many links to/from node id
		var cnt = 0;
		for	(var i =0; i<links.length; i++){
			if (links[i].source.id == id || links[i].target.id == id ) cnt++;
		};
		return cnt;
	};

    // setup viz
    var width = $(el).attr('width'),
        height = $(el).attr('height'),
    	zoomdraw = function () {vis.attr("transform","translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");},
    	vis0 = d3.select(el)
  			.append("svg:svg")
    			.attr("width", width)
    			.attr("height", height)
    			.attr("pointer-events", "all"),   
		vis1 = vis0.append('svg:g')
			.call(d3.behavior.zoom().on("zoom", zoomdraw))
			.on('dblclick.zoom',null);

	// pan zoom rectangle
	vis1.append('svg:rect')
    	.attr('width', width)
	    .attr('height', height)
    	.attr('fill', 'white');

	// credits outside the zoom and pan group so they don't zoom and pan
	vis0.append('svg:text')
		.attr('x',width-20)
		.attr('y',height-5)
		.attr('id','attrib')
		.text('Company and investor data from AngelList (http://www.angel.co)');					// Background text
	
	// this is the viz you are looking for
	var vis = this.vis = vis1.append('svg:g');
	
	// make sure nodes are on top of links
	var linkG = vis.append("g"),
    	nodeG = vis.append("g");
	
    var nodes = this.nodes = [],
        links = this.links = [];

    var force = d3.layout.force()
    	.nodes(nodes)
    	.links(links)
        .gravity(.1)
        .distance(100)
        .charge(-400)
        .size([width, height]);

    var redraw = function () {
        var link = linkG.selectAll('.link')
        		.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });

        link.enter().insert('line')
            .attr('class', 'link');

        link.exit().remove();

        var node = nodeG.selectAll('.nodep')
        		.data(force.nodes(),function(d) {return d.id});

        var nodeEnter = node.enter().append('g')
            .attr('class', 'nodep')
            .call(force.drag)
            .on("dblclick", expand) 																// not generic!
            .on("mousedown", function() { d3.event.stopPropagation(); });

        nodeEnter.append('svg:circle')
            .attr('r', 10)
            .attr('fill',function(d) {return (d.id>0 ? 'slateblue' : '#F60')})						// Color
            .attr('class','node');

        nodeEnter.append('text')
            .attr('class', 'nodetext')
            .attr('dx', 12)
            .attr('dy', '.35em')
            .text(function(d) {return nodeData[d.id]['name'];});            						// Display name
        nodeEnter.append('title')																	// Tooltip
            	.text(function(d) {return nodeData[d.id]['desc'];});

        node.exit().remove();

        force.on('tick', function() {
			node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
			link.attr('x1', function(d) { return d.source.x; })
              .attr('y1', function(d) { return d.source.y; })
              .attr('x2', function(d) { return d.target.x; })
              .attr('y2', function(d) { return d.target.y; });
        });

        force.start();
    };

    redraw();
};