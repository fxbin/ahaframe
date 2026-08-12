(function(){
  const slider=document.querySelector('#hero-temperature');
  if(!slider)return;
  const out=document.querySelector('#hero-temperature-value');
  const selected=document.querySelector('[data-hero-selected]');
  const sampling=document.querySelector('#hero-sampling');
  const rows=[...document.querySelectorAll('[data-hero-prob]')];
  const candidates=[['Paris',3.0],['Lyon',0.6114269475],['located',0.3276013718],['other',0.8128043982]];

  function distribution(temperature){
    if(temperature<=0.05)return [1,0,0];
    const scaled=candidates.map(([,logit])=>logit/temperature);
    const max=Math.max(...scaled);
    const exp=scaled.map(x=>Math.exp(x-max));
    const total=exp.reduce((a,b)=>a+b,0);
    return exp.map(x=>x/total);
  }

  function render(){
    const t=Number(slider.value);
    out.textContent=t.toFixed(1);
    const probs=distribution(t);
    candidates.slice(0,rows.length).forEach(([label],i)=>{
      const row=rows[i];
      row.querySelector('[data-label]').textContent=label;
      row.querySelector('[data-value]').textContent=Math.round(probs[i]*100)+'%';
      row.querySelector('.bar span').style.width=Math.max(2,probs[i]*100)+'%';
    });
    const pick=sampling?.value==='greedy'?0:(t>1.15?1:0);
    selected.textContent=candidates[pick][0];
  }

  slider.addEventListener('input',()=>{
    render();
    window.AhaFrame?.track('hero_temperature_changed',{temperature:Number(slider.value)});
  });
  sampling?.addEventListener('change',()=>{
    render();
    window.AhaFrame?.track('hero_sampling_changed',{strategy:sampling.value});
  });
  render();
})();
