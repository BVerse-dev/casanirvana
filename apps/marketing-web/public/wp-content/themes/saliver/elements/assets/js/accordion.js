(function($) {
    "use strict";
    var pxl_widget_accordion_handler = function($scope, $) {
        $scope.find(".pxl-accordion .pxl-accordion--title").on("click", function(e) {
            e.preventDefault();
            var pxl_target = $(this).data("target");
            var pxl_parent = $(this).parents(".pxl-accordion");
            var pxl_width = $(window).width();
            if (
                pxl_parent.hasClass("pxl-testimonial-box") &&
                $(this).parent().hasClass("active")
            ) {
                return;
            }

            var pxl_active = pxl_parent.find(".pxl-accordion--title");

            $.each(pxl_active, function(index, item) {
                var pxl_item_target = $(item).data("target");
                if (pxl_item_target != pxl_target) {
                    $(item).removeClass("active");
                    $(item).parent().removeClass("active");

                    if ($scope.find(".pxl-accordion.pxl-testimonial-box1").length > 0 && pxl_width > 767) {
                        $(pxl_item_target)
                            .css({ overflow: 'hidden', display: 'block' })
                            .animate({ width: 0 }, {
                                duration: 600,
                                step: function(now, fx) {
                                    if (now === 0) {
                                        $(this).css({ display: 'none' });
                                    }
                                }
                            });
                    } else if (pxl_width < 768) {
                        $(pxl_item_target).slideUp(600);
                    } else {
                        $(pxl_item_target).slideUp(600);
                    }
                }
            });

            $(this).parent().toggleClass("active");

            if ($scope.find(".pxl-accordion.pxl-testimonial-box1").length > 0 && pxl_width > 767) {
                if (!$(pxl_target).is(':visible')) {
                    $(pxl_target)
                        .css({ display: 'block', overflow: 'hidden', width: 0 })
                        .animate({ width: '100%' }, 600);
                } else {
                    $(pxl_target).animate({ width: 0 }, 600, function() {
                        $(this).css({ display: 'none' });
                    });
                }
            } else if ($(window).width() < 768) {
                $(pxl_target).slideToggle(600);
            } else {
                $(pxl_target).slideToggle(600);
            }
        });
    };
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/pxl_accordion.default', pxl_widget_accordion_handler);
    });
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/pxl_testimonial_box.default', pxl_widget_accordion_handler);
    });
})(jQuery);
