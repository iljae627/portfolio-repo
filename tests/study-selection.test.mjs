import test from 'node:test';
import assert from 'node:assert/strict';
import {selectStudy,nearStudy} from '../lib/study-selection.mjs';
const region={box:{x:100,y:200,width:120,height:90},line:[{x:160,y:200},{x:160,y:80},{x:500,y:80}],card:{x:470,y:50,width:230,height:90}};
test('hover stays on the part, outline, connector and clickable card, then closes outside',()=>{
 for(const point of [{x:110,y:220},{x:85,y:220},{x:165,y:150},{x:350,y:90},{x:510,y:100}]){
  assert.equal(nearStudy(point,region),true);
  assert.equal(selectStudy({selected:'disk',near:nearStudy(point,region)}),'disk');
 }
 assert.equal(nearStudy({x:350,y:300},region),false);
 assert.equal(selectStudy({selected:'disk',near:false}),'');
 assert.equal(nearStudy(null,region),false);
});
test('leaving a part does not retain a stale card; another part can open',()=>{
 assert.equal(selectStudy({hovered:'disk'}),'disk');
 assert.equal(selectStudy({selected:'disk'}),'');
 assert.equal(selectStudy({selected:'disk',hovered:'memory'}),'memory');
});

test('VM connector crossing the debugger keeps the original card until leaving the corridor',()=>{
 assert.equal(selectStudy({selected:'vm',hovered:'debugger',near:true,onConnector:true}),'vm');
 assert.equal(selectStudy({selected:'vm',hovered:'debugger',near:false,onConnector:false}),'debugger');
 assert.equal(selectStudy({selected:'vm',near:false,onConnector:false}),'');
});
test('keyboard focus and explicit touch toggle keep links usable; close always wins',()=>{
 assert.equal(selectStudy({selected:'disk',pinned:true}),'disk');
 assert.equal(selectStudy({manual:true},'memory'),'memory');
 assert.equal(selectStudy({selected:'disk',dismissed:true,manual:true,pinned:true}),'');
});
test('connector tolerance covers corners and zero length segments without broad empty hit areas',()=>{
 assert.equal(nearStudy({x:175,y:65},region),true);
 assert.equal(nearStudy({x:300,y:140},region),false);
 assert.equal(nearStudy({x:5,y:5},{line:[{x:0,y:0},{x:0,y:0}]}),true);
});
