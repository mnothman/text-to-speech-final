const synth = window.speechSynthesis; //initialize

const textForm = document.querySelector('form'); //dom elements
const textInput = document.querySelector('#text-input');
const voiceSelect = document.querySelector('#voice-select'); //needed for drop down
const rateInput = document.querySelector('#rate');
const rateValue = document.querySelector('#rate-value');
const pitchInput = document.querySelector('#pitch');
const pitchValue = document.querySelector('#pitch-value');
const body = document.querySelector('body');
const speakBtn = document.querySelector('#speak-btn'); 
const pauseBtn = document.querySelector('#pause-btn');
const resumeBtn = document.querySelector('#resume-btn');

let speaking = false;
let currentUtterance = null;

const populateVoicesDropdown = () => { //pull voices 
  const voices = synth.getVoices();
  voiceSelect.innerHTML = voices
    .map(
      voice =>
        `<option value="${voice.name}" data-lang="${voice.lang}">${voice.name} (${voice.lang})</option>`
    )
    .join('');
};

if (synth.onvoiceschanged !== undefined) { //dont populate until all voices loaded 
  synth.onvoiceschanged = populateVoicesDropdown;
}

const speak = () => { //speak function
  if (speaking) { //if alr speaking throw error
    console.error('SPEAKING CURRENTLY');
    return;
  }

  const selectedVoiceName = voiceSelect.value;
  const voices = synth.getVoices();
  const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);

  if (!selectedVoice) {
    console.error('Selected voice not found');
    return;
  }

  if (textInput.value.trim() !== '') {
    const utterance = new SpeechSynthesisUtterance(textInput.value); //this is what speaks, use the utterance input
    utterance.voice = selectedVoice;
    utterance.rate = rateInput.value;
    utterance.pitch = pitchInput.value;

    synth.speak(utterance); //speak text inputted 

    currentUtterance = utterance; //store our utterance and set speaking to true so I can't have it speak again
    speaking = true;

   
    utterance.onend = () => {
      console.log('FINISHED');

      speaking = false;
      currentUtterance = null;
    };

    utterance.onerror = () => {
      console.error('ERROR 01');
      speaking = false;
      currentUtterance = null;
    };
  }
};

// Pause speaking
const pause = () => {
  console.log('pause() called');
  if (speaking) {
    speaking = false;
    synth.pause();
  }
};


// Resume speaking
const resume = () => {
  if (!speaking && currentUtterance) {
    currentUtterance.onend = () => { speaking = false; }; // Update the speaking variable correctly after the utterance finishes
    synth.resume();
    speaking = true;
  }
};


// EVENT LISTENERS

// Text form submit
textForm.addEventListener('submit', e => {
  e.preventDefault();
  speak();
});

// Rate value change
rateInput.addEventListener('input', e => (rateValue.textContent = rateInput.value));

// Pitch value change
pitchInput.addEventListener('input', e => (pitchValue.textContent = pitchInput.value));

// Voice select change
voiceSelect.addEventListener('change', e => {
  speak();
});

// Pause/Resume speaking
let paused = false;
let resumeCallback = null;

pauseBtn.addEventListener('click', () => {
  if (synth.speaking && !paused) {
    synth.pause();
    paused = true;
    pauseBtn.textContent = 'Resume';
    resumeCallback = () => {
      paused = false;
      pauseBtn.textContent = 'Pause';
      resumeCallback = null;
    };
  } else if (paused && resumeCallback) {
    synth.resume();
    resumeCallback();
  }
});

resumeBtn.addEventListener('click', () => {
  if (!synth.speaking && currentUtterance) {
    synth.resume();
    speaking = true;
    resumeBtn.disabled = true;
    resumeBtn.textContent = 'Resuming...';
    setTimeout(() => {
      resumeBtn.disabled = false;
      resumeBtn.textContent = 'Resume';
    }, 3000);
  }
});

// Stop speaking
const stop = () => {
  if (speaking) {
    synth.cancel();
    speaking = false;
    currentUtterance = null;
    body.style.background = '#141414';
  }
};

// Text input change
textInput.addEventListener('input', stop);

// Rate input change
rateInput.addEventListener('input', stop);

// Pitch input change
pitchInput.addEventListener('input', stop);

// Clear text input
const clearText = () => {
  textInput.value = '';
  stop();
};

// Clear text button
document.querySelector('#clear-btn').addEventListener('click', clearText); // Input later
