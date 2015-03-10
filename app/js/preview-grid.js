'use strict';

angular.module('previewGrid', ['ngAnimate', 'duScroll'])

/**
 * @ngdoc directive
 * @name googlePreivewApp.directive:previewGrid
 * @description
 * # previewGrid
 */
  .directive('previewGrid', function ($window, $previewProvider, $timeout, $rootScope) {
    return {
      template: '<ul class="grid">' +
                  '<preview-item ng-repeat="item in items" item="item"></preview-item>' +
				        '</ul>',
      restrict: 'E',
      replace: true,
      scope: {
      	items: '='
      },
      link: function postLink(scope, element, attrs) {
        
        var resizeTimer;

        angular.element($window).on('resize', function(){
          if(typeof $previewProvider.$instance != 'undefined'){
            $previewProvider.$instance.close();
            $previewProvider.current = -1;
          }

          $previewProvider.getWinsize();

          $timeout.cancel(resizeTimer);
          resizeTimer = $timeout(function(){
            $rootScope.$broadcast('resizeOver');
          }, 1000);
        });
      }
    };
  })

/**
 * @ngdoc directive
 * @name googlePreivewApp.directive:previewItem
 * @description
 * # previewItem
 */
  .directive('previewItem', function ($previewProvider, $preview, $window, $rootScope) {
    return {
      template: '<li>' +
					'<a ng-href="{{item.fallbackUrl}}" image-loaded>' +
						'<img ng-src="{{ item.preview | trustUrl }}" alt="">' +
					'</a>' +
				'</li>',
      restrict: 'E',
      replace: true,
      scope: {
      	item: '='
      },
      link: function postLink(scope, element, attrs) {

      	$previewProvider.items.push(element);

      	var index = scope.$parent.$index;
        var link  = element.find('a');

        var setHeights = function(){
          element.css('height', element[0].offsetWidth + 'px');
          element.data('offsetTop', element[0].offsetTop);
          element.data('height', element[0].offsetWidth);
        };

        setHeights();

        $rootScope.$on('resizeOver', function(){
          setHeights();
        });

        link.on('click', function(evt){
        	evt.preventDefault();
        	$previewProvider.current === index ? hidePreview() : showPreview();
        });

        var showPreview = function(){
        	var position = element.data('offsetTop');
        	// If there is a preview instance already
        	if(typeof $previewProvider.$instance != 'undefined'){
            console.log('instance exists');

        		// and it's not the same row as the current instance
        		if($previewProvider.$instance.position !== position){
              console.log('not same row');
        			// hide dat thing
        			hidePreview();

        		} else {

              console.log('same row');
        			// otherwise update the content
        			$previewProvider.$instance.update(element);
        			return false;

        		}

        	} else {
            console.log('instance does\'t exists');
          }
            $previewProvider.$instance = new $preview(index);
            $previewProvider.$instance.position = position;
            $previewProvider.$instance.open();
        },


        hidePreview = function(){
          $previewProvider.current = -1;
        	$previewProvider.$instance.close();
          // delete $previewProvider.$instance;
        };

      }
    };
  })

/**
 * @ngdoc directive
 * @name googlePreivewApp.directive:previewPane
 * @description
 * # previewPane
 */
  .directive('previewPane', function ($previewProvider) {
    return {
      template: '<div class="expander">' +
          				'<a ng-click="close()" class="close" title="close"></a>' +
                    '<div class="inner">' +
              				'<div class="left"><h3>{{content.title}}</h3><p>{{content.description}}</p></div>' + 
              				'<div class="right"><img ng-src="{{image.url | trustUrl}}" alt="" ng-repeat="image in content.images" image-loaded></div>' +
                    '</div>' +
          			'</div>',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.close = function(){
        	$previewProvider.$instance.close();
        }
      }
    };
  })

/**
 * @ngdoc directive
 * @name google-preview.directive:imageLoaded
 * @description
 * # imageLoaded
 */
  .directive('imageLoaded', function () {
    return {
      restrict: 'A',
      scope: { imageLoaded: '&' },
      link: function postLink(scope, element, attrs) {
      	if(element.tagName == 'img'){
	        element.bind('load', function(){
	        	element.addClass('imageLoaded');
	        })
      	} else {
      		element.find('img').bind('load', function(){
	        	element.addClass('imageLoaded');
	        })
      	}
      }
    };
  })


