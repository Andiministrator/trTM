//[trTM.js]BOF


/**
 * Global implementation script/object for Google GTAG and Tag Manager, depending on the user consent.
 * @version 1.6.1
 * @lastupdate 19.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @repository https://github.com/Andiministrator/trTM/
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @documentation see README.md or https://github.com/Andiministrator/trTM/
 * @usage (with example config):
 * <script type="text/javascript" id="trTMcontainer" nonce="abc123">
 * (function(c){
 * var w=window,d=document;w.trTM=w.trTM||{};w.trTM.c=c;var s='script',t=d.createElement(s),m=c.min?'.min':'',p=c.path;if(p.length>0&&p.substring(p.length-1)!='/')p+='/';
 * t.src=c.path+'trTM'+m+'.js';t.async=true;d.head.appendChild(t);
 * })({
 *    path: '/js/'
 *   ,cmp: 'cookiebot'
 *   ,gtmID: 'GTM-XYZ123'
 *   ,gtm: {
 *     'GTM-XYZ123': {}
 *    }
 *   ,consent: {
 *      cm:true
 *     ,gtagmap:{
 *        ad_storage: { vendors:['Google Ads'] }
 *       ,analytics_storage: { vendors:['Google Analytics'] }
 *       ,my_storage: { vendors:['My Analytics'] }
 *     }
 *   }
 * });
 * </script>
 */


/***** Initialization and Configuration *****/

// Initialitialize the objects
window.trTM = window.trTM || {}; // Tag Manager Global Object
trTM.c = trTM.c || {}; // TM Configuration Settings Object
trTM.d = trTM.d || {}; // TM Data Object
trTM.d.version = '1.6.1'; // trTM Version
trTM.d.f = trTM.d.f || []; // Array for temp. Fire Events
trTM.d.config = trTM.d.config || false; // is TM is configured?
trTM.d.init = trTM.d.init || false; // is TM Initialisation complete?
trTM.d.dom_ready = trTM.d.dom_ready || false; // DOMready state
trTM.d.page_ready = trTM.d.page_ready || false; // Page (complete) Loaded state
trTM.d.ev_fct_ctr = trTM.d.ev_fct_ctr || 0; // Event Counter
trTM.d.timer = trTM.d.timer || {}; // Active Timer
trTM.d.error_counter = trTM.d.error_counter || 0; // Set Error Counter
trTM.d.errors = trTM.d.errors || []; // Set Array for Errors
trTM.d.dl = trTM.d.dl || []; // Data Layer
trTM.f = trTM.f || {}; // TM Function Library Object
trTM.f.tl = trTM.f.tl || {}; // Function Container for Tracking/Library loaded
trTM.f.dl = trTM.f.dl || {}; // Function Container for DOM loaded
trTM.f.pl = trTM.f.pl || {}; // Function Container for Page loaded
trTM.l = trTM.l || [];// TM Log Object for Messages and Errors

/**
 * Function to log a message or an error
 * @property {function} trTM.f.log
 * @param {string} id - id of log message, e.g. 'm3'
 * @param {object} obj - object for additional information
 * Usage: trTM.f.log('m3', ev);
 */
if (typeof trTM.f.log!='function') trTM.f.log = function (id, obj) {
  if (typeof obj=='object' && obj) obj = JSON.parse(JSON.stringify(obj));
  trTM.l.push({ id:id, timestamp:new Date().getTime(), obj:obj });
};

/**
 * Function to clean a string
 * @property {function} trTM.f.strclean
 * @param {string} str - string to clean
 * @returns {string} - cleaned string
 * Usage: trTM.f.strclean('any "dirty"; string');
 */
if (typeof trTM.f.strclean!='function') trTM.f.strclean = function (str) {
  if (typeof str!='string') return '';
  return str.replace(/[^a-zäöüßA-ZÄÖÜ0-9_-]/g, '');
};

/**
 * Function to set the config
 * @property {function} trTM.f.config
 * @param {object} cfg - the object with your settings
 * Usage: trTM.f.config({ min:false, gtm: {'GTM-XYZ123':{env:'&gtm_auth=ABC123xyz&gtm_preview=env-1&gtm_cookies_win=x}} });
 */
