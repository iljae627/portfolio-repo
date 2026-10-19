import test from 'node:test';
import assert from 'node:assert/strict';
import {selectStudy} from '../lib/study-selection.mjs';
test('study survives the empty space between a model and its link card',()=>{
 let selected=selectStudy({hovered:'fuzzing-crash'});
 for(let i=0;i<100;i++)selected=selectStudy({selected,hovered:''});
 assert.equal(selected,'fuzzing-crash');
 assert.equal(selectStudy({selected,pinned:true,hovered:'fuzzing-input'}),selected);
 assert.equal(selectStudy({selected,hovered:'fuzzing-input'}),'fuzzing-input');
});
test('close and Escape dismiss a study, while the toggle can reopen it',()=>{
 assert.equal(selectStudy({selected:'fuzzing-crash',dismissed:true}),'');
 assert.equal(selectStudy({selected:'fuzzing-crash',dismissed:true,manual:true}),'');
 assert.equal(selectStudy({manual:true},'fuzzing-mutation'),'fuzzing-mutation');
});
