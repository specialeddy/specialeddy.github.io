// ==UserScript==
// @name         4chan X
// @version      3.13.14
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
// @updateURL    http://4chan-x.cf/stable-v3/4chan-X.meta.js
// @downloadURL  http://4chan-x.cf/stable-v3/4chan-X.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAgMAAAAOFJJnAAAACVBMVEUAAGcAAABmzDNZt9VtAAAAAXRSTlMAQObYZgAAAE5JREFUeF6NyiEOwEAMA0ET/88kJP8L2VdWKomuR7poJFu/qkiuhcxITRZqYkYLwzRkoQIoLaSG0QFDDtwfw7stmmnmRPxBx3PAlpLF3QN2aj/BUuOfdAAAAABJRU5ErkJggg==
// ==/UserScript==

/* 4chan X - Version 3.13.14 - 2014-07-16
 * http://4chan-x.cf/
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
    archivesLocation: 'http://4chan-x.cf/archives.json',
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
    VERSION: '3.13.14',
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
      html = "<div id=\"fourchanx-settings\" class=\"dialog\"><nav><div class=\"sections-list\"></div><div class=\"credits\"><a href=\"http://4chan-x.cf/\" target=\"_blank\">4chan X</a>&nbsp;|&nbsp;<a href=\"https://github.com/ihavenoface/4chan-x/blob/v3/CHANGELOG.md\" target=\"_blank\">" + g.VERSION + "</a>&nbsp;|&nbsp;<a href=\"https://github.com/ihavenoface/4chan-x/blob/v3/CONTRIBUTING.md#reporting-bugs-and-suggestions\" target=\"_blank\">Issues</a>&nbsp;|&nbsp;<a href=\"javascript:;\" class=\"close fa fa-times\" title=\"Close\"></a></div></nav><section></section></div>";
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
        return input.value = Conf['archivesLocation'] = !archivesLocation || archivesLocation === 'http://4chan-x.serverbros.eu/archives.json' ? 'http://4chan-x.cf/archives.json' : archivesLocation;
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
    submit: function(e) {
      var challenge, com, err, extra, filetag, formData, options, post, response, textOnly, thread, threadID, _ref;
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
        } else if (err.textContent && (m = err.textContent.match(/wait\s+(\d+)\s+second/i))) {
          QR.cooldown.auto = !QR.captcha.isEnabled;
          QR.cooldown.set({
            delay: m[1]
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
      var imgContainer, input;
      if (d.cookie.indexOf('pass_enabled=1') >= 0) {
        return;
      }
      if (!(this.isEnabled = !!$.id('captchaContainer'))) {
        return;
      }
      imgContainer = $.el('div', {
        className: 'captcha-img',
        title: 'Reload reCAPTCHA',
        innerHTML: '<img>'
      });
      input = $.el('input', {
        className: 'captcha-input field',
        title: 'Verification',
        autocomplete: 'off',
        spellcheck: false
      });
      this.nodes = {
        img: imgContainer.firstChild,
        input: input
      };
      $.on(input, 'blur', QR.focusout);
      $.on(input, 'focus', QR.focusin);
      $.addClass(QR.nodes.el, 'has-captcha');
      $.after(QR.nodes.com.parentNode, [imgContainer, input]);
      this.beforeSetup();
      return this.afterSetup();
    },
    beforeSetup: function() {
      var img, input, _ref;
      _ref = this.nodes, img = _ref.img, input = _ref.input;
      img.parentNode.hidden = true;
      input.value = '';
      input.placeholder = 'Focus to load reCAPTCHA';
      $.on(input, 'focus', this.setup);
      this.setupObserver = new MutationObserver(this.afterSetup);
      return this.setupObserver.observe($.id('captchaContainer'), {
        childList: true
      });
    },
    setup: function() {
      return $.globalEval('loadRecaptcha()');
    },
    afterSetup: function() {
      var challenge, img, input, _ref;
      if (!(challenge = $.id('recaptcha_challenge_field_holder'))) {
        return;
      }
      QR.captcha.setupObserver.disconnect();
      delete QR.captcha.setupObserver;
      _ref = QR.captcha.nodes, img = _ref.img, input = _ref.input;
      img.parentNode.hidden = false;
      input.placeholder = 'Verification';
      $.off(input, 'focus', QR.captcha.setup);
      $.on(input, 'keydown', QR.captcha.keydown.bind(QR.captcha));
      $.on(img.parentNode, 'click', QR.captcha.reload.bind(QR.captcha));
      QR.captcha.nodes.challenge = challenge;
      new MutationObserver(QR.captcha.load.bind(QR.captcha)).observe(challenge, {
        childList: true,
        subtree: true,
        attributes: true
      });
      return QR.captcha.load();
    },
    destroy: function() {
      $.globalEval('Recaptcha.destroy()');
      return this.beforeSetup();
    },
    getOne: function() {
      var challenge, response;
      challenge = this.nodes.img.alt;
      response = this.nodes.input.value.trim();
      return {
        challenge: challenge,
        response: response
      };
    },
    load: function() {
      var challenge;
      if (!this.nodes.challenge.firstChild) {
        return;
      }
      challenge = this.nodes.challenge.firstChild.value;
      this.nodes.img.alt = challenge;
      this.nodes.img.src = "//www.google.com/recaptcha/api/image?c=" + challenge;
      return this.nodes.input.value = null;
    },
    reload: function(focus) {
      $.globalEval('Recaptcha.reload("t")');
      if (focus) {
        return this.nodes.input.focus();
      }
    },
    keydown: function(e) {
      if (e.keyCode === 8 && !this.nodes.input.value) {
        this.reload();
      } else {
        return;
      }
      return e.preventDefault();
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
    archives: [{"uid":0,"convert":{},"name":"Foolz","domain":"archive.foolz.us","http":true,"https":true,"software":"foolfuuka","boards":["a","biz","c","co","diy","gd","int","jp","m","out","po","sci","sp","tg","tv","vg","vp","vr","wsg"],"files":["a","biz","c","co","diy","gd","jp","m","po","sci","tg","vg","vp","vr","wsg"]},{"uid":1,"convert":{},"name":"NSFW Foolz","domain":"nsfw.foolz.us","http":true,"https":true,"software":"foolfuuka","boards":["u"],"files":["u"]},{"uid":3,"convert":{},"name":"4plebs Archive","domain":"archive.4plebs.org","http":true,"https":true,"software":"foolfuuka","boards":["adv","f","hr","o","pol","s4s","tg","trv","tv","x"],"files":["adv","f","hr","o","pol","s4s","tg","trv","tv","x"]},{"uid":4,"convert":{},"name":"Nyafuu","domain":"archive.nyafuu.org","http":true,"https":true,"software":"foolfuuka","boards":["c","e","w","wg"],"files":["c","e","w","wg"]},{"uid":5,"convert":{},"name":"Love is Over","domain":"archive.loveisover.me","http":true,"https":true,"software":"foolfuuka","boards":["d","i","lgbt"],"files":["d","i","lgbt"]},{"uid":8,"convert":{},"name":"Rebecca Black Tech","domain":"archive.rebeccablacktech.com","http":true,"https":true,"software":"fuuka","boards":["cgl","g","mu","w"],"files":["cgl","g","mu","w"]},{"uid":9,"convert":{},"name":"Heinessen","domain":"archive.heinessen.com","http":true,"https":false,"software":"fuuka","boards":["an","fit","k","mlp","r9k","toy"],"files":["an","fit","k","mlp","r9k","toy"]},{"uid":10,"convert":{},"name":"warosu","domain":"warosu.org","http":false,"https":true,"software":"fuuka","boards":["3","biz","cgl","ck","diy","fa","g","ic","jp","lit","sci","tg","vr"],"files":["3","biz","cgl","ck","diy","fa","ic","jp","lit","sci","tg","vr"]},{"uid":15,"convert":{},"name":"fgts","domain":"fgts.jp","http":true,"https":true,"software":"foolfuuka","boards":["asp","cm","h","hc","hm","n","p","r","s","soc","y"],"files":["asp","cm","h","hc","hm","n","p","r","s","soc","y"]},{"uid":16,"convert":{},"name":"maware","domain":"archive.mawa.re","http":true,"https":false,"software":"foolfuuka","boards":["t"],"files":["t"]},{"uid":19,"convert":{},"name":"Deniable Plausibility","domain":"boards.deniableplausibility.net","http":true,"https":false,"software":"foolfuuka","boards":["v","vg"],"files":["v","vg"]},{"uid":13,"convert":{},"name":"Foolz Beta","domain":"beta.foolz.us","http":true,"https":true,"withCredentials":true,"software":"foolfuuka","boards":["a","biz","c","co","d","diy","gd","int","jp","m","out","po","s4s","sci","sp","tg","tv","u","vg","vp","vr","wsg"],"files":["a","biz","c","co","d","diy","gd","jp","m","po","s4s","sci","tg","u","vg","vp","vr","wsg"]}],
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
    css: " @font-face {\n   font-family: 'FontAwesome';\n   src: url('data:application/font-woff;base64,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') format('woff');\n   font-weight: normal;\n   font-style: normal;\n }\n /*!\n*  Font Awesome 4.1.0 by @davegandy - http://fontawesome.io - @fontawesome\n*  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n*/.fa{display:inline-block;font-family:FontAwesome;font-style:normal;font-weight:normal;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em;text-align:center}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em;text-align:center}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:solid .08em #eee;border-radius:.1em}.pull-right{float:right}.pull-left{float:left}.fa.pull-left{margin-right:.3em}.fa.pull-right{margin-left:.3em}.fa-spin{-webkit-animation:spin 2s infinite linear;-moz-animation:spin 2s infinite linear;-o-animation:spin 2s infinite linear;animation:spin 2s infinite linear}@-moz-keyframes spin{0%{-moz-transform:rotate(0deg)}100%{-moz-transform:rotate(359deg)}}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg)}}@-o-keyframes spin{0%{-o-transform:rotate(0deg)}100%{-o-transform:rotate(359deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=1);-webkit-transform:rotate(90deg);-moz-transform:rotate(90deg);-ms-transform:rotate(90deg);-o-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2);-webkit-transform:rotate(180deg);-moz-transform:rotate(180deg);-ms-transform:rotate(180deg);-o-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=3);-webkit-transform:rotate(270deg);-moz-transform:rotate(270deg);-ms-transform:rotate(270deg);-o-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);-webkit-transform:scale(-1, 1);-moz-transform:scale(-1, 1);-ms-transform:scale(-1, 1);-o-transform:scale(-1, 1);transform:scale(-1, 1)}.fa-flip-vertical{filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);-webkit-transform:scale(1, -1);-moz-transform:scale(1, -1);-ms-transform:scale(1, -1);-o-transform:scale(1, -1);transform:scale(1, -1)}.fa-stack{position:relative;display:inline-block;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-glass:before{content:\"\\f000\"}.fa-music:before{content:\"\\f001\"}.fa-search:before{content:\"\\f002\"}.fa-envelope-o:before{content:\"\\f003\"}.fa-heart:before{content:\"\\f004\"}.fa-star:before{content:\"\\f005\"}.fa-star-o:before{content:\"\\f006\"}.fa-user:before{content:\"\\f007\"}.fa-film:before{content:\"\\f008\"}.fa-th-large:before{content:\"\\f009\"}.fa-th:before{content:\"\\f00a\"}.fa-th-list:before{content:\"\\f00b\"}.fa-check:before{content:\"\\f00c\"}.fa-times:before{content:\"\\f00d\"}.fa-search-plus:before{content:\"\\f00e\"}.fa-search-minus:before{content:\"\\f010\"}.fa-power-off:before{content:\"\\f011\"}.fa-signal:before{content:\"\\f012\"}.fa-gear:before,.fa-cog:before{content:\"\\f013\"}.fa-trash-o:before{content:\"\\f014\"}.fa-home:before{content:\"\\f015\"}.fa-file-o:before{content:\"\\f016\"}.fa-clock-o:before{content:\"\\f017\"}.fa-road:before{content:\"\\f018\"}.fa-download:before{content:\"\\f019\"}.fa-arrow-circle-o-down:before{content:\"\\f01a\"}.fa-arrow-circle-o-up:before{content:\"\\f01b\"}.fa-inbox:before{content:\"\\f01c\"}.fa-play-circle-o:before{content:\"\\f01d\"}.fa-rotate-right:before,.fa-repeat:before{content:\"\\f01e\"}.fa-refresh:before{content:\"\\f021\"}.fa-list-alt:before{content:\"\\f022\"}.fa-lock:before{content:\"\\f023\"}.fa-flag:before{content:\"\\f024\"}.fa-headphones:before{content:\"\\f025\"}.fa-volume-off:before{content:\"\\f026\"}.fa-volume-down:before{content:\"\\f027\"}.fa-volume-up:before{content:\"\\f028\"}.fa-qrcode:before{content:\"\\f029\"}.fa-barcode:before{content:\"\\f02a\"}.fa-tag:before{content:\"\\f02b\"}.fa-tags:before{content:\"\\f02c\"}.fa-book:before{content:\"\\f02d\"}.fa-bookmark:before{content:\"\\f02e\"}.fa-print:before{content:\"\\f02f\"}.fa-camera:before{content:\"\\f030\"}.fa-font:before{content:\"\\f031\"}.fa-bold:before{content:\"\\f032\"}.fa-italic:before{content:\"\\f033\"}.fa-text-height:before{content:\"\\f034\"}.fa-text-width:before{content:\"\\f035\"}.fa-align-left:before{content:\"\\f036\"}.fa-align-center:before{content:\"\\f037\"}.fa-align-right:before{content:\"\\f038\"}.fa-align-justify:before{content:\"\\f039\"}.fa-list:before{content:\"\\f03a\"}.fa-dedent:before,.fa-outdent:before{content:\"\\f03b\"}.fa-indent:before{content:\"\\f03c\"}.fa-video-camera:before{content:\"\\f03d\"}.fa-photo:before,.fa-image:before,.fa-picture-o:before{content:\"\\f03e\"}.fa-pencil:before{content:\"\\f040\"}.fa-map-marker:before{content:\"\\f041\"}.fa-adjust:before{content:\"\\f042\"}.fa-tint:before{content:\"\\f043\"}.fa-edit:before,.fa-pencil-square-o:before{content:\"\\f044\"}.fa-share-square-o:before{content:\"\\f045\"}.fa-check-square-o:before{content:\"\\f046\"}.fa-arrows:before{content:\"\\f047\"}.fa-step-backward:before{content:\"\\f048\"}.fa-fast-backward:before{content:\"\\f049\"}.fa-backward:before{content:\"\\f04a\"}.fa-play:before{content:\"\\f04b\"}.fa-pause:before{content:\"\\f04c\"}.fa-stop:before{content:\"\\f04d\"}.fa-forward:before{content:\"\\f04e\"}.fa-fast-forward:before{content:\"\\f050\"}.fa-step-forward:before{content:\"\\f051\"}.fa-eject:before{content:\"\\f052\"}.fa-chevron-left:before{content:\"\\f053\"}.fa-chevron-right:before{content:\"\\f054\"}.fa-plus-circle:before{content:\"\\f055\"}.fa-minus-circle:before{content:\"\\f056\"}.fa-times-circle:before{content:\"\\f057\"}.fa-check-circle:before{content:\"\\f058\"}.fa-question-circle:before{content:\"\\f059\"}.fa-info-circle:before{content:\"\\f05a\"}.fa-crosshairs:before{content:\"\\f05b\"}.fa-times-circle-o:before{content:\"\\f05c\"}.fa-check-circle-o:before{content:\"\\f05d\"}.fa-ban:before{content:\"\\f05e\"}.fa-arrow-left:before{content:\"\\f060\"}.fa-arrow-right:before{content:\"\\f061\"}.fa-arrow-up:before{content:\"\\f062\"}.fa-arrow-down:before{content:\"\\f063\"}.fa-mail-forward:before,.fa-share:before{content:\"\\f064\"}.fa-expand:before{content:\"\\f065\"}.fa-compress:before{content:\"\\f066\"}.fa-plus:before{content:\"\\f067\"}.fa-minus:before{content:\"\\f068\"}.fa-asterisk:before{content:\"\\f069\"}.fa-exclamation-circle:before{content:\"\\f06a\"}.fa-gift:before{content:\"\\f06b\"}.fa-leaf:before{content:\"\\f06c\"}.fa-fire:before{content:\"\\f06d\"}.fa-eye:before{content:\"\\f06e\"}.fa-eye-slash:before{content:\"\\f070\"}.fa-warning:before,.fa-exclamation-triangle:before{content:\"\\f071\"}.fa-plane:before{content:\"\\f072\"}.fa-calendar:before{content:\"\\f073\"}.fa-random:before{content:\"\\f074\"}.fa-comment:before{content:\"\\f075\"}.fa-magnet:before{content:\"\\f076\"}.fa-chevron-up:before{content:\"\\f077\"}.fa-chevron-down:before{content:\"\\f078\"}.fa-retweet:before{content:\"\\f079\"}.fa-shopping-cart:before{content:\"\\f07a\"}.fa-folder:before{content:\"\\f07b\"}.fa-folder-open:before{content:\"\\f07c\"}.fa-arrows-v:before{content:\"\\f07d\"}.fa-arrows-h:before{content:\"\\f07e\"}.fa-bar-chart-o:before{content:\"\\f080\"}.fa-twitter-square:before{content:\"\\f081\"}.fa-facebook-square:before{content:\"\\f082\"}.fa-camera-retro:before{content:\"\\f083\"}.fa-key:before{content:\"\\f084\"}.fa-gears:before,.fa-cogs:before{content:\"\\f085\"}.fa-comments:before{content:\"\\f086\"}.fa-thumbs-o-up:before{content:\"\\f087\"}.fa-thumbs-o-down:before{content:\"\\f088\"}.fa-star-half:before{content:\"\\f089\"}.fa-heart-o:before{content:\"\\f08a\"}.fa-sign-out:before{content:\"\\f08b\"}.fa-linkedin-square:before{content:\"\\f08c\"}.fa-thumb-tack:before{content:\"\\f08d\"}.fa-external-link:before{content:\"\\f08e\"}.fa-sign-in:before{content:\"\\f090\"}.fa-trophy:before{content:\"\\f091\"}.fa-github-square:before{content:\"\\f092\"}.fa-upload:before{content:\"\\f093\"}.fa-lemon-o:before{content:\"\\f094\"}.fa-phone:before{content:\"\\f095\"}.fa-square-o:before{content:\"\\f096\"}.fa-bookmark-o:before{content:\"\\f097\"}.fa-phone-square:before{content:\"\\f098\"}.fa-twitter:before{content:\"\\f099\"}.fa-facebook:before{content:\"\\f09a\"}.fa-github:before{content:\"\\f09b\"}.fa-unlock:before{content:\"\\f09c\"}.fa-credit-card:before{content:\"\\f09d\"}.fa-rss:before{content:\"\\f09e\"}.fa-hdd-o:before{content:\"\\f0a0\"}.fa-bullhorn:before{content:\"\\f0a1\"}.fa-bell:before{content:\"\\f0f3\"}.fa-certificate:before{content:\"\\f0a3\"}.fa-hand-o-right:before{content:\"\\f0a4\"}.fa-hand-o-left:before{content:\"\\f0a5\"}.fa-hand-o-up:before{content:\"\\f0a6\"}.fa-hand-o-down:before{content:\"\\f0a7\"}.fa-arrow-circle-left:before{content:\"\\f0a8\"}.fa-arrow-circle-right:before{content:\"\\f0a9\"}.fa-arrow-circle-up:before{content:\"\\f0aa\"}.fa-arrow-circle-down:before{content:\"\\f0ab\"}.fa-globe:before{content:\"\\f0ac\"}.fa-wrench:before{content:\"\\f0ad\"}.fa-tasks:before{content:\"\\f0ae\"}.fa-filter:before{content:\"\\f0b0\"}.fa-briefcase:before{content:\"\\f0b1\"}.fa-arrows-alt:before{content:\"\\f0b2\"}.fa-group:before,.fa-users:before{content:\"\\f0c0\"}.fa-chain:before,.fa-link:before{content:\"\\f0c1\"}.fa-cloud:before{content:\"\\f0c2\"}.fa-flask:before{content:\"\\f0c3\"}.fa-cut:before,.fa-scissors:before{content:\"\\f0c4\"}.fa-copy:before,.fa-files-o:before{content:\"\\f0c5\"}.fa-paperclip:before{content:\"\\f0c6\"}.fa-save:before,.fa-floppy-o:before{content:\"\\f0c7\"}.fa-square:before{content:\"\\f0c8\"}.fa-navicon:before,.fa-reorder:before,.fa-bars:before{content:\"\\f0c9\"}.fa-list-ul:before{content:\"\\f0ca\"}.fa-list-ol:before{content:\"\\f0cb\"}.fa-strikethrough:before{content:\"\\f0cc\"}.fa-underline:before{content:\"\\f0cd\"}.fa-table:before{content:\"\\f0ce\"}.fa-magic:before{content:\"\\f0d0\"}.fa-truck:before{content:\"\\f0d1\"}.fa-pinterest:before{content:\"\\f0d2\"}.fa-pinterest-square:before{content:\"\\f0d3\"}.fa-google-plus-square:before{content:\"\\f0d4\"}.fa-google-plus:before{content:\"\\f0d5\"}.fa-money:before{content:\"\\f0d6\"}.fa-caret-down:before{content:\"\\f0d7\"}.fa-caret-up:before{content:\"\\f0d8\"}.fa-caret-left:before{content:\"\\f0d9\"}.fa-caret-right:before{content:\"\\f0da\"}.fa-columns:before{content:\"\\f0db\"}.fa-unsorted:before,.fa-sort:before{content:\"\\f0dc\"}.fa-sort-down:before,.fa-sort-desc:before{content:\"\\f0dd\"}.fa-sort-up:before,.fa-sort-asc:before{content:\"\\f0de\"}.fa-envelope:before{content:\"\\f0e0\"}.fa-linkedin:before{content:\"\\f0e1\"}.fa-rotate-left:before,.fa-undo:before{content:\"\\f0e2\"}.fa-legal:before,.fa-gavel:before{content:\"\\f0e3\"}.fa-dashboard:before,.fa-tachometer:before{content:\"\\f0e4\"}.fa-comment-o:before{content:\"\\f0e5\"}.fa-comments-o:before{content:\"\\f0e6\"}.fa-flash:before,.fa-bolt:before{content:\"\\f0e7\"}.fa-sitemap:before{content:\"\\f0e8\"}.fa-umbrella:before{content:\"\\f0e9\"}.fa-paste:before,.fa-clipboard:before{content:\"\\f0ea\"}.fa-lightbulb-o:before{content:\"\\f0eb\"}.fa-exchange:before{content:\"\\f0ec\"}.fa-cloud-download:before{content:\"\\f0ed\"}.fa-cloud-upload:before{content:\"\\f0ee\"}.fa-user-md:before{content:\"\\f0f0\"}.fa-stethoscope:before{content:\"\\f0f1\"}.fa-suitcase:before{content:\"\\f0f2\"}.fa-bell-o:before{content:\"\\f0a2\"}.fa-coffee:before{content:\"\\f0f4\"}.fa-cutlery:before{content:\"\\f0f5\"}.fa-file-text-o:before{content:\"\\f0f6\"}.fa-building-o:before{content:\"\\f0f7\"}.fa-hospital-o:before{content:\"\\f0f8\"}.fa-ambulance:before{content:\"\\f0f9\"}.fa-medkit:before{content:\"\\f0fa\"}.fa-fighter-jet:before{content:\"\\f0fb\"}.fa-beer:before{content:\"\\f0fc\"}.fa-h-square:before{content:\"\\f0fd\"}.fa-plus-square:before{content:\"\\f0fe\"}.fa-angle-double-left:before{content:\"\\f100\"}.fa-angle-double-right:before{content:\"\\f101\"}.fa-angle-double-up:before{content:\"\\f102\"}.fa-angle-double-down:before{content:\"\\f103\"}.fa-angle-left:before{content:\"\\f104\"}.fa-angle-right:before{content:\"\\f105\"}.fa-angle-up:before{content:\"\\f106\"}.fa-angle-down:before{content:\"\\f107\"}.fa-desktop:before{content:\"\\f108\"}.fa-laptop:before{content:\"\\f109\"}.fa-tablet:before{content:\"\\f10a\"}.fa-mobile-phone:before,.fa-mobile:before{content:\"\\f10b\"}.fa-circle-o:before{content:\"\\f10c\"}.fa-quote-left:before{content:\"\\f10d\"}.fa-quote-right:before{content:\"\\f10e\"}.fa-spinner:before{content:\"\\f110\"}.fa-circle:before{content:\"\\f111\"}.fa-mail-reply:before,.fa-reply:before{content:\"\\f112\"}.fa-github-alt:before{content:\"\\f113\"}.fa-folder-o:before{content:\"\\f114\"}.fa-folder-open-o:before{content:\"\\f115\"}.fa-smile-o:before{content:\"\\f118\"}.fa-frown-o:before{content:\"\\f119\"}.fa-meh-o:before{content:\"\\f11a\"}.fa-gamepad:before{content:\"\\f11b\"}.fa-keyboard-o:before{content:\"\\f11c\"}.fa-flag-o:before{content:\"\\f11d\"}.fa-flag-checkered:before{content:\"\\f11e\"}.fa-terminal:before{content:\"\\f120\"}.fa-code:before{content:\"\\f121\"}.fa-mail-reply-all:before,.fa-reply-all:before{content:\"\\f122\"}.fa-star-half-empty:before,.fa-star-half-full:before,.fa-star-half-o:before{content:\"\\f123\"}.fa-location-arrow:before{content:\"\\f124\"}.fa-crop:before{content:\"\\f125\"}.fa-code-fork:before{content:\"\\f126\"}.fa-unlink:before,.fa-chain-broken:before{content:\"\\f127\"}.fa-question:before{content:\"\\f128\"}.fa-info:before{content:\"\\f129\"}.fa-exclamation:before{content:\"\\f12a\"}.fa-superscript:before{content:\"\\f12b\"}.fa-subscript:before{content:\"\\f12c\"}.fa-eraser:before{content:\"\\f12d\"}.fa-puzzle-piece:before{content:\"\\f12e\"}.fa-microphone:before{content:\"\\f130\"}.fa-microphone-slash:before{content:\"\\f131\"}.fa-shield:before{content:\"\\f132\"}.fa-calendar-o:before{content:\"\\f133\"}.fa-fire-extinguisher:before{content:\"\\f134\"}.fa-rocket:before{content:\"\\f135\"}.fa-maxcdn:before{content:\"\\f136\"}.fa-chevron-circle-left:before{content:\"\\f137\"}.fa-chevron-circle-right:before{content:\"\\f138\"}.fa-chevron-circle-up:before{content:\"\\f139\"}.fa-chevron-circle-down:before{content:\"\\f13a\"}.fa-html5:before{content:\"\\f13b\"}.fa-css3:before{content:\"\\f13c\"}.fa-anchor:before{content:\"\\f13d\"}.fa-unlock-alt:before{content:\"\\f13e\"}.fa-bullseye:before{content:\"\\f140\"}.fa-ellipsis-h:before{content:\"\\f141\"}.fa-ellipsis-v:before{content:\"\\f142\"}.fa-rss-square:before{content:\"\\f143\"}.fa-play-circle:before{content:\"\\f144\"}.fa-ticket:before{content:\"\\f145\"}.fa-minus-square:before{content:\"\\f146\"}.fa-minus-square-o:before{content:\"\\f147\"}.fa-level-up:before{content:\"\\f148\"}.fa-level-down:before{content:\"\\f149\"}.fa-check-square:before{content:\"\\f14a\"}.fa-pencil-square:before{content:\"\\f14b\"}.fa-external-link-square:before{content:\"\\f14c\"}.fa-share-square:before{content:\"\\f14d\"}.fa-compass:before{content:\"\\f14e\"}.fa-toggle-down:before,.fa-caret-square-o-down:before{content:\"\\f150\"}.fa-toggle-up:before,.fa-caret-square-o-up:before{content:\"\\f151\"}.fa-toggle-right:before,.fa-caret-square-o-right:before{content:\"\\f152\"}.fa-euro:before,.fa-eur:before{content:\"\\f153\"}.fa-gbp:before{content:\"\\f154\"}.fa-dollar:before,.fa-usd:before{content:\"\\f155\"}.fa-rupee:before,.fa-inr:before{content:\"\\f156\"}.fa-cny:before,.fa-rmb:before,.fa-yen:before,.fa-jpy:before{content:\"\\f157\"}.fa-ruble:before,.fa-rouble:before,.fa-rub:before{content:\"\\f158\"}.fa-won:before,.fa-krw:before{content:\"\\f159\"}.fa-bitcoin:before,.fa-btc:before{content:\"\\f15a\"}.fa-file:before{content:\"\\f15b\"}.fa-file-text:before{content:\"\\f15c\"}.fa-sort-alpha-asc:before{content:\"\\f15d\"}.fa-sort-alpha-desc:before{content:\"\\f15e\"}.fa-sort-amount-asc:before{content:\"\\f160\"}.fa-sort-amount-desc:before{content:\"\\f161\"}.fa-sort-numeric-asc:before{content:\"\\f162\"}.fa-sort-numeric-desc:before{content:\"\\f163\"}.fa-thumbs-up:before{content:\"\\f164\"}.fa-thumbs-down:before{content:\"\\f165\"}.fa-youtube-square:before{content:\"\\f166\"}.fa-youtube:before{content:\"\\f167\"}.fa-xing:before{content:\"\\f168\"}.fa-xing-square:before{content:\"\\f169\"}.fa-youtube-play:before{content:\"\\f16a\"}.fa-dropbox:before{content:\"\\f16b\"}.fa-stack-overflow:before{content:\"\\f16c\"}.fa-instagram:before{content:\"\\f16d\"}.fa-flickr:before{content:\"\\f16e\"}.fa-adn:before{content:\"\\f170\"}.fa-bitbucket:before{content:\"\\f171\"}.fa-bitbucket-square:before{content:\"\\f172\"}.fa-tumblr:before{content:\"\\f173\"}.fa-tumblr-square:before{content:\"\\f174\"}.fa-long-arrow-down:before{content:\"\\f175\"}.fa-long-arrow-up:before{content:\"\\f176\"}.fa-long-arrow-left:before{content:\"\\f177\"}.fa-long-arrow-right:before{content:\"\\f178\"}.fa-apple:before{content:\"\\f179\"}.fa-windows:before{content:\"\\f17a\"}.fa-android:before{content:\"\\f17b\"}.fa-linux:before{content:\"\\f17c\"}.fa-dribbble:before{content:\"\\f17d\"}.fa-skype:before{content:\"\\f17e\"}.fa-foursquare:before{content:\"\\f180\"}.fa-trello:before{content:\"\\f181\"}.fa-female:before{content:\"\\f182\"}.fa-male:before{content:\"\\f183\"}.fa-gittip:before{content:\"\\f184\"}.fa-sun-o:before{content:\"\\f185\"}.fa-moon-o:before{content:\"\\f186\"}.fa-archive:before{content:\"\\f187\"}.fa-bug:before{content:\"\\f188\"}.fa-vk:before{content:\"\\f189\"}.fa-weibo:before{content:\"\\f18a\"}.fa-renren:before{content:\"\\f18b\"}.fa-pagelines:before{content:\"\\f18c\"}.fa-stack-exchange:before{content:\"\\f18d\"}.fa-arrow-circle-o-right:before{content:\"\\f18e\"}.fa-arrow-circle-o-left:before{content:\"\\f190\"}.fa-toggle-left:before,.fa-caret-square-o-left:before{content:\"\\f191\"}.fa-dot-circle-o:before{content:\"\\f192\"}.fa-wheelchair:before{content:\"\\f193\"}.fa-vimeo-square:before{content:\"\\f194\"}.fa-turkish-lira:before,.fa-try:before{content:\"\\f195\"}.fa-plus-square-o:before{content:\"\\f196\"}.fa-space-shuttle:before{content:\"\\f197\"}.fa-slack:before{content:\"\\f198\"}.fa-envelope-square:before{content:\"\\f199\"}.fa-wordpress:before{content:\"\\f19a\"}.fa-openid:before{content:\"\\f19b\"}.fa-institution:before,.fa-bank:before,.fa-university:before{content:\"\\f19c\"}.fa-mortar-board:before,.fa-graduation-cap:before{content:\"\\f19d\"}.fa-yahoo:before{content:\"\\f19e\"}.fa-google:before{content:\"\\f1a0\"}.fa-reddit:before{content:\"\\f1a1\"}.fa-reddit-square:before{content:\"\\f1a2\"}.fa-stumbleupon-circle:before{content:\"\\f1a3\"}.fa-stumbleupon:before{content:\"\\f1a4\"}.fa-delicious:before{content:\"\\f1a5\"}.fa-digg:before{content:\"\\f1a6\"}.fa-pied-piper-square:before,.fa-pied-piper:before{content:\"\\f1a7\"}.fa-pied-piper-alt:before{content:\"\\f1a8\"}.fa-drupal:before{content:\"\\f1a9\"}.fa-joomla:before{content:\"\\f1aa\"}.fa-language:before{content:\"\\f1ab\"}.fa-fax:before{content:\"\\f1ac\"}.fa-building:before{content:\"\\f1ad\"}.fa-child:before{content:\"\\f1ae\"}.fa-paw:before{content:\"\\f1b0\"}.fa-spoon:before{content:\"\\f1b1\"}.fa-cube:before{content:\"\\f1b2\"}.fa-cubes:before{content:\"\\f1b3\"}.fa-behance:before{content:\"\\f1b4\"}.fa-behance-square:before{content:\"\\f1b5\"}.fa-steam:before{content:\"\\f1b6\"}.fa-steam-square:before{content:\"\\f1b7\"}.fa-recycle:before{content:\"\\f1b8\"}.fa-automobile:before,.fa-car:before{content:\"\\f1b9\"}.fa-cab:before,.fa-taxi:before{content:\"\\f1ba\"}.fa-tree:before{content:\"\\f1bb\"}.fa-spotify:before{content:\"\\f1bc\"}.fa-deviantart:before{content:\"\\f1bd\"}.fa-soundcloud:before{content:\"\\f1be\"}.fa-database:before{content:\"\\f1c0\"}.fa-file-pdf-o:before{content:\"\\f1c1\"}.fa-file-word-o:before{content:\"\\f1c2\"}.fa-file-excel-o:before{content:\"\\f1c3\"}.fa-file-powerpoint-o:before{content:\"\\f1c4\"}.fa-file-photo-o:before,.fa-file-picture-o:before,.fa-file-image-o:before{content:\"\\f1c5\"}.fa-file-zip-o:before,.fa-file-archive-o:before{content:\"\\f1c6\"}.fa-file-sound-o:before,.fa-file-audio-o:before{content:\"\\f1c7\"}.fa-file-movie-o:before,.fa-file-video-o:before{content:\"\\f1c8\"}.fa-file-code-o:before{content:\"\\f1c9\"}.fa-vine:before{content:\"\\f1ca\"}.fa-codepen:before{content:\"\\f1cb\"}.fa-jsfiddle:before{content:\"\\f1cc\"}.fa-life-bouy:before,.fa-life-saver:before,.fa-support:before,.fa-life-ring:before{content:\"\\f1cd\"}.fa-circle-o-notch:before{content:\"\\f1ce\"}.fa-ra:before,.fa-rebel:before{content:\"\\f1d0\"}.fa-ge:before,.fa-empire:before{content:\"\\f1d1\"}.fa-git-square:before{content:\"\\f1d2\"}.fa-git:before{content:\"\\f1d3\"}.fa-hacker-news:before{content:\"\\f1d4\"}.fa-tencent-weibo:before{content:\"\\f1d5\"}.fa-qq:before{content:\"\\f1d6\"}.fa-wechat:before,.fa-weixin:before{content:\"\\f1d7\"}.fa-send:before,.fa-paper-plane:before{content:\"\\f1d8\"}.fa-send-o:before,.fa-paper-plane-o:before{content:\"\\f1d9\"}.fa-history:before{content:\"\\f1da\"}.fa-circle-thin:before{content:\"\\f1db\"}.fa-header:before{content:\"\\f1dc\"}.fa-paragraph:before{content:\"\\f1dd\"}.fa-sliders:before{content:\"\\f1de\"}.fa-share-alt:before{content:\"\\f1e0\"}.fa-share-alt-square:before{content:\"\\f1e1\"}.fa-bomb:before{content:\"\\f1e2\"}\n /* General */\n.dialog {\n box-shadow: 0 1px 2px rgba(0, 0, 0, .15);\n border: 1px solid;\n display: block;\n padding: 0;\n}\n.field {\n background-color: #FFF;\n border: 1px solid #CCC;\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n color: #333;\n font-family: inherit;\n font-size: 13px;\n margin: 0;\n padding: 2px 4px 3px;\n outline: none;\n transition: color .25s, border-color .25s, flex .25s;\n}\n.field::-moz-placeholder {\n color: #AAA;\n opacity: 1;\n}\n.field:hover {\n border-color: #999;\n}\n.field:hover, .field:focus {\n color: #000;\n}\n.field[disabled] {\n background-color: #F2F2F2;\n color: #888;\n}\n.field::-webkit-search-decoration {\n display: none;\n}\n.move {\n cursor: move;\n}\nlabel, .watcher-toggler {\n cursor: pointer;\n}\na[href=\"javascript:;\"] {\n text-decoration: none;\n}\n.warning {\n color: red;\n}\n\n/* 4chan style fixes */\n.opContainer, .op {\n display: block !important;\n}\n.post {\n overflow: visible !important;\n}\n.reply > .file > .fileText {\n margin: 0 20px;\n}\n[hidden] {\n display: none !important;\n}\n\n/* fixed, z-index */\n#overlay,\n#qp, #ihover,\n#updater, #thread-stats,\n#navlinks, #header,\n#qr {\n position: fixed;\n}\n#overlay {\n z-index: 999;\n}\n#notifications {\n z-index: 70;\n}\n#qp, #ihover {\n z-index: 60;\n}\n#menu {\n z-index: 50;\n}\n#navlinks, #updater, #thread-stats {\n z-index: 40;\n}\n#qr {\n z-index: 30;\n}\n#thread-watcher:hover {\n z-index: 20;\n}\n#header {\n z-index: 10;\n}\n#thread-watcher {\n z-index: 5;\n}\n\n/* Header */\n:root.top-header body {\n margin-top: 2em;\n}\n:root.bottom-header body {\n margin-bottom: 2em;\n}\nbody > .desktop:not(hr):not(.navLinks):not(#boardNavDesktop):not(#boardNavDesktopFoot),\n:root.fourchan-x #navtopright,\n:root.fourchan-x #navbotright,\n:root.fourchan-x:not(.show-original-top-board-list) #boardNavDesktop,\n:root.fourchan-x:not(.show-original-bot-board-list) #boardNavDesktopFoot {\n display: none !important;\n}\n#header {\n right: 0;\n left: 0;\n pointer-events: none;\n}\n#header.top {\n top: 0;\n}\n#header.bottom {\n bottom: 0;\n}\n#header-bar {\n border-width: 0;\n display: flex;\n padding: 3px;\n position: relative;\n transition: all .1s .05s ease-in-out;\n pointer-events: initial;\n}\n#header.top #header-bar {\n border-bottom-width: 1px;\n}\n#header.bottom #header-bar {\n box-shadow: 0 -1px 2px rgba(0, 0, 0, .15);\n border-top-width: 1px;\n}\n#board-list {\n flex: 1;\n align-self: center;\n text-align: center;\n}\n#header-bar.autohide:not(:hover) {\n box-shadow: none;\n transition: all .8s .6s cubic-bezier(.55, .055, .675, .19);\n}\n#header-bar.scroll:not(:hover) {\n transition: -webkit-transform .2s !important;\n transition: transform .2s !important;\n}\n#header.top #header-bar.autohide:not(:hover) {\n margin-bottom: -1em;\n -webkit-transform: translateY(-100%);\n transform: translateY(-100%);\n}\n#header.bottom #header-bar.autohide:not(:hover) {\n -webkit-transform: translateY(100%);\n transform: translateY(100%);\n}\n#header-bar-hitzone {\n left: 0;\n right: 0;\n height: 10px;\n position: absolute;\n}\n#header-bar:not(.autohide) #header-bar-hitzone {\n display: none;\n}\n#header.top #header-bar-hitzone {\n bottom: -10px;\n}\n#header.bottom #header-bar-hitzone {\n top: -10px;\n}\n#header-bar a:not(.entry) {\n text-decoration: none;\n padding: 1px;\n}\n.shortcut:not(:last-child)::after {\n content: \" / \";\n}\n.brackets-wrap::before {\n content: \" [ \";\n}\n.brackets-wrap::after {\n content: \" ] \";\n}\n\n/* Notifications */\n#notifications {\n height: 0;\n text-align: center;\n pointer-events: initial;\n}\n#header.bottom #notifications {\n position: fixed;\n top: 0;\n left: 0;\n width: 100%;\n}\n.notification {\n color: #FFF;\n font-weight: 700;\n text-shadow: 0 1px 2px rgba(0, 0, 0, .5);\n box-shadow: 0 1px 2px rgba(0, 0, 0, .15);\n border-radius: 2px;\n margin: 1px auto;\n width: 500px;\n max-width: 100%;\n position: relative;\n transition: all .25s ease-in-out;\n}\n.notification.error {\n background-color: hsla(0, 100%, 38%, .9);\n}\n.notification.warning {\n background-color: hsla(36, 100%, 38%, .9);\n}\n.notification.info {\n background-color: hsla(200, 100%, 38%, .9);\n}\n.notification.success {\n background-color: hsla(104, 100%, 38%, .9);\n}\n.notification a {\n color: white;\n}\n.notification > .close {\n padding: 7px;\n top: 0;\n right: 0;\n position: absolute;\n}\n.message {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n padding: 6px 20px;\n max-height: 200px;\n width: 100%;\n overflow: auto;\n}\n\n/* Settings */\n:root.fourchan-x body {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n}\n#overlay {\n background-color: rgba(0, 0, 0, .5);\n display: flex;\n position: fixed;\n top: 0;\n left: 0;\n height: 100%;\n width: 100%;\n}\n#fourchanx-settings {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n box-shadow: 0 0 15px rgba(0, 0, 0, .15);\n height: 600px;\n max-height: 100%;\n width: 900px;\n max-width: 100%;\n margin: auto;\n padding: 3px;\n display: flex;\n flex-direction: column;\n}\n#fourchanx-settings > nav {\n display: flex;\n padding: 2px 2px .5em;\n}\n#fourchanx-settings > nav a {\n text-decoration: underline;\n}\n#fourchanx-settings > nav a.close {\n text-decoration: none;\n padding: 0 2px;\n}\n.sections-list {\n flex: 1;\n}\n.tab-selected {\n font-weight: 700;\n}\n#fourchanx-settings > section {\n flex: 1;\n overflow: auto;\n}\n.section-sauce ul,\n.section-rice ul {\n list-style: none;\n margin: 0;\n padding: 8px;\n}\n.section-sauce li,\n.section-rice li {\n padding-left: 4px;\n}\n.section-main label {\n text-decoration: underline;\n}\n.section-filter ul,\n.section-qr ul {\n padding: 0;\n}\n.section-filter li,\n.section-qr li {\n margin: 10px 40px;\n}\n.section-filter textarea {\n height: 500px;\n}\n.section-qr textarea {\n height: 200px;\n}\n.section-qr fieldset:nth-child(2) div {\n margin-top: 4px;\n}\n.section-sauce textarea {\n height: 350px;\n}\n.section-rice .field[name=\"boardnav\"] {\n width: 100%;\n}\n.section-rice textarea {\n height: 150px;\n}\n.section-archives table {\n width: 100%;\n}\n.section-archives th:not(:first-child) {\n width: 30%;\n}\n.section-archives td {\n text-align: center;\n}\n.section-archives select {\n width: 90%;\n}\n.section-keybinds .field {\n font-family: monospace;\n}\n#fourchanx-settings fieldset {\n border: 1px solid;\n border-radius: 3px;\n}\n#fourchanx-settings legend {\n font-weight: 700;\n}\n#fourchanx-settings textarea {\n font-family: monospace;\n min-width: 100%;\n max-width: 100%;\n}\n#fourchanx-settings code {\n color: #000;\n background-color: #FFF;\n padding: 0 2px;\n}\n.unscroll {\n overflow: hidden;\n}\n\n/* Index */\n:root.index-loading .navLinks,\n:root.index-loading .board,\n:root.index-loading .pagelist,\n:root:not(.catalog-mode) #index-size {\n display: none;\n}\n#nav-links {\n display: flex;\n align-items: baseline;\n}\n#index-search {\n padding-right: 1.5em;\n width: 100px;\n transition: color .25s, border-color .25s, width .25s;\n}\n#index-search:focus,\n#index-search[data-searching] {\n width: 200px;\n}\n#index-search-clear {\n color: gray;\n position: relative;\n left: -1.25em;\n width: 0;\n}\n\n#index-search:not([data-searching]) + #index-search-clear {\n display: none;\n}\n.page-num {\n font-family: inherit;\n}\n.page-num::before {\n font-family: FontAwesome;\n}\n.summary {\n text-decoration: none;\n}\n.catalog-mode .board {\n display: flex;\n flex-wrap: wrap;\n justify-content: center;\n}\n.catalog-thread {\n display: inline-flex;\n flex-direction: column;\n align-items: center;\n margin: 0 2px 5px;\n word-break: break-word;\n}\n.catalog-small .catalog-thread {\n width: 165px;\n max-height: 320px;\n}\n.catalog-large .catalog-thread {\n width: 270px;\n max-height: 410px;\n}\n.thumb {\n flex-shrink: 0;\n position: relative;\n background-size: 100% 100%;\n background-repeat: no-repeat;\n background-position: center;\n border-radius: 2px;\n box-shadow: 0 0 5px rgba(0, 0, 0, .25);\n}\n.thumb:not(.deleted-file):not(.no-file) {\n min-width: 30px;\n min-height: 30px;\n}\n.thumb.spoiler-file {\n background-size: 100px;\n width: 100px;\n height: 100px;\n}\n.thumb.deleted-file {\n background-size: 127px 13px;\n width: 127px;\n height: 13px;\n padding: 20px 11px;\n}\n.thumb.no-file {\n background-size: 77px 13px;\n width: 77px;\n height: 13px;\n padding: 20px 36px;\n}\n.thread-icons > img {\n width: 1em;\n height: 1em;\n margin: 0;\n vertical-align: text-top;\n}\n.thumb:not(:hover):not(:focus) > .menu-button:not(.open):not(:focus) > i {\n display: none;\n}\n.thumb > .menu-button {\n position: absolute;\n top: 0;\n right: 0;\n}\n.thumb > .menu-button > i {\n width: 1em;\n height: 1em;\n padding: 1px;\n border-radius: 0 2px 0 2px;\n font-size: 14px;\n text-align: center;\n\n line-height: normal;\n\n}\n.thread-stats {\n flex-shrink: 0;\n cursor: help;\n font-size: 10px;\n font-weight: 700;\n margin-top: 2px;\n}\n.catalog-thread > .subject {\n flex-shrink: 0;\n font-weight: 700;\n line-height: 1;\n text-align: center;\n}\n.catalog-thread > .comment {\n flex-shrink: 1;\n align-self: stretch;\n overflow: hidden;\n text-align: center;\n}\n.thread-info {\n position: fixed;\n background-color: inherit;\n padding: 2px;\n border-radius: 2px;\n box-shadow: 0 0 5px rgba(0, 0, 0, .25);\n}\n.thread-info .post {\n margin: 0;\n}\n\n/* Announcement Hiding */\n:root.hide-announcement #globalMessage,\n:root.hide-announcement-enabled #toggleMsgBtn {\n display: none;\n}\na.hide-announcement {\n float: left;\n font-size: 14px;\n}\n\n/* Unread */\n#unread-line {\n margin: 0;\n}\n\n/* Thread Updater */\n#updater:not(:hover) {\n background: none;\n border: none;\n box-shadow: none;\n}\n#updater > .move {\n padding: 0 3px;\n}\n#updater > div:last-child {\n text-align: center;\n}\n#updater input[type=\"number\"] {\n width: 4em;\n}\n#updater:not(:hover) > div:not(.move) {\n display: none;\n}\n#updater input[type=\"button\"] {\n width: 100%;\n}\n.new {\n color: limegreen;\n}\n\n/* Thread Watcher */\n#thread-watcher {\n max-width: 200px;\n min-width: 150px;\n padding: 3px;\n position: absolute;\n}\n#thread-watcher > div:first-child {\n display: flex;\n align-items: center;\n}\n#thread-watcher .move {\n flex: 1;\n}\n#watcher-status:not(:empty)::before {\n content: \"(\";\n}\n#watcher-status:not(:empty)::after {\n content: \")\";\n}\n#watched-threads:not(:hover) {\n max-height: 150px;\n overflow: hidden;\n}\n#watched-threads div {\n overflow: hidden;\n text-overflow: ellipsis;\n white-space: nowrap;\n}\n#watched-threads .current {\n font-weight: 700;\n}\n#watched-threads a {\n text-decoration: none;\n}\n#watched-threads .dead-thread a[title] {\n text-decoration: line-through;\n}\n\n/* Thread Stats */\n#thread-stats {\n background: none;\n border: none;\n box-shadow: none;\n}\n\n/* Quote */\n.deadlink {\n text-decoration: none !important;\n}\n.backlink.deadlink:not(.forwardlink),\n.quotelink.deadlink:not(.forwardlink) {\n text-decoration: underline !important;\n}\n.inlined {\n opacity: .5;\n}\n#qp input, .forwarded {\n display: none;\n}\n.quotelink.forwardlink,\n.backlink.forwardlink {\n text-decoration: none;\n border-bottom: 1px dashed;\n}\n@supports (text-decoration-style: dashed) or (-moz-text-decoration-style: dashed) {\n .quotelink.forwardlink,\n .backlink.forwardlink {\n   text-decoration: underline;\n   -moz-text-decoration-style: dashed;\n   text-decoration-style: dashed;\n   border-bottom: none;\n }\n}\n.filtered {\n text-decoration: underline line-through;\n}\n.inline {\n border: 1px solid;\n display: table;\n margin: 2px 0;\n}\n.inline .post {\n border: 0 !important;\n background-color: transparent !important;\n display: table !important;\n margin: 0 !important;\n padding: 1px 2px !important;\n}\n#qp > .opContainer::after {\n content: '';\n clear: both;\n display: table;\n}\n#qp .post {\n border: none;\n margin: 0;\n padding: 2px 2px 5px;\n}\n#qp img {\n max-height: 80vh;\n max-width: 50vw;\n}\n.qphl {\n outline: 2px solid rgba(216, 94, 49, .7);\n}\n\n/* File */\n.file-info:hover .fntrunc,\n.file-info:not(:hover) .fnfull,\n.expanded-image > .post > .file > .fileThumb > img[data-md5],\n:not(.expanded-image) > .post > .file > .fileThumb > .full-image {\n display: none;\n}\n.expanding {\n opacity: .5;\n}\n.expanded-image {\n clear: both;\n}\n.expanded-image > .op > .file::after {\n content: '';\n clear: both;\n display: table;\n}\n:root.fit-height .full-image {\n max-height: 100vh;\n}\n:root.fit-width .full-image {\n max-width: 100%;\n}\n:root.gecko.fit-width .full-image {\n width: 100%;\n}\n.fileThumb > .warning {\n clear: both;\n}\n#ihover {\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n max-height: 100%;\n max-width: 75%;\n padding-bottom: 16px;\n}\n\n/* Index/Reply Navigation */\n#navlinks {\n font-size: 16px;\n top: 25px;\n right: 10px;\n}\n\n/* Filter */\n.opContainer.filter-highlight {\n box-shadow: inset 5px 0 rgba(255, 0, 0, .5);\n}\n.filter-highlight > .reply {\n box-shadow: -5px 0 rgba(255, 0, 0, .5);\n}\n.pinned .thumb,\n.filter-highlight .thumb {\n border: 2px solid rgba(255, 0, 0, .5);\n}\n\n/* Post Hiding */\n.hide-post-button,\n.show-post-button {\n font-size: 14px;\n line-height: 12px; /* Prevent the floating effect from affecting the thumbnail too */\n}\n.opContainer > .show-post-button,\n.hide-post-button {\n float: left;\n margin-right: 3px;\n}\n.stub input {\n display: inline-block;\n}\n\n/* QR */\n:root.hide-original-post-form #postForm,\n:root.hide-original-post-form #togglePostFormLink,\n#qr.autohide:not(.has-focus):not(:hover) > form {\n display: none;\n}\n#qr select, #dump-button, #url-button, .remove, .captcha-img {\n cursor: pointer;\n}\n#qr > div {\n min-width: 300px;\n display: flex;\n align-items: center;\n}\n#qr .move {\n align-self: stretch;\n flex: 1;\n}\n#qr select[data-name=thread] {\n margin: 0;\n -webkit-appearance: none;\n -moz-appearance: none;\n appearance: none;\n border: none;\n background: none;\n font: inherit;\n}\n#qr option {\n color: #000;\n background-color: #F7F7F7;\n}\n#qr .close {\n padding: 0 3px;\n}\n#qr > form {\n display: flex;\n flex-direction: column;\n}\n.persona {\n display: flex;\n}\n.persona .field {\n flex: 1;\n width: 0;\n}\n.persona .field:hover,\n.persona .field:focus {\n flex: 3;\n}\n\n#dump-button {\n background: linear-gradient(#EEE, #CCC);\n border: 1px solid #CCC;\n margin: 0;\n padding: 2px 4px 3px;\n outline: none;\n width: 30px;\n}\n#dump-button:hover,\n#dump-button:focus {\n background: linear-gradient(#FFF, #DDD);\n}\n#dump-button:active,\n.dump #dump-button:not(:hover):not(:focus) {\n background: linear-gradient(#CCC, #DDD);\n}\n:root.gecko #dump-button {\n padding: 0;\n}\n#qr:not(.dump) #dump-list,\n#qr:not(.dump) #add-post {\n display: none;\n}\n#dump-list {\n counter-reset: qrpreviews;\n width: 0;\n min-width: 100%;\n overflow: hidden;\n white-space: nowrap;\n position: relative;\n -webkit-user-select: none;\n -moz-user-select: none;\n user-select: none;\n}\n#dump-list:hover {\n padding-bottom: 12px;\n margin-bottom: -12px;\n overflow-x: auto;\n z-index: 1;\n}\n#dump-list::-webkit-scrollbar {\n height: 12px;\n}\n#dump-list::-webkit-scrollbar-thumb {\n border: 1px solid;\n}\n.qr-preview {\n background-position: 50% 20%;\n background-size: cover;\n border: 1px solid #808080;\n color: #FFF !important;\n font-size: 12px;\n -moz-box-sizing: border-box;\n box-sizing: border-box;\n cursor: move;\n display: inline-block;\n height: 92px;\n width: 92px;\n margin: 4px;\n padding: 2px;\n opacity: .6;\n outline: none;\n overflow: hidden;\n position: relative;\n text-shadow: 0 0 2px #000;\n transition: opacity .25s ease-in-out;\n vertical-align: top;\n white-space: pre;\n}\n.qr-preview:hover,\n.qr-preview:focus {\n opacity: .9;\n color: #FFF !important;\n}\n.qr-preview#selected {\n opacity: 1;\n}\n.qr-preview::before {\n counter-increment: qrpreviews;\n content: counter(qrpreviews);\n font-weight: 700;\n text-shadow: 0 0 3px #000, 0 0 5px #000;\n position: absolute;\n top: 3px;\n right: 3px;\n}\n.qr-preview.drag {\n border-color: red;\n border-style: dashed;\n opacity: 1;\n}\n.qr-preview.over {\n border-color: #FFF;\n border-style: dashed;\n opacity: 1;\n}\na.remove {\n color: #E00 !important;\n padding: 1px;\n}\n.qr-preview > label {\n background: rgba(0, 0, 0, .5);\n right: 0;\n bottom: 0;\n left: 0;\n position: absolute;\n text-align: center;\n}\n.qr-preview > label > input {\n margin: 1px 0;\n vertical-align: bottom;\n}\n#add-post {\n align-self: flex-end;\n font-size: 20px;\n width: 1em;\n margin-top: -1em;\n text-align: center;\n z-index: 1;\n}\n[name='qr-proceed'] {\n position: absolute;\n right: 6px;\n bottom: 28px;\n z-index: 1;\n}\n#qr textarea {\n min-height: 160px;\n min-width: 100%;\n display: block;\n}\n#qr.has-captcha textarea {\n min-height: 120px;\n}\n.textarea {\n position: relative;\n}\n#char-count {\n color: #000;\n background: hsla(0, 0%, 100%, .5);\n font-size: 8pt;\n position: absolute;\n bottom: 1px;\n right: 1px;\n pointer-events: none;\n}\n#char-count.warning {\n color: red;\n}\n.captcha-img {\n background: #FFF;\n outline: 1px solid #CCC;\n outline-offset: -1px;\n}\n.captcha-img > img {\n display: block;\n height: 57px;\n width: 300px;\n}\n#file-n-submit {\n display: flex;\n align-items: center;\n}\n#file-n-submit input {\n margin: 0;\n}\n#file-n-submit input[type='submit'] {\n order: 1;\n}\n#file-n-submit.has-file #qr-no-file,\n#file-n-submit:not(.has-file) #qr-filename,\n#file-n-submit:not(.has-file) #qr-filesize,\n#file-n-submit:not(.has-file) #qr-file-spoiler,\n#file-n-submit:not(.has-file) #qr-filerm,\n#qr-filename:focus ~ #qr-filesize {\n display: none;\n}\n#qr-no-file,\n#qr-filename,\n#qr-filesize,\n#qr-filerm,\n#qr-file-spoiler {\n margin: 0 1px !important;\n}\n#qr-no-file {\n cursor: default;\n flex: 1;\n}\n#qr-filename {\n -webkit-appearance: none;\n -moz-appearance: none;\n appearance: none;\n background: none;\n border: none;\n color: inherit;\n font: inherit;\n flex: 1;\n width: 0;\n padding: 0;\n text-overflow: ellipsis;\n}\n#qr-filesize {\n font-size: .8em;\n}\n#qr-filesize::before {\n content: \"(\";\n}\n#qr-filesize::after {\n content: \")\";\n}\n\n/* Menu */\n.menu-button {\n position: relative;\n}\n@media screen and (resolution: 1dppx) {\n .fa-bars {\n   font-size: 14px;\n }\n #shortcuts .fa-bars {\n   vertical-align: -1px;\n }\n}\n#menu {\n border-bottom: 0;\n display: flex;\n margin: 2px 0;\n flex-direction: column;\n position: absolute;\n outline: none;\n}\n#menu.top {\n top: 100%;\n}\n#menu.bottom {\n bottom: 100%;\n}\n#menu.left {\n left: 0;\n}\n#menu.right {\n right: 0;\n}\n.entry {\n cursor: pointer;\n outline: none;\n padding: 3px 7px;\n position: relative;\n text-decoration: none;\n white-space: nowrap;\n}\n.entry.disabled {\n color: graytext !important;\n}\n.entry.has-submenu {\n padding-right: 20px;\n}\n.has-submenu::after {\n content: '';\n border-left:   6px solid;\n border-top:    4px solid transparent;\n border-bottom: 4px solid transparent;\n display: inline-block;\n margin: 4px;\n position: absolute;\n right: 3px;\n}\n.has-submenu:not(.focused) > .submenu {\n display: none;\n}\n.submenu {\n border-bottom: 0;\n display: flex;\n flex-direction: column;\n position: absolute;\n margin: -1px 0;\n}\n.submenu.top {\n top: 0;\n}\n.submenu.bottom {\n bottom: 0;\n}\n.submenu.left {\n left: 100%;\n}\n.submenu.right {\n right: 100%;\n}\n.entry input {\n margin: 0;\n}\n\n/* Other */\n.linkified {\n text-decoration: underline;\n word-break: break-all;\n}\n.painted .hand {\n padding: 0 5px;\n border-radius: 6px;\n font-size: 0.8em;\n}\n\n/* Embedding & ReportLink */\n#embedding,\n#report {\n padding: 1px 4px 1px 4px;\n z-index: 11;\n position: fixed;\n}\n#embedding.empty,\n#report.empty {\n display: none;\n}\n#embedding > div:first-child,\n#report > div:first-child {\n display: flex;\n}\n#embedding .move,\n#report .move {\n flex: 1;\n}\n#embedding .jump,\n#report .jump {\n margin: -1px 4px;\n text-decoration: none;\n}\n\n/* Link Titles */\n.linkified.title {\n background: transparent left bottom 1px no-repeat;\n padding-left: 18px;\n}\n.linkified.youtube {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAAA2FBMVEX////IEgvIEgzFEgvGEQvFEQvFEgrGEgvFEQrGEQrBEQvBEgvBEQrbnZvJMy3CEQvCEgvCEgrCEQq9EQu9EQrRY1+8EQq3EQq4EQq4EAq3EAu4EQuyEAqzEAmzEAqyEAnTmpitEAqsDwmtEAmsEAqsjYyOMC2tDwqsEAmtDwmmDwqmDwmnDwpvFBCYDginDwmhDgmiDgmhDwmhDwiIU1F0CgeiDwmiDgidDgicDgmcDghcCAWBDAidDgmXDgmYDQmYDQiXDgiYDgmXDQiUDQiUDgiTDQiUDQmlDXXhAAAAAXRSTlOArV5bRgAAAIZJREFUCB0FwbFxwzAQAMG7/wdJaUaRxyWoAwUuwP03ImUeJiQBeFcBnAAAVIAzdKRHjAjvOjC82rkcq0fdEPjwbZlkVAkC78djOG3VQAX+vi7IXk1HCDxdz6Z1E5nw3BxbT2pxxkheerUzx+KPTlQ7zLqIZW/72rJFLds9t91ftccAcGbnHzmrJ8ML23cLAAAAAElFTkSuQmCC');\n}\n.linkified.soundcloud {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAAAulBMVEX/lTH/kC7/kS//kS7/kC/+iyz/iyz/iiz+iiz/iiv/iyv+gij/gyj+gyj949L+69782L//gyf+eyT+eiT5o2/95tf707r++fX////84tH/eyT/eyP/eiT+ch//ch/+ciD7pXr949f7zrj4qHz/cR/+cR//aRr+aBr8zLf+7OP+aBv/YBb+Xxb+28v+VhL9yLL8wqv+VxH+Tg3+Tw3/Tg3+Rgn+Rwn+Rwr+Rgr/Rwr+QAb+QQb+QQf/QQeNThm+AAAAbUlEQVQIHV3BQQ6CQBAAwe5hFgU08ej/P+jBeBJ3xGg4WMU/tUKgi/TApqUdo4erlaOARejaAvMAVrhBZ3suftzZ1PwcjWnyyM9jGSNaO7O7RcsB2V0l0zrNceEreg5SrQYoKype2bQE7FAwvgF8TBzvXF7GTAAAAABJRU5ErkJggg==');\n}\n.linkified.vimeo {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAMCAMAAABcOc2zAAABFFBMVEUNrdYOrdYRrtcds9kUr9cRr9c4u95Cv98XsNgdstlax+Sg3u5iyuQZsdgZstmQ2+32/P7///9gyeM8vt+z5vPu+PuX1+iAyd72+/q33+oSrdUaqM6kvcbg5+rw9feVytoHnsY6l7J4orDm7O7Y5OggsNUJocsqi6nA09nf6+9Zp70MoMcHkbcCeJu+2uL//vw5udkMrNZDweH//Pv9/v6009wLjK8JptB3wNX18/RmzOU4u9y+5/LP3OEphaIJpc5Bp8Te5urk9vrk9fnc3+JKlqwIocoOlbrB3OXe4OJblKcElrwKqdJqs8jv7e3R19tPjaMFjbQMrNQMkLRPhZdUe4sgdZAJkbcTm8AXo8gPrdYQrtZ3sFJoAAAAhElEQVQIWz3JoQ5BUQCA4f+3c3fdnc2miTaFTRMoTPAGilcUNIoqKaS7eQrFDRgjnEv9vgAgH6ChLwhApt4pVG8EaKk+274JCQof5B21KoRAV+M1qlZRCEQ1QU8hUDK2fxloOUwAx7k0PY10n4Bczkx0Rw2Z08NM5QfbpQtd8wc2q/rhC5SoGNjPs3zpAAAAAElFTkSuQmCC');\n}\n.linkified.gist {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA8FBMVEUAAAAQEBASEhITExMUEhIAAAAUERETExMUERETEREODg4AAAANDQ0UEhIUExMAAAAEBAQNDQ0SEhIAAAAAAAAAAAAODg4PDw8UExMUExMPDw8QEBAUExMUFBQUExMUFBQAAAAUExMTExMQEBATExMWExMBAQERDw8RDAwRDQ0UExMTExMPDw8AAAABAQECAgIHBwcCAgIREREUFBQRBQUNDQ0PDg4PDw8TExMUExMREREPDw8AAAAUExMUEhIUFBQUExMUExMAAAAAAAATERETERETExMODg4PDw8UERETExMXFRUVFBQPDQ8CAgIQEBDkw8rYAAAAS3RSTlMAPpfZ8gOixqTBNoHc2Pd0NziYDAoBNEDe+SEf+OH28ALxT0zanPz7OzrnmjD57fZA6y2ZLFzBIo/uHhAN9a+W/O0ZGIV2xRIRsWkFyBMHAAAApklEQVQYGQXBBUICAAAEsJGCCgooJojd3d15xv9/4wYKxVK5XCoWAJVqkiRJtQKVoSRJkmSoglrqwyOjjUZzbLyeGq2krTNBZ1I7aakmXYCppGo6M7MAc/OZ1kwPgF6a+lkYAAwW01dKlgCWkxWr32vrG8DmVrJt52d373e/xcFhkhxxnJPTs3O6f0kuoH55dY2b2+QOuH94fOI5eQF4fXvn4/ML/gHiYxySqXmtTgAAAABJRU5ErkJggg==');\n}\n.linkified.dailymotion {\n background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEUAAAAAov8Aov8Aov8Aov8Aov8Aov8Aov/+1wD+1wD+1wD+1wD+1wD+1wD+1wDyxQDywADyxQDyxQDywADywADyxQDywADxpwDxqwDxpwDxqwDxpwDxqwDxpwDxqwDxpwD+1wDXqwD/63zywAAAov/yxQDxpwAwJubKAAAAIHRSTlMAcM8KDwuvB2CPEK/f74AQQCBwjxDPvxAgQGCAr6/v310R/FsAAABySURBVHheXcvpEoIwDIXRULUgEtz37aYtvv8jymjQhjv9851JSVcUZOb6Z3ri3DSTNPNEvkyZUDWvtXUBC7LQsOkWLHkvGQ2v/r3eILBsdz/YCwIQD0ftUycAJMpZ4fIBRLkq3LrvF7krPIaL5xhefbwBKzcKOdbl80gAAAAASUVORK5CYII=');\n}\n\n /* General */\n:root.yotsuba .dialog {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.yotsuba .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.yotsuba #header-bar {\n font-size: 9pt;\n color: #B86;\n}\n:root.yotsuba #header-bar a {\n color: #800000;\n}\n\n/* Settings */\n:root.yotsuba #fourchanx-settings fieldset {\n border-color: #D9BFB7;\n}\n\n/* Quote */\n:root.yotsuba .backlink.deadlink {\n color: #00E !important;\n}\n:root.yotsuba .inline {\n border-color: #D9BFB7;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.yotsuba .hide-post-button,\n:root.yotsuba .show-post-button {\n color: #E0BFB7;\n}\n\n/* QR */\n:root.yotsuba #qr select {\n color: #00E;\n}\n:root.yotsuba #qr select:hover {\n color: red;\n}\n.yotsuba #dump-list::-webkit-scrollbar-thumb {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.yotsuba .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.yotsuba #menu {\n color: #800000;\n}\n:root.yotsuba .entry {\n border-bottom: 1px solid #D9BFB7;\n font-size: 10pt;\n}\n:root.yotsuba .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.yotsuba .thumb > .menu-button > i {\n background: #FFE;\n}\n\n /* General */\n:root.yotsuba-b .dialog {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.yotsuba-b .field:focus {\n border-color: #98E;\n}\n\n/* Header */\n:root.yotsuba-b #header-bar {\n font-size: 9pt;\n color: #89A;\n}\n:root.yotsuba-b #header-bar a {\n color: #34345C;\n}\n\n/* Settings */\n:root.yotsuba-b #fourchanx-settings fieldset {\n border-color: #B7C5D9;\n}\n\n/* Quote */\n:root.yotsuba-b .backlink.deadlink {\n color: #34345C !important;\n}\n:root.yotsuba-b .inline {\n border-color: #B7C5D9;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.yotsuba-b .hide-post-button,\n:root.yotsuba-b .show-post-button {\n color: #B7C5D9;\n}\n\n/* QR */\n:root.yotsuba-b #qr select {\n color: #34345C;\n}\n:root.yotsuba-b #qr select:hover {\n color: #DD0000;\n}\n.yotsuba-b #dump-list::-webkit-scrollbar-thumb {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.yotsuba-b .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.yotsuba-b #menu {\n color: #000;\n}\n:root.yotsuba-b .entry {\n border-bottom: 1px solid #B7C5D9;\n font-size: 10pt;\n}\n:root.yotsuba-b .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.yotsuba-b .thumb > .menu-button > i {\n background: #EEF2FF;\n}\n\n /* General */\n:root.futaba .dialog {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.futaba .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.futaba #header-bar {\n font-size: 11pt;\n color: #B86;\n}\n:root.futaba #header-bar a {\n color: #800000;\n}\n\n/* Settings */\n:root.futaba #fourchanx-settings fieldset {\n border-color: #D9BFB7;\n}\n\n/* Quote */\n:root.futaba .backlink.deadlink {\n color: #00E !important;\n}\n:root.futaba .inline {\n border-color: #D9BFB7;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.futaba .hide-post-button,\n:root.futaba .show-post-button {\n color: #800000;\n}\n\n/* QR */\n:root.futaba #qr select {\n color: #00E;\n}\n:root.futaba #qr select:hover {\n color: red;\n}\n.futaba #dump-list::-webkit-scrollbar-thumb {\n background-color: #F0E0D6;\n border-color: #D9BFB7;\n}\n:root.futaba .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.futaba #menu {\n color: #800000;\n}\n:root.futaba .entry {\n border-bottom: 1px solid #D9BFB7;\n font-size: 12pt;\n}\n:root.futaba .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.futaba .thumb > .menu-button > i {\n background: #FFE;\n}\n\n /* General */\n:root.burichan .dialog {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.burichan .field:focus {\n border-color: #98E;\n}\n\n/* Header */\n:root.burichan #header-bar {\n font-size: 11pt;\n color: #89A;\n}\n:root.burichan #header-bar a {\n color: #34345C;\n}\n\n/* Settings */\n:root.burichan #fourchanx-settings fieldset {\n border-color: #B7C5D9;\n}\n\n/* Quote */\n:root.burichan .backlink.deadlink {\n color: #34345C !important;\n}\n:root.burichan .inline {\n border-color: #B7C5D9;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.burichan .hide-post-button,\n:root.burichan .show-post-button {\n color: #000;\n}\n\n/* QR */\n:root.burichan #qr select {\n color: #34345C;\n}\n:root.burichan #qr select:hover {\n color: #DD0000;\n}\n.burichan #dump-list::-webkit-scrollbar-thumb {\n background-color: #D6DAF0;\n border-color: #B7C5D9;\n}\n:root.burichan .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.burichan #menu {\n color: #000000;\n}\n:root.burichan .entry {\n border-bottom: 1px solid #B7C5D9;\n font-size: 12pt;\n}\n:root.burichan .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.burichan .thumb > .menu-button > i {\n background: #EEF2FF;\n}\n\n /* General */\n:root.tomorrow .dialog {\n background-color: #282A2E;\n border-color: #111;\n}\n:root.tomorrow .field:focus {\n border-color: #000;\n}\n\n/* Header */\n:root.tomorrow #header-bar {\n font-size: 9pt;\n color: #C5C8C6;\n}\n:root.tomorrow #header-bar a {\n color: #81A2BE;\n}\n\n/* Settings */\n:root.tomorrow #fourchanx-settings fieldset {\n border-color: #111;\n}\n\n/* Quote */\n:root.tomorrow .backlink.deadlink {\n color: #81A2BE !important;\n}\n:root.tomorrow .inline {\n border-color: #111;\n background-color: rgba(0, 0, 0, .14);\n}\n\n/* Post Hiding */\n:root.tomorrow .hide-post-button,\n:root.tomorrow .show-post-button {\n color: #C5C8C6 !important;\n}\n\n/* QR */\n:root.tomorrow #qr select {\n color: #81A2BE;\n}\n:root.tomorrow #qr select:hover {\n color: #5F89AC;\n}\n.tomorrow #dump-list::-webkit-scrollbar-thumb {\n background-color: #282A2E;\n border-color: #111;\n}\n:root.tomorrow .qr-preview {\n background-color: rgba(255, 255, 255, .15);\n}\n\n/* Menu */\n:root.tomorrow #menu {\n color: #C5C8C6;\n}\n:root.tomorrow .entry {\n border-bottom: 1px solid #111;\n font-size: 10pt;\n}\n:root.tomorrow .focused.entry {\n background: rgba(0, 0, 0, .33);\n}\n:root.tomorrow .thumb > .menu-button > i {\n background: #1D1F21;\n}\n\n /* General */\n:root.photon .dialog {\n background-color: #DDD;\n border-color: #CCC;\n}\n:root.photon .field:focus {\n border-color: #EA8;\n}\n\n/* Header */\n:root.photon #header-bar {\n font-size: 9pt;\n color: #333;\n}\n:root.photon #header-bar a {\n color: #F60;\n}\n\n/* Settings */\n:root.photon #fourchanx-settings fieldset {\n border-color: #CCC;\n}\n\n/* Quote */\n:root.photon .backlink.deadlink {\n color: #F60 !important;\n}\n:root.photon .inline {\n border-color: #CCC;\n background-color: rgba(255, 255, 255, .14);\n}\n\n/* Post Hiding */\n:root.photon .hide-post-button,\n:root.photon .show-post-button {\n color: #333 !important;\n}\n\n/* QR */\n:root.photon #qr select {\n color: #F60;\n}\n:root.photon #qr select:hover {\n color: #FF3300;\n}\n.photon #dump-list::-webkit-scrollbar-thumb {\n background-color: #DDD;\n border-color: #CCC;\n}\n:root.photon .qr-preview {\n background-color: rgba(0, 0, 0, .15);\n}\n\n/* Menu */\n:root.photon #menu {\n color: #333;\n}\n:root.photon .entry {\n border-bottom: 1px solid #CCC;\n font-size: 10pt;\n}\n:root.photon .focused.entry {\n background: rgba(255, 255, 255, .33);\n}\n:root.photon .thumb > .menu-button > i {\n background: #EEE;\n}\n"
  };

  Main.init();

}).call(this);
