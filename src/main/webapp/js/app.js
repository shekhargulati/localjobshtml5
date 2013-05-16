// app.js
(function($){

		var LocalJobs = {};
		window.LocalJobs = LocalJobs;
		
		var template = function(name) {
			return Mustache.compile($('#'+name+'-template').html());
		};
		
		LocalJobs.HomeView = Backbone.View.extend({
			tagName : "form",
			el : $("#main"),
			
			events : {
				"submit" : "findJobs"
			},
			
			render : function(){
				console.log("rendering home page..");
				$("#results").empty();
				return this;
			},
			
			findJobs : function(event){
				console.log('in findJobs()...');
				event.preventDefault();
				$("#results").empty();
				$("#jobSearchForm").mask("Finding Jobs ...");
				var skills = this.$('input[name=skills]').val().split(',');
				
				console.log("skills : "+skills);
				
				var self = this;
				
				  var mapOptions = {
				    zoom: 3,
				    center: new google.maps.LatLng(-34.397, 150.644),
				    mapTypeControlOptions: {
				      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
				    },
				    mapTypeId: google.maps.MapTypeId.ROADMAP,
				    zoomControlOptions: {
					  style: google.maps.ZoomControlStyle.SMALL
				  	}
				  };
				  var map = new google.maps.Map(document.getElementById('map-canvas'),
				      mapOptions);
				
				
				navigator.geolocation.getCurrentPosition(function(position){
					var longitude = position.coords.longitude;
			    	var latitude = position.coords.latitude;
			    	console.log('longitude .. '+longitude);
			    	console.log('latitude .. '+latitude);
			    	
			    	$("#jobSearchForm").unmask();
			    	self.plotUserLocation(new google.maps.LatLng(latitude, longitude),map);
			    	  
			    	$.get("api/jobs/"+skills+"/?longitude="+longitude+"&latitude="+latitude  , function (results){ 
		                    $("#jobSearchForm").unmask();
		                    self.renderResults(results,self,map);
		             });
				}, function(e){
					$("#jobSearchForm").unmask();
					switch (e.code) {
						case e.PERMISSION_DENIED:
							alert('You have denied access to your position. You will ' +
									'not get the most out of the application now.'); 
							break;
						case e.POSITION_UNAVAILABLE:
							alert('There was a problem getting your position.'); 
							break;
						case e.TIMEOUT:
									alert('The application has timed out attempting to get ' +
											'your location.'); 
							break;
						default:
							alert('There was a horrible Geolocation error that has ' +
									'not been defined.');
					}
				},
					{ timeout: 45000 }
				
				);
				
			},
			
			plotUserLocation : function(latLng , map){
				map.setCenter(latLng); 
				var marker = new google.maps.Marker({
					position: latLng,
					icon: 'http://icons.iconarchive.com/icons/icons-land/vista-people/48/Office-Customer-Male-Light-icon.png', 
					animation: google.maps.Animation.DROP
				}); 
				marker.setMap(map);
				map.setCenter(latLng);
				map.setZoom(3);
			},

			renderResults : function(results,self,map){
				var infoWindow = new google.maps.InfoWindow();
				_.each(results,function(result){
					self.renderJob(result,map , infoWindow);
				});
				
			},
			
			renderJob : function(result , map , infoWindow){
				result.marker = new google.maps.Marker({
					position: new google.maps.LatLng(result.latitude, result.longitude),
					icon: 'http://icons.iconarchive.com/icons/mad-science/olive/32/Martinis-Briefcase-icon.png', 
					animation: google.maps.Animation.DROP,
					title: result.jobTitle,
					html: this.jobInfo(result)
				});
				
				google.maps.event.addListener(result.marker, 'click', function() {
					map.setZoom(16);
					map.setCenter(result.marker.getPosition());
					infoWindow.setContent(this.html);
					infoWindow.open(map, this); 
				});
				
				google.maps.event.addListener(infoWindow,'closeclick',function(){
					map.setZoom(4);
				});
			
				result.marker.setMap(map);
			},
			
		 jobInfo : function(job) {
			var text = '';
			text += '<div class="job_info">';
			
			text += '<h3>' + job['jobTitle'] + '</h3>';
			text += '<p>' + job['formattedAddress'] + '</p>';
			text += '<p>' + job['companyName'] + '</p>';
			text += '<p>' + job['skills'] + '</p>';
			text += '<p>' + job['distance'] + ' KM</p>';
			return text;
		}
			
			

		});
		
		LocalJobs.JobView = Backbone.View.extend({
				template : template("job"),
				initialize  : function(options){
					this.result = options.result;
				},
		
				render : function(){
					this.$el.html(this.template(this));
					return this;
				},
				jobtitle : function(){
					return this.result['jobTitle'];
				},
				address : function(){
					return this.result['formattedAddress'];
				},
				skills : function(){
					return this.result['skills'];
				},
				company : function(){
					return this.result['companyName'];
				},
				distance : function(){
					return this.result['distance'] + " KM";
				}
				
				
				
		
		});
		
		
		LocalJobs.Router = Backbone.Router.extend({
			el : $("#main"),
			
			routes : {
				"" : "showHomePage"
			},
			showHomePage : function(){
				console.log('in home page...');
				var homeView = new LocalJobs.HomeView();
				this.el.append(homeView.render().el);
			}
		
		});
		
		var app = new LocalJobs.Router();
		Backbone.history.start();
		
		
})(jQuery);