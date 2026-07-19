(function ($) {
    var speed = 10;
    function typeWriter(text, selector, i, j, tag, myAudio) {
        if(j < text.length) {
            var txt = text[j];
            if (i <= txt.length) {
                if(tag && tag != 'INPUT' && tag != 'TEXTAREA') {
                    if(tag == 'IFRAME') {
                        var cur = $(selector).contents().find('body').html();
                        $(selector).contents().find('body').html(cur+txt.charAt(i));        
                    } else if($(selector).hasClass('ql-editor')) {
                        var cur = $(selector+' p:last').html();
                        $(selector+' p:last').html(cur+txt.charAt(i));
                    } else {
                        if($(selector).children('li').length) {
                            var cur = $(selector+' li:last-child').html();
                            $(selector+' li:last-child').html(cur+txt.charAt(i));
                        } else {
                            var cur = $(selector).html();
                            $(selector).html(cur+txt.charAt(i));
                        }
                    }
                } 
                else{
                    var cur = $(selector).val();
                    if($(selector).hasClass('editor-post-title__input')) wp.data.dispatch( 'core/editor' ).editPost( { title: cur+txt.charAt(i) } );
                    else $(selector).val(cur+txt.charAt(i));
                }
                i++;
                if(i == txt.length || txt.length == 0) {
                    j++;
                    if(tag == 'IFRAME') {
                        var cur = $(selector).contents().find('body').html();
                        $(selector).contents().find('body').html(cur+"<br>");
                    } else {
                        if($(selector).attr('data-type') == 'core/paragraph') {
                            var cur = $(selector).html();
                            $(selector).html(cur+"<br data-rich-text-line-break='true'>");
                        }
                    }
                    i = 0;
                }
                if(j == text.length){
                    $(document).find('.bertha_idea').each(function(){
                        $(this).removeClass('bertha_idea_non_clickable');
                    });
                    myAudio.pause();
                    $(selector).removeClass('ber-disabled-click');
                    if(tag == 'IFRAME') {
                        var cur = $(selector).contents().find('body').html();
                        $(selector).contents().find('body').html(cur+"<br>");
                        $(selector).contents().find('body').focus();
                        var e = jQuery.Event("keyup");
                        e.which = 32; // # Some key code value
                        $(selector).contents().find('body').html(cur+String.fromCharCode(e.which));
                        $(selector).contents().find('body').trigger(e);
                        $('#et-fb-filter-options--settings-modal-front--input').trigger('focus');
                    } else {
                        if($(selector).attr('data-type') == 'core/paragraph') {
                            $('.editor-post-title__input').focus();
                            var cur = $(selector).html();
                            $(selector).html(cur+"<br data-rich-text-line-break='true'>");
                        }
                    }
                }
                setTimeout(function() {
                    typeWriter(text, selector, i, j, tag, myAudio);
                }, speed);
            }
        }
    }

    function typeWriterText(txt, selector, i, tag, myAudio) { 
      if (i < txt.length) {
        if(tag && tag != 'INPUT' && tag != 'TEXTAREA') {
            if(tag == 'IFRAME') {
                var cur = $(selector).contents().find('body pre:last-child').html();
                $(selector).contents().find('body pre:last-child').html(cur+txt.charAt(i));        
            } else {
                if($(selector).children('li').length) {
                    var cur = $(selector+' li:last-child').html();
                    $(selector+' li:last-child').html(cur+txt.charAt(i));
                } else {
                    if($(selector).hasClass('editor-post-title__input')) {
                        var cur = wp.data.select('core/editor').getEditedPostAttribute('title');
                        wp.data.dispatch( 'core/editor' ).editPost( { title: cur+txt.charAt(i) } );
                    } else {
                        var cur = $(selector).html();
                        $(selector).html(cur+txt.charAt(i));
                    }
                }
            }
        } 
        else{
            var cur = $(selector).val();
            $(selector).val(cur+txt.charAt(i));
        }
        i++;
        setTimeout(function() {
            typeWriterText(txt, selector, i, tag, myAudio);
        }, speed);
        if(i == txt.length) {
            myAudio.pause();
            $(document).find('.bertha_idea').each(function(){
                $(this).removeClass('bertha_idea_non_clickable');
            });
            var cur = $(selector).val();
            $(selector).focus();
            var e = jQuery.Event("keyup");
            e.which = 32; // # Some key code value
            $(selector).val(cur+String.fromCharCode(e.which));
            $(selector).trigger(e);
            if($(document).find('.editor-post-title__input').length) {
                $(document).find('.editor-post-title__input').trigger('focus');
                $(selector).trigger('focus');
            }
            $('#et-fb-filter-options--settings-modal-front--input').trigger('focus');
        }
      }
    }

    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };


    var wa_sidebar = bertha_setup_object.wa_template;
    $(document).ready(function(){
        var history_count = 20;
        var favourite_count = 20;
        var drft_count = 20;

        $('.clear_transient').on('click', function() {
            var ajaxurl = bertha_setup_object.ajax_url;
            var data = {
                action   : 'wa_bertha_clear_transient',
                bertha_clear_transient_nonce: bertha_setup_object.template_nonce
            } 
            $.post(ajaxurl, data, function(response) {
                if(response == "success") {
                    $('.clear_transient').val('Clear Successfully.');
                    location.reload();
                }
            });
        });

        $(document).on('click', function(e){
            if($(document).find('#ber-more-container input:checked').length && e.target.parentElement.id != 'ber-more-container') {
                $(document).find('#ber-more-container input').prop('checked', false);
            }
        });

        $('.post-type-attachment').on('change', '#bulk-action-selector-top', function() {
            if($(this).val() == 'bulk_alt_text') $('.post-type-attachment').find('#doaction').attr('type', 'button');
            else $('.post-type-attachment').find('#doaction').attr('type', 'submit');
        });

        $('.post-type-attachment').on('click', '#doaction', function() {
            if($('.post-type-attachment').find('#bulk-action-selector-top').val() == 'bulk_alt_text') {
                var selectedImageIds = $('input[name="media[]"]:checked').map(function() {
                    return $(this).val();  
                }).get();  
                if (selectedImageIds.length > 0) {
                    var count = image = 0;
                    var ths = $(this);
                    ths.css({'pointer-events': 'none','opacity': '0.5'});
                    $(this).next('.bulk-alt-progress').remove();
                    $(this).after('<div class="bulk-alt-progress"><span>Alt text for</span> <span class="img-count">0</span> <span>of '+selectedImageIds.length+' images completed.</span><div class="progress-bar"></div></div>');
                    $.each(selectedImageIds, function(index, imageId) { 
                        $.ajax({
                            url:  bertha_setup_object.ajax_url,
                            data: {
                                action   : 'create_img_alt',
                                imageId : imageId,
                                bertha_create_alt_nonce: bertha_setup_object.template_nonce
                            },
                            type: 'POST',
                            success: function( result ) {
                                var response = JSON.parse(result);
                                if(response['image_title'] && response['alttext']) {
                                    count++;
                                    var percentComplete = Math.round((count / selectedImageIds.length) * 100);
                                    $('.post-type-attachment').find('.bulk-alt-progress .img-count').text(count);
                                    $('#post-'+imageId).find('.column-ber_alt_txt').html(response['alttext']); 
                                    $('#post-'+imageId).find('.column-title a').contents().filter(function() {
                                        return this.nodeType === Node.TEXT_NODE;
                                    }).remove();
                                    $('#post-'+imageId).find('.column-title a').append(response['image_title']);
                                    $('.progress-bar').css('width', percentComplete + '%'); 
                                }
                                image++;
                                if(image == selectedImageIds.length) {
                                    ths.css({'pointer-events': '','opacity': ''});
                                    window.location.href = window.location.href;
                                }   
                            }
                        });
                    });
                }
            }
        });

        setTimeout(function(){
            $(document).find('#toplevel_page_bertha-ai-setting a.toplevel_page_bertha-ai-setting').attr('href', '#');
            var head = $("#bertha_backend_body_ifr").contents().find("head");
            var css = '<style>body { font-size: 16px !important; }</style>';
            $(head).append(css);
        }, 2000);

        $(document).on('click', '.ber-nav-tabs li .ber-nav-link, #ber-more-container li', function() {
            var templates = bertha_setup_object.free_options;
            var plugin_type = bertha_setup_object.plugin_type ? bertha_setup_object.plugin_type : '';
            $('.bertha-back').hide();
            $('.bertha-back').removeAttr("id");
            var control = $(this).attr('aria-controls');
            var loader = '<div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>';
            if(control == 'templates' && $(this).closest('#bertha_backend_canvas').length == 0) {
                var templates = bertha_setup_object.free_options;
                $(".ber-tab-content").find('#templates .ber-overlay-container').show();
                $('.ber-nav-item #chat-tab').removeClass('ber-active');
                $('.ber-tab-content #chat').removeClass('ber-show ber-active');
                $('.ber-tab-content #chat').html(loader);
                $('.ber-nav-item #image-tab').removeClass('ber-active');
                $('.ber-tab-content #image').removeClass('ber-show ber-active');
                $('.ber-tab-content #image').html(loader);
                $('.ber-tab-content #ama').removeClass('ber-show ber-active');
                $('.ber-tab-content #ama').html(loader);
                $('.ber-nav-item #audio-tab').removeClass('ber-active');
                $('.ber-tab-content #audio').removeClass('ber-show ber-active');
                $('.ber-tab-content #audio').html(loader);
                var disabled = '';
                var ran_word1 = '';
                var ran_word2 = '';
                var plugin_type = bertha_setup_object.plugin_type ? bertha_setup_object.plugin_type : '';
                var premium_tag = '<span class="bertha_power">Premium</span>';
                var usp_version = (templates.usp_version || plugin_type == 'pro') ? '' : premium_tag;
                var heading_version = (templates.heading_version || plugin_type == 'pro') ? '' : premium_tag;
                var benefit_title_version = (templates.benefit_title_version || plugin_type == 'pro') ? '' : premium_tag;
                var title_version = (templates.title_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var paragraph_version = (templates.paragraph_version || plugin_type == 'pro') ? '' : premium_tag;
                var content_version = (templates.content_version || plugin_type == 'pro') ? '' : premium_tag;
                var service_version = (templates.service_version || plugin_type == 'pro') ? '' : premium_tag;
                var company_version = (templates.company_version || plugin_type == 'pro') ? '' : premium_tag;
                var company_mission_version = (templates.company_mission_version || plugin_type == 'pro') ? '' : premium_tag;
                var testimonial_version = (templates.testimonial_version || plugin_type == 'pro') ? '' : premium_tag;
                var bullet_version = (templates.bullet_version || plugin_type == 'pro') ? '' : premium_tag;
                var personal_bio_version = (templates.personal_bio_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var topic_ideas_version = (templates.topic_ideas_version || plugin_type == 'pro') ? '' : premium_tag;
                var intro_para_version = (templates.intro_para_version || plugin_type == 'pro') ? '' : premium_tag;
                var post_outline_version = (templates.post_outline_version || plugin_type == 'pro') ? '' : premium_tag;
                var conclusion_version = (templates.conclusion_version || plugin_type == 'pro') ? '' : premium_tag;
                var action_version = (templates.action_version || plugin_type == 'pro') ? '' : premium_tag;
                var child_input_version = (templates.child_input_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var benefit_list_version = (templates.benefit_list_version || plugin_type == 'pro') ? '' : premium_tag;
                var seo_title_version = (templates.seo_title_version || plugin_type == 'pro') ? '' : premium_tag;
                var seo_description_version = (templates.seo_description_version || plugin_type == 'pro') ? '' : premium_tag;
                var aida_marketing_version = (templates.aida_marketing_version || plugin_type == 'pro') ? '' : premium_tag;
                var seo_city_version = (templates.seo_city_version || plugin_type == 'pro') ? '' : premium_tag;
                var buisiness_name_version = (templates.buisiness_name_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var bridge_version = (templates.bridge_version || plugin_type == 'pro') ? '' : premium_tag;
                var pas_framework_version = (templates.pas_framework_version || plugin_type == 'pro') ? '' : premium_tag;
                var faq_list_version = (templates.faq_list_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var faq_answer_version = (templates.faq_answer_version || plugin_type == 'pro') ? '' : premium_tag;
                var summary_version = (templates.summary_version || plugin_type == 'pro') ? '' : premium_tag;
                var quickwins_version = (templates.quickwins_version || plugin_type == 'pro') ? '' : premium_tag;
                var contact_blurb_version = (templates.contact_blurb_version || plugin_type == 'pro') ? '' : premium_tag;
                var seo_keyword_version = (templates.seo_keyword_version || plugin_type == 'pro') ? '' : premium_tag;
                var evil_bertha_version = (templates.evil_bertha_version || plugin_type == 'pro') ? '' : premium_tag;
                var real_estate_version = (templates.real_estate_version || plugin_type == 'pro') ? '' : premium_tag;
                var press_blurb_version = (templates.press_blurb_version || plugin_type == 'pro' || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var case_study_version = (templates.case_study_version || plugin_type == 'pro' || plugin_type == 'pro') ? '' : premium_tag;
                var evil_bertha_version = (templates.evil_bertha_version || plugin_type == 'pro') ? '' : premium_tag;

                var templates = '<div class="ber-offcanvas-title" id="ber-offcanvasExampleLabel">What are we writing?</div><div class="ber_inner_ber-offcanvas"></div><div id="template_selection" class="input_details"><div class="ber_search"><img class="ber_search_icon" src="'+bertha_setup_object.ber_search_img+'"><input type="text" class="ber_history_filter" id="bertha_template_filter" placeholder="Search Templates"></div><div class="ber_search_template"><input type="submit" class="ber_search_tag all" data-id="all" value="All" /><input type="submit" class="ber_search_tag website" data-id="website" value="Website" /><input type="submit" class="ber_search_tag blog" data-id="blog" value="Blog" /><input type="submit" class="ber_search_tag seo" data-id="seo" value="SEO" /><input type="submit" class="ber_search_tag marketing" data-id="marketing" value="Marketing" /><input type="submit" class="ber_search_tag speciality" data-id="speciality" value="Speciality" /><input type="submit" class="ber_search_tag useful_extra" data-id="useful_extra" value="Extras" /></div><form  id="form3"><div class="ber_inner_title" data-id="website">Website Copy Generation<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="website">Models to perfect the micro-copy of the website, choose the right model for each section you\'re working on for optimal results</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option8" data-id="USP" data-name="Unique Value Proposition" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option8" data-id="website"><span class="bertha_template_icon">🏆</span>Unique Value Proposition<span class="bertha_template_desc">That will make you stand out from the Crowd and used as the top sentence of your website.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option9" data-id="Headline" data-name="Website Sub-Headline" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option9" data-id="website"><span class="bertha_template_icon">🥈</span>Website Sub-Headline'+heading_version+'<span class="bertha_template_desc">A converting description that will go below your USP on the website - great for H2 Headings and SEO.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option21" data-id="blog-action" data-name="Button Call to Action" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option21" data-id="website"><span class="bertha_template_icon">🎯</span>Button Call to Action'+action_version+'<span class="bertha_template_desc">With Bertha, you can generate a call to action button that\'s guaranteed to convert. No more guessing what words will convert best!</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option10" data-id="Title" data-name="Section Title Generator" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option10" data-id="website"><span class="bertha_template_icon">🏹</span>Section Title Generator'+title_version+'<span class="bertha_template_desc">Creative titles for each section of your website. No more boring "About us" type of titles.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option12" data-id="Benefit-List" data-name="Benefit Lists" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option12" data-id="website"><span class="bertha_template_icon">🥰</span>Service/Product Benefit List'+benefit_list_version+'<span class="bertha_template_desc">Instantly generate a list of differentiators and benefits for your own company and brand.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option5" data-id="Benefit-Title" data-name="Title to Benefit Sections" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option5" data-id="website"><span class="bertha_template_icon">🦚</span>Title to Benefit Sections'+benefit_title_version+'<span class="bertha_template_desc">Take a benefit of your product/service and expand it to provide additional engaging details.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option7" data-id="Content-Improver" data-name="Content Improver" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option7" data-id="website"><span class="bertha_template_icon">🎢</span>Content Rephraser'+content_version+'<span class="bertha_template_desc">Not confident with what you wrote? Paste it in and let Bertha\'s magic make it all better.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option13" data-id="Service" data-name="Product/Service Description" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option13" data-id="website"><span class="bertha_template_icon">💲</span>Product/Service Description'+service_version+'<span class="bertha_template_desc">Awesome product descriptions sell more products - Let Bertha help you by providing exceptional product descriptions.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option14" data-id="Company" data-name="Company Bio" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option14" data-id="website"><span class="bertha_template_icon">🏭</span>Full-on About Us Page<span class="bertha_template_desc">Bertha already knows you. She will write an overview, history, mission and vision for your company.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option23" data-id="Company-mission" data-name="Company Mission & Vision" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option23" data-id="website"><span class="bertha_template_icon">🚀</span>Company Mission & Vision<span class="bertha_template_desc">From your company description, Bertha will write inspiring Mission and Vision statements for your "About Us" page.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option16" data-id="personal-bio" data-name="Personal Bio" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option16" data-id="website"><span class="bertha_template_icon">😎</span>Personal Bio (About Me)'+personal_bio_version+'<span class="bertha_template_desc">Writing about ourselves is hard. It\'s not for Bertha - Let her do it for you and only fix what\'s needed.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option30" data-id="faq-list" data-name="FAQs List" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option30" data-id="website"><span class="bertha_template_icon">🙋‍♀️</span>FAQs List'+faq_list_version+'<span class="bertha_template_desc">Generate a list of frequently asked questions for a service or product.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option31" data-id="faq-answer" data-name="FAQ Answers" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option31" data-id="website"><span class="bertha_template_icon">😑</span>FAQ Answers'+faq_answer_version+'<span class="bertha_template_desc">Get an anwser to a question.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option33" data-id="contact-blurb" data-name="Contact Form Blurb" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option33" data-id="website"><span class="bertha_template_icon">🤝</span>Contact Form Blurb'+contact_blurb_version+'<span class="bertha_template_desc">Create a short description & Call to Action that will be used as the final persuasion text next to a contact form.</span></label></div></div>'+ran_word2+'<div class="ber_inner_title" data-id="marketing">Converting Marketing Copy<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="marketing">Create copy that converts based on battle tested content marketing frameworks that will apply to your business service or product.</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option15" data-id="bullet-points" data-name="Persuasive Bullet Points" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option15" data-id="marketing"><span class="bertha_template_icon">✔</span>Persuasive Bullet Points'+bullet_version+'<span class="bertha_template_desc">Convince readers that your product is the best by listing all the reasons they should take action NOW.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option25" data-id="aida-marketing" data-name="AIDA Marketing Framework" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option25" data-id="marketing"><span class="bertha_template_icon">🍬</span>AIDA Marketing Framework'+aida_marketing_version+'<span class="bertha_template_desc">Awareness > Interest > Desire > Action - Structure your writing and create more compelling content.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option28" data-id="bridge" data-name="Before, After and Bridge" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option28" data-id="marketing"><span class="bertha_template_icon">🌉</span>Before, After and Bridge'+bridge_version+'<span class="bertha_template_desc">Get a short description to build a page with a before and after look, with a transition in between.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option29" data-id="pas-framework" data-name="PAS Framework" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option29" data-id="marketing"><span class="bertha_template_icon">🚥</span>PAS Framework'+pas_framework_version+'<span class="bertha_template_desc">Problem > Agitate > Solution - A framework for planning and evaluating your content marketing activities.</span></label></div></div>'+ran_word2+'<div class="ber_inner_title" data-id="blog">Blog Posts Creation<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="blog">Models to compile amazing blog posts. Each model is optimised for different sections of a blog post.</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option17" data-id="blog-post-idea" data-name="Blog Post Topic Ideas" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option17" data-id="blog"><span class="bertha_template_icon">💡</span>Blog Post Topic Ideas<span class="bertha_template_desc">Trained with data from hundreds of thousands of blog posts, Bertha uses this data to generate a variety of creative blog post ideas.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option6" data-id="Paragraph" data-name="Paragraph Generator" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option6" data-id="blog"><span class="bertha_template_icon">💣</span>Paragraph Generator'+paragraph_version+'<span class="bertha_template_desc">Great for getting over writers block: Craft creative short paragraphs from different areas of your website in blog posts and pages.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option19" data-id="blog-post-outline" data-name="Blog Post Outline" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option19" data-id="blog"><span class="bertha_template_icon">🧐</span>Blog Post Outline'+post_outline_version+'<span class="bertha_template_desc">Map out your blog post\'s outline simply by adding the title or topic of the blog post you want to create. Bertha will take care of the rest.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option18" data-id="blog-post-intro-paragraph" data-name="Blog Post Intro Paragraph" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option18" data-id="blog"><span class="bertha_template_icon">🦅</span>Blog Post Intro Paragraph'+intro_para_version+'<span class="bertha_template_desc">Not sure how to start writing your next winning blog post? Bertha will get the ball rolling on taking your blog post topic and generate an intriguing intro paragraph.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option20" data-id="blog-post-conclusion" data-name="Blog Post Conclusion Paragraph" autocomplete="off">';
                templates += '<label class="ber-btn bertha_template'+disabled+'" for="option20" data-id="blog"><span class="bertha_template_icon">🦸</span>Blog Post Conclusion Paragraph'+conclusion_version+'<span class="bertha_template_desc">Bertha can write a blog post conclusion paragraph that will help your visitors stick around to read the rest of your content.</span></label></div></div>'+ran_word2+'<div class="ber_inner_title" data-id="useful_extra">Useful Extras<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="useful_extra">Leverage these extras for additional content or add clarity throughout your website that will create copy that your readers can relate to.</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option22" data-id="child-explain" data-name="Explain It To a Child" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option22" data-id="useful_extra"><span class="bertha_template_icon">👶</span>Explain It To a Child'+child_input_version+'<span class="bertha_template_desc">Taking complex concepts and simplifying them. So that everyone can get it. Get it?</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option27" data-id="buisiness-name" data-name="Business or Product Name" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option27" data-id="useful_extra"><span class="bertha_template_icon">⚓</span>Business or Product Name'+buisiness_name_version+'<span class="bertha_template_desc">Create a new business or product name from scratch based on a keyword or phrase.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option32" data-id="summaries" data-name="Content Summary" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option32" data-id="useful_extra"><span class="bertha_template_icon">🪐</span>Content Summary'+summary_version+'<span class="bertha_template_desc">Create a summary of an article/website/blog post. Great for SEO and to share on social media.</span></label></div></div>'+ran_word2+'<div class="ber_inner_title" data-id="seo">SEO Focused Content<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="seo">Level up your search engine ranking and speed up repetitive SEO content related tasks.</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option23" data-id="seo-title" data-name="SEO Title Tag" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option23" data-id="seo"><span class="bertha_template_icon">⛩️</span>SEO Title Tag'+seo_title_version+'<span class="bertha_template_desc">Get highly optimized title tags that will help you rank higher in search engines.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option24" data-id="seo-description" data-name="SEO Description Tag" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option24" data-id="seo"><span class="bertha_template_icon">✒️</span>SEO Description Tag'+seo_description_version+'<span class="bertha_template_desc">You are serious about SEO, But this is a tedious task that can easily be automated with Bertha.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option26" data-id="seo-city" data-name="SEO City Based Pages" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option26" data-id="seo"><span class="bertha_template_icon">🏙</span>SEO City Based Pages'+seo_city_version+'<span class="bertha_template_desc">Generate city page titles and descriptions for your city or town pages to help rank your website locally.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option34" data-id="seo-keyword" data-name="SEO Keyword Suggestions" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option34" data-id="seo"><span class="bertha_template_icon">🔑</span>SEO Keyword Suggestions'+seo_keyword_version+'<span class="bertha_template_desc">Generate suggestions of long-tail keywords that are related to your topic.</span></label></div></div>'+ran_word2+'<div class="ber_inner_title" data-id="speciality">Niche Specific & Edge Cases<img src="'+bertha_setup_object.ber_right_img+'" /></div><div class="ber_inner_p" data-id="speciality">Specialized content models that fit common types of content that are used for specific niches and industries.</div>'+ran_word1+'<div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option36" data-id="real-estate" data-name="Real Estate Property Listing Description" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option34" data-id="speciality"><span class="bertha_template_icon">🏡</span>Real Estate Property Listing Description'+real_estate_version+'<span class="bertha_template_desc">Detailed and enticing property listings for your real estate websites. So you can focus on the sale.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option37" data-id="press-blurb" data-name="Press Mention Blurb" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option34" data-id="speciality"><span class="bertha_template_icon">📰</span>Press Mention Blurb'+press_blurb_version+'<span class="bertha_template_desc">Provide the press mention title and publication to craft a press mention blurb.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option38" data-id="case-study" data-name="Case Study Generator (STAR Method)" autocomplete="off"><label class="ber-btn bertha_template'+disabled+'" for="option34" data-id="speciality"><span class="bertha_template_icon">👨‍🎓</span>Case Study Generator (STAR Method)'+case_study_version+'<span class="bertha_template_desc">Generate a case study based on a client name and a problem they wanted to solve.</span></label></div></div><div class="ber-mb-3"><div class="ber-d-grid ber-gap-2"><input type="radio" class="ber-btn-check ber-btn-check-template" name="options" id="option35" data-id="evil-bertha" data-name="Evil Bertha" autocomplete="off"><label class="ber-btn bertha_template ber_evil'+disabled+'" for="option34" data-id="speciality"><span class="bertha_template_icon">😈</span>Evil Bertha'+evil_bertha_version+'<span class="bertha_template_desc">Usually Bertha is nice and friendly, but not always...</span></label></div></div>'+ran_word2+'</form><a href="https://bertha.ai/suggest/?plugin=1" target="_blank"><div class="bertha_template_suggesion"><span class="bertha_template_icon">💌</span>Suggest a Template<span class="bertha_template_desc">Did Bertha miss anything that can help you perfect your website content generation? Let her know here.</span></div></a></div><div id="template_description" class="input_details " ></div><div id="samsa" class="input_details " ></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>';
                setTimeout(function() {
                    $('.ber-tab-content #templates').html(templates);
                    $(".ber-tab-content").find('#templates .ber-overlay-container').hide();
                }, 500);
             }
             else if(control == 'chat') {
                $(".ber-tab-content").find('#chat .ber-overlay-container').show();
                $('.ber-tab-content #ama').removeClass('ber-show ber-active');
                $('.ber-tab-content #ama').html(loader);
                $('.ber-nav-item #templates-tab').removeClass('ber-active');
                $('.ber-tab-content #templates').removeClass('ber-show ber-active');
                $('.ber-tab-content #templates').html(loader);
                $('.ber-nav-item #image-tab').removeClass('ber-active');
                $('.ber-tab-content #image').removeClass('ber-show ber-active');
                $('.ber-tab-content #image').html(loader);
                $('.ber-nav-item #audio-tab').removeClass('ber-active');
                $('.ber-tab-content #audio').removeClass('ber-show ber-active');
                $('.ber-tab-content #audio').html(loader);
                $(".ber-tab-content").find('#ama .ber-overlay-container').show();
                if(templates.chat_prompt_version || plugin_type == 'pro') {
                    var chat = '<div class="ber-side-chat-head"><div class="ber-offcanvas-title">Chat With Me</div><button type="button" class="ber-btn bertha_sec_btn ber_chat_reset_modal" data-dismiss="ber-modal">Reset Chat</button></div><div class="ber_inner_p">You can ask me questions or have a conversation with me by typing below. I will do my best to understand and respond appropriately. Is there anything specific you would like to know or talk about?</div><div id="ber_chat_modal"><div class="ber_form"><div class="ber_form_group ber-chat-body"></div><div class="ber-chat-field"><textarea type="textarea" placeholder="Start typing to chat with Bertha..." class="ber_field" name="chatbody" access="false" id="ber_chat_body" required="required" aria-required="true" value=""></textarea></div><div class="ber_form_group bertha_backend_buttons ber_generate ber-chat-submit"><button type="button" class="ber-btn ber-btn-primary ber_half ber_chat_generate" data-dismiss="ber-modal">Comment</button></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div>';
                } else {
                    var chat = '<div class="ber_notice"><p>This is a Premium Feature</p><p><a class="bertha_premium_upgrade" href="'+bertha_setup_object.license_page+'" target="_blank">click to upgrade</a></p></div>';
                }
                setTimeout(function() {
                    $(".ber-tab-content").find('#chat').html(chat);
                    $(".ber-tab-content").find('#chat .ber-overlay-container').hide();
                }, 500);
            }
            else if(control == 'ama') {
                $(".ber-tab-content").find('#ama .ber-overlay-container').show();
                $('.ber-nav-item #chat-tab').removeClass('ber-active');
                $('.ber-tab-content #chat').removeClass('ber-show ber-active');
                $('.ber-tab-content #chat').html(loader);
                $('.ber-nav-item #templates-tab').removeClass('ber-active');
                $('.ber-tab-content #templates').removeClass('ber-show ber-active');
                $('.ber-tab-content #templates').html(loader);
                $('.ber-nav-item #image-tab').removeClass('ber-active');
                $('.ber-tab-content #image').removeClass('ber-show ber-active');
                $('.ber-tab-content #image').html(loader);
                $('.ber-nav-item #audio-tab').removeClass('ber-active');
                $('.ber-tab-content #audio').removeClass('ber-show ber-active');
                $('.ber-tab-content #audio').html(loader);
                $(".ber-tab-content").find('#ama .ber-overlay-container').show();
                if(templates.quickwins_version || plugin_type == 'pro') {
                    var ama = '<div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber_big_title">Ask Bertha to Write About Anything</div><div class="ber_inner_p">From email subject lines to full on blog posts and even Facebook adverts</div></div><div class="ber-ask-action-icon-wrap"><div class="bertha-copied-container ber-action-icon"><img class="bertha_ask_copy" src="'+bertha_setup_object.ber_copy_img+'" /><span id="berthaCopied">Copy to clipboard</span></div><div class="bertha-favourite-container ber-action-icon"><img class="bertha_ask_favourite" src="'+bertha_setup_object.ber_heart_img+'" /><span class="bertha-favourite-text" id="berthaFavourite">Add to Favourite</span></div><div class="bertha-report-container ber-action-icon"><img class="bertha_ask_report" src="'+bertha_setup_object.ber_flag_img+'" /><span class="bertha-report-text" id="berthaReport">Report</span></div></div></div><div class="ber-modal-body ber-ama-body"><div class="ber-ask-body"><textarea id="ber_quickwins_body" rows="15" cols="100" placeholder="Start typing here, asking Bertha anything..."></textarea></div><div class="ber-content-settings-data"><div class="ber_inner_title_ask">Insert Default Content</div><button type="button" class="ber-btn bertha_sec_btn ber_quickwins brand" data-dismiss="ber-modal">Brand Name</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins desc" data-dismiss="ber-modal">Company Description</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins customer" data-dismiss="ber-modal">Ideal Customer</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins tone" data-dismiss="ber-modal">Tone of Voice</button></div></div><div class="ber-modal-footer"><div class="ber-ask-submit"><button type="button" class="ber-btn bertha_sec_btn ber_quickwins_reset" data-dismiss="ber-modal">Reset</button><button type="button" class="ber-btn ber-btn-primary ber_quickwins_generate" data-dismiss="ber-modal">Generate</button></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>';
                } else {
                    var ama = '<div class="ber_notice"><p>This is a Premium Feature</p><p><a class="bertha_premium_upgrade" href="'+bertha_setup_object.license_page+'" target="_blank">click to upgrade</a></p></div>';
                }
                setTimeout(function() {
                    $(".ber-tab-content").find('#ama').html(ama);
                    $(".ber-tab-content").find('#ama .ber-overlay-container').hide();
                }, 500);
            }
            else if(control == 'image') {
                $(".ber-tab-content").find('#templates .ber-overlay-container').show();
                $('.ber-nav-item #chat-tab').removeClass('ber-active');
                $('.ber-tab-content #chat').removeClass('ber-show ber-active');
                $('.ber-tab-content #chat').html(loader);
                $('.ber-tab-content #ama').removeClass('ber-show ber-active');
                $('.ber-tab-content #ama').html(loader);
                $('.ber-nav-item #templates-tab').removeClass('ber-active');
                $('.ber-tab-content #templates').removeClass('ber-show ber-active');
                $('.ber-tab-content #templates').html(loader);
                $('.ber-nav-item #audio-tab').removeClass('ber-active');
                $('.ber-tab-content #audio').removeClass('ber-show ber-active');
                $('.ber-tab-content #audio').html(loader);
                $(".ber-tab-content").find('#image .ber-overlay-container').show();
                var ajaxurl = bertha_setup_object.ajax_url;
                var data = {
                    action   : 'wa_bertha_get_art_view',
                    bertha_art_view_nonce: bertha_setup_object.template_nonce
                } 
                $.post(ajaxurl, data, function(response) {
                    $(document).find('.ber-tab-content #image').html(response);
                    $(".ber-tab-content").find('#image .ber-overlay-container').hide();
                });
            }
            else if(control == 'audio') {
                $(".ber-tab-content").find('#audio .ber-overlay-container').show();
                $('.ber-tab-content #ama').removeClass('ber-show ber-active');
                $('.ber-tab-content #ama').html(loader);
                $('.ber-nav-item #templates-tab').removeClass('ber-active');
                $('.ber-tab-content #templates').removeClass('ber-show ber-active');
                $('.ber-tab-content #templates').html(loader);
                $('.ber-nav-item #image-tab').removeClass('ber-active');
                $('.ber-tab-content #image').removeClass('ber-show ber-active');
                $('.ber-tab-content #image').html(loader);
                $('.ber-nav-item #chat-tab').removeClass('ber-active');
                $('.ber-tab-content #chat').removeClass('ber-show ber-active');
                $('.ber-tab-content #chat').html(loader);
                $(".ber-tab-content").find('#ama .ber-overlay-container').show();

                setTimeout(function() {
                    $(".ber-tab-content").find('#audio').html(audio);
                    $(".ber-tab-content").find('#audio .ber-overlay-container').hide();
                }, 500);
            }
            $(this).addClass('ber-active');
            $('.ber-tab-content #'+control).addClass('ber-show ber-active');
            if($(this).hasClass('history') || $(this).hasClass('favourite')) {
                var ths = $(this);
                ths.find('.ber-overlay-container').show();
                if($(this).hasClass('history')) {
                    var tab = 'history';
                } else {
                    var tab = 'favourite';
                }
                var ajaxurl = bertha_setup_object.ajax_url;
                var data = {
                    action   : 'wa_bertha_load_more',
                    tab : tab,
                    bertha_load_more_nonce: bertha_setup_object.template_nonce
                } 
                $.post(ajaxurl, data, function(response) {
                    ths.find('.ber-overlay-container').hide();
                    var history = '<div class="ber-offcanvas-title">Previously Created Content</div><div class="ber_inner_p">Every output Bertha has generated is saved here for easy re-use.</div><select name="history_filter" class="ber_history_filter" id="history_filter"><option value="all">All Templates</option>  <option value="idea-usp">Unique Value Proposition</option><option value="sub-headline">Website Sub-Headline</option><option value="blog-action-idea">Button Call to Action</option><option value="section-title">Section Title Generator</option><option value="benefit-title">Title to Benefit Sections</option><option value="idea-paragraph">Paragraph Generator</option><option value="content-improver">Content Rephraser</option><option value="idea-benefit">Service/Product Benefit List</option><option value="product-service-description">Product/Service Description</option><option value="bullet-points">Persuasive Bullet Points</option><option value="company-bio">Full-on About Us Page</option><option value="Company-mission">Company Mission & Vision</option><option value="personal-bio">Personal Bio (About Me)</option><option value="blog-post-idea">Blog Post Topic Ideas</option><option value="post-outline-idea">Blog Post Outline</option><option value="intro-para-idea">Blog Post Intro Paragraph</option><option value="conclusion-para-idea">Blog Post Conclusion Paragraph</option><option value="child-input">Explain It To a Child</option><option value="bertha-seo-title">SEO Title Tag</option><option value="bertha-seo-description">SEO Description Tag</option><option value="bertha-aida-marketing">AIDA Marketing Framework</option><option value="bertha-seo-city">SEO City Based Pages</option><option value="bertha-buisiness-name">Business or Product Name</option><option value="bertha-bridge">Before, After and Bridge</option><option value="bertha-pas-framework">PAS Framework</option><option value="bertha-faq-list">FAQs List</option><option value="bertha-faq-answer">FAQ Answers</option><option value="bertha-summary">Content Summary</option><option value="bertha-contact-blurb">Contact Form Blurb</option><option value="bertha-seo-keyword">SEO Keyword Suggestions</option><option value="bertha-evil-bertha">Evil Bertha</option><option value="bertha-real-eastate">Real Estate Property Listing Description</option><option value="bertha-press-blurb">Press Mention Blurb</option><option value="bertha-case-study">Case Study Generator (STAR Method)</option><option value="bertha-quickwins">Quickwins</option></select><div class="idea-history">'+response+'</div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>';
                    var favourite = '<div class="ber-offcanvas-title">Favorite Ideas</div><div class="ber_inner_p">Every Favorite idea has added is saved here for easy re-use.</div><div class="favourite-idea">'+response+'<div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div>';
                    $(document).find('#ber-more-container li').each(function() {
                        if(ths.hasClass('ber-more-active')) ths.removeClass('ber-active ber-more-active');
                    });
                    ths.addClass('ber-more-active');
                    if(ths.hasClass('history')) {
                        $('.ber-tab-content').find('.ber-tab-pane.ber-active').html(history);
                    } else if(ths.hasClass('favourite')) {
                        $('.ber-tab-content').find('.ber-tab-pane.ber-active').html(favourite);
                    }
                });
            }

            document.addEventListener('scroll', function (event) {
                var body = '';
                var tab = $(document).find('.ber-nav-tabs li .ber-nav-link.ber-active').attr('data-bs-target');
                var ber_tab = $(document).find('#ber-more-container li.ber-more-active');
                if($('#bertha_canvas').find('.ber-offcanvas-body').length) body = $('#bertha_canvas').find('.ber-offcanvas-body');
                else if($('#bertha_backend_canvas').find('.ber-tab-pane.ber-active').length) body = $('#bertha_backend_canvas').find('.ber-tab-pane.ber-active');
                 if($(body).scrollTop() + $(body).innerHeight() >= $(body)[0].scrollHeight - 0.201) {
                    if(tab == '#history' || ber_tab.hasClass('history')) {
                        var bertha_contents = 0;
                        if(ber_tab.hasClass('history')) {
                            $('.ber-tab-content').find('.ber-tab-pane.ber-active .bertha-content-element').each(function() {
                                bertha_contents++;
                            });
                        } else {
                            $('#bertha_canvas, #bertha_backend_canvas').find('.idea-history #form4 .bertha-content-element').each(function() {
                                bertha_contents++;
                            });
                        }
                        if(bertha_contents && bertha_contents >= 20) {
                            $(".ber-offcanvas-body, .ber-tab-content .ber-tab-pane.ber-active").find('.ber-overlay-container').show();
                            var ajaxurl = bertha_setup_object.ajax_url;
                            var data = {
                                action   : 'wa_bertha_load_history',
                                history_count : history_count,
                                bertha_load_history_nonce: bertha_setup_object.template_nonce
                            } 
                            $.post(ajaxurl, data, function(response) {
                                var result = JSON.parse(response);
                                if(result['response'] == "success") {
                                    $(".ber-offcanvas-body, .ber-tab-content .ber-tab-pane.ber-active").find('.ber-overlay-container').hide();
                                    if(ber_tab.hasClass('history')) $('.ber-tab-content').find('.ber-tab-pane.ber-active .idea-history #form4').html(result['ideas']);
                                    else $('#bertha_canvas, #bertha_backend_canvas').find('.idea-history #form4').html(result['ideas']);
                                    history_count += 10;
                                }
                            });
                        }
                    } else if(tab == '#favourite' || ber_tab.hasClass('favourite')) {
                        var bertha_favourites = 0;
                        if(ber_tab.hasClass('favourite')) {
                            $('.ber-tab-content').find('.ber-tab-pane.ber-active .bertha-content-element').each(function() {
                                bertha_favourites++;
                            });
                        } else {
                            $('#bertha_canvas, #bertha_backend_canvas').find('.favourite-idea #form4 .bertha-content-element').each(function() {
                                bertha_favourites++;
                            });
                        }
                        if(bertha_favourites && bertha_favourites >= 20) {
                            $(".ber-offcanvas-body, .ber-tab-content .ber-tab-pane.ber-active").find('.ber-overlay-container').show();
                            var ajaxurl = bertha_setup_object.ajax_url;
                            var data = {
                                action   : 'wa_bertha_load_favourite',
                                favourite_count : favourite_count,
                                bertha_load_favourite_nonce: bertha_setup_object.template_nonce
                            } 
                            $.post(ajaxurl, data, function(response) {
                                var result = JSON.parse(response);
                                if(result['response'] == "success") {
                                    $(".ber-offcanvas-body, .ber-tab-content .ber-tab-pane.ber-active").find('.ber-overlay-container').hide();
                                    if(ber_tab.hasClass('favourite')) $('.ber-tab-content').find('.ber-tab-pane.ber-active .favourite-idea #form4').html(result['ideas']);
                                    else $('#bertha_canvas, #bertha_backend_canvas').find('.favourite-idea #form4').html(result['ideas']);
                                    favourite_count += 10;
                                }
                            });
                        }
                    } else if(tab == '#backedn') {
                        var bertha_drafts = 0;
                        $('#bertha_backend_canvas').find('.bertha-backend-content #form4 .bertha-content-element').each(function() {
                            bertha_drafts++;
                        });
                        if(bertha_drafts && bertha_drafts >= 20) {
                            $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
                            var ajaxurl = bertha_setup_object.ajax_url;
                            var data = {
                                action   : 'wa_bertha_load_draft',
                                drft_count : drft_count,
                                bertha_load_draft_nonce: bertha_setup_object.template_nonce
                            } 
                            $.post(ajaxurl, data, function(response) {
                                var result = JSON.parse(response);
                                if(result['response'] == "success") {
                                    $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
                                    $('#bertha_backend_canvas').find('.bertha-backend-content #form4').html(result['ideas']);
                                    drft_count += 10;
                                }
                            });
                        }
                    }
            }
            }, true);
        });

        
        var success = getUrlParameter('bertha_success_response');
        var expire = getUrlParameter('bertha_key_expires');
        var page = getUrlParameter('page');
        var action = getUrlParameter('action');
        if(success && expire && !page)  {
            if($(top.document).find('body').hasClass('wp-admin')) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-body"><div class="ber_inner_title">Click<u>Any</u> Text Area Within Your Website To Start Generating Content</div><img src="'+bertha_setup_object.bertha_start_img+'" alt="Bertha Guide" class="bertha_gif" /></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber-btn-primary bertha_close_modal" data-dismiss="ber-modal">Start Generating Content</button></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #exampleModalCenter').show();
            }
        }
        if(page && action && page == 'bertha-ai-art-setting' && action == 'search-image') {
            get_search_images_view();
        }
        $(document).on('click', '.bertha_close_modal', function() {
            $(top.document).find('body #exampleModalCenter').remove();
        });
        if(bertha_setup_object.current_page != 'bertha-ai-backend-bertha') {
            if($('body').attr('ng-controller') != 'BuilderController') $("body").after(wa_sidebar);
            if($('#toplevel_page_bertha-ai-setting a.wp-first-item').length > 0) {
                $('#toplevel_page_bertha-ai-setting a.wp-first-item').attr("data-bs-toggle", "offcanvas");
                $('#toplevel_page_bertha-ai-setting a.wp-first-item').attr("aria-controls", "offcanvasExample");
                $('#toplevel_page_bertha-ai-setting a.wp-first-item').attr("href", "#bertha_canvas");
            }
        } else {
            if($('#toplevel_page_bertha-ai-setting a.wp-first-item').length > 0) {
                $('#toplevel_page_bertha-ai-setting a.wp-first-item').attr("id", "bertha_backend_launch");
                $('#toplevel_page_bertha-ai-setting a.wp-first-item').attr("href", "#");
            }
        }

        $(document).on('click', '#bertha_backend_launch', function() {
            $(this).after("<div class='ber-notice-content'>Oops... The Sidebar can't be launched within the Long-form editor.Please use the options on this page OR load Bertha within a post or page.</div>");
            setTimeout(function(){
              $('.ber-notice-content').remove();
            }, 5000);
        })
        
        $(document).on('keyup', '#bertha_template_filter', function(){
            if($("#bertha_template_filter").val() == '') {
                $("#template_selection .ber_inner_title, #template_selection .ber_inner_p").show();
            }else {
                $("#template_selection .ber_inner_title, #template_selection .ber_inner_p").fadeOut();
            }
            var filter = $(this).val();
            $("#template_selection .ber-mb-3").each(function(){
                if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                    $(this).fadeOut();
                } else {
                    $(this).show();
                }
            });
        });

        $(".ber_form :input, .long_form_inputs :input").each(function(){
            if($(this).attr('maxlength')) {
                var max = $(this).attr('maxlength');
                var length = $(this).val().length;
                $(this).after('<p class="bertha_char_count">'+length+'/'+max+'</p>');
            }
        });
        $(".ber_form :input, .long_form_inputs :input").on("input", function() {
            var max = $(this).attr('maxlength');
            var length = $(this).val().length;
            $(this).next('p.bertha_char_count').html(length+'/'+max);
        });
    });
    $(document).on('click', '#ber_page1_save', function() {
        $('#ber_page1').hide();
        $('#ber_page3').show();
    });

    $(document).on('click', '.ber-skip', function() {
        $('#ber_page3').hide();
        $('#ber_page4').show();
    });
    
    $(document).on('click', '#ber_page3_save', function() {
        var language = $('#berlanguage').val();
        var brand = $('#berbrand').val();
        var description = $('#berdescription').val();
        var ideal_cust = $('#beraudience').val();
        var sentiment = $('#bersentiment').val();
        var berideas = $('#berideas').val();
        if(brand == '' || description == '' || ideal_cust == '' || sentiment == '') {
            $(this).after('<div class="ber-notice-content">Please Fill All the Fields</div>')
            setTimeout(function(){
              $('.ber-notice-content').remove();
            }, 5000);
        } else {
            $.ajax({
                url:  bertha_setup_object.ajax_url,
                data: {
                    action   : 'set_wizzard_setting_data',
                    language : language,
                    brand : brand,
                    description : description,
                    ideal_cust : ideal_cust,
                    sentiment : sentiment,
                    berideas : berideas,
                    bertha_wizzard_setup_nonce: $('#bertha_wizzard_setup_nonce').val()
                },
                type: 'POST',
                success: function( response ) {
                    $('#ber_page3').hide();
                    $('#ber_page4').show();
                }
            });
        }
    });

    $(document).on('click', '.wa-generate-idea', function(e) {
        e.preventDefault();
        var wa_generate_idea_button = $(this);
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var wa_template = $(this).attr('data-id');
        var data_block = $(this).attr('data-block');
        var block = data_block+'bertha';
        var ajaxurl = bertha_setup_object.ajax_url;
        var pre_data = {'action' : 'bthai_generate_ideas', 'bertha_block' : wa_template, 'bertha_template_ideas_nonce' : bertha_setup_object.template_nonce};
        switch (wa_template) {
            case "USP":
                var data = {
                    bertha_brand : $('.bertha_brand').val(),
                    bertha_ideal_cust : $('.bertha_ideal_cust').val(),
                    bertha_sentiment : $('.bertha_sentiment').val(),
                    bertha_desc : $('.bertha_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "Headline":
                var data = {
                    bertha_ideal_cust : $('.sub_headline_ideal_cust').val(),
                    bertha_sentiment : $('.sub_headline_sentiment').val(),
                    bertha_desc : $('.sub_headline_desc').val(),
                    sub_headline_usp : $('.sub_headline_usp').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                    data_headline_usp : $(this).attr('data-headline-usp'),
                } 
                break;
            case "Title":
                var data = {
                    bertha_ideal_cust : $('.sec_title_ideal_cust').val(),
                    bertha_sentiment : $('.sec_title_sentiment').val(),
                    bertha_desc : $('.sec_title_desc').val(),
                    sec_title_type : $('.sec_title_type').val(),
                    sec_other_title : $('.other_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                    data_title_type : $(this).attr('data-title-type'),
                    data_other_title : $(this).attr('data-other-title'),
                } 
                break;
            case "Paragraph":
                var data = {
                    bertha_ideal_cust : $('.para_ideal_cust').val(),
                    bertha_sentiment : $('.para_sentiment').val(),
                    bertha_desc : $('.para_desc').val(),
                    para_title : $('.para_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                    data_title : $(this).attr('data-title'),
                } 
                break;
            case "Service":
                var data = {
                    bertha_sentiment : $('.service_description_sentiment').val(),
                    bertha_desc : $('.service_description_desc').val(),
                    service_description_name : $('.service_description_name').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                    data_desc_name : $(this).attr('data-desc-name'),
                } 
                break;
            case "Company":
                var data = {
                    bertha_brand : $('.company_brand').val(),
                    bertha_desc : $('.company_bio_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                    data_brand : $(this).attr('data-brand'),
                } 
                break;
            case "Company-mission":
                var data = {
                    bertha_brand : $('.company_mission_brand').val(),
                    bertha_desc : $('.company_mission_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                    data_brand : $(this).attr('data-brand'),
                } 
                break;
            case "Testimonial":
                var data = {
                    bertha_desc : $('.testimonial_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "Benefit-List":
                var data = {
                    bertha_desc : $('.benefit_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_index_desc : $(this).attr('data-desc'),
                } 
                break;
            case "Content-Improver":
                var data = {
                    bertha_desc : $('.content_improver_desc').val(),
                    bertha_sentiment : $('.content_improver_sentiment').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "Benefit-Title":
                var data = {
                    bertha_desc : $('.Benefit_title_desc').val(),
                    Benefit_title : $('.Benefit_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_title : $(this).attr('data-title'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "bullet-points":
                var data = {
                    bertha_desc : $('.bullet_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "personal-bio":
                var data = {
                    bertha_sentiment : $('.personal_bio_sentiment').val(),
                    bertha_desc : $('.personal_bio_desc').val(),
                    personal_bio_point : $('.personal_bio_point').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                    data_point : $(this).attr('data-point'),
                } 
                break;
            case "blog-post-idea":
                var data = {
                    bertha_ideal_cust : $('.blog_idea_cust').val(),
                    bertha_sentiment : $('.blog_idea_sentiment').val(),
                    bertha_desc : $('.blog_idea_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "blog-post-intro-paragraph":
                var data = {
                    bertha_ideal_cust : $('.intro_ideal_cust').val(),
                    bertha_sentiment : $('.intro_sentiment').val(),
                    intro_title : $('.intro_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_title : $(this).attr('data-title'),
                } 
                break;
            case "blog-post-outline":
                var data = {
                    bertha_sentiment : $('.post_outline_sentiment').val(),
                    bertha_title : $('.post_outline_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_title : $(this).attr('data-title'),
                    data_sentiment : $(this).attr('data-sentiment'),
                } 
                break;
            case "blog-post-conclusion":
                var data = {
                    bertha_cta : $('.conslusion_cta').val(),
                    bertha_sentiment : $('.conclusion_sentiment').val(),
                    bertha_title : $('.conclusion_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_cta : $(this).attr('data-cta'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_title : $(this).attr('data-title'),
                } 
                break;
            case "blog-action":
                var data = {
                    bertha_desc : $('.blog_action_desc').val(),
                    bertha_action : $('.blog_action').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                    data_action : $(this).attr('data-action'),
                } 
                break;
             case "child-explain":
                var data = {
                    child_input : $('.child_input').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_input : $(this).attr('data-input'),
                } 
                break;
            case "seo-title":
                var data = {
                    bertha_brand : $('.seo_title_brand').val(),
                    bertha_keyword : $('.seo_keyword').val(),
                    bertha_title : $('.seo_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_title : $(this).attr('data-title'),
                    data_keyword : $(this).attr('data-keyword'),
                    data_brand : $(this).attr('data-brand'),
                } 
                break;
            case "seo-description":
                var data = {
                    bertha_keyword : $('.seo_desc_keyword').val(),
                    bertha_title : $('.seo_desc_title').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_title : $(this).attr('data-title'),
                    data_keyword : $(this).attr('data-keyword'),
                }  
                break;
            case "aida-marketing":
                var data = {
                    bertha_brand : $('.aida_brand').val(),
                    bertha_ideal_cust : $('.aida_cust').val(),
                    bertha_sentiment : $('.aida_Sentiment').val(),
                    bertha_desc : $('.aida_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "seo-city":
                var data = {
                    bertha_brand : $('.seo_city_brand').val(),
                    bertha_city : $('.seo_city').val(),
                    bertha_cta : $('.seo_city_cta').val(),
                    bertha_keyword : $('.seo_city_keyword').val(),
                    bertha_desc : $('.seo_city_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_city : $(this).attr('data-city'),
                    data_cta : $(this).attr('data-cta'),
                    data_keyword : $(this).attr('data-keyword'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "buisiness-name":
                var data = {
                    bertha_sentiment : $('.buisiness_name_vibe').val(),
                    bertha_desc : $('.buisiness_name_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "bridge":
                var data = {
                    bertha_brand : $('.bridge_brand').val(),
                    bertha_ideal_cust : $('.bridge_cust').val(),
                    bertha_sentiment : $('.bridge_Sentiment').val(),
                    bertha_desc : $('.bridge_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "pas-framework":
                var data = {
                    bertha_brand : $('.pas_brand').val(),
                    bertha_ideal_cust : $('.pas_cust').val(),
                    bertha_sentiment : $('.pas_Sentiment').val(),
                    bertha_desc : $('.pas_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_ideal_cust : $(this).attr('data-customer'),
                    data_sentiment : $(this).attr('data-sentiment'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "faq-list":
                var data = {
                    bertha_desc : $('.faq_list_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "faq-answer":
                var data = {
                    bertha_question : $('.faq_answer_question').val(),
                    bertha_desc : $('.faq_answer_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_question : $(this).attr('data-question'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "summaries":
                var data = {
                    bertha_summary : $('.content_summary').val(),
                    bertha_sentiment : $('.summary_sentiment').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_summary : $(this).attr('data-summary'),
                    data_sentiment : $(this).attr('data-sentiment'),
                } 
                break;
            case "contact-blurb":
                var data = {
                    bertha_brand : $('.contact_blurb_brand').val(),
                    bertha_cta : $('.contact_blurb_cta').val(),
                    bertha_desc : $('.contact_blurb_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_cta : $(this).attr('data-cta'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "seo-keyword":
                var data = {
                    bertha_desc : $('.seo_keyword_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "evil-bertha":
                var data = {
                    bertha_desc : $('.evil_bertha_bio').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "real-estate":
                var data = {
                    bertha_brand : $('.real_estate_brand').val(),
                    bertha_location : $('.real_estate_location').val(),
                    bertha_type : $('.real_estate_type').val(),
                    bertha_desc : $('.real_estate_desc').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_brand : $(this).attr('data-brand'),
                    data_location : $(this).attr('data-location'),
                    data_type : $(this).attr('data-type'),
                    data_desc : $(this).attr('data-desc'),
                } 
                break;
            case "press-blurb":
                var data = {
                    bertha_name : $('.press_blurb_pub_name').val(),
                    bertha_info : $('.press_blurb_article_info').val(),
                    bertha_desc : $('.press_blurb_desc').val(),
                    bertha_keyword : $('.press_blurb_keyword').val(),
                    bertha_brand : $('.press_blurb_brand').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_name : $(this).attr('data-name'),
                    data_info : $(this).attr('data-info'),
                    data_desc : $(this).attr('data-desc'),
                    data_keyword : $(this).attr('data-keyword'),
                    data_brand : $(this).attr('data-brand'),
                } 
                break;
            case "case-study":
                var data = {
                    bertha_subject : $('.case_study_subject').val(),
                    bertha_info : $('.case_study_info').val(),
                    bertha_brand : $('.case_study_brand').val(),
                    bertha_desc : $('.case_study_desc').val(),
                    bertha_keyword : $('.case_study_keyword').val(),
                    bertha_desc_index : $(this).attr('data-index'),
                    data_subject : $(this).attr('data-subject'),
                    data_info : $(this).attr('data-info'),
                    data_brand : $(this).attr('data-brand'),
                    data_desc : $(this).attr('data-desc'),
                    data_keyword : $(this).attr('data-keyword'),
                } 
                break;
            default:
                alert("You have selected wrong template.");
        }
        $.extend(pre_data, data);
        data = pre_data;
        data['data_block'] = data_block;
        var bertha_desc = child_input = bertha_summary = '';
        if(data['data_desc']!== undefined) bertha_desc = data['data_desc'];
        else bertha_desc = data['bertha_desc'];
        if(data['data_input']!== undefined) child_input = data['data_input'];
        else child_input = data['child_input'];
        if(data['data_summary']!== undefined) bertha_summary = data['data_summary'];
        else bertha_summary = data['bertha_summary'];
        if( wa_generate_idea_button.hasClass('bertha-desc-notice') && (bertha_desc !== undefined && bertha_desc.length < 200) || (child_input !== undefined && child_input.length < 200) || (bertha_summary !== undefined && bertha_summary.length < 200)) {
            $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
            wa_generate_idea_button.removeClass('bertha-desc-notice');
            $('.ber-offcanvas, #bertha_backend_canvas').after('<div class="ber-notice-content">OPTIONAL: We recommend at least 200 characters to get better results. Click generate to ignore this message or Add more characters.</div>')
            setTimeout(function(){
                  $('.ber-notice-content').remove();
            }, 5000);
        } else {
            $.post(ajaxurl, data, function(response) {
                var result = JSON.parse(response);
                $('.bertha-back').attr('id', 'back3');
                $('.idea-history').html(result['idea_history']);
                var limit_percentage = (result['left_limit'] * 100) / result['limit'];
                if($('.ber-progress-bar').hasClass('bg-success')) {
                    $('.ber-progress-bar').removeClass('bg-success');
                }else if($('.ber-progress-bar').hasClass('bg-warning')) {
                    $('.ber-progress-bar').removeClass('bg-warning');
                }else if($('.ber-progress-bar').hasClass('bg-danger')) {
                    $('.ber-progress-bar').removeClass('bg-danger');
                }
                limit_percentage = limit_percentage >= 0 ? limit_percentage : 100;
                if(limit_percentage < 50) {
                    var meter = 'success';
                }else if(limit_percentage >= 50 && limit_percentage < 80) {
                    var meter = 'warning';
                }else if(limit_percentage >= 80) {
                    var meter = 'danger';
                }
                $('.ber-progress-bar').addClass('bg-'+meter);
                $('.ber-progress-bar').css('width', limit_percentage+'%');
                $('.ber-progress-bar').attr('aria-valuenow', limit_percentage);

                if(result['left_limit'] >= result['limit'] || result['token_denied']) $('.ber_metrix_bar').html('<a class="ber_btn" href="'+bertha_setup_object.license_page+'" target="_blank">Upgrade Now</a>');
                else $("head").append($('<style>.ber-progress-bar:after { content: "'+result['left_limit']+' / '+result['limit']+'" !important; position: absolute !important; left: 50% !important; color: black !important; }</style>'));
                $('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);
                $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
                if(result['initial_token_covered']) {
                    var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... Looks like you ran out of your daily words allocations.</div><div class="ber-report-secondary-title">Don\'t worry, you can wait untill tomorrow and get a new batch of words OR... you can click the big button below to upgrade and unlock more words from Bertha and speed up your writing even more!</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber_half bertha_sec_btn ber-token-close" data-dismiss="ber-modal">I\'ll wait</button><button type="button" class="ber-btn ber_half ber-btn-primary ber-token-covered-continue" data-dismiss="ber-modal">Upgrade now</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                    $(top.document).find('body').append(modal);
                    $(top.document).find('body #ber_token_covered_modal').show();
                } else if(result['license_expired']) {
                    var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">Oops, Looks like your license has expired.</div><div class="ber-report-secondary-title">please click <a href="'+bertha_setup_object.license_page+'">UPGRADE</a> to renew.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                    $(top.document).find('body').append(modal);
                    $(top.document).find('body #ber_token_covered_modal').show();
                } else{
                    $('#bertha_canvas').addClass('bertha-idea-expand');
                    $(document).find('.ber-sidebar_expension').addClass('expanded');
                    //$(document).find('.ber-sidebar_expension').html('Shrink Sidebar');
                    $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').hide();
                    $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').hide();
                    var temp_desc = $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html();
                    if(result['token_denied']) $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html(result['token_denied']); 
                    else $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html(result['html']);
                    $(document).find('#samsa').show();
                    $('#bertha_canvas, #bertha_backend_canvas').find('#samsa').html($('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html());
                    $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html(temp_desc);
                    $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').css('right', '-450px');
                    $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').hide();
                    $('#bertha_canvas, #bertha_backend_canvas').find('#samsa').css('right', '20px');
                }
            });
        }
    });

    $(document).on('click', '#template_selection .bertha_template', function(e) {
        e.preventDefault();
        var prev = $(this).prev('.ber-btn-check-template');
        var data_block = prev.attr('data-block');
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var wa_template = prev.attr('data-id');
        var wa_template_name = prev.attr('data-name');
        var block = data_block+'bertha';
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_ai_templates',
            wa_template : wa_template,
            data_block : data_block,
            bertha_template_list_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(result) {
            var response = JSON.parse(result);
            $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
            $('.bertha-back').show();
            $('.bertha-back').attr('id', 'back4');
            $('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);
            $('#bertha_canvas, #bertha_backend_canvas').find('#ber-offcanvasExampleLabel').html(response['tax_description']);
            $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').show();
            $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').html(response['html']);
            $('#bertha_canvas, #bertha_backend_canvas').find('.quickwins_container').hide();
            $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').css({'right':'-450px'});
            $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').css({'right':'20px'});
            $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').hide();

            $('#bertha_canvas, #bertha_backend_canvas').find("#template_description :input").each(function(){
                if($(this).attr('maxlength')) {
                    var max = $(this).attr('maxlength');
                    var length = $(this).val().length;
                    $(this).after('<p class="bertha_char_count">'+length+'/'+max+'</p>');
                }
            });
            $('#bertha_canvas, #bertha_backend_canvas').find("#template_description :input").on("input", function() {
                var max = $(this).attr('maxlength');
                var length = $(this).val().length;
                $(this).next('p.bertha_char_count').html(length+'/'+max);
            });
        });
    });

    $(document).on('click', '.bertha-template-description-video', function() {
        var video_id = $(this).attr('data-id');
        var modal = '<div class="ber-modal ber-fade ber_modal" id="tempModal" tabindex="-1" role="dialog" aria-labelledby="tempModalTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><button type="button" class="ber-temp-btn-close ber-report-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-body"><iframe src="https://www.youtube.com/embed/'+video_id+'" width="600px" height="350px"></iframe></div></div></div></div>';
        $(top.document).find('body').append(modal);
        $(top.document).find('body #tempModal').show();
    });
    $(document).on('click', '.ber-temp-btn-close', function() {
        $(top.document).find('body #tempModal').remove();
    });
    $(document).on('click', '.ber-token-close', function() {
        $(top.document).find('body #ber_token_covered_modal').remove();
    });

    $(document).on('click', '.bertha_idea', function(e) {
        e.preventDefault();
        if($('.ber-offcanvas.bertha-ai').data('block') || $('#bertha_backend_canvas').data('block') || bertha_setup_object.current_page == 'bertha-ai-backend-bertha') {
            if($('#bertha_canvas').attr('data-block') != '#et-fb-app-frame' && $('#bertha_canvas').attr('data-block') != '#elementor-preview-iframe' && $('#bertha_canvas').attr('data-block') != '#vcv-editor-iframe') {
                if(!$('#bertha_backend_canvas').data('block')) $('#bertha_backend_canvas').attr('data-block', '#bertha_backend_body_ifr');
                if(!$(this).hasClass('bertha_idea_non_clickable')) {
                    var prev = $(this).prev('.ber-idea-btn-check');
                    var content_block = $('#bertha_canvas, #bertha_backend_canvas').attr('data-block');
                    prev.prop('checked', true);
                    var ss = $(this).find('.bertha_idea_body pre').html();
                    var tag = $(content_block).prop("tagName");
                    var myAudio = new Audio(bertha_setup_object.bertha_sound);
                    $(document).find('.bertha_idea').each(function(){
                        $(this).addClass('bertha_idea_non_clickable');
                    });
                    if(tag == 'IFRAME' || $(content_block).attr('data-type') == 'core/paragraph' || $(content_block).hasClass('ql-editor')) {
                        var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

                        if (!isPlaying) {
                            myAudio.play();
                        }

                        ss = ss.split("\n");
                        $(content_block).addClass('ber-disabled-click');
                        if($(content_block).hasClass('ql-editor')) {
                            var txt3 = document.createElement("p");
                            $(content_block).append(txt3);
                        }
                        typeWriter(ss, content_block, 0, 0, tag, myAudio);
                    }
                    else {
                        if(tag == 'INPUT') $('#titlewrap #title-prompt-text').hide();
                        $(content_block).focus().trigger('focusin');
                        if($(content_block).hasClass('public-DraftStyleDefault-ltr'))  {
                            if($(content_block).closest('#yoast-google-preview-description-metabox').length) {
                                if($(content_block).text()) ss = wp.data.select("yoast-seo/editor").getSnippetEditorData().description + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).updateData( { description: ss } );
                            }
                            if($(content_block).closest('#yoast-google-preview-title-metabox').length) {
                                if($(content_block).text()) ss = wp.data.select("yoast-seo/editor").getSnippetEditorData().title + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).updateData( { title: ss } );
                            }
                            if($(content_block).closest('#facebook-title-input-metabox').length) {
                                var facebook_title = wp.data.select("yoast-seo/editor").getFacebookTitle();
                                if(facebook_title) ss = facebook_title + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).setFacebookPreviewTitle(ss);
                            }
                            if($(content_block).closest('#facebook-description-input-metabox').length) {
                                var facebook_desc = wp.data.select("yoast-seo/editor").getFacebookDescription();
                                if(facebook_desc) ss = facebook_desc + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).setFacebookPreviewDescription(ss);
                            }
                            if($(content_block).closest('#twitter-title-input-metabox').length) {
                                var twitter_title = wp.data.select("yoast-seo/editor").getTwitterTitle();
                                if(twitter_title) ss = twitter_title + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).setTwitterPreviewTitle(ss);
                            }
                            if($(content_block).closest('#twitter-description-input-metabox').length) {
                                var twitter_desc = wp.data.select("yoast-seo/editor").getTwitterDescription();
                                if(twitter_desc) ss = twitter_desc + ss;
                                wp.data.dispatch( "yoast-seo/editor" ).setTwitterPreviewDescription(ss);
                            }
                            $(document).find('.bertha_idea').each(function(){
                                $(this).removeClass('bertha_idea_non_clickable');
                            });
                        } else { 
                            var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

                            if (!isPlaying) {
                                myAudio.play();
                            }

                            typeWriterText(ss, content_block, 0, tag, myAudio);
                        }
                    }
                }
            } else {
                $(this).after('<div class="ber-notice-content">Please click inside the text area you would like to add this idea, then click the idea again to add the text to that area</div>')
            setTimeout(function(){
              $('.ber-notice-content').remove();
            }, 5000);
            }
        } else {
            $(this).after('<div class="ber-notice-content">Please click inside the text area you would like to add this idea, then click the idea again to add the text to that area</div>')
            setTimeout(function(){
              $('.ber-notice-content').remove();
            }, 5000);

        }
    });

    $(document).on('click', '#back4', function(e) {
        e.preventDefault();
        var data_block = $(this).attr('data-block');
        var block = data_block+'bertha';
        $('#bertha_canvas, #bertha_backend_canvas').find('#ber-offcanvasExampleLabel').html('What are we writing?');
        $('#bertha_canvas, #bertha_backend_canvas').find('.ber_inner_offcanvas').html('');
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').show();
        $('#bertha_canvas, #bertha_backend_canvas').find('.quickwins_container').show();
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').css({'right':'20px'});
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').css({'right':'-450px'});
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').hide();
        $('#bertha_canvas, #bertha_backend_canvas').find('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);
        $('.bertha-back').hide();
        $('.bertha-back').removeAttr("id");
    });

    $(document).on('click', '#back3', function(e) {
        e.preventDefault();
        var data_block = $(this).attr('data-block');
        var block = data_block+'bertha';
        $('.bertha-back').attr('id', 'back4');
        $('#bertha_canvas').removeClass('bertha-idea-expand');
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').show();
        $(document).find('#samsa').css('right', '-450px');
        $(document).find('#samsa').hide();
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').css({'right':'20px'});
        $('#bertha_canvas, #bertha_backend_canvas').find('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);   
        $('#bertha_canvas, #bertha_backend_canvas').find("#template_description :input").each(function() {
            var max = $(this).attr('maxlength');
            var length = $(this).val().length;
            $(this).next('p.bertha_char_count').html(length+'/'+max);
        });
        $('#bertha_canvas, #bertha_backend_canvas').find("#template_description :input").on("input", function() {
            var max = $(this).attr('maxlength');
            var length = $(this).val().length;
            $(this).next('p.bertha_char_count').html(length+'/'+max);
        }); 
    });

    $(document).on('change', '#history_filter', function(e) {
        e.preventDefault();
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var wa_template = $(document).find('#history_filter').val();
        console.log(wa_template);
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_history_filter',
            wa_template : wa_template,
            bertha_history_filter_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(response) {
            $('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);
            $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
            $('.idea-history').html('');
            $('.idea-history').html(response);
        });
    });

    $(document).on('click', '.ber-sidebar_expension', function() {
        if(!$(this).hasClass('expanded')) {
            $('#bertha_canvas').addClass('bertha-idea-expand');
            $(this).addClass('expanded');
        } else {
            $('#bertha_canvas').removeClass('bertha-idea-expand');
            $(this).removeClass('expanded');
        }
    });

    $(document).on('click', '#next3', function(e) {
        e.preventDefault();
        $('#bertha_canvas, #bertha_backend_canvas').find('#ber-offcanvasExampleLabel').html('What are we writing?');
        $('#bertha_canvas, #bertha_backend_canvas').find('.ber_inner_offcanvas').html('');
        $(document).find('#samsa').css('right', '-450px');
        $(document).find('#samsa').hide();
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').css({'right':'-450px'});
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_description').hide();
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').show();
        $('#bertha_canvas, #bertha_backend_canvas').find('.quickwins_container').show();
        $('#bertha_canvas, #bertha_backend_canvas').find('#template_selection').css({'right':'20px'});
        $('#bertha_canvas, #bertha_backend_canvas').find('.ber-offcanvas-body').animate({ scrollTop: 0 }, 0);
        $('#bertha_canvas').removeClass('bertha-idea-expand');
        $(document).find('.ber-sidebar_expension').removeClass('expanded');
        $('.bertha-back').hide();
        $('.bertha-back').removeAttr("id");
    });

    if(bertha_setup_object.current_page == 'bertha-ai-chat-setting') {
        setTimeout(function(){
            $('#chat-tab').remove();
            $('.ber-tab-content #chat').remove();
            $(document).find('.ber-nav-tabs li #templates-tab').trigger('click');
        }, 1000);
    } else if(bertha_setup_object.current_page == 'bertha-ai-art-setting') {
        setTimeout(function(){
            $('#image-tab').remove();
            $('.ber-tab-content #image').remove();
        }, 1000);
    } else if(bertha_setup_object.current_page == 'bertha-ai-audio-setting') {
        setTimeout(function(){
            $('#audio-tab').remove();
            $('.ber-tab-content #audio').remove();
        }, 1000);
    }

    $(document).on('click', '.ber-nav-link', function() {
        var control = $(this).attr('aria-controls');
        if(control == 'history') {
            $('.ber-nav-item #templates-tab').removeClass('ber-active');
            $('.ber-tab-content #templates').removeClass('ber-show ber-active');
            $('.ber-nav-item #favourite-tab').removeClass('ber-active');
            $('.ber-tab-content #favourite').removeClass('ber-show ber-active');
            $('.ber-nav-item #chat-tab').removeClass('ber-active');
            $('.ber-tab-content #chat').removeClass('ber-show ber-active');
        } else if(control == 'templates') {
            $('.ber-nav-item #history-tab').removeClass('ber-active');
            $('.ber-tab-content #history').removeClass('ber-show ber-active');
            $('.ber-nav-item #favourite-tab').removeClass('ber-active');
            $('.ber-tab-content #favourite').removeClass('ber-show ber-active');
            $('.ber-nav-item #chat-tab').removeClass('ber-active');
            $('.ber-tab-content #chat').removeClass('ber-show ber-active');
        }else if(control == 'favourite') {
            $('.ber-nav-item #templates-tab').removeClass('ber-active');
            $('.ber-tab-content #templates').removeClass('ber-show ber-active');
            $('.ber-nav-item #history-tab').removeClass('ber-active');
            $('.ber-tab-content #history').removeClass('ber-show ber-active');
            $('.ber-nav-item #chat-tab').removeClass('ber-active');
            $('.ber-tab-content #chat').removeClass('ber-show ber-active');
        }else if(control == 'chat') {
            $('.ber-nav-item #templates-tab').removeClass('ber-active');
            $('.ber-tab-content #templates').removeClass('ber-show ber-active');
            $('.ber-nav-item #history-tab').removeClass('ber-active');
            $('.ber-tab-content #history').removeClass('ber-show ber-active');
            $('.ber-nav-item #favourite-tab').removeClass('ber-active');
            $('.ber-tab-content #favourite').removeClass('ber-show ber-active');
        }
        $(this).addClass('ber-active');
        $('.ber-tab-content #'+control).addClass('ber-show ber-active');
    });

    $(document).on('click', '.bertha_idea_copy', function(e) {
        e.preventDefault();
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var copyText = $(this).attr('data-value');
        navigator.clipboard.writeText(copyText);
        var berthaCopied = $(this).next('#berthaCopied');
        berthaCopied.html('Copied');
        setTimeout(function(){
          $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
        }, 500);
    });

    $(document).on('click', '.bertha_idea_favourite', function(e) {
        e.preventDefault();
        var favourite_bertha_element =  $(this);
        if(favourite_bertha_element.hasClass('favourate_added')) {
            var request_type = 'remove-favourate';
        } else {
            var request_type = 'add-favourate';
        }
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var idea_id = favourite_bertha_element.attr('data-value');
        var berthaFavourite =favourite_bertha_element.next('#berthaFavourite');
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_favourite_added',
            idea_id : idea_id,
            request_type : request_type,
            bertha_favourite_idea_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            if(result['response'] == 'success') {
                $('.favourite-idea').html(result['favourite_ideas']);
                $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
                if(!favourite_bertha_element.hasClass('favourate_added')){
                    favourite_bertha_element.addClass('favourate_added');
                    berthaFavourite.html('Favourite added');
                    $('.idea-history').find('.bertha_idea_favourite[data-value='+idea_id+']').addClass('favourate_added');
                    $('.idea-history').find('.bertha_idea_favourite[data-value='+idea_id+']').next('#berthaFavourite').html('Favourite added');
                } else {
                    favourite_bertha_element.removeClass('favourate_added');
                    berthaFavourite.html('Add to favourite');
                    $('.idea-history').find('.bertha_idea_favourite[data-value='+idea_id+']').removeClass('favourate_added');
                    $('.idea-history').find('.bertha_idea_favourite[data-value='+idea_id+']').next('#berthaFavourite').html('Add to favourite');
                }
            }
        });
    });

    $(document).on('click', '.bertha_idea_trash', function(e) {
        e.preventDefault();
        var favourite_bertha_element =  $(this);
        $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').show();
        var idea_id = favourite_bertha_element.attr('data-value');
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_idea_trash',
            idea_id : idea_id,
            bertha_idea_trash_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            if(result['response'] == 'success') {
                $('.idea-history').html(result['idea_history']);
                $('.favourite-idea').html(result['favourite_ideas']);
                if(favourite_bertha_element.closest('#samsa').length || favourite_bertha_element.closest('.bertha-backend-content').length) {
                    favourite_bertha_element.closest('.ber-mb-3').remove();
                }
                $(".ber-offcanvas-body, .ber-tab-content").find('.ber-overlay-container').hide();
            }
        });
    });

    $(document).on('click', '.bertha_idea_report', function(e) {
        e.preventDefault();
        var idea_id = $(this).attr('data-value');
        var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_idea_report_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-report-primary-title">Thanks for letting us know!</div><div class="ber-report-secondary-title">This is how we improve bertha</div></div><button type="button" class="ber-report-btn-close ber-report-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-body"><div class="ber_inner_title">What did you expect to happen?</div><textarea id="ber_report_body" name="ber_report_body" rows="6" cols="70"></textarea></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber-btn-primary ber_report_submit" data-dismiss="ber-modal">Send a report</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
        $(top.document).find('body').append(modal);
        $(top.document).find('body #ber_idea_report_modal').show();
        $('#ber_idea_report_modal').attr('data-id', idea_id);
    });
    $(document).on('click', '.ber-report-close', function() {
        $(top.document).find('body #ber_idea_report_modal').remove();
    });
    $(document).on('click', '.bertha_image_generate_template', function(e) {
        e.preventDefault();
        if(bertha_setup_object.current_page != 'bertha-ai-art-setting') {
            var image_credits = parseInt(bertha_setup_object.image_credits);
            var image_credits_used = (bertha_setup_object.image_credits_used == 0) ? 0 : parseInt(bertha_setup_object.image_credits_used);

            var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_image_generate_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-report-primary-title">👩‍🎨 Ask Bertha to Create an Image</div></div><button type="button" class="ber-report-btn-close ber-image-close"><span aria-hidden="true">&times;</span></button></div>';
            if(image_credits_used < image_credits) {
                modal += '<div class="ber-modal-body ber_art_body"><div class="ber_art_form"><div class="ber_inner_title">Enter Text to Create Image</div><textarea id="ber_image_generate_body" class="ber_field" name="ber_image_generate_body" rows="6" cols="70" placeholder="Describe the image you would like to create."></textarea><input type="button" class="ber-btn ber-btn-primary ber-tooltip-element" data-toggle="tooltip" data-placement="top" title="Let Bertha enhance your description." id="ber_image_prompt_option_generate" value="Improve Description"><div class="ber_inner_title">Choose a Style</div><select id="ber_image_style" class="ber_field"><option value="">None</option><option value="painting">Painting</option><option value="drawing">Drawing</option><option value="animation">Animation</option><option value="screen">Screen</option><option value="photography">Photography (avoid people)</option><option value="material">Real Life Materials</option></select><div class="ber_image_sub_style"></div><div class="ber_inner_title">Choose a Trend</div><select id="ber_img_modifier" class="ber_field"><option value="">None</option><option value="in the style of steampunk">Steampunk</option><option value="synthwave">Synthwave</option><option value="in the style of cyberpunk">Cyberpunk</option><option value="insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed">Detailed &amp; Intricate</option><option value="in a symbolic and meaningful style, insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed">Symbolic &amp; Meaningful</option><option value="Cinematic Lighting">Cinematic Lighting</option><option value="Contre-Jour">Contre-Jour</option><option value="futuristic">Futuristic</option><option value="black and white">Black &amp; White</option><option value="technicolor">Technicolor</option><option value="warm color palette">Warm</option><option value="neon">Neon</option><option value="colorful">Colorful</option></select><div class="ber_inner_title">Choose an Artist</div><select id="ber_image_artist" class="ber_field"><option value="">None</option><option value="by Albert Bierstadt">Albert Bierstadt</option><option value="by Andy Warhol">Andy Warhol</option><option value="by Asaf Hanuka">Asaf Hanuka</option><option value="by Aubrey Beardsley">Aubrey Beardsley</option><option value="by Claude Monet">Claude Monet</option><option value="by Diego Rivera">Diego Rivera</option><option value="by Frida Kahlo">Frida Kahlo</option><option value="by Greg Rutkowski">Greg Rutkowski</option><option value="by Hayao Miyazaki">Hayao Miyazaki</option><option value="by Hieronymus Bosch">Hieronymus Bosch</option><option value="by Jackson Pollock">Jackson Pollock</option><option value="by Leonardo da Vinci">Leonardo da Vinci</option><option value="by Michelangelo">Michelangelo</option><option value="by Pablo Picasso">Pablo Picasso</option><option value="by Salvador Dali">Salvador Dali</option><option value="by artgerm, art germ">Stanley Artgerm</option><option value="by Thomas Kinkade">Thomas Kinkade</option><option value="by Vincent van Gogh">Vincent van Gogh</option></select>';
                modal += '<div class="ber-modal-footer"><button type="button" class="ber_button ber_image_generate_submit" data-dismiss="ber-modal">Create Images</button></div>';
            } else {
                modal += '<div class="ber_notice">Buy More Image Credits, <a href="'+bertha_setup_object.license_page+'" target="_blank">Buy More</a></div>';
            }
            modal += '</div>';                    
            if(image_credits_used < image_credits) {                    
                modal += '<div class="ber-image-promps-ideas"><div class="ber-first-promps-ideas-wrapper"><div class="ber_grid_first_parent"><div class="ber-img-icon-container"><iframe src="https://www.youtube.com/embed/acNFMXlmSsk" width="450px" height="250px"></iframe></div></div></div></div>';
            }
            modal += '</div></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div><div class="ber-img-progress ber-progress"><span></span></div></div></div>';

            $(top.document).find('body').append(modal);
            $(top.document).find('body #ber_image_generate_modal').show();
        } else {
            $(this).after("<div class='ber-notice-content'>Please use Bertha Art in the main window on this page.</div>");
            setTimeout(function(){
              $('.ber-notice-content').remove();
            }, 5000);
        }
    });
    $(document).on('click', '.ber-image-close', function() {
        $(top.document).find('body #ber_image_generate_modal').remove();
    });
    $(document).on('click', '#ber_image_prompt_option_generate', function() {
        var templates = bertha_setup_object.free_options;
        var plugin_type = bertha_setup_object.plugin_type ? bertha_setup_object.plugin_type : '';
        if(templates.img_prompt_version || plugin_type == 'pro') {
            $('#ber_image_generate_modal, .ber-tab-content #image').find('.ber-image-promps-ideas').html('');
            var body = $('#ber_image_generate_body').val();
            $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
            var ber_prcntg = 0;
            var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
            progress_span.text('');
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                     progress_span.animate({
                        width: ber_prcntg + "%",
                    }, 500);
                    progress_span.text(ber_prcntg + "%");
                }
            }, 500);

            var data = {
                action   : 'wa_ber_improve_img_prompt',
                prompt : body,
                bertha_ber_improve_img_prompt_nonce: bertha_setup_object.template_nonce
            } 

            $.post(bertha_setup_object.ajax_url, data, function(response) {
                window.clearInterval(ber_down_time);
                var ber_down_time = window.setInterval(function() {
                    ber_prcntg++;
                    if(ber_prcntg <= 100) {
                        progress_span.animate({
                            width: ber_prcntg + "%",
                        },-10);
                        progress_span.text(ber_prcntg + "%");
                    } else {
                        window.clearInterval(ber_down_time);
                    }
                }, 10);
                setTimeout(function(){
                    var result = JSON.parse(response);
                    $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();
                    if(result['initial_token_covered']) {
                        var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... Looks like you ran out of your daily words allocations.</div><div class="ber-report-secondary-title">Don\'t worry, you can wait untill tomorrow and get a new batch of words OR... you can click the big button below to upgrade and unlock more words from Bertha and speed up your writing even more!</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber_half bertha_sec_btn ber-token-close" data-dismiss="ber-modal">I\'ll wait</button><button type="button" class="ber-btn ber_half ber-btn-primary ber-token-covered-continue" data-dismiss="ber-modal">Upgrade now</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                        $(top.document).find('body').append(modal);
                        $(top.document).find('body #ber_token_covered_modal').show();
                    } else if(result['license_expired']) {
                        var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">Oops, Looks like your license has expired.</div><div class="ber-report-secondary-title">please click <a href="'+bertha_setup_object.license_page+'">UPGRADE</a> to renew.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                        $(top.document).find('body').append(modal);
                        $(top.document).find('body #ber_token_covered_modal').show();
                    } else{
                        $('#ber_image_generate_modal').find('.ber-image-promps-ideas').html(result['html']);
                        $('.ber-tab-content #image').find('.ber_art_body').hide();
                        $('.ber-tab-content #image').find('.ber-art-display-options').html(result['html']);
                    }
                }, 1500);
            });
        } else {
            var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">This is premium feature.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><a href="'+bertha_setup_object.license_page+'" target="_blank"><button type="button" class="ber-btn ber-btn-primary" data-dismiss="ber-modal">Click To Upgrade</button></a></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
            $(top.document).find('body').append(modal);
            $(top.document).find('body #ber_token_covered_modal').show();
        }
    });
    $(document).on('click', '.ber-token-covered-continue', function() {
        window.location.href = bertha_setup_object.license_page;
    });
    $(document).on('click', '.bertha_img_prompt, .ber-tab-content #image .bertha_img_prompt', function() {
        $('.ber-tab-content #image').find('.ber-art-display-options').html('');
        $('.ber-tab-content #image').find('.ber_art_body').show();
        var prev = $(this).prev('.ber-idea-btn-check');
        prev.prop('checked', true);
        var ss = $(this).find('.bertha_idea_body pre').html();
        var myAudio = new Audio(bertha_setup_object.bertha_sound);
        $('#ber_image_generate_body').val('');
        var selector = '#ber_image_generate_body';
        var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

        if (!isPlaying) {
            myAudio.play();
        }

        typeWriterText(ss, selector, 0, 'TEXTAREA', myAudio);
    });
    $(document).on('change', '#ber_image_style', function() {
        var painting = '<option value="digital art, trending on artstation, hd">Digital Art</option><option value="oil painting, award winning">Oil Painting</option><option value="watercolor painting">Watercolor</option><option value="acrylic painting, award winning art, trending">Acrylic</option><option value="airbrush art">Airbrushed</option><option value="comic, comic book">Comic Book</option><option value="schematic blueprint">Blueprint</option><option value="made up of ink dots, artistic drawing, trending on artstation">Ink Dot</option>';

        var drawing = '<option value="illustration, trending on artstation">Illustration</option><option value="cyberpunk, trending on artstation">Cyberpunk</option><option value="pencil sketch, drawing, trending on artstation">Pencil</option><option value="drawn in blue biro pen, artistic drawing, trending on artstation">Pen</option><option value="Ink dripping drawing, trending on artstation">Ink</option><option value="caligraphy">Caligraphy</option><option value="charcoal shaded, artistic drawing, trending on artstation">Charcoal</option><option value="cartoon">Cartoon</option><option value="comic, comic book">Comic Book</option><option value="schematic blueprint">Blueprint</option><option value="technical sketch">Technical Sketch</option><option value="made up of ink dots, artistic drawing, trending on artstation">Ink Dot</option><option value="line art">Line Art</option><option value="crayon drawing">Crayon</option><option value="pastel drawing, artistic">Pastel</option><option value="chalkboard drawing">Chalkboard</option>';

        var animation = '<option value="vintage disney animation">Vintage Disney</option><option value="Rendered by octane, disney animation studios">Disney Animation</option><option value="simpsons style animation">Simpsons</option><option value="anime style, Studio Ghibli, manga, trending on artstation">Anime</option><option value="disney pixar style animation, octane render">Pixar</option>';


         var screen = '<option value="Unreal Engine, Cinema 4D">Video Game HD</option><option value="animal crossing, mario, nintendo, pokemon">Nintendo</option><option value="3D render, composite">3D Render</option><option value="8bit graphics">8bit</option><option value="emoji">Emoji</option><option value="low poly ps1 graphics">Low Poly</option><option value="pixel art">Pixel Art</option><option value="ASCII art">ASCII</option>';

        var photography = '<option value="realistic photo of, award winning photograph, 50mm">Realistic</option><option value="Portrait photograph, symmetrical, award winning, bokeh, dof, Annie Leibovitz">Portrait</option><option value="polaroid photograph, polaroid frame">Polaroid</option><option value="war photograph, WWI photograph, WWII photograph">War</option><option value="Wildlife Photograph, national geographic photo, zoom, telephoto">Wildlife</option><option value="Photojournalism, award winning, photo of, magazine photograph">Photojournalism</option><option value="macro photograph, close up, zoom, depth of field">Macro</option><option value="long exposure, photograph, realistic">Long Exposure</option><option value="photograph, fish eye lense, wide-angle">Fish Eye</option>';

        var material = '<option value="statue">Statue</option><option value="marble statue">Marble</option><option value="stone statue">stone</option><option value="statue carved from wax">Wax</option><option value="origami paper folding">Origami</option><option value="paper mache art">Paper Mache</option><option value="paper cutout art">Paper Cutout</option><option value="graffiti street art">Graffiti</option><option value="halftone print">Halftone</option><option value="cross stitch art">Cross Stitch</option><option value="stained glass">Stained Glass</option><option value="made of crystals">Crystal</option><option value="made of flowers">Flowery</option>';

        var style = $(this).val();
        if(style) {
            if(style =='painting') var substyle = painting;
            if(style =='drawing') var substyle = drawing;
            if(style =='animation') var substyle = animation;
            if(style =='screen') var substyle = screen;
            if(style =='photography') var substyle = photography;
            if(style =='material') var substyle = material;
            $('.ber_image_sub_style').html('<div class="ber_inner_title">Choose a Sub-Style</div><select id="ber_img_susbstyle" class="ber_field"><option value="">None</option>'+substyle+'</select>');
        }
    });
    $(document).on('click', '.ber_image_size', function() {
        $('.ber_image_size').each(function() {
            $(this).removeClass('selected');
        });
        $(this).addClass('selected');
    });
    $(document).on('click', '.ber_image_generate_submit', function() {
         var current = $(this);
        $('#ber_image_generate_modal, .ber-tab-content #image').find('.ber-image-promps-ideas').html('');
        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
        var size = 'square';
        var image_text = $(document).find('#ber_image_generate_body').val();
        var artist = $(document).find('#ber_image_artist').val();
        var modifier = $(document).find('#ber_img_modifier').val();
        var style = $(document).find('#ber_image_style').val();
        if(style) style = $(document).find('#ber_img_susbstyle').val();
        else style = '';

        var ber_prcntg = 0;
        var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
        progress_span.text('');
        var ber_down_time = window.setInterval(function() {
            ber_prcntg++;
            if(ber_prcntg <= 100) {
                 progress_span.animate({
                    width: ber_prcntg + "%",
                }, 500);
                progress_span.text(ber_prcntg + "%");
            }
        }, 500);

        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_generate_image',
            image_text : image_text,
            artist : artist,
            style: style,
            modifier: modifier,
            size : size,
            posttype : bertha_setup_object.posttype,
            posttype_id : bertha_setup_object.posttype_id,
            bertha_image_generate_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            window.clearInterval(ber_down_time);
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                    progress_span.animate({
                        width: ber_prcntg + "%",
                    },-10);
                    progress_span.text(ber_prcntg + "%");
                } else {
                    window.clearInterval(ber_down_time);
                }
            }, 10);
            setTimeout(function(){
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();
                if(result['credit_denied']) {
                    $('#ber_image_generate_modal, .ber-tab-content #image').find('.ber_image_generate_submit').after('<div class="ber-notice-content">'+result['credit_denied']+'</div>');
                    setTimeout(function(){
                      $('.ber-notice-content').remove();
                    }, 5000);
                } else if(result['status'] == 'success') {
                    var html = (result['status'] == 'success') ? result['data'] : 'error';
                    $('#ber_image_generate_modal').find('.ber-image-promps-ideas').html(html);
                    $('.ber-tab-content #image').find('.ber_art_body').hide();
                    $('.ber-tab-content #image').find('.ber-art-display-imgs').html('<button type="button" class="ber_icon bertha-back" id="ber-img-back"><img src="'+bertha_setup_object.ber_left_img+'"></button>'+html);
                } else {
                    $('#ber_image_generate_modal, .ber-tab-content #image').find('.ber_image_generate_submit').after('<div class="ber-notice-content">Something went wrong, try again.</div>');
                    setTimeout(function(){
                      $('.ber-notice-content').remove();
                    }, 5000);
                }
            }, 1500);
        });
    });

    $(document).on('click', '.ber_image_search_view', function() {
        window.location.replace(bertha_setup_object.art_page+'&action=search-image');
    });

    $(document).on('click', '#ber-img-back', function() {
        $(document).find('.ber-art-display-imgs').html('');
        $(document).find('.ber_art_body').show();
    });

    $(document).on('click', '.ber-img-save-media', function() {
        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
        var ber_prcntg = 0;
        var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
        progress_span.text('');
        var ber_down_time = window.setInterval(function() {
            ber_prcntg++;
            if(ber_prcntg <= 100) {
                 progress_span.animate({
                    width: ber_prcntg + "%",
                }, 500);
                progress_span.text(ber_prcntg + "%");
            }
        }, 500);
        var img_url = $(this).attr('data-url');
        var resize_ele = $(this).closest('.ber_grid_img_item, .ber-searched-images-col').attr('data-key');

        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_save_media',
            img_url : img_url,
            bertha_image_save_media_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            window.clearInterval(ber_down_time);
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                    progress_span.animate({
                        width: ber_prcntg + "%",
                    },-10);
                    progress_span.text(ber_prcntg + "%");
                } else {
                    window.clearInterval(ber_down_time);
                }
            }, 10);
            setTimeout(function(){
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber-img-save-media, .ber-searched-images-col.ber_img_'+resize_ele+' .ber-img-save-media, .ber-searched-images-col.ber_img_'+resize_ele+' .ber-img-save-media').val('Uploaded to Media Folder');
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber-img-save-media, .ber-searched-images-col.ber_img_'+resize_ele+' .ber-img-save-media, .ber-searched-images-col.ber_img_'+resize_ele+' .ber-img-save-media').prop('disabled', true);
                if($("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).hasClass('ber-open')) {
                    $("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).removeClass('ber-open');
                    if($("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele+' .bertha_art_image_options').length == 0) $("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele+' img').after('<div class="bertha_art_image_options"></div>');
                }
            }, 1500);
        });
    })

    $(document).on('click', '.ber-img-featured', function() {
        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
        var ber_prcntg = 0;
        var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
        progress_span.text('');
        var ber_down_time = window.setInterval(function() {
            ber_prcntg++;
            if(ber_prcntg <= 100) {
                 progress_span.animate({
                    width: ber_prcntg + "%",
                }, 500);
                progress_span.text(ber_prcntg + "%");
            }
        }, 500);
        var img_url = $(this).attr('data-url');
        var resize_ele = $(this).closest('.ber_grid_img_item').attr('data-key');

        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_insert_featured',
            img_url : img_url,
            posttype : bertha_setup_object.posttype,
            posttype_id : bertha_setup_object.posttype_id,
            bertha_image_featured: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            window.clearInterval(ber_down_time);
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                    progress_span.animate({
                        width: ber_prcntg + "%",
                    },-10);
                    progress_span.text(ber_prcntg + "%");
                } else {
                    window.clearInterval(ber_down_time);
                }
            }, 10);
            setTimeout(function(){
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber-img-featured').val('Featured Image Added');
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber-img-featured').prop('disabled', true);
                if(result['attch_id'] && result['attch_url']) {
                    $(document).find('#_thumbnail_id, #_et_pb_post_settings_image').val(result['attch_id']);
                    setTimeout(function() {
                        if($('body').hasClass('block-editor-page')) {
                            wp.data.dispatch( 'core/editor' ).editPost({ featured_media: result['attch_id'] });
                        } else {
                            $(document).find('#postimagediv .inside .hide-if-no-js').not(':first').remove();
                            $(document).find('#postimagediv .inside .hide-if-no-js').html('<a href="'+result['attch_url']+';type=image&amp;TB_iframe=1" id="set-post-thumbnail" aria-describedby="set-post-thumbnail-desc" class="thickbox"><img width="266" height="266" src="'+result['attch_url']+'" class="attachment-266x266 size-266x266" alt="" loading="lazy" srcset="'+result['attch_url']+' 300w, '+result['attch_url']+' 150w, '+result['attch_url']+' 100w" sizes="(max-width: 266px) 100vw, 266px"></a>');
                            $(document).find('#postimagediv .inside .hide-if-no-js').append('<p class="hide-if-no-js howto" id="set-post-thumbnail-desc">Click the image to edit or update</p><p class="hide-if-no-js"><a href="#" id="remove-post-thumbnail">Remove featured image</a></p>');
                        }
                    }, 500);
                }
            }, 1500);
        });
    })
    $(document).on('click', '.ber_download_img', function() {
        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
        var img = $(this).attr('data-url');
        var resize_ele = $(this).closest('.ber_grid_img_item, .ber-searched-images-col').attr('data-key');
        var ber_prcntg = 0;
        var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
        progress_span.text('');
        var ber_down_time = window.setInterval(function() {
            ber_prcntg++;
            if(ber_prcntg <= 100) {
                 progress_span.animate({
                    width: ber_prcntg + "%",
                }, 500);
                progress_span.text(ber_prcntg + "%");
            }
        }, 500);
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_save_media',
            img_url : img,
            download: 'download',
            bertha_image_save_media_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var return_data = JSON.parse(response);
            window.clearInterval(ber_down_time);
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                    progress_span.animate({
                        width: ber_prcntg + "%",
                    },-10);
                    progress_span.text(ber_prcntg + "%");
                } else {
                    window.clearInterval(ber_down_time);
                }
            }, 10);
            setTimeout(function(){
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();               
                const link = document.createElement("a");
                link.href = return_data['url'];
                link.download = return_data['name'];
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(function() {
                    var data = {
                        action   : 'wa_save_media',
                        img_url : return_data['id'],
                        delete_img: 'true',
                        bertha_image_save_media_nonce: bertha_setup_object.template_nonce
                    }
                    $.post(ajaxurl, data, function(result) {
                        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber_download_img, .ber-searched-images-col.ber_img_'+resize_ele+' .ber_download_img').val('Image Downloaded');
                        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber_download_img, .ber-searched-images-col.ber_img_'+resize_ele+' .ber_download_img').prop('disabled', true);
                        if($("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).hasClass('ber-open')) {
                            $("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).removeClass('ber-open');
                            if($("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele+' .bertha_art_image_options').length == 0) $("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele+' img').after('<div class="bertha_art_image_options"></div>');
                        }
                    });
                }, 500);
            }, 1500);    
        });
    });
    $(document).on('click', '.ber_resize_img', function() {
        $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').show();
        var ber_prcntg = 0;
        var progress_span = $("#ber_image_generate_modal, .ber-tab-content #image").find(".ber-img-progress span");
        progress_span.text('');
        var ber_down_time = window.setInterval(function() {
            ber_prcntg++;
            if(ber_prcntg <= 100) {
                 progress_span.animate({
                    width: ber_prcntg + "%",
                }, 500);
                progress_span.text(ber_prcntg + "%");
            }
        }, 500);
        var ths = $(this);
        var img = $(this).attr('data-url');
        var resize_ele = $(this).closest('.ber_grid_img_item, .ber-searched-images-col').attr('data-key');
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_resize_media',
            img_url : img,
            // posttype : bertha_setup_object.posttype,
            // posttype_id : bertha_setup_object.posttype_id,
            bertha_image_resize_media_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            window.clearInterval(ber_down_time);
            var ber_down_time = window.setInterval(function() {
                ber_prcntg++;
                if(ber_prcntg <= 100) {
                    progress_span.animate({
                        width: ber_prcntg + "%",
                    },-10);
                    progress_span.text(ber_prcntg + "%");
                } else {
                    window.clearInterval(ber_down_time);
                }
            }, 10);
            setTimeout(function(){
                $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber-overlay-container').hide();
                var result = JSON.parse(response);
                if(result['status'] == 'success') {
                    var media_save = $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber-img-save-media, .ber-searched-images-col.ber_img_'+resize_ele+' .ber-img-save-media');
                    var media_down = $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber_download_img, .ber-searched-images-col.ber_img_'+resize_ele+' .ber_download_img');
                    if(media_save == 'Uploaded to Media Folder') {
                        media_save.val('Uploaded to Media Folder');
                        media_save.prop('disabled', false);
                    }
                    if(media_down == 'Image Downloaded') {
                        media_down.val('Download Image');
                        media_down.prop('disabled', false);
                    }
                    $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber_resize_img, .ber-searched-images-col.ber_img_'+resize_ele+' .ber_resize_img').val('Resized Image');
                    $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+' .ber_resize_img, .ber-searched-images-col.ber_img_'+resize_ele+' .ber_resize_img').prop('disabled', true);
                    $("#ber_image_generate_modal, .ber-tab-content #image").find('.ber_grid_img_item.ber_img_'+resize_ele+', .ber-searched-images-col.ber_img_'+resize_ele).html(result['data']);
                } else {
                    $('#ber_image_generate_modal, .ber-tab-content #image').find('.ber_image_generate_submit').after('<div class="ber-notice-content">Something went wrong, try again.</div>');
                    setTimeout(function(){
                      $('.ber-notice-content').remove();
                    }, 5000);
                }
                if($("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).hasClass('ber-open')) $("#ber_image_generate_modal").find('.ber-searched-images-col.ber_img_'+resize_ele).removeClass('ber-open');
            }, 1500);
        });
    });
    $(document).on('click', '.ber_img_insert_prompt', function() {
        var prompt = $(this).attr('data-prompt');
        var myAudio = new Audio(bertha_setup_object.bertha_sound);
        ber_art_create_view();
        setTimeout(function() {
            $('#ber_image_generate_body').val('');
            var selector = '#ber_image_generate_body';
            var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

            if (!isPlaying) {
                myAudio.play();
            }

            typeWriterText(prompt, selector, 0, 'TEXTAREA', myAudio);
        }, 700);
    })
    $(document).on('click', '.ber-searched-images-col, .ber_art_body .ber_grid_img_item, .ber-art-display-imgs .ber_grid_img_item',  function() {
        var element = $(this).attr('data-key');
        var src = $(this).attr('data-src');
        var prompt = $(this).attr('data-prompt');
        var option = $(".ber-art-searched-images, .ber_art_body, .ber-art-display-imgs").find('.ber-searched-images-col.ber_img_'+element+' .bertha_art_image_options, .ber_grid_img_item.ber_img_'+element+' .bertha_art_image_options');
        $(".ber-art-searched-images, .ber_art_body, .ber-art-display-imgs").find('.ber-searched-images-col, .ber_grid_img_item').each(function() {
            if($(this).hasClass('ber-open')) {
                if($(this).hasClass('ber_grid_img_item')) {
                    $(this).removeClass('ber-open');
                    $(this).find('.bertha_art_image_options').removeClass('ber-display');
                } else { 
                    $(this).removeClass('ber-open');
                    $(this).find('.bertha_art_image_options').remove();
                    var ths = $(this);
                    setTimeout(function() {
                        ths.find('.ber-searched-images-inner').append('<div class="bertha_art_image_options"></div>');
                    }, 500);
                }
            }
        });
        $(this).addClass('ber-open');
        if(!$(this).hasClass('ber_grid_img_item')) {
            option.html('<div class="ber-close-container"><div class="ber_inner_title">Image Options</div><img class="ber_close_icon" src="'+bertha_setup_object.ber_close_img+'"></div><input type="button" data-url="'+src+'" class="ber-btn ber-btn-primary ber-img-save-media" value="Save to Media Library"><input type="button" data-url="'+src+'" class="ber-btn bertha_sec_btn ber_download_img" value="Download Image"><input type="button" data-url="'+src+'" class="ber-btn bertha_sec_btn ber_resize_img" value="Resize Image"><input type="button" data-prompt="'+prompt+'" class="ber-btn bertha_sec_btn ber_img_insert_prompt" value="Use Image Prompt">');
        }
        option.addClass('ber-display');
    });
    $(document).on('click', '.bertha_art_image_options .ber_close_icon, .ber_art_body .ber_close_icon', function() {
        var ths = $(this);
        var element = ths.closest('.ber-searched-images-col, .ber_grid_img_item').attr('data-key');
        if(ths.closest('.ber_grid_img_item').length) {
            setTimeout(function() {
                ths.closest('.bertha_art_image_options').removeClass('ber-display');
                ths.closest('.ber_grid_img_item.ber_img_'+element).removeClass('ber-open');
             }, 200);   
        } else {
            $(document).find('.ber-art-searched-images .ber-searched-images-col.ber_img_'+element+' .bertha_art_image_options').remove();
            setTimeout(function() {
                $(document).find('.ber-art-searched-images .ber-searched-images-col.ber_img_'+element).append('<div class="bertha_art_image_options"></div>');
                $(document).find('.ber-art-searched-images .ber-searched-images-col.ber_img_'+element).removeClass('ber-open');
            }, 500);
        }
    }); 
    $(document).on('click', '.ber_report_submit', function() {
        $("#ber_idea_report_modal").find('.ber-overlay-container').show();
        var idea_id = $('#ber_idea_report_modal').attr('data-id');
        if(idea_id) var ask_body = '';
        else var ask_body = $(document).find('#ber_quickwins_body').val();
        var report_body = $('#ber_report_body').val();
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_idea_report',
            idea_id : idea_id,
            report_body : report_body,
            ask_body : ask_body,
            bertha_idea_report_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            if(result['response'] == 'success') {
                $("#ber_idea_report_modal").find('.ber-overlay-container').hide();
                $('.ber-modal-body').hide();
                $('.ber-modal-footer').hide();
                $('.ber-modal-header').after('<div class="ber-modal-body ber-report-response"><div class="ber_inner_title">Thank You for Your Submission.</div></div>');
            }
        });
    });

    $(document).on('click', '.bertha_quickwins_template', function(e) {
        e.preventDefault();
        var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_quickwins_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered ber-ask" role="document"><div class="ber-modal-content">';
                if(bertha_setup_object.plugin_type && bertha_setup_object.plugin_type == 'pro') {
                    modal += '<div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber_big_title">Ask Bertha to Write About Anything</div><div class="ber_inner_p">From email subject lines to full on blog posts and even Facebook adverts</div></div><div class="ber-ask-action-icon-wrap"><div class="bertha-copied-container ber-action-icon"><button class="bertha_ask_copy"><i class="ber-i-copy"></i></button><span class="bertha-copied-text" id="berthaCopied">Copy to clipboard</span></div><div class="bertha-favourite-container ber-action-icon"><button class="bertha_ask_favourite"><i class="ber-i-heart"></i></button><span class="bertha-favourite-text" id="berthaFavourite">Add to Favourite</span></div><div class="bertha-report-container ber-action-icon"><button class="bertha_ask_report"><i class="ber-i-flag-alt"></i></button><span class="bertha-report-text" id="berthaReport">Report</span></div><button type="button" class="ber-quickwins-btn-close ber-quickwins-close"><span aria-hidden="true">&times;</span></button></div></div><div class="ber-modal-body ber-ama-body"><div class="ber-ask-body"><textarea id="ber_quickwins_body" rows="15" cols="100" placeholder="Start typing here, asking Bertha anything..."></textarea></div><div class="ber-content-settings-data"><div class="ber_inner_title_ask">Insert Default Content</div><button type="button" class="ber-btn bertha_sec_btn ber_quickwins brand" data-dismiss="ber-modal">Brand Name</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins desc" data-dismiss="ber-modal">Company Description</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins customer" data-dismiss="ber-modal">Ideal Customer</button><button type="button" class="ber-btn bertha_sec_btn ber_quickwins tone" data-dismiss="ber-modal">Tone of Voice</button></div></div><div class="ber-modal-footer"><div class="ber-ask-animation"><img src="'+bertha_setup_object.bertha_hi_img+'" alt="Bertha animation" class="ber_animation_bertha" /></div><div class="ber-ask-submit"><button type="button" class="ber-btn bertha_sec_btn ber_quickwins_reset" data-dismiss="ber-modal">Reset</button><button type="button" class="ber-btn ber-btn-primary ber_quickwins_generate" data-dismiss="ber-modal">Generate</button></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>';
                } else {
                   modal += '<div class="ber-modal-header"><button type="button" class="ber-quickwins-btn-close ber-quickwins-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-body"><p class="ber_p_desc ber_page_info ber_user_quickwins_info">Please Upgrade to access this feature which will help you write anything from a facebook post to full story about anything you like.<a class="ber_btn" target="_blank" href="'+bertha_setup_object.license_page+'">Upgrade</a></p></div>';
                }
                modal += '</div></div></div>';
        $(top.document).find('body').append(modal);
        $(top.document).find('body #ber_quickwins_modal').show();
    });
    $(document).on('click', '.ber-quickwins-close', function() {
        $(top.document).find('body #ber_quickwins_modal').remove();
    });
    $(document).on('click', '.ber-chat-close', function() {
        $(top.document).find('body #ber_chat_modal').remove();
    });
    $(document).on('click', '.ber-art-search, .ber_search_swap', function() {
        $('.ber_art_wrap').find('.ber-overlay-container').show();
        get_search_images_view();
    });
    function get_search_images_view() {
        var html = '<div class="ber_art_page_wrap"><div class="ber_art_title">Search AI Generated Images</div><div class="ber_img_top"><p class="ber_p_desc">Search for AI-generated images that were created by the community. These images can be used freely providing a large library of creative and unique images.</p><button type="button" class="ber-btn bertha_sec_btn ber_img_swap" data-dismiss="ber-modal">Create Your Own</button></div><div class="ber_art_search_body"><div class="ber_art_page_form"><div class="bertha-art-search-body"><input type="text" class="ber_field ber-art-search-field" placeholder="Describe the image you have in mind..." /><input type="button" class="ber_button ber-art-search-submit" value="Search" /></div><div class="ber-art-searched-images"></div><div class="ber_img_load_container"><input type="button" class="ber_button ber_load_img" value="Load More" /></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div><div class="ber-img-progress ber-progress"><span></span></div></div></div></div></div>';
        setTimeout(function() {
            $('.ber_art_wrap').html(html);
            $('.ber_art_wrap').prepend('');
            $('.ber_art_wrap').find('.ber-overlay-container').hide();
            var elem = document.querySelector('.ber-art-searched-images');
            var msnry = new Masonry( elem, {
              // options
              itemSelector: '.ber-searched-images-col',
              columnWidth: 200
            });
        }, 500);
    }
    $(document).on('click', '.ber-art-create, .ber_img_swap', function() {
        ber_art_create_view();
    });
    function ber_art_create_view() {
        var image_credits = parseInt(bertha_setup_object.image_credits);
        var image_credits_used = (bertha_setup_object.image_credits_used == 0) ? 0 : parseInt(bertha_setup_object.image_credits_used);
        $('.ber_art_wrap').find('.ber-overlay-container').show();
        if(image_credits_used < image_credits) {
            var html = '<div class="ber_art_page_wrap"><div class="ber_art_body"><div class="ber_art_page_form"><div class="ber_inner_title">Enter Text to Create Image</div><textarea id="ber_image_generate_body" class="ber_field" name="ber_image_generate_body" rows="6" cols="70" placeholder="Describe the image you would like to create."></textarea><input type="button" class="ber-btn ber-btn-primary ber-tooltip-element" data-toggle="tooltip" data-placement="top" title="Let Bertha enhance your description." id="ber_image_prompt_option_generate" value="Improve Description"><div class="ber_inner_title">Choose a Style</div><select id="ber_image_style" class="ber_field"><option value="">None</option><option value="painting">Painting</option><option value="drawing">Drawing</option><option value="animation">Animation</option><option value="screen">Screen</option><option value="photography">Photography (avoid people)</option><option value="material">Real Life Materials</option></select><div class="ber_image_sub_style"></div><div class="ber_inner_title">Choose a Trend</div><select id="ber_img_modifier" class="ber_field"><option value="">None</option><option value="in the style of steampunk">Steampunk</option><option value="synthwave">Synthwave</option><option value="in the style of cyberpunk">Cyberpunk</option><option value="insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed">Detailed &amp; Intricate</option><option value="in a symbolic and meaningful style, insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed">Symbolic &amp; Meaningful</option><option value="Cinematic Lighting">Cinematic Lighting</option><option value="Contre-Jour">Contre-Jour</option><option value="futuristic">Futuristic</option><option value="black and white">Black &amp; White</option><option value="technicolor">Technicolor</option><option value="warm color palette">Warm</option><option value="neon">Neon</option><option value="colorful">Colorful</option></select><div class="ber_inner_title">Choose an Artist</div><select id="ber_image_artist" class="ber_field"><option value="">None</option><option value="by Albert Bierstadt">Albert Bierstadt</option><option value="by Andy Warhol">Andy Warhol</option><option value="by Asaf Hanuka">Asaf Hanuka</option><option value="by Aubrey Beardsley">Aubrey Beardsley</option><option value="by Claude Monet">Claude Monet</option><option value="by Diego Rivera">Diego Rivera</option><option value="by Frida Kahlo">Frida Kahlo</option><option value="by Greg Rutkowski">Greg Rutkowski</option><option value="by Hayao Miyazaki">Hayao Miyazaki</option><option value="by Hieronymus Bosch">Hieronymus Bosch</option><option value="by Jackson Pollock">Jackson Pollock</option><option value="by Leonardo da Vinci">Leonardo da Vinci</option><option value="by Michelangelo">Michelangelo</option><option value="by Pablo Picasso">Pablo Picasso</option><option value="by Salvador Dali">Salvador Dali</option><option value="by artgerm, art germ">Stanley Artgerm</option><option value="by Thomas Kinkade">Thomas Kinkade</option><option value="by Vincent van Gogh">Vincent van Gogh</option></select><div class="ber-modal-footer"><button type="button" class="ber_button ber_image_generate_submit" data-dismiss="ber-modal">Create Images</button></div></div><div class="ber-image-promps-ideas"><div class="ber-first-promps-ideas-wrapper"><div class="ber_grid_first_parent"><div class="ber-img-icon-container"></div></div></div></div></div></div>';
        } else {
            var html = '<div class="ber_notice">Buy More Image Credits, <a href="'+bertha_setup_object.license_page+'" target="_blank">Buy More</a></div>';
        }
        html += '<div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div><div class="ber-img-progress ber-progress"><span></span></div></div></div>';
        setTimeout(function() {
            $('.ber_art_wrap').html(html);
            $('.ber_art_wrap').prepend('<div class="ber_art_head"><div class="ber_art_title">Generate Custom Images</div><div class="ber_search_top"><p class="ber_p_desc">Describe the image you have in mind and let Bertha imagine a few variations for you to use freely. Create images for your website, blog posts or just for fun.</p><button type="button" class="ber-btn bertha_sec_btn ber_search_swap" data-dismiss="ber-modal">Search Images</button></div></div>');
            $('.ber_art_wrap').find('.ber-overlay-container').hide();
        }, 500);
    }
    $(document).on('click', '.ber_load_img', function() {
        $(this).addClass('ber-loaded');
        $(document).find('.ber-art-search-submit').trigger('click');
    });
    var search_count = 0;
    $(document).on('click', '.ber-art-search-submit', function() {
        get_search_imgs_view();
    });
    function get_search_imgs_view() {
        $('#ber_image_generate_modal').find('.ber-overlay-container').show();
        var term = $('.ber-art-search-field').val();
        var count = 0;
        search_count++;
        if($(document).find('.ber_load_img').hasClass('ber-loaded')) count = $('.ber-art-searched-images').children().length;
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_ber_art_search',
            term : term,
            count : count,
            bertha_art_search_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(response) {
            var $grid = $('.ber-art-searched-images').imagesLoaded( function() {
              $grid.masonry({
                itemSelector: '.ber-searched-images-col',
                percentPosition: true
             }); 
            });
            if($(document).find('.ber_load_img').hasClass('ber-loaded')) {
                $('.ber-art-searched-images').append(response);
            } else {
                $('.ber-art-searched-images').html(response);
            }
            $(document).find('.ber_img_load_container').show();
            $grid.masonry('reloadItems');
            if(search_count < 2 && !$(document).find('.ber_load_img').hasClass('ber-loaded')) {
                setTimeout(function() {
                    get_search_imgs_view();
                }, 100);
            } else {
                search_count = 0;
                $('#ber_image_generate_modal').find('.ber-overlay-container').hide();
                if($(document).find('.ber_load_img').hasClass('ber-loaded')) $(document).find('.ber_load_img').removeClass('ber-loaded')
            }
        });
    }
    // $(document).on('click', 'a.ber-search-overlay-container', function() {
    //     $("#ber_image_generate_modal").find('.ber-overlay-container').show();
    //     var ths = $(this);
    //     var img_url = ths.find('img').attr('src');

    //     var ajaxurl = bertha_setup_object.ajax_url;
    //     var data = {
    //         action   : 'wa_save_media',
    //         img_url : img_url+'?ext=.jpeg',
    //         bertha_image_save_media_nonce: bertha_setup_object.template_nonce
    //     }
    //     $.post(ajaxurl, data, function(response) {
    //         $("#ber_image_generate_modal").find('.ber-overlay-container').hide();
    //         ths.attr('data-overlay-text', 'Saved');
    //     });
    // })

    var bertha_play_text = '';
    $(document).on('click', '.ber_quickwins_generate', function() {
        var ths = $(this);
        var offset = document.getElementById("ber_quickwins_body").selectionStart;
        if(offset && offset > 1) var prompt = $('#ber_quickwins_body').val().slice(0, offset);
        else var prompt = $('#ber_quickwins_body').val();
        if(bertha_play_text == '') bertha_play_text = prompt;
        var ajaxurl = bertha_setup_object.ajax_url;
        $('#ber_quickwins_modal, .ber-tab-content #ama').find('.ber-overlay-container').show();

        var data = {
            action   : 'wa_ber_generate_playground',
            prompt : prompt,
            bertha_ber_playground_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            $('#ber_quickwins_modal, .ber-tab-content #ama').find('.ber-overlay-container').hide();
            if(result['ber_license_required']) {
                ths.after('<div class="ber-notice-content">Please activate your license.</div>')
                setTimeout(function(){
                  $('.ber-notice-content').remove();
                }, 5000);
            } else if(result['initial_token_covered']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... Looks like you ran out of your daily words allocations.</div><div class="ber-report-secondary-title">Don\'t worry, you can wait untill tomorrow and get a new batch of words OR... you can click the big button below to upgrade and unlock more words from Bertha and speed up your writing even more!</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber_half bertha_sec_btn ber-token-close" data-dismiss="ber-modal">I\'ll wait</button><button type="button" class="ber-btn ber_half ber-btn-primary ber-token-covered-continue" data-dismiss="ber-modal">Upgrade now</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else if(result['license_expired']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">Oops, Looks like your license has expired.</div><div class="ber-report-secondary-title">please click <a href="'+bertha_setup_object.license_page+'">UPGRADE</a> to renew.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else if(result['token_denied']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... You have exceeded your character limit.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><a href="https://bertha.ai/ran-out-of-words/" target="_blank"><button type="button" class="ber-btn ber-btn-primary" data-dismiss="ber-modal">Upgrade now</button></a></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else{
                var myAudio = new Audio(bertha_setup_object.bertha_sound);
                var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

                if (!isPlaying) {
                    myAudio.play();
                }

                var cur = $('#ber_quickwins_body').val();
                $('#ber_quickwins_body').val(cur.slice(0, offset) + '\r\n' + cur.slice(offset));
                typePlaygroundText(result['html'], 0, offset+1, myAudio);
            }
        });
    });
    
    $(document).on('click', '.ber_chat_generate', function() {
        var ths = $(this);
        if($(document).find('.ber-chat-body').html() == '') var new_chat = 'true';
        else var new_chat = 'false';
        var user = bertha_setup_object.current_user;
        var prompt = $(document).find('#ber_chat_body').val();
        if($(document).find('.ber-chat-body .ber-bertha-reply').length)  $(document).find('.ber-chat-body .ber-bertha-reply:last').after('<div class="ber-user-reply"><span>'+user+'</span><div class="ber-user-reply-inner"><div class="ber-user-reply-data">'+prompt+'</div></div></div>');
        else $(document).find('.ber-chat-body').prepend('<div class="ber-user-reply"><span>'+user+'</span><div class="ber-user-reply-inner"><div class="ber-user-reply-data">'+prompt+'</div></div></div>');
        $('#ber_chat_modal').find('.ber-overlay-container').show();
        $(document).find('#ber_chat_body').val('');
        var ajaxurl = bertha_setup_object.ajax_url;
        $('#ber_chat_modal').find('.ber-overlay-container').show();
        var data = {
            action   : 'wa_ber_generate_chat',
            prompt : prompt,
            new_chat: new_chat,
            bertha_ber_chat_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            console.log(result);
            $('#ber_chat_modal').find('.ber-overlay-container').hide();
            if(result['ber_license_required']) {
                ths.after('<div class="ber-notice-content">Please activate your license.</div>')
                setTimeout(function(){
                  $('.ber-notice-content').remove();
                }, 5000);
            } else if(result['initial_token_covered']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... Looks like you ran out of your daily words allocations.</div><div class="ber-report-secondary-title">Don\'t worry, you can wait untill tomorrow and get a new batch of words OR... you can click the big button below to upgrade and unlock more words from Bertha and speed up your writing even more!</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber_half bertha_sec_btn ber-token-close" data-dismiss="ber-modal">I\'ll wait</button><button type="button" class="ber-btn ber_half ber-btn-primary ber-token-covered-continue" data-dismiss="ber-modal">Upgrade now</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else if(result['license_expired']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">Oops, Looks like your license has expired.</div><div class="ber-report-secondary-title">please click <a href="'+bertha_setup_object.license_page+'">UPGRADE</a> to renew.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else if(result['token_denied']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... You have exceeded your character limit.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><a href="https://bertha.ai/ran-out-of-words/" target="_blank"><button type="button" class="ber-btn ber-btn-primary" data-dismiss="ber-modal">Upgrade now</button></a></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else{
                var myAudio = new Audio(bertha_setup_object.bertha_sound);
                var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

                if (!isPlaying) {
                    myAudio.play();
                }

                var reply = document.createElement('div');
                reply.className = 'ber-bertha-reply';
                reply.textContent = 'Bertha AI: ';
                $(document).find('.ber-chat-body .ber-user-reply:last').after('<div class="ber-bertha-reply"><span><img src="'+bertha_setup_object.bertha_avatar+'"></span><div class="ber-bertha-reply-inner-chat"><div class="ber-action-icon-wrap-chat"><div class="bertha-copied-container ber-action-icon"><button class="bertha_idea_copy" data-value="'+result['html']+'"><i class="ber-i-copy"></i></button><span class="bertha-copied-text" id="berthaCopied">Copy to clipboard</span></div></div><div class="ber-bertha-reply-data"><pre><p></p></pre></div></div></div>');
                typeChatText(getstringwithlinebreak(result['html']), 0, myAudio);
            }
        });
    });

    function getstringwithlinebreak(str) {   
        var breakTag = 'z*#';    
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
    }

    $(document).on('change', '.ber_audio_upload', function() {
        var file = $(this)[0].files[0].name;
        var size = $(this)[0].files[0].size;
        if(size <= 25000000) {
            $(document).find('.ber-audio-field label').html(file);
        } else {
            $(document).find('.ber_audio_upload').val('');
            $(document).find('.ber-audio-field label').html('<strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.');
            alert('You can\'t upload more than 25mb file.');
        }
    });

    $(document).on('click', '.ber_audio_reset', function() {
        $(document).find('.ber-audio-body, .ber-translated-content').html('');
        $(document).find('.ber-translated-content').next().remove();
        $(document).find('.ber_audio_upload').val('');
        $(document).find('.ber-audio-field label').html('<strong>Choose a file</strong><span class="box__dragndrop"> or drag it here</span>.');
    });

    $(document).on('click', '.bertha_audio_copy', function(e) {
        e.preventDefault();
        var askBody = $(this).closest('.ber-action-icon-wrap').prev('.ber-audio-body-content, .ber-audio-translated-content').html();
        navigator.clipboard.writeText(askBody);
        var berthaCopied = $(this).next('#berthaCopied');
        berthaCopied.html('Copied');
        setTimeout(function(){
          berthaCopied.html('Copy to clipboard');
        }, 5000);
    });

    $(document).on('click', '.ber_audio_generate', function() {
        var ths = $(this);
        $(document).find('#ber_audio_modal .ber-overlay-container').show();
        $(document).find('.ber-audio-body').html('');
        var file = $(document).find('.ber_audio_upload')[0].files[0];
        var type = $(document).find('#ber_transcribe_type').val();
        var formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('action', 'wa_ber_translate_audio');
        var ajaxurl = bertha_setup_object.ajax_url;
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $(document).find('#ber_audio_modal .ber-overlay-container').hide();
                var result = JSON.parse(response);
                if(result.html) {
                    var text = '<div class="ber-audio-body-container"><p class="ber-audio-body-content">'+result.html+'</p><div class="ber-action-icon-wrap"><div class="bertha-copied-container ber-action-icon"><button class="bertha_audio_copy"><i class="ber-i-copy"></i></button><span class="bertha-copied-text" id="berthaCopied">Copy to clipboard</span></div></div></div><p><button type="button" class="ber-btn bertha_sec_btn ber_field ber_download_srt">Download SRT File</button></p>';
                    text = text + '<div class="ber-audio-language"><select class="ber_field" access="false" id="ber_translation_list" required="required" aria-required="true"><option value="English">English</option><option value="French">French</option><option value="German">German</option><option value="Dutch">Dutch</option><option value="Spanish">Spanish</option><option value="Hebrew">Hebrew</option><option value="Italian">Italian</option><option value="Portuguese">Portuguese</option><option value="Bulgarian">Bulgarian</option><option value="Croatian">Croatian</option><option value="Czech">Czech</option><option value="Danish">Danish</option><option value="Estonian">Estonian</option><option value="Finnish">Finnish</option><option value="Greek">Greek</option><option value="Hungarian">Hungarian</option><option value="Irish">Irish</option><option value="Latvian">Latvian</option><option value="Lithuanian">Lithuanian</option><option value="Maltese">Maltese</option><option value="Polish">Polish</option><option value="Romanian">Romanian</option><option value="Slovak">Slovak</option><option value="Slovenian">Slovenian</option><option value="Swedish">Swedish</option><option value="Japanese">Japanese</option><option value="Norwegian">Norwegian</option></select><button type="button" class="ber-btn ber-btn-primary ber_translate_text" data-dismiss="ber-modal">Translate/Beta</button></div>';
                    $(document).find('.ber-audio-body').html(text);
                } else {
                    ths.after('<div class="ber-notice-content">'+result.token_denied+'</div>')
                    setTimeout(function(){
                      $('.ber-notice-content').remove();
                    }, 5000);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                $(document).find('.ber-overlay-container').hide();
                console.log(textStatus);
            }
        });
    });

    $(document).on('click', '.ber_translate_text', function() {
        var language = $(document).find('#ber_translation_list').val();
        var content = $(document).find('.ber-audio-body-content').html();
        var ajaxurl = bertha_setup_object.ajax_url;
        $(document).find('#ber_audio_modal .ber-overlay-container').show();
        var data = {
            action   : 'wa_ber_translate_content',
            content : content,
            language: language,
            bertha_ber_translate_nonce: bertha_setup_object.template_nonce
        } 
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            $(document).find('#ber_audio_modal .ber-overlay-container').hide();
            if(result['ber_license_required']) {
                ths.after('<div class="ber-notice-content">Please activate your license.</div>')
                setTimeout(function(){
                  $('.ber-notice-content').remove();
                }, 5000);
            } else if(result['initial_token_covered']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">UH oh... Looks like you ran out of your daily words allocations.</div><div class="ber-report-secondary-title">Don\'t worry, you can wait untill tomorrow and get a new batch of words OR... you can click the big button below to upgrade and unlock more words from Bertha and speed up your writing even more!</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber_half bertha_sec_btn ber-token-close" data-dismiss="ber-modal">I\'ll wait</button><button type="button" class="ber-btn ber_half ber-btn-primary ber-token-covered-continue" data-dismiss="ber-modal">Upgrade now</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else if(result['license_expired']) {
                var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_token_covered_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-token-primary-title">Oops, Looks like your license has expired.</div><div class="ber-report-secondary-title">please click <a href="'+bertha_setup_object.license_page+'">UPGRADE</a> to renew.</div></div><button type="button" class="ber-token-covered-btn-close ber-token-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
                $(top.document).find('body').append(modal);
                $(top.document).find('body #ber_token_covered_modal').show();
            } else{
                $(document).find('.ber-translated-content').html('<div class="ber-audio-body-container"><p class="ber-audio-translated-content">'+result['html']+'</p><div class="ber-action-icon-wrap"><div class="bertha-copied-container ber-action-icon"><button class="bertha_audio_copy"><i class="ber-i-copy"></i></button><span class="bertha-copied-text" id="berthaCopied">Copy to clipboard</span></div></div></div>');
                if($(document).find('.ber-translated-content').next('p').length == 0) {
                    $(document).find('.ber-translated-content').after('<p><button type="button" class="ber-btn bertha_sec_btn ber_field ber_download_srt">Download SRT File</button></p>');
                }
            }
        });
    });

    $(document).on('click', '.ber_download_srt', function() {
        content = $(this).closest('p').prev().find('p').html();
        textToSrt(content);
    });

    function textToSrt(text) {
      const sentences = text.split(/[.?!\n]+/);
      let srtText = '';
      let time = 0;
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        if (sentence) {
          const number = i + 1;
          const startTime = formatTime(time);
          time += getDuration(sentence);
          const endTime = formatTime(time);
          srtText += `${number}\n${startTime} --> ${endTime}\n${sentence}\n\n`;
        }
      }
      const link = document.createElement('a');
      link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(srtText));
      link.setAttribute('download', 'subtitle.srt');
      document.body.appendChild(link);
      link.click();
    }

    function formatTime(milliseconds) {
      const date = new Date(null);
      date.setMilliseconds(milliseconds);
      const hhmmss = date.toISOString().substr(11, 8);
      const ms = milliseconds % 1000;
      return `${hhmmss},${padZeroes(ms, 3)}`;
    }

    function getDuration(text) {
      const wordsPerMinute = 120;
      const words = text.split(/\s+/).length;
      const minutes = words / wordsPerMinute;
      const seconds = minutes * 60;
      return Math.round(seconds * 1000);
    }

    function padZeroes(number, length) {
      let result = number.toString();
      while (result.length < length) {
        result = '0' + result;
      }
      return result;
    }

    $(document).on('keyup', '#ber_chat_body, .ber-art-search-field', function(e) {
        if(e.key == 'Enter') {
            if(e.shiftKey == false) {
                if($(this).closest('.ber_art_search_body').length) $(document).find('.ber-art-search-submit').trigger('click');
                else if($(this).closest('#ber_chat_modal').length) $(document).find('.ber_chat_generate').trigger('click');
            }
        }
    });

    function typePlaygroundText(txt, i, offset, myAudio) { 
      if (i < txt.length) {
        var cur = $('#ber_quickwins_body').val();
        if(offset) {
            $('#ber_quickwins_body').val(cur.slice(0, offset) + txt.charAt(i) + cur.slice(offset));
            offset++;
        } else {
            $('#ber_quickwins_body').val(cur+txt.charAt(i));
        }
        i++;
        setTimeout(function() {
            typePlaygroundText(txt, i, offset, myAudio);
        }, speed);
        if(i == txt.length) {
            myAudio.pause();
        }
      }
    }

    function typeChatText(txt, i, myAudio) { 
      if (i < txt.length) {
        var cur = $(document).find('.ber-chat-body .ber-bertha-reply-data:last pre p').html();
        if(txt.charAt(i) == 'z' && txt.charAt(i + 1) == '*' && txt.charAt(i + 2) == '#') {
            var htext = '<br/>';
        } else if((txt.charAt(i) == '*' && txt.charAt(i - 1) == 'z' && txt.charAt(i + 1) == '#') || (txt.charAt(i) == '#' && txt.charAt(i - 1) == '*' && txt.charAt(i - 2) == 'z')) {
            var htext = '';
        } else {
            var htext = txt.charAt(i);
        }
        $(document).find('.ber-chat-body .ber-bertha-reply-data:last pre p').html(cur+htext);
        i++;
        setTimeout(function() {
            typeChatText(txt, i, myAudio);
        }, speed);
        if(i == txt.length) {
            myAudio.pause();
        }
      }
    }

    $(document).on('click', '.ber_quickwins_reset', function() {
        if(bertha_play_text) $(document).find('#ber_quickwins_body').val(bertha_play_text);
        if($(document).find('.bertha_ask_favourite').hasClass('favourate_added')) {
            $(document).find('.bertha_ask_favourite').removeClass('favourate_added');
            $(document).find('.bertha_ask_favourite').next('#berthaFavourite').html('Add to favourite');
        }
    });
    $(document).on('click', '.ber_chat_reset, .ber_chat_reset_modal', function() {
        $(document).find('.ber-user-reply').remove();
        $(document).find('.ber-bertha-reply').remove();
    });

    $(document).on('click', '.ber_quickwins', function() {
        var content = '';
        if($(this).hasClass('brand')) content = bertha_setup_object.ber_settings.brand;
        else if($(this).hasClass('desc')) content = bertha_setup_object.ber_settings.desc;
        else if($(this).hasClass('customer')) content = bertha_setup_object.ber_settings.customer;
        else if($(this).hasClass('tone')) content = bertha_setup_object.ber_settings.tone;

        var offset = document.getElementById("ber_quickwins_body").selectionStart;
        var myAudio = new Audio(bertha_setup_object.bertha_sound);
        var isPlaying = myAudio.currentTime > 0 && !myAudio.paused && !myAudio.ended 
                            && myAudio.readyState > myAudio.HAVE_CURRENT_DATA;

        if (!isPlaying) {
            myAudio.play();
        }
        var cur = $('#ber_quickwins_body').val();
        typePlaygroundText(content, 0, offset, myAudio);

    });

    $(document).on('click', '.bertha_ask_copy', function(e) {
        e.preventDefault();
        var askBody = $(document).find('#ber_quickwins_body').val();
        navigator.clipboard.writeText(askBody);
        var berthaCopied = $(this).next('#berthaCopied');
        berthaCopied.html('Copied');
        setTimeout(function(){
          berthaCopied.html('Copy to clipboard');
        }, 5000);
    });

    $(document).on('click', '.bertha_ask_favourite', function(e) {
        e.preventDefault();
        var favourite_bertha_element =  $(this);
        var askBody = $(document).find('#ber_quickwins_body').val();
        if(favourite_bertha_element.hasClass('favourate_added')) {
            var request_type = 'remove-favourate';
        } else {
            var request_type = 'add-favourate';
        }
        $('#ber_quickwins_modal').find('.ber-overlay-container').hide();
        var berthaFavourite =favourite_bertha_element.next('#berthaFavourite');
        var ajaxurl = bertha_setup_object.ajax_url;
        var data = {
            action   : 'wa_ask_favourite_added',
            askBody : askBody,
            request_type : request_type,
            bertha_favourite_ask_nonce: bertha_setup_object.template_nonce
        }
        $.post(ajaxurl, data, function(response) {
            var result = JSON.parse(response);
            if(result['response'] == 'success') {
                $('.favourite-idea').html(result['favourite_ideas']);
                $('.idea-history').html(result['idea_history']);
                if(!favourite_bertha_element.hasClass('favourate_added')){
                    favourite_bertha_element.addClass('favourate_added');
                    berthaFavourite.html('Favourite added');
                } else {
                    favourite_bertha_element.removeClass('favourate_added');
                    berthaFavourite.html('Add to favourite');
                }
            }
            $('#ber_quickwins_modal').find('.ber-overlay-container').hide();
        });
    });

    $(document).on('click', '.bertha_ask_report', function(e) {
        e.preventDefault();
         var modal = '<div class="ber-modal ber-fade ber_modal" id="ber_idea_report_modal" tabindex="-1" role="dialog" aria-labelledby="berIdeaTitle" aria-hidden="true"><div class="ber-modal-dialog ber-modal-dialog-centered" role="document"><div class="ber-modal-content"><div class="ber-modal-header"><div class="ber-modal-title" id="berIdeaLongTitle"><div class="ber-report-primary-title">Thanks for letting us know!</div><div class="ber-report-secondary-title">This is how we improve bertha</div></div><button type="button" class="ber-report-btn-close ber-report-close"><span aria-hidden="true">&times;</span></button></div><div class="ber-modal-body"><div class="ber_inner_title">What did you expect to happen?</div><textarea id="ber_report_body" name="ber_report_body" rows="6" cols="70"></textarea></div><div class="ber-modal-footer"><button type="button" class="ber-btn ber-btn-primary ber_report_submit" data-dismiss="ber-modal">Send a report</button></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div></div></div>';
        $('#ber_quickwins_modal').hide();
        $(top.document).find('body').append(modal);
        $(top.document).find('body #ber_idea_report_modal').show();
    });

    $(document).on('change', '.sec_title_type', function() {
        if($(this).val() == 'other') $('.other-title').show();
        else $('.other-title').hide();
    });

    $(document).on('click', '.ber_search_tag', function(e) {
        e.preventDefault();
        var template_tag = $(this).attr('data-id');
        $('.ber_search_tag').each(function() {
            $(this).removeClass('active');
        });
        $(this).addClass('active');
        $('.bertha_template').each(function() {
            if(template_tag != 'all') {
                if($(this).attr('data-id') != template_tag) $(this).closest('.ber-mb-3').hide();
                else $(this).closest('.ber-mb-3').show();

                if(template_tag == 'website' && $(this).prev('.ber-btn-check-template').attr('data-id') == 'Paragraph') $(this).closest('.ber-mb-3').show();
            } else {
                $(this).closest('.ber-mb-3').show();
            }
        });
        $('.ber_inner_title, .ber_inner_p').each(function() {
            if(template_tag != 'all') {
                if($(this).attr('data-id') != template_tag) $(this).hide();
                else $(this).show();
            }else {
                $(this).show();
            }
        });
    });

    $(document).on('click', '.bertha-dashboard-launcher, .wp-first-item, .bertha', function() {
        var templates = bertha_setup_object.free_options;
        var plugin_type = bertha_setup_object.plugin_type ? bertha_setup_object.plugin_type : '';
        if($(".ber-tab-content").find('#chat').html() == '<div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div>') {
            $(".ber-tab-content").find('#chat .ber-overlay-container').show();
            if(templates.chat_prompt_version || plugin_type == 'pro') {
                var chat = '<div class="ber-side-chat-head"><div class="ber-offcanvas-title">Chat With Me</div><button type="button" class="ber-btn bertha_sec_btn ber_chat_reset_modal" data-dismiss="ber-modal">Reset Chat</button></div><div class="ber_inner_p">You can ask me questions or have a conversation with me by typing below. I will do my best to understand and respond appropriately. Is there anything specific you would like to know or talk about?</div><div id="ber_chat_modal"><div class="ber_form"><div class="ber_form_group ber-chat-body"></div><div class="ber-chat-field"><textarea type="textarea" placeholder="Start typing to chat with Bertha..." class="ber_field" name="chatbody" access="false" id="ber_chat_body" required="required" aria-required="true" value=""></textarea></div><div class="ber_form_group bertha_backend_buttons ber_generate ber-chat-submit"><button type="button" class="ber-btn ber-btn-primary ber_half ber_chat_generate" data-dismiss="ber-modal">Comment</button></div></div><div class="ber-overlay-container"><div class="ber-loader"><div></div><div></div></div></div></div>';
            } else {
                var chat = '<div class="ber_notice"><p>This is a Premium Feature</p><p><a class="bertha_premium_upgrade" href="'+bertha_setup_object.license_page+'" target="_blank">click to upgrade</a></p></div>';
            }
            setTimeout(function() {
                $(".ber-tab-content").find('#chat').html(chat);
                $(".ber-tab-content").find('#chat .ber-overlay-container').hide();
            }, 500);
        }
    });

    $(document).on('click', '.bertha', function() {
        if($('.ber-offcanvas-end').hasClass('show') && $('body').find('.popover-body').length) {
            if(jQuery_WPF('#wpf_launcher .wpf_sidebar_container').hasClass('active')) {

                jQuery_WPF('#wpf_launcher .wpf_sidebar_container').css({"opacity": "0","margin-right": "-380px"});

                jQuery_WPF('#wpf_launcher .wpf_sidebar_container').removeClass('active');

                if(jQuery_WPF('a.wpf_filter_tab_btn_bottom.wpf_btm_withside').hasClass('wpf_active')){
                    jQuery_WPF('.wpf_list').removeClass('wpf_active').addClass('wpf_hide');
                    jQuery_WPF('a.wpf_filter_tab_btn_bottom.wpf_btm_withside').removeClass('wpf_active');

                    //graphics page
                    graphics_sidebar_active();
                }
            }
        }
    });

    /*free */
    $(document).on('click', '#ber-create-user', function(e) {
        e.preventDefault();
        var ber_free_name = $('#ber_free_name').val();
        var ber_free_email = $('#ber_free_email').val();
        var element = $(this);
        if(Is_Ber_Email(ber_free_email)==true){
            if(ber_free_email == '' || ber_free_name == '') {
                $(this).after('<div class="ber-notice-content">Please Fill All the Fields</div>')
                setTimeout(function(){
                  $('.ber-notice-content').remove();
                }, 5000);
            } else {
                $(document).find('#ber_page2_save').attr('data-email', ber_free_email);
                $(this).css('cursor', 'not-allowed');
                var data = {
                    action   : 'wa_ber_free_create_purchase',
                    ber_free_name : ber_free_name,
                    ber_free_email : ber_free_email,
                    bertha_ber_create_nonce: $('#bertha_ber_create_nonce').val()
                } 
                $.post(ajaxurl, data, function(response) {
                    if(response != 'failed') {
                        element.css('cursor', '');
                        if(response == 'false') {
                            element.after('<div class="ber-notice-content">It seems that you already have a free account, we can not sign you up for another free account.</div>')
                            setTimeout(function(){
                              $('.ber-notice-content').remove();
                            }, 5000);
                        } else {
                            $('#ber_page1').hide();
                            $('#ber_page2').show();
                            $('.bertha-free-user').val(response);
                        }
                    }
                });
            }
        } else {
            $(this).after('<div class="ber-notice-content">Invalid Email</div>')
                setTimeout(function(){
                  $('.ber-notice-content').remove();
            }, 5000);
        }
    });

    function Is_Ber_Email(email) {
       var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
       if(!regex.test(email)) {
         return false;
       }else{
         return true;
       }
    }

    $(document).on('click', '.ber_where', function() {
        $('.field_ber_where').hide();
        $('.field_ber_what').show();
        $('.ber_what_savechanges').show();
    });

    $(document).on('click', '#ber_page2_save', function(e) {
        e.preventDefault();
        var website_for = '';
        var about_website = '';
        $(this).css('cursor', 'not-allowed');
        var user_email = $(this).attr('data-email');
        $('.ber_wizzard_main').each(function() {
            var id = $(this).attr('id');
            if($('#'+id).prop("checked")) {
               var name = $(this).attr('name');
               if(name == 'ber_where') website_for = $(this).attr('value');
               if(name == 'ber_what') about_website = $(this).attr('value'); 
            }
        });
        var data = {
            action   : 'wa_ber_free_create_purchase_submit',
            website_for : website_for,
            about_website : about_website,
            free_user : $('.bertha-free-user').val(),
            bertha_ber_free_create_nonce: $('#bertha_ber_free_create_nonce').val()
        } 
        $.post(ajaxurl, data, function(response) {
            if(response == 'success') {
                $(this).css('cursor', '');
                window.location.replace(bertha_setup_object.onboard_page+'&email='+user_email);
            }
        });
    });


})(jQuery);
