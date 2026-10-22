import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {MongoClient} from 'mongodb';
const snapshot=JSON.parse(await readFile(new URL('../data/archive.json',import.meta.url),'utf8'));
const record=snapshot.find(x=>x.id==='manual-collector-team-project');
if(!record||!process.env.MONGODB_URI)throw new Error('ACTIVITY_UPDATE_NOT_CONFIGURED');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
try{
 await client.connect();const collection=client.db(process.env.MONGODB_DB||'iljae_portfolio').collection('activities');
 const previous=await collection.findOne({id:record.id});
 if(previous){await mkdir('work',{recursive:true});await writeFile('work/trustgate-activity-before.json',JSON.stringify(previous,null,2));}
 const result=await collection.updateOne({id:record.id},{$set:{title:record.title,summary:record.summary,tags:record.tags},$setOnInsert:{...Object.fromEntries(Object.entries(record).filter(([key])=>!['title','summary','tags'].includes(key))),published:true}},{upsert:true});
 console.log(JSON.stringify({id:record.id,matched:result.matchedCount,modified:result.modifiedCount,inserted:result.upsertedCount}));
}finally{await client.close();}
