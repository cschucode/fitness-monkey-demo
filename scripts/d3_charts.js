function setChartViewBox() {
    var w = width * zoom,
        h = height * zoom;

    chart
        .width(w)
        .height(h);

    d3.select(selector)
        .attr('viewBox', '0 0 ' + w + ' ' + h)
        .transition().duration(1200)
        .call(chart);
}

function resizeChart(aspect) {
    var container = d3.select('#workout-line-chart');
    var svg = container.select('svg');
    var targetWidth = parseInt(container.style('width'));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));  
}

function buildLineChart(data, title, selector){

	nv.addGraph(function() {
        var chart = nv.models.lineChart();
        var width = 900;
        var height = 200;
        var zoom = 1;

        chart.useInteractiveGuideline(true);

        chart.xAxis
            .tickFormat(function(d) {
                // I didn't feel like changing all the above date values
                // so I hack it to make each value fall on a different date
                return d3.time.format('%a %m/%e' )(new Date(d));
            });
      
        chart.lines.dispatch.on("elementClick", function(evt) {
            console.log(evt);
        });

        chart.yAxis
            .axisLabel('Duration of Workouts (min)')
            .tickFormat(d3.format(',.0f'));



        d3.select(selector)
            .attr('perserveAspectRatio', 'xMinYMid')
            .attr('width', width)
            .attr('height', height)
            .datum(data)
            .call(chart)

        var aspect = width / height;
        nv.utils.windowResize(resizeChart(aspect));

        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
        // Resizing because of the viewbox and perserveAspectRatio settings
        // This scales the interior of the chart unlike the above
        
        // d3.selectAll('text').style({'font-family': 'ProximaNova-Light', 'fill': '#00ebd2'});


		return chart;
	});
};

function buildLineChartByWeek(data, title, selector){

	nv.addGraph(function() {
        var chart = nv.models.lineChart();
        var fitScreen = false;
        var width = 900;
        var height = 200;
        var zoom = 1;

        chart.useInteractiveGuideline(true);

        chart.xAxis
        	.axisLabel('Workouts by week of the year')
            .tickFormat(function(d) {
                // I didn't feel like changing all the above date values
                // so I hack it to make each value fall on a different date
                return d3.time.format('%m/%e' )(new Date(d));
            });
      
        chart.lines.dispatch.on("elementClick", function(evt) {
            console.log(evt);
        });

        chart.yAxis
            .axisLabel('Duration of Workouts (min)')
            .tickFormat(d3.format(',.0f'));

        d3.select(selector)
            .attr('perserveAspectRatio', 'xMinYMid')
            .attr('width', width)
            .attr('height', height)
            .datum(data)
            .call(chart);

    	var aspect = width / height;
        nv.utils.windowResize(resizeChart(aspect));

        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
        // Resizing because of the viewbox and perserveAspectRatio settings
        // This scales the interior of the chart unlike the above
       
        // d3.selectAll('text').style({'font-family': 'ProximaNova-Light', 'fill': '#00ebd2'});

		return chart;
	});
}

function buildDonutChart(data, title, selector){

	var height = 350;
	var width = 750;

	var chart1;

    nv.addGraph(function() {
        var chart1 = nv.models.pieChart()
        	.color(['#fd526a', '#dbbb1f', '#39c8ce', '#dd4cab', '#554cac', '#2867d5', '#2a2930'])
            .legendPosition('right')
            .x(function(d) { return d.key })
            .y(function(d) { return d.y })
            .donut(true)
            .width(width)
            .height(height)
            .padAngle(.05)
            .cornerRadius(5)
            .id('donut1') // allow custom CSS for this one svg

        chart1.title(title);
        chart1.pie
        	// .labelsOutside(true)
        	.donut(true)
        	.showLabels(false);

        d3.select(selector)
            .datum(data)
            .transition().duration(1200)
            .call(chart1);

        nv.utils.windowResize(chart1.update);
        d3.selectAll('text').style('font-family', 'ProximaNova-Light');

        return chart1;

    });
};

