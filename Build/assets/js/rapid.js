// GENERAL
/*!
 * Modernizr v2.6.3
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.3',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /*! HTML5 Shiv v3.6.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
    ;(function(window, document) {
    /*jshint evil:true */
      /** Preset options */
      var options = window.html5 || {};

      /** Used to skip problem elements */
      var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

      /** Not all elements can be cloned in IE **/
      var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

      /** Detect whether the browser supports default html5 styles */
      var supportsHtml5Styles;

      /** Name of the expando, to work with multiple documents or to re-shiv one document */
      var expando = '_html5shiv';

      /** The id for the the documents expando */
      var expanID = 0;

      /** Cached data for each document */
      var expandoData = {};

      /** Detect whether the browser supports unknown elements */
      var supportsUnknownElements;

      (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
        } catch(e) {
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());

      /*--------------------------------------------------------------------------*/

      /**
       * Creates a style sheet with the given CSS text and adds it to the document.
       * @private
       * @param {Document} ownerDocument The document.
       * @param {String} cssText The CSS text.
       * @returns {StyleSheet} The style element.
       */
      function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

      /**
       * Returns the value of `html5.elements` as an array.
       * @private
       * @returns {Array} An array of shived element node names.
       */
      function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

        /**
       * Returns the data associated to the given document
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Object} An object of data.
       */
      function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
      }

      /**
       * returns a shived element for the given nodeName and document
       * @memberOf html5
       * @param {String} nodeName name of the element
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived element.
       */
      function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

        // Avoid adding some elements to fragments in IE < 9 because
        // * Attributes like `name` or `type` cannot be set/changed once an element
        //   is inserted into a document/fragment
        // * Link elements with `src` attributes that are inaccessible, as with
        //   a 403 response, will cause the tab/window to crash
        // * Script elements appended to fragments will execute when their `src`
        //   or `text` property is set
        return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
      }

      /**
       * returns a shived DocumentFragment for the given document
       * @memberOf html5
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived DocumentFragment.
       */
      function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
      }

      /**
       * Shivs the `createElement` and `createDocumentFragment` methods of the document.
       * @private
       * @param {Document|DocumentFragment} ownerDocument The document.
       * @param {Object} data of the document.
       */
      function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
          //abort shiv
          if (!html5.shivMethods) {
              return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
          'var n=f.cloneNode(),c=n.createElement;' +
          'h.shivMethods&&(' +
            // unroll the `createElement` calls
            getElements().join().replace(/\w+/g, function(nodeName) {
              data.createElem(nodeName);
              data.frag.createElement(nodeName);
              return 'c("' + nodeName + '")';
            }) +
          ');return n}'
        )(html5, data.frag);
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Shivs the given document.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
      function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
            // corrects block display not defined in IE6/7/8/9
            'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
            // adds styling not present in IE6/7/8/9
            'mark{background:#FF0;color:#000}'
          );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }

      /*--------------------------------------------------------------------------*/

      /**
       * The `html5` object is exposed so that more elements can be shived and
       * existing shiving can be detected on iframes.
       * @type Object
       * @example
       *
       * // options can be changed before the script is included
       * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
       */
      var html5 = {

        /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

        /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
        'shivCSS': (options.shivCSS !== false),

        /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
        'shivMethods': (options.shivMethods !== false),

        /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
        'type': 'default',

        // shivs the document according to the specified `html5` object options
        'shivDocument': shivDocument,

        //creates a shived element
        createElement: createElement,

        //creates a shived documentFragment
        createDocumentFragment: createDocumentFragment
      };

      /*--------------------------------------------------------------------------*/

      // expose html5
      window.html5 = html5;

      // shiv the document
      shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

(function($,sr){
 
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null; 
          };
 
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
 
          timeout = setTimeout(delayed, threshold || 250); 
      };
  }
	// smartresize 
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');


/*
TSR - PRODUCT AND SERVICE LISTING
*/ 


