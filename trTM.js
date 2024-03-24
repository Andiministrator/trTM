//[trTM.js]BOF


/**
 * Global implementation script/object for Google GTAG and Tag Manager, depending on the user consent.
 * @version 1.6.2
 * @lastupdate 24.03.2024 by Andi Petzoldt <andi@tracking-garden.com>
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

// Function to initialize properties within the trTM object with default values
function trTMinit(obj, prop, defaultValue) {
  obj[prop] = obj[prop] || defaultValue;
}

// Initialize the main object if it doesn't exist
window.trTM = window.trTM || {};

// Use the trTMinit function to initialize various properties and objects
trTMinit(trTM, 'c', {}); // TM Configuration Settings Object
trTMinit(trTM, 'd', {}); // TM Data Object
trTMinit(trTM.d, 'version', '1.6.2'); // trTM Version
trTMinit(trTM.d, 'f', []); // Array for temporary Fire Events
trTMinit(trTM.d, 'config', false); // Check if TM is configured
trTMinit(trTM.d, 'init', false); // Check if TM Initialization is complete
trTMinit(trTM.d, 'dom_ready', false); // DOM ready state
trTMinit(trTM.d, 'page_ready', false); // Page (complete) Loaded state
trTMinit(trTM.d, 'ev_fct_ctr', 0); // Event Counter
trTMinit(trTM.d, 'timer', {}); // Active Timer
trTMinit(trTM.d, 'error_counter', 0); // Set Error Counter
trTMinit(trTM.d, 'errors', []); // Set Array for Errors
trTMinit(trTM.d, 'dl', []); // Data Layer
trTMinit(trTM, 'f', {}); // TM Function Library Object
trTMinit(trTM.f, 'tl', {}); // Function Container for Tracking/Library loaded
trTMinit(trTM.f, 'dl', {}); // Function Container for DOM loaded
trTMinit(trTM.f, 'pl', {}); // Function Container for Page loaded
trTMinit(trTM, 'l', []); // TM Log Object for Messages and Errors

/**
 * Function to log a message or an error
 * @property {function} trTM.f.log
 * @param {string} id - id of log message, e.g., 'm3'
 * @param {object} obj - object for additional information
 * Usage: trTM.f.log('m3', ev);
 */
trTM.f.log = function(id, obj) {
  // Clone the object if it's an object to avoid mutations
  var clonedObj = typeof obj === 'object' && obj ? JSON.parse(JSON.stringify(obj)) : obj;
  trTM.l.push({ id: id, timestamp: new Date().getTime(), obj: clonedObj });
};

/**
 * Function to clean a string
 * @property {function} trTM.f.strclean
 * @param {string} str - string to clean
 * @returns {string} - cleaned string
 * Usage: trTM.f.strclean('any "dirty"; string');
 */
trTM.f.strclean = function(str) {
  // Ensure the input is a string
  if (typeof str !== 'string') return '';
  // Remove all characters except alphanumerics, German umlauts, dashes, and underscores
  return str.replace(/[^a-zäöüßA-ZÄÖÜ0-9_-]/g, '');
};

/**
 * Assigns a property to a target object, using a value from a source object or a default value.
 * @param {object} target - The target object where the property will be assigned.
 * @param {string} property - The name of the property to an.
 * @param {object} source - The source object from which to retrieve the value.
 * @param {*} defaultValue - The default value to use if the property is not found in the source.
 */
trTM.f.an = function(target, property, source, defaultValue) {
  // Assign the property from the source or use the default value
  target[property] = source.hasOwnProperty(property) ? source[property] : defaultValue;
};

/**
 * Configures the trTM object with user-defined settings.
 * @param {object} cfg - Configuration settings provided by the user.
 */
