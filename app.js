'use strict';
const P=[
{q:"火災を発見した際の自衛消防活動の主な初動対応を説明してください。",a:"周囲に火災を知らせ、119番通報、初期消火、避難誘導、関係者への連絡を状況に応じて実施する。活動者の安全を優先する。",p:"周知・通報・初期消火・避難誘導・安全確保"},
{q:"屋内消火栓を使用する前に注意すべき事項を説明してください。",a:"火災の状況と退路、周囲の安全、設備の型式、ホースの延長経路や操作体制などを確認し、設備に適した手順で操作する。",p:"退路・安全・設備の型式・操作手順"},
{q:"火災時の避難誘導で注意すべき点を説明してください。",a:"煙の状況を確認し、安全な経路へ誘導する。エレベーターの使用を避け、逃げ遅れや避難に支援を要する人に配慮する。",p:"煙・安全な経路・要配慮者・逃げ遅れ"}
];P.push(...[{"q":"119番通報時に伝える事項を説明してください。","a":"所在地、建物名、出火場所、燃えている物、逃げ遅れや負傷者の有無などを伝える。","p":"所在地・出火状況・逃げ遅れ"},{"q":"消火器使用時の安全上の注意を説明してください。","a":"適応火災を確認し、退路を確保する。煙や炎が強ければ無理せず避難する。","p":"適応火災・退路・撤退"},{"q":"自動火災報知設備が作動した際の初動を説明してください。","a":"受信機で警戒区域を確認し、安全に配慮して現場を確認する。火災なら周知、通報、避難誘導等を行う。","p":"受信機・現場確認・通報"},{"q":"防火戸と防火シャッターの日常管理を説明してください。","a":"閉鎖や降下を妨げる物を置かず、異常があれば報告し是正する。","p":"閉鎖障害防止・異常報告"},{"q":"避難経路の日常点検事項を説明してください。","a":"廊下や階段、避難口に障害物がなく、扉や誘導灯が適切に使えることを確認する。","p":"通路・扉・誘導灯"},{"q":"初期消火を中止すべき状況を説明してください。","a":"炎や煙が拡大して退路や安全を確保できない場合は消火を中止し避難する。","p":"火勢・煙・退路"},{"q":"避難に支援が必要な人への対応を説明してください。","a":"本人の状況に応じて声掛けと支援を行い、必要に応じて位置や状況を消防隊へ伝える。","p":"声掛け・支援・情報共有"},{"q":"消防隊到着時に伝える情報を説明してください。","a":"出火場所、延焼状況、逃げ遅れ、危険物、避難状況などを伝える。","p":"出火場所・逃げ遅れ・危険物"},{"q":"地震発生直後の自衛消防活動を説明してください。","a":"身の安全を確保し、負傷者や出火、建物の被害を確認して必要な通報・避難誘導を行う。","p":"安全確保・被害確認"},{"q":"非常放送による避難案内の注意点を説明してください。","a":"火災の状況と避難方向を落ち着いて簡潔に伝え、混乱を防ぐ。","p":"明確・簡潔・落ち着いた案内"},{"q":"屋内消火栓の使用時に退路を確認する理由を説明してください。","a":"火勢や煙が拡大したときに安全に撤退できるようにするため。","p":"退路・火勢・安全"},{"q":"自衛消防隊の役割分担で重要なことを説明してください。","a":"出火状況を共有し、通報・初期消火・避難誘導などの担当を明確にする。","p":"情報共有・役割分担"}]);
const UNITS = [
  ['燃焼・消火・火災現象・地震', 'fire'],
  ['防火対象物の防火防災対策', 'building'],
  ['消防関係法令', 'law'],
  ['自衛消防活動', 'activity'],
  ['消防用設備等の維持管理・取扱要領', 'equipment'],
  ['防火及び避難施設等の維持管理・取扱要領', 'facilities']
];
const MOCK_MS = 75 * 60 * 1000;
const KEYS = {wrong:'fireExamWrong-v2', practical:'fireExamPracticalWrong-v2', mock:'fireExamMock-v2', history:'fireExamHistory-v1'};
function shuffle(values, random = Math.random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function makeMock(bank, random = Math.random) {
  const result = [];
  for (const [category, count] of [['基礎',10],['法令',5],['実務',10]]) {
    const pool = bank.filter(q => q.c === category);
    if (pool.length < count) throw new Error('模擬試験の問題数が不足しています。');
    result.push(...shuffle(pool, random).slice(0, count));
  }
  if (new Set(result.map(q => q.id)).size !== 25) throw new Error('問題IDに重複があります。');
  return result;
}
function validateBank(bank) {
  if (!Array.isArray(bank) || bank.length !== 300) throw new Error('300問の問題データを読み込めませんでした。');
  const ids = new Set(), texts = new Set();
  for (const q of bank) {
    if (!q || typeof q.id !== 'string' || ids.has(q.id) || typeof q.q !== 'string' || texts.has(q.q)
      || !Array.isArray(q.a) || q.a.length !== 4 || new Set(q.a).size !== 4
      || q.a.some(a => typeof a !== 'string' || !a.trim()) || !Number.isInteger(q.k) || q.k < 0 || q.k > 3
      || !['基礎','法令','実務'].includes(q.c) || !UNITS.some(u => u[1] === q.unit)
      || !Array.isArray(q.optionExplanations) || q.optionExplanations.length !== 4
      || q.optionExplanations.some(e => typeof e !== 'string' || !e.trim())
      || typeof q.concept !== 'string' || !q.concept.trim() || typeof q.difficulty !== 'string' || !q.difficulty.trim()
      || typeof q.e !== 'string' || !q.e || typeof q.reference !== 'string' || !q.reference
      || typeof q.source !== 'string' || !/^https:\/\//.test(q.source)) {
      throw new Error('問題データの形式が正しくありません。');
    }
    ids.add(q.id); texts.add(q.q);
  }
  return true;
}
function scoreAnswers(items, answers) {
  return items.reduce((total,q,i) => total + (answers[i] === q.k ? 1 : 0), 0);
}
function remainingSeconds(deadline, now = Date.now()) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
function normalizedIds(value, allowedIds) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(allowedIds);
  return [...new Set(value.filter(id => typeof id === 'string' && allowed.has(id)))];
}
function restoreMock(raw, bank, now = Date.now()) {
  if (!raw || raw.version !== 2 || !Array.isArray(raw.ids) || raw.ids.length !== 25
    || new Set(raw.ids).size !== 25 || !Number.isFinite(raw.deadline)
    || !Number.isFinite(raw.startedAt) || raw.deadline !== raw.startedAt + MOCK_MS
    || raw.startedAt > now + 1000 || !Array.isArray(raw.answers) || raw.answers.length !== 25
    || raw.answers.some(a => a !== null && (!Number.isInteger(a) || a < 0 || a > 3))) return null;
  const byId = new Map(bank.map(q => [q.id,q]));
  const items = raw.ids.map(id => byId.get(id));
  if (items.some(q => !q)) return null;
  if (items.filter(q=>q.c==='基礎').length !== 10 || items.filter(q=>q.c==='法令').length !== 5
    || items.filter(q=>q.c==='実務').length !== 10) return null;
  return {kind:'mock',items,answers:[...raw.answers],index:Math.max(0,Math.min(24,Number.isInteger(raw.index)?raw.index:0)),
    deadline:raw.deadline,startedAt:raw.startedAt,finished:false};
}
if (typeof module !== 'undefined' && module.exports) module.exports = {UNITS,P,MOCK_MS,KEYS,shuffle,makeMock,validateBank,scoreAnswers,remainingSeconds,normalizedIds,restoreMock};
if (typeof document !== 'undefined') {
  const root = document.getElementById('app');
  const bank = typeof HARD !== 'undefined' ? HARD : [];
  let session = null, timer = null, storageOK = true;
  const memoryStore = {};
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key, fallback) {
    if (Object.hasOwn(memoryStore,key)) return memoryStore[key] ?? fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { storageWarning(); return Object.hasOwn(memoryStore,key) ? memoryStore[key] : fallback; }
  }
  function write(key,value) {
    memoryStore[key] = value;
    try { localStorage.setItem(key,JSON.stringify(value)); }
    catch (_) { storageWarning(); }
  }
  function remove(key) {
    memoryStore[key] = null;
    try {localStorage.removeItem(key);} catch (_) {storageWarning();}
  }
  function storageWarning() {
    storageOK = false;
    document.getElementById('storage-note').textContent = 'この環境では学習履歴を保存できない場合があります。画面を閉じると復習履歴や模擬試験の途中経過が失われることがあります。';
  }
  function button(label, handler, cls='', attrs='') {
    return '<button class="'+cls+'" onclick="'+handler+'" '+attrs+'>'+esc(label)+'</button>';
  }
  function render(html) {root.innerHTML = html; window.scrollTo({top:0,behavior:'instant'});}
  function clearTimer() {if(timer!==null)clearInterval(timer);timer=null;}
  function wrongIds() {return normalizedIds(read(KEYS.wrong,[]),bank.map(q=>q.id));}
  function record(q, correct) {
    const wrong = new Set(wrongIds());
    if(correct)wrong.delete(q.id);else wrong.add(q.id);
    write(KEYS.wrong,[...wrong]);
    const history = getHistory();
    const previous = history.questions[q.id] || {attempts:0,correct:0};
    history.questions[q.id] = {attempts:previous.attempts+1,correct:previous.correct+Number(correct),lastAt:Date.now(),lastCorrect:correct};
    write(KEYS.history,history);
  }
  function getHistory() {
    const raw=read(KEYS.history,null), questions={};
    if(raw && raw.version===1 && raw.questions && typeof raw.questions==='object') {
      for(const q of bank) {
        const x=raw.questions[q.id];
        if(x && Number.isSafeInteger(x.attempts) && x.attempts>0 && Number.isSafeInteger(x.correct)
          && x.correct>=0 && x.correct<=x.attempts && Number.isFinite(x.lastAt)) questions[q.id]=x;
      }
    }
    return {version:1,questions};
  }
  function historySummary() {
    const entries=Object.values(getHistory().questions);
    const attempts=entries.reduce((n,x)=>n+x.attempts,0), correct=entries.reduce((n,x)=>n+x.correct,0);
    return '<p>学習済み <b>'+entries.length+' / '+bank.length+'問</b> ｜ 累計正答率 <b>'+(attempts?Math.round(correct/attempts*100)+'%':'未解答')+'</b></p><p class="muted">延べ '+attempts+'回答・'+correct+'正解。模擬試験は提出時に記録します。</p>';
  }
  function showHistory() {
    clearTimer();session=null;
    const history=getHistory().questions;
    const rows=UNITS.map(([name,id])=>{
      const questions=bank.filter(q=>q.unit===id), values=questions.map(q=>history[q.id]).filter(Boolean);
      const attempts=values.reduce((n,x)=>n+x.attempts,0), correct=values.reduce((n,x)=>n+x.correct,0);
      return '<section class="result-question"><h3>'+esc(name)+'</h3><p>学習済み '+values.length+' / '+questions.length+'問 ｜ '+correct+' / '+attempts+'回答正解（'+(attempts?Math.round(correct/attempts*100)+'%':'未解答')+'）</p></section>';
    }).join('');
    const recent=Object.entries(history).sort((a,b)=>b[1].lastAt-a[1].lastAt).slice(0,30).map(([id,x])=>{
      const q=bank.find(q=>q.id===id);
      return '<li><b>'+esc(id)+'</b> '+(x.lastCorrect?'正解':'不正解')+' ｜ '+esc(new Date(x.lastAt).toLocaleString('ja-JP'))+'<br>'+esc(q.q)+'</li>';
    }).join('');
    render('<div class="card">'+button('← 学習メニュー',"menu('w')")+'<h2>学習履歴・正答率</h2>'+historySummary()+rows+'<h3>最近学習した問題（最大30件）</h3><p class="muted">各問題の直近の結果を表示します。同じ問題を解き直した回数も累計に含みます。</p><ol class="answer-list">'+recent+'</ol>'+button('間違えた問題を復習','retry()','primary')+'</div>');
  }
  function practicalWrong() {return normalizedIds(read(KEYS.practical,[]),P.map((_,i)=>'P'+i));}
  function explanation(q) {
    const options = Array.isArray(q.optionExplanations) && q.optionExplanations.length === 4
      ? '<div class="option-explanations"><h3>選択肢ごとの解説</h3><ol type="A" class="answer-list">' + q.optionExplanations.map(reason => '<li>' + esc(reason) + '</li>').join('') + '</ol></div>' : '';
    const difficulty = typeof q.difficulty === 'string' || typeof q.difficulty === 'number'
      ? '<p class="muted">難易度（編集上の目安）：' + esc(q.difficulty) + '</p>' : '';
    return '<p>' + esc(q.e) + '</p>' + options + difficulty + source(q);
  }
  function source(q) {
    const href = /^https:\/\//.test(q.source || '') ? q.source : '';
    return '<p class="source"><b>根拠：</b>'+esc(q.reference || '')+(href?' <a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">公式資料を開く ↗</a>':'')+'</p>';
  }
  function savedMock() {return restoreMock(read(KEYS.mock,null),bank);}
  function saveMock() {
    if(!session || session.kind!=='mock' || session.finished)return;
    write(KEYS.mock,{version:2,ids:session.items.map(q=>q.id),answers:session.answers,index:session.index,
      startedAt:session.startedAt,deadline:session.deadline});
  }
  function home() {
    clearTimer(); session=null;
    const saved=savedMock();
    render('<div class="card"><h2>学習する試験を選択</h2><p>筆記 <b>'+bank.length+'問</b>・6単元／集合実技 <b>'+P.length+'問</b></p>'+
      historySummary()+button('学習履歴・正答率','showHistory()')+button('📘 筆記試験　4択・解説付き',"menu('w')")+button('🧯 集合実技　記述式・模範解答付き',"menu('p')")+
      (saved?button('中断した模擬試験を再開','resumeMock()','primary')+'<p class="muted">中断中も75分の制限時間は進みます。</p>':'')+
      '<p class="muted">各問題の解説から根拠となる公式資料を確認できます。</p></div>');
  }
  function menu(mode) {
    clearTimer();session=null;
    const saved=savedMock();
    render('<div class="card">'+button('← トップへ','home()')+'<h2>'+(mode==='w'?'筆記試験｜単元別学習':'集合実技')+'</h2>'+
      (mode==='w'?UNITS.map(([name,id])=>button(name+'（'+bank.filter(q=>q.unit===id).length+'問）',"startUnit('"+id+"')")).join('')+
      button('学習履歴・正答率','showHistory()')+button('全単元 '+bank.length+'問','hardStart()')+button('25問模擬試験・75分','mockIntro()','primary')+
      (saved?button('中断した模擬試験を再開','resumeMock()'):'')+button('間違えた問題を復習（'+wrongIds().length+'問）','retry()'):
      button('記述問題 '+P.length+'問','startPractical()','primary')+button('実技の復習（'+practicalWrong().length+'問）','retryPractical()'))+'</div>');
  }
  function startPractice(items, kind='practice') {
    clearTimer();session={kind,items:shuffle(items),index:0,answers:Array(items.length).fill(null),finished:false,revealed:false};show();
  }
  function startUnit(id){startPractice(bank.filter(q=>q.unit===id));}
  function hardStart(){startPractice(bank);}
  function retry(){const ids=new Set(wrongIds());const items=bank.filter(q=>ids.has(q.id));if(!items.length){alert('復習対象はありません。');return;}startPractice(items);}
  function startPractical(){startPractice(P.map((q,i)=>({...q,id:'P'+i})),'practical');}
  function retryPractical(){const ids=new Set(practicalWrong());const items=P.map((q,i)=>({...q,id:'P'+i})).filter(q=>ids.has(q.id));if(!items.length){alert('実技の復習対象はありません。');return;}startPractice(items,'practical');}
  function mockIntro(){
    render('<div class="card">'+button('← 学習メニュー',"menu('w')")+'<h2>25問模擬試験</h2><p>基礎知識10問・消防関係法令5問・自衛消防業務10問を、300問から重複なしで抽出します。</p><p><b>制限時間：75分</b><br>回答は提出まで変更できます。提出後に採点と解説を表示します。時間切れでは未回答を不正解として自動提出します。</p><p class="muted">画面を離れても時間は進みます。途中経過を保存できる環境では、再読み込み後も続きから再開できます。</p>'+button('模擬試験を開始','hardMock()','primary')+'</div>');
  }
  function hardMock(){
    if(savedMock()&&!confirm('中断中の模擬試験を終了して、新しい模擬試験を開始しますか？'))return;
    const startedAt=Date.now();
    session={kind:'mock',items:makeMock(bank),answers:Array(25).fill(null),index:0,startedAt,deadline:startedAt+MOCK_MS,finished:false};
    saveMock();startTimer();show();
  }
  function resumeMock(){session=savedMock();if(!session){remove(KEYS.mock);menu('w');return;}startTimer();if(!checkTime())show();}
  function startTimer(){clearTimer();timer=setInterval(tick,500);}
  function checkTime(){if(session&&session.kind==='mock'&&!session.finished&&remainingSeconds(session.deadline)===0){finishMock(true);return true;}return false;}
  function tick(){if(checkTime())return;const el=document.getElementById('timer');if(el&&session){const s=remainingSeconds(session.deadline);el.textContent='残り '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');el.className='timer'+(s<=300?' urgent':'');}}
  function leave(){
    if(session?.kind==='mock'&&!session.finished){saveMock();menu('w');}
    else if(!session||session.finished||confirm('学習を終了してメニューに戻りますか？ 回答済みの復習履歴は保存されます。'))menu(session?.kind==='practical'?'p':'w');
  }
  function show(){
    if(!session||session.finished)return;
    if(checkTime())return;
    const {items,index,kind,answers}=session;
    if(index>=items.length){finishPractice();return;}
    const q=items[index];
    let html='<div class="card">'+button(kind==='mock'?'← 中断してメニューへ':'← 学習メニュー','leave()')+
      '<div class="toolbar"><p class="muted">第'+(index+1)+'問 / '+items.length+'問</p>'+(kind==='mock'?'<span id="timer" class="timer" role="timer"></span>':'')+'</div>'+
      '<div class="progress" aria-hidden="true"><div style="width:'+100*index/items.length+'%"></div></div>'+
      (q.c?'<p class="badge">'+esc(q.c)+' ｜ '+esc(q.id)+'</p>':'')+'<h2>'+esc(q.q)+'</h2><div id="choices">';
    if(kind==='practical')html+='<label class="sr-only" for="written-answer">自分の解答</label><textarea id="written-answer" placeholder="ここに自分の解答を入力してください"></textarea>'+button('模範解答を見る','reveal()','primary');
    else html+=q.a.map((a,i)=>button('ABCD'[i]+'. '+a,'choose('+i+')',kind==='mock'&&answers[index]===i?'selected':'',kind==='mock'?'aria-pressed="'+(answers[index]===i)+'"':'')).join('');
    html+='</div><div id="result"></div>';
    if(kind==='mock')html+='<div class="toolbar">'+button('← 前の問題','move(-1)','',index===0?'disabled':'')+button('次の問題 →','move(1)','',index===24?'disabled':'')+'</div><p>回答済み '+answers.filter(a=>a!==null).length+' / 25問</p><details><summary>問題一覧から移動</summary><div class="numbers">'+items.map((_,i)=>button('問'+(i+1)+(answers[i]!==null?' ✓':''),'jump('+i+')',(answers[i]!==null?'done ':'')+(index===i?'current':''),'aria-label="問'+(i+1)+(answers[i]!==null?' 回答済み':' 未回答')+'"')).join('')+'</div></details>'+button('解答を提出して採点','submitMock()','primary');
    render(html+'</div>');tick();
  }
  function choose(i){
    if(!session||session.finished||!Number.isInteger(i)||i<0||i>3||session.kind==='practical')return;
    if(checkTime())return;
    const q=session.items[session.index];
    if(session.kind==='mock'){session.answers[session.index]=i;saveMock();show();return;}
    if(session.answers[session.index]!==null)return;
    session.answers[session.index]=i;
    const ok=i===q.k;record(q,ok);
    document.getElementById('choices').innerHTML=q.a.map((a,j)=>button('ABCD'[j]+'. '+a,'',j===q.k?'correct':j===i?'incorrect':'','disabled')).join('');
    document.getElementById('result').innerHTML='<div class="card '+(ok?'correct':'incorrect')+'"><b>'+(ok?'正解':'不正解　正解：'+'ABCD'[q.k])+'</b>'+explanation(q)+'</div>'+button(session.index===session.items.length-1?'学習結果を見る':'次の問題へ →','next()','primary');
  }
  function next(){if(!session||session.finished||session.kind==='mock'||session.answers[session.index]===null)return;session.index++;session.revealed=false;show();}
  function reveal(){if(!session||session.kind!=='practical'||session.revealed)return;session.revealed=true;const q=session.items[session.index];document.getElementById('result').innerHTML='<div class="card correct"><b>模範解答例</b><p>'+esc(q.a)+'</p><b>確認ポイント</b><p>'+esc(q.p)+'</p><small>公式の採点基準ではありません。</small></div>'+button('理解できた','mark(true)','primary')+button('復習が必要','mark(false)');}
  function mark(ok){if(!session||session.kind!=='practical'||!session.revealed||session.answers[session.index]!==null)return;const q=session.items[session.index];session.answers[session.index]=ok?1:0;const ids=new Set(practicalWrong());if(ok)ids.delete(q.id);else ids.add(q.id);write(KEYS.practical,[...ids]);next();}
  function finishPractice(){clearTimer();session.finished=true;const practical=session.kind==='practical';const score=practical?session.answers.filter(a=>a===1).length:scoreAnswers(session.items,session.answers);render('<div class="card"><h2>学習完了</h2><h1>'+score+' / '+session.items.length+'</h1><p>'+ (practical?'理解できた問題数です。集合実技は自己評価です。':'正解した問題数です。間違えた問題は復習メニューから解き直せます。')+'</p>'+button('別の問題を解く',"menu('"+(practical?'p':'w')+"')",'primary')+button('トップへ','home()')+'</div>');}
  function jump(index){if(!session||session.kind!=='mock'||session.finished||checkTime())return;if(index<0||index>24)return;session.index=index;saveMock();show();}
  function move(delta){if(session)jump(session.index+delta);}
  function submitMock(){if(!session||session.kind!=='mock'||session.finished||checkTime())return;const unanswered=session.answers.filter(a=>a===null).length;if(confirm((unanswered?'未回答が'+unanswered+'問あります。':'全25問に回答しました。')+'提出して採点しますか？'))finishMock(false);}
  function finishMock(expired){
    if(!session||session.kind!=='mock'||session.finished)return;
    clearTimer();session.finished=true;remove(KEYS.mock);
    const total=scoreAnswers(session.items,session.answers);
    session.items.forEach((q,i)=>record(q,session.answers[i]===q.k));
    const rows=[['基礎知識','基礎'],['消防関係法令','法令'],['自衛消防業務','実務']].map(([label,c])=>{const pairs=session.items.map((q,i)=>[q,session.answers[i]]).filter(([q])=>q.c===c);return '<li>'+label+'：'+pairs.filter(([q,a])=>a===q.k).length+' / '+pairs.length+'</li>';}).join('');
    render('<div class="card"><h2>模擬試験の結果</h2>'+(expired?'<p>75分が経過したため、自動提出しました。</p>':'')+'<h1>'+total+' / 25</h1><ul>'+rows+'</ul><p class="muted">この結果は学習用の得点です。公式の合否判定ではありません。</p>'+button('学習メニューへ',"menu('w')",'primary')+'<h2>解答と解説</h2>'+session.items.map((q,i)=>{const a=session.answers[i],ok=a===q.k;return '<section class="result-question"><span class="badge">問'+(i+1)+' ｜ '+esc(q.id)+'</span><h3>'+esc(q.q)+'</h3><p class="'+(ok?'correct':'incorrect')+'">'+(a===null?'未回答':'あなたの解答：'+'ABCD'[a])+' ／ 正解：'+'ABCD'[q.k]+'</p><ol type="A" class="answer-list">'+q.a.map((text,j)=>'<li class="'+(j===q.k?'correct':'')+'">'+esc(text)+'</li>').join('')+'</ol>'+explanation(q)+'</section>';}).join('')+button('学習メニューへ',"menu('w')",'primary')+'</div>');
  }
  Object.assign(window,{home,menu,showHistory,startUnit,hardStart,retry,startPractical,retryPractical,mockIntro,hardMock,resumeMock,leave,choose,next,reveal,mark,jump,move,submitMock});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
  window.addEventListener('pageshow',tick);
  window.addEventListener('pagehide',saveMock);
  try{validateBank(bank);home();}catch(error){render('<div class="card"><h2>問題を読み込めませんでした</h2><p>'+esc(error.message)+'</p><p>通信を確認して、画面を再読み込みしてください。</p>'+button('再読み込み','location.reload()','primary')+'</div>');}
  // Remove only an obsolete worker registered for this app; other apps keep their caches.
  if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(registrations=>{
    const appPath=new URL('./',location.href).pathname;
    for(const registration of registrations)if(new URL(registration.scope).pathname===appPath)registration.unregister();
  }).catch(()=>{});
}
