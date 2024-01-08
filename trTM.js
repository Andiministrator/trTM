//[trTMlib.js]BOF

/**
 * Global implementation script/object for Google GTAG and Tag Manager, depending on the user consent.
 * @version 1.3.1, Netdoktor Version
 * @lastupdate 19.12.2023 by Andi Petzoldt <andi@tracking-garden.com>
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @documentation see README_Netdoktor_Implementation.md or README_trTM.md for general information about trTM
 * @usage (with example config)
 *   trTM.f.config({ env:'&gtm_auth=ABC123xyz&gtm_preview=env-1&gtm_cookies_win=x', gtmID:'GTM-XYZ123' });
 *   trTM.f.tm_inject();
 */

// Initialitialize the objects
window.trTM = window.trTM || {}; // Tag Manager Global Object
trTM.c = trTM.c || {}; // TM Configuration Settings Object
trTM.d = trTM.d || {}; // TM Data Object
trTM.d.version = '1.3.1'; // trTM Version
trTM.d.config = trTM.d.config || false; // is TM is configured?
trTM.d.init = trTM.d.init || false; // is TM Initialisation complete?
trTM.d.fired = trTM.d.fired || false; // is TM active (was fired)
trTM.d.dom_ready = trTM.d.dom_ready || false; // DOMready state
trTM.d.page_ready = trTM.d.page_ready || false; // Page (complete) Loaded state
trTM.d.ev_fct_ctr = trTM.d.ev_fct_ctr || 0; // Event Counter
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
 * Function to set the config
 * @property {function} trTM.f.config
 * @param {object} cfg - the object with your settings
 * Usage: trTM.f.config({ env:'&gtm_auth=ABC123xyz&gtm_preview=env-1&gtm_cookies_win=x', gtmID:'GTM-XYZ123' });
 */