/**
 * @ngdoc service
 * @name googlePreivewApp.$preview
 * @description
 * # $preview
 * Service in the googlePreivewApp.
 */


  .service('$previewProvider', function ($window) {

  	var templateUrl,
  		items = [],
  		winsize,
  		current = -1,
  		scrollExtra = 0,
  		settings = {
  			minHeight: 500,
  			speed: 350,
  			easing: 'ease'
  		},
  		getWinsize = function(){
  			winsize = { width: $window.innerWidth, height: $window.innerHeight }
  		};

  	getWinsize();

    return {
    	templateUrl: templateUrl,
    	items: items,
    	winsize: winsize,
    	getWinsize: getWinsize,
    	current: current,
    	scrollExtra: scrollExtra,
    	settings: settings
    };
  })



/**
 * @ngdoc service
 * @name googlePreivewApp.$preview
 * @description
 * # $preview
 * Service in the googlePreivewApp.
 */

  .factory('$preview', function ($previewProvider, $compile, $timeout, $rootScope, $animate, $document, $q) {
    var Preview = function(index){
    	this.$item    = $previewProvider.items[index];
    	this.position = 0;
    	this.index    = index;
    	this.create();
    	this.update();
    };

	Preview.prototype = {
		create: function(){
			var template   	= angular.element('<preview-pane></preview-pane>');
			this.newScope   = $previewProvider.scope || $rootScope.$new();
			this.newScope.content = this.$item.scope().item.content;
			this.$previewEl = $compile(template)(this.newScope);
			this.$item.append(this.$previewEl);
			this.setTransition();
		},
		update: function(item){
			if(item){
				this.$item = item;
				this.newScope.content = item.scope().item.content;
				this.newScope.$apply();
			}

			if($previewProvider.current !== -1){
				var $currentItem = $previewProvider.items[$previewProvider.current];
				$currentItem.removeClass('expanded');
				this.$item.addClass('expanded');

				this.positionPreview();
			}

			$previewProvider.current = this.$item.scope().$index;
		},
		open: function(){
			var self = this;
			$timeout(function(){
				self.setHeights();
				self.positionPreview();
			}, 25);
		},
		close: function(){
			var self = this;
			var def = $q.defer();

			$timeout(function(){
				var $expandedItem = $previewProvider.items[self.index];			

				$animate.removeClass($expandedItem, 'expanded-animate', {
					to: {
						height: $expandedItem.data('height')+'px'
					}
				});

				$animate.removeClass(self.$previewEl, 'preview-expanded', {
					to: {
						height: 0
					}
				})
				.then(function(){
					self.$item.removeClass('expanded');
					self.$previewEl.remove();
					$previewProvider.$instance.position = -1;
				});
			}, 25);

			return def.promise;
		},
		calcHeight: function(){
			var previewHeight = $previewProvider.winsize.height - this.$item.data('height'),
				itemHeight    = $previewProvider.winsize.height;

			if( previewHeight < $previewProvider.settings.minHeight ){
				previewHeight = $previewProvider.settings.minHeight;
				itemHeight    = $previewProvider.settings.minHeight + this.$item.data('height')
			}

			this.height = previewHeight;
			this.itemHeight = itemHeight;
		},
		setHeights: function(){
			this.calcHeight();

			// REPLACE WITH $ANIM
			$animate.addClass(this.$item, 'expanded-animate', {
				to: {
					height: this.itemHeight + 'px'
				}
			});

			$animate.addClass(this.$previewEl, 'preview-expanded', {
				to: {
					height: this.height + 'px'
				}
			});

			this.$item.addClass('expanded');
		},
		positionPreview: function(){

			var position 		= this.$item.data('offsetTop'),
				previewOffsetT  = this.$previewEl[0].offsetTop,
				scrollVal = this.height + this.$item.data('height') <= $previewProvider.winsize.height ? position : this.height < $previewProvider.winsize.height ? previewOffsetT - ($previewProvider.winsize.height - this.height) : previewOffsetT;

			$document.scrollTopAnimated(scrollVal);
		},
		setTransition: function(){
			var transitionString = 'height ' + $previewProvider.settings.speed + 'ms ' + $previewProvider.settings.easing;
			this.$previewEl.css('transition', transitionString);
			this.$item.css( 'transition', transitionString );
		}
	};

    return Preview;
  })


/**
 * @ngdoc filter
 * @name googlePreivewApp.filter:trustUrl
 * @function
 * @description
 * # trustUrl
 * Filter in the googlePreivewApp.
 */
  .filter('trustUrl', function ($sce) {
    return function (input) {
      return $sce.trustAsResourceUrl(input);
    };
  });