
/**
 * Function for adding an DL Event
 * @property {function} trTM.f.addEv
 * @param {string} p - Page State, when the Event Listener should be added. Possible values: 'tl' (Tracking/Library loaded), 'dl' (DOM loaded), 'pl' (Page loaded)
 * @param {object} d - DOM object where the event (listener) selector should be added, e.g. document.querySelector('div.navigation'), default is document
 * @param {string} l - Listener, e.g. 'click'
 * @param {string} s - Selector for the DOM elements, e.g. 'div.button'
 * @param {object} o - Event object, e.g. { event:'click', button:'Signup Button' }
 * Usage: trTM.f.addEv( 'dl', document, 'click', 'div.button', { event:'click', button:'Signup Button' } );
 */
trTM.f.addEv = trTM.f.addEv || function(p, d, l, s, o) {
  if (typeof p!='string' || !p || typeof d!='object' || !d || typeof l!='string' || !l || typeof s!='string' || !s || typeof o!='object' || !o) return;
  if (typeof trTM.f[p]!='object') trTM.f[p] = {};
  trTM.d.ev_fct_ctr++;
  trTM.f[p]['fct_'+trTM.d.ev_fct_ctr.toString()] = function() {
    var el = d.querySelectorAll(s);
    if (typeof el=='object' && typeof el.length=='number' && el.length>0) {
      var ev = l;
      switch(ev) {
        case 'click': ev = 'mousedown'; break;
      }
      for (var i=0; i<el.length; i++) {
        // add function to listener container
        trTM.f.evLstn(el[i], ev, function() {
          trTM.f.fire(o);
        });
      }
    } 
  };
  // check dom_ready
  if ((p=='tl' && trTM.d.fired) || (p=='dl' && trTM.d.dom_ready) || (p=='pl' && trTM.d.page_ready)) {
    trTM.f[p]['fct_'+trTM.d.ev_fct_ctr.toString()]();
  }
};