trTM.f.config = function(cfg) {
  // Check whether config was already set to avoid reconfiguration
  if (trTM.d.config) {
    if (typeof trTM.f.log=='funktion') trTM.f.log('e1', trTM.c);
    return;
  }
  // Assigning user-defined configurations or default values
  trTM.f.an(trTM.c, 'debug', cfg, false); // If this is true, the optout cookie will be ignored
  trTM.f.an(trTM.c, 'path', cfg, ''); // (relative) path to the directory where trTM is located, e.g. '/js/''
  trTM.f.an(trTM.c, 'file', cfg, 'trTM.js'); // Filename of trTM, default is 'trTM.js'
  trTM.f.an(trTM.c, 'cmp', cfg, ''); // Type of Consent Tool (Cookie Banner) you use in lower case, e.g. 'cookiebot'. See README.md for possible options.
  trTM.c.min = typeof cfg.min=='boolean' ? cfg.min : true; // inject the files as minified versions
  trTM.f.an(trTM.c, 'nonce', cfg, ''); // Nonce value for the file injections
  trTM.f.an(trTM.c, 'useListener', cfg, false); // Use an event listener to check the consent (true). If it is false, a timer will be used (default) to check the consent

  // GTM-specific configuration
  trTM.c.gtm_use = !!cfg.gtmID; // Determine if GTM is used
  trTM.f.an(trTM.c, 'gtmID', cfg, ''); // GTM ID for fire hasty Events, by default the last GTM ID of the following object will be used
  if (cfg.gtm) { // Object with GTM container config, example: cfg.gtm = { 'GTM-xxx': { debug_mode:true } };
    for (var k in cfg.gtm) {
      if (cfg.gtm.hasOwnProperty(k)) {
        trTM.c.gtm_use = true; // Set GTM use to true if at least one GTM configuration exists
        trTM.c.gtmID = k; // GTM ID
        // Assign GTM-container-specific configurations
        trTM.c.gtm[k] = trTM.c.gtm[k] || {};
        trTM.f.an(trTM.c.gtm[k], 'env', cfg.gtm[k], ''); // Environment string (leave it blank you you don't know, what it is)
        trTM.f.an(trTM.c.gtm[k], 'gtmURL', cfg.gtm[k], ''); // If you use an own url to the GTM (e.g. using the serverside Google Tag Manager), you can set your URL here. Leave it blank if you don't know what this means.
        trTM.f.an(trTM.c.gtm[k], 'gtmJS', cfg.gtm[k], ''); // Possibility to give the GTM JS direct as Javascript content, but Base64-encoded. In this case, no external JS script will be loaded.
      }
    }
  }
  trTM.f.an(trTM.c, 'gdl', cfg, 'dataLayer'); // GTM dataLayer name
  trTM.c.dlStateEvents = typeof cfg.dlStateEvents=='boolean' ? cfg.dlStateEvents : true; // Fire GTM dataLayer Events for DOMloaded and PAGEready
  trTM.f.an(trTM.c, 'gtmPurposes', cfg, ''); // The purpose(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Functional'
  trTM.f.an(trTM.c, 'gtmServices', cfg, ''); // The services(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Tag Manager'
  trTM.f.an(trTM.c, 'gtmVendors', cfg, ''); // The vendors(s) that must be agreed to in order to activate the GTM (comma-separated), e.g. 'Google Inc'

  // GTAG configurations
  trTM.f.an(trTM.c, 'gtag', cfg, null); // GTAG(s) with config - set it to null if you don't want to use GTAG functionallity, example: cfg.gtag = { 'G-xxx': { debug_mode:true, send_page_view:false } };
  trTM.f.an(trTM.c, 'gtagPurposes', cfg, ''); // The purpose(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Marketing'
  trTM.f.an(trTM.c, 'gtagServices', cfg, ''); // The services(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Google Analytics'
  trTM.f.an(trTM.c, 'gtagVendors', cfg, ''); // The vendors(s) that must be agreed to in order to activate the GTAG (comma-separated), e.g. 'Google Inc'

  // Consent configuration
  trTM.c.consent = cfg.consent || {}; // object with consent information that should be set by default (if no consent is given or not yet).
  // Initialize the nested consent properties with default values or from cfg
  trTM.f.an(trTM.c.consent, 'hasResponse', cfg.consent, false); // true (or string) if consent was given, false if consent was not (yet) given (user hasn't interacted with the consent banner)
  trTM.f.an(trTM.c.consent, 'feedback', cfg.consent, ''); // contains a string with a CMP info about whether/how the consent was given
  trTM.f.an(trTM.c.consent, 'purposes', cfg.consent, ''); // contains a string with the acknowledged consent purposes
  trTM.f.an(trTM.c.consent, 'services', cfg.consent, ''); // contains a string with the acknowledged consent services
  trTM.f.an(trTM.c.consent, 'vendors', cfg.consent, ''); // contains a string with the acknowledged consent vendors
  trTM.f.an(trTM.c.consent, 'cm', cfg.consent, false); // Use the Gtag Consent Function
  trTM.f.an(trTM.c.consent, 'consent_id', cfg.consent, ''); // ID of the current CMP User to request consent info

  // Initialize the GTAG map with default values
  trTM.c.consent.gtagmap = cfg.consent && cfg.consent.gtagmap ? cfg.consent.gtagmap : {}; // Mapping for GTAG/GTM integrated Consent Functions - set it to {} if is not needed
  //var a = ['ad_storage','analytics_storage','functionality_storage','personalization_storage','security_storage','ad_user_data','ad_personalization'];
  for (var key in trTM.c.consent.gtagmap) {
    if (trTM.c.consent.gtagmap.hasOwnProperty(key)) {
      trTM.c.consent.gtagmap[key] = typeof trTM.c.consent.gtagmap[key] === 'object' ? trTM.c.consent.gtagmap[key] : {};
      trTM.f.an(trTM.c.consent.gtagmap[key], 'status', trTM.c.consent.gtagmap[key], 'denied');
      trTM.f.an(trTM.c.consent.gtagmap[key], 'purposes', trTM.c.consent.gtagmap[key], []);
      trTM.f.an(trTM.c.consent.gtagmap[key], 'services', trTM.c.consent.gtagmap[key], []);
      trTM.f.an(trTM.c.consent.gtagmap[key], 'vendors', trTM.c.consent.gtagmap[key], []);
    }
  }

  // Initialize after settings
  trTM.d.consent = trTM.d.consent || JSON.parse(JSON.stringify(trTM.c.consent)); // Deep copy to avoid reference issues
  trTM.d.consent.gtmConsent = false; // Initialize GTM consent as false
  trTM.d.consent.gtagConsent = false; // Initialize GTAG consent as false
  trTM.d.config = true; // Set the configuration status to true
  if (typeof trTM.f.log=='funktion') trTM.f.log('m1', trTM.c); // Log the configuration
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
 * Loads the consent_check function specific to the user's Consent Management Platform (CMP).
 * @property {function} trTM.f.load_cc
 * @param {string} cmp - The identifier of the consent tool, e.g., 'cookiebot'.
 * @param {function} callback - The callback function to execute once the script is fully loaded.
 * Usage: trTM.f.load_cc('cookiebot', callbackFunction);
 */
trTM.f.load_cc = function(cmp, callback) {
  var scriptTag = document.createElement('script');
  // Get the script path, adding a trailing slash if it's missing
  var scriptPath = trTM.c.path || '';
  if (scriptPath.length>0 && scriptPath.charAt(scriptPath.length - 1)!=='/') scriptPath += '/';
  // Construct the full script URL, cleaning the CMP name and appending the minified suffix if needed
  var scriptFile = 'cmp/cc_' + trTM.f.strclean(cmp) + (trTM.c.min ? '.min' : '') + '.js';
  scriptTag.src = scriptPath + scriptFile;
  // Add nonce for Content Security Policy (CSP) if it's provided
  if (trTM.c.nonce) scriptTag.nonce = trTM.c.nonce;
  // Set up the callback to execute when the script is loaded
    //t.onreadystatechange=callback;
    //t.onload=callback;
  scriptTag.onreadystatechange = scriptTag.onload = function() {
    // Ensure the script is fully loaded or completed before executing the callback
    if (!scriptTag.readyState || /loaded|complete/.test(scriptTag.readyState)) {
      // Check if the callback is a function before executing it
      if (typeof callback === 'function') {
        callback();
      }
    }
  };
  // Load the script asynchronously
  scriptTag.async = true;
  // Append the script tag to the head of the document
  document.head.appendChild(scriptTag);
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
trTM.f.chelp = function (need_cons, given_cons) {
  var c = true;
  if (need_cons && given_cons) {
    need_cons.split(',').forEach(function(consent) {
      if (given_cons.indexOf(',' + consent.trim() + ',') < 0) c = false;
    });
  }
  return c;
};

/**
 * Helper Function - Evaluates whether the given consents satisfy the required consents for a specific type.
 * @param {object} obj - The type object containing status, purposes, services, and vendors.
 * @param {object} consents - The given consents object containing purposes, services, and vendors.
 * @return {boolean} - True if all required consents are given, false otherwise.
 */
trTM.f.evalCons = function(obj, consents) {
  var isConsentGiven = function(list, consentString) {
    return list.every(function(item) {
      return consentString.indexOf(',' + item + ',') >= 0;
    });
  };
  var purposesGiven = !obj.purposes.length || isConsentGiven(obj.purposes, consents.purposes);
  var servicesGiven = !obj.services.length || isConsentGiven(obj.services, consents.services);
  var vendorsGiven = !obj.vendors.length || isConsentGiven(obj.vendors, consents.vendors);
  return purposesGiven && servicesGiven && vendorsGiven;
};

/**
 * Updates the consent status in the GTAG format and performs additional actions based on the update action.
 * @param {object} consentMap - The consent map to update.
 */
trTM.f.updCons = function(consentMap) {
  if (!consentMap) return;
  gtag('consent', 'update', consentMap);
  if (!trTM.d.init) return trTM.f.inject();
  trTM.f.fire({
    event: 'trTM_consent_update',
    cmp: JSON.parse(JSON.stringify(trTM.d.consent)),
    gcm: JSON.parse(JSON.stringify(consentMap)),
    gtag: false
  });
};

/**
 * Executes the consent check and updates the consent status accordingly.
 * @property {function} trTM.f.run_cc
 * @param {string} action - The action to perform: "init" for initial consent check or "update" for updating existing consent info.
 * Usage: trTM.f.run_cc('init');
 */
trTM.f.run_cc = function (action) {
  // Ensure configuration is set before proceeding
  if (!trTM.d.config) { trTM.f.log('e4', null); return false; }
  // Validate the action parameter
  if (typeof action !== 'string' || (action !== 'init' && action !== 'update')) { trTM.f.log('e5', {action: action}); return false; }
  // Check if consent_check function is defined
  if (typeof trTM.f.consent_check !== 'function') { trTM.f.log('e14', {action: action}); return false; }
  // Perform the consent check
  var consentCheck = trTM.f.consent_check(action);
  if (!consentCheck) { trTM.f.log('m8', null); return false; }
  // Set GTM consent status
  window[trTM.c.gdl] = window[trTM.c.gdl] || [];
  if (trTM.c.gtm_use && trTM.f.chelp(trTM.c.gtmPurposes, trTM.d.consent.purposes)
                     && trTM.f.chelp(trTM.c.gtmServices, trTM.d.consent.services)
                     && trTM.f.chelp(trTM.c.gtmVendors, trTM.d.consent.vendors))
    trTM.d.consent.gtmConsent = true;
  // Set GTAG consent status
  if (trTM.c.gtag && trTM.f.chelp(trTM.c.gtagPurposes, trTM.d.consent.purposes)
                  && trTM.f.chelp(trTM.c.gtagServices, trTM.d.consent.services)
                  && trTM.f.chelp(trTM.c.gtagVendors, trTM.d.consent.vendors))
    trTM.d.consent.gtagConsent = true;
  // Transform consent to GTAG format
  if (trTM.c.consent.cm) {
    var consentMap = trTM.d.consent.gtagmap;
    trTM.d.cm = {};
    for (var key in consentMap) {
      if (consentMap.hasOwnProperty(key)) {
        var status = consentMap[key].status || 'denied';
        var consentGiven = trTM.f.evalCons(consentMap[key], trTM.d.consent);
        trTM.d.cm[key] = consentGiven ? 'granted' : status;
      }
    }
    // Update consent status if action is 'update'
    if (action === 'update') trTM.f.updCons(trTM.d.cm);
  }
  // Execute callback if defined
  if (typeof trTM.f.consent_callback === 'function') trTM.f.consent_callback(action);
  // Log the current consent status
  trTM.f.log('m3', trTM.d.consent);
  return true;
};

/**
 * Executes the consent check and performs subsequent actions based on the consent status.
 * @property {function} trTM.f.call_cc
 * @return {boolean} Returns true if consent was checked successfully, false otherwise.
 * Usage: var res = trTM.f.call_cc();
 */
trTM.f.call_cc = function () {
  // Run the consent check
  if (typeof trTM.f.run_cc!='function' || !trTM.f.run_cc('init')) return false; // If consent check failed, return false
  // Clear the consent timer if it's set
  if (typeof trTM.d.timer.consent!='undefined') { clearInterval(trTM.d.timer.consent); delete trTM.d.timer.consent; }
  // If initialization hasn't been done, call the inject function
  if (!trTM.d.init) return trTM.f.inject();
  // Return true if consent was checked successfully
  return true;
};

/**
 * Initializes a consent check process, either by setting an event listener or by creating a timer for periodic checks.
 * @property {function} trTM.f.consent_listener
 * Usage: trTM.f.consent_listener();
 */
if (typeof trTM.f.consent_listener!='function') trTM.f.consent_listener = function () {
  if (!trTM.c.useListener) trTM.d.timer.consent = setInterval(trTM.f.call_cc, 1000);
};


/***** Google Tag Manager specific Functions *****/

/**
 * Initializes the Google Tag Manager with provided settings.
 * @property {function} trTM.f.gtm_load
 * @param {object} w - The window object, usually: window.
 * @param {object} d - The document object, usually: document.
 * @param {string} i - Google Tag Manager Container ID without "GTM-", e.g., "XYZ123".
 * @param {string} l - Name of the GTM dataLayer, usually: "dataLayer".
 * @param {object} o - Object with further GTM settings like environment string, GTM URL, and GTM code.
 * Usage: trTM.f.gtm_load(window, document, 'XYZ123', 'dataLayer', {gtm_auth: 'abc123', gtm_preview: 'env-1', gtm_cookies_win: 'x'});
 */
trTM.f.gtm_load = function (w, d, i, l, o) {
  if (!trTM.d.config) { trTM.f.log('e7', null); return; }
  // Create a new DOM node (tag) of type "script"
  var scriptTag = d.createElement('script');
  scriptTag.id = 'trTM_tm';
  scriptTag.async = true;
  if (trTM.c.nonce) scriptTag.nonce = trTM.c.nonce;
  // Set the script content directly if GTM code is provided
  if (o.gtmJS) {
    scriptTag.innerHTML = atob(o.gtmJS);
  } else {
    // Construct the GTM script URL
    var gtmUrl = o.gtmURL || 'https://www.goo'+'glet'+'agmanager.com/gtm.js';
    var envParam = o.env || '';
    scriptTag.src = gtmUrl + '?id=' + i + '&l=' + l + envParam;
  }
  // Insert the GTM script tag into the document
  var firstScriptTag = d.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
};

/**
 * Executes actions when the DOM is fully loaded and ready.
 * It fires a custom event if dlStateEvents is true.
 * @property {function} trTM.f.domready
 * Usage: trTM.f.domready();
 */
trTM.f.domready = function() {
  // Ensure the function runs only once
  if (!trTM.d.dom_ready) {
    // Fire a custom event if dlStateEvents is enabled
    if (trTM.c.dlStateEvents) trTM.f.fire({ event: 'vDOMready', gtag: false });
    // Mark DOM as ready to prevent future executions
    trTM.d.dom_ready = true;
  }
};

/**
 * Executes actions when the entire page, including all dependent resources, is fully loaded.
 * It fires a custom event if dlStateEvents is true.
 * @property {function} trTM.f.pageready
 * Usage: trTM.f.pageready();
 */
trTM.f.pageready = function() {
  // Ensure the function runs only once
  if (!trTM.d.page_ready) {
    // Fire a custom event if dlStateEvents is enabled
    if (trTM.c.dlStateEvents) trTM.f.fire({ event: 'vPAGEready', gtag: false });
    // Mark page as ready to prevent future executions
    trTM.d.page_ready = true;
  }
};


/***** Injection *****/

/**
 * Initializes GTAG with the given consent status and configuration.
 * This function is called from trTM.f.inject when GTAG consent is granted.
 * @property {function} trTM.f.initGTAG
 * Usage: trTM.f.initGTAG();
 */
trTM.d.initGTAG = function() {
  var gtags = Object.keys(trTM.c.gtag);
  if (gtags.length > 0) {
    var script = document.createElement('script');
    script.src = 'https://www.goo'+'glet'+'agman'+'ager.com/gtag/js?id=' + gtags[0];
    script.async = true;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtags.forEach(function(gtagId) {
      var config = trTM.c.gtag[gtagId];
      gtag('config', gtagId, config ? config : {});
    });
    if (typeof trTM.f.gtag_inject_callback === 'function') trTM.f.gtag_inject_callback();
  }
};

/**
 * Initializes GTM with the given consent status and configuration.
 * This function is called from trTM.f.inject when GTM consent is granted.
 * @property {function} trTM.f.initGTAG
 * Usage: trTM.f.initGTM();
 */
trTM.f.initGTM = function() {
  for (var containerId in trTM.c.gtm) {
    if (trTM.c.gtm.hasOwnProperty(containerId)) {
      trTM.f.gtm_load(window, document, containerId, trTM.c.gdl, trTM.c.gtm[containerId]);
    }
  }
};

/**
 * Checks the document's and page ready state and calls the domready and pageready functions accordingly.
 * If the document is already loaded, it triggers the functions immediately;
 * otherwise, it sets up listeners for the DOMContentLoaded and PAGEready and load events.
 * @property {function} trTM.f.chkDPready
 * Usage: trTM.f.chkDPready();
 */
trTM.f.chkDPready = function() {
  var state = document.readyState;
  if (state === 'interactive' || state === 'loaded' || state === 'complete') {
    trTM.f.domready();
    trTM.f.pageready();
  } else {
    trTM.f.evLstn(document, 'DOMContentLoaded', trTM.f.domready);
    trTM.f.evLstn(window, 'load', trTM.f.pageready);
  }
};

/**
 * Injects GTM and/or GTAG scripts based on consent.
 * @property {function} trTM.f.inject
 * Usage: trTM.f.inject();
 */
trTM.f.inject = function () {
  // Ensure configuration is loaded before proceeding
  if (!trTM.d.config) { trTM.f.log('e8', null); return false; }
  // Check if consent object exists and has a valid response
  if (typeof trTM.d.consent!='object' || typeof trTM.d.consent.hasResponse!='boolean' || !trTM.d.consent.hasResponse) { trTM.f.log('e13', null); return false; }
  // Proceed only if not already initialized
  if (!trTM.d.init) {
    // Temporary store and process dataLayer items
    var dl = window[trTM.c.gdl] || [];
    dl.forEach(function(ev, index) {
      if (!ev.trTMchk) {
        ev.trTMdl = true;
        var evClone = JSON.parse(JSON.stringify(ev));
        if (typeof evClone['gtm.uniqueEventId']!='undefined') delete evClone['gtm.uniqueEventId'];
        trTM.d.f.push(evClone);
      }
    });
    // Initialize GTAG if enabled and consent given
    if (trTM.c.gtag && trTM.d.consent.gtagConsent) { trTM.d.initGTAG(); trTM.d.init = true; }
    // Initialize GTM if enabled and consent given
    if (trTM.c.gtm_use && trTM.d.consent.gtmConsent) { trTM.f.initGTM(); trTM.d.init = true; }
    // Check DOM ready state and call corresponding functions
    if (trTM.d.init) trTM.f.chkDPready();
  }
  // Call inject callback if defined and return
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
trTM.f.strclean = function (str) {
  return typeof str=='string' ? str.replace(/[^a-zäöüßA-ZÄÖÜ0-9_-]/g, '') : '';
};

/**
 * Function to check if a variable is an object and nut null
 * @property {function} trTM.f.vOb
 * @param {*} i - The input to be checked.
 * @returns {boolean} - Returns true if the input is an object and not null, false otherwise.
 * Usage: if (!trTM.f.vOb(null)) return;
 */
trTM.f.vOb = function (i) {
  return typeof i==='object' && i!==null;
};

/**
 * Checks if the input is a non-empty string or all elements in an array are non-empty strings.
 * @property {function} trTM.f.vSt
 * @param {string|Array} input - The input to be checked, which can be a string or an array of strings.
 * @returns {boolean} - Returns true if the input is a non-empty string or if all elements in an array are non-empty strings; returns false otherwise.
 * Usage: if (!trTM.f.vSt(['Mia',''])) return;
 */
trTM.f.vSt = function (input) {
  // Convert the input to an array if it's a string, or use an empty array if it's neither
  var inputArray = Array.isArray(input) ? input : typeof input=='string' ? [input] : [];
  // Check every element in the array to ensure it's a non-empty string
  return inputArray.every(function(element) {
    return typeof element=='string' && element!=='';
  });
};

/**
 * Retrieves the value of a cookie.
 * @property {function} trTM.f.gc
 * @param {string} cname - The name of the cookie.
 * @returns {string|null} - The value of the cookie or null if the cookie does not exist.
 * Usage: trTM.f.gc('consent');
 */
trTM.f.gc = function (cname) {
  var re = new RegExp(cname + "=([^;]+)");
  var value = null;
  try {
    var d = document;
    var c = 'co' + 'o' + 'kie';
    var match = re.exec(d[c]);
    if (match && match.length>1) value = decodeURIComponent(match[1]);
  } catch (e) {}
  return value;
};

/**
 * Adds an event listener to a specified DOM element.
 * @property {function} trTM.f.evLstn
 * @param {object|string} el - The DOM object to which you want to add the event listener, or a string 'window'/'document'.
 * @param {string} ev - The name of the event, e.g., 'mousedown'.
 * @param {function} fct - The function to execute when the event is triggered.
 * Usage: trTM.f.evLstn(document.querySelector('div.button'), 'mousedown', click_fct);
 */
trTM.f.evLstn = function(el, ev, fct) {
  // If 'el' is 'window' or 'document' string, convert it to the actual object
  if (el==='window') el = window;
  if (el==='document') el = document;
  // Validate input parameters
  if (typeof el!='object' || !el || typeof ev!='string' || typeof fct!='function') {
    trTM.f.log('e11', {el: el, ev: ev, fct: fct});
    return;
  }
  // Try to add the event listener
  try {
    el.addEventListener(ev, fct);
  } catch (e) {
    // Log if there is an error adding the event listener
    trTM.f.log('e12', {error: e, el: el, ev: ev, fct: fct});
  }
};

/**
 * Retrieves a specific attribute value from window, document, or body.
 * @property {function} trTM.f.getVal
 * @param {string} o - A single character representing the DOM object ('w' for window, 'd' for document, 'b' for body, 's' for scroll top).
 * @param {string} v - The name of the attribute to retrieve.
 * @returns {string|number|boolean|object|undefined} - The value of the requested attribute, or undefined if not found or invalid.
 * Usage: trTM.f.getVal('w', 'location');
 */
trTM.f.getVal = function (o, v) {
  if (!trTM.f.vSt([o,v]) || !v.match(/[a-z]+/i)) return undefined;
  switch (o) {
    case 'w': return window[v];
    case 'd': return document[v];
    case 'b': return document.body[v];
    case 's': return document.getElementsByTagName("html")[0].scrollTop || 0;
    default : return undefined;
  }
};

/**
 * Adds an event listener to a specified DOM element for capturing the copy event or any other specified event.
 * @property {function} trTM.f.cpLst
 * @param {object} o - The DOM element to which the event listener will be added.
 * @param {string} e - The name of the event to listen for, e.g., 'copy'.
 * @param {function} f - The callback function to execute when the event is triggered. It receives the selected text as a parameter.
 * Usage: trTM.f.cpLst(document.body, 'copy', myFunction);
 */
trTM.f.cpLst = function (o, e, f) {
  try {
    o.addEventListener(e, function(event) {
      var selectedText = '';
      if (!window.getSelection) return;
      selectedText = window.getSelection().toString();
      if (selectedText) f(selectedText);
    });
  } catch(error) { trTM.f.log('e12', {element: o, error: error}); }
};

/**
 * Adds an event listener to a specified DOM element and collects detailed information when the event is triggered.
 * @property {function} trTM.f.elLst
 * @param {object} el - The DOM element to which the event listener will be added.
 * @param {string} ev - The name of the event, e.g., 'mousedown'.
 * @param {function} cb - The callback function to execute when the event is triggered. It receives a detailed event object as a parameter.
 * Usage: trTM.f.elLst(document.querySelector('a'), 'mousedown', myFunction);
 */
trTM.f.elLst = function (el, ev, cb) {
  try {
    el.addEventListener(ev, function(event) {
      var tagName = this.tagName.toLowerCase();
      var parentId = '';
      var parentClass = '';
      var parentForm = null;
      var position = null;
      var elementCount = 0;
      var currentElement = this;
      // Collect parent ID and class
      while (currentElement && currentElement.parentElement) {
        currentElement = currentElement.parentElement;
        if (!parentId && currentElement.id) parentId = (typeof currentElement.nodeName === 'string' ? currentElement.nodeName.toLowerCase() + ':' : '') + currentElement.id;
        if (!parentClass && currentElement.getAttribute('class')) parentClass = (typeof currentElement.nodeName === 'string' ? currentElement.nodeName.toLowerCase() + ':' : '') + currentElement.getAttribute('class');
      }
      // Collect form-related information if the element is a form field
      if (tagName==='input' || tagName==='select' || tagName==='textarea') {
        currentElement = this;
        while (currentElement && currentElement.parentElement && currentElement.tagName.toLowerCase()!=='form') { currentElement = currentElement.parentElement; }
        if (currentElement.tagName.toLowerCase()==='form') {
          parentForm = {
            id: currentElement.id,
            class: currentElement.getAttribute('class'),
            name: currentElement.getAttribute('name'),
            action: currentElement.action,
            elements: currentElement.elements.length
          };
          position = Array.prototype.indexOf.call(currentElement.elements, this) + 1;
        }
      }
      // Count elements if applicable
      if (typeof this.elements=='object' && typeof this.elements.length=='number') elementCount = this.elements.length;
      // Construct the event object
      var eventObj = {
        tagName: tagName,
        target: this.target || '',
        parentID: parentId,
        parentClass: parentClass,
        id: this.id || '',
        name: this.getAttribute('name') || '',
        class: this.getAttribute('class') || '',
        href: this.href || '',
        src: this.src || '',
        action: this.action || '',
        type: this.type || '',
        elements: elementCount,
        position: position,
        form: parentForm,
        html: this.outerHTML ? this.outerHTML.toString() : '',
        text: this.outerText ? this.outerText.toString() : ''
      };
      if (eventObj.html.length>512) eventObj.html = eventObj.html.slice(0, 509) + '...';
      if (eventObj.text.length>512) eventObj.text = eventObj.text.slice(0, 509) + '...';
      // Trigger the callback function with the event object
      cb(eventObj);
    });
  } catch(e) { trTM.f.log('e12', {element: el, error: e}); }
};

/**
 * Adds an event listener to multiple DOM elements selected by a CSS selector.
 * @property {function} trTM.f.addElLst
 * @param {string} selector - CSS selector for the DOM elements, e.g., 'a.menu'.
 * @param {string} event - The name of the event to listen for, e.g., 'mousedown'.
 * @param {function} callback - The function to execute when the event is triggered.
 * Usage: trTM.f.addElLst('a', 'mousedown', myClickFunction);
 */
trTM.f.addElLst = function (selector, event, callback) {
  // Validate inputs
  if (!trTM.f.vSt([selector, event]) || typeof callback!='function') return;
  // Select nodes based on the provided selector
  var nodes = document.querySelectorAll(selector);
  // Validate the selected nodes
  if (!trTM.f.vOb(nodes) || nodes.length==0) return;
  // Iterate over each node and add the appropriate event listener
  nodes.forEach(function(node) {
    switch (event) {
      case 'copy': // Special case for 'copy' event
        trTM.f.cpLst(node, event, callback);
        break;
      default: // Default case for other events
        trTM.f.elLst(node, event, callback);
    }
  });
};

/**
 * Adds an event listener to elements dynamically added to the DOM that match a specified selector.
 * @property {function} trTM.f.observer
 * @param {string} selector - The selector for the DOM elements to watch, e.g., 'a'.
 * @param {string} event - The event to listen for, e.g., 'mousedown'.
 * @param {function} callback - The function to execute when the event is triggered.
 * Usage: trTM.f.observer('a', 'mousedown', myClickFunction);
 */
trTM.f.observer = function (selector, event, callback) {
    // Validate input parameters
    if (!trTM.f.vSt([selector,event]) || typeof callback!='function') return;
    // Create a new MutationObserver to watch for changes in the DOM
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Check if the mutation type is 'childList' and there are added nodes
        if (mutation.type==='childList' && mutation.addedNodes.length) {
          Array.prototype.forEach.call(mutation.addedNodes, function(node) {
            // If the node is an Element and matches the selector, add the event listener
            if (node.nodeType===1  && typeof node.tagName=='string' && node.tagName.toLowerCase()===selector.toLowerCase()) {
              trTM.f.elLst(node, event, callback);
            }
            // If the added node has children, check each child node
            if (node.nodeType===1 && node.querySelectorAll) {
              var matchingElements = node.querySelectorAll(selector.toLowerCase());
              Array.prototype.forEach.call(matchingElements, function(element) {
                trTM.f.elLst(element, event, callback);
              });
            }
          });
        }
      });
    });
    // Configure the observer to watch for added elements
    var config = { childList: true, subtree: true, attributes: false };
    // Start observing the document body
    observer.observe(document.body, config);
};

