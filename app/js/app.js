'use strict';

angular.module('treehouse', ['hamburgerHelper', 'ngTouch', 'duScroll', 'previewGrid', 'uiGmapgoogle-maps'])
	.controller('MainController', function ($scope, $window, $log, Global, uiGmapGoogleMapApi){

		$scope.global = Global;

		if(!Modernizr.touch){
			var windowHeight = $window.innerHeight;
			var smController = new ScrollMagic.Controller();

			var logoTop = windowHeight + 140 + "px";

			new ScrollMagic.Scene({	duration: windowHeight - 80 })
				.setTween("#hero__logo", 0.5, { top: logoTop, width: "80px", marginLeft: "-40px", transform: "rotateY(0deg)" })
				.addTo(smController);

			new ScrollMagic.Scene({	duration: windowHeight / 2 })
				.setTween("#treehouse", 0.5, { opacity: 0, marginTop: "-100px" })
				.addTo(smController);

			new ScrollMagic.Scene({	duration: windowHeight / 2 })
				.setTween("#studios", 0.5, { marginTop: "-150px", opacity: 0 })
				.addTo(smController);

			new ScrollMagic.Scene({	duration: windowHeight / 2 })
				.setTween("#mouse", 0.5, { opacity: 0 })
				.addTo(smController);

		}

		$scope.coords = {
			sydney: { latitude: -33.8791282, longitude: 151.2157934 },
			melbourne: { latitude: -37.8272442, longitude: 144.9933963 },
		}

	    var mapObj;

		$scope.map = { 
			center: $scope.coords.melbourne, 
			zoom: 17,
			events: {
				tilesloaded: function(map){
					mapObj = map;
				}
			}
		};

		$scope.switchMap = function(coords){
			mapObj.setCenter(coords);
		}

		$scope.c = {
			attempted: false,
			loading: false,
			disabled: false,
			buttonText: "Drop that line"
		};

		$scope.submitContact = function(isValid){
			if(isValid){
				$scope.loading = true;
				$scope.c.buttonText = '<i class="fa fa-circle-o-notch fa-spin"></i>';

				$http({
					method: 'POST',
					url: window.AJAX.url,
					params: {
						nonce: window.AJAX.nonce,
						contact: $scope.c
					}
				})
				.success(function(resp){
					$scope.c.buttonText = 'Thanks! Talk to you soon.';
					$scope.c.disabled   = true;
				})
			} else {
				$scope.attempted = true;
			}
		}


		$scope.items = [
		{
			preview: 'images/preview.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview1.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING2',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview2.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING3',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview3.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING4',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview4.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview1.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING2',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview3.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING3',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
		{
			preview: 'images/preview4.jpg',
			fallbackUrl: 'http://google.com',
			content: {
				title: 'SOMETHING4',
				description: 'blah blah blah',
				images: [
					{ url: 'images/preview.jpg' },
					{ url: 'images/preview1.jpg' },
					{ url: 'images/preview2.jpg' },
					{ url: 'images/preview3.jpg' },
					{ url: 'images/preview4.jpg' },
				]
			}
		},
	];
	})

.directive('stickyHeader', function ($document, $window, Interface, Global){
	return {
		restrict: 'AC',
		link: function(scope, el, attrs){
			var elScroll  = el[0].offsetTop;
			$document.on('scroll', function(){
				var docScroll = document.body.scrollTop;
				if(docScroll >= elScroll){
					el.addClass('stick');
					Interface.logo.addClass('hide').removeClass('animation');
				} else if (docScroll < elScroll) {
					el.removeClass('stick');
					Interface.logo.removeClass('hide');

					if(Global.menuOpen){
						Global.menuOpen = false;
						scope.$apply();
					}
				}
			});
		}
	}
})

.directive('logo', function ($document, Interface){
	return {
		restrict: 'AC',
		link: function(scope, el){
			Interface.logo = el;
		}
	}
})

.service('Interface', function(){

	var Interface = {
		logo: {}
	};

	return Interface;
})

.service('Global', function(){
	var Global = {
		menuOpen: false
	};

	return Global;
})

.filter('trust', function($sce){
	return function(input){
		return $sce.trustAsHtml(input);
	}
})