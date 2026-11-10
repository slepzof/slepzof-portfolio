#!/usr/bin/env python3
"""SLEPZOF local, stdlib-only content editor. Bound to 127.0.0.1 by default."""
from __future__ import annotations
import argparse, json, os, re, shutil, tempfile, zipfile, io, html, mimetypes, time
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

ROOT=Path(__file__).resolve().parent
DATA=ROOT/'cms/data.json'
GENERATED=ROOT/'cms/generated-pages.json'
UPLOADS=ROOT/'assets/cms-uploads'
UPLOADS.mkdir(parents=True,exist_ok=True)
MAX_IMAGE=18*1024*1024
MAX_JSON=8*1024*1024


def clean_slug(s):
    return re.sub('[^a-z0-9-]','-',str(s).lower()).strip('-')[:72]

def load_data():return json.loads(DATA.read_text(encoding='utf-8'))
def write_data(data):
    fd,tmp=tempfile.mkstemp(dir=str(DATA.parent),prefix='.cms-',suffix='.json')
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f:
            json.dump(data,f,ensure_ascii=False,indent=2)
            f.flush();os.fsync(f.fileno())
        os.replace(tmp,DATA)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)

def public_case_html(project):
    esc=lambda val:html.escape(str(val or ''))
    title=esc(project.get('title','Новый проект'))
    intro=esc(project.get('summary',''))
    detail=project.get('detail') or {}
    slug=esc(project.get('slug'))
    def block(key,label):
        body=detail.get(key,'')
        return f'<section class="cm-case-section"><h2>{label}</h2><p>{esc(body)}</p></section>' if body else ''
    gallery=''.join(f'<img src="{esc(img)}" alt="Иллюстрация {i+1}" loading="lazy">' for i,img in enumerate(detail.get('gallery') or []))
    roles=''.join(f'<span>{esc(role)}</span>' for role in project.get('roles') or [])
    cover=(project.get('images') or {}).get('desktop','')
    coverblock=f'<img class="cm-case-cover" src="{esc(cover)}" alt="{title}">' if cover else ''
    generated=f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} · SLEPZOF</title><link rel="stylesheet" href="/css/cms-runtime.css"><script defer src="/js/site-cms.js"></script></head><body class="cm-detail-page"><header class="cm-detail-nav"><a href="/">SLEPZOF<span>.</span></a><nav><a href="/projects/">Все проекты</a><a href="/about/">Обо мне</a><a href="https://t.me/slepzof">Telegram ↗</a></nav></header><main><div class="cm-case-wrap"><a class="cm-back" href="/projects/">← Все проекты</a><div class="cm-detail-tags">{roles}</div><h1>{title}</h1><p class="cm-case-lead">{intro}</p>{coverblock}<div class="cm-case-stat"><strong>{esc(project.get('metric',''))}</strong> {esc(project.get('metricLabel',''))}</div>{block('intro','О проекте')}{block('problem','Задача')}{block('solution','Решение')}{block('result','Результат')}<div class="cm-gallery">{gallery}</div><div class="cm-case-contact"><h2>Обсудим ваш проект?</h2><a href="https://t.me/slepzof">Связаться в Telegram ↗</a></div></div></main><footer class="cm-case-footer">© 2026 SLEPZOF · <a href="/">Главная</a> · <a href="/projects/">Проекты</a></footer></body></html>'''

    # Reuse the precise public header/footer instead of introducing a different case design.
    try:
        chrome=json.loads((ROOT/'cms/chrome.json').read_text(encoding='utf-8'))
        generated=re.sub(r'<header class="cm-detail-nav">.*?</header>',chrome['header'],generated,count=1,flags=re.S)
        generated=re.sub(r'<footer class="cm-case-footer">.*?</footer>',chrome['footer'],generated,count=1,flags=re.S)
        generated=generated.replace('</body>',chrome['dock']+'</body>',1)
        styles=''.join(f'<link rel="stylesheet" href="{html.escape(item)}">' for item in chrome['styles'] if item!='/css/cms-runtime.css')
        generated=generated.replace('<link rel="stylesheet" href="/css/cms-runtime.css">',styles+'<link rel="stylesheet" href="/css/cms-runtime.css">',1)
        generated=generated.replace('<script defer src="/js/site-cms.js"></script>', '<script defer src="/js/v10.js"></script><script defer src="/js/v25.js"></script><script defer src="/js/site-cms.js"></script>', 1)
        generated=generated.replace('<body class="cm-detail-page">','<body class="cm-detail-page">',1)
    except (ValueError,OSError,KeyError):pass
    return generated

def sync_new_pages(data):
    try:previous=set(json.loads(GENERATED.read_text()))
    except (OSError,ValueError):previous=set()
    created=set()
    for slug,proj in data.get('projects',{}).items():
        if not proj.get('isNew'):continue
        slug=clean_slug(slug)
        if not slug:continue
        dest=ROOT/'cases'/slug/'index.html'
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(public_case_html(proj),encoding='utf-8')
        created.add(slug)
    for deleted in previous-created:
        dest=ROOT/'cases'/deleted/'index.html'
        if dest.exists():
            dest.unlink()
            try:dest.parent.rmdir()
            except OSError:pass
    GENERATED.write_text(json.dumps(sorted(created),ensure_ascii=False),encoding='utf-8')

def available_pages():
    from html.parser import HTMLParser
    class TitleParser(HTMLParser):
        def __init__(self):super().__init__();self.in_title=False;self.title=''
        def handle_starttag(self,tag,attrs):
            if tag=='title':self.in_title=True
        def handle_endtag(self,tag):
            if tag=='title':self.in_title=False
        def handle_data(self,value):
            if self.in_title:self.title+=value
    paths=[ROOT/'index.html',ROOT/'about/index.html',ROOT/'work-with-me/index.html',ROOT/'projects/index.html']+sorted((ROOT/'cases').glob('*/index.html'))
    pages=[]
    for file in paths:
        parser=TitleParser();parser.feed(file.read_text(encoding='utf-8')[:2000]);path=file.relative_to(ROOT).parent.as_posix();
        pages.append({'title':parser.title or file.parent.name, 'path':('/'+path+'/' if path!='.' else '/')})
    return pages

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('X-Frame-Options','SAMEORIGIN')
        if self.path.startswith('/api/') or self.path.startswith('/cms/data.json'):
            self.send_header('Cache-Control','no-store')
        super().end_headers()
    def json_answer(self,obj,status=200):
        raw=json.dumps(obj,ensure_ascii=False).encode('utf-8')
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def allow_mutation(self):
        origin=self.headers.get('Origin','')
        if origin:
            x=urlparse(origin)
            if x.hostname not in ('localhost','127.0.0.1') or x.port!=self.server.server_port:return False
        return True
    def do_GET(self):
        u=urlparse(self.path)
        if u.path=='/api/cms/pages':return self.json_answer(available_pages())
        if u.path=='/api/cms/status':return self.json_answer({'ok':True,'mode':'local','editor':'/admin/','projectCount':len(load_data().get('projects',{}))})
        if u.path=='/api/cms/export':
            public=parse_qs(u.query).get('public',['0'])[0]=='1'
            buf=io.BytesIO()
            with zipfile.ZipFile(buf,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
                for f in ROOT.rglob('*'):
                    if not f.is_file():continue
                    path=f.relative_to(ROOT)
                    if any(part.startswith('__pycache__') or part=='.DS_Store' for part in path.parts):continue
                    if path.name.startswith('__qa') or path.name.startswith('_build_cms'):continue
                    if public and (path.parts[0] in ('admin','cms') and path.name!='data.json'):continue
                    if public and path.name in ('server.py',) :continue
                    z.write(f,'slepzof-site/'+str(path))
            out=buf.getvalue()
            self.send_response(200);self.send_header('Content-Type','application/zip');self.send_header('Content-Disposition',f'attachment; filename="SLEPZOF_{"Public" if public else "Editable"}_v23.zip"');self.send_header('Content-Length',str(len(out)));self.end_headers();self.wfile.write(out);return
        return super().do_GET()
    def do_POST(self):
        u=urlparse(self.path)
        if not u.path.startswith('/api/cms/'):
            return self.json_answer({'error':'not_found'},404)
        if not self.allow_mutation():return self.json_answer({'error':'bad_origin'},403)
        n=int(self.headers.get('Content-Length','0') or 0)
        if u.path=='/api/cms/upload':
            if n<=0 or n>MAX_IMAGE:return self.json_answer({'error':'Размер изображения превышает 18 МБ'},413)
            suffix=Path(unquote(self.headers.get('X-Filename',''))).suffix.lower()
            allowed={'.png','image/png','.jpg','image/jpeg','.jpeg','image/jpeg','.webp','image/webp','.gif','image/gif','.avif','image/avif'}
            if suffix not in ('.png','.jpg','.jpeg','.webp','.gif','.avif'):return self.json_answer({'error':'Только PNG, JPG, WebP, GIF или AVIF'},400)
            raw=self.rfile.read(n)
            # Check file magic, not only the extension.
            ok=(raw.startswith(b'\x89PNG\r\n\x1a\n') if suffix=='.png' else
                raw.startswith(b'\xff\xd8\xff') if suffix in ('.jpg','.jpeg') else
                raw.startswith(b'RIFF') and raw[8:12]==b'WEBP' if suffix=='.webp' else
                raw.startswith((b'GIF87a',b'GIF89a')) if suffix=='.gif' else
                raw[4:12] in (b'ftypavif',b'ftypavis'))
            if not ok:return self.json_answer({'error':'Содержимое не соответствует формату изображения'},400)
            import hashlib
            hash=hashlib.sha256(raw).hexdigest()[:20]
            dest=UPLOADS/(hash+suffix)
            if not dest.exists():dest.write_bytes(raw)
            return self.json_answer({'url':'/assets/cms-uploads/'+dest.name,'bytes':len(raw)})
        if n<1 or n>MAX_JSON:return self.json_answer({'error':'Неверный размер запроса'},413)
        try:data=json.loads(self.rfile.read(n))
        except Exception:return self.json_answer({'error':'Некорректный JSON'},400)
        if u.path=='/api/cms/save':
            if not isinstance(data,dict) or data.get('version')!=1:return self.json_answer({'error':'Неверный формат данных'},400)
            projects=data.get('projects');periods=data.get('periods')
            if not isinstance(projects,dict) or len(projects)>800 or not isinstance(periods,list):return self.json_answer({'error':'Некорректный список проектов'},400)
            for key,project in projects.items():
                if key!=clean_slug(key) or not isinstance(project,dict) or project.get('slug')!=key:return self.json_answer({'error':'Некорректный адрес проекта'},400)
                if project.get('size') not in ('large','medium-vertical','medium-horizontal','small'):return self.json_answer({'error':'Некорректный размер карточки'},400)
            if not isinstance(data.get('pageEdits',{}),dict):return self.json_answer({'error':'Некорректные правки страниц'},400)
            try:
                write_data(data);sync_new_pages(data)
            except Exception as ex:return self.json_answer({'error':str(ex)},500)
            return self.json_answer({'ok':True,'projects':len(projects),'savedAt':time.strftime('%Y-%m-%d %H:%M:%S')})
        if u.path=='/api/cms/import':
            return self.json_answer({'error':'Используйте редактор и кнопку «Сохранить»'},400)
        return self.json_answer({'error':'not_found'},404)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8000);p.add_argument('--host',default='127.0.0.1');a=p.parse_args()
    if a.host not in ('127.0.0.1','localhost'):
        raise SystemExit('Панель редактирования доступна только локально. Используйте --host 127.0.0.1.')
    server=ThreadingHTTPServer((a.host,a.port),Handler)
    print(f'SLEPZOF v24: http://127.0.0.1:{a.port}/  |  Панель: http://127.0.0.1:{a.port}/admin/',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    server.server_close()
