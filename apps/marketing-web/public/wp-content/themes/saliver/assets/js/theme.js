;(function ($) {

    "use strict";
    
    var pxl_scroll_top;
    var pxl_window_height;
    var pxl_window_width;
    var pxl_scroll_status = '';
    var pxl_last_scroll_top = 0;
    var pxl_post_slip = false;

    $(window).on('load', function () {
        $(".pxl-loader").addClass("is-loaded");
        $('.pxl-swiper-slider, .pxl-header-mobile-elementor').css('opacity', '1');
        $('.pxl-gallery-scroll').parents('body').addClass('body-overflow').addClass('body-visible-sm');
        pxl_window_width = $(window).width();
        pxl_window_height = $(window).height();
        saliver_header_sticky();
        saliver_header_mobile();
        saliver_scroll_to_top();
        saliver_footer_fixed();
        saliver_shop_quantity();
        saliver_submenu_responsive();
        saliver_panel_anchor_toggle();
        saliver_post_grid();
        saliver_header_left_scroll();
        saliver_shop_view_layout();
        saliver_header_sticky();
        
    });

    $(window).on('scroll', function () {
        pxl_scroll_top = $(window).scrollTop();
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        if (pxl_scroll_top < pxl_last_scroll_top) {
            pxl_scroll_status = 'up';
        } else {
            pxl_scroll_status = 'down';
        }
        pxl_last_scroll_top = pxl_scroll_top;
        saliver_header_sticky();
        saliver_scroll_to_top();
        saliver_footer_fixed();
        saliver_ptitle_scroll_opacity();
        saliver_header_left_scroll();
        if (pxl_scroll_top < 100) {
            $('.elementor > .pin-spacer').removeClass('scroll-top-active');
        }
    });

    $(window).on('resize', function () {
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        saliver_submenu_responsive();
        saliver_header_mobile();
        saliver_post_grid();
    });

    $(document).ready(function () {
        saliver_el_parallax();
        saliver_backtotop_progess_bar();
        saliver_type_file_upload();
        saliver_zoom_point();
        saliver_smother_scroll();
        
        // Custom Dots Slider Revolution
        setTimeout(function() {
            $('.tp-bullets.theme-style2').append('<span class="pxl-revslider-arrow-prev"></span><span class="pxl-revslider-arrow-next"></span>');
            $('.tp-bullets.theme-style2').parent().find('.tparrows').addClass('pxl-revslider-arrow-hide');

            $('.revslider-initialised').each(function () {
                $(this).find('.pxl-revslider-arrow-prev').on('click', function () {
                    $(this).parents('.revslider-initialised').find('.tp-leftarrow').trigger('click');
                });
                $(this).find('.pxl-revslider-arrow-next').on('click', function () {
                    $(this).parents('.revslider-initialised').find('.tp-rightarrow').trigger('click');
                });
            });

        }, 500);

        // Deactive Link
        $('.deactive-click a').on("click", function (e) {
            e.preventDefault();
        });


        $('.pxl-post-click1 .pxl-swiper-single:first-child').addClass('swiper-slide-active');

        $('.pxl-post-click1 .pxl-swiper-single').on('click', function() {
            $('.pxl-post-click1 .pxl-swiper-single').removeClass('swiper-slide-active prev-slide');
            $(this).addClass('swiper-slide-active');
        
            let prevSlide = $(this).prev('.pxl-swiper-single'); 
            if (prevSlide.length) {
                prevSlide.addClass('prev-slide'); 
            }
        });
        
        //remove-mega-active
        $('li.pxl-megamenu').hover(function() {
            $(this).parents('.elementor-element').addClass('section-mega-active')
        }, function() {
            $(this).parents('.elementor-element').removeClass('section-mega-active')
        })
        /* Start Menu Mobile */
        $('.pxl-header-menu li.menu-item-has-children').append('<span class="pxl-menu-toggle"></span>');
        $('.pxl-menu-toggle').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();    
            }else{
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).toggleClass('active');
                $(this).parent().find('> .sub-menu').toggleClass('active');
                $(this).parent().find('> .sub-menu').slideToggle();
            }      
        });
    
        $("#pxl-nav-mobile, .pxl-anchor-mobile-menu").on('click', function () {
            $(this).toggleClass('active');
            $('body').toggleClass('body-overflow');
            $('.pxl-header-menu').toggleClass('active');
        });

        $(".pxl-menu-close, .pxl-header-menu-backdrop, #pxl-header-mobile .pxl-menu-primary a.is-one-page").on('click', function () {
            $(this).parents('.pxl-header-main').find('.pxl-header-menu').removeClass('active');
            $('#pxl-nav-mobile').removeClass('active');
            $('body').toggleClass('body-overflow');
        });
        /* End Menu Mobile */

        /* Menu Vertical */
        $('.pxl-nav-vertical li.menu-item-has-children > a').append('<span class="pxl-arrow-toggle"><i class="flaticon-right-arrow"></i></span>');
        $('.pxl-nav-vertical li.menu-item-has-children > a').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).next().toggleClass('active').slideToggle(); 
            }else{
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).closest('ul').find('a.active').toggleClass('active');
                $(this).find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }   
        });

        setTimeout(() => {
            document.querySelectorAll('.clarityRise .pxl-heading--text').forEach((el) => {
                new SplitText(el, { type: "words" });
        
                const children = Array.from(el.children);
        
                gsap.from(children, {
                    opacity: 0,
                    filter: "blur(8px)",
                    y: 10,
                    duration: 0.8,
                    ease: "power2.out",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: el,
                        start: "top 70%",
                        toggleActions: "play none none none"
                    }
                });
            });
        }, 1500);

        /* Arrow Custom */
        $('.pxl-tabs').parents('.pxl-tab--title').addClass('pxl--hide-arrow');
        var section_tab = $('.pxl-navigation-tab').parents('.elementor-section').addClass('pxl--hide-arrow');

        setTimeout(function () {
            var section = $('.elementor-section.pxl--hide-arrow');

            section.each(function () {
                var $section = $(this);
                var target = $section.find('.pxl-tabs .pxl-tabs--title');
                var target_clone = target.clone(true);
                var target_tab = $section.find('.pxl-navigation-tab');

                // Clone tiêu đề tabs vào nav-tab
                target_tab.append(target_clone);

                // Click tab trong nav
                target_tab.find('.pxl-tab--title').on('click', function () {
                    var parentSection = $(this).closest('.elementor-section.pxl--hide-arrow');
                    var navTab = parentSection.find('.pxl-navigation-tab .pxl-tab--title');
                    var tabsTitle = parentSection.find('.pxl-tabs .pxl-tab--title');

                    navTab.removeClass('active');
                    tabsTitle.removeClass('active');

                    $(this).addClass('active');

                    var targetID = $(this).data('target');
                    var targetContent = parentSection.find('' + targetID);

                    if (targetContent.length) {
                        parentSection.find('.pxl-tab--content').removeClass('active');
                        targetContent.addClass('active');
                    }

                    // Reset hiệu ứng nếu là style1
                    if (parentSection.find('.pxl-navigation-tab').hasClass('style1')) {
                        navTab.each(function () {
                            this.style.animation = 'none';
                            this.offsetHeight; // Force reflow
                            this.style.animation = null;
                        });
                    }
                });

                // Click nút control trong nav-tab
                target_tab.find('.pxl-tab--control').on('click', function () {
                    var navTab = target_tab.find('.pxl-tab--title');
                    var activeTab = navTab.filter('.active');
                    var currentIndex = navTab.index(activeTab);
                    var nextIndex = (currentIndex + 1) % navTab.length;

                    navTab.eq(nextIndex).trigger('click');

                    var isFirst = nextIndex === 0;
                    $section.find('.pxl-tabs--title .pxl-tabs-title')
                        .toggleClass('f-active', isFirst)
                        .toggleClass('l-active', !isFirst);
                });

                // 🔥 TỰ ĐỘNG CHUYỂN TAB với style1
                if (target_tab.hasClass('style1')) {
                    var navTabs = target_tab.find('.pxl-tab--title');
                    var currentIndex = 0;
                
                    function playAutoTabs() {
                        navTabs.removeClass('active animate');
                        navTabs.each(function () {
                            this.style.animation = 'none';
                            this.offsetHeight;
                            this.style.animation = null;
                        });
                
                        var $currentTab = navTabs.eq(currentIndex);
                        $currentTab.addClass('animate');
                        $currentTab.trigger('click');
                
                        setTimeout(function () {
                            currentIndex = (currentIndex + 1) % navTabs.length;
                            playAutoTabs();
                        }, 5000);
                    }
                    target_tab.find('.pxl-tab--title').on('click', function () {
                        var parentSection = $(this).closest('.elementor-section.pxl--hide-arrow');
                        var navTab = parentSection.find('.pxl-navigation-tab .pxl-tab--title');
                        var tabsTitle = parentSection.find('.pxl-tabs .pxl-tab--title');
                    
                        navTab.removeClass('active animate');
                        tabsTitle.removeClass('active');
                    
                        $(this).addClass('active');
                    
                        var targetID = $(this).data('target');
                        var targetContent = parentSection.find('' + targetID);
                    
                        if (targetContent.length) {
                            parentSection.find('.pxl-tab--content').removeClass('active');
                            targetContent.addClass('active');
                        }
                    
                        if (parentSection.find('.pxl-navigation-tab').hasClass('style1')) {
                            navTab.each(function () {
                                this.style.animation = 'none';
                                this.offsetHeight;
                                this.style.animation = null;
                            });
                    
                            // 🔥 Reset animation cho tab vừa click
                            $(this).addClass('animate');

                            currentIndex = navTabs.index(this);
                        }
                    });
                    
                    playAutoTabs();
                }
                
            });
        }, 300);






        /* Menu Hidden Sidebar Popup */
        $('.pxl-menu-hidden-sidebar li.menu-item-has-children > a').append('<span class="pxl-arrow-toggle"><i class="flaticon-right-arrow"></i></span>');
        $('.pxl-menu-hidden-sidebar li.menu-item-has-children > a').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).next().toggleClass('active').slideToggle(); 
            }else{
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).closest('ul').find('a.active').toggleClass('active');
                $(this).find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }   
        });

        $('.pxl-menu-hidden-sidebar .pxl-menu-button').on('click', function () {
            $(this).parents('.pxl-menu-hidden-sidebar').toggleClass('active');
            $(this).parents('.pxl-menu-hidden-sidebar').removeClass('boxOut');
            $(this).parents('body').toggleClass('body-overflow');
        });
        $('.pxl-menu-popup-overlay').on('click', function () {
            $(this).parent().removeClass('active');
            $(this).parent().addClass('boxOut');
            $(this).parents('body').removeClass('body-overflow');
        });
        $('.pxl-menu-popup-close, .pxl-menu-hidden-sidebar .pxl-menu-hidden a.is-one-page').on('click', function () {
            $(this).parents('.pxl-menu-hidden-sidebar').removeClass('active');
            $(this).parents('.pxl-menu-hidden-sidebar').addClass('boxOut');
            $(this).parents('body').removeClass('body-overflow');
        });


        /* Mega Menu Max Height */
        var m_h_mega = $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').outerHeight();
        var w_h_mega = $(window).height();
        var w_h_mega_css = w_h_mega - 120;
        if(m_h_mega > w_h_mega) {
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('max-height', w_h_mega_css + 'px');
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('overflow-x', 'auto');
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('scrollbar-width', 'none');
        }
        /* End Mega Menu Max Height */

        /* Scroll To Top */
        $('.pxl-scroll-top').on('click', function () {
            $('html, body').animate({scrollTop: 0}, 1200);
            $(this).parents('.pxl-wapper').find('.elementor > .pin-spacer').addClass('scroll-top-active');
            return false;
        });
        /* Login */
        jQuery(document).ready(function ($) {
            $('.pxl-user-popup').on('click', function (e) {
                if (e.target === this) { 
                    $(this).removeClass('open').addClass('remove');
                    $('body').removeClass('ov-hidden');
                }
            });
        
            $('.pxl-modal-close,.pxl-user-popup .pxl-ovlay').on('click', function () {
                $(this).closest('.pxl-user-popup').removeClass('open').addClass('remove');
                $('body').removeClass('ov-hidden');
            });
        
            $('.btn-sign-up').on('click', function () {
                $('.pxl-user-register').addClass('u-open').removeClass('u-close');
                $('.pxl-user-login').addClass('u-close').removeClass('u-open');
            });
        
            $('.btn-sign-in').on('click', function () {
                $('.pxl-user-register').addClass('u-close').removeClass('u-open');
                $('.pxl-user-login').addClass('u-open').removeClass('u-close');
            });
        
            $('.h-btn-user').on('click', function () {
                const popup = $('.pxl-user-popup');
                popup.addClass('open').removeClass('remove');
                $('body').addClass('ov-hidden');
        
                // Reset state
                $('.pxl-user-register, .pxl-user-login').removeClass('u-open u-close');
        
                if ($(this).hasClass('is-register')) {
                    $('.pxl-user-register').addClass('u-open').removeClass('u-close');
                    $('.pxl-user-login').addClass('u-close').removeClass('u-open');
                } else {
                    $('.pxl-user-register').addClass('u-close').removeClass('u-open');
                    $('.pxl-user-login').addClass('u-open').removeClass('u-close');
                }
            });
        });
        
        /* Animate Time Delay */
        $('.pxl-grid-masonry').each(function () {
            var eltime = 80;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl-grid-item > .wow').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 'ms');
                if (_elt === index) {
                    eltime = 80;
                    _elt = _elt + elt_inner;
                } else {
                    eltime = eltime + 80;
                }
            });
        });

        $('.btn-text-nina').each(function () {
            var eltime = 0.045;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('transition-delay', eltime + 's');
                eltime = eltime + 0.045;
            });
        });

        $('.btn-text-nanuk').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 's');
                eltime = eltime + 0.05;
            });
        });

        $('.btn-text-smoke').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span > span > span').each(function (index, obj) {
                $(this).css('--d', eltime + 's');
                eltime = eltime + 0.05;
            });
        });

        $('.btn-text-reverse .pxl-text--front, .btn-text-reverse .pxl-text--back').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('.pxl-text--inner > span').each(function (index, obj) {
                $(this).css('transition-delay', eltime + 's');
                eltime = eltime + 0.05;
            });
        });
        
        /* End Animate Time Delay */

        /* Lightbox Popup */
        setTimeout(function() {
            $('.pxl-action-popup').magnificPopup({
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        }, 300);

        $('.pxl-gallery-lightbox').each(function () {
            $(this).magnificPopup({
                delegate: 'a.lightbox',
                type: 'image',
                gallery: {
                    enabled: true
                },
                mainClass: 'mfp-fade',
            });
        });

        /* Page Title Parallax */
        if($('#pxl-page-title-default').hasClass('pxl--parallax')) {
            $(this).stellar();
        }

        /* Cart Sidebar Popup */
        $(".pxl-cart-sidebar-button").on('click', function () {
            $('body').addClass('body-overflow');
            $('#pxl-cart-sidebar').addClass('active');
        });
        $("#pxl-cart-sidebar .pxl-popup--overlay, #pxl-cart-sidebar .pxl-item--close, #pxl-cart-sidebar .pxl-popup--close2").on('click', function () {
            $('body').removeClass('body-overflow');
            $('#pxl-cart-sidebar').removeClass('active');
        });

        /* Start Icon Bounce */
        var boxEls = $('.el-bounce, .pxl-image-effect1, .el-effect-zigzag');
        $.each(boxEls, function(boxIndex, boxEl) {
            loopToggleClass(boxEl, 'active');
        });

        function loopToggleClass(el, toggleClass) {
            el = $(el);
            let counter = 0;
            if (el.hasClass(toggleClass)) {
                waitFor(function () {
                    counter++;
                    return counter == 2;
                }, function () {
                    counter = 0;
                    el.removeClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Deactivate', 1000);
            } else {
                waitFor(function () {
                    counter++;
                    return counter == 3;
                }, function () {
                    counter = 0;
                    el.addClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Activate', 1000);
            }
        }

        function waitFor(condition, callback, message, time) {
            if (message == null || message == '' || typeof message == 'undefined') {
                message = 'Timeout';
            }
            if (time == null || time == '' || typeof time == 'undefined') {
                time = 100;
            }
            var cond = condition();
            if (cond) {
                callback();
            } else {
                setTimeout(function() {
                    waitFor(condition, callback, message, time);
                }, time);
            }
        }
        /* End Icon Bounce */

        /* Image Effect */
        if($('.pxl-image-tilt').length){
            $('.pxl-image-tilt').parents('.elementor-top-section').addClass('pxl-image-tilt-active');
            $('.pxl-image-tilt').each(function () {
                var pxl_maxtilt = $(this).data('maxtilt'),
                    pxl_speedtilt = $(this).data('speedtilt'),
                    pxl_perspectivetilt = $(this).data('perspectivetilt');
                VanillaTilt.init(this, {
                    max: pxl_maxtilt,
                    speed: pxl_speedtilt,
                    perspective: pxl_perspectivetilt
                });
            });
        }

        /* Select Theme Style */
        $('.wpcf7-select').each(function(){
            var $this = $(this), numberOfOptions = $(this).children('option').length;
          
            $this.addClass('pxl-select-hidden'); 
            $this.wrap('<div class="pxl-select"></div>');
            $this.after('<div class="pxl-select-higthlight"></div>');

            var $styledSelect = $this.next('div.pxl-select-higthlight');
            $styledSelect.text($this.children('option').eq(0).text());
          
            var $list = $('<ul />', {
                'class': 'pxl-select-options'
            }).insertAfter($styledSelect);
          
            for (var i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }
          
            var $listItems = $list.children('li');
          
            $styledSelect.on('click', function (e) {
                e.stopPropagation();
                $('div.pxl-select-higthlight.active').not(this).each(function(){
                    $(this).removeClass('active').next('ul.pxl-select-options').addClass('pxl-select-lists-hide');
                });
                $(this).toggleClass('active');
            });
          
            $listItems.on('click', function (e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
            });
          
            $(document).on('click', function () {
                $styledSelect.removeClass('active');
            });

        });

        /* Nice Select */
        $('.woocommerce-ordering .orderby, #pxl-sidebar-area select, .variations_form.cart .variations select, .pxl-open-table select, .pxl-nice-select').each(function () {
            $(this).niceSelect();
        });

        /* Typewriter */
        if($('.pxl-title--typewriter').length) {
            function typewriterOut(elements, callback)
            {
                if (elements.length){
                    elements.eq(0).addClass('is-active');
                    elements.eq(0).delay( 3000 );
                    elements.eq(0).removeClass('is-active');
                    typewriterOut(elements.slice(1), callback);
                }
                else {
                    callback();
                }
            }

            function typewriterIn(elements, callback)
            {
                if (elements.length){
                    elements.eq(0).addClass('is-active');
                    elements.eq(0).delay( 3000 ).slideDown(3000, function(){
                        elements.eq(0).removeClass('is-active');
                        typewriterIn(elements.slice(1), callback);
                    });
                }
                else {
                    callback();
                }
            }

            function typewriterInfinite(){
                typewriterOut($('.pxl-title--typewriter .pxl-item--text'), function(){ 
                    typewriterIn($('.pxl-title--typewriter .pxl-item--text'), function(){
                        typewriterInfinite();
                    });
                });
            }
            $(function(){
                typewriterInfinite();
            });
        }
        /* End Typewriter */

        /* Section Particles */      
        setTimeout(function() {
            $(".pxl-row-particles").each(function() {
                particlesJS($(this).attr('id'), {
                  "particles": {
                    "number": {
                        "value": $(this).data('number'),
                    },
                    "color": {
                        "value": $(this).data('color')
                    },
                    "shape": {
                        "type": "circle",
                    },
                    "size": {
                        "value": $(this).data('size'),
                        "random": $(this).data('size-random'),
                    },
                    "line_linked": {
                        "enable": false,
                    },
                    "move": {
                        "enable": true,
                        "speed": 2,
                        "direction": $(this).data('move-direction'),
                        "random": true,
                        "out_mode": "out",
                    }
                  },
                  "retina_detect": true
                });
            });
        }, 400);

        /* Get checked input - Mailchimpp */
        $('.mc4wp-form input:checkbox').change(function(){
            if($(this).is(":checked")) {
                $('.mc4wp-form').addClass("pxl-input-checked");
            } else {
                $('.mc4wp-form').removeClass("pxl-input-checked");
            }
        });

        /* Scroll to content */
        $('.pxl-link-to-section .btn').on('click', function(e) {
            var id_scroll = $(this).attr('href');
            var offsetScroll = $('.pxl-header-elementor-sticky').outerHeight();
            e.preventDefault();
            $("html, body").animate({ scrollTop: $(id_scroll).offset().top - offsetScroll }, 600);
        });

        // Hover Overlay Effect
        $('.pxl-overlay-shake').mousemove(function(event){ 
            var offset = $(this).offset();
            var W = $(this).outerWidth();
            var X = (event.pageX - offset.left);
            var Y = (event.pageY - offset.top);
            $(this).find('.pxl-overlay--color').css({
                'top' : + Y + 'px',
                'left' : + X + 'px'
            });
        });


         

        // Hover Portfolio Effect
        // $(".pxl-portfolio-style1 .pxl-post--inner").on(
        //     function () {
        //         $(this).addClass("active-hover");
        //         $(this).removeClass("none-hover");
        //     },
        //     function () {
        //         $(this).removeClass("active-hover");
        //         $(this).addClass("none-hover");
        //     }
        // );

        /* Custom One Page by theme */
        if($('.pxl-link-scroll1').length) {
            $('.pxl-item--onepage').on('click', function (e) {
                var _this = $(this);
                var _link = $(this).attr('href');
                var _id_data = e.currentTarget.hash;
                var _offset;
                var _data_offset = $(this).attr('data-onepage-offset');
                if(_data_offset) {
                    _offset = _data_offset;
                } else {
                    _offset = 0;
                }
                if ($(_id_data).length === 1) {
                    var _target = $(_id_data);
                    $('.pxl-onepage-active').removeClass('pxl-onepage-active');
                    _this.addClass('pxl-onepage-active');
                    $('html, body').stop().animate({ scrollTop: _target.offset().top - _offset }, 1000);   
                    return false;
                } else {
                    window.location.href = _link;
                }
                return false;
            });
            $.each($('.pxl-item--onepage'), function (index, item) {
                var target = $(item).attr('href');
                var el =  $(target);
                var _data_offset = $(item).attr('data-onepage-offset');
                var waypoint = new Waypoint({
                    element: el[0],
                    handler: function(direction) {
                        if(direction === 'down'){
                            $('.pxl-onepage-active').removeClass('pxl-onepage-active');
                            $(item).addClass('pxl-onepage-active');
                        }
                        else if(direction === 'up'){
                            var prev = $(item).parent().prev().find('.pxl-item--onepage');
                            $(item).removeClass('pxl-onepage-active');
                            if(prev.length > 0)
                                prev.addClass('pxl-onepage-active');
                        }
                    },
                    offset: _data_offset,
                });
            });
        }

        /* Item Hover Active */
        $('.pxl-hover-item').each(function () {
            $(this).on(function () {
                $(this).parent('.pxl-hover-wrap').find('.pxl-hover-item').removeClass('pxl-active');
                $(this).addClass('pxl-active');
            });
        });

        // Active Mega Menu Hover
        $('li.pxl-megamenu').on("mouseenter", function(){
            $(this).parents('.elementor-section').addClass('section-mega-active');
        }).on("mouseleave", function(){
            $(this).parents('.elementor-section').removeClass('section-mega-active');
        });
        

    });
    
    jQuery(document).ajaxComplete(function(event, xhr, settings){
        saliver_shop_quantity();
    });

    jQuery( document ).on( 'updated_wc_div', function() {
        saliver_shop_quantity();
    } );
     
    /* Header Sticky */
    function saliver_header_sticky() {
        if ($('#pxl-header-elementor').hasClass('is-sticky')) {
            if (pxl_scroll_top > 100) {
                $('.pxl-header-elementor-sticky.pxl-sticky-stb').addClass('pxl-header-fixed');
                $('#pxl-header-mobile').addClass('pxl-header-mobile-fixed');
                $('.pxl-header-elementor-sticky.pxl-sticky-stt').addClass('pxl-header-fixed');
            } else {
                $('.pxl-header-elementor-sticky.pxl-sticky-stb').removeClass('pxl-header-fixed');
                $('#pxl-header-mobile').removeClass('pxl-header-mobile-fixed');
                $('.pxl-header-elementor-sticky.pxl-sticky-stt').removeClass('pxl-header-fixed');
            }
        }
        $('body').addClass('pxl-header-sticky');
    }    
    

    /* Header Left Scroll */
    function saliver_header_left_scroll() {
        if($('.px-header--left_sidebar').hasClass('px-header-sidebar-style2')) {
            var h_section_top = $('.h5-section-top').outerHeight() + 50;
            console.log(h_section_top);
            if (pxl_scroll_top > h_section_top) {
                $('.px-header--left_sidebar').addClass('px-header--left_shadow');
            } else {
                $('.px-header--left_sidebar').removeClass('px-header--left_shadow');
            }
        }
    }

    /* Header Mobile */
    function saliver_header_mobile() {
        var h_header_mobile = $('#pxl-header-elementor').outerHeight();
        if(pxl_window_width < 1199) {
            $('#pxl-header-elementor').css('min-height', h_header_mobile + 'px');
        }
    }

    /* Scroll To Top */
    function saliver_scroll_to_top() {
        if (pxl_scroll_top < pxl_window_height) {
            $('.pxl-scroll-top').addClass('pxl-off').removeClass('pxl-on');
        }
        if (pxl_scroll_top > pxl_window_height) {
            $('.pxl-scroll-top').addClass('pxl-on').removeClass('pxl-off');
        }
    }


    //Shop View Grid/List
    function saliver_shop_view_layout(){

        $(document).on('click','.pxl-view-layout .view-icon a', function(e){
            e.preventDefault();
            if(!$(this).parent('li').hasClass('active')){
                $('.pxl-view-layout .view-icon').removeClass('active');
                $(this).parent('li').addClass('active');
                $(this).parents('.pxl-content-area').find('ul.products').removeAttr('class').addClass($(this).attr('data-cls'));
            }
        });
    }

    /* Footer Fixed */
    function saliver_footer_fixed() {
        setTimeout(function(){
            var h_footer = $('.pxl-footer-fixed #pxl-footer-elementor').outerHeight() - 1;
            $('.pxl-footer-fixed #pxl-main').css('margin-bottom', h_footer + 'px');
        }, 600);
    }

    /* WooComerce Quantity */
    function saliver_shop_quantity() {
        "use strict";
        $('#pxl-wapper .quantity').append('<span class="quantity-icon quantity-down pxl-icon--caretdown"></span><span class="quantity-icon quantity-up pxl-icon--caretup"></span>');
        $('.quantity-up').on('click', function () {
            $(this).parents('.quantity').find('input[type="number"]').get(0).stepUp();
            $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
        });
        $('.quantity-down').on('click', function () {
            $(this).parents('.quantity').find('input[type="number"]').get(0).stepDown();
            $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
        });
        $('.quantity-icon').on('click', function () {
            var quantity_number = $(this).parents('.quantity').find('input[type="number"]').val();
            var add_to_cart_button = $(this).parents( ".product, .woocommerce-product-inner" ).find(".add_to_cart_button");
            add_to_cart_button.attr('data-quantity', quantity_number);
            add_to_cart_button.attr("href", "?add-to-cart=" + add_to_cart_button.attr("data-product_id") + "&quantity=" + quantity_number);
        });
        $('.woocommerce-cart-form .actions .button').removeAttr('disabled');
    }

    /* Menu Responsive Dropdown */
    function saliver_submenu_responsive() {
        var $saliver_menu = $('.pxl-header-elementor-main, .pxl-header-elementor-sticky');
        $saliver_menu.find('.pxl-menu-primary li').each(function () {
            var $saliver_submenu = $(this).find('> ul.sub-menu');
            if ($saliver_submenu.length == 1) {
                if ( ($saliver_submenu.offset().left + $saliver_submenu.width() + 0 ) > $(window).width()) {
                    $saliver_submenu.addClass('pxl-sub-reverse');
                }
            }
        });
    }

    function saliver_panel_anchor_toggle(){
        'use strict';
        $(document).on('click','.pxl-anchor-button',function(e){
            e.preventDefault();
            e.stopPropagation();
            var target = $(this).attr('data-target');
            $(target).toggleClass('active');
            $('body').addClass('body-overflow');
            $('.pxl-popup--conent .wow').addClass('animated').removeClass('aniOut');
            $('.pxl-popup--conent .fadeInPopup').removeClass('aniOut');
            if($(target).find('.pxl-search-form').length > 0){
                setTimeout(function(){
                    $(target).find('.pxl-search-form .pxl-search-field').focus();
                },1000);
            }
        });

        $('.pxl-anchor-button').each(function () {
            var t_target = $(this).attr('data-target');
            var t_delay = $(this).attr('data-delay-hover');
            $(t_target).find('.pxl-popup--conent').css('transition-delay', t_delay + 'ms');
            $(t_target).find('.pxl-popup--overlay').css('transition-delay', t_delay + 'ms');
        });

        $(".pxl-hidden-panel-popup .pxl-popup--overlay, .pxl-hidden-panel-popup .pxl-close-popup").on('click', function () {
            $('body').removeClass('body-overflow');
            $('.pxl-hidden-panel-popup').removeClass('active');
            $('.pxl-popup--conent .wow').addClass('aniOut').removeClass('animated');
            $('.pxl-popup--conent .fadeInPopup').addClass('aniOut');
        });

        $(".pxl-button.pxl-atc-popup").on('click', function () {
            $('body').addClass('body-overflow');
            $(this).parents('.pxl-wapper').find('.pxl-page-popup').addClass('active');
        });
        $(".pxl-popup--close").on('click', function () {
            $('body').removeClass('body-overflow');
            $(this).parent().removeClass('active');
        });

        /* Custom Theme Style */
        $('blockquote:not(.pxl-blockquote)').append('<i class="pxl-blockquote-icon flaticon-quote-1 text-gradient"></i>');
    }

    /* Post Grid */
    function saliver_post_grid() {
        setTimeout(function(){
            $('.pxl-item--inner').each(function () {
                var item_w = $(this).outerWidth();
                var item_h = $(this).outerHeight();
                $(this).find('.pxl-item--imgfilter').css('width', item_w + 'px');
                $(this).find('.pxl-item--imgfilter').css('height', item_h + 'px');
            });
        }, 300);
    }

    /* Page Title Scroll Opacity */
    function saliver_ptitle_scroll_opacity() {
        var divs = $('#pxl-page-title-elementor.pxl-scroll-opacity .elementor-widget'),
            limit = $('#pxl-page-title-elementor.pxl-scroll-opacity').outerHeight();
        if (pxl_scroll_top <= limit) {
            divs.css({ 'opacity' : (1 - pxl_scroll_top/limit)});
        }
    }
    /* Search Popup */
    $(".pxl-search-popup-button").on('click', function () {
        $('body').addClass('body-overflow');
        $('#pxl-search-popup').addClass('active');
        setTimeout(function () {
            $('#pxl-search-popup .search-field').focus();
        }, 1000);
    });
    
    $("#pxl-search-popup .pxl-item--overlay, #pxl-search-popup .pxl-item--close").on('click', function () {
        $('body').removeClass('body-overflow');
        $('#pxl-search-popup').removeClass('active');
    });

    $(document).on('click', function (e) {
        if (
            $('#pxl-search-popup').hasClass('active') && 
            !$(e.target).closest('.searchform-wrap').length && 
            !$(e.target).closest('.pxl-search-popup-button').length
        ) {
            $('body').removeClass('body-overflow');
            $('#pxl-search-popup').removeClass('active');
        }
    });
    
    /* Preloader Default */
    $.fn.extend({
        jQueryImagesLoaded: function () {
          var $imgs = this.find('img[src!=""]')

          if (!$imgs.length) {
            return $.Deferred()
              .resolve()
              .promise()
          }

          var dfds = []

          $imgs.each(function () {
            var dfd = $.Deferred()
            dfds.push(dfd)
            var img = new Image()
            img.onload = function () {
              dfd.resolve()
            }
            img.onerror = function () {
              dfd.resolve()
            }
            img.src = this.src
          })

          return $.when.apply($, dfds)
        }
    })

    /* Button Parallax */
    function saliver_el_parallax() {
        $('.btn-text-parallax').on('mouseenter', function() {
            $(this).addClass('hovered');
        });
        $('.btn-text-parallax').on('mouseleave', function() {
            $(this).removeClass('hovered');
        });
        $('.btn-text-parallax').on('mousemove', function(e) {
            const bounds = this.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height;
            const deltaX = Math.floor((centerX - e.clientX)) * 0.172;
            const deltaY = Math.floor((centerY - e.clientY)) * 0.273;
            $(this).find('.pxl--btn-text').css({
                transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
            });
            $(this).css({
                transform: 'translate3d('+ deltaX * 0.25 +'px, '+ deltaY * 0.25 +'px, 0px)'
            });
        });

        $('.el-parallax-wrap').each(function () {
            $(this).on('mouseenter', function() {
                $(this).addClass('hovered');
            });

            $(this).on('mouseleave', function() { 
                $(this).removeClass('hovered');
            });

            $(this).on('mousemove', function(e) {
                const bounds = this.getBoundingClientRect();
                const centerX = bounds.left + bounds.width / 2;
                const centerY = bounds.top + bounds.height;
                const deltaX = Math.floor((centerX - e.clientX)) * 0.222;
                const deltaY = Math.floor((centerY - e.clientY)) * 0.333;
                $(this).find('.el-parallax-item').css({
                    transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
                });
            });
        });

        $('.pxl-hover-parallax').on('mousemove', function(e) {
            const bounds = this.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height;
            const deltaX = Math.floor((centerX - e.clientX)) * 0.222;
            const deltaY = Math.floor((centerY - e.clientY)) * 0.333;
            $(this).find('.pxl-item-parallax').css({
                transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
            });
        });
    }

    /* Back To Top Progress Bar */
    function saliver_backtotop_progess_bar() {
        if($('.pxl-scroll-top').length > 0) {
            var progressPath = document.querySelector('.pxl-scroll-top path');
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
            progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';      
            var updateProgress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength / height);
                progressPath.style.strokeDashoffset = progress;
            }
            updateProgress();
            $(window).scroll(updateProgress);   
            var offset = 50;
            var duration = 550;
            $(window).on('scroll', function() {
                if ($(this).scrollTop() > offset) {
                    $('.pxl-scroll-top').addClass('active-progress');
                } else {
                    $('.pxl-scroll-top').removeClass('active-progress');
                }
            });
        }
    }

    /* Custom Type File Upload*/
    function saliver_type_file_upload() {

        var multipleSupport = typeof $('<input/>')[0].multiple !== 'undefined',
        isIE = /msie/i.test( navigator.userAgent );

        $.fn.pxl_custom_type_file = function() {

            return this.each(function() {

            var $file = $(this).addClass('pxl-file-upload-hidden'),
            $wrap = $('<div class="pxl-file-upload-wrapper">'),
            $button = $('<button type="button" class="pxl-file-upload-button">Choose File</button>'),
            $input = $('<input type="text" class="pxl-file-upload-input" placeholder="No File Choose" />'),
            $label = $('<label class="pxl-file-upload-button" for="'+ $file[0].id +'">Choose File</label>');
            $file.css({
                position: 'absolute',
                opacity: '0',
                visibility: 'hidden'
            });

            $wrap.insertAfter( $file )
            .append( $file, $input, ( isIE ? $label : $button ) );

            $file.attr('tabIndex', -1);
            $button.attr('tabIndex', -1);

            $button.on('click', function () {
                $file.focus().on();
            });

            $file.change(function() {

            var files = [], fileArr, filename;

            if ( multipleSupport ) {
                fileArr = $file[0].files;
                for ( var i = 0, len = fileArr.length; i < len; i++ ) {
                files.push( fileArr[i].name );
                }
                filename = files.join(', ');
            } else {
                filename = $file.val().split('\\').pop();
            }

            $input.val( filename )
                .attr('title', filename)
                .focus();
            });

            $input.on({
                blur: function() { $file.trigger('blur'); },
                keydown: function( e ) {
                if ( e.which === 13 ) {
                    if ( !isIE ) { 
                        $file.trigger('click'); 
                    }
                } else if ( e.which === 8 || e.which === 46 ) {
                    $file.replaceWith( $file = $file.clone( true ) );
                    $file.trigger('change');
                    $input.val('');
                } else if ( e.which === 9 ){
                    return;
                } else {
                        return false;
                    }
                }
            });

            });

        };
        $('.wpcf7-file[type=file]').pxl_custom_type_file();
    }

    // Zoom Point
    function saliver_zoom_point() {
        $(".pxl-zoom-point").each(function () {

            let scaleOffset = $(this).data('offset');
            let scaleAmount = $(this).data('scale-mount');

            function scrollZoom() {
                const images = document.querySelectorAll("[data-scroll-zoom]");
                let scrollPosY = 0;
                scaleAmount = scaleAmount / 100;

                const observerConfig = {
                    rootMargin: "0% 0% 0% 0%",
                    threshold: 0
                };

                images.forEach(image => {
                    let isVisible = false;
                    const observer = new IntersectionObserver((elements, self) => {
                        elements.forEach(element => {
                            isVisible = element.isIntersecting;
                        });
                    }, observerConfig);

                    observer.observe(image);

                    image.style.transform = `scale(${1 + scaleAmount * percentageSeen(image)})`;

                    window.addEventListener("scroll", () => {
                    if (isVisible) {
                        scrollPosY = window.pageYOffset;
                        image.style.transform = `scale(${1 +
                        scaleAmount * percentageSeen(image)})`;
                    }
                    });
                });

                function percentageSeen(element) {
                    const parent = element.parentNode;
                    const viewportHeight = window.innerHeight;
                    const scrollY = window.scrollY;
                    const elPosY = parent.getBoundingClientRect().top + scrollY + scaleOffset;
                    const borderHeight = parseFloat(getComputedStyle(parent).getPropertyValue('border-bottom-width')) + parseFloat(getComputedStyle(element).getPropertyValue('border-top-width'));
                    const elHeight = parent.offsetHeight + borderHeight;

                    if (elPosY > scrollY + viewportHeight) {
                        return 0;
                    } else if (elPosY + elHeight < scrollY) {
                        return 100;
                    } else {
                        const distance = scrollY + viewportHeight - elPosY;
                        let percentage = distance / ((viewportHeight + elHeight) / 100);
                        percentage = Math.round(percentage);

                        return percentage;
                    }
                }
            }

            scrollZoom();

        });
    }

    // Zoom Point
    function saliver_smother_scroll() {
        if( $( 'body').hasClass( 'body-smooth-scroll')){

            gsap.registerPlugin( ScrollTrigger, ScrollSmoother);

            ScrollSmoother.create({
              smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
              effects: true, // looks for data-speed and data-lag attributes on elements
              smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
            });
        }   
    }
    ////
    const y = 100; 
    const parent = document.querySelector('.pxl-video--holder')?.parentElement;

    if (parent) {
        const el = document.querySelector('.bg-parallax .bg-image');

        if (el) {
            gsap.set(el, { top: -y }); 
            gsap.set(el, { bottom: -y }); 
            gsap.to(el, {
                x: 0,
                y: y,
                scale: 1,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: parent,
                    start: 'top 50%', 
                    end: "bottom top", 
                    scrub: 0.5, 
                }
            });
        } else {
            console.warn('Element .bg-parallax .bg-image not found!');
        }
    } else {
        console.warn('Parent element not found!');
    }


    /* Custom Grid Filter Moving Border */
    $('.pxl-tabs1,.pxl-tabs3').each(function () {
        var marker = $(this).find('.filter-marker'),
            item = $(this).find('.pxl-tab--title'),
            current = $(this).find('.pxl-tab--title.active');
    
        function updateMarker(target) {
            var offsetTop = target.offset().top - marker.parent().offset().top,
                offsetLeft = target.offset().left - marker.parent().offset().left,
                width = target.outerWidth(),
                height = target.outerHeight();
        
            marker.stop().animate({
                top: offsetTop,
                left: offsetLeft,
                width: width,
                height: height
            }, 100);
        }
    
        if (current.length) {
            updateMarker(current);
            marker.show();
        }
    
        item.mouseover(function () {
            updateMarker($(this));
        });
    
        item.on('click', function () {
            current = $(this);
        });
    
        item.mouseleave(function () {
            if (current.length) {
                updateMarker(current);
            }
        });
    });
    
    
    /////
    document.addEventListener("click", function (event) {
        let currentActive = document.querySelector(".pxl-pricing.active");
        let newTarget = event.target.closest(".pxl-pricing");
    
        if (newTarget) {
            if (currentActive && currentActive !== newTarget) {
                togglePricing(currentActive, false);
            }
            togglePricing(newTarget, true);
        }
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".pxl-pricing").forEach((el) => {
            el.addEventListener("click", function () {
                const isActive = !el.classList.contains("active");
                togglePricing(el, isActive);
            });
        });
    });
    
    function togglePricing(element, isActive) {
        if (isActive) {
            document.querySelectorAll(".pxl-pricing.active").forEach((el) => {
                if (el !== element) {
                    let right = el.querySelector(".pxl-item-right");
                    el.classList.remove("active");
                    if (right) {
                        right.style.opacity = "0";
                        right.style.visibility = "hidden";
                        right.style.transform = "scaleX(0)";
                        setTimeout(() => {
                            if (!el.classList.contains("active")) {
                                right.style.display = "none";
                            }
                        },); 
                    }
                }
            });
        }
    
        let rightPanel = element.querySelector(".pxl-item-right");
        if (!rightPanel) return;
    
        if (isActive) {
            element.classList.add("active");
            rightPanel.style.display = "flex";
            requestAnimationFrame(() => {
                rightPanel.style.opacity = "1";
                rightPanel.style.visibility = "visible";
                rightPanel.style.transform = "scaleX(1)";
            });
        } else {
            element.classList.remove("active");
            rightPanel.style.opacity = "0";
            rightPanel.style.visibility = "hidden";
            rightPanel.style.transform = "scaleX(0)";
            setTimeout(() => {
                if (!element.classList.contains("active")) {
                    rightPanel.style.display = "none";
                }
            }, 300);
        }
    }
    
    
    ///
    document.addEventListener("DOMContentLoaded", () => {
        const svgIcons = document.querySelectorAll(".pxl-svg-stroke svg");
    
        if (svgIcons.length > 0) {
            gsap.registerPlugin(ScrollTrigger);
    
            svgIcons.forEach((svg) => {
                const paths = svg.querySelectorAll("path");
    
                if (paths.length > 0) {
                    paths.forEach((path) => {
                        const lineLength = path.getTotalLength();
                        path.style.strokeDasharray = lineLength;
                        path.style.strokeDashoffset = lineLength;
                    });
    
                    gsap.to(paths, {
                        strokeDashoffset: 0,
                        duration: 5,
                        stagger: 0.05, 
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: svg,
                            start: "top 100%",
                            toggleActions: "play none none none",
                            once: true, 
                        },
                    });
                }
            });
        }
    });
    
    


    document.addEventListener("DOMContentLoaded", () => {
        if (!document.querySelector('.pxl-image-transform1')) return;
    
        gsap.registerPlugin(ScrollTrigger);
    
        const triggerSettings = {
            trigger: ".pxl-image-transform1",
            start: "top 100%",
            end: "bottom 105%",
            scrub: true,
        };
    
        gsap.to(".pxl-item--transform", {
            x: 0,
            y: 0,
            rotate: 0,
            ease: "none",
            scrollTrigger: triggerSettings
        });
    });
    
    $('a[href^="#"]:not(.tabs a)').on('click', function (e) {
        e.preventDefault();

        const target = $(this.getAttribute('href'));

        if (target.length) {
            $('html, body').animate(
            {
                scrollTop: target.offset().top,
            },
            600
            );
        }
    });

    $('.pxl-parent-transition').each(function() {
        $(this).find('.pxl-transtion').addClass('pxl-hover-transition');
        $(this).hover(function() {
            $(this).find('.pxl-transtion').addClass('pxl-hover-transition');
        });
        $('.pxl-switch-button').on('mouseover', function() {
            $(this).find('.pxl-transtion').removeClass('pxl-hover-transition');
        });
    });



    let currentActiveId = null;

    $(window).on('scroll', function () {
        let newActiveId = null;

        $('section[id]').each(function () {
            const $section = $(this);
            const sectionId = $section.attr('id');
            const sectionTop = $section.offset().top;
            const sectionHeight = $section.outerHeight();
            const sectionBottom = sectionTop + sectionHeight;
            const scrollTop = $(window).scrollTop();
            const windowHeight = $(window).height();
            const windowBottom = scrollTop + windowHeight;

            if (sectionTop >= scrollTop && sectionBottom <= windowBottom) {
                newActiveId = sectionId;
                return false;
            }
        });

        if (newActiveId && newActiveId !== currentActiveId) {
            if (currentActiveId) {
                $('a[href="#' + currentActiveId + '"]').removeClass('active');
            }
            $('a[href="#' + newActiveId + '"]').addClass('active');
            currentActiveId = newActiveId;
        }
    });

    $(".pxl-marquee__style-1").each(function () {
        var $marquee = $(this);
        var $list = $marquee.find("ul");
        var $items = $marquee.find("li.pxl-marquee__item");
      
        if ($items.length === 0) return;
      
        for (var i = 0; i < $items.length; i++) {
          $items.eq(i).clone(true).appendTo($list);
        }
      
        if ($marquee.hasClass("pxl-marquee__pause-on-hover")) {
          $list
            .on("mouseenter", function () {
              $(this).css("animation-play-state", "paused");
            })
            .on("mouseleave", function () {
              $(this).css("animation-play-state", "running");
            });
        }
      
        var totalItems = $marquee.find("li.pxl-marquee__item").length;
        var currentDuration =
          parseFloat($list.css("animation-duration")) ||
          (function () {
            var inlineStyle = $list.attr("style");
            if (inlineStyle && inlineStyle.indexOf("animation-duration") !== -1) {
              var match = inlineStyle.match(/animation-duration:\s*([0-9.]+)s/);
              return match ? parseFloat(match[1]) : 10;
            }
            return 10;
          })();
      
        var adjustedDuration = (currentDuration * totalItems) / $items.length;
        $list.css("animation-duration", adjustedDuration + "s");
      });


    // document.addEventListener("DOMContentLoaded", function () {
    //     gsap.registerPlugin(ScrollTrigger);
    
    //     const tl = gsap.timeline({
    //         scrollTrigger: {
    //             trigger: ".pxl-image-scroll1",
    //             start: "top top",
    //             end: "+=1000",
    //             scrub: true,
    //             pin: true,
    //             anticipatePin: 1,
    //             pinSpacing: true,
    //         }
    //     });
    
    //     tl.to(".pxl-image-scroll1 .left, .pxl-image-scroll1 .right", {
    //         width: 0,
    //         opacity: 0,
    //         ease: "power2.inOut",
    //     }, 0)
    //     .to(".pxl-image-scroll1 .pxl-box:not(.left):not(.right)", {
    //         width: "100%",
    //         ease: "power2.inOut",
    //     }, 0);
    // });
    
    

    document.querySelectorAll('.pxl-box').forEach(box => {
        const btn = box.querySelector('.btn.pxl-btn-video');
        if (!btn) return;
      
        box.style.position = 'relative';
        btn.style.position = 'absolute';
      
        box.addEventListener('mousemove', e => {
          const rect = box.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          btn.style.left = x + 'px';
          btn.style.top = y + 'px';
          btn.style.transform = 'translate(-50%, -50%)';
        });
      
        box.addEventListener('mouseleave', () => {
          btn.style.left = '50%';
          btn.style.top = '90%';
          btn.style.transform = 'translate(-50%, -50%)';
        });
    });
      
    const dots = document.querySelectorAll(".bouncy-loader .dot");

    dots.forEach((dot, i) => {
        gsap.to(dot, {
        y: -20,
        scaleY: 1,
        scaleX: 1,
        duration: 0.6,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.2
        });
    });

    document.addEventListener("DOMContentLoaded", function () {
        const container = document.querySelector('.pxl-img-anmation .pxl-content');
        if (!container) return; 
    
        const items = container.querySelectorAll('.pxl-img-item');
        const visibleCount = 3;
        const gap = 10;
        const total = items.length;
    
        let currentIndex = 0;
        let direction = 1;
    
        let itemWidth = items[0]?.getBoundingClientRect().width || 60;
    
        function updatePositions() {
            itemWidth = items[0]?.getBoundingClientRect().width || 60;
            const overlap = 6;
    
            items.forEach((item, index) => {
                const relativeIndex = index - currentIndex;
    
                if (relativeIndex >= 0 && relativeIndex < visibleCount) {
                    item.style.opacity = 1;
                    item.style.transform = `translate3d(${gap + relativeIndex * (itemWidth - overlap)}px, 0, 0)`;
                } else {
                    item.style.opacity = 0;
    
                    if (relativeIndex < 0) {
                        item.style.transform = `translate3d(${relativeIndex * (itemWidth - overlap) - gap}px, 0, 0)`;
                    } else {
                        const offsetRight = visibleCount * (itemWidth - overlap) + gap;
                        item.style.transform = `translate3d(${offsetRight + (relativeIndex - visibleCount) * (itemWidth - overlap)}px, 0, 0)`;
                    }
                }
            });
        }
    
        updatePositions();
    
        setInterval(() => {
            const maxIndex = total - visibleCount;
            if (currentIndex >= maxIndex) direction = -1;
            else if (currentIndex <= 0) direction = 1;
    
            currentIndex += direction;
            updatePositions();
        }, 3000);

        window.addEventListener('resize', updatePositions);
    });
    

    window.addEventListener('DOMContentLoaded', () => {
        const stickyEl = document.querySelector('.pxl-item-sticky');
        const ul = stickyEl?.querySelector('.pxl-scroll-sections ul');
        if (!stickyEl || !ul) return;
      
        const stickyOffset = parseInt(getComputedStyle(stickyEl).top) || 0;
      
        const checkSticky = () => {
          const rect = stickyEl.getBoundingClientRect();
          ul.classList.toggle('show-shadow', rect.top <= stickyOffset);
        };
      
        window.addEventListener('scroll', checkSticky, { passive: true });
        checkSticky(); // chạy 1 lần khi load
      });
      
      
      

      
    
      
      

    

      

})(jQuery);