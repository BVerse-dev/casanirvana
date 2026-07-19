( function( $ ) {
    "use strict";
    function saliver_section_start_render(){
        var _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        
        _elementor.hooks.addFilter( 'pxl_section_start_render', function( html, settings, el ) {
            
            if(typeof settings.pxl_parallax_bg_img != 'undefined' && settings.pxl_parallax_bg_img.url != ''){
                html += '<div class="pxl-section-bg-parallax"></div>';
            }

            if(typeof settings.pxl_color_offset != 'undefined' && settings.pxl_color_offset != 'none'){
                html += '<div class="pxl-section-overlay-color"></div>';
            }

            if(typeof settings.pxl_overlay_img != 'undefined' && settings.pxl_overlay_img.url != ''){
                html += '<div class="pxl-overlay--image pxl-overlay--imageLeft"><div class="bg-image"></div></div>';
            }

            if(typeof settings.pxl_overlay_img2 != 'undefined' && settings.pxl_overlay_img2.url != ''){
                html += '<div class="pxl-overlay--image pxl-overlay--imageRight"><div class="bg-image"></div></div>';
            }

            return html;
        } );

        $('.pxl-section-bg-parallax').parent('.elementor-element').addClass('pxl-section-parallax-overflow');
    }

    function saliver_column_before_render(){
        var _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        _elementor.hooks.addFilter( 'pxl-custom-column/before-render', function( html, settings, el ) {
            if(typeof settings.pxl_column_parallax_bg_img != 'undefined' && settings.pxl_column_parallax_bg_img.url != ''){
                html += '<div class="pxl-column-bg-parallax"></div>';
            }
            return html;
        } );
    }

    function saliver_css_inline_js(){
        var _inline_css = "<style>";
        $(document).find('.pxl-inline-css').each(function () {
            var _this = $(this);
            _inline_css += _this.attr("data-css") + " ";
            _this.remove();
        });
        _inline_css += "</style>";
        $('head').append(_inline_css);
    }

    function saliver_section_before_render(){
        var _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        _elementor.hooks.addFilter( 'pxl-custom-section/before-render', function( html, settings, el ) {
            if (typeof settings['row_divider'] !== 'undefined') {
                if(settings['row_divider'] == 'angle-top' || settings['row_divider'] == 'angle-bottom' || settings['row_divider'] == 'angle-top-right' || settings['row_divider'] == 'angle-bottom-left') {
                    html =  '<svg class="pxl-row-angle" style="fill:#ffffff" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 100 100" version="1.1" preserveAspectRatio="none" height="130px"><path stroke="" stroke-width="0" d="M0 100 L100 0 L200 100"></path></svg>';
                    return html;
                }
                if(settings['row_divider'] == 'angle-top-bottom' || settings['row_divider'] == 'angle-top-bottom-left') {
                    html =  '<svg class="pxl-row-angle pxl-row-angle-top" style="fill:#ffffff" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 100 100" version="1.1" preserveAspectRatio="none" height="130px"><path stroke="" stroke-width="0" d="M0 100 L100 0 L200 100"></path></svg><svg class="pxl-row-angle pxl-row-angle-bottom" style="fill:#ffffff" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 100 100" version="1.1" preserveAspectRatio="none" height="130px"><path stroke="" stroke-width="0" d="M0 100 L100 0 L200 100"></path></svg>';
                    return html;
                }
                if(settings['row_divider'] == 'wave-animation-top' || settings['row_divider'] == 'wave-animation-bottom') {
                    html =  '<svg class="pxl-row-angle" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 150" fill="#fff"><path d="M 0 26.1978 C 275.76 83.8152 430.707 65.0509 716.279 25.6386 C 930.422 -3.86123 1210.32 -3.98357 1439 9.18045 C 2072.34 45.9691 2201.93 62.4429 2560 26.198 V 172.199 L 0 172.199 V 26.1978 Z"><animate repeatCount="indefinite" fill="freeze" attributeName="d" dur="10s" values="M0 25.9086C277 84.5821 433 65.736 720 25.9086C934.818 -3.9019 1214.06 -5.23669 1442 8.06597C2079 45.2421 2208 63.5007 2560 25.9088V171.91L0 171.91V25.9086Z; M0 86.3149C316 86.315 444 159.155 884 51.1554C1324 -56.8446 1320.29 34.1214 1538 70.4063C1814 116.407 2156 188.408 2560 86.315V232.317L0 232.316V86.3149Z; M0 53.6584C158 11.0001 213 0 363 0C513 0 855.555 115.001 1154 115.001C1440 115.001 1626 -38.0004 2560 53.6585V199.66L0 199.66V53.6584Z; M0 25.9086C277 84.5821 433 65.736 720 25.9086C934.818 -3.9019 1214.06 -5.23669 1442 8.06597C2079 45.2421 2208 63.5007 2560 25.9088V171.91L0 171.91V25.9086Z"></animate></path></svg>';
                    return html;
                }
                if(settings['row_divider'] == 'curved-top' || settings['row_divider'] == 'curved-bottom') {
                    html =  '<svg class="pxl-row-angle" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 1920 128" version="1.1" preserveAspectRatio="none" style="fill:#ffffff"><path stroke-width="0" d="M-1,126a3693.886,3693.886,0,0,1,1921,2.125V-192H-7Z"></path></svg>';
                    return html;
                }
            }
        } );
    } 
    function saliverElBeforeRender() {
        let _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;

        _elementor.hooks.addFilter('pxl_section_start_render', function(output, settings) {
            if (settings.el_overlay_control) { 
                output += `<div class="e-con-overlay"></div>`;
            }
            return output;
        });
    }

    

    var PXL_Icon_Contact_Form = function( $scope, $ ) {
        
        setTimeout(function () {
            $('.pxl--item').each(function () {
                var icon_input = $(this).find(".pxl--form-icon"),
                    control_wrap = $(this).find('.wpcf7-form-control');
                control_wrap.before(icon_input.clone());
                icon_input.remove();
            });
        }, 10);

    };

    function saliver_split_text($scope){

        setTimeout(function () {

            var st = $scope.find(".pxl-split-text");
            if(st.length == 0) return;
            gsap.registerPlugin(SplitText);
            st.each(function(index, el) {
                el.split = new SplitText(el, { 
                    type: "lines,words,chars",
                    linesClass: "split-line"
                });
                gsap.set(el, { perspective: 400 });

                if( $(el).hasClass('split-in-fade') ){
                    $(el).addClass('active');
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        ease: "Back.easeOut",
                    });
                }
                if( $(el).hasClass('split-in-right') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        x: "50",
                        ease: "Back.easeOut",
                    });
                }
                if( $(el).hasClass('split-in-left') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        x: "-50",
                        ease: "circ.out",
                    });
                }
                if( $(el).hasClass('split-in-up') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        y: "80",
                        ease: "circ.out",
                    });
                }
                if( $(el).hasClass('split-in-down') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        y: "-80",
                        ease: "circ.out",
                    });
                }
                if( $(el).hasClass('split-in-rotate') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        rotateX: "50deg",
                        ease: "circ.out",
                    });
                }
                if( $(el).hasClass('split-in-scale') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        scale: "0.5",
                        ease: "circ.out",
                    });
                }
                el.anim = gsap.to(el.split.chars, {
                    scrollTrigger: {
                        trigger: el,
                        toggleActions: "restart pause resume reverse",
                        start: "top 90%",
                    },
                    x: "0",
                    y: "0",
                    rotateX: "0",
                    scale: 1,
                    opacity: 1,
                    duration: 0.8, 
                    stagger: 0.02,
                });
            });

        }, 200);
    }
    
    

    function saliver_zoom_point(){
        elementorFrontend.waypoint($(document).find('.pxl-zoom-point'), function () {
            var offset = $(this).offset();
            var offset_top = offset.top;
            var scroll_top = $(window).scrollTop();
        }, {
            offset: -100,
            triggerOnce: true
        });
    }

    function saliver_scroll_fixed_section(){
        if($('.pxl-section-fix-top').length > 0) {
            ScrollTrigger.matchMedia({
                "(min-width: 991px)": function() {
                    const pinnedSections = ['.pxl-section-fix-top'];
                    pinnedSections.forEach(className => {
                        gsap.to(".pxl-section-fix-bottom", {
                            scrollTrigger: {
                                trigger: ".pxl-section-fix-bottom",
                                scrub: true,
                                pin: className,
                                pinSpacing: false,
                                start: 'top bottom',
                                end: "bottom top",
                            },
                        });
                    });
                }
            });
        }
    }

    function saliver_image_marquee($scope) {
        if (!$scope.hasClass('pxl-enable-marquee')) return;
    
        const logos = $scope.find('.pxl-item--marquee');
        gsap.set(logos, { autoAlpha: 1 });
    
        logos.each(function(index, el) {
            gsap.set(el, { xPercent: 100 * index });
        });
    
        if (logos.length > 2) {
            const logosWrap = gsap.utils.wrap(-100, ((logos.length - 1) * 100));
            const durationNumber = logos.data('duration');
            const slipType = logos.data('slip-type');
            let slipResult = `-=${logos.length * 100}`;
    
            if (slipType == 'right') {
                slipResult = `+=${logos.length * 100}`;
            }
    
            gsap.to(logos, {
                xPercent: slipResult,
                duration: durationNumber,
                repeat: -1,
                ease: 'none',
                modifiers: {
                    xPercent: xPercent => logosWrap(parseFloat(xPercent))
                }
            });
        }
    }
    

    function saliver_text_marquee($scope){

        const text_marquee = $scope.find('.pxl-text--marquee');

        const boxes = gsap.utils.toArray(text_marquee);

        const loop = text_horizontalLoop(boxes, {paused: false,repeat: -1,});

        function text_horizontalLoop(items, config) {
            items = gsap.utils.toArray(items);
            config = config || {};
            let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
                length = items.length,
                startX = items[0].offsetLeft,
                times = [],
                widths = [],
                xPercents = [],
                curIndex = 0,
                pixelsPerSecond = (config.speed || 1) * 100,
                snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
                totalWidth, curX, distanceToStart, distanceToLoop, item, i;
            gsap.set(items, {
                xPercent: (i, el) => {
                    let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
                    xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
                    return xPercents[i];
                }
            });
            gsap.set(items, {x: 0});
            totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0);
            for (i = 0; i < length; i++) {
                item = items[i];
                curX = xPercents[i] / 100 * widths[i];
                distanceToStart = item.offsetLeft + curX - startX;
                distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
                tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
                  .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
                  .add("label" + i, distanceToStart / pixelsPerSecond);
                times[i] = distanceToStart / pixelsPerSecond;
            }
            function toIndex(index, vars) {
                vars = vars || {};
                (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
                let newIndex = gsap.utils.wrap(0, length, index),
                    time = times[newIndex];
                if (time > tl.time() !== index > curIndex) { 
                    vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
                    time += tl.duration() * (index > curIndex ? 1 : -1);
                }
                curIndex = newIndex;
                vars.overwrite = true;
                return tl.tweenTo(time, vars);
            }
            tl.next = vars => toIndex(curIndex+1, vars);
            tl.previous = vars => toIndex(curIndex-1, vars);
            tl.current = () => curIndex;
            tl.toIndex = (index, vars) => toIndex(index, vars);
            tl.times = times;
            tl.progress(1, true).progress(0, true);
            if (config.reversed) {
                tl.vars.onReverseComplete();
                tl.reverse();
            }
            return tl;
        }
    }

    function saliver_image_effect($scope) {
        const links = $scope.find('.pxl-post--featured a'); 
        if (!links.length) return;
    
        links.each(function(index, el) {
            let img = $(el).find('img'); 
            if (img.length) {
                let src = img.attr("src");
    
                let displacementImageEl = $scope.find('.pxl-image-webgl'); 
                let displacementImage = displacementImageEl.length ? displacementImageEl.attr("src") : ''; 
    
                if (!displacementImage) {
                    return;
                }
    
                let myAnimation = new hoverEffect({
                    parent: el,
                    intensity: 0.3,
                    image1: src,
                    image2: src,
                    displacementImage: displacementImage,
                });
            }
        });
    }
    
    ///scroll text
    // function saliver_text_scroll_bar($scope) {
    //     var listContainer = $scope.find('.pxl-text-scroll2 .pxl-list');
        
    //     if (listContainer.length > 0) {
    //         var progressPath = $scope.find('.barContainer .bar')[0];
    //         var listItems = $scope.find('.pxl-text-scroll2 .pxl-list .pxl-item');
    
    //         var totalHeight = listContainer[0].scrollHeight - listContainer.outerHeight();
    
    //         progressPath.style.transition = 'height 10ms linear';
    //         progressPath.style.height = '20%';
    
    //         var updateProgress = function () {
    //             var scroll = listContainer.scrollTop();
    //             var progress = (scroll / totalHeight) * 100;
    //             progressPath.style.height = (progress + 20) + '%';
    //         };
    
    //         updateProgress();
    
    //         listContainer.on('scroll', updateProgress);
    
    //         var offset = 50;
    //         var duration = 550;
    //         $(window).on('scroll', function () {
    //             if ($(this).scrollTop() > offset) {
    //                 $('.pxl-scroll-top').addClass('active-progress');
    //             } else {
    //                 $('.pxl-scroll-top').removeClass('active-progress');
    //             }
    //         });
    //     }
    // }
    function cursorSpotlight() {

        if (window.innerWidth <= 767) return;

        const sections = document.querySelectorAll('.elementor-section');
    
        sections.forEach(section => {
            const spotlight = section.querySelector('.cursor-spotlight');
            if (!spotlight) return;
    
            section.addEventListener('mousemove', (e) => {
                const rect = section.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
    
                gsap.to(spotlight, {
                    '--pxl-translate-x': `${mouseX}px`,
                    '--pxl-translate-y': `${mouseY}px`,
                    '--pxl-box-size': '200px',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
    
            section.addEventListener('mouseleave', () => {
                gsap.to(spotlight, {
                    '--pxl-box-size': '0px',
                    duration: 0.5,
                    ease: 'power2.out'
                });
            });
        });
    }
    

    function initVSlideAnimation($scope) {
        if (!$scope[0].querySelector('.v-slides')) return;

        const slides = $scope[0].querySelectorAll('.v-slide');
        const isSingle = slides.length === 1;

        const vsOpts = {
            slides: slides,
            list: $scope[0].querySelector('.v-slides'),
            container: $scope[0].querySelector('.pxl-container'),
            duration: 0.3,
            lineHeight: parseFloat(getComputedStyle(slides[0]).lineHeight)
        };

        const vSlide = gsap.timeline({
            paused: true,
            repeat: isSingle ? 0 : -1
        });

        slides.forEach(function(slide, i) {
            const label = "slide" + i;
            vSlide.add(label);

            vSlide.to(vsOpts.container, {
                duration: vsOpts.duration,
                "--before-width": "0%",
                ease: "power2.inOut"
            }, label);

            vSlide.to(vsOpts.list, {
                duration: vsOpts.duration,
                y: i * -1 * vsOpts.lineHeight
            }, label);

            const letters = new SplitText(slide, { type: "chars" }).chars;
            vSlide.from(letters, {
                duration: vsOpts.duration,
                x: -50,
                opacity: 0,
                stagger: vsOpts.duration / 10,
                ease: "power2.out"
            }, label);

            vSlide.to(vsOpts.container, {
                duration: vsOpts.duration,
                "--before-width": "100%",
                ease: "power2.inOut"
            });

            vSlide.to({}, { duration: isSingle ? 0 : 2.2 });
        });

        vSlide.play();
    }

    




    function saliver_triger($scope) {
        gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

        /* Main navigation */
        let $panelsSection = $scope.find(".pxl-tabs-slip1.style-2"),
        $panelsContainer = $scope.find(".pxl-tabs-slip1.style-2 .pxl-tabs--content"),
        tween;

        const $panels = $scope.find(".pxl-tabs-slip1.style-2 .pxl-tabs--content .pxl-item--content");
        const $anchors = $scope.find(".pxl-tabs-slip1.style-2 .anchor");
        const $paginationFraction = $scope.find(".pagination-fraction");
        const $currentPage = $paginationFraction.find(".current-page");
        const $totalPages = $paginationFraction.find(".total-pages");

        $currentPage.text(formatNumber(1));
        $totalPages.text(formatNumber($panels.length));

        $anchors.each(function() {
            $(this).on("click", function(e) {
                e.preventDefault();
                let targetElem = $(e.target).attr("href"),
                $targetElem = $scope.find(targetElem); 

                let y = $targetElem;

                if ($targetElem.length && $panelsContainer.is($targetElem.parent())) {
                    let totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start,
                    totalMovement = ($panels.length - 1) * $targetElem.outerWidth();
                    y = Math.round(tween.scrollTrigger.start + ($targetElem.position().left / totalMovement) * totalScroll);
                }

                gsap.to(window, {
                    scrollTo: {
                        y: y,
                        autoKill: false
                    },
                    duration: 1
                });
            });
        });

        /* Panels */
        tween = gsap.to($panels, {
            xPercent: -100 * ($panels.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: $panelsContainer,
                pin: true,
                start: "top top",
                scrub: 1,
                snap: {
                    snapTo: 1 / ($panels.length - 1),
                    inertia: false,
                    duration: { min: 0.1, max: 0.1 }
                },
                end: () => "+=" + ($panelsContainer.outerWidth() - $(window).width()),
                onUpdate: self => {
                    let progress = self.progress; 
                    let currentIndex = Math.round(progress * ($panels.length - 1)) + 1;
                    $currentPage.text(formatNumber(currentIndex));
                }
            }
        });

        function throttle(func, delay) {
            let lastCall = 0;
            return function (...args) {
                const now = new Date().getTime();
                if (now - lastCall >= delay) {
                    lastCall = now;
                    func.apply(this, args);
                }
            };
        }


        $(window).on('scroll', throttle(function() {
            let middleOfScreen = $(window).width() / 2; 
        
            let activeIndex = -1;
            let minDiff = Infinity;
        
            $panels.each(function(index) {
                let rect = this.getBoundingClientRect();
                let diff = Math.abs(rect.left + rect.width / 2 - middleOfScreen);
        
                if (diff < minDiff) {
                    minDiff = diff;
                    activeIndex = index;
                }
            });
        
            setActiveItem(activeIndex);
        }, 100));
        
        

        function setActiveItem(index) {
            $panels.removeClass("active");
            if ($panels.eq(index).length) {
                $panels.eq(index).addClass("active");
            }
        }
              
        function formatNumber(num) {
            return num < 10 ? `0${num}` : num;
        }
    }

    function wglPhysicsButton($scope) {
        var Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            MouseConstraint = Matter.MouseConstraint;
    
        var logoArea = $scope.querySelector(".pxl-button_physics");
        if (!logoArea) return;
    
        // Lấy dữ liệu từ data-settings
        const rawSettings = logoArea.getAttribute("data-settings");
        if (!rawSettings) return;
    
        let settings;
        try {
            settings = JSON.parse(rawSettings.replace(/&quot;/g, '"'));
        } catch (e) {
            console.error("Lỗi parse JSON settings:", e);
            return;
        }
    
        let w = logoArea.offsetWidth;
        let h = logoArea.offsetHeight;
    
        var engine = Engine.create();
        engine.world.gravity.x = 0;
        engine.world.gravity.y = 0.7;
    
        var render = Render.create({
            element: logoArea,
            engine: engine,
            options: {
                width: w,
                height: h,
                background: "rgba(0,0,0,0)",
                wireframes: false,
                pixelRatio: window.devicePixelRatio,
            },
        });
    
        const wallOptions = {
            isStatic: true,
            render: { visible: false },
        };
    
        const padding = 10;
        const ceiling = Bodies.rectangle(w / 2, 0 - padding, w + padding * 2, 10, wallOptions);
        const ground = Bodies.rectangle(w / 2, h + padding, w + padding * 2, 10, wallOptions);
        const leftWall = Bodies.rectangle(0 - padding, h / 2, 10, h + padding * 2, wallOptions);
        const rightWall = Bodies.rectangle(w + padding, h / 2, 10, h + padding * 2, wallOptions);
    
        const shapes = [];
    
        settings.forEach((value, index) => {
            const text = value.text || '';
            const img = value.img || '';
            if (!text && !img) return;
    
            const textElement = document.createElement("div");
            textElement.className = "pxl-throwable-element";
            textElement.style.cssText = `
                opacity: 0;
                position: absolute;
                visibility: hidden;
                pointer-events: none;
                transform: translate(-50%, -50%);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 400;
                color: white;
                text-align: center;
                white-space: nowrap;
            `;
    
            if (img) {
                const imgEl = document.createElement("img");
                imgEl.src = img;
                imgEl.style.cssText = "width: 150px; height: 150px; display: inline-block;";
                textElement.appendChild(imgEl);
            }
    
            if (text) {
                const spanElement = document.createElement("span");
                spanElement.className = "span-element-rot";
                spanElement.innerText = text;
                textElement.appendChild(spanElement);
            }
    
            logoArea.appendChild(textElement);
    
            const width = textElement.offsetWidth;
            const height = textElement.offsetHeight;

            textElement.style.opacity = "1";
            textElement.style.visibility = "visible";
    
            const x = 45 + (index % 2) * (width + 55);
            const y = 70;
    
            const shape = Bodies.rectangle(x, y, width, height, {
                render: { visible: false },
            });
    
            const delay = Math.random() * 2000;
            setTimeout(() => {
                Matter.Body.applyForce(shape, shape.position, {
                    x: Math.random() * 0.05,
                    y: Math.random() * 0.05 + 0.07,
                });
            }, delay);
    
            shapes.push({ body: shape, element: textElement });
        });
    
        const mouseControl = MouseConstraint.create(engine, {
            element: logoArea,
            constraint: {
                render: { visible: false },
            },
        });
    
        Composite.add(engine.world, [ground, ceiling, rightWall, leftWall, mouseControl, ...shapes.map((s) => s.body)]);
    
        Render.run(render);
        var runner = Runner.create();
        Runner.run(runner, engine);
    
        Matter.Events.on(engine, "afterUpdate", () => {
            shapes.forEach(({ body, element }) => {
                element.style.left = `${body.position.x}px`;
                element.style.top = `${body.position.y}px`;
                element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
            });
        });
    }
    function waitForImagesAndRender(scope, callback) {
        requestAnimationFrame(() => {
            const images = scope.querySelectorAll("img");
            let loaded = 0;
    
            if (images.length === 0) return callback();
    
            images.forEach((img) => {
                if (img.complete && img.naturalHeight !== 0) {
                    loaded++;
                    if (loaded === images.length) callback();
                } else {
                    img.onload = img.onerror = () => {
                        loaded++;
                        if (loaded === images.length) callback();
                    };
                }
            });
        });
    }
    

    
    

    function saliverWidgetTextImage($scope) {
        if($scope.find('.pxl-text-img-wrap').length <= 0) return;
        var mouseX = 0,
        mouseY = 0;

        $scope.find('.pxl-text-img-wrap .pxl-item--inner').mousemove(function(e){
            var offset = $(this).offset();
            mouseX = (e.pageX - offset.left);
            mouseY = (e.pageY - offset.top);
        });

        $scope.find('.pxl-text-img-wrap ul>li').on("mouseenter", function() {
            $(this).removeClass('deactive').addClass('active');
            var target = $(this).attr('data-target');
            $(this).closest('.pxl-item--inner').find(target).removeClass('deactive').addClass('active');
        });
        $scope.find('.pxl-text-img-wrap ul>li').on("mouseleave", function() {
            $(this).addClass('deactive').removeClass('active');
            var target = $(this).attr('data-target');
            $(this).closest('.pxl-item--inner').find(target).addClass('deactive').removeClass('active');
        });
        const s = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        },
        t = gsap.quickSetter($scope.find('.pxl-text-img-wrap .pxl-item--inner'), "css"),
        e = gsap.quickSetter($scope.find('.pxl-text-img-wrap .pxl-item--inner'), "css");

        gsap.ticker.add((() => {
            const o = .15,
            i = 1 - Math.pow(.85, gsap.ticker.deltaRatio());
            s.x += (mouseX - s.x) * i,
            s.y += (mouseY - s.y) * i,
            t({
                "--pxl-mouse-x": `${s.x}px`
            }), e({
                "--pxl-mouse-y": `${s.y}px`
            })
        }))
    }
    

    $( window ).on( 'elementor/frontend/init', function() {
        saliver_section_start_render();
        saliver_column_before_render();
        saliver_css_inline_js();
        saliver_section_before_render();
        saliverElBeforeRender();
        saliver_zoom_point();
        saliver_scroll_fixed_section();
        cursorSpotlight();
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_contact_form.default', PXL_Icon_Contact_Form );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_heading.default', function( $scope ) {
            saliver_split_text($scope);
        } );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_image_marquee.default', function( $scope ) {
            saliver_image_marquee($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_text_marquee.default', function( $scope ) {
            saliver_text_marquee($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_post_grid.default', function( $scope ) {
            saliver_image_effect($scope);
        } );

        // elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_text_scroll.default', function( $scope ) {
        //     saliver_text_scroll_bar($scope);
        // } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_heading.default', function( $scope ) {
            initVSlideAnimation($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_tabs_slip.default', function( $scope ) {
            if ($(window).width() > 767) {
                saliver_triger($scope);
            }
        } );

        
        elementorFrontend.hooks.addAction('frontend/element_ready/physics_item.default', function($scope) {
            const scopeEl = $scope[0];
        
            waitForImagesAndRender(scopeEl, () => {
                requestAnimationFrame(() => {
                    wglPhysicsButton(scopeEl);
                });
            });
        });
        
        
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_list_menu.default', function( $scope ) {
            saliverWidgetTextImage($scope);
        } );
    } );

} )( jQuery );