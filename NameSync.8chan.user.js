// ==UserScript==
// @name         8chan Name Sync
// @version      0.3.0
// @namespace    nokosage
// @description  Enables names on 8chan. Does not require 8chan X.
// @author       nokosage
// @include      *://*8chan.co/b/*
// @run-at       document-start
// @grant        none
// @updateURL    https://namesync.org/8chan/builds/NameSync.8chan.meta.js
// @downloadURL  https://namesync.org/8chan/builds/NameSync.8chan.user.js
// @icon         data:image/png;base64,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
// ==/UserScript==

/*
  8chan Sync v0.3.0
  https://www.namesync.org/8chan/

  Developers:
  nokosage

  Contributers:
  https://github.com/nokosage/8chan-Name-Sync/graphs/contributors

  This script contains code from NameSync (https://github.com/milkytiptoe/Name-Sync)
  @license: https://raw.github.com/milkytiptoe/Name-Sync/master/license
*/

//'use strict'; 

(function() {
  var d, db, h, $, $$;
  d = document;
  db = document.body;
  h = (d.querySelector('head')) ? d.querySelector('head') : db;

  $ = function (s, p) {
    if (!p || p == null) {
      p = d;
    }
    return p.querySelector(s);
  }
  
  $$ = function (s, p) {
    if (!p || p == null) {
      p = d;
    }
    return p.querySelectorAll(s);
  }
  
  $.elm = function (t, a, s) {
    var e = d.createElement(t);
    if (a) {
      for (key in a) {
        e.setAttribute(key, a[key]);
      }
    }
    if (s) {
      s.appendChild(e);
    }
    return e;
  }
  
  $.getVal = function (k, v) {
    if (typeof (Storage) !== 'undefined') {
      if (v == null) {
        if (localStorage.getItem('' + g.NAMESPACE + k) != null) {
          return localStorage.getItem('' + g.NAMESPACE + k);
        } else {
          return 'undefined';
        }
      } else {
        if (localStorage.getItem('' + g.NAMESPACE + k) != null) {
          return localStorage.getItem('' + g.NAMESPACE + k);
        } else {
          return v;
        }
      }
    } else {
      return 'storage unavailable';
    }
  }
  
  $.setVal = function (k, v) {
    if (typeof (Storage) !== 'undefined') {
      if (v == null) {
        return 'undefined';
      } else {
        return localStorage.setItem('' + g.NAMESPACE + k, v);
      }
    } else {
      return 'storage unavailable';
    }
  }
  
  $.delVal = function (k) {
    return localStorage.removeItem('' + g.NAMESPACE + k);
  }
  
  $.htm = function (s, v) {
    if (v == null) {
      return s.innerHTML;
    } else {
      s.innerHTML = v;
    }
    return s;
  }
  
  $$.htm = function (s, v, n) {
    if (v == null) {
      return s.innerHTML;
    } else {
      if (!n || n == null) {
        for (var i = 0; i < s.length; i++) {
          s[i].innerHTML = v;
        }
      } else {
        s[n].innerHTML = v;
      }
    }
    return s;
  }
  
  $.val = function (s, v) {
    if (v == null) {
      return s.value;
    } else {
      s.value = v;
    }
    return s;
  }
  
  $.att = function (s, a, v) {
    if (!v || v == null || v == false) {
      if (v == false) {
        return s.removeAttribute(a);
      } else {
        return s.getAttribute(a);
      }
    } else {
      s.setAttribute(a, v);
      return s;
    }
  }
  
  $$.att = function (s, a, v, n) {
    if (!v || v == null) {
      if (!n && n != 0 || n == null && n != 0) {
        var x = [
        ];
        for (var i = 0; i < $$(s) .length; i++) {
          x.push(s[i].getAttribute(a));
        }
        return x;
      } else {
        return s[n].getAttribute(a);
      }
    } else {
      if (!n || n == null) {
        for (var i = 0; i < $$(s) .length; i++) {
          s[i].setAttribute(a, v);
        }
      } else {
        s[n].setAttribute(a, v);
      }
      return s;
    }
  }
  
  $.css = function (s) {
    var e = d.createElement('style');
    e.type = 'text/css';
    if (e.styleSheet) {
      e.styleSheet.cssText = s;
    } else {
      e.appendChild(d.createTextNode(s));
    }
    h.appendChild(e);
    return e;
  }
  
  $.event = function (t, i, s) {
    if (i == null) {
      i = {
      };
    }
    if (s == null) {
      s = d;
    }
    return s.dispatchEvent(new CustomEvent(t, i));
  }
  
  $.exists = function (s) {
    if (s.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  
  $.each = function (a, c, e) {
    for (var i = 0; i < a.length; i++) {
      c(a[i], i);
      if (i == (a.length) - 1) {
        if (e && e != null) {
          return e(a[i], i);
        } else {
          return a;
        }
      }
    }
  }
  
  $.time = function (t, c, l) {
    if (c == false) {
      return clearInterval(t);
    } else {
      if (l == true) {
        return setInterval(function () {
          c();
        }, t);
      } else {
        return setTimeout(function () {
          c();
        }, t);
      }
    }
  }
  
  $.xhr = function (t, u, i, c, p) {
    if (i != null) {
      if (t == 'POST') {
        var xd = new FormData();
        for (key in i) {
          xd.append(key, i[key]);
        }
      } else {
        xd = '?';
        for (key in i) {
          xd += key + '=' + i[key] + '&';
        }
        xd = xd.substring(0, (xd.length - 1));
        u += xd;
      }
    }
    var x = new XMLHttpRequest();
    x.open(t, u, true);
    if (p != null) {
      for (key in p) {
        x.setRequestHeader(key, p[key]);
      }
    }
    x.onreadystatechange = function () {
      if (x.readyState == 4) {
        return c(x);
      }
    }
    if (t == 'POST' && i != null) {
      x.send(xd);
    } else {
      x.send();
    }
  }
  
  $.JSON = function (s) {
    if (typeof s == 'string') {
      return JSON.parse(s);
    } else {
      return JSON.stringify(s);
    }
  }
  
  $.after = function (n, s) {
    return s.parentNode.insertBefore(n, s.nextSibling);
  }
  
  $.before = function (n, s) {
    return s.parentNode.insertBefore(n, s);
  }
  
  $.addClass = function (el, className) {
    return el.classList.add(className);
  };
  
  $.hasClass = function (el, className) {
    return el.classList.contains(className);
  };
  
  $.tn = function (text) {
    return d.createTextNode(text);
  };
  
  $.add = function (parent, children) {
    return parent.appendChild($.nodes(children));
  };
  
  $.nodes = function (nodes) {
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
  
  $.on = function (el, type, handler) {
    return el.addEventListener(type, handler, false);
  };
  
  $.off = function (el, type, handler) {
    return el.removeEventListener(type, handler, false);
  };
  
  $.ready = function (fc) {
    var cb;
    if (d.readyState !== 'loading') {
      fc();
      return ;
    }
    cb = function () {
      $.off(d, 'DOMContentLoaded', cb);
      return fc();
    };
    return $.on(d, 'DOMContentLoaded', cb);
  };
  
  $.JSON = function (s) {
    if (typeof s == 'string') {
      return JSON.parse(s);
    } else {
      return JSON.stringify(s);
    }
  }
  
  $.destroy = function (s) {
    return s.parentNode.removeChild(s);
  }
  
  Set = {};
  
  g = {
    NAMESPACE: 'NameSync.8chan.',
    VERSION: '0.3.0',
    checked: false,
    posts: {}
  };
  
  Config = {
    main: {
      'Sync on /b/': [true, 'Enable sync on /b/.'],
      'Sync on /soc/': [true, 'Enable sync on /soc/.'],
      'Sync on /s4s/': [true, 'Enable sync on /s4s/.'],
      'Do Not Track': [false, 'Request no sync field tracking by third party archives.']
    },
    other: {
      'Persona Fields': [false],
      'Filter': [false]
    }
  };
  
  Settings = {
    init: function() {
      var el, section, setting, stored, val, _i, _len, _ref, _ref1;
      _ref = Object.keys(Config);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        _ref1 = Config[section];
        for (setting in _ref1) {
          val = _ref1[setting];
          stored = $.getVal(setting);
          Set[setting] = stored === null ? val[0] : stored === 'true';
        }
      }
	    Settings.createSettingsButtons();
    },
	  createSettingsButtons: function() {
      var el, op;
	    if ($('.boardlist') && !$('#namesync_button', $('.boardlist'))) {
        op = $.elm('span', {
          'id': 'mod_options',
          'style': 'float: right; margin: 0px 3px;'
        }, $('.boardlist'));
        $.add(op, $.tn('[ '));
        el = $.htm($.elm('a', {
          'id': 'namesync_button',
          'href': 'javascript:;',
          'class': 'shortcut'
        }, op), 'NameSync');
        $.add(op, $.tn(' ]'));
        $.on(el, 'click', function () {
          Settings.click();
        });
      }
	  },
    click: function() {
      if ($('#NameSync_Settings', document.body))
        Settings.close();
      else
        Settings.open();
    },
    open: function() {
      var el;
      $html = '<div id="NameSync_Menu" class="post reply" style="position: relative; max-height: 85%; width: 300px; left: 50%; margin-left: -150px; top: 10%; text-align: center;">'+
                '<div style="font-weight: bold; padding-bottom: 5px; font-size: 18pt;">NameSync Settings</div>'+
                '<fieldset>'+
                  '<div>'+
                    '<label style="text-decoration: underline; font-weight: bold;cursor: pointer;"><input type="checkbox" name="NameSync Finder">NameSync Finder</label>'+
                    '<span class="description" style="font-style: italic; font-size: 9pt;">Enables functionality to find and mark threads.</span>'+
                  '</div>'+
                  '<legend style="font-weight: bold;">Main</legend>'+
                '</fieldset>'+
                '<fieldset>'+
                  '<legend style="font-weight: bold;">Persona</legend>'+
                  '<input type="text" id="NameSync_Name" placeholder="Name" style="margin-left: 1px;"/><a style="cursor: pointer; font-size: 10pt; text-decoration: none ! important;" id="clearNameSync_Name">[x]</a><br>'+
                  '<input type="text" id="NameSync_Email" placeholder="Email" style="margin-left: 1px;"/><a style="cursor: pointer; font-size: 10pt; text-decoration: none ! important;" id="clearNameSync_Email">[x]</a><br>'+
                  '<input type="text" id="NameSync_Subject" placeholder="Subject" style="margin-left: 0px;"/><a style="cursor: pointer; font-size: 10pt; text-decoration: none ! important;" id="clearNameSync_Subject">[x]</a>'+
                '</fieldset>'+
                '<div style="margin:5px;">'+
                  '[ '+
                  '<a href="javascript:;">Reset</a>'+
                  ' / '+
                  '<a id="NameSync_Save" href="javascript:;">Save</a>'+
                  ' ]'+
                '</div>'+
                '<fieldset style="padding: 0px 0px 5px;">'+
                  '<legend style="font-weight: bold;">About</legend>'+
                  '<div>'+
                    '<a href="javascript:;" id="btnCheckUpdate" style="font-weight: bold;">Check for Update</a>'+
                    '<div id="textCheckUpdate" style="min-height: 15px;"></div>'+
                  '</div>'+
                  '<div>8chan Name Sync v'+g.VERSION+'<br />'+
                    '<a href="http://milkytiptoe.github.io/Name-Sync/">Website</a> | <a href="https://github.com/milkytiptoe/Name-Sync/wiki/Support">Support</a> | <a href="https://raw.github.com/milkytiptoe/Name-Sync/master/license">License</a> | <a href="#">Changelog</a> | <a href="#">Issues</a>'+
                  '</div>'+
                '</fieldset>'+
              '</div>';
      $el = {
        'id': 'NameSync_Settings',
        'style': 'top:0;left:0;width:100%;height:100%;position:fixed;background-color:rgba(0, 0, 0, 0.25);'
      };
      el = $.htm($.elm('div', $el, document.body), $html);
      
      if ($.getVal('persona.name') !== 'undefined') $('#NameSync_Name').value = $.getVal('persona.name');
      if ($.getVal('persona.email') !== 'undefined') $('#NameSync_Email').value = $.getVal('persona.email');
      if ($.getVal('persona.subject') !== 'undefined') $('#NameSync_Subject').value = $.getVal('persona.subject');
      if ($.getVal('main.namesync_finder') === 'true') $.att($('[name="NameSync Finder"]'), 'checked', 'true');
      
      $.on($('#NameSync_Settings'), 'click', function(e) {
        if (e.target.id === 'NameSync_Settings')
          Settings.close();
      });
      $.on($('#NameSync_Save'), 'click', function(e) {
        Settings.save();
      });
      $.on($('#clearNameSync_Name'), 'click', function(e) {
        $('#NameSync_Name').value = '';
      });
      $.on($('#clearNameSync_Email'), 'click', function(e) {
        $('#NameSync_Email').value = '';
      });
      $.on($('#clearNameSync_Subject'), 'click', function(e) {
        $('#NameSync_Subject').value = '';
      });
      $.on($('#btnCheckUpdate'), 'click', function(e) {
        Sync.checkUpdate();
      });
    },
    close: function() {
      $.destroy($('#NameSync_Settings', document.body));
    },
    reset: function() {
      
    },
    save: function() {
      var subject, name, email, tripfag_finder;
      subject = $('#NameSync_Subject').value;
      name = $('#NameSync_Name').value;
      email = $('#NameSync_Email').value;
      tripfag_finder = ($('[name="NameSync Finder"]:checked')) ? true : false;
      
      $.setVal('persona.name', name);
      $.setVal('persona.subject', subject);
      $.setVal('persona.email', email);
      $.setVal('main.namesync_finder', tripfag_finder);
      
      if (!tripfag_finder && $('#finder_button', $('#mod_options'))) {
        $.destroy($('#finder_button', $('#mod_options')).previousSibling);
        $.destroy($('#finder_button', $('#mod_options')));
      }
      if (tripfag_finder && !$('#finder_button', $('#mod_options'))) Tripfag_Finder.init();
    }
  };
  /*
  CSS = {
  };
  */
  NameSync = {
    pollReady: true,
    ready: function () {
      var path, _ref;
      path = location.pathname.split('/');
      g.board = path[1]; 
      g.view = (_ref = path[2]) === 'thread' || _ref === 'catalog' || _ref === 'res' ? path[2] : 'index';
      if (g.view !== 'thread' && g.view !== 'res') {
        NameSync.init();
        Settings.init();
        if ($.getVal('main.namesync_finder') === 'true') Tripfag_Finder.init();
        console.log(g.NAMESPACE + g.VERSION + ': Initialized');
        return ;
      }
      g.thread = path[3].split('+')[0].split('.')[0];
      NameSync.init();
      Settings.init();
      if ($.getVal('main.namesync_finder') === 'true') Tripfag_Finder.init();
      console.log(g.NAMESPACE + g.VERSION + ': Initialized');
    },
    init: function () {
      if (g.view === 'catalog') {
        return;
      }
      if ($.getVal('post.form') !== 'undefined') {
        Sync.postFormEvent();
      }
      
      /* jQuery */
      if (window.$) {
        window.$(document).on('new_post', function(e, post) {
          NameSync.pollRun();
        });
        window.$(document).on('post_submitted', function(e, data) {
          Sync.postQREvent(e, data);
        });
      }
      /* /jQuery */

      $.on(d, '8chan-Z.NewPosts', function() {
        $.time(500, NameSync.run());
      });
      NameSync.run();
      NameSync.check(1);
    },
    check: function(t) {
      //if (t%3 === 0) NameSync.checkPosts();
      if (!NameSync.pollReady)
        NameSync.pollReady = true;
      
      setTimeout(function(){
        NameSync.check(t+1);
      }, 1000);
    },
    checkPosts: function() {
      var posts;
      posts = $$('#thread_'+g.thread+' > .post');
      if (posts.length !== Object.keys(g.posts).length) NameSync.run();
      setTimeout(function(){NameSync.checkPosts();}, 3000);
    },
    pollRun: function() {
      if (NameSync.pollReady) {
        setTimeout(function() {
          NameSync.run();
        }, 500);
        NameSync.pollReady = false;
      }
    },
    run: function () {
      var posts;
      posts = $$('#thread_'+g.thread+' .post');
      for (_i = 0, _len = posts.length; _i < _len; _i++) {
        post = posts[_i];
        if (_i == 0)
          g.posts[g.thread] = new Post(post);
        else
          g.posts[post.id.slice(6)] = new Post(post);
      }
      //console.log(g.posts);
      return Sync.sync();
    }
  };
  
  Names = {
    namesync: {},
    lastUpdate: 0,
    updateAllPosts: function () {
      var _i, _len, key, data;
      //console.log(g.posts);
      //console.log(Names.namesync);
      for (_i = 0, _len = Names.namesync.length; _i < _len; _i++) {
        data = Names.namesync[_i];
        key = data['p'];
        Names.updatePost(key, _i);
      }
    },
    updatePost: function (no, idx) {
      var post, data, email, emailspan, name, namespan, subject, subjectspan, tripcode, tripspan;
      post = g.posts[no];
      data = Names.namesync[idx];
      if (!post || !data) return;
      
      name = (data.n) ? data.n : false;
      subject = (data.s) ? data.s : false;
      tripcode = (data.t) ? data.t : false;
      email = (data.e) ? data.e : false;
      
      namespan = post.nodes.name;
      subjectspan = post.nodes.subject;
      tripspan = $('.trip', post.nodes.info);
      emailspan = $('.useremail', post.nodes.info);
      
      if (name) {
        namespan.textContent = name;
      }
      if (subject) {
        subjectspan.textContent = subject;
      }
      if (email) {
        if (emailspan === null) {
          emailspan = $.elm('a', {
            'class': 'useremail',
            'style': 'margin-left: 0px;'
          });
          $.before(emailspan, namespan);
        }
        $.add(emailspan, namespan);
        if (tripspan != null) {
          $.after($.tn(' '), namespan);
          $.add(emailspan, tripspan);
        }
        emailspan.href = 'mailto:' + email;
      }
      if (tripcode) {
        if (tripspan === null) {
          tripspan = $.elm('span', {
            'class': 'trip'
          });
          $.after(tripspan, namespan);
          $.before($.tn(' '), tripspan);
        }
        if (!name) {
          namespan.textContent = '';
        }
        tripspan.textContent = tripcode;
      }
      Names.lastUpdate = data.time;
    }
  };
  
  Sync = {
    lastPosts: [],
    sync: function () {
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION,
        'If-Modified-Since': Names.lastUpdate
      };
      $GET = {
        'b': g.board,
        't': g.thread
      };
      $.xhr('GET', 'https://namesync.org/8chan/qp.php', $GET, function (c) {
        if (c.responseText !== '') {
          Names.namesync = $.JSON(c.responseText);
          Names.updateAllPosts();
          return $.event('NamesSynced');
        }
      }, $HEADERS);
    },
    postReady: function (threadID, postID) {
      name = ($.getVal('persona.name') !== 'undefined') ? $.getVal('persona.name') : '';
      email = ($.getVal('persona.email') !== 'undefined') ? $.getVal('persona.email') : '';
      subject = ($.getVal('persona.subject') !== 'undefined') ? $.getVal('persona.subject') : '';
      Sync.post(name, subject, email, threadID, postID);
      Sync.lastPosts[Sync.lastPosts.length] = postID;
    },
    postFormEvent: function () {
      var name, subject, email, postID, threadID;
      
      if ($.getVal('post.form') !== 'undefined') {
        if (window.location.href.split('#')[1].split('p')[1]) {
          postID = window.location.href.split('#')[1].split('p')[1];
          threadID = $.getVal('post.form');
          name = ($.getVal('persona.name') !== 'undefined') ? $.getVal('persona.name') : '';
          email = ($.getVal('persona.email') !== 'undefined') ? $.getVal('persona.email') : '';
          subject = ($.getVal('persona.subject') !== 'undefined') ? $.getVal('persona.subject') : '';
          Sync.post(name, subject, email, threadID, postID);
        }
        $.setVal('post.form', 'undefined');
      } else {
        $.setVal('post.form', g.thread);
      }
    },
    post: function (name, subject, email, thread, no) {
      if (name + subject + email === '') return;
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'b': g.board,
        't': thread,
        'p': no,
        'n': name,
        's': subject,
        'e': email,
        'dnt': 0
      };
      $.xhr('POST', 'https://namesync.org/8chan/sp.php', $POST, function (c) {
        window.setTimeout(function(){
          NameSync.run();
        }, 1000);
      }, $HEADERS);
    },
    checkUpdate: function () {
      if (!g.checked) {
        $HEADERS = {
          'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
        };
        $.xhr('GET', 'https://namesync.org/8chan/v.php', null, function (c) {
          var v;
          v = $.JSON(c.responseText)['VERSION'];
          if (g.VERSION !== v) {
            $HTML = '<span style="color: red; font-weight: bold;">New Version Available:</span> <a href="https://namesync.org/mobile/" style="font-weight: bold;">Here</a>';
            $.htm($('#textCheckUpdate'), $HTML);
          } else {
            $HTML = '<span style="color: green; font-weight: bold;">Up-to-date</span>';
            $.htm($('#textCheckUpdate'), $HTML);
          }
          g.checked = true;
        }, $HEADERS);
      }
    }
  };
  
  Post = (function () {
    Post.prototype.toString = function () {
      return this.ID;
    };
    function Post(root) {
      var capcode, date, info, name, post, subject;
      this.ID = root.id.slice(6);
      post = root;
      info = $('.intro', post);
      this.nodes = {
        root: root,
        post: post,
        info: info
      };
      this.isReply = $.hasClass(post, 'reply');
      this.info = {
      };
      if (!(subject = $('.subject', info))) {
        $el = {
          'class': 'subject'
        };
        subject = $.elm('span', $el, info);
        $.before(subject, $('.name', info));
        $.after($.tn(' '), subject);
      }
      this.nodes.subject = subject;
      if (name = $('.name', info)) {
        this.nodes.name = name;
      }
      if (capcode = $('.capcode.hand', info)) {
        this.info.capcode = capcode.textContent.replace('## ', '');
      }
      if (date = $('.dateTime', info)) {
        this.info.date = date.dataset.utc;
      }
    }
    return Post;
  })();
  
  Tripfag_Finder = {
    VERSION: '2.1.0',
    init: function () {
      Tripfag_Finder.createButtons();
    },
    createButtons: function() {
	    if ($('#mod_options') && !$('#finder_button', $('#mod_options'))) {
        el = $.htm($.elm('a', {
          'id': 'finder_button',
          'href': 'javascript:;',
          'class': 'shortcut'
        }), 'Finder');
        $.after(el, $('#namesync_button'));
        $.before($.tn(' / '), el);
        $.on(el, 'click', function () {
          Tripfag_Finder.click();
        });
      }
    },
    click: function () {
      if ($('#Tripfag_Finder', document.body))
        Tripfag_Finder.close();
      else
        Tripfag_Finder.open();
    },
    open: function () {
      var el;
      $html = '<div id="threadFinderContainer" class="post reply" style="position: relative; max-height: 85%; width: 300px; left: 50%; margin-left: -150px; top: 10%; text-align: center;">'+
                '<fieldset>'+
                  '<legend style="font-weight: bold;">Threads</legend>'+
                  '<fieldset id="tf_8chan_hidden" style="display: none;" style="border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;">'+
                    '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">8chan</a></legend>'+
                  '</fieldset>'+
                  '<fieldset id="tf_8chan">'+
                    '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">8chan</a></legend>'+
                    '<div class="tf_threadWrapper"></div>'+
                    '<div class="tf_online">Online Users: Waiting...</div>'+
                  '</fieldset>'+
                  '<fieldset id="tf_4chan_hidden" style="border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;">'+
                    '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">4chan</a></legend>'+
                  '</fieldset>'+
                  '<fieldset id="tf_4chan" style="display: none;">'+
                    '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">4chan</a></legend>'+
                    '<div class="tf_threadWrapper"></div>'+
                    '<div class="tf_online">Online Users: Waiting...</div>'+
                  '</fieldset>'+
                  '<span id="tf_buttons" style="display: block; margin: 5px 0px;">'+
                    '<input type="button" value="Refresh">'+
                    '<select id="tf_type">'+
                      '<option value="animu">Animu</option>'+
                      '<option value="draw">Draw</option>'+
                      '<option value="gfur">Gfur</option>'+
                      '<option value="pony">Pony</option>'+
                      '<option value="sfur">Sfur</option>'+
                      '<option value="trap">Trap</option>'+
                      '<option value="loli">Loli</option>'+
                      '<option value="shota">Shota</option>'+
                      '<option value="ks">KS</option>'+
                      '<option value="poke">Poke</option>'+
                    '</select>'+
                    '<input type="button" style="width: auto;" value="Mark">'+
                    '<input type="button" style="width: auto;" value="Unmark">'+
                  '</span>'+
                '</fieldset>'+
                '<fieldset id="tf_oppart" style="border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;">'+
                  '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">Options</a></legend>'+
                '</fieldset>'+
                '<fieldset id="tf_opfull" style="display: none;">'+
                  '<legend style="font-weight: bold; visibility: visible;"><a href="javascript:void(0);" title="Show options" class="tf_optionsLink">Options</a></legend>'+
                  '<fieldset id="tf_passwords">'+
                    '<legend>Passwords</legend>'+
                    '<label><input type="text" placeholder="Access Password" name="Password"></label>'+
                    '<label><input type="text" placeholder="Admin Password" name="AdminPassword"></label>'+
                  '</fieldset>'+
                '<div style="margin:5px;">'+
                  '[ <a id="tf_options_save" href="javascript:;">Save</a> ]'+
                '</div>'+
                '</fieldset>'+
                '<div id="tf_notify" class="tfHidden"></div>'+
                '<div id="tf_error" class="tfHidden"></div>'+
              '</div>';
      $el = {
        'id': 'Tripfag_Finder',
        'style': 'top:0;left:0;width:100%;height:100%;position:fixed;background-color:rgba(0, 0, 0, 0.25);'
      };
      el = $.htm($.elm('div', $el, document.body), $html);
      
      if ($.getVal('finder.password') !== 'undefined') $('[name="Password"]', $('#tf_opfull')).value = $.getVal('finder.password');
      if ($.getVal('finder.admin_password') !== 'undefined') $('[name="AdminPassword"]', $('#tf_opfull')).value = $.getVal('finder.admin_password');
      
      $.on($('#Tripfag_Finder'), 'click', function(e) {
        if (e.target.id === 'Tripfag_Finder')
          Tripfag_Finder.close();
      });
      $.on($('[value="Refresh"]', $('.threadFinderContainer')), 'click', function(e) {
        Tripfag_Finder.updateThreads();
      });
      $.on($('[value="Mark"]', $('.threadFinderContainer')), 'click', function(e) {
        Tripfag_Finder.markThread();
      });
      $.on($('[value="Unmark"]', $('.threadFinderContainer')), 'click', function(e) {
        Tripfag_Finder.unmarkThread();
      });
      $.on($('.tf_optionsLink', $('#tf_oppart')), 'click', function(e) {
        $.att($('#tf_oppart'), 'style', 'display: none;');
        $.att($('#tf_opfull'), 'style', '');
      });
      $.on($('.tf_optionsLink', $('#tf_opfull')), 'click', function(e) {
        $.att($('#tf_oppart'), 'style', 'border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;');
        $.att($('#tf_opfull'), 'style', 'display: none;');
      });
      $.on($('.tf_optionsLink', $('#tf_4chan_hidden')), 'click', function(e) {
        $.att($('#tf_4chan_hidden'), 'style', 'display: none;');
        $.att($('#tf_4chan'), 'style', '');
      });
      $.on($('.tf_optionsLink', $('#tf_4chan')), 'click', function(e) {
        $.att($('#tf_4chan_hidden'), 'style', 'border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;');
        $.att($('#tf_4chan'), 'style', 'display: none;');
      });
      $.on($('.tf_optionsLink', $('#tf_8chan_hidden')), 'click', function(e) {
        $.att($('#tf_8chan_hidden'), 'style', 'display: none;');
        $.att($('#tf_8chan'), 'style', '');
      });
      $.on($('.tf_optionsLink', $('#tf_8chan')), 'click', function(e) {
        $.att($('#tf_8chan_hidden'), 'style', 'border-bottom: 0px none; border-left: 0px none; border-right: 0px none; padding: 0px 10px;');
        $.att($('#tf_8chan'), 'style', 'display: none;');
      });
      $.on($('#tf_options_save'), 'click', function(e) {
        Tripfag_Finder.save();
      });
      Tripfag_Finder.updateThreads();
    },
    close: function () {
      $.destroy($('#Tripfag_Finder', document.body));
    },
    updateThreads: function () {
      var password, admin_password
      $.att($.att($('[value="Refresh"]', $('.threadFinderContainer')), 'value', 'Loading...'), 'disabled', 'disabled');
      if ($.getVal('finder.password') !== 'undefined') 
        password = $.getVal('finder.password');
      else
        password = "null";
      if ($.getVal('finder.admin_password') !== 'undefined') 
        admin_password = $.getVal('finder.admin_password');
      else
        admin_password = "null";
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'a': 'get',
        't': g.thread,
        'p': password,
        'ap': admin_password,
        'v': Tripfag_Finder.VERSION
      };
      $.xhr('POST', 'https://t-f.xyz/finder/api.php', $POST, function(c) {
        var finder, threads;
        $.htm($('.tf_threadWrapper', $('#tf_4chan')), '');
        finder = $.JSON(c.responseText);
        threads = finder['data'];
        for (i = 0; i < threads.length; i++) {
          var el, mark;
          mark = threads[i];
          $html = '<a href="//boards.4chan.org/b/thread/'+mark['thread']+'/" class="tf_threadLink">'+mark['type'].charAt(0).toUpperCase()+mark['type'].slice(1)+': '+mark['thread']+' ('+mark['votes']+')</a>'+
                  '<span class="tf_Counts"> (R: '+mark['r']+' I: '+mark['i']+')</span>'+
                  '<info thread="'+mark['thread']+'" type="'+mark['type']+'"></info>';
          if (finder['admin']) $html += ' <a href="javascript:;" class="tf_adminDelete">[x]</a>';
          $el = {
            'class': 'tf_thread',
            'style': 'padding: 2px 0'
          };
          el = $.htm($.elm('div', $el, $('.tf_threadWrapper', $('#tf_4chan'))), $html);
          if (finder['admin']) {
            $.on($('.tf_adminDelete', el), 'click', function(e) {
              Tripfag_Finder.delete4chanThread($.att($('info', e.target.parentNode), 'thread'), $.att($('info', e.target.parentNode), 'type'));
            });
          }
        }
        $.htm($('.tf_online', $('#tf_4chan')), 'Online Users: '+finder['users']);
      }, $HEADERS);
      $.xhr('POST', 'https://www.namesync.org/finder/api.php', $POST, function(c) {
        var finder, threads;
        $.htm($('.tf_threadWrapper', $('#tf_8chan')), '');
        finder = $.JSON(c.responseText);
        threads = finder['data'];
        for (i = 0; i < threads.length; i++) {
          var el, mark;
          mark = threads[i];
          $html = '<a href="//8chan.co/'+mark['board']+'/res/'+mark['thread']+'.html" class="tf_threadLink">'+mark['type'].charAt(0).toUpperCase()+mark['type'].slice(1)+': /'+mark['board']+'/'+mark['thread']+' ('+mark['votes']+')</a>'+
                  '<span class="tf_Counts"> (R: '+mark['r']+' I: '+mark['i']+')</span>'+
                  '<info thread="'+mark['thread']+'" type="'+mark['type']+'"></info>';
          if (finder['admin']) $html += ' <a href="javascript:;" class="tf_adminDelete">[x]</a>';
          $el = {
            'class': 'tf_thread',
            'style': 'padding: 2px 0'
          };
          el = $.htm($.elm('div', $el, $('.tf_threadWrapper', $('#tf_8chan'))), $html);
          if (finder['admin']) {
            $.on($('.tf_adminDelete', el), 'click', function(e) {
              Tripfag_Finder.delete8chanThread($.att($('info', e.target.parentNode), 'thread'), $.att($('info', e.target.parentNode), 'type'));
            });
          }
        }
        $.htm($('.tf_online', $('#tf_8chan')), 'Online Users: '+finder['users']);
        $.att($.att($('[value="Loading..."]', $('.threadFinderContainer')), 'value', 'Refresh'), 'disabled', '');
      }, $HEADERS);
    },
    markThread: function () {
      $.att($.att($('[value="Mark"]', $('.threadFinderContainer')), 'value', 'Mark'), 'disabled', 'disabled');
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'a': 'set',
        'b': g.board,
        't': g.thread,
        'p': 'idiots',
        'type': $('#tf_type').value,
        'v': g.NAMESPACE + g.VERSION
      };
      $.xhr('POST', 'https://www.namesync.org/finder/api.php', $POST, function(c) {
        Tripfag_Finder.updateThreads();
        $.att($.att($('[value="Mark"]', $('.threadFinderContainer')), 'value', 'Mark'), 'disabled', '');
      }, $HEADERS);
    },
    unmarkThread: function () {
      $.att($.att($('[value="Unmark"]', $('.threadFinderContainer')), 'value', 'Unmark'), 'disabled', 'disabled');
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'a': 'unset',
        't': g.thread,
        'p': 'idiots',
        'v': g.NAMESPACE + g.VERSION
      };
      $.xhr('POST', 'https://www.namesync.org/finder/api.php', $POST, function(c) {
        Tripfag_Finder.updateThreads();
        $.att($.att($('[value="Unmark"]', $('.threadFinderContainer')), 'value', 'Unmark'), 'disabled', '');
      }, $HEADERS);
    },
    delete4chanThread: function (thread, type) {
      var password, admin_password;
      password = $.getVal('finder.password');
      admin_password = $.getVal('finder.admin_password');
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'a': 'delete',
        't': thread,
        'y': type,
        'p': password,
        'ap': admin_password,
        'v': Tripfag_Finder.VERSION
      };
      $.xhr('POST', 'https://t-f.xyz/finder/api.php', $POST, function(c) {
        Tripfag_Finder.updateThreads();
      }, $HEADERS);
    },
    delete8chanThread: function (thread, type) {
      var password, admin_password;
      password = $.getVal('finder.password');
      admin_password = $.getVal('finder.admin_password');
      $HEADERS = {
        'X-Requested-With': '' + g.NAMESPACE + 'v' + g.VERSION
      };
      $POST = {
        'a': 'delete',
        't': thread,
        'y': type,
        'p': password,
        'ap': admin_password,
        'v': g.NAMESPACE + g.VERSION
      };
      $.xhr('POST', 'https://www.namesync.org/finder/api.php', $POST, function(c) {
        Tripfag_Finder.updateThreads();
      }, $HEADERS);
    },
    save: function () {
      var password, admin_password;
      password = $('[name="Password"]', $('#tf_opfull')).value;
      admin_password = $('[name="AdminPassword"]', $('#tf_opfull')).value;
      
      $.setVal('finder.password', password);
      $.setVal('finder.admin_password', admin_password);
    }
  };
  
  $.ready(NameSync.ready);
  
  /* Fix Posting */
  (function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      var _ref;
      if (method === 'POST' && ((_ref = url.split(':')[1]) === '//8chan.co/post.php' || _ref === '//www.8chan.co/post.php')) {
        this.addEventListener("readystatechange", function() {
          if (this.readyState == 4) {
            var post, thread, _json = JSON.parse(this.responseText);
            thread = (_json['redirect'].split('/')[3].split('.')[0]) ? _json['redirect'].split('/')[3].split('.')[0] : false;
            post = (_json['id']) ? _json['id'] : false;
            if (post && thread) {
              Sync.postReady(thread, post);
              console.log('NameSync: Posted '+thread+'#'+post);
            }
          }
        }, false);
      }
      open.call(this, method, url, async, user, pass);
    };
  })(XMLHttpRequest.prototype.open);
  
}).call(this);