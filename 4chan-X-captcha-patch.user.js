// ==UserScript==
// @name         4chan X
// @version      3.13.15
// @minGMVer     1.14
// @minFFVer     26
// @namespace    4chan-X
// @description  Essentially it's 4chan X plus more bloat.
// @license      MIT; https://github.com/ihavenoface/4chan-x/blob/v3/LICENSE
// @match        *://boards.4chan.org/*
// @match        *://sys.4chan.org/*
// @match        *://a.4cdn.org/*
// @match        *://i.4cdn.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @updateURL    https://4chan-x.org/stable-v3/4chan-X.meta.js
// @downloadURL  https://4chan-x.org/stable-v3/4chan-X.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAGcAAABmzDNZt9VtAAAAAXRSTlMAQObYZgAAAE5JREFUeF6NyiEOwEAMA0ET/88kJP8L2VdWKomuR7poJFu/qkiuhcxITRZqYkYLwzRkoQIoLaSG0QFDDtwfw7stmmnmRPxBx3PAlpLF3QN2aj/BUuOfdAAAAABJRU5ErkJggg==
// ==/UserScript==

/* 4chan X - Version 3.13.15 - 2014-09-06
 * https://4chan-x.org/
 *
 * Copyrights and License: https://github.com/ihavenoface/4chan-x/blob/v3/LICENSE
 *
 * Contributors:
 * https://github.com/ihavenoface/4chan-x/graphs/contributors
 * Non-GitHub contributors:
 * ferongr, xat-, Ongpot, thisisanon and Anonymous - favicon contributions
 * e000 - cooldown sanity check
 * Seiba - chrome quick reply focusing
 * herpaderpderp - recaptcha fixes
 * WakiMiko - recaptcha tab order http://userscripts.org/scripts/show/82657
 * milkytiptoe - testing
 *
 * All the people who've taken the time to write bug reports and provide feedback.
 *
 * Thank you.
 */

'use strict';

(function() {
  var $, $$, Anonymize, ArchiveLink, Board, Build, CatalogThread, Clone, Conf, Config, CoverPreview, CustomCSS, DataBoard, DeleteLink, Dice, DownloadLink, Embed, Embedding, ExpandThread, Favicon, FileInfo, Filter, Fourchan, Get, Header, IDColor, ImageExpand, ImageHover, ImageReplace, ImageReplaceLoaded, Index, Keybinds, Labels, LinkTitles, Linkify, Main, Markdown, Menu, Nav, Notice, PSAHiding, Polyfill, Post, PostHiding, QR, QuoteBacklink, QuoteInline, QuoteMarkers, QuotePreview, QuoteStrikeThrough, Quotify, Recursive, Redirect, RelativeDates, Report, ReportLink, RevealSpoilers, Sauce, Settings, Thread, ThreadExcerpt, ThreadStats, ThreadUpdater, ThreadWatcher, Time, UI, Unread, c, d, doc, g,
    __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Config = {
    main: {
      'Miscellaneous': {
        'Desktop Notifications': [true, 'Enables desktop notifications across various 4chan X features.'],
        '404 Redirect': [true, 'Redirect dead threads and images.'],
        'Keybinds': [true, 'Bind actions to keyboard shortcuts.'],
        'Time Formatting': [true, 'Localize and format timestamps.'],
        'Relative Post Dates': [false, 'Display dates like "3 minutes ago". Tooltip shows the timestamp.'],
        'Relative Date Title': [false, 'Show Relative Post Date only when hovering over dates.'],
        'File Info Formatting': [true, 'Reformat the file information.'],
        'Thread Expansion': [true, 'Add buttons to expand threads.'],
        'Index Navigation': [false, 'Add buttons to navigate between threads.'],
        'Reply Navigation': [false, 'Add buttons to navigate to top / bottom of thread.'],
        'Show Dice Roll': [true, 'Show dice that were entered into the email field.']
      },
      'Filtering': {
        'Anonymize': [false, 'Make everyone Anonymous.'],
        'Filter': [true, 'Self-moderation placebo.'],
        'Post Hiding': [true, 'Add buttons to hide threads and replies.'],
        'Stubs': [true, 'Show stubs of hidden posts.'],
        'Recursive Hiding': [true, 'Hide replies of hidden posts, recursively.']
      },
      'Images': {
        'Replace Loaded Images': [false, 'Replace image thumbnails that have been loaded through Image Hover or Image Expansion.'],
        'Replace JPG': [false, 'Replace thumbnails of JPGs with its actual image.'],
        'Replace PNG': [false, 'Replace thumbnails of PNGs with its actual image.'],
        'Replace GIF': [false, 'Animate GIF thumbnails.'],
        'Image Expansion': [true, 'Expand images inline.'],
        'Image Hover': [false, 'Show a floating expanded image on hover.'],
        'Image Hover in Catalog': [false, 'Show a floating expanded image on hover in the catalog.'],
        'Sauce': [true, 'Add sauce links to images.'],
        'Reveal Spoilers': [false, 'Reveal spoiler thumbnails.']
      },
      'Linkification': {
        'Linkify': [true, 'Convert text links into hyperlinks.'],
        'Embedding': [true, 'Embed supported content.'],
        'Floating Embeds': [true, 'Embedded content will scroll with page.'],
        'Link Titles': [true, 'Fetch and replace links with titles of embeddable content.'],
        'Cover Preview': [true, 'Show preview of links on hover.']
      },
      'Menu': {
        'Menu': [true, 'Add a drop-down menu to posts.'],
        'Report Link': [true, 'Add a report link to the menu.'],
        'Post Hiding Link': [true, 'Add a link to hide threads and replies.'],
        'Delete Link': [true, 'Add post and image deletion links to the menu.'],
        'Archive Link': [true, 'Add an archive link to the menu.']
      },
      'Monitoring': {
        'Thread Updater': [true, 'Fetch and insert new replies. Has more options in its own dialog.'],
        'Sync Thread Updater': [true, 'Sync refresh rate of Thread Updater across tabs.'],
        'Unread Count': [true, 'Show the unread posts count in the tab title.'],
        'Hide Unread Count at (0)': [false, 'Hide the unread posts count when it reaches 0.'],
        'Unread Tab Icon': [true, 'Show a different favicon when there are unread posts.'],
        'Unread Line': [true, 'Show a line to distinguish read posts from unread ones.'],
        'Scroll to Last Read Post': [true, 'Scroll back to the last read post when reopening a thread.'],
        'Thread Excerpt': [true, 'Show an excerpt of the thread in the tab title.'],
        'Thread Stats': [true, 'Display reply, image, and page count.'],
        'Thread Watcher': [true, 'Bookmark threads.'],
        'Color User IDs': [true, 'Assign unique colors to user IDs on boards that use them.']
      },
      'Posting': {
        'Quick Reply': [true, 'All-in-one form to reply, create threads, automate dumping and more.'],
        'Persistent QR': [false, 'The Quick reply won\'t disappear after posting.'],
        'Auto-Hide QR': [false, 'Automatically hide the quick reply when posting.'],
        'Open Post in New Tab': [true, 'Open new threads or replies to a thread from the index in a new tab.'],
        'Remember QR Size': [false, 'Remember the size of the Quick reply.'],
        'Remember Spoiler': [false, 'Remember the spoiler state, instead of resetting after posting.'],
        'Markdown': [false, 'Code, italic, bold, italic bold, double struck - `, *, **, ***, ||, respectively. _ can be used instead of *'],
        'Hide Original Post Form': [true, 'Hide the normal post form.'],
        'Cooldown': [true, 'Indicate the remaining time before posting again.']
      },
      'Quote Links': {
        'Quote Backlinks': [true, 'Add quote backlinks.'],
        'OP Backlinks': [true, 'Add backlinks to the OP.'],
        'Quote Inlining': [true, 'Inline quoted post on click.'],
        'Forward Hiding': [true, 'Hide original posts of inlined backlinks.'],
        'Quote Previewing': [true, 'Show quoted post on hover.'],
        'Quote Highlighting': [true, 'Highlight the previewed post.'],
        'Resurrect Quotes': [true, 'Link dead quotes to the archives.'],
        'Quote Markers': [true, 'Add "(You)", "(OP)", "(Cross-thread)", "(Dead)" markers to quote links.']
      }
    },
    imageExpansion: {
      'Fit width': [true, ''],
      'Fit height': [false, ''],
      'Expand spoilers': [false, 'Expand all images along with spoilers.'],
      'Expand from here': [true, 'Expand all images only from current position to thread end.']
    },
    threadWatcher: {
      'Current Board': [false, 'Only show watched threads from the current board.'],
      'Auto Watch': [true, 'Automatically watch threads you start.'],
      'Auto Watch Reply': [false, 'Automatically watch threads you reply to.'],
      'Auto Prune': [false, 'Automatically prune 404\'d threads.']
    },
    filter: {
      name: "# Filter any namefags:\n#/^(?!Anonymous$)/",
      uniqueID: "# Filter a specific ID:\n#/Txhvk1Tl/",
      tripcode: "# Filter any tripfag\n#/^!/",
      capcode: "# Set a custom class for mods:\n#/Mod$/;highlight:mod;op:yes\n# Set a custom class for moot:\n#/Admin$/;highlight:moot;op:yes",
      email: "",
      subject: "# Filter Generals on /v/:\n#/general/i;boards:v;op:only",
      comment: "# Filter Stallman copypasta on /g/:\n#/what you're refer+ing to as linux/i;boards:g",
      flag: "",
      filename: "",
      dimensions: "# Highlight potential wallpapers:\n#/1920x1080/;op:yes;highlight;top:no;boards:w,wg",
      filesize: "",
      MD5: ""
    },
    sauces: "https://www.google.com/searchbyimage?image_url=%TURL\nhttp://iqdb.org/?url=%TURL\n#//tineye.com/search?url=%TURL\n#http://saucenao.com/search.php?url=%TURL\n#http://3d.iqdb.org/?url=%TURL\n#http://regex.info/exif.cgi?imgurl=%URL\n# uploaders:\n#http://imgur.com/upload?url=%URL;text:Upload to imgur\n#http://ompldr.org/upload?url1=%URL;text:Upload to ompldr\n# \"View Same\" in archives:\n#//archive.foolz.us/_/search/image/%MD5/;text:View same on foolz\n#//archive.foolz.us/%board/search/image/%MD5/;text:View same on foolz /%board/\n#//archive.installgentoo.net/%board/image/%MD5;text:View same on installgentoo /%board/",
    'Custom CSS': false,
    Index: {
      'Index Mode': 'paged',
      'Previous Index Mode': 'paged',
      'Index Sort': 'bump',
      'Index Size': 'small',
      'Threads per Page': 0,
      'Open threads in a new tab': false,
      'Show Replies': true,
      'Refreshed Navigation': false
    },
    Header: {
      'Header auto-hide': false,
      'Header auto-hide on scroll': false,
      'Bottom header': false,
      'Top Board List': false,
      'Bottom Board List': false,
      'Custom Board Navigation': true
    },
    QR: {
      'QR.personas': "#email:\"sage\";boards:jp;always\nemail:\"sage\""
    },
    boardnav: '[current-title / toggle-all]',
    time: '%m/%d/%y(%a)%H:%M:%S',
    backlink: '>>%id',
    fileInfo: '%l (%p%s, %r)',
    favicon: 'ferongr',
    usercss: '',
    archivesLocation: 'https://4chan-x.org/archives.json',
    hotkeys: {
      'Toggle board list': ['Ctrl+b', 'Toggle the full board list.'],
      'Open empty QR': ['q', 'Open QR without post number inserted.'],
      'Open QR': ['Shift+q', 'Open QR with post number inserted.'],
      'Open settings': ['Alt+o', 'Open Settings.'],
      'Close': ['Esc', 'Close Settings, Notifications or QR.'],
      'Spoiler tags': ['Ctrl+s', 'Insert spoiler tags.'],
      'Code tags': ['Alt+c', 'Insert code tags.'],
      'Eqn tags': ['Alt+e', 'Insert eqn tags.'],
      'Math tags': ['Alt+m', 'Insert math tags.'],
      'Submit QR': ['Alt+s', 'Submit post.'],
      'Toggle Sage': ['Alt+n', 'Insert or remove sage from email field.'],
      'Update': ['r', 'Refresh the index/thread.'],
      'Watch': ['w', 'Watch thread.'],
      'Expand image': ['Shift+e', 'Expand selected image.'],
      'Expand images': ['e', 'Expand all images.'],
      'Front page': ['0', 'Jump to page 0.'],
      'Open front page': ['Shift+0', 'Open page 0 in a new tab.'],
      'Next page': ['Right', 'Jump to the next page.'],
      'Previous page': ['Left', 'Jump to the previous page.'],
      'Search form': ['Ctrl+Alt+s', 'Focus the search field on the board index.'],
      'Paged mode': ['Ctrl+1', 'Sets the index mode to paged.'],
      'All pages mode': ['Ctrl+2', 'Sets the index mode to all threads.'],
      'Catalog mode': ['Ctrl+3', 'Sets the index mode to catalog.'],
      'Cycle sort type': ['Ctrl+x', 'Cycle through index sort types.'],
      'Next thread': ['Down', 'See next thread.'],
      'Previous thread': ['Up', 'See previous thread.'],
      'Expand thread': ['Ctrl+e', 'Expand thread.'],
      'Open thread': ['o', 'Open thread in current tab.'],
      'Open thread tab': ['Shift+o', 'Open thread in new tab.'],
      'Next reply': ['j', 'Select next reply.'],
      'Previous reply': ['k', 'Select previous reply.'],
      'Deselect reply': ['Shift+d', 'Deselect reply.'],
      'Hide': ['x', 'Hide thread.']
    },
    updater: {
      checkbox: {
        'Beep': [false, 'Beep on new post to completely read thread.'],
        'Auto Scroll': [false, 'Scroll updated posts into view. Only enabled at bottom of page.'],
        'Bottom Scroll': [false, 'Always scroll to the bottom, not the first new post. Useful for event threads.'],
        'Scroll BG': [false, 'Auto-scroll background tabs.'],
        'Auto Update': [true, 'Automatically fetch new posts.']
      },
      'Interval': 30
    }
  };

  Conf = {};

  c = console;

  d = document;

  doc = d.documentElement;

  g = {
    VERSION: '3.13.15',
    NAMESPACE: '4chan X.',
    boards: {},
    threads: {},
    posts: {}
  };

  $ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelector(selector);
  };

  $$ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return __slice.call(root.querySelectorAll(selector));
  };

  $.SECOND = 1000;

  $.MINUTE = 1000 * 60;

  $.HOUR = 1000 * 60 * 60;

  $.DAY = 1000 * 60 * 60 * 24;

  $.id = function(id) {
    return d.getElementById(id);
  };

  $.ready = function(fc) {
    var cb;
    if (d.readyState !== 'loading') {
      $.queueTask(fc);
      return;
    }
    cb = function() {
      $.off(d, 'DOMContentLoaded', cb);
      return fc();
    };
    return $.on(d, 'DOMContentLoaded', cb);
  };

  $.formData = function(form) {
    var fd, key, val;
    if (form instanceof HTMLFormElement) {
      return new FormData(form);
    }
    fd = new FormData();
    for (key in form) {
      val = form[key];
      if (val) {
        if (typeof val === 'object' && 'newName' in val) {
          fd.append(key, val, val.newName);
        } else {
          fd.append(key, val);
        }
      }
    }
    return fd;
  };

  $.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
  };

  $.ajax = (function() {
    var lastModified;
    lastModified = {};
    return function(url, options, extra) {
      var form, r, sync, type, upCallbacks, whenModified;
      if (extra == null) {
        extra = {};
      }
      type = extra.type, whenModified = extra.whenModified, upCallbacks = extra.upCallbacks, form = extra.form, sync = extra.sync;
      r = new XMLHttpRequest();
      type || (type = form && 'post' || 'get');
      r.open(type, url, !sync);
      if (whenModified) {
        if (url in lastModified) {
          r.setRequestHeader('If-Modified-Since', lastModified[url]);
        }
        $.on(r, 'load', function() {
          return lastModified[url] = r.getResponseHeader('Last-Modified');
        });
      }
      if (/\.json$/.test(url)) {
        r.responseType = 'json';
      }
      $.extend(r, options);
      $.extend(r.upload, upCallbacks);
      r.send(form);
      return r;
    };
  })();

  $.cache = (function() {
    var reqs;
    reqs = {};
    return function(url, cb, options) {
      var req, rm;
      if (req = reqs[url]) {
        if (req.readyState === 4) {
          cb.call(req, req.evt);
        } else {
          req.callbacks.push(cb);
        }
        return;
      }
      rm = function() {
        return delete reqs[url];
      };
      req = $.ajax(url, options);
      $.on(req, 'load', function(e) {
        var _i, _len, _ref;
        _ref = this.callbacks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cb = _ref[_i];
          cb.call(this, e);
        }
        this.evt = e;
        return delete this.callbacks;
      });
      $.on(req, 'abort', rm);
      $.on(req, 'error', rm);
      req.callbacks = [cb];
      return reqs[url] = req;
    };
  })();

  $.cb = {
    checked: function() {
      $.set(this.name, this.checked);
      return Conf[this.name] = this.checked;
    },
    value: function() {
      $.set(this.name, this.value.trim());
      return Conf[this.name] = this.value;
    }
  };

  $.asap = function(test, cb) {
    if (test()) {
      return cb();
    } else {
      return setTimeout($.asap, 25, test, cb);
    }
  };

  $.addStyle = function(css) {
    var style;
    style = $.el('style', {
      textContent: css
    });
    $.asap((function() {
      return d.head;
    }), function() {
      return $.add(d.head, style);
    });
    return style;
  };

  $.x = function(path, root) {
    if (root == null) {
      root = d.body;
    }
    return d.evaluate(path, root, null, 8, null).singleNodeValue;
  };

  $.addClass = function() {
    var className, el, _ref;
    el = arguments[0], className = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return (_ref = el.classList).add.apply(_ref, className);
  };

  $.rmClass = function() {
    var className, el, _ref;
    el = arguments[0], className = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return (_ref = el.classList).remove.apply(_ref, className);
  };

  $.hasClass = function(el, className) {
    return el.classList.contains(className);
  };

  $.rm = function(el) {
    return el.remove();
  };

  $.rmAll = function(root) {
    return root.textContent = null;
  };

  $.tn = function(s) {
    return d.createTextNode(s);
  };

  $.nodes = function(nodes) {
    var frag, node, _i, _len;
    if (!(nodes instanceof Array)) {
      return nodes;
    }
    frag = d.createDocumentFragment();
    for (_i = 0, _len = nodes.length; _i < _len; _i++) {
      node = nodes[_i];
      frag.appendChild(node);
    }
    return frag;
  };

  $.add = function(parent, el) {
    return parent.appendChild($.nodes(el));
  };

  $.prepend = function(parent, el) {
    return parent.insertBefore($.nodes(el), parent.firstChild);
  };

  $.after = function(root, el) {
    return root.parentNode.insertBefore($.nodes(el), root.nextSibling);
  };

  $.before = function(root, el) {
    return root.parentNode.insertBefore($.nodes(el), root);
  };

  $.replace = function(root, el) {
    return root.parentNode.replaceChild($.nodes(el), root);
  };

  $.el = function(tag, properties) {
    var el;
    el = d.createElement(tag);
    if (properties) {
      $.extend(el, properties);
    }
    return el;
  };

  $.on = function(el, events, handler) {
    var event, _i, _len, _ref;
    _ref = events.split(' ');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      event = _ref[_i];
      el.addEventListener(event, handler, false);
    }
  };

  $.off = function(el, events, handler) {
    var event, _i, _len, _ref;
    _ref = events.split(' ');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      event = _ref[_i];
      el.removeEventListener(event, handler, false);
    }
  };

  $.event = function(event, detail, root) {
    if (root == null) {
      root = d;
    }
    if ((detail != null) && typeof cloneInto === 'function') {
      detail = cloneInto(detail, d.defaultView);
    }
    return root.dispatchEvent(new CustomEvent(event, {
      bubbles: true,
      detail: detail
    }));
  };

  $.open = GM_openInTab;

  $.debounce = function(wait, fn) {
    var args, exec, lastCall, that, timeout;
    lastCall = 0;
    timeout = null;
    that = null;
    args = null;
    exec = function() {
      lastCall = Date.now();
      return fn.apply(that, args);
    };
    return function() {
      args = arguments;
      that = this;
      if (lastCall < Date.now() - wait) {
        return exec();
      }
      clearTimeout(timeout);
      return timeout = setTimeout(exec, wait);
    };
  };

  $.queueTask = (function() {
    var execTask, taskChannel, taskQueue;
    taskQueue = [];
    execTask = function() {
      var args, func, task;
      task = taskQueue.shift();
      func = task[0];
      args = Array.prototype.slice.call(task, 1);
      return func.apply(func, args);
    };
    if (window.MessageChannel) {
      taskChannel = new MessageChannel();
      taskChannel.port1.onmessage = execTask;
      return function() {
        taskQueue.push(arguments);
        return taskChannel.port2.postMessage(null);
      };
    } else {
      return function() {
        taskQueue.push(arguments);
        return setTimeout(execTask, 0);
      };
    }
  })();

  $.globalEval = function(code) {
    var script;
    script = $.el('script', {
      textContent: code
    });
    $.add(d.head || doc, script);
    return $.rm(script);
  };

  $.bytesToString = function(size) {
    var unit;
    unit = 0;
    while (size >= 1024) {
      size /= 1024;
      unit++;
    }
    size = unit > 1 ? Math.round(size * 100) / 100 : Math.round(size);
    return "" + size + " " + ['B', 'KB', 'MB', 'GB'][unit];
  };

  $.item = function(key, val) {
    var item;
    item = {};
    item[key] = val;
    return item;
  };

  $.syncing = {};

  $.sync = (function() {
    $.on(window, 'storage', function(e) {
      var cb;
      if (cb = $.syncing[e.key]) {
        return cb(JSON.parse(e.newValue));
      }
    });
    return function(key, cb) {
      return $.syncing[g.NAMESPACE + key] = cb;
    };
  })();

  $.sync = (function() {
    $.on(window, 'storage', function(_arg) {
      var cb, key, newValue;
      key = _arg.key, newValue = _arg.newValue;
      if (cb = $.syncing[key]) {
        return cb(JSON.parse(newValue), key);
      }
    });
    return function(key, cb) {
      return $.syncing[g.NAMESPACE + key] = cb;
    };
  })();

  $["delete"] = function(keys) {
    var key, _i, _len;
    if (!(keys instanceof Array)) {
      keys = [keys];
    }
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      key = g.NAMESPACE + key;
      localStorage.removeItem(key);
      GM_deleteValue(key);
    }
  };

  $.get = function(key, val, cb) {
    var items;
    if (typeof cb === 'function') {
      items = $.item(key, val);
    } else {
      items = key;
      cb = val;
    }
    return $.queueTask(function() {
      for (key in items) {
        if (val = GM_getValue(g.NAMESPACE + key)) {
          items[key] = JSON.parse(val);
        }
      }
      return cb(items);
    });
  };

  $.set = (function() {
    var set;
    set = function(key, val) {
      key = g.NAMESPACE + key;
      val = JSON.stringify(val);
      if (key in $.syncing) {
        localStorage.setItem(key, val);
      }
      return GM_setValue(key, val);
    };
    return function(keys, val) {
      var key;
      if (typeof keys === 'string') {
        set(keys, val);
        return;
      }
      for (key in keys) {
        val = keys[key];
        set(key, val);
      }
    };
  })();

  $.clear = function(cb) {
    $["delete"](GM_listValues().map(function(key) {
      return key.replace(g.NAMESPACE, '');
    }));
    return typeof cb === "function" ? cb() : void 0;
  };

  Polyfill = {
    init: function() {},
    toBlob: function() {
      var _base;
      return (_base = HTMLCanvasElement.prototype).toBlob || (_base.toBlob = function(cb) {
        var data, i, l, ui8a, _i;
        data = atob(this.toDataURL().slice(22));
        l = data.length;
        ui8a = new Uint8Array(l);
        for (i = _i = 0; _i < l; i = _i += 1) {
          ui8a[i] = data.charCodeAt(i);
        }
        return cb(new Blob([ui8a], {
          type: 'image/png'
        }));
      });
    }
  };

  UI = (function() {
    var Menu, dialog, drag, dragend, dragstart, hover, hoverend, hoverstart, touchend, touchmove;
    dialog = function(id, position, html) {
      var el;
      el = $.el('div', {
        className: 'dialog',
        innerHTML: html,
        id: id
      });
      el.style.cssText = position;
      $.get("" + id + ".position", position, function(item) {
        return el.style.cssText = item["" + id + ".position"];
      });
      $.on($('.move', el), 'touchstart mousedown', dragstart);
      return el;
    };
    Menu = (function() {
      var currentMenu, lastToggledButton;

      currentMenu = null;

      lastToggledButton = null;

      function Menu() {
        this.onFocus = __bind(this.onFocus, this);
        this.keybinds = __bind(this.keybinds, this);
        this.close = __bind(this.close, this);
        this.entries = [];
      }

      Menu.prototype.makeMenu = function() {
        var menu;
        menu = $.el('div', {
          className: 'dialog',
          id: 'menu',
          tabIndex: 0
        });
        $.on(menu, 'click', function(e) {
          return e.stopPropagation();
        });
        $.on(menu, 'keydown', this.keybinds);
        return menu;
      };

      Menu.prototype.toggle = function(e, button, data) {
        var previousButton;
        e.preventDefault();
        e.stopPropagation();
        if (currentMenu) {
          previousButton = lastToggledButton;
          this.close();
          if (previousButton === button) {
            return;
          }
        }
        if (!this.entries.length) {
          return;
        }
        return this.open(button, data);
      };

      Menu.prototype.open = function(button, data) {
        var bLeft, bRect, bTop, cHeight, cWidth, entry, mRect, menu, prevEntry, _i, _len, _ref;
        menu = this.makeMenu();
        currentMenu = menu;
        lastToggledButton = button;
        $.addClass(button, 'open');
        _ref = this.entries;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          this.insertEntry(entry, menu, data);
        }
        entry = $('.entry', menu);
        while (prevEntry = this.findNextEntry(entry, -1)) {
          entry = prevEntry;
        }
        this.focus(entry);
        $.on(d, 'click', this.close);
        $.on(d, 'CloseMenu', this.close);
        $.add(button, menu);
        mRect = menu.getBoundingClientRect();
        bRect = button.getBoundingClientRect();
        bTop = window.scrollY + bRect.top;
        bLeft = window.scrollX + bRect.left;
        cHeight = doc.clientHeight;
        cWidth = doc.clientWidth;
        if (bRect.top + bRect.height + mRect.height < cHeight) {
          $.addClass(menu, 'top');
          $.rmClass(menu, 'bottom');
        } else {
          $.addClass(menu, 'bottom');
          $.rmClass(menu, 'top');
        }
        if (bRect.left + mRect.width < cWidth) {
          $.addClass(menu, 'left');
          $.rmClass(menu, 'right');
        } else {
          $.addClass(menu, 'right');
          $.rmClass(menu, 'left');
        }
        return menu.focus();
      };

      Menu.prototype.insertEntry = function(entry, parent, data) {
        var subEntry, submenu, _i, _len, _ref;
        if (typeof entry.open === 'function') {
          if (!entry.open(data, (function(_this) {
            return function(subEntry) {
              _this.parseEntry(subEntry);
              return entry.subEntries.push(subEntry);
            };
          })(this))) {
            return;
          }
        }
        $.add(parent, entry.el);
        if (!entry.subEntries) {
          return;
        }
        if (submenu = $('.submenu', entry.el)) {
          $.rm(submenu);
        }
        submenu = $.el('div', {
          className: 'dialog submenu'
        });
        _ref = entry.subEntries;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subEntry = _ref[_i];
          this.insertEntry(subEntry, submenu, data);
        }
        $.add(entry.el, submenu);
      };

      Menu.prototype.close = function() {
        $.rm(currentMenu);
        $.rmClass(lastToggledButton, 'open');
        currentMenu = null;
        lastToggledButton = null;
        return $.off(d, 'click CloseMenu', this.close);
      };

      Menu.prototype.findNextEntry = function(entry, direction) {
        var entries;
        entries = __slice.call(entry.parentNode.children);
        entries.sort(function(first, second) {
          return first.style.order - second.style.order;
        });
        return entries[entries.indexOf(entry) + direction];
      };

      Menu.prototype.keybinds = function(e) {
        var entry, next, nextPrev, subEntry, submenu;
        entry = $('.focused', currentMenu);
        while (subEntry = $('.focused', entry)) {
          entry = subEntry;
        }
        switch (e.keyCode) {
          case 27:
            lastToggledButton.focus();
            this.close();
            break;
          case 13:
          case 32:
            entry.click();
            break;
          case 38:
            if (next = this.findNextEntry(entry, -1)) {
              this.focus(next);
            }
            break;
          case 40:
            if (next = this.findNextEntry(entry, +1)) {
              this.focus(next);
            }
            break;
          case 39:
            if ((submenu = $('.submenu', entry)) && (next = submenu.firstElementChild)) {
              while (nextPrev = this.findNextEntry(next, -1)) {
                next = nextPrev;
              }
              this.focus(next);
            }
            break;
          case 37:
            if (next = $.x('parent::*[contains(@class,"submenu")]/parent::*', entry)) {
              this.focus(next);
            }
            break;
          default:
            return;
        }
        e.preventDefault();
        return e.stopPropagation();
      };

      Menu.prototype.onFocus = function(e) {
        e.stopPropagation();
        return this.focus(e.target);
      };

      Menu.prototype.focus = function(entry) {
        var cHeight, cWidth, eRect, focused, sRect, submenu, _i, _len, _ref;
        while (focused = $.x('parent::*/child::*[contains(@class,"focused")]', entry)) {
          $.rmClass(focused, 'focused');
        }
        _ref = $$('.focused', entry);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          focused = _ref[_i];
          $.rmClass(focused, 'focused');
        }
        $.addClass(entry, 'focused');
        if (!(submenu = $('.submenu', entry))) {
          return;
        }
        sRect = submenu.getBoundingClientRect();
        eRect = entry.getBoundingClientRect();
        cHeight = doc.clientHeight;
        cWidth = doc.clientWidth;
        if (eRect.top + sRect.height < cHeight) {
          $.addClass(submenu, 'top');
          $.rmClass(submenu, 'bottom');
        } else {
          $.addClass(submenu, 'bottom');
          $.rmClass(submenu, 'top');
        }
        if (eRect.right + sRect.width < cWidth) {
          $.addClass(submenu, 'left');
          return $.rmClass(submenu, 'right');
        } else {
          $.addClass(submenu, 'right');
          return $.rmClass(submenu, 'left');
        }
      };

      Menu.prototype.addEntry = function(entry) {
        this.parseEntry(entry);
        return this.entries.push(entry);
      };

      Menu.prototype.parseEntry = function(entry) {
        var el, subEntries, subEntry, _i, _len;
        el = entry.el, subEntries = entry.subEntries;
        $.addClass(el, 'entry');
        $.on(el, 'focus mouseover', this.onFocus);
        el.style.order = entry.order || 100;
        if (!subEntries) {
          return;
        }
        $.addClass(el, 'has-submenu');
        for (_i = 0, _len = subEntries.length; _i < _len; _i++) {
          subEntry = subEntries[_i];
          this.parseEntry(subEntry);
        }
      };

      return Menu;

    })();
    dragstart = function(e) {
      var el, isTouching, o, rect, screenHeight, screenWidth, _ref;
      if (e.type === 'mousedown' && e.button !== 0) {
        return;
      }
      e.preventDefault();
      if (isTouching = e.type === 'touchstart') {
        _ref = e.changedTouches, e = _ref[_ref.length - 1];
      }
      el = $.x('ancestor::div[contains(@class,"dialog")][1]', this);
      rect = el.getBoundingClientRect();
      screenHeight = doc.clientHeight;
      screenWidth = doc.clientWidth;
      o = {
        id: el.id,
        style: el.style,
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top,
        height: screenHeight - rect.height,
        width: screenWidth - rect.width,
        screenHeight: screenHeight,
        screenWidth: screenWidth,
        isTouching: isTouching
      };
      if (isTouching) {
        o.identifier = e.identifier;
        o.move = touchmove.bind(o);
        o.up = touchend.bind(o);
        $.on(d, 'touchmove', o.move);
        return $.on(d, 'touchend touchcancel', o.up);
      } else {
        o.move = drag.bind(o);
        o.up = dragend.bind(o);
        $.on(d, 'mousemove', o.move);
        return $.on(d, 'mouseup', o.up);
      }
    };
    touchmove = function(e) {
      var touch, _i, _len, _ref;
      _ref = e.changedTouches;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        touch = _ref[_i];
        if (touch.identifier === this.identifier) {
          drag.call(this, touch);
          return;
        }
      }
    };
    drag = function(e) {
      var bottom, clientX, clientY, left, right, style, top;
      clientX = e.clientX, clientY = e.clientY;
      left = clientX - this.dx;
      left = left < 10 ? 0 : this.width - left < 10 ? null : left / this.screenWidth * 100 + '%';
      top = clientY - this.dy;
      top = top < 10 ? 0 : this.height - top < 10 ? null : top / this.screenHeight * 100 + '%';
      right = left === null ? 0 : null;
      bottom = top === null ? 0 : null;
      style = this.style;
      style.left = left;
      style.right = right;
      style.top = top;
      return style.bottom = bottom;
    };
    touchend = function(e) {
      var touch, _i, _len, _ref;
      _ref = e.changedTouches;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        touch = _ref[_i];
        if (touch.identifier === this.identifier) {
          dragend.call(this);
          return;
        }
      }
    };
    dragend = function() {
      if (this.isTouching) {
        $.off(d, 'touchmove', this.move);
        $.off(d, 'touchend touchcancel', this.up);
      } else {
        $.off(d, 'mousemove', this.move);
        $.off(d, 'mouseup', this.up);
      }
      return $.set("" + this.id + ".position", this.style.cssText);
    };
    hoverstart = function(_arg) {
      var asapTest, cb, el, endEvents, latestEvent, o, offsetX, offsetY, root;
      root = _arg.root, el = _arg.el, latestEvent = _arg.latestEvent, endEvents = _arg.endEvents, asapTest = _arg.asapTest, cb = _arg.cb, offsetX = _arg.offsetX, offsetY = _arg.offsetY;
      o = {
        root: root,
        el: el,
        style: el.style,
        cb: cb,
        endEvents: endEvents,
        latestEvent: latestEvent,
        clientHeight: doc.clientHeight,
        clientWidth: doc.clientWidth,
        offsetX: offsetX || 45,
        offsetY: offsetY || -120
      };
      o.hover = hover.bind(o);
      o.hoverend = hoverend.bind(o);
      if (asapTest) {
        $.asap(function() {
          return !el.parentNode || asapTest();
        }, function() {
          if (el.parentNode) {
            return o.hover(o.latestEvent);
          }
        });
      }
      $.on(root, endEvents, o.hoverend);
      $.on(root, 'mousemove', o.hover);
      o.workaround = function(e) {
        if (!root.contains(e.target)) {
          return o.hoverend();
        }
      };
      return $.on(doc, 'mousemove', o.workaround);
    };
    hover = function(e) {
      var clientX, clientY, height, left, right, style, top, _ref;
      this.latestEvent = e;
      height = this.el.offsetHeight;
      clientX = e.clientX, clientY = e.clientY;
      top = clientY + this.offsetY;
      top = this.clientHeight <= height || top <= 0 ? 0 : top + height >= this.clientHeight ? this.clientHeight - height : top;
      _ref = clientX <= this.clientWidth / 2 ? [clientX + this.offsetX + 'px', null] : [null, this.clientWidth - clientX + this.offsetX + 'px'], left = _ref[0], right = _ref[1];
      style = this.style;
      style.top = top + 'px';
      style.left = left;
      return style.right = right;
    };
    hoverend = function() {
      $.rm(this.el);
      $.off(this.root, this.endEvents, this.hoverend);
      $.off(this.root, 'mousemove', this.hover);
      $.off(doc, 'mousemove', this.workaround);
      if (this.cb) {
        return this.cb.call(this);
      }
    };
    return {
      dialog: dialog,
      Menu: Menu,
      hover: hoverstart
    };
  })();

  Header = {
    init: function() {
      var barPositionToggler, botBoardToggler, customNavToggler, editCustomNav, headerEl, headerToggler, menuButton, scrollHeaderToggler, topBoardToggler;
      headerEl = $.el('div', {
        id: 'header',
        innerHTML: "<div id=\"header-bar\" class=\"dialog\"><span id=\"shortcuts\" class=\"brackets-wrap\"></span><span id=\"board-list\"><span id=\"custom-board-list\"></span><span id=\"full-board-list\" hidden></span></span><div id=\"header-bar-hitzone\"></div></div><div id=\"notifications\"></div>"
      });
      this.bar = $('#header-bar', headerEl);
      this.hitzone = $('#header-bar-hitzone', this.bar);
      this.noticesRoot = $('#notifications', headerEl);
      this.menu = new UI.Menu();
      menuButton = $.el('a', {
        className: 'menu-button',
        innerHTML: '<i class="fa fa-bars"></i>',
        href: 'javascript:;'
      });
      $.on(menuButton, 'click', this.menuToggle);
      this.addShortcut(menuButton, 0);
      $.on(window, 'load hashchange', Header.hashScroll);
      $.on(d, 'CreateNotification', this.createNotification);
      headerToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Header auto-hide"> Auto-hide header'
      });
      scrollHeaderToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Header auto-hide on scroll"> Auto-hide header on scroll'
      });
      barPositionToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Bottom header"> Bottom header'
      });
      topBoardToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Top Board List"> Top original board list'
      });
      botBoardToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Bottom Board List"> Bottom original board list'
      });
      customNavToggler = $.el('label', {
        innerHTML: '<input type=checkbox name="Custom Board Navigation"> Custom board navigation'
      });
      editCustomNav = $.el('a', {
        textContent: 'Edit custom board navigation',
        href: 'javascript:;'
      });
      this.headerToggler = headerToggler.firstElementChild;
      this.scrollHeaderToggler = scrollHeaderToggler.firstElementChild;
      this.barPositionToggler = barPositionToggler.firstElementChild;
      this.topBoardToggler = topBoardToggler.firstElementChild;
      this.botBoardToggler = botBoardToggler.firstElementChild;
      this.customNavToggler = customNavToggler.firstElementChild;
      $.on(this.headerToggler, 'change', this.toggleBarVisibility);
      $.on(this.scrollHeaderToggler, 'change', this.toggleHideBarOnScroll);
      $.on(this.barPositionToggler, 'change', this.toggleBarPosition);
      $.on(this.topBoardToggler, 'change', this.toggleOriginalBoardList);
      $.on(this.botBoardToggler, 'change', this.toggleOriginalBoardList);
      $.on(this.customNavToggler, 'change', this.toggleCustomNav);
      $.on(editCustomNav, 'click', this.editCustomNav);
      this.setBarVisibility(Conf['Header auto-hide']);
      this.setHideBarOnScroll(Conf['Header auto-hide on scroll']);
      this.setBarPosition(Conf['Bottom header']);
      this.setTopBoardList(Conf['Top Board List']);
      this.setBotBoardList(Conf['Bottom Board List']);
      $.sync('Header auto-hide', this.setBarVisibility);
      $.sync('Header auto-hide on scroll', this.setHideBarOnScroll);
      $.sync('Bottom header', this.setBarPosition);
      $.sync('Top Board List', this.setTopBoardList);
      $.sync('Bottom Board List', this.setBotBoardList);
      this.menu.addEntry({
        el: $.el('span', {
          textContent: 'Header'
        }),
        order: 105,
        subEntries: [
          {
            el: headerToggler
          }, {
            el: scrollHeaderToggler
          }, {
            el: barPositionToggler
          }, {
            el: topBoardToggler
          }, {
            el: botBoardToggler
          }, {
            el: customNavToggler
          }, {
            el: editCustomNav
          }
        ]
      });
      $.asap((function() {
        return d.body;
      }), function() {
        if (!Main.isThisPageLegit()) {
          return;
        }
        $.asap((function() {
          return $.id('boardNavMobile') || d.readyState !== 'loading';
        }), Header.setBoardList);
        return $.prepend(d.body, headerEl);
      });
      $.ready(function() {
        var a;
        if (a = $("a[href*='/" + g.BOARD + "/']", $.id('boardNavDesktopFoot'))) {
          return a.className = 'current';
        }
      });
      return this.enableDesktopNotifications();
    },
    setBoardList: function() {
      var a, btn, fullBoardList, nav;
      nav = $.id('boardNavDesktop');
      if (a = $("a[href*='/" + g.BOARD + "/']", nav)) {
        a.className = 'current';
      }
      fullBoardList = $('#full-board-list', Header.bar);
      fullBoardList.innerHTML = nav.innerHTML;
      btn = $.el('span', {
        className: 'hide-board-list-button brackets-wrap',
        innerHTML: '<a href=javascript:;> - </a>'
      });
      $.on(btn, 'click', Header.toggleBoardList);
      $.add(fullBoardList, btn);
      Header.setCustomNav(Conf['Custom Board Navigation']);
      Header.generateBoardList(Conf['boardnav']);
      $.sync('Custom Board Navigation', Header.setCustomNav);
      return $.sync('boardnav', Header.generateBoardList);
    },
    generateBoardList: function(text) {
      var as, list, nodes, re;
      list = $('#custom-board-list', Header.bar);
      $.rmAll(list);
      if (!text) {
        return;
      }
      as = $$('.boardList a[title]', Header.bar);
      re = /[\w@]+(-(all|title|replace|full|archive|(mode|sort|text):"[^"]+"))*|break|[^\w@]+/g;
      nodes = text.match(re).map(function(t) {
        var a, boardID, href, m, type, _i, _len;
        if (/^[^\w@]/.test(t)) {
          return $.tn(t);
        }
        if (/^break/.test(t)) {
          return $.el('br');
        }
        if (/^toggle-all/.test(t)) {
          a = $.el('a', {
            className: 'show-board-list-button',
            textContent: (t.match(/-text:"(.+)"/) || [null, '+'])[1],
            href: 'javascript:;'
          });
          $.on(a, 'click', Header.toggleBoardList);
          return a;
        }
        boardID = t.split('-')[0];
        if (boardID === 'current') {
          boardID = g.BOARD.ID;
        }
        for (_i = 0, _len = as.length; _i < _len; _i++) {
          a = as[_i];
          if (!(a.textContent === boardID)) {
            continue;
          }
          a = a.cloneNode();
          break;
        }
        if (a.parentNode) {
          return $.tn(boardID);
        }
        a.textContent = /-title/.test(t) || /-replace/.test(t) && boardID === g.BOARD.ID ? a.title : /-full/.test(t) ? "/" + boardID + "/ - " + a.title : (m = t.match(/-text:"([^"]+)"/)) ? m[1] : boardID;
        if (/-archive/.test(t)) {
          if (href = Redirect.to('board', {
            boardID: boardID
          })) {
            a.href = href;
          } else {
            return a.firstChild;
          }
        }
        if (m = t.match(/-mode:"([^"]+)"/)) {
          type = m[1].toLowerCase();
          a.dataset.indexMode = (function() {
            switch (type) {
              case 'all threads':
                return 'all pages';
              case 'paged':
              case 'catalog':
                return type;
              default:
                return 'paged';
            }
          })();
        }
        if (m = t.match(/-sort:"([^"]+)"/)) {
          type = m[1].toLowerCase();
          a.dataset.indexSort = (function() {
            switch (type) {
              case 'bump order':
                return 'bump';
              case 'last reply':
                return 'lastreply';
              case 'creation date':
                return 'birth';
              case 'reply count':
                return 'replycount';
              case 'file count':
                return 'filecount';
              default:
                return 'bump';
            }
          })();
        }
        if (boardID === '@') {
          $.addClass(a, 'navSmall');
        }
        return a;
      });
      return $.add(list, nodes);
    },
    toggleBoardList: function() {
      var bar, custom, full, showBoardList;
      bar = Header.bar;
      custom = $('#custom-board-list', bar);
      full = $('#full-board-list', bar);
      showBoardList = !full.hidden;
      custom.hidden = !showBoardList;
      return full.hidden = showBoardList;
    },
    setBarVisibility: function(hide) {
      Header.headerToggler.checked = hide;
      return (hide ? $.addClass : $.rmClass)(Header.bar, 'autohide');
    },
    toggleBarVisibility: function(e) {
      var hide;
      hide = this.checked;
      Conf['Header auto-hide'] = hide;
      $.set('Header auto-hide', hide);
      return Header.setBarVisibility(hide);
    },
    setHideBarOnScroll: function(hide) {
      Header.scrollHeaderToggler.checked = hide;
      if (hide) {
        $.on(window, 'scroll', Header.hideBarOnScroll);
        return;
      }
      $.off(window, 'scroll', Header.hideBarOnScroll);
      $.rmClass(Header.bar, 'scroll');
      if (!Conf['Header auto-hide']) {
        return $.rmClass(Header.bar, 'autohide');
      }
    },
    toggleHideBarOnScroll: function() {
      $.cb.checked.call(this);
      return Header.setHideBarOnScroll(this.checked);
    },
    hideBarOnScroll: function() {
      var offsetY;
      offsetY = window.pageYOffset;
      if (offsetY > (Header.previousOffset || 0)) {
        $.addClass(Header.bar, 'autohide', 'scroll');
      } else {
        $.rmClass(Header.bar, 'autohide', 'scroll');
      }
      return Header.previousOffset = offsetY;
    },
    setBarPosition: function(bottom) {
      Header.barPositionToggler.checked = bottom;
      $.event('CloseMenu');
      if (bottom) {
        $.addClass(doc, 'bottom-header');
        $.rmClass(doc, 'top-header');
        return Header.bar.parentNode.className = 'bottom';
      } else {
        $.addClass(doc, 'top-header');
        $.rmClass(doc, 'bottom-header');
        return Header.bar.parentNode.className = 'top';
      }
    },
    toggleBarPosition: function() {
      $.cb.checked.call(this);
      return Header.setBarPosition(this.checked);
    },
    setTopBoardList: function(show) {
      Header.topBoardToggler.checked = show;
      if (show) {
        return $.addClass(doc, 'show-original-top-board-list');
      } else {
        return $.rmClass(doc, 'show-original-top-board-list');
      }
    },
    setBotBoardList: function(show) {
      Header.botBoardToggler.checked = show;
      if (show) {
        return $.addClass(doc, 'show-original-bot-board-list');
      } else {
        return $.rmClass(doc, 'show-original-bot-board-list');
      }
    },
    toggleOriginalBoardList: function() {
      $.cb.checked.call(this);
      return (this.name === 'Top Board List' ? Header.setTopBoardList : Header.setBotBoardList)(this.checked);
    },
    setCustomNav: function(show) {
      var btn, cust, full, _ref;
      Header.customNavToggler.checked = show;
      cust = $('#custom-board-list', Header.bar);
      full = $('#full-board-list', Header.bar);
      btn = $('.hide-board-list-button', full);
      return _ref = show ? [false, true, false] : [true, false, true], cust.hidden = _ref[0], full.hidden = _ref[1], btn.hidden = _ref[2], _ref;
    },
    toggleCustomNav: function() {
      $.cb.checked.call(this);
      return Header.setCustomNav(this.checked);
    },
    editCustomNav: function() {
      var settings;
      Settings.open('Rice');
      settings = $.id('fourchanx-settings');
      return $('input[name=boardnav]', settings).focus();
    },
    hashScroll: function() {
      var hash, post;
      hash = this.location.hash.slice(1);
      if (!(/^p\d+$/.test(hash) && (post = $.id(hash)))) {
        return;
      }
      if ((Get.postFromNode(post)).isHidden) {
        return;
      }
      return Header.scrollTo(post);
    },
    scrollTo: function(root, down, needed) {
      var height, x;
      if (down) {
        x = Header.getBottomOf(root);
        if (Conf['Header auto-hide on scroll'] && Conf['Bottom header']) {
          height = Header.bar.getBoundingClientRect().height;
          if (x <= 0) {
            if (!Header.isHidden()) {
              x += height;
            }
          } else {
            if (Header.isHidden()) {
              x -= height;
            }
          }
        }
        if (!(needed && x >= 0)) {
          return window.scrollBy(0, -x);
        }
      } else {
        x = Header.getTopOf(root);
        if (Conf['Header auto-hide on scroll'] && !Conf['Bottom header']) {
          height = Header.bar.getBoundingClientRect().height;
          if (x >= 0) {
            if (!Header.isHidden()) {
              x += height;
            }
          } else {
            if (Header.isHidden()) {
              x -= height;
            }
          }
        }
        if (!(needed && x >= 0)) {
          return window.scrollBy(0, x);
        }
      }
    },
    scrollToIfNeeded: function(root, down) {
      return Header.scrollTo(root, down, true);
    },
    getTopOf: function(root) {
      var headRect, top;
      top = root.getBoundingClientRect().top;
      if (!Conf['Bottom header']) {
        headRect = ($.hasClass(Header.bar, 'autohide') ? Header.hitzone : Header.bar).getBoundingClientRect();
        top -= headRect.top + headRect.height;
      }
      return top;
    },
    getBottomOf: function(root) {
      var bottom, clientHeight, headRect;
      clientHeight = doc.clientHeight;
      bottom = clientHeight - root.getBoundingClientRect().bottom;
      if (Conf['Bottom header']) {
        headRect = ($.hasClass(Header.bar, 'autohide') ? Header.hitzone : Header.bar).getBoundingClientRect();
        bottom -= clientHeight - headRect.bottom + headRect.height;
      }
      return bottom;
    },
    isNodeVisible: function(node) {
      var height;
      height = node.getBoundingClientRect().height;
      return Header.getTopOf(node) + height >= 0 && Header.getBottomOf(node) + height >= 0;
    },
    isHidden: function() {
      var top;
      top = Header.bar.getBoundingClientRect().top;
      if (Conf['Bottom header']) {
        return top === doc.clientHeight;
      } else {
        return top < 0;
      }
    },
    addShortcut: function(el, index) {
      var shortcut, shortcuts;
      shortcut = $.el('span', {
        className: 'shortcut'
      });
      shortcut.dataset.index = index;
      $.add(shortcut, el);
      shortcuts = $('#shortcuts', Header.bar);
      return $.add(shortcuts, __slice.call(shortcuts.childNodes).concat(shortcut).sort(function(a, b) {
        return a.dataset.index - b.dataset.index;
      }));
    },
    menuToggle: function(e) {
      return Header.menu.toggle(e, this, g);
    },
    createNotification: function(e) {
      var content, lifetime, notice, type, _ref;
      _ref = e.detail, type = _ref.type, content = _ref.content, lifetime = _ref.lifetime;
      return notice = new Notice(type, content, lifetime);
    },
    areNotificationsEnabled: false,
    enableDesktopNotifications: function() {
      var authorize, disable, el, notice, _ref;
      if (!(window.Notification && Conf['Desktop Notifications'])) {
        return;
      }
      switch (Notification.permission) {
        case 'granted':
          Header.areNotificationsEnabled = true;
          return;
        case 'denied':
          return;
      }
      el = $.el('span', {
        innerHTML: "Desktop notification permissions are not granted.\n[<a href='https://github.com/MayhemYDG/4chan-x/wiki/FAQ#desktop-notifications' target=_blank>FAQ</a>]<br>\n<button>Authorize</button> or <button>Disable</button>"
      });
      _ref = $$('button', el), authorize = _ref[0], disable = _ref[1];
      $.on(authorize, 'click', function() {
        return Notification.requestPermission(function(status) {
          Header.areNotificationsEnabled = status === 'granted';
          if (status === 'default') {
            return;
          }
          return notice.close();
        });
      });
      $.on(disable, 'click', function() {
        $.set('Desktop Notifications', false);
        return notice.close();
      });
      return notice = new Notice('info', el);
    }
  };

  Notice = (function() {
    function Notice(type, content, timeout) {
      this.timeout = timeout;
      this.close = __bind(this.close, this);
      this.add = __bind(this.add, this);
      this.el = $.el('div', {
        innerHTML: '<a href=javascript:; class="close fa fa-times" title=Close></a><div class=message></div>'
      });
      this.el.style.opacity = 0;
      this.setType(type);
      $.on(this.el.firstElementChild, 'click', this.close);
      if (typeof content === 'string') {
        content = $.tn(content);
      }
      $.add(this.el.lastElementChild, content);
      $.ready(this.add);
    }

    Notice.prototype.setType = function(type) {
      return this.el.className = "notification " + type;
    };

    Notice.prototype.add = function() {
      if (d.hidden) {
        $.on(d, 'visibilitychange', this.add);
        return;
      }
      $.off(d, 'visibilitychange', this.add);
      $.add(Header.noticesRoot, this.el);
      this.el.clientHeight;
      this.el.style.opacity = 1;
      if (this.timeout) {
        return setTimeout(this.close, this.timeout * $.SECOND);
      }
    };

    Notice.prototype.close = function() {
      $.off(d, 'visibilitychange', this.add);
      return $.rm(this.el);
    };

    return Notice;

  })();

  Settings = {
    init: function() {
      var link, settings;
      link = $.el('a', {
        className: 'settings-link',
        textContent: '4chan X Settings',
        href: 'javascript:;'
      });
      $.on(link, 'click', Settings.open);
      Header.menu.addEntry({
        el: link,
        order: 111
      });
      Settings.addSection('Main', Settings.main);
      Settings.addSection('Filter', Settings.filter);
      Settings.addSection('QR', Settings.qr);
      Settings.addSection('Sauce', Settings.sauce);
      Settings.addSection('Rice', Settings.rice);
      Settings.addSection('Archives', Settings.archives);
      Settings.addSection('Keybinds', Settings.keybinds);
      Settings.addSection('Refresh', Settings.refresh);
      $.on(d, 'OpenSettings', function(e) {
        return Settings.open(e.detail);
      });
      settings = JSON.parse(localStorage.getItem('4chan-settings')) || {};
      if (settings.disableAll) {
        return;
      }
      settings.disableAll = true;
      return localStorage.setItem('4chan-settings', JSON.stringify(settings));
    },
    open: function(openSection) {
      var html, link, links, overlay, section, sectionToOpen, _i, _len, _ref;
      if (Settings.dialog) {
        return;
      }
      $.event('CloseMenu');
      html = "<div id=\"fourchanx-settings\" class=\"dialog\"><nav><div class=\"sections-list\"></div><div class=\"credits\"><a href=\"https://4chan-x.org/\" target=\"_blank\">4chan X</a>&nbsp;|&nbsp;<a href=\"https://github.com/ihavenoface/4chan-x/blob/v3/CHANGELOG.md\" target=\"_blank\">" + g.VERSION + "</a>&nbsp;|&nbsp;<a href=\"https://github.com/ihavenoface/4chan-x/blob/v3/CONTRIBUTING.md#reporting-bugs-and-suggestions\" target=\"_blank\">Issues</a>&nbsp;|&nbsp;<a href=\"javascript:;\" class=\"close fa fa-times\" title=\"Close\"></a></div></nav><section></section></div>";
      Settings.dialog = overlay = $.el('div', {
        id: 'overlay',
        innerHTML: html
      });
      links = [];
      _ref = Settings.sections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        link = $.el('a', {
          className: "tab-" + section.hyphenatedTitle,
          textContent: section.title,
          href: 'javascript:;'
        });
        $.on(link, 'click', Settings.openSection.bind(section));
        links.push(link, $.tn(' | '));
        if (section.title === openSection) {
          sectionToOpen = link;
        }
      }
      links.pop();
      $.add($('.sections-list', overlay), links);
      (sectionToOpen ? sectionToOpen : links[0]).click();
      $.on($('.close', overlay), 'click', Settings.close);
      $.on(overlay, 'click', Settings.close);
      $.on(overlay.firstElementChild, 'click', function(e) {
        return e.stopPropagation();
      });
      d.body.style.width = "" + d.body.clientWidth + "px";
      $.addClass(d.body, 'unscroll');
      return $.add(d.body, overlay);
    },
    close: function() {
      if (!Settings.dialog) {
        return;
      }
      d.body.style.removeProperty('width');
      $.rmClass(d.body, 'unscroll');
      $.rm(Settings.dialog);
      return delete Settings.dialog;
    },
    sections: [],
    addSection: function(title, open) {
      var hyphenatedTitle;
      hyphenatedTitle = title.toLowerCase().replace(/\s+/g, '-');
      return Settings.sections.push({
        title: title,
        hyphenatedTitle: hyphenatedTitle,
        open: open
      });
    },
    openSection: function() {
      var section, selected;
      if (selected = $('.tab-selected', Settings.dialog)) {
        $.rmClass(selected, 'tab-selected');
      }
      $.addClass($(".tab-" + this.hyphenatedTitle, Settings.dialog), 'tab-selected');
      section = $('section', Settings.dialog);
      $.rmAll(section);
      section.className = "section-" + this.hyphenatedTitle;
      this.open(section, g);
      return section.scrollTop = 0;
    },
    main: function(section) {
      var arr, button, description, div, fs, input, inputs, items, key, obj, _ref;
      section.innerHTML = "<button class=\"export\">Export Settings</button><button class=\"import\">Import Settings</button><button class=\"reset\">Reset Settings</button><input type=\"file\" hidden>";
      $.on($('.export', section), 'click', Settings["export"]);
      $.on($('.import', section), 'click', Settings["import"]);
      $.on($('.reset', section), 'click', Settings.reset);
      $.on($('input', section), 'change', Settings.onImport);
      items = {};
      inputs = {};
      _ref = Config.main;
      for (key in _ref) {
        obj = _ref[key];
        fs = $.el('fieldset', {
          innerHTML: "<legend>" + key + "</legend>"
        });
        for (key in obj) {
          arr = obj[key];
          description = arr[1];
          div = $.el('div', {
            innerHTML: "<label><input type=checkbox name=\"" + key + "\">" + key + "</label><span class=description>: " + description + "</span>"
          });
          input = $('input', div);
          $.on(input, 'change', $.cb.checked);
          items[key] = Conf[key];
          inputs[key] = input;
          $.add(fs, div);
        }
        $.add(section, fs);
      }
      $.get(items, function(items) {
        var val;
        for (key in items) {
          val = items[key];
          inputs[key].checked = val;
        }
      });
      div = $.el('div', {
        innerHTML: "<button></button><span class=description>: Clear manually-hidden threads and posts on all boards. Reload the page to apply."
      });
      button = $('button', div);
      $.get('hiddenPosts', {}, function(_arg) {
        var ID, board, hiddenNum, hiddenPosts, thread, _ref1;
        hiddenPosts = _arg.hiddenPosts;
        hiddenNum = 0;
        _ref1 = hiddenPosts.boards;
        for (ID in _ref1) {
          board = _ref1[ID];
          for (ID in board) {
            thread = board[ID];
            hiddenNum += Object.keys(thread).length;
          }
        }
        return button.textContent = "Hidden: " + hiddenNum;
      });
      $.on(button, 'click', function() {
        this.textContent = 'Hidden: 0';
        return $["delete"]('hiddenPosts');
      });
      return $.after($('input[name="Recursive Hiding"]', section).parentNode.parentNode, div);
    },
    "export": function() {
      return $.get(Conf, function(Conf) {
        delete Conf['archives'];
        return Settings.downloadExport('Settings', {
          version: g.VERSION,
          date: Date.now(),
          Conf: Conf
        });
      });
    },
    downloadExport: function(title, data) {
      var a;
      a = $.el('a', {
        download: "4chan X v" + g.VERSION + " " + title + "." + data.date + ".json",
        href: "data:application/json;base64," + (btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))))
      });
      $.add(d.body, a);
      a.click();
      return $.rm(a);
    },
    "import": function() {
      return $('input[type=file]', this.parentNode).click();
    },
    onImport: function() {
      var file, reader;
      if (!(file = this.files[0])) {
        return;
      }
      if (!confirm('Your current settings will be entirely overwritten, are you sure?')) {
        return;
      }
      reader = new FileReader();
      reader.onload = function(e) {
        var err;
        try {
          Settings.loadSettings(JSON.parse(e.target.result));
        } catch (_error) {
          err = _error;
          alert('Import failed due to an error.');
          c.error(err.stack);
          return;
        }
        if (confirm('Import successful. Reload now?')) {
          return window.location.reload();
        }
      };
      return reader.readAsText(file);
    },
    loadSettings: function(data) {
      var convertSettings, key, val, version, _ref;
      version = data.version.split('.');
      if (version[0] === '2') {
        convertSettings = function(data, map) {
          var newKey, prevKey;
          for (prevKey in map) {
            newKey = map[prevKey];
            if (newKey) {
              data.Conf[newKey] = data.Conf[prevKey];
            }
            delete data.Conf[prevKey];
          }
          return data;
        };
        data = Settings.convertSettings(data, {
          'Disable 4chan\'s extension': '',
          'Catalog Links': '',
          'Reply Navigation': '',
          'Show Stubs': 'Stubs',
          'Image Auto-Gif': 'Auto-GIF',
          'Expand From Current': '',
          'Unread Favicon': 'Unread Tab Icon',
          'Post in Title': 'Thread Excerpt',
          'Auto Hide QR': '',
          'Open Reply in New Tab': '',
          'Remember QR size': '',
          'Quote Inline': 'Quote Inlining',
          'Quote Preview': 'Quote Previewing',
          'Indicate OP quote': '',
          'Indicate Cross-thread Quotes': '',
          'uniqueid': 'uniqueID',
          'mod': 'capcode',
          'country': 'flag',
          'md5': 'MD5',
          'openEmptyQR': 'Open empty QR',
          'openQR': 'Open QR',
          'openOptions': 'Open settings',
          'close': 'Close',
          'spoiler': 'Spoiler tags',
          'code': 'Code tags',
          'submit': 'Submit QR',
          'watch': 'Watch',
          'update': 'Update',
          'unreadCountTo0': '',
          'expandAllImages': 'Expand images',
          'expandImage': 'Expand image',
          'zero': 'Front page',
          'nextPage': 'Next page',
          'previousPage': 'Previous page',
          'nextThread': 'Next thread',
          'previousThread': 'Previous thread',
          'expandThread': 'Expand thread',
          'openThreadTab': 'Open thread',
          'openThread': 'Open thread tab',
          'nextReply': 'Next reply',
          'previousReply': 'Previous reply',
          'hide': 'Hide',
          'Scrolling': 'Auto Scroll',
          'Verbose': ''
        });
        data.Conf.sauces = data.Conf.sauces.replace(/\$\d/g, function(c) {
          switch (c) {
            case '$1':
              return '%TURL';
            case '$2':
              return '%URL';
            case '$3':
              return '%MD5';
            case '$4':
              return '%board';
            default:
              return c;
          }
        });
        _ref = Config.hotkeys;
        for (key in _ref) {
          val = _ref[key];
          if (key in data.Conf) {
            data.Conf[key] = data.Conf[key].replace(/ctrl|alt|meta/g, function(s) {
              return "" + (s[0].toUpperCase()) + s.slice(1);
            }).replace(/(^|.+\+)[A-Z]$/g, function(s) {
              return "Shift+" + s.slice(0, -1) + (s.slice(-1).toLowerCase());
            });
          }
        }
        data.Conf['WatchedThreads'] = data.WatchedThreads;
      }
      if (data.Conf['WatchedThreads']) {
        data.Conf['watchedThreads'] = {
          boards: ThreadWatcher.convert(data.Conf['WatchedThreads'])
        };
        delete data.Conf['WatchedThreads'];
      }
      return $.clear(function() {
        return $.set(data.Conf);
      });
    },
    reset: function() {
      if (confirm('Your current settings will be entirely wiped, are you sure?')) {
        return $.clear(function() {
          if (confirm('Reset successful. Reload now?')) {
            return window.location.reload();
          }
        });
      }
    },
    filter: function(section) {
      var select;
      section.innerHTML = "<select name=\"filter\"><option value=\"guide\">Guide</option><option value=\"name\">Name</option><option value=\"uniqueID\">Unique ID</option><option value=\"tripcode\">Tripcode</option><option value=\"capcode\">Capcode</option><option value=\"email\">E-mail</option><option value=\"subject\">Subject</option><option value=\"comment\">Comment</option><option value=\"flag\">Flag</option><option value=\"filename\">Filename</option><option value=\"dimensions\">Image dimensions</option><option value=\"filesize\">Filesize</option><option value=\"MD5\">Image MD5</option></select><div></div>";
      select = $('select', section);
      $.on(select, 'change', Settings.selectFilter);
      return Settings.selectFilter.call(select);
    },
    selectFilter: function() {
      var div, name, ta;
      div = this.nextElementSibling;
      if ((name = this.value) !== 'guide') {
        $.rmAll(div);
        ta = $.el('textarea', {
          name: name,
          className: 'field',
          spellcheck: false
        });
        $.get(name, Conf[name], function(item) {
          return ta.value = item[name];
        });
        $.on(ta, 'change', $.cb.value);
        $.add(div, ta);
        return;
      }
      return div.innerHTML = "<div class=\"warning\" " + (Conf['Filter'] ? 'hidden' : '') + "><code>Filter</code> is disabled.</div><p>Use <a href=\"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions\">regular expressions</a>, one per line.<br>Lines starting with a <code>#</code> will be ignored.<br>For example, <code>/weeaboo/i</code> will filter posts containing the string `<code>weeaboo</code>`, case-insensitive.<br>MD5 filtering uses exact string matching, not regular expressions.</p><ul>You can use these settings with each regular expression, separate them with semicolons:<li>Per boards, separate them with commas. It is global if not specified.<br>For example: <code>boards:a,jp;</code>.</li><li>Filter OPs only along with their threads (`only`), replies only (`no`), or both (`yes`, this is default).<br>For example: <code>op:only;</code>, <code>op:no;</code> or <code>op:yes;</code>.</li><li>Overrule the `Show Stubs` setting if specified: create a stub (`yes`) or not (`no`).<br>For example: <code>stub:yes;</code> or <code>stub:no;</code>.</li><li>Highlight instead of hiding. You can specify a class name to use with a userstyle.<br>For example: <code>highlight;</code> or <code>highlight:wallpaper;</code>.</li><li>Highlighted OPs will have their threads put on top of the board index by default.<br>For example: <code>top:yes;</code> or <code>top:no;</code>.</li></ul>";
    },
    qr: function(section) {
      var ta;
      section.innerHTML = "<fieldset><legend>Quick Reply Personas <span class=\"warning\" " + (Conf['Quick Reply'] ? 'hidden' : '') + ">is disabled.</span></legend><textarea name=\"QR.personas\" class=\"field\" spellcheck=\"false\"></textarea><p>One item per line.<br>Items will be added in the relevant input's auto-completion list.<br>Password items will always be used, since there is no password input.<br>Lines starting with a <code>#</code> will be ignored.</p><ul>You can use these settings with each item, separate them with semicolons:<li>Possible items are: <code>name</code>, <code>email</code>, <code>subject</code> and <code>password</code>.</li><li>Wrap values of items with quotes, like this: <code>email:\"sage\"</code>.</li><li>Force values as defaults with the <code>always</code> keyword, for example: <code>email:\"sage\";always</code>.</li><li>Select specific boards for an item, separated with commas, for example: <code>email:\"sage\";boards:jp;always</code>.</li></ul></fieldset><fieldset><legend>Quick Reply Cooldowns</legend><div name=\"QR.cooldowns\"></div></fieldset>";
      ta = $('textarea', section);
      $.get('QR.personas', Conf['QR.personas'], function(item) {
        return ta.value = item['QR.personas'];
      });
      $.on(ta, 'change', $.cb.value);
      if (!Conf['Cooldown']) {
        $.rm($('[name="QR.cooldowns"]', section).parentNode);
        return;
      }
      Settings.cooldowns.section = section;
      return QR.cooldown.getDefaults(QR.cooldown.get, Settings.cooldowns);
    },
    cooldowns: function(_arg) {
      var container, defaults, el, key, min, section, types, val;
      defaults = _arg.defaults, types = _arg.types;
      section = Settings.cooldowns.section;
      container = $('[name="QR.cooldowns"]', section);
      for (key in types) {
        val = types[key];
        min = defaults[key];
        el = $.el('div', {
          innerHTML: "<input class=field type=number placeholder=" + min + " min=" + min + " name=" + key + " value=" + (val > min ? val : '') + ">: " + key
        });
        $.on(el.firstChild, 'blur change', function(e) {
          min = parseInt(this.min);
          val = parseInt(this.value);
          if (!val || val < min) {
            this.value = '';
            val = min;
          }
          if (types[this.name] === val) {
            return;
          }
          types[this.name] = val;
          return $.get('QR.cooldowns', {}, function(item) {
            item = item['QR.cooldowns'];
            item[g.BOARD] = types;
            return $.set('QR.cooldowns', item);
          });
        });
        $.add(container, el);
      }
    },
    sauce: function(section) {
      var ta;
      section.innerHTML = "<div class=\"warning\" " + (Conf['Sauce'] ? 'hidden' : '') + "><code>Sauce</code> is disabled.</div><div>Lines starting with a <code>#</code> will be ignored.</div><div>You can specify a display text by appending <code>;text:[text]</code> to the URL.</div><ul>These parameters will be replaced by their corresponding values:<li><code>%TURL</code>: Thumbnail URL.</li><li><code>%URL</code>: Full image URL.</li><li><code>%MD5</code>: MD5 hash.</li><li><code>%name</code>: Original file name.</li><li><code>%board</code>: Current board.</li></ul><textarea name=\"sauces\" class=\"field\" spellcheck=\"false\"></textarea>";
      ta = $('textarea', section);
      $.get('sauces', Conf['sauces'], function(item) {
        return ta.value = item['sauces'];
      });
      return $.on(ta, 'change', $.cb.value);
    },
    rice: function(section) {
      var input, inputs, items, name, _i, _len, _ref;
      section.innerHTML = "<fieldset><legend>Custom Board Navigation <span class=\"warning\" " + (Conf['Custom Board Navigation'] ? 'hidden' : '') + ">is disabled.</span></legend><div><input name=\"boardnav\" class=\"field\" spellcheck=\"false\"></div><div>In the following, <code>board</code> can translate to a board ID (<code>a</code>, <code>b</code>, etc...), the current board (<code>current</code>), or the Twitter link (<code>@</code>),</div><div>as well as Rules (<code>Rules</code>), FAQ, Feedback, Status and Home.</div><div>Board link: <code>board</code></div><div>Archive link: <code>board-archive</code></div><div>Title link: <code>board-title</code></div><div>Board link (Replace with title when on that board): <code>board-replace</code></div><div>Full text link: <code>board-full</code></div><div>Custom text link: <code>board-text:\"VIP Board\"</code></div><div>Manually break content: <code>break</code></div><div>Index mode: <code>board-mode:\"type\"</code> where type is <code>paged</code>, <code>all threads</code> or <code>catalog</code></div><div>Index sort: <code>board-sort:\"type\"</code> where type is <code>bump order</code>, <code>last reply</code>, <code>creation date</code>, <code>reply count</code> or <code>file count</code></div><div>Combinations are possible: <code>board-text:\"VIP Catalog\"-mode:\"catalog\"-sort:\"creation date\"</code></div><div>Full board list toggle: <code>toggle-all</code></div></fieldset><fieldset><legend>Time Formatting <span class=\"warning\" " + (Conf['Time Formatting'] ? 'hidden' : '') + ">is disabled.</span></legend><div><input name=\"time\" class=\"field\" spellcheck=\"false\">: <span class=\"time-preview\"></span></div><div>Supported <a href=\"//en.wikipedia.org/wiki/Date_%28Unix%29#Formatting\">format specifiers</a>:</div><div>Day: <code>%a</code>, <code>%A</code>, <code>%d</code>, <code>%e</code></div><div>Month: <code>%m</code>, <code>%b</code>, <code>%B</code></div><div>Year: <code>%y</code>, <code>20%y</code></div><div>Hour: <code>%k</code>, <code>%H</code>, <code>%l</code>, <code>%I</code>, <code>%p</code>, <code>%P</code></div><div>Minute: <code>%M</code></div><div>Second: <code>%S</code></div></fieldset><fieldset><legend>Quote Backlinks formatting <span class=\"warning\" " + (Conf['Quote Backlinks'] ? 'hidden' : '') + ">is disabled.</span></legend><div><input name=\"backlink\" class=\"field\" spellcheck=\"false\">: <span class=\"backlink-preview\"></span></div></fieldset><fieldset><legend>File Info Formatting <span class=\"warning\" " + (Conf['File Info Formatting'] ? 'hidden' : '') + ">is disabled.</span></legend><div><input name=\"fileInfo\" class=\"field\" spellcheck=\"false\">: <span class=\"file-info file-info-preview\"></span></div><div>Link: <code>%l</code> (truncated), <code>%L</code> (untruncated), <code>%T</code> (Unix timestamp)</div><div>Original file name: <code>%n</code> (truncated), <code>%N</code> (untruncated), <code>%t</code> (Unix timestamp)</div><div>Spoiler indicator: <code>%p</code></div><div>Size: <code>%B</code> (Bytes), <code>%K</code> (KB), <code>%M</code> (MB), <code>%s</code> (4chan default)</div><div>Resolution: <code>%r</code> (Displays 'PDF' for PDF files)</div></fieldset><fieldset><legend>Unread Tab Icon <span class=\"warning\" " + (Conf['Unread Tab Icon'] ? 'hidden' : '') + ">is disabled.</span></legend><select name=\"favicon\"><option value=\"ferongr\">ferongr</option><option value=\"xat-\">xat-</option><option value=\"Mayhem\">Mayhem</option><option value=\"Original\">Original</option></select><span class=\"favicon-preview\"></span></fieldset><fieldset><legend><label><input type=\"checkbox\" name=\"Custom CSS\" " + (Conf['Custom CSS'] ? 'checked' : '') + "> Custom CSS</label></legend><button id=\"apply-css\">Apply CSS</button><textarea name=\"usercss\" class=\"field\" spellcheck=\"false\" " + (Conf['Custom CSS'] ? '' : 'disabled') + "></textarea></fieldset>";
      items = {};
      inputs = {};
      _ref = ['boardnav', 'time', 'backlink', 'fileInfo', 'favicon', 'usercss'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        input = $("[name=" + name + "]", section);
        items[name] = Conf[name];
        inputs[name] = input;
        $.on(input, 'change', $.cb.value);
      }
      $.get(items, function(items) {
        var event, key, val;
        for (key in items) {
          val = items[key];
          input = inputs[key];
          input.value = val;
          if (key === 'usercss') {
            continue;
          }
          event = key === 'favicon' || key === 'usercss' ? 'change' : 'input';
          $.on(input, event, Settings[key]);
          Settings[key].call(input);
        }
      });
      $.on($('input[name="Custom CSS"]', section), 'change', Settings.togglecss);
      return $.on($('#apply-css', section), 'click', Settings.usercss);
    },
    boardnav: function() {
      return Header.generateBoardList(this.value);
    },
    time: function() {
      var funk;
      funk = Time.createFunc(this.value);
      return this.nextElementSibling.textContent = funk(Time, new Date());
    },
    backlink: function() {
      return this.nextElementSibling.textContent = this.value.replace(/%id/, '123456789');
    },
    fileInfo: function() {
      var data, funk;
      data = {
        isReply: true,
        file: {
          URL: '//i.4cdn.org/g/1334437723720.jpg',
          name: 'd9bb2efc98dd0df141a94399ff5880b7.jpg',
          size: '276 KB',
          sizeInBytes: 276 * 1024,
          dimensions: '1280x720',
          isImage: true,
          isVideo: false,
          isSpoiler: true
        }
      };
      funk = FileInfo.createFunc(this.value);
      return this.nextElementSibling.innerHTML = funk(FileInfo, data);
    },
    favicon: function() {
      Favicon["switch"]();
      if (g.VIEW === 'thread' && Conf['Unread Tab Icon']) {
        Unread.update();
      }
      return this.nextElementSibling.innerHTML = "<img src=" + Favicon["default"] + ">\n<img src=" + Favicon.unreadSFW + ">\n<img src=" + Favicon.unreadNSFW + ">\n<img src=" + Favicon.unreadDead + ">";
    },
    togglecss: function() {
      if ($('textarea[name=usercss]', $.x('ancestor::fieldset[1]', this)).disabled = !this.checked) {
        CustomCSS.rmStyle();
      } else {
        CustomCSS.addStyle();
      }
      return $.cb.checked.call(this);
    },
    usercss: function() {
      return CustomCSS.update();
    },
    archives: function(section) {
      var button, input, name;
      section.innerHTML = "<div class=\"warning\" " + (Conf['404 Redirect'] ? 'hidden' : '') + "><code>404 Redirect</code> is disabled.</div><p>Disabled selections indicate that only one archive is available for that board and redirection type.</p><p><button>Update from:</button><input name=\"archivesLocation\" class=\"field\" spellcheck=\"false\"> Last updated: <time></time></p><table><caption>Archived boards</caption><thead><th>Board</th><th>Thread redirection</th><th>Post fetching</th><th>File redirection</th></thead><tbody></tbody></table>";
      name = 'archivesLocation';
      input = $("[name=" + name + "]", section);
      $.get(name, {}, function(_arg) {
        var archivesLocation;
        archivesLocation = _arg.archivesLocation;
        return input.value = Conf['archivesLocation'] = !archivesLocation || archivesLocation === 'http://4chan-x.cf/archives.json' ? 'https://4chan-x.org/archives.json' : archivesLocation;
      });
      $.on(input, 'change', $.cb.value);
      button = $('button', section);
      $.on(button, 'click', function() {
        $["delete"]('lastarchivecheck');
        button.textContent = '...';
        button.disabled = true;
        return Redirect.update(function() {
          button.textContent = 'Updated';
          return Settings.addArchivesTable(section);
        });
      });
      return Settings.addArchivesTable(section);
    },
    addArchivesTable: function(section) {
      var archive, boardID, boards, data, row, rows, tbody, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      boards = {};
      _ref = Conf['archives'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        archive = _ref[_i];
        _ref1 = archive.boards;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          boardID = _ref1[_j];
          data = boards[boardID] || (boards[boardID] = {
            thread: [],
            post: [],
            file: []
          });
          data.thread.push(archive);
          if (archive.software === 'foolfuuka') {
            data.post.push(archive);
          }
          if (__indexOf.call(archive.files, boardID) >= 0) {
            data.file.push(archive);
          }
        }
      }
      rows = [];
      _ref2 = Object.keys(boards).sort();
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        boardID = _ref2[_k];
        row = $.el('tr');
        rows.push(row);
        $.add(row, $.el('th', {
          textContent: "/" + boardID + "/",
          className: boardID === g.BOARD.ID ? 'warning' : ''
        }));
        data = boards[boardID];
        Settings.addArchiveCell(row, boardID, data, 'thread');
        Settings.addArchiveCell(row, boardID, data, 'post');
        Settings.addArchiveCell(row, boardID, data, 'file');
      }
      tbody = $('tbody', section);
      $.rmAll(tbody);
      $.add(tbody, rows);
      return $.get({
        lastarchivecheck: 0,
        selectedArchives: Conf['selectedArchives']
      }, function(_arg) {
        var lastarchivecheck, option, selectedArchives, type, uid;
        lastarchivecheck = _arg.lastarchivecheck, selectedArchives = _arg.selectedArchives;
        for (boardID in selectedArchives) {
          data = selectedArchives[boardID];
          for (type in data) {
            uid = data[type];
            if (option = $("select[data-board-i-d='" + boardID + "'][data-type='" + type + "'] > option[value='" + uid + "']", section)) {
              option.selected = true;
            }
          }
        }
        return $('time', section).textContent = new Date(lastarchivecheck).toLocaleString();
      });
    },
    addArchiveCell: function(row, boardID, data, type) {
      var archive, length, options, select, td, _i, _len, _ref;
      options = [];
      _ref = data[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        archive = _ref[_i];
        options.push($.el('option', {
          textContent: archive.name,
          value: archive.uid
        }));
      }
      td = $.el('td');
      length = options.length;
      if (length) {
        td.innerHTML = '<select></select>';
        select = td.firstElementChild;
        if (!(select.disabled = length === 1)) {
          $.extend(select.dataset, {
            boardID: boardID,
            type: type
          });
          $.on(select, 'change', Settings.saveSelectedArchive);
        }
        $.add(select, options);
      } else {
        td.textContent = 'N/A';
      }
      return $.add(row, td);
    },
    saveSelectedArchive: function() {
      return $.get('selectedArchives', Conf['selectedArchives'], (function(_this) {
        return function(_arg) {
          var selectedArchives, _name;
          selectedArchives = _arg.selectedArchives;
          (selectedArchives[_name = _this.dataset.boardID] || (selectedArchives[_name] = {}))[_this.dataset.type] = +_this.value;
          Conf['selectedArchives'] = selectedArchives;
          Redirect.selectArchives();
          return $.set('selectedArchives', selectedArchives);
        };
      })(this));
    },
    keybinds: function(section) {
      var arr, input, inputs, items, key, tbody, tr, _ref;
      section.innerHTML = "<div class=\"warning\" " + (Conf['Keybinds'] ? 'hidden' : '') + "><code>Keybinds</code> are disabled.</div><div>Allowed keys: <kbd>a-z</kbd>, <kbd>0-9</kbd>, <kbd>F1-F12</kbd>, <kbd>F16-F19</kbd>, <kbd>Ctrl</kbd>, <kbd>Shift</kbd>, <kbd>Alt</kbd>, <kbd>Meta</kbd>, <kbd>Enter</kbd>, <kbd>Esc</kbd>, <kbd>Up</kbd>, <kbd>Down</kbd>, <kbd>Right</kbd>, <kbd>Left</kbd>.</div><div>Press <kbd>Backspace</kbd> to disable a keybind.</div><table><tbody><tr><th>Actions</th><th>Keybinds</th></tr></tbody></table>";
      tbody = $('tbody', section);
      items = {};
      inputs = {};
      _ref = Config.hotkeys;
      for (key in _ref) {
        arr = _ref[key];
        tr = $.el('tr', {
          innerHTML: "<td>" + arr[1] + "</td><td><input class=field></td>"
        });
        input = $('input', tr);
        input.name = key;
        input.spellcheck = false;
        items[key] = Conf[key];
        inputs[key] = input;
        $.on(input, 'keydown', Settings.keybind);
        $.add(tbody, tr);
      }
      return $.get(items, function(items) {
        var val;
        for (key in items) {
          val = items[key];
          inputs[key].value = val;
        }
      });
    },
    keybind: function(e) {
      var key;
      if (e.keyCode === 9) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if ((key = Keybinds.keyCode(e)) == null) {
        return;
      }
      this.value = key;
      return $.cb.value.call(this);
    },
    refresh: function(section) {
      section.innerHTML = '<legend class=refresh>Reloading. Please wait.</legend>';
      return d.location.reload();
    }
  };

  Index = {
    showHiddenThreads: false,
    init: function() {
      var input, label, name, refNavEntry, repliesEntry, select, targetEntry, threadNumEntry, threadsNumInput, _i, _j, _len, _len1, _ref, _ref1;
      if (g.VIEW !== 'index') {
        $.ready(this.setupNavLinks);
        return;
      }
      if (g.BOARD.ID === 'f') {
        return;
      }
      this.db = new DataBoard('pinnedThreads');
      Thread.callbacks.push({
        name: 'Thread Pinning',
        cb: this.threadNode
      });
      CatalogThread.callbacks.push({
        name: 'Catalog Features',
        cb: this.catalogNode
      });
      this.button = $.el('a', {
        className: 'index-refresh-shortcut fa fa-refresh',
        title: 'Refresh Index',
        href: 'javascript:;'
      });
      $.on(this.button, 'click', this.update);
      Header.addShortcut(this.button, 1);
      threadNumEntry = {
        el: $.el('span', {
          textContent: 'Threads per page'
        }),
        subEntries: [
          {
            el: $.el('label', {
              innerHTML: '<input type=number min=0 name="Threads per Page">',
              title: 'Use 0 for default value'
            })
          }
        ]
      };
      threadsNumInput = threadNumEntry.subEntries[0].el.firstChild;
      threadsNumInput.value = Conf['Threads per Page'];
      $.on(threadsNumInput, 'change', $.cb.value);
      $.on(threadsNumInput, 'change', this.cb.threadsNum);
      targetEntry = {
        el: $.el('label', {
          innerHTML: '<input type=checkbox name="Open threads in a new tab"> Open threads in a new tab',
          title: 'Catalog-only setting.'
        })
      };
      repliesEntry = {
        el: $.el('label', {
          innerHTML: '<input type=checkbox name="Show Replies"> Show replies'
        })
      };
      refNavEntry = {
        el: $.el('label', {
          innerHTML: '<input type=checkbox name="Refreshed Navigation"> Refreshed navigation',
          title: 'Refresh index when navigating through pages.'
        })
      };
      _ref = [targetEntry, repliesEntry, refNavEntry];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        label = _ref[_i];
        input = label.el.firstChild;
        name = input.name;
        input.checked = Conf[name];
        $.on(input, 'change', $.cb.checked);
        switch (name) {
          case 'Open threads in a new tab':
            $.on(input, 'change', this.cb.target);
            break;
          case 'Show Replies':
            $.on(input, 'change', this.cb.replies);
        }
      }
      Header.menu.addEntry({
        el: $.el('span', {
          textContent: 'Index Navigation'
        }),
        order: 90,
        subEntries: [threadNumEntry, targetEntry, repliesEntry, refNavEntry]
      });
      $.addClass(doc, 'index-loading');
      this.update();
      this.navLinks = $.el('div', {
        id: 'nav-links',
        innerHTML: "<input type=\"search\" id=\"index-search\" class=\"field\" placeholder=\"Search\"><a id=\"index-search-clear\" class=\"fa fa-times-circle\" href=\"javascript:;\"></a>&nbsp;<time id=\"index-last-refresh\" title=\"Last index refresh\">...</time><span id=\"hidden-label\" hidden>&nbsp;&mdash; <span id=\"hidden-count\"></span> <span id=\"hidden-toggle\">[<a href=\"javascript:;\">Show</a>]</span></span><span style=\"flex:1\"></span><select id=\"index-mode\" name=\"Index Mode\"><option disabled>Index Mode</option><option value=\"paged\">Paged</option><option value=\"all pages\">All threads</option><option value=\"catalog\">Catalog</option></select><select id=\"index-sort\" name=\"Index Sort\"><option disabled>Index Sort</option><option value=\"bump\">Bump order</option><option value=\"lastreply\">Last reply</option><option value=\"birth\">Creation date</option><option value=\"replycount\">Reply count</option><option value=\"filecount\">File count</option></select><select id=\"index-size\" name=\"Index Size\"><option disabled>Image Size</option><option value=\"small\">Small</option><option value=\"large\">Large</option></select>"
      });
      this.searchInput = $('#index-search', this.navLinks);
      this.hideLabel = $('#hidden-label', this.navLinks);
      this.selectMode = $('#index-mode', this.navLinks);
      this.selectSort = $('#index-sort', this.navLinks);
      this.selectSize = $('#index-size', this.navLinks);
      $.on(this.searchInput, 'input', this.onSearchInput);
      $.on($('#index-search-clear', this.navLinks), 'click', this.clearSearch);
      $.on($('#hidden-toggle a', this.navLinks), 'click', this.cb.toggleHiddenThreads);
      _ref1 = [this.selectMode, this.selectSort, this.selectSize];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        select = _ref1[_j];
        select.value = Conf[select.name];
        $.on(select, 'change', $.cb.value);
      }
      $.on(this.selectMode, 'change', this.cb.mode);
      $.on(this.selectSort, 'change', this.cb.sort);
      $.on(this.selectSize, 'change', this.cb.size);
      this.root = $.el('div', {
        className: 'board'
      });
      this.pagelist = $.el('div', {
        className: 'pagelist',
        hidden: true,
        innerHTML: "<div class=\"prev\"><a><button disabled>Previous</button></a></div><div class=\"pages\"></div><div class=\"next\"><a><button disabled>Next</button></a></div><div class=\"pages cataloglink\"><a href=\"./\" data-index-mode=\"catalog\">Catalog</a></div>"
      });
      this.currentPage = this.getCurrentPage();
      $.on(window, 'popstate', this.cb.popstate);
      $.on(this.pagelist, 'click', this.cb.pageNav);
      $.on($('#custom-board-list', Header.bar), 'click', this.cb.headerNav);
      this.cb.toggleCatalogMode();
      return $.asap((function() {
        return $('.board', doc) || d.readyState !== 'loading';
      }), function() {
        var board, navLink, _k, _len2, _ref2;
        board = $('.board');
        $.replace(board, Index.root);
        d.implementation.createDocument(null, null, null).appendChild(board);
        _ref2 = $$('.navLinks');
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          navLink = _ref2[_k];
          $.rm(navLink);
        }
        $.before($.x('child::form[@name="delform"]/preceding-sibling::hr[1]'), Index.navLinks);
        return $.asap((function() {
          return $('.pagelist') || d.readyState !== 'loading';
        }), function() {
          var pagelist;
          if (pagelist = $('.pagelist')) {
            $.replace(pagelist, Index.pagelist);
          }
          return $.rmClass(doc, 'index-loading');
        });
      });
    },
    menu: {
      init: function() {
        if (g.VIEW !== 'index' || !Conf['Menu'] || g.BOARD.ID === 'f') {
          return;
        }
        return Menu.menu.addEntry({
          el: $.el('a', {
            href: 'javascript:;'
          }),
          order: 19,
          open: function(_arg) {
            var thread;
            thread = _arg.thread;
            if (Conf['Index Mode'] !== 'catalog') {
              return false;
            }
            this.el.textContent = thread.isPinned ? 'Unpin thread' : 'Pin thread';
            if (this.cb) {
              $.off(this.el, 'click', this.cb);
            }
            this.cb = function() {
              $.event('CloseMenu');
              return Index.togglePin(thread);
            };
            $.on(this.el, 'click', this.cb);
            return true;
          }
        });
      }
    },
    threadNode: function() {
      if (!Index.db.get({
        boardID: this.board.ID,
        threadID: this.ID
      })) {
        return;
      }
      return this.pin();
    },
    catalogNode: function() {
      $.on(this.nodes.thumb, 'click', Index.onClick);
      if (Conf['Image Hover in Catalog']) {
        return;
      }
      return $.on(this.nodes.thumb, 'mouseover', Index.onOver);
    },
    onClick: function(e) {
      var thread;
      if (e.button !== 0) {
        return;
      }
      thread = g.threads[this.parentNode.dataset.fullID];
      if (e.shiftKey) {
        PostHiding.toggle(thread.OP);
      } else if (e.altKey) {
        Index.togglePin(thread);
      } else {
        return;
      }
      return e.preventDefault();
    },
    onOver: function(e) {
      var el, nodes;
      nodes = g.threads[this.parentNode.dataset.fullID].OP.nodes;
      el = $.el('div', {
        innerHTML: '<div class=post><div class=postInfo>',
        className: 'thread-info',
        hidden: true
      });
      $.add(el.firstElementChild.firstElementChild, [$('.nameBlock', nodes.info).cloneNode(true), $.tn(' '), nodes.date.cloneNode(true)]);
      $.add(d.body, el);
      UI.hover({
        root: this,
        el: el,
        latestEvent: e,
        endEvents: 'mouseout',
        offsetX: 15,
        offsetY: -20
      });
      return setTimeout((function() {
        if (el.parentNode) {
          return el.hidden = false;
        }
      }), .25 * $.SECOND);
    },
    togglePin: function(thread) {
      var data;
      data = {
        boardID: thread.board.ID,
        threadID: thread.ID
      };
      if (thread.isPinned) {
        thread.unpin();
        Index.db["delete"](data);
      } else {
        thread.pin();
        data.val = true;
        Index.db.set(data);
      }
      Index.sort();
      return Index.buildIndex();
    },
    setIndexMode: function(mode) {
      Index.selectMode.value = mode;
      return $.event('change', null, Index.selectMode);
    },
    cycleSortType: function() {
      var i, type, types, _i, _len;
      types = __slice.call(Index.selectSort.options).filter(function(option) {
        return !option.disabled;
      });
      for (i = _i = 0, _len = types.length; _i < _len; i = ++_i) {
        type = types[i];
        if (type.selected) {
          break;
        }
      }
      types[(i + 1) % types.length].selected = true;
      return $.event('change', null, Index.selectSort);
    },
    addCatalogSwitch: function() {
      var a;
      a = $.el('a', {
        href: 'javascript:;',
        textContent: 'Switch to 4chan X\'s catalog',
        className: 'btn-wrap'
      });
      $.on(a, 'click', function() {
        $.set('Index Mode', 'catalog');
        return window.location = './';
      });
      return $.add($.id('info'), a);
    },
    setupNavLinks: function() {
      var el, _i, _len, _ref;
      _ref = $$('.navLinks.desktop > a');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        if (/\/catalog$/.test(el.pathname)) {
          el.href = '.././';
        }
        $.on(el, 'click', function() {
          switch (this.textContent) {
            case 'Return':
              return $.set('Index Mode', Conf['Previous Index Mode']);
            case 'Catalog':
              return $.set('Index Mode', 'catalog');
          }
        });
      }
    },
    cb: {
      toggleCatalogMode: function() {
        if (Conf['Index Mode'] === 'catalog') {
          $.addClass(doc, 'catalog-mode');
        } else {
          $.rmClass(doc, 'catalog-mode');
        }
        return Index.cb.size();
      },
      toggleHiddenThreads: function() {
        $('#hidden-toggle a', Index.navLinks).textContent = (Index.showHiddenThreads = !Index.showHiddenThreads) ? 'Hide' : 'Show';
        Index.sort();
        if (Conf['Index Mode'] === 'paged' && Index.getCurrentPage() > 0) {
          return Index.pageNav(0);
        } else {
          return Index.buildIndex();
        }
      },
      mode: function(e) {
        var mode;
        Index.cb.toggleCatalogMode();
        Index.togglePagelist();
        if (e) {
          Index.buildIndex();
        }
        mode = Conf['Index Mode'];
        if (mode !== 'catalog' && mode !== Conf['Previous Index Mode']) {
          Conf['Previous Index Mode'] = mode;
          $.set('Previous Index Mode', mode);
        }
        if (!QR.nodes) {
          return;
        }
        if (mode === 'catalog') {
          return QR.hide();
        } else {
          return QR.unhide();
        }
      },
      sort: function(e) {
        Index.sort();
        if (e) {
          return Index.buildIndex();
        }
      },
      size: function(e) {
        if (Conf['Index Mode'] !== 'catalog') {
          $.rmClass(Index.root, 'catalog-small');
          $.rmClass(Index.root, 'catalog-large');
        } else if (Conf['Index Size'] === 'small') {
          $.addClass(Index.root, 'catalog-small');
          $.rmClass(Index.root, 'catalog-large');
        } else {
          $.addClass(Index.root, 'catalog-large');
          $.rmClass(Index.root, 'catalog-small');
        }
        if (e) {
          return Index.buildIndex();
        }
      },
      threadsNum: function() {
        if (Conf['Index Mode'] !== 'paged') {
          return;
        }
        return Index.buildIndex();
      },
      target: function() {
        var thread, threadID, thumb, _ref;
        _ref = g.BOARD.threads;
        for (threadID in _ref) {
          thread = _ref[threadID];
          if (!thread.catalogView) {
            continue;
          }
          thumb = thread.catalogView.nodes.thumb;
          if (Conf['Open threads in a new tab']) {
            thumb.target = '_blank';
          } else {
            thumb.removeAttribute('target');
          }
        }
      },
      replies: function() {
        Index.buildThreads();
        Index.sort();
        return Index.buildIndex();
      },
      popstate: function(e) {
        var pageNum;
        pageNum = Index.getCurrentPage();
        if (Index.currentPage !== pageNum) {
          return Index.pageLoad(pageNum);
        }
      },
      pageNav: function(e) {
        var a;
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
          return;
        }
        switch (e.target.nodeName) {
          case 'BUTTON':
            a = e.target.parentNode;
            break;
          case 'A':
            a = e.target;
            break;
          default:
            return;
        }
        e.preventDefault();
        if (Index.cb.indexNav(a, true)) {
          return;
        }
        return Index.userPageNav(+a.pathname.split('/')[2]);
      },
      headerNav: function(e) {
        var a, needChange, onSameIndex;
        a = e.target;
        if (e.button !== 0 || a.nodeName !== 'A' || a.hostname !== 'boards.4chan.org') {
          return;
        }
        onSameIndex = g.VIEW === 'index' && a.pathname.split('/')[1] === g.BOARD.ID;
        needChange = Index.cb.indexNav(a, onSameIndex);
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || !onSameIndex || g.BOARD.ID === 'f') {
          return;
        }
        e.preventDefault();
        if (!needChange) {
          return Index.update();
        }
      },
      indexNav: function(a, onSameIndex) {
        var indexMode, indexSort, needChange, _ref;
        _ref = a.dataset, indexMode = _ref.indexMode, indexSort = _ref.indexSort;
        if (indexMode && Conf['Index Mode'] !== indexMode) {
          $.set('Index Mode', indexMode);
          Conf['Index Mode'] = indexMode;
          if (onSameIndex) {
            Index.selectMode.value = indexMode;
            Index.cb.mode();
            needChange = true;
          }
        }
        if (indexSort && Conf['Index Sort'] !== indexSort) {
          $.set('Index Sort', indexSort);
          Conf['Index Sort'] = indexSort;
          if (onSameIndex) {
            Index.selectSort.value = indexSort;
            Index.cb.sort();
            needChange = true;
          }
        }
        if (needChange) {
          Index.buildIndex();
          Index.scrollToIndex();
        }
        return needChange;
      }
    },
    scrollToIndex: function() {
      return Header.scrollToIfNeeded(Index.navLinks);
    },
    getCurrentPage: function() {
      return +window.location.pathname.split('/')[2];
    },
    userPageNav: function(pageNum) {
      if (Conf['Refreshed Navigation'] && Conf['Index Mode'] === 'paged') {
        return Index.update(pageNum);
      } else {
        return Index.pageNav(pageNum);
      }
    },
    pageNav: function(pageNum) {
      if (Index.currentPage === pageNum) {
        return;
      }
      history.pushState(null, '', pageNum === 0 ? './' : pageNum);
      return Index.pageLoad(pageNum);
    },
    pageLoad: function(pageNum) {
      Index.currentPage = pageNum;
      if (Conf['Index Mode'] !== 'paged') {
        return;
      }
      Index.buildIndex();
      return Index.scrollToIndex();
    },
    getThreadsNumPerPage: function() {
      if (Conf['Threads per Page'] > 0) {
        return +Conf['Threads per Page'];
      } else {
        return Index.threadsNumPerPage;
      }
    },
    getPagesNum: function() {
      return Math.ceil(Index.sortedThreads.length / Index.getThreadsNumPerPage());
    },
    getMaxPageNum: function() {
      return Math.max(0, Index.getPagesNum() - 1);
    },
    togglePagelist: function() {
      return Index.pagelist.hidden = Conf['Index Mode'] !== 'paged';
    },
    buildPagelist: function() {
      var a, i, maxPageNum, nodes, pagesRoot, _i;
      pagesRoot = $('.pages', Index.pagelist);
      maxPageNum = Index.getMaxPageNum();
      if (pagesRoot.childElementCount !== maxPageNum + 1) {
        nodes = [];
        for (i = _i = 0; _i <= maxPageNum; i = _i += 1) {
          a = $.el('a', {
            textContent: i,
            href: i ? i : './'
          });
          nodes.push($.tn('['), a, $.tn('] '));
        }
        $.rmAll(pagesRoot);
        $.add(pagesRoot, nodes);
      }
      return Index.togglePagelist();
    },
    setPage: function() {
      var a, href, maxPageNum, next, pageNum, pagesRoot, prev, strong;
      pageNum = Index.getCurrentPage();
      maxPageNum = Index.getMaxPageNum();
      pagesRoot = $('.pages', Index.pagelist);
      prev = pagesRoot.previousSibling.firstChild;
      next = pagesRoot.nextSibling.firstChild;
      href = Math.max(pageNum - 1, 0);
      prev.href = href === 0 ? './' : href;
      prev.firstChild.disabled = href === pageNum;
      href = Math.min(pageNum + 1, maxPageNum);
      next.href = href === 0 ? './' : href;
      next.firstChild.disabled = href === pageNum;
      if (strong = $('strong', pagesRoot)) {
        if (+strong.textContent === pageNum) {
          return;
        }
        $.replace(strong, strong.firstChild);
      } else {
        strong = $.el('strong');
      }
      a = pagesRoot.children[pageNum];
      $.before(a, strong);
      return $.add(strong, a);
    },
    updateHideLabel: function() {
      var hiddenCount, thread, threadID, _ref, _ref1;
      hiddenCount = 0;
      _ref = g.BOARD.threads;
      for (threadID in _ref) {
        thread = _ref[threadID];
        if (thread.isHidden) {
          if (_ref1 = thread.ID, __indexOf.call(Index.liveThreadIDs, _ref1) >= 0) {
            hiddenCount++;
          }
        }
      }
      if (!hiddenCount) {
        Index.hideLabel.hidden = true;
        if (Index.showHiddenThreads) {
          Index.cb.toggleHiddenThreads();
        }
        return;
      }
      Index.hideLabel.hidden = false;
      return $('#hidden-count', Index.hideLabel).textContent = hiddenCount === 1 ? '1 hidden thread' : "" + hiddenCount + " hidden threads";
    },
    update: function(pageNum) {
      var now, onload, _ref, _ref1;
      if (!navigator.onLine) {
        return;
      }
      if ((_ref = Index.req) != null) {
        _ref.abort();
      }
      if ((_ref1 = Index.notice) != null) {
        _ref1.close();
      }
      if (d.readyState !== 'loading') {
        Index.notice = new Notice('info', 'Refreshing index...');
      } else {
        now = Date.now();
        $.ready(function() {
          return setTimeout((function() {
            if (!(Index.req && !Index.notice)) {
              return;
            }
            return Index.notice = new Notice('info', 'Refreshing index...');
          }), 5 * $.SECOND - (Date.now() - now));
        });
      }
      if (typeof pageNum !== 'number') {
        pageNum = null;
      }
      onload = function(e) {
        return Index.load(e, pageNum);
      };
      Index.req = $.ajax("//a.4cdn.org/" + g.BOARD + "/catalog.json", {
        onabort: onload,
        onloadend: onload
      }, {
        whenModified: true
      });
      return $.addClass(Index.button, 'fa-spin');
    },
    load: function(e, pageNum) {
      var err, notice, req, timeEl, _ref;
      $.rmClass(Index.button, 'fa-spin');
      req = Index.req, notice = Index.notice;
      delete Index.req;
      delete Index.notice;
      if (e.type === 'abort') {
        req.onloadend = null;
        notice.close();
        return;
      }
      if ((_ref = req.status) !== 200 && _ref !== 304) {
        err = "Index refresh failed. Error " + req.statusText + " (" + req.status + ")";
        if (notice) {
          notice.setType('warning');
          notice.el.lastElementChild.textContent = err;
          setTimeout(notice.close, $.SECOND);
        } else {
          new Notice('warning', err, 1);
        }
        return;
      }
      try {
        if (req.status === 200) {
          Index.parse(req.response, pageNum);
        } else if (req.status === 304 && (pageNum != null)) {
          if (Index.currentPage === pageNum) {
            Index.buildIndex();
          } else {
            Index.pageNav(pageNum);
          }
        }
      } catch (_error) {
        err = _error;
        c.error('Index failure:', err.stack);
        if (notice) {
          notice.setType('error');
          notice.el.lastElementChild.textContent = 'Index refresh failed.';
          setTimeout(notice.close, $.SECOND);
        } else {
          new Notice('error', 'Index refresh failed.', 1);
        }
        return;
      }
      if (notice) {
        notice.setType('success');
        notice.el.lastElementChild.textContent = 'Index refreshed!';
        setTimeout(notice.close, $.SECOND);
      }
      timeEl = $('#index-last-refresh', Index.navLinks);
      timeEl.dataset.utc = Date.parse(req.getResponseHeader('Last-Modified'));
      RelativeDates.update(timeEl);
      return Index.scrollToIndex();
    },
    parse: function(pages, pageNum) {
      Index.parseThreadList(pages);
      Index.buildThreads();
      Index.sort();
      if ((pageNum != null) && Index.currentPage !== pageNum) {
        Index.pageNav(pageNum);
        return;
      }
      return Index.buildIndex();
    },
    parseThreadList: function(pages) {
      var thread, threadID, _ref, _ref1;
      Index.threadsNumPerPage = pages[0].threads.length;
      Index.liveThreadData = pages.reduce((function(arr, next) {
        return arr.concat(next.threads);
      }), []);
      Index.liveThreadIDs = Index.liveThreadData.map(function(data) {
        return data.no;
      });
      _ref = g.BOARD.threads;
      for (threadID in _ref) {
        thread = _ref[threadID];
        if (_ref1 = thread.ID, __indexOf.call(Index.liveThreadIDs, _ref1) < 0) {
          thread.collect();
        }
      }
    },
    buildThreads: function() {
      var err, errors, i, posts, thread, threadData, threadRoot, threads, _i, _len, _ref;
      threads = [];
      posts = [];
      _ref = Index.liveThreadData;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        threadData = _ref[i];
        threadRoot = Build.thread(g.BOARD, threadData);
        if (thread = g.BOARD.threads[threadData.no]) {
          thread.setStatus('Sticky', !!threadData.sticky);
          thread.setStatus('Closed', !!threadData.closed);
        } else {
          thread = new Thread(threadData.no, g.BOARD);
          threads.push(thread);
        }
        if (thread.ID in thread.posts) {
          continue;
        }
        try {
          posts.push(new Post($('.opContainer', threadRoot), thread, g.BOARD));
        } catch (_error) {
          err = _error;
          if (!errors) {
            errors = [];
          }
          errors.push({
            message: "Parsing of Post No." + thread + " failed. Post will be skipped.",
            error: err
          });
        }
      }
      if (errors) {
        Main.handleErrors(errors);
      }
      Main.callbackNodes(Thread, threads);
      Main.callbackNodes(Post, posts);
      Index.updateHideLabel();
      return $.event('IndexRefresh');
    },
    buildHRs: function(threadRoots) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = threadRoots.length; _i < _ref; i = _i += 1) {
        threadRoots.splice((i * 2) + 1, 0, $.el('hr'));
      }
    },
    buildReplies: function(threads) {
      var data, err, errors, i, lastReplies, node, nodes, post, posts, thread, _i, _j, _len, _len1;
      if (!Conf['Show Replies']) {
        return;
      }
      posts = [];
      for (_i = 0, _len = threads.length; _i < _len; _i++) {
        thread = threads[_i];
        i = Index.liveThreadIDs.indexOf(thread.ID);
        if (!(lastReplies = Index.liveThreadData[i].last_replies)) {
          continue;
        }
        nodes = [];
        for (_j = 0, _len1 = lastReplies.length; _j < _len1; _j++) {
          data = lastReplies[_j];
          if (post = thread.posts[data.no]) {
            nodes.push(post.nodes.root);
            continue;
          }
          nodes.push(node = Build.postFromObject(data, thread.board.ID));
          try {
            posts.push(new Post(node, thread, thread.board));
          } catch (_error) {
            err = _error;
            if (!errors) {
              errors = [];
            }
            errors.push({
              message: "Parsing of Post No." + data.no + " failed. Post will be skipped.",
              error: err
            });
          }
        }
        $.add(thread.OP.nodes.root.parentNode, nodes);
      }
      if (errors) {
        Main.handleErrors(errors);
      }
      return Main.callbackNodes(Post, posts);
    },
    buildCatalogViews: function() {
      var catalogThreads, thread, _i, _len, _ref;
      catalogThreads = [];
      _ref = Index.sortedThreads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thread = _ref[_i];
        if (!thread.catalogView) {
          catalogThreads.push(new CatalogThread(Build.catalogThread(thread), thread));
        }
      }
      Main.callbackNodes(CatalogThread, catalogThreads);
      return Index.sortedThreads.map(function(thread) {
        return thread.catalogView.nodes.root;
      });
    },
    sizeCatalogViews: function(nodes) {
      var height, node, ratio, size, thumb, width, _i, _len, _ref;
      size = Conf['Index Size'] === 'small' ? 150 : 250;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        thumb = node.firstElementChild;
        _ref = thumb.dataset, width = _ref.width, height = _ref.height;
        if (!width) {
          continue;
        }
        ratio = size / Math.max(width, height);
        thumb.style.width = width * ratio + 'px';
        thumb.style.height = height * ratio + 'px';
      }
    },
    sort: function() {
      var sortedThreadIDs;
      switch (Conf['Index Sort']) {
        case 'bump':
          sortedThreadIDs = Index.liveThreadIDs;
          break;
        case 'lastreply':
          sortedThreadIDs = __slice.call(Index.liveThreadData).sort(function(a, b) {
            var _ref, _ref1;
            if ('last_replies' in a) {
              _ref = a.last_replies, a = _ref[_ref.length - 1];
            }
            if ('last_replies' in b) {
              _ref1 = b.last_replies, b = _ref1[_ref1.length - 1];
            }
            return b.no - a.no;
          }).map(function(data) {
            return data.no;
          });
          break;
        case 'birth':
          sortedThreadIDs = __slice.call(Index.liveThreadIDs).sort(function(a, b) {
            return b - a;
          });
          break;
        case 'replycount':
          sortedThreadIDs = __slice.call(Index.liveThreadData).sort(function(a, b) {
            return b.replies - a.replies;
          }).map(function(data) {
            return data.no;
          });
          break;
        case 'filecount':
          sortedThreadIDs = __slice.call(Index.liveThreadData).sort(function(a, b) {
            return b.images - a.images;
          }).map(function(data) {
            return data.no;
          });
      }
      Index.sortedThreads = sortedThreadIDs.map(function(threadID) {
        return g.BOARD.threads[threadID];
      }).filter(function(thread) {
        return thread.isHidden === Index.showHiddenThreads;
      });
      if (Index.isSearching) {
        Index.sortedThreads = Index.querySearch(Index.searchInput.value) || Index.sortedThreads;
      }
      Index.sortOnTop(function(thread) {
        return thread.isSticky;
      });
      return Index.sortOnTop(function(thread) {
        return thread.isOnTop || thread.isPinned;
      });
    },
    sortOnTop: function(match) {
      var i, offset, thread, _i, _len, _ref;
      offset = 0;
      _ref = Index.sortedThreads;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        thread = _ref[i];
        if (match(thread)) {
          Index.sortedThreads.splice(offset++, 0, Index.sortedThreads.splice(i, 1)[0]);
        }
      }
    },
    buildIndex: function() {
      var nodes, pageNum, threads, threadsPerPage;
      switch (Conf['Index Mode']) {
        case 'paged':
          pageNum = Index.getCurrentPage();
          if (pageNum > Index.getMaxPageNum()) {
            Index.pageNav(Index.getMaxPageNum());
            return;
          }
          threadsPerPage = Index.getThreadsNumPerPage();
          threads = Index.sortedThreads.slice(threadsPerPage * pageNum, threadsPerPage * (pageNum + 1));
          nodes = threads.map(function(thread) {
            return thread.OP.nodes.root.parentNode;
          });
          Index.buildReplies(threads);
          Index.buildHRs(nodes);
          Index.buildPagelist();
          Index.setPage();
          break;
        case 'catalog':
          nodes = Index.buildCatalogViews();
          Index.sizeCatalogViews(nodes);
          break;
        default:
          nodes = Index.sortedThreads.map(function(thread) {
            return thread.OP.nodes.root.parentNode;
          });
          Index.buildReplies(Index.sortedThreads);
          Index.buildHRs(nodes);
      }
      $.rmAll(Index.root);
      return $.add(Index.root, nodes);
    },
    isSearching: false,
    clearSearch: function() {
      Index.searchInput.value = null;
      Index.onSearchInput();
      return Index.searchInput.focus();
    },
    onSearchInput: function() {
      var pageNum;
      if (Index.isSearching = !!Index.searchInput.value.trim()) {
        if (!Index.searchInput.dataset.searching) {
          Index.searchInput.dataset.searching = 1;
          Index.pageBeforeSearch = Index.getCurrentPage();
          pageNum = 0;
        } else {
          pageNum = Index.getCurrentPage();
        }
      } else {
        if (!Index.searchInput.dataset.searching) {
          return;
        }
        pageNum = Index.pageBeforeSearch;
        delete Index.pageBeforeSearch;
        Index.searchInput.removeAttribute('data-searching');
      }
      Index.sort();
      if (Conf['Index Mode'] === 'paged' && Index.currentPage !== Math.min(pageNum, Index.getMaxPageNum())) {
        return Index.pageNav(pageNum);
      } else {
        return Index.buildIndex();
      }
    },
    querySearch: function(query) {
      var keywords;
      if (!(keywords = query.toLowerCase().match(/\S+/g))) {
        return;
      }
      return Index.search(keywords);
    },
    search: function(keywords) {
      return Index.sortedThreads.filter(function(thread) {
        return Index.searchMatch(thread, keywords);
      });
    },
    searchMatch: function(thread, keywords) {
      var file, info, key, keyword, text, _i, _j, _len, _len1, _ref, _ref1;
      _ref = thread.OP, info = _ref.info, file = _ref.file;
      text = [];
      _ref1 = ['comment', 'subject', 'name', 'tripcode', 'email'];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        key = _ref1[_i];
        if (key in info) {
          text.push(info[key]);
        }
      }
      if (file) {
        text.push(file.name);
      }
      text = text.join(' ').toLowerCase();
      for (_j = 0, _len1 = keywords.length; _j < _len1; _j++) {
        keyword = keywords[_j];
        if (-1 === text.indexOf(keyword)) {
          return false;
        }
      }
      return true;
    }
  };

  Get = {
    threadExcerpt: function(thread) {
      var OP, excerpt, _ref;
      OP = thread.OP;
      excerpt = ((_ref = OP.info.subject) != null ? _ref.trim() : void 0) || OP.info.comment.replace(/\n+/g, ' // ') || OP.getNameBlock();
      if (excerpt.length > 70) {
        excerpt = "" + excerpt.slice(0, 67) + "...";
      }
      return "/" + thread.board + "/ - " + excerpt;
    },
    threadFromRoot: function(root) {
      return g.threads["" + g.BOARD + "." + root.id.slice(1)];
    },
    threadFromNode: function(node) {
      return Get.threadFromRoot($.x('ancestor::div[@class="thread"]', node));
    },
    postFromRoot: function(root) {
      var index, post;
      post = g.posts[root.dataset.fullID];
      if (index = root.dataset.clone) {
        return post.clones[index];
      } else {
        return post;
      }
    },
    postFromNode: function(node) {
      return Get.postFromRoot($.x('ancestor::div[contains(@class,"postContainer")][1]', node));
    },
    contextFromNode: function(node) {
      return Get.postFromRoot($.x('ancestor::div[parent::div[@class="thread"]][1]', node));
    },
    postDataFromLink: function(link) {
      var boardID, path, postID, threadID, _ref;
      if (link.hostname === 'boards.4chan.org') {
        path = link.pathname.split('/');
        boardID = path[1];
        threadID = path[3];
        postID = link.hash.slice(2);
      } else {
        _ref = link.dataset, boardID = _ref.boardID, threadID = _ref.threadID, postID = _ref.postID;
        threadID || (threadID = 0);
      }
      return {
        boardID: boardID,
        threadID: +threadID,
        postID: +postID
      };
    },
    allQuotelinksLinkingTo: function(post) {
      var ID, quote, quotedPost, quotelinks, quoterPost, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4;
      quotelinks = [];
      _ref = g.posts;
      for (ID in _ref) {
        quoterPost = _ref[ID];
        if (_ref1 = post.fullID, __indexOf.call(quoterPost.quotes, _ref1) >= 0) {
          _ref2 = [quoterPost].concat(quoterPost.clones);
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            quoterPost = _ref2[_i];
            quotelinks.push.apply(quotelinks, quoterPost.nodes.quotelinks);
          }
        }
      }
      if (Conf['Quote Backlinks']) {
        _ref3 = post.quotes;
        for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
          quote = _ref3[_j];
          if (!(quotedPost = g.posts[quote])) {
            continue;
          }
          _ref4 = [quotedPost].concat(quotedPost.clones);
          for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
            quotedPost = _ref4[_k];
            quotelinks.push.apply(quotelinks, __slice.call(quotedPost.nodes.backlinks));
          }
        }
      }
      return quotelinks.filter(function(quotelink) {
        var boardID, postID, _ref5;
        _ref5 = Get.postDataFromLink(quotelink), boardID = _ref5.boardID, postID = _ref5.postID;
        return boardID === post.board.ID && postID === post.ID;
      });
    },
    postClone: function(boardID, threadID, postID, root, context) {
      var post, url;
      if (post = g.posts["" + boardID + "." + postID]) {
        Get.insert(post, root, context);
        return;
      }
      root.textContent = "Loading post No." + postID + "...";
      if (threadID) {
        return $.cache("//a.4cdn.org/" + boardID + "/thread/" + threadID + ".json", function() {
          return Get.fetchedPost(this, boardID, threadID, postID, root, context);
        });
      } else if (url = Redirect.to('post', {
        boardID: boardID,
        postID: postID
      })) {
        return $.cache(url, function() {
          return Get.archivedPost(this, boardID, postID, root, context);
        }, {
          responseType: 'json',
          withCredentials: url.archive.withCredentials
        });
      }
    },
    insert: function(post, root, context) {
      var clone, nodes;
      if (!root.parentNode) {
        return;
      }
      clone = post.addClone(context);
      Main.callbackNodes(Clone, [clone]);
      nodes = clone.nodes;
      $.rmAll(nodes.root);
      $.add(nodes.root, nodes.post);
      $.rmAll(root);
      return $.add(root, nodes.root);
    },
    fetchedPost: function(req, boardID, threadID, postID, root, context) {
      var board, post, posts, status, thread, url, _i, _len;
      if (post = g.posts["" + boardID + "." + postID]) {
        Get.insert(post, root, context);
        return;
      }
      status = req.status;
      if (status !== 200 && status !== 304) {
        if (url = Redirect.to('post', {
          boardID: boardID,
          postID: postID
        })) {
          $.cache(url, function() {
            return Get.archivedPost(this, boardID, postID, root, context);
          }, {
            responseType: 'json',
            withCredentials: url.archive.withCredentials
          });
        } else {
          $.addClass(root, 'warning');
          root.textContent = status === 404 ? "Thread No." + threadID + " 404'd." : "Error " + req.statusText + " (" + req.status + ").";
        }
        return;
      }
      posts = req.response.posts;
      Build.spoilerRange[boardID] = posts[0].custom_spoiler;
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        if (post.no === postID) {
          break;
        }
      }
      if (post.no !== postID) {
        if (url = Redirect.to('post', {
          boardID: boardID,
          postID: postID
        })) {
          $.cache(url, function() {
            return Get.archivedPost(this, boardID, postID, root, context);
          }, {
            withCredentials: url.archive.withCredentials
          });
        } else {
          $.addClass(root, 'warning');
          root.textContent = "Post No." + postID + " was not found.";
        }
        return;
      }
      board = g.boards[boardID] || new Board(boardID);
      thread = g.threads["" + boardID + "." + threadID] || new Thread(threadID, board);
      post = new Post(Build.postFromObject(post, boardID), thread, board);
      Main.callbackNodes(Post, [post]);
      return Get.insert(post, root, context);
    },
    archivedPost: function(req, boardID, postID, root, context) {
      var board, bq, comment, data, o, post, thread, threadID, _ref, _ref1;
      if (post = g.posts["" + boardID + "." + postID]) {
        Get.insert(post, root, context);
        return;
      }
      data = req.response;
      if (data.error) {
        $.addClass(root, 'warning');
        root.textContent = data.error;
        return;
      }
      bq = $.el('blockquote', {
        textContent: data.comment
      });
      bq.innerHTML = bq.innerHTML.replace(/\n|\[\/?[a-z]+(:lit)?\]/g, function(text) {
        switch (text) {
          case '\n':
            return '<br>';
          case '[b]':
            return '<b>';
          case '[/b]':
            return '</b>';
          case '[spoiler]':
            return '<s>';
          case '[/spoiler]':
            return '</s>';
          case '[code]':
            return '<pre class=prettyprint>';
          case '[/code]':
            return '</pre>';
          case '[moot]':
            return '<div style="padding:5px;margin-left:.5em;border-color:#faa;border:2px dashed rgba(255,0,0,.1);border-radius:2px">';
          case '[/moot]':
            return '</div>';
          case '[banned]':
            return '<strong style="color: red;">';
          case '[/banned]':
            return '</strong>';
          default:
            return text.replace(':lit', '');
        }
      });
      comment = bq.innerHTML.replace(/(^|>)(&gt;[^<$]*)(<|$)/g, '$1<span class=quote>$2</span>$3').replace(/((&gt;){2}(&gt;\/[a-z\d]+\/)?\d+)/g, '<span class=deadlink>$1</span>');
      threadID = +data.thread_num;
      o = {
        postID: postID,
        threadID: threadID,
        boardID: boardID,
        name: data.name_processed,
        capcode: (function() {
          switch (data.capcode) {
            case 'M':
              return 'mod';
            case 'A':
              return 'admin';
            case 'D':
              return 'developer';
          }
        })(),
        tripcode: data.trip,
        uniqueID: data.poster_hash,
        email: data.email ? encodeURI(data.email) : '',
        subject: data.title_processed,
        flagCode: data.poster_country,
        flagName: data.poster_country_name_processed,
        date: data.fourchan_date,
        dateUTC: data.timestamp,
        comment: comment
      };
      if ((_ref = data.media) != null ? _ref.media_filename : void 0) {
        o.file = {
          name: data.media.media_filename_processed,
          timestamp: data.media.media_orig,
          url: data.media.media_link || data.media.remote_media_link,
          height: data.media.media_h,
          width: data.media.media_w,
          MD5: data.media.media_hash,
          size: data.media.media_size,
          turl: data.media.thumb_link || ("//t.4cdn.org/" + boardID + "/" + data.media.preview_orig),
          theight: data.media.preview_h,
          twidth: data.media.preview_w,
          isSpoiler: data.media.spoiler === '1'
        };
      }
      board = g.boards[boardID] || new Board(boardID);
      thread = g.threads["" + boardID + "." + threadID] || new Thread(threadID, board);
      post = new Post(Build.post(o, true), thread, board, {
        isArchived: true
      });
      if ((_ref1 = $('.page-num', post.nodes.info)) != null) {
        _ref1.hidden = true;
      }
      Main.callbackNodes(Post, [post]);
      return Get.insert(post, root, context);
    }
  };

  Build = {
    staticPath: '//s.4cdn.org/image/',
    gifIcon: window.devicePixelRatio >= 2 ? '@2x.gif' : '.gif',
    spoilerRange: {},
    shortFilename: function(filename, isReply) {
      var ext, threshold;
      threshold = isReply ? 30 : 40;
      ext = filename.match(/\.[^.]+$/)[0];
      if (filename.length - ext.length > threshold) {
        return "" + filename.slice(0, threshold - 5) + "(...)" + ext;
      } else {
        return filename;
      }
    },
    thumbRotate: (function() {
      var n;
      n = 0;
      return function() {
        return n = (n + 1) % 2;
      };
    })(),
    path: function(boardID, threadID, postID, fragment) {
      var path;
      path = "/" + boardID + "/thread/" + threadID;
      if ((g.SLUG != null) && threadID === g.THREADID) {
        path += "/" + g.SLUG;
      }
      if (postID) {
        path += "#" + (fragment || 'p') + postID;
      }
      return path;
    },
    postFromObject: function(data, boardID) {
      var o;
      o = {
        postID: data.no,
        threadID: data.resto || data.no,
        boardID: boardID,
        name: data.name,
        capcode: data.capcode,
        tripcode: data.trip,
        uniqueID: data.id,
        email: data.email ? encodeURI(data.email.replace(/&quot;/g, '"')) : '',
        subject: data.sub,
        flagCode: data.country,
        flagName: data.country_name,
        date: data.now,
        dateUTC: data.time,
        comment: data.com,
        isSticky: !!data.sticky,
        isClosed: !!data.closed
      };
      if (data.ext || data.filedeleted) {
        o.file = {
          name: data.filename + data.ext,
          timestamp: "" + data.tim + data.ext,
          url: boardID === 'f' ? "//i.4cdn.org/" + boardID + "/" + (encodeURIComponent(data.filename)) + data.ext : "//i.4cdn.org/" + boardID + "/" + data.tim + data.ext,
          height: data.h,
          width: data.w,
          MD5: data.md5,
          size: data.fsize,
          turl: "//" + (Build.thumbRotate()) + ".t.4cdn.org/" + boardID + "/" + data.tim + "s.jpg",
          theight: data.tn_h,
          twidth: data.tn_w,
          isSpoiler: !!data.spoiler,
          isDeleted: !!data.filedeleted
        };
      }
      return Build.post(o);
    },
    post: function(o, isArchived) {
      var a, boardID, capcode, capcodeClass, capcodeIcon, capcodeStart, closed, comment, container, date, dateUTC, email, emailEnd, emailStart, file, fileDims, fileHTML, fileInfo, fileSize, fileThumb, filename, flag, flagCode, flagName, gifIcon, href, imgSrc, isClosed, isOP, isSticky, name, postID, quote, replyLink, shortFilename, spoilerRange, staticPath, sticky, subject, threadID, tripcode, uniqueID, userID, _i, _len, _ref;
      postID = o.postID, threadID = o.threadID, boardID = o.boardID, name = o.name, capcode = o.capcode, tripcode = o.tripcode, uniqueID = o.uniqueID, email = o.email, subject = o.subject, flagCode = o.flagCode, flagName = o.flagName, date = o.date, dateUTC = o.dateUTC, isSticky = o.isSticky, isClosed = o.isClosed, comment = o.comment, file = o.file;
      isOP = postID === threadID;
      staticPath = Build.staticPath, gifIcon = Build.gifIcon;
      tripcode = tripcode ? " <span class=postertrip>" + tripcode + "</span>" : '';
      if (email) {
        emailStart = '<a href="mailto:' + email + '" class="useremail">';
        emailEnd = '</a>';
      } else {
        emailStart = '';
        emailEnd = '';
      }
      switch (capcode) {
        case 'admin':
        case 'admin_highlight':
          capcodeClass = " capcodeAdmin";
          capcodeStart = " <strong class='capcode hand id_admin'" + "title='Highlight posts by the Administrator'>## Admin</strong>";
          capcodeIcon = (" <img src='" + staticPath + "adminicon" + gifIcon + "' ") + "title='This user is the 4chan Administrator.' class=identityIcon>";
          break;
        case 'mod':
          capcodeClass = " capcodeMod";
          capcodeStart = " <strong class='capcode hand id_mod' " + "title='Highlight posts by Moderators'>## Mod</strong>";
          capcodeIcon = (" <img src='" + staticPath + "modicon" + gifIcon + "' ") + "title='This user is a 4chan Moderator.' class=identityIcon>";
          break;
        case 'developer':
          capcodeClass = " capcodeDeveloper";
          capcodeStart = " <strong class='capcode hand id_developer' " + "title='Highlight posts by Developers'>## Developer</strong>";
          capcodeIcon = (" <img src='" + staticPath + "developericon" + gifIcon + "' ") + "title='This user is a 4chan Developer.' class=identityIcon>";
          break;
        default:
          capcodeClass = '';
          capcodeStart = '';
          capcodeIcon = '';
      }
      userID = uniqueID && !capcode ? (" <span class='posteruid id_" + uniqueID + "'>(ID: ") + ("<span class=hand title='Highlight posts by this ID'>" + uniqueID + "</span>)</span>") : '';
      flag = !flagCode ? '' : boardID === 'pol' ? " <img src='" + staticPath + "country/troll/" + (flagCode.toLowerCase()) + ".gif' title='" + flagName + "' class=countryFlag>" : " <span title='" + flagName + "' class='flag flag-" + (flagCode.toLowerCase()) + "'></span>";
      if (file != null ? file.isDeleted : void 0) {
        fileHTML = isOP ? "<div class=file><span class=fileThumb>" + ("<img src='" + staticPath + "filedeleted" + gifIcon + "' class=fileDeleted>") + "</span></div>" : "<div class=file><span class=fileThumb>" + ("<img src='" + staticPath + "filedeleted-res" + gifIcon + "' class=fileDeletedRes>") + "</span></div>";
      } else if (file) {
        fileSize = $.bytesToString(file.size);
        fileThumb = file.turl;
        if (file.isSpoiler) {
          fileSize = "Spoiler Image, " + fileSize;
          if (!isArchived) {
            fileThumb = "" + staticPath + "spoiler";
            if (spoilerRange = Build.spoilerRange[boardID]) {
              fileThumb += ("-" + boardID) + Math.floor(1 + spoilerRange * Math.random());
            }
            fileThumb += '.png';
            file.twidth = file.theight = 100;
          }
        }
        imgSrc = boardID === 'f' ? '' : ("<a class='fileThumb" + (file.isSpoiler ? ' imgspoiler' : '') + "' href=\"" + file.url + "\" target=_blank>") + ("<img src='" + fileThumb + "' alt='" + fileSize + "' data-md5=" + file.MD5 + " style='height: " + file.theight + "px; width: " + file.twidth + "px;'>") + "</a>";
        a = $.el('a', {
          innerHTML: file.name
        });
        filename = a.textContent.replace(/%22/g, '"');
        a.textContent = Build.shortFilename(filename);
        shortFilename = a.innerHTML;
        a.textContent = filename;
        filename = a.innerHTML.replace(/'/g, '&apos;');
        fileDims = file.name.slice(-3) === 'pdf' ? 'PDF' : "" + file.width + "x" + file.height;
        fileInfo = ("<div class=fileText " + (file.isSpoiler ? "title='" + filename + "'" : '') + ">File: ") + ("<a href=\"" + file.url + "\" " + (filename !== shortFilename && !file.isSpoiler ? " title='" + filename + "'" : '') + " target=_blank>" + (file.isSpoiler ? 'Spoiler Image' : shortFilename) + "</a>") + (" (" + fileSize + ", " + fileDims + ")</div>");
        fileHTML = "<div class=file>" + fileInfo + imgSrc + "</div>";
      } else {
        fileHTML = '';
      }
      sticky = isSticky ? " <img src=" + staticPath + "sticky" + gifIcon + " title=Sticky class=stickyIcon>" : '';
      closed = isClosed ? " <img src=" + staticPath + "closed" + gifIcon + " title=Closed class=closedIcon>" : '';
      replyLink = isOP && g.VIEW === 'index' ? " &nbsp; <span>[<a href='" + (Build.path(boardID, threadID)) + "' class=replylink>Reply</a>]</span>" : '';
      container = $.el('div', {
        id: "pc" + postID,
        className: "postContainer " + (isOP ? 'op' : 'reply') + "Container",
        innerHTML: (isOP ? '' : "<div class=sideArrows>&gt;&gt;</div>") + ("<div id=p" + postID + " class='post " + (isOP ? 'op' : 'reply') + (capcode === 'admin_highlight' ? ' highlightPost' : '') + "'>") + (isOP ? fileHTML : '') + "<div class=postInfo>" + ("<input type=checkbox name=" + postID + " value=delete> ") + ("<span class=subject>" + (subject || '') + "</span> ") + ("<span class='nameBlock" + capcodeClass + "'>") + emailStart + ("<span class=name>" + (name || '') + "</span>") + tripcode + capcodeStart + emailEnd + capcodeIcon + userID + flag + ' </span> ' + ("<span class=dateTime data-utc=" + dateUTC + ">" + date + "</span> ") + "<span class='postNum'>" + ("<a href=" + (Build.path(boardID, threadID, postID)) + " title='Link to this post'>No.</a>") + ("<a href='" + (g.VIEW === 'thread' && g.THREADID === threadID ? "javascript:quote(" + postID + ")" : Build.path(boardID, threadID, postID, 'q')) + "' title='Reply to this post'>" + postID + "</a>") + sticky + closed + replyLink + '</span>' + '</div>' + (isOP ? '' : fileHTML) + ("<blockquote class=postMessage>" + (comment || '') + "</blockquote> ") + '</div>'
      });
      _ref = $$('.quotelink', container);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        href = quote.getAttribute('href');
        if (href[0] !== '#') {
          continue;
        }
        quote.href = Build.path(boardID, threadID, href.slice(2));
      }
      return container;
    },
    summary: function(boardID, threadID, posts, files) {
      var text;
      text = [];
      text.push("" + posts + " post" + (posts > 1 ? 's' : ''));
      if (files) {
        text.push("and " + files + " image repl" + (files > 1 ? 'ies' : 'y'));
      }
      text.push('omitted.');
      return $.el('a', {
        className: 'summary',
        textContent: text.join(' '),
        href: Build.path(boardID, threadID)
      });
    },
    thread: function(board, data) {
      var OP, files, posts, root, _ref;
      Build.spoilerRange[board] = data.custom_spoiler;
      if ((OP = board.posts[data.no]) && (root = OP.nodes.root.parentNode)) {
        $.rmAll(root);
        $.add(root, OP.nodes.root);
      } else {
        root = $.el('div', {
          className: 'thread',
          id: "t" + data.no
        });
        $.add(root, Build.postFromObject(data, board.ID));
      }
      if (data.omitted_posts || !Conf['Show Replies'] && data.replies) {
        _ref = Conf['Show Replies'] ? [data.omitted_posts, data.omitted_images] : [data.replies, data.images], posts = _ref[0], files = _ref[1];
        $.add(root, Build.summary(board.ID, data.no, posts, files));
      }
      return root;
    },
    catalogThread: function(thread) {
      var comment, data, fileCount, gifIcon, pageCount, postCount, pp, quotelink, root, spoilerRange, src, staticPath, subject, thumb, _i, _j, _len, _len1, _ref, _ref1;
      staticPath = Build.staticPath, gifIcon = Build.gifIcon;
      data = Index.liveThreadData[Index.liveThreadIDs.indexOf(thread.ID)];
      postCount = data.replies + 1;
      fileCount = data.images + !!data.ext;
      pageCount = Math.floor(Index.liveThreadIDs.indexOf(thread.ID) / Index.threadsNumPerPage);
      subject = thread.OP.info.subject ? "<div class='subject'>" + thread.OP.nodes.subject.innerHTML + "</div>" : '';
      comment = thread.OP.nodes.comment.innerHTML.replace(/(<br>\s*){2,}/g, '<br>');
      root = $.el('div', {
        className: 'catalog-thread',
        innerHTML: "<a href=\"" + (Build.path(thread.board.ID, thread.ID)) + "\" class=\"thumb\"></a><div class=\"thread-stats\" title=\"Post count / File count / Page count\"><span class=\"post-count\">" + postCount + "</span> / <span class=\"file-count\">" + fileCount + "</span> / <span class=\"page-count\">" + pageCount + "</span><span class=\"thread-icons\"></span></div>" + subject + "<div class=\"comment\">" + comment + "</div>"
      });
      root.dataset.fullID = thread.fullID;
      if (thread.isPinned) {
        $.addClass(root, 'pinned');
      }
      if (thread.OP.highlights.length) {
        $.addClass.apply($, [root].concat(__slice.call(thread.OP.highlights)));
      }
      thumb = root.firstElementChild;
      if (data.spoiler && !Conf['Reveal Spoilers']) {
        src = "" + staticPath + "spoiler";
        if (spoilerRange = Build.spoilerRange[thread.board]) {
          src += ("-" + thread.board) + Math.floor(1 + spoilerRange * Math.random());
        }
        src += '.png';
        $.addClass(thumb, 'spoiler-file');
      } else if (data.filedeleted) {
        src = "" + staticPath + "filedeleted-res" + gifIcon;
        $.addClass(thumb, 'deleted-file');
      } else if (thread.OP.file) {
        src = thread.OP.file.thumbURL;
        thumb.dataset.width = data.tn_w;
        thumb.dataset.height = data.tn_h;
      } else {
        src = "" + staticPath + "nofile.png";
        $.addClass(thumb, 'no-file');
      }
      thumb.style.backgroundImage = "url(" + src + ")";
      if (Conf['Open threads in a new tab']) {
        thumb.target = '_blank';
      }
      _ref = $$('.quotelink', root.lastElementChild);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        $.replace(quotelink, __slice.call(quotelink.childNodes));
      }
      _ref1 = $$('.prettyprint', root.lastElementChild);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        pp = _ref1[_j];
        $.replace(pp, $.tn(pp.textContent));
      }
      if (thread.isSticky) {
        $.add($('.thread-icons', root), $.el('img', {
          src: "" + staticPath + "sticky" + gifIcon,
          className: 'stickyIcon',
          title: 'Sticky'
        }));
      }
      if (thread.isClosed) {
        $.add($('.thread-icons', root), $.el('img', {
          src: "" + staticPath + "closed" + gifIcon,
          className: 'closedIcon',
          title: 'Closed'
        }));
      }
      if (data.bumplimit) {
        $.addClass($('.post-count', root), 'warning');
      }
      if (data.imagelimit) {
        $.addClass($('.file-count', root), 'warning');
      }
      return root;
    }
  };

  Filter = {
    filters: {},
    init: function() {
      var boards, err, filter, hl, key, op, regexp, stub, top, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (!Conf['Filter']) {
        return;
      }
      for (key in Config.filter) {
        this.filters[key] = [];
        _ref = Conf[key].split('\n');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          filter = _ref[_i];
          if (filter[0] === '#') {
            continue;
          }
          if (!(regexp = filter.match(/\/(.+)\/(\w*)/))) {
            continue;
          }
          filter = filter.replace(regexp[0], '');
          boards = ((_ref1 = filter.match(/boards:([^;]+)/)) != null ? _ref1[1].toLowerCase() : void 0) || 'global';
          if (boards !== 'global' && !(_ref2 = g.BOARD.ID, __indexOf.call(boards.split(','), _ref2) >= 0)) {
            continue;
          }
          if (key === 'uniqueID' || key === 'MD5') {
            regexp = regexp[1];
          } else {
            try {
              regexp = RegExp(regexp[1], regexp[2]);
            } catch (_error) {
              err = _error;
              new Notice('warning', err.message, 60);
              continue;
            }
          }
          op = ((_ref3 = filter.match(/[^t]op:(yes|no|only)/)) != null ? _ref3[1] : void 0) || 'yes';
          stub = (function() {
            var _ref4;
            switch ((_ref4 = filter.match(/stub:(yes|no)/)) != null ? _ref4[1] : void 0) {
              case 'yes':
                return true;
              case 'no':
                return false;
              default:
                return Conf['Stubs'];
            }
          })();
          if (hl = /highlight/.test(filter)) {
            hl = ((_ref4 = filter.match(/highlight:(\w+)/)) != null ? _ref4[1] : void 0) || 'filter-highlight';
            top = ((_ref5 = filter.match(/top:(yes|no)/)) != null ? _ref5[1] : void 0) || 'yes';
            top = top === 'yes';
          }
          this.filters[key].push({
            hide: !hl,
            op: op,
            stub: stub,
            "class": hl,
            top: top,
            match: regexp,
            test: typeof regexp === 'string' ? Filter.stringTest : Filter.regexpTest
          });
        }
        if (!this.filters[key].length) {
          delete this.filters[key];
        }
      }
      if (!Object.keys(this.filters).length) {
        return;
      }
      return Post.callbacks.push({
        name: 'Filter',
        cb: this.node
      });
    },
    node: function() {
      var key, obj, value, _i, _len, _ref;
      if (this.isClone) {
        return;
      }
      for (key in Filter.filters) {
        value = Filter[key](this);
        if (value === false) {
          continue;
        }
        _ref = Filter.filters[key];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          obj = _ref[_i];
          if (!Filter.test(obj, value, this.isReply)) {
            continue;
          }
          if (obj.hide) {
            if (!(this.isReply || g.VIEW === 'index')) {
              continue;
            }
            this.hide("Hidden by filtering the " + key + ": " + obj.match, obj.stub);
            return;
          }
          this.highlight("Highlighted by filtering the " + key + ": " + obj.match, obj["class"], obj.top);
        }
      }
    },
    stringTest: function(string, value) {
      return string === value;
    },
    regexpTest: function(regexp, value) {
      return regexp.test(value);
    },
    test: function(_arg, value, isReply) {
      var match, op, test;
      test = _arg.test, match = _arg.match, op = _arg.op;
      if (isReply && op === 'only' || !isReply && op === 'no') {
        return false;
      }
      if (!test(match, value)) {
        return false;
      }
      return true;
    },
    name: function(post) {
      if ('name' in post.info) {
        return post.info.name;
      }
      return false;
    },
    uniqueID: function(post) {
      if ('uniqueID' in post.info) {
        return post.info.uniqueID;
      }
      return false;
    },
    tripcode: function(post) {
      if ('tripcode' in post.info) {
        return post.info.tripcode;
      }
      return false;
    },
    capcode: function(post) {
      if ('capcode' in post.info) {
        return post.info.capcode;
      }
      return false;
    },
    email: function(post) {
      if ('email' in post.info) {
        return post.info.email;
      }
      return false;
    },
    subject: function(post) {
      if ('subject' in post.info) {
        return post.info.subject || false;
      }
      return false;
    },
    comment: function(post) {
      if ('comment' in post.info) {
        return post.info.comment;
      }
      return false;
    },
    flag: function(post) {
      if ('flag' in post.info) {
        return post.info.flag;
      }
      return false;
    },
    filename: function(post) {
      if (post.file) {
        return post.file.name;
      }
      return false;
    },
    dimensions: function(post) {
      var file;
      file = post.file;
      if (file && (file.isImage || file.isVideo)) {
        return post.file.dimensions;
      }
      return false;
    },
    filesize: function(post) {
      if (post.file) {
        return post.file.size;
      }
      return false;
    },
    MD5: function(post) {
      if (post.file) {
        return post.file.MD5;
      }
      return false;
    },
    menu: {
      init: function() {
        var div, entry, type, _i, _len, _ref;
        if (!Conf['Menu'] || !Conf['Filter']) {
          return;
        }
        div = $.el('div', {
          textContent: 'Filter'
        });
        entry = {
          el: div,
          order: 50,
          open: function(post) {
            Filter.menu.post = post;
            return true;
          },
          subEntries: []
        };
        _ref = [['Name', 'name'], ['Unique ID', 'uniqueID'], ['Tripcode', 'tripcode'], ['Capcode', 'capcode'], ['E-mail', 'email'], ['Subject', 'subject'], ['Comment', 'comment'], ['Flag', 'flag'], ['Filename', 'filename'], ['Image dimensions', 'dimensions'], ['Filesize', 'filesize'], ['Image MD5', 'MD5']];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          entry.subEntries.push(Filter.menu.createSubEntry(type[0], type[1]));
        }
        return Menu.menu.addEntry(entry);
      },
      createSubEntry: function(text, type) {
        var el;
        el = $.el('a', {
          href: 'javascript:;',
          textContent: text
        });
        el.dataset.type = type;
        $.on(el, 'click', Filter.menu.makeFilter);
        return {
          el: el,
          open: function(post) {
            var value;
            value = Filter[type](post);
            return value !== false;
          }
        };
      },
      makeFilter: function() {
        var re, type, value;
        type = this.dataset.type;
        value = Filter[type](Filter.menu.post);
        re = type === 'uniqueID' || type === 'MD5' ? value : value.replace(/\/|\\|\^|\$|\n|\.|\(|\)|\{|\}|\[|\]|\?|\*|\+|\|/g, function(c) {
          if (c === '\n') {
            return '\\n';
          } else if (c === '\\') {
            return '\\\\';
          } else {
            return "\\" + c;
          }
        });
        re = type === 'uniqueID' || type === 'MD5' ? "/" + re + "/;op:yes" : "/^" + re + "$/;op:yes";
        return $.get(type, Conf[type], function(item) {
          var save, section, select, ta, tl;
          save = item[type];
          save = save ? "" + save + "\n" + re : re;
          $.set(type, save);
          Settings.open('Filter');
          section = $('.section-container');
          select = $('select[name=filter]', section);
          select.value = type;
          Settings.selectFilter.call(select);
          ta = $('textarea', section);
          tl = ta.textLength;
          ta.setSelectionRange(tl, tl);
          return ta.focus();
        });
      }
    }
  };

  PostHiding = {
    init: function() {
      this.db = new DataBoard('hiddenPosts');
      this.hideButton = $.el('a', {
        className: 'hide-post-button fa fa-minus-square-o',
        href: 'javascript:;'
      });
      this.showButton = $.el('a', {
        className: 'show-post-button fa fa-plus-square-o',
        href: 'javascript:;'
      });
      return Post.callbacks.push({
        name: 'Post Hiding',
        cb: this.node
      });
    },
    node: function() {
      var a, data, label;
      if (!this.isReply && g.VIEW !== 'index' || this.isClone) {
        return;
      }
      if (data = PostHiding.db.get({
        boardID: this.board.ID,
        threadID: this.thread.ID,
        postID: this.ID
      })) {
        if (data.thisPost === false) {
          label = "Recursively hidden for quoting No." + this;
          Recursive.apply('hide', this, label, data.makeStub, true);
          Recursive.add('hide', this, label, data.makeStub, true);
        } else {
          this.hide('Manually hidden', data.makeStub, data.hideRecursively);
        }
      }
      if (!Conf['Post Hiding']) {
        return;
      }
      if (this.isReply) {
        a = PostHiding.makeButton(true);
        if (this.isHidden) {
          a.hidden = true;
        }
        return $.replace($('.sideArrows', this.nodes.root), a);
      } else {
        return $.prepend(this.nodes.root, PostHiding.makeButton(!this.isHidden));
      }
    },
    makeButton: function(hide) {
      var a;
      a = (hide ? PostHiding.hideButton : PostHiding.showButton).cloneNode(true);
      $.on(a, 'click', PostHiding.onToggleClick);
      return a;
    },
    onToggleClick: function() {
      return PostHiding.toggle($.x('ancestor::div[contains(@class,"postContainer")][1]', this) ? Get.postFromNode(this) : Get.threadFromNode(this).OP);
    },
    toggle: function(post) {
      var root;
      if (post.isHidden) {
        post.show();
      } else {
        post.hide('Manually hidden');
      }
      PostHiding.saveHiddenState(post);
      if (post.isReply) {
        return;
      }
      Index.updateHideLabel();
      if (Conf['Index Mode'] === 'all pages') {
        root = post.nodes.root.parentNode;
        $.rm(root.nextElementSibling);
        $.rm(root);
        return;
      }
      Index.sort();
      return Index.buildIndex();
    },
    saveHiddenState: function(post, val) {
      var data;
      data = {
        boardID: post.board.ID,
        threadID: post.thread.ID,
        postID: post.ID
      };
      if (post.isHidden || val && !val.thisPost) {
        data.val = val || {};
        return PostHiding.db.set(data);
      } else if (PostHiding.db.get(data)) {
        return PostHiding.db["delete"](data);
      }
    },
    menu: {
      init: function() {
        var apply, makeStub, replies, thisPost;
        if (!Conf['Menu'] || !Conf['Post Hiding Link']) {
          return;
        }
        apply = {
          el: $.el('a', {
            textContent: 'Apply',
            href: 'javascript:;'
          }),
          open: function(post) {
            if (this.cb) {
              $.off(this.el, 'click', this.cb);
            }
            this.cb = function() {
              return PostHiding.menu.hide(post);
            };
            $.on(this.el, 'click', this.cb);
            return true;
          }
        };
        thisPost = {
          el: $.el('label', {
            innerHTML: '<input type=checkbox name=thisPost checked> This post'
          })
        };
        replies = {
          el: $.el('label', {
            innerHTML: "<input type=checkbox name=replies  checked=" + Conf['Recursive Hiding'] + "> Hide replies"
          })
        };
        makeStub = {
          el: $.el('label', {
            innerHTML: "<input type=checkbox name=makeStub checked=" + Conf['Stubs'] + "> Make stub"
          })
        };
        Menu.menu.addEntry({
          el: $.el('div', {
            textContent: 'Hide post',
            className: 'hide-post-link'
          }),
          order: 20,
          open: function(post) {
            return !(post.isHidden || !post.isReply || post.isClone);
          },
          subEntries: [apply, thisPost, replies, makeStub]
        });
        apply = {
          el: $.el('a', {
            textContent: 'Apply',
            href: 'javascript:;'
          }),
          open: function(post) {
            if (this.cb) {
              $.off(this.el, 'click', this.cb);
            }
            this.cb = function() {
              return PostHiding.menu.show(post);
            };
            $.on(this.el, 'click', this.cb);
            return true;
          }
        };
        thisPost = {
          el: $.el('label', {
            innerHTML: '<input type=checkbox name=thisPost> This post'
          }),
          open: function(post) {
            this.el.firstChild.checked = post.isHidden;
            return true;
          }
        };
        replies = {
          el: $.el('label', {
            innerHTML: '<input type=checkbox name=replies> Unhide replies'
          }),
          open: function(post) {
            var data;
            data = PostHiding.db.get({
              boardID: post.board.ID,
              threadID: post.thread.ID,
              postID: post.ID
            });
            this.el.firstChild.checked = 'hideRecursively' in data ? data.hideRecursively : Conf['Recursive Hiding'];
            return true;
          }
        };
        Menu.menu.addEntry({
          el: $.el('div', {
            textContent: 'Unhide post',
            className: 'show-post-link'
          }),
          order: 20,
          open: function(post) {
            if (!post.isHidden || !post.isReply || post.isClone) {
              return false;
            }
            if (!PostHiding.db.get({
              boardID: post.board.ID,
              threadID: post.thread.ID,
              postID: post.ID
            })) {
              return false;
            }
            return true;
          },
          subEntries: [apply, thisPost, replies]
        });
        if (g.VIEW !== 'index') {
          return;
        }
        return Menu.menu.addEntry({
          el: $.el('a', {
            href: 'javascript:;'
          }),
          order: 20,
          open: function(post) {
            if (post.isReply) {
              return false;
            }
            this.el.textContent = post.isHidden ? 'Unhide thread' : 'Hide thread';
            if (this.cb) {
              $.off(this.el, 'click', this.cb);
            }
            this.cb = function() {
              $.event('CloseMenu');
              return PostHiding.toggle(post);
            };
            $.on(this.el, 'click', this.cb);
            return true;
          }
        });
      },
      hide: function(post) {
        var label, makeStub, parent, replies, thisPost;
        parent = this.parentNode;
        thisPost = $('input[name=thisPost]', parent).checked;
        replies = $('input[name=replies]', parent).checked;
        makeStub = $('input[name=makeStub]', parent).checked;
        label = 'Manually hidden';
        if (thisPost) {
          post.hide(label, makeStub, replies);
        } else if (replies) {
          Recursive.apply('hide', post, label, makeStub, true);
          Recursive.add('hide', post, label, makeStub, true);
        } else {
          return;
        }
        PostHiding.saveHiddenState(post, {
          thisPost: thisPost,
          hideRecursively: replies,
          makeStub: makeStub
        });
        return $.event('CloseMenu');
      },
      show: function(post) {
        var parent, replies, thisPost, val;
        parent = this.parentNode;
        thisPost = $('input[name=thisPost]', parent).checked;
        replies = $('input[name=replies]', parent).checked;
        if (thisPost) {
          post.show(replies);
        } else if (replies) {
          Recursive.apply('show', post, true);
          Recursive.rm('hide', post, true);
        } else {
          return;
        }
        val = {
          thisPost: !thisPost,
          hideRecursively: !replies,
          makeStub: !!post.nodes.stub
        };
        PostHiding.saveHiddenState(post, val);
        return $.event('CloseMenu');
      }
    }
  };

  Recursive = {
    recursives: {},
    init: function() {
      return Post.callbacks.push({
        name: 'Recursive',
        cb: this.node
      });
    },
    node: function() {
      var i, obj, quote, recursive, _i, _j, _len, _len1, _ref, _ref1;
      if (this.isClone) {
        return;
      }
      _ref = this.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quote = _ref[_i];
        if (obj = Recursive.recursives[quote]) {
          _ref1 = obj.recursives;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            recursive = _ref1[i];
            this[recursive].apply(this, obj.args[i]);
          }
        }
      }
    },
    add: function() {
      var args, obj, post, recursive, _base, _name;
      recursive = arguments[0], post = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      obj = (_base = Recursive.recursives)[_name = post.fullID] || (_base[_name] = {
        recursives: [],
        args: []
      });
      obj.recursives.push(recursive);
      return obj.args.push(args);
    },
    rm: function(recursive, post) {
      var i, obj, rec, _i, _len, _ref;
      if (!(obj = Recursive.recursives[post.fullID])) {
        return;
      }
      _ref = obj.recursives;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        rec = _ref[i];
        if (!(rec === recursive)) {
          continue;
        }
        obj.recursives.splice(i, 1);
        obj.args.splice(i, 1);
      }
    },
    apply: function() {
      var ID, args, fullID, post, recursive, _ref;
      recursive = arguments[0], post = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      fullID = post.fullID;
      _ref = g.posts;
      for (ID in _ref) {
        post = _ref[ID];
        if (__indexOf.call(post.quotes, fullID) >= 0) {
          post[recursive].apply(post, args);
        }
      }
    }
  };

  QuoteBacklink = {
    init: function() {
      var format;
      if (!Conf['Quote Backlinks']) {
        return;
      }
      format = Conf['backlink'].replace(/%id/g, "' + id + '");
      this.funk = Function('id', "return '" + format + "'");
      this.frag = $.nodes([
        $.tn(' '), $.el('a', {
          className: 'backlink'
        })
      ]);
      this.map = {};
      Post.callbacks.push({
        name: 'Quote Backlinking Part 1',
        cb: this.firstNode
      });
      return Post.callbacks.push({
        name: 'Quote Backlinking Part 2',
        cb: this.secondNode
      });
    },
    firstNode: function() {
      var container, post, quoteID, _base, _i, _j, _len, _len1, _ref, _ref1;
      if (this.isClone) {
        return;
      }
      _ref = this.quotes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quoteID = _ref[_i];
        ((_base = QuoteBacklink.map)[quoteID] || (_base[quoteID] = [])).push(this.fullID);
        if (!((post = g.posts[quoteID]) && (container = post != null ? post.nodes.backlinkContainer : void 0))) {
          continue;
        }
        _ref1 = [post].concat(post.clones);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          post = _ref1[_j];
          $.add(post.nodes.backlinkContainer, QuoteBacklink.buildBacklink(post, this));
        }
      }
    },
    secondNode: function() {
      var backlink, container, post, quoteID, _i, _j, _len, _len1, _ref, _ref1;
      if (!(this.isReply || Conf['OP Backlinks'])) {
        return;
      }
      if (this.isClone) {
        this.nodes.backlinkContainer = $('.backlink-container', this.nodes.info);
        if (!Conf['Quote Markers']) {
          return;
        }
        _ref = this.nodes.backlinks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          backlink = _ref[_i];
          QuoteMarkers.parseQuotelink(this, backlink, true, QuoteBacklink.funk(Get.postDataFromLink(backlink).postID));
        }
        return;
      }
      this.nodes.backlinkContainer = container = $.el('span', {
        className: 'backlink-container'
      });
      if (this.fullID in QuoteBacklink.map) {
        _ref1 = QuoteBacklink.map[this.fullID];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          quoteID = _ref1[_j];
          if (post = g.posts[quoteID]) {
            $.add(container, QuoteBacklink.buildBacklink(this, post));
          }
        }
      }
      return $.add(this.nodes.info, container);
    },
    buildBacklink: function(quoted, quoter) {
      var a, frag, text;
      frag = QuoteBacklink.frag.cloneNode(true);
      a = frag.lastElementChild;
      a.href = Build.path(quoter.board.ID, quoter.thread.ID, quoter.ID);
      a.textContent = text = QuoteBacklink.funk(quoter.ID);
      if (quoter.isDead) {
        $.addClass(a, 'deadlink');
      }
      if (quoter.isHidden) {
        $.addClass(a, 'filtered');
      }
      if (Conf['Quote Markers']) {
        QuoteMarkers.parseQuotelink(quoted, a, false, text);
      }
      if (Conf['Quote Previewing']) {
        $.on(a, 'mouseover', QuotePreview.mouseover);
      }
      if (Conf['Quote Inlining']) {
        $.on(a, 'click', QuoteInline.toggle);
      }
      return frag;
    }
  };

  QuoteInline = {
    init: function() {
      if (!Conf['Quote Inlining']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Quote Inlining',
        cb: this.node
      });
    },
    node: function() {
      var link, _i, _len, _ref;
      _ref = this.nodes.quotelinks.concat(__slice.call(this.nodes.backlinks));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        $.on(link, 'click', QuoteInline.toggle);
      }
    },
    toggle: function(e) {
      var boardID, context, postID, threadID, _ref;
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      _ref = Get.postDataFromLink(this), boardID = _ref.boardID, threadID = _ref.threadID, postID = _ref.postID;
      context = Get.contextFromNode(this);
      if ($.hasClass(this, 'inlined')) {
        QuoteInline.rm(this, boardID, threadID, postID, context);
      } else {
        if ($.x("ancestor::div[@id='pc" + postID + "']", this)) {
          return;
        }
        QuoteInline.add(this, boardID, threadID, postID, context);
      }
      return this.classList.toggle('inlined');
    },
    findRoot: function(quotelink, isBacklink) {
      if (isBacklink) {
        return quotelink.parentNode.parentNode;
      } else {
        return $.x('ancestor-or-self::*[parent::blockquote][1]', quotelink);
      }
    },
    add: function(quotelink, boardID, threadID, postID, context) {
      var inline, isBacklink, post;
      isBacklink = $.hasClass(quotelink, 'backlink');
      inline = $.el('div', {
        id: "i" + postID,
        className: 'inline'
      });
      $.after(QuoteInline.findRoot(quotelink, isBacklink), inline);
      Get.postClone(boardID, threadID, postID, inline, context);
      if (!((post = g.posts["" + boardID + "." + postID]) && context.thread === post.thread)) {
        return;
      }
      if (isBacklink && Conf['Forward Hiding']) {
        $.addClass(post.nodes.root, 'forwarded');
        post.forwarded++ || (post.forwarded = 1);
      }
      if (!Unread.posts) {
        return;
      }
      return Unread.readSinglePost(post);
    },
    rm: function(quotelink, boardID, threadID, postID, context) {
      var el, inlined, isBacklink, post, root, _ref;
      isBacklink = $.hasClass(quotelink, 'backlink');
      root = QuoteInline.findRoot(quotelink, isBacklink);
      root = $.x("following-sibling::div[@id='i" + postID + "'][1]", root);
      $.rm(root);
      if (!(el = root.firstElementChild)) {
        return;
      }
      post = g.posts["" + boardID + "." + postID];
      post.rmClone(el.dataset.clone);
      if (Conf['Forward Hiding'] && isBacklink && context.thread === g.threads["" + boardID + "." + threadID] && !--post.forwarded) {
        delete post.forwarded;
        $.rmClass(post.nodes.root, 'forwarded');
      }
      while (inlined = $('.inlined', el)) {
        _ref = Get.postDataFromLink(inlined), boardID = _ref.boardID, threadID = _ref.threadID, postID = _ref.postID;
        QuoteInline.rm(inlined, boardID, threadID, postID, context);
        $.rmClass(inlined, 'inlined');
      }
    }
  };

  QuoteMarkers = {
    init: function() {
      if (!Conf['Quote Markers']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Quote Markers',
        cb: this.node
      });
    },
    node: function() {
      var quotelink, _i, _len, _ref;
      _ref = this.nodes.quotelinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        QuoteMarkers.parseQuotelink(this, quotelink, !!this.isClone);
      }
    },
    parseQuotelink: function(post, quotelink, mayReset, customText) {
      var board, boardID, markers, postID, text, thread, threadID, _ref, _ref1, _ref2;
      _ref = post.isClone ? post.context : post, board = _ref.board, thread = _ref.thread;
      markers = [];
      _ref1 = Get.postDataFromLink(quotelink), boardID = _ref1.boardID, threadID = _ref1.threadID, postID = _ref1.postID;
      if ((_ref2 = QR.db) != null ? _ref2.get({
        boardID: boardID,
        threadID: threadID,
        postID: postID
      }) : void 0) {
        markers.push('You');
      }
      if (board.ID === boardID) {
        if (thread.ID === postID) {
          markers.push('OP');
        }
        if (threadID && threadID !== thread.ID) {
          markers.push('Cross-thread');
        }
      }
      if ($.hasClass(quotelink, 'deadlink')) {
        markers.push('Dead');
      }
      text = customText ? customText : boardID === post.board.ID ? ">>" + postID : ">>>/" + boardID + "/" + postID;
      if (markers.length) {
        return quotelink.textContent = "" + text + "\u00A0(" + (markers.join('/')) + ")";
      } else if (mayReset) {
        return quotelink.textContent = text;
      }
    }
  };

  QuotePreview = {
    init: function() {
      if (!Conf['Quote Previewing']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Quote Previewing',
        cb: this.node
      });
    },
    node: function() {
      var link, _i, _len, _ref;
      _ref = this.nodes.quotelinks.concat(__slice.call(this.nodes.backlinks));
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        $.on(link, 'mouseover', QuotePreview.mouseover);
      }
    },
    mouseover: function(e) {
      var boardID, clone, origin, post, postID, posts, qp, quote, quoterID, threadID, _i, _j, _len, _len1, _ref, _ref1;
      if ($.hasClass(this, 'inlined')) {
        return;
      }
      _ref = Get.postDataFromLink(this), boardID = _ref.boardID, threadID = _ref.threadID, postID = _ref.postID;
      qp = $.el('div', {
        id: 'qp',
        className: 'dialog'
      });
      $.add(d.body, qp);
      Get.postClone(boardID, threadID, postID, qp, Get.contextFromNode(this));
      UI.hover({
        root: this,
        el: qp,
        latestEvent: e,
        endEvents: 'mouseout click',
        cb: QuotePreview.mouseout,
        asapTest: function() {
          return qp.firstElementChild;
        }
      });
      if (!(origin = g.posts["" + boardID + "." + postID])) {
        return;
      }
      if (Conf['Quote Highlighting']) {
        posts = [origin].concat(origin.clones);
        posts.pop();
        for (_i = 0, _len = posts.length; _i < _len; _i++) {
          post = posts[_i];
          $.addClass(post.nodes.post, 'qphl');
        }
      }
      quoterID = $.x('ancestor::*[@id][1]', this).id.match(/\d+$/)[0];
      clone = Get.postFromRoot(qp.firstChild);
      _ref1 = clone.nodes.quotelinks.concat(__slice.call(clone.nodes.backlinks));
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quote = _ref1[_j];
        if (quote.hash.slice(2) === quoterID) {
          $.addClass(quote, 'forwardlink');
        }
      }
    },
    mouseout: function() {
      var clone, post, root, _i, _len, _ref;
      if (!(root = this.el.firstElementChild)) {
        return;
      }
      clone = Get.postFromRoot(root);
      post = clone.origin;
      post.rmClone(root.dataset.clone);
      if (!Conf['Quote Highlighting']) {
        return;
      }
      _ref = [post].concat(post.clones);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        post = _ref[_i];
        $.rmClass(post.nodes.post, 'qphl');
      }
    }
  };

  QuoteStrikeThrough = {
    init: function() {
      if (!Conf['Post Hiding'] && !Conf['Post Hiding Link'] && !Conf['Filter']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Strike-through Quotes',
        cb: this.node
      });
    },
    node: function() {
      var boardID, postID, quotelink, _i, _len, _ref, _ref1, _ref2;
      if (this.isClone) {
        return;
      }
      _ref = this.nodes.quotelinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        _ref1 = Get.postDataFromLink(quotelink), boardID = _ref1.boardID, postID = _ref1.postID;
        if ((_ref2 = g.posts["" + boardID + "." + postID]) != null ? _ref2.isHidden : void 0) {
          $.addClass(quotelink, 'filtered');
        }
      }
    }
  };

  Quotify = {
    init: function() {
      if (!Conf['Resurrect Quotes']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Resurrect Quotes',
        cb: this.node
      });
    },
    node: function() {
      var deadlink, _i, _len, _ref;
      _ref = $$('.deadlink', this.nodes.comment);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        deadlink = _ref[_i];
        if (this.isClone) {
          if ($.hasClass(deadlink, 'quotelink')) {
            this.nodes.quotelinks.push(deadlink);
          }
        } else {
          Quotify.parseDeadlink.call(this, deadlink);
        }
      }
    },
    parseDeadlink: function(deadlink) {
      var a, boardID, m, post, postID, quote, quoteID, redirect, _ref;
      if ($.hasClass(deadlink.parentNode, 'prettyprint')) {
        Quotify.fixDeadlink(deadlink);
        return;
      }
      quote = deadlink.textContent;
      if (!(postID = (_ref = quote.match(/\d+$/)) != null ? _ref[0] : void 0)) {
        return;
      }
      if (postID[0] === '0') {
        Quotify.fixDeadlink(deadlink);
        return;
      }
      boardID = (m = quote.match(/^>>>\/([a-z\d]+)/)) ? m[1] : this.board.ID;
      quoteID = "" + boardID + "." + postID;
      if (post = g.posts[quoteID]) {
        a = $.el('a', {
          href: Build.path(boardID, post.thread.ID, postID),
          className: post.isDead ? 'quotelink deadlink' : 'quotelink',
          textContent: quote
        });
        $.extend(a.dataset, {
          boardID: boardID,
          threadID: post.thread.ID,
          postID: postID
        });
      } else if (redirect = Redirect.to('thread', {
        boardID: boardID,
        postID: postID
      })) {
        a = $.el('a', {
          href: redirect,
          className: 'deadlink',
          textContent: quote,
          target: '_blank'
        });
        if (Redirect.to('post', {
          boardID: boardID,
          postID: postID
        })) {
          $.addClass(a, 'quotelink');
          $.extend(a.dataset, {
            boardID: boardID,
            postID: postID
          });
        }
      }
      if (__indexOf.call(this.quotes, quoteID) < 0) {
        this.quotes.push(quoteID);
      }
      if (!a) {
        if (Conf['Quote Markers']) {
          deadlink.textContent = "" + quote + "\u00A0(Dead)";
        }
        return;
      }
      $.replace(deadlink, a);
      if ($.hasClass(a, 'quotelink')) {
        return this.nodes.quotelinks.push(a);
      }
    },
    fixDeadlink: function(deadlink) {
      var el, green;
      if (!(el = deadlink.previousSibling) || el.nodeName === 'BR') {
        green = $.el('span', {
          className: 'quote'
        });
        $.before(deadlink, green);
        $.add(green, deadlink);
      }
      return $.replace(deadlink, __slice.call(deadlink.childNodes));
    }
  };

  QR = {
    init: function() {
      if (!Conf['Quick Reply']) {
        return;
      }
      this.db = new DataBoard('yourPosts');
      this.posts = [];
      if (Conf['Hide Original Post Form']) {
        $.addClass(doc, 'hide-original-post-form');
      }
      $.on(d, '4chanXInitFinished', this.initReady);
      return Post.callbacks.push({
        name: 'Quick Reply',
        cb: this.node
      });
    },
    initReady: function() {
      var sc;
      $.off(d, '4chanXInitFinished', QR.initReady);
      QR.postingIsEnabled = !!$.id('postForm');
      if (!QR.postingIsEnabled) {
        return;
      }
      sc = $.el('a', {
        className: 'qr-shortcut fa fa-comment-o',
        title: 'Quick Reply',
        href: 'javascript:;'
      });
      $.on(sc, 'click', function() {
        $.event('CloseMenu');
        QR.open();
        return QR.nodes.com.focus();
      });
      Header.addShortcut(sc, 2);
      $.on(d, 'dragover', QR.dragOver);
      $.on(d, 'drop', QR.dropFile);
      $.on(d, 'dragstart dragend', QR.drag);
      switch (g.VIEW) {
        case 'index':
          $.on(d, 'IndexRefresh', QR.generatePostableThreadsList);
          break;
        case 'thread':
          $.on(d, 'ThreadUpdate', function() {
            if (g.DEAD) {
              return QR.abort();
            } else {
              return QR.status();
            }
          });
      }
      if (!Conf['Persistent QR']) {
        return;
      }
      QR.open();
      if (Conf['Auto-Hide QR'] || g.VIEW === 'catalog' || g.VIEW === 'index' && Conf['Index Mode'] === 'catalog') {
        return QR.hide();
      }
    },
    node: function() {
      if (QR.db.get({
        boardID: this.board.ID,
        threadID: this.thread.ID,
        postID: this.ID
      })) {
        $.addClass(this.nodes.root, 'your-post');
      }
      return $.on($('a[title="Reply to this post"]', this.nodes.info), 'click', QR.quote);
    },
    persist: function() {
      QR.open();
      if (Conf['Auto-Hide QR']) {
        return QR.hide();
      }
    },
    open: function() {
      var err;
      if (QR.nodes) {
        QR.nodes.el.hidden = false;
        QR.unhide();
        return;
      }
      try {
        return QR.dialog();
      } catch (_error) {
        err = _error;
        delete QR.nodes;
        return Main.handleErrors({
          message: 'Quick Reply dialog creation crashed.',
          error: err
        });
      }
    },
    close: function() {
      var post, _i, _len, _ref;
      if (QR.req) {
        QR.abort();
        return;
      }
      QR.nodes.el.hidden = true;
      QR.cleanNotifications();
      d.activeElement.blur();
      $.rmClass(QR.nodes.el, 'dump');
      new QR.post(true);
      _ref = QR.posts.splice(0, QR.posts.length - 1);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        post = _ref[_i];
        post["delete"]();
      }
      QR.cooldown.auto = false;
      return QR.status();
    },
    focusin: function() {
      return $.addClass(QR.nodes.el, 'has-focus');
    },
    focusout: function() {
      return $.queueTask(function() {
        if ($.x('ancestor::div[@id="qr"]', d.activeElement)) {
          return;
        }
        return $.rmClass(QR.nodes.el, 'has-focus');
      });
    },
    hide: function() {
      d.activeElement.blur();
      $.addClass(QR.nodes.el, 'autohide');
      return QR.nodes.autohide.checked = true;
    },
    unhide: function() {
      $.rmClass(QR.nodes.el, 'autohide');
      return QR.nodes.autohide.checked = false;
    },
    toggleHide: function() {
      if (this.checked) {
        return QR.hide();
      } else {
        return QR.unhide();
      }
    },
    toggleSage: function() {
      var email;
      email = QR.nodes.email;
      return email.value = !/sage/i.test(email.value) && 'sage' || '';
    },
    error: function(err) {
      var el, notice, notif;
      QR.open();
      if (typeof err === 'string') {
        el = $.tn(err);
      } else {
        el = err;
        el.removeAttribute('style');
      }
      if (QR.captcha.isEnabled && /captcha|verification/i.test(el.textContent)) {
        QR.captcha.nodes.input.focus();
      }
      notice = new Notice('warning', el);
      QR.notifications.push(notice);
      if (!Header.areNotificationsEnabled) {
        return;
      }
      notif = new Notification('Quick reply warning', {
        body: el.textContent,
        icon: Favicon.logo
      });
      return notif.onclick = function() {
        return window.focus();
      };
    },
    notifications: [],
    cleanNotifications: function() {
      var notification, _i, _len, _ref;
      _ref = QR.notifications;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        notification = _ref[_i];
        notification.close();
      }
      return QR.notifications = [];
    },
    status: function() {
      var disabled, status, thread, value;
      if (!QR.nodes) {
        return;
      }
      thread = QR.posts[0].thread;
      if (thread !== 'new' && g.threads["" + g.BOARD + "." + thread].isDead) {
        value = 404;
        disabled = true;
        QR.cooldown.auto = false;
      }
      value = QR.req ? QR.req.progress : QR.cooldown.seconds || value;
      status = QR.nodes.status;
      status.value = !value ? 'Submit' : QR.cooldown.auto ? "Auto " + value : value;
      return status.disabled = disabled || false;
    },
    quote: function(e) {
      var ancestor, caretPos, com, frag, index, node, post, range, sel, text, thread, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      if (e != null) {
        e.preventDefault();
      }
      if (!QR.postingIsEnabled) {
        return;
      }
      sel = d.getSelection();
      post = Get.postFromNode(this);
      text = ">>" + post + "\n";
      if (sel.toString().trim() && post === Get.postFromNode(sel.anchorNode)) {
        range = sel.getRangeAt(0);
        frag = range.cloneContents();
        ancestor = range.commonAncestorContainer;
        if (ancestor.nodeName === '#text') {
          if ($.x('ancestor::s', ancestor)) {
            $.prepend(frag, $.tn('[spoiler]'));
            $.add(frag, $.tn('[/spoiler]'));
          }
          if ($.x('ancestor::pre[contains(@class,"prettyprint")]', ancestor)) {
            $.prepend(frag, $.tn('[code]'));
            $.add(frag, $.tn('[/code]'));
          }
        }
        _ref = $$('br', frag);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          if (node !== frag.lastChild) {
            $.replace(node, $.tn('\n>'));
          }
        }
        _ref1 = $$('s', frag);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          node = _ref1[_j];
          $.replace(node, [$.tn('[spoiler]')].concat(__slice.call(node.childNodes), [$.tn('[/spoiler]')]));
        }
        _ref2 = $$('.prettyprint', frag);
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          node = _ref2[_k];
          $.replace(node, [$.tn('[code]')].concat(__slice.call(node.childNodes), [$.tn('[/code]')]));
        }
        text += ">" + (frag.textContent.trim()) + "\n";
      }
      QR.open();
      if (QR.selected.isLocked) {
        index = QR.posts.indexOf(QR.selected);
        (QR.posts[index + 1] || new QR.post()).select();
        $.addClass(QR.nodes.el, 'dump');
        QR.cooldown.auto = true;
      }
      _ref3 = QR.nodes, com = _ref3.com, thread = _ref3.thread;
      if (!com.value) {
        thread.value = Get.threadFromNode(this);
      }
      caretPos = com.selectionStart;
      com.value = com.value.slice(0, caretPos) + text + com.value.slice(com.selectionEnd);
      range = caretPos + text.length;
      com.setSelectionRange(range, range);
      com.focus();
      QR.selected.save(com);
      return QR.selected.save(thread);
    },
    characterCount: function() {
      var count, counter;
      counter = QR.nodes.charCount;
      count = QR.nodes.com.textLength;
      counter.textContent = count;
      counter.hidden = count < 1000;
      return (count > 1500 ? $.addClass : $.rmClass)(counter, 'warning');
    },
    drag: function(e) {
      var toggle;
      toggle = e.type === 'dragstart' ? $.off : $.on;
      toggle(d, 'dragover', QR.dragOver);
      return toggle(d, 'drop', QR.dropFile);
    },
    dragOver: function(e) {
      e.preventDefault();
      return e.dataTransfer.dropEffect = 'copy';
    },
    dropFile: function(e) {
      if (!e.dataTransfer.files.length) {
        return;
      }
      e.preventDefault();
      QR.open();
      return QR.handleFiles(e.dataTransfer.files);
    },
    paste: function(e) {
      var blob, files, item, _i, _len, _ref;
      files = [];
      _ref = e.clipboardData.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (!(item.kind === 'file')) {
          continue;
        }
        blob = item.getAsFile();
        blob.name = 'file';
        if (blob.type) {
          blob.name += '.' + blob.type.split('/')[1];
        }
        files.push(blob);
      }
      if (!files.length) {
        return;
      }
      QR.open();
      QR.handleFiles(files);
      return $.addClass(QR.nodes.el, 'dump');
    },
    handleBlob: function(urlBlob, header, url) {
      var blob, end, endnl, endsc, mime, name, name_end, name_start, start, _ref;
      name = url.substr(url.lastIndexOf('/') + 1, url.length);
      start = header.indexOf("Content-Type: ") + 14;
      endsc = header.substr(start, header.length).indexOf(';');
      endnl = header.substr(start, header.length).indexOf('\n') - 1;
      end = endnl;
      if (endsc !== -1 && endsc < endnl) {
        end = endsc;
      }
      mime = header.substr(start, end);
      blob = new Blob([urlBlob], {
        type: mime
      });
      blob.name = url.substr(url.lastIndexOf('/') + 1, url.length);
      name_start = header.indexOf('name="') + 6;
      if (name_start - 6 !== -1) {
        name_end = header.substr(name_start, header.length).indexOf('"');
        blob.name = header.substr(name_start, name_end);
      }
      if (blob.type === null) {
        return QR.error('Unsupported file type.');
      }
      if ((_ref = blob.type) !== 'image/jpeg' && _ref !== 'image/png' && _ref !== 'image/gif' && _ref !== 'application/pdf' && _ref !== 'application/x-shockwave-flash' && _ref !== '') {
        return QR.error('Unsupported file type.');
      }
      return QR.handleFiles([blob]);
    },
    handleUrl: function() {
      var url;
      url = prompt('Insert an url:');
      if (url === null) {
        return;
      }
      GM_xmlhttpRequest({
        method: "GET",
        url: url,
        overrideMimeType: 'text/plain; charset=x-user-defined',
        onload: function(xhr) {
          var data, i, r;
          r = xhr.responseText;
          data = new Uint8Array(r.length);
          i = 0;
          while (i < r.length) {
            data[i] = r.charCodeAt(i);
            i++;
          }
          QR.handleBlob(data, xhr.responseHeaders, url);
          return;
          return {
            onerror: function(xhr) {
              return QR.error("Can't load image.");
            }
          };
        }
      });
    },
    handleFiles: function(files) {
      var file, isSingle, max, _i, _len;
      if (this !== QR) {
        files = __slice.call(this.files);
        this.value = null;
      }
      if (!files.length) {
        return;
      }
      max = QR.nodes.fileInput.max;
      isSingle = files.length === 1;
      QR.cleanNotifications();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        QR.handleFile(file, isSingle, max);
      }
      if (!isSingle) {
        return $.addClass(QR.nodes.el, 'dump');
      }
    },
    handleFile: function(file, isSingle, max) {
      var post;
      if (file.size > max) {
        QR.error("" + file.name + ": File too large (file: " + ($.bytesToString(file.size)) + ", max: " + ($.bytesToString(max)) + ").");
        return;
      }
      if (isSingle) {
        post = QR.selected;
      } else if ((post = QR.posts[QR.posts.length - 1]).file) {
        post = new QR.post();
      }
      if (/^text/.test(file.type)) {
        return post.pasteText(file);
      } else {
        return post.setFile(file);
      }
    },
    openFileInput: function() {
      return QR.nodes.fileInput.click();
    },
    generatePostableThreadsList: function() {
      var list, options, thread, val;
      if (!QR.nodes) {
        return;
      }
      list = QR.nodes.thread;
      options = [list.firstChild];
      for (thread in g.BOARD.threads) {
        options.push($.el('option', {
          value: thread,
          textContent: "Thread No." + thread
        }));
      }
      val = list.value;
      $.rmAll(list);
      $.add(list, options);
      list.value = val;
      if (!list.value) {
        return;
      }
      return list.value = g.VIEW === 'thread' ? g.THREADID : 'new';
    },
    dialog: function() {
      var dialog, elm, event, flagSelector, name, node, nodes, save, _i, _j, _len, _len1, _ref, _ref1;
      dialog = UI.dialog('qr', 'top:0;right:0;', "<div><input type=\"checkbox\" id=\"autohide\" title=\"Auto-hide\"><select data-name=\"thread\" title=\"Create a new thread / Reply\"><option value=\"new\">New thread</option></select><span class=\"move\"></span><a href=\"javascript:;\" class=\"close fa fa-times\" title=\"Close\"></a></div><form><div class=\"persona\"><input type=\"button\" id=\"dump-button\" title=\"Dump list\" value=\"+\"><input data-name=\"name\"  name=\"name\"  list=\"list-name\"  placeholder=\"Name\"    class=\"field\"><input data-name=\"email\" name=\"email\" list=\"list-email\" placeholder=\"E-mail\"  class=\"field\"><input data-name=\"sub\"   name=\"sub\"   list=\"list-sub\"   placeholder=\"Subject\" class=\"field\"></div><div id=\"dump-list\"></div><input type=\"checkbox\" name=\"qr-proceed\" title=\"Proceed on duplicate\" style=\"display: none\"><a href=\"javascript:;\" id=\"add-post\" class=\"fa fa-plus\" title=\"Add a post\"></a><div class=\"textarea\"><textarea data-name=\"com\" placeholder=\"Comment\" class=\"field\"></textarea><span id=\"char-count\"></span></div><div id=\"file-n-submit\"><input type=\"file\" hidden multiple><input type=\"submit\"><input type=\"button\" id=\"qr-file-button\" value=\"Choose files\"><span id=\"qr-no-file\">No selected file</span><input id=\"qr-filename\" data-name=\"filename\" spellcheck=\"false\"><span id=\"qr-filesize\"></span><a id=url-button title='Post from url'><i class=\"fa fa-link\"></i></a><a href=\"javascript:;\" id=\"qr-filerm\" class=\"fa fa-times-circle\" title=\"Remove file\"></a><input type=\"checkbox\" id=\"qr-file-spoiler\" title=\"Spoiler image\"></div></form><datalist id=\"list-name\"></datalist><datalist id=\"list-email\"></datalist><datalist id=\"list-sub\"></datalist>");
      QR.nodes = nodes = {
        el: dialog,
        move: $('.move', dialog),
        autohide: $('#autohide', dialog),
        thread: $('select', dialog),
        close: $('.close', dialog),
        form: $('form', dialog),
        dumpButton: $('#dump-button', dialog),
        urlButton: $('#url-button', dialog),
        name: $('[data-name=name]', dialog),
        email: $('[data-name=email]', dialog),
        sub: $('[data-name=sub]', dialog),
        com: $('[data-name=com]', dialog),
        dumpList: $('#dump-list', dialog),
        proceed: $('[name=qr-proceed]', dialog),
        addPost: $('#add-post', dialog),
        charCount: $('#char-count', dialog),
        fileSubmit: $('#file-n-submit', dialog),
        fileButton: $('#qr-file-button', dialog),
        filename: $('#qr-filename', dialog),
        filesize: $('#qr-filesize', dialog),
        fileRM: $('#qr-filerm', dialog),
        spoiler: $('#qr-file-spoiler', dialog),
        status: $('[type=submit]', dialog),
        fileInput: $('[type=file]', dialog)
      };
      if (Conf['Tab to Choose Files First']) {
        $.add(nodes.fileSubmit, nodes.status);
      }
      $.get('qr-proceed', false, function(item) {
        return nodes.proceed.checked = item['qr-proceed'];
      });
      nodes.fileInput.max = $('input[name=MAX_FILE_SIZE]').value;
      QR.spoiler = !!$('input[name=spoiler]');
      nodes.spoiler.hidden = !QR.spoiler;
      if (g.BOARD.ID === 'f') {
        nodes.flashTag = $.el('select', {
          name: 'filetag',
          innerHTML: "<option value=0>Hentai</option>\n<option value=6>Porn</option>\n<option value=1>Japanese</option>\n<option value=2>Anime</option>\n<option value=3>Game</option>\n<option value=5>Loop</option>\n<option value=4 selected>Other</option>"
        });
        nodes.flashTag.dataset["default"] = '4';
        $.add(nodes.form, nodes.flashTag);
      }
      if (flagSelector = $('.flagSelector')) {
        nodes.flag = flagSelector.cloneNode(true);
        nodes.flag.dataset.name = 'flag';
        nodes.flag.dataset["default"] = '0';
        $.add(nodes.form, nodes.flag);
      }
      _ref = $$('*', QR.nodes.el);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elm = _ref[_i];
        $.on(elm, 'blur', QR.focusout);
        $.on(elm, 'focus', QR.focusin);
      }
      $.on(dialog, 'focusin', QR.focusin);
      $.on(dialog, 'focusout', QR.focusout);
      $.on(nodes.fileButton, 'click', QR.openFileInput);
      $.on(nodes.autohide, 'change', QR.toggleHide);
      $.on(nodes.close, 'click', QR.close);
      $.on(nodes.dumpButton, 'click', function() {
        return nodes.el.classList.toggle('dump');
      });
      $.on(nodes.urlButton, 'click', QR.handleUrl);
      $.on(nodes.proceed, 'click', $.cb.checked);
      $.on(nodes.addPost, 'click', function() {
        return new QR.post(true);
      });
      $.on(nodes.form, 'submit', QR.submit);
      $.on(nodes.fileRM, 'click', function() {
        return QR.selected.rmFile();
      });
      $.on(nodes.spoiler, 'change', function() {
        return QR.selected.nodes.spoiler.click();
      });
      $.on(nodes.fileInput, 'change', QR.handleFiles);
      save = function() {
        return QR.selected.save(this);
      };
      _ref1 = ['thread', 'name', 'email', 'sub', 'com', 'filename', 'flag'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        name = _ref1[_j];
        if (!(node = nodes[name])) {
          continue;
        }
        event = node.nodeName === 'SELECT' ? 'change' : 'input';
        $.on(nodes[name], event, save);
      }
      if (Conf['Remember QR Size']) {
        $.get('QR Size', '', function(item) {
          return nodes.com.style.cssText = item['QR Size'];
        });
        $.on(nodes.com, 'mouseup', function(e) {
          if (e.button !== 0) {
            return;
          }
          return $.set('QR Size', this.style.cssText);
        });
      }
      QR.generatePostableThreadsList();
      QR.persona.init();
      new QR.post(true);
      QR.status();
      QR.cooldown.init();
      QR.captcha.init();
      $.add(d.body, dialog);
      return $.event('QRDialogCreation', null, dialog);
    },
    submit: function(e, dismiss) {
      var challenge, com, err, extra, filetag, formData, m, options, post, response, textOnly, thread, threadID, _ref;
      if (e != null) {
        e.preventDefault();
      }
      if (QR.req) {
        QR.abort();
        return;
      }
      if (QR.cooldown.seconds) {
        QR.cooldown.auto = !QR.cooldown.auto;
        QR.status();
        return;
      }
      post = QR.posts[0];
      post.forceSave();
      if (g.BOARD.ID === 'f') {
        filetag = QR.nodes.flashTag.value;
      }
      threadID = post.thread;
      thread = g.BOARD.threads[threadID];
      if (threadID === 'new') {
        threadID = null;
        if (g.BOARD.ID === 'vg' && !post.sub) {
          err = 'New threads require a subject.';
        } else if (!(post.file || (textOnly = !!$('input[name=textonly]', $.id('postForm'))))) {
          err = 'No file selected.';
        }
      } else if (g.BOARD.threads[threadID].isClosed) {
        err = 'You can\'t reply to this thread anymore.';
      } else if (!(post.com || post.file)) {
        err = 'No file selected.';
      } else if (post.file && thread.fileLimit) {
        err = 'Max limit of image replies has been reached.';
      } else if (!dismiss && !post.file && (m = post.com.match(/pic(ture)? (un)?related/i))) {
        err = $.el('span', {
          innerHTML: "No file selected despite '" + m[0] + "' in your post. <button>Dismiss</button>"
        });
        $.on($('button', err), 'click', function() {
          return QR.submit(null, true);
        });
      }
      if (QR.captcha.isEnabled && !err) {
        _ref = QR.captcha.getOne(), challenge = _ref.challenge, response = _ref.response;
        if (!response) {
          err = 'No valid captcha.';
        }
      }
      QR.cleanNotifications();
      if (err) {
        QR.cooldown.auto = false;
        QR.status();
        QR.error(err);
        return;
      }
      QR.cooldown.auto = QR.posts.length > 1;
      if (Conf['Auto-Hide QR'] && !QR.cooldown.auto) {
        QR.hide();
      }
      if (!QR.cooldown.auto && $.x('ancestor::div[@id="qr"]', d.activeElement)) {
        d.activeElement.blur();
      }
      com = Conf['Markdown'] ? Markdown.format(post.com) : post.com;
      post.lock();
      formData = {
        resto: threadID,
        name: post.name,
        email: post.email,
        sub: post.sub,
        com: com,
        upfile: post.file,
        filetag: filetag,
        spoiler: post.spoiler,
        flag: post.flag,
        textonly: textOnly,
        mode: 'regist',
        pwd: QR.persona.pwd,
        recaptcha_challenge_field: challenge,
        recaptcha_response_field: response
      };
      options = {
        responseType: 'document',
        withCredentials: true,
        onload: QR.response,
        onerror: function() {
          delete QR.req;
          if (QR.captcha.isEnabled) {
            QR.captcha.destroy();
            QR.captcha.setup();
          }
          post.unlock();
          QR.cooldown.auto = false;
          QR.status();
          return QR.error($.el('span', {
            innerHTML: "Connection error. You may have been <a href=//www.4chan.org/banned target=_blank>banned</a>.\n[<a href=\"https://github.com/MayhemYDG/4chan-x/wiki/FAQ#what-does-connection-error-you-may-have-been-banned-mean\" target=_blank>FAQ</a>]"
          }));
        }
      };
      extra = {
        form: $.formData(formData),
        upCallbacks: {
          onload: function() {
            QR.req.isUploadFinished = true;
            QR.req.uploadEndTime = Date.now();
            QR.req.progress = '...';
            return QR.status();
          },
          onprogress: function(e) {
            QR.req.progress = "" + (Math.round(e.loaded / e.total * 100)) + "%";
            return QR.status();
          }
        }
      };
      QR.req = $.ajax($.id('postForm').parentNode.action, options, extra);
      QR.req.uploadStartTime = Date.now();
      QR.req.progress = '...';
      return QR.status();
    },
    response: function() {
      var URL, ban, board, err, h1, isReply, m, post, postID, postsCount, req, resDoc, threadID, _, _ref, _ref1;
      req = QR.req;
      delete QR.req;
      if (QR.captcha.isEnabled) {
        QR.captcha.destroy();
      }
      post = QR.posts[0];
      postsCount = QR.posts.length - 1;
      post.unlock();
      resDoc = req.response;
      if (ban = $('.banType', resDoc)) {
        board = $('.board', resDoc).innerHTML;
        err = $.el('span', {
          innerHTML: ban.textContent.toLowerCase() === 'banned' ? "You are banned on " + board + "! ;_;<br>\nClick <a href=//www.4chan.org/banned target=_blank>here</a> to see the reason." : "You were issued a warning on " + board + " as " + ($('.nameBlock', resDoc).innerHTML) + ".<br>\nReason: " + ($('.reason', resDoc).innerHTML)
        });
      } else if (err = resDoc.getElementById('errmsg')) {
        if ((_ref = $('a', err)) != null) {
          _ref.target = '_blank';
        }
      } else if (resDoc.title !== 'Post successful!') {
        err = 'Connection error with sys.4chan.org.';
      } else if (req.status !== 200) {
        err = "Error " + req.statusText + " (" + req.status + ")";
      }
      if (err) {
        if (/captcha|verification/i.test(err.textContent) || err === 'Connection error with sys.4chan.org.') {
          if (/mistyped/i.test(err.textContent)) {
            err = 'You seem to have mistyped the CAPTCHA.';
          }
          QR.cooldown.auto = false;
          QR.cooldown.set({
            delay: 2
          });
        } else if (err.textContent && (m = err.textContent.match(/wait(?:\s+(\d+)\s+minutes)?\s+(\d+)\s+second/i))) {
          QR.cooldown.auto = !QR.captcha.isEnabled;
          QR.cooldown.set({
            delay: (m[1] || 0) * 60 + Number(m[2])
          });
        } else if (err.textContent.match(/duplicate\sfile/i)) {
          if (QR.nodes.proceed.checked && postsCount) {
            post.rm();
            QR.cooldown.auto = true;
            QR.cooldown.set({
              delay: 10
            });
          } else {
            QR.cooldown.auto = false;
          }
        } else {
          QR.cooldown.auto = false;
        }
        QR.status();
        QR.error(err);
        if (QR.captcha.isEnabled) {
          QR.captcha.setup();
        }
        return;
      }
      h1 = $('h1', resDoc);
      QR.cleanNotifications();
      QR.notifications.push(new Notice('success', h1.textContent, 5));
      QR.persona.set(post);
      _ref1 = h1.nextSibling.textContent.match(/thread:(\d+),no:(\d+)/), _ = _ref1[0], threadID = _ref1[1], postID = _ref1[2];
      postID = +postID;
      threadID = +threadID || postID;
      isReply = threadID !== postID;
      QR.db.set({
        boardID: g.BOARD.ID,
        threadID: threadID,
        postID: postID,
        val: true
      });
      $.event('QRPostSuccessful', {
        boardID: g.BOARD.ID,
        threadID: threadID,
        postID: postID
      });
      $.event('QRPostSuccessful_', {
        boardID: g.BOARD.ID,
        threadID: threadID,
        postID: postID
      });
      QR.cooldown.auto = postsCount && isReply;
      if (QR.captcha.isEnabled && QR.cooldown.auto) {
        QR.captcha.setup();
      }
      if (!(Conf['Persistent QR'] || QR.cooldown.auto)) {
        QR.close();
      } else {
        post.rm();
      }
      QR.cooldown.set({
        req: req,
        post: post,
        isReply: isReply,
        threadID: threadID
      });
      URL = threadID === postID ? Build.path(g.BOARD.ID, threadID) : g.VIEW === 'index' && !QR.cooldown.auto && Conf['Open Post in New Tab'] ? Build.path(g.BOARD.ID, threadID, postID) : void 0;
      if (URL) {
        if (Conf['Open Post in New Tab']) {
          $.open(URL);
        } else {
          window.location = URL;
        }
      }
      return QR.status();
    },
    abort: function() {
      if (QR.req && !QR.req.isUploadFinished) {
        QR.req.abort();
        delete QR.req;
        QR.posts[0].unlock();
        QR.cooldown.auto = false;
        QR.notifications.push(new Notice('info', 'QR upload aborted.', 5));
      }
      return QR.status();
    }
  };

  QR.captcha = {
    init: function() {
      var container, counter, section;
      if (d.cookie.indexOf('pass_enabled=1') >= 0) {
        return;
      }
      if (!(this.isEnabled = !!$.id('g-recaptcha'))) {
        return;
      }
      this.captchas = [];
      $.get('captchas', [], function(_arg) {
        var captchas;
        captchas = _arg.captchas;
        return QR.captcha.sync(captchas);
      });
      $.sync('captchas', this.sync.bind(this));
      section = $.el('div', {
        className: 'captcha-section'
      });
      $.extend(section, {
        innerHTML: "<div class=\"captcha-container\"></div><div class=\"captcha-counter\"><a href=\"javascript:;\"></a></div>"
      });
      container = $('.captcha-container', section);
      counter = $('.captcha-counter > a', section);
      this.nodes = {
        container: container,
        counter: counter
      };
      this.count();
      $.addClass(QR.nodes.el, 'has-captcha');
      $.after(QR.nodes.com.parentNode, section);
      new MutationObserver(this.afterSetup.bind(this)).observe(container, {
        childList: true,
        subtree: true
      });
      $.on(counter, 'click', this.toggle.bind(this));
      return $.on(window, 'captcha:success', this.save.bind(this));
    },
    shouldFocus: false,
    timeouts: {},
    needed: function() {
      var captchaCount, postsCount;
      captchaCount = this.captchas.length;
      if (this.nodes.container.dataset.widgetID && !this.timeouts.destroy) {
        captchaCount++;
      }
      postsCount = QR.posts.length;
      if (postsCount === 1 && !Conf['Auto-load captcha'] && !QR.posts[0].com && !QR.posts[0].file) {
        postsCount = 0;
      }
      return captchaCount < postsCount;
    },
    toggle: function() {
      if (this.nodes.container.dataset.widgetID && !this.timeouts.destroy) {
        return this.destroy();
      } else {
        this.shouldFocus = true;
        return this.setup(true);
      }
    },
    setup: function(force) {
      if (!(this.isEnabled && (this.needed() || force))) {
        return;
      }
      $.addClass(QR.nodes.el, 'captcha-open');
      if (this.timeouts.destroy) {
        clearTimeout(this.timeouts.destroy);
        delete this.timeouts.destroy;
        return this.reload();
      }
      if (this.nodes.container.dataset.widgetID) {
        return;
      }
      return $.globalEval('(function() {\n  var container = document.querySelector("#qr .captcha-container");\n  container.dataset.widgetID = window.grecaptcha.render(container, {\n    sitekey: \'6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc\',\n    theme: document.documentElement.classList.contains(\'tomorrow\') ? \'dark\' : \'light\',\n    callback: function(response) {\n      window.dispatchEvent(new CustomEvent("captcha:success", {detail: response}));\n    }\n  });\n})();');
    },
    afterSetup: function(mutations) {
      var iframe, mutation, node, _i, _j, _len, _len1, _ref;
      for (_i = 0, _len = mutations.length; _i < _len; _i++) {
        mutation = mutations[_i];
        _ref = mutation.addedNodes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          node = _ref[_j];
          if (node.nodeName === 'IFRAME') {
            iframe = node;
          }
        }
      }
      if (!iframe) {
        return;
      }
      if (QR.nodes.el.getBoundingClientRect().bottom > doc.clientHeight) {
        QR.nodes.el.style.top = null;
        QR.nodes.el.style.bottom = '0px';
      }
      if (this.shouldFocus) {
        iframe.focus();
      }
      return this.shouldFocus = false;
    },
    destroy: function() {
      if (!this.isEnabled) {
        return;
      }
      delete this.timeouts.destroy;
      $.rmClass(QR.nodes.el, 'captcha-open');
      $.rmAll(this.nodes.container);
      return this.nodes.container.removeAttribute('data-widget-i-d');
    },
    sync: function(captchas) {
      this.captchas = captchas;
      this.clear();
      return this.count();
    },
    getOne: function() {
      var captcha;
      this.clear();
      if (captcha = this.captchas.shift()) {
        this.count();
        $.set('captchas', this.captchas);
        return captcha.response;
      } else {
        return null;
      }
    },
    save: function(e) {
      var _base;
      if (this.needed()) {
        this.shouldFocus = true;
        this.reload();
      } else {
        this.nodes.counter.focus();
        if ((_base = this.timeouts).destroy == null) {
          _base.destroy = setTimeout(this.destroy.bind(this), 3 * $.SECOND);
        }
      }
      $.forceSync('captchas');
      this.captchas.push({
        response: e.detail,
        timeout: Date.now() + 2 * $.MINUTE
      });
      this.count();
      return $.set('captchas', this.captchas);
    },
    clear: function() {
      var captcha, i, now, _i, _len, _ref;
      if (!this.captchas.length) {
        return;
      }
      now = Date.now();
      _ref = this.captchas;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        captcha = _ref[i];
        if (captcha.timeout > now) {
          break;
        }
      }
      if (!i) {
        return;
      }
      this.captchas = this.captchas.slice(i);
      this.count();
      $.set('captchas', this.captchas);
      return this.setup();
    },
    count: function() {
      this.nodes.counter.textContent = "Captchas: " + this.captchas.length;
      clearTimeout(this.timeouts.clear);
      if (this.captchas.length) {
        return this.timeouts.clear = setTimeout(this.clear.bind(this), this.captchas[0].timeout - Date.now());
      }
    },
    reload: function(focus) {
      return $.globalEval('(function() {\n  var container = document.querySelector("#qr .captcha-container");\n  window.grecaptcha.reset(container.dataset.widgetID);\n})();');
    }
  };

  QR.cooldown = {
    init: function() {
      if (!Conf['Cooldown']) {
        return;
      }
      return QR.cooldown.getDefaults(QR.cooldown.get, QR.cooldown.parseItem);
    },
    parseItem: function(_arg) {
      var key, types;
      types = _arg.types;
      QR.cooldown.types = types;
      QR.cooldown.upSpd = 0;
      QR.cooldown.upSpdAccuracy = .5;
      key = "cooldown." + g.BOARD;
      $.get(key, {}, function(item) {
        QR.cooldown.cooldowns = item[key];
        return QR.cooldown.start();
      });
      return $.sync(key, QR.cooldown.sync);
    },
    start: function() {
      if (!Conf['Cooldown']) {
        return;
      }
      if (QR.cooldown.isCounting) {
        return;
      }
      QR.cooldown.isCounting = true;
      return QR.cooldown.count();
    },
    sync: function(cooldowns) {
      var id;
      for (id in cooldowns) {
        QR.cooldown.cooldowns[id] = cooldowns[id];
      }
      return QR.cooldown.start();
    },
    set: function(data) {
      var cooldown, delay, isReply, post, req, start, threadID, upSpd;
      if (!Conf['Cooldown']) {
        return;
      }
      req = data.req, post = data.post, isReply = data.isReply, threadID = data.threadID, delay = data.delay;
      start = req ? req.uploadEndTime : Date.now();
      if (delay) {
        cooldown = {
          delay: delay
        };
      } else {
        if (post.file) {
          upSpd = post.file.size / ((start - req.uploadStartTime) / $.SECOND);
          QR.cooldown.upSpdAccuracy = ((upSpd > QR.cooldown.upSpd * .9) + QR.cooldown.upSpdAccuracy) / 2;
          QR.cooldown.upSpd = upSpd;
        }
        cooldown = {
          isReply: isReply,
          threadID: threadID
        };
      }
      QR.cooldown.cooldowns[start] = cooldown;
      $.set("cooldown." + g.BOARD, QR.cooldown.cooldowns);
      return QR.cooldown.start();
    },
    unset: function(id) {
      delete QR.cooldown.cooldowns[id];
      if (Object.keys(QR.cooldown.cooldowns).length) {
        return $.set("cooldown." + g.BOARD, QR.cooldown.cooldowns);
      } else {
        return $["delete"]("cooldown." + g.BOARD);
      }
    },
    count: function() {
      var cooldown, cooldowns, elapsed, hasFile, isReply, maxTimer, now, post, seconds, start, type, types, upSpd, upSpdAccuracy, update, _ref;
      if (!Object.keys(QR.cooldown.cooldowns).length) {
        $["delete"]("" + g.BOARD + ".cooldown");
        delete QR.cooldown.isCounting;
        delete QR.cooldown.seconds;
        QR.status();
        return;
      }
      clearTimeout(QR.cooldown.timeout);
      QR.cooldown.timeout = setTimeout(QR.cooldown.count, $.SECOND);
      now = Date.now();
      post = QR.posts[0];
      isReply = post.thread !== 'new';
      hasFile = !!post.file;
      seconds = null;
      _ref = QR.cooldown, types = _ref.types, cooldowns = _ref.cooldowns, upSpd = _ref.upSpd, upSpdAccuracy = _ref.upSpdAccuracy;
      for (start in cooldowns) {
        cooldown = cooldowns[start];
        if ('delay' in cooldown) {
          if (cooldown.delay) {
            seconds = Math.max(seconds, cooldown.delay--);
          } else {
            seconds = Math.max(seconds, 0);
            QR.cooldown.unset(start);
          }
          continue;
        }
        if (isReply === cooldown.isReply) {
          elapsed = Math.floor((now - start) / $.SECOND);
          if (elapsed < 0) {
            continue;
          }
          type = !isReply ? 'thread' : hasFile ? 'image' : 'reply';
          maxTimer = Math.max(types[type] || 0, types[type + '_intra'] || 0);
          if (!((start <= now && now <= start + maxTimer * $.SECOND))) {
            QR.cooldown.unset(start);
          }
          if (isReply && +post.thread === cooldown.threadID) {
            type += '_intra';
          }
          seconds = Math.max(seconds, types[type] - elapsed);
        }
      }
      if (seconds && Conf['Cooldown Prediction'] && hasFile && upSpd) {
        seconds -= Math.floor(post.file.size / upSpd * upSpdAccuracy);
        seconds = Math.max(seconds, 0);
      }
      update = seconds !== null || !!QR.cooldown.seconds;
      QR.cooldown.seconds = seconds;
      if (update) {
        QR.status();
      }
      if (seconds === 0 && QR.cooldown.auto && !QR.req) {
        return QR.submit();
      }
    },
    get: function(cb, defaults) {
      return $.get('QR.cooldowns', {}, function(item) {
        var key, types, val, _base, _name;
        types = (_base = item['QR.cooldowns'])[_name = g.BOARD] != null ? _base[_name] : _base[_name] = {};
        for (key in defaults) {
          val = defaults[key];
          defaults[key] = +val;
          types[key] = +(types[key] || (types[key] = +val));
        }
        return cb({
          defaults: defaults,
          types: types
        });
      });
    },
    getDefaults: function(fcb, scb) {
      var get;
      get = (function(_this) {
        return function(e) {
          return fcb(scb, e.detail);
        };
      })(this);
      $.on(window, 'cooldown:timers', get);
      $.globalEval('window.dispatchEvent(new CustomEvent("cooldown:timers", {detail: cooldowns}))');
      return $.off(window, 'cooldown:timers', get);
    }
  };

  QR.persona = {
    pwd: '',
    always: {},
    init: function() {
      QR.persona.getPassword();
      return $.get('QR.personas', Conf['QR.personas'], function(_arg) {
        var arr, item, personas, type, types, _i, _len, _ref;
        personas = _arg['QR.personas'];
        types = {
          name: [],
          email: [],
          sub: []
        };
        _ref = personas.split('\n');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          QR.persona.parseItem(item.trim(), types);
        }
        for (type in types) {
          arr = types[type];
          QR.persona.loadPersonas(type, arr);
        }
      });
    },
    parseItem: function(item, types) {
      var boards, match, type, val, _ref, _ref1, _ref2;
      if (item[0] === '#') {
        return;
      }
      if (!(match = item.match(/(name|email|subject|password):"(.*)"/i))) {
        return;
      }
      _ref = match, match = _ref[0], type = _ref[1], val = _ref[2];
      item = item.replace(match, '');
      boards = ((_ref1 = item.match(/boards:([^;]+)/i)) != null ? _ref1[1].toLowerCase() : void 0) || 'global';
      if (boards !== 'global' && !(_ref2 = g.BOARD.ID, __indexOf.call(boards.split(','), _ref2) >= 0)) {
        return;
      }
      if (type === 'password') {
        QR.persona.pwd = val;
        return;
      }
      if (type === 'subject') {
        type = 'sub';
      }
      if (/always/i.test(item)) {
        QR.persona.always[type] = val;
      }
      if (__indexOf.call(types[type], val) < 0) {
        return types[type].push(val);
      }
    },
    loadPersonas: function(type, arr) {
      var list, val, _i, _len;
      list = $("#list-" + type, QR.nodes.el);
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        val = arr[_i];
        if (val) {
          $.add(list, $.el('option', {
            textContent: val
          }));
        }
      }
    },
    getPassword: function() {
      var input, m;
      if (!QR.persona.pwd) {
        QR.persona.pwd = (m = d.cookie.match(/4chan_pass=([^;]+)/)) ? decodeURIComponent(m[1]) : (input = $.id('postPassword')) ? input.value : $.id('delPassword').value;
      }
      return QR.persona.pwd;
    },
    get: function(cb) {
      return $.get('QR.persona', {}, function(_arg) {
        var persona;
        persona = _arg['QR.persona'];
        return cb(persona);
      });
    },
    set: function(post) {
      return $.get('QR.persona', {}, function(_arg) {
        var persona;
        persona = _arg['QR.persona'];
        persona = {
          name: post.name,
          email: /^sage$/.test(post.email) ? persona.email : post.email,
          sub: Conf['Remember Subject'] ? post.sub : void 0,
          flag: post.flag
        };
        return $.set('QR.persona', persona);
      });
    }
  };

  QR.post = (function() {
    function _Class(select) {
      this.select = __bind(this.select, this);
      var el, elm, event, prev, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      el = $.el('a', {
        className: 'qr-preview',
        draggable: true,
        href: 'javascript:;',
        innerHTML: '<a class="remove fa fa-times-circle" title=Remove></a><label hidden><input type=checkbox> Spoiler</label><span></span>'
      });
      this.nodes = {
        el: el,
        rm: el.firstChild,
        label: $('label', el),
        spoiler: $('input', el),
        span: el.lastChild
      };
      _ref = $$('*', el);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elm = _ref[_i];
        $.on(elm, 'blur', QR.focusout);
        $.on(elm, 'focus', QR.focusin);
      }
      $.on(el, 'click', this.select);
      $.on(this.nodes.rm, 'click', (function(_this) {
        return function(e) {
          e.stopPropagation();
          return _this.rm();
        };
      })(this));
      $.on(this.nodes.label, 'click', (function(_this) {
        return function(e) {
          return e.stopPropagation();
        };
      })(this));
      $.on(this.nodes.spoiler, 'change', (function(_this) {
        return function(e) {
          _this.spoiler = e.target.checked;
          if (_this === QR.selected) {
            return QR.nodes.spoiler.checked = _this.spoiler;
          }
        };
      })(this));
      $.add(QR.nodes.dumpList, el);
      _ref1 = ['dragStart', 'dragEnter', 'dragLeave', 'dragOver', 'dragEnd', 'drop'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        event = _ref1[_j];
        $.on(el, event.toLowerCase(), this[event]);
      }
      this.thread = g.VIEW === 'thread' ? g.THREADID : 'new';
      _ref2 = QR.posts, prev = _ref2[_ref2.length - 1];
      QR.posts.push(this);
      this.nodes.spoiler.checked = this.spoiler = prev && Conf['Remember Spoiler'] ? prev.spoiler : false;
      QR.persona.get((function(_this) {
        return function(persona) {
          _this.name = 'name' in QR.persona.always ? QR.persona.always.name : prev ? prev.name : persona.name;
          _this.email = 'email' in QR.persona.always ? QR.persona.always.email : prev && !/^sage$/.test(prev.email) ? prev.email : persona.email;
          _this.sub = 'sub' in QR.persona.always ? QR.persona.always.sub : Conf['Remember Subject'] ? prev ? prev.sub : persona.sub : '';
          if (QR.nodes.flag) {
            _this.flag = prev ? prev.flag : persona.flag;
          }
          if (QR.selected === _this) {
            return _this.load();
          }
        };
      })(this));
      if (select) {
        this.select();
      }
      this.unlock();
    }

    _Class.prototype.rm = function() {
      var index;
      this["delete"]();
      index = QR.posts.indexOf(this);
      if (QR.posts.length === 1) {
        new QR.post(true);
      } else if (this === QR.selected) {
        (QR.posts[index - 1] || QR.posts[index + 1]).select();
      }
      QR.posts.splice(index, 1);
      return QR.status();
    };

    _Class.prototype["delete"] = function() {
      $.rm(this.nodes.el);
      return URL.revokeObjectURL(this.URL);
    };

    _Class.prototype.lock = function(lock) {
      var name, node, _i, _len, _ref;
      if (lock == null) {
        lock = true;
      }
      this.isLocked = lock;
      if (this !== QR.selected) {
        return;
      }
      _ref = ['thread', 'name', 'email', 'sub', 'com', 'fileButton', 'filename', 'spoiler', 'flag'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (!(node = QR.nodes[name])) {
          continue;
        }
        node.disabled = lock;
      }
      if (QR.captcha.isEnabled) {
        QR.captcha.nodes.input.disabled = lock;
      }
      this.nodes.rm.style.visibility = lock ? 'hidden' : '';
      (lock ? $.off : $.on)(QR.nodes.filename.previousElementSibling, 'click', QR.openFileInput);
      this.nodes.spoiler.disabled = lock;
      return this.nodes.el.draggable = !lock;
    };

    _Class.prototype.unlock = function() {
      return this.lock(false);
    };

    _Class.prototype.select = function() {
      var rectEl, rectList;
      if (QR.selected) {
        QR.selected.nodes.el.id = null;
        QR.selected.forceSave();
      }
      QR.selected = this;
      this.lock(this.isLocked);
      this.nodes.el.id = 'selected';
      rectEl = this.nodes.el.getBoundingClientRect();
      rectList = this.nodes.el.parentNode.getBoundingClientRect();
      this.nodes.el.parentNode.scrollLeft += rectEl.left + rectEl.width / 2 - rectList.left - rectList.width / 2;
      return this.load();
    };

    _Class.prototype.load = function() {
      var name, node, _i, _len, _ref;
      _ref = ['thread', 'name', 'email', 'sub', 'com', 'filename', 'flag'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (!(node = QR.nodes[name])) {
          continue;
        }
        node.value = this[name] || node.dataset["default"] || null;
      }
      this.showFileData();
      return QR.characterCount();
    };

    _Class.prototype.save = function(input) {
      var name, _ref;
      if (input.type === 'checkbox') {
        this.spoiler = input.checked;
        return;
      }
      name = input.dataset.name;
      this[name] = input.value || input.dataset["default"] || null;
      switch (name) {
        case 'thread':
          return QR.status();
        case 'com':
          this.nodes.span.textContent = this.com;
          QR.characterCount();
          if (QR.cooldown.auto && this === QR.posts[0] && (0 < (_ref = QR.cooldown.seconds) && _ref <= 5)) {
            return QR.cooldown.auto = false;
          }
          break;
        case 'filename':
          if (!this.file) {
            return;
          }
          this.file.newName = this.filename.replace(/[/\\]/g, '-');
          if (!/\.(jpe?g|png|gif|pdf|swf|webm)$/i.test(this.filename)) {
            this.file.newName += '.jpg';
          }
          return this.updateFilename();
      }
    };

    _Class.prototype.forceSave = function() {
      var name, node, _i, _len, _ref;
      if (this !== QR.selected) {
        return;
      }
      _ref = ['thread', 'name', 'email', 'sub', 'com', 'filename', 'spoiler', 'flag'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        if (!(node = QR.nodes[name])) {
          continue;
        }
        this.save(node);
      }
    };

    _Class.prototype.setFile = function(file) {
      this.file = file;
      this.filename = file.name;
      this.filesize = $.bytesToString(file.size);
      if (QR.spoiler) {
        this.nodes.label.hidden = false;
      }
      URL.revokeObjectURL(this.URL);
      if (this === QR.selected) {
        this.showFileData();
      } else {
        this.updateFilename();
      }
      if (!/^image/.test(file.type)) {
        this.nodes.el.style.backgroundImage = null;
        return;
      }
      return this.setThumbnail();
    };

    _Class.prototype.setThumbnail = function() {
      var fileURL, img;
      img = $.el('img');
      img.onload = (function(_this) {
        return function() {
          var cv, height, s, width;
          s = 90 * 2 * window.devicePixelRatio;
          if (_this.file.type === 'image/gif') {
            s *= 3;
          }
          height = img.height, width = img.width;
          if (height < s || width < s) {
            _this.URL = fileURL;
            _this.nodes.el.style.backgroundImage = "url(" + _this.URL + ")";
            return;
          }
          if (height <= width) {
            width = s / height * width;
            height = s;
          } else {
            height = s / width * height;
            width = s;
          }
          cv = $.el('canvas');
          cv.height = img.height = height;
          cv.width = img.width = width;
          cv.getContext('2d').drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(fileURL);
          return cv.toBlob(function(blob) {
            _this.URL = URL.createObjectURL(blob);
            return _this.nodes.el.style.backgroundImage = "url(" + _this.URL + ")";
          });
        };
      })(this);
      fileURL = URL.createObjectURL(this.file);
      return img.src = fileURL;
    };

    _Class.prototype.rmFile = function() {
      if (this.isLocked) {
        return;
      }
      delete this.file;
      delete this.filename;
      delete this.filesize;
      this.nodes.el.title = null;
      this.nodes.el.style.backgroundImage = null;
      if (QR.spoiler) {
        this.nodes.label.hidden = true;
      }
      this.showFileData();
      return URL.revokeObjectURL(this.URL);
    };

    _Class.prototype.updateFilename = function() {
      var long;
      long = "" + this.filename + " (" + this.filesize + ")";
      this.nodes.el.title = long;
      if (this !== QR.selected) {
        return;
      }
      return QR.nodes.filename.title = long;
    };

    _Class.prototype.showFileData = function() {
      if (this.file) {
        this.updateFilename();
        QR.nodes.filename.value = this.filename;
        QR.nodes.filesize.textContent = this.filesize;
        QR.nodes.spoiler.checked = this.spoiler;
        return $.addClass(QR.nodes.fileSubmit, 'has-file');
      } else {
        return $.rmClass(QR.nodes.fileSubmit, 'has-file');
      }
    };

    _Class.prototype.pasteText = function(file) {
      var reader;
      reader = new FileReader();
      reader.onload = (function(_this) {
        return function(e) {
          var text;
          text = e.target.result;
          if (_this.com) {
            _this.com += "\n" + text;
          } else {
            _this.com = text;
          }
          if (QR.selected === _this) {
            QR.nodes.com.value = _this.com;
          }
          return _this.nodes.span.textContent = _this.com;
        };
      })(this);
      return reader.readAsText(file);
    };

    _Class.prototype.dragStart = function(e) {
      e.dataTransfer.setDragImage(this, e.layerX, e.layerY);
      return $.addClass(this, 'drag');
    };

    _Class.prototype.dragEnd = function() {
      return $.rmClass(this, 'drag');
    };

    _Class.prototype.dragEnter = function() {
      return $.addClass(this, 'over');
    };

    _Class.prototype.dragLeave = function() {
      return $.rmClass(this, 'over');
    };

    _Class.prototype.dragOver = function(e) {
      e.preventDefault();
      return e.dataTransfer.dropEffect = 'move';
    };

    _Class.prototype.drop = function() {
      var el, index, newIndex, oldIndex, post;
      $.rmClass(this, 'over');
      if (!this.draggable) {
        return;
      }
      el = $('.drag', this.parentNode);
      index = function(el) {
        return __slice.call(el.parentNode.children).indexOf(el);
      };
      oldIndex = index(el);
      newIndex = index(this);
      (oldIndex < newIndex ? $.after : $.before)(this, el);
      post = QR.posts.splice(oldIndex, 1)[0];
      QR.posts.splice(newIndex, 0, post);
      return QR.status();
    };

    return _Class;

  })();

  ImageExpand = {
    init: function() {
      if (!Conf['Image Expansion']) {
        return;
      }
      this.EAI = $.el('a', {
        className: 'expand-all-shortcut fa fa-expand',
        title: 'Expand All Images',
        href: 'javascript:;'
      });
      $.on(this.EAI, 'click', this.cb.toggleAll);
      Header.addShortcut(this.EAI, 3);
      $.on(d, 'scroll visibilitychange', this.cb.playVideos);
      return Post.callbacks.push({
        name: 'Image Expansion',
        cb: this.node
      });
    },
    node: function() {
      if (!(this.file && (this.file.isImage || this.file.isVideo))) {
        return;
      }
      $.on(this.file.thumb.parentNode, 'click', ImageExpand.cb.toggle);
      if (this.isClone) {
        if (this.file.error) {
          this.file.error = $('.warning', this.file.thumb.parentNode);
        } else if (this.file.isExpanding || this.file.isExpanded) {
          ImageExpand.contract(this);
          ImageExpand.expand(this);
          return;
        }
      }
      if (ImageExpand.on && !this.isHidden && (Conf['Expand spoilers'] || !this.file.isSpoiler)) {
        return ImageExpand.expand(this);
      }
    },
    cb: {
      toggle: function(e) {
        if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        return ImageExpand.toggle(Get.postFromNode(this));
      },
      toggleAll: function() {
        var ID, func, post, _i, _len, _ref, _ref1;
        $.event('CloseMenu');
        if (ImageExpand.on = $.hasClass(ImageExpand.EAI, 'expand-all-shortcut')) {
          ImageExpand.EAI.className = 'contract-all-shortcut fa fa-compress';
          ImageExpand.EAI.title = 'Contract All Images';
          func = ImageExpand.expand;
        } else {
          ImageExpand.EAI.className = 'expand-all-shortcut fa fa-expand';
          ImageExpand.EAI.title = 'Expand All Images';
          func = ImageExpand.contract;
        }
        _ref = g.posts;
        for (ID in _ref) {
          post = _ref[ID];
          if (post.file && (post.file.isImage || post.file.isVideo)) {
            _ref1 = [post].concat(post.clones);
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              post = _ref1[_i];
              if (ImageExpand.on && (post.isHidden || !Conf['Expand spoilers'] && post.file.isSpoiler || !doc.contains(post.nodes.root) || Conf['Expand from here'] && Header.getTopOf(post.file.thumb) < 0)) {
                continue;
              }
              $.queueTask(func, post);
            }
          }
        }
      },
      playVideos: function(e) {
        var fullID, play, post, _i, _len, _ref, _ref1;
        _ref = g.posts;
        for (fullID in _ref) {
          post = _ref[fullID];
          if (!(post.file && post.file.isVideo && post.file.isExpanded)) {
            continue;
          }
          _ref1 = [post].concat(post.clones);
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            post = _ref1[_i];
            play = !d.hidden && !post.isHidden && doc.contains(post.nodes.root) && Header.isNodeVisible(post.nodes.root);
            if (play) {
              post.file.fullImage.play();
            } else {
              post.file.fullImage.pause();
            }
          }
        }
      },
      setFitness: function() {
        return (this.checked ? $.addClass : $.rmClass)(doc, this.name.toLowerCase().replace(/\s+/g, '-'));
      }
    },
    toggle: function(post) {
      var thumb, top, x, y;
      thumb = post.file.thumb;
      if (!(post.file.isExpanded || post.file.isExpanding)) {
        ImageExpand.expand(post);
        return;
      }
      top = Header.getTopOf(post.nodes.root);
      if (top < 0) {
        y = top;
      }
      if (post.nodes.root.getBoundingClientRect().left < 0) {
        x = -window.scrollX;
      }
      if (x || y) {
        window.scrollBy(x, y);
      }
      return ImageExpand.contract(post);
    },
    contract: function(post) {
      $.rmClass(post.nodes.root, 'expanded-image');
      $.rmClass(post.file.thumb, 'expanding');
      delete post.file.isExpanding;
      delete post.file.isExpanded;
      if (post.file.isVideo && post.file.fullImage) {
        return post.file.fullImage.pause();
      }
    },
    expand: function(post, src) {
      var file;
      if (post.file.isExpanding || post.file.isExpanded) {
        return;
      }
      if (post.file.fullImage) {
        ImageExpand.waitExpand(post);
        return;
      }
      post.file.fullImage = file = post.file.isImage ? $.el('img') : $.el('video', {
        loop: true
      });
      file.className = 'full-image';
      file.src = src || post.file.URL;
      $.on(file, 'error', ImageExpand.error);
      ImageExpand.waitExpand(post);
      if (post.file.error) {
        $.rm(post.file.error);
        delete post.file.error;
      }
      return $.after(post.file.thumb, file);
    },
    waitExpand: function(post) {
      var complete, file;
      post.file.isExpanding = true;
      if (post.file.isReady) {
        ImageExpand.completeExpand(post);
        return;
      }
      $.addClass(post.file.thumb, 'expanding');
      file = post.file.fullImage;
      if (post.file.isImage) {
        $.asap((function() {
          if (post.file.isExpanding) {
            return file.naturalHeight;
          } else {
            return true;
          }
        }), function() {
          return ImageExpand.completeExpand(post);
        });
        return;
      }
      if (file.readyState >= file.HAVE_CURRENT_DATA) {
        ImageExpand.completeExpand(post);
        return;
      }
      complete = function() {
        $.off(file, 'loadeddata', complete);
        return ImageExpand.completeExpand(post);
      };
      return $.on(file, 'loadeddata', complete);
    },
    completeExpand: function(post) {
      var bottom;
      if (!post.file.isExpanding) {
        return;
      }
      delete post.file.isExpanding;
      post.file.isReady = true;
      post.file.isExpanded = true;
      if (post.file.isVideo && !d.hidden && (post.isClone && !post.nodes.root.parentNode || Header.isNodeVisible(post.nodes.root))) {
        post.file.fullImage.play();
      }
      if (!post.nodes.root.parentNode) {
        $.addClass(post.nodes.root, 'expanded-image');
        $.rmClass(post.file.thumb, 'expanding');
        return;
      }
      bottom = post.nodes.root.getBoundingClientRect().bottom;
      return $.queueTask(function() {
        $.addClass(post.nodes.root, 'expanded-image');
        $.rmClass(post.file.thumb, 'expanding');
        if (!(bottom <= 0)) {
          return;
        }
        return window.scrollBy(0, post.nodes.root.getBoundingClientRect().bottom - bottom);
      });
    },
    error: function() {
      var URL, error, post, src, timeoutID;
      post = Get.postFromNode(this);
      $.rm(this);
      delete post.file.isReady;
      delete post.file.fullImage;
      if (!(post.file.isExpanding || post.file.isExpanded)) {
        return;
      }
      ImageExpand.contract(post);
      if (this.error && this.error.code !== this.error.MEDIA_ERR_NETWORK) {
        error = (function() {
          switch (this.error.code) {
            case 1:
              return 'MEDIA_ERR_ABORTED';
            case 3:
              return 'MEDIA_ERR_DECODE';
            case 4:
              return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
            case 5:
              return 'MEDIA_ERR_ENCRYPTED';
          }
        }).call(this);
        post.file.error = $.el('div', {
          textContent: "Playback error: " + error,
          className: 'warning'
        });
        $.after(post.file.thumb, post.file.error);
        return;
      }
      src = this.src.split('/');
      if (src[2] === 'i.4cdn.org') {
        URL = Redirect.to('file', {
          boardID: src[3],
          filename: src[4].replace(/\?.+$/, '')
        });
        if (URL) {
          setTimeout(ImageExpand.expand, 10000, post, URL);
          return;
        }
        if (g.DEAD || post.isDead || post.file.isDead) {
          return;
        }
      }
      timeoutID = setTimeout(ImageExpand.expand, 10000, post);
      return $.ajax("//a.4cdn.org/" + post.board + "/thread/" + post.thread + ".json", {
        onload: function() {
          var postObj, _i, _len, _ref;
          if (this.status !== 200) {
            return;
          }
          _ref = this.response.posts;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            postObj = _ref[_i];
            if (postObj.no === post.ID) {
              break;
            }
          }
          if (postObj.no !== post.ID) {
            clearTimeout(timeoutID);
            return post.kill();
          } else if (postObj.filedeleted) {
            clearTimeout(timeoutID);
            return post.kill(true);
          }
        }
      });
    },
    menu: {
      init: function() {
        var conf, createSubEntry, el, name, subEntries, _ref;
        if (!Conf['Image Expansion']) {
          return;
        }
        el = $.el('span', {
          textContent: 'Image Expansion',
          className: 'image-expansion-link'
        });
        createSubEntry = ImageExpand.menu.createSubEntry;
        subEntries = [];
        _ref = Config.imageExpansion;
        for (name in _ref) {
          conf = _ref[name];
          subEntries.push(createSubEntry(name, conf[1]));
        }
        return Header.menu.addEntry({
          el: el,
          order: 80,
          subEntries: subEntries
        });
      },
      createSubEntry: function(name, desc) {
        var input, label;
        label = $.el('label', {
          innerHTML: "<input type=checkbox name='" + name + "'> " + name,
          title: desc
        });
        input = label.firstElementChild;
        if (name === 'Fit width' || name === 'Fit height') {
          $.on(input, 'change', ImageExpand.cb.setFitness);
        }
        input.checked = Conf[name];
        $.event('change', null, input);
        $.on(input, 'change', $.cb.checked);
        return {
          el: label
        };
      }
    }
  };

  ImageHover = {
    init: function() {
      if (Conf['Image Hover']) {
        Post.callbacks.push({
          name: 'Image Hover',
          cb: this.node
        });
      }
      if (Conf['Image Hover in Catalog']) {
        return CatalogThread.callbacks.push({
          name: 'Image Hover',
          cb: this.catalogNode
        });
      }
    },
    node: function() {
      if (!(this.file && (this.file.isImage || this.file.isVideo))) {
        return;
      }
      return $.on(this.file.thumb, 'mouseover', ImageHover.mouseover);
    },
    catalogNode: function() {
      if (!(this.thread.OP.file && (this.thread.OP.file.isImage || this.thread.OP.file.isVideo))) {
        return;
      }
      return $.on(this.nodes.thumb, 'mouseover', ImageHover.mouseover);
    },
    mouseover: function(e) {
      var el, post;
      post = $.hasClass(this, 'thumb') ? g.posts[this.parentNode.dataset.fullID] : Get.postFromNode(this);
      el = post.file.isImage ? $.el('img') : $.el('video', {
        autoplay: true,
        loop: true
      });
      el.id = 'ihover';
      el.src = post.file.URL;
      el.dataset.fullID = post.fullID;
      $.add(d.body, el);
      UI.hover({
        root: this,
        el: el,
        latestEvent: e,
        endEvents: 'mouseout click',
        asapTest: post.file.isImage ? function() {
          return el.naturalHeight;
        } : function() {
          return el.readyState >= el.HAVE_CURRENT_DATA;
        }
      });
      return $.on(el, 'error', ImageHover.error);
    },
    error: function() {
      var URL, post, src, timeoutID;
      if (!doc.contains(this)) {
        return;
      }
      post = g.posts[this.dataset.fullID];
      src = this.src.split('/');
      if (src[2] === 'i.4cdn.org') {
        URL = Redirect.to('file', {
          boardID: src[3],
          filename: src[4].replace(/\?.+$/, '')
        });
        if (URL) {
          this.src = URL;
          return;
        }
        if (g.DEAD || post.isDead || post.file.isDead) {
          return;
        }
      }
      timeoutID = setTimeout(((function(_this) {
        return function() {
          return _this.src = post.file.URL + '?' + Date.now();
        };
      })(this)), 3000);
      return $.ajax("//a.4cdn.org/" + post.board + "/thread/" + post.thread + ".json", {
        onload: function() {
          var postObj, _i, _len, _ref;
          if (this.status !== 200) {
            return;
          }
          _ref = this.response.posts;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            postObj = _ref[_i];
            if (postObj.no === post.ID) {
              break;
            }
          }
          if (postObj.no !== post.ID) {
            clearTimeout(timeoutID);
            return post.kill();
          } else if (postObj.filedeleted) {
            clearTimeout(timeoutID);
            return post.kill(true);
          }
        }
      });
    }
  };

  ImageReplace = {
    init: function() {
      var type, _i, _len, _ref;
      if (g.VIEW === 'catalog') {
        return;
      }
      this.active = {};
      _ref = ['JPG', 'PNG', 'GIF'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        if (Conf["Replace " + type]) {
          this.active[type] = true;
        }
      }
      if (!Object.keys(this.active).length) {
        return;
      }
      return Post.callbacks.push({
        name: 'Replace Image',
        cb: this.node
      });
    },
    node: function() {
      var URL, thumb, type, _ref, _ref1;
      if (this.isClone || this.isHidden || this.thread.isHidden || !((_ref = this.file) != null ? _ref.isImage : void 0)) {
        return;
      }
      _ref1 = this.file, thumb = _ref1.thumb, URL = _ref1.URL;
      type = URL.slice(-3).toUpperCase();
      if (!(ImageReplace.active[type] && !/spoiler/.test(thumb.src))) {
        return;
      }
      return ImageReplace.replace.call({
        file: this.file,
        isReply: this.isReply,
        thumb: thumb,
        src: URL
      });
    },
    replace: function() {
      var img, style, thumb;
      thumb = this.thumb;
      if (this.file.isSpoiler) {
        style = thumb.style;
        style.maxHeight = style.maxWidth = this.isReply ? '125px' : '250px';
      }
      img = $.el('img');
      $.on(img, 'load', function() {
        return thumb.src = thumb.thumbURL = this.src;
      });
      return img.src = this.src;
    }
  };

  ImageReplaceLoaded = {
    init: function() {
      if (g.VIEW === 'catalog' || !Conf['Replace Loaded Images']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Replace Loaded Image',
        cb: this.node
      });
    },
    node: function() {
      var URL, file, isReply, thumb, type, _ref;
      if (this.isHidden || this.thread.isHidden || !((_ref = this.file) != null ? _ref.isImage : void 0)) {
        return;
      }
      file = this.file, isReply = this.isReply;
      thumb = file.thumb, URL = file.URL;
      type = URL.slice(-3).toUpperCase();
      if (ImageReplace.active[type] || /spoiler/.test(thumb.src)) {
        return;
      }
      if (Conf['Image Hover']) {
        $.on(thumb, 'mouseover', function() {
          return ImageReplace.replace.call({
            file: file,
            isReply: isReply,
            thumb: thumb,
            src: URL
          });
        });
      }
      if (Conf['Image Expansion']) {
        return $.on(thumb, 'click', function() {
          return $.asap((function() {
            return file.fullImage;
          }), function() {
            return ImageReplace.replace.call({
              file: file,
              isReply: isReply,
              thumb: thumb,
              src: file.fullImage.src
            });
          });
        });
      }
    }
  };

  RevealSpoilers = {
    init: function() {
      if (!Conf['Reveal Spoilers']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Reveal Spoilers',
        cb: this.node
      });
    },
    node: function() {
      var thumb, _ref;
      if (this.isClone || !((_ref = this.file) != null ? _ref.isSpoiler : void 0)) {
        return;
      }
      thumb = this.file.thumb;
      thumb.removeAttribute('style');
      return thumb.src = this.file.thumbURL;
    }
  };

  Sauce = {
    init: function() {
      var err, link, links, _i, _len, _ref;
      if (!Conf['Sauce']) {
        return;
      }
      links = [];
      _ref = Conf['sauces'].split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        try {
          if (link[0] !== '#') {
            links.push(this.createSauceLink(link.trim()));
          }
        } catch (_error) {
          err = _error;
        }
      }
      if (!links.length) {
        return;
      }
      this.links = links;
      this.link = $.el('a', {
        target: '_blank'
      });
      return Post.callbacks.push({
        name: 'Sauce',
        cb: this.node
      });
    },
    createSauceLink: function(link) {
      var m, text;
      link = link.replace(/%(T?URL|MD5|board|name)/g, function(parameter) {
        switch (parameter) {
          case '%TURL':
            return "' + encodeURIComponent(post.file.thumbURL) + '";
          case '%URL':
            return "' + encodeURIComponent(post.file.URL) + '";
          case '%MD5':
            return "' + encodeURIComponent(post.file.MD5) + '";
          case '%board':
            return "' + encodeURIComponent(post.board) + '";
          case '%name':
            return "' + encodeURIComponent(post.file.name) + '";
          default:
            return parameter;
        }
      });
      text = (m = link.match(/;text:(.+)$/)) ? m[1] : link.match(/(\w+)\.\w+\//)[1];
      link = link.replace(/;text:.+$/, '');
      return Function('post', 'a', "a.href = '" + link + "';\na.textContent = '" + text + "';\nreturn a;");
    },
    node: function() {
      var link, nodes, _i, _len, _ref;
      if (this.isClone || !this.file) {
        return;
      }
      nodes = [];
      _ref = Sauce.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        nodes.push($.tn('\u00A0'), link(this, Sauce.link.cloneNode(true)));
      }
      return $.add(this.file.text, nodes);
    }
  };

  CoverPreview = {
    init: function() {
      if (g.VIEW === 'catalog' || !Conf['Cover Preview']) {
        return;
      }
      this.services = Embedding.services;
      return Post.callbacks.push({
        name: 'Cover Preview',
        cb: this.node
      });
    },
    node: function() {
      var embed, _i, _len, _ref;
      if (!this.embeds) {
        return;
      }
      _ref = this.embeds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        embed = _ref[_i];
        if (embed.service.preview) {
          CoverPreview.preview(embed);
        }
      }
    },
    preview: function(_arg) {
      var anchor, post, result, service;
      anchor = _arg.anchor, post = _arg.post, result = _arg.result, service = _arg.service;
      return $.on(anchor, 'mouseover', function(e) {
        var el, src;
        src = service.preview.call(result[1]);
        el = $.el('img', {
          src: src,
          id: 'ihover'
        });
        el.setAttribute('data-fullid', post.fullID);
        $.add(d.body, el);
        return UI.hover({
          root: anchor,
          el: el,
          latestEvent: e,
          endEvents: 'mouseout click',
          asapTest: function() {
            return el.height;
          }
        });
      });
    }
  };

  Embedding = {
    init: function() {
      if (g.VIEW === 'catalog' || !Conf['Embedding']) {
        return;
      }
      if (Conf['Floating Embeds']) {
        this.dialog = UI.dialog('embedding', 'top: 50px; right: 0px;', "<div><div class=\"move\"></div><a href=\"javascript:;\" class=\"jump\" title=\"Jump to post\">→</a><a href=\"javascript:;\" class=\"close\" title=\"Close\">×</a></div><div id=\"media-embed\"><div></div></div>");
        this.media = $('#media-embed', this.dialog);
        $.on(d, '4chanXInitFinished', this.ready);
      }
      return Post.callbacks.push({
        name: 'Embedding',
        cb: this.node
      });
    },
    node: function() {
      var anchor, anchors, embed, result, service, _fn, _i, _j, _len, _len1, _ref;
      anchors = $$('.linkified', this.nodes.comment);
      if (!anchors.length || this.isClone && !this.origin.embeds) {
        return;
      }
      _fn = function(embed) {
        return $.on(embed.toggle, 'click', function(e) {
          return Embedding.toggle(embed, e);
        });
      };
      for (_i = 0, _len = anchors.length; _i < _len; _i++) {
        anchor = anchors[_i];
        _ref = Embedding.services;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          service = _ref[_j];
          if (result = service.regex.exec(anchor.href)) {
            break;
          }
        }
        if (!result) {
          continue;
        }
        embed = new Embed(this, anchor, service, result);
        _fn(embed);
      }
    },
    ready: function() {
      $.off(d, '4chanXInitFinished', Embedding.ready);
      $.addClass(Embedding.dialog, 'empty');
      $.on($('.close', Embedding.dialog), 'click', Embedding.toggleFloat);
      $.on($('.move', Embedding.dialog), 'mousedown', Embedding.dragEmbed);
      $.on($('.jump', Embedding.dialog), 'click', function() {
        return Header.scrollTo(Embedding.lastEmbed.post.nodes.root);
      });
      return $.add(d.body, Embedding.dialog);
    },
    toggle: function(embed, e) {
      e.preventDefault();
      e.stopPropagation();
      if (!navigator.onLine) {
        return;
      }
      if (embed.isEmbedded) {
        embed.rmEmbed();
        embed.toggle.textContent = 'Embed';
        return;
      } else if (embed.isLoading) {
        return;
      }
      embed.isLoading = true;
      return embed.service.embedURL.call(embed);
    },
    toggleFloat: function(e, embed) {
      var div, el, href;
      if (!(div = Embedding.media.firstChild)) {
        return;
      }
      if (el = embed != null ? embed.el : void 0) {
        href = $('[title="Link to this post"]', embed.post.nodes.info).href;
        $.replace(div, el);
        Embedding.lastEmbed = embed;
        $.rmClass(Embedding.dialog, 'empty');
        return;
      }
      delete Embedding.lastEmbed;
      $.addClass(Embedding.dialog, 'empty');
      return $.replace(div, $.el('div'));
    },
    dragEmbed: function(e) {
      var style;
      style = Embedding.media.style;
      if (Embedding.dragEmbed.mouseup) {
        $.off(d, 'mouseup', Embedding.dragEmbed);
        Embedding.dragEmbed.mouseup = false;
        style.visibility = '';
        return;
      }
      $.on(d, 'mouseup', Embedding.dragEmbed);
      Embedding.dragEmbed.mouseup = true;
      return style.visibility = 'hidden';
    },
    cb: {
      toggle: function(embed, el) {
        var div, style;
        embed.el = el;
        style = embed.service.style;
        if (style) {
          $.extend(el.style, style);
        }
        if (Conf['Floating Embeds']) {
          Embedding.toggleFloat(null, embed);
          embed.isLoading = false;
          return;
        }
        div = $.el('div', {
          className: 'media-embed'
        });
        $.add(div, el);
        $.after(embed.span, div);
        embed.toggle.textContent = 'Unembed';
        embed.isLoading = false;
        return embed.isEmbedded = true;
      }
    },
    services: [
      {
        name: 'YouTube',
        style: {
          border: 'none',
          width: '640px',
          height: '360px'
        },
        regex: /^https?:\/\/(?:(?:www\.|m\.)?you.+v[=\/]|#p\/[a-z]\/.+\/|youtu\.be\/)([a-z0-9_-]+)(?:.*[#&\?]t=([0-9hms]+))?/i,
        title: function() {
          return this.entry.title.$t;
        },
        titleURL: function() {
          return "https://gdata.youtube.com/feeds/api/videos/" + this.result[1] + "?alt=json&fields=title/text(),yt:noembed,app:control/yt:state/@reasonCode";
        },
        preview: function() {
          return "https://img.youtube.com/vi/" + this + "/0.jpg";
        },
        embedURL: function() {
          var el, match, name, time, _, _ref;
          _ref = this.result, _ = _ref[0], name = _ref[1], time = _ref[2];
          time = time ? (match = /((\d+)h)?((\d+)m)?(\d+)?/.exec(time), time = parseInt(match[2] || 0) * 3600 + parseInt(match[4] || 0) * 60 + parseInt(match[5] || 0), "&start=" + time) : '';
          el = $.el('iframe', {
            src: "https://youtube.com/embed/" + name + "?rel=1&autohide=1&iv_load_policy=3" + time
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'SoundCloud',
        regex: /(?:s(?:nd\.sc|oundcloud\.com)|www\.s(?:nd\.sc|oundcloud\.com)|m\.soundcloud\.com)\/([^#\&\?]+)/i,
        title: function() {
          return this.title;
        },
        titleURL: function() {
          return "https://soundcloud.com/oembed?&format=json&url=" + this.anchor.href;
        },
        embedURL: function() {
          var that, url;
          url = "https://soundcloud.com/oembed?show_artwork=false&maxwidth=500px&show_comments=false&format=json&iframe=true&url=" + this.anchor.href;
          that = this;
          $.cache(url, function() {
            var el, _ref;
            if ((_ref = this.status) === 200 || _ref === 304) {
              el = $.el('div', {
                innerHTML: JSON.parse(this.response).html
              });
              Embedding.cb.toggle(that, el);
              return;
            }
            return that.isLoading = false;
          });
        }
      }, {
        name: 'Vocaroo',
        style: {
          border: 'none',
          width: '150px',
          height: '45px'
        },
        regex: /vocaroo\.com\/i\/([a-zA-Z0-9]+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "http://vocaroo.com/player.swf?autoplay=0&playMediaID=" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'Vimeo',
        style: {
          border: 'none',
          width: '640px',
          height: '360px'
        },
        regex: /vimeo\.com\/(?:m\/)?(\d+)(?:.*[#&\?](t=\d+))?/i,
        title: function() {
          return this.title;
        },
        titleURL: function() {
          return "https://vimeo.com/api/oembed.json?url=" + this.anchor.href;
        },
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "https://player.vimeo.com/video/" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'Pastebin',
        style: {
          border: 'none',
          width: '640px',
          height: '500px'
        },
        regex: /pastebin\.com\/(?!u\/)(?:raw.php\?i=)?([a-zA-Z0-9]+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "http://pastebin.com/embed_iframe.php?i=" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'Gist',
        style: {
          border: 'none',
          width: '640px',
          height: '500px'
        },
        regex: /gist\.github\.com\/\w+\/(\w+)/i,
        title: function() {
          var file, response;
          response = this.files;
          for (file in response) {
            if (response.hasOwnProperty(file)) {
              return file;
            }
          }
        },
        titleURL: function() {
          return "https://api.github.com/gists/" + this.result[1];
        },
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "data:text/html,<script src='https://gist.github.com/" + this.result[1] + ".js'></script>"
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'InstallGentoo',
        style: {
          border: 'none',
          width: '640px',
          height: '360px'
        },
        regex: /paste\.installgentoo\.com\/view\/(?:raw\/)?([a-zA-Z0-9]+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "http://paste.installgentoo.com/view/embed/" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'imgur',
        style: {
          border: 'none',
          cursor: 'pointer'
        },
        regex: /imgur\.com\/(?!a\/)([a-zA-Z0-9]{7})(?:\.(?:a?png|jpg|gif))?/i,
        embedURL: function() {
          var el, toggle;
          el = $.el('img', {
            src: "http://i.imgur.com/" + this.result[1] + ".png",
            className: 'image-embed'
          });
          if (!Embedding.style) {
            Embedding.style = $.addStyle(null);
            Embedding.services[7].resize();
            $.on(window, 'resize', Embedding.services[7].resize);
          }
          toggle = this.toggle;
          if (!Conf['Floating Embeds']) {
            $.on(el, 'click', function() {
              $.rm(el.parentNode);
              return toggle.textContent = 'Embed';
            });
          }
          return Embedding.cb.toggle(this, el);
        },
        resize: function() {
          return Embedding.style.textContent = ".media-embed .image-embed { max-height: " + (parseInt(innerHeight * .8)) + "px; max-width: " + (parseInt(innerWidth * .8)) + "px; }";
        }
      }, {
        name: 'LiveLeak',
        style: {
          border: 'none',
          width: '640px',
          height: '360px'
        },
        regex: /liveleak\.com\/view.+i=([a-z0-9]{3}_\d+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "http://www.liveleak.com/e/" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'TwitchTV',
        style: {
          border: 'none',
          width: '640px',
          height: '360px'
        },
        regex: /twitch\.tv\/(\w+)\/(?:b\/)?(\d+)/i,
        embedURL: function() {
          var archive, channel, el, _, _ref;
          _ref = this.result, _ = _ref[0], channel = _ref[1], archive = _ref[2];
          el = $.el('object', {
            data: 'http://www.twitch.tv/widgets/archive_embed_player.swf',
            innerHTML: "<param name='allowFullScreen' value='true' />\n<param name='flashvars' value='channel=" + channel + "&start_volume=25&auto_play=false&archive_id=" + archive + "' />"
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'Vine',
        style: {
          border: 'none',
          width: '500px',
          height: '500px'
        },
        regex: /vine\.co\/(v\/[a-z0-9]+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "https://vine.co/" + this.result[1] + "/card"
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'Dailymotion',
        style: {
          border: 'none',
          width: '620px',
          height: '352px'
        },
        regex: /(?:dailymotion\.com\/video|dai.ly)\/([a-z0-9]+)(?:.+start=([0-9]+))?/i,
        title: function() {
          return this.title;
        },
        titleURL: function() {
          return "https://api.dailymotion.com/video/" + this.result[1];
        },
        embedURL: function() {
          var el, name, time, _, _ref;
          _ref = this.result, _ = _ref[0], name = _ref[1], time = _ref[2];
          time = time ? time : '';
          el = $.el('iframe', {
            src: "https://www.dailymotion.com/embed/video/" + name + "?logo=0" + time
          });
          return Embedding.cb.toggle(this, el);
        }
      }, {
        name: 'StrawPoll',
        style: {
          border: 'none',
          width: '600px',
          height: '406px'
        },
        regex: /strawpoll\.me\/(?:embed_\d+\/)?(\d+)/i,
        embedURL: function() {
          var el;
          el = $.el('iframe', {
            src: "http://strawpoll.me/embed_1/" + this.result[1]
          });
          return Embedding.cb.toggle(this, el);
        }
      }
    ]
  };

  LinkTitles = {
    init: function() {
      if (g.VIEW === 'catalog' || !Conf['Link Titles']) {
        return;
      }
      this.services = Embedding.services;
      $.get('cachedTitles', {}, function(_arg) {
        var cachedTitles, key, service, _name, _ref;
        cachedTitles = _arg.cachedTitles;
        _ref = LinkTitles.services;
        for (key in _ref) {
          service = _ref[key];
          if (!service.title) {
            continue;
          }
          LinkTitles.services[key].cachedTitles = cachedTitles[_name = service.name] || (cachedTitles[_name] = {});
        }
        return LinkTitles.cachedTitles = cachedTitles;
      });
      return Post.callbacks.push({
        name: 'Link Titles',
        cb: this.node
      });
    },
    node: function() {
      var embed, _i, _len, _ref;
      if (!this.embeds) {
        return;
      }
      _ref = this.embeds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        embed = _ref[_i];
        if (embed.service.title) {
          LinkTitles.changeTitle(embed);
        }
      }
    },
    changeTitle: function(embed) {
      var anchor, name, res, result, service, title, url, _ref;
      anchor = embed.anchor, result = embed.result, service = embed.service;
      name = service.name;
      res = result[1];
      if (title = (_ref = service.cachedTitles) != null ? _ref[res] : void 0) {
        return LinkTitles.cb.changeTitle(anchor, title, name);
      }
      url = service.titleURL.call({
        anchor: anchor,
        result: result
      });
      return $.cache(url, function() {
        var response, _ref1;
        try {
          response = JSON.parse(this.response);
        } catch (_error) {
          return;
        }
        title = service.title.call(response);
        if (((_ref1 = this.status) === 200 || _ref1 === 304) && title) {
          LinkTitles.cachedTitles[name][res] = title;
          $.set('cachedTitles', LinkTitles.cachedTitles);
          return LinkTitles.cb.changeTitle(anchor, title, name);
        }
      });
    },
    cb: {
      changeTitle: function(anchor, title, name) {
        anchor.textContent = title;
        $.addClass(anchor, 'title');
        return $.addClass(anchor, name.toLowerCase());
      }
    }
  };

  Linkify = {
    init: function() {
      if (!Conf['Linkify']) {
        return;
      }
      this.catchAll = /\b((https?|ftps?|about|bitcoin|git|irc[s6]?):(\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/|magnet:\?(dn|x[lts]|as|kt|mt|tr)=)([^\s()<>]+|\([^\s()<>]+\))+(\([^\s()<>]+\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])/g;
      return Post.callbacks.push({
        name: 'Linkify',
        cb: this.node
      });
    },
    node: function() {
      var anchor, boundaries, link, links, parent, range, walker, _i, _len;
      if (this.isClone || !(links = this.info.comment.match(Linkify.catchAll))) {
        return;
      }
      walker = d.createTreeWalker(this.nodes.comment, 1 | 4, {
        acceptNode: function(node) {
          var _ref;
          if ((_ref = node.nodeName) === '#text' || _ref === 'BR') {
            return 1;
          } else {
            return 3;
          }
        }
      });
      range = d.createRange();
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        boundaries = Linkify.find(link, walker);
        if (!boundaries) {
          continue;
        }
        anchor = Linkify.createLink(link);
        if (Linkify.surround(anchor, range, boundaries)) {
          if ((parent = anchor.parentNode).href === anchor.href) {
            $.replace(parent, anchor);
          }
          Linkify.cleanLink(anchor, link);
          walker.currentNode = anchor.lastChild;
        } else {
          walker.previousNode();
        }
      }
      range.detach();
      return this.nodes.comment.normalize();
    },
    find: function(link, walker) {
      var endNode, index, node, startNode, text;
      text = '';
      while (node = walker.nextNode()) {
        if (node.nodeName === 'BR') {
          return Linkify.find(link, walker);
        }
        text += node.data;
        if (text.indexOf(link) > -1) {
          break;
        }
      }
      if (!node) {
        return;
      }
      startNode = endNode = node;
      text = node.data;
      while (!((index = text.indexOf(link)) > -1)) {
        startNode = walker.previousNode();
        text = "" + startNode.data + text;
      }
      return {
        startNode: startNode,
        endNode: endNode,
        startOffset: index,
        endOffset: endNode.length - (text.length - index - link.length)
      };
    },
    createLink: function(link) {
      if (!/^[a-z][\w-]+:/.test(link)) {
        link = "http://" + link;
      }
      return $.el('a', {
        href: link,
        className: 'linkified',
        target: '_blank',
        rel: 'noreferer'
      });
    },
    surround: function(anchor, range, boundaries) {
      var endNode, endOffset, startNode, startOffset;
      startOffset = boundaries.startOffset, endOffset = boundaries.endOffset, startNode = boundaries.startNode, endNode = boundaries.endNode;
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      try {
        range.surroundContents(anchor);
        return true;
      } catch (_error) {
        if (boundaries.areRelocated) {
          return false;
        }
        Linkify.relocate(boundaries);
        return Linkify.surround(anchor, range, boundaries);
      }
    },
    relocate: function(boundaries) {
      var parent, parentNode;
      boundaries.areRelocated = true;
      if (boundaries.startOffset === 0) {
        parentNode = boundaries.startNode;
        while (!parentNode.previousSibling) {
          parentNode = parentNode.parentNode;
        }
        parent = parentNode.parentNode;
        boundaries.startNode = parent;
        boundaries.startOffset = __slice.call(parent.childNodes).indexOf(parentNode);
      }
      if (boundaries.endOffset === boundaries.endNode.length) {
        parentNode = boundaries.endNode;
        while (!parentNode.nextSibling) {
          parentNode = parentNode.parentNode;
        }
        parent = parentNode.parentNode;
        boundaries.endNode = parent;
        return boundaries.endOffset = __slice.call(parent.childNodes).indexOf(parentNode) + 1;
      }
    },
    cleanLink: function(anchor, link) {
      var length, node, _i, _j, _len, _len1, _ref, _ref1;
      length = link.length;
      _ref = $$('wbr', anchor);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        $.rm(node);
      }
      _ref1 = $$('s, .prettyprint', anchor);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        if (length > node.textContent.length) {
          $.replace(node, __slice.call(node.childNodes));
        }
      }
    }
  };

  ArchiveLink = {
    init: function() {
      var div, entry, type, _i, _len, _ref;
      if (!Conf['Menu'] || !Conf['Archive Link']) {
        return;
      }
      div = $.el('div', {
        textContent: 'Archive'
      });
      entry = {
        el: div,
        order: 90,
        open: function(_arg) {
          var ID, board, thread;
          ID = _arg.ID, thread = _arg.thread, board = _arg.board;
          return !!Redirect.to('thread', {
            postID: ID,
            threadID: thread.ID,
            boardID: board.ID
          });
        },
        subEntries: []
      };
      _ref = [['Post', 'post'], ['Name', 'name'], ['Tripcode', 'tripcode'], ['E-mail', 'email'], ['Subject', 'subject'], ['Filename', 'filename'], ['Image MD5', 'MD5']];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        entry.subEntries.push(this.createSubEntry(type[0], type[1]));
      }
      return Menu.menu.addEntry(entry);
    },
    createSubEntry: function(text, type) {
      var el, open;
      el = $.el('a', {
        textContent: text,
        target: '_blank'
      });
      open = type === 'post' ? function(_arg) {
        var ID, board, thread;
        ID = _arg.ID, thread = _arg.thread, board = _arg.board;
        el.href = Redirect.to('thread', {
          postID: ID,
          threadID: thread.ID,
          boardID: board.ID
        });
        return true;
      } : function(post) {
        var value;
        value = Filter[type](post);
        if (!value) {
          return false;
        }
        el.href = Redirect.to('search', {
          boardID: post.board.ID,
          type: type,
          value: value
        });
        return true;
      };
      return {
        el: el,
        open: open
      };
    }
  };

  DeleteLink = {
    init: function() {
      var div, fileEl, fileEntry, postEl, postEntry;
      if (!Conf['Menu'] || !Conf['Delete Link']) {
        return;
      }
      div = $.el('div', {
        className: 'delete-link',
        textContent: 'Delete'
      });
      postEl = $.el('a', {
        className: 'delete-post',
        href: 'javascript:;'
      });
      fileEl = $.el('a', {
        className: 'delete-file',
        href: 'javascript:;'
      });
      postEntry = {
        el: postEl,
        open: function() {
          postEl.textContent = 'Post';
          $.on(postEl, 'click', DeleteLink["delete"]);
          return true;
        }
      };
      fileEntry = {
        el: fileEl,
        open: function(_arg) {
          var file;
          file = _arg.file;
          if (!file || file.isDead) {
            return false;
          }
          fileEl.textContent = 'File';
          $.on(fileEl, 'click', DeleteLink["delete"]);
          return true;
        }
      };
      return Menu.menu.addEntry({
        el: div,
        order: 40,
        open: function(post) {
          var node;
          if (post.isDead) {
            return false;
          }
          DeleteLink.post = post;
          node = div.firstChild;
          node.textContent = 'Delete';
          DeleteLink.cooldown.start(post, node);
          return true;
        },
        subEntries: [postEntry, fileEntry]
      });
    },
    "delete": function() {
      var fileOnly, form, link, post;
      post = DeleteLink.post;
      if (DeleteLink.cooldown.counting === post) {
        return;
      }
      $.off(this, 'click', DeleteLink["delete"]);
      fileOnly = $.hasClass(this, 'delete-file');
      this.textContent = "Deleting " + (fileOnly ? 'file' : 'post') + "...";
      form = {
        mode: 'usrdel',
        onlyimgdel: fileOnly,
        pwd: QR.persona.getPassword()
      };
      form[post.ID] = 'delete';
      link = this;
      return $.ajax($.id('delform').action.replace("/" + g.BOARD + "/", "/" + post.board + "/"), {
        responseType: 'document',
        withCredentials: true,
        onload: function() {
          return DeleteLink.load(link, post, fileOnly, this.response);
        },
        onerror: function() {
          return DeleteLink.error(link);
        }
      }, {
        form: $.formData(form)
      });
    },
    load: function(link, post, fileOnly, resDoc) {
      var msg, s;
      if (resDoc.title === '4chan - Banned') {
        s = 'Banned!';
      } else if (msg = resDoc.getElementById('errmsg')) {
        s = msg.textContent;
        $.on(link, 'click', DeleteLink["delete"]);
      } else {
        if (resDoc.title === 'Updating index...') {
          (post.origin || post).kill(fileOnly);
        }
        s = 'Deleted';
      }
      return link.textContent = s;
    },
    error: function(link) {
      link.textContent = 'Connection error, please retry.';
      return $.on(link, 'click', DeleteLink["delete"]);
    },
    cooldown: {
      start: function(post, node) {
        var length, seconds, _ref;
        if (!((_ref = QR.db) != null ? _ref.get({
          boardID: post.board.ID,
          threadID: post.thread.ID,
          postID: post.ID
        }) : void 0)) {
          delete DeleteLink.cooldown.counting;
          return;
        }
        DeleteLink.cooldown.counting = post;
        length = 60;
        seconds = Math.ceil((length * $.SECOND - (Date.now() - post.info.date)) / $.SECOND);
        return DeleteLink.cooldown.count(post, seconds, length, node);
      },
      count: function(post, seconds, length, node) {
        if (DeleteLink.cooldown.counting !== post) {
          return;
        }
        if (!((0 <= seconds && seconds <= length))) {
          if (DeleteLink.cooldown.counting === post) {
            node.textContent = 'Delete';
            delete DeleteLink.cooldown.counting;
          }
          return;
        }
        setTimeout(DeleteLink.cooldown.count, 1000, post, seconds - 1, length, node);
        return node.textContent = "Delete (" + seconds + ")";
      }
    }
  };

  DownloadLink = {
    init: function() {
      var a;
      if (!Conf['Menu'] || !Conf['Download Link']) {
        return;
      }
      a = $.el('a', {
        className: 'download-link',
        textContent: 'Download file'
      });
      return Menu.menu.addEntry({
        el: a,
        order: 70,
        open: function(_arg) {
          var file;
          file = _arg.file;
          if (!file) {
            return false;
          }
          a.href = file.URL;
          a.download = file.name;
          return true;
        }
      });
    }
  };

  Labels = {
    init: function() {
      if (!Conf['Menu']) {
        return;
      }
      return Menu.menu.addEntry({
        el: $.el('div', {
          textContent: 'Labels'
        }),
        order: 60,
        open: function(post, addSubEntry) {
          var label, labels, _i, _len;
          labels = (post.origin || post).labels;
          if (!labels.length) {
            return false;
          }
          this.subEntries.length = 0;
          for (_i = 0, _len = labels.length; _i < _len; _i++) {
            label = labels[_i];
            addSubEntry({
              el: $.el('div', {
                textContent: label
              })
            });
          }
          return true;
        },
        subEntries: []
      });
    }
  };

  Menu = {
    init: function() {
      var a;
      if (!Conf['Menu']) {
        return;
      }
      a = $.el('a', {
        className: 'menu-button',
        innerHTML: '<i class="fa fa-bars"></i>',
        href: 'javascript:;'
      });
      this.frag = $.nodes([$.tn(' '), a]);
      this.menu = new UI.Menu();
      Post.callbacks.push({
        name: 'Menu',
        cb: this.node
      });
      return CatalogThread.callbacks.push({
        name: 'Menu',
        cb: this.catalogNode
      });
    },
    node: function() {
      if (this.isClone) {
        $.on($('.menu-button', this.nodes.info), 'click', Menu.toggle);
        return;
      }
      return $.add(this.nodes.info, Menu.makeButton());
    },
    catalogNode: function() {
      return $.add(this.nodes.thumb, Menu.makeButton());
    },
    makeButton: function() {
      var clone;
      clone = Menu.frag.cloneNode(true);
      $.on(clone.lastElementChild, 'click', Menu.toggle);
      return clone;
    },
    toggle: function(e) {
      var fullID;
      fullID = $.x('ancestor::*[@data-full-i-d][1]', this).dataset.fullID;
      return Menu.menu.toggle(e, this, g.posts[fullID]);
    }
  };

  ReportLink = {
    init: function() {
      var a;
      if (!Conf['Menu'] || !Conf['Report Link']) {
        return;
      }
      this.dialog = UI.dialog('report', 'top: 50px; right: 0px;', "<div><div class=\"move\"></div><a href=\"javascript:;\" class=\"jump\" title=\"Jump to post\">→</a><a href=\"javascript:;\" class=\"close\" title=\"Close\">×</a></div><div id=\"report-embed\"><div></div></div>");
      this.reportEmbed = $('#report-embed', this.dialog);
      $.on(d, '4chanXInitFinished', this.ready);
      a = $.el('a', {
        className: 'report-link',
        href: 'javascript:;',
        textContent: 'Report this post'
      });
      $.on(a, 'click', ReportLink.report);
      return Menu.menu.addEntry({
        el: a,
        order: 10,
        open: function(post) {
          ReportLink.post = post;
          return !post.isDead;
        }
      });
    },
    ready: function() {
      $.off(d, '4chanXInitFinished', ReportLink.ready);
      ReportLink.toggle();
      $.on(window, 'message', ReportLink.toggle);
      $.on($('.close', ReportLink.dialog), 'click', ReportLink.toggle);
      $.on($('.move', ReportLink.dialog), 'mousedown', ReportLink.drag);
      $.on($('.jump', ReportLink.dialog), 'click', function() {
        return Header.scrollTo(ReportLink.post.nodes.root);
      });
      return $.add(d.body, ReportLink.dialog);
    },
    report: function() {
      var el, post, url;
      post = ReportLink.post;
      url = "//sys.4chan.org/" + post.board + "/imgboard.php?mode=report&no=" + post;
      el = $.el('iframe', {
        src: url
      });
      $.extend(el.style, {
        width: '610px',
        height: '117px',
        border: 'none'
      });
      $('.move', ReportLink.dialog).textContent = "Report Post No." + post.ID;
      return ReportLink.toggle(false, el);
    },
    toggle: function(e, el) {
      var div;
      if (!(div = ReportLink.reportEmbed.firstChild)) {
        return;
      }
      if (e && !e.target.className === 'close' && !/^done-report/.test(e.data)) {
        return;
      }
      if (el) {
        ReportLink.lastEmbed = el;
        $.replace(div, el);
        $.rmClass(ReportLink.dialog, 'empty');
        return;
      }
      delete ReportLink.lastEmbed;
      $.addClass(ReportLink.dialog, 'empty');
      return $.replace(div, $.el('div'));
    },
    drag: function(e) {
      var style;
      style = ReportLink.reportEmbed.style;
      if (ReportLink.drag.mouseup) {
        $.off(d, 'mouseup', ReportLink.drag);
        ReportLink.drag.mouseup = false;
        style.visibility = '';
        return;
      }
      $.on(d, 'mouseup', ReportLink.drag);
      ReportLink.drag.mouseup = true;
      return style.visibility = 'hidden';
    }
  };

  Favicon = {
    init: function() {
      return $.ready(function() {
        var href;
        Favicon.el = $('link[rel="shortcut icon"]', d.head);
        Favicon.el.type = 'image/x-icon';
        href = Favicon.el.href;
        Favicon.SFW = /ws\.ico$/.test(href);
        Favicon["default"] = href;
        return Favicon["switch"]();
      });
    },
    "switch": function() {
      switch (Conf['favicon']) {
        case 'ferongr':
          Favicon.unreadDead = 'data:image/gif;base64,R0lGODlhEAAQAPIGAOgLAnMFAL8AAOkMA/+AgP+rqwAAAAAAACH5BAUKAAYALAAAAAAQABAAQANKaLrcDYDBF8YgAQZiswJVp1mDZ4CB+aUmmkYnq4IFphGFGoMwr0MwySSGs62KGZBAIAJZli2gcLhA9V6STTNkjAkCX803LDmVgwkAOw==';
          Favicon.unreadDeadY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxUlEQVR42q1TOwrCQBB9s0FRtJI0WoqFtSLYegoP4gVSeJsUHsHSI3iFeIqRXXgwrhlXwYHHhLwPTB7B36abBCV+0pA4DUBQUNZYQptGtW3jtoKyxgoe0yrBCoyZfL/5ioQ3URZOXW9I341l3oo+NXEZiW4CEuIzvPECopED4OaZ3RNmeAm4u+a8Jr5f17VyVoL8fr8qcltzwlyyj2iqcgPOQ9ExkHAITgD75bYBe0A5S4H/P9htuWMF3QXoQpwaKeT+lnsC6JE5I6aq6fEAAAAASUVORK5CYII=';
          Favicon.unreadSFW = 'data:image/gif;base64,R0lGODlhEAAQAPIGAADX8QBwfgC2zADY8nnl8qLp8gAAAAAAACH5BAUKAAYALAAAAAAQABAAQANKaLrcDYDBF8YgAQZiswJVp1mDZ4CB+aUmmkYnq4IFphGFGoMwr0MwySSGs62KGZBAIAJZli2gcLhA9V6STTNkjAkCX803LDmVgwkAOw==';
          Favicon.unreadSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxElEQVQ4y2NgoBq4/vE/HJOsBiRQUIfA2AzBqQYqUfn00/9FLz+BaQxDCKqBmX7jExijKEDSDJPHrnnbGQhGV4RmOFwdVkNwhQMheYwQxhaIi7b9Z9A3gWAQm2BUoQOgRhgA8o7j1ozLC4LCyAZcx6kZI5qg4kLKqggDFFWxJySsUQVzlb4pwgAJaTRvokcVNgOqOv8zcHBCsL07DgNg8YsczzA5MxtUL+DMD8g0slxI/H8GQ/P/DJKyeKIRpglXZsIiBwBhP5O+VbI/JgAAAABJRU5ErkJggg==';
          Favicon.unreadNSFW = 'data:image/gif;base64,R0lGODlhEAAQAPIGAFT+ACh5AEncAFX/Acz/su7/5gAAAAAAACH5BAUKAAYALAAAAAAQABAAQANKaLrcDYDBF8YgAQZiswJVp1mDZ4CB+aUmmkYnq4IFphGFGoMwr0MwySSGs62KGZBAIAJZli2gcLhA9V6STTNkjAkCX803LDmVgwkAOw==';
          Favicon.unreadNSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAx0lEQVQ4y2NgoBYI+cfwH4ZJVgMS0KhEYGyG4FQDkzjzf9P/d/+fgWl0QwiqgSkI/c8IxsgKkDXD5LFq9rwDweiK0A2HqcNqCK5wICSPEcLYAtH+AMN/IXMIBrEJRie6OEgjDAC5x3FqxuUFNiEUA67j1IweTTBxBQ1puAG86jgSEraogskJWSBcwCGF5k30qMJmgMFEhv/MXBAs5oLDAFj8IsczTE7UEeECbhU8+QGZRpaTi2b4L2zF8J9TGk80wjThykzY5AAW/2O1C2mIbgAAAABJRU5ErkJggg==';
          break;
        case 'xat-':
          Favicon.unreadDead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxUlEQVR42s1SQQrCMBDsQ8WDIEV6LTT2A4og2Hi0veo7fIAH04e06L1jphIJRtoVLw4MmWZnh2aT6K8Ax82uyFOV6SSJK5Kae74naIZHfhfx5HxaTC8kdeCRhNzms8ayFTaHJuTLzvKpJSE+sVoDhxIoK2qv5vgGDutoz8vfhlJd33w1gDGg5h5r9NArCzA1UNevgPtQQJplmtMeOwI99AYBW73PI8EQqXsvIbjGduAaxwPcQ/oqwF/dUw5r5GfArcLa73gAGxUeHPIycrIAAAAASUVORK5CYII=';
          Favicon.unreadDeadY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA80lEQVQ4y2NgGEzgPwx3TZhYVVJRPik7O30uCIPYIDFkNRia/yNhEH9ieszB5ZlxZ0EYxMamhqAhn1KT3gPxB5I1wxT9r6r8B8T/ccnjDAOwhvaO//9nz/n/f85cMBtdHiMEQYG1DOhfkLP/V1T8A2u+eOn//0uXwAYdiIr6ZyQi8ltOWPCLm5vzVuIMuHT5///Ll8EGWEhJ/YcBfn7+lxgGlJSXT4KFNi4vwAA3N/c7DAN6J02uYsATiBqoBrzCmpCwROMHWDRaIBmANRCxGQBLSOCEBcRcUIzXAGQalpRBbB8iXMCAJPEfh9wRKG1HtRwIAJCmKOzjRex1AAAAAElFTkSuQmCC';
          Favicon.unreadSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzUlEQVQ4y2NgGEzgPwxP7OuqqigtmZSZnj0XhEFskBiyGgzNetMPwzGIH5M/8WBczfKzIAxiY1ND0JCkDZ/eA/EHkjXDFFUe+f8PiP/jkscZBiDcfvr//9lX/v+fA8QgNro8RgiCAiuuetlZkLMrgDaDNF988///pdcQg0BiIDmQGpBaogy4BDTg8htkAz7jNqAcGFWw0MbnBZAakFoMAyZP6K1CDixcgQhiQ9UyEBONH4iNRqwGwBISSQYg07CkjE0OX35gwKEAnxz5AADUHTv3RAHZ7QAAAABJRU5ErkJggg==';
          Favicon.unreadSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/klEQVQ4y2NgGEzgPwxP7OuqqigtmZSZnj0XhEFskBiyGgzNetMPwzGIH5M/8WBczfKzIAxiY1ND0JCkDZ/eA/EHkjXDFFUe+f8PiP/jkscZBiDcfvr//9lX/v+fA8QgNro8RgiCAiuuetlZkLMrgDaDNF988///pdcQg6KmHPgnomL0W1BM7ours9tWogy4BDTg8huIAVLaFv9hgJ+f/yWGAeXAqIKFNi4vwAA3N/c7DAMmT+itQg4s9EBkF5dDNuAV1oSEJRo/wKKRS1ELbgDWQMRmACwhgdhSoXn/GVnZwRivAcg0LCmD2Ly6VgRdwIAk8R+H3BEobUe1HAgA7g5BI+Q2tn8AAAAASUVORK5CYII=';
          Favicon.unreadNSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAzklEQVQ4y2NgGEzgPwxP7JpYVVZSMSk9O2suCIPYIDFkNRia084YwzGIHzMx/mDc8vizIAxiY1ND0JCST0nvgfgDyZphinr+V/4D4v+45HGGAQjP+t/+f/X/2UA8B8xGl8cIQVBgxS2LPwtyds//in8gzTf/XwTiS2CDQGIgOZAakFqiDLgF1Hzr/2WEAZ/xGFBWUj4JFtr4vABSA1KLYcDk3slVyIGFKxBBbKhaBmKi8QOx0YjVAFhCIskAZBqWlLHJ4csPDDgU4JMjHwAAAfUvfvahyqUAAAAASUVORK5CYII=';
          Favicon.unreadNSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/klEQVQ4y2NgGEzgPwxP7JpYVVZSMSk9O2suCIPYIDFkNRia084YwzGIHzMx/mDc8vizIAxiY1ND0JCST0nvgfgDyZphinr+V/4D4v+45HGGAQjP+t/+f/X/2UA8B8xGl8cIQVBgxS2LPwtyds//in8gzTf/XwTiS2CDMg9E/ZMwEvktKCf4xdnNdStRBtwCar71/zLYADkLqf8wwM/P/xLDgLKS8kmw0MblBRjg5uZ+h2HA5N7JVciBhR6IAgocyAa8wpqQsETjB1g0iulwww3AGojYDIAlJBDbqkT2PwsHExjjNQCZhiVlEFvOhp+gCxiQJP7jkDsCpe2olgMB9UE2wvseYUsAAAAASUVORK5CYII=';
          break;
        case 'Mayhem':
          Favicon.unreadDead = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABFklEQVR4AZ2R4WqEMBCEFy1yiJQQ14gcIhIuFBFR+qPQ93+v66QMksrlTwMfkZ2ZZbMKTgVqYIDl3YAbeCM31lJP/Zul4MAEPJjBQGNDLGsz8PQ6aqLAP5PTdd1WlmU09mSKtdTDRgrkzspJPKq6RxMahfj9yhOzQEZwZAwfzrk1ox3MXibIN8hO4MAjeV72CemJGWblnRsOYOdoGw0jebB20BPAwKzUQPlrFhrXFw1Wagu9yuzZwINzVAZCURRL+gRr7Wd8Vtqg4Th/lsUmewyk9WQ/A7NiwJz5VV/GmO+MNjMrFvh/NPDMigHTaeJN09a27ZHRJmalBg54CgfvAGYSLpoHjlmpuAwFdzDy7oGS/qIpM9UPFGg1b1kUlssAAAAASUVORK5CYII=';
          Favicon.unreadDeadY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABR0lEQVR4AYWSQWq0QBCFCw0SRIK0PQ4hiIhEZBhEySLyewUPEMgqR/JIXiDhzz7kKKYePIZajEzDRxfV9dWU3SO6IiVWUsVxT5R75Y4gTmwNnUh4kCulUiuV8sjChDjmKtaUcHgmHsnNrMPh0IVhiMIjKZGzNXDoyhMzF7C89z2KtFGD+FoNXEUKZdgpaPM8P++cDXTtBDca7EyQK8+bXTufYBccuvLAG26UnqN1LCgI4g/lm7zTgSux4vk0J8rnKw3+m1//pBPbBrVyGZVNmiAITviEtm3t+D+2QcJx7GUxlN4594K4ZY75Xzh0JVWqnad6TdP0H+LRNBjHcYNDV5xS32qwaC4my7Lwn6guu5QoomgbdFmWDYhnM8E8zxscuhLzPWtKA/dGqUizrityX9M0YX+DQ1ciXobnP6vgfmTOM7Znnk70B58pPaEvx+epAAAAAElFTkSuQmCC';
          Favicon.unreadSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/ElEQVR4AZ3RUWqEMBSF4ftQZAhSREQJIiIXpQwi+tSldkFdWPsLhyEE0ocKH2Fyzg1mNJ4KAQ1arTUeeJMH6qwTUJmCHjMcC6KKtbSIylzdXpl18J/k4fdTpUFmPLOOa9bGe+P4+n5RYYfLXuiMsAlXofBxK2QXpvwN/jqg+AY91vR+pStk+apZe0fEhhMXDhUmWXEoO9WNmrWAzvRPq7jnB2jvUGfWTEgPcJzZFTbZk/0Tnh5QI+af6lVGvq/Do2atwVL4VJ+3QrZo1lr4Pw5wzVqDWaV7SUvHrZDNmrWAHq7g0rphkS3LXDMBVqFGhxGT1gGdDFnWaab6BRmXRvbxDmYiAAAAAElFTkSuQmCC';
          Favicon.unreadSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABQElEQVR4AY2SQUrEQBBFS9CMNFEkhAQdYmiCIUgcZlYGc4VsBcGVF/AuWXme4F7RtXiVWF9+Y9MYtOHRTdX/NZWaEj2RYpQTJeEdK4fKPuA7DjSGXiQkU0qlUqxySmFMEsYsNSU8zEmK4OwdEbmkKCclYoGmolfWCGyenh1O0EJE2gXNWpFC2S0IGrCQ29EbdPCPAmEHmXIxByf8hDAPD71yzAnXypatbSgoAN8Pyju5h4deMUrqJk1z+0uBN+/XX+gxfoFK2QafUJO2aRq//Q+/QIx2wr+Kwq0rusrP/QKf9MTCtbQLf9U1wNvYnz3qug45S68kSvVXgbPbx3nvYPXNOI7cRPWySukK+DcGCvA+urqZ3RmGAbmSXjFK5rpwW8nhWVJP04TYa9/3uO/goVciDiPlZhW8c8ZAHuRSeqIv32FK/GYGL8YAAAAASUVORK5CYII=';
          Favicon.unreadNSFW = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA/ElEQVR4AZ3RUWqEMBSF4ftQZAihDCKKiAQJShERQx+6o662e2p/4TCEQF468BEm95yLovFr4PBEq9PjgTd5wBcZp6559AiIWDAq6KXV3aJMUMfDOsTf7Mf/XaFBAvYiE9W16b74/vl8UeBAlKOSmWAzUiXwcavMkrrFE9QXVJ+gx5q9XvUVivmqrr1jxIYLCacCs6y6S8psGNU1hw4Bu4JHuUB3pzJBHZcviLiKV9jkyO4vxHyBx1h+qlcY5b2Wj+raE0vlU33dKrNFXWsR/7EgqmtPBIXuIw+dt8osqGsOPaIGSeeGRbZiFtVxsAYeHSbMOgd0MhSzTp3mD4RaQX4aW3NMAAAAAElFTkSuQmCC';
          Favicon.unreadNSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABP0lEQVR4AYWS0UqFQBCGhziImNRBRImDmUgiIaF0kWSP4AMEXXXTE/QiPpL3UdR19Crb/PAvLEtyFj5mmfn/cdxd0RUokbJXEsZYCZUd4D72NBG8wkKmlEqtVMoFhTFJmKuoKelBTVIkjbNE5IainJTIeZqaXjkg8fp+Z7GCjiLQbWgOihTKsCFowUZtoNef4HgDf4JMuTbe8n/Br8NDr5zxhBul52i3FBQE+xflmzzTA69ESmpPmubunwZfztc/6IncBrXSe7/QkK5tW3f8H7dBjHH8q6Kwt033V6Hb4JeeWPgsq42rugfYZ92psWscRwMPvZIo9bEGD2+F2YUnBizLwpeoXnYpbQM34kAB9peP58aueZ4NPPRKxPusaRoYG6UizbquyH1O04T4RA+8EvAwUr6sgjFnDuReLaUn+ANygUa7+9SCWgAAAABJRU5ErkJggg==';
          break;
        case 'Original':
          Favicon.unreadDead = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAP8AAP///////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
          Favicon.unreadDeadY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhElEQVR42q1RwQnAMAjMu5M4guAKXa4j5dUROo5tipSDcrFChUONd0di2m/hEGVOHDyIPufgwAFASDkpoSzmBrkJ2UMyR9LsJ3rvrqo3Rt1YMIMhhNnOxLMnoMFBxHyJAr2IOBFzA8U+6pLBdmEJTA0aMVjpDd6Loks0s5HZNwYx8tfZCZ0kll7ORffZAAAAAElFTkSuQmCC';
          Favicon.unreadSFW = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAC6Xw////////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
          Favicon.unreadSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAALVBMVEUAAAAAAAAAAAAAAAABBQcHFx4KISoNLToaVW4oKCgul8M4ODg7OzvBwcH///8uS/CdAAAAA3RSTlMAx9dmesIgAAAAV0lEQVR42m2NWw6AIBAD1eILZO5/XI0UAgm7H9tOsu0yGWAQSOoFijHOxOANGqm/LczpOaXs4gISrPZ+gc2+hO5w2xdwgOjBFUIF+sEJrhUl9JFr+badFwR+BfqlmGUJAAAAAElFTkSuQmCC';
          Favicon.unreadNSFW = 'data:image/gif;base64,R0lGODlhEAAQAKECAAAAAGbMM////////yH5BAEKAAMALAAAAAAQABAAAAI/nI95wsqygIRxDgGCBhTrwF3Zxowg5H1cSopS6FrGQ82PU1951ckRmYKJVCXizLRC9kAnT0aIiR6lCFT1cigAADs=';
          Favicon.unreadNSFWY = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAALVBMVEUAAAAAAAAAAAAAAAAECAIQIAgWLAsePA8oKCg4ODg6dB07OztmzDPBwcH///+rsf3XAAAAA3RSTlMAx9dmesIgAAAAV0lEQVR42m2NWw6AIBAD1eIDhbn/cTVSCCTsfmw7ybbLZIBBIKkXKKU0E4M3aKT+tjCn5xiziwuIsNr7BTb7ErrDZV/AAaIHdwgV6AcnuFaU0Eeu5dt2XiUyBjCQ2bIrAAAAAElFTkSuQmCC';
      }
      if (Favicon.SFW) {
        Favicon.unread = Favicon.unreadSFW;
        return Favicon.unreadY = Favicon.unreadSFWY;
      } else {
        Favicon.unread = Favicon.unreadNSFW;
        return Favicon.unreadY = Favicon.unreadNSFWY;
      }
    },
    dead: 'data:image/gif;base64,R0lGODlhEAAQAPECAAAAAP8AAP///wAAACH5BAUKAAIALAAAAAAQABAAAAIvlI+pq+D9DAgUoFkPDlbs7lFZKIJOJJ3MyraoB14jFpOcVMpzrnF3OKlZYsMWowAAOw==',
    logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACAAgMAAAC+UIlYAAAACVBMVEUAAGcAAABmzDNZt9VtAAAAAXRSTlMAQObYZgAAAFxJREFUeAHtlsEJgEAQxGzSJq1S2Dw0WkJ2YMHJ5Onjjm82m3PyJx2Bck0AJiXBwC0iaAa6VQRi/KisFYFYYSwKKJ6Lwv4Pnq20BGbw+7so7PsBxLm1BCDnlhM2NyoN/C7tKfq7AAAAAElFTkSuQmCC'
  };

  ThreadExcerpt = {
    init: function() {
      if (g.VIEW !== 'thread' || !Conf['Thread Excerpt']) {
        return;
      }
      return Thread.callbacks.push({
        name: 'Thread Excerpt',
        cb: this.node
      });
    },
    node: function() {
      return d.title = Get.threadExcerpt(this);
    }
  };

  ThreadStats = {
    init: function() {
      if (g.VIEW !== 'thread' || !Conf['Thread Stats']) {
        return;
      }
      this.dialog = UI.dialog('thread-stats', 'bottom: 0; left: 0;', "<div class=\"move\" title=\"Post count / File count / Page count\"><span id=\"post-count\">...</span> / <span id=\"file-count\">...</span> / <span id=\"page-count\">...</span></div>");
      this.postCountEl = $('#post-count', this.dialog);
      this.fileCountEl = $('#file-count', this.dialog);
      this.pageCountEl = $('#page-count', this.dialog);
      return Thread.callbacks.push({
        name: 'Thread Stats',
        cb: this.node
      });
    },
    node: function() {
      var ID, fileCount, post, postCount, _ref;
      postCount = 0;
      fileCount = 0;
      _ref = this.posts;
      for (ID in _ref) {
        post = _ref[ID];
        postCount++;
        if (post.file) {
          fileCount++;
        }
      }
      ThreadStats.thread = this;
      ThreadStats.fetchPage();
      ThreadStats.update(postCount, fileCount);
      $.on(d, 'ThreadUpdate', ThreadStats.onUpdate);
      return $.add(d.body, ThreadStats.dialog);
    },
    onUpdate: function(e) {
      var fileCount, postCount, _ref;
      if (e.detail[404]) {
        return;
      }
      _ref = e.detail, postCount = _ref.postCount, fileCount = _ref.fileCount;
      return ThreadStats.update(postCount, fileCount);
    },
    update: function(postCount, fileCount) {
      var fileCountEl, postCountEl, thread;
      thread = ThreadStats.thread, postCountEl = ThreadStats.postCountEl, fileCountEl = ThreadStats.fileCountEl;
      postCountEl.textContent = postCount;
      fileCountEl.textContent = fileCount;
      (thread.postLimit && !thread.isSticky ? $.addClass : $.rmClass)(postCountEl, 'warning');
      return (thread.fileLimit && !thread.isSticky ? $.addClass : $.rmClass)(fileCountEl, 'warning');
    },
    fetchPage: function() {
      if (ThreadStats.thread.isDead) {
        ThreadStats.pageCountEl.textContent = 'Dead';
        $.addClass(ThreadStats.pageCountEl, 'warning');
        return;
      }
      setTimeout(ThreadStats.fetchPage, 2 * $.MINUTE);
      return $.ajax("//a.4cdn.org/" + ThreadStats.thread.board + "/threads.json", {
        onload: ThreadStats.onThreadsLoad
      }, {
        whenModified: true
      });
    },
    onThreadsLoad: function() {
      var page, thread, _i, _j, _len, _len1, _ref, _ref1;
      if (this.status !== 200) {
        return;
      }
      _ref = this.response;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        page = _ref[_i];
        _ref1 = page.threads;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          thread = _ref1[_j];
          if (thread.no === ThreadStats.thread.ID) {
            ThreadStats.pageCountEl.textContent = page.page;
            (page.page === this.response.length ? $.addClass : $.rmClass)(ThreadStats.pageCountEl, 'warning');
            return;
          }
        }
      }
    }
  };

  ThreadUpdater = {
    init: function() {
      var checked, conf, html, name, _ref;
      if (g.VIEW !== 'thread' || !Conf['Thread Updater']) {
        return;
      }
      this.button = $.el('a', {
        className: 'thread-refresh-shortcut fa fa-refresh',
        title: 'Refresh Thread',
        href: 'javascript:;'
      });
      $.on(this.button, 'click', this.update);
      Header.addShortcut(this.button, 1);
      html = '';
      _ref = Config.updater.checkbox;
      for (name in _ref) {
        conf = _ref[name];
        checked = Conf[name] ? 'checked' : '';
        html += "<div><label title='" + conf[1] + "'><input name='" + name + "' type=checkbox " + checked + "> " + name + "</label></div>";
      }
      html = "<div class=\"move\"><span id=\"update-status\"></span>&nbsp;<span id=\"update-timer\"></span></div>" + html + "<div><label title=\"Controls whether *this* thread automatically updates or not\"><input type=\"checkbox\" name=\"Auto Update This\" " + (Conf['Auto Update'] ? "checked" : "") + "> Auto Update This</label></div><div><label><input type=\"number\" name=\"Interval\" class=\"field\" min=\"1\" value=\"" + Conf['Interval'] + "\"> Refresh rate (s)</label></div><div><input value=\"Refresh thread\" type=\"button\" name=\"Update\"></div>";
      this.dialog = UI.dialog('updater', 'bottom: 0; right: 0;', html);
      this.timer = $('#update-timer', this.dialog);
      this.status = $('#update-status', this.dialog);
      this.isUpdating = Conf['Auto Update'];
      return Thread.callbacks.push({
        name: 'Thread Updater',
        cb: this.node
      });
    },
    node: function() {
      var input, _i, _len, _ref;
      ThreadUpdater.thread = this;
      ThreadUpdater.root = this.OP.nodes.root.parentNode;
      ThreadUpdater.lastPost = +Object.keys(this.posts).sort().slice(-1)[0];
      _ref = $$('input', ThreadUpdater.dialog);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        input = _ref[_i];
        if (input.type === 'checkbox') {
          $.on(input, 'change', $.cb.checked);
        }
        switch (input.name) {
          case 'Scroll BG':
            $.on(input, 'change', ThreadUpdater.cb.scrollBG);
            ThreadUpdater.cb.scrollBG();
            break;
          case 'Auto Update This':
            $.off(input, 'change', $.cb.checked);
            $.on(input, 'change', ThreadUpdater.cb.autoUpdate);
            break;
          case 'Interval':
            if (Conf['Sync Thread Updater']) {
              ThreadUpdater.cb.sync.input = input;
              $.sync('Interval', ThreadUpdater.cb.sync);
            }
            $.on(input, 'change', ThreadUpdater.cb.interval);
            ThreadUpdater.cb.interval.call(input);
            break;
          case 'Update':
            $.on(input, 'click', ThreadUpdater.update);
        }
      }
      $.on(window, 'online offline', ThreadUpdater.cb.online);
      $.on(d, 'QRPostSuccessful', ThreadUpdater.cb.post);
      $.on(d, 'visibilitychange', ThreadUpdater.cb.visibility);
      ThreadUpdater.cb.online();
      return $.add(d.body, ThreadUpdater.dialog);
    },
    beep: 'data:audio/wav;base64,UklGRjQDAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAc21wbDwAAABBAAADAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkYXRhzAIAAGMms8em0tleMV4zIpLVo8nhfSlcPR102Ki+5JspVEkdVtKzs+K1NEhUIT7DwKrcy0g6WygsrM2k1NpiLl0zIY/WpMrjgCdbPhxw2Kq+5Z4qUkkdU9K1s+K5NkVTITzBwqnczko3WikrqM+l1NxlLF0zIIvXpsnjgydZPhxs2ay95aIrUEkdUdC3suK8N0NUIjq+xKrcz002WioppdGm091pK1w0IIjYp8jkhydXPxxq2K295aUrTkoeTs65suK+OUFUIzi7xqrb0VA0WSoootKm0t5tKlo1H4TYqMfkiydWQBxm16+85actTEseS8y7seHAPD9TIza5yKra01QyWSson9On0d5wKVk2H4DYqcfkjidUQB1j1rG75KsvSkseScu8seDCPz1TJDW2yara1FYxWSwnm9Sn0N9zKVg2H33ZqsXkkihSQR1g1bK65K0wSEsfR8i+seDEQTxUJTOzy6rY1VowWC0mmNWoz993KVc3H3rYq8TklSlRQh1d1LS647AyR0wgRMbAsN/GRDpTJTKwzKrX1l4vVy4lldWpzt97KVY4IXbUr8LZljVPRCxhw7W3z6ZISkw1VK+4sMWvXEhSPk6buay9sm5JVkZNiLWqtrJ+TldNTnquqbCwilZXU1BwpKirrpNgWFhTaZmnpquZbFlbVmWOpaOonHZcXlljhaGhpZ1+YWBdYn2cn6GdhmdhYGN3lp2enIttY2Jjco+bnJuOdGZlZXCImJqakHpoZ2Zug5WYmZJ/bGlobX6RlpeSg3BqaW16jZSVkoZ0bGtteImSk5KIeG5tbnaFkJKRinxxbm91gY2QkIt/c3BwdH6Kj4+LgnZxcXR8iI2OjIR5c3J0e4WLjYuFe3VzdHmCioyLhn52dHR5gIiKioeAeHV1eH+GiYqHgXp2dnh9hIiJh4J8eHd4fIKHiIeDfXl4eHyBhoeHhH96eHmA',
    cb: {
      online: function() {
        if (navigator.onLine) {
          ThreadUpdater.outdateCount = 0;
          ThreadUpdater.setInterval();
          ThreadUpdater.set('status', null, null);
        } else {
          ThreadUpdater.set('timer', null);
          ThreadUpdater.set('status', 'Offline', 'warning');
        }
        return ThreadUpdater.count(true);
      },
      post: function(e) {
        if (!(ThreadUpdater.isUpdating && e.detail.threadID === ThreadUpdater.thread.ID)) {
          return;
        }
        ThreadUpdater.outdateCount = 0;
        if (ThreadUpdater.seconds > 2) {
          return setTimeout(ThreadUpdater.update, 1000);
        }
      },
      visibility: function() {
        if (d.hidden) {
          return;
        }
        ThreadUpdater.outdateCount = 0;
        return ThreadUpdater.seconds = Math.min(ThreadUpdater.seconds, ThreadUpdater.interval);
      },
      scrollBG: function() {
        return ThreadUpdater.scrollBG = Conf['Scroll BG'] ? function() {
          return true;
        } : function() {
          return !d.hidden;
        };
      },
      autoUpdate: function(e) {
        return ThreadUpdater.count(ThreadUpdater.isUpdating = this.checked);
      },
      sync: function(e) {
        var input;
        input = ThreadUpdater.cb.sync.input;
        input.value = e;
        return ThreadUpdater.cb.interval.call(input);
      },
      interval: function(e) {
        var val;
        val = !(val = parseInt(this.value)) ? Config.updater.Interval : val < 1 ? 1 : val;
        ThreadUpdater.interval = this.value = val;
        if (e) {
          return $.cb.value.call(this);
        }
      },
      load: function(e) {
        var klass, req, text, _ref;
        $.rmClass(ThreadUpdater.button, 'fa-spin');
        req = ThreadUpdater.req;
        delete ThreadUpdater.req;
        if (e.type !== 'loadend') {
          req.onloadend = null;
          if (e.type === 'timeout') {
            ThreadUpdater.set('status', 'Retrying', null);
            ThreadUpdater.update();
          }
          return;
        }
        switch (req.status) {
          case 200:
            g.DEAD = false;
            ThreadUpdater.parse(req.response.posts);
            return ThreadUpdater.setInterval();
          case 404:
            g.DEAD = true;
            ThreadUpdater.set('timer', null);
            ThreadUpdater.set('status', '404', 'warning');
            ThreadUpdater.thread.kill();
            return $.event('ThreadUpdate', {
              404: true,
              threadID: ThreadUpdater.thread.fullID
            });
          default:
            ThreadUpdater.outdateCount++;
            ThreadUpdater.setInterval();
            _ref = req.status === 304 ? [null, null] : ["" + req.statusText + " (" + req.status + ")", 'warning'], text = _ref[0], klass = _ref[1];
            return ThreadUpdater.set('status', text, klass);
        }
      }
    },
    setInterval: function() {
      ThreadUpdater.seconds = ThreadUpdater.interval;
      ThreadUpdater.set('timer', ThreadUpdater.seconds);
      return ThreadUpdater.count(true);
    },
    set: function(name, text, klass) {
      var el, node;
      el = ThreadUpdater[name];
      if (node = el.firstChild) {
        node.data = text;
      } else {
        el.textContent = text;
      }
      if (klass !== void 0) {
        return el.className = klass;
      }
    },
    count: function(start) {
      clearTimeout(ThreadUpdater.timeoutID);
      if (start && ThreadUpdater.isUpdating && navigator.onLine) {
        return ThreadUpdater.timeout();
      }
    },
    timeout: function() {
      var sec;
      ThreadUpdater.timeoutID = setTimeout(ThreadUpdater.timeout, 1000);
      sec = ThreadUpdater.seconds--;
      ThreadUpdater.set('timer', sec);
      if (sec <= 0) {
        return ThreadUpdater.update();
      }
    },
    update: function() {
      var url, _ref;
      if (!navigator.onLine) {
        return;
      }
      $.addClass(ThreadUpdater.button, 'fa-spin');
      ThreadUpdater.count();
      ThreadUpdater.set('timer', '...');
      if ((_ref = ThreadUpdater.req) != null) {
        _ref.abort();
      }
      url = "//a.4cdn.org/" + ThreadUpdater.thread.board + "/thread/" + ThreadUpdater.thread + ".json";
      return ThreadUpdater.req = $.ajax(url, {
        onabort: ThreadUpdater.cb.load,
        onloadend: ThreadUpdater.cb.load,
        ontimeout: ThreadUpdater.cb.load,
        timeout: $.MINUTE
      }, {
        whenModified: true
      });
    },
    updateThreadStatus: function(type, status) {
      var change, hasChanged;
      if (!(hasChanged = ThreadUpdater.thread["is" + type] !== status)) {
        return;
      }
      ThreadUpdater.thread.setStatus(type, status);
      change = type === 'Sticky' ? status ? 'now a sticky' : 'not a sticky anymore' : status ? 'now closed' : 'not closed anymore';
      return new Notice('info', "The thread is " + change + ".", 30);
    },
    parse: function(postObjects) {
      var ID, OP, count, files, index, node, nodes, num, post, postObject, posts, scroll, sendEvent, _i, _len, _ref;
      OP = postObjects[0];
      Build.spoilerRange[ThreadUpdater.thread.board] = OP.custom_spoiler;
      ThreadUpdater.updateThreadStatus('Sticky', !!OP.sticky);
      ThreadUpdater.updateThreadStatus('Closed', !!OP.closed);
      ThreadUpdater.thread.postLimit = !!OP.bumplimit;
      ThreadUpdater.thread.fileLimit = !!OP.imagelimit;
      ThreadUpdater.thread.inedible = ThreadUpdater.interval <= Config.updater.Interval ? 2 : 0;
      nodes = [];
      posts = [];
      index = [];
      files = [];
      count = 0;
      for (_i = 0, _len = postObjects.length; _i < _len; _i++) {
        postObject = postObjects[_i];
        num = postObject.no;
        index.push(num);
        if (postObject.fsize) {
          files.push(num);
        }
        if (num <= ThreadUpdater.lastPost) {
          continue;
        }
        count++;
        node = Build.postFromObject(postObject, ThreadUpdater.thread.board.ID);
        nodes.push(node);
        post = new Post(node, ThreadUpdater.thread, ThreadUpdater.thread.board);
        post.inedible = ThreadUpdater.thread.inedible;
        posts.push(post);
      }
      _ref = ThreadUpdater.thread.posts;
      for (ID in _ref) {
        post = _ref[ID];
        if (post.inedible--) {
          delete post.isDead;
          continue;
        } else {
          delete post.inedible;
        }
        ID = +ID;
        if (post.isDead && __indexOf.call(index, ID) >= 0) {
          post.resurrect();
        } else if (__indexOf.call(index, ID) < 0) {
          post.kill();
        } else if (post.file && !post.file.isDead && __indexOf.call(files, ID) < 0) {
          post.kill(true);
        }
      }
      sendEvent = function() {
        return $.event('ThreadUpdate', {
          404: false,
          threadID: ThreadUpdater.thread.fullID,
          newPosts: posts.map(function(post) {
            return post.fullID;
          }),
          postCount: OP.replies + 1,
          fileCount: OP.images + (!!ThreadUpdater.thread.OP.file && !ThreadUpdater.thread.OP.file.isDead)
        });
      };
      if (!count) {
        ThreadUpdater.set('status', null, null);
        ThreadUpdater.outdateCount++;
        sendEvent();
        return;
      }
      ThreadUpdater.set('status', "+" + count, 'new');
      ThreadUpdater.outdateCount = 0;
      if (Conf['Beep'] && d.hidden && Unread.posts && !Unread.posts.length) {
        if (!ThreadUpdater.audio) {
          ThreadUpdater.audio = $.el('audio', {
            src: ThreadUpdater.beep
          });
        }
        ThreadUpdater.audio.play();
      }
      ThreadUpdater.lastPost = posts[count - 1].ID;
      Main.callbackNodes(Post, posts);
      scroll = Conf['Auto Scroll'] && ThreadUpdater.scrollBG() && Header.getBottomOf(ThreadUpdater.root) > -25;
      $.add(ThreadUpdater.root, nodes);
      sendEvent();
      if (scroll) {
        if (Conf['Bottom Scroll']) {
          return window.scrollTo(0, d.body.clientHeight);
        } else {
          return Header.scrollTo(nodes[0]);
        }
      }
    }
  };

  ThreadWatcher = {
    init: function() {
      var now;
      if (!Conf['Thread Watcher']) {
        return;
      }
      this.db = new DataBoard('watchedThreads', this.refresh, true);
      this.dialog = UI.dialog('thread-watcher', 'top: 50px; left: 0px;', "<div><span class=\"move\">Thread Watcher <span id=\"watcher-status\"></span></span><a class=\"menu-button\" href=\"javascript:;\"><i class=\"fa fa-bars\"></i></a></div><div id=\"watched-threads\"></div>");
      this.status = $('#watcher-status', this.dialog);
      this.list = this.dialog.lastElementChild;
      $.on(d, 'QRPostSuccessful', this.cb.post);
      $.on(d, '4chanXInitFinished', this.ready);
      switch (g.VIEW) {
        case 'index':
          $.on(d, 'IndexRefresh', this.cb.onIndexRefresh);
          break;
        case 'thread':
          $.on(d, 'ThreadUpdate', this.cb.onThreadRefresh);
      }
      now = Date.now();
      if ((this.db.data.lastChecked || 0) < now - 2 * $.HOUR) {
        this.db.data.lastChecked = now;
        ThreadWatcher.fetchAllStatus();
        this.db.save();
      }
      return Thread.callbacks.push({
        name: 'Thread Watcher',
        cb: this.node
      });
    },
    node: function() {
      var toggler;
      toggler = $.el('a', {
        className: 'watcher-toggler',
        href: 'javascript:;'
      });
      $.on(toggler, 'click', ThreadWatcher.cb.toggle);
      return $.after($('input', this.OP.nodes.post), [toggler, $.tn(' ')]);
    },
    ready: function() {
      $.off(d, '4chanXInitFinished', ThreadWatcher.ready);
      if (!Main.isThisPageLegit()) {
        return;
      }
      ThreadWatcher.refresh();
      $.add(d.body, ThreadWatcher.dialog);
      if (!Conf['Auto Watch']) {
        return;
      }
      return $.get('AutoWatch', 0, function(_arg) {
        var AutoWatch, thread;
        AutoWatch = _arg.AutoWatch;
        if (!(thread = g.BOARD.threads[AutoWatch])) {
          return;
        }
        ThreadWatcher.add(thread);
        return $["delete"]('AutoWatch');
      });
    },
    cb: {
      openAll: function() {
        var a, _i, _len, _ref;
        if ($.hasClass(this, 'disabled')) {
          return;
        }
        _ref = $$('a[title]', ThreadWatcher.list);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          $.open(a.href);
        }
        return $.event('CloseMenu');
      },
      checkThreads: function() {
        if ($.hasClass(this, 'disabled')) {
          return;
        }
        return ThreadWatcher.fetchAllStatus();
      },
      pruneDeads: function() {
        var boardID, data, threadID, _i, _len, _ref, _ref1;
        if ($.hasClass(this, 'disabled')) {
          return;
        }
        _ref = ThreadWatcher.getAll();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], boardID = _ref1.boardID, threadID = _ref1.threadID, data = _ref1.data;
          if (!data.isDead) {
            continue;
          }
          delete ThreadWatcher.db.data.boards[boardID][threadID];
          ThreadWatcher.db.deleteIfEmpty({
            boardID: boardID
          });
        }
        ThreadWatcher.db.save();
        ThreadWatcher.refresh();
        return $.event('CloseMenu');
      },
      toggle: function() {
        return ThreadWatcher.toggle(Get.threadFromNode(this));
      },
      rm: function() {
        var boardID, threadID, _ref;
        _ref = this.parentNode.dataset.fullID.split('.'), boardID = _ref[0], threadID = _ref[1];
        return ThreadWatcher.rm(boardID, +threadID);
      },
      post: function(e) {
        var boardID, postID, threadID, _ref;
        _ref = e.detail, boardID = _ref.boardID, threadID = _ref.threadID, postID = _ref.postID;
        if (postID === threadID) {
          if (Conf['Auto Watch']) {
            return $.set('AutoWatch', threadID);
          }
        } else if (Conf['Auto Watch Reply']) {
          return ThreadWatcher.add(g.threads[boardID + '.' + threadID]);
        }
      },
      onIndexRefresh: function() {
        var boardID, data, threadID, _ref;
        boardID = g.BOARD.ID;
        _ref = ThreadWatcher.db.data.boards[boardID];
        for (threadID in _ref) {
          data = _ref[threadID];
          if (!data.isDead && !(threadID in g.BOARD.threads)) {
            if (Conf['Auto Prune']) {
              ThreadWatcher.db["delete"]({
                boardID: boardID,
                threadID: threadID
              });
            } else {
              data.isDead = true;
              ThreadWatcher.db.set({
                boardID: boardID,
                threadID: threadID,
                val: data
              });
            }
          }
        }
        return ThreadWatcher.refresh();
      },
      onThreadRefresh: function(e) {
        var thread;
        thread = g.threads[e.detail.threadID];
        if (!(e.detail[404] && ThreadWatcher.db.get({
          boardID: thread.board.ID,
          threadID: thread.ID
        }))) {
          return;
        }
        return ThreadWatcher.add(thread);
      }
    },
    fetchCount: {
      fetched: 0,
      fetching: 0
    },
    fetchAllStatus: function() {
      var thread, threads, _i, _len;
      if (!(threads = ThreadWatcher.getAll()).length) {
        return;
      }
      ThreadWatcher.status.textContent = '...';
      for (_i = 0, _len = threads.length; _i < _len; _i++) {
        thread = threads[_i];
        ThreadWatcher.fetchStatus(thread);
      }
    },
    fetchStatus: function(_arg) {
      var boardID, data, fetchCount, threadID;
      boardID = _arg.boardID, threadID = _arg.threadID, data = _arg.data;
      if (data.isDead) {
        return;
      }
      fetchCount = ThreadWatcher.fetchCount;
      fetchCount.fetching++;
      return $.ajax("//a.4cdn.org/" + boardID + "/thread/" + threadID + ".json", {
        onloadend: function() {
          var status;
          fetchCount.fetched++;
          if (fetchCount.fetched === fetchCount.fetching) {
            fetchCount.fetched = 0;
            fetchCount.fetching = 0;
            status = '';
          } else {
            status = "" + (Math.round(fetchCount.fetched / fetchCount.fetching * 100)) + "%";
          }
          ThreadWatcher.status.textContent = status;
          if (this.status !== 404) {
            return;
          }
          if (Conf['Auto Prune']) {
            ThreadWatcher.db["delete"]({
              boardID: boardID,
              threadID: threadID
            });
          } else {
            data.isDead = true;
            ThreadWatcher.db.set({
              boardID: boardID,
              threadID: threadID,
              val: data
            });
          }
          return ThreadWatcher.refresh();
        }
      }, {
        type: 'head'
      });
    },
    getAll: function() {
      var all, boardID, data, threadID, threads, _ref;
      all = [];
      _ref = ThreadWatcher.db.data.boards;
      for (boardID in _ref) {
        threads = _ref[boardID];
        if (Conf['Current Board'] && boardID !== g.BOARD.ID) {
          continue;
        }
        for (threadID in threads) {
          data = threads[threadID];
          all.push({
            boardID: boardID,
            threadID: threadID,
            data: data
          });
        }
      }
      return all;
    },
    makeLine: function(boardID, threadID, data) {
      var div, fullID, href, link, x;
      x = $.el('a', {
        className: 'fa fa-times',
        href: 'javascript:;'
      });
      $.on(x, 'click', ThreadWatcher.cb.rm);
      if (data.isDead) {
        href = Redirect.to('thread', {
          boardID: boardID,
          threadID: threadID
        });
      }
      link = $.el('a', {
        href: href || ("/" + boardID + "/thread/" + threadID),
        textContent: data.excerpt,
        title: data.excerpt
      });
      div = $.el('div');
      fullID = "" + boardID + "." + threadID;
      div.dataset.fullID = fullID;
      if (g.VIEW === 'thread' && fullID === ("" + g.BOARD + "." + g.THREADID)) {
        $.addClass(div, 'current');
      }
      if (data.isDead) {
        $.addClass(div, 'dead-thread');
      }
      $.add(div, [x, $.tn(' '), link]);
      return div;
    },
    refresh: function() {
      var boardID, data, list, nodes, refresher, thread, threadID, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      nodes = [];
      _ref = ThreadWatcher.getAll();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], boardID = _ref1.boardID, threadID = _ref1.threadID, data = _ref1.data;
        nodes.push(ThreadWatcher.makeLine(boardID, threadID, data));
      }
      list = ThreadWatcher.list;
      $.rmAll(list);
      $.add(list, nodes);
      _ref2 = g.BOARD.threads;
      for (threadID in _ref2) {
        thread = _ref2[threadID];
        $.extend($('.watcher-toggler', thread.OP.nodes.post), ThreadWatcher.db.get({
          boardID: thread.board.ID,
          threadID: threadID
        }) ? {
          className: 'watcher-toggler fa fa-bookmark',
          title: 'Unwatch thread'
        } : {
          className: 'watcher-toggler fa fa-bookmark-o',
          title: 'Watch thread'
        });
      }
      _ref3 = ThreadWatcher.menu.refreshers;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        refresher = _ref3[_j];
        refresher();
      }
    },
    toggle: function(thread) {
      var boardID, threadID;
      boardID = thread.board.ID;
      threadID = thread.ID;
      if (ThreadWatcher.db.get({
        boardID: boardID,
        threadID: threadID
      })) {
        return ThreadWatcher.rm(boardID, threadID);
      } else {
        return ThreadWatcher.add(thread);
      }
    },
    add: function(thread) {
      var boardID, data, threadID;
      data = {};
      boardID = thread.board.ID;
      threadID = thread.ID;
      if (thread.isDead) {
        if (Conf['Auto Prune'] && ThreadWatcher.db.get({
          boardID: boardID,
          threadID: threadID
        })) {
          ThreadWatcher.rm(boardID, threadID);
          return;
        }
        data.isDead = true;
      }
      data.excerpt = Get.threadExcerpt(thread);
      ThreadWatcher.db.set({
        boardID: boardID,
        threadID: threadID,
        val: data
      });
      return ThreadWatcher.refresh();
    },
    rm: function(boardID, threadID) {
      ThreadWatcher.db["delete"]({
        boardID: boardID,
        threadID: threadID
      });
      return ThreadWatcher.refresh();
    },
    convert: function(oldFormat) {
      var boardID, data, newFormat, threadID, threads;
      newFormat = {};
      for (boardID in oldFormat) {
        threads = oldFormat[boardID];
        for (threadID in threads) {
          data = threads[threadID];
          (newFormat[boardID] || (newFormat[boardID] = {}))[threadID] = {
            excerpt: data.textContent
          };
        }
      }
      return newFormat;
    },
    menu: {
      refreshers: [],
      init: function() {
        var menu;
        if (!Conf['Thread Watcher']) {
          return;
        }
        menu = new UI.Menu();
        $.on($('.menu-button', ThreadWatcher.dialog), 'click', function(e) {
          return menu.toggle(e, this, ThreadWatcher);
        });
        this.addHeaderMenuEntry();
        return this.addMenuEntries(menu);
      },
      addHeaderMenuEntry: function() {
        var entryEl;
        if (g.VIEW !== 'thread') {
          return;
        }
        entryEl = $.el('a', {
          href: 'javascript:;'
        });
        Header.menu.addEntry({
          el: entryEl,
          order: 60
        });
        $.on(entryEl, 'click', function() {
          return ThreadWatcher.toggle(g.threads["" + g.BOARD + "." + g.THREADID]);
        });
        return this.refreshers.push(function() {
          var addClass, rmClass, text, _ref;
          _ref = $('.current', ThreadWatcher.list) ? ['unwatch-thread', 'watch-thread', 'Unwatch thread'] : ['watch-thread', 'unwatch-thread', 'Watch thread'], addClass = _ref[0], rmClass = _ref[1], text = _ref[2];
          $.addClass(entryEl, addClass);
          $.rmClass(entryEl, rmClass);
          return entryEl.textContent = text;
        });
      },
      addMenuEntries: function(menu) {
        var cb, conf, entries, entry, name, refresh, subEntries, _i, _len, _ref, _ref1;
        entries = [];
        entries.push({
          cb: ThreadWatcher.cb.openAll,
          entry: {
            el: $.el('a', {
              textContent: 'Open all threads'
            })
          },
          refresh: function() {
            return (ThreadWatcher.list.firstElementChild ? $.rmClass : $.addClass)(this.el, 'disabled');
          }
        });
        entries.push({
          cb: ThreadWatcher.cb.checkThreads,
          entry: {
            el: $.el('a', {
              textContent: 'Check 404\'d threads'
            })
          },
          refresh: function() {
            return ($('div:not(.dead-thread)', ThreadWatcher.list) ? $.rmClass : $.addClass)(this.el, 'disabled');
          }
        });
        entries.push({
          cb: ThreadWatcher.cb.pruneDeads,
          entry: {
            el: $.el('a', {
              textContent: 'Prune 404\'d threads'
            })
          },
          refresh: function() {
            return ($('.dead-thread', ThreadWatcher.list) ? $.rmClass : $.addClass)(this.el, 'disabled');
          }
        });
        subEntries = [];
        _ref = Config.threadWatcher;
        for (name in _ref) {
          conf = _ref[name];
          subEntries.push(this.createSubEntry(name, conf[1]));
        }
        entries.push({
          entry: {
            el: $.el('span', {
              textContent: 'Settings'
            }),
            subEntries: subEntries
          }
        });
        for (_i = 0, _len = entries.length; _i < _len; _i++) {
          _ref1 = entries[_i], entry = _ref1.entry, cb = _ref1.cb, refresh = _ref1.refresh;
          if (entry.el.nodeName === 'A') {
            entry.el.href = 'javascript:;';
          }
          if (cb) {
            $.on(entry.el, 'click', cb);
          }
          if (refresh) {
            this.refreshers.push(refresh.bind(entry));
          }
          menu.addEntry(entry);
        }
      },
      createSubEntry: function(name, desc) {
        var entry, input;
        entry = {
          type: 'thread watcher',
          el: $.el('label', {
            innerHTML: "<input type=checkbox name='" + name + "'> " + name,
            title: desc
          })
        };
        input = entry.el.firstElementChild;
        input.checked = Conf[name];
        $.on(input, 'change', $.cb.checked);
        if (name === 'Current Board') {
          $.on(input, 'change', ThreadWatcher.refresh);
        }
        return entry;
      }
    }
  };

  Unread = {
    init: function() {
      if (g.VIEW !== 'thread' || !Conf['Unread Count'] && !Conf['Unread Tab Icon'] && !Conf['Desktop Notifications']) {
        return;
      }
      this.db = new DataBoard('lastReadPosts', this.sync);
      this.hr = $.el('hr', {
        id: 'unread-line'
      });
      this.posts = [];
      this.postsQuotingYou = [];
      return Thread.callbacks.push({
        name: 'Unread',
        cb: this.node
      });
    },
    node: function() {
      Unread.thread = this;
      Unread.title = d.title;
      Unread.lastReadPost = Unread.db.get({
        boardID: this.board.ID,
        threadID: this.ID,
        defaultValue: 0
      });
      $.on(d, '4chanXInitFinished', Unread.ready);
      $.on(d, 'ThreadUpdate', Unread.onUpdate);
      $.on(d, 'scroll visibilitychange', Unread.read);
      if (Conf['Unread Line']) {
        return $.on(d, 'visibilitychange', Unread.setLine);
      }
    },
    ready: function() {
      var ID, post, posts, _ref;
      $.off(d, '4chanXInitFinished', Unread.ready);
      posts = [];
      _ref = Unread.thread.posts;
      for (ID in _ref) {
        post = _ref[ID];
        if (post.isReply) {
          posts.push(post);
        }
      }
      Unread.addPosts(posts);
      return Unread.scroll();
    },
    scroll: function() {
      var down, hash, post, posts, root;
      if (!Conf['Scroll to Last Read Post']) {
        return;
      }
      if ((hash = location.hash.match(/\d+/)) && hash[0] in Unread.thread.posts) {
        return;
      }
      if (Unread.posts.length) {
        post = Unread.posts[0];
        while (root = $.x('preceding-sibling::div[contains(@class,"replyContainer")][1]', post.nodes.root)) {
          if (!(post = Get.postFromRoot(root)).isHidden) {
            break;
          }
        }
        if (!root) {
          return;
        }
        down = true;
      } else {
        posts = Object.keys(Unread.thread.posts);
        root = Unread.thread.posts[posts[posts.length - 1]].nodes.root;
      }
      return $.on(window, 'load', function() {
        if (Header.getBottomOf(root) < 0) {
          return Header.scrollTo(root, down);
        }
      });
    },
    sync: function() {
      var lastReadPost;
      lastReadPost = Unread.db.get({
        boardID: Unread.thread.board.ID,
        threadID: Unread.thread.ID,
        defaultValue: 0
      });
      if (!(Unread.lastReadPost < lastReadPost)) {
        return;
      }
      Unread.lastReadPost = lastReadPost;
      Unread.readArray(Unread.posts);
      Unread.readArray(Unread.postsQuotingYou);
      if (Conf['Unread Line']) {
        Unread.setLine();
      }
      return Unread.update();
    },
    addPosts: function(posts) {
      var ID, data, post, _i, _len, _ref;
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        ID = post.ID;
        if (ID <= Unread.lastReadPost || post.isHidden) {
          continue;
        }
        if (QR.db) {
          data = {
            boardID: post.board.ID,
            threadID: post.thread.ID,
            postID: post.ID
          };
          if (QR.db.get(data)) {
            continue;
          }
        }
        Unread.posts.push(post);
        Unread.addPostQuotingYou(post);
      }
      if (Conf['Unread Line']) {
        Unread.setLine((_ref = Unread.posts[0], __indexOf.call(posts, _ref) >= 0));
      }
      Unread.read();
      return Unread.update();
    },
    addPostQuotingYou: function(post) {
      var quotelink, _i, _len, _ref;
      if (!QR.db) {
        return;
      }
      _ref = post.nodes.quotelinks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        if (!(QR.db.get(Get.postDataFromLink(quotelink)))) {
          continue;
        }
        Unread.postsQuotingYou.push(post);
        Unread.openNotification(post);
        return;
      }
    },
    openNotification: function(post) {
      var notif;
      if (!Header.areNotificationsEnabled) {
        return;
      }
      notif = new Notification("" + (post.getNameBlock()) + " replied to you", {
        body: post.info.comment,
        icon: Favicon.logo
      });
      notif.onclick = function() {
        Header.scrollToIfNeeded(post.nodes.root, true);
        return window.focus();
      };
      return notif.onshow = function() {
        return setTimeout(function() {
          return notif.close();
        }, 7 * $.SECOND);
      };
    },
    onUpdate: function(e) {
      if (e.detail[404]) {
        return Unread.update();
      } else {
        return Unread.addPosts(e.detail.newPosts.map(function(fullID) {
          return g.posts[fullID];
        }));
      }
    },
    readSinglePost: function(post) {
      var i;
      if ((i = Unread.posts.indexOf(post)) === -1) {
        return;
      }
      Unread.posts.splice(i, 1);
      if (i === 0) {
        Unread.lastReadPost = post.ID;
        Unread.saveLastReadPost();
      }
      if ((i = Unread.postsQuotingYou.indexOf(post)) !== -1) {
        Unread.postsQuotingYou.splice(i, 1);
      }
      return Unread.update();
    },
    readArray: function(arr) {
      var i, post, _i, _len;
      for (i = _i = 0, _len = arr.length; _i < _len; i = ++_i) {
        post = arr[i];
        if (post.ID > Unread.lastReadPost) {
          break;
        }
      }
      return arr.splice(0, i);
    },
    read: function(e) {
      var i, post, _i, _len, _ref;
      if (d.hidden || !Unread.posts.length) {
        return;
      }
      _ref = Unread.posts;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        post = _ref[i];
        if (Header.getBottomOf(post.nodes.root) < -1) {
          break;
        }
      }
      if (!i) {
        return;
      }
      Unread.lastReadPost = Unread.posts.splice(0, i)[i - 1].ID;
      Unread.saveLastReadPost();
      Unread.readArray(Unread.postsQuotingYou);
      if (e) {
        return Unread.update();
      }
    },
    saveLastReadPost: function() {
      if (Unread.thread.isDead) {
        return;
      }
      return Unread.db.set({
        boardID: Unread.thread.board.ID,
        threadID: Unread.thread.ID,
        val: Unread.lastReadPost
      });
    },
    setLine: function(force) {
      var post;
      if (!(d.hidden || force === true)) {
        return;
      }
      if (!(post = Unread.posts[0])) {
        $.rm(Unread.hr);
        return;
      }
      if ($.x('preceding-sibling::div[contains(@class,"replyContainer")]', post.nodes.root)) {
        return $.before(post.nodes.root, Unread.hr);
      }
    },
    update: function() {
      var count;
      count = Unread.posts.length;
      if (Conf['Unread Count']) {
        d.title = "" + (count || !Conf['Hide Unread Count at (0)'] ? "(" + count + ") " : '') + (g.DEAD ? Unread.title.replace('-', '- 404 -') : Unread.title);
      }
      if (!Conf['Unread Tab Icon']) {
        return;
      }
      Favicon.el.href = g.DEAD ? Unread.postsQuotingYou[0] ? Favicon.unreadDeadY : count ? Favicon.unreadDead : Favicon.dead : count ? Unread.postsQuotingYou[0] ? Favicon.unreadY : Favicon.unread : Favicon["default"];
      return $.add(d.head, Favicon.el);
    }
  };

  Redirect = {
    archives: [{"uid":0,"convert":{},"name":"Moe","domain":"archive.moe","http":true,"https":true,"software":"foolfuuka","boards":["a","biz","c","co","diy","gd","i","int","jp","m","mlp","out","po","s4s","sci","sp","tg","tv","v","vg","vp","vr","wsg"],"files":["a","biz","c","co","diy","gd","i","jp","m","po","s4s","sci","tg","v","vg","vp","vr","wsg"]},{"uid":1,"convert":{},"name":"NSFW Moe","domain":"nsfw.archive.moe","http":true,"https":true,"software":"foolfuuka","boards":["h","u"],"files":["h","u"]},{"uid":3,"convert":{},"name":"4plebs Archive","domain":"archive.4plebs.org","http":true,"https":true,"software":"foolfuuka","boards":["adv","f","hr","o","pol","s4s","tg","trv","tv","x"],"files":["adv","f","hr","o","pol","s4s","tg","trv","tv","x"]},{"uid":5,"convert":{},"name":"Love is Over","domain":"archive.loveisover.me","http":true,"https":true,"software":"foolfuuka","boards":["c","d","e","i","lgbt","t","u","w","wg"],"files":["c","d","e","i","lgbt","t","u","w","wg"]},{"uid":8,"convert":{},"name":"Rebecca Black Tech","domain":"archive.rebeccablacktech.com","http":false,"https":true,"software":"fuuka","boards":["cgl","g","mu","w"],"files":["cgl","g","mu","w"]},{"uid":9,"convert":{},"name":"Heinessen","domain":"archive.heinessen.com","http":true,"https":false,"software":"fuuka","boards":["an","fit","k","mlp","r9k","toy"],"files":["an","fit","k","mlp","r9k","toy"]},{"uid":10,"convert":{},"name":"warosu","domain":"warosu.org","http":false,"https":true,"software":"fuuka","boards":["3","biz","cgl","ck","diy","fa","g","ic","jp","lit","sci","tg","vr"],"files":["3","biz","cgl","ck","diy","fa","g","ic","jp","lit","sci","tg","vr"]},{"uid":15,"convert":{},"name":"fgts","domain":"fgts.jp","http":true,"https":true,"software":"foolfuuka","boards":["asp","cm","h","hc","hm","n","p","r","s","soc","y"],"files":["asp","cm","h","hc","hm","n","p","r","s","soc","y"]},{"uid":16,"convert":{},"name":"maware","domain":"archive.mawa.re","http":true,"https":false,"software":"foolfuuka","boards":["t"],"files":["t"]}],
    init: function() {
      this.selectArchives();
      return this.update();
    },
    selectArchives: function() {
      var archive, arr, boardID, data, type, uid, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      Redirect.data = {
        thread: {},
        post: {},
        file: {}
      };
      _ref = Conf['selectedArchives'];
      for (boardID in _ref) {
        data = _ref[boardID];
        for (type in data) {
          uid = data[type];
          _ref1 = Conf['archives'];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            archive = _ref1[_i];
            if (archive.uid !== uid) {
              continue;
            }
            if (type === 'post' && archive.software !== 'foolfuuka') {
              break;
            }
            arr = type === 'file' ? archive.files : archive.boards;
            if (__indexOf.call(arr, boardID) >= 0) {
              Redirect.data[type][boardID] = archive;
            }
            break;
          }
        }
      }
      _ref2 = Conf['archives'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        archive = _ref2[_j];
        _ref3 = archive.boards;
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          boardID = _ref3[_k];
          if (!(boardID in Redirect.data.thread)) {
            Redirect.data.thread[boardID] = archive;
          }
          if (!(boardID in Redirect.data.post || archive.software !== 'foolfuuka')) {
            Redirect.data.post[boardID] = archive;
          }
          if (!(boardID in Redirect.data.file || __indexOf.call(archive.files, boardID) < 0)) {
            Redirect.data.file[boardID] = archive;
          }
        }
      }
    },
    update: function(cb) {
      return $.get('lastarchivecheck', 0, function(_arg) {
        var lastarchivecheck, now;
        lastarchivecheck = _arg.lastarchivecheck;
        now = Date.now();
        if (lastarchivecheck > now - 2 * $.DAY) {
          return;
        }
        return $.ajax(Conf['archivesLocation'], {
          onload: function() {
            if (this.status === 200) {
              Conf['archives'] = this.response;
              Redirect.selectArchives();
              $.set({
                lastarchivecheck: now,
                archives: Conf['archives']
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        });
      });
    },
    to: function(dest, data) {
      var archive;
      archive = (dest === 'search' || dest === 'board' ? Redirect.data.thread : Redirect.data[dest])[data.boardID];
      if (!archive) {
        return '';
      }
      return Redirect[dest](archive, data);
    },
    protocol: function(archive) {
      var protocol;
      protocol = location.protocol;
      if (!archive[protocol.slice(0, -1)]) {
        protocol = protocol === 'https:' ? 'http:' : 'https:';
      }
      return "" + protocol + "//";
    },
    thread: function(archive, _arg) {
      var boardID, path, postID, threadID;
      boardID = _arg.boardID, threadID = _arg.threadID, postID = _arg.postID;
      path = threadID ? "" + boardID + "/thread/" + threadID : "" + boardID + "/post/" + postID;
      if (archive.software === 'foolfuuka') {
        path += '/';
      }
      if (threadID && postID) {
        path += archive.software === 'foolfuuka' ? "#" + postID : "#p" + postID;
      }
      return "" + (Redirect.protocol(archive)) + archive.domain + "/" + path;
    },
    post: function(archive, _arg) {
      var URL, boardID, postID;
      boardID = _arg.boardID, postID = _arg.postID;
      URL = new String("" + (Redirect.protocol(archive)) + archive.domain + "/_/api/chan/post/?board=" + boardID + "&num=" + postID);
      URL.archive = archive;
      return URL;
    },
    file: function(archive, _arg) {
      var boardID, filename;
      boardID = _arg.boardID, filename = _arg.filename;
      return "" + (Redirect.protocol(archive)) + archive.domain + "/" + boardID + "/full_image/" + filename;
    },
    board: function(archive, _arg) {
      var boardID;
      boardID = _arg.boardID;
      return "" + (Redirect.protocol(archive)) + archive.domain + "/" + boardID + "/";
    },
    search: function(archive, _arg) {
      var boardID, convert, from, path, to, type, value, _ref;
      boardID = _arg.boardID, type = _arg.type, value = _arg.value;
      type = type === 'name' ? 'username' : type === 'MD5' ? 'image' : type;
      convert = archive.convert;
      if (convert[type]) {
        _ref = convert[type].split(':'), from = _ref[0], to = _ref[1];
        value = value.replace(RegExp("" + from, "g"), to);
      }
      value = encodeURIComponent(value);
      path = archive.software === 'foolfuuka' ? "" + boardID + "/search/" + type + "/" + value : "" + boardID + "/?task=search2&search_" + (type === 'image' ? 'media_hash' : type) + "=" + value;
      return "" + (Redirect.protocol(archive)) + archive.domain + "/" + path;
    }
  };

  Anonymize = {
    init: function() {
      if (!Conf['Anonymize']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Anonymize',
        cb: this.node
      });
    },
    node: function() {
      var email, name, tripcode, _ref;
      if (this.info.capcode || this.isClone) {
        return;
      }
      _ref = this.nodes, name = _ref.name, tripcode = _ref.tripcode, email = _ref.email;
      if (this.info.name !== 'Anonymous') {
        name.textContent = 'Anonymous';
      }
      if (tripcode) {
        $.rm(tripcode);
        delete this.nodes.tripcode;
      }
      if (this.info.email) {
        $.replace(email, name);
        return delete this.nodes.email;
      }
    }
  };

  CustomCSS = {
    init: function() {
      if (!Conf['Custom CSS']) {
        return;
      }
      return this.addStyle();
    },
    addStyle: function() {
      return this.style = $.addStyle(Conf['usercss']);
    },
    rmStyle: function() {
      if (this.style) {
        $.rm(this.style);
        return delete this.style;
      }
    },
    update: function() {
      if (!this.style) {
        this.addStyle();
      }
      return this.style.textContent = Conf['usercss'];
    }
  };

  Dice = {
    init: function() {
      if (g.BOARD.ID !== 'tg' || !Conf['Show Dice Roll']) {
        return;
      }
      return Post.callbacks.push({
        name: 'Show Dice Roll',
        cb: this.node
      });
    },
    node: function() {
      var dicestats, roll, _ref;
      if (this.isClone || !(dicestats = (_ref = this.info.email) != null ? _ref.match(/dice[+\s](\d+)d(\d+)/) : void 0)) {
        return;
      }
      roll = $('b', this.nodes.comment).firstChild;
      return roll.data = "Rolled " + dicestats[1] + "d" + dicestats[2] + ": " + (roll.data.slice(7));
    }
  };

  ExpandThread = {
    init: function() {
      if (g.VIEW !== 'index' || !Conf['Thread Expansion']) {
        return;
      }
      this.statuses = {};
      return $.on(d, 'IndexRefresh', this.onIndexRefresh);
    },
    setButton: function(thread) {
      var a;
      if (!(a = $.x('following-sibling::a[contains(@class,"summary")][1]', thread.OP.nodes.root))) {
        return;
      }
      a.textContent = ExpandThread.text.apply(ExpandThread, ['+'].concat(__slice.call(a.textContent.match(/\d+/g))));
      return $.on(a, 'click', ExpandThread.cbToggle);
    },
    onIndexRefresh: function() {
      var status, thread, threadID, _ref, _ref1, _ref2;
      _ref = ExpandThread.statuses;
      for (threadID in _ref) {
        status = _ref[threadID];
        if ((_ref1 = status.req) != null) {
          _ref1.abort();
        }
        delete ExpandThread.statuses[threadID];
      }
      _ref2 = g.BOARD.threads;
      for (threadID in _ref2) {
        thread = _ref2[threadID];
        ExpandThread.setButton(thread);
      }
    },
    text: function(status, posts, files) {
      var text;
      text = [status];
      text.push("" + posts + " post" + (posts > 1 ? 's' : ''));
      if (+files) {
        text.push("and " + files + " image repl" + (files > 1 ? 'ies' : 'y'));
      }
      text.push(status === '-' ? 'shown. Click to hide' : 'omitted. Click to view');
      return text.join(' ') + '.';
    },
    cbToggle: function(e) {
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey || e.button !== 0) {
        return;
      }
      e.preventDefault();
      return ExpandThread.toggle(Get.threadFromNode(this));
    },
    toggle: function(thread) {
      var a, threadRoot;
      threadRoot = thread.OP.nodes.root.parentNode;
      if (!(a = $('.summary', threadRoot))) {
        return;
      }
      if (thread.ID in ExpandThread.statuses) {
        return ExpandThread.contract(thread, a, threadRoot);
      } else {
        return ExpandThread.expand(thread, a, threadRoot);
      }
    },
    expand: function(thread, a, threadRoot) {
      var status;
      ExpandThread.statuses[thread] = status = {};
      a.textContent = ExpandThread.text.apply(ExpandThread, ['...'].concat(__slice.call(a.textContent.match(/\d+/g))));
      return status.req = $.cache("//a.4cdn.org/" + thread.board + "/thread/" + thread + ".json", function() {
        delete status.req;
        return ExpandThread.parse(this, thread, a);
      });
    },
    contract: function(thread, a, threadRoot) {
      var filesCount, inlined, num, postsCount, replies, reply, status, _i, _len;
      status = ExpandThread.statuses[thread];
      delete ExpandThread.statuses[thread];
      if (status.req) {
        status.req.abort();
        if (a) {
          a.textContent = ExpandThread.text.apply(ExpandThread, ['+'].concat(__slice.call(a.textContent.match(/\d+/g))));
        }
        return;
      }
      replies = $$('.thread > .replyContainer', threadRoot);
      if (Conf['Show Replies']) {
        num = (function() {
          if (thread.isSticky) {
            return 1;
          } else {
            switch (g.BOARD.ID) {
              case 'b':
              case 'vg':
                return 3;
              case 't':
                return 1;
              default:
                return 5;
            }
          }
        })();
        replies = replies.slice(0, -num);
      }
      postsCount = 0;
      filesCount = 0;
      for (_i = 0, _len = replies.length; _i < _len; _i++) {
        reply = replies[_i];
        if (Conf['Quote Inlining']) {
          while (inlined = $('.inlined', reply)) {
            inlined.click();
          }
        }
        postsCount++;
        if ('file' in Get.postFromRoot(reply)) {
          filesCount++;
        }
        $.rm(reply);
      }
      return a.textContent = ExpandThread.text('+', postsCount, filesCount);
    },
    parse: function(req, thread, a) {
      var filesCount, post, postData, posts, postsRoot, root, _i, _len, _ref, _ref1;
      if ((_ref = req.status) !== 200 && _ref !== 304) {
        a.textContent = "Error " + req.statusText + " (" + req.status + ")";
        return;
      }
      Build.spoilerRange[thread.board] = req.response.posts[0].custom_spoiler;
      posts = [];
      postsRoot = [];
      filesCount = 0;
      _ref1 = req.response.posts;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        postData = _ref1[_i];
        if (postData.no === thread.ID) {
          continue;
        }
        if (post = thread.posts[postData.no]) {
          if ('file' in post) {
            filesCount++;
          }
          postsRoot.push(post.nodes.root);
          continue;
        }
        root = Build.postFromObject(postData, thread.board.ID);
        post = new Post(root, thread, thread.board);
        if ('file' in post) {
          filesCount++;
        }
        posts.push(post);
        postsRoot.push(root);
      }
      Main.callbackNodes(Post, posts);
      $.after(a, postsRoot);
      return a.textContent = ExpandThread.text('-', postsRoot.length, filesCount);
    }
  };

  FileInfo = {
    init: function() {
      if (!Conf['File Info Formatting']) {
        return;
      }
      this.funk = this.createFunc(Conf['fileInfo']);
      return Post.callbacks.push({
        name: 'File Info Formatting',
        cb: this.node
      });
    },
    node: function() {
      if (!this.file || this.isClone) {
        return;
      }
      return this.file.text.innerHTML = "<span class=file-info>" + (FileInfo.funk(FileInfo, this)) + "</span>";
    },
    createFunc: function(format) {
      var code;
      code = format.replace(/%(.)/g, function(s, c) {
        if (c in FileInfo.formatters) {
          return "' + FileInfo.formatters." + c + ".call(post) + '";
        } else {
          return s;
        }
      });
      return Function('FileInfo', 'post', "return '" + code + "'");
    },
    convertUnit: function(size, unit) {
      var i;
      if (unit === 'B') {
        return "" + (size.toFixed()) + " Bytes";
      }
      i = 1 + ['KB', 'MB'].indexOf(unit);
      while (i--) {
        size /= 1024;
      }
      size = unit === 'MB' ? Math.round(size * 100) / 100 : size.toFixed();
      return "" + size + " " + unit;
    },
    escape: function(name) {
      return name.replace(/<|>/g, function(c) {
        return c === '<' && '&lt;' || '&gt;';
      });
    },
    formatters: {
      t: function() {
        return this.file.URL.match(/\d+\..+$/)[0];
      },
      T: function() {
        return "<a href=" + this.file.URL + " target=_blank>" + (FileInfo.formatters.t.call(this)) + "</a>";
      },
      l: function() {
        return "<a href=" + this.file.URL + " target=_blank>" + (FileInfo.formatters.n.call(this)) + "</a>";
      },
      L: function() {
        return "<a href=" + this.file.URL + " target=_blank>" + (FileInfo.formatters.N.call(this)) + "</a>";
      },
      n: function() {
        var fullname, shortname;
        fullname = this.file.name;
        shortname = Build.shortFilename(this.file.name, this.isReply);
        if (fullname === shortname) {
          return FileInfo.escape(fullname);
        } else {
          return "<span class=fntrunc>" + (FileInfo.escape(shortname)) + "</span><span class=fnfull>" + (FileInfo.escape(fullname)) + "</span>";
        }
      },
      N: function() {
        return FileInfo.escape(this.file.name);
      },
      p: function() {
        if (this.file.isSpoiler) {
          return 'Spoiler, ';
        } else {
          return '';
        }
      },
      s: function() {
        return this.file.size;
      },
      B: function() {
        return FileInfo.convertUnit(this.file.sizeInBytes, 'B');
      },
      K: function() {
        return FileInfo.convertUnit(this.file.sizeInBytes, 'KB');
      },
      M: function() {
        return FileInfo.convertUnit(this.file.sizeInBytes, 'MB');
      },
      r: function() {
        return this.file.dimensions || 'PDF';
      }
    }
  };

  Fourchan = {
    init: function() {
      var board;
      board = g.BOARD.ID;
      if (board === 'g') {
        $.globalEval("window.addEventListener('prettyprint', function(e) {\n  window.dispatchEvent(new CustomEvent('prettyprint:cb', {\n    detail: prettyPrintOne(e.detail)\n  }));\n}, false);");
        Post.callbacks.push({
          name: 'Parse /g/ code',
          cb: this.code
        });
      }
      if (board === 'sci') {
        $.globalEval("window.addEventListener('jsmath', function(e) {\n  if (jsMath.loaded) {\n    // process one post\n    jsMath.ProcessBeforeShowing(document.getElementById(e.detail));\n  } else {\n    // load jsMath and process whole document\n    jsMath.Autoload.Script.Push('ProcessBeforeShowing', [null]);\n    jsMath.Autoload.LoadJsMath();\n  }\n}, false);");
        return Post.callbacks.push({
          name: 'Parse /sci/ math',
          cb: this.math
        });
      }
    },
    code: function() {
      var apply, pre, _i, _len, _ref;
      if (this.isClone) {
        return;
      }
      apply = function(e) {
        return pre.innerHTML = e.detail;
      };
      $.on(window, 'prettyprint:cb', apply);
      _ref = $$('.prettyprint:not(.prettyprinted)', this.nodes.comment);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pre = _ref[_i];
        $.event('prettyprint', pre.innerHTML, window);
      }
      $.off(window, 'prettyprint:cb', apply);
    },
    math: function() {
      if (this.isClone || !$('.math', this.nodes.comment)) {
        return;
      }
      return $.event('jsmath', this.nodes.post.id, window);
    }
  };

  IDColor = {
    init: function() {
      if (!Conf['Color User IDs']) {
        return;
      }
      this.ids = {};
      return Post.callbacks.push({
        name: 'Color User IDs',
        cb: this.node
      });
    },
    node: function() {
      var rgb, span, style, uid;
      if (this.isClone || !(uid = this.info.uniqueID)) {
        return;
      }
      rgb = IDColor.compute(uid);
      span = this.nodes.uniqueID;
      style = span.firstElementChild.style;
      style.color = rgb[3];
      style.backgroundColor = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
      return $.addClass(span, 'painted');
    },
    compute: function(uniqueID) {
      var hash, rgb;
      if (uniqueID in IDColor.ids) {
        return IDColor.ids[uniqueID];
      }
      hash = this.hash(uniqueID);
      rgb = [(hash >> 24) & 0xFF, (hash >> 16) & 0xFF, (hash >> 8) & 0xFF];
      rgb.push((rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 170 ? 'black' : 'white');
      return this.ids[uniqueID] = rgb;
    },
    hash: function(uniqueID) {
      var i, msg, _i, _ref;
      msg = 0;
      for (i = _i = 0, _ref = uniqueID.length; _i < _ref; i = _i += 1) {
        msg = (msg << 5) - msg + uniqueID.charCodeAt(i);
      }
      return msg;
    }
  };

  Keybinds = {
    init: function() {
      var hotkey, init;
      if (!Conf['Keybinds']) {
        return;
      }
      for (hotkey in Conf.hotkeys) {
        $.sync(hotkey, Keybinds.sync);
      }
      init = function() {
        var node, _i, _len, _ref;
        $.off(d, '4chanXInitFinished', init);
        $.on(d, 'keydown', Keybinds.keydown);
        _ref = $$('[accesskey]');
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          node.removeAttribute('accesskey');
        }
      };
      return $.on(d, '4chanXInitFinished', init);
    },
    sync: function(key, hotkey) {
      return Conf[hotkey] = key;
    },
    keydown: function(e) {
      var key, notification, notifications, op, target, thread, threadRoot, _i, _len, _ref;
      if (!(key = Keybinds.keyCode(e))) {
        return;
      }
      target = e.target;
      if ((_ref = target.nodeName) === 'INPUT' || _ref === 'TEXTAREA') {
        if (!/(Esc|Alt|Ctrl|Meta|Shift\+\w{2,})/.test(key)) {
          return;
        }
      }
      threadRoot = Nav.getThread();
      if (op = $('.op', threadRoot)) {
        thread = Get.postFromNode(op).thread;
      }
      switch (key) {
        case Conf['Toggle board list']:
          if (Conf['Custom Board Navigation']) {
            Header.toggleBoardList();
          }
          break;
        case Conf['Open empty QR']:
          Keybinds.qr(threadRoot);
          break;
        case Conf['Open QR']:
          Keybinds.qr(threadRoot, true);
          break;
        case Conf['Open settings']:
          Settings.open();
          break;
        case Conf['Close']:
          if (Settings.dialog) {
            Settings.close();
          } else if ((notifications = $$('.notification')).length) {
            for (_i = 0, _len = notifications.length; _i < _len; _i++) {
              notification = notifications[_i];
              $('.close', notification).click();
            }
          } else if (QR.nodes) {
            if (Conf['Persistent QR']) {
              QR.nodes.autohide.click();
            } else {
              QR.close();
            }
          } else if (ReportLink.lastEmbed) {
            ReportLink.toggle();
          } else if (Embedding.lastEmbed) {
            Embedding.toggleFloat();
          }
          break;
        case Conf['Spoiler tags']:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('spoiler', target);
          break;
        case Conf['Code tags']:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('code', target);
          break;
        case Conf['Eqn tags']:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('eqn', target);
          break;
        case Conf['Math tags']:
          if (target.nodeName !== 'TEXTAREA') {
            return;
          }
          Keybinds.tags('math', target);
          break;
        case Conf['Submit QR']:
          if (QR.nodes && !QR.status()) {
            QR.submit();
          }
          break;
        case Conf['Toggle Sage']:
          QR.toggleSage();
          break;
        case Conf['Update']:
          switch (g.VIEW) {
            case 'thread':
              ThreadUpdater.update();
              break;
            case 'index':
              Index.update();
          }
          break;
        case Conf['Watch']:
          ThreadWatcher.toggle(thread);
          break;
        case Conf['Expand image']:
          Keybinds.img(threadRoot);
          break;
        case Conf['Expand images']:
          Keybinds.img(threadRoot, true);
          break;
        case Conf['Front page']:
          if (g.VIEW === 'index') {
            Index.update();
          } else {
            window.location = "/" + g.BOARD + "/";
          }
          break;
        case Conf['Open front page']:
          $.open("/" + g.BOARD + "/");
          break;
        case Conf['Next page']:
          if (!(g.VIEW === 'index' && Conf['Index Mode'] === 'paged')) {
            return;
          }
          $('.next button', Index.pagelist).click();
          break;
        case Conf['Previous page']:
          if (!(g.VIEW === 'index' && Conf['Index Mode'] === 'paged')) {
            return;
          }
          $('.prev button', Index.pagelist).click();
          break;
        case Conf['Search form']:
          Index.searchInput.focus();
          break;
        case Conf['Paged mode']:
          if (!(g.VIEW === 'index' && Conf['Index Mode'] !== 'paged')) {
            return;
          }
          Index.setIndexMode('paged');
          break;
        case Conf['All pages mode']:
          if (!(g.VIEW === 'index' && Conf['Index Mode'] !== 'all pages')) {
            return;
          }
          Index.setIndexMode('all pages');
          break;
        case Conf['Catalog mode']:
          if (!(g.VIEW === 'index' && Conf['Index Mode'] !== 'catalog')) {
            return;
          }
          Index.setIndexMode('catalog');
          break;
        case Conf['Cycle sort type']:
          Index.cycleSortType();
          break;
        case Conf['Next thread']:
          if (g.VIEW !== 'index' || Conf['Index Mode'] === 'catalog') {
            return;
          }
          Nav.scroll(+1);
          break;
        case Conf['Previous thread']:
          if (g.VIEW !== 'index' || Conf['Index Mode'] === 'catalog') {
            return;
          }
          Nav.scroll(-1);
          break;
        case Conf['Expand thread']:
          if (g.VIEW !== 'index' || Conf['Index Mode'] === 'catalog') {
            return;
          }
          ExpandThread.toggle(thread);
          break;
        case Conf['Open thread']:
          if (g.VIEW !== 'index' || Conf['Index Mode'] === 'catalog') {
            return;
          }
          Keybinds.open(thread);
          break;
        case Conf['Open thread tab']:
          if (g.VIEW !== 'index' || Conf['Index Mode'] === 'catalog') {
            return;
          }
          Keybinds.open(thread, true);
          break;
        case Conf['Next reply']:
          Keybinds.hl(+1, threadRoot);
          break;
        case Conf['Previous reply']:
          Keybinds.hl(-1, threadRoot);
          break;
        case Conf['Deselect reply']:
          Keybinds.hl(0, threadRoot);
          break;
        case Conf['Hide']:
          PostHiding.toggle(thread.OP);
          break;
        default:
          return;
      }
      e.preventDefault();
      return e.stopPropagation();
    },
    keyCode: function(e) {
      var kc, key;
      key = (function() {
        switch (kc = e.keyCode) {
          case 8:
            return '';
          case 13:
            return 'Enter';
          case 27:
            return 'Esc';
          case 37:
            return 'Left';
          case 38:
            return 'Up';
          case 39:
            return 'Right';
          case 40:
            return 'Down';
          default:
            if ((48 <= kc && kc <= 57) || (65 <= kc && kc <= 90)) {
              return String.fromCharCode(kc).toLowerCase();
            } else if ((112 <= kc && kc <= 123) || (127 <= kc && kc <= 130)) {
              return "F" + (kc - 111);
            } else {
              return null;
            }
        }
      })();
      if (key) {
        if (e.altKey) {
          key = 'Alt+' + key;
        }
        if (e.ctrlKey) {
          key = 'Ctrl+' + key;
        }
        if (e.metaKey) {
          key = 'Meta+' + key;
        }
        if (e.shiftKey) {
          key = 'Shift+' + key;
        }
      }
      return key;
    },
    qr: function(thread, quote) {
      if (!(Conf['Quick Reply'] && QR.postingIsEnabled)) {
        return;
      }
      QR.open();
      if (quote) {
        QR.quote.call($('input', $('.post.highlight', thread) || thread));
      }
      return QR.nodes.com.focus();
    },
    tags: function(tag, ta) {
      var range, selEnd, selStart, value;
      value = ta.value;
      selStart = ta.selectionStart;
      selEnd = ta.selectionEnd;
      ta.value = value.slice(0, selStart) + ("[" + tag + "]") + value.slice(selStart, selEnd) + ("[/" + tag + "]") + value.slice(selEnd);
      range = ("[" + tag + "]").length + selEnd;
      ta.setSelectionRange(range, range);
      return $.event('input', null, ta);
    },
    img: function(thread, all) {
      var post;
      if (all) {
        return ImageExpand.cb.toggleAll();
      } else {
        post = Get.postFromNode($('.post.highlight', thread) || $('.op', thread));
        return ImageExpand.toggle(post);
      }
    },
    open: function(thread, tab) {
      var url;
      if (g.VIEW !== 'index') {
        return;
      }
      url = Build.path(thread.board.ID, thread.ID);
      if (tab) {
        return $.open(url);
      } else {
        return location.href = url;
      }
    },
    hl: function(delta, thread) {
      var axis, height, next, postEl, replies, reply, root, _i, _len;
      postEl = $('.reply.highlight', thread);
      if (!delta) {
        if (postEl) {
          $.rmClass(postEl, 'highlight');
        }
        return;
      }
      if (postEl) {
        height = postEl.getBoundingClientRect().height;
        if (Header.getTopOf(postEl) >= -height && Header.getBottomOf(postEl) >= -height) {
          root = postEl.parentNode;
          axis = delta === +1 ? 'following' : 'preceding';
          if (!(next = $.x("" + axis + "-sibling::div[contains(@class,'replyContainer') and not(@hidden) and not(child::div[@class='stub'])][1]/child::div[contains(@class,'reply')]", root))) {
            return;
          }
          Header.scrollToIfNeeded(next, delta === +1);
          this.focus(next);
          $.rmClass(postEl, 'highlight');
          return;
        }
        $.rmClass(postEl, 'highlight');
      }
      replies = $$('.reply', thread);
      if (delta === -1) {
        replies.reverse();
      }
      for (_i = 0, _len = replies.length; _i < _len; _i++) {
        reply = replies[_i];
        if (delta === +1 && Header.getTopOf(reply) > 0 || delta === -1 && Header.getBottomOf(reply) > 0) {
          this.focus(reply);
          return;
        }
      }
    },
    focus: function(post) {
      return $.addClass(post, 'highlight');
    }
  };

  Markdown = {
    format: function(text) {
      var pattern, tag, tag_patterns;
      if (!text) {
        return;
      }
      tag_patterns = {
        bi: /(\*\*\*|___)(?=\S)([^\r\n]*?\S)\1/g,
        b: /(\*\*|__)(?=\S)([^\r\n]*?\S)\1/g,
        i: /(\*|_)(?=\S)([^\r\n]*?\S)\1/g,
        code: /(`)(?=\S)([^\r\n]*?\S)\1/g,
        ds: /(\|\||__)(?=\S)([^\r\n]*?\S)\1/g
      };
      for (tag in tag_patterns) {
        pattern = tag_patterns[tag];
        text = text.replace(pattern, Markdown.unicode_convert);
      }
      return text;
    },
    unicode_convert: function(str, tag, inner) {
      var charcode, charcodes, codepoints, codes, fmt, i, unicode_text;
      fmt = tag === '_' || tag === '*' ? 'i' : tag === '__' || tag === '**' ? 'b' : tag === '___' || tag === '***' ? 'bi' : tag === '||' ? 'ds' : tag === '`' || tag === '```' ? 'code' : void 0;
      codepoints = {
        b: [0x1D7CE, 0x1D400, 0x1D41A],
        i: [0x1D7F6, 0x1D434, 0x1D44E],
        bi: [0x1D7CE, 0x1D468, 0x1D482],
        code: [0x1D7F6, 0x1D670, 0x1D68A],
        ds: [0x1D7D8, 0x1D538, 0x1D552]
      };
      charcodes = (function() {
        var _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = inner.length; _i < _len; i = ++_i) {
          c = inner[i];
          _results.push(inner.charCodeAt(i));
        }
        return _results;
      })();
      codes = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = charcodes.length; _i < _len; _i++) {
          charcode = charcodes[_i];
          if (charcode >= 48 && charcode <= 57) {
            _results.push(charcode - 48 + codepoints[fmt][0]);
          } else if (charcode >= 65 && charcode <= 90) {
            _results.push(charcode - 65 + codepoints[fmt][1]);
          } else if (charcode >= 97 && charcode <= 122) {
            if (charcode === 104 && tag === 'i') {
              _results.push(0x210E);
            } else {
              _results.push(charcode - 97 + codepoints[fmt][2]);
            }
          } else {
            _results.push(charcode);
          }
        }
        return _results;
      })();
      unicode_text = codes.map(Markdown.ucs2_encode).join('');
      if (tag === 'code') {
        unicode_text = unicode_text.replace(/\x20/g, '\xA0');
      }
      return unicode_text;
    },
    ucs2_encode: function(value) {
      var output;
      output = '';
      if (value > 0xFFFF) {
        value -= 0x10000;
        output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
        value = 0xDC00 | value & 0x3FF;
      }
      return output += String.fromCharCode(value);
    }
  };

  Nav = {
    init: function() {
      var append, next, prev, span;
      switch (g.VIEW) {
        case 'index':
          if (!Conf['Index Navigation']) {
            return;
          }
          break;
        case 'thread':
          if (!Conf['Reply Navigation']) {
            return;
          }
      }
      span = $.el('span', {
        id: 'navlinks'
      });
      prev = $.el('a', {
        textContent: '▲',
        href: 'javascript:;'
      });
      next = $.el('a', {
        textContent: '▼',
        href: 'javascript:;'
      });
      $.on(prev, 'click', this.prev);
      $.on(next, 'click', this.next);
      $.add(span, [prev, $.tn(' '), next]);
      append = function() {
        $.off(d, '4chanXInitFinished', append);
        return $.add(d.body, span);
      };
      return $.on(d, '4chanXInitFinished', append);
    },
    prev: function() {
      if (g.VIEW === 'thread') {
        return window.scrollTo(0, 0);
      } else {
        return Nav.scroll(-1);
      }
    },
    next: function() {
      if (g.VIEW === 'thread') {
        return window.scrollTo(0, d.body.scrollHeight);
      } else {
        return Nav.scroll(+1);
      }
    },
    getThread: function() {
      var threadRoot, _i, _len, _ref;
      _ref = $$('.thread');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        threadRoot = _ref[_i];
        if (Header.getTopOf(threadRoot) >= -threadRoot.getBoundingClientRect().height) {
          return threadRoot;
        }
      }
      return $('.board');
    },
    scroll: function(delta) {
      var axis, next, thread, top;
      thread = Nav.getThread();
      axis = delta === +1 ? 'following' : 'preceding';
      if (next = $.x("" + axis + "-sibling::div[contains(@class,'thread') and not(@hidden)][1]", thread)) {
        top = Header.getTopOf(thread);
        if (delta === +1 && top < 5 || delta === -1 && top > -5) {
          thread = next;
        }
      }
      return Header.scrollTo(thread);
    }
  };

  PSAHiding = {
    init: function() {
      $.addClass(doc, 'hide-announcement', 'hide-announcement-enabled');
      return $.on(d, '4chanXInitFinished', this.setup);
    },
    setup: function() {
      var btn, entry, psa;
      $.off(d, '4chanXInitFinished', PSAHiding.setup);
      if (!(psa = $.id('globalMessage'))) {
        $.rmClass(doc, 'hide-announcement', 'hide-announcement-enabled');
        return;
      }
      entry = {
        el: $.el('a', {
          textContent: 'Show announcement',
          className: 'show-announcement',
          href: 'javascript:;'
        }),
        order: 50,
        open: function() {
          return psa.hidden;
        }
      };
      Header.menu.addEntry(entry);
      $.on(entry.el, 'click', PSAHiding.toggle);
      PSAHiding.btn = btn = $.el('a', {
        className: 'hide-announcement fa fa-minus-square-o',
        title: 'Hide announcement.',
        href: 'javascript:;'
      });
      $.on(btn, 'click', PSAHiding.toggle);
      $.get('hiddenPSA', 0, function(_arg) {
        var hiddenPSA;
        hiddenPSA = _arg.hiddenPSA;
        PSAHiding.sync(hiddenPSA);
        $.before(psa, btn);
        return $.rmClass(doc, 'hide-announcement');
      });
      return $.sync('hiddenPSA', PSAHiding.sync);
    },
    toggle: function(e) {
      var UTC;
      if ($.hasClass(this, 'hide-announcement')) {
        UTC = +$.id('globalMessage').dataset.utc;
        $.set('hiddenPSA', UTC);
      } else {
        $.event('CloseMenu');
        $["delete"]('hiddenPSA');
      }
      return PSAHiding.sync(UTC);
    },
    sync: function(UTC) {
      var hr, psa;
      psa = $.id('globalMessage');
      psa.hidden = PSAHiding.btn.hidden = UTC && UTC >= +psa.dataset.utc ? true : false;
      if ((hr = psa.nextElementSibling) && hr.nodeName === 'HR') {
        return hr.hidden = psa.hidden;
      }
    }
  };

  RelativeDates = {
    INTERVAL: $.MINUTE / 2,
    init: function() {
      if (!Conf['Relative Date Title']) {
        switch (g.VIEW) {
          case 'index':
            this.flush();
            $.on(d, 'visibilitychange', this.flush);
            if (!Conf['Relative Post Dates']) {
              return;
            }
            break;
          case 'thread':
            if (!Conf['Relative Post Dates']) {
              return;
            }
            this.flush();
            if (g.VIEW === 'thread') {
              $.on(d, 'visibilitychange ThreadUpdate', this.flush);
            }
            break;
          default:
            return;
        }
      }
      return Post.callbacks.push({
        name: 'Relative Post Dates',
        cb: this.node
      });
    },
    node: function() {
      var dateEl;
      dateEl = this.nodes.date;
      if (Conf['Relative Date Title']) {
        $.on(dateEl, 'mouseover', (function(_this) {
          return function() {
            return RelativeDates.hover(_this);
          };
        })(this));
        return;
      }
      if (this.isClone) {
        return;
      }
      dateEl.title = dateEl.textContent;
      return RelativeDates.update(this);
    },
    relative: function(diff, now, date) {
      var days, months, number, rounded, unit, years;
      unit = (number = diff / $.DAY) >= 1 ? (years = now.getYear() - date.getYear(), months = now.getMonth() - date.getMonth(), days = now.getDate() - date.getDate(), years > 1 ? (number = years - (months < 0 || months === 0 && days < 0), 'year') : years === 1 && (months > 0 || months === 0 && days >= 0) ? (number = years, 'year') : (months = (months + 12) % 12) > 1 ? (number = months - (days < 0), 'month') : months === 1 && days >= 0 ? (number = months, 'month') : 'day') : (number = diff / $.HOUR) >= 1 ? 'hour' : (number = diff / $.MINUTE) >= 1 ? 'minute' : (number = Math.max(0, diff) / $.SECOND, 'second');
      rounded = Math.round(number);
      if (rounded !== 1) {
        unit += 's';
      }
      return "" + rounded + " " + unit + " ago";
    },
    stale: [],
    flush: function() {
      var data, now, _i, _len, _ref;
      if (d.hidden) {
        return;
      }
      now = new Date();
      _ref = RelativeDates.stale;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        RelativeDates.update(data, now);
      }
      RelativeDates.stale = [];
      clearTimeout(RelativeDates.timeout);
      return RelativeDates.timeout = setTimeout(RelativeDates.flush, RelativeDates.INTERVAL);
    },
    hover: function(post) {
      var date, diff, now;
      date = post.info.date;
      now = new Date();
      diff = now - date;
      return post.nodes.date.title = RelativeDates.relative(diff, now, date);
    },
    update: function(data, now) {
      var date, diff, isPost, relative, singlePost, _i, _len, _ref;
      isPost = data instanceof Post;
      date = isPost ? data.info.date : new Date(+data.dataset.utc);
      now || (now = new Date());
      diff = now - date;
      relative = RelativeDates.relative(diff, now, date);
      if (isPost) {
        _ref = [data].concat(data.clones);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          singlePost = _ref[_i];
          singlePost.nodes.date.firstChild.textContent = relative;
        }
      } else {
        data.firstChild.textContent = relative;
      }
      return RelativeDates.setOwnTimeout(diff, data);
    },
    setOwnTimeout: function(diff, data) {
      var delay;
      delay = diff < $.MINUTE ? $.SECOND - (diff + $.SECOND / 2) % $.SECOND : diff < $.HOUR ? $.MINUTE - (diff + $.MINUTE / 2) % $.MINUTE : diff < $.DAY ? $.HOUR - (diff + $.HOUR / 2) % $.HOUR : $.DAY - (diff + $.DAY / 2) % $.DAY;
      return setTimeout(RelativeDates.markStale, delay, data);
    },
    markStale: function(data) {
      if (__indexOf.call(RelativeDates.stale, data) >= 0) {
        return;
      }
      if (data instanceof Post && !g.posts[data.fullID]) {
        return;
      }
      return RelativeDates.stale.push(data);
    }
  };

  Report = {
    init: function() {
      CustomCSS.init();
      if (window !== window.top) {
        $.addStyle("body { background: none !important; } .rules { display: none; }");
      }
      if (!(/report/.test(location.search) && d.cookie.indexOf('pass_enabled=1') === -1)) {
        return;
      }
      return $.asap((function() {
        return $.id('recaptcha_response_field');
      }), Report.ready);
    },
    ready: function() {
      var field;
      field = $.id('recaptcha_response_field');
      $.on(field, 'keydown', function(e) {
        if (e.keyCode === 8 && !field.value) {
          return $.globalEval('Recaptcha.reload("t")');
        }
      });
      return $.on($('form'), 'submit', function(e) {
        var response;
        e.preventDefault();
        response = field.value.trim();
        field.value = response;
        return this.submit();
      });
    }
  };

  Time = {
    init: function() {
      if (!Conf['Time Formatting']) {
        return;
      }
      this.funk = this.createFunc(Conf['time']);
      return Post.callbacks.push({
        name: 'Time Formatting',
        cb: this.node
      });
    },
    node: function() {
      if (this.isClone) {
        return;
      }
      return this.nodes.date.textContent = Time.funk(Time, this.info.date);
    },
    createFunc: function(format) {
      var code;
      code = format.replace(/%([A-Za-z])/g, function(s, c) {
        if (c in Time.formatters) {
          return "' + Time.formatters." + c + ".call(date) + '";
        } else {
          return s;
        }
      });
      return Function('Time', 'date', "return '" + code + "'");
    },
    day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    zeroPad: function(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return n;
      }
    },
    formatters: {
      a: function() {
        return Time.day[this.getDay()].slice(0, 3);
      },
      A: function() {
        return Time.day[this.getDay()];
      },
      b: function() {
        return Time.month[this.getMonth()].slice(0, 3);
      },
      B: function() {
        return Time.month[this.getMonth()];
      },
      d: function() {
        return Time.zeroPad(this.getDate());
      },
      e: function() {
        return this.getDate();
      },
      H: function() {
        return Time.zeroPad(this.getHours());
      },
      I: function() {
        return Time.zeroPad(this.getHours() % 12 || 12);
      },
      k: function() {
        return this.getHours();
      },
      l: function() {
        return this.getHours() % 12 || 12;
      },
      m: function() {
        return Time.zeroPad(this.getMonth() + 1);
      },
      M: function() {
        return Time.zeroPad(this.getMinutes());
      },
      p: function() {
        if (this.getHours() < 12) {
          return 'AM';
        } else {
          return 'PM';
        }
      },
      P: function() {
        if (this.getHours() < 12) {
          return 'am';
        } else {
          return 'pm';
        }
      },
      S: function() {
        return Time.zeroPad(this.getSeconds());
      },
      y: function() {
        return this.getFullYear().toString().slice(2);
      }
    }
  };

  Board = (function() {
    Board.prototype.toString = function() {
      return this.ID;
    };

    function Board(ID) {
      this.ID = ID;
      this.threads = {};
      this.posts = {};
      g.boards[this] = this;
    }

    return Board;

  })();

  Thread = (function() {
    Thread.callbacks = [];

    Thread.prototype.toString = function() {
      return this.ID;
    };

    function Thread(ID, board) {
      this.ID = ID;
      this.board = board;
      this.fullID = "" + this.board + "." + this.ID;
      this.posts = {};
      this.isDead = false;
      this.isHidden = false;
      this.isOnTop = false;
      this.isPinned = false;
      this.isSticky = false;
      this.isClosed = false;
      this.postLimit = false;
      this.fileLimit = false;
      this.OP = null;
      this.catalogView = null;
      g.threads[this.fullID] = board.threads[this] = this;
    }

    Thread.prototype.setStatus = function(type, status) {
      var icon, name, root, typeLC;
      name = "is" + type;
      if (this[name] === status) {
        return;
      }
      this[name] = status;
      if (!this.OP) {
        return;
      }
      typeLC = type.toLowerCase();
      if (!status) {
        $.rm($("." + typeLC + "Icon", this.OP.nodes.info));
        if (this.catalogView) {
          $.rm($("." + typeLC + "Icon", this.catalogView.nodes.icons));
        }
        return;
      }
      icon = $.el('img', {
        src: "" + Build.staticPath + typeLC + Build.gifIcon,
        title: type,
        className: "" + typeLC + "Icon"
      });
      root = type === 'Closed' && this.isSticky ? $('.stickyIcon', this.OP.nodes.info) : g.VIEW === 'index' ? $('.page-num', this.OP.nodes.info) : $('[title="Reply to this post"]', this.OP.nodes.info);
      $.after(root, [$.tn(' '), icon]);
      if (!this.catalogView) {
        return;
      }
      return (type === 'Sticky' && this.isClosed ? $.prepend : $.add)(this.catalogView.nodes.icons, icon.cloneNode());
    };

    Thread.prototype.pin = function() {
      this.isPinned = true;
      if (this.catalogView) {
        return $.addClass(this.catalogView.nodes.root, 'pinned');
      }
    };

    Thread.prototype.unpin = function() {
      this.isPinned = false;
      if (this.catalogView) {
        return $.rmClass(this.catalogView.nodes.root, 'pinned');
      }
    };

    Thread.prototype.hide = function() {
      var button;
      if (this.isHidden) {
        return;
      }
      this.isHidden = true;
      if (button = $('.hide-post-button', this.OP.nodes.root)) {
        return $.replace(button, PostHiding.makeButton(false));
      }
    };

    Thread.prototype.show = function() {
      var button;
      if (!this.isHidden) {
        return;
      }
      this.isHidden = false;
      if (button = $('.show-post-button', this.OP.nodes.root)) {
        return $.replace(button, PostHiding.makeButton(true));
      }
    };

    Thread.prototype.kill = function() {
      return this.isDead = true;
    };

    Thread.prototype.collect = function() {
      var post, postID, _ref;
      _ref = this.posts;
      for (postID in _ref) {
        post = _ref[postID];
        post.collect();
      }
      delete g.threads[this.fullID];
      return delete this.board.threads[this];
    };

    return Thread;

  })();

  CatalogThread = (function() {
    CatalogThread.callbacks = [];

    CatalogThread.prototype.toString = function() {
      return this.ID;
    };

    function CatalogThread(root, thread) {
      this.thread = thread;
      this.ID = this.thread.ID;
      this.board = this.thread.board;
      this.nodes = {
        root: root,
        thumb: $('.thumb', root),
        icons: $('.thread-icons', root),
        postCount: $('.post-count', root),
        fileCount: $('.file-count', root),
        pageCount: $('.page-count', root)
      };
      this.thread.catalogView = this;
    }

    return CatalogThread;

  })();

  Post = (function() {
    Post.callbacks = [];

    Post.prototype.toString = function() {
      return this.ID;
    };

    function Post(root, thread, board, that) {
      var capcode, date, email, flag, info, name, post, subject, tripcode, uniqueID;
      this.thread = thread;
      this.board = board;
      if (that == null) {
        that = {};
      }
      this.ID = +root.id.slice(2);
      this.fullID = "" + this.board + "." + this.ID;
      post = $('.post', root);
      info = $('.postInfo', post);
      if (that.isOriginalMarkup) {
        this.cleanup(root, post);
      }
      root.dataset.fullID = this.fullID;
      this.nodes = {
        root: root,
        post: post,
        info: info,
        comment: $('.postMessage', post),
        quotelinks: [],
        backlinks: info.getElementsByClassName('backlink')
      };
      if (!(this.isReply = $.hasClass(post, 'reply'))) {
        this.thread.OP = this;
        this.thread.isSticky = !!$('.stickyIcon', info);
        this.thread.isClosed = !!$('.closedIcon', info);
      }
      this.info = {};
      if (subject = $('.subject', info)) {
        this.nodes.subject = subject;
        this.info.subject = subject.textContent;
      }
      if (name = $('.name', info)) {
        this.nodes.name = name;
        this.info.name = name.textContent;
      }
      if (email = $('.useremail', info)) {
        this.nodes.email = email;
        this.info.email = decodeURIComponent(email.href.slice(7));
      }
      if (tripcode = $('.postertrip', info)) {
        this.nodes.tripcode = tripcode;
        this.info.tripcode = tripcode.textContent;
      }
      if (uniqueID = $('.posteruid', info)) {
        this.nodes.uniqueID = uniqueID;
        this.info.uniqueID = uniqueID.firstElementChild.textContent;
      }
      if (capcode = $('.capcode.hand', info)) {
        this.nodes.capcode = capcode;
        this.info.capcode = capcode.textContent.replace('## ', '');
      }
      if (flag = $('.flag, .countryFlag', info)) {
        this.nodes.flag = flag;
        this.info.flag = flag.title;
      }
      if (date = $('.dateTime', info)) {
        this.nodes.date = date;
        this.info.date = new Date(date.dataset.utc * 1000);
      }
      this.parseComment();
      this.parseQuotes();
      this.parseFile(that);
      this.labels = [];
      this.highlights = [];
      this.isDead = false;
      this.isHidden = false;
      this.clones = [];
      g.posts[this.fullID] = thread.posts[this] = board.posts[this] = this;
      if (that.isArchived) {
        this.kill();
      }
    }

    Post.prototype.parseComment = function() {
      var bq, i, node, nodes, text, _i, _j, _len, _ref, _ref1;
      this.nodes.comment.normalize();
      bq = this.nodes.comment.cloneNode(true);
      _ref = $$('.abbr, .exif, b', bq);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        $.rm(node);
      }
      text = [];
      nodes = d.evaluate('.//br|.//text()', bq, null, 7, null);
      for (i = _j = 0, _ref1 = nodes.snapshotLength; _j < _ref1; i = _j += 1) {
        text.push(nodes.snapshotItem(i).data || '\n');
      }
      return this.info.comment = text.join('').trim().replace(/\s+$/gm, '');
    };

    Post.prototype.parseQuotes = function() {
      var quotelink, _i, _len, _ref;
      this.quotes = [];
      _ref = $$('.quotelink', this.nodes.comment);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        this.parseQuote(quotelink);
      }
    };

    Post.prototype.parseQuote = function(quotelink) {
      var fullID, match;
      if (!(match = quotelink.href.match(/boards\.4chan\.org\/([^\/]+)\/thread\/\d+.*\#p(\d+)$/))) {
        return;
      }
      this.nodes.quotelinks.push(quotelink);
      if (this.isClone) {
        return;
      }
      fullID = "" + match[1] + "." + match[2];
      if (__indexOf.call(this.quotes, fullID) < 0) {
        return this.quotes.push(fullID);
      }
    };

    Post.prototype.parseFile = function(that) {
      var anchor, fileEl, fileText, nameNode, size, thumb, unit;
      if (!((fileEl = $('.file', this.nodes.post)) && (thumb = $('img[data-md5]', fileEl)))) {
        return;
      }
      anchor = thumb.parentNode;
      fileText = fileEl.firstElementChild;
      this.file = {
        text: fileText,
        thumb: thumb,
        URL: anchor.href,
        size: thumb.alt.match(/[\d.]+\s\w+/)[0],
        MD5: thumb.dataset.md5,
        isSpoiler: $.hasClass(anchor, 'imgspoiler')
      };
      size = +this.file.size.match(/[\d.]+/)[0];
      unit = ['B', 'KB', 'MB', 'GB'].indexOf(this.file.size.match(/\w+$/)[0]);
      while (unit-- > 0) {
        size *= 1024;
      }
      this.file.sizeInBytes = size;
      this.file.thumbURL = that.isArchived ? thumb.src : "" + location.protocol + "//t.4cdn.org/" + this.board + "/" + (this.file.URL.match(/(\d+)\./)[1]) + "s.jpg";
      this.file.name = !this.file.isSpoiler && (nameNode = $('a', fileText)) ? nameNode.title || nameNode.textContent : fileText.title;
      this.file.isImage = /(jpg|png|gif)$/i.test(this.file.name);
      this.file.isVideo = /webm$/i.test(this.file.name);
      if (this.file.isImage || this.file.isVideo) {
        return this.file.dimensions = fileText.childNodes[2].data.match(/\d+x\d+/)[0];
      }
    };

    Post.prototype.cleanup = function(root, post) {
      var node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = $$('.mobile', root);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        $.rm(node);
      }
      _ref1 = $$('[id]:not(.exif)', post);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        node.removeAttribute('id');
      }
      _ref2 = $$('.desktop', root);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        node = _ref2[_k];
        $.rmClass(node, 'desktop');
      }
    };

    Post.prototype.getNameBlock = function() {
      if (Conf['Anonymize']) {
        return 'Anonymous';
      } else {
        return $('.nameBlock', this.nodes.info).textContent.trim();
      }
    };

    Post.prototype.hide = function(label, makeStub, hideRecursively) {
      var quotelink, _i, _len, _ref;
      if (makeStub == null) {
        makeStub = Conf['Stubs'];
      }
      if (hideRecursively == null) {
        hideRecursively = Conf['Recursive Hiding'];
      }
      if (__indexOf.call(this.labels, label) < 0) {
        this.labels.push(label);
      }
      if (this.isHidden) {
        return;
      }
      this.isHidden = true;
      _ref = Get.allQuotelinksLinkingTo(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        $.addClass(quotelink, 'filtered');
      }
      if (hideRecursively) {
        label = "Recursively hidden for quoting No." + this;
        Recursive.apply('hide', this, label, makeStub, true);
        Recursive.add('hide', this, label, makeStub, true);
      }
      if (!this.isReply) {
        this.thread.hide();
        return;
      }
      if (!makeStub) {
        this.nodes.root.hidden = true;
        return;
      }
      this.nodes.post.hidden = true;
      this.nodes.post.previousElementSibling.hidden = true;
      this.nodes.stub = $.el('div', {
        className: 'stub'
      });
      $.add(this.nodes.stub, [PostHiding.makeButton(false), $.tn(" " + (this.getNameBlock()))]);
      if (Conf['Menu']) {
        $.add(this.nodes.stub, Menu.makeButton());
      }
      return $.prepend(this.nodes.root, this.nodes.stub);
    };

    Post.prototype.show = function(showRecursively) {
      var quotelink, _i, _len, _ref;
      if (showRecursively == null) {
        showRecursively = Conf['Recursive Hiding'];
      }
      if (!this.isHidden) {
        return;
      }
      this.isHidden = false;
      this.labels = this.labels.filter(function(label) {
        return !/^(Manually hidden|Recursively hidden|Hidden by)/.test(label);
      });
      _ref = Get.allQuotelinksLinkingTo(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        quotelink = _ref[_i];
        $.rmClass(quotelink, 'filtered');
      }
      if (showRecursively) {
        Recursive.apply('show', this, true);
        Recursive.rm('hide', this);
      }
      if (!this.isReply) {
        this.thread.show();
        return;
      }
      if (!this.nodes.stub) {
        this.nodes.root.hidden = false;
        return;
      }
      this.nodes.post.hidden = false;
      this.nodes.post.previousElementSibling.hidden = false;
      $.rm(this.nodes.stub);
      return delete this.nodes.stub;
    };

    Post.prototype.highlight = function(label, highlight, top) {
      this.labels.push(label);
      if (__indexOf.call(this.highlights, highlight) < 0) {
        this.highlights.push(highlight);
        $.addClass(this.nodes.root, highlight);
      }
      if (!this.isReply && top) {
        return this.thread.isOnTop = true;
      }
    };

    Post.prototype.kill = function(file) {
      var clone, quotelink, strong, _i, _j, _len, _len1, _ref, _ref1;
      if (file) {
        if (this.file.isDead) {
          return;
        }
        this.file.isDead = true;
        $.addClass(this.nodes.root, 'deleted-file');
      } else {
        if (this.isDead) {
          return;
        }
        this.isDead = true;
        $.addClass(this.nodes.root, 'deleted-post');
      }
      if (!(strong = $('strong.warning', this.nodes.info))) {
        strong = $.el('strong', {
          className: 'warning',
          textContent: this.isReply ? '[Deleted]' : '[Dead]'
        });
        $.after($('input', this.nodes.info), strong);
      }
      strong.textContent = file ? '[File deleted]' : this.isReply ? '[Deleted]' : '[Dead]';
      if (this.isClone) {
        return;
      }
      _ref = this.clones;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clone = _ref[_i];
        clone.kill(file);
      }
      if (file) {
        return;
      }
      _ref1 = Get.allQuotelinksLinkingTo(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quotelink = _ref1[_j];
        if (!(!$.hasClass(quotelink, 'deadlink'))) {
          continue;
        }
        $.addClass(quotelink, 'deadlink');
        if (!Conf['Quote Markers']) {
          continue;
        }
        QuoteMarkers.parseQuotelink(Get.postFromNode(quotelink), quotelink, true);
      }
    };

    Post.prototype.resurrect = function() {
      var clone, quotelink, strong, _i, _j, _len, _len1, _ref, _ref1;
      delete this.isDead;
      $.rmClass(this.nodes.root, 'deleted-post');
      strong = $('strong.warning', this.nodes.info);
      if (this.file && this.file.isDead) {
        strong.textContent = '[File deleted]';
      } else {
        $.rm(strong);
      }
      if (this.isClone) {
        return;
      }
      _ref = this.clones;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clone = _ref[_i];
        clone.resurrect();
      }
      _ref1 = Get.allQuotelinksLinkingTo(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quotelink = _ref1[_j];
        if (!($.hasClass(quotelink, 'deadlink'))) {
          continue;
        }
        $.rmClass(quotelink, 'deadlink');
        if (!Conf['Quote Markers']) {
          continue;
        }
        QuoteMarkers.parseQuotelink(Get.postFromNode(quotelink), quotelink, true);
      }
    };

    Post.prototype.collect = function() {
      this.kill();
      delete g.posts[this.fullID];
      delete this.thread.posts[this];
      return delete this.board.posts[this];
    };

    Post.prototype.addClone = function(context) {
      return new Clone(this, context);
    };

    Post.prototype.rmClone = function(index) {
      var clone, _i, _len, _ref;
      this.clones.splice(index, 1);
      _ref = this.clones.slice(index);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clone = _ref[_i];
        clone.nodes.root.dataset.clone = index++;
      }
    };

    return Post;

  })();

  Clone = (function(_super) {
    __extends(Clone, _super);

    function Clone(origin, context) {
      var file, index, info, inline, inlined, key, nodes, post, root, val, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      this.origin = origin;
      this.context = context;
      _ref = ['ID', 'fullID', 'board', 'thread', 'info', 'quotes', 'isReply'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        this[key] = origin[key];
      }
      nodes = origin.nodes;
      root = nodes.root.cloneNode(true);
      post = $('.post', root);
      info = $('.postInfo', post);
      this.nodes = {
        root: root,
        post: post,
        info: info,
        comment: $('.postMessage', post),
        quotelinks: [],
        backlinks: info.getElementsByClassName('backlink')
      };
      _ref1 = $$('.inline', post);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        inline = _ref1[_j];
        $.rm(inline);
      }
      _ref2 = $$('.inlined', post);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        inlined = _ref2[_k];
        $.rmClass(inlined, 'inlined');
      }
      root.hidden = post.hidden = false;
      $.rmClass(root, 'forwarded');
      $.rmClass(post, 'highlight');
      if (nodes.subject) {
        this.nodes.subject = $('.subject', info);
      }
      if (nodes.name) {
        this.nodes.name = $('.name', info);
      }
      if (nodes.email) {
        this.nodes.email = $('.useremail', info);
      }
      if (nodes.tripcode) {
        this.nodes.tripcode = $('.postertrip', info);
      }
      if (nodes.uniqueID) {
        this.nodes.uniqueID = $('.posteruid', info);
      }
      if (nodes.capcode) {
        this.nodes.capcode = $('.capcode', info);
      }
      if (nodes.flag) {
        this.nodes.flag = $('.countryFlag', info);
      }
      if (nodes.date) {
        this.nodes.date = $('.dateTime', info);
      }
      this.parseQuotes();
      if (origin.file) {
        this.file = {};
        _ref3 = origin.file;
        for (key in _ref3) {
          val = _ref3[key];
          this.file[key] = val;
        }
        file = $('.file', post);
        this.file.text = file.firstElementChild;
        this.file.thumb = $('img[data-md5]', file);
        this.file.fullImage = $('.full-image', file);
      }
      if (origin.isDead) {
        this.isDead = true;
      }
      this.isClone = true;
      index = origin.clones.push(this) - 1;
      root.dataset.clone = index;
    }

    return Clone;

  })(Post);

  Embed = (function() {
    function Embed(post, anchor, service, result) {
      this.post = post;
      this.anchor = anchor;
      this.service = service;
      this.result = result;
      if (this.post.embeds) {
        this.post.embeds.push(this);
      } else {
        this.post.embeds = [this];
      }
      if (this.post.isClone) {
        this.origin = this.post.origin.embeds[this.post.embeds.length - 1];
        this.rmToggle();
        if (this.origin.isEmbedded) {
          this.rmEmbed();
        }
      }
      this.addToggle();
    }

    Embed.prototype.addToggle = function() {
      var next;
      next = this.anchor.nextSibling;
      if (next != null ? next.data : void 0) {
        next.data = next.data.replace(/^((\u0020+)?[\[(]embed[)\]](\u0020+)?)+/i, '');
      }
      this.toggle = $.el('a', {
        textContent: 'Embed',
        href: 'javascript:;'
      });
      this.span = $.el('span');
      $.add(this.span, [$.tn('\u0020['), this.toggle, $.tn(']')]);
      return $.after(this.anchor, this.span);
    };

    Embed.prototype.rmToggle = function() {
      return $.rm(this.anchor.nextSibling);
    };

    Embed.prototype.rmEmbed = function() {
      var media;
      media = this.anchor.nextSibling.nextSibling;
      if (media.className !== 'media-embed') {
        media = this.anchor.nextSibling;
        if (media.className !== 'media-embed') {
          return;
        }
      }
      $.rm(media);
      return this.isEmbedded = false;
    };

    return Embed;

  })();

  DataBoard = (function() {
    DataBoard.keys = ['pinnedThreads', 'hiddenPosts', 'lastReadPosts', 'yourPosts', 'watchedThreads'];

    function DataBoard(key, sync, dontClean) {
      var init;
      this.key = key;
      this.onSync = __bind(this.onSync, this);
      this.data = Conf[key];
      $.sync(key, this.onSync);
      if (!dontClean) {
        this.clean();
      }
      if (!sync) {
        return;
      }
      init = (function(_this) {
        return function() {
          $.off(d, '4chanXInitFinished', init);
          return _this.sync = sync;
        };
      })(this);
      $.on(d, '4chanXInitFinished', init);
    }

    DataBoard.prototype.save = function() {
      return $.set(this.key, this.data);
    };

    DataBoard.prototype["delete"] = function(_arg) {
      var boardID, postID, threadID;
      boardID = _arg.boardID, threadID = _arg.threadID, postID = _arg.postID;
      if (postID) {
        delete this.data.boards[boardID][threadID][postID];
        this.deleteIfEmpty({
          boardID: boardID,
          threadID: threadID
        });
      } else if (threadID) {
        delete this.data.boards[boardID][threadID];
        this.deleteIfEmpty({
          boardID: boardID
        });
      } else {
        delete this.data.boards[boardID];
      }
      return this.save();
    };

    DataBoard.prototype.deleteIfEmpty = function(_arg) {
      var boardID, threadID;
      boardID = _arg.boardID, threadID = _arg.threadID;
      if (threadID) {
        if (!Object.keys(this.data.boards[boardID][threadID]).length) {
          delete this.data.boards[boardID][threadID];
          return this.deleteIfEmpty({
            boardID: boardID
          });
        }
      } else if (!Object.keys(this.data.boards[boardID]).length) {
        return delete this.data.boards[boardID];
      }
    };

    DataBoard.prototype.set = function(_arg) {
      var boardID, postID, threadID, val, _base, _base1, _base2;
      boardID = _arg.boardID, threadID = _arg.threadID, postID = _arg.postID, val = _arg.val;
      if (postID !== void 0) {
        ((_base = ((_base1 = this.data.boards)[boardID] || (_base1[boardID] = {})))[threadID] || (_base[threadID] = {}))[postID] = val;
      } else if (threadID !== void 0) {
        ((_base2 = this.data.boards)[boardID] || (_base2[boardID] = {}))[threadID] = val;
      } else {
        this.data.boards[boardID] = val;
      }
      return this.save();
    };

    DataBoard.prototype.get = function(_arg) {
      var ID, board, boardID, defaultValue, postID, thread, threadID, val, _i, _len;
      boardID = _arg.boardID, threadID = _arg.threadID, postID = _arg.postID, defaultValue = _arg.defaultValue;
      if (board = this.data.boards[boardID]) {
        if (!threadID) {
          if (postID) {
            for (thread = _i = 0, _len = board.length; _i < _len; thread = ++_i) {
              ID = board[thread];
              if (postID in thread) {
                val = thread[postID];
                break;
              }
            }
          } else {
            val = board;
          }
        } else if (thread = board[threadID]) {
          val = postID ? thread[postID] : thread;
        }
      }
      return val || defaultValue;
    };

    DataBoard.prototype.clean = function() {
      var boardID, now;
      now = Date.now();
      if ((this.data.lastChecked || 0) > now - 2 * $.HOUR) {
        return;
      }
      for (boardID in this.data.boards) {
        this.deleteIfEmpty({
          boardID: boardID
        });
        if (boardID in this.data.boards) {
          this.ajaxClean(boardID);
        }
      }
      this.data.lastChecked = now;
      return this.save();
    };

    DataBoard.prototype.ajaxClean = function(boardID) {
      return $.cache("//a.4cdn.org/" + boardID + "/threads.json", (function(_this) {
        return function(e) {
          var board, count, page, thread, threads, _i, _j, _len, _len1, _ref, _ref1;
          if (e.target.status !== 200) {
            if (e.target.status === 404) {
              _this["delete"]({
                boardID: boardID
              });
            }
            return;
          }
          board = _this.data.boards[boardID];
          threads = {};
          _ref = e.target.response;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            page = _ref[_i];
            _ref1 = page.threads;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              thread = _ref1[_j];
              if (thread.no in board) {
                threads[thread.no] = board[thread.no];
              }
            }
          }
          count = Object.keys(threads).length;
          if (count === Object.keys(board).length) {
            return;
          }
          if (count) {
            return _this.set({
              boardID: boardID,
              val: threads
            });
          } else {
            return _this["delete"]({
              boardID: boardID
            });
          }
        };
      })(this));
    };

    DataBoard.prototype.onSync = function(data) {
      this.data = data || {
        boards: {}
      };
      return typeof this.sync === "function" ? this.sync() : void 0;
    };

    return DataBoard;

  })();

  Main = {
    init: function() {
      var db, flatten, pathname, _i, _len, _ref, _ref1;
      pathname = location.pathname.split('/');
      g.BOARD = new Board(pathname[1]);
      if ((_ref = g.BOARD.ID) === 'z' || _ref === 'fk') {
        return;
      }
      g.VIEW = (function() {
        switch (pathname[2]) {
          case 'thread':
          case 'catalog':
            return pathname[2];
          default:
            return 'index';
        }
      })();
      if (g.VIEW === 'catalog') {
        $.ready(Index.addCatalogSwitch);
        return;
      }
      if (g.VIEW === 'thread') {
        g.THREADID = +pathname[3];
        if (pathname[4] != null) {
          g.SLUG = pathname[4];
        }
      }
      flatten = function(parent, obj) {
        var key, val;
        if (obj instanceof Array) {
          Conf[parent] = obj[0];
        } else if (typeof obj === 'object') {
          for (key in obj) {
            val = obj[key];
            flatten(key, val);
          }
        } else {
          Conf[parent] = obj;
        }
      };
      flatten(null, Config);
      _ref1 = DataBoard.keys;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        db = _ref1[_i];
        Conf[db] = {
          boards: {}
        };
      }
      Conf['selectedArchives'] = {};
      Conf['archives'] = Redirect.archives;
      $.get(Conf, function(items) {
        $.extend(Conf, items);
        return Main.initFeatures();
      });
      return $.on(d, '4chanMainInit', Main.initStyle);
    },
    initFeatures: function() {
      var initFeature;
      switch (location.hostname) {
        case 'a.4cdn.org':
          return;
        case 'sys.4chan.org':
          Report.init();
          return;
        case 'i.4cdn.org':
          $.ready(function() {
            var URL, pathname;
            if (Conf['404 Redirect'] && d.title === '4chan - 404 Not Found') {
              Redirect.init();
              pathname = location.pathname.split('/');
              URL = Redirect.to('file', {
                boardID: g.BOARD.ID,
                filename: pathname[pathname.length - 1]
              });
              if (URL) {
                return location.replace(URL);
              }
            }
          });
          return;
      }
      initFeature = function(name, module) {
        var err;
        try {
          return module.init();
        } catch (_error) {
          err = _error;
          return Main.handleErrors({
            message: "\"" + name + "\" initialization crashed.",
            error: err
          });
        }
      };
      initFeature('Polyfill', Polyfill);
      initFeature('Header', Header);
      initFeature('Settings', Settings);
      initFeature('Index Generator', Index);
      initFeature('Announcement Hiding', PSAHiding);
      initFeature('Fourchan thingies', Fourchan);
      initFeature('Custom CSS', CustomCSS);
      initFeature('Redirect', Redirect);
      initFeature('Resurrect Quotes', Quotify);
      initFeature('Filter', Filter);
      initFeature('Post Hiding', PostHiding);
      initFeature('Recursive', Recursive);
      initFeature('Strike-through Quotes', QuoteStrikeThrough);
      initFeature('Quick Reply', QR);
      initFeature('Menu', Menu);
      initFeature('Index Generator (Menu)', Index.menu);
      initFeature('Report Link', ReportLink);
      initFeature('Post Hiding (Menu)', PostHiding.menu);
      initFeature('Delete Link', DeleteLink);
      initFeature('Filter (Menu)', Filter.menu);
      initFeature('Download Link', DownloadLink);
      initFeature('Labels list', Labels);
      initFeature('Archive Link', ArchiveLink);
      initFeature('Quote Inlining', QuoteInline);
      initFeature('Quote Previewing', QuotePreview);
      initFeature('Quote Backlinks', QuoteBacklink);
      initFeature('Quote Markers', QuoteMarkers);
      initFeature('Anonymize', Anonymize);
      initFeature('Color User IDs', IDColor);
      initFeature('Time Formatting', Time);
      initFeature('Relative Post Dates', RelativeDates);
      initFeature('File Info Formatting', FileInfo);
      initFeature('Sauce', Sauce);
      initFeature('Image Expansion', ImageExpand);
      initFeature('Image Expansion (Menu)', ImageExpand.menu);
      initFeature('Reveal Spoilers', RevealSpoilers);
      initFeature('Replace Image', ImageReplace);
      initFeature('Replace Loaded Image', ImageReplaceLoaded);
      initFeature('Image Hover', ImageHover);
      initFeature('Thread Expansion', ExpandThread);
      initFeature('Thread Excerpt', ThreadExcerpt);
      initFeature('Favicon', Favicon);
      initFeature('Unread', Unread);
      initFeature('Thread Stats', ThreadStats);
      initFeature('Thread Updater', ThreadUpdater);
      initFeature('Thread Watcher', ThreadWatcher);
      initFeature('Thread Watcher (Menu)', ThreadWatcher.menu);
      initFeature('Index Navigation', Nav);
      initFeature('Keybinds', Keybinds);
      initFeature('Show Dice Roll', Dice);
      initFeature('Linkify', Linkify);
      initFeature('Embedding', Embedding);
      initFeature('Link Titles', LinkTitles);
      initFeature('Cover Preview', CoverPreview);
      return $.ready(Main.initReady);
    },
    initStyle: function() {
      var mainStyleSheet, setStyle, style, styleSheets, _ref;
      $.off(d, '4chanMainInit', Main.initStyle);
      if (!Main.isThisPageLegit() || $.hasClass(doc, 'fourchan-x')) {
        return;
      }
      if ((_ref = $('link[href*=mobile]', d.head)) != null) {
        _ref.disabled = true;
      }
      $.addClass(doc, 'fourchan-x', 'gecko');
      $.addStyle(Main.css);
      style = 'yotsuba-b';
      mainStyleSheet = $('link[title=switch]', d.head);
      styleSheets = $$('link[rel="alternate stylesheet"]', d.head);
      setStyle = function() {
        var styleSheet, _i, _len;
        $.rmClass(doc, style);
        for (_i = 0, _len = styleSheets.length; _i < _len; _i++) {
          styleSheet = styleSheets[_i];
          if (styleSheet.href === mainStyleSheet.href) {
            style = styleSheet.title.toLowerCase().replace('new', '').trim().replace(/\s+/g, '-');
            break;
          }
        }
        return $.addClass(doc, style);
      };
      setStyle();
      if (!mainStyleSheet) {
        return;
      }
      return new MutationObserver(setStyle).observe(mainStyleSheet, {
        attributes: true,
        attributeFilter: ['href']
      });
    },
    initReady: function() {
      var GMver, err, errors, href, i, postRoot, posts, test, thread, threadRoot, v, _i, _j, _len, _len1, _ref, _ref1;
      if (d.title === '4chan - 404 Not Found') {
        if (Conf['404 Redirect'] && g.VIEW === 'thread') {
          href = Redirect.to('thread', {
            boardID: g.BOARD.ID,
            threadID: g.THREADID,
            postID: +location.hash.match(/\d+/)
          });
          location.replace(href || ("/" + g.BOARD + "/"));
        }
        return;
      }
      Main.initStyle();
      if (g.VIEW === 'thread' && (threadRoot = $('.thread'))) {
        thread = new Thread(+threadRoot.id.slice(1), g.BOARD);
        posts = [];
        _ref = $$('.thread > .postContainer', threadRoot);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          postRoot = _ref[_i];
          try {
            posts.push(new Post(postRoot, thread, g.BOARD, {
              isOriginalMarkup: true
            }));
          } catch (_error) {
            err = _error;
            if (!errors) {
              errors = [];
            }
            errors.push({
              message: "Parsing of Post No." + (postRoot.id.match(/\d+/)) + " failed. Post will be skipped.",
              error: err
            });
          }
        }
        if (errors) {
          Main.handleErrors(errors);
        }
        Main.callbackNodes(Thread, [thread]);
        Main.callbackNodes(Post, posts);
      }
      if ($.hasClass(d.body, 'fourchan_x')) {
        alert('4chan X v2 detected: Disable it or v3 will break.');
      }
      test = $.el('span');
      test.classList.add('a', 'b');
      if (test.className !== 'a b') {
        new Notice('warning', "Your version of Firefox is outdated (v26 minimum) and 4chan X may not operate correctly.", 30);
      }
      GMver = GM_info.version.split('.');
      _ref1 = "1.14".split('.');
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        v = _ref1[i];
        if (v < GMver[i]) {
          break;
        }
        if (v === GMver[i]) {
          continue;
        }
        new Notice('warning', "Your version of Greasemonkey is outdated (v" + GM_info.version + " instead of v1.14 minimum) and 4chan X may not operate correctly.", 30);
        break;
      }
      try {
        localStorage.getItem('4chan-settings');
      } catch (_error) {
        err = _error;
        new Notice('warning', 'Cookies need to be enabled on 4chan for 4chan X to operate properly.', 30);
      }
      $.event('4chanXInitFinished');
      return $.get('previousversion', null, function(_arg) {
        var changelog, el, previousversion;
        previousversion = _arg.previousversion;
        if (previousversion === g.VERSION) {
          return;
        }
        if (previousversion) {
          changelog = 'https://github.com/ihavenoface/4chan-x/blob/v3/CHANGELOG.md';
          el = $.el('span', {
            innerHTML: "4chan X has been updated to <a href='" + changelog + "' target=_blank>version " + g.VERSION + "</a>."
          });
          new Notice('info', el, 15);
        } else {
          Settings.open();
        }
        return $.set('previousversion', g.VERSION);
      });
    },
    callbackNodes: function(klass, nodes) {
      var callback, err, errors, i, len, node, _i, _j, _len, _ref;
      len = nodes.length;
      _ref = klass.callbacks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        for (i = _j = 0; _j < len; i = _j += 1) {
          node = nodes[i];
          try {
            callback.cb.call(node);
          } catch (_error) {
            err = _error;
            if (!errors) {
              errors = [];
            }
            errors.push({
              message: "\"" + callback.name + "\" crashed on " + klass.name + " No." + node + " (/" + node.board + "/).",
              error: err
            });
          }
        }
      }
      if (errors) {
        return Main.handleErrors(errors);
      }
    },
    handleErrors: function(errors) {
      var div, error, logs, _i, _len;
      if (!(errors instanceof Array)) {
        error = errors;
      } else if (errors.length === 1) {
        error = errors[0];
      }
      if (error) {
        new Notice('error', Main.parseError(error), 15);
        return;
      }
      div = $.el('div', {
        innerHTML: "" + errors.length + " errors occurred. [<a href=javascript:;>show</a>]"
      });
      $.on(div.lastElementChild, 'click', function() {
        var _ref;
        return _ref = this.textContent === 'show' ? ['hide', false] : ['show', true], this.textContent = _ref[0], logs.hidden = _ref[1], _ref;
      });
      logs = $.el('div', {
        hidden: true
      });
      for (_i = 0, _len = errors.length; _i < _len; _i++) {
        error = errors[_i];
        $.add(logs, Main.parseError(error));
      }
      return new Notice('error', [div, logs], 30);
    },
    parseError: function(data) {
      var error, message;
      c.error(data.message, data.error.stack);
      message = $.el('div', {
        textContent: data.message
      });
      error = $.el('div', {
        textContent: data.error
      });
      return [message, error];
    },
    isThisPageLegit: function() {
      var _ref;
      if (!('thisPageIsLegit' in Main)) {
        Main.thisPageIsLegit = location.hostname === 'boards.4chan.org' && !$('link[href*="favicon-status.ico"]', d.head) && ((_ref = d.title) !== '4chan - Temporarily Offline' && _ref !== '4chan - Error' && _ref !== '504 Gateway Time-out');
      }
      return Main.thisPageIsLegit;
    },
    css: " @font-face {\n   font-family: 'FontAwesome';\n   src: url('data:application/font-woff;base64,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') format('woff');\n   font-weight: normal;\n   font-style: normal;\n }\n /*!\n*  Font Awesome 4.2.0 by @davegandy - http://fontawesome.io - @fontawesome\n*  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n*/.fa{display:inline-block;font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em;text-align:center}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:solid .08em #eee;border-radius:.1em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1);-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2);-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=3);-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);-webkit-transform:scale(-1, 1);-ms-transform:scale(-1, 1);transform:scale(-1, 1)}.fa-flip-vertical{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);-webkit-transform:scale(1, -1);-ms-transform:scale(1, -1);transform:scale(1, -1)}:root .fa-rotate-90,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-flip-horizontal,:root .fa-flip-vertical{filter:none}.fa-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\\f000\"}.fa-music:before{content:\"\\f001\"}.fa-search:before{content:\"\\f002\"}.fa-envelope-o:before{content:\"\\f003\"}.fa-heart:before{content:\"\\f004\"}.fa-star:before{content:\"\\f005\"}.fa-star-o:before{content:\"\\f006\"}.fa-user:before{content:\"\\f007\"}.fa-film:before{content:\"\\f008\"}.fa-th-large:before{content:\"\\f009\"}.fa-th:before{content:\"\\f00a\"}.fa-th-list:before{content:\"\\f00b\"}.fa-check:before{content:\"\\f00c\"}.fa-remove:before,.fa-close:before,.fa-times:before{content:\"\\f00d\"}.fa-search-plus:before{content:\"\\f00e\"}.fa-search-minus:before{content:\"\\f010\"}.fa-power-off:before{content:\"\\f011\"}.fa-signal:before{content:\"\\f012\"}.fa-gear:before,.fa-cog:before{content:\"\\f013\"}.fa-trash-o:before{content:\"\\f014\"}.fa-home:before{content:\"\\f015\"}.fa-file-o:before{content:\"\\f016\"}.fa-clock-o:before{content:\"\\f017\"}.fa-road:before{content:\"\\f018\"}.fa-download:before{content:\"\\f019\"}.fa-arrow-circle-o-down:before{content:\"\\f01a\"}.fa-arrow-circle-o-up:before{content:\"\\f01b\"}.fa-inbox:before{content:\"\\f01c\"}.fa-play-circle-o:before{content:\"\\f01d\"}.fa-rotate-right:before,.fa-repeat:before{content:\"\\f01e\"}.fa-refresh:before{content:\"\\f021\"}.fa-list-alt:before{content:\"\\f022\"}.fa-lock:before{content:\"\\f023\"}.fa-flag:before{content:\"\\f024\"}.fa-headphones:before{content:\"\\f025\"}.fa-volume-off:before{content:\"\\f026\"}.fa-volume-down:before{content:\"\\f027\"}.fa-volume-up:before{content:\"\\f028\"}.fa-qrcode:before{content:\"\\f029\"}.fa-barcode:before{content:\"\\f02a\"}.fa-tag:before{content:\"\\f02b\"}.fa-tags:before{content:\"\\f02c\"}.fa-book:before{content:\"\\f02d\"}.fa-bookmark:before{content:\"\\f02e\"}.fa-print:before{content:\"\\f02f\"}.fa-camera:before{content:\"\\f030\"}.fa-font:before{content:\"\\f031\"}.fa-bold:before{content:\"\\f032\"}.fa-italic:before{content:\"\\f033\"}.fa-text-height:before{content:\"\\f034\"}.fa-text-width:before{content:\"\\f035\"}.fa-align-left:before{content:\"\\f036\"}.fa-align-center:before{content:\"\\f037\"}.fa-align-right:before{content:\"\\f038\"}.fa-align-justify:before{content:\"\\f039\"}.fa-list:before{content:\"\\f03a\"}.fa-dedent:before,.fa-outdent:before{content:\"\\f03b\"}.fa-indent:before{content:\"\\f03c\"}.fa-video-camera:before{content:\"\\f03d\"}.fa-photo:before,.fa-image:before,.fa-picture-o:before{content:\"\\f03e\"}.fa-pencil:before{content:\"\\f040\"}.fa-map-marker:before{content:\"\\f041\"}.fa-adjust:before{content:\"\\f042\"}.fa-tint:before{content:\"\\f043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\\f044\"}.fa-share-square-o:before{content:\"\\f045\"}.fa-check-square-o:before{content:\"\\f046\"}.fa-arrows:before{content:\"\\f047\"}.fa-step-backward:before{content:\"\\f048\"}.fa-fast-backward:before{content:\"\\f049\"}.fa-backward:before{content:\"\\f04a\"}.fa-play:before{content:\"\\f04b\"}.fa-pause:before{content:\"\\f04c\"}.fa-stop:before{content:\"\\f04d\"}.fa-forward:before{content:\"\\f04e\"}.fa-fast-forward:before{content:\"\\f050\"}.fa-step-forward:before{content:\"\\f051\"}.fa-eject:before{content:\"\\f052\"}.fa-chevron-left:before{content:\"\\f053\"}.fa-chevron-right:before{content:\"\\f054\"}.fa-plus-circle:before{content:\"\\f055\"}.fa-minus-circle:before{content:\"\\f056\"}.fa-times-circle:before{content:\"\\f057\"}.fa-check-circle:before{content:\"\\f058\"}.fa-question-circle:before{content:\"\\f059\"}.fa-info-circle:before{content:\"\\f05a\"}.fa-crosshairs:before{content:\"\\f05b\"}.fa-times-circle-o:before{content:\"\\f05c\"}.fa-check-circle-o:before{content:\"\\f05d\"}.fa-ban:before{content:\"\\f05e\"}.fa-arrow-left:before{content:\"\\f060\"}.fa-arrow-right:before{content:\"\\f061\"}.fa-arrow-up:before{content:\"\\f062\"}.fa-arrow-down:before{content:\"\\f063\"}.fa-mail-forward:before,.fa-share:before{content:\"\\f064\"}.fa-expand:before{content:\"\\f065\"}.fa-compress:before{content:\"\\f066\"}.fa-plus:before{content:\"\\f067\"}.fa-minus:before{content:\"\\f068\"}.fa-asterisk:before{content:\"\\f069\"}.fa-exclamation-circle:before{content:\"\\f06a\"}.fa-gift:before{content:\"\\f06b\"}.fa-leaf:before{content:\"\\f06c\"}.fa-fire:before{content:\"\\f06d\"}.fa-eye:before{content:\"\\f06e\"}.fa-eye-slash:before{content:\"\\f070\"}.fa-warning:before,.fa-exclamation-triangle:before{content:\"\\f071\"}.fa-plane:before{content:\"\\f072\"}.fa-calendar:before{content:\"\\f073\"}.fa-random:before{content:\"\\f074\"}.fa-comment:before{content:\"\\f075\"}.fa-magnet:before{content:\"\\f076\"}.fa-chevron-up:before{content:\"\\f077\"}.fa-chevron-down:before{content:\"\\f078\"}.fa-retweet:before{content:\"\\f079\"}.fa-shopping-cart:before{content:\"\\f07a\"}.fa-folder:before{content:\"\\f07b\"}.fa-folder-open:before{content:\"\\f07c\"}.fa-arrows-v:before{content:\"\\f07d\"}.fa-arrows-h:before{content:\"\\f07e\"}.fa-bar-chart-o:before,.fa-bar-chart:before{content:\"\\f080\"}.fa-twitter-square:before{content:\"\\f081\"}.fa-facebook-square:before{content:\"\\f082\"}.fa-camera-retro:before{content:\"\\f083\"}.fa-key:before{content:\"\\f084\"}.fa-gears:before,.fa-cogs:before{content:\"\\f085\"}.fa-comments:before{content:\"\\f086\"}.fa-thumbs-o-up:before{content:\"\\f087\"}.fa-thumbs-o-down:before{content:\"\\f088\"}.fa-star-half:before{content:\"\\f089\"}.fa-heart-o:before{content:\"\\f08a\"}.fa-sign-out:before{content:\"\\f08b\"}.fa-linkedin-square:before{content:\"\\f08c\"}.fa-thumb-tack:before{content:\"\\f08d\"}.fa-external-link:before{content:\"\\f08e\"}.fa-sign-in:before{content:\"\\f090\"}.fa-trophy:before{content:\"\\f091\"}.fa-github-square:before{content:\"\\f092\"}.fa-upload:before{content:\"\\f093\"}.fa-lemon-o:before{content:\"\\f094\"}.fa-phone:before{content:\"\\f095\"}.fa-square-o:before{content:\"\\f096\"}.fa-bookmark-o:before{content:\"\\f097\"}.fa-phone-square:before{content:\"\\f098\"}.fa-twitter:before{content:\"\\f099\"}.fa-facebook:before{content:\"\\f09a\"}.fa-github:before{content:\"\\f09b\"}.fa-unlock:before{content:\"\\f09c\"}.fa-credit-card:before{content:\"\\f09d\"}.fa-rss:before{content:\"\\f09e\"}.fa-hdd-o:before{content:\"\\f0a0\"}.fa-bullhorn:before{content:\"\\f0a1\"}.fa-bell:before{content:\"\\f0f3\"}.fa-certificate:before{content:\"\\f0a3\"}.fa-hand-o-right:before{content:\"\\f0a4\"}.fa-hand-o-left:before{content:\"\\f0a5\"}.fa-hand-o-up:before{content:\"\\f0a6\"}.fa-hand-o-down:before{content:\"\\f0a7\"}.fa-arrow-circle-left:before{content:\"\\f0a8\"}.fa-arrow-circle-right:before{content:\"\\f0a9\"}.fa-arrow-circle-up:before{content:\"\\f0aa\"}.fa-arrow-circle-down:before{content:\"\\f0ab\"}.fa-globe:before{content:\"\\f0ac\"}.fa-wrench:before{content:\"\\f0ad\"}.fa-tasks:before{content:\"\\f0ae\"}.fa-filter:before{content:\"\\f0b0\"}.fa-briefcase:before{content:\"\\f0b1\"}.fa-arrows-alt:before{content:\"\\f0b2\"}.fa-group:before,.fa-users:before{content:\"\\f0c0\"}.fa-chain:before,.fa-link:before{content:\"\\f0c1\"}.fa-cloud:before{content:\"\\f0c2\"}.fa-flask:before{content:\"\\f0c3\"}.fa-cut:before,.fa-scissors:before{content:\"\\f0c4\"}.fa-copy:before,.fa-files-o:before{content:\"\\f0c5\"}.fa-paperclip:before{content:\"\\f0c6\"}.fa-save:before,.fa-floppy-o:before{content:\"\\f0c7\"}.fa-square:before{content:\"\\f0c8\"}.fa-navicon:before,.fa-reorder:before,.fa-bars:before{content:\"\\f0c9\"}.fa-list-ul:before{content:\"\\f0ca\"}.fa-list-ol:before{content:\"\\f0cb\"}.fa-strikethrough:before{content:\"\\f0cc\"}.fa-underline:before{content:\"\\f0cd\"}.fa-table:before{content:\"\\f0ce\"}.fa-magic:before{content:\"\\f0d0\"}.fa-truck:before{content:\"\\f0d1\"}.fa-pinterest:before{content:\"\\f0d2\"}.fa-pinterest-square:before{content:\"\\f0d3\"}.fa-google-plus-square:before{content:\"\\f0d4\"}.fa-google-plus:before{content:\"\\f0d5\"}.fa-money:before{content:\"\\f0d6\"}.fa-caret-down:before{content:\"\\f0d7\"}.fa-caret-up:before{content:\"\\f0d8\"}.fa-caret-left:before{content:\"\\f0d9\"}.fa-caret-right:before{content:\"\\f0da\"}.fa-columns:before{content:\"\\f0db\"}.fa-unsorted:before,.fa-sort:before{content:\"\\f0dc\"}.fa-sort-down:before,.fa-sort-desc:before{content:\"\\f0dd\"}.fa-sort-up:before,.fa-sort-asc:before{content:\"\\f0de\"}.fa-envelope:before{content:\"\\f0e0\"}.fa-linkedin:before{content:\"\\f0e1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\\f0e2\"}.fa-legal:before,.fa-gavel:before{content:\"\\f0e3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\\f0e4\"}.fa-comment-o:before{content:\"\\f0e5\"}.fa-comments-o:before{content:\"\\f0e6\"}.fa-flash:before,.fa-bolt:before{content:\"\\f0e7\"}.fa-sitemap:before{content:\"\\f0e8\"}.fa-umbrella:before{content:\"\\f0e9\"}.fa-paste:before,.fa-clipboard:before{content:\"\\f0ea\"}.fa-lightbulb-o:before{content:\"\\f0eb\"}.fa-exchange:before{content:\"\\f0ec\"}.fa-cloud-download:before{content:\"\\f0ed\"}.fa-cloud-upload:before{content:\"\\f0ee\"}.fa-user-md:before{content:\"\\f0f0\"}.fa-stethoscope:before{content:\"\\f0f1\"}.fa-suitcase:before{content:\"\\f0f2\"}.fa-bell-o:before{content:\"\\f0a2\"}.fa-coffee:before{content:\"\\f0f4\"}.fa-cutlery:before{content:\"\\f0f5\"}.fa-file-text-o:before{content:\"\\f0f6\"}.fa-building-o:before{content:\"\\f0f7\"}.fa-hospital-o:before{content:\"\\f0f8\"}.fa-ambulance:before{content:\"\\f0f9\"}.fa-medkit:before{content:\"\\f0fa\"}.fa-fighter-jet:before{content:\"\\f0fb\"}.fa-beer:before{content:\"\\f0fc\"}.fa-h-square:before{content:\"\\f0fd\"}.fa-plus-square:before{content:\"\\f0fe\"}.fa-angle-double-left:before{content:\"\\f100\"}.fa-angle-double-right:before{content:\"\\f101\"}.fa-angle-double-up:before{content:\"\\f102\"}.fa-angle-double-down:before{content:\"\\f103\"}.fa-angle-left:before{content:\"\\f104\"}.fa-angle-right:before{content:\"\\f105\"}.fa-angle-up:before{content:\"\\f106\"}.fa-angle-down:before{content:\"\\f107\"}.fa-desktop:before{content:\"\\f108\"}.fa-laptop:before{content:\"\\f109\"}.fa-tablet:before{content:\"\\f10a\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\\f10b\"}.fa-circle-o:before{content:\"\\f10c\"}.fa-quote-left:before{content:\"\\f10d\"}.fa-quote-right:before{content:\"\\f10e\"}.fa-spinner:before{content:\"\\f110\"}.fa-circle:before{content:\"\\f111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\\f112\"}.fa-github-alt:before{content:\"\\f113\"}.fa-folder-o:before{content:\"\\f114\"}.fa-folder-open-o:before{content:\"\\f115\"}.fa-smile-o:before{content:\"\\f118\"}.fa-frown-o:before{content:\"\\f119\"}.fa-meh-o:before{content:\"\\f11a\"}.fa-gamepad:before{content:\"\\f11b\"}.fa-keyboard-o:before{content:\"\\f11c\"}.fa-flag-o:before{content:\"\\f11d\"}.fa-flag-checkered:before{content:\"\\f11e\"}.fa-terminal:before{content:\"\\f120\"}.fa-code:before{content:\"\\f121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\\f122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\\f123\"}.fa-location-arrow:before{content:\"\\f124\"}.fa-crop:before{content:\"\\f125\"}.fa-code-fork:before{content:\"\\f126\"}.fa-unlink:before,.fa-chain-broken:before{content:\"\\f127\"}.fa-question:before{content:\"\\f128\"}.fa-info:before{content:\"\\f129\"}.fa-exclamation:before{content:\"\\f12a\"}.fa-superscript:before{content:\"\\f12b\"}.fa-subscript:before{content:\"\\f12c\"}.fa-eraser:before{content:\"\\f12d\"}.fa-puzzle-piece:before{content:\"\\f12e\"}.fa-microphone:before{content:\"\\f130\"}.fa-microphone-slash:before{content:\"\\f131\"}.fa-shield:before{content:\"\\f132\"}.fa-calendar-o:before{content:\"\\f133\"}.fa-fire-extinguisher:before{content:\"\\f134\"}.fa-rocket:before{content:\"\\f135\"}.fa-maxcdn:before{content:\"\\f136\"}.fa-chevron-circle-left:before{content:\"\\f137\"}.fa-chevron-circle-right:before{content:\"\\f138\"}.fa-chevron-circle-up:before{content:\"\\f139\"}.fa-chevron-circle-down:before{content:\"\\f13a\"}.fa-html5:before{content:\"\\f13b\"}.fa-css3:before{content:\"\\f13c\"}.fa-anchor:before{content:\"\\f13d\"}.fa-unlock-alt:before{content:\"\\f13e\"}.fa-bullseye:before{content:\"\\f140\"}.fa-ellipsis-h:before{content:\"\\f141\"}.fa-ellipsis-v:before{content:\"\\f142\"}.fa-rss-square:before{content:\"\\f143\"}.fa-play-circle:before{content:\"\\f144\"}.fa-ticket:before{content:\"\\f145\"}.fa-minus-square:before{content:\"\\f146\"}.fa-minus-square-o:before{content:\"\\f147\"}.fa-level-up:before{content:\"\\f148\"}.fa-level-down:before{content:\"\\f149\"}.fa-check-square:before{content:\"\\f14a\"}.fa-pencil-square:before{content:\"\\f14b\"}.fa-external-link-square:before{content:\"\\f14c\"}.fa-share-square:before{content:\"\\f14d\"}.fa-compass:before{content:\"\\f14e\"}.fa-toggle-down:before,.fa-caret-square-o-down:before{content:\"\\f150\"}.fa-toggle-up:before,.fa-caret-square-o-up:before{content:\"\\f151\"}.fa-toggle-right:before,.fa-caret-square-o-right:before{content:\"\\f152\"}.fa-euro:before,.fa-eur:before{content:\"\\f153\"}.fa-gbp:before{content:\"\\f154\"}.fa-dollar:before,.fa-usd:before{content:\"\\f155\"}.fa-rupee:before,.fa-inr:before{content:\"\\f156\"}.fa-cny:before,.fa-rmb:before,.fa-yen:before,.fa-jpy:before{content:\"\\f157\"}.fa-ruble:before,.fa-rouble:before,.fa-rub:before{content:\"\\f158\"}.fa-won:before,.fa-krw:before{content:\"\\f159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\\f15a\"}.fa-file:before{content:\"\\f15b\"}.fa-file-text:before{content:\"\\f15c\"}.fa-sort-alpha-asc:before{content:\"\\f15d\"}.fa-sort-alpha-desc:before{content:\"\\f15e\"}.fa-sort-amount-asc:before{content:\"\\f160\"}.fa-sort-amount-desc:before{content:\"\\f161\"}.fa-sort-numeric-asc:before{content:\"\\f162\"}.fa-sort-numeric-desc:before{content:\"\\f163\"}.fa-thumbs-up:before{content:\"\\f164\"}.fa-thumbs-down:before{content:\"\\f165\"}.fa-youtube-square:before{content:\"\\f166\"}.fa-youtube:before{content:\"\\f167\"}.fa-xing:before{content:\"\\f168\"}.fa-xing-square:before{content:\"\\f169\"}.fa-youtube-play:before{content:\"\\f16a\"}.fa-dropbox:before{content:\"\\f16b\"}.fa-stack-overflow:before{content:\"\\f16c\"}.fa-instagram:before{content:\"\\f16d\"}.fa-flickr:before{content:\"\\f16e\"}.fa-adn:before{content:\"\\f170\"}.fa-bitbucket:before{content:\"\\f171\"}.fa-bitbucket-square:before{content:\"\\f172\"}.fa-tumblr:before{content:\"\\f173\"}.fa-tumblr-square:before{content:\"\\f174\"}.fa-long-arrow-down:before{content:\"\\f175\"}.fa-long-arrow-up:before{content:\"\\f176\"}.fa-long-arrow-left:before{content:\"\\f177\"}.fa-long-arrow-right:before{content:\"\\f178\"}.fa-apple:before{content:\"\\f179\"}.fa-windows:before{content:\"\\f17a\"}.fa-android:before{content:\"\\f17b\"}.fa-linux:before{content:\"\\f17c\"}.fa-dribbble:before{content:\"\\f17d\"}.fa-skype:before{content:\"\\f17e\"}.fa-foursquare:before{content:\"\\f180\"}.fa-trello:before{content:\"\\f181\"}.fa-female:before{content:\"\\f182\"}.fa-male:before{content:\"\\f183\"}.fa-gittip:before{content:\"\\f184\"}.fa-sun-o:before{content:\"\\f185\"}.fa-moon-o:before{content:\"\\f186\"}.fa-archive:before{content:\"\\f187\"}.fa-bug:before{content:\"\\f188\"}.fa-vk:before{content:\"\\f189\"}.fa-weibo:before{content:\"\\f18a\"}.fa-renren:before{content:\"\\f18b\"}.fa-pagelines:before{content:\"\\f18c\"}.fa-stack-exchange:before{content:\"\\f18d\"}.fa-arrow-circle-o-right:before{content:\"\\f18e\"}.fa-arrow-circle-o-left:before{content:\"\\f190\"}.fa-toggle-left:before,.fa-caret-square-o-left:before{content:\"\\f191\"}.fa-dot-circle-o:before{content:\"\\f192\"}.fa-wheelchair:before{content:\"\\f193\"}.fa-vimeo-square:before{content:\"\\f194\"}.fa-turkish-lira:before,.fa-try:before{content:\"\\f195\"}.fa-plus-square-o:before{content:\"\\f196\"}.fa-space-shuttle:before{content:\"\\f197\"}.fa-slack:before{content:\"\\f198\"}.fa-envelope-square:before{content:\"\\f199\"}.fa-wordpress:before{content:\"\\f19a\"}.fa-openid:before{content:\"\\f19b\"}.fa-institution:before,.fa-bank:before,.fa-university:before{content:\"\\f19c\"}.fa-mortar-board:before,.fa-graduation-cap:before{content:\"\\f19d\"}.fa-yahoo:before{content:\"\\f19e\"}.fa-google:before{content:\"\\f1a0\"}.fa-reddit:before{content:\"\\f1a1\"}.fa-reddit-square:before{content:\"\\f1a2\"}.fa-stumbleupon-circle:before{content:\"\\f1a3\"}.fa-stumbleupon:before{content:\"\\f1a4\"}.fa-delicious:before{content:\"\\f1a5\"}.fa-digg:before{content:\"\\f1a6\"}.fa-pied-piper:before{content:\"\\f1a7\"}.fa-pied-piper-alt:before{content:\"\\f1a8\"}.fa-drupal:before{content:\"\\f1a9\"}.fa-joomla:before{content:\"\\f1aa\"}.fa-language:before{content:\"\\f1ab\"}.fa-fax:before{content:\"\\f1ac\"}.fa-building:before{content:\"\\f1ad\"}.fa-child:before{content:\"\\f1ae\"}.fa-paw:before{content:\"\\f1b0\"}.fa-spoon:before{content:\"\\f1b1\"}.fa-cube:before{content:\"\\f1b2\"}.fa-cubes:before{content:\"\\f1b3\"}.fa-behance:before{content:\"\\f1b4\"}.fa-behance-square:before{content:\"\\f1b5\"}.fa-steam:before{content:\"\\f1b6\"}.fa-steam-square:before{content:\"\\f1b7\"}.fa-recycle:before{content:\"\\f1b8\"}.fa-automobile:before,.fa-car:before{content:\"\\f1b9\"}.fa-cab:before,.fa-taxi:before{content:\"\\f1ba\"}.fa-tree:before{content:\"\\f1bb\"}.fa-spotify:before{content:\"\\f1bc\"}.fa-deviantart:before{content:\"\\f1bd\"}.fa-soundcloud:before{content:\"\\f1be\"}.fa-database:before{content:\"\\f1c0\"}.fa-file-pdf-o:before{content:\"\\f1c1\"}.fa-file-word-o:before{content:\"\\f1c2\"}.fa-file-excel-o:before{content:\"\\f1c3\"}.fa-file-powerpoint-o:before{content:\"\\f1c4\"}.fa-file-photo-o:before,.fa-file-picture-o:before,.fa-file-image-o:before{content:\"\\f1c5\"}.fa-file-zip-o:before,.fa-file-archive-o:before{content:\"\\f1c6\"}.fa-file-sound-o:before,.fa-file-audio-o:before{content:\"\\f1c7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\\f1c8\"}.fa-file-code-o:before{content:\"\\f1c9\"}.fa-vine:before{content:\"\\f1ca\"}.fa-codepen:before{content:\"\\f1cb\"}.fa-jsfiddle:before{content:\"\\f1cc\"}.fa-life-bouy:before,.fa-life-buoy:before,.fa-life-saver:before,.fa-support:before,.fa-life-ring:before{content:\"\\f1cd\"}.fa-circle-o-notch:before{content:\"\\f1ce\"}.fa-ra:before,.fa-rebel:before{content:\"\\f1d0\"}.fa-ge:before,.fa-empire:before{content:\"\\f1d1\"}.fa-git-square:before{content:\"\\f1d2\"}.fa-git:before{content:\"\\f1d3\"}.fa-hacker-news:before{content:\"\\f1d4\"}.fa-tencent-weibo:before{content:\"\\f1d5\"}.fa-qq:before{content:\"\\f1d6\"}.fa-wechat:before,.fa-weixin:before{content:\"\\f1d7\"}.fa-send:before,.fa-paper-plane:before{content:\"\\f1d8\"}.fa-send-o:before,.fa-paper-plane-o:before{content:\"\\f1d9\"}.fa-history:before{content:\"\\f1da\"}.fa-circle-thin:before{content:\"\\f1db\"}.fa-header:before{content:\"\\f1dc\"}.fa-paragraph:before{content:\"\\f1dd\"}.fa-sliders:before{content:\"\\f1de\"}.fa-share-alt:before{content:\"\\f1e0\"}.fa-share-alt-square:before{content:\"\\f1e1\"}.fa-bomb:before{content:\"\\f1e2\"}.fa-soccer-ball-o:before,.fa-futbol-o:before{content:\"\\f1e3\"}.fa-tty:before{content:\"\\f1e4\"}.fa-binoculars:before{content:\"\\f1e5\"}.fa-plug:before{content:\"\\f1e6\"}.fa-slideshare:before{content:\"\\f1e7\"}.fa-twitch:before{content:\"\\f1e8\"}.fa-yelp:before{content:\"\\f1e9\"}.fa-newspaper-o:before{content:\"\\f1ea\"}.fa-wifi:before{content:\"\\f1eb\"}.fa-calculator:before{content:\"\\f1ec\"}.fa-paypal:before{content:\"\\f1ed\"}.fa-google-wallet:before{content:\"\\f1ee\"}.fa-cc-visa:before{content:\"\\f1f0\"}.fa-cc-mastercard:before{content:\"\\f1f1\"}.fa-cc-discover:before{content:\"\\f1f2\"}.fa-cc-amex:before{content:\"\\f1f3\"}.fa-cc-paypal:before{content:\"\\f1f4\"}.fa-cc-stripe:before{content:\"\\f1f5\"}.fa-bell-slash:before{content:\"\\f1f6\"}.fa-bell-slash-o:before{content:\"\\f1f7\"}.fa-trash:before{content:\"\\f1f8\"}.fa-copyright:before{content:\"\\f1f9\"}.fa-at:before{content:\"\\f1fa\"}.fa-eyedropper:before{content:\"\\f1fb\"}.fa-paint-brush:before{content:\"\\f1fc\"}.fa-birthday-cake:before{content:\"\\f1fd\"}.fa-area-chart:before{content:\"\\f1fe\"}.fa-pie-chart:before{content:\"\\f200\"}.fa-line-chart:before{content:\"\\f201\"}.fa-lastfm:before{content:\"\\f202\"}.fa-lastfm-square:before{content:\"\\f203\"}.fa-toggle-off:before{content:\"\\f204\"}.fa-toggle-on:before{content:\"\\f205\"}.fa-bicycle:before{content:\"\\f206\"}.fa-bus:before{content:\"\\f207\"}.fa-ioxhost:before{content:\"\\f208\"}.fa-angellist:before{content:\"\\f209\"}.fa-cc:before{content:\"\\f20a\"}.fa-shekel:before,.fa-sheqel:before,.fa-ils:before{content:\"\\f20b\"}.fa-meanpath:before{content:\"\\f20c\"}\n /* General */\n.dialog {\n box-shadow: 0 1px 2px rgba(0, 0, 0, .15);\n border: 1px solid;\n display: block;\n padding: 0;\n}\n.field {\n background-color: #FFF;\n border: 1px solid #CCC;\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n color: #333;\n font-family: inherit;\n font-size: 13px;\n margin: 0;\n padding: 2px 4px 3px;\n outline: none;\n transition: color .25s, border-color .25s, flex .25s;\n}\n.field::-moz-placeholder {\n color: #AAA;\n opacity: 1;\n}\n.field:hover {\n border-color: #999;\n}\n.field:hover, .field:focus {\n color: #000;\n}\n.field[disabled] {\n background-color: #F2F2F2;\n color: #888;\n}\n.field::-webkit-search-decoration {\n display: none;\n}\n.move {\n cursor: move;\n}\nlabel, .watcher-toggler {\n cursor: pointer;\n}\na[href=\"javascript:;\"] {\n text-decoration: none;\n}\n.warning {\n color: red;\n}\n\n/* 4chan style fixes */\n.opContainer, .op {\n display: block !important;\n}\n.post {\n overflow: visible !important;\n}\n.reply > .file > .fileText {\n margin: 0 20px;\n}\n[hidden] {\n display: none !important;\n}\n\n/* fixed, z-index */\n#overlay,\n#qp, #ihover,\n#updater, #thread-stats,\n#navlinks, #header,\n#qr {\n position: fixed;\n}\n#overlay {\n z-index: 999;\n}\n#notifications {\n z-index: 70;\n}\n#qp, #ihover {\n z-index: 60;\n}\n#menu {\n z-index: 50;\n}\n#navlinks, #updater, #thread-stats {\n z-index: 40;\n}\n#qr {\n z-index: 30;\n}\n#thread-watcher:hover {\n z-index: 20;\n}\n#header {\n z-index: 10;\n}\n#thread-watcher {\n z-index: 5;\n}\n\n/* Header */\n:root.top-header body {\n margin-top: 2em;\n}\n:root.bottom-header body {\n margin-bottom: 2em;\n}\nbody > .desktop:not(hr):not(.navLinks):not(#boardNavDesktop):not(#boardNavDesktopFoot),\n:root.fourchan-x #navtopright,\n:root.fourchan-x #navbotright,\n:root.fourchan-x:not(.show-original-top-board-list) #boardNavDesktop,\n:root.fourchan-x:not(.show-original-bot-board-list) #boardNavDesktopFoot {\n display: none !important;\n}\n#header {\n right: 0;\n left: 0;\n pointer-events: none;\n}\n#header.top {\n top: 0;\n}\n#header.bottom {\n bottom: 0;\n}\n#header-bar {\n border-width: 0;\n display: flex;\n padding: 3px;\n position: relative;\n transition: all .1s .05s ease-in-out;\n pointer-events: initial;\n}\n#header.top #header-bar {\n border-bottom-width: 1px;\n}\n#header.bottom #header-bar {\n box-shadow: 0 -1px 2px rgba(0, 0, 0, .15);\n border-top-width: 1px;\n}\n#board-list {\n flex: 1;\n align-self: center;\n text-align: center;\n}\n#header-bar.autohide:not(:hover) {\n box-shadow: none;\n transition: all .8s .6s cubic-bezier(.55, .055, .675, .19);\n}\n#header-bar.scroll:not(:hover) {\n transition: -webkit-transform .2s !important;\n transition: transform .2s !important;\n}\n#header.top #header-bar.autohide:not(:hover) {\n margin-bottom: -1em;\n -webkit-transform: translateY(-100%);\n transform: translateY(-100%);\n}\n#header.bottom #header-bar.autohide:not(:hover) {\n -webkit-transform: translateY(100%);\n transform: translateY(100%);\n}\n#header-bar-hitzone {\n left: 0;\n right: 0;\n height: 10px;\n position: absolute;\n}\n#header-bar:not(.autohide) #header-bar-hitzone {\n display: none;\n}\n#header.top #header-bar-hitzone {\n bottom: -10px;\n}\n#header.bottom #header-bar-hitzone {\n top: -10px;\n}\n#header-bar a:not(.entry) {\n text-decoration: none;\n padding: 1px;\n}\n.shortcut:not(:last-child)::after {\n content: \" / \";\n}\n.brackets-wrap::before {\n content: \" [ \";\n}\n.brackets-wrap::after {\n content: \" ] \";\n}\n\n/* Notifications */\n#notifications {\n height: 0;\n text-align: center;\n pointer-events: initial;\n}\n#header.bottom #notifications {\n position: fixed;\n top: 0;\n left: 0;\n width: 100%;\n}\n.notification {\n color: #FFF;\n font-weight: 700;\n text-shadow: 0 1px 2px rgba(0, 0, 0, .5);\n box-shadow: 0 1px 2px rgba(0, 0, 0, .15);\n border-radius: 2px;\n margin: 1px auto;\n width: 500px;\n max-width: 100%;\n position: relative;\n transition: all .25s ease-in-out;\n}\n.notification.error {\n background-color: hsla(0, 100%, 38%, .9);\n}\n.notification.warning {\n background-color: hsla(36, 100%, 38%, .9);\n}\n.notification.info {\n background-color: hsla(200, 100%, 38%, .9);\n}\n.notification.success {\n background-color: hsla(104, 100%, 38%, .9);\n}\n.notification a {\n color: white;\n}\n.notification > .close {\n padding: 7px;\n top: 0;\n right: 0;\n position: absolute;\n}\n.message {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n padding: 6px 20px;\n max-height: 200px;\n width: 100%;\n overflow: auto;\n}\n\n/* Settings */\n:root.fourchan-x body {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n}\n#overlay {\n background-color: rgba(0, 0, 0, .5);\n display: flex;\n position: fixed;\n top: 0;\n left: 0;\n height: 100%;\n width: 100%;\n}\n#fourchanx-settings {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n box-shadow: 0 0 15px rgba(0, 0, 0, .15);\n height: 600px;\n max-height: 100%;\n width: 900px;\n max-width: 100%;\n margin: auto;\n padding: 3px;\n display: flex;\n flex-direction: column;\n}\n#fourchanx-settings > nav {\n display: flex;\n padding: 2px 2px .5em;\n}\n#fourchanx-settings > nav a {\n text-decoration: underline;\n}\n#fourchanx-settings > nav a.close {\n text-decoration: none;\n padding: 0 2px;\n}\n.sections-list {\n flex: 1;\n}\n.tab-selected {\n font-weight: 700;\n}\n#fourchanx-settings > section {\n flex: 1;\n overflow: auto;\n}\n.section-sauce ul,\n.section-rice ul {\n list-style: none;\n margin: 0;\n padding: 8px;\n}\n.section-sauce li,\n.section-rice li {\n padding-left: 4px;\n}\n.section-main label {\n text-decoration: underline;\n}\n.section-filter ul,\n.section-qr ul {\n padding: 0;\n}\n.section-filter li,\n.section-qr li {\n margin: 10px 40px;\n}\n.section-filter textarea {\n height: 500px;\n}\n.section-qr textarea {\n height: 200px;\n}\n.section-qr fieldset:nth-child(2) div {\n margin-top: 4px;\n}\n.section-sauce textarea {\n height: 350px;\n}\n.section-rice .field[name=\"boardnav\"] {\n width: 100%;\n}\n.section-rice textarea {\n height: 150px;\n}\n.section-archives table {\n width: 100%;\n}\n.section-archives th:not(:first-child) {\n width: 30%;\n}\n.section-archives td {\n text-align: center;\n}\n.section-archives select {\n width: 90%;\n}\n.section-keybinds .field {\n font-family: monospace;\n}\n#fourchanx-settings fieldset {\n border: 1px solid;\n border-radius: 3px;\n}\n#fourchanx-settings legend {\n font-weight: 700;\n}\n#fourchanx-settings textarea {\n font-family: monospace;\n min-width: 100%;\n max-width: 100%;\n}\n#fourchanx-settings code {\n color: #000;\n background-color: #FFF;\n padding: 0 2px;\n}\n.unscroll {\n overflow: hidden;\n}\n\n/* Index */\n:root.index-loading .navLinks,\n:root.index-loading .board,\n:root.index-loading .pagelist,\n:root:not(.catalog-mode) #index-size {\n display: none;\n}\n#nav-links {\n display: flex;\n align-items: baseline;\n}\n#index-search {\n padding-right: 1.5em;\n width: 100px;\n transition: color .25s, border-color .25s, width .25s;\n}\n#index-search:focus,\n#index-search[data-searching] {\n width: 200px;\n}\n#index-search-clear {\n color: gray;\n position: relative;\n left: -1.25em;\n width: 0;\n}\n\n#index-search:not([data-searching]) + #index-search-clear {\n display: none;\n}\n.page-num {\n font-family: inherit;\n}\n.page-num::before {\n font-family: FontAwesome;\n}\n.summary {\n text-decoration: none;\n}\n.catalog-mode .board {\n display: flex;\n flex-wrap: wrap;\n justify-content: center;\n}\n.catalog-thread {\n display: inline-flex;\n flex-direction: column;\n align-items: center;\n margin: 0 2px 5px;\n word-break: break-word;\n}\n.catalog-small .catalog-thread {\n width: 165px;\n max-height: 320px;\n}\n.catalog-large .catalog-thread {\n width: 270px;\n max-height: 410px;\n}\n.thumb {\n flex-shrink: 0;\n position: relative;\n background-size: 100% 100%;\n background-repeat: no-repeat;\n background-position: center;\n border-radius: 2px;\n box-shadow: 0 0 5px rgba(0, 0, 0, .25);\n}\n.thumb:not(.deleted-file):not(.no-file) {\n min-width: 30px;\n min-height: 30px;\n}\n.thumb.spoiler-file {\n background-size: 100px;\n width: 100px;\n height: 100px;\n}\n.thumb.deleted-file {\n background-size: 127px 13px;\n width: 127px;\n height: 13px;\n padding: 20px 11px;\n}\n.thumb.no-file {\n background-size: 77px 13px;\n width: 77px;\n height: 13px;\n padding: 20px 36px;\n}\n.thread-icons > img {\n width: 1em;\n height: 1em;\n margin: 0;\n vertical-align: text-top;\n}\n.thumb:not(:hover):not(:focus) > .menu-button:not(.open):not(:focus) > i {\n display: none;\n}\n.thumb > .menu-button {\n position: absolute;\n top: 0;\n right: 0;\n}\n.thumb > .menu-button > i {\n width: 1em;\n height: 1em;\n padding: 1px;\n border-radius: 0 2px 0 2px;\n font-size: 14px;\n text-align: center;\n\n line-height: normal;\n\n}\n.thread-stats {\n flex-shrink: 0;\n cursor: help;\n font-size: 10px;\n font-weight: 700;\n margin-top: 2px;\n}\n.catalog-thread > .subject {\n flex-shrink: 0;\n font-weight: 700;\n line-height: 1;\n text-align: center;\n}\n.catalog-thread > .comment {\n flex-shrink: 1;\n align-self: stretch;\n overflow: hidden;\n text-align: center;\n}\n.thread-info {\n position: fixed;\n background-color: inherit;\n padding: 2px;\n border-radius: 2px;\n box-shadow: 0 0 5px rgba(0, 0, 0, .25);\n}\n.thread-info .post {\n margin: 0;\n}\n\n/* Announcement Hiding */\n:root.hide-announcement #globalMessage,\n:root.hide-announcement-enabled #toggleMsgBtn {\n display: none;\n}\na.hide-announcement {\n float: left;\n font-size: 14px;\n}\n\n/* Unread */\n#unread-line {\n margin: 0;\n}\n\n/* Thread Updater */\n#updater:not(:hover) {\n background: none;\n border: none;\n box-shadow: none;\n}\n#updater > .move {\n padding: 0 3px;\n}\n#updater > div:last-child {\n text-align: center;\n}\n#updater input[type=\"number\"] {\n width: 4em;\n}\n#updater:not(:hover) > div:not(.move) {\n display: none;\n}\n#updater input[type=\"button\"] {\n width: 100%;\n}\n.new {\n color: limegreen;\n}\n\n/* Thread Watcher */\n#thread-watcher {\n max-width: 200px;\n min-width: 150px;\n padding: 3px;\n position: absolute;\n}\n#thread-watcher > div:first-child {\n display: flex;\n align-items: center;\n}\n#thread-watcher .move {\n flex: 1;\n}\n#watcher-status:not(:empty)::before {\n content: \"(\";\n}\n#watcher-status:not(:empty)::after {\n content: \")\";\n}\n#watched-threads:not(:hover) {\n max-height: 150px;\n overflow: hidden;\n}\n#watched-threads div {\n overflow: hidden;\n text-overflow: ellipsis;\n white-space: nowrap;\n}\n#watched-threads .current {\n font-weight: 700;\n}\n#watched-threads a {\n text-decoration: none;\n}\n#watched-threads .dead-thread a[title] {\n text-decoration: line-through;\n}\n\n/* Thread Stats */\n#thread-stats {\n background: none;\n border: none;\n box-shadow: none;\n}\n\n/* Quote */\n.deadlink {\n text-decoration: none !important;\n}\n.backlink.deadlink:not(.forwardlink),\n.quotelink.deadlink:not(.forwardlink) {\n text-decoration: underline !important;\n}\n.inlined {\n opacity: .5;\n}\n#qp input, .forwarded {\n display: none;\n}\n.quotelink.forwardlink,\n.backlink.forwardlink {\n text-decoration: none;\n border-bottom: 1px dashed;\n}\n@supports (text-decoration-style: dashed) or (-moz-text-decoration-style: dashed) {\n .quotelink.forwardlink,\n .backlink.forwardlink {\n   text-decoration: underline;\n   -moz-text-decoration-style: dashed;\n   text-decoration-style: dashed;\n   border-bottom: none;\n }\n}\n.filtered {\n text-decoration: underline line-through;\n}\n.inline {\n border: 1px solid;\n display: table;\n margin: 2px 0;\n}\n.inline .post {\n border: 0 !important;\n background-color: transparent !important;\n display: table !important;\n margin: 0 !important;\n padding: 1px 2px !important;\n}\n#qp > .opContainer::after {\n content: '';\n clear: both;\n display: table;\n}\n#qp .post {\n border: none;\n margin: 0;\n padding: 2px 2px 5px;\n}\n#qp img {\n max-height: 80vh;\n max-width: 50vw;\n}\n.qphl {\n outline: 2px solid rgba(216, 94, 49, .7);\n}\n\n/* File */\n.file-info:hover .fntrunc,\n.file-info:not(:hover) .fnfull,\n.expanded-image > .post > .file > .fileThumb > img[data-md5],\n:not(.expanded-image) > .post > .file > .fileThumb > .full-image {\n display: none;\n}\n.expanding {\n opacity: .5;\n}\n.expanded-image {\n clear: both;\n}\n.expanded-image > .op > .file::after {\n content: '';\n clear: both;\n display: table;\n}\n:root.fit-height .full-image {\n max-height: 100vh;\n}\n:root.fit-width .full-image {\n max-width: 100%;\n}\n:root.gecko.fit-width .full-image {\n width: 100%;\n}\n.fileThumb > .warning {\n clear: both;\n}\n#ihover {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n max-height: 100%;\n max-width: 75%;\n padding-bottom: 16px;\n}\n\n/* Index/Reply Navigation */\n#navlinks {\n font-size: 16px;\n top: 25px;\n right: 10px;\n}\n\n/* Filter */\n.opContainer.filter-highlight {\n box-shadow: inset 5px 0 rgba(255, 0, 0, .5);\n}\n.filter-highlight > .reply {\n box-shadow: -5px 0 rgba(255, 0, 0, .5);\n}\n.pinned .thumb,\n.filter-highlight .thumb {\n border: 2px solid rgba(255, 0, 0, .5);\n}\n\n/* Post Hiding */\n.hide-post-button,\n.show-post-button {\n font-size: 14px;\n line-height: 12px; /* Prevent the floating effect from affecting the thumbnail too */\n}\n.opContainer > .show-post-button,\n.hide-post-button {\n float: left;\n margin-right: 3px;\n}\n.stub input {\n display: inline-block;\n}\n\n/* QR */\n:root.hide-original-post-form #postForm,\n:root.hide-original-post-form #togglePostFormLink,\n#qr.autohide:not(.has-focus):not(:hover) > form {\n display: none;\n}\n#qr select, #dump-button, #url-button, .remove, .captcha-img {\n cursor: pointer;\n}\n#qr > div {\n min-width: 300px;\n display: flex;\n align-items: center;\n}\n#qr .move {\n align-self: stretch;\n flex: 1;\n}\n#qr select[data-name=thread] {\n margin: 0;\n -webkit-appearance: none;\n -moz-appearance: none;\n appearance: none;\n border: none;\n background: none;\n font: inherit;\n}\n#qr option {\n color: #000;\n background-color: #F7F7F7;\n}\n#qr .close {\n padding: 0 3px;\n}\n#qr > form {\n display: flex;\n flex-direction: column;\n}\n.persona {\n display: flex;\n}\n.persona .field {\n flex: 1;\n width: 0;\n}\n.persona .field:hover,\n.persona .field:focus {\n flex: 3;\n}\n\n#dump-button {\n background: linear-gradient(#EEE, #CCC);\n border: 1px solid #CCC;\n margin: 0;\n padding: 2px 4px 3px;\n outline: none;\n width: 30px;\n}\n#dump-button:hover,\n#dump-button:focus {\n background: linear-gradient(#FFF, #DDD);\n}\n#dump-button:active,\n.dump #dump-button:not(:hover):not(:focus) {\n background: linear-gradient(#CCC, #DDD);\n}\n:root.gecko #dump-button {\n padding: 0;\n}\n#qr:not(.dump) #dump-list,\n#qr:not(.dump) #add-post {\n display: none;\n}\n#dump-list {\n counter-reset: qrpreviews;\n width: 0;\n min-width: 100%;\n overflow: hidden;\n white-space: nowrap;\n position: relative;\n -webkit-user-select: none;\n -moz-user-select: none;\n user-select: none;\n}\n#dump-list:hover {\n padding-bottom: 12px;\n margin-bottom: -12px;\n overflow-x: auto;\n z-index: 1;\n}\n#dump-list::-webkit-scrollbar {\n height: 12px;\n}\n#dump-list::-webkit-scrollbar-thumb {\n border: 1px solid;\n}\n.qr-preview {\n background-position: 50% 20%;\n background-size: cover;\n border: 1px solid #808080;\n color: #FFF !important;\n font-size: 12px;\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n cursor: move;\n display: inline-block;\n height: 92px;\n width: 92px;\n margin: 4px;\n padding: 2px;\n opacity: .6;\n outline: none;\n overflow: hidden;\n position: relative;\n text-shadow: 0 0 2px #000;\n transition: opacity .25s ease-in-out;\n vertical-align: top;\n white-space: pre;\n}\n.qr-preview:hover,\n.qr-preview:focus {\n opacity: .9;\n color: #FFF !important;\n}\n.qr-preview#selected {\n opacity: 1;\n}\n.qr-preview::before {\n counter-increment: qrpreviews;\n content: counter(qrpreviews);\n font-weight: 700;\n text-shadow: 0 0 3px #000, 0 0 5px #000;\n position: absolute;\n top: 3px;\n right: 3px;\n}\n.qr-preview.drag {\n border-color: red;\n border-style: dashed;\n opacity: 1;\n}\n.qr-preview.over {\n border-color: #FFF;\n border-style: dashed;\n opacity: 1;\n}\na.remove {\n color: #E00 !important;\n padding: 1px;\n}\n.qr-preview > label {\n background: rgba(0, 0, 0, .5);\n right: 0;\n bottom: 0;\n left: 0;\n position: absolute;\n text-align: center;\n}\n.qr-preview > label > input {\n margin: 1px 0;\n vertical-align: bottom;\n}\n#add-post {\n align-self: flex-end;\n font-size: 20px;\n width: 1em;\n margin-top: -1em;\n text-align: center;\n z-index: 1;\n}\n[name='qr-proceed'] {\n position: absolute;\n right: 6px;\n bottom: 28px;\n z-index: 1;\n}\n#qr textarea {\n min-height: 160px;\n min-width: 100%;\n display: block;\n}\n#qr.has-captcha textarea {\n min-height: 120px;\n}\n.textarea {\n position: relative;\n}\n#char-count {\n color: #000;\n background: hsla(0, 0%, 100%, .5);\n font-size: 8pt;\n position: absolute;\n bottom: 1px;\n right: 1px;\n pointer-events: none;\n}\n#char-count.warning {\n color: red;\n}\n.captcha-img {\n background: #FFF;\n outline: 1px solid #CCC;\n outline-offset: -1px;\n}\n.captcha-img > img {\n display: block;\n height: 57px;\n width: 300px;\n}\n#file-n-submit {\n display: flex;\n align-items: center;\n}\n#file-n-submit input {\n margin: 0;\n}\n#file-n-submit input[type='submit'] {\n order: 1;\n}\n#file-n-submit.has-file #qr-no-file,\n#file-n-submit:not(.has-file) #qr-filename,\n#file-n-submit:not(.has-file) #qr-filesize,\n#file-n-submit:not(.has-file) #qr-file-spoiler,\n#file-n-submit:not(.has-file) #qr-filerm,\n#qr-filename:focus ~ #qr-filesize {\n display: none;\n}\n#qr-no-file,\n#qr-filename,\n#qr-filesize,\n#qr-filerm,\n#qr-file-spoiler {\n margin: 0 1px !important;\n}\n#qr-no-file {\n cursor: default;\n flex: 1;\n}\n#qr-filename {\n -webkit-appearance: none;\n -moz-appearance: none;\n appearance: none;\n background: none;\n border: none;\n color: inherit;\n font: inherit;\n flex: 1;\n width: 0;\n padding: 0;\n text-overflow: ellipsis;\n}\n#qr-filesize {\n font-size: .8em;\n}\n#qr-filesize::before {\n content: \"(\";\n}\n#qr-filesize::after {\n content: \")\";\n}\n\n/* Menu */\n.menu-button {\n position: relative;\n}\n@media screen and (resolution: 1dppx) {\n .fa-bars {\n   font-size: 14px;\n }\n #shortcuts .fa-bars {\n   vertical-align: -1px;\n }\n}\n#menu {\n border-bottom: 0;\n display: flex;\n margin: 2px 0;\n flex-direction: column;\n position: absolute;\n outline: none;\n}\n#menu.top {\n top: 100%;\n}\n#menu.bottom {\n bottom: 100%;\n}\n#menu.left {\n left: 0;\n}\n#menu.right {\n right: 0;\n}\n.entry {\n cursor: pointer;\n outline: none;\n padding: 3px 7px;\n position: relative;\n text-decoration: none;\n white-space: nowrap;\n}\n.entry.disabled {\n color: graytext !important;\n}\n.entry.has-submenu {\n padding-right: 20px;\n}\n.has-submenu::after {\n content: '';\n border-left:   6px solid;\n border-top:    4px solid transparent;\n border-bottom: 4px solid transparent;\n display: inline-block;\n margin: 4px;\n position: absolute;\n right: 3px;\n}\n.has-submenu:not(.focused) > .submenu {\n display: none;\n}\n.submenu {\n border-bottom: 0;\n display: flex;\n flex-direction: column;\n position: absolute;\n margin: -1px 0;\n}\n.submenu.top {\n top: 0;\n}\n.submenu.bottom {\n bottom: 0;\n}\n.submenu.left {\n left: 100%;\n}\n.submenu.right {\n right: 100%;\n}\n.entry input {\n margin: 0;\n}\n\n/* Other */\n.linkified {\n text-decoration: underline;\n word-break: break-all;\n}\n.painted .hand {\n padding: 0 5px;\n border-radius: 6px;\n font-size: 0.8em;\n}\n\n/* Embedding & ReportLink */\n#embedding,\n#report {\n padding: 1px 4px 1px 4px;\n z-index: 11;\n position: fixed;\n}\n#embedding.empty,\n#report.empty {\n display: none;\n}\n#embedding > div:first-child,\n#report > div:first-child {\n display: flex;\n}\n#embedding .move,\n#report .move {\n flex: 1;\n}\n#embedding .jump,\n#report .jump {\n margin: -1px 4px;\n text-decoration: none;\n}\n\n/* Link Titles */\n.linkified.title {\n background: transparent left bottom 1px no-repeat;\n padding-left: 18px;\n}\n.linkified.youtube {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAAA2FBMVEX////IEgvIEgzFEgvGEQvFEQvFEgrGEgvFEQrGEQrBEQvBEgvBEQrbnZvJMy3CEQvCEgvCEgrCEQq9EQu9EQrRY1+8EQq3EQq4EQq4EAq3EAu4EQuyEAqzEAmzEAqyEAnTmpitEAqsDwmtEAmsEAqsjYyOMC2tDwqsEAmtDwmmDwqmDwmnDwpvFBCYDginDwmhDgmiDgmhDwmhDwiIU1F0CgeiDwmiDgidDgicDgmcDghcCAWBDAidDgmXDgmYDQmYDQiXDgiYDgmXDQiUDQiUDgiTDQiUDQmlDXXhAAAAAXRSTlOArV5bRgAAAIZJREFUCB0FwbFxwzAQAMG7/wdJaUaRxyWoAwUuwP03ImUeJiQBeFcBnAAAVIAzdKRHjAjvOjC82rkcq0fdEPjwbZlkVAkC78djOG3VQAX+vi7IXk1HCDxdz6Z1E5nw3BxbT2pxxkheerUzx+KPTlQ7zLqIZW/72rJFLds9t91ftccAcGbnHzmrJ8ML23cLAAAAAElFTkSuQmCC');\n}\n.linkified.soundcloud {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAAAulBMVEX/lTH/kC7/kS//kS7/kC/+iyz/iyz/iiz+iiz/iiv/iyv+gij/gyj+gyj949L+69782L//gyf+eyT+eiT5o2/95tf707r++fX////84tH/eyT/eyP/eiT+ch//ch/+ciD7pXr949f7zrj4qHz/cR/+cR//aRr+aBr8zLf+7OP+aBv/YBb+Xxb+28v+VhL9yLL8wqv+VxH+Tg3+Tw3/Tg3+Rgn+Rwn+Rwr+Rgr/Rwr+QAb+QQb+QQf/QQeNThm+AAAAbUlEQVQIHV3BQQ6CQBAAwe5hFgU08ej/P+jBeBJ3xGg4WMU/tUKgi/TApqUdo4erlaOARejaAvMAVrhBZ3suftzZ1PwcjWnyyM9jGSNaO7O7RcsB2V0l0zrNceEreg5SrQYoKype2bQE7FAwvgF8TBzvXF7GTAAAAABJRU5ErkJggg==');\n}\n.linkified.vimeo {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAABFFBMVEUNrdYOrdYRrtcds9kUr9cRr9c4u95Cv98XsNgdstlax+Sg3u5iyuQZsdgZstmQ2+32/P7///9gyeM8vt+z5vPu+PuX1+iAyd72+/q33+oSrdUaqM6kvcbg5+rw9feVytoHnsY6l7J4orDm7O7Y5OggsNUJocsqi6nA09nf6+9Zp70MoMcHkbcCeJu+2uL//vw5udkMrNZDweH//Pv9/v6009wLjK8JptB3wNX18/RmzOU4u9y+5/LP3OEphaIJpc5Bp8Te5urk9vrk9fnc3+JKlqwIocoOlbrB3OXe4OJblKcElrwKqdJqs8jv7e3R19tPjaMFjbQMrNQMkLRPhZdUe4sgdZAJkbcTm8AXo8gPrdYQrtZ3sFJoAAAAhElEQVQIWz3JoQ5BUQCA4f+3c3fdnc2miTaFTRMoTPAGilcUNIoqKaS7eQrFDRgjnEv9vgAgH6ChLwhApt4pVG8EaKk+274JCQof5B21KoRAV+M1qlZRCEQ1QU8hUDK2fxloOUwAx7k0PY10n4Bczkx0Rw2Z08NM5QfbpQtd8wc2q/rhC5SoGNjPs3zpAAAAAElFTkSuQmCC');\n}\n.linkified.gist {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA8FBMVEUAAAAQEBASEhITExMUEhIAAAAUERETExMUERETEREODg4AAAANDQ0UEhIUExMAAAAEBAQNDQ0SEhIAAAAAAAAAAAAODg4PDw8UExMUExMPDw8QEBAUExMUFBQUExMUFBQAAAAUExMTExMQEBATExMWExMBAQERDw8RDAwRDQ0UExMTExMPDw8AAAABAQECAgIHBwcCAgIREREUFBQRBQUNDQ0PDg4PDw8TExMUExMREREPDw8AAAAUExMUEhIUFBQUExMUExMAAAAAAAATERETERETExMODg4PDw8UERETExMXFRUVFBQPDQ8CAgIQEBDkw8rYAAAAS3RSTlMAPpfZ8gOixqTBNoHc2Pd0NziYDAoBNEDe+SEf+OH28ALxT0zanPz7OzrnmjD57fZA6y2ZLFzBIo/uHhAN9a+W/O0ZGIV2xRIRsWkFyBMHAAAApklEQVQYGQXBBUICAAAEsJGCCgooJojd3d15xv9/4wYKxVK5XCoWAJVqkiRJtQKVoSRJkmSoglrqwyOjjUZzbLyeGq2krTNBZ1I7aakmXYCppGo6M7MAc/OZ1kwPgF6a+lkYAAwW01dKlgCWkxWr32vrG8DmVrJt52d373e/xcFhkhxxnJPTs3O6f0kuoH55dY2b2+QOuH94fOI5eQF4fXvn4/ML/gHiYxySqXmtTgAAAABJRU5ErkJggg==');\n}\n.linkified.dailymotion {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEUAAAAAov8Aov8Aov8Aov8Aov8Aov8Aov/+1wD+1wD+1wD+1wD+1wD+1wD+1wDyxQDywADyxQDyxQDywADywADyxQDywADxpwDxqwDxpwDxqwDxpwDxqwDxpwDxqwDxpwD+1wDXqwD/63zywAAAov/yxQDxpwAwJubKAAAAIHRSTlMAcM8KDwuvB2CPEK/f74AQQCBwjxDPvxAgQGCAr6/v310R/FsAAABySURBVHheXcvpEoIwDIXRULUgEtz37aYtvv8jymjQhjv9851JSVcUZOb6Z3ri3DSTNPNEvkyZUDWvtXUBC7LQsOkWLHkvGQ2v/r3eILBsdz/YCwIQD0ftUycAJMpZ4fIBRLkq3LrvF7krPIaL5xhefbwBKzcKOdbl80gAAAAASUVORK5CYII=');\n}\n\n /* General */\n:root.yotsuba .dialog {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.yotsuba .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.yotsuba #header-bar {\n font-size: 9pt;\n color: #B86;\n}\n:root.yotsuba #header-bar a {\n color: #800000;\n}\n\n/* Settings */\n:root.yotsuba #fourchanx-settings fieldset {\n border-color: #D9BFB7;\n}\n\n/* Quote */\n:root.yotsuba .backlink.deadlink {\n color: #00E !important;\n}\n:root.yotsuba .inline {\n border-color: #D9BFB7;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.yotsuba .hide-post-button,\n:root.yotsuba .show-post-button {\n color: #E0BFB7;\n}\n\n/* QR */\n:root.yotsuba #qr select {\n color: #00E;\n}\n:root.yotsuba #qr select:hover {\n color: red;\n}\n.yotsuba #dump-list::-webkit-scrollbar-thumb {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.yotsuba .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.yotsuba #menu {\n color: #800000;\n}\n:root.yotsuba .entry {\n border-bottom: 1px solid #D9BFB7;\n font-size: 10pt;\n}\n:root.yotsuba .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.yotsuba .thumb > .menu-button > i {\n background: #FFE;\n}\n\n /* General */\n:root.yotsuba-b .dialog {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.yotsuba-b .field:focus {\n border-color: #98E;\n}\n\n/* Header */\n:root.yotsuba-b #header-bar {\n font-size: 9pt;\n color: #89A;\n}\n:root.yotsuba-b #header-bar a {\n color: #34345C;\n}\n\n/* Settings */\n:root.yotsuba-b #fourchanx-settings fieldset {\n border-color: #B7C5D9;\n}\n\n/* Quote */\n:root.yotsuba-b .backlink.deadlink {\n color: #34345C !important;\n}\n:root.yotsuba-b .inline {\n border-color: #B7C5D9;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.yotsuba-b .hide-post-button,\n:root.yotsuba-b .show-post-button {\n color: #B7C5D9;\n}\n\n/* QR */\n:root.yotsuba-b #qr select {\n color: #34345C;\n}\n:root.yotsuba-b #qr select:hover {\n color: #DD0000;\n}\n.yotsuba-b #dump-list::-webkit-scrollbar-thumb {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.yotsuba-b .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.yotsuba-b #menu {\n color: #000;\n}\n:root.yotsuba-b .entry {\n border-bottom: 1px solid #B7C5D9;\n font-size: 10pt;\n}\n:root.yotsuba-b .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.yotsuba-b .thumb > .menu-button > i {\n background: #EEF2FF;\n}\n\n /* General */\n:root.futaba .dialog {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.futaba .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.futaba #header-bar {\n font-size: 11pt;\n color: #B86;\n}\n:root.futaba #header-bar a {\n color: #800000;\n}\n\n/* Settings */\n:root.futaba #fourchanx-settings fieldset {\n border-color: #D9BFB7;\n}\n\n/* Quote */\n:root.futaba .backlink.deadlink {\n color: #00E !important;\n}\n:root.futaba .inline {\n border-color: #D9BFB7;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.futaba .hide-post-button,\n:root.futaba .show-post-button {\n color: #800000;\n}\n\n/* QR */\n:root.futaba #qr select {\n color: #00E;\n}\n:root.futaba #qr select:hover {\n color: red;\n}\n.futaba #dump-list::-webkit-scrollbar-thumb {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.futaba .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.futaba #menu {\n color: #800000;\n}\n:root.futaba .entry {\n border-bottom: 1px solid #D9BFB7;\n font-size: 12pt;\n}\n:root.futaba .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.futaba .thumb > .menu-button > i {\n background: #FFE;\n}\n\n /* General */\n:root.burichan .dialog {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.burichan .field:focus {\n border-color: #98E;\n}\n\n/* Header */\n:root.burichan #header-bar {\n font-size: 11pt;\n color: #89A;\n}\n:root.burichan #header-bar a {\n color: #34345C;\n}\n\n/* Settings */\n:root.burichan #fourchanx-settings fieldset {\n border-color: #B7C5D9;\n}\n\n/* Quote */\n:root.burichan .backlink.deadlink {\n color: #34345C !important;\n}\n:root.burichan .inline {\n border-color: #B7C5D9;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.burichan .hide-post-button,\n:root.burichan .show-post-button {\n color: #000;\n}\n\n/* QR */\n:root.burichan #qr select {\n color: #34345C;\n}\n:root.burichan #qr select:hover {\n color: #DD0000;\n}\n.burichan #dump-list::-webkit-scrollbar-thumb {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.burichan .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.burichan #menu {\n color: #000000;\n}\n:root.burichan .entry {\n border-bottom: 1px solid #B7C5D9;\n font-size: 12pt;\n}\n:root.burichan .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.burichan .thumb > .menu-button > i {\n background: #EEF2FF;\n}\n\n /* General */\n:root.tomorrow .dialog {\n background-color: #282A2E;\n border-color: #111;\n}\n:root.tomorrow .field:focus {\n border-color: #000;\n}\n\n/* Header */\n:root.tomorrow #header-bar {\n font-size: 9pt;\n color: #C5C8C6;\n}\n:root.tomorrow #header-bar a {\n color: #81A2BE;\n}\n\n/* Settings */\n:root.tomorrow #fourchanx-settings fieldset {\n border-color: #111;\n}\n\n/* Quote */\n:root.tomorrow .backlink.deadlink {\n color: #81A2BE !important;\n}\n:root.tomorrow .inline {\n border-color: #111;\n background-color: rgba(0, 0, 0, .14);\n}\n\n/* Post Hiding */\n:root.tomorrow .hide-post-button,\n:root.tomorrow .show-post-button {\n color: #C5C8C6 !important;\n}\n\n/* QR */\n:root.tomorrow #qr select {\n color: #81A2BE;\n}\n:root.tomorrow #qr select:hover {\n color: #5F89AC;\n}\n.tomorrow #dump-list::-webkit-scrollbar-thumb {\n background-color: #282A2E;\n border-color: #111;\n}\n:root.tomorrow .qr-preview {\n background-color: rgba(255, 255, 255, .15);\n}\n\n/* Menu */\n:root.tomorrow #menu {\n color: #C5C8C6;\n}\n:root.tomorrow .entry {\n border-bottom: 1px solid #111;\n font-size: 10pt;\n}\n:root.tomorrow .focused.entry {\n background: rgba(0, 0, 0, .33);\n}\n:root.tomorrow .thumb > .menu-button > i {\n background: #1D1F21;\n}\n\n /* General */\n:root.photon .dialog {\n background-color: #DDD;\n border-color: #CCC;\n}\n:root.photon .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.photon #header-bar {\n font-size: 9pt;\n color: #333;\n}\n:root.photon #header-bar a {\n color: #F60;\n}\n\n/* Settings */\n:root.photon #fourchanx-settings fieldset {\n border-color: #CCC;\n}\n\n/* Quote */\n:root.photon .backlink.deadlink {\n color: #F60 !important;\n}\n:root.photon .inline {\n border-color: #CCC;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.photon .hide-post-button,\n:root.photon .show-post-button {\n color: #333 !important;\n}\n\n/* QR */\n:root.photon #qr select {\n color: #F60;\n}\n:root.photon #qr select:hover {\n color: #FF3300;\n}\n.photon #dump-list::-webkit-scrollbar-thumb {\n background-color: #DDD;\n border-color: #CCC;\n}\n:root.photon .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.photon #menu {\n color: #333;\n}\n:root.photon .entry {\n border-bottom: 1px solid #CCC;\n font-size: 10pt;\n}\n:root.photon .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.photon .thumb > .menu-button > i {\n background: #EEE;\n}\n"
  };

  Main.init();

}).call(this);