if (typeof trTM.f.config!='function') trTM.f.config = function (cfg) {
  // Check, wether config was already set
  if (trTM.d.config) {
    trTM.f.log('e1', trTM.c);
    return;
  }
  // Set the Config
  trTM.c.gtmID = cfg.gtmID || ''; // your GTM Container ID - leave it empty if you don't want to the Google Tag Manager
  trTM.c.gtmPurposes = cfg.gtmPurposes || ''; // The purpose(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Functional'
  trTM.c.gtmServices = cfg.gtmServices || ''; // The services(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Tag Manager'
  trTM.c.gtmVendors = cfg.gtmVendors || ''; // The vendors(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Inc'
  trTM.c.tmID = trTM.c.gtmID ? trTM.c.gtmID.substring(4) : '';
  trTM.c.gdl = cfg.gdl || 'dataLayer'; // Name of GTM dataLayer | Default:'dataLayer'
  trTM.c.env = cfg.env || ''; // Environment string (leave it blank you you don't know, what it is)
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
        if (attr.indexOf('=')>=0) { val = attr.substr(attr.indexOf('=')+1,).replace(/["']/gm,''); }
        tmCEarr[i] = name;
        trTM.c.consent.consent_event_attr[name] = {};
        trTM.c.consent.consent_event_attr[name][key] = val;
      }
    }
    trTM.c.consent.consent_events = ',' + tmCEarr.join(',') + ',';
  }
  trTM.c.consent.consent_id = trTM.c.consent.consent_id || ''; // ID of the current CMP User to request consent info
  trTM.c.consent.gtagmap = trTM.c.consent.gtagmap || {}; // Mapping for GTAG/GTM integrated Consent Functions - set it to {} if is not needed
  //var a = ['ad_storage','analytics_storage','functionality_storage','personalization_storage','security_storage'];
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
 * Function with the logic for the initial gtag
 * @property {function} trTM.f.gtag
 * Usage: if (typeof gtag!='function') gtag = trTM.f.gtag;
 */
if (typeof trTM.f.gtag!='function') trTM.f.gtag = function () {
  var args = arguments;
  window[trTM.c.gdl] = window[trTM.c.gdl] || [];
  window[trTM.c.gdl].push(args);
};
// Copy it as window.gtag function
window.gtag = window.gtag || trTM.f.gtag;

/**
 * Function for adding an Event Listener
 * @property {function} trTM.f.evLstn
 * @param {object} el - the dom object where you want to add the event listener, you should catch it e.g. with document.querySelector('div.CLASSNAME')
 * @param {string} ev - the event name, e.g. 'mousedown'
 * @param {function} fct - the functio to run, if the event listener matches
 * Usage: trTM.f.evLstn( document.querySelector('div.button'), 'mousedown', click_fct );
 */
trTM.f.evLstn = trTM.f.evLstn || function(el, ev, ft) {
  if(typeof el!='object' && !el && typeof ev!='string' && typeof ft!='function') {
    trTM.f.log('e11', el);
    return;
  }
  try { el.addEventListener(ev,ft); } catch(e) { trTM.f.log('e12', el); }
};

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Sourcepoint
 * @version 1.1
 * @lastupdate 03.12.2023 by Andi Petzoldt <andi@petzoldt.net>
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @property {function} trTM.f.consent_check
 * @param {string} action - the action, what the function should do. can be "init" (for the first consent check) or "update" (for updating existing consent info)
 * @returns {boolean} - true, if consent is available, false if not
 * Usage: trTM.f.consent_check('init');
 */
trTM.f.consent_check = trTM.f.consent_check || function (action) {
  if (!trTM.d.config) { trTM.f.log('e2', null); return false; }
  if (typeof action!='string' || (action!='init'&&action!='update')) { trTM.f.log('e3', {action:action}); return false; }
  // Check whether response was already given
  if (action=='init' && o.hasResponse) return true;
  // Build temp object
  var o = {};
  // Get Consent
  o.purposes = typeof trTM.c.purposes=='string' ? ','+trTM.c.purposes+',' : '';
  o.services = typeof trTM.c.services=='string' ? ','+trTM.c.services+',' : '';
  o.vendors = typeof trTM.c.vendors=='string' ? ','+trTM.c.vendors+',' : '';
  // Set Response and Feedback
  o.hasResponse = true;
  o.feedback = 'no valid check fct given, cfg used';
  // Return
  trTM.d.consent = o;
  trTM.f.log('m2', o);
  return true;
};

/**
 * Helper fuction for the consent function
 * @property {function} trTM.f.chelp
 * @param {string} need_cons - a string with the purposes/vendors that need consent (comma-separated)
 * @param {string} given_cons - a string with the purposes/vendors that need consent (comma-separated and with a comma at the beginning and at the end)
 * Usage: trTM.f.consent('default');
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
 * @property {function} trTM.f.consent
 * @param {string} a - the action, what the function should do. can be "default" (for init the first consent check with default values) or "update" (for updating existing consent info)
 * Usage: trTM.f.consent('default');
 */
if (typeof trTM.f.consent!='function') trTM.f.consent = function (a) {
  if (!trTM.d.config) { trTM.f.log('e4', null); return false; }
  if (typeof a!='string' || (a!='init'&&a!='update')) { trTm.f.log('e5',{a:a}); return false; }
  // check consent
  var cc = trTM.f.consent_check(a);
  if (!cc) {
    trTM.f.log('m8', null);
    return false;
  }
  // set consent for GTM
  window[trTM.c.gdl] = window[trTM.c.gdl] || [];
  if (trTM.c.tmID && trTM.f.chelp(trTM.c.gtmPurposes,trTM.d.consent.purposes) && trTM.f.chelp(trTM.c.gtmServices,trTM.d.consent.services) && trTM.f.chelp(trTM.c.gtmVendors,trTM.d.consent.vendors)) trTM.d.consent.gtmConsent = true;
  // gtm special consent stuff
  if (trTM.c.tmID) {
    // add some cool stuff with setDefaultConsentState und updateConsentState
  }
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
    if (a=='update' && typeof trTM.d.cm=='object') gtag('consent', 'update', trTM.d.cm);
  }
  if (typeof trTM.f.consent_callback=='function') trTM.f.consent_callback(a);
  trTM.f.log('m3', trTM.d.consent);
  return true;
};

