(function(){
  'use strict';

  const track=(name,props)=>window.AhaFrame?.track?.(name,props);
  const seen=new WeakSet();

  function impression(node){
    if(!node||seen.has(node))return;
    seen.add(node);
    track('homepage_flagship_impression',{
      missionId:node.dataset.missionId||null,
      position:Number(node.dataset.position)||null,
      campaignRole:node.dataset.campaignRole||null,
      campaignVersion:'0.8',
    });
  }

  const cards=[...document.querySelectorAll('[data-flagship-impression]')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(entry.isIntersecting&&entry.intersectionRatio>=0.45){
          impression(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },{threshold:[0.45]});
    cards.forEach((card)=>observer.observe(card));
  }else{
    cards.forEach(impression);
  }

  document.addEventListener('click',(event)=>{
    const link=event.target.closest('[data-flagship-cta]');
    if(!link)return;
    track('homepage_flagship_click',{
      missionId:link.dataset.missionId||null,
      position:Number(link.dataset.position)||null,
      source:link.dataset.source||'unknown',
      campaignVersion:'0.8',
    });
  });
})();
