const CLOSED='/imageedit_5_4382849772.png',OPEN='/imageedit_2_5015191276.png';const dino=document.querySelector('#dino'),bubble=document.querySelector('#bubble'),status=document.querySelector('#status'),talk=document.querySelector('#talk');const facts=["Tyrannosaurus rex had teeth as long as bananas!","Some dinosaurs had feathers, a bit like birds.","The name Triceratops means three-horned face.","Dinosaurs lived on Earth for more than 160 million years.","Stegosaurus had huge plates along its back.","Birds are the living descendants of dinosaurs!"];let mouthTimer;function animateMouth(on){clearInterval(mouthTimer);if(!on){dino.src=CLOSED;return}let open=false;mouthTimer=setInterval(()=>{open=!open;dino.src=open?OPEN:CLOSED},180)}let dinoVoice=null;function loadDinoVoice(){const voices=speechSynthesis.getVoices();dinoVoice=voices.find(v=>v.name==='Google UK English Male')||voices.find(v=>/Google UK English Male/i.test(v.name))||voices.find(v=>/^en-GB$/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||voices[0]||null;return dinoVoice}loadDinoVoice();speechSynthesis.addEventListener('voiceschanged',loadDinoVoice);function chooseDinoVoice(){return dinoVoice||loadDinoVoice()}function speechText(text){return text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu,'').replace(/\s{2,}/g,' ').trim()}function speak(text,displayText=text){speechSynthesis.cancel();bubble.textContent=displayText;const u=new SpeechSynthesisUtterance(speechText(text));const voice=chooseDinoVoice();if(voice)u.voice=voice;u.rate=.92;u.pitch=1;u.volume=1;u.onstart=()=>{status.textContent='Dino is talking…';animateMouth(true)};u.onend=()=>{status.textContent='Ask me another!';animateMouth(false)};speechSynthesis.speak(u)}document.querySelector('#fact').onclick=()=>speak(facts[Math.floor(Math.random()*facts.length)]);document.querySelector('#voiceTest').onclick=()=>{loadVoices();if(!voiceChoices.length){bubble.textContent='No voices found on this device.';return}voiceIndex=(voiceIndex+1)%voiceChoices.length;dinoVoice=voiceChoices[voiceIndex];const label='Voice '+(voiceIndex+1)+' of '+voiceChoices.length+': '+dinoVoice.name;speak("Hello! I'm Dino. I love dinosaurs, stories, jokes and adventures. What shall we talk about?",label)};const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
async function askDino(question){
  status.textContent='Dino is thinking…';
  try{
    const res=await fetch('/api/dino',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Dino could not answer');
    speak(data.answer);
  }catch(e){
    speak("Oops! My thinking brain isn't connected yet. Please try again in a moment.");
  }
}
if(SR){
  const r=new SR();r.lang='en-GB';r.interimResults=false;
  r.onstart=()=>{status.textContent='Dino is listening…';bubble.textContent='I’m listening!'};
  r.onerror=()=>{status.textContent='I couldn’t hear that. Try again!'};
  r.onresult=e=>{const q=e.results[0][0].transcript;bubble.textContent='You asked: '+q;askDino(q)};
  talk.onclick=()=>r.start();
}else talk.onclick=()=>speak("Your browser can't hear me yet, but you can still ask me for a dinosaur fact!");
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});