/**
 * Tests whether a string matches a given regular expression pattern.
 * @property {function} trTM.f.rTest
 * @param {string} s - The string to test.
 * @param {string} p - The regex pattern to test against the string.
 * @returns {boolean} - True if the pattern matches the string, false otherwise.
 * Usage: trTM.f.rTest('cmpUpdateEvent', 'cmp.*Event');
 */
trTM.f.rTest = function (s, p) {
  return trTM.f.vSt([s, p]) && new RegExp(p, 'i').test(s);
};

/**
 * Checks if the current web page is loaded inside an iframe.
 * @property {function} trTM.f.isIFrame
 * @returns {boolean} - True if the page is inside an iframe, false otherwise.
 */
trTM.f.isIFrame = function() {
  return window.self !== window.top;
};

/**
 * Matches a string against a regular expression pattern and returns the match results.
 * @property {function} trTM.f.rMatch
 * @param {string} s - The string to match.
 * @param {string} p - The regex pattern to match against the string.
 * @returns {Array|null} - The match results if successful, null otherwise.
 * Usage: trTM.f.rMatch('Hello World', 'World');
 */
trTM.f.rMatch = function (s, p) {
  return s.match(new RegExp(p));
};

/**
 * Replaces parts of a string that match a given pattern with a replacement string.
 * @property {function} trTM.f.rReplace
 * @param {string} t - The original text to be processed.
 * @param {string|RegExp} p - The pattern to search for, which can be a string or a RegExp.
 * @param {string} r - The replacement text.
 * @returns {string} - The text after replacements have been made.
 * Usage: trTM.f.rReplace('Hello World', 'World', 'Andi');
 */
