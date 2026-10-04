const CLOSED='/imageedit_5_4382849772.png',OPEN='/imageedit_2_5015191276.png';const dino=document.querySelector('#dino'),bubble=document.querySelector('#bubble'),status=document.querySelector('#status'),talk=document.querySelector('#talk');const facts=["Tyrannosaurus rex had teeth as long as bananas!","Some dinosaurs had feathers, a bit like birds.","The name Triceratops means three-horned face.","Dinosaurs lived on Earth for more than 160 million years.","Stegosaurus had huge plates along its back.","Birds are the living descendants of dinosaurs!"];let mouthTimer;function animateMouth(on){clearInterval(mouthTimer);if(!on){dino.src=CLOSED;return}let open=false;mouthTimer=setInterval(()=>{open=!open;dino.src=open?OPEN:CLOSED},180)}let dinoVoice=null;function loadDinoVoice(){const voices=speechSynthesis.getVoices();dinoVoice=voices.find(v=>v.name==='Google UK English Male')||voices.find(v=>/Google UK English Male/i.test(v.name))||voices.find(v=>/^en-GB$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;return dinoVoice}loadDinoVoice();speechSynthesis.addEventListener('voiceschanged',loadDinoVoice);function chooseDinoVoice(){return dinoVoice||loadDinoVoice()}function speechText(text){return text
 .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu,'')
 .replace(/[*#_~`|<>^=]+/g,' ')
 .replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1')
 .replace(/[{}\[\]\\/]+/g,' ')
 .replace(/&/g,' and ')
 .replace(/\s{2,}/g,' ').trim()}function speak(text,displayText=text){speechSynthesis.cancel();bubble.textContent=displayText;const u=new SpeechSynthesisUtterance(speechText(text));const voice=chooseDinoVoice();if(voice)u.voice=voice;u.rate=.92;u.pitch=1;u.volume=1;u.onstart=()=>{status.textContent='Dino is talking…';animateMouth(true)};u.onend=()=>{status.textContent='Ask me another!';animateMouth(false)};speechSynthesis.speak(u)}document.querySelector('#fact').onclick=()=>speak(facts[Math.floor(Math.random()*facts.length)]);let conversation=[];
async function askDino(question){
 status.textContent='Dino is thinking…';
 try{
  const res=await fetch('/api/dino',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,history:conversation.slice(-12)})});
  const data=await res.json();if(!res.ok)throw new Error(data.error||'Dino could not answer');
  conversation.push({role:'user',text:question},{role:'assistant',text:data.answer});
  if(conversation.length>12)conversation=conversation.slice(-12);
  speak(data.answer)
 }catch(e){console.error('Dino brain failed',e);speak("Oops! My thinking brain isn't connected yet. Please try again in a moment.")}
}
let recorder=null,chunks=[],recording=false,stopTimer=null;
async function transcribe(blob){
  status.textContent='Dino is working out what you said…';
  try{
    const res=await fetch('/api/transcribe',{method:'POST',headers:{'Content-Type':blob.type||'audio/webm'},body:blob});
    const raw=await res.text();let data={};try{data=JSON.parse(raw)}catch{}if(!res.ok||!data.text)throw new Error(data.error||('HTTP '+res.status+(raw?' — '+raw.slice(0,180):'')));
    const q=data.text.trim();bubble.textContent='You asked: '+q;askDino(q);
  }catch(e){console.error('Dino transcription failed',e);status.textContent='I couldn’t hear that. Try again!';bubble.textContent='Tap TALK TO DINO and try again.'}
}
async function startRecording(){
  if(recording){recorder.stop();return}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status.textContent='Microphone recording is not supported here.';return}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[];recorder=new MediaRecorder(stream);
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{recording=false;clearTimeout(stopTimer);talk.innerHTML='<span>🎙️</span> TALK TO DINO';stream.getTracks().forEach(t=>t.stop());transcribe(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}))};
    recorder.start();recording=true;status.textContent='Dino is listening…';bubble.textContent='I’m listening! Tap again when you’re finished.';talk.innerHTML='<span>⏹️</span> FINISHED TALKING';stopTimer=setTimeout(()=>{if(recording)recorder.stop()},12000);
  }catch(e){status.textContent='Please allow microphone access so Dino can hear you.';bubble.textContent='I need microphone permission to hear you.'}
}
talk.onclick=startRecording;
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});