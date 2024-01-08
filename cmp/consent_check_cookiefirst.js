//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Cookie First
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
  // Sort Purpose Array and stringify it
  if (purposes.length>0) {
    purposes.sort();
    trTM.d.consent.purposes = ',' + purposes.join(',') + ',';
  }
  // Sort Service Array and stringify it
  if (services.length>0) {
    services.sort();
    trTM.d.consent.services = ',' + services.join(',') + ',';
  }
  // Build feedback
  var feedback = 'Consent available';
  if (serviceAllCtr>=serviceCtr) { feedback = 'Consent (partially or full) declined'; }
  else if (serviceAllCtr==serviceCtr) { feedback = 'Consent full accepted'; }
  trTM.d.consent.feedback = feedback;
  // Get Consent ID
  if (typeof cf.visitorId=='string') trTM.d.consent.consent_id = cf.visitorId;
  // Set Response, run Callback and Return
  trTM.d.consent.hasResponse = true;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', JSON.parse(JSON.stringify(trTM.d.consent)));
  return true;
};

//[trTMlib.js Consentcheck]EOF