trTM.f.rReplace = function (t, p, r) {
  return trTM.f.vSt([t, p, r]) ? t.replace(new RegExp(p, 'gi'), r) : t;
};

/**
 * Sets up an error listener to capture JavaScript errors and push them to the GTM dataLayer.
 * @property {function} trTM.f.jserrors
 * Usage: trTM.f.jserrors();
 */
trTM.f.jserrors = function () {
  // Listen for error events on the window object
  trTM.f.evLstn(window, 'error', function(ev) {
    // Ensure the event object is not null
    if (ev!==null) {
      // Construct the error message and the filename
      var msg = typeof ev.message=='string' ? ev.message : '';
      var filename = typeof ev.filename=='string' ? ev.filename : '';
      // Handle "Script error." for CORS issues
      if (msg.toLowerCase()=='script error.') {
        if (!filename) return;
        msg = msg.replace('.', ':') + ' error from other domain.';
      }
      // Append filename, line number, and column number to the message
      if (filename) msg += ' | file: ' + filename;
      var lineno = typeof ev.lineno!='string' ? ev.lineno.toString() : ev.lineno; if (lineno=='0') lineno = '';
      if (lineno) msg+= ' | line: ' + lineno;
      var colno = typeof ev.colno!='string' ? ev.colno.toString() : ev.colno; if (colno=='0') colno = '';
      if (colno) msg+= ' | col: ' + colno;
      // Push the error message to the internal error log
      trTM.d.errors.push(msg);
      // Collect browser information
      var browser = '';
      try { browser = navigator.appCodeName + ' | ' + navigator.appName + ' | ' + navigator.appVersion + ' | ' + navigator.platform; } catch (e) {}
      // Limit the number of errors sent to avoid overwhelming the dataLayer
      if (trTM.d.error_counter++ >= 100) return;
      if (trTM.d.error_counter <= 5) trTM.f.fire({ event: 'exception', errmsg: msg, browser: browser, timestamp: new Date().getTime(), errct: trTM.d.error_counter, gtag: false, eventModel: null }); // Push the error information to the GTM dataLayer
    }
    //return;
  });
};

