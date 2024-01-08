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
  // Check Cookiebot instance
  if (typeof Cookiebot!='object') return false;
  var cb = Cookiebot;
  if (typeof cb.hasResponse!='boolean' || typeof cb.consent!='object') return false;
  if (!cb.hasResponse) return false;
  // Get Purposes and Services
  var purposes = trTM.c.purposes ? trTM.c.purposes.split(',') : [];
  var purposeCtr = 0;
  var purposeEssCtr = 0;
  // Check consent purposes
  for(k in cb.consent){
    if (k=='stamp' || k=='method' || typeof cb.consent[k]!='boolean') continue;
    purposeEssCtr++;
    if (cb.consent[k]) {
      purposeCtr++;
      purposes.push(k);
    }
  }
  // Add purposes to object
  trTM.d.consent.purposes = purposes.length>0 ? ','+purposes.join(',')+',' : '';
  // Build Feedback
  var feedback = 'Consent available';
  if (purposeEssCtr==0) { feedback = 'No purposes available'; }
  else if (purposeCtr<=purposeEssCtr) { feedback = 'Consent (partially or full) declined'; }
  else if (purposeCtr>purposeEssCtr) { feedback = 'Consent accepted'; }
  trTM.d.consent.feedback = feedback;
  // Get Consent ID
  if (typeof cb.consentID=='string') trTM.d.consent.consent_id = cb.consentID;
  // Set Response, run Callback and Return
  trTM.d.consent.hasResponse = true;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', JSON.parse(JSON.stringify(trTM.d.consent)));
  return true;
};

//[trTMlib.js Consentcheck]EOF