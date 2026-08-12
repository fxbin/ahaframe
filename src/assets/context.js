(function(){
  const buttons=[...document.querySelectorAll('[data-strategy]')];
  if(!buttons.length)return;
  const count=document.querySelector('[data-after-count]');
  const bar=document.querySelector('[data-after-bar]');
  const note=document.querySelector('[data-after-note]');
  const configs={
    drop:{count:'143,900',width:'72%',note:'47,350 tokens removed; 56,100 tokens of headroom remain. Fast, but older turns are lost.'},
    summarize:{count:'112,430',width:'56%',note:'78,820 tokens condensed or removed; 87,570 tokens of headroom remain.'},
    rag:{count:'96,800',width:'48%',note:'94,450 tokens removed from active context; 103,200 tokens of headroom remain as documents move to on-demand retrieval.'},
    memory:{count:'128,300',width:'64%',note:'62,950 tokens removed from active context; 71,700 tokens of headroom remain as stable facts move to persistent memory.'}
  };
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const c=configs[btn.dataset.strategy];
    count.textContent=c.count;
    bar.style.width=c.width;
    note.textContent=c.note;
    window.SeeAI?.track('interaction_strategy_selected',{lesson:'context-window',strategy:btn.dataset.strategy});
  }));
})();
