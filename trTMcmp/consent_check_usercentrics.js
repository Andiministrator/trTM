//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Usercentrics
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
  // Check Usercentrics object and status and get Vendor (Service) Infos
  if (typeof UC_UI != 'object' || typeof UC_UI.getServicesBaseInfo != 'function') return false;
  var ci = UC_UI.getServicesBaseInfo(); if (typeof ci != 'object') return false;
  if (ci.length == 0) { /* o.feedback = 'No Services configured in Usercentrics'; o.hasResponse = true; */ return false; }
  // Get Purposes and Services
  var purposes = typeof trTM.c.purposes=='string' ? trTM.c.purposes : '';
  //purposeIDs = [];
  var purposeCtr = 0;
  var services = trTM.c.services ? trTM.c.services.split(',') : [];
  var serviceIDs = [];
  var serviceCtr = 0;
  var serviceEssCtr = 0;
  for (var i=0; i<ci.length; i++) {
    if (typeof ci[i].consent!='object') return false;
    if (typeof ci[i].id!='string') continue;
    var sc = ci[i].consent;
    if (typeof sc.history!='object') return false;
    if (typeof sc.status!='boolean' || sc.history.length==0) return false;
    if (sc.history.length==1 && typeof sc.history[0].action=='string' && sc.history[0].action=='onInitialPageLoad' && !sc.status) return false;
    var nonEU = false;
    if (sc.history.length>0) {
      for (var h=0; h<sc.history.length; h++) {
        if (typeof sc.history[h].action=='string' && typeof sc.history[h].status=='boolean' && sc.history[h].action=='onNonEURegion' && sc.history[h].status) nonEU = true;
      }
    }
    serviceCtr++;
    if (nonEU || (typeof ci[i].isEssential=='boolean' && ci[i].isEssential)) serviceEssCtr++;
    if (sc.status) {
      services.push( typeof ci[i].name=='string' ? ci[i].name.replace(',', '') : ci[i].id );
      serviceIDs.push( ci[i].id );
      var p = typeof ci[i].categorySlug=='string' ? ci[i].categorySlug.replace(',', '') : 'Unknown Purpose '+(purposeCtr+1).toString();
      if (purposes.indexOf(','+p+',')<0) {
        purposeCtr++;
        if (!purposes) purposes=',';
        purposes = purposes + p + ',';
      }
    }
  }
  // Add data to object
  o.purposes = purposes;
  if (services.length>0) o.services = ',' + services.join(',') + ',';
  if (serviceIDs.length>0) o.serviceIDs = ',' + serviceIDs.join(',') + ',';
  // Build feedback
  o.feedback = 'Consent available';
  if (services.length<=serviceEssCtr) { o.feedback = 'Consent declined'; }
  else if (services.length==serviceCtr) { o.feedback = 'Consent full accepted'; }
  else if (serviceCtr>services.length) { o.feedback = 'Consent partially accepted'; }
  // Get Consent ID
  if (typeof UC_UI.getControllerId=='function') o.consent_id = UC_UI.getControllerId();
  // Set Response
  o.hasResponse = true;
  // Callback and Return
  trTM.d.consent = o;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', o);
  return true;
};

//[trTMlib.js Consentcheck]EOF