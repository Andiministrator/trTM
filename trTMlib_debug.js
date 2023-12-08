//[trTMlib_debug.js]BOF

/**
 * Debug Functionallity for trTMlib - this is a part of trTMlib and cannot be used standalone
 * @version 1.0
 * @lastupdate 28.11.2023 by Andi Petzoldt <andi@petzoldt.net>
 * @author Andi Petzoldt <andi@petzoldt.net>
 * @usage use it together with trTMlib and see the documentation there
 */

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

// Debug message map
trTM.d.logmap = trTM.d.logmap || {
   e1:  { type:'err', msg:'call of function trTM.f.config, but config was already set' }
  ,e2:  { type:'err', msg:'call of function trTM.f.consent_check, but you need to run the config before' }
  ,e3:  { type:'err', msg:'trTM.f.consent_check called, but action argument (a) is not valid' }
  ,e4:  { type:'err', msg:'call of function trTM.f.consent, but you need to run the config before' }
  ,e5:  { type:'err', msg:'trTM.f.consent called, but action argument (a) is not valid' }
  ,e6:  { type:'err', msg:'' }
  ,e7:  { type:'err', msg:'call of function trTM.f.tm_init, but you need to run the config before' }
  ,e8:  { type:'err', msg:'call of function trTM.f.tm_inject, but you need to run the config before' }
  ,e9:  { type:'err', msg:'trTM.f.fire called, but argument is not an object' }
  ,e10: { type:'err', msg:'trTM.f.consent_check called, but action argument (a) is not valid}' }
  ,m1:  { type:'msg', msg:'trTM.f.config was successful set' }
  ,m2:  { type:'msg', msg:'trTM.f.consent_check has checked the consent and consent is available now' }
  ,m3:  { type:'msg', msg:'Consent Setup complete' }
  ,m4:  { type:'msg', msg:'call of function trTM.f.tm_inject, but consent not (yet) available' }
  ,m5:  { type:'msg', msg:'GTAG initial call injected' }
  ,m6:  { type:'msg', msg:'GTM initial call injected' }
  ,m7:  { type:'msg', msg:'Event fired' }
  ,m8:  { type:'msg', msg:'Consent Setup called, but consent not (yet) available' }
};

/**
 * Function to get the error and log messages to the browser console
 * It also returns an object with the messages
 * @property {function} trTM.f.view_log
 * @returns {object} - object with error and log messages
 * Usage: trTM.f.view_log();
 */
trTM.f.view_log = function () {
  if (!trTM.l) { console.log('no log messages available'); return {}; }
  for (var i=0; i<trTM.l.length; i++) {
    var id = trTM.l[i].id;
    if (typeof id!='string') continue;
    var timestamp = trTM.l[i].timestamp;
    var time = new Date(trTM.l[i].timestamp);
    var timestring = time.getFullYear() + '-' + time.getMonth() + '-' +time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ':' + time.getMilliseconds();
    var obj = trTM.l[i].obj;
    if (typeof trTM.d.logmap[id]!='object') continue;
    var type = trTM.d.logmap[id].type;
    var msg = trTM.d.logmap[id].msg;
    trTM.l[i].type = type;
    trTM.l[i].msg = msg;
    trTM.l[i].timestring = timestring;
    var t = type=='err' ? 'Error' : 'Message';
    console.log('trTMlib '+t+': '+msg+' ['+timestring+']',obj);
  }
  return trTM.l;
};

//[trTMlib_debug.js]EOF