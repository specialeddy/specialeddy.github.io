// ==UserScript==
// @name         4chan X Name Sync
// @version      4.9.3
// @minGMVer     1.14
// @minFFVer     26
// @namespace    milky
// @description  Enables names on 4chan's forced anon boards. Requires 4chan X.
// @license      CC BY-NC-SA 3.0; https://raw.github.com/milkytiptoe/Name-Sync/master/license
// @author       milkytiptoe
// @author       ihavenoface
// @author       nokosage
// @include      *://boards.4chan.org/*/*
// @run-at       document-start
// @updateURL    https://namesync.net/namesync/builds/NameSync.meta.js
// @downloadURL  https://namesync.net/namesync/builds/NameSync.user.js
// @icon         data:image/png;base64,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
// ==/UserScript==

/*
  4chan X Name Sync v4.9.3
  https://namesync.net/

  Developers:
  milkytiptoe
  ihavenoface
  nokosage

  Contributers:
  https://github.com/milkytiptoe/Name-Sync/graphs/contributors

  License:
  https://raw.github.com/milkytiptoe/Name-Sync/master/license

  This script contains code from 4chan X (https://github.com/MayhemYDG/4chan-x)
  @license: https://github.com/MayhemYDG/4chan-x/blob/v3/LICENSE
*/