if (typeof trTM.f.config!='function') trTM.f.config = function (cfg) {
  // Check, wether config was already set
  if (trTM.d.config) {
    trTM.f.log('e1', trTM.c);
    return;
  }
  // Set the Config
  trTM.c.debug = cfg.debug || false; // If this is true, the optout cookie will be ignored
  trTM.c.path = cfg.path || ''; // (relative) path to the directory where trTM is located, e.g. '/js/''
  trTM.c.file = cfg.file || 'trTM.js'; // Filename of trTM
  trTM.c.cmp = cfg.cmp || ''; // Type of Consent Tool (Cookie Banner) you use in lower case, e.g. 'cookiebot'. See README.md for possible options.
  if (typeof trTM.c.min!='boolean') trTM.c.min = true; // inject the files as minified versions
  trTM.c.nonce = cfg.nonce || ''; // Nonce value for the file injections
  trTM.c.useListener = cfg.useListener || false; // Use an event listener to check the consent (true). If it is false, a timer will be used (default) to check the consent
  trTM.c.gtm_use = false;
  for (var k in trTM.c.gtm) {
    trTM.c.gtm_use = true;
    trTM.c.gtm[k].env = trTM.c.gtm[k].env || ''; // Environment string (leave it blank you you don't know, what it is)
    trTM.c.gtm[k].gtmURL = trTM.c.gtm[k].gtmURL || ''; // If you use an own url to the GTM (e.g. using the serverside Google Tag Manager), you can set your URL here. Leave it blank if you don't know what this means.
    trTM.c.gtm[k].gtmJS = trTM.c.gtm[k].gtmJS || ''; // Possibility to give the GTM JS direct as Javascript content, but Base64-encoded. In this case, no external JS script will be loaded.
  }
  trTM.c.gtmPurposes = cfg.gtmPurposes || ''; // The purpose(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Functional'
  trTM.c.gtmServices = cfg.gtmServices || ''; // The services(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Tag Manager'
  trTM.c.gtmVendors = cfg.gtmVendors || ''; // The vendors(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Inc'
  trTM.c.gdl = cfg.gdl || 'dataLayer'; // Name of GTM dataLayer | Default:'dataLayer'
  if (typeof trTM.c.dlStateEvents!='boolean') trTM.c.dlStateEvents = true; // Fire GTM dataLayer Events for DOMloaded and PAGEready
  trTM.c.gtag = cfg.gtag || null; // GTAG(s) with config - set it to null if you don't want to use GTAG functionallity, example: cfg.gtag = { 'G-xxx': { debug_mode:true, send_page_view:false } };
  trTM.c.gtagPurposes = cfg.gtagPurposes || ''; // The purpose(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Marketing'
  trTM.c.gtagServices = cfg.gtagServices || ''; // The services(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Google Analytics'
  trTM.c.gtagVendors = cfg.gtagVendors || ''; // The vendors(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Google Inc'
  trTM.c.consent = cfg.consent || {}; // object with consent information that should be set by default (if no consent is given or not yet).
  trTM.c.consent.hasResponse = trTM.c.consent.hasResponse || false; // true (or string) if consent was given, false if consent was not (yet) given (user hasn't interacted with the consent banner)
  trTM.c.consent.feedback = trTM.c.consent.feedback || ''; // contains a string with a CMP info about whether/how the consent was given
  trTM.c.consent.purposes = trTM.c.consent.purposes || ''; // contains a string with the acknowledged consent purposes
  trTM.c.consent.services = trTM.c.consent.services || ''; // contains a string with the acknowledged consent services
  trTM.c.consent.vendors = trTM.c.consent.vendors || ''; // contains a string with the acknowledged consent vendors
  trTM.c.consent.cm = trTM.c.consent.cm || false; // use the Gtag Consent Function
  var tmCE = trTM.c.consent.consent_events || ''; // string with consent events (comma-separated) for updating the consent (leave it blank you you don't know, what it is)
  if (!tmCE) { trTM.c.consent_events='';  } else {
    trTM.c.consent.consent_event_attr = {};
    var tmCEarr = tmCE.split(',');
    for (var i=0; i<tmCEarr.length; i++) {
      var ev = tmCEarr[i];
      if (ev.indexOf('[')>=0 && ev.indexOf(']')>=0) {
        var name = ev.substr(0,ev.indexOf('['));
        var attr = ev.substr(ev.indexOf('[')+1,ev.indexOf(']')-ev.indexOf('[')-1);
        var key = attr;
        if (attr.indexOf('=')>=0) { key = attr.substr(0,attr.indexOf('=')); }
        var val = '';
        if (attr.indexOf('=')>=0) { val = attr.substr(attr.indexOf('=')+1).replace(/["']/gm,''); }
        tmCEarr[i] = name;
        trTM.c.consent.consent_event_attr[name] = {};
        trTM.c.consent.consent_event_attr[name][key] = val;
      }
    }
    trTM.c.consent.consent_events = ',' + tmCEarr.join(',') + ',';
  }
  trTM.c.consent.consent_id = trTM.c.consent.consent_id || ''; // ID of the current CMP User to request consent info
  trTM.c.consent.gtagmap = trTM.c.consent.gtagmap || {}; // Mapping for GTAG/GTM integrated Consent Functions - set it to {} if is not needed
  //var a = ['ad_storage','analytics_storage','functionality_storage','personalization_storage','security_storage','ad_user_data','ad_personalization'];
  for (k in trTM.c.consent.gtagmap) {
    trTM.c.consent.gtagmap[k] = typeof trTM.c.consent.gtagmap[k]=='object' ? trTM.c.consent.gtagmap[k] : {};
    trTM.c.consent.gtagmap[k].status = trTM.c.consent.gtagmap[k].status || 'denied';
    trTM.c.consent.gtagmap[k].purposes = trTM.c.consent.gtagmap[k].purposes || [];
    trTM.c.consent.gtagmap[k].services = trTM.c.consent.gtagmap[k].services || [];
    trTM.c.consent.gtagmap[k].vendors = trTM.c.consent.gtagmap[k].vendors || [];
  }
  // Initialisation after Settings
  trTM.d.consent = trTM.d.consent || JSON.parse(JSON.stringify(trTM.c.consent));
  trTM.d.consent.gtmConsent = false;
  trTM.d.consent.gtagConsent = false;
  // Set confif status to true
  trTM.d.config = true;
  trTM.f.log('m1', trTM.c);
};

/**
 * Function with the logic for the initial gtag. Will be called as window.gtag
 * @property {function} gtag
 * Usage: gtag(arguments);
 */
window[trTM.c.gdl] = window[trTM.c.gdl] || [];
window.gtag = window.gtag || function () {
  window[trTM.c.gdl].push(arguments);
};


/***** Consent Functions *****/

/**
 * Function to load the (real) consent_check function, depending on your Consent Tool (CMP)
 * @property {function} trTM.f.load_cc
 * @param {string} cmp - your consent tool, see README for possible options. E.g. 'cookiebot'
 * @param {function} callback - the function to run, after the script is loaded completely
 * Usage: trTM.f.load_cc('cookiebot');
 */
trTM.f.load_cc = trTM.f.load_cc || function (cmp, callback) {
  var d=document, t=d.createElement('script'), m=trTM.c.min?'.min':'', p=trTM.c.path||''; if(p.length>0 && p.substring(p.length-1)!='/')p+='/';
  t.src = p + 'cmp/cc_' + trTM.f.strclean(cmp) + m + '.js';
  if (trTM.c.nonce) t.nonce = trTM.c.nonce;
  t.onreadystatechange=callback;
  t.onload=callback;
  t.async=true;
  d.head.appendChild(t);
};

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @type: No consent tool, this is the fallback function
 * @property {function} trTM.f.consent_check
 * @param {string} action - the action, what the function should do. can be "init" (for the first consent check) or "update" (for updating existing consent info)
 * @returns {boolean} - true, if consent is available, false if not
 * Usage: trTM.f.consent_check('init');
 */
/*trTM.f.consent_check = trTM.f.consent_check || function (action) {
  if (!trTM.d.config) { trTM.f.log('e2', null); return false; }
  if (typeof action!='string' || (action!='init'&&action!='update')) { trTM.f.log('e3', {action:action}); return false; }
  // Check whether response was already given
  trTM.d.consent = trTM.d.consent || {};
  if (action=='init' && trTM.d.consent.hasResponse) return true;
  // Get Consent
  var purposes = typeof trTM.c.purposes=='string' ? ','+trTM.c.purposes+',' : '';
  var services = typeof trTM.c.services=='string' ? ','+trTM.c.services+',' : '';
  var vendors = typeof trTM.c.vendors=='string' ? ','+trTM.c.vendors+',' : '';
  // Set Response and Feedback and Return
  trTM.d.consent.purposes = purposes;
  trTM.d.consent.services = services;
  trTM.d.consent.vendors = vendors;
  trTM.d.consent.feedback = 'no valid check fct given, cfg used';
  trTM.d.consent.hasResponse = true;
  trTM.f.log('m2', JSON.parse(JSON.stringify(trTM.d.consent)));
  return true;
};*/

/**
 * Helper fuction for the consent function
 * @property {function} trTM.f.chelp
 * @param {string} need_cons - a string with the purposes/vendors that need consent (comma-separated)
 * @param {string} given_cons - a string with the purposes/vendors that need consent (comma-separated and with a comma at the beginning and at the end)
 * Usage: trTM.f.chelp('Google Analytics, Google Remarketing', 'Google Analytics');
 */
if (typeof trTM.f.chelp!='function') trTM.f.chelp = function (need_cons, given_cons) {
  var c = true;
  if (need_cons && given_cons) {
    var a = need_cons.split(',');
    for (var i=0; i<a.length; i++) {
      if (given_cons.indexOf(','+a[i]+',')<0) c = false;
    }
  }
  return c;
};

/**
 * Function to run the consent check
 * @property {function} trTM.f.run_cc
 * @param {string} a - the action, what the function should do. can be "default" (for init the first consent check with default values) or "update" (for updating existing consent info)
 * Usage: trTM.f.run_cc('default');
 */
if (typeof trTM.f.run_cc!='function') trTM.f.run_cc = function (a) {
  if (!trTM.d.config) { trTM.f.log('e4', null); return false; }
  if (typeof a!='string' || (a!='init'&&a!='update')) { trTm.f.log('e5',{a:a}); return false; }
  // check consent
  if (typeof trTM.f.consent_check!='function') { trTm.f.log('e14',{a:a}); return false; }
  var cc = trTM.f.consent_check(a);
  if (!cc) {
    trTM.f.log('m8', null);
    return false;
  }
  // set consent for GTM
  window[trTM.c.gdl] = window[trTM.c.gdl] || [];
  if (trTM.c.gtm_use && trTM.f.chelp(trTM.c.gtmPurposes,trTM.d.consent.purposes) && trTM.f.chelp(trTM.c.gtmServices,trTM.d.consent.services) && trTM.f.chelp(trTM.c.gtmVendors,trTM.d.consent.vendors)) trTM.d.consent.gtmConsent = true;
  // set consent for GTAG
  if (trTM.c.gtag && trTM.f.chelp(trTM.c.gtagPurposes,trTM.d.consent.purposes) && trTM.f.chelp(trTM.c.gtagServices,trTM.d.consent.services) && trTM.f.chelp(trTM.c.gtagVendors,trTM.d.consent.vendors)) trTM.d.consent.gtagConsent = true;
  // transform consent to gtag format
  if (trTM.c.consent.cm) {
    var cm = trTM.d.consent.gtagmap;
    trTM.d.cm = {};
    for (k in cm) {
      cm[k].status = cm[k].status || 'denied';
      cm[k].purposes = cm[k].purposes || [];
      cm[k].services = cm[k].services || [];
      cm[k].vendors = cm[k].vendors || [];
      var s = cm[k].status;
      var ps = true;
      if (cm[k].purposes.length==0 && cm[k].services.length==0 && cm[k].vendors.length==0) ps = false;
      if (cm[k].purposes.length>0) {
        for (var i=0; i<cm[k].purposes.length; i++) {
          if (trTM.d.consent.purposes.indexOf(','+cm[k].purposes[i]+',')<0) ps = false;
        }
      }
      if (cm[k].services.length>0) {
        for (var i=0; i<cm[k].services.length; i++) {
          if (trTM.d.consent.services.indexOf(','+cm[k].services[i]+',')<0) ps = false;
        }
      }
      if (cm[k].vendors.length>0) {
        for (var i=0; i<cm[k].vendors.length; i++) {
          if (trTM.d.consent.vendors.indexOf(','+cm[k].vendors[i]+',')<0) ps = false;
        }
      }
      if (ps) s = 'granted';
      trTM.d.cm[k] = s;
    }
    if (a=='update') {
      var gcm = trTM.d.cm || {};
      gtag('consent', 'update', gcm);
      if (!trTM.d.init) return trTM.f.inject();
      trTM.f.fire({ event:'trTM_consent_update', cmp:JSON.parse(JSON.stringify(trTM.d.consent)), gcm:JSON.parse(JSON.stringify(gcm)), gtag:false});
    }
  }
  // Callback
  if (typeof trTM.f.consent_callback=='function') trTM.f.consent_callback(a);
  trTM.f.log('m3', trTM.d.consent);
  return true;
};

/**
 * Logic to run for a consent event listener or consent timer function
 * Returns true, if consent was checked successful, false if not
 * @property {function} trTM.f.call_cc
 * Usage: var res = trTM.f.call_cc();
 */
if (typeof trTM.f.call_cc!='function') trTM.f.call_cc = function () {
  var consent = trTM.f.run_cc('init');
  if (!consent) return false;
  if (typeof trTM.d.timer!='undefined') { clearInterval(trTM.d.timer); delete trTM.d.timer; }
  if (!trTM.d.init) return trTM.f.inject();
  return true;
};

/**
 * Function to check whether consent is available, either with an event listener or periodically
 * @property {function} trTM.f.consent_listener
 * Usage: trTM.f.consent_listener();
 */
if (typeof trTM.f.consent_listener!='function') trTM.f.consent_listener = function () {
  if (!trTM.c.useListener) trTM.d.timer = setInterval(trTM.f.call_cc, 1000);
};


/***** Google Tag Manager specific Functions *****/

/**
 * Function to initialize the Google Tag Manager
 * @property {function} trTM.f.gtm_load
 * @param {object} w - the (Browser) window object, usually: window
 * @param {object} d - the (HTML) document object, usually: document
 * @param {string} i - Google Tag manager Container ID without the "GTM-", e.g. XYZ123
 * @param {string} l - name of the GTM dataLayer, usually: 'dataLayer'
 * @param {string} o - object with further GTM settings, like environment string, GTM URL and GTM code
 * Usage: trTM.f.gtm_load(window,document,'XYZ123','dataLayer','&gtm_auth=abc123def567&gtm_preview=env-1&gtm_cookies_win=x');
 */
if (typeof trTM.f.gtm_load!='function') trTM.f.gtm_load = function (w, d, i, l, o) {
  if (!trTM.d.config) { trTM.f.log('e7', null); return; }
  var s = 'script', f = d.getElementsByTagName(s)[0], n = d.createElement(s);
  n.id = 'trTM_tm'; n.async = true;
  if (trTM.c.nonce) n.nonce = trTM.c.nonce;
  if (o.gtmJS) {
    n.innerHTML = atob(o.gtmJS);
  } else {
    var a = o.gtmURL || 'https://www.goo'+'glet'+'agmanager.com/gtm.js';
    var e = o.env || '';
    n.src = a + '?id='+i + '&l='+l+e;
  }
  f.parentNode.insertBefore(n, f);
};

/**
 * Function to run by DOMready state
 * @property {function} trTM.f.domready
 * Usage: trTM.f.domready();
 */
trTM.f.domready = trTM.f.domready || function() {
  if (!trTM.d.dom_ready) {
    if (trTM.c.dlStateEvents) trTM.f.fire({ event:'vDOMready', gtag:false });
  }
  trTM.d.dom_ready = true;
};

/**
 * Function to run by PAGEloaded state
 * @property {function} trTM.f.pageready
 * Usage: trTM.f.pageready();
 */
trTM.f.pageready = trTM.f.pageready || function() {
  if (!trTM.d.page_ready) {
    if (trTM.c.dlStateEvents) trTM.f.fire({ event:'vPAGEready', gtag:false });
  }
  trTM.d.page_ready = true;
};


/***** Injection *****/

/**
 * Function to inject the GTM and/or GTAG into the website
 * @property {function} trTM.f.inject
 * Usage: trTM.f.inject();
 */
if (typeof trTM.f.inject!='function') trTM.f.inject = function () {
  if (!trTM.d.config) { trTM.f.log('e8', null); return false; }
  if (typeof trTM.d.consent!='object' || typeof trTM.d.consent.hasResponse!='boolean' || !trTM.d.consent.hasResponse) {
    trTM.f.log('e13', null);
    return false;
  }
  if (!trTM.d.init) {
    // Temp. store dataLayer
    var dl = window[trTM.c.gdl] || [];
    if (dl.length>0) {
      for (var i=0; i<dl.length; i++) {
        if (!dl[i].trTMchk) {
          dl[i].trTMdl = true;
          var o = JSON.parse(JSON.stringify(dl[i]));
          if (typeof o['gtm.uniqueEventId']!='undefined') delete o['gtm.uniqueEventId'];
          trTM.d.f.push(o);
        }
      }
    }
    // Initiate gtag
    if ((trTM.c.gtag && trTM.d.consent.gtagConsent) || (trTM.c.gtm_use && trTM.d.consent.gtmConsent)) {
      var gcm = {};
      if (trTM.c.consent.cm && typeof trTM.d.cm=='object') {
        gtag('consent', 'default', trTM.d.cm);
        gcm = trTM.d.cm;
      }
      /* deprecated */ trTM.f.fire({ event:'trTM_consent_init', trTM_Notice:'this event is deprecated' ,cmp:trTM.d.consent, gcm:gcm, gtag:false });
      trTM.f.fire({ event:'trTM_ready', gtag:false, trTM: { version:trTM.d.version, consent:trTM.d.consent, gcm:gcm, hastyEvents:trTM.d.f, errors:trTM.d.errors } });
    }
    // Inject GTAG
    if (trTM.c.gtag && trTM.d.consent.gtagConsent) {
      var gtags = [];
      for (var k in trTM.c.gtag) { gtags.push(k); }
      if (gtags.length>0) {
        var scr = document.createElement('script');
        scr.src = 'https://www.goo'+'glet'+'agman'+'ager.com/gtag/js?id=' + gtags[0];
        scr.type = 'text/javascript';
        scr.async = true;
        document.head.appendChild(scr);
        gtag('js', new Date());
        for (var k in trTM.c.gtag) {
          var gc = trTM.c.gtag[k];
          if (gc) { gtag('config', k, gc); } else { gtag('config', k); };
        }
        if (typeof trTM.f.gtag_inject_callback=='function') trTM.f.gtag_inject_callback();
        trTM.f.log('m5', trTM.c.gtag);
      }
      trTM.d.init = true;
    }
    // Inject GTM
    if (trTM.c.gtm_use && trTM.d.consent.gtmConsent) {
      // Set GTM Start Push
      if (!trTM.c.gtag || typeof trTM.d.consent.gtagConsent!='boolean' || !trTM.d.consent.gtagConsent) {
        var o = {'event':'gtm.js','initTime':new Date().getTime(),'gtm.start':new Date().getTime()};
        if (trTM.c.nonce) o.nonce = trTM.c.nonce;
        trTM.d.dl.push(o);
        window[trTM.c.gdl].push(o);
      }
      // Inject GTM
      for (var k in trTM.c.gtm) {
        trTM.f.gtm_load(window,document,k,trTM.c.gdl,trTM.c.gtm[k]);
      }
      trTM.d.init = true;
    }
    // DOMready call
    var s = document.readyState;
    if (s=='interactive' || s=='loaded' || s=='complete') {
      trTM.f.domready();
    } else {
      trTM.f.evLstn(document,'DOMContentLoaded',trTM.f.domready)
    }
    // PAGEloaded state
    var s = document.readyState;
    if (s=='interactive' || s=='loaded' || s=='complete') {
      trTM.f.pageready();
    } else {
      trTM.f.evLstn(window,'load',trTM.f.pageready)
    }
  }
  // Callback and Return
  if (typeof trTM.f.inject_callback=='function') trTM.f.inject_callback();
  trTM.f.log('m6', null);
  return true;
};


/***** Helper Functions *****/

/**
 * Function to clean a string
 * @property {function} trTM.f.strclean
 * @param {string} str - string to clean
 * @returns {string} - cleaned string
 * Usage: trTM.f.strclean('any "dirty"; string');
 */
trTM.f.strclean = trTM.f.strclean || function (str) {
  if (typeof str!='string') return '';
  return str.replace(/[^a-zäöüßA-ZÄÖÜ0-9_-]/g, '');
};

/**
 * Function to clean a string
 * @property {function} trTM.f.chkvar
 * @param {string|number|object|boolean} v - value to check
 * @param {sting} t - type of var to check
 * @returns {boolean} - true if var value matches with the type and is not empty
 * Usage: trTM.f.chkvar('any "dirty"; string');
 */
trTM.f.chkvar = trTM.f.chkvar || function (v,t) {
  if (typeof v!=t) return false;
  if (typeof v!='boolean' && typeof v!='function' && !v) return false;
  return true;
};

/**
 * Function to gets the value of a C.
 * @property {function} trTM.f.gc
 * @param {string} cname - name of the C.
 * @returns {string|number|boolean|object} - value of C. (null if C. not exists)
 * Usage: trTM.f.gc('consent');
 */
trTM.f.gc = trTM.f.gc || function (cname) {
  var re = new RegExp(cname + "=([^;]+)");
  try {
    var d = document;
    var c = 'co' + /* ec */ 'o' + 'kie';
    var value = re.exec(d[c]);
  } catch (e) {}
  if (typeof value!='object' || !value || value.length<2) return null;
  return decodeURI(value[1]);
};

/**
 * Function for adding an Event Listener
 * @property {function} trTM.f.evLstn
 * @param {object} el - the dom object where you want to add the event listener, you should catch it e.g. with document.querySelector('div.CLASSNAME')
 * @param {string} ev - the event name, e.g. 'mousedown'
 * @param {function} fct - the functio to run, if the event listener matches
 * Usage: trTM.f.evLstn( document.querySelector('div.button'), 'mousedown', click_fct );
 */
trTM.f.evLstn = trTM.f.evLstn || function(el, ev, ft) {
  if (typeof el=='string' && el=='window') el = window;
  if (typeof el=='string' && el=='document') el = document;
  if(typeof el!='object' || !el || typeof ev!='string' || typeof ft!='function') {
    trTM.f.log('e11', el);
    return;
  }
  try { el.addEventListener(ev,ft); } catch(e) { trTM.f.log('e12', el); }
};

/**
 * Gets back a (predefined) value from window, document or body
 * @usage Gets back a (predefined) value from window, document or body
 * @lastupdate 10.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.getVal
 * Usage: trTM.f.getVal();
 */
trTM.f.getVal = trTM.f.getVal || function (o, v) {
  if (typeof o!='string' || typeof v!='string' || !v.match(/[a-z]+/i)) return undefined;
  switch (o) {
    case 'w': return window[v];
    case 'd': return document[v];
    case 'b': return document.body[v];
    case 's': return document.getElementsByTagName("html")[0].scrollTop || 0;
  }
  return undefined;
};

/**
 * Adds an element Listener to a DOM element
 * @usage Adds an element Listener to a DOM element
 * @lastupdate 10.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.elLst
 * @param {string} o - The DOM element object
 * @param {string} e - Event to add, e.g. 'mousedown'
 * @param {function} f - Function to add
 * Usage: trTM.f.elLst(<a>Linl</a>, 'mousedown', myClickFct);
 */
trTM.f.elLst = trTM.f.elLst || function (o, e, f) {
  try {
    o.addEventListener(e,function(p){
      // Get tagName and parent ID
      var tn = this.tagName.toLowerCase();
      var pid = '', cElID = this;
      while (cElID && cElID.parentElement && !cElID.id) { cElID = cElID.parentElement; if (cElID.id) { pid = cElID.id; if (typeof cElID.nodeName=='string') pid = cElID.nodeName.toLowerCase() + ':' + pid; } }
      // Get parent Class
      var pclass = '', cElClass = this;
      while (cElClass && cElClass.parentElement && !cElClass.getAttribute('class')) { cElClass = cElClass.parentElement; if (cElClass.getAttribute('class')) { pclass = cElClass.getAttribute('class'); if (typeof cElClass.nodeName=='string') pclass = cElClass.nodeName.toLowerCase() + ':' + pclass; } }
      // Get Parent Form
      var pform = null, pos = null;
      if (tn=='input' || tn=='select' || tn=='textarea') {
        var cElForm = this;
        while (cElForm && cElForm.parentElement && cElForm.tagName.toLowerCase()!='form') {
          cElForm = cElForm.parentElement;
          if (cElForm.tagName.toLowerCase()=='form') {
            pform = {
              id: cElForm.id,
              class: cElForm.getAttribute('class'),
              name: cElForm.getAttribute('name'),
              action: cElForm.action,
              elements: cElForm.elements.length
            };
          }
        }
        if (pform && cElForm.tagName.toLowerCase()=='form' && cElForm.contains(this)) pos = Array.prototype.indexOf.call(cElForm.elements, this) + 1;
      }
      // Count elements
      var elct = 0;
      if (typeof this.elements=='object' && typeof this.elements.length=='number') elct = this.elements.length;
      // Define Event Object
      var obj = {
        tagName: tn,
        target: this.target ? this.target : '',
        parentID: pid,
        parentClass: pclass,
        id: this.id ? this.id : '',
        name: typeof this.getAttribute('name')=='string' ? this.getAttribute('name') : '',
        class: typeof this.getAttribute('class')=='string' ? this.getAttribute('class') : '',
        href: this.href ? this.href : '',
        src: this.src ? this.src : '',
        action: this.action ? this.action : '',
        type: this.type ? this.type : '',
        elements: elct,
        position: pos,
        form: pform,
        html: this.outerHTML ? this.outerHTML.toString() : '',
        text: this.outerText ? this.outerText.toString() : ''
      };
      if (obj.html.length>512) obj.html = obj.html.slice(0, 509) + '...';
      if (obj.text.length>512) obj.text = obj.text.slice(0, 509) + '...';
      // Send Event Object
      f(obj);
    });
  } catch(e) { trTM.f.log('e12', o); }
};

/**
 * Adds an element Listener to DOM elements
 * @usage Adds an element Listener to DOM elements
 * @lastupdate 10.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.addElLst
 * @param {string} s - Selector for the DOM elements, e.g. 'a.menu'
 * @param {string} e - Event to add, e.g. 'mousedown'
 * @param {function} f - Function to add
 * Usage: trTM.f.addElLst('a', 'mousedown', myClickFct);
 */
trTM.f.addElLst = trTM.f.addElLst || function (s, e, f) {
  if (typeof s!='string' || typeof e!='string' || typeof f!='function') return;
  var nodes = document.querySelectorAll(s);
  if (!trTM.f.chkvar(nodes,'object') || nodes.length==0) return;
  for (var i=0; i<nodes.length; i++) {
    trTM.f.elLst(nodes[i],e,f);
  }
};

/**
 * Document Body Observer Function
 * @usage Adds element listener to elements in Body DOM, if the Body changes
 * @lastupdate 18.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.observer
 * @param {string} d - DOM element to watch with the Observer, e.g. 'body'
 * @param {string} e - Event to add, e.g. 'mousedown'
 * @param {function} f - Function to add
 * Usage: trTM.f.observer('a', 'mousedown', myClickFct);
 */
trTM.f.observer = trTM.f.observer || function (d, e, f) {
    if (!trTM.f.chkvar(d,'string') || !trTM.f.chkvar(e,'string') || !trTM.f.chkvar(f,'function')) return;
    // Observer Function
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          Array.prototype.forEach.call(mutation.addedNodes, function(node) {if(typeof node.tagName=='string'&&(node.tagName.toLowerCase()=='a'||node.tagName.toLowerCase()=='button'))console.log('OBSERVER add',node);
            // Prüfe, ob der direkt hinzugefügte Knoten ein Tag ist
            if (node.nodeType === 1 && typeof node.tagName=='string' && node.tagName.toLowerCase() === d.toLowerCase()) {
              trTM.f.elLst(node,e,f);
            }
            // Prüfe, ob in den untergeordneten Knoten des hinzugefügten Knotens Tags vorhanden sind
            if (node.nodeType === 1) {
              var innerTags = node.querySelectorAll(d.toLowerCase());
              Array.prototype.forEach.call(innerTags, function(tag) {
                trTM.f.elLst(tag,e,f);
              });
            }
          });
        }
/*
        // Bei Änderungen von Attributen, überprüfe, ob dies bei einem Tag geschieht
        if (mutation.type === 'attributes' && typeof mutation.target.tagName=='string' && mutation.target.tagName.toLowerCase() === d.toLowerCase()) {if(mutation.target.tagName.toLowerCase()=='a'||mutation.target.tagName.toLowerCase()=='button')console.log('OBSERVER attr',mutation.target);
          mutation.target.addEventListener(e, f);
        }
        // Überprüfe geänderte Nodes auf das Hinzufügen von Tags
        if (mutation.type === 'childList' && mutation.target.nodeType === 1) {
          var addedTags = mutation.target.querySelectorAll(d.toLowerCase());
          Array.prototype.forEach.call(addedTags, function(tag) {console.log('OBSERVER subadd',tag);
            trTM.f.elLst(tag,e,f);
          });
        }
*/
      });
    });
    // Observers Config: Watching new Nodes in Body
    var config = { childList: true, subtree: true, attributes: true };
    // Attach Observer to the Body
    observer.observe(document.body, config);
};

