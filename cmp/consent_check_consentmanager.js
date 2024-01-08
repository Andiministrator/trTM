//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Consentmanager
 * @version 1.0
 * @lastupdate 25.11.2023 by Andi Petzoldt <andi@petzoldt.net>
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
  // Check ConsentManager object and status and get Vendor (Service) Infos
  if (typeof __cmp != 'function') return false;
  var c = __cmp('getCMPData'); if (typeof c!='object') return false;
  if (typeof c.consentExists!='boolean' || !c.consentExists) return false;
  if (typeof c.userChoiceExists!='boolean' || !c.userChoiceExists) return false;
  if (typeof c.purposeConsents!='object' || typeof c.purposesList!='object' || typeof c.purposeLI!='object') return false;
  if (typeof c.vendorConsents!='object' || typeof c.vendorsList!='object' || typeof c.vendorLI!='object') return false;
  // Get Consent Info from CM internal object
  //if (typeof cmpmngr == 'object' && typeof cmpmngr.vendors == 'object') { var cmObjVendors = cmpmngr.vendors; } else { var cmObjVendors = []; }
  // Get Purposes
  var purposes = trTM.c.purposes ? trTM.c.purposes.split(',') : [];
  var purposeIDs = [];
  var purposeCtr = 0;
  var purposeLIctr = 0;
  for (k in c.purposeLI) { if (c.purposeLI[k]) purposeLIctr++; }
  for (var i=0; i<c.purposesList.length; i++) {
    purposeCtr++;
    if (c.purposeConsents[c.purposesList[i].id]) {
      purposeIDs.push(c.purposesList[i].id);
      purposes.push(c.purposesList[i].name);
    }
  }
  o.purposes = ',' + purposes.join(',') + ',';
  o.purposeIDs = ',' + purposeIDs.join(',') + ',';
  // Get Vendors
  var vendors = trTM.c.vendors ? trTM.c.vendors.split(',') : [];
  var vendorIDs = [];
  var vendorCtr = 0;
  var vendorLIctr = 0;
  for (k in c.vendorLI) { if (c.vendorLI[k]) vendorLIctr++; }
  for (var i=0; i<c.vendorsList.length; i++) {
    vendorCtr++;
    if (c.vendorConsents[c.vendorsList[i].id]) {
      vendorIDs.push(c.vendorsList[i].id);
      vendors.push(c.vendorsList[i].name);
    }
  }
  o.vendors = ',' + vendors.join(',') + ',';
  o.vendorIDs = ',' + vendorIDs.join(',') + ',';
  // Build feedback
  o.feedback = 'Consent available';
  if (vendorCtr==vendorLIctr && purposeCtr==purposeLIctr) { o.feedback = 'All consent is essential - no user choice'; }
  else if (vendors.length<=vendorLIctr && purposes.length<=purposeLIctr) { o.feedback = 'Consent declined'; }
  else if (vendors.length==vendorCtr && purposes.length==purposeCtr) { o.feedback = 'Consent full accepted'; }
  else if (vendors.length>vendorLIctr || purposes.length>purposeLIctr) { o.feedback = 'Consent partially accepted'; }
  // Get Consent ID
  if (typeof c.consentstring=='string') o.consent_id = c.consentstring;
  // Set Response
  o.hasResponse = true;
  // Callback and Return
  trTM.d.consent = o;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', o);
  return true;
};

/**
 * Function to set an Event Listener for consent check
 * @property {function} trTM.f.consent_event_listener
 * Usage: trTM.f.consent_event_listener();
 */
//if (typeof trTM.f.consent_event_listener!='function') trTM.f.consent_event_listener = function () {
//  var consent = trTM.f.consent_fct();
//}

//[trTMlib.js Consentcheck]EOF