//[trTMlib.js Consentcheck]BOF

// Initialitialize the objects
window.trTM = window.trTM || {};
trTM.d = trTM.d || { config: false, init: false, fired: false };
trTM.f = trTM.f || {};
trTM.l = trTM.l || [];

/**
 * Function to check, whether the user consent info/choice exists and for what purposes and vendors
 * @usage use it together with trTMlib and see the documentation there
 * @type: Sourcepoint
 * @version 1.1
 * @lastupdate 03.12.2023 by Andi Petzoldt <andi@petzoldt.net>
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
  // get TCF API object
  if (typeof __tcfapi!='function') return false;
  var success=false;
  var data=null;
  var tmp = __tcfapi('getCustomVendorConsents',2,function(d,s){success=s;data=d;});
  //var tmp = __tcfapi('getTCData',2,function(d,s){success=s;data=d;});
  if (typeof success!='boolean' || !success) return false;
  if (typeof data!='object' || !data) return false;
  if (typeof data.newUser!='boolean' || data.newUser) return false;
  if (typeof data.grants!='object' || !data.grants) return false;
  // Set vars
  var purposes = trTM.c.purposes ? trTM.c.purposes.split(',') : [];
  var purposeIDs = [];
  var purposeCtr = 0;
  var purposeMap = {
     '64480473796ea90689e58702':'Store and/or access information on a device'
    ,'64480473796ea90689e58722':'Use limited data to select advertising'
    ,'64480473796ea90689e58740':'Create profiles for personalised advertising'
    ,'64480473796ea90689e5875e':'Use profiles to select personalised advertising'
    ,'64480473796ea90689e5877c':'Create profiles to personalise content'
    ,'64480473796ea90689e58782':'Use profiles to select personalised content'
    ,'64480473796ea90689e58788':'Measure advertising performance'
    ,'64480473796ea90689e587a7':'Measure content performance'
    ,'64480473796ea90689e587ac':'Understand audiences through statistics or combinations of data from different sources'
    ,'64480473796ea90689e587ca':'Develop and improve services'
    ,'654b93ba18140306b70499b7':'Use limited data to select content'
    ,'64ff0f9f653e3805a8662e8c':'Functional'
    ,'64ff0f9f653e3805a8662e95':'Data Share'
    ,'64ff0f9f653e3805a8662e9b':'Social Media'
    ,'654b9434a5bdb40569d39098':'Data use for Identification'
    ,'64480473796ea90689e58722':'Use limited data to select advertising'
    ,'64480473796ea90689e58788':'Measure advertising performance'
    ,'64480473796ea90689e587a7':'Measure content performance'
    ,'64480473796ea90689e587ac':'Understand audiences through statistics or combinations of data from different sources'
    ,'64480473796ea90689e587ca':'Develop and improve services'
  }
  var vendors = trTM.c.vendors ? trTM.c.vendors.split(',') : [];
  var vendorIDs = [];
  var vendorCtr = 0;
  var vendorMap = {
     '60643c6c091a5047885cf964':'BurdaForward GmbH'
    //,'642f11f03f7e721c8e25f21d':'agof studies'
    ,'61df3f46ba5f030771b3e117':'BCN Brand Community Network GmbH'
    ,'5e7e1298b8e05c4854221be9':'Google Inc.'
    ,'5ee7add94c24944fdb5c5ac6':'Hotjar'
    ,'5e717c8e69966540e4554f05':'Instagram'
    //,'61a4af5736795907ea195cfd':'Julep Media GmbH'
    ,'5e839a38b8e05c4e491e738e':'Pinterest Inc.'
    ,'64ad94508c172204ffdb22a4':'plista GmbH'
    //,'5e7ad2ef1affb21bd098ccef':'Spotify AB'
    //,'654265478883ba0667e0989d':'SpotX Inc'
    ,'5e7ac3fae30e7d1bc1ebf5e8':'YouTube'
    ,'5e542b3a4cd8884eb41b5a72':'Google Analytics'
    ,'63657be8bcb5be04a169758e':'Google Maps'
    ,'5f0f1187b8e05c109c2b8464':'JW Player'
    ,'5e952f6107d9d20c88e7c975':'Google Tag Manager'
    ,'64d5f75047b35d06e67ba9f0':'IhreApotheken GmbH & Co. KGaA'
    //,'5eec8924b8e05c69980ea9d3':'1plusX AG'
    //,'5eb559d0b8e05c111d01b4e6':'Active Agent (Virtual Minds GmbH)'
    //,'5ef5c3a4b8e05c699567f425':'AcuityAds Inc.'
    //,'5e98e7f1b8e05c48537f6114':'AdDefend GmbH'
    //,'5e7ced57b8e05c485246ccea':'Adex (Virtual Minds GmbH)'
    ,'5e7ced57b8e05c5a7d171cda':'Adform A/S'
    //,'5eb559cfb8e05c2bbe33f3f4':'ADITION (Virtual Minds GmbH)'
    //,'5f6dbc28a22863aa44428837':'Adnuntius AS'
    //,'5ee34ea5b8e05c164f6f8ffe':'Adobe Audience Manager + Adobe Experience Platform'
    //,'5e37fc3e56a5e60dff4e1987':'AdSpirit GmbH'
    //,'5ebee9f5b8e05c53915bbb9c':'advanced store GmbH'
    //,'5f2d22a5b8e05c028e5c2e97':'ADYOULIKE SA'
    //,'5e37fc3e56a5e66147767237':'Amazon Ad Server'
    //,'5f369a02b8e05c308701f829':'Amazon Advertising'
    //,'5e37fc3e56a5e60dff4e1986':'Amobee Inc.'
    //,'5e7ced57b8e05c4854221bb8':'AudienceProject Aps'
    //,'5ed6aeb2b8e05c4a1160fe92':'Axel Springer Teaser Ad GmbH'
    //,'5e37fc3e56a5e66147767221':'BeeswaxIO Corporation'
    //,'5e37fc3e56a5e60dff4e198c':'BIDSWITCH GmbH'
    //,'5e7ced57b8e05c4854221bbc':'Blis Global Limited'
    ,'62d1372b293cdf1ca87a36f0':'CleverPush GmbH'
    //,'5e37fc3e56a5e6614776722c':'Cloud Technologies S.A.'
    //,'5e7ced57b8e05c4854221bb4':'ConnectAd Demand GmbH'
    ,'5e98e7f1b8e05c111d01b462':'Criteo SA'
    //,'601d13afa2286369d64270da':'dataXtrade GmbH'
    //,'5e37fc3e56a5e6615502f9cc':'DEFINE MEDIA GMBH'
    //,'5ef5c3a4b8e05c69980eaa58':'Delta Projects AB'
    //,'5f0838a5b8e05c109c2b8404':'Dynata LLC'
    ,'5ed6aeb2b8e05c2bbe33f4fa':'EASYmedia GmbH'
    //,'5e37fc3e56a5e66147767229':'Emerse Sverige AB'
    //,'5e7ced57b8e05c4854221bb6':'emetriq GmbH'
    //,'5ebee9f5b8e05c43d547d7d1':'Exactag GmbH'
    //,'5f23e826b8e05c0c0d4fdb8d':'Factor Eleven GmbH'
    //,'5e7ced57b8e05c485246cce2':'Flashtalking'
    //,'5eab3d5bb8e05c2bbe33f39c':'GfK SE'
    //,'604b382da2286319d61aa96e':'glomex GmbH'
    ,'5f1aada6b8e05c306c0597d7':'Google Advertising Products'
    //,'5e37fc3e56a5e66147767231':'GroupM UK Limited'
    //,'5e37fc3e56a5e66147767223':'GumGum Inc.'
    //,'5f369a02b8e05c0ee351e351':'Hearts and Science München GmbH'
    //,'5ee15bc7b8e05c16366599cb':'ID5 Technology Ltd'
    //,'5e7ced57b8e05c4854221bd6':'Impactify SARL'
    //,'5e865b37b8e05c6f984a37ea':'Improve Digital'
    //,'5e7ced57b8e05c485246ccd8':'Index Exchange Inc. '
    //,'5efefe25b8e05c065164a2e2':'INFOnline GmbH'
    //,'5ed6aeb2b8e05c241a63c720':'Inskin Media LTD'
    //,'5e7ced57b8e05c4854221bc4':'INVIBES GROUP'
    //,'5e37fc3e56a5e66147767233':'IPONWEB GmbH'
    //,'5e98e7f1b8e05c48537f6113':'Jaduda GmbH'
    //,'5eb559d0b8e05c48537f6208':'Justpremium BV'
    ,'5f48d229b8e05c60a307ad97':'Kameleoon SAS'
    //,'5f1aada5b8e05c306c0597d6':'LiquidM Technology GmbH'
    //,'5eb559cfb8e05c2bbe33f3f3':'LiveRamp'
    //,'5f0838a5b8e05c06542b2b37':'Lucid Holdings LLC'
    //,'5f369a02b8e05c0f7904cb76':'Magnite CTV Inc.'
    //,'5e7ced57b8e05c485246cce5':'Magnite Inc. '
    //,'6287632b293cdf1da351a1b5':'Media-Micro-Census GmbH'
    //,'5e98e7f1b8e05c48537f6115':'MediaMath Inc.'
    //,'5e37fc3e56a5e6615502f9d5':'MindTake Research GmbH'
    //,'5ed6aeb2b8e05c4a06748dc9':'MiQ Digital Ltd'
    //,'5f9be0a9a228636148510755':'Nielsen International SA'
    //,'5ef5c3a5b8e05c69980eaa5b':'Nielsen Media Research Ltd.'
    //,'5e98e7f1b8e05c241a63c552':'Ogury Ltd'
    //,'5f369a02b8e05c0fc521e7b8':'One Tech Group GmbH'
    //,'5e7ced57b8e05c4854221bc2':'Online Solution'
    //,'5e865b36b8e05c6f984a37e6':'OpenX'
    //,'5ebee9f5b8e05c43d547d7d2':'Oracle Advertising'
    //,'5e7ced57b8e05c47e418b742':'Otto (GmbH & Co KG)'
    ,'5e7ced57b8e05c485246ccde':'Outbrain UK Ltd'
    //,'5f2d22a6b8e05c02b03dbb65':'Platform161 B.V.'
    //,'5f92a62aa22863685f4daa4c':'Prebid.org'
    //,'5e7ced57b8e05c4854221bbb':'Publicis Media GmbH'
    //,'5eab3d5ab8e05c241a63c5db':'PubMatic Inc'
    //,'5f369a02b8e05c65ef01a826':'Pure Local Media GmbH'
    //,'5f5b4728b8e05c170611e24f':'Quality Media Network GmbH'
    //,'5e7ced57b8e05c4854221bd0':'Quantcast'
    //,'5eb559d0b8e05c48537f6209':'Readpeak Oy'
    //,'5eab3d5ab8e05c2bbe33f398':'Roq.ad GmbH'
    ,'5ee15bc6b8e05c164c398ae3':'RTB House S.A.'
    //,'5f896ba9a22863606c631ace':'Salesforce.com Inc.'
    //,'5e37fc3e56a5e60dff4e1992':'Seeding Alliance GmbH'
    //,'5ee15bc6b8e05c164d21c76b':'Seedtag Advertising S.L'
    //,'5efefe24b8e05c109b4949c8':'Semasio GmbH'
    //,'5eab3d5ab8e05c1c467dab7b':'Showheroes SE'
    //,'5f6dbc27a22863a9eb13f4b3':'ShowHeroes SRL'
    //,'5e865b37b8e05c48537f60ae':'Smaato Inc.'
    //,'5e7ced57b8e05c485246cce9':'Smart Adserver'
    //,'5e7ced57b8e05c47e418b73e':'smartclip Europe GmbH'
    //,'5efefe24b8e05c2e742a3a16':'SMARTSTREAM.TV GmbH'
    //,'601d13aea228633ae669e7d7':'SoD ScreenOnDemand GmbH'
    ,'5f23e826b8e05c0c0d4fdb8f':'Sourcepoint Technologies Inc. (non-CMP)'
    //,'5eb559cfb8e05c111d01b4e3':'Sovrn Inc.'
    //,'5e7ced57b8e05c485246ccef':'Sublime'
    //,'5f0838a5b8e05c2e742a3aa7':'TabMo SAS'
    ,'5e37fc3e56a5e6615502f9c4':'Taboola Europe Limited'
    //,'5eab3d5ab8e05c2bbe33f399':'Teads France SAS'
    //,'5e37fc3e56a5e6615457a52a':'The MediaGrid Inc.'
    ,'5efefe25b8e05c109c2b8324':'The Reach Group GmbH'
    ,'5e865b36b8e05c48537f60a7':'The UK Trade Desk Ltd'
    //,'5e98e7f0b8e05c1c467daaf0':'TripleLift Inc.'
    //,'5e7ced57b8e05c4854221bc8':'twiago GmbH'
    //,'5e37fc3e56a5e6615457a528':'Verve Group Europe GmbH'
    //,'5e7ced57b8e05c4854221bcf':'Vidazoo Ltd'
    //,'5eab3d5ab8e05c241a63c5da':'video intelligence AG'
    //,'60b0bbaca228630ec1654ef8':'VLYBY Digital GmbH'
    //,'5eab3d5bb8e05c1c467dab7d':'Welect GmbH'
    //,'5e7ced57b8e05c4854221bba':'Xandr Inc.'
    //,'5e7ced56b8e05c4854221bb3':'Yahoo EMEA Limited'
    //,'5ee34ea5b8e05c164d21c78c':'Yieldlab (Virtual Minds GmbH)'
    //,'5ebee9f5b8e05c6bd60edbeb':'Yieldlove GmbH'
    //,'5ebee9f5b8e05c43d547d7cf':'YOC AG'
    //,'5e7ced57b8e05c47e418b73d':'Zemanta Inc.'
    //,'5eec8925b8e05c699f3a0af5':'zeotap GmbH'
    //,'5f6481a7b8e05c74b41401bc':'Zeta Global Corp.'
    ,'5e716fc09a0b5040d575080f':'Facebook Inc.'
    //,'5f2d22a6b8e05c028e5c2e98':'Bannernow Inc.'
    //,'5e37fc3e56a5e6615502f9c7':'DoubleVerify Inc.​'
    //,'5e37fc3e56a5e6615502f9ca':'Mobile Professionals BV / Sage&Archer BV'
    //,'5fa51b28a228635cc4330e62':'Mobkoi Ltd'
    //,'5f1aada4b8e05c306e139f00':'Polar Mobile Group Inc.'
    //,'6038c32ea228639c04605dd3':'Spoods GmbH'
    //,'5e37fc3e56a5e66147767235':'Adnami Aps'
    //,'5f6481a7b8e05c173008e12e':'GeoEdge'
    //,'5e7ced57b8e05c485246ccf3':'Integral Ad Science Inc.'
    //,'5ee34ea5b8e05c164d21c78d':'Oracle Data Cloud - Moat'
    //,'5f0838a5b8e05c065164a384':'TargetVideo GmbH'
    //,'5ee15bc6b8e05c16353f5b99':'HUMAN'
    //,'5ef513df0b45880aa11f804d':'VG Wort'
  };
  // Loop grants and get purposes and vendors
  for (k in data.grants) {
    var v = JSON.parse(JSON.stringify(data.grants[k]));
    vendorCtr++;
    var vg = true;
    if (typeof v.purposeGrants=='object') {
      for (p in v.purposeGrants) {
        var exists = false;
        for(var i=0;i<purposeIDs.length;i++){if(purposeIDs[i]===p)exists=true;}
        if (!exists) {
          purposeCtr++;
          if (typeof v.purposeGrants[p]=='boolean' && v.purposeGrants[p]) {
            purposeIDs.push(p);
            purposes.push(typeof purposeMap[p]=='string' ? purposeMap[p] : p);
          } else if (typeof v.purposeGrants[p]=='boolean' && !v.purposeGrants[p]) {
            vg = false;
          }
        }
      }
    }
    if (typeof v.vendorGrant=='boolean' && v.vendorGrant && vg) {
      vendorIDs.push(k);
      vendors.push(typeof vendorMap[k]=='string' ? vendorMap[k] : k);
    }
  }
  // cleanup services array (no comma in vendor string)
  var purposes_clean = purposes.map(function(item) { return item.replace(',', ''); });
  var vendors_clean = vendors.map(function(item) { return item.replace(',', ''); });
  // Put all data in data object
  trTM.d.consent = trTM.d.consent || {};
  trTM.d.consent.purposes = ',' + purposes_clean.join(',') + ',';
  trTM.d.consent.purposeIDs = ',' + purposeIDs.join(',') + ',';
  trTM.d.consent.vendors = ',' + vendors_clean.join(',') + ',';
  trTM.d.consent.vendorIDs = ',' + vendorIDs.join(',') + ',';
  // Build feedback
  trTM.d.consent.feedback = 'Consent available';
  if (vendors.length<=vendorCtr && purposes.length<=purposeCtr) { trTM.d.consent.feedback = 'Consent (partially) declined'; }
  else if (vendors.length==vendorCtr && purposes.length==purposeCtr) { trTM.d.consent.feedback = 'Consent full accepted'; }
  // Set Response
  trTM.d.consent.hasResponse = true;
  // Callback and Return
  if (typeof trTM.f.log=='function') trTM.f.log('m2', JSON.parse(JSON.stringify(trTM.d.consent)));
  return true;
};

//[trTMlib.js Consentcheck]EOF