/**
 * Just a helper function for new RegExp, because this is not available in GTM Custom Tamplate
 * @usage Creates a new RegExp
 * @lastupdate 12.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.regEx
 * @param {string} r - Regex String, that is used for new Regex
 * Usage: trTM.f.regEx('[0-9]+');
 */
/*trTM.f.regEx = trTM.f.regEx || function (r) {
  return new RegExp(r);
};*/

/**
 * Just a helper function for test a string for a RegExp
 * @usage Return true, if the Regexp matches to the string, otherwise false
 * @lastupdate 19.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.rTest
 * @param {string} s - String, that has to be tested
 * @param {string} r - Regex String that is used
 * Usage: trTM.f.rTest('cmpUpdateEvent','cmp*Event',true);
 */
trTM.f.rTest = trTM.f.rTest || function (s,r) {
  if (typeof s!='string' || typeof r!='string') return false;
  var re = new RegExp(r);
  return re.test(s);
};

/**
 * Pushes JS Errors to the GTM dataLayer
 * @usage Pushes JS Errors to the GTM dataLayer
 * @lastupdate 13.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} trTM.f.jserrors
 * Usage: trTM.f.jserrors();
 */
trTM.f.jserrors = trTM.f.jserrors || function () {
  trTM.f.evLstn( window, 'error', function(ev) {
    if(ev!==null){
      var filename = typeof ev.filename=='string' ? ev.filename : '';
      var msg = typeof ev.message=='string' ? ev.message : '';
      if (msg.toLowerCase()=='script error.') {
        if (!filename) return;
        msg = msg.replace('.', ':') + ' error from other domain.';
      }
      if (filename) msg+= ' | file: ' + ev.filename;
      var lineno = typeof ev.lineno!='string' ? ev.lineno.toString() : ev.lineno; if (lineno=='0') lineno = '';
      if (lineno) msg+= ' | line: ' + lineno;
      var colno = typeof ev.colno!='string' ? ev.colno.toString() : ev.colno; if (colno=='0') colno = '';
      if (colno) msg+= ' | col: ' + colno;
      trTM.d.errors.push(msg);
      var browser = '';
      try { browser = navigator.appCodeName+' | '+navigator.appName+' | '+navigator.appVersion+' | '+navigator.platform; } catch(e){};
      if (trTM.d.error_counter++ >= 100) return;
      if (trTM.d.error_counter <= 5) trTM.f.fire({ event:'exception', errmsg:msg, browser:browser, timestamp:new Date().getTime(), errct:trTM.d.error_counter, gtag:false, eventModel:null });
    };
    return;
  });
};

