import assert from 'node:assert/strict';
import test from 'node:test';
import {action,nextStatus,NODES} from '../lib/network/policy.mjs';
const id='123e4567-e89b-42d3-a456-426614174000';
test('network writes normalize a bounded request and reject unknown node/category',()=>{
 const base={type:'request',id,node:'school',name:' Demo family ',people:4,location:' Home 04 ',category:'water',message:' Water request '};
 const result=action(base);assert.equal(result.name,'Demo family');assert.equal(result.location,'Home 04');assert.equal(result.message,'Water request');
 assert.throws(()=>action({...base,node:'made-up'}));assert.throws(()=>action({...base,category:'arbitrary'}));
});
test('check-ins require real count bounds and valid operation identifiers',()=>{
 const base={type:'checkin',id,node:'hill',name:'Demo',people:2,location:'Shelter'};
 assert.equal(action(base).people,2);for(const people of [0,100,1.5,NaN])assert.throws(()=>action({...base,people}));
 assert.throws(()=>action({...base,id:'not-a-uuid'}));assert.throws(()=>action({...base,name:'x'.repeat(61)}));
});
test('message and update actions only accept bounded known forms',()=>{
 assert.equal(action({type:'message',id,node:'health',name:'Coordinator',message:'Confirmed exercise update'}).type,'message');
 assert.throws(()=>action({type:'message',id,node:'health',name:'Coordinator',message:'x'.repeat(801)}));
 assert.throws(()=>action({type:'update',id,node:'school',requestId:id,status:'received'}));
 assert.equal(nextStatus('received'),'acknowledged');assert.equal(nextStatus('assigned'),'completed');assert.equal(nextStatus('completed'),null);assert.equal(NODES.length,4);
});