;(function(document,$) {


    window.tsrProductAndServiceListing = window.tsrProductAndServiceListing || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrProductAndServiceListing.tsrInit = function() {
     
     	tsrProductAndServiceListing.tsrEqualHeights();	

    };


  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrProductAndServiceListing.tsrEqualHeights = function () {


	   var toBeCalculated = $('.tsr-section-productAndService-listing');

		if (toBeCalculated != null && toBeCalculated.length > 0) {
			for (var i = 0; i < toBeCalculated.length; i++) {
				var bw = $('body').width();
				var el = toBeCalculated[i];

				if (bw >= 600) {
					// Product 
					$('.tsr-product-header', el).css('height', 'auto').setAllToMaxHeight();
					$('.tsr-product-colors', el).css('height', 'auto').setAllToMaxHeight();
					$('.tsr-product-desc', el).css('height', 'auto').setAllToMaxHeight();
					$('.tsr-product-price', el).css('height', 'auto').setAllToMaxHeight();
					$('.tsr-product-small-print', el).css('height', 'auto').setAllToMaxHeight();
				} else {
					// Product 
					$('.tsr-product-header', el).css('height', 'auto');
					$('.tsr-product-colors', el).css('height', 'auto');
					$('.tsr-product-desc', el).css('height', 'auto');
					$('.tsr-product-price', el).css('height', 'auto');
					$('.tsr-product-small-print', el).css('height', 'auto');
				}
			}
		}

    };



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrProductAndServiceListing.tsrInit();
      
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Scroll
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('scroll', function(){
            
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Resize
/////////////////////////////////////////////////////////////////////////////////////////////////////////


	// jquery.debouncing.js, thanks Paul Irish

    $(window).smartresize(function(){
  		tsrProductAndServiceListing.tsrEqualHeights();	
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////


	
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// ! jQuery UI - v1.10.3 - 2013-05-03
// http://jqueryui.com
// Copyright 2013 jQuery Foundation and other contributors; Licensed MIT */
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// Dependencie for selectBoxIt.js
(function(e,t){var i=0,s=Array.prototype.slice,n=e.cleanData;e.cleanData=function(t){for(var i,s=0;null!=(i=t[s]);s++)try{e(i).triggerHandler("remove")}catch(a){}n(t)},e.widget=function(i,s,n){var a,r,o,h,l={},u=i.split(".")[0];i=i.split(".")[1],a=u+"-"+i,n||(n=s,s=e.Widget),e.expr[":"][a.toLowerCase()]=function(t){return!!e.data(t,a)},e[u]=e[u]||{},r=e[u][i],o=e[u][i]=function(e,i){return this._createWidget?(arguments.length&&this._createWidget(e,i),t):new o(e,i)},e.extend(o,r,{version:n.version,_proto:e.extend({},n),_childConstructors:[]}),h=new s,h.options=e.widget.extend({},h.options),e.each(n,function(i,n){return e.isFunction(n)?(l[i]=function(){var e=function(){return s.prototype[i].apply(this,arguments)},t=function(e){return s.prototype[i].apply(this,e)};return function(){var i,s=this._super,a=this._superApply;return this._super=e,this._superApply=t,i=n.apply(this,arguments),this._super=s,this._superApply=a,i}}(),t):(l[i]=n,t)}),o.prototype=e.widget.extend(h,{widgetEventPrefix:r?h.widgetEventPrefix:i},l,{constructor:o,namespace:u,widgetName:i,widgetFullName:a}),r?(e.each(r._childConstructors,function(t,i){var s=i.prototype;e.widget(s.namespace+"."+s.widgetName,o,i._proto)}),delete r._childConstructors):s._childConstructors.push(o),e.widget.bridge(i,o)},e.widget.extend=function(i){for(var n,a,r=s.call(arguments,1),o=0,h=r.length;h>o;o++)for(n in r[o])a=r[o][n],r[o].hasOwnProperty(n)&&a!==t&&(i[n]=e.isPlainObject(a)?e.isPlainObject(i[n])?e.widget.extend({},i[n],a):e.widget.extend({},a):a);return i},e.widget.bridge=function(i,n){var a=n.prototype.widgetFullName||i;e.fn[i]=function(r){var o="string"==typeof r,h=s.call(arguments,1),l=this;return r=!o&&h.length?e.widget.extend.apply(null,[r].concat(h)):r,o?this.each(function(){var s,n=e.data(this,a);return n?e.isFunction(n[r])&&"_"!==r.charAt(0)?(s=n[r].apply(n,h),s!==n&&s!==t?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):t):e.error("no such method '"+r+"' for "+i+" widget instance"):e.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+r+"'")}):this.each(function(){var t=e.data(this,a);t?t.option(r||{})._init():e.data(this,a,new n(r,this))}),l}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,s){s=e(s||this.defaultElement||this)[0],this.element=e(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),s!==this&&(e.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===s&&this.destroy()}}),this.document=e(s.style?s.ownerDocument:s.document||s),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(i,s){var n,a,r,o=i;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof i)if(o={},n=i.split("."),i=n.shift(),n.length){for(a=o[i]=e.widget.extend({},this.options[i]),r=0;n.length-1>r;r++)a[n[r]]=a[n[r]]||{},a=a[n[r]];if(i=n.pop(),s===t)return a[i]===t?null:a[i];a[i]=s}else{if(s===t)return this.options[i]===t?null:this.options[i];o[i]=s}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var a,r=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=a=e(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,a=this.widget()),e.each(n,function(n,o){function h(){return i||r.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof o?r[o]:o).apply(r,arguments):t}"string"!=typeof o&&(h.guid=o.guid=o.guid||h.guid||e.guid++);var l=n.match(/^(\w+)\s*(.*)$/),u=l[1]+r.eventNamespace,c=l[2];c?a.delegate(c,u,h):s.bind(u,h)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function i(){return("string"==typeof e?s[e]:e).apply(s,arguments)}var s=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,s){var n,a,r=this.options[t];if(s=s||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],a=i.originalEvent)for(n in a)n in i||(i[n]=a[n]);return this.element.trigger(i,s),!(e.isFunction(r)&&r.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(s,n,a){"string"==typeof n&&(n={effect:n});var r,o=n?n===!0||"number"==typeof n?i:n.effect||i:t;n=n||{},"number"==typeof n&&(n={duration:n}),r=!e.isEmptyObject(n),n.complete=a,n.delay&&s.delay(n.delay),r&&e.effects&&e.effects.effect[o]?s[t](n):o!==t&&s[o]?s[o](n.duration,n.easing,a):s.queue(function(i){e(this)[t](),a&&a.call(s[0]),i()})}})})(jQuery);


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// - jquery.selectBoxIt.js - Author: @gregfranko */
/////////////////////////////////////////////////////////////////////////////////////////////////////////

!function (a) { "use strict"; a(window.jQuery, window, document) }(function (a, b, c, d) { "use strict"; a.widget("selectBox.selectBoxIt", { VERSION: "3.6.0", options: { showEffect: "none", showEffectOptions: {}, showEffectSpeed: "medium", hideEffect: "none", hideEffectOptions: {}, hideEffectSpeed: "medium", showFirstOption: !0, defaultText: "", defaultIcon: "", downArrowIcon: "", theme: "default", keydownOpen: !0, isMobile: function () { var a = navigator.userAgent || navigator.vendor || b.opera; return /iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(a) }, "native": !1, aggressiveChange: !1, selectWhenHidden: !0, viewport: a(b), similarSearch: !1, copyAttributes: ["title", "rel"], copyClasses: "button", nativeMousedown: !1, customShowHideEvent: !1, autoWidth: !0, html: !0, populate: "", dynamicPositioning: !0, hideCurrent: !1 }, getThemes: function () { var b = this, c = a(b.element).attr("data-theme") || "c"; return { bootstrap: { focus: "active", hover: "", enabled: "enabled", disabled: "disabled", arrow: "caret", button: "btn", list: "dropdown-menu", container: "bootstrap", open: "open" }, jqueryui: { focus: "ui-state-focus", hover: "ui-state-hover", enabled: "ui-state-enabled", disabled: "ui-state-disabled", arrow: "ui-icon ui-icon-triangle-1-s", button: "ui-widget ui-state-default", list: "ui-widget ui-widget-content", container: "jqueryui", open: "selectboxit-open" }, jquerymobile: { focus: "ui-btn-down-" + c, hover: "ui-btn-hover-" + c, enabled: "ui-enabled", disabled: "ui-disabled", arrow: "ui-icon ui-icon-arrow-d ui-icon-shadow", button: "ui-btn ui-btn-icon-right ui-btn-corner-all ui-shadow ui-btn-up-" + c, list: "ui-btn ui-btn-icon-right ui-btn-corner-all ui-shadow ui-btn-up-" + c, container: "jquerymobile", open: "selectboxit-open" }, "default": { focus: "selectboxit-focus", hover: "selectboxit-hover", enabled: "selectboxit-enabled", disabled: "selectboxit-disabled", arrow: "icon icon-arrow-down", button: "selectboxit-btn", list: "selectboxit-list", container: "selectboxit-container", open: "selectboxit-open" } } }, isDeferred: function (b) { return a.isPlainObject(b) && b.promise && b.done }, _create: function (b) { var d = this, e = d.options.populate; if (d.element.is("select")) return d.widgetProto = a.Widget.prototype, d.originalElem = d.element[0], d.selectBox = d.element, d.options.populate && d.add && !b && d.add(e), d.selectItems = d.element.find("option"), d.firstSelectItem = d.selectItems.slice(0, 1), d.documentHeight = a(c).height(), d.theme = d.getThemes()[d.options.theme] || d.getThemes()["default"], d.currentFocus = 0, d.blur = !0, d.textArray = [], d.currentIndex = 0, d.currentText = "", d.flipped = !1, b || (d.selectBoxStyles = d.selectBox.attr("style")), d._createDropdownButton()._createUnorderedList()._copyAttributes()._replaceSelectBox()._addClasses(d.theme)._eventHandlers(), d.originalElem.disabled && d.disable && d.disable(), d._ariaAccessibility && d._ariaAccessibility(), d.isMobile = d.options.isMobile(), d._mobile && d._mobile(), d.options["native"] && this._applyNativeSelect(), d.triggerEvent("create"), d }, _createDropdownButton: function () { var b = this, c = b.originalElemId = b.originalElem.id || "", d = b.originalElemValue = b.originalElem.value || "", e = b.originalElemName = b.originalElem.name || "", f = b.options.copyClasses, g = b.selectBox.attr("class") || ""; return b.dropdownText = a("<span/>", { id: c && c + "SelectBoxItText", "class": "selectboxit-text", unselectable: "on", text: b.firstSelectItem.text() }).attr("data-val", d), b.dropdownImageContainer = a("<span/>", { "class": "selectboxit-option-icon-container" }), b.dropdownImage = a("<i/>", { id: c && c + "SelectBoxItDefaultIcon", "class": "selectboxit-default-icon", unselectable: "on" }), b.dropdown = a("<span/>", { id: c && c + "SelectBoxIt", "class": "selectboxit " + ("button" === f ? g : "") + " " + (b.selectBox.prop("disabled") ? b.theme.disabled : b.theme.enabled), name: e, tabindex: b.selectBox.attr("tabindex") || "0", unselectable: "on" }).append(b.dropdownImageContainer.append(b.dropdownImage)).append(b.dropdownText), b.dropdownContainer = a("<span/>", { id: c && c + "SelectBoxItContainer", "class": "selectboxit-container " + ("container" === f ? g : "") }).append(b.dropdown), b }, _createUnorderedList: function () { var b, c, d, e, f, g, h, i, j, k, l, m = this, n = "", o = m.originalElemId || "", p = a("<ul/>", { id: o && o + "SelectBoxItOptions", "class": "selectboxit-options", tabindex: -1 }); if (m.options.showFirstOption || (m.selectItems.first().attr("disabled", "disabled"), m.selectItems = m.selectBox.find("option").slice(1)), m.selectItems.each(function (o) { c = "", d = "", b = a(this).prop("disabled"), e = a(this).attr("data-icon") || "", f = a(this).attr("data-iconurl") || "", g = f ? "selectboxit-option-icon-url" : "", h = f ? "style=\"background-image:url('" + f + "');\"" : "", i = a(this).attr("data-selectedtext"), j = a(this).attr("data-text"), k = j ? j : a(this).text(), l = a(this).parent(), l.is("optgroup") && (c = "selectboxit-optgroup-option", 0 === a(this).index() && (d = '<span class="selectboxit-optgroup-header ' + l.first().attr("class") + '"data-disabled="true">' + l.first().attr("label") + "</span>")), n += d + '<li id="' + o + '" data-val="' + this.value + '" data-disabled="' + b + '" class="' + c + " selectboxit-option " + (a(this).attr("class") || "") + '"><a class="selectboxit-option-anchor"><span class="selectboxit-option-icon-container"><i class="selectboxit-option-icon ' + e + " " + (g || m.theme.container) + '"' + h + "></i></span>" + (m.options.html ? k : m.htmlEscape(k)) + "</a></li>", m.textArray[o] = b ? "" : k, this.selected && (m._setText(m.dropdownText, i || k), m.currentFocus = o) }), m.options.defaultText || m.selectBox.attr("data-text")) { var q = m.options.defaultText || m.selectBox.attr("data-text"); m._setText(m.dropdownText, q), m.options.defaultText = q } return p.append(n), m.list = p, m.dropdownContainer.append(m.list), m.listItems = m.list.find("li"), m.listAnchors = m.list.find("a"), m.listItems.first().addClass("selectboxit-option-first"), m.listItems.last().addClass("selectboxit-option-last"), m.list.find("li[data-disabled='true']").not(".optgroupHeader").addClass(m.theme.disabled), m.dropdownImage.addClass(m.selectBox.attr("data-icon") || m.options.defaultIcon || m.listItems.eq(m.currentFocus).find("i").attr("class")), m.dropdownImage.attr("style", m.listItems.eq(m.currentFocus).find("i").attr("style")), m }, _replaceSelectBox: function () { var b, c = this, e = c.originalElem.id || "", f = c.selectBox.attr("data-size"), g = c.listSize = f === d ? "auto" : "0" === f ? "auto" : +f; return c.selectBox.css("display", "none").after(c.dropdownContainer), b = c.dropdown.height(), c.downArrow = a("<i/>", { id: e && e + "SelectBoxItArrow", "class": "selectboxit-arrow", unselectable: "on" }), c.downArrowContainer = a("<span/>", { id: e && e + "SelectBoxItArrowContainer", "class": "selectboxit-arrow-container", unselectable: "on" }).append(c.downArrow), c.dropdown.append(c.downArrowContainer), c.listItems.removeClass("selectboxit-selected").eq(c.currentFocus).addClass("selectboxit-selected"), c._realOuterWidth(c.dropdownImageContainer) || c.dropdownImageContainer.remove(), c.options.autoWidth && (c.dropdown.is(":visible") ? c.dropdown.css({ width: "auto" }).css({ width: c.list.outerWidth(!0) + c.downArrowContainer.outerWidth(!0) + c.dropdownImage.outerWidth(!0) }) : c.dropdown.css({ width: "auto" }).css({ width: c._realOuterWidth(c.list) + c._realOuterWidth(c.downArrowContainer) + c._realOuterWidth(c.dropdownImage) }), c.list.css({ "min-width": c.dropdown.width() })), c.dropdownText.css({ "max-width": c.dropdownContainer.width() - (c.downArrowContainer.outerWidth(!0) + c.dropdownImage.outerWidth(!0)) }), "number" === a.type(g) && (c.maxHeight = c.listAnchors.outerHeight(!0) * g), c }, _scrollToView: function (a) { var b = this, c = b.listItems.eq(b.currentFocus), d = b.list.scrollTop(), e = c.height(), f = c.position().top, g = Math.abs(f), h = b.list.height(); return "search" === a ? e > h - f ? b.list.scrollTop(d + (f - (h - e))) : -1 > f && b.list.scrollTop(f - e) : "up" === a ? -1 > f && b.list.scrollTop(d - g) : "down" === a && e > h - f && b.list.scrollTop(d + (g - h + e)), b }, _callbackSupport: function (b) { var c = this; return a.isFunction(b) && b.call(c, c.dropdown), c }, _setText: function (a, b) { var c = this; return c.options.html ? a.html(b) : a.text(b), c }, open: function (a) { var b = this, c = b.options.showEffect, d = b.options.showEffectSpeed, e = b.options.showEffectOptions, f = b.options["native"], g = b.isMobile; return !b.listItems.length || b.dropdown.hasClass(b.theme.disabled) ? b : (f || g || this.list.is(":visible") || (b.triggerEvent("open"), b._dynamicPositioning && b.options.dynamicPositioning && b._dynamicPositioning(), "none" === c ? b.list.show() : "show" === c || "slideDown" === c || "fadeIn" === c ? b.list[c](d) : b.list.show(c, e, d), b.list.promise().done(function () { b._scrollToView("search") })), b._callbackSupport(a), b) }, close: function (a) { var b = this, c = b.options.hideEffect, d = b.options.hideEffectSpeed, e = b.options.hideEffectOptions, f = b.options["native"], g = b.isMobile; return f || g || !b.list.is(":visible") || (b.triggerEvent("close"), "none" === c ? b.list.hide() : "hide" === c || "slideUp" === c || "fadeOut" === c ? b.list[c](d) : b.list.hide(c, e, d)), b._callbackSupport(a), b }, toggle: function () { var a = this, b = a.list.is(":visible"); b ? a.close() : b || a.open() }, _keyMappings: { 38: "up", 40: "down", 13: "enter", 8: "backspace", 9: "tab", 32: "space", 27: "esc" }, _keydownMethods: function () { var a = this, b = a.list.is(":visible") || !a.options.keydownOpen; return { down: function () { a.moveDown && b && a.moveDown() }, up: function () { a.moveUp && b && a.moveUp() }, enter: function () { var b = a.listItems.eq(a.currentFocus); a._update(b), "true" !== b.attr("data-preventclose") && a.close(), a.triggerEvent("enter") }, tab: function () { a.triggerEvent("tab-blur"), a.close() }, backspace: function () { a.triggerEvent("backspace") }, esc: function () { a.close() } } }, _eventHandlers: function () { var b, c, d = this, e = d.options.nativeMousedown, f = d.options.customShowHideEvent, g = d.focusClass, h = d.hoverClass, i = d.openClass; return this.dropdown.on({ "click.selectBoxIt": function () { d.dropdown.trigger("focus", !0), d.originalElem.disabled || (d.triggerEvent("click"), e || f || d.toggle()) }, "mousedown.selectBoxIt": function () { a(this).data("mdown", !0), d.triggerEvent("mousedown"), e && !f && d.toggle() }, "mouseup.selectBoxIt": function () { d.triggerEvent("mouseup") }, "blur.selectBoxIt": function () { d.blur && (d.triggerEvent("blur"), d.close(), a(this).removeClass(g)) }, "focus.selectBoxIt": function (b, c) { var e = a(this).data("mdown"); a(this).removeData("mdown"), e || c || setTimeout(function () { d.triggerEvent("tab-focus") }, 0), c || (a(this).hasClass(d.theme.disabled) || a(this).addClass(g), d.triggerEvent("focus")) }, "keydown.selectBoxIt": function (a) { var b = d._keyMappings[a.keyCode], c = d._keydownMethods()[b]; c && (c(), !d.options.keydownOpen || "up" !== b && "down" !== b || d.open()), c && "tab" !== b && a.preventDefault() }, "keypress.selectBoxIt": function (a) { var b = a.charCode || a.keyCode, c = d._keyMappings[a.charCode || a.keyCode], e = String.fromCharCode(b); d.search && (!c || c && "space" === c) && d.search(e, !0, !0), "space" === c && a.preventDefault() }, "mouseenter.selectBoxIt": function () { d.triggerEvent("mouseenter") }, "mouseleave.selectBoxIt": function () { d.triggerEvent("mouseleave") } }), d.list.on({ "mouseover.selectBoxIt": function () { d.blur = !1 }, "mouseout.selectBoxIt": function () { d.blur = !0 } }), d.list.on({ "click.selectBoxIt": function () { d._update(a(this)), d.triggerEvent("option-click"), "false" === a(this).attr("data-disabled") && "true" !== a(this).attr("data-preventclose") && d.close() }, "focusin.selectBoxIt": function () { d.listItems.not(a(this)).removeAttr("data-active"), a(this).attr("data-active", ""); var b = d.list.is(":hidden"); (d.options.searchWhenHidden && b || d.options.aggressiveChange || b && d.options.selectWhenHidden) && d._update(a(this)), a(this).add(a(this).find(".selectboxit-option-anchor")).addClass(g) }, "mouseup.selectBoxIt": function () { e && !f && (d._update(a(this)), d.triggerEvent("option-mouseup"), "false" === a(this).attr("data-disabled") && "true" !== a(this).attr("data-preventclose") && d.close()) }, "mouseenter.selectBoxIt": function () { "false" === a(this).attr("data-disabled") && (d.listItems.removeAttr("data-active"), a(this).addClass(g).attr("data-active", ""), d.listItems.not(a(this)).add(d.listAnchors.not(a(this).find(".selectboxit-option-anchor"))).removeClass(g), a(this).add(a(this).find(".selectboxit-option-anchor")).addClass(g), d.currentFocus = +a(this).attr("id")) }, "mouseleave.selectBoxIt": function () { "false" === a(this).attr("data-disabled") && (d.listItems.not(a(this)).removeClass(g).removeAttr("data-active"), a(this).add(a(this).find(".selectboxit-option-anchor")).addClass(g), d.currentFocus = +a(this).attr("id")) }, "blur.selectBoxIt": function () { a(this).add(a(this).find(".selectboxit-option-anchor")).removeClass(g) } }, ".selectboxit-option"), d.list.on({ "click.selectBoxIt": function (a) { a.preventDefault() } }, "a"), d.selectBox.on({ "change.selectBoxIt, internal-change.selectBoxIt": function (a, e) { var f, g; e || (f = d.list.find('li[data-val="' + d.originalElem.value + '"]'), f.length && (d.listItems.eq(d.currentFocus).removeClass(d.focusClass), d.currentFocus = +f.attr("id"))), f = d.listItems.eq(d.currentFocus), g = f.attr("data-selectedtext"), b = f.attr("data-text"), c = b ? b : f.find("a").text(), d._setText(d.dropdownText, g || c), d.dropdownText.attr("data-val", d.originalElem.value), f.find("i").attr("class") && (d.dropdownImage.attr("class", f.find("i").attr("class")).addClass("selectboxit-default-icon"), d.dropdownImage.attr("style", f.find("i").attr("style"))), d.triggerEvent("changed") }, "disable.selectBoxIt": function () { d.dropdown.addClass(d.theme.disabled) }, "enable.selectBoxIt": function () { d.dropdown.removeClass(d.theme.disabled) }, "open.selectBoxIt": function () { var a, b = d.list.find("li[data-val='" + d.dropdownText.attr("data-val") + "']"); b.length || (b = d.listItems.not("[data-disabled=true]").first()), d.currentFocus = +b.attr("id"), a = d.listItems.eq(d.currentFocus), d.dropdown.addClass(i).removeClass(h).addClass(g), d.listItems.removeClass(d.selectedClass).removeAttr("data-active").not(a).add(d.listAnchors.not(a.find(".selectboxit-option-anchor"))).removeClass(g), a.addClass(d.selectedClass).add(a.find(".selectboxit-option-anchor")).addClass(g), d.options.hideCurrent && (d.listItems.show(), a.hide()) }, "close.selectBoxIt": function () { d.dropdown.removeClass(i) }, "blur.selectBoxIt": function () { d.dropdown.removeClass(g) }, "mouseenter.selectBoxIt": function () { a(this).hasClass(d.theme.disabled) || d.dropdown.addClass(h) }, "mouseleave.selectBoxIt": function () { d.dropdown.removeClass(h) }, destroy: function (a) { a.stopPropagation() } }), d }, _update: function (a) { var b, c, d, e = this, f = e.options.defaultText || e.selectBox.attr("data-text"), g = e.listItems.eq(e.currentFocus); "false" === a.attr("data-disabled") && (b = e.listItems.eq(e.currentFocus).attr("data-selectedtext"), c = g.attr("data-text"), d = c ? c : g.text(), (f && e.options.html ? e.dropdownText.html() === f : e.dropdownText.text() === f) && e.selectBox.val() === a.attr("data-val") ? e.triggerEvent("change") : (e.selectBox.val(a.attr("data-val")), e.currentFocus = +a.attr("id"), e.originalElem.value !== e.dropdownText.attr("data-val") && e.triggerEvent("change"))) }, _addClasses: function (a) { var b = this, c = (b.focusClass = a.focus, b.hoverClass = a.hover, a.button), d = a.list, e = a.arrow, f = a.container; return b.openClass = a.open, b.selectedClass = "selectboxit-selected", b.downArrow.addClass(b.selectBox.attr("data-downarrow") || b.options.downArrowIcon || e), b.dropdownContainer.addClass(f), b.dropdown.addClass(c), b.list.addClass(d), b }, refresh: function (a, b) { var c = this; return c._destroySelectBoxIt()._create(!0), b || c.triggerEvent("refresh"), c._callbackSupport(a), c }, htmlEscape: function (a) { return String(a).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }, triggerEvent: function (a) { var b = this, c = b.options.showFirstOption ? b.currentFocus : b.currentFocus - 1 >= 0 ? b.currentFocus : 0; return b.selectBox.trigger(a, { selectbox: b.selectBox, selectboxOption: b.selectItems.eq(c), dropdown: b.dropdown, dropdownOption: b.listItems.eq(b.currentFocus) }), b }, _copyAttributes: function () { var a = this; return a._addSelectBoxAttributes && a._addSelectBoxAttributes(), a }, _realOuterWidth: function (a) { if (a.is(":visible")) return a.outerWidth(!0); var b, c = a.clone(); return c.css({ visibility: "hidden", display: "block", position: "absolute" }).appendTo("body"), b = c.outerWidth(!0), c.remove(), b } }); var e = a.selectBox.selectBoxIt.prototype; e.add = function (b, c) { this._populate(b, function (b) { var d, e, f = this, g = a.type(b), h = 0, i = [], j = f._isJSON(b), k = j && f._parseJSON(b); if (b && ("array" === g || j && k.data && "array" === a.type(k.data)) || "object" === g && b.data && "array" === a.type(b.data)) { for (f._isJSON(b) && (b = k), b.data && (b = b.data), e = b.length; e - 1 >= h; h += 1) d = b[h], a.isPlainObject(d) ? i.push(a("<option/>", d)) : "string" === a.type(d) && i.push(a("<option/>", { text: d, value: d })); f.selectBox.append(i) } else b && "string" === g && !f._isJSON(b) ? f.selectBox.append(b) : b && "object" === g ? f.selectBox.append(a("<option/>", b)) : b && f._isJSON(b) && a.isPlainObject(f._parseJSON(b)) && f.selectBox.append(a("<option/>", f._parseJSON(b))); return f.dropdown ? f.refresh(function () { f._callbackSupport(c) }, !0) : f._callbackSupport(c), f }) }, e._parseJSON = function (b) { return JSON && JSON.parse && JSON.parse(b) || a.parseJSON(b) }, e._isJSON = function (a) { var b, c = this; try { return b = c._parseJSON(a), !0 } catch (d) { return !1 } return c }, e._populate = function (b, c) { var d = this; return b = a.isFunction(b) ? b.call() : b, d.isDeferred(b) ? b.done(function (a) { c.call(d, a) }) : c.call(d, b), d }, e._ariaAccessibility = function () { var b = this; return b.dropdown.attr({ role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false", "aria-owns": b.list.attr("id"), "aria-activedescendant": b.listItems.eq(b.currentFocus).length ? b.listItems.eq(b.currentFocus)[0].id : "", "aria-label": a("label[for='" + b.originalElem.id + "']").text() || "", "aria-live": "assertive" }).on({ "disable.selectBoxIt": function () { b.dropdown.attr("aria-disabled", "true") }, "enable.selectBoxIt": function () { b.dropdown.attr("aria-disabled", "false") } }), b.list.attr({ role: "listbox", "aria-hidden": "true" }), b.listItems.attr({ role: "option" }), b.selectBox.on({ "change.selectBoxIt": function () { b.dropdownText.attr("aria-label", b.originalElem.value) }, "open.selectBoxIt": function () { b.list.attr("aria-hidden", "false"), b.dropdown.attr("aria-expanded", "true") }, "close.selectBoxIt": function () { b.list.attr("aria-hidden", "true"), b.dropdown.attr("aria-expanded", "false") } }), b }, e._addSelectBoxAttributes = function () { var b = this; return b._addAttributes(b.selectBox.prop("attributes"), b.dropdown), b.selectItems.each(function (c) { b._addAttributes(a(this).prop("attributes"), b.listItems.eq(c)) }), b }, e._addAttributes = function (b, c) { var d = this, e = d.options.copyAttributes; return b.length && a.each(b, function (b, d) { var f = d.name.toLowerCase(), g = d.value; "null" === g || -1 === a.inArray(f, e) && -1 === f.indexOf("data") || c.attr(f, g) }), d }, e.destroy = function (a) { var b = this; return b._destroySelectBoxIt(), b.widgetProto.destroy.call(b), b._callbackSupport(a), b }, e._destroySelectBoxIt = function () { var b = this; return b.dropdown.off(".selectBoxIt"), a.contains(b.dropdownContainer[0], b.originalElem) && b.dropdownContainer.before(b.selectBox), b.dropdownContainer.remove(), b.selectBox.removeAttr("style").attr("style", b.selectBoxStyles), b.selectBox.show(), b.triggerEvent("destroy"), b }, e.disable = function (a) { var b = this; return b.options.disabled || (b.close(), b.selectBox.attr("disabled", "disabled"), b.dropdown.removeAttr("tabindex").removeClass(b.theme.enabled).addClass(b.theme.disabled), b.setOption("disabled", !0), b.triggerEvent("disable")), b._callbackSupport(a), b }, e.disableOption = function (b, c) { var d, e, f, g = this, h = a.type(b); return "number" === h && (g.close(), d = g.selectBox.find("option").eq(b), g.triggerEvent("disable-option"), d.attr("disabled", "disabled"), g.listItems.eq(b).attr("data-disabled", "true").addClass(g.theme.disabled), g.currentFocus === b && (e = g.listItems.eq(g.currentFocus).nextAll("li").not("[data-disabled='true']").first().length, f = g.listItems.eq(g.currentFocus).prevAll("li").not("[data-disabled='true']").first().length, e ? g.moveDown() : f ? g.moveUp() : g.disable())), g._callbackSupport(c), g }, e._isDisabled = function () { var a = this; return a.originalElem.disabled && a.disable(), a }, e._dynamicPositioning = function () { var b = this; if ("number" === a.type(b.listSize)) b.list.css("max-height", b.maxHeight || "none"); else { var c = b.dropdown.offset().top, d = b.list.data("max-height") || b.list.outerHeight(), e = b.dropdown.outerHeight(), f = b.options.viewport, g = f.height(), h = a.isWindow(f.get(0)) ? f.scrollTop() : f.offset().top, i = g + h >= c + e + d, j = !i; if (b.list.data("max-height") || b.list.data("max-height", b.list.outerHeight()), j) if (b.dropdown.offset().top - h >= d) b.list.css("max-height", d), b.list.css("top", b.dropdown.position().top - b.list.outerHeight()); else { var k = Math.abs(c + e + d - (g + h)), l = Math.abs(b.dropdown.offset().top - h - d); l > k ? (b.list.css("max-height", d - k - e / 2), b.list.css("top", "auto")) : (b.list.css("max-height", d - l - e / 2), b.list.css("top", b.dropdown.position().top - b.list.outerHeight())) } else b.list.css("max-height", d), b.list.css("top", "auto") } return b }, e.enable = function (a) { var b = this; return b.options.disabled && (b.triggerEvent("enable"), b.selectBox.removeAttr("disabled"), b.dropdown.attr("tabindex", 0).removeClass(b.theme.disabled).addClass(b.theme.enabled), b.setOption("disabled", !1), b._callbackSupport(a)), b }, e.enableOption = function (b, c) { var d, e = this, f = a.type(b); return "number" === f && (d = e.selectBox.find("option").eq(b), e.triggerEvent("enable-option"), d.removeAttr("disabled"), e.listItems.eq(b).attr("data-disabled", "false").removeClass(e.theme.disabled)), e._callbackSupport(c), e }, e.moveDown = function (a) { var b = this; b.currentFocus += 1; var c = "true" === b.listItems.eq(b.currentFocus).attr("data-disabled") ? !0 : !1, d = b.listItems.eq(b.currentFocus).nextAll("li").not("[data-disabled='true']").first().length; if (b.currentFocus === b.listItems.length) b.currentFocus -= 1; else { if (c && d) return b.listItems.eq(b.currentFocus - 1).blur(), b.moveDown(), void 0; c && !d ? b.currentFocus -= 1 : (b.listItems.eq(b.currentFocus - 1).blur().end().eq(b.currentFocus).focusin(), b._scrollToView("down"), b.triggerEvent("moveDown")) } return b._callbackSupport(a), b }, e.moveUp = function (a) { var b = this; b.currentFocus -= 1; var c = "true" === b.listItems.eq(b.currentFocus).attr("data-disabled") ? !0 : !1, d = b.listItems.eq(b.currentFocus).prevAll("li").not("[data-disabled='true']").first().length; if (-1 === b.currentFocus) b.currentFocus += 1; else { if (c && d) return b.listItems.eq(b.currentFocus + 1).blur(), b.moveUp(), void 0; c && !d ? b.currentFocus += 1 : (b.listItems.eq(this.currentFocus + 1).blur().end().eq(b.currentFocus).focusin(), b._scrollToView("up"), b.triggerEvent("moveUp")) } return b._callbackSupport(a), b }, e._setCurrentSearchOption = function (a) { var b = this; return (b.options.aggressiveChange || b.options.selectWhenHidden || b.listItems.eq(a).is(":visible")) && b.listItems.eq(a).data("disabled") !== !0 && (b.listItems.eq(b.currentFocus).blur(), b.currentIndex = a, b.currentFocus = a, b.listItems.eq(b.currentFocus).focusin(), b._scrollToView("search"), b.triggerEvent("search")), b }, e._searchAlgorithm = function (a, b) { var c, d, e, f, g = this, h = !1, i = g.textArray, j = g.currentText; for (c = a, e = i.length; e > c; c += 1) { for (f = i[c], d = 0; e > d; d += 1) -1 !== i[d].search(b) && (h = !0, d = e); if (h || (g.currentText = g.currentText.charAt(g.currentText.length - 1).replace(/[|()\[{.+*?$\\]/g, "\\$0"), j = g.currentText), b = new RegExp(j, "gi"), j.length < 3) { if (b = new RegExp(j.charAt(0), "gi"), -1 !== f.charAt(0).search(b)) return g._setCurrentSearchOption(c), (f.substring(0, j.length).toLowerCase() !== j.toLowerCase() || g.options.similarSearch) && (g.currentIndex += 1), !1 } else if (-1 !== f.search(b)) return g._setCurrentSearchOption(c), !1; if (f.toLowerCase() === g.currentText.toLowerCase()) return g._setCurrentSearchOption(c), g.currentText = "", !1 } return !0 }, e.search = function (a, b, c) { var d = this; c ? d.currentText += a.replace(/[|()\[{.+*?$\\]/g, "\\$0") : d.currentText = a.replace(/[|()\[{.+*?$\\]/g, "\\$0"); var e = d._searchAlgorithm(d.currentIndex, new RegExp(d.currentText, "gi")); return e && d._searchAlgorithm(0, d.currentText), d._callbackSupport(b), d }, e._applyNativeSelect = function () { var a, b, c, d = this; d.dropdownContainer.append(d.selectBox), d.selectBox.css({ display: "block", visibility: "visible", width: d.dropdown.outerWidth(), height: d.dropdown.outerHeight(), opacity: "0", position: "absolute", top: "0", left: "0", cursor: "pointer", "z-index": "999999", margin: d.dropdown.css("margin"), padding: "0", "-webkit-appearance": "menulist-button" }).on({ "changed.selectBoxIt": function () { a = d.selectBox.find("option").filter(":selected"), b = a.attr("data-text"), c = b ? b : a.text(), d._setText(d.dropdownText, c), d.list.find('li[data-val="' + a.val() + '"]').find("i").attr("class") && d.dropdownImage.attr("class", d.list.find('li[data-val="' + a.val() + '"]').find("i").attr("class")).addClass("selectboxit-default-icon"), d.triggerEvent("option-click") } }) }, e._mobile = function () { var a = this; return a.isMobile && a._applyNativeSelect(), this }, e.remove = function (b, c) { var d, e, f = this, g = a.type(b), h = 0, i = ""; if ("array" === g) { for (e = b.length; e - 1 >= h; h += 1) d = b[h], "number" === a.type(d) && (i += i.length ? ", option:eq(" + d + ")" : "option:eq(" + d + ")"); f.selectBox.find(i).remove() } else "number" === g ? f.selectBox.find("option").eq(b).remove() : f.selectBox.find("option").remove(); return f.dropdown ? f.refresh(function () { f._callbackSupport(c) }, !0) : f._callbackSupport(c), f }, e.selectOption = function (b, c) { var d = this, e = a.type(b); return "number" === e ? d.selectBox.val(d.selectItems.eq(b).val()).change() : "string" === e && d.selectBox.val(b).change(), d._callbackSupport(c), d }, e.setOption = function (b, c, d) { var e = this; return "string" === a.type(b) && (e.options[b] = c), e.refresh(function () { e._callbackSupport(d) }, !0), e }, e.setOptions = function (b, c) { var d = this; return a.isPlainObject(b) && (d.options = a.extend({}, d.options, b)), d.refresh(function () { d._callbackSupport(c) }, !0), d }, e.wait = function (a, b) { var c = this; return c.widgetProto._delay.call(c, b, a), c } });


/////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
TSR - FORMS
*/ 

/////////////////////////////////////////////////////////////////////////////////////////////////////////


;(function(document,$) {

    window.tsrForms = window.tsrForms || {};


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrForms.tsrInit = function() {
         
         tsrForms.tsrSelect();
         tsrForms.tsrCheckbox();
         tsrForms.tsrRadio();

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Select
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrForms.tsrSelect = function () {

	   	if (!$("html").hasClass("touch")) {
	         $(".tsr-forms select").selectBoxIt({ downArrowIcon: "icon icon-arrow-down" });
	    } else if ($("html").hasClass("touch")) {
	        $(".tsr-forms select").selectBoxIt({ downArrowIcon: "icon icon-arrow-down", "native": true });
	    }

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Checkbox
/////////////////////////////////////////////////////////////////////////////////////////////////////////

tsrForms.tsrCheckbox = function ($wrapper) {

 $('.tsr-forms input:checkbox', $wrapper).each(function () {

   var elem = $(this);
   var label = elem.parent();

   if (elem.is(':checked')) {
    label.addClass('checked');
   }

   if (elem.is(':disabled')) {
    label.addClass('disabled');
   }

   label.addClass('tsr-checkbox');
    if (!label.has("span.tsr-checkboxStyled").length) {
        label.prepend('<span class="tsr-checkboxStyled icon icon-thick">&nbsp;</span>');
       }


   label.not('.disabled').change(function () {

    var el = $(this);
    var check = el.children('input');

    if (el.hasClass('checked')) {
     el.removeClass('checked');
     check.each(function () {
      $(this).attr("checked", false);
     });

    } else {
     el.addClass('checked');
     check.each(function () {
      $(this).attr("checked", true);
     });

    }

    return false;
   });


  });

 };

  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Radio
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrForms.tsrRadio = function ($wrapper) {


	    $('.tsr-forms input:radio', $wrapper).each(function () {

	        var elem = $(this);
	        var label = elem.parent();

	        if (elem.is(':checked')) {
	            label.addClass('checked');
	        }

	       	if (elem.is(':disabled')) {
	            label.addClass('disabled');
	        }

	        label.addClass('tsr-radio');
	        label.prepend('<span class="tsr-radioStyled">&nbsp;</span>');
	        label.not('.disabled').on('mousedown',function () {

                    var el = $(this);
                    
                    if (el.is(".disabled")) return false;
                    
	            var radio = el.children('input');

	            var radioName = radio.attr('name');

	            $('input:radio[name="' + radioName + '"]').prop('checked', false).parent().removeClass('checked');

	                radio.prop('checked', true);
	                el.addClass('checked')

	            return false;
	        });


	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrForms.tsrInit();
      
    });


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////



// SLIDER STUFF
/*
 * jQuery FlexSlider v2.2.0
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

  //FlexSlider: Object Instance
  $.flexslider = function(el, options, instanceId) {
    var slider = $(el);

    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // depricating this idea, as devices are being released with both of these events
        //eventType = (touch) ? "touchend" : "click",
        eventType = "click touchend MSPointerUp",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = (slider.vars.itemWidth > 0),
        fade = slider.vars.animation === "fade",
        asNav = slider.vars.asNavFor !== "",
        methods = {},
        focused = true;

    var instanceId = ( typeof instanceId !== 'undefined' ) ? instanceId++ : 0

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.id = instanceId;
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt( ( slider.vars.startAt ? slider.vars.startAt : 0) );
        if ( isNaN( slider.currentSlide ) ) slider.currentSlide = 0;
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0,slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") slider.vars.animation = "swing";
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) methods.controlNav.setup();

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.setup();

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup' + slider.vars.eventNamespace + "-" + slider.id, function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                           (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel' + slider.vars.eventNamespace, function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) methods.pausePlay.setup();

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) methods.pauseInvisible.init();

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) slider.pause();
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) slider.play();
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if(!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }

        // ASNAV:
        if (asNav) methods.asNav.setup();

        // TOUCH
        if (touch && slider.vars.touch) methods.touch();

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) $(window).bind("resize" + slider.vars.eventNamespace + "-" + slider.id + " orientationchange" + slider.vars.eventNamespace + "-" + slider.id + " focus" + slider.vars.eventNamespace + "-" + slider.id, methods.resize);

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function(){
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if(!msGesture){
              slider.slides.on("click" + slider.vars.eventNamespace, function(e){
                e.preventDefault();
                var $slide = $(this),
                    target = $slide.index();
                var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                if( posFromLeft <= 0 && $slide.hasClass( namespace + 'active-slide' ) ) {
                  slider.flexAnimate(slider.getTarget("prev"), true);
                } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
          }else{
              el._slider = slider;
              slider.slides.each(function (){
                  var that = this;
                  that._gesture = new MSGesture();
                  that._gesture.target = that;
                  that.addEventListener("MSPointerDown", function (e){
                      e.preventDefault();
                      if(e.currentTarget._gesture)
                          e.currentTarget._gesture.addPointer(e.pointerId);
                  }, false);
                  that.addEventListener("MSGestureTap", function (e){
                      e.preventDefault();
                      var $slide = $(this),
                          target = $slide.index();
                      if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                          slider.direction = (slider.currentItem < target) ? "next" : "prev";
                          slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                      }
                  });
              });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item,
              slide;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr( 'data-thumb' ) + '"/>' : '<a>' + j + '</a>';
              if ( 'thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions ) {
                var captn = slide.attr( 'data-thumbcaption' );
                if ( '' != captn && undefined != captn ) item += '<span class="' + namespace + 'caption">' + captn + '</span>';
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if(!msGesture){
            el.addEventListener('touchstart', onTouchStart, false);

            function onTouchStart(e) {
              if (slider.animating) {
                e.preventDefault();
              } else if ( ( window.navigator.msPointerEnabled ) || e.touches.length === 1 ) {
                slider.pause();
                // CAROUSEL:
                cwidth = (vertical) ? slider.h : slider. w;
                startT = Number(new Date());
                // CAROUSEL:

                // Local vars for X and Y points.
                localX = e.touches[0].pageX;
                localY = e.touches[0].pageY;

                offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                         (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                         (carousel && slider.currentSlide === slider.last) ? slider.limit :
                         (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                         (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                startX = (vertical) ? localY : localX;
                startY = (vertical) ? localX : localY;

                el.addEventListener('touchmove', onTouchMove, false);
                el.addEventListener('touchend', onTouchEnd, false);
              }
            }

            function onTouchMove(e) {
              // Local vars for X and Y points.

              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              dx = (vertical) ? startX - localY : startX - localX;
              scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

              var fxms = 500;

              if ( ! scrolling || Number( new Date() ) - startT > fxms ) {
                e.preventDefault();
                if (!fade && slider.transitions) {
                  if (!slider.vars.animationLoop) {
                    dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
                  }
                  slider.setProps(offset + dx, "setTouch");
                }
              }else{
                //gesture is not related to slider direction, ignore it
                el.removeEventListener('touchmove', onTouchMove, false);
              }
            }

            function onTouchEnd(e) {
              // finish the touch by undoing the touch session
              el.removeEventListener('touchmove', onTouchMove, false);

              if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                var updateDx = (reverse) ? -dx : dx,
                    target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                } else {
                  if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
              el.removeEventListener('touchend', onTouchEnd, false);

              startX = null;
              startY = null;
              dx = null;
              offset = null;
            }
        }else{
            el.style.msTouchAction = "none";
            el._gesture = new MSGesture();
            el._gesture.target = el;
            el.addEventListener("MSPointerDown", onMSPointerDown, false);
            el._slider = slider;
            el.addEventListener("MSGestureChange", onMSGestureChange, false);
            el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

            function onMSPointerDown(e){
                e.stopPropagation();
                if (slider.animating) {
                    e.preventDefault();
                }else{
                    slider.pause();
                    el._gesture.addPointer(e.pointerId);
                    accDx = 0;
                    cwidth = (vertical) ? slider.h : slider. w;
                    startT = Number(new Date());
                    // CAROUSEL:

                    offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                        (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                            (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                    (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                }
            }

            function onMSGestureChange(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                var transX = -e.translationX,
                    transY = -e.translationY;

                //Accumulate translations.
                accDx = accDx + ((vertical) ? transY : transX);
                dx = accDx;
                scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                if(e.detail === e.MSGESTURE_FLAG_INERTIA){
                    setImmediate(function (){
                        el._gesture.stop();
                    });

                    return;
                }

                if (!scrolling || Number(new Date()) - startT > 500) {
                    e.preventDefault();
                    if (!fade && slider.transitions) {
                        if (!slider.vars.animationLoop) {
                            dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                        }
                        slider.setProps(offset + dx, "setTouch");
                    }
                }
            }

            function onMSGestureEnd(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                    var updateDx = (reverse) ? -dx : dx,
                        target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                    if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    } else {
                        if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                    }
                }

                startX = null;
                startY = null;
                dx = null;
                offset = null;
                accDx = 0;
            }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) slider.doMath();

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var prefixes = ['webkit','moz','ms','o'];

          if ('hidden' in document) return 'hidden';
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document) 
            methods.pauseInvisible.visProp = prefixes[i] + 'Hidden';
          }
          if (methods.pauseInvisible.visProp) {
            var evtname = methods.pauseInvisible.visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if(slider.startTimeout) clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                else slider.pause(); //Or just pause
              }
              else {
                if(slider.started) slider.play(); //Initiated before, just play
                else (slider.vars.initDelay > 0) ? setTimeout(slider.play, slider.vars.initDelay) : slider.play(); //Didn't init before: simply init or wait for it
              }
            });
          }       
        },
        isHidden: function() {
          return document[methods.pauseInvisible.visProp] || false;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    }

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) slider.pause();

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) methods.sync("animate");

        // CONTROLNAV
        if (slider.vars.controlNav) methods.controlNav.active();

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) methods.directionNav.update();

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) slider.pause();
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            slider.container.unbind("webkitTransitionEnd" + slider.vars.eventNamespace + " transitionend" + slider.vars.eventNamespace);
+            slider.container.bind("webkitTransitionEnd" + slider.vars.eventNamespace + " transitionend" + slider.vars.eventNamespace, function() {
              slider.wrapup(dimension);
            });
          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
            //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

            slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight(slider.vars.animationSpeed);
      }
    }
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    }

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused ) slider.flexAnimate(slider.getTarget("next"));
    }
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("play");
      // SYNC:
      if (slider.syncExists) methods.sync("pause");
    }
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) clearInterval(slider.animatedSlides);
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) methods.pausePlay.update("pause");
      // SYNC:
      if (slider.syncExists) methods.sync("play");
    }
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    }
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (slider.vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    }
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    }

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());

            return (posCalc * -1) + "px";
          }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) slider.container.css(slider.args);
    }

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") slider.container.find('.clone').remove();
          slider.container.append(slider.slides.first().clone().addClass('clone').attr('aria-hidden', 'true')).prepend(slider.slides.last().clone().addClass('clone').attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
            slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) methods.smoothHeight();
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) methods.smoothHeight();
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
    }


    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport===undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w/(slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    }


    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) methods.directionNav.update();

    }

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    }
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    }

    slider.destroy = function() {
      var classNamespace = '.' + slider.vars.namespace; // Namespaced class selector
      if (slider.vars.controlNav) slider.controlNav.closest(classNamespace + 'control-nav').remove(); // Remove control elements if present
      if (slider.vars.directionNav) slider.directionNav.closest(classNamespace + 'direction-nav').remove(); // Remove direction-nav elements if present
      if (slider.vars.pausePlay) slider.pausePlay.closest(classNamespace + 'pauseplay').remove(); // Remove pauseplay elements if present
      slider.find('.clone').remove(); // Remove any flexslider clones
      slider.unbind(slider.vars.eventNamespace); // Remove events on slider
      if ( slider.vars.animation != "fade" ) slider.container.unwrap(); // Remove the .flex-viewport div
      slider.container.removeAttr('style') // Remove generated CSS (could collide with 3rd parties)
      slider.container.unbind(slider.vars.eventNamespace); // Remove events on slider
      slider.slides.removeAttr('style'); // Remove generated CSS (could collide with 3rd parties)
      slider.slides.filter(classNamespace + 'active-slide').removeClass(slider.vars.namespace + 'active-slide'); // Remove slide active class
      slider.slides.unbind(slider.vars.eventNamespace); // Remove events on slides
      $(document).unbind(slider.vars.eventNamespace + "-" + slider.id); // Remove events from document for this instance only
      $(window).unbind(slider.vars.eventNamespace + "-" + slider.id); // Remove events from window for this instance only 
      slider.stop(); // Stop the interval
      slider.removeData('flexslider'); // Remove data
    }

    //FlexSlider: Initialize
    methods.init();
  }

  // Ensure the slider isn't focussed if the window loses focus.
  $( window ).blur( function ( e ) {
    focused = false;
  }).focus( function ( e ) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    eventNamespace: '.flexslider',   //{NEW} String: Event namespace string attached to all element events generated by the plugin. The period at the start of the string is required.
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order
    thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true,   		//{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each clide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){}           //{NEW} Callback: function(slider) - Fires after a slide is removed
  }

  var instanceId = 0;

  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) options = {};

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

      if ( ( $slides.length === 1 && options.allowOneSlide === true ) || $slides.length === 0 ) {
          $slides.fadeIn(400);
          if (options.start) options.start($this);
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options, instanceId++);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "stop": $slider.stop(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        case "destroy": $slider.destroy(); break;
        default: if (typeof options === "number") $slider.flexAnimate(options, true);
      }
    }
  }
})(jQuery);



/*
TSR - CAROUSEL LISTING
*/ 


;(function(document,$) {


    window.tsrCarouselListing = window.tsrCarouselListing || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCarouselListing.tsrInit = function() {
	
     	tsrCarouselListing.tsrEqualHeights();
     	tsrCarouselListing.tsrCarouselInit();
     	
    };


  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR JQUERY FN - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrCarouselListing.tsrEqualHeights = function () {


	    $('.tsr-section-carousel-listing').each(function () {

	    	var bw = $('body').width();
	        var el = $(this);
	        var itemHeight 	= $('.tsr-slides > a' , this).outerHeight() - 1 ;

		    if(bw >= 600){
			
				// Service 
		      	$('.tsr-service-desc' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-service-price' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-service-header', this).css('height', 'auto').setAllToMaxHeight()﻿;

				// Product 
		      	$('.tsr-product-header', this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-colors', this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-desc' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-price' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-small-print' , this).css('height', 'auto').setAllToMaxHeight()﻿;

		    } else {

		    	// Service 
	      		$('.tsr-service-desc' , this).css('height', 'auto');
		      	$('.tsr-service-price' , this).css('height', 'auto');
		      	$('.tsr-service-header', this).css('height', 'auto');
 
				// Product 
		      	$('.tsr-product-header', this).css('height', 'auto');
		      	$('.tsr-product-colors', this).css('height', 'auto');
		      	$('.tsr-product-desc' , this).css('height', 'auto');
		      	$('.tsr-product-price' , this).css('height', 'auto');
		      	$('.tsr-product-small-print' , this).css('height', 'auto');
		      	
		    }



			//console.log('item height equal: ' + itemHeight);

	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel Init 
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCarouselListing.tsrCarouselInit = function () {


	    $('.tsr-section-carousel-listing').each(function () {

			var item 		= $('.tsr-slides > a' , this);
			var totalWidth = 0;
			
			// Calc width
			$(item).each(function() {
			    totalWidth += $(this).outerWidth( true );
			    
			});
			
			// New carousel instance
			var carousel = new CarouselController($(this), totalWidth);

	    }); // Each END


    }; // Func END



/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel controller
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	function CarouselController(target, totalWidth) {
		var self 			= this;
		self.fireCarousel 	= true;
		self.el 			= $(target);
		self.section 		= $(target);
		self.item 			= $('.tsr-slides > a' , target);
		self.itemHeight 	= $('.tsr-slides > a' , target).outerHeight() - 1 ;
		self.container 		= $('.container'  , target);
		self.totalWidth  	= totalWidth;

		// Onload
		self.onWindowResize();
		
		// Resize
		$(window).smartresize(function(){
			self.onWindowResize.apply(self);
		});

	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel conditions 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	CarouselController.prototype.onWindowResize = function() {
		var self = this;
		var bw = $('body').width();
		
		if(bw >= 767 ){

			if(bw <= self.totalWidth + 30) {

				if(self.fireCarousel){

					self.container.height(self.itemHeight + 11);
					self.section.addClass('tsr-slider-init');
					self.container.width('100%');

					// Do the flex
			  		self.container.flexslider({
				        animation: "slide",
				        namespace: "tsr-",
				        selector: ".tsr-slides > a", 
				        animationLoop: false,
				        slideshow: false, 
				        itemWidth: 240,
				        itemMargin: 0,
				        minItems: 2,
				        maxItems: 12,
				        controlNav: false,              
						directionNav: true,             
						prevText: "",           
						nextText: "",
				        
				     });
			  		
		  			self.fireCarousel = false;

		  		}
				
			} else {
				 
				
				 if(!self.fireCarousel){
				 	self.fireCarousel = true;
				 	self.container.flexslider('destroy');
				 	$('.tsr-control-nav', this).remove();
				 	self.section.removeClass('tsr-slider-init');
				 }
				 
				 self.container.width(self.totalWidth + 24);
				 self.container.height(self.itemHeight);

			}

		} else { 
				
				 if(!self.fireCarousel){
				 	self.fireCarousel = true;
				 	self.container.flexslider('destroy');
				 	self.section.removeClass('tsr-slider-init');
				 	$('.tsr-control-nav', this).remove();
				 }
				 
				self.container.width('100%');
				self.container.height('auto');

		}

	} // Func END



	
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Load
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(window).on('load', function(){

       tsrCarouselListing.tsrInit();
      
    });


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////




/*
TSR - CAROUSEL LISTING
*/ 


;(function(document,$) {


    window.tsrCarouselListing = window.tsrCarouselListing || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCarouselListing.tsrInit = function() {
	
     	tsrCarouselListing.tsrEqualHeights();
     	tsrCarouselListing.tsrCarouselInit();
     	
    };


  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR JQUERY FN - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrCarouselListing.tsrEqualHeights = function () {


	    $('.tsr-carousel-listing-div').each(function () {

	    	var bw = $('body').width();
	        var el = $(this);
	        var itemHeight 	= $('.tsr-slides > div' , this).outerHeight() - 1 ;

		    if(bw >= 600){
			
		      	$('.ee-special-price', this).css('height', 'auto').setAllToMaxHeight()﻿;

				// Product 
		      	$('.tsr-product-header', this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-colors', this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-desc' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-price' , this).css('height', 'auto').setAllToMaxHeight()﻿;
		      	$('.tsr-product-small-print' , this).css('height', 'auto').setAllToMaxHeight()﻿;

		    } else {

		      	$('.ee-special-price', this).css('height', 'auto');
 
				// Product 
		      	$('.tsr-product-header', this).css('height', 'auto');
		      	$('.tsr-product-colors', this).css('height', 'auto');
		      	$('.tsr-product-desc' , this).css('height', 'auto');
		      	$('.tsr-product-price' , this).css('height', 'auto');
		      	$('.tsr-product-small-print' , this).css('height', 'auto');
		      	
		    }



			//console.log('item height equal: ' + itemHeight);

	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel Init 
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCarouselListing.tsrCarouselInit = function () {


	    $('.tsr-carousel-listing-div').each(function () {

			var item 		= $('.tsr-slides > div' , this);
			var totalWidth = 0;
			
			// Calc width
			$(item).each(function() {
			    totalWidth += $(this).outerWidth( true );
			    
			});
			
			// New carousel instance
			var carousel = new CarouselController($(this), totalWidth);

	    }); // Each END


    }; // Func END



/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel controller
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	function CarouselController(target, totalWidth) {
		var self 			= this;
		self.fireCarousel 	= true;
		self.el 			= $(target);
		self.section 		= $(target);
		self.item 			= $('.tsr-slides > div' , target);
		self.itemHeight 	= $('.tsr-slides > div' , target).outerHeight() - 1 ;
		self.container 		= $('.container'  , target);
		self.totalWidth  	= totalWidth;

		// Onload
		self.onWindowResize();
		
		// Resize
		$(window).smartresize(function(){
			self.onWindowResize.apply(self);
		});

	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel conditions 
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	CarouselController.prototype.onWindowResize = function() {
		var self = this;
		var bw = $('body').width();
		
		if(bw >= 767 ){

			if(bw <= self.totalWidth + 30) {

				if(self.fireCarousel){

					self.container.height(self.itemHeight + 11);
					self.section.addClass('tsr-slider-init');
					self.container.width('100%');

					// Do the flex
			  		self.container.flexslider({
				        animation: "slide",
				        namespace: "tsr-",
				        selector: ".tsr-slides > div", 
				        animationLoop: false,
				        slideshow: false, 
				        itemWidth: 240,
				        itemMargin: 0,
				        minItems: 2,
				        maxItems: 12,
				        controlNav: false,              
						directionNav: true,             
						prevText: "",           
						nextText: "",
				        
				     });
			  		
		  			self.fireCarousel = false;

		  		}
				
			} else {
				 
				
				 if(!self.fireCarousel){
				 	self.fireCarousel = true;
				 	self.container.flexslider('destroy');
				 	$('.tsr-control-nav', this).remove();
				 	self.section.removeClass('tsr-slider-init');
				 }
				 
				 self.container.width(self.totalWidth + 24);
				 self.container.height(self.itemHeight);

			}

		} else { 
				
				 if(!self.fireCarousel){
				 	self.fireCarousel = true;
				 	self.container.flexslider('destroy');
				 	self.section.removeClass('tsr-slider-init');
				 	$('.tsr-control-nav', this).remove();
				 }
				 
				self.container.width('100%');
				self.container.height('auto');

		}

	} // Func END



	
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Load
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(window).on('load', function(){

       tsrCarouselListing.tsrInit();
      
    });


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////



// BOOTSTRAP GENERAL PIECE BY PIECE
/* ========================================================================
 * Bootstrap: transition.js v3.0.3
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition'    : 'transitionend',
      'OTransition'      : 'oTransitionEnd otransitionend',
      'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.0.3
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.0.3
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.3
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).focus()
  }

  function clearMenus(e) {
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.3
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);


// ELION HEADQUARTER
// applay function screen onchanged
function OnResize() {
    this.init = function (c, t) {
        var previousWidth = window.innerWidth;
        window.onresize = function () {
            if (window.innerWidth != previousWidth) {
                clearTimeout(t);
                t = setTimeout(function () {
                    for (var i = reCallFuncs.length - 1; i >= 0; i--) {
                        reCallFuncs[i].call();
                    }
                }, 500);
            }
            previousWidth = window.innerWidth;
        };
        return c;
    };
}



//scroll page to top
function scrollPageTop(){
    $('[data-toggle="scroll-up"]').click(function(){
        $('html,body').animate({
             scrollTop: 0
        }, 1000);
    });
}

// create custom element
function createCustomElement(array){
    for(var _i=0; _i < array.length; _i++){
        document.createElement(array[_i]);
    }
}

// return client screen width
function getScreenWidth(){
	var w=Math.max(document.documentElement.clientWidth,window.innerWidth||0);
	return w;
}

// return client screen height
/*function getScreenHeight(){
    var h=Math.max(document.documentElement.clientHeight,window.innerHeight||0);
    return h;
}*/
 // get element height
function getElementH(el){
    var height = $(el).find('.dropdown-menu').height();
    return height;
}

// make a element full screen width
function fullSizeElement(){
    var _el = $('.full-size');
    if(_el.length < 1) return;
    _el.attr('style','');// reset left value
    var _pos = _el.offset(), _leftpx = _pos.left*(-1);
    _el.css({ width : document.body.clientWidth+'px', left:_leftpx, position:'relative' });    
}

// stop propagation utility for dropdown menu
function stopPropagation(){
    $(".dropdown-menu").on("click", "[data-stopPropagation]", function(e) {
        e.stopPropagation();
    });

    $('.stoppropagation').click(function(e){
        e.stopPropagation();
    });
}

var reCallFuncs = [];
(function() {

    'use strict';
    function main() {

        scrollPageTop();
        createCustomElement(['header','footer']);
        stopPropagation();
        fullSizeElement();

        reDrawVisual();//if screen changed redraw visual

    }

    main();

}());

function reDrawVisual() {
    var oR = new OnResize();
    oR.init();
}

(function() {

    'use strict';

    function header() {
        
        // handle main nav top margin
        $('header > .navbar .dropdown').on('shown.bs.dropdown', function () {
            if(Modernizr.mq('only screen and (min-width: 768px)')) {
                $('.navbar:nth-child(2)').css({marginTop:(getElementH($(this))+20)+'px'});
                $('section.content, section.hero').css({marginTop:0+'px'});
            }
        });
        $('header > .navbar .dropdown').on('hide.bs.dropdown', function () {
            $('.navbar:nth-child(2)').css({marginTop:0+'px'});
            $('section.content, section.hero').css({marginTop:0+'px'});
        });

        // handle content top margin
        $('#collapsibleMainMenu-Pages .dropdown').on('shown.bs.dropdown', function () {
            if(Modernizr.mq('only screen and (min-width: 768px)')) {
                $('.navbar:nth-child(2)').css({marginTop:0+'px'});
                if( $('section.hero').length > 0 ) $('section.hero').css({marginTop:(getElementH($(this))+20)+'px'});
                else $('section.content').css({marginTop:(getElementH($(this))+20)+'px'});
            }
        });
        $('#collapsibleMainMenu-Pages .dropdown').on('hide.bs.dropdown', function () {
            $('section.content, section.hero, .navbar:nth-child(2)').css({marginTop:0+'px'});
        });

        // animated drop down
        /*$('.dropdown-toggle').click(function() { 
            $(this).next('.dropdown-menu').slideToggle(500, function(){
                $('content').css({marginTop:(getElementH($('#collapsibleMainMenu-Pages .dropdown'))+20)+'px'});
            }); 
        });*/

        collapseOtherContent();
        collapsableMenuForMobile();
        initDropMenu();
        cloneThirdLevelMenu();

        // close all mainmenu opened layers and content top margin when screen size changed
        var closeAllOpenLayersResetContentMargin = function(){
            $('#collapsibleMainMenu-Pages .dropdown').removeClass('open');
            
            // console.log( $('.navbar:nth-child(2) a.navbar-toggle.active'), $('.navbar:nth-child(2) a.navbar-toggle.active').attr('href'));
            var _selector = $('.navbar:nth-child(2) a.navbar-toggle.active').attr('href');
            if( _selector != '#collapsibleMainMenu-Pages') {
                $(_selector).collapse('hide');
            }
            //$('.navbar:nth-child(2) .navbar-toggle').attr('href');
            $('.navbar:nth-child(2)').css({marginTop:0+'px'});
            $('section.content, section.hero').css({marginTop:0+'px'});
            $('section.content, section.hero, .navbar:nth-child(2)').css({marginTop:0+'px'});

        };
        reCallFuncs.push(closeAllOpenLayersResetContentMargin,collapsableMenuForMobile);
    }
    
    function collapsableMenuForMobile(){
        if(Modernizr.mq('only screen and (max-width: 767px)')) {
            $('.list-group .has-child > h6').each(function() {
                var _parent = $(this).parent();
                this.addEventListener('click', function(e) {
                    $(this).parent().toggleClass('open');
                    var _el = $(this).parent().parent().find('li.has-child');

                    for (var i = _el.length - 1; i >= 0; i--) {
                        if( $(this).parent()[0] != _el[i] ) {
                            $(_el[i]).removeClass('open');
                        }
                    }

                    e.stopPropagation();
                    e.preventDefault();
                }, false);
            });  
        }

    }

    /**
        Generating third menu from main menu
    */
    function cloneThirdLevelMenu(){
        var _thrd = $('#collapsibleMainMenu-Pages').find('.navbar-nav').eq(0).find('li.active .dropdown-header');
        var _level3 = $('<nav class="sub-menu hidden-xs" />');
        
        _level3.append($('<div class="container"><h3 class="sr-only">Alamlehed</h3><ul class="list-inline"/></div>'));

        var _list= _level3.find('ul');           
        $.each(_thrd,function(){
            var _a = $(this).find('a').clone();
            _list.append($('<li />').append(_a));

        });

        $('nav.navbar.navbar-default').after(_level3); 
    }

    
    function collapseOtherContent(){
        var _elDrop = $('header div[id*="collapsibleMainMenu"]');
        _elDrop.on('show.bs.collapse', function (e) {
           
            if( $('[id^="collapsibleMainMenu-"]').hasClass('in') ){
                $('[id^="collapsibleMainMenu-"]').removeClass('in').addClass('collapse');
                $('[href*="collapsibleMainMenu-"]').removeClass('active');
            }
          
            $('header .navbar-header').find('[href*="'+this.id+'"]').addClass('active');

        });
        _elDrop.on('shown.bs.collapse', function (e) {
           // drop code here
        });
        _elDrop.on('hidden.bs.collapse', function (e) {
            $('header .navbar-header').find('[href*="'+this.id+'"]').removeClass('active');
        });
    }

    // 
    function initDropMenu() {
        if(Modernizr.mq('only screen and (max-width: 767px)')) {
            var _activeEl;
            $('header .collapsibleMainMenu h2:not(.title)').each(function(i, el) {
                var _el = $(el);
                _el.click(function(e){

                    $(this).toggleClass('active');
                    $(this).next().toggleClass('active');

                    if( ( _activeEl ) && _activeEl[0] != $(this)[0]) {
                        _activeEl.removeClass('active');
                        _activeEl.next().removeClass('active');    
                    }
                    _activeEl = $(this);
                    e.preventDefault();
                });
            });  
        }
    }
    
    header();

}());
(function() {

    'use strict';

    function footer() {

        // footer links
        if(Modernizr.mq('only screen and (max-width: 767px)')) {
            var _activeEl;
            $('footer h2').each(function(i, el) {
                var _el = $(el);
				_el.click(function(e){

                    $(this).toggleClass('active');
                    $(this).next().toggleClass('active');

                    if( ( _activeEl ) && _activeEl[0] != $(this)[0]) {
                        _activeEl.removeClass('active');
                        _activeEl.next().removeClass('active');    
                    }
                    _activeEl = $(this);
					e.preventDefault();
				});
            });  
        }
        // social block
		$('.social-block .media > a , footer .list-group > .list-group-item > a').each(function(i, el){
			var _link = $(el).attr('href');
			$(el).parent().click(function(){
                document.location.href=_link;
			});
		});
    }

    footer();
    
}());
;(function($, window, document, undefined) {
  
    'use strict';

    function init() {
        $('.alert').each(function(i, el){
            if( $(el).data('toggle') ) {
                $(el).find('.read-more').click(function(e){
                    $(this).hide();
                    $(el).closest('.alert').toggleClass('in');
                    e.preventDefault();
                });

            }
        });
    }

    init();

})(jQuery, window, document);

// 2nd LEVEL
/* =========================================================
 * bootstrap-slider.js v3.0.0
 * http://www.eyecon.ro/bootstrap-slider
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
(function( $ ) {

	var ErrorMsgs = {
		formatInvalidInputErrorMsg : function(input) {
			return "Invalid input value '" + input + "' passed in";
		},
		callingContextNotSliderInstance : "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
	};

	var Slider = function(element, options) {
		var el = this.element = $(element).hide();
		var origWidth =  $(element)[0].style.width;

		var updateSlider = false;
		var parent = this.element.parent();


		if (parent.hasClass('slider') === true) {
			updateSlider = true;
			this.picker = parent;
		} else {
			this.picker = $('<div class="slider">'+
								'<div class="slider-track">'+
									'<div class="slider-selection"></div>'+
									'<div class="slider-handle"></div>'+
									'<div class="slider-handle"></div>'+
								'</div>'+
								'<div id="tooltip" class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'+
								'<div id="tooltip_min" class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'+
								'<div id="tooltip_max" class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'+
							'</div>')
								.insertBefore(this.element)
								.append(this.element);
		}

		this.id = this.element.data('slider-id')||options.id;
		if (this.id) {
			this.picker[0].id = this.id;
		}

		// Modernizer.touch false positive with Chrome and Firefox
		//if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
		//	this.touchCapable = true;
		//}

		try {
			this.touchCapable = ('ontouchstart' in window || 'onmsgesturechange' in window)
				&& (typeof window.orientation !== 'undefined' || (typeof navigator.msMaxTouchPoints !== 'undefined' && navigator.msMaxTouchPoints > 2));
			
		} catch (e) {
			this.touchCapable = false;
		}

		var tooltip = this.element.data('slider-tooltip')||options.tooltip;

		this.tooltip = this.picker.find('#tooltip');
		this.tooltipInner = this.tooltip.find('div.tooltip-inner');

		this.tooltip_min = this.picker.find('#tooltip_min');
		this.tooltipInner_min = this.tooltip_min.find('div.tooltip-inner');

		this.tooltip_max = this.picker.find('#tooltip_max');
		this.tooltipInner_max= this.tooltip_max.find('div.tooltip-inner');

		if (updateSlider === true) {
			// Reset classes
			this.picker.removeClass('slider-horizontal');
			this.picker.removeClass('slider-vertical');
			this.tooltip.removeClass('hide');
			this.tooltip_min.removeClass('hide');
			this.tooltip_max.removeClass('hide');

		}

		this.orientation = this.element.data('slider-orientation')||options.orientation;
		switch(this.orientation) {
			case 'vertical':
				this.picker.addClass('slider-vertical');
				this.stylePos = 'top';
				this.mousePos = 'pageY';
				this.sizePos = 'offsetHeight';
				this.tooltip.addClass('right')[0].style.left = '100%';
				this.tooltip_min.addClass('right')[0].style.left = '100%';
				this.tooltip_max.addClass('right')[0].style.left = '100%';
				break;
			default:
				this.picker
					.addClass('slider-horizontal')
					.css('width', origWidth);
				this.orientation = 'horizontal';
				this.stylePos = 'left';
				this.mousePos = 'pageX';
				this.sizePos = 'offsetWidth';
				this.tooltip.addClass('top')[0].style.top = -this.tooltip.outerHeight() - 14 + 'px';
				this.tooltip_min.addClass('top')[0].style.top = -this.tooltip_min.outerHeight() - 14 + 'px';
				this.tooltip_max.addClass('top')[0].style.top = -this.tooltip_max.outerHeight() - 14 + 'px';
				break;
		}

		var self = this;
		$.each(['min', 'max', 'step', 'value'], function(i, attr) {
			if (typeof el.data('slider-' + attr) !== 'undefined') {
				self[attr] = el.data('slider-' + attr);
			} else if (typeof options[attr] !== 'undefined') {
				self[attr] = options[attr];
			} else if (typeof el.prop(attr) !== 'undefined') {
				self[attr] = el.prop(attr);
			} else {
				self[attr] = 0; // to prevent empty string issues in calculations in IE
			}
		});

		if (this.value instanceof Array) {
			if (updateSlider && !this.range) {
				this.value = this.value[0];
			} else {
				this.range = true;
			}
		} else if (this.range) {
			// User wants a range, but value is not an array
			this.value = [this.value, this.max];
		}

		this.selection = this.element.data('slider-selection')||options.selection;
		this.selectionEl = this.picker.find('.slider-selection');
		if (this.selection === 'none') {
			this.selectionEl.addClass('hide');
		}

		this.selectionElStyle = this.selectionEl[0].style;

		this.handle1 = this.picker.find('.slider-handle:first');
		this.handle1Stype = this.handle1[0].style;

		this.handle2 = this.picker.find('.slider-handle:last');
		this.handle2Stype = this.handle2[0].style;

		if (updateSlider === true) {
			// Reset classes
			this.handle1.removeClass('round triangle');
			this.handle2.removeClass('round triangle hide');
		}

		var handle = this.element.data('slider-handle')||options.handle;
		switch(handle) {
			case 'round':
				this.handle1.addClass('round');
				this.handle2.addClass('round');
				break;
			case 'triangle':
				this.handle1.addClass('triangle');
				this.handle2.addClass('triangle');
				break;
		}

		if (this.range) {
			this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
			this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
		} else {
			this.value = [ Math.max(this.min, Math.min(this.max, this.value))];
			this.handle2.addClass('hide');
			if (this.selection === 'after') {
				this.value[1] = this.max;
			} else {
				this.value[1] = this.min;
			}
		}
		this.diff = this.max - this.min;
		this.percentage = [
			(this.value[0]-this.min)*100/this.diff,
			(this.value[1]-this.min)*100/this.diff,
			this.step*100/this.diff
		];

		this.offset = this.picker.offset();
		this.size = this.picker[0][this.sizePos];

		this.formater = options.formater;
		this.tooltip_separator = options.tooltip_separator;
		this.tooltip_split = options.tooltip_split;

		this.reversed = this.element.data('slider-reversed')||options.reversed;

		this.layout();
        this.layout();

		this.handle1.on({
			keydown: $.proxy(this.keydown, this, 0)
		});

		this.handle2.on({
			keydown: $.proxy(this.keydown, this, 1)
		});

		if (this.touchCapable) {
			// Touch: Bind touch events:
			this.picker.on({
				touchstart: $.proxy(this.mousedown, this)
			});
		} else {
			this.picker.on({
				mousedown: $.proxy(this.mousedown, this)
			});
		}

		if(tooltip === 'hide') {
			this.tooltip.addClass('hide');
			this.tooltip_min.addClass('hide');
			this.tooltip_max.addClass('hide');
		} else if(tooltip === 'always') {
			this.showTooltip();
			this.alwaysShowTooltip = true;
		} else {
			this.picker.on({
				mouseenter: $.proxy(this.showTooltip, this),
				mouseleave: $.proxy(this.hideTooltip, this)
			});
			this.handle1.on({
				focus: $.proxy(this.showTooltip, this),
				blur: $.proxy(this.hideTooltip, this)
			});
			this.handle2.on({
				focus: $.proxy(this.showTooltip, this),
				blur: $.proxy(this.hideTooltip, this)
			});
		}

		this.enabled = options.enabled && 
						(this.element.data('slider-enabled') === undefined || this.element.data('slider-enabled') === true);
		if(this.enabled) {
			this.enable();
		} else {
			this.disable();
		}
	};

	Slider.prototype = {
		constructor: Slider,

		over: false,
		inDrag: false,
		
		showTooltip: function(){
            if (this.tooltip_split === false ){
                this.tooltip.addClass('in');
            } else {
                this.tooltip_min.addClass('in');
                this.tooltip_max.addClass('in');
            }

			this.over = true;
		},
		
		hideTooltip: function(){
			if (this.inDrag === false && this.alwaysShowTooltip !== true) {
				this.tooltip.removeClass('in');
				this.tooltip_min.removeClass('in');
				this.tooltip_max.removeClass('in');
			}
			this.over = false;
		},

		layout: function(){
			var positionPercentages;

			if(this.reversed) {
				positionPercentages = [ 100 - this.percentage[0], this.percentage[1] ];
			} else {
				positionPercentages = [ this.percentage[0], this.percentage[1] ];
			}

			this.handle1Stype[this.stylePos] = positionPercentages[0]+'%';
			this.handle2Stype[this.stylePos] = positionPercentages[1]+'%';

			if (this.orientation === 'vertical') {
				this.selectionElStyle.top = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
				this.selectionElStyle.height = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';
			} else {
				this.selectionElStyle.left = Math.min(positionPercentages[0], positionPercentages[1]) +'%';
				this.selectionElStyle.width = Math.abs(positionPercentages[0] - positionPercentages[1]) +'%';

                var offset_min = this.tooltip_min[0].getBoundingClientRect();
                var offset_max = this.tooltip_max[0].getBoundingClientRect();

                if (offset_min.right > offset_max.left) {
                    this.tooltip_max.removeClass('top');
                    this.tooltip_max.addClass('bottom')[0].style.top = 18 + 'px';
                } else {
                    this.tooltip_max.removeClass('bottom');
                    this.tooltip_max.addClass('top')[0].style.top = -30 + 'px';
                }
			}

			if (this.range) {
				this.tooltipInner.text(
					this.formater(this.value[0]) + this.tooltip_separator + this.formater(this.value[1])
				);
				this.tooltip[0].style[this.stylePos] = this.size * (positionPercentages[0] + (positionPercentages[1] - positionPercentages[0])/2)/100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight()/2 : this.tooltip.outerWidth()/2) +'px';

                this.tooltipInner_min.text(
					this.formater(this.value[0])
				);
                this.tooltipInner_max.text(
					this.formater(this.value[1])
				);

				this.tooltip_min[0].style[this.stylePos] = this.size * ( (positionPercentages[0])/100) - (this.orientation === 'vertical' ? this.tooltip_min.outerHeight()/2 : this.tooltip_min.outerWidth()/2) +'px';
				this.tooltip_max[0].style[this.stylePos] = this.size * ( (positionPercentages[1])/100) - (this.orientation === 'vertical' ? this.tooltip_max.outerHeight()/2 : this.tooltip_max.outerWidth()/2) +'px';

			} else {
				this.tooltipInner.text(
					this.formater(this.value[0])
				);
				this.tooltip[0].style[this.stylePos] = this.size * positionPercentages[0]/100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight()/2 : this.tooltip.outerWidth()/2) +'px';
			}
		},

		mousedown: function(ev) {
			if(!this.isEnabled()) {
				return false;
			}
			// Touch: Get the original event:
			if (this.touchCapable && ev.type === 'touchstart') {
				ev = ev.originalEvent;
			}

			this.triggerFocusOnHandle();

			this.offset = this.picker.offset();
			this.size = this.picker[0][this.sizePos];

			var percentage = this.getPercentage(ev);

			if (this.range) {
				var diff1 = Math.abs(this.percentage[0] - percentage);
				var diff2 = Math.abs(this.percentage[1] - percentage);
				this.dragged = (diff1 < diff2) ? 0 : 1;
			} else {
				this.dragged = 0;
			}

			this.percentage[this.dragged] = this.reversed ? 100 - percentage : percentage;
			this.layout();

			if (this.touchCapable) {
				// Touch: Bind touch events:
				$(document).on({
					touchmove: $.proxy(this.mousemove, this),
					touchend: $.proxy(this.mouseup, this)
				});
			} else {
				$(document).on({
					mousemove: $.proxy(this.mousemove, this),
					mouseup: $.proxy(this.mouseup, this)
				});
			}

			this.inDrag = true;
			var val = this.calculateValue();
			this.setValue(val);
			this.element.trigger({
					type: 'slideStart',
					value: val
				}).trigger({
					type: 'slide',
					value: val
				});
			return true;
		},

		triggerFocusOnHandle: function(handleIdx) {
			if(handleIdx === 0) {
				this.handle1.focus();
			} 
			if(handleIdx === 1) {
				this.handle2.focus();
			}
		},

		keydown: function(handleIdx, ev) {
			if(!this.isEnabled()) {
				return false;
			}

			var dir;
			switch (ev.which) {
				case 37: // left
				case 40: // down
					dir = -1;
					break;
				case 39: // right
				case 38: // up
					dir = 1;
					break;
			}
			if (!dir) {
				return;
			}

			var oneStepValuePercentageChange = dir * this.percentage[2];
			var percentage = this.percentage[handleIdx] + oneStepValuePercentageChange;

			if (percentage > 100) {
				percentage = 100;
			} else if (percentage < 0) {
				percentage = 0;
			}

			this.dragged = handleIdx;
			this.adjustPercentageForRangeSliders(percentage);
			this.percentage[this.dragged] = percentage;
			this.layout();

			var val = this.calculateValue();
			this.setValue(val);
			this.element
				.trigger({
					type: 'slide',
					value: val
				})
				.trigger({
					type: 'slideStop',
					value: val
				})
				.data('value', val)
				.prop('value', val);
			return false;
		},

		mousemove: function(ev) {
			if(!this.isEnabled()) {
				return false;
			}
			// Touch: Get the original event:
			if (this.touchCapable && ev.type === 'touchmove') {
				ev = ev.originalEvent;
			}
			
			var percentage = this.getPercentage(ev);
			this.adjustPercentageForRangeSliders(percentage);
			this.percentage[this.dragged] = this.reversed ? 100 - percentage : percentage;
			this.layout();

			var val = this.calculateValue();
			this.setValue(val);
			this.element
				.trigger({
					type: 'slide',
					value: val
				})
				.data('value', val)
				.prop('value', val);
			return false;
		},

		adjustPercentageForRangeSliders: function(percentage) {
			if (this.range) {
				if (this.dragged === 0 && this.percentage[1] < percentage) {
					this.percentage[0] = this.percentage[1];
					this.dragged = 1;
				} else if (this.dragged === 1 && this.percentage[0] > percentage) {
					this.percentage[1] = this.percentage[0];
					this.dragged = 0;
				}
			}
		},

		mouseup: function() {
			if(!this.isEnabled()) {
				return false;
			}
			if (this.touchCapable) {
				// Touch: Bind touch events:
				$(document).off({
					touchmove: this.mousemove,
					touchend: this.mouseup
				});
			} else {
				$(document).off({
					mousemove: this.mousemove,
					mouseup: this.mouseup
				});
			}

			this.inDrag = false;
			if (this.over === false) {
				this.hideTooltip();
			}
			var val = this.calculateValue();
			this.layout();
			this.element
				.data('value', val)
				.prop('value', val)
				.trigger({
					type: 'slideStop',
					value: val
				});
			return false;
		},

		calculateValue: function() {
			var val;
			if (this.range) {
				val = [this.min,this.max];
                if (this.percentage[0] !== 0){
                    val[0] = (Math.max(this.min, this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step));
                }
                if (this.percentage[1] !== 100){
                    val[1] = (Math.min(this.max, this.min + Math.round((this.diff * this.percentage[1]/100)/this.step)*this.step));
                }
				this.value = val;
			} else {
				val = (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step);
				if (val < this.min) {
					val = this.min;
				}
				else if (val > this.max) {
					val = this.max;
				}
				val = parseFloat(val);
				this.value = [val, this.value[1]];
			}
			return val;
		},

		getPercentage: function(ev) {
			if (this.touchCapable) {
				ev = ev.touches[0];
			}
			var percentage = (ev[this.mousePos] - this.offset[this.stylePos])*100/this.size;
			percentage = Math.round(percentage/this.percentage[2])*this.percentage[2];
			return Math.max(0, Math.min(100, percentage));
		},

		getValue: function() {
			if (this.range) {
				return this.value;
			}
			return this.value[0];
		},

		setValue: function(val) {
			this.value = this.validateInputValue(val);

			if (this.range) {
				this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
				this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
			} else {
				this.value = [ Math.max(this.min, Math.min(this.max, this.value))];
				this.handle2.addClass('hide');
				if (this.selection === 'after') {
					this.value[1] = this.max;
				} else {
					this.value[1] = this.min;
				}
			}
			this.diff = this.max - this.min;
			this.percentage = [
				(this.value[0]-this.min)*100/this.diff,
				(this.value[1]-this.min)*100/this.diff,
				this.step*100/this.diff
			];
			this.layout();

			this.element
				.trigger({
					'type': 'slide',
					'value': this.value
				})
				.data('value', this.value)
				.prop('value', this.value);
		},

		validateInputValue : function(val) {
			if(typeof val === 'number') {
				return val;
			} else if(val instanceof Array) {
				$.each(val, function(i, input) { if (typeof input !== 'number') { throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(input) ); }});
				return val;
			} else {
				throw new Error( ErrorMsgs.formatInvalidInputErrorMsg(val) );
			}
		},

		destroy: function(){
			this.handle1.off();
			this.handle2.off();
			this.element.off().show().insertBefore(this.picker);
			this.picker.off().remove();
			$(this.element).removeData('slider');
		},

		disable: function() {
			this.enabled = false;
			this.handle1.removeAttr("tabindex");
			this.handle2.removeAttr("tabindex");
			this.picker.addClass('slider-disabled');
			this.element.trigger('slideDisabled');
		},

		enable: function() {
			this.enabled = true;
			this.handle1.attr("tabindex", 0);
			this.handle2.attr("tabindex", 0);
			this.picker.removeClass('slider-disabled');
			this.element.trigger('slideEnabled');
		},

		toggle: function() {
			if(this.enabled) {
				this.disable();
			} else {
				this.enable();
			}
		},

		isEnabled: function() {
			return this.enabled;
		},

		setAttribute: function(attribute, value) {
			this[attribute] = value;
		}
	};

	var publicMethods = {
		getValue : Slider.prototype.getValue,
		setValue : Slider.prototype.setValue,
		setAttribute : Slider.prototype.setAttribute,
		destroy : Slider.prototype.destroy,
		disable : Slider.prototype.disable,
		enable : Slider.prototype.enable,
		toggle : Slider.prototype.toggle,
		isEnabled: Slider.prototype.isEnabled
	};

	$.fn.slider = function (option) {
		if (typeof option === 'string' && option !== 'refresh') {
			var args = Array.prototype.slice.call(arguments, 1);
			return invokePublicMethod.call(this, option, args);
		} else {
			return createNewSliderInstance.call(this, option);
		}
	};

	function invokePublicMethod(methodName, args) {
		if(publicMethods[methodName]) {
			var sliderObject = retrieveSliderObjectFromElement(this);
			var result = publicMethods[methodName].apply(sliderObject, args);

			if (typeof result === "undefined") {
				return $(this);
			} else {
				return result;
			}
		} else {
			throw new Error("method '" + methodName + "()' does not exist for slider.");
		}
	}

	function retrieveSliderObjectFromElement(element) {
		var sliderObject = $(element).data('slider');
		if(sliderObject && sliderObject instanceof Slider) {
			return sliderObject;
		} else {
			throw new Error(ErrorMsgs.callingContextNotSliderInstance);
		}
	}

	function createNewSliderInstance(opts) {
		var $this = $(this);
		$this.each(function() {
			var $this = $(this),
				slider = $this.data('slider'),
				options = typeof opts === 'object' && opts;

			// If slider already exists, use its attributes
			// as options so slider refreshes properly
			if (slider && !options) {
				options = {};

				$.each($.fn.slider.defaults, function(key) {
					options[key] = slider[key];
				});
			}

			$this.data('slider', (new Slider(this, $.extend({}, $.fn.slider.defaults, options))));
		});
		return $this;
	}

	$.fn.slider.defaults = {
		min: 0,
		max: 10,
		step: 1,
		orientation: 'horizontal',
		value: 5,
		range: false,
		selection: 'before',
		tooltip: 'show',
        tooltip_separator: ':',
        tooltip_split: false,
		handle: 'round',
		reversed : false,
		enabled: true,
		formater: function(value) {
			return value;
		}
	};

	$.fn.slider.Constructor = Slider;

})( window.jQuery );

!function ($) {

    "use strict";

    // TABCOLLAPSE CLASS DEFINITION
    // ======================

    var TabCollapse = function (el, options) {
        this.options   = options;
        this.$tabs  = $(el);

        this._accordionVisible = false; //content is attached to tabs at first
        this._initAccordion();
        this._checkStateOnResize();

        this.checkState();
    };

    TabCollapse.DEFAULTS = {
        accordionClass: 'visible-xs',
        tabsClass: 'hidden-xs',
        accordionTemplate: function(heading, groupId, parentId, active){
            return '<div class="panel panel-default">' +
                '   <div class="panel-heading">' +
                '      <h4 class="panel-title">' +
                '        <a class="' + (active ? '' : 'collapsed') + '" data-toggle="collapse" data-parent="#' + parentId + '" href="#' + groupId + '">' +
                '           ' + heading +
                '        </a>' +
                '      </h4>' +
                '   </div>' +
                '   <div id="' + groupId + '" class="panel-collapse collapse ' + (active ? 'in' : '') + '">' +
                '       <div class="panel-body">' +
                '       </div>' +
                '   </div>' +
                '</div>';
        }
    };

    TabCollapse.prototype.checkState = function(){
        if (this.$tabs.is(':visible') && this._accordionVisible){
            this.showTabs();
            this._accordionVisible = false;
        } else if (this.$accordion.is(':visible') && !this._accordionVisible){
            this.showAccordion();
            this._accordionVisible = true;
        }
    };

    TabCollapse.prototype.showTabs = function(){
        this.$tabs.trigger($.Event('show-tabs.bs.tabcollapse'));

        var $panelBodies = this.$accordion.find('.panel-body');
        $panelBodies.each(function(){
            var $panelBody = $(this),
                $tabPane = $panelBody.data('bs.tabcollapse.tabpane');
            $tabPane.append($panelBody.children('*').detach());
        });
        this.$accordion.html('');

        this.$tabs.trigger($.Event('shown-tabs.bs.tabcollapse'));
    };

    TabCollapse.prototype.showAccordion = function(){
        this.$tabs.trigger($.Event('show-accordion.bs.tabcollapse'));

        var $headings = this.$tabs.find('li:not(.dropdown) [data-toggle="tab"], li:not(.dropdown) [data-toggle="pill"]'),
            view = this;
        $headings.each(function(){
            var $heading = $(this);
            view.$accordion.append(view._createAccordionGroup(view.$accordion.attr('id'), $heading));
        });

        this.$tabs.trigger($.Event('shown-accordion.bs.tabcollapse'));
    };

    TabCollapse.prototype._checkStateOnResize = function(){
        var view = this;
        $(window).resize(function(){
            clearTimeout(view._resizeTimeout);
            view._resizeTimeout = setTimeout(function(){
                view.checkState();
            }, 100);
        })
    };


    TabCollapse.prototype._initAccordion = function(){
        this.$accordion = $('<div class="panel-group ' + this.options.accordionClass + '" id="' + this.$tabs.attr('id') + '-accordion' +'"></div>');
        this.$tabs.after(this.$accordion);
        this.$tabs.addClass(this.options.tabsClass);
        this.$tabs.siblings('.tab-content').addClass(this.options.tabsClass);
    };

    TabCollapse.prototype._createAccordionGroup = function(parentId, $heading){
        var tabSelector = $heading.attr('data-target'),
            active = $heading.parent().is('.active');

        if (!tabSelector) {
            tabSelector = $heading.attr('href');
            tabSelector = tabSelector && tabSelector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        var $tabPane = $(tabSelector),
            groupId = $tabPane.attr('id') + '-collapse',
            $panel = $(this.options.accordionTemplate($heading.html(), groupId, parentId, active));
        $panel.find('.panel-body').append($tabPane.children('*').detach())
            .data('bs.tabcollapse.tabpane', $tabPane);

        return $panel;
    };



    // TABCOLLAPSE PLUGIN DEFINITION
    // =======================

    $.fn.tabCollapse = function (option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('bs.tabcollapse');
            var options = $.extend({}, TabCollapse.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('bs.tabcollapse', new TabCollapse(this, options));
        })
    };

    $.fn.tabCollapse.Constructor = TabCollapse;


}(window.jQuery);


// FRONTPAGE 


/*
TSR - CAROUSEL LISTING
*/ 


;(function(document,$) {


    window.tsrCommunicationPrimary = window.tsrCommunicationPrimary || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCommunicationPrimary.tsrInit = function() {

 
		tsrCommunicationPrimary.tsrMobileTextHeight();
		tsrCommunicationPrimary.tsrPrimaryCarousel();


    };


  
/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Carousel conditions
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCommunicationPrimary.tsrPrimaryCarousel = function () {


		var bw = $('body').width();

	    $('.tsr-section-communictaion-primary').each(function () {

/////// Variables

		var el 	= $(this);

/////// Init slider

		 el.flexslider({
			animation: "slide",
			namespace: "tsr-",
			selector: ".tsr-slides > a", 
	                animationLoop: true,
	                slideshow: true,
	                slideshowSpeed: 5000,
	                animationSpeed: 600,
			itemMargin: 0,
			controlNav: true,              
			directionNav: true,             
			prevText: "",           
			nextText: "",	        
		});



	    }); // Each END



    }; // Func END

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Mobile text height
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrCommunicationPrimary.tsrMobileTextHeight = function () {


		var bw = $('body').width();



	    $('.tsr-section-communictaion-primary').each(function () {

/////// Variables

			var el 			= $(this);
			var textHeight 	= el.find('.tsr-tactical-textPanel').height();

			

/////////////////////////////////////////////
////// Check widths

			if(bw <= 767 ){
				
				$('.tsr-slides > a', this).each(function () {


					var el 			= $(this);
					var textHeight 	= el.find('.tsr-tactical-textPanel').height();
					// console.log(textHeight);

					el.css('margin-bottom', textHeight + 10);

				}); // Each END

			} else {

				$('.tsr-slides > a', this).each(function () {
					
					var el 			= $(this);
					el.css('margin-bottom', '0');

				}); // Each END

			}



	    }); // Each END



    }; // Func END

		



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrCommunicationPrimary.tsrInit();
      
    });


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Resize
/////////////////////////////////////////////////////////////////////////////////////////////////////////


	// jquery.debouncing.js, thanks Paul Irish

    $(window).smartresize(function(){
  		tsrCommunicationPrimary.tsrMobileTextHeight();
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////



/*
TSR - PROMOTION
*/ 


;(function(document,$) {


    window.tsrPromotion = window.tsrPromotion || {};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Init
/////////////////////////////////////////////////////////////////////////////////////////////////////////


    tsrPromotion.tsrInit = function() {
       
        tsrPromotion.tsrItemCount();
        tsrPromotion.tsrEqualHeights();

    };

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Thanks Paul Irish
	$.fn.setAllToMaxHeight = function(){
		return this.height( Math.max.apply(this, $.map( this , function(e){ return $(e).height() }) ) );
	}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Equal heights
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrPromotion.tsrEqualHeights = function () {


	    $('.tsr-section-promotion').each(function () {

            var bw = $('body').width();
	        var el = $(this);

            if(bw >= 480){
                $('p', this).css('height', 'auto').setAllToMaxHeight()﻿;
                $('h6', this).css('height', 'auto').setAllToMaxHeight()﻿;

            } else {
                $('p', this).css('height', 'auto');
                $('h6', this).css('height', 'auto')﻿;
 
            } 

	      	
	    });

    };


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// TSR - Item count
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    tsrPromotion.tsrItemCount = function () {

        $('.tsr-section-promotion .tsr-container').each(function () {

            var el = $(this);
            var elCount =  el.children().size();

            el.parent().addClass('tsr-count-' + elCount);

        });

    };

  

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Ready
/////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('ready', function(){

        tsrPromotion.tsrInit();
      
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Resize
/////////////////////////////////////////////////////////////////////////////////////////////////////////


	// jquery.debouncing.js, thanks Paul Irish

    $(window).smartresize(function(){
  		tsrPromotion.tsrEqualHeights();
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document,jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////



// DETAIL VIEW
/* ========================================================================
 * Bootstrap: collapse.js v3.0.3
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.0.3
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
    .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.0.3
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.3
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.0.3
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content')[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

// $( document ).ready(function() {
//   $('.js-imagerotator').flexslider({
//     animation: "slide",
//     controlNav: "thumbnails",
//     itemMargin: 40,
//     slideshow: false,
//     maxItems: 4
//   });

//     $("#js-largeimage")
//     .flexslider({
//       animation: "slide",
//       useCSS: false,
//       animationLoop: true,
//       slideshow: false,

//       itemWidth: 500,
//       itemMargin: 0,
//   });
// });
$(document).ready(function () {

  var slider, // Global slider value to force playing and pausing by direct access of the slider control
    canSlide = false; // Global switch to monitor video state

  // Load the YouTube API. For some reason it's required to load it like this
  var tag = document.createElement('script');
  tag.src = "//www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Setup a callback for the YouTube api to attach video event handlers
  window.onYouTubeIframeAPIReady = function () {
    // Iterate through all videos
    $('.flexslider iframe').each(function () {
      // Create a new player pointer; "this" is a DOMElement of the player's iframe
      var player = new YT.Player(this, {
        playerVars: {
          autoplay: 0
        }
      });

      // Watch for changes on the player
      player.addEventListener("onStateChange", function (state) {
        switch (state.data) {
          // If the user is playing a video, stop the slider
          case YT.PlayerState.PLAYING:
            slider.flexslider("stop");
            canSlide = false;
            break;
            // The video is no longer player, give the go-ahead to start the slider back up
          case YT.PlayerState.ENDED:
          case YT.PlayerState.PAUSED:
            slider.flexslider("play");
            canSlide = true;
            break;
        }
      });

      $(this).data('player', player);
    });
  };

  slider = $("#js-largeimage")
    .flexslider({
      animation: "slide",
      pauseOnHover: true,
      pauseOnAction: true,
      touch: true,
      video: true,
      useCSS: false,
      animationLoop: true,
      slideshow: false,
      prevText: "",
      nextText: "",
      directionNav: true,
      before: function () {
        if (!canSlide) {
          slider.flexslider("stop");
        }
      },

      itemWidth: 500
    });

  slider.find('.flex-control-nav > li > a').on("click", function () {
    canSlide = true;
    $('.flexslider iframe').each(function () {
      $(this).data('player').pauseVideo();
    });
  });


	$('#js-imagerotator-carousel').flexslider({
	    animation: "slide",
	    controlNav: false,
	    animationLoop: true,
	    slideshow: false,
	    itemWidth: 120,
	    asNavFor: '#js-imagerotator',
	    directionNav: true,
	    prevText: "",
	    nextText: "",
	    minItems: 3,
      maxItems: 4,
	});

    $('#js-imagerotator').flexslider({
        animation: "slide",
        controlNav: false,
        animationLoop: false,
        slideshow: false,
        sync: "#js-imagerotator-carousel",
        directionNav: false,
    });
});

(function ($) {

  $.fn.rating = function () {

    var element;

    // A private function to highlight a star corresponding to a given value
    function _paintValue(ratingInput, value) {
      var selectedStar = $(ratingInput).find('[data-value=' + value + ']');
      selectedStar.removeClass('ee-favorite').addClass('ee-favorite active');
      selectedStar.prevAll('[data-value]').removeClass('ee-favorite').addClass('ee-favorite active');
      selectedStar.nextAll('[data-value]').removeClass('ee-favorite active').addClass('ee-favorite');
    }

    // A private function to remove the highlight for a selected rating
    function _clearValue(ratingInput) {
      var self = $(ratingInput);
      self.find('[data-value]').removeClass('ee-favorite active').addClass('ee-favorite');
    }

    // A private function to change the actual value to the hidden field
    function _updateValue(input, val) {
      input.val(val).trigger('change');
      if (val === input.data('empty-value')) {
        input.siblings('.rating-clear').hide();
      }
      else {
        input.siblings('.rating-clear').show();
      }
    }

    // Iterate and transform all selected inputs
    for (element = this.length - 1; element >= 0; element--) {

      var el, i,
        originalInput = $(this[element]),
        max = originalInput.data('max') || 5,
        min = originalInput.data('min') || 0,
        clearable = originalInput.data('clearable') || null,
        stars = '';

      // HTML element construction
      for (i = min; i <= max; i++) {
        // Create <max> empty stars
        stars += ['<span class="ee-favorite" data-value="', i, '"></span>'].join('');
      }
      // Add a clear link if clearable option is set
      if (clearable) {
        stars += [
          ' <a class="rating-clear" style="display:none;" href="javascript:void">',
          clearable,
          '</a>'].join('');
      }

      // Clone the original input to preserve any additional data bindings using attributes.
      var newInput = originalInput.clone()
        .attr('type', 'hidden')
        .data('max', max)
        .data('min', min);

      // Rating widget is wrapped inside a div
      el = [
        '<div class="rating-input">',
        stars,
        '</div>'].join('');

      // Replace original inputs HTML with the new one
      originalInput.replaceWith($(el).append(newInput));

    }

    // Give live to the newly generated widgets
    $('.rating-input')
      // Highlight stars on hovering
      .on('mouseenter', '[data-value]', function () {
        var self = $(this);
        _paintValue(self.closest('.rating-input'), self.data('value'));
      })
      // View current value while mouse is out
      .on('mouseleave', '[data-value]', function () {
        var self = $(this),
          input = self.siblings('input'),
          val = input.val(),
          min = input.data('min'),
          max = input.data('max');
        if (val >= min && val <= max) {
          _paintValue(self.closest('.rating-input'), val);
        } else {
          _clearValue(self.closest('.rating-input'));
        }
      })
      // Set the selected value to the hidden field
      .on('click', '[data-value]', function (e) {
        var self = $(this),
          val = self.data('value'),
          input = self.siblings('input');
        _updateValue(input,val);
        e.preventDefault();
        return false;
      })
      // Remove value on clear
      .on('click', '.rating-clear', function (e) {
        var self = $(this),
          input = self.siblings('input');
        _updateValue(input, input.data('empty-value'));
        _clearValue(self.closest('.rating-input'));
        e.preventDefault();
        return false;
      })
      // Initialize view with default value
      .each(function () {
        var input = $(this).find('input'),
          val = input.val(),
          min = input.data('min'),
          max = input.data('max');
        if (val !== "" && +val >= min && +val <= max) {
          _paintValue(this, val);
          $(this).find('.rating-clear').show();
        }
        else {
          input.val(input.data('empty-value'));
          _clearValue(this);
        }
      });

  };

  // Auto apply conversion of number fields with class 'rating' into rating-fields
  $(function () {
    if ($('input.rating[type=number]').length > 0) {
      $('input.rating[type=number]').rating();
    }
  });

}(jQuery));

/*! SocialCount - v0.1.6 - 2013-08-08
* https://github.com/filamentgroup/SocialCount
* Copyright (c) 2013 zachleat; Licensed MIT */

!function(a,b,c){function d(a,c){var d=b.createElement("social").style,e="webkit Moz o ms".split(" ");if(c in d)return!0;for(var f=0,g=e.length;g>f;f++)if(e[f]+a in d)return!0;return!1}function e(a){var b=a.split("/");return b.pop(),b.join("/")+"/"}function f(){var a;return c("script").each(function(){var b=this.src||"";return b.match(i.scriptSrcRegex)?(a=e(b),!1):void 0}),a}var g,h,i={isGradeA:"querySelectorAll"in b&&!a.blackberry&&!("ontouchstart"in window)&&("undefined"==typeof window.navigator.msMaxTouchPoints||0===window.navigator.msMaxTouchPoints),minCount:1,serviceUrl:"service/index.php",initSelector:".socialcount",classes:{js:"js",gradeA:"grade-a",active:"active",touch:"touch",hover:"hover",noTransforms:"no-transforms",showCounts:"counts",countContent:"count",minCount:"minimum",activateOnHover:"activate-on-hover",activateOnClick:"activate-on-click"},thousandCharacter:"K",millionCharacter:"M",missingResultText:"-",activateOnClick:!1,selectors:{facebook:".facebook",twitter:".twitter",googleplus:".googleplus"},locale:function(){var a=b.documentElement?b.documentElement.lang||"":"";return a=a.replace(/\-/,"_"),a.match(/\w{2}_\w{2}/)?a:""}(),googleplusTooltip:"table.gc-bubbleDefault",scriptSrcRegex:/socialcount[\w.]*.js/i,plugins:{init:[],bind:[]},cache:{},removeFileName:e,resolveServiceDir:f,isCssAnimations:function(){return d("AnimationName","animationName")},isCssTransforms:function(){return d("Transform","transform")},getUrl:function(a){return a.attr("data-url")||location.href},getShareText:function(a){return a.attr("data-share-text")||""},getFacebookAction:function(a){return(a.attr("data-facebook-action")||"like").toLowerCase()},isCountsEnabled:function(a){return"true"===a.attr("data-counts")},isSmallSize:function(a){return a.is(".socialcount-small")},getCounts:function(a,b){var d,e,g,j=i.selectors,k=i.cache,l={};for(g in j)d=a.find(j[g]),e=d.find("."+i.classes.countContent),e.length?l[g]=e:(l[g]=h.clone(),d.append(l[g]));return k[b]||(k[b]=c.ajax({url:f()+i.serviceUrl,data:{url:b},dataType:"json"})),k[b].done(function(a){for(var b in a)a.hasOwnProperty(b)&&l[b]&&a[b]>i.minCount&&l[b].addClass(i.classes.minCount).html(i.normalizeCount(a[b]))}),k[b]},init:function(a){var b=i.getFacebookAction(a),c=[b],d=i.isSmallSize(a),e=i.getUrl(a),f=i.plugins.init,g=i.isCountsEnabled(a);c.push(i.classes.js),i.isGradeA&&c.push(i.classes.gradeA),i.isCssTransforms()||c.push(i.classes.noTransforms),g&&c.push(i.classes.showCounts),i.activateOnClick?c.push(i.classes.activateOnClick):c.push(i.classes.activateOnHover),i.locale&&c.push(i.locale),a.addClass(c.join(" "));for(var h=0,j=f.length;j>h;h++)f[h].call(a);i.isGradeA&&i.bindEvents(a,e,b,d),g&&!d&&i.getCounts(a,e)},normalizeCount:function(a){return a||0===a?a>=1e6?Math.floor(a/1e6)+i.millionCharacter:a>=1e5?Math.floor(a/1e3)+i.thousandCharacter:a>1e3?(a/1e3).toFixed(1).replace(/\.0/,"")+i.thousandCharacter:a:i.missingResultText},bindEvents:function(a,d,e,f){function h(a,d,e){var f=!1,h=!1;a.closest("li").bind("mouseenter",function(){var a=c(this).closest("li");a.addClass(i.classes.hover),h=!0,c(document).on("mouseenter.socialcount mouseleave.socialcount",i.googleplusTooltip,function(b){f="mouseenter"===b.type,f||h||a.removeClass(i.classes.hover)})}).bind("mouseleave",function(){var a=this;window.setTimeout(function(){h=!1,f||h||(c(document).off(".socialcount"),c(a).closest("li").removeClass(i.classes.hover))},0)}),a.one(i.activateOnClick?"click":"mouseover",function(a){i.activateOnClick&&(a.preventDefault(),a.stopPropagation());var f,h=c(this),j=h.closest("li"),k=g.clone(),l=c(d),m=c('<div class="button"/>').append(l),n=c.Deferred();n.promise().always(function(){var a=j.find("iframe");a.length?a.bind("load",function(){k.remove()}):k.remove()}),j.addClass(i.classes.active).append(k).append(m),e?(f=b.createElement("script"),f.src=e,f.attachEvent?f.attachEvent("onreadystatechange",function(){("loaded"===f.readyState||"complete"===f.readyState)&&n.resolve()}):c(f).bind("load",n.resolve),b.body.appendChild(f)):l.is("iframe")&&n.resolve()})}if(!f){var j=i.getShareText(a);h(a.find(i.selectors.facebook+" a"),'<iframe src="//www.facebook.com/plugins/like.php?href='+encodeURIComponent(d)+(i.locale?"&locale="+i.locale:"")+"&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=true&amp;action="+e+'&amp;colorscheme=light&amp;font=arial&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden;" allowTransparency="true"></iframe>'),h(a.find(i.selectors.twitter+" a"),'<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+encodeURIComponent(d)+'"'+(j?' data-text="'+j+'"':"")+' data-count="none" data-dnt="true">Tweet</a>',"//platform.twitter.com/widgets.js"),h(a.find(i.selectors.googleplus+" a"),'<div class="g-plusone" data-size="medium" data-annotation="none"></div>',"//apis.google.com/js/plusone.js")}for(var k=i.plugins.bind,l=0,m=k.length;m>l;l++)k[l].call(a,h,d,f)}};c(function(){g=c("<div>").addClass("loading").html(i.isCssAnimations()?new Array(4).join('<div class="dot"></div>'):"Loading"),h=c("<span>").addClass(i.classes.countContent).html("&#160;"),c(i.initSelector).each(function(){var a=c(this);i.init(a)})}),window.SocialCount=i}(window,window.document,jQuery);

/*
TSR - SUPPORT
*/

; (function (document, $) {


  window.tsrCompare = window.tsrCompare || {};

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// TSR - Init
  /////////////////////////////////////////////////////////////////////////////////////////////////////////


  tsrCompare.tsrInit = function () {

    tsrCompare.tsrItemCount();
    tsrCompare.tsrEqualHeights();
    tsrCompare.tsrEqualHeightsHeaders();
    tsrCompare.tsrItemWidth();

  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// TSR - Equal heights
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Thanks Paul Irish
  $.fn.setAllToMaxHeight = function () {
    return this.height(Math.max.apply(this, $.map(this, function (e) { return $(e).height() })));
  }


  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// Equal heights for header h6
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
 tsrCompare.tsrEqualHeightsHeaders = function () {

   $('.js-datawrapper').each(function () {

    var headerEl   = $('.compare-value h6').not('.sticky');


    if(Modernizr.mq('only screen and (min-width: 768px)')) {
      $(headerEl , this).css('height', 'auto').setAllToMaxHeight()﻿;
    }
    else {
      $(headerEl , this).css('height', 'auto');
    }
    
  });

 };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// row height - 
  ///// Counts row height in case one value is significally longer
  ///////////////////////////////////////////////////
  tsrCompare.tsrEqualHeights = function () {

    $('.js-datawrapper', this).each(function () {

      var el          = $(this).not('.sticky');
      var elHeight  = el.find('.compare-value').height();

      if(Modernizr.mq('only screen and (min-width: 768px)')) {
        el.css('max-height',  'auto');
      }
      else {
        el.css('max-height', elHeight + 20 );
      }
    });

  }; // Func END


  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////  Item count
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  tsrCompare.tsrItemCount = function () {

    $('.ee-product-compare  .fixwidth').each(function () {

      var el = $(this);
      var elCount = el.children().length;

      el.children().addClass('ee-count-' + elCount);

    });

  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////   width is half the window
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  tsrCompare.tsrItemWidth = function () {
    var half = $('#content-placeholder-compare-data .panel-group').width() / 2;
    
    if (Modernizr.mq('only screen and (max-width: 768px)')) {
      if (half > 0) {
        var productcount = $(".jsCompareProduct").length;
        $('.ee-count-' + productcount).css('width', half);
      }
      
    }

  }; // end functions
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// Ready
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  $(document).on('ready', function () {

    tsrCompare.tsrInit(); // call previous functions

    // navbar toggle
    $('#toggleParam').click(function() {
      $('.js-subpanel').collapse('toggle');
    });


  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// Resize
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  // jquery.debouncing.js, thanks Paul Irish

  $(window).smartresize(function () {

    tsrCompare.tsrEqualHeights();
    tsrCompare.tsrEqualHeightsHeaders();

  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////// actiom events
  ///////////////////////////////////////////////////////////////////////////////

  // sticky header when scrolled
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $('.comparision-header').addClass("sticky container xs-not-padded");
    }
    else {
      $('.comparision-header').removeClass("sticky container xs-not-padded");
    }
  });



// next-and-prev-buttons on mobile, depends on scrollto plugin
  //http://jsfiddle.net/UaGjs/10/
  var next;
  $('.js-compare-next').click(function () {
    if (next === undefined) {
      next = $('.ee-count-' + productcount).next();
    } else {
      if (prev === undefined) {
        next = next.next();
      } else {
        next = prev.next();
        prev = undefined;
      }
    }
    var nextNext = next.next().next();
    if (!nextNext.length) {
      $('.js-compare-next').hide();
    } else {
      $('.js-compare-next').show();
    }
    $('.js-compare-prev').show();

    $(".js-datawrapper").scrollTo(next, 800, {
      margin: true
    });
    event.preventDefault();
  });


  var prev;
  $('.js-compare-prev').click(function () {
    if (prev === undefined) {
      if (next === undefined) {
        prev = $('.ee-count-' + productcount).prev();
      } else {
        prev = next.prev();
      }

    } else {
      prev = prev.prev();
    }

    var prevPrev = prev.prev().prev();

    if (!prevPrev.length) {
      $(".js-compare-prev").hide();
    } else {
      $(".js-compare-prev").show();
    }
    $('.js-compare-next').show();
    $(".js-datawrapper").scrollTo(prev, 800, {
      margin: true,
      limit: false
    });
    event.preventDefault();
  });


  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

})(document, jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////// END
/////////////////////////////////////////////////////////////////////////////////////////////////////////


// APP SPECIFIC SCRIPTS
$(document).ready(function() {

BindSlideToggle();
cloneRightSideMainMenu();
 
// COLLAPSE TABS
// https://github.com/okendoken/bootstrap-tabcollapse
  $('#TabsResponsive').tabCollapse();

  // FILTER COLOR CHANGE
  $('#content-placeholder-filter > div > ul > li > a').click(function(e){
    if ($(this).attr('class') != 'disabled'){
      $(this).addClass('disabled');
      $('a').not(this).removeClass('disabled');
    }
    else {
      $(this).removeClass('disabled');
    }
    e.preventDefault();
  });

$('.dropdown-menu').find('form').click(function (e) {
        e.stopPropagation();
      });

$(".jsShowMoreCategories").unbind("click").click(function () {
 if ($(this).hasClass("moretext")) {
  $(".jsShowMoreCategories span").html($(this).data("lesstext"));
   $(this).removeClass("moretext");
 } else {
   $(".jsShowMoreCategories span").html($(this).data("moretext"));
   $(this).addClass("moretext");
 }
});

}); // end document ready

function BindSlideToggle() {
 $('.js-slidetoggle').click(function (e) {
  $(this).parents().next('.js-togglable').slideToggle('slow');
  e.preventDefault();
 });
}


function cloneRightSideMainMenu(){
    $('#collapsibleMainMenu-Search').html( $('.collapsibleMainMenu-Search').clone() );
    $('#collapsibleMainMenu-Basket').html( $('.collapsibleMainMenu-Basket').clone() );
    $('#collapsibleMainMenu-Guide').html( $('.collapsibleMainMenu-Guide').clone() );
    
    var _el = $('#collapsibleMainMenu-Pages').find('.navbar-nav').eq(1).find('li').eq(3);
}


// counting rules for IE 8-9 as the limit is 4095
// function countCSSRules() {
//     var results = '',
//         log = '';
//     if (!document.styleSheets) {
//         return;
//     }
//     for (var i = 0; i < document.styleSheets.length; i++) {
//         countSheet(document.styleSheets[i]);
//     }
//     function countSheet(sheet) {
//         var count = 0;
//         if (sheet && sheet.cssRules) {
//             for (var j = 0, l = sheet.cssRules.length; j < l; j++) {
//                 if( !sheet.cssRules[j].selectorText ) {
//                     continue;
//                 }
//                 count += sheet.cssRules[j].selectorText.split(',').length;
//             }

//             log += '\nFile: ' + (sheet.href ? sheet.href : 'inline <style> tag');
//             log += '\nRules: ' + sheet.cssRules.length;
//             log += '\nSelectors: ' + count;
//             log += '\n--------------------------';
//             if (count >= 4096) {
//                 results += '\n********************************\nWARNING:\n There are ' + count + ' CSS rules in the stylesheet ' + sheet.href + ' - IE will ignore the last ' + (count - 4096) + ' rules!\n';
//             }
//         }
//     }
//     console.log(log);
//     console.log(results);
// };
// countCSSRules();
