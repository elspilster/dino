export const config={api:{bodyParser:false}};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Dino is not connected yet.'});
 try{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const audio=Buffer.concat(chunks);
  if(!audio.length||audio.length>8*1024*1024)return res.status(400).json({error:'Audio is missing or too long.'});
  const mime=(req.headers['content-type']||'audio/webm').split(';')[0];
  const ext=mime.includes('mp4')?'m4a':mime.includes('ogg')?'ogg':mime.includes('wav')?'wav':'webm';
  const form=new FormData();form.append('file',new Blob([audio],{type:mime}),'dino.'+ext);form.append('model','gpt-4o-mini-transcribe');form.append('language','en');
  const r=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form});
  const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'Transcription failed');
  const text=(data.text||'').trim();if(!text)return res.status(422).json({error:'No speech heard'});
  return res.status(200).json({text});
 }catch(err){console.error('Dino transcription error',err);return res.status(500).json({error:'Dino could not hear that.'})}
}