function buildBarChart(data, title, selector){
	var chartData = [
		        {
		            key: title,
		            values: data
		        }];

	nv.addGraph(function() {
		var chart = nv.models.discreteBarChart()
    		.x(function(d) { return d.label })
    		.y(function(d) { return d.value })
    		.staggerLabels(true)
    		// .staggerLabels(historicalBarChart[0].values.length > 8)
    		.showValues(true)
    		.duration(1200)
    		.color(['#fd526a', '#dbbb1f', '#39c8ce']);

    	chart.yAxis
    		.ticks(5)
        	.axisLabel('Ranking of Fun by Category')
            
  
		d3.select(selector)
    		.datum(chartData)
    		.call(chart);

		nv.utils.windowResize(chart.update);
		d3.selectAll('text').style('font-family', 'ProximaNova-Light');
		return chart;
	});
};

var dataTransformer = {
	typeLineByWeeks: function(data){
		var dataObj = {};
		var objStorage = [];
		var relapseZoneStorage = [];

		data.forEach(function(obj){
			//console.log(obj);
			obj.weekStart = moment(obj.date).startOf('week').format("MM-DD-YY");
			//console.log(obj.weekStart)
			var prop = new Date(obj.weekStart).getTime();
			if(dataObj[prop]){
				dataObj[prop] += obj.duration
			} else {
				dataObj[prop] = obj.duration;
			}
		});
		for(var key in dataObj){console.log(dataObj[key]);
			objStorage.push({x: key, y: dataObj[key]});
			relapseZoneStorage.push({x: key, y: 160});
		}

		return [
			{
				values: objStorage,
				key: 'Duration of workouts by week',
				color: "#dbbb1f"
			},
			{
				values: relapseZoneStorage,
				key: 'Relapse Zone',
				color: '#fd526a'
			}
		];
	},
	typeLineChart: function(data){
		var objStorage = [];
		var relapseZoneStorage = [];

		var dateNum; 
		data.forEach(function(item, idx){
			dateNum = new Date(item.date);
			objStorage.push({x: dateNum, y: item.duration});
			relapseZoneStorage.push({x: dateNum, y: 40});
		});

		var results = [
				{
					values: objStorage,
					key: "Duration of Workouts",
					color: "#dbbb1f"	
				},
				{
					values: relapseZoneStorage,
					key: 'Relapse Zone',
					color: '#fd526a'	
				}	
			];
		return results;
	},
	typeDonutChart: function(data){
		var typeObj = {};
		var results = [];

		data.forEach(function(item){
			if(item.type === null){
				return;
			}
			else if(typeObj[item.type]){
				typeObj[item.type].urge_to_relapse += item.urge_to_relapse;
				typeObj[item.type].count++;
			} else {
				typeObj[item.type] = {urge_to_relapse: item.urge_to_relapse, count: 1};
			}
		})

		for(var key in typeObj){
			results.push({
				key: key, y: (typeObj[key].urge_to_relapse / typeObj[key].count)
			})
		}

		return results;
	},
	typeBarChart: function(data){
		var typeObj = {};
		var results = [];
		var cardioNum = strengthNum = sportsNum = 0;

		data.forEach(function(obj){
			if(obj.category == 'cardio'){
				cardioNum++;
			} else if(obj.category == 'strength'){
				strengthNum++
			} else if(obj.category == 'sports'){
				sportsNum++;
			}
			if(obj.category == null){
				return;
			} else if(typeObj[obj.category]){
				typeObj[obj.category] += obj.fun_factor;
			} else {
				typeObj[obj.category] = obj.fun_factor;
			}
		})

		for(var key in typeObj){
			if(key == 'cardio'){
				results.push({'label': key, 'value': typeObj[key] / cardioNum});					
			} else if(key == 'strength'){
				results.push({'label': key, 'value': typeObj[key] / strengthNum});
			} else {
				results.push({'label': key, 'value': typeObj[key] / sportsNum});
			}

		}
		return results;
	}
};
