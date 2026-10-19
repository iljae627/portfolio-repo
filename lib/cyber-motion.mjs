export const CYBER_FRAMES=720;
export const clamp=value=>Math.min(1,Math.max(0,Number.isFinite(value)?value:0));
export function phase(p,start,end){const t=clamp((p-start)/(end-start));return t*t*(3-2*t);}
export function cyberPose(kind,value,reduced=false){
 const frame=reduced?0:Math.round(clamp(value)*CYBER_FRAMES),p=frame/CYBER_FRAMES;
 const attack=kind==='web'?phase(p,.2,.72):0;
 return {frame,progress:p,attack,modified:phase(p,.54,.85),trace:Math.floor(p*15),rain:p*2400,
  slices:Array.from({length:8},(_,i)=>Math.sin(p*65+i*3.7)*Math.sin(p*21+i)*attack*(i%3===0?46:22)),
  status:p<.25?'200 OK':p<.6?'UNTRUSTED INPUT':'PAGE MODIFIED'};
}
const glyphs='0123456789ABCDEFmovraxrbppushcallretjnecmpxor';
export function rainGlyph(column,row){return glyphs[(column*17+row*11)%glyphs.length];}
export function rainHead(column,progress,height){return ((column*137+progress*(height+1400)*(.55+(column%7)*.11))%(height+450))-180;}
