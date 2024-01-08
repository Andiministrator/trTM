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
 * @lastupdate 05.12.2023 by Hartmut Clas <hartmut@tracking-garden.com>
 * @author Hartmut Clas <hartmut@tracking-garden.com>
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
  // Check CCM19 instance
  if (typeof CCM!='object' || typeof CCM.consent!='boolean') return false;
  var ccm19 = CCM;
  if (typeof ccm19.acceptedEmbeddings !='object') return false;
  // Check whether user consent is available
  if (!ccm19.consent && ccm19.consentRequired) return false;

  // Get Services Consent data
  var services = [];
  var ccm19Services = ccm19 != null && typeof ccm19.acceptedEmbeddings == 'object' && ccm19.acceptedEmbeddings != null ? ccm19.acceptedEmbeddings : {};
  for(var k = 0; k < ccm19Services.length; k++){
    if (typeof ccm19Services[k].name != 'string' && ccm19Services[k].name != '') continue;
    services.push(ccm19Services[k].name.replace(',',''));
  }
  // Sort Service Array and stringify it
  if (services.length>0) {
    services.sort();
    o.services = ',' + services.join(',') + ',';
  }
  // Build feedback
  o.feedback = 'Consent available';
  // Get some more info about how consent was given, if available
  if (typeof ccm19.fullConsentGiven == boolean && ccm19.fullConsentGiven===true) { o.feedback = 'Consent full accepted'; }
  else { o.feedback = 'Consent (partially or full) declined'; }
  // Get Consent ID
  if (typeof ccm19.ucid=='string') o.consent_id = ccm19.ucid;
  // Set Response
  o.hasResponse = true;
  // Callback and Return
  trTM.d.consent = o;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', o);
  return true;
};

//[trTMlib.js Consentcheck]EOF