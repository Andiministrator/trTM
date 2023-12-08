//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Klaro
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
  // Check and get Klaro object
  if (typeof klaro!='object' || typeof klaro.getManager!='function') return false;
  var kl = klaro.getManager();
  // Check, whether consent info is available
  if (typeof kl.confirmed!='boolean' || !kl.confirmed) return false;
  // Check and get purpose and service names and dependencies
  if (typeof kl.config!='object' || typeof kl.config.services!='object') return false;
  var s_p = {};
  var tmp = kl.config.services;
  for (var i=0; i<tmp.length; i++) {
    if (typeof tmp[i].name!='string') continue;
    var p_tmp = [];
    var serv = tmp[i].name;
    if (typeof tmp[i].purposes=='object' && typeof tmp[i].purposes.length=='number' && tmp[i].purposes.length>0) {
      p_tmp = tmp[i].purposes;
      for (var j=0;j<p_tmp.length;j++) {
        var purp = p_tmp[j];
        //console.log('Service '+serv+' | Purpose '+purp, tmp[i].purposes);
        if (typeof s_p[purp]=='object') { s_p[purp].push(serv); } else { s_p[purp] = [serv]; }
      }
    }
  }
  // Check consents object
  if (typeof kl.consents!='object' || !kl.consents) return false;
  // Check purposes consent
  var purposes = trTM.c.purposes ? trTM.c.purposes.split(',') : [];
  var purposeCtr = 0;
  for (var p in s_p) {
    purposeCtr++;
    var cons = true;
    for (var i=0; i<s_p[p].length; i++) {
      var s = s_p[p];
      if (typeof kl.consents[s]=='boolean' && !kl.consents[s]) cons = false;
    }
    if (cons) purposes.push(p);
  }
  // Check services consent
  var services = trTM.c.services ? trTM.c.services.split(',') : [];
  var serviceCtr = 0;
  for (var s in kl.consents) {
    serviceCtr++;
    if (typeof kl.consents[s]=='boolean' && kl.consents[s]) services.push(s);
  }


  // Add purposes to object
  o.purposes = purposes.length>0 ? ','+purposes.join(',')+',' : '';
  // Add purposes to object
  o.services = services.length>0 ? ','+services.join(',')+',' : '';
  // Build Feedback
  o.feedback = 'Consent available';
  if (serviceCtr==0) { o.feedback = 'No services available'; }
  else if (services.length==0 && serviceCtr>0) { o.feedback = 'Consent declined'; }
  else if (services.length==serviceCtr) { o.feedback = 'Consent full accepted'; }
  else if (services.length>0 && services.length<serviceCtr) { o.feedback = 'Consent partially accepted'; }
  // Get Consent ID
  //if (typeof kl.consentID=='string') o.consent_id = cb.consentID;
  // Set Response
  o.hasResponse = true;
  // Callback and Return
  trTM.d.consent = o;
  if (typeof trTM.f.log=='function') trTM.f.log('m2', o);
  return true;
};

//[trTMlib.js Consentcheck]EOF