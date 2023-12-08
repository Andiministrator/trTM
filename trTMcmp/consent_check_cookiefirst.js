//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: CookieBot
 * @version 1.0
 * @lastupdate 02.12.2023 by Andi Petzoldt <andi@petzoldt.net>
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @property {function} trTM.f.consent_check
 * @param {string} action - the action, what the function should do. can be "init" (for the first consent check) or "update" (for updating existing consent info)
 * @returns {boolean} - true, if consent is available, false if not
 * Usage: trTM.f.consent_check('init');
 */
trTM.f.consent_check = function (action) {
  if (typeof action!='string' || (action!='init'&&action!='update')) { if (typeof trTM.f.log=='function') trTM.f.log('e10', {action:action}); return false; }
  var o = { hasResponse:false, feedback:'' };
  // Check whether response was already given
  if (action=='init' && o.hasResponse) return true;
  // Check CookieFirst instance
  if (typeof CookieFirst!='object' || typeof CookieFirst.hasConsented!='boolean') return false;
  var cf = CookieFirst;
  if (typeof cf.consent!='object' || typeof cf.acceptedServices!='object') return false;
  // Check whether user consent is available
  if (!cf.hasConsented) return false;
  // Get Purposes Consent data
  var purposes = [];
  var cfPurposes = cf.consent ? cf.consent : {};
  var purposesCtr = 0;
  for(k in cfPurposes){
    if (typeof k!='string' || typeof cfPurposes[k]!='boolean') continue;
    if (cfPurposes[k]) {
      purposesCtr++;
      purposes.push(k.replace(',',''));
    }
  }
  // Sort Purpose Array and stringify it
  if (purposes.length>0) {
    purposes.sort();
    o.purposes = ',' + purposes.join(',') + ',';
  }
  // Get Services Consent data
  var services = [];
  var cfServices = cf.acceptedServices ? cf.acceptedServices : {};
  var serviceCtr = 0;
  var serviceAllCtr = 0;
  for(k in cfServices){
    if (typeof k!='string' || typeof cfServices[k]!='boolean') continue;
    serviceAllCtr++;
    if (cfServices[k]) {
      serviceCtr++;
      services.push(k.replace(',',''));
    }
  }
  // Sort Service Array and stringify it
  if (services.length>0) {
    services.sort();
    o.services = ',' + services.join(',') + ',';
  }
  // Build feedback
  o.feedback = 'Consent available';
  // Get some more info about how consent was given, if available
  if (serviceAllCtr>=serviceCtr) { o.feedback = 'Consent (partially or full) declined'; }
  else if (serviceAllCtr==serviceCtr) { o.feedback = 'Consent full accepted'; }
  // Get Consent ID
  if (typeof cf.visitorId=='string') o.consent_id = cf.visitorId;
  // Set Response
  o.hasResponse = true;
  // Callback and Return
  trTM.d.consent = o;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', o);
  return true;
};

//[trTMlib.js Consentcheck]EOF