/**
 * Triggers timed events based on the provided configuration object.
 * @property {function} trTM.f.timerfkt
 * @param {object} obj - Configuration object for the timed event.
 *   Expected object properties:
 *   - timer_ms: Interval in milliseconds for the timer.
 *   - timer_ct: The current count of the timer.
 *   - event: (optional) The name of the event to trigger. Can include '[s]' to be replaced by timer seconds.
 * Usage: trTM.f.timerfkt({ timer_ms: 1000, timer_ct: 1, event: 'timerEvent[s]' });
 */
trTM.f.timerfkt = function(obj) {
  var ev = JSON.parse(JSON.stringify(obj)); // Create a deep copy of the event object to prevent mutating the original object
  ev.timer_ms = ev.timer_ms * 1; // Ensure timer_ms is a number
  ev.timer_ct++; // Increment the timer count
  ev.timer_tm = ev.timer_ms * ev.timer_ct; // Calculate the total time in milliseconds
  ev.timer_sc = parseFloat((ev.timer_tm / 1000).toFixed(3)); // Convert total time to seconds, formatted to three decimal places
  ev.event = ev.event || 'timer'; // Set a default event name if not provided
  if (ev.event.indexOf('[s]') !== -1) ev.event = ev.event.replace('[s]', ev.timer_sc.toString()); // Replace '[s]' in the event name with the total seconds
  ev.eventModel = null; ev.gtag = false; // Initialize eventModel and gtag properties
  trTM.f.fire(ev); // Trigger the event with the updated properties
};