/**
 * Function to initialize the Google Tag Manager
 * @property {function} trTM.f.tm_init
 * @param {object} w - the (Browser) window object, usually: window
 * @param {object} d - the (HTML) document object, usually: document
 * @param {string} i - Google Tag manager Container ID without the "GTM-", e.g. XYZ123
 * @param {string} l - name of the GTM dataLayer, usually: 'dataLayer'
 * @param {string} e - an environment string, e.g. '&gtm_auth=abc123def567&gtm_preview=env-1&gtm_cookies_win=x' - leave it empty if not needed
 * Usage: trTM.f.tm_init(window,document,'XYZ123','dataLayer','&gtm_auth=abc123def567&gtm_preview=env-1&gtm_cookies_win=x');
 */
if (typeof trTM.f.tm_init!='function') trTM.f.tm_init = function (w, d, i, l, e) {
  if (!trTM.d.config) { trTM.f.log('e7', null); return; }
  if (!trTM.d.init) {
    trTM.d.init = true;
    if (!trTM.c.gtag || typeof trTM.d.consent.gtagConsent!='boolean' || !trTM.d.consent.gtagConsent) {
      var o = {'event':'g'+'tm.js','initTime':new Date().getTime(),'gtm.start':new Date().getTime()};
      trTM.d.dl.push(o);
      /*w[l]=w[l]||[];*/ w[l].push(o);
    }
    var s = 'script', f = d.getElementsByTagName(s)[0], j = d.createElement(s);
    j.src = 'https://www.goo'+'glet'+'agmanager.com/g'+'tm.js?id=G'+'TM-'+i + '&l='+l+e;
    j.async = true; f.parentNode.insertBefore(j, f);
  }
};

/**
 * Logic to run for a consent event listener or consent timer function
 * Returns true, if consent was checked successful, false if not
 * @property {function} trTM.f.consent_fct
 * Usage: var res = trTM.f.consent_fct();
 */
if (typeof trTM.f.consent_fct!='function') trTM.f.consent_fct = function () {
  var consent = trTM.f.consent('init');
  if (!consent) return false;
  if (!trTM.d.fired) trTM.f.tm_inject();
  return true;
};

/**
 * Function to set a Timer for a periodically consent check
 * @property {function} trTM.f.consent_timer_listener
 * Usage: trTM.f.consent_timer_listener();
 */
if (typeof trTM.f.consent_timer_listener!='function') trTM.f.consent_timer_listener = function () {
  var consent = trTM.f.consent_fct();
  if (consent && typeof trTM.d.timer!='undefined') { clearInterval(trTM.d.timer); delete trTM.d.timer; }
};

/**
 * Function to check whether consent is available, either with an event listener or periodically
 * @property {function} trTM.f.consent_listener
 * Usage: trTM.f.consent_listener();
 */
if (typeof trTM.f.consent_listener!='function') trTM.f.consent_listener = function () {
  if (typeof trTM.f.consent_event_listener=='function') { trTM.f.consent_event_listener(); }
  else { trTM.d.timer = setInterval(trTM.f.consent_timer_listener, 100); }
};

/**
 * Function to call events from a container
 * @property {function} trTM.f.ev_call
 * @param {string} t - the fct container name, e.g. 'dl' for dom loaded
 * @param {boolean} d - set it to true, if the function shell be deleted after calling it
 * Usage: trTM.f.ev_call('dl',true);
 */
trTM.f.ev_call = trTM.f.ev_call || function(t,d) {
  if (typeof t!='string' || !t || typeof trTM.f[t]!='object') return;
  for (var fct in trTM.f[t]) {
    if (typeof trTM.f[t][fct]!='function') continue;
    trTM.f[t][fct]();
    if (d) delete trTM.f[t][fct];
  }
};

/**
 * Function to run by DOMready state
 * @property {function} trTM.f.domready
 * Usage: trTM.f.domready();
 */
trTM.f.domready = trTM.f.domready || function() {
  if (!trTM.d.dom_ready) trTM.f.ev_call('dl',true);
  trTM.d.dom_ready = true;
};

/**
 * Function to run by PAGEloaded state
 * @property {function} trTM.f.pageready
 * Usage: trTM.f.pageready();
 */
