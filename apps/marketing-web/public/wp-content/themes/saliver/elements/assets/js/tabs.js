( function( $ ) {
    "use strict";
    
    var pxl_widget_tabs_handler = function( $scope, $ ) {
        $scope.find(".pxl-tabs.tab-effect-slide .pxl-tab--title").on("click", function(e){
            e.preventDefault();
            var target = $(this).data("target");
            var parent = $(this).parents(".pxl-tabs");
            parent.find(".pxl-tabs--content .pxl-tab--content").slideUp(300);
            parent.find(".pxl-tabs--title .pxl-tab--title").removeClass('active');
            $(this).addClass("active");
            $(target).slideDown(300);
        });
    
        $scope.find(".pxl-tabs.tab-effect-fade .pxl-tab--title,.pxl-tabs.tab-effect-fade2 .pxl-tab--title, .pxl-tabs.tab-effect-cretive .pxl-tab--title").on("click", function(e){
            e.preventDefault();
            var target = $(this).data("target");
            var parent = $(this).parents(".pxl-tabs");
            parent.find(".pxl-tabs--content .pxl-tab--content").removeClass("active");
            parent.find(".pxl-tabs--title .pxl-tab--title").removeClass('active');
            $(this).addClass("active");
            $(target).addClass("active");
        });
    
        $scope.find(".pxl-tabs2.style-2 .pxl-tab--title:nth-child(1), .pxl-navigation-tab.style-2 .pxl-tab--title:nth-child(1)").on("click", function(e){
            e.preventDefault();
        
            if ($(this).closest(".pxl-navigation-tab.style-2").length) {
                $scope.find(".pxl-navigation-tab.style2 .pxl-tabs--title .pxl-tabs-title")
                    .addClass('f-active')
                    .removeClass('l-active');
            } else {
                $(this).parent().addClass('f-active').removeClass('l-active');
            }
        });
        
        $scope.find(".pxl-tabs2.style-2 .pxl-tab--title:nth-child(2), .pxl-navigation-tab.style-2 .pxl-tab--title:nth-child(2)").on("click", function(e){
            e.preventDefault();
        
            if ($(this).closest(".pxl-navigation-tab.style-2").length) {
                $scope.find(".pxl-navigation-tab.style2 .pxl-tabs--title .pxl-tabs-title")
                    .addClass('l-active')
                    .removeClass('f-active');
            } else {
                $(this).parent().addClass('l-active').removeClass('f-active');
            }
        });
        
             
    };
    
    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_tabs.default', pxl_widget_tabs_handler );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_banner_tabs.default', pxl_widget_tabs_handler );
    } );

} )( jQuery );

(function ($) {
    "use strict";

    $(".pxl-tab--control").on("click", function () {
        var $activeTab = $(".pxl-tabs2.style-2 .pxl-tab--title.active");
        var $allTabs = $(".pxl-tabs2.style-2 .pxl-tab--title");
        var currentIndex = $allTabs.index($activeTab);
        var nextIndex = (currentIndex + 1) % $allTabs.length; 

        $allTabs.eq(nextIndex).trigger("click");
    });

})(jQuery);
