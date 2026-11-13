import runpy,urllib.request,concurrent.futures,re,html,json
from pathlib import Path
x=runpy.run_path('staging/fire-build.py');sources={q['source']:q['reference'] for q in x['Q']};Path('research/fire').mkdir(parents=True,exist_ok=True)
def fetch(item):
 u,r=item
 try:
  data=urllib.request.urlopen(u,timeout=20).read()
  if data.startswith(b'%PDF'):
   import pymupdf
   doc=pymupdf.open(stream=data,filetype='pdf');t='\n'.join(f'PAGE{i+1} '+p.get_text() for i,p in enumerate(doc))
  else:
   s=data.decode('utf-8','replace'); s=re.sub(r'<(script|style).*?</\1>','',s,flags=re.S);t=html.unescape(re.sub('<[^>]+>',' ',s));t=re.sub(r'\s+',' ',t)
  n=str(list(sources).index(u)).zfill(2);Path(f'research/fire/{n}.txt').write_text(t)
  return dict(url=u,reference=r,file=f'research/fire/{n}.txt',length=len(t))
 except Exception as e:return dict(url=u,error=str(e))
results=list(concurrent.futures.ThreadPoolExecutor(max_workers=8).map(fetch,sources.items()))
Path('research/fire/sources.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False,indent=2))
