(function(){
  window.AhaFrame=window.AhaFrame||{};
  const progressKey='ahaframe_progress_v02';
  const lessons=['token-playground','context-window','agent-loop'];
  const readProgress=()=>{try{return JSON.parse(localStorage.getItem(progressKey)||'{}')}catch(_){return {}}};
  const saveProgress=(p)=>{try{localStorage.setItem(progressKey,JSON.stringify(p))}catch(_){}};
  const eventId=()=>window.crypto&&typeof window.crypto.randomUUID==='function'?window.crypto.randomUUID():`evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  const COPY={
    en:{completed:'Completed',notStarted:'Not started',markComplete:'Mark lesson complete',linkCopied:'Link copied ✓',invalidEmail:'Enter a valid email address.',waitlistSubmitting:'Joining…',waitlistError:'Could not join right now. Please try again.',waitlistDemo:'Demo mode: no waitlist backend is configured, so this email was saved only in this browser.',waitlistOk:"You're in. We'll notify you when the next labs are ready."},
    'zh-CN':{completed:'已完成',notStarted:'未开始',markComplete:'标记为已完成',linkCopied:'链接已复制 ✓',invalidEmail:'请输入有效的邮箱地址。',waitlistSubmitting:'正在加入…',waitlistError:'暂时无法加入内测，请稍后再试。',waitlistDemo:'演示模式：当前没有配置候补名单后端，因此邮箱只保存在这个浏览器里。',waitlistOk:'已加入。新的实验开放时我们会通知你。'},
  };
  const locale=()=>window.AhaFrame.getValidationContext?.().locale||document.documentElement?.lang||'en';
  const copy=()=>COPY[locale()]||COPY.en;
  const queryIntent=()=>new URLSearchParams(location.search).get('intent')||'';

  window.AhaFrame.track=function(name,props={}){
    const validation=window.AhaFrame.getValidationContext?.()||{};
    const payload={schemaVersion:1,eventId:eventId(),name,props,path:location.pathname,ts:new Date().toISOString(),...validation};
    console.info('[AhaFrame event]',payload);
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

  window.AhaFrame.completeLesson=function(slug){
    const p=readProgress();
    p[slug]={completed:true,completedAt:new Date().toISOString()};
    saveProgress(p);
    window.AhaFrame.track('lesson_completed',{lesson:slug});
    paintProgress();
  };

  function paintProgress(){
    const p=readProgress(); const text=copy();
    const count=lessons.filter(x=>p[x]?.completed).length;
    document.querySelectorAll('[data-progress-count]').forEach(el=>el.textContent=`${count}/3`);
    document.querySelectorAll('[data-progress-ring]').forEach(el=>el.style.setProperty('--progress',`${Math.round(count/3*100)}%`));
    document.querySelectorAll('[data-lesson-status]').forEach(el=>{const done=!!p[el.dataset.lessonStatus]?.completed;el.textContent=done?text.completed:text.notStarted;el.classList.toggle('done',done)});
    document.querySelectorAll('[data-complete-lesson]').forEach(btn=>{const done=!!p[btn.dataset.completeLesson]?.completed;btn.textContent=done?`${text.completed} ✓`:text.markComplete;btn.classList.toggle('subtle',done)});
  }

  document.addEventListener('click',(e)=>{
    const eventEl=e.target.closest('[data-event]');
    if(eventEl)window.AhaFrame.track(eventEl.dataset.event,{label:(eventEl.textContent||'').trim().slice(0,80)});
    const complete=e.target.closest('[data-complete-lesson]');
    if(complete)window.AhaFrame.completeLesson(complete.dataset.completeLesson);
    const share=e.target.closest('[data-share]');
    if(share){
      const url=location.href;
      if(navigator.share){navigator.share({title:document.title,url}).catch(()=>{})}
      else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>{const old=share.textContent;share.textContent=copy().linkCopied;setTimeout(()=>share.textContent=old,1500)})}
      window.AhaFrame.track('lesson_share',{url});
    }
  });

  const pageContext=window.AhaFrame.getValidationContext?.()||{};
  if(pageContext.pageType==='waitlist')window.AhaFrame.track('early_access_viewed',{intent:queryIntent()||'early-access'});

  document.querySelectorAll('[data-waitlist-form]').forEach(form=>{
    const emailInput=form.querySelector('input[name="email"]');
    const submit=form.querySelector('[type="submit"]');
    const status=form.parentElement.querySelector('[data-status]')||form.querySelector('[data-status]');
    const success=form.parentElement.querySelector('[data-waitlist-success]');
    let inFlight=false;
    let completed=false;
    let started=false;
    const intent=()=>queryIntent()||form.dataset.intent||'waitlist';
    const markStarted=()=>{
      if(started||completed)return;
      started=true;
      window.AhaFrame.track('early_access_form_started',{intent:intent()});
    };
    emailInput?.addEventListener('focus',markStarted);
    emailInput?.addEventListener('input',markStarted);
    form.addEventListener('submit',async(e)=>{
      e.preventDefault();
      if(inFlight||completed)return;
      const email=new FormData(form).get('email');
      const text=copy();
      if(!email||!/^\S+@\S+\.\S+$/.test(String(email).trim())){if(status){status.textContent=text.invalidEmail;status.className='status'}return}
      const currentIntent=intent();
      const originalLabel=submit?.textContent||'';
      inFlight=true;
      form.setAttribute('aria-busy','true');
      if(submit){submit.disabled=true;submit.textContent=text.waitlistSubmitting;}
      window.AhaFrame.track('early_access_submit_attempt',{intent:currentIntent});
      try{
        const result=await window.AhaFrame.submitWaitlist(email,currentIntent);
        if(!result.remote){
          window.AhaFrame.track('waitlist_demo_saved',{intent:currentIntent});
          form.reset();
          if(status){status.textContent=text.waitlistDemo;status.className='status'}
          return;
        }
        window.AhaFrame.track('waitlist_submitted',{intent:currentIntent});
        window.AhaFrame.track('early_access_submit_success',{intent:currentIntent});
        completed=true;
        form.reset();
        form.hidden=true;
        if(success)success.hidden=false;
        if(status){status.textContent=text.waitlistOk;status.className='status ok'}
      }catch(_){
        window.AhaFrame.track('early_access_submit_error',{intent:currentIntent});
        if(status){status.textContent=text.waitlistError;status.className='status'}
      }finally{
        form.removeAttribute('aria-busy');
        if(!completed){inFlight=false;if(submit){submit.disabled=false;submit.textContent=originalLabel;}}
      }
    });
  });

  paintProgress();
})();
