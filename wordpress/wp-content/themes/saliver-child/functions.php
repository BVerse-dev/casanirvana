<?php

/**
 * Child Theme
 * 
 * @author Bravis-Themes
 * @since 1.0.1
 */
 
function saliver_child_enqueue_styles(){
    $parent_style = 'pxl-style'; 
    wp_enqueue_style('pxl-style-child', get_stylesheet_directory_uri() . '/style.css', array(
        $parent_style
    ));
}
add_action( 'wp_enqueue_scripts', 'saliver_child_enqueue_styles', 99);

