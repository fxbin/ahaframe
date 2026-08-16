"""Post-process generated landing pages for a smaller mobile critical path.

The public site is a Python-generated static build. Keep homepage-only performance
rules here so Labs can retain their richer runtime without making the landing page
pay for it before a visitor starts a Mission.
"""

from __future__ import annotations

import re

from .core import ROOT, SITE


HOME_STYLE_SOURCES = (
    "base.css",
    "language-switcher.css",
    "marketing.css",
    "responsive.css",
)
GLOBAL_STYLE_TAG = '<link rel="stylesheet" href="/assets/styles.css">'
HOME_STYLE_TAG = '<link rel="stylesheet" href="/assets/home.css">'
DEFERRED_HOME_SCRIPTS = (
    '<script src="/assets/validation-ui.js" defer></script>',
    '<script src="/assets/lab-engine.js" defer></script>',
    '<script src="/assets/lab-scenarios.js" defer></script>',
)
BOOTSTRAP_MARKER = "data-ahaframe-feedback-bootstrap"


FEEDBACK_BOOTSTRAP = r'''<style data-ahaframe-feedback-bootstrap>
.ahaframe-feedback-bootstrap-trigger{position:fixed;right:20px;bottom:20px;z-index:70;min-height:42px;padding:0 15px;border:1px solid #d3dcd6;border-radius:999px;background:#fff;color:#17201e;font:inherit;font-size:13px;font-weight:800;box-shadow:0 12px 34px rgba(23,49,43,.13);cursor:pointer}.ahaframe-feedback-bootstrap-footer{padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}@media(max-width:640px){.ahaframe-feedback-bootstrap-trigger{right:14px;bottom:14px}}
</style><script data-ahaframe-feedback-bootstrap>(function(){
  var locale=document.documentElement.lang||'en';
  var label=locale==='zh-CN'?'反馈':'Feedback';
  var fixed=document.createElement('button');fixed.type='button';fixed.className='ahaframe-feedback-bootstrap-trigger';fixed.setAttribute('data-feedback-bootstrap','');fixed.textContent=label;document.body.appendChild(fixed);
  var footer=document.querySelector('.footer-links');
  if(footer){var footerButton=document.createElement('button');footerButton.type='button';footerButton.className='ahaframe-feedback-bootstrap-footer';footerButton.setAttribute('data-feedback-bootstrap','');footerButton.textContent=label;footer.appendChild(footerButton);var support=document.createElement('a');support.href='mailto:support@ahaframe.com';support.setAttribute('data-static-support','');support.textContent='support@ahaframe.com';footer.appendChild(support);}
  function trackLanding(){if(window.AhaFrame&&window.AhaFrame.track&&!window.__ahaframeLandingTracked){window.AhaFrame.track('landing_viewed');window.__ahaframeLandingTracked=true;}}
  if(document.readyState==='complete')trackLanding();else window.addEventListener('load',trackLanding,{once:true});
  var loading=false;
  function loadFeedback(){if(loading)return;loading=true;document.querySelectorAll('[data-feedback-bootstrap]').forEach(function(node){node.remove();});var support=document.querySelector('[data-static-support]');if(support)support.remove();var originalTrack=window.AhaFrame&&window.AhaFrame.track;if(window.__ahaframeLandingTracked&&originalTrack){window.AhaFrame.track=function(name,props){if(name==='landing_viewed')return null;return originalTrack(name,props);};}var script=document.createElement('script');script.src='/assets/validation-ui.js';script.onload=function(){if(originalTrack)window.AhaFrame.track=originalTrack;var trigger=document.querySelector('[data-product-feedback-trigger]');if(trigger)trigger.click();};document.body.appendChild(script);}
  document.querySelectorAll('[data-feedback-bootstrap]').forEach(function(node){node.addEventListener('click',loadFeedback,{once:true});});
})();</script>'''


def _minify_css(source: str) -> str:
    source = re.sub(r"/\*.*?\*/", "", source, flags=re.S)
    source = re.sub(r"\s+", " ", source)
    source = re.sub(r"\s*([{}:;,>])\s*", r"\1", source)
    return source.strip()


def _build_home_css() -> None:
    styles = ROOT / "src" / "styles"
    source = "\n".join(
        (styles / name).read_text(encoding="utf-8") for name in HOME_STYLE_SOURCES
    )
    rendered = _minify_css(source)
    if not rendered:
        raise ValueError("Homepage stylesheet cannot be empty.")
    (SITE / "assets" / "home.css").write_text(rendered, encoding="utf-8")


def _optimize_home(path) -> None:
    source = path.read_text(encoding="utf-8")
    if GLOBAL_STYLE_TAG not in source:
        raise ValueError(f"Expected global stylesheet tag in {path}.")
    source = source.replace(GLOBAL_STYLE_TAG, HOME_STYLE_TAG, 1)

    for tag in DEFERRED_HOME_SCRIPTS:
        if tag not in source:
            raise ValueError(f"Expected homepage runtime tag {tag!r} in {path}.")
        source = source.replace(tag, "", 1)

    if BOOTSTRAP_MARKER in source:
        raise ValueError(f"Feedback bootstrap already exists in {path}.")
    if "</body>" not in source:
        raise ValueError(f"Generated homepage is missing </body>: {path}.")
    source = source.replace("</body>", FEEDBACK_BOOTSTRAP + "</body>", 1)

    if HOME_STYLE_TAG not in source:
        raise ValueError(f"Homepage stylesheet was not applied to {path}.")
    if any(tag in source for tag in DEFERRED_HOME_SCRIPTS):
        raise ValueError(f"Homepage still eagerly loads Lab-only runtime in {path}.")
    if BOOTSTRAP_MARKER not in source:
        raise ValueError(f"Homepage feedback lazy loader missing in {path}.")

    path.write_text(source, encoding="utf-8")


def apply() -> None:
    _build_home_css()
    for relative in (("en", "index.html"), ("zh-cn", "index.html")):
        path = SITE.joinpath(*relative)
        if not path.exists():
            raise ValueError(f"Expected generated homepage at {path}.")
        _optimize_home(path)
