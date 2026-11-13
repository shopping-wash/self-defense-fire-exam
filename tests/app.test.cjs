'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../app.js');
const fixtureMode = process.argv.includes('--fixtures');
const repo = path.resolve(__dirname,'..');
function loadBank() {
  if(fixtureMode)return Array.from({length:300},(_,i)=>({id:'TEST-'+i,c:i<120?'基礎':i<180?'法令':'実務',unit:i<60?'fire':i<120?'building':i<180?'law':i<230?'activity':i<275?'equipment':'facilities',q:'TEST ONLY '+i,a:['一','二','三','四'],k:i%4,e:'TEST ONLY',reference:'TEST ONLY',source:'https://example.com',concept:'TEST ONLY '+i,optionExplanations:['選択肢Aの検証理由','選択肢Bの検証理由','選択肢Cの検証理由','選択肢Dの検証理由'],difficulty:'標準'}));
  const context={}; vm.createContext(context); vm.runInContext(fs.readFileSync(path.join(repo,'questions.js'),'utf8')+'\nthis.bank = HARD;',context);return JSON.parse(JSON.stringify(context.bank));
}
const bank=loadBank();
assert.equal(core.validateBank(bank),true);
assert.equal(core.P.length,15,'All original practical questions are retained');
for(const unit of core.UNITS)assert(bank.some(q=>q.unit===unit[1]),unit[0]);
for(const q of bank) {
  for(let answer=0;answer<4;answer++)assert.equal(core.scoreAnswers([q],[answer]),Number(answer===q.k),q.id);
  assert.equal(core.scoreAnswers([q],[null]),0,q.id+' unanswered');
}
assert.equal(core.scoreAnswers(bank,bank.map(q=>q.k)),300);
assert.equal(core.scoreAnswers(bank,bank.map(q=>(q.k+1)%4)),0);
let seed=246813579;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const observed=new Set();
for(let run=0;run<1000;run++) {
  const mock=core.makeMock(bank,random);
  assert.equal(mock.length,25);assert.equal(new Set(mock.map(q=>q.id)).size,25);
  for(const [c,n] of [['基礎',10],['法令',5],['実務',10]])assert.equal(mock.filter(q=>q.c===c).length,n);
  mock.forEach(q=>observed.add(q.id));
}
assert.equal(observed.size,300,'Sampling reaches every question');
assert.equal(core.remainingSeconds(4500000,0),4500);
assert.equal(core.remainingSeconds(4500000,4499999),1);
assert.equal(core.remainingSeconds(4500000,4500000),0);
assert.equal(core.remainingSeconds(4500000,9000000),0);
assert.deepEqual(core.normalizedIds(['a','a',0,null,'unknown','b'],['a','b']),['a','b']);
assert.deepEqual(core.normalizedIds({a:1},['a']),[]);
const mock=core.makeMock(bank,random);
const raw={version:2,ids:mock.map(q=>q.id),answers:Array(25).fill(null),index:14,startedAt:1000,deadline:4501000};
assert.equal(core.restoreMock(raw,bank,2000).index,14);
assert.equal(core.restoreMock(raw,bank,5000000).deadline,4501000,'Expired mock keeps original deadline');
for(const change of [{ids:Array(25).fill(mock[0].id)},{answers:[4,...Array(24).fill(null)]},{deadline:4502000},{version:1},{ids:['unknown',...raw.ids.slice(1)]}])assert.equal(core.restoreMock({...raw,...change},bank,2000),null);
// Exercise the browser handlers with a controlled clock and storage, including recovery and timeout.
function browserHarness({stored={},blocked=false}={}) {
  let now=1000;
  const nodes=new Map();
  function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',className:''});return nodes.get(id);}
  const callbacks=[];
  const writes={...stored};
  class Clock extends Date{static now(){return now;}}
  const context={HARD:bank,console,URL,Date:Clock,Math,Set,Map,JSON,Number,String,Array,Object,
    document:{getElementById:node,addEventListener(){},hidden:false},navigator:{},
    location:{href:'https://shopping-wash.github.io/self-defense-fire-exam/',reload(){}},
    localStorage:{getItem(k){if(blocked)throw Error('blocked');return writes[k]??null;},setItem(k,v){if(blocked)throw Error('blocked');writes[k]=v;},removeItem(k){if(blocked)throw Error('blocked');delete writes[k];}},
    setInterval(f){callbacks.push(f);return callbacks.length;},clearInterval(){},alert(){},confirm(){return true;},
    scrollTo(){},addEventListener(){}};
  context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(repo,'app.js'),'utf8'),context);
  return {context,nodes,writes,node,setNow(t){now=t;},tick(){callbacks.forEach(f=>f());},call(s){return vm.runInContext(s,context);}};
}
let h=browserHarness();assert(h.node('app').innerHTML.includes('300'));
h.call("startUnit('law')");assert(h.node('app').innerHTML.includes('/ 60問'));
h.call('choose(0)');const firstFeedback=h.node('result').innerHTML;assert(firstFeedback.includes('根拠'));assert(firstFeedback.includes('公式資料を開く'));
if(bank[0].optionExplanations)assert(firstFeedback.includes('選択肢ごとの解説'));
if(bank[0].difficulty)assert(firstFeedback.includes('難易度（編集上の目安）'));
h.call('choose(1)');assert.equal(h.node('result').innerHTML,firstFeedback,'Double clicks cannot replace grade');
assert.equal(Object.values(JSON.parse(h.writes[core.KEYS.history]).questions).reduce((n,x)=>n+x.attempts,0),1,'Double click counts once');
h.call('next()');assert(h.node('app').innerHTML.includes('第2問'));
h.call('hardMock()');let saved=JSON.parse(h.writes[core.KEYS.mock]);assert.equal(saved.ids.length,25);assert.equal(saved.deadline,4501000);
h.call('choose(0)');assert.equal(JSON.parse(h.writes[core.KEYS.mock]).answers[0],0);
h.call('choose(2)');assert.equal(JSON.parse(h.writes[core.KEYS.mock]).answers[0],2,'Mock choices can change before submission');
h.call('jump(24)');assert.equal(JSON.parse(h.writes[core.KEYS.mock]).index,24);
h.call('leave()');h.setNow(5000000);h.call('resumeMock()');assert(h.node('app').innerHTML.includes('自動提出'));assert(!h.writes[core.KEYS.mock]);
assert.equal(Object.values(JSON.parse(h.writes[core.KEYS.history]).questions).reduce((n,x)=>n+x.attempts,0),26,'Practice plus submitted mock counted');
assert.equal((h.node('app').innerHTML.match(/class="result-question"/g)||[]).length,25);
h.call('showHistory()');assert(h.node('app').innerHTML.includes('累計正答率'));assert(h.node('app').innerHTML.includes('延べ 26回答'));
h.call('startPractical()');assert(h.node('app').innerHTML.includes('textarea'));h.call('reveal()');assert(h.node('result').innerHTML.includes('模範解答例'));h.call('mark(false)');assert.equal(JSON.parse(h.writes[core.KEYS.practical]).length,1);
h=browserHarness({blocked:true});h.call('hardMock()');h.call('choose(1)');h.call('leave()');assert(h.node('app').innerHTML.includes('中断した模擬試験'));h.call('resumeMock()');assert(h.node('app').innerHTML.includes('第1問'));h.call('submitMock()');assert(h.node('app').innerHTML.includes('模擬試験の結果'));h.call("menu('w')");assert(!h.node('app').innerHTML.includes('中断した模擬試験'));
h=browserHarness({stored:{[core.KEYS.wrong]:'{broken JSON',[core.KEYS.mock]:'null'}});h.call('retry()');assert(h.node('app').innerHTML.includes('学習する試験'));
console.log(JSON.stringify({mode:fixtureMode?'development fixtures only':'production bank',questions:bank.length,practical:core.P.length,answerChecks:1200,randomMocks:1000,questionsObserved:observed.size,checks:['six units','unique mock IDs','10/5/10 allocation','75 minute deadline','resume expired mock','source rendering','double-grade guard','practical learning/review','storage blocked','corrupt storage','history cumulative totals','history double-count guard']},null,2));