/**
 * Timer Funktion to fire Events
 * @usage Timer Funktion to fire Events
 * @lastupdate 13.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} o.f.timerfkt
 * Usage: o.f.timerfkt();
 */
trTM.f.timerfkt = trTM.f.timerfkt || function(obj) {
  var ev = JSON.parse(JSON.stringify(obj));
  ev.timer_ms = ev.timer_ms * 1;
  ev.timer_ct++;
  ev.timer_tm = ev.timer_ms * ev.timer_ct;
  ev.timer_sc = parseFloat(( ev.timer_tm / 1000 ).toFixed(3));
  ev.event = ev.event || 'timer';
  if (ev.event.indexOf('[s]')) ev.event = ev.event.replace('[s]', ev.timer_sc.toString());
  ev.eventModel = null;
  ev.gtag = false;
  trTM.f.fire(ev);
};

/**
 * Define function to set Timer
 * @usage Define function to set Timer
 * @lastupdate 13.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} o.f.timer
 * @param {string} nm - Name of the Timer (just for debugging reasons). Leave it empty if you don't need it
 * @param {function} ft - The function to execute when the timer expires. If not set (or set to false) the internal function trTM.f.timerfkt will be used.
 * @param {function} ev - An event to fire. Leave it empty if you don't use this feature.
 * @param {number} ms - The time in milliseconds after which the function f is executed or the event has to be send.
 * @param {boolean} rp - The number how often the timer should be fired (0 for unlimited).
 * Usage: trTM.f.timer( 'timer', false, {event:'timer'}, 15000, 3 );
 */