(function() {
  var $, $$, CSS, Config, Filter, Main, Post, Posts, Set, Settings, Sync, d, g,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Set = {};

  d = document;

  g = {
    NAMESPACE: 'NameSync.',
    VERSION: '4.9.3',
    posts: {},
    threads: [],
    boards: ['b', 'soc', 's4s', 'trash']
  };

  $$ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelectorAll(selector);
  };

  $ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelector(selector);
  };

  $.el = function(tag, properties) {
    var el;
    el = d.createElement(tag);
    if (properties) {
      $.extend(el, properties);
    }
    return el;
  };

  $.tn = function(text) {
    return d.createTextNode(text);
  };

  $.id = function(id) {
    return d.getElementById(id);
  };

  $.event = function(type, detail) {
    if (detail == null) {
      detail = {};
    }
    return d.dispatchEvent(new CustomEvent(type, detail));
  };

  $.on = function(el, type, handler) {
    return el.addEventListener(type, handler, false);
  };

  $.off = function(el, type, handler) {
    return el.removeEventListener(type, handler, false);
  };

  $.addClass = function(el, className) {
    return el.classList.add(className);
  };

  $.hasClass = function(el, className) {
    return el.classList.contains(className);
  };

  $.add = function(parent, children) {
    return parent.appendChild($.nodes(children));
  };

  $.rm = function(el) {
    return el.parentNode.removeChild(el);
  };

  $.prepend = function(parent, children) {
    return parent.insertBefore($.nodes(children), parent.firstChild);
  };

  $.after = function(root, el) {
    return root.parentNode.insertBefore($.nodes(el), root.nextSibling);
  };

  $.before = function(root, el) {
    return root.parentNode.insertBefore($.nodes(el), root);
  };

  $.nodes = function(nodes) {
    var frag, i, len, node;
    if (!(nodes instanceof Array)) {
      return nodes;
    }
    frag = d.createDocumentFragment();
    for (i = 0, len = nodes.length; i < len; i++) {
      node = nodes[i];
      frag.appendChild(node);
    }
    return frag;
  };

  $.ajax = function(file, type, data, callbacks) {
    var r, url;
    r = new XMLHttpRequest();
    if (file === 'qp') {
      r.overrideMimeType('application/json');
    }
    url = "https://namesync.net/namesync/" + file + ".php";
    if (type === 'GET') {
      url += "?" + data;
    }
    r.open(type, url, true);
    r.setRequestHeader('X-Requested-With', 'NameSync4.9.3');
    if (file === 'qp') {
      r.setRequestHeader('If-Modified-Since', Sync.lastModified);
    }
    if (type === 'POST') {
      r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }
    $.extend(r, callbacks);
    r.withCredentials = true;
    r.send(data);
    return r;
  };

  $.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
  };

  $.asap = function(test, cb) {
    if (test()) {
      return cb();
    } else {
      return setTimeout($.asap, 25, test, cb);
    }
  };

  $.get = function(name) {
    return localStorage.getItem("" + g.NAMESPACE + name);
  };

  $.set = function(name, value) {
    return localStorage.setItem("" + g.NAMESPACE + name, value);
  };

  Config = {
    main: {
      'Sync on /b/': [true, 'Enable sync on /b/.'],
      'Sync on /soc/': [true, 'Enable sync on /soc/.'],
      'Sync on /s4s/': [true, 'Enable sync on /s4s/.'],
      'Sync on /trash/': [true, 'Enable sync on /trash/.'],
      'Custom Names': [false, 'Posters can be given custom names.'],
      'Read-only Mode': [false, 'Share none of your sync fields.'],
      'Hide Sage': [false, 'Share none of your sync fields when sage is in the email field.'],
      'Mark Sync Posts': [false, 'Mark posts made by sync users.'],
      'Do Not Track': [false, 'Request no sync field tracking by third party archives.']
    },
    other: {
      'Persona Fields': [false],
      'Filter': [false]
    }
  };

  CSS = {
    init: function() {
      var css;
      css = ".section-name-sync input[type='text'] {\n  border: 1px solid #CCC;\n  width: 148px;\n  padding: 2px;\n}\n.section-name-sync input[type='button'] {\n  padding: 3px;\n  margin-bottom: 6px;\n}\n.section-name-sync p {\n  margin: 0 0 8px 0;\n}\n.section-name-sync ul {\n  list-style: none;\n  margin: 0;\n  padding: 8px;\n}\n.section-name-sync div label {\n  text-decoration: underline;\n}\n/* Appchan X description fix */\n.section-name-sync .description {\n  display: inline;\n}\n/* ccd0 4chan X clear fix */\n.section-name-sync {\n  clear: both;\n}\n/* Show sync fields in ccd0 4chan X */\n#qr.sync-enabled .persona input {\n  display: inline-block !important;\n}";
      if (Set['Filter']) {
        css += ".sync-filtered {\n  display: none !important;\n}";
      }
      if (Set['Mark Sync Posts']) {
        css += ".sync-post {\n  position: relative;\n}\n.sync-post:after {\n  content: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAMAAAAMCGV4AAAAqFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFhYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFhYAAAAAAAAAAAAAAAAAAAAWFhYAAAAAAAAWFhYAAAAWFhYWFhYAAAAAAAAAAAAAAAAAAAAWFhYAAAAAAAAWFhYWFhYAAAAAAAAAAAAAAAAWFhYAAAAAAAAAAAAAAAAAAAAPAnI3AAAAOHRSTlMzADU0NiwGJjIvDi03AAEEFyUnHzAkCQUCIQUSKy0xHSgIKS4aESoKGCYDDCIvKBYpHg4jEBMHFH8kut4AAACvSURBVHheHY7FlsNADAQFw7ZjjO0wMy3v//9ZNO6DXpd0KAFK8sImiS1yxC7yISFiJtLhtBYuFMEQcssHYCCWqpRMpgX0H3JV+rOegywW8MOCkx4xMDPtoCYgPUJs5433zRZMu2mnIrlOc2NMB3tbluXxVzZnr5ML2JQonQjeHHF6h7HI+fmarVwUfkWO+sGffmcwVixtiNImg6qe+XgDospgBmGEfyu9dE31L19kb12bCeREPHJzAAAAAElFTkSuQmCC');\n  position: absolute;\n  bottom: 2px;\n  right: 5px;\n}";
      }
      if (Set['Custom Names']) {
        css += "div#qp .sync-custom, div.inline .sync-custom {\n  display: none;\n}";
      }
      return $.add(d.body, $.el('style', {
        textContent: css
      }));
    }
  };

  Filter = {
    init: function() {
      this.names = $.get('FilterNames');
      this.tripcodes = $.get('FilterTripcodes');
      this.emails = $.get('FilterEmails');
      return this.subjects = $.get('FilterSubjects');
    }
  };

  Main = {
    init: function() {
      var lastView, path, ref;
      lastView = g.view;
      path = location.pathname.split('/');
      g.board = path[1];
      g.view = (ref = path[2]) === 'thread' || ref === 'catalog' ? path[2] : 'index';
      if (g.view === 'catalog') {
        return;
      }
      if (!lastView) {
        Settings.init();
        CSS.init();
        if (Set['Filter']) {
          Filter.init();
        }
      }
      if (Set["Sync on /" + g.board + "/"] || lastView) {
        Posts.init();
        return Sync.init();
      }
    },
    boardLegit: function() {
      var ref;
      return ref = g.board, indexOf.call(g.boards, ref) >= 0;
    }
  };

  Posts = {
    nameByPost: {},
    nameByID: {},
    init: function() {
      var i, len, post, ref, target;
      g.posts = {};
      g.threads = [];
      if (this.observer) {
        this.observer.disconnect();
        delete this.observer;
      }
      if (g.view !== 'thread' || !Main.boardLegit()) {
        return;
      }
      ref = $$('.thread > .postContainer');
      for (i = 0, len = ref.length; i < len; i++) {
        post = ref[i];
        g.posts[post.id.slice(2)] = new Post(post);
      }
      target = $('.thread');
      g.threads.push(target.id.slice(1));
      this.observer = new MutationObserver(function(mutations) {
        var foundNode, j, k, len1, len2, mutation, node, ref1;
        foundNode = false;
        for (j = 0, len1 = mutations.length; j < len1; j++) {
          mutation = mutations[j];
          ref1 = mutation.addedNodes;
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            node = ref1[k];
            if (!$.hasClass(node, 'postContainer')) {
              if (!(node = $('.postContainer', node))) {
                continue;
              }
            }
            g.posts[node.id.slice(2)] = new Post(node);
            foundNode = true;
          }
        }
        if (foundNode) {
          return Posts.updateAllPosts();
        }
      });
      this.observer.observe(target, {
        childList: true
      });
      if (Set['Custom Names']) {
        return Posts.updateAllPosts();
      }
    },
    updateAllPosts: function() {
      var key;
      for (key in (Set['Custom Names'] ? g.posts : Posts.nameByPost)) {
        Posts.updatePost.call(g.posts[key]);
      }
    },
    updatePost: function() {
      var el, email, emailspan, info, linfo, name, namespan, obj, oinfo, regex, subject, subjectspan, tripcode, tripspan, type, uID;
      if (!this.info || this.info.capcode) {
        return;
      }
      if (linfo = Posts.nameByID[uID = this.info.uID]) {
        name = linfo.n;
      } else if (oinfo = Posts.nameByPost[this.ID]) {
        if (parseInt(oinfo.time) > parseInt(this.info.date) + 60) {
          return;
        }
        name = oinfo.n;
        tripcode = oinfo.t;
        email = oinfo.e;
        subject = oinfo.s;
      }
      if (Set['Custom Names'] && uID !== 'Heaven' && $('.sync-custom', this.nodes.info) === null) {
        el = $.el('a', {
          className: 'sync-custom',
          textContent: '+',
          href: 'javascript:;',
          title: 'Custom Name'
        });
        $.after($('[type="checkbox"]', this.nodes.info), [el, $.tn(' ')]);
        $.on(el, 'click', function() {
          return Posts.customName(uID);
        });
      }
      if (!linfo && !oinfo) {
        return;
      }
      namespan = this.nodes.name;
      subjectspan = this.nodes.subject;
      tripspan = $('.postertrip', this.nodes.info);
      emailspan = $('.useremail', this.nodes.info);
      if (namespan.textContent !== name) {
        namespan.textContent = name;
      }
      if (subject) {
        if (subjectspan.textContent !== subject) {
          subjectspan.textContent = subject;
        }
      } else {
        if (subjectspan.textContent !== '') {
          subjectspan.textContent = '';
        }
      }
      if (email) {
        if (emailspan === null) {
          emailspan = $.el('a', {
            className: 'useremail'
          });
          $.before(namespan, emailspan);
        }
        $.add(emailspan, namespan);
        if (tripspan != null) {
          $.after(namespan, $.tn(' '));
          $.add(emailspan, tripspan);
        }
        emailspan.href = "mailto:" + email;
      } else if (emailspan) {
        $.before(emailspan, namespan);
        $.rm(emailspan);
      }
      if (tripcode) {
        if (tripspan === null) {
          tripspan = $.el('span', {
            className: 'postertrip'
          });
          $.after(namespan, [$.tn(' '), tripspan]);
        }
        if (tripspan.textContent !== tripcode) {
          tripspan.textContent = tripcode;
        }
      } else if (tripspan) {
        $.rm(tripspan.previousSibling);
        $.rm(tripspan);
      }
      if (Set['Mark Sync Posts'] && this.isReply && Posts.nameByPost[this.ID]) {
        $.addClass(this.nodes.post, 'sync-post');
      }
      if (Set['Filter']) {
        for (type in obj = {
          name: name,
          tripcode: tripcode,
          subject: subject,
          email: email
        }) {
          if (!(info = obj[type]) || !(regex = Filter[type + "s"])) {
            continue;
          }
          if (RegExp("" + regex).test(info)) {
            $.addClass(this.nodes.root, 'sync-filtered');
            return;
          }
        }
      }
    },
    customName: function(uID) {
      var n;
      if (!(n = prompt('Custom Name', 'Anonymous'))) {
        return;
      }
      Posts.nameByID[uID] = {
        n: n
      };
      return Posts.updateAllPosts();
    }
  };

  Settings = {
    init: function() {
      var el, i, len, ref, ref1, section, setting, stored, val;
      ref = Object.keys(Config);
      for (i = 0, len = ref.length; i < len; i++) {
        section = ref[i];
        ref1 = Config[section];
        for (setting in ref1) {
          val = ref1[setting];
          stored = $.get(setting);
          Set[setting] = stored === null ? val[0] : stored === 'true';
        }
      }
      el = $.el('a', {
        href: 'javascript:;',
        className: 'shortcut',
        textContent: 'NS',
        title: '4chan X Name Sync Settings'
      });
      return $.asap((function() {
        return $.id('shortcuts');
      }), function() {
        $.add($.id('shortcuts'), el);
        return $.on(el, 'click', function() {
          $.event('OpenSettings', {
            detail: 'none'
          });
          section = $('[class^="section-"]');
          section.className = 'section-name-sync';
          return Settings.open(section);
        });
      });
    },
    open: function(section) {
      var check, checked, field, i, istrue, j, len, len1, ref, ref1, ref2, setting, stored, text, val;
      section.innerHTML = "<fieldset>\n  <legend>\n    <label><input type=checkbox name='Persona Fields' " + ($.get('Persona Fields') === 'true' ? 'checked' : '') + ">Persona</label>\n  </legend>\n  <p>Share these fields instead of the 4chan X quick reply fields.</p>\n  <div>\n    <input type=text name=Name placeholder=Name>\n    <input type=text name=Email placeholder=Email>\n    <input type=text name=Subject placeholder=Subject>\n  </div>\n</fieldset>\n<fieldset>\n  <legend>\n    <label><input type=checkbox name=Filter " + ($.get('Filter') === 'true' ? 'checked' : '') + ">Filter</label>\n  </legend>\n  <p><code>^(?!Anonymous$)</code> to filter all names <code>!tripcode|!tripcode</code> to filter multiple tripcodes. Only applies to sync posts.</p>\n  <div>\n    <input type=text name=FilterNames placeholder=Names>\n    <input type=text name=FilterTripcodes placeholder=Tripcodes>\n    <input type=text name=FilterEmails placeholder=Email>\n    <input type=text name=FilterSubjects placeholder=Subjects>\n  </div>\n</fieldset>\n<fieldset>\n  <legend>Advanced</legend>\n  <div>\n    <input id=syncClear type=button value='Clear my sync history' title='Clear your sync history from the server'>\n    Sync Delay: <input type=number name=Delay min=0 step=100 placeholder=300 title='Delay before synchronising after a thread or index update'> ms\n  </div>\n</fieldset>\n<fieldset>\n  <legend>About</legend>\n  <div>4chan X Name Sync v" + g.VERSION + "</div>\n  <div>\n    <a href='http://milkytiptoe.github.io/Name-Sync/' target=_blank>Website</a> |\n    <a href='https://github.com/milkytiptoe/Name-Sync/wiki/Support' target=_blank>Support</a> |\n    <a href='https://raw.githubusercontent.com/milkytiptoe/Name-Sync/master/license' target=_blank>License</a> |\n    <a href='https://raw.githubusercontent.com/milkytiptoe/Name-Sync/master/changelog' target=_blank>Changelog</a> |\n    <a href='https://github.com/milkytiptoe/Name-Sync/issues/new' target=_blank>Issues</a>\n  </div>\n</fieldset>";
      field = $.el('fieldset');
      $.add(field, $.el('legend', {
        textContent: 'Main'
      }));
      ref = Config.main;
      for (setting in ref) {
        val = ref[setting];
        stored = $.get(setting);
        istrue = stored === null ? val[0] : stored === 'true';
        checked = istrue ? 'checked' : '';
        $.add(field, $.el('div', {
          innerHTML: "<label><input type=checkbox name='" + setting + "' " + checked + ">" + setting + "</label><span class=description>: " + val[1] + "</span>"
        }));
      }
      $.prepend(section, field);
      ref1 = $$('input[type=checkbox]', section);
      for (i = 0, len = ref1.length; i < len; i++) {
        check = ref1[i];
        $.on(check, 'click', function() {
          return $.set(this.name, this.checked);
        });
      }
      ref2 = $$('input[type=text], input[type=number]', section);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        text = ref2[j];
        text.value = $.get(text.name) || '';
        $.on(text, 'input', function() {
          var err, error, regexp;
          if (/^Filter/.test(this.name)) {
            try {
              regexp = RegExp(this.value);
            } catch (error) {
              err = error;
              alert(err.message);
              return this.value = $.get(this.name);
            }
          }
          return $.set(this.name, this.value);
        });
      }
      $.on($('#syncClear', section), 'click', Sync.clear);
      return $('div[id$="x-settings"] nav').style.visibility = 'hidden';
    }
  };

  Sync = {
    init: function() {
      this.disabled = false;
      this.lastModified = '0';
      this.delay = (parseInt($.get('Delay'))) || 300;
      this.failedSends = 0;
      this.canRetry = true;
      if (!Main.boardLegit()) {
        $.off(d, 'QRPostSuccessful', this.requestSend);
        $.off(d, 'ThreadUpdate', this.threadUpdate);
        $.off(d, 'IndexRefresh', this.indexRefresh);
        return;
      }
      if (!Set['Read-only Mode']) {
        this.setupQR();
        $.on(d, 'QRPostSuccessful', this.requestSend);
      }
      $.on(d, 'ThreadUpdate', this.threadUpdate);
      $.on(d, 'IndexRefresh', this.indexRefresh);
      return this.sync(true);
    },
    indexRefresh: function() {
      return setTimeout(function() {
        var i, j, len, len1, post, ref, ref1, thread;
        g.posts = {};
        g.threads = [];
        ref = $$('.thread');
        for (i = 0, len = ref.length; i < len; i++) {
          thread = ref[i];
          g.threads.push(thread.id.slice(1));
        }
        ref1 = $$('.thread > .postContainer');
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          post = ref1[j];
          g.posts[post.id.slice(2)] = new Post(post);
        }
        clearTimeout(Sync.handle);
        return Sync.handle = setTimeout(Sync.sync, Sync.delay);
      }, Sync.delay);
    },
    threadUpdate: function(e) {
      var l;
      if (e.detail[404]) {
        return Sync.disabled = true;
      }
      if (!(l = e.detail.newPosts.length > 0)) {
        return;
      }
      clearTimeout(Sync.handle);
      return Sync.handle = setTimeout(Sync.sync, Sync.delay);
    },
    sync: function(repeat) {
      if (g.threads.length === 0) {
        return;
      }
      $.ajax('qp', 'GET', "t=" + g.threads + "&b=" + g.board, {
        onloadend: function() {
          var i, len, poster, ref;
          if (!(this.status === 200 && this.response)) {
            return;
          }
          if (g.view === 'thread') {
            Sync.lastModified = this.getResponseHeader('Last-Modified') || Sync.lastModified;
          }
          ref = JSON.parse(this.response);
          for (i = 0, len = ref.length; i < len; i++) {
            poster = ref[i];
            Posts.nameByPost[poster.p] = poster;
          }
          Posts.updateAllPosts();
          return $.event('NamesSynced');
        }
      });
      if (repeat && g.view === 'thread' && !Sync.disabled) {
        return setTimeout(Sync.sync, 30000, true);
      }
    },
    setupQR: function() {
      var qr;
      if (!(qr = $.id('qr'))) {
        $.on(d, 'QRDialogCreation', Sync.setupQR);
        return;
      }
      $.addClass(qr, 'sync-enabled');
      return $('input[data-name=email]', qr).placeholder = 'E-mail';
    },
    requestSend: function(e) {
      var currentEmail, currentName, currentSubject, postID, qr, threadID;
      postID = e.detail.postID;
      threadID = e.detail.threadID;
      if (Set['Persona Fields']) {
        currentName = $.get('Name') || '';
        currentEmail = $.get('Email') || '';
        currentSubject = $.get('Subject') || '';
      } else {
        qr = $.id('qr');
        currentName = $('input[data-name=name]', qr).value;
        currentEmail = $('input[data-name=email]', qr).value;
        currentSubject = $('input[data-name=sub]', qr).value;
      }
      currentName = currentName.trim();
      currentEmail = currentEmail.trim();
      currentSubject = currentSubject.trim();
      if (Set['Hide Sage'] && /sage/i.test(currentEmail)) {
        return;
      }
      if (/since4pass/i.test(currentEmail)) {
        currentEmail = '';
      }
      if (currentName + currentEmail + currentSubject === '') {
        return;
      }
      return Sync.send(currentName, currentEmail, currentSubject, postID, threadID);
    },
    send: function(name, email, subject, postID, threadID, retryTimer) {
      return $.ajax('sp', 'POST', "p=" + postID + "&t=" + threadID + "&b=" + g.board + "&n=" + (encodeURIComponent(name)) + "&s=" + (encodeURIComponent(subject)) + "&e=" + (encodeURIComponent(email)) + "&dnt=" + (Set['Do Not Track'] ? '1' : '0'), {
        onerror: function() {
          if (!Sync.canRetry) {
            return;
          }
          retryTimer = retryTimer || 0;
          if (retryTimer > 10000) {
            ++Sync.failedSends;
            if (Sync.failedSends === 2) {
              $.event('CreateNotification', {
                detail: {
                  type: 'warning',
                  content: 'Connection errors with sync server. Fields may not appear.',
                  lifetime: 8
                }
              });
            }
            if (Sync.failedSends >= 3) {
              Sync.canRetry = false;
              setTimeout(function() {
                return Sync.canRetry = true;
              }, 60000);
            }
            return;
          }
          retryTimer += retryTimer < 5000 ? 2000 : 5000;
          return setTimeout(Sync.send, retryTimer, name, email, subject, postID, threadID, retryTimer);
        }
      });
    },
    clear: function() {
      $('#syncClear').disabled = true;
      return $.ajax('rm', 'POST', '', {
        onerror: function() {
          return $('#syncClear').value = 'Error';
        },
        onloadend: function() {
          if (this.status !== 200) {
            return;
          }
          return $('#syncClear').value = 'Cleared';
        }
      });
    }
  };

  $.on(d, '4chanXInitFinished', Main.init);

  Post = (function() {
    Post.prototype.toString = function() {
      return this.ID;
    };

    function Post(root) {
      var capcode, date, info, name, post, subject, uID;
      this.ID = root.id.slice(2);
      post = $('.post', root);
      info = $('.postInfo', post);
      this.nodes = {
        root: root,
        post: post,
        info: info
      };
      this.isReply = $.hasClass(post, 'reply');
      this.info = {};
      if (!(subject = $('.subject', info))) {
        subject = $.el('span', {
          className: 'subject'
        });
        $.after($('[type="checkbox"]', info), [$.tn(' '), subject]);
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
      if (uID = $('.posteruid .hand', info)) {
        this.info.uID = uID.textContent;
      }
    }

    return Post;

  })();

}).call(this);
