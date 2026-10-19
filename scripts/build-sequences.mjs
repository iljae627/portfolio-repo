import sharp from 'sharp';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SEQUENCE_FRAMES,SEQUENCE_WIDTH as W,SEQUENCE_HEIGHT as H,SEQUENCE_VERSION,sceneKinds,sequencePose,compactPose,sequenceVersions} from '../lib/image-sequence.mjs';
sharp.concurrency(2);sharp.cache({memory:64,files:20,items:60});
const root=`public/sequences/${SEQUENCE_VERSION}`;
const requested=process.argv.slice(2),kinds=requested.length?requested:sceneKinds.filter(kind=>sequenceVersions[kind]===SEQUENCE_VERSION);
const extracted={};
const rectangles={fuzzing:[[0,0,750,510],[770,0,375,510],[1155,0,381,510],[0,535,565,460],[640,555,340,410],[1015,530,521,470]],forensics:[[0,0,535,510],[530,0,535,510],[1055,0,481,510],[0,512,512,512],[512,512,512,512],[1024,512,512,512],[125,615,110,150],[130,615,95,57]],android:[[0,0,510,615],[512,0,510,615],[1024,0,512,610],[0,620,510,404],[512,620,510,404],[1024,620,512,404]]};
for(const kind of kinds){
 const input=await fs.readFile(`public/images/sequence-sources/${kind}-atlas.png`);
 const cells=rectangles[kind]||Array.from({length:6},(_,i)=>[i%3*512,Math.floor(i/3)*512,512,512]);
 extracted[kind]=await Promise.all(cells.map(async ([left,top,width,height],cell)=>{
  const {data,info}=await sharp(input).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Clean almost transparent edge noise before the mechanical cell trim.
  for(let i=3;i<data.length;i+=4)if(data[i]<10)data[i]=0;
  if(kind==='forensics'&&cell<3){
   const visited=new Uint8Array(width*height),stack=new Int32Array(width*height);let largest=[];
   for(let seed=0;seed<visited.length;seed++){
    if(visited[seed]||data[seed*4+3]<15)continue;
    let length=1,head=0;stack[0]=seed;visited[seed]=1;
    while(head<length){const index=stack[head++],x=index%width,y=Math.floor(index/width);
     for(const next of [x?index-1:-1,x<width-1?index+1:-1,y?index-width:-1,y<height-1?index+width:-1])if(next>=0&&!visited[next]&&data[next*4+3]>=15){visited[next]=1;stack[length++]=next;}
    }
    if(length>largest.length)largest=stack.slice(0,length);
   }
   const keep=new Uint8Array(width*height);for(const index of largest)keep[index]=1;
   for(let i=0;i<keep.length;i++)if(!keep[i])data[i*4+3]=0;
  }

  return sharp(data,{raw:info}).trim({threshold:8}).png().toBuffer();
 }));
}
const shadow=await sharp(Buffer.from(`<svg width="${W}" height="${H}"><defs><radialGradient id="s"><stop stop-color="#65563e" stop-opacity=".18"/><stop offset="1" stop-color="#65563e" stop-opacity="0"/></radialGradient></defs><ellipse cx="640" cy="735" rx="470" ry="55" fill="url(#s)"/></svg>`)).png().toBuffer();
const manifest={version:SEQUENCE_VERSION,count:SEQUENCE_FRAMES,width:W,height:H,scenes:{},method:'AI-generated photographic cutout assets composited into deterministic raster frames; no runtime 3D'};
for(const kind of kinds){
 await fs.mkdir(`${root}/${kind}/small`,{recursive:true});
 const cache=new Map();
 async function layer(part){
  const key=[part.cell,Math.round(part.w),Math.round(part.h),part.angle.toFixed(1),part.alpha.toFixed(2)].join(':');
  if(cache.has(key))return cache.get(key);
  const promise=(async()=>{
   let img=sharp(extracted[kind][part.cell]).resize(Math.round(part.w),Math.round(part.h),{fit:kind==='forensics'&&part.cell<2?'fill':'contain',background:'#00000000'});
   if(Math.abs(part.angle)>.01)img=img.rotate(part.angle,{background:'#00000000'});
   let {data,info}=await img.ensureAlpha().raw().toBuffer({resolveWithObject:true});
   if(part.alpha<1)for(let i=3;i<data.length;i+=4)data[i]=Math.round(data[i]*part.alpha);
   return {input:await sharp(data,{raw:info}).png().toBuffer(),width:info.width,height:info.height};
  })();cache.set(key,promise);if(cache.size>200)cache.delete(cache.keys().next().value);return promise;
 }
 let bytes=0;
 for(let frame=0;frame<SEQUENCE_FRAMES;frame++){
  const overlays=[{input:shadow,left:0,top:0}];
  for(const part of sequencePose(kind,frame).parts){
   if(part.alpha<.001)continue;
   const l=await layer(part);let left=Math.round(part.x-l.width/2),top=Math.round(part.y-l.height/2);
   const x=Math.max(0,-left),y=Math.max(0,-top),width=Math.min(l.width-x,W-Math.max(0,left)),height=Math.min(l.height-y,H-Math.max(0,top));
   if(width<=0||height<=0)continue;
   const input=x||y||width!==l.width||height!==l.height?await sharp(l.input).extract({left:x,top:y,width,height}).png().toBuffer():l.input;
   overlays.push({input,left:Math.max(0,left),top:Math.max(0,top)});
  }
  const buffer=await sharp({create:{width:W,height:H,channels:4,background:'#00000000'}}).composite(overlays).webp({quality:83,alphaQuality:95,effort:2}).toBuffer();
  const name=String(frame).padStart(3,'0')+'.webp';
  const mobile=[];
  for(const part of compactPose(sequencePose(kind,frame)).parts){
   if(part.alpha<.001)continue;
   const l=await layer(part);let left=Math.round(part.x-l.width/2),top=Math.round(part.y-l.height/2);
   const x=Math.max(0,-left),y=Math.max(0,-top),width=Math.min(l.width-x,640-Math.max(0,left)),height=Math.min(l.height-y,832-Math.max(0,top));
   if(width<=0||height<=0)continue;
   const input=x||y||width!==l.width||height!==l.height?await sharp(l.input).extract({left:x,top:y,width,height}).png().toBuffer():l.input;
   mobile.push({input,left:Math.max(0,left),top:Math.max(0,top)});
  }
  const small=await sharp({create:{width:640,height:832,channels:4,background:'#00000000'}}).composite(mobile).webp({quality:78,alphaQuality:90,effort:2}).toBuffer();
  await Promise.all([fs.writeFile(`${root}/${kind}/${name}`,buffer),fs.writeFile(`${root}/${kind}/small/${name}`,small)]);bytes+=buffer.length+small.length;
  if(frame%60===0)console.log(kind,frame+'/'+SEQUENCE_FRAMES);
 }
 manifest.scenes[kind]={bytes,sourceSha256:createHash('sha256').update(await fs.readFile(`public/images/sequence-sources/${kind}-atlas.png`)).digest('hex')};
 console.log(kind,'complete',Math.round(bytes/1024/1024*10)/10+'MB');
}
await fs.mkdir(root,{recursive:true});
let previous={scenes:{}};try{previous=JSON.parse(await fs.readFile(`${root}/manifest.json`,'utf8'));}catch{}
manifest.scenes={...previous.scenes,...manifest.scenes};
await fs.writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