trTM.f.timer = trTM.f.timer || function (nm, ft, ev, ms, rp) {
  // Create Timer Name
  if (!nm && typeof ev=='object' && typeof ev.event=='string') nm = ev.event;
  nm = nm || 'timer'; nm+= '_' + new Date().getTime().toString() + '_' + Math.floor((Math.random()*999999)+1).toString();
  // Check, whether Timer already exists (and stop/delete it)
  trTM.f.stoptimer(nm);
  // Create Object
  var obj = typeof ev=='object' ? JSON.parse(JSON.stringify(ev)) : {};
  obj.timer_nm = nm; obj.timer_ms = ms; obj.timer_rp = rp; obj.timer_ct = 0;
  // Set Timer
  obj.id = obj.timer_rp==1
    ? setTimeout(function() {
        if (ft) { ft(obj); } else { trTM.f.timerfkt(obj); }
    }, ms)
    : setInterval(function() {
        if (ft) { ft(obj); } else { trTM.f.timerfkt(obj); }
        obj.timer_ct++;
        if (obj.timer_rp>0 && obj.timer_ct>=obj.timer_rp) { trTM.f.stoptimer(obj.timer_nm); }
    }, ms);
  trTM.d.timer[nm] = obj;
};

/**
 * Define function to set Timer
 * @usage Define function to set Timer
 * @lastupdate 13.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@tracking-garden.com>
 * @property {function} o.f.timer
 * @param {string} nm - Name of the Timer to delete.
 * Usage: trTM.f.stoptimer( 'timer_2234443_234534' );
 */
