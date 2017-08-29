$(function() {
	$('#date-text').html(moment().format('MMMM D, YYYY'));

	var workoutData;
	var relapseData;
	var challengeData;
	var workoutsByWeekData;

	var my_canvas_obj= document.getElementById("my-canvas-element");

	//create a configured gauge
	var gauge = new fabledweb.Gauge({
	        "tick_length": 30,
	        "large_tick_length": 60,
	        "tick_thickness": 5,
	        "num_sub_ticks": 4,
	        "total_degrees": 180,
	        "tick_color": "#554cac",
	        "tick_on_color": "#527d98",
	        "tick_on_glow": 20,
	        "bg_image": null,
	        "gauge_scale": .9,
	        "animation_duration": 1000,
	        "percent": 75,
	        "canvas": my_canvas_obj
	});
	
	gauge.render(); //render the configured gauge

	function updateGauge(number){
		var color;
		var colorText;
		var percentage = parseInt(number * 11.1);

		if(number <= 4){
			color = '#39c8ce';
			colorText = 'green';
		} else if (number <= 7){
			color = '#dbbb1f';
			colorText = 'yellow';
		} else {
			color = '#fd526a';
			colorText = 'red';
		}

		$('#color-indicator').css('color', color).text(colorText);

		gauge.tick_on_color = color;
		gauge.updatePercent(percentage);
		gauge.render();
	};

	var loadDataRenderCharts = function(err, data){
		workoutData = data.workouts
		relapseData = data.relapses;
		challengeData = data.challenges;
		updateCharts();
	};

	function updateCharts(){
		$('.last-workout').text(updateLastOccurrence(workoutData));
		$('.clean-time').text(updateLastOccurrence(relapseData));
		$('.total-workouts').text(consecutiveWorkoutDays(workoutData));
		updateRelapseMeter(relapseRisk(workoutData));
		mapRelapses(relapseData, workoutData);
		buildDonutChart(dataTransformer.typeDonutChart(workoutData), "FitMo", "#workout-donut-chart svg");
		buildBarChart(dataTransformer.typeBarChart(workoutData), "Workouts by Type", "#workout-bar-chart svg");
		buildLineChart(dataTransformer.typeLineChart(workoutData), "Workouts by Duration (min)", "#workout-line-chart svg");
		updateGauge(relapseRisk(workoutData));
	};

	d3.json('../json/workouts.json', loadDataRenderCharts);

	// logs relapse data when modal is closed
	$('#relapse-modal').on('hidden.bs.modal', function(){
		console.log(buildRelapseObject());
		relapseData.push(buildRelapseObject());
		$('#clean-time').text(updateLastOccurrence(relapseData));
		updateCharts();
		console.log('relapse submitted')
	});

		// logs workout data when modal is closed
	$('#workout-modal').on('hidden.bs.modal', function(){
		workoutData.push(buildWorkoutObject());
		updateCharts();
	});


	 $('#weekly').on('click', function(){
		buildLineChartByWeek(
			dataTransformer.typeLineByWeeks(workoutData), 
			"Workouts by week", "#workout-line-chart svg"
		);
	});

	 $('#daily').on('click', function(){
		buildLineChart(
			dataTransformer.typeLineChart(workoutData),
			"Workouts by Day", '#workout-line-chart svg'
		);
	});

	function buildWorkoutObject(){
		var typeInput = $('#type-input').val();
		var durationInput = Number($('#duration-input').val());
		var intensityInput = Number($('input[name="intensity"]:checked').val());
		var relapseInput = Number($('input[name="relapse-urge"]:checked').val());
		var funFactorInput = Number($('input[name="fun"]:checked').val());
		var today = new Date();
		var obj = {date: today, type: typeInput, duration: durationInput, intensity: intensityInput, urge_to_relapse: relapseInput,fun_factor: funFactorInput}; 
		console.log(obj);
		return obj;
	};

	function buildRelapseObject(){
		var today = new Date();
		var substanceType = $('input[name="substance-type"]:checked').val();
		var place = $('#location-input').val();
		var associations = $('input[name="association-type"]:checked').val();
		var emotion = $('input[name="emotion-type"]:checked').val();
		var attitude = $('input[name="attitude-type"]:checked').val();
		var obj = {date: today, subtance: substanceType, location: place, associations: associations, emotions: emotion, attitude: attitude};
		return obj;
		
	};

	function updateLastOccurrence(data){
		var recent = data[data.length - 1];

		var today = new Date().getTime();
		var last = new Date(recent.date).getTime();

		var days = Math.floor((today - last) / 1000 / 60 / 60 / 24);
		if(days < 0){
			return 0;
		}

		$('.clean-time').text(days);
		return days;
	};

	function updateRelapseMeter(num){
		var $relapseText = $('#relapse-meter');
		if(num <= 3){
			// $relapseText.css('color', 'limegreen').text(num);
			$relapseText.text(num);
		} else if(num > 3 && num <= 6){
			// $relapseText.css('color', 'yellow').text(num);
			$relapseText.text(num);
		} else {
			// $relapseText.css('color', 'red').text(num);
			$relapseText.text(num);
		}
		updateGauge(num);
	};

	function relapseRisk(data){
		var total_risk = 0
		var lastFive = data.slice(data.length - 5);

		lastFive.forEach(function(workout){
			total_risk += workout.urge_to_relapse;
		});

		return (total_risk / lastFive.length).toFixed(1);
	};

	function consecutiveWorkoutDays(data){
		var today = Math.floor(new Date().getTime() / 86400000);
		var dayCount = 0, i = 1;

		var lastWorkout = Math.floor(new Date(data[data.length - i].date).getTime() / 86400000);

		while(data[data.length - i].duration > 0 && today - lastWorkout <= 1){
			dayCount++;
			i++;
			today = lastWorkout;
			lastWorkout = Math.floor(new Date(data[data.length - i].date).getTime() / 86400000);
		}
		return dayCount;
	}

	var month = 11;
	var day = 30;
	var year = 2015;

	function addWorkoutObject(){
		var types = ['running', 'tennis', 'yoga'];
		var category = ['cardio', 'strength', 'sports'];
		var durations = [0, 15, 30, 45, 60, 90];
		var randomTypeNum = Math.floor(Math.random() * types.length);
		var randomDurationNum = Math.floor(Math.random() * durations.length);
		var today = new Date().getTime();

		var obj = {
			date: month + '/' + day + '/' + year,
			type: types[randomTypeNum],
			duration: durations[randomDurationNum],
			intensity: Math.floor(Math.random() * 9 + 1),
			urge_to_relapse: Math.floor(Math.random() * 9 + 1),
			fun_factor: Math.floor(Math.random() * 9 + 1),
			category: category[Math.floor(Math.random() * category.length)]
		};

		
		workoutData.shift();
		workoutData.push(obj);
		day++;
		if(day == 32){
			day = 1;
			month++;
			if(month == 13){
				month = 1;
				year++;
			}
		}
		updateCharts();
	};

	 setInterval(addWorkoutObject, 3000);

	function mapRelapses(data1, data2){
		data1.forEach(function(relapse){
			data2.forEach(function(workout){
				if(relapse.date === workout.date){
					workout.relapse = true;
				}
			})
		})
	};

	$('#fitness-challenge-btn').on('click', function(){
		var total = 0;
		var avg = (Math.random() * 20 + 60).toFixed(2);
		console.log(avg);
		$('input:checked').each(function(){
			total += Number($(this).val());
		})
		$('.fitness-challenge-score').html(total * 2);
		$('.fitness-challenge-score-avg').html(avg);

	})

	// $('#fitness-challenge-modal').modal('show');

	$('#interface p').each(function(index){
		$(this).hide().delay(900 * index).fadeIn(1000);
	})

});