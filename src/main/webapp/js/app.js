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
				var address = this.$("#location").val();
				
				console.log("skills : "+skills);
				console.log("address : "+address);
				
				var self = this;
				geocoder = new google.maps.Geocoder();
				geocoder.geocode( { 'address': address}, function(results, status) {
				      if (status == google.maps.GeocoderStatus.OK) {
				    	  var longitude = results[0].geometry.location.lng();
				    	  var latitude = results[0].geometry.location.lat();
				    	  console.log('longitude .. '+longitude);
				    	  console.log('latitude .. '+latitude);
				    	  
							$.get("api/jobs/"+skills+"/?longitude="+longitude+"&latitude="+latitude  , function (results){ 
			                    $("#jobSearchForm").unmask();
			                    self.renderResults(results,self);
			                });
				        
				      } else {
				        alert("Geocode was not successful for the following reason: " + status);
				        $("#jobSearchForm").unmask();
				      }
				});
				
				 
			},
			
			renderResults : function(results,self){
				_.each(results,function(result){
					self.renderJob(result);
				});
				
			},
			
			renderJob : function(result){
				var jobView = new LocalJobs.JobView({result : result});
				$("#results").append(jobView.render().el);
			},
			
			

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