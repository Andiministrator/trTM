//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Borlabs Cookie
 * @version 1.1
 * @lastupdate 07.01.2024 by Andi Petzoldt <andi@petzoldt.net>
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @property {function} trTM.f.consent_check
 * @param {string} action - the action, what the function should do. can be "init" (for the first consent check) or "update" (for updating existing consent info)
 * @returns {boolean} - true, if consent is available, false if not
 * Usage: trTM.f.consent_check('init');
 */
trTM.f.consent_check = function (action) {
  if (typeof action!='string' || (action!='init'&&action!='update')) { if (typeof trTM.f.log=='function') trTM.f.log('e10', {action:action}); return false; }
  // Check whether response was already given
  trTM.d.consent = trTM.d.consent || {};
  if (action=='init' && trTM.d.consent.hasResponse) return true;
  // Check Borlabs instances
  if (typeof borlabsCookieConfig!='object' || typeof borlabsCookieConfig.cookies!='object') return false;
  var consent_configured = borlabsCookieConfig.cookies;
  if (typeof BorlabsCookie!='object' || typeof BorlabsCookie.getCookie!='function') return false;
  var tmp = BorlabsCookie.getCookie();
  if (typeof tmp!='object' || typeof tmp.consents!='object') return false;
  var consent_user = tmp.consents;
  // Get Consent ID
  if (typeof tmp.uid=='string') trTM.d.consent.consent_id = tmp.uid;
  // Set vars
  var purposes = [];
  var purposes_cfg = [];
  var purposes_ess = 0;
  var services = [];
  var services_cfg = [];
  var services_ess = 0;
  // Get configured Purposes and Services
  for (var c in consent_configured) {
    if (typeof c!='string') continue;
    purposes_cfg.push(c);
    for (var i=0; i<c.length; i++) {
      if (typeof c[i]=='string' && c[i]) services_cfg.push(c[i]);
    }
  }
  // Get user-consented Purposes and Services
  for (var c in consent_user) {
    if (typeof c!='string') continue;
    purposes.push(c);
    if (c=='essential') purposes_ess++;
    var a = consent_user[c];
    for (var i=0; i<a.length; i++) {
      if (typeof a[i]=='string' && a[i]) services.push(a[i]);
      if (c=='essential') services_ess++;
    }
  }
  // Add purposes and services to object
  if (purposes.length>0) trTM.d.consent.purposes = ',' + purposes.join(',') + ',';
  //if (purposes_cfg.length>0) trTM.d.consent.purposes_cfg = ',' + purposes_cfg.join(',') + ',';
  if (services.length>0) trTM.d.consent.services = ',' + services.join(',') + ',';
  //if (services_cfg.length>0) trTM.d.consent.services_cfg = ',' + services_cfg.join(',') + ',';
  // Set Response
  var feedback = 'No Services';
  if (services.length>0 && services.length==services_cfg.length) { feedback = 'Consent full accepted'; }
  else if (services.length>0 && services.length==services_ess) { feedback = 'Consent declined'; }
  else if (services.length>0 && services.length<services_cfg.length) { feedback = 'Consent partially accepted'; }
  else if (services.length>0) { feedback = 'Consent given by user'; }
  trTM.d.consent.feedback = feedback;
  // Set response, run callback and return
  trTM.d.consent.hasResponse = true;
  // Callback and Return
  if (typeof trTM.f.log=='function') trTM.f.log('m2', JSON.parse(JSON.stringify(trTM.d.consent)));
  return true;
};

//[trTMlib.js Consentcheck]EOF