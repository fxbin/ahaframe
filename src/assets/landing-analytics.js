(function(){
  'use strict';

  window.AhaFrame=window.AhaFrame||{};
  const eventId=()=>window.crypto&&typeof window.crypto.randomUUID==='function'
    ?window.crypto.randomUUID()
    :`evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;

  window.AhaFrame.track=function(name,props={}){
    const validation=window.AhaFrame.getValidationContext?.()||{
      locale:document.documentElement?.lang||'en',
      pageType:'landing',
      layer:'Overview',
      deviceClass:innerWidth<760?'mobile':innerWidth<1100?'tablet':'desktop',
    };
    const payload={schemaVersion:1,eventId:eventId(),name,props,path:location.pathname,ts:new Date().toISOString(),...validation};
    const endpoint=window.AHAFRAME_CONFIG?.analyticsEndpoint;
    if(endpoint){
      const body=JSON.stringify(payload);
      let sent=false;
      try{if(navigator.sendBeacon)sent=navigator.sendBeacon(endpoint,new Blob([body],{type:'application/json'}));}catch(_){}
      if(!sent){try{fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true}).catch(()=>{});}catch(_){}}
    }
    window.dispatchEvent(new CustomEvent('ahaframe:event',{detail:payload}));
    return payload;
  };

  document.addEventListener('click',(event)=>{
    const eventEl=event.target.closest('[data-event]');
    if(eventEl)window.AhaFrame.track(eventEl.dataset.event,{label:(eventEl.textContent||'').trim().slice(0,80)});
  });
})();