trTM.f.pageready = trTM.f.pageready || function() {
  if (!trTM.d.page_ready) trTM.f.ev_call('pl',true);
  trTM.d.page_ready = true;
};

/**
 * Function to inject the GTM and/or GTAG into the website
 * @property {function} trTM.f.tm_inject
 * Usage: trTM.f.tm_inject();
 */
if (typeof trTM.f.tm_inject!='function') trTM.f.tm_inject = function () {
  if (!trTM.d.config) { trTM.f.log('e8', null); return false; }
  var consent = trTM.f.consent('init');
  if (!consent) {
    trTM.f.log('m4', null);
    trTM.f.consent_listener();
    return false;
  }
  if (!trTM.d.fired) {
    // Initiate gtag
    if ((trTM.c.gtag && trTM.d.consent.gtagConsent) || (trTM.c.tmID && trTM.d.consent.gtmConsent)) {
      var tmpDL = window[trTM.c.gdl] || [];
      window[trTM.c.gdl] = [];
      if (trTM.c.consent.cm && typeof trTM.d.cm=='object') gtag('consent', 'default', trTM.d.cm);
      trTM.f.fire({ event:'trTM_consent_init', cmp:trTM.d.consent, gtag:false });
    }
    // Inject GTAG
    if (trTM.c.gtag && trTM.d.consent.gtagConsent) {
      var gtags = [];
      for (var k in trTM.c.gtag) { gtags.push(k); }
      if (gtags.length>0) {
        var scr = document.createElement('script');
        scr.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtags[0];
        scr.type = 'text/javascript';
        scr.async = true;
        document.head.appendChild(scr);
        gtag('js', new Date());
        for (var k in trTM.c.gtag) {
          var gc = trTM.c.gtag[k];
          if (gc) { gtag('config', k, gc); } else { gtag('config', k); };
          /* deprecated: UA tracker create */ if (k.substring(0,3)=='UA-' && typeof ga=='function') ga('create', k, gc ? gc : 'auto');
          /*if (gc && (typeof gc.send_page_view=='undefined' || (typeof gc.send_page_view=='boolean' && gc.send_page_view))) {
            gtag('event', 'page_view', {
               send_to: k
              ,page_title: document.title
              ,page_location: document.location.href
            });
          }*/
        }
        if (typeof trTM.f.gtag_inject_callback=='function') trTM.f.gtag_inject_callback();
        trTM.f.log('m5', trTM.c.gtag);
      }
    }
    // Inject GTM
    if (trTM.c.tmID && trTM.d.consent.gtmConsent) {
      var latDL = [];
      if (tmpDL.length>0) {
        for (var i=0; i<tmpDL.length; i++) {
          if (typeof tmpDL[i]=='object' && (typeof tmpDL[i].length=='number' || typeof tmpDL[i].event!='string')) {
            trTM.f.fire(tmpDL[i]);
            continue;
          }
          var ev = JSON.parse(JSON.stringify(tmpDL[i]));
          if (typeof ev['gtm.uniqueEventId']!='undefined') delete ev['gtm.uniqueEventId'];
          /*if (ev.event.substr(0,4)=='gtm.') {
            trTM.f.fire(ev);
          } else { trTM.d.dl.push(ev); latDL.push(ev); }*/
        }
      }
      // Inject GTM
      trTM.f.tm_init(window,document,trTM.c.tmID,trTM.c.gdl,trTM.c.env);
      /*for (var i=0; i<latDL.length; i++) {
        trTM.f.fire(tmpDL[i]);
      }*/
      //window[trTM.c.gdl] = window[trTM.c.gdl] || [];
      if (typeof trTM.f.gtm_inject_callback=='function') trTM.f.gtm_inject_callback();
      trTM.f.log('m6', null);
    }
    trTM.d.fired = true;
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
  return true;
};

/**
 * Function for GTM dataLayer.push()
 * @property {function} trTM.f.fire
 * @param {object} o - the event object, e.g. { event:'pageview', pagetype:'blogarticle' }
 * Usage: trTM.f.fire({ event:'pageview', pagetype:'blogarticle' });
 */
if (typeof trTM.f.fire!='function') trTM.f.fire = function (o) {
  if (typeof o!='object') { trTM.f.log('e9',{o:typeof o}); return; }
  var obj = JSON.parse(JSON.stringify(o));
  window[trTM.c.gdl] = window[trTM.c.gdl] || [];
  if (trTM.c.consent.consent_events && typeof obj.event=='string' && trTM.c.consent.consent_events.indexOf(','+obj.event+',')>=0) {
    if (typeof trTM.c.consent.consent_event_attr[obj.event]=='object') {
      for (k in trTM.c.consent.consent_event_attr[obj.event]) {
        if (typeof obj[k]!='undefined') {
          if (!trTM.c.consent.consent_event_attr[obj.event][k] || obj[k]==trTM.c.consent.consent_event_attr[obj.event][k]) {
            trTM.f.consent('update');
            trTM.f.fire({ event:'trTM_consent_update', cmp:JSON.parse(JSON.stringify(trTM.d.consent)), gtag:false, cmp_obj:obj});
            //return;
          }
        }
      }
    } else {
      trTM.f.consent('update');
      trTM.f.fire({ event:'trTM_consent_update', cmp:JSON.parse(JSON.stringify(trTM.d.consent)), gtag:false, cmp_obj:obj});
      //return;
    }
  }
  if (trTM.c.tmID && trTM.d.consent.gtmConsent && (typeof obj.gtm!='boolean' || obj.gtm)) {
    trTM.d.dl.push(obj); window[trTM.c.gdl].push(obj);
  }
  if (trTM.c.gtag && trTM.d.consent.gtagConsent && (typeof obj.event=='string' && obj.event) && (typeof obj.gtag!='boolean' || obj.gtag)) {
    if (typeof obj.gtagID=='string' && obj.gtagID) {
      obj.send_to = obj.gtagID;
      gtag('event', obj.event, obj);
    } else { 
      for (var k in trTM.c.gtag) {
        obj.send_to = k;
        gtag('event', obj.event, obj);
      }
    }
  }
  trTM.d.dl.push(obj);
  if (typeof trTM.f.fire_callback=='function' && trTM.d.fired) trTM.f.fire_callback(obj);
  trTM.f.log('m7', obj);
};

/**
 * Function for adding an DL Event
 * @property {function} trTM.f.addEv
 * @param {string} p - Page State, when the Event Listener should be added. Possible values: 'tl' (Tracking/Library loaded), 'dl' (DOM loaded), 'pl' (Page loaded)
 * @param {object} d - DOM object where the event (listener) selector should be added, e.g. document.querySelector('div.navigation'), default is document
 * @param {string} l - Listener, e.g. 'click'
 * @param {string} s - Selector for the DOM elements, e.g. 'div.button'
 * @param {object} o - Event object, e.g. { event:'click', button:'Signup Button' }
 * Usage: trTM.f.addEv( 'dl', document, 'click', 'div.button', { event:'click', button:'Signup Button' } );
 */
trTM.f.addEv = trTM.f.addEv || function(p, d, l, s, o) {
  if (typeof p!='string' || !p || typeof d!='object' || !d || typeof l!='string' || !l || typeof s!='string' || !s || typeof o!='object' || !o) return;
  if (typeof trTM.f[p]!='object') trTM.f[p] = {};
  trTM.d.ev_fct_ctr++;
  trTM.f[p]['fct_'+trTM.d.ev_fct_ctr.toString()] = function() {
    var el = d.querySelectorAll(s);
    if (typeof el=='object' && typeof el.length=='number' && el.length>0) {
      var ev = l;
      switch(ev) {
        case 'click': ev = 'mousedown'; break;
      }
      for (var i=0; i<el.length; i++) {
        // add function to listener container
        trTM.f.evLstn(el[i], ev, function() {
          trTM.f.fire(o);
        });
      }
    } 
  };
  // check dom_ready
  if ((p=='tl' && trTM.d.fired) || (p=='dl' && trTM.d.dom_ready) || (p=='pl' && trTM.d.page_ready)) {
    trTM.f[p]['fct_'+trTM.d.ev_fct_ctr.toString()]();
  }
};

//[trTMlib.js]EOF