trTM.f.stoptimer = trTM.f.stoptimer || function (nm) {
  if (typeof trTM.d.timer[nm]=='object') {
    var t = trTM.d.timer[nm];
    if (t.timer_rp) { clearInterval(t.id); } else { clearTimeout(t.id); };
    delete trTM.d.timer[nm];
  }
};


/***** Init and Fire Functions *****/

/**
 * Function for to initialize and inject the trTM 
 * @property {function} trTM.f.init
 * Usage: trTM.f.init();
 */
trTM.f.init = function () {
  // Return (and do nothing) if there is a cookie with the name 'trTMoptout' (and a value)
  if (!trTM.c.debug && trTM.f.gc('trTMoptout')) return;
  // Read and set the config
  trTM.f.config(trTM.c);
  // Inject the trTM
  if (trTM.c.cmp) {
    trTM.f.load_cc(trTM.c.cmp, trTM.f.consent_listener);
  } else {
    trTM.f.consent_listener();
  }
  // Run JS error monitoring
  trTM.f.jserrors();
};

/**
 * Function for GTM dataLayer.push()
 * @property {function} trTM.f.fire
 * @param {object} o - the event object, e.g. { event:'pageview', pagetype:'blogarticle' }
 * Usage: trTM.f.fire({ event:'pageview', pagetype:'blogarticle' });
 */