/**
 * Sets a timer to execute a function or trigger an event after a specified time interval.
 * @property {function} trTM.f.timer
 * @param {string} nm - The name of the timer for debugging purposes. If not provided, it will be auto-generated.
 * @param {function} ft - The function to execute when the timer expires. Defaults to trTM.f.timerfkt if not provided.
 * @param {object} ev - The event object to pass to the timer function. Can be omitted if not needed.
 * @param {number} ms - The time in milliseconds after which the function or event should be triggered.
 * @param {boolean} rp - How many times the timer should fire. Use 0 for unlimited repetitions.
 * Usage: trTM.f.timer('myTimer', myFunction, { event: 'myEvent' }, 15000, 3);
 */
trTM.f.timer = function (nm, ft, ev, ms, rp) {
  if (!nm && typeof ev=='object' && typeof ev.event=='string') nm = ev.event;
  nm = nm || 'timer';
  nm += '_' + new Date().getTime().toString() + '_' + Math.floor((Math.random() * 999999) + 1).toString();
  // Check if the timer already exists and stop/delete it if it does
  trTM.f.stoptimer(nm);
  // Initialize the timer object
  var obj = typeof ev=='object' ? JSON.parse(JSON.stringify(ev)) : {};
  obj.timer_nm = nm;
  obj.timer_ms = ms;
  obj.timer_rp = rp;
  obj.timer_ct = 0;
  // Set the timer
  obj.id = obj.timer_rp===1
    ? setTimeout(function() {
        if (ft) { ft(obj); } else { trTM.f.timerfkt(obj); }
      }, ms)
    : setInterval(function() {
        if (ft) { ft(obj); } else { trTM.f.timerfkt(obj); }
        obj.timer_ct++;
        if (obj.timer_rp>0 && obj.timer_ct>=obj.timer_rp) trTM.f.stoptimer(obj.timer_nm);
      }, ms);
  trTM.d.timer[nm] = obj;
};

