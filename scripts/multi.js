function buildLineChart(data, title, selector){
		nv.addGraph(function() {
	        var chart = nv.models.lineChart();
	        var fitScreen = false;
	        var width = 900;
	        var height = 200;
	        var zoom = 1;

	        chart.useInteractiveGuideline(true);

	        chart.xAxis
	        	.axisLabel("Dates")
                .tickFormat(function(d) {
                    // I didn't feel like changing all the above date values
                    // so I hack it to make each value fall on a different date
                    return d3.time.format('%x')(new Date(d));
                });
	      
	        chart.lines.dispatch.on("elementClick", function(evt) {
	            console.log(evt);
	        });

	        chart.yAxis
	            .axisLabel('Duration of Workouts (min)')
	            .tickFormat(d3.format(',.0f'));

	        d3.select('#workout-line-chart svg')
	            .attr('perserveAspectRatio', 'xMinYMid')
	            .attr('width', width)
	            .attr('height', height)
	            .datum(dataTransformer.typeLineChart(workoutData));

			setChartViewBox();
			resizeChart();

	        nv.utils.windowResize(resizeChart);

	        d3.select('#zoomIn').on('click', zoomIn);
	        d3.select('#zoomOut').on('click', zoomOut);

	        function setChartViewBox() {
	            var w = width * zoom,
	                h = height * zoom;

	            chart
	                .width(w)
	                .height(h);

	            d3.select('#workout-line-chart svg')
	                .attr('viewBox', '0 0 ' + w + ' ' + h)
	                .transition().duration(1200)
	                .call(chart);
	        }

	        function zoomOut() {
	            zoom += .25;
	            setChartViewBox();
	        }

	        function zoomIn() {
	            if (zoom <= .5) return;
	            zoom -= .25;
	            setChartViewBox();
	        }

	        // This resize simply sets the SVG's dimensions, without a need to recall the chart code
	        // Resizing because of the viewbox and perserveAspectRatio settings
	        // This scales the interior of the chart unlike the above
	        function resizeChart() {
	            var container = d3.select('#workout-line-chart');
	            var svg = container.select('svg');

	            if (fitScreen) {
	                // resize based on container's width AND HEIGHT
	                var windowSize = nv.utils.windowSize();
	                svg.attr("width", windowSize.width);
	                svg.attr("height", windowSize.height);
	            } else {
	                // resize based on container's width
	                var aspect = chart.width() / chart.height();
	                var targetWidth = parseInt(container.style('width'));
	                svg.attr("width", targetWidth);
	                svg.attr("height", Math.round(targetWidth / aspect));
	            }
	        }
	        d3.selectAll('text').style({'font-family': 'ProximaNova-Light', 'fill': '#00ebd2'});
    		return chart;
		});
	};

	,
		typeLineChart: function(data){
			var objStorage = [];
			var relapseZoneStorage = [];
			var relapseStorage = [];

			var dateNum; 
			data.forEach(function(item, idx){
				dateNum = new Date(item.date);
				objStorage.push({x: dateNum, y: item.duration});
				relapseZoneStorage.push({x: dateNum, y: 40});
				if(item.relapse == true){
					relapseStorage.push({x: dateNum, y: 120});
				} else {
					relapseStorage.push({x: dateNum, y: 0});
				}
			});

			var results = [
					{
						values: objStorage,
						key: "Duration of Workouts",
						color: "#00ebd2"	
					},
					// {
					// 	values: relapseZoneStorage,
					// 	key: 'Relapse Zone',
					// 	color: '#c40147'	
					// },
					{
						values: relapseStorage,
						key: 'Relapses',
						color: '#c40147'
					}	
				];
			return results;
		}