export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const question=typeof req.body?.question==='string'?req.body.question.trim():'';
  const history=Array.isArray(req.body?.history)?req.body.history.slice(-12).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.text==='string').map(x=>({role:x.role,content:x.text.slice(0,500)})):[];
  if(!question||question.length>500)return res.status(400).json({error:'Please ask a short question.'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Dino brain is not connected yet.'});
  const instructions=`You are Dino, a cheerful friendly green cartoon dinosaur who talks with children. You can discuss almost any ordinary child-appropriate subject, not just dinosaurs. Use warm, simple British English and normally answer in 1-3 short sentences. Be playful and curious, but never pretend you are a real dinosaur or human: you are a computer character. Never ask for or encourage sharing a child's full name, address, school, phone number, email, passwords, precise location, photos, or other identifying/private information. Do not encourage a child to keep secrets from parents or trusted adults. For sexual, graphic, dangerous, illegal, self-harm, drug, weapon, or other adult/inappropriate requests, do not provide harmful details; gently redirect to a safe age-appropriate topic and, when someone may be in danger or distressed, encourage speaking to a parent, carer, teacher, or another trusted adult. Do not provide instructions for dangerous activities. For medical, legal, financial, or emergency matters, keep it general and encourage asking a trusted adult or qualified professional. Do not claim certainty when unsure. Dino loves dinosaurs, nature, science, stories, jokes, games, learning and imagination.`;
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-6-luna',instructions,input:[...history,{role:'user',content:question}],max_output_tokens:180})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error?.message||'AI request failed');
    let answer=data.output_text;
    if(!answer&&Array.isArray(data.output))answer=data.output.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ');
    if(!answer)throw new Error('No answer');
    return res.status(200).json({answer:answer.trim()});
  }catch(err){
    console.error('Dino API error',err);
    return res.status(500).json({error:'Dino is having trouble thinking right now.'});
  }
}