/**
 * Stops and deletes a timer.
 * @property {function} trTM.f.stoptimer
 * @param {string} nm - The name of the timer to stop and delete.
 * Usage: trTM.f.stoptimer('myTimer');
 */
trTM.f.stoptimer = function (nm) {
  if (typeof trTM.d.timer!='object') trTM.d.timer = {};
  if (typeof trTM.d.timer[nm]=='object') {
    var t = trTM.d.timer[nm];
    if (t.timer_rp) { clearInterval(t.id); } else { clearTimeout(t.id); }
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
 * Pushes an event object to the GTM dataLayer with additional logic for consent and error checking.
 * @property {function} trTM.f.fire
 * @param {object} o - The event object to be pushed to the dataLayer.
 * Usage: trTM.f.fire({ event: 'pageview', pagetype: 'blogarticle' });
 */
trTM.f.fire = function (o) {
  // Ensure the event object is valid
  if (typeof o !== 'object') { trTM.f.log('e9', { o: typeof o }); return; }
  // Create a deep copy of the event object
  var obj = JSON.parse(JSON.stringify(o));
  if (typeof obj.trTMts=='number' || (typeof obj.eventModel=='object' && !obj.eventModel)) return;
  obj.trTMts = Date.now();
  obj.eventModel = null;
  // Check for consent update events
  if (trTM.c.consent.consent_events && typeof obj.event=='string' && trTM.c.consent.consent_events.indexOf(',' + obj.event + ',') >= 0) {
    if (typeof trTM.c.consent.consent_event_attr[obj.event]=='object') {
      for (var k in trTM.c.consent.consent_event_attr[obj.event]) {
        if (typeof obj[k]!='undefined') {
          if (!trTM.c.consent.consent_event_attr[obj.event][k] || obj[k] == trTM.c.consent.consent_event_attr[obj.event][k]) trTM.f.run_cc('update');
        }
      }
    } else { trTM.f.run_cc('update'); }
  }
  // Delay event if no consent is available
  if ((typeof trTM.d.consent!='object' || !trTM.d.consent.hasResponse) && (typeof obj.event!='string' || obj.event.indexOf('trTM')!==0)) {
    trTM.d.f.push(JSON.parse(JSON.stringify(o)));
    return;
  }
  // Push event to GTM if enabled and consented
  if (trTM.c.gtm_use && trTM.d.consent.gtmConsent && (typeof obj.gtm!='boolean' || obj.gtm)) {
    var gtmobj = JSON.parse(JSON.stringify(obj));
    if (typeof obj.event!='string' || obj.event.indexOf('trTM')!==0) {
      delete gtmobj['gtm.uniqueEventId'];
      delete gtmobj.gtm;
      delete gtmobj.gtag;
      delete gtmobj.trTMparams;
      gtmobj.trTMparams = JSON.parse(JSON.stringify(obj));
    }
    trTM.d.dl.push(gtmobj);
    window[trTM.c.gdl].push(gtmobj);
  }
  // Push event to GTAG if enabled and consented
  if (trTM.c.gtag && trTM.d.consent.gtagConsent && trTM.f.vSt(obj.event) && (typeof obj.gtag!='boolean' || obj.gtag)) {
    var gtagobj = JSON.parse(JSON.stringify(obj));
    delete gtagobj['gtm.uniqueEventId'];
    delete gtagobj.eventModel;
    delete gtagobj.trTMparams;
    delete gtagobj.gtm;
    delete gtagobj.gtag;
    delete gtagobj.trTMfired;
    delete gtagobj.trTMts;
    if (trTM.f.vSt(obj.gtagID)) {
      gtagobj.send_to = obj.gtagID;
      gtag('event', obj.event, gtagobj);
    } else { 
      for (var gtagID in trTM.c.gtag) {
        gtagobj.send_to = gtagID;
        gtag('event', obj.event, gtagobj);
      }
    }
  }
  // Execute the callback function if defined and initialized
  if (typeof trTM.f.fire_callback=='function' && trTM.d.init) trTM.f.fire_callback(obj);
  trTM.f.log('m7', obj);
};


// Initialization
trTM.f.init();


//[trTM.js]EOF