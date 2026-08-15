from .foundation import build_challenge, concept_guide, json_attr, lesson_header, lesson_source, next_band, quick_answer, sidebar, takeaways, write_lesson


def _build(locale):
    slug='agent-loop';d=lesson_source(locale,slug);labels=d['labels']
    copy={"status":d['status'],"errorStatus":d['errorStatus'],"waiting":d['waiting'],"result":d['result']}
    nodes=''.join(f'''<div class="agent-node{' active' if i==0 else ''}" data-agent-node>{node}</div>{'<span class="flow-arrow">→</span>' if i<len(d['nodes'])-1 else ''}''' for i,node in enumerate(d['nodes']))
    timeline=''.join(f'''<li class="{'active' if i==0 else ''}" data-time-step>{item}</li>''' for i,item in enumerate(d['timeline']))
    agent_body=f'''<div class="container">{lesson_header(slug,'⌘',locale,d)}{quick_answer(d['quick'],locale)}<div class="lesson-grid"><div><section class="card interactive" data-agent-copy="{json_attr(copy)}"><div class="panel-title"><span>{labels['simulation']}</span><span class="badge">{labels['manual']}</span></div><div class="task-box" style="margin-top:13px"><strong>{labels['task']}</strong><br>{labels['taskText']}</div><div class="agent-main"><div><div class="agent-flow">{nodes}</div><div class="note"><strong>{labels['currentState']}:</strong> <span data-agent-status>{d['status'][0]}</span></div><div class="selected-panel"><span class="subtle">{labels['finalAnswer']}</span><div data-agent-result style="font-weight:820;margin-top:4px">{d['waiting']}</div></div></div><aside><strong style="font-size:13px">{labels['timeline']}</strong><ol class="timeline">{timeline}</ol><div class="tool-result"><strong>{labels['toolResult']}</strong><div class="subtle" style="margin-top:6px">{labels['toolValue']}</div></div><div class="metrics"><div class="metric">{labels['latency']}<br><strong>1.1s</strong></div><div class="metric">{labels['cost']}<br><strong>$0.0007</strong></div></div></aside></div><div class="agent-controls" style="grid-template-columns:1fr 1fr 1fr;margin-top:15px"><button type="button" class="btn primary" data-agent-next>{labels['next']}</button><button type="button" class="btn" data-agent-reset>{labels['reset']}</button><button type="button" class="btn danger" data-agent-error>{labels['error']}</button></div></section>{takeaways(d['takeaways'],locale)}{build_challenge(d['challenge']['title'],d['challenge']['body'],locale)}</div><aside class="lesson-sidebar">{sidebar(d,locale,path_title=d['controlTitle'],control_copy=d['controlCopy'])}</aside></div>{concept_guide(d,locale)}{next_band(d,locale)}</div>'''
    write_lesson(slug,locale,agent_body,d,'<script src="/assets/agent.js" defer></script>')


def build():
    for locale in ('en','zh-CN'):
        _build(locale)