trTM.f.fire = function (o) {
  // Some checks and preparations
  if (typeof o!='object') { trTM.f.log('e9',{o:typeof o}); return; }
  var obj = JSON.parse(JSON.stringify(o));
  //if (typeof obj.eventModel=='object' && obj.eventModel) return;
  //if (typeof obj.cmp=='object' && typeof obj.event=='string' && obj.event!='trTM_consent_init' && obj.event!='trTM_consent_update') return;
  if (typeof obj.trTMts=='number' || typeof obj.eventModel=='object') return;
  obj.trTMts = Date.now();
  // Check whether event is a consent update event
  if (trTM.c.consent.consent_events && typeof obj.event=='string' && trTM.c.consent.consent_events.indexOf(','+obj.event+',')>=0) {
    if (typeof trTM.c.consent.consent_event_attr[obj.event]=='object') {
      for (k in trTM.c.consent.consent_event_attr[obj.event]) {
        if (typeof obj[k]!='undefined') {
          if (!trTM.c.consent.consent_event_attr[obj.event][k] || obj[k]==trTM.c.consent.consent_event_attr[obj.event][k]) trTM.f.run_cc('update');
        }
      }
    } else { trTM.f.run_cc('update'); }
  }
  // Check whether Consent is available
  if ((typeof trTM.d.consent!='object' || !trTM.d.consent.hasResponse) && (typeof obj.event!='string' || obj.event.indexOf('trTM')!==0)) {
    trTM.d.f.push(JSON.parse(JSON.stringify(o)));
    return;
  }
  // Send event to GTM
  if (trTM.c.gtm_use && trTM.d.consent.gtmConsent && (typeof obj.gtm!='boolean' || obj.gtm)) {
    // Prepare params
    var gtmparams = JSON.parse(JSON.stringify(obj));
    if (typeof gtmparams['gtm.uniqueEventId']!='undefined') delete gtmparams['gtm.uniqueEventId'];
    if (typeof gtmparams.gtm!='undefined') delete gtmparams.gtm;
    if (typeof gtmparams.gtag!='undefined') delete gtmparams.gtag;
    if (typeof gtmparams.trTMparams!='undefined') delete gtmparams.trTMparams;
    var gtmobj = JSON.parse(JSON.stringify(obj));
    if (typeof obj.event!='string' || obj.event.indexOf('trTM')!==0) gtmobj.trTMparams = gtmparams;
    //gtmobj.eventModel = null;
    //gtmobj.gtm = false;
    trTM.d.dl.push(gtmobj); window[trTM.c.gdl].push(gtmobj);
  }
  // Send event to GTAG
  if (trTM.c.gtag && trTM.d.consent.gtagConsent && trTM.f.chkvar(obj.event,'string') && (typeof obj.gtag!='boolean' || obj.gtag)) {
    if (trTM.f.chkvar(obj.gtagID,'string')) {
      obj.send_to = obj.gtagID;
      gtag('event', obj.event, obj);
    } else { 
      for (var k in trTM.c.gtag) {
        obj.send_to = k;
        gtag('event', obj.event, obj);
      }
    }
  }
  // Fire callback function
  if (typeof trTM.f.fire_callback=='function' && trTM.d.init) trTM.f.fire_callback(obj);
  trTM.f.log('m7', obj);
};

// Run
trTM.f.init();


//[trTM.js]EOF