export const SEQUENCE_FRAMES=240;
export const SEQUENCE_WIDTH=1280;
export const SEQUENCE_HEIGHT=832;
export const SEQUENCE_VERSION='studio-raster-v3';
export const sequenceVersions={forensics:SEQUENCE_VERSION,android:SEQUENCE_VERSION,fuzzing:'studio-raster-v2'};
export const HDD_SCREW_HOLES=[[318,402],[651,323],[779,445],[922,582],[550,673],[433,536]];
export const sceneKinds=['forensics','android','fuzzing'];
const clamp=n=>Math.min(1,Math.max(0,Number.isFinite(n)?n:0));
const ease=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
export function frameIndex(p){return Math.round(clamp(p)*(SEQUENCE_FRAMES-1));}
export function frameURL(kind,frame,small=false){return `/sequences/${sequenceVersions[kind]||SEQUENCE_VERSION}/${kind}/${small?'small/':''}${String(Math.max(0,Math.min(SEQUENCE_FRAMES-1,Math.round(frame)))).padStart(3,'0')}.webp`;}

// A shared layout drives offline image compositing and the interactive hit regions.
// The browser never reconstructs a mesh or deforms the generated photographs.
export function sequencePose(kind,frame){
 const p=frameIndex(frame/(SEQUENCE_FRAMES-1))/(SEQUENCE_FRAMES-1);
 const open=ease(p,.08,.55),lift=ease(p,.42,.82),arrive=ease(p,.5,.8),spread=ease(p,.55,.98);
 const parts=[];
 const add=(key,cell,x,y,w,h,study='',angle=0,alpha=1)=>parts.push({key,cell,x,y,w,h,study,angle,alpha});
 if(kind==='forensics'){
  const opening=ease(p,.4,.68),unscrew=ease(p,.01,.16),park=ease(p,.16,.4),lensArrival=ease(p,.7,.98);
  add('drive',0,620,510,660,390,'forensics-files');
  add('cover',1,620-opening*270,505-opening*245,660-opening*160,390-opening*150,'forensics-logs',-opening*18);
  for(const [i,[x,y]] of HDD_SCREW_HOLES.entries()){
   add('screw-head-'+i,7,x,y,18,13,'',0,1-unscrew);
   add('screw-'+i,6,x+(185+i*35-x)*park,y+10-unscrew*70+(420+i*25-y)*park,18,30,'',park*-30,unscrew);
  }
  add('lens',2,1460-lensArrival*560,580-lensArrival*130,350,350,'forensics-cloud',-lensArrival*8,lensArrival);
 }else if(kind==='android'){
  add('phone',0,690+open*40,510,350,590,'android-runtime');
  add('screen',1,688-open*340,510+open*35,350,590,'android-static',-open*5);
  add('robot',4,1025,650-arrive*40,190,225,'android-track');
 }else if(kind==='fuzzing'){
  add('case',0,630,550,600,430,'fuzzing-mutation');
  add('left-cap',1,445-open*230,550,190,320,'fuzzing-input',-open*6);
  add('right-cap',2,815+open*240,550,200,320,'fuzzing-crash',open*6);
  add('corpus',3,630,555,340,225,'fuzzing-mutation');
  add('candidate',4,630+spread*215,540-lift*235,65+lift*20,65+lift*20,'fuzzing-crash',-lift*15);
 }
 return {frame:frameIndex(p),progress:p,parts};
}

export function compactPose(pose){return {...pose,parts:pose.parts.map(p=>({...p,x:320+(p.x-640)*.52,y:440+(p.y-416)*.88,w:p.w*.72,h:p.h*.72}))};}
export function imageFit(width,height,small=false){
 const w=small?640:SEQUENCE_WIDTH,h=SEQUENCE_HEIGHT;
 const scale=Math.min(width/w,height/h);
 return {scale,x:(width-w*scale)/2,y:(height-h*scale)/2};
}
export function partRegion(part,fit){
 return {x:fit.x+(part.x-part.w/2)*fit.scale,y:fit.y+(part.y-part.h/2)*fit.scale,width:part.w*fit.scale,height:part.h*fit.scale};
}
