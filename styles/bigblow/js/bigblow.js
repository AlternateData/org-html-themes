// bigblow.js --- BigBlow JS file
//
// Copyright (C) 2011-2016 All Right Reserved, Fabrice Niessen
//
// This file is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// This file is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// Author: Fabrice Niessen <(concat "fniessen" at-sign "pirilampo.org")>
// URL: https://github.com/fniessen/org-html-themes/
// Version: 20140515.1841

$(function() {
    $('p').
        html(function(index, old) {
            return old.replace('FIXME',
                               '<span class="fixme">FIXME</span>');
    });
    $('p').
        html(function(index, old) {
            return old.replace('XXX',
                               '<span class="fixme">XXX</span>');
    });
});

// Remove leading section number
$(function() {
    $('.section-number-2').text("");
    for (var i = 3; i <= 5; i++) {
        $('.section-number-' + i).each(function() {
            $(this).text($(this).text().replace(/^[0-9]+\./g, ""));
        });
    }
});

$(function() {
    $('<div id="minitoc" class="dontprint"></div>').prependTo('body');
});


// display tabs
function tabifySections() {

    // hide TOC (if present)
    $('#table-of-contents').hide();

    // grab the list of `h2' from the page
    var allSections = [];
    $('h2')
        .each(function() {
            // Remove TODO keywords and tags (contained in spans)
            var tabText = $(this).clone().find('span').remove().end()
                .text().trim();
            var tabId = $(this).parent().attr('id');
            if (tabText) {
                // - remove heading number (all leading digits)
                // - remove progress logging (between square brackets)
                // - remove leading and trailing spaces
                tabText = tabText.replace(/^\d+\s+/, '').replace(/\[[\d/%]+\]/, '').trim();

                allSections.push({
                    text: tabText,
                    id: tabId
                });
            }
        });

    // create the tab links
    var tabs = $('<ul id="tabs"></ul>');
    for (i = 0; i < allSections.length; i++) {
        var item = allSections[i];
        html = $('<li><a href="#' + item.id + '">' + item.text + '</a></li>');
        tabs.append(html);
    }

    // insert tabs menu after title (`h1'), or at the beginning of the content
    if($('.title').length !== 0) {
        $('.title').after(tabs);
    }
    else {
        $('#content').prepend(tabs);
    }
}

function selectTabAndScroll(href) {
    // At this point we assume that href is local (starts with #)
    // alert(href);

    // Find the tab to activate
    var targetTab = $(href).closest('.ui-tabs-panel');
    var targetTabId = targetTab.attr('id');
    var targetTabAriaLabel = targetTab.attr('aria-labelledby');

    var targetTabIndex = $("#content ul li")
        .index($('[aria-labelledby="' + targetTabAriaLabel + '"]'));

    // Activate target tab
    $('#content').tabs('option', 'active', targetTabIndex);


    // Set the location hash
    // document.location.hash = href;

    // Scroll to top if href was a tab
    if (href == '#' + targetTabId) {
        // alert(targetTabId);
        $.scrollTo(0);
    }
    // Scroll to href if href was not a tab
    else {
        $.scrollTo(href);
    }
}

$(document).ready(function() {
    $('#preamble').remove();
    $('#table-of-contents').remove();

    // Prepare for tabs
    tabifySections();

    // Build the tabs from the #content div
    $('#content').tabs();

    // Set default animation
    $('#content').tabs('option', 'show', true);


    // Required to get the link of the tab in URL
    $('#content ul').localScroll({
        target: '#content',
        duration: 0,
        hash: true
    });

    // Handle hash in URL
    if ($('#content') && document.location.hash) {
        hsExpandAnchor(document.location.hash);
        selectTabAndScroll(document.location.hash);
    }

    // Handle click on internal links
    $('.ui-tabs-panel a[href^="#"]').click(function(e) {
        var href = $(this).attr('href');
        hsExpandAnchor(href);
        selectTabAndScroll(href);
        e.preventDefault();
    });

    // Initialize hideShow
    hsInit();

    // add sticky headers to tables
    $('table').stickyTableHeaders();
});

function copyToClipboard(text)
{
    if (window.clipboardData && window.clipboardData.setData) { // Internet Explorer
        window.clipboardData.setData("Text", text);
    }
    else { // Fallback solution
        window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }
}

$(document).ready(function() {
    // Assuming that the ZeroClipboard swf file is in the same folder than bigblow,
    // get the path to it (it will be relative to the current page location).
    var bbScriptPath = $('script[src$="bigblow.js"]').attr('src');  // the js file path
    var bbPathToZeroClipboardSwf = bbScriptPath.replace('bigblow.js', 'ZeroClipboard.swf');

    // Add copy to clipboard snippets
    $('.org-src-container').prepend('<div class="snippet-copy-to-clipboard"><span class="copy-to-clipboard-button">[copy]</span></div>');

    // Display/hide snippets on source block mouseenter/mouseleave
    $(document).on('mouseenter', '.org-src-container', function () {
        $(this).find('.snippet-copy-to-clipboard').show();

        // Need to call zclip here, once the button is visible.
        // Beacause when the button is not visible, zclip does nothing.
        if ((window.location.protocol != 'file:') && ($(this).find('.zclip').length == 0)) {
            $(this).find('.copy-to-clipboard-button').zclip({
                //path: 'http://www.steamdev.com/zclip/js/ZeroClipboard.swf',
                //path: 'styles/bigblow/js/ZeroClipboard.swf',
                path: bbPathToZeroClipboardSwf,
                copy: function() {
                    return $(this).parent().parent().find('.src').text();
                }
            });
        }
    }).on('mouseleave', '.org-src-container', function () {
        $(this).find('.snippet-copy-to-clipboard').hide();
    });

    // Handle copy to clipboard (here, for a local file only 'file://...'
    if (window.location.protocol == 'file:') { // if local file use browser-specific code
        $('.copy-to-clipboard-button').click(function() {
            // Get the text to be copied
            var text = $(this).parent().parent().find('.src').text();
            text = text.replace(/\n/g, "\r\n");
            // alert(text);
            copyToClipboard(text);
        });
    }
});

$(function() {
    $('li > code :contains("[X]")')
        .parent()
            .addClass('checked')
        .end()
        .remove();
    $('li > code :contains("[-]")')
        .parent()
            .addClass('halfchecked')
        .end()
        .remove();
    $('li > code :contains("[ ]")')
        .parent()
            .addClass('unchecked')
        .end()
        .remove();
});

$(function() {
    $('i :contains("[#A]")')
        .replaceWith('<i><span style="color: #F67777;">[#A]</span></i>');
    $('i :contains("[#B]")')
        .replaceWith('<i><span style="color: #B6E864;">[#B]</span></i>');
    $('i :contains("[#C]")')
        .replaceWith('<i><span style="color: #C3DCFF;">[#C]</span></i>');
});

$(function() {
    $('<div id="toTop" class="dontprint"><span>^ Back to Top</span></div>').appendTo('body');

    $(window).scroll(function() {
        if ($(this).scrollTop() != 0) {
            $('#toTop').fadeIn();
        } else {
            $('#toTop').fadeOut();
        }
    });

    $('#toTop').click(function(e) {
        $('html, body').animate({scrollTop: 0}, 800);
        e.preventDefault();                   // Disable default browser behavior
    });
});



$(function() {
    $('.done').parent(':header').parent().find(':header').addClass('DONEheader');
    $('.done').parent(':header').parent().css({color: '#999999'});
});

$(function() {
    $('span.todo').click(function(e) {
        var orgKeyword = $(this).text().trim();
        $('.' + orgKeyword).toggleClass('selected');
        $('#content .' + orgKeyword).parent().parent()
            .toggleClass('match' + orgKeyword);
        $('#left-panel-wrapper .' + orgKeyword).parent()
            .toggleClass('match' + orgKeyword);
        e.preventDefault();
    })
});

$(function() {
    $('.tag span').click(function(e) {
        var orgTag = $(this).text().trim();
        $('.' + orgTag).toggleClass('selected');
        $('#content .' + orgTag).parent().parent().parent()
            .toggleClass('matchtag');
        $('#right-panel-wrapper .' + orgTag).parent().parent()
            .toggleClass('matchtag');
        e.preventDefault();
    })
});

function clickPreviousTab() {
    var active = $('#content').tabs('option', 'active');
    // Avoid going back to last tab
    if (active == 0) return;

    $('#content').tabs('option', 'active', active - 1);

    // Set the location href
    var href = $('#content div[aria-expanded=true]').attr('id');
    document.location.hash = href;
    $.scrollTo(0);
}

function clickNextTab() {
    var active = $('#content').tabs('option', 'active');
    $('#content').tabs('option', 'active', active + 1);

    // Set the location href
    var href = $('#content div[aria-expanded=true]').attr('id');
    document.location.hash = href;
    $.scrollTo(0);
}

function orgDefkey(e) {
    if (!e)
        var e = window.event;
    var keycode = (e.keyCode) ? e.keyCode : e.which;
    var actualkey = String.fromCharCode(keycode);
    switch (actualkey) {
        case "n": // next
            clickNextTab();
            break;
        case "p": // previous
            clickPreviousTab();
            break;
        // case "b": // scroll down - should be mapped to Shift-SPC
        //     $(window).scrollTop($(window).scrollTop()-$(window).height());
        //     break;
        case "<": // scroll to top
            $(window).scrollTop(0);
            break;
        case ">": // scroll to bottom
            $(window).scrollTop($(document).height());
            break;
        case "-": // collapse all
            hsCollapseAll();
            break;
        case "+": // expand all
            hsExpandAll();
            break;
        case "r": // go to next task
            hsReviewTaskNext();
            break;
        case "R": // go to previous task
            hsReviewTaskPrev();
            break;
        case "q": // quit reviewing
            hsReviewTaskQuit();
            break;
        case "g": // refresh the page (from the server, rather than the cache)
            location.reload(true);
            break;
    }
}

document.onkeypress = orgDefkey;
