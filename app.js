const tracks = [
  { id: "kick", label: "Kick" },
  { id: "snare", label: "Snare" },
  { id: "hat", label: "Closed Hat" },
  { id: "clap", label: "Clap" },
];

const presets = {
  "boom-bap": {
    kick: [0, 7, 10, 12],
    snare: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
    clap: [4, 12],
  },
  "lo-fi": {
    kick: [0, 6, 9, 11],
    snare: [4, 12],
    hat: [1, 3, 5, 7, 9, 11, 13, 15],
    clap: [12],
  },
  "trap": {
    kick: [0, 3, 7, 10, 14],
    snare: [4, 12],
    hat: [0, 1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 13, 14, 15],
    clap: [12],
  },
  "house": {
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    clap: [4, 12],
  },
  "afrobeat": {
    kick: [0, 5, 7, 10, 13],
    snare: [4, 11],
    hat: [2, 3, 6, 8, 9, 12, 14, 15],
    clap: [11],
  },
  "dnb": {
    kick: [0, 9, 11],
    snare: [4, 12],
    hat: [0, 1, 2, 3, 6, 7, 8, 10, 11, 13, 14, 15],
    clap: [12],
  },
};

const state = {
  steps: 16,
  pattern: {},
  timing: {},
  velocity: {},
  timingBias: {},
  synth: {
    rows: 8,
    grid: [],
    notes: [],
    root: "C",
    scale: "minor",
    octave: 3,
    wave: "triangle",
    cutoff: 1800,
    volume: 0.65,
  },
  sample: {
    buffer: null,
    name: "",
    isLoading: false,
    root: "C",
    scale: "minor",
    octave: 3,
    pitch: 0,
    tone: 2400,
    volume: 0.7,
    trimStart: 0,
    trimEnd: 1,
    grid: [],
    source: null,
    padGrid: [],
  },
  isPlaying: false,
  currentStep: 0,
  intervalId: null,
  audioCtx: null,
  masterInput: null,
  masterCompressor: null,
  masterFilter: null,
  masterDrive: null,
  masterEqLow: null,
  masterEqMid: null,
  masterEqHigh: null,
  synthFilter: null,
  synthGain: null,
  noiseSource: null,
};

const sequencerEl = document.getElementById("sequencer");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const exportBtn = document.getElementById("exportBtn");
const tempoInput = document.getElementById("tempo");
const tempoValue = document.getElementById("tempoValue");
const swingPresetSelect = document.getElementById("swingPreset");
const swingInput = document.getElementById("swing");
const swingValue = document.getElementById("swingValue");
const noiseToggle = document.getElementById("noiseToggle");
const drumKitSelect = document.getElementById("drumKit");
const masterLowInput = document.getElementById("masterLow");
const masterMidInput = document.getElementById("masterMid");
const masterHighInput = document.getElementById("masterHigh");
const masterLowValue = document.getElementById("masterLowValue");
const masterMidValue = document.getElementById("masterMidValue");
const masterHighValue = document.getElementById("masterHighValue");
const synthGrid = document.getElementById("synthGrid");
const synthRootSelect = document.getElementById("synthRoot");
const synthScaleSelect = document.getElementById("synthScale");
const synthOctaveSelect = document.getElementById("synthOctave");
const synthWaveSelect = document.getElementById("synthWave");
const synthCutoffInput = document.getElementById("synthCutoff");
const synthCutoffValue = document.getElementById("synthCutoffValue");
const synthVolumeInput = document.getElementById("synthVolume");
const synthVolumeValue = document.getElementById("synthVolumeValue");
const sampleFileInput = document.getElementById("sampleFile");
const sampleFileName = document.getElementById("sampleFileName");
const playSampleBtn = document.getElementById("playSampleBtn");
const auditionSampleBtn = document.getElementById("auditionSample");
const clearSampleBtn = document.getElementById("clearSample");
const samplePitchInput = document.getElementById("samplePitch");
const samplePitchValue = document.getElementById("samplePitchValue");
const sampleToneInput = document.getElementById("sampleTone");
const sampleToneValue = document.getElementById("sampleToneValue");
const sampleRootSelect = document.getElementById("sampleRoot");
const sampleScaleSelect = document.getElementById("sampleScale");
const sampleOctaveSelect = document.getElementById("sampleOctave");
const sampleVolumeInput = document.getElementById("sampleVolume");
const sampleVolumeValue = document.getElementById("sampleVolumeValue");
const trimStartInput = document.getElementById("trimStart");
const trimStartValue = document.getElementById("trimStartValue");
const trimEndInput = document.getElementById("trimEnd");
const trimEndValue = document.getElementById("trimEndValue");
const sampleStatus = document.getElementById("sampleStatus");
const waveformCanvas = document.getElementById("waveform");
const sampleKeys = document.getElementById("sampleKeys");
const sampleSeq = document.getElementById("sampleSeq");
const samplePads = document.getElementById("samplePads");
const padSeq = document.getElementById("padSeq");
const dropZones = document.querySelectorAll(".drop-zone");
const padRecordToggle = document.getElementById("padRecord");
const browseSampleBtn = document.getElementById("browseSample");
const modeToggleBtn = document.getElementById("modeToggle");
const modeTimingBtn = document.getElementById("modeTiming");
const modeVelocityBtn = document.getElementById("modeVelocity");

let editMode = "toggle";
let drumKit = "classic";

const NOTE_OFFSETS = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
};


function initPattern() {
  tracks.forEach((track) => {
    state.pattern[track.id] = Array.from({ length: state.steps }, () => false);
    state.timing[track.id] = Array.from({ length: state.steps }, () => 0);
    state.velocity[track.id] = Array.from({ length: state.steps }, () => 4);
    if (state.timingBias[track.id] === undefined) {
      state.timingBias[track.id] = 0;
    }
  });
}

function initSynthGrid() {
  state.synth.grid = Array.from({ length: state.synth.rows }, () =>
    Array.from({ length: state.steps }, () => false)
  );
}

function initSampleGrid() {
  state.sample.grid = Array.from({ length: 8 }, () =>
    Array.from({ length: state.steps }, () => false)
  );
}

function initPadGrid() {
  state.sample.padGrid = Array.from({ length: 9 }, () =>
    Array.from({ length: state.steps }, () => false)
  );
}

function renderSequencer() {
  sequencerEl.innerHTML = "";
  tracks.forEach((track) => {
    const row = document.createElement("div");
    row.className = "track";

    const label = document.createElement("div");
    label.className = "track-label";
    label.textContent = track.label;
    row.appendChild(label);

    for (let step = 0; step < state.steps; step += 1) {
      const cell = document.createElement("button");
      cell.className = "step";
      cell.type = "button";
      cell.dataset.track = track.id;
      cell.dataset.step = String(step);
      if (state.pattern[track.id][step]) {
        cell.classList.add("active");
      }
      cell.addEventListener("click", () => handleStepClick(track.id, step, cell));
      updateStepMark(cell, track.id, step);
      row.appendChild(cell);
    }

    sequencerEl.appendChild(row);
  });
}

function renderSynthGrid() {
  synthGrid.innerHTML = "";
  state.synth.notes.forEach((note, rowIndex) => {
    const row = document.createElement("div");
    row.className = "synth-row";

    const label = document.createElement("div");
    label.className = "synth-label";
    label.textContent = note.label;
    row.appendChild(label);

    for (let step = 0; step < state.steps; step += 1) {
      const cell = document.createElement("button");
      cell.className = "synth-step";
      cell.type = "button";
      cell.dataset.note = String(rowIndex);
      cell.dataset.step = String(step);
      if (state.synth.grid[rowIndex][step]) {
        cell.classList.add("active");
      }
      cell.addEventListener("click", () => {
        state.synth.grid[rowIndex][step] = !state.synth.grid[rowIndex][step];
        cell.classList.toggle("active", state.synth.grid[rowIndex][step]);
      });
      row.appendChild(cell);
    }

    synthGrid.appendChild(row);
  });
}

function updateStepMark(cell, trackId, step) {
  if (editMode === "timing") {
    const value = state.timing[trackId][step];
    cell.dataset.mark = value === 0 ? "" : value > 0 ? `+${value}` : `${value}`;
  } else if (editMode === "velocity") {
    const value = state.velocity[trackId][step];
    cell.dataset.mark = value === 4 ? "" : `${value}`;
  } else {
    cell.dataset.mark = "";
  }
  if (cell.dataset.mark === "") {
    cell.removeAttribute("data-mark");
  }
}

function refreshStepMarks() {
  document.querySelectorAll(".step").forEach((cell) => {
    const trackId = cell.dataset.track;
    const step = Number(cell.dataset.step);
    updateStepMark(cell, trackId, step);
  });
}

function toggleStep(trackId, step, cell) {
  state.pattern[trackId][step] = !state.pattern[trackId][step];
  cell.classList.toggle("active", state.pattern[trackId][step]);
}

function cycleTiming(trackId, step, cell) {
  const values = [-2, -1, 0, 1, 2];
  const current = state.timing[trackId][step];
  const index = values.indexOf(current);
  const next = values[(index + 1) % values.length];
  state.timing[trackId][step] = next;
  updateStepMark(cell, trackId, step);
}

function cycleVelocity(trackId, step, cell) {
  const values = [0, 1, 2, 3, 4];
  const current = state.velocity[trackId][step];
  const index = values.indexOf(current);
  const next = values[(index + 1) % values.length];
  state.velocity[trackId][step] = next;
  updateStepMark(cell, trackId, step);
}

function handleStepClick(trackId, step, cell) {
  if (editMode === "timing") {
    cycleTiming(trackId, step, cell);
  } else if (editMode === "velocity") {
    cycleVelocity(trackId, step, cell);
  } else {
    toggleStep(trackId, step, cell);
  }
}

function updateTempoLabel() {
  tempoValue.textContent = `${tempoInput.value} BPM`;
}

function updateSwingLabel() {
  swingValue.textContent = `${swingInput.value}%`;
}

function updateMasterEqLabels() {
  if (masterLowValue) masterLowValue.textContent = `${masterLowInput.value} dB`;
  if (masterMidValue) masterMidValue.textContent = `${masterMidInput.value} dB`;
  if (masterHighValue) masterHighValue.textContent = `${masterHighInput.value} dB`;
}

function applyMasterEq() {
  const low = Number(masterLowInput.value);
  const mid = Number(masterMidInput.value);
  const high = Number(masterHighInput.value);
  if (state.masterEqLow) state.masterEqLow.gain.value = low;
  if (state.masterEqMid) state.masterEqMid.gain.value = mid;
  if (state.masterEqHigh) state.masterEqHigh.gain.value = high;
  updateMasterEqLabels();
}

function updateSampleLabels() {
  samplePitchValue.textContent = `${samplePitchInput.value} st`;
  sampleToneValue.textContent = `${sampleToneInput.value} Hz`;
  sampleVolumeValue.textContent = `${sampleVolumeInput.value}%`;
  trimStartValue.textContent = `${trimStartInput.value}%`;
  trimEndValue.textContent = `${trimEndInput.value}%`;
}

function updateSampleStatus(text) {
  if (sampleStatus) {
    sampleStatus.textContent = text;
  }
}

function getSampleTrimRange() {
  const startPercent = Number(trimStartInput.value) / 100;
  const endPercent = Number(trimEndInput.value) / 100;
  const clampedStart = Math.min(startPercent, endPercent - 0.05);
  const clampedEnd = Math.max(endPercent, clampedStart + 0.05);
  return { start: clampedStart, end: clampedEnd };
}

function drawSampleWaveform() {
  if (!waveformCanvas) return;
  const ctx = waveformCanvas.getContext("2d");
  const rect = waveformCanvas.getBoundingClientRect();
  const targetWidth = Math.max(1, Math.floor(rect.width || waveformCanvas.width));
  const targetHeight = Math.max(1, Math.floor(rect.height || waveformCanvas.height));
  if (waveformCanvas.width !== targetWidth || waveformCanvas.height !== targetHeight) {
    waveformCanvas.width = targetWidth;
    waveformCanvas.height = targetHeight;
  }
  const width = waveformCanvas.width;
  const height = waveformCanvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, height);

  if (!state.sample.buffer) {
    const label = state.sample.isLoading ? "Decoding sample..." : "Load a sample to see the waveform.";
    ctx.fillStyle = "#6e6257";
    ctx.font = "14px Space Mono, Courier New, monospace";
    ctx.fillText(label, 16, height / 2);
    return;
  }

  const data = state.sample.buffer.getChannelData(0);
  if (!data || data.length === 0) {
    ctx.fillStyle = "#6e6257";
    ctx.font = "14px Space Mono, Courier New, monospace";
    ctx.fillText("Decoded but empty buffer.", 16, height / 2);
    return;
  }
  const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
  ctx.strokeStyle = "#1f1b16";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < width; x += 1) {
    const start = x * samplesPerPixel;
    let min = 1;
    let max = -1;
    for (let i = 0; i < samplesPerPixel; i += 1) {
      const sample = data[start + i] || 0;
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }
    const y1 = ((1 - max) * height) / 2;
    const y2 = ((1 - min) * height) / 2;
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
  }
  ctx.stroke();

  const { start, end } = getSampleTrimRange();
  ctx.fillStyle = "rgba(255, 107, 44, 0.2)";
  ctx.fillRect(0, 0, start * width, height);
  ctx.fillRect(end * width, 0, width - end * width, height);

  ctx.strokeStyle = "rgba(255, 107, 44, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(start * width, 0);
  ctx.lineTo(start * width, height);
  ctx.moveTo(end * width, 0);
  ctx.lineTo(end * width, height);
  ctx.stroke();
}

function decodeAudio(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const ctx = state.audioCtx;
    const decodePromise = ctx.decodeAudioData(arrayBuffer);
    if (decodePromise && typeof decodePromise.then === "function") {
      decodePromise.then(resolve).catch(reject);
      return;
    }
    ctx.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

function isAudioFile(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return type.startsWith("audio/") || [".mp3", ".wav", ".aif", ".aiff", ".m4a"].some((ext) => name.endsWith(ext));
}

function buildSampleNotes() {
  const scale = SCALES[state.sample.scale] || SCALES.minor;
  const rootOffset = NOTE_OFFSETS[state.sample.root] ?? 0;
  const baseMidi = 12 * (state.sample.octave + 1) + rootOffset;
  const notes = scale.slice(0, 8).map((interval) => {
    const midi = baseMidi + interval;
    return {
      label: `${state.sample.root}${state.sample.octave}+${interval}`,
      semitone: interval,
      frequency: midiToFrequency(midi),
    };
  });
  return notes;
}

function renderSampleKeys() {
  if (!sampleKeys) return;
  sampleKeys.innerHTML = "";
  const notes = buildSampleNotes();
  notes.forEach((note) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "sample-key";
    key.textContent = note.label;
    key.addEventListener("click", () => playSampleNote(note.semitone));
    sampleKeys.appendChild(key);
  });
}

function renderSampleSequencer() {
  if (!sampleSeq) return;
  sampleSeq.innerHTML = "";
  const notes = buildSampleNotes();
  notes.forEach((note, rowIndex) => {
    const row = document.createElement("div");
    row.className = "sample-seq-row";

    const label = document.createElement("div");
    label.className = "sample-seq-label-cell";
    label.textContent = note.label;
    row.appendChild(label);

    for (let step = 0; step < state.steps; step += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "sample-seq-step";
      cell.dataset.note = String(rowIndex);
      cell.dataset.step = String(step);
      if (state.sample.grid[rowIndex][step]) {
        cell.classList.add("active");
      }
      cell.addEventListener("click", () => {
        state.sample.grid[rowIndex][step] = !state.sample.grid[rowIndex][step];
        cell.classList.toggle("active", state.sample.grid[rowIndex][step]);
      });
      row.appendChild(cell);
    }

    sampleSeq.appendChild(row);
  });
}

function renderSamplePads() {
  if (!samplePads) return;
  samplePads.innerHTML = "";
  const hasSample = Boolean(state.sample.buffer);
  for (let i = 0; i < 9; i += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pad-btn";
    btn.textContent = String(i + 1);
    btn.disabled = !hasSample;
    btn.addEventListener("click", () => {
      playSampleSlice(i);
  if (padRecordToggle?.checked && state.isPlaying) {
        const stepIndex = state.currentStep;
        state.sample.padGrid[i][stepIndex] = true;
        const cell = padSeq?.querySelector(
          `.pad-seq-step[data-pad="${i}"][data-step="${stepIndex}"]`
        );
        if (cell) {
          cell.classList.add("active");
        }
        padRecordToggle.classList.add("active");
      }
    });
    samplePads.appendChild(btn);
  }
}

function renderPadSequencer() {
  if (!padSeq) return;
  padSeq.innerHTML = "";
  for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
    const row = document.createElement("div");
    row.className = "pad-seq-row";

    const label = document.createElement("div");
    label.className = "pad-seq-label-cell";
    label.textContent = String(rowIndex + 1);
    row.appendChild(label);

    for (let step = 0; step < state.steps; step += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "pad-seq-step";
      cell.dataset.pad = String(rowIndex);
      cell.dataset.step = String(step);
      if (state.sample.padGrid[rowIndex][step]) {
        cell.classList.add("active");
      }
      cell.addEventListener("click", () => {
        state.sample.padGrid[rowIndex][step] = !state.sample.padGrid[rowIndex][step];
        cell.classList.toggle("active", state.sample.padGrid[rowIndex][step]);
      });
      row.appendChild(cell);
    }
    padSeq.appendChild(row);
  }
}

function getSampleToneFilter() {
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = state.sample.tone;
  filter.Q.value = 0.7;
  return filter;
}

async function playSampleNote(semitoneOffset = 0, time = state.audioCtx?.currentTime || 0) {
  if (!state.sample.buffer) return;
  await ensureAudioReady();
  if (state.sample.source) {
    try {
      state.sample.source.stop();
    } catch (error) {
      console.warn("Sample stop failed.", error);
    }
    state.sample.source = null;
  }
  const { start, end } = getSampleTrimRange();
  const duration = Math.max(0.05, (end - start) * state.sample.buffer.duration);
  const source = state.audioCtx.createBufferSource();
  const gain = state.audioCtx.createGain();
  const filter = getSampleToneFilter();
  const playbackRate = Math.pow(2, (state.sample.pitch + semitoneOffset) / 12);
  source.buffer = state.sample.buffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = state.sample.volume;
  source.connect(filter).connect(gain).connect(getOutputNode());
  source.start(time, start * state.sample.buffer.duration, duration);
  source.stop(time + duration + 0.05);
  source.onended = () => {
    if (state.sample.source === source) {
      state.sample.source = null;
    }
  };
  state.sample.source = source;
}

async function playSampleSlice(index) {
  if (!state.sample.buffer) return;
  await ensureAudioReady();
  if (state.sample.source) {
    try {
      state.sample.source.stop();
    } catch (error) {
      console.warn("Sample stop failed.", error);
    }
    state.sample.source = null;
  }
  const { start, end } = getSampleTrimRange();
  const totalDuration = Math.max(0.05, (end - start) * state.sample.buffer.duration);
  const sliceDuration = totalDuration / 9;
  const sliceOffset = start * state.sample.buffer.duration + sliceDuration * index;
  const source = state.audioCtx.createBufferSource();
  const gain = state.audioCtx.createGain();
  const filter = getSampleToneFilter();
  const playbackRate = Math.pow(2, state.sample.pitch / 12);
  source.buffer = state.sample.buffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = state.sample.volume;
  source.connect(filter).connect(gain).connect(getOutputNode());
  source.start(state.audioCtx.currentTime, sliceOffset, sliceDuration);
  source.stop(state.audioCtx.currentTime + sliceDuration + 0.05);
  source.onended = () => {
    if (state.sample.source === source) {
      state.sample.source = null;
    }
  };
  state.sample.source = source;
}

async function handleSampleUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) {
    updateSampleStatus("No file selected.");
    return;
  }
  updateSampleStatus(`File selected: ${file.name}`);
  if (!isAudioFile(file)) {
    updateSampleStatus("Please load an audio file.");
    return;
  }
  state.sample.isLoading = true;
  const sizeKb = Math.round(file.size / 1024);
  updateSampleStatus(`Loading: ${file.name} (${file.type || "unknown"}, ${sizeKb} KB)`);
  if (sampleFileName) {
    sampleFileName.textContent = file.name;
  }
  drawSampleWaveform();
  try {
    await ensureAudioReady();
    const arrayBuffer = await file.arrayBuffer();
    state.sample.buffer = null;
    const decodePromise = decodeAudio(arrayBuffer);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Decode timeout")), 8000);
    });
    state.sample.buffer = await Promise.race([decodePromise, timeoutPromise]);
    state.sample.name = file.name;
    const duration = state.sample.buffer?.duration;
    const durationText = duration ? ` • ${duration.toFixed(2)}s` : "";
    const channels = state.sample.buffer?.numberOfChannels ?? 0;
    updateSampleStatus(`Loaded: ${state.sample.name}${durationText} • ${channels}ch`);
    renderSampleKeys();
    renderSamplePads();
    renderPadSequencer();
    await playSampleNote(0);
  } catch (error) {
    console.error("Sample decode failed.", error);
    state.sample.buffer = null;
    state.sample.name = "";
    updateSampleStatus("Failed to decode. Try WAV/MP3 under 10MB.");
  } finally {
    state.sample.isLoading = false;
    requestAnimationFrame(drawSampleWaveform);
  }
}

function handleSampleTrimChange() {
  state.sample.trimStart = Number(trimStartInput.value) / 100;
  state.sample.trimEnd = Number(trimEndInput.value) / 100;
  updateSampleLabels();
  drawSampleWaveform();
}

function handleSampleControlsChange() {
  state.sample.pitch = Number(samplePitchInput.value);
  state.sample.tone = Number(sampleToneInput.value);
  state.sample.volume = Number(sampleVolumeInput.value) / 100;
  state.sample.root = sampleRootSelect.value;
  state.sample.scale = sampleScaleSelect.value;
  state.sample.octave = Number(sampleOctaveSelect.value);
  updateSampleLabels();
  renderSampleKeys();
  renderSampleSequencer();
  renderSamplePads();
  renderPadSequencer();
}

function handleSampleClear() {
  state.sample.buffer = null;
  state.sample.name = "";
  if (state.sample.source) {
    try {
      state.sample.source.stop();
    } catch (error) {
      console.warn("Sample stop failed.", error);
    }
    state.sample.source = null;
  }
  if (sampleFileName) {
    sampleFileName.textContent = "No file";
  }
  updateSampleStatus("No sample loaded.");
  drawSampleWaveform();
  renderSamplePads();
  renderPadSequencer();
}

function setupDropZone(dropZone, input, handler) {
  if (!dropZone || !input) return;
  dropZone.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    input.click();
  });
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("is-dragover");
  });
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragover");
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handler({ target: { files: [file] } });
    }
  });
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function buildSynthNotes() {
  const scale = SCALES[state.synth.scale] || SCALES.minor;
  const rootOffset = NOTE_OFFSETS[state.synth.root] ?? 0;
  const baseMidi = 12 * (state.synth.octave + 1) + rootOffset;
  const notes = scale.slice(0, state.synth.rows).map((interval) => {
    const midi = baseMidi + interval;
    const name = `${state.synth.root}${state.synth.octave}`;
    return {
      label: `${name}+${interval}`,
      frequency: midiToFrequency(midi),
    };
  });
  state.synth.notes = notes.reverse();
}

function updateSynthLabels() {
  synthCutoffValue.textContent = `${state.synth.cutoff} Hz`;
  synthVolumeValue.textContent = `${Math.round(state.synth.volume * 100)}%`;
}

function applySynthSettings() {
  state.synth.root = synthRootSelect.value;
  state.synth.scale = synthScaleSelect.value;
  state.synth.octave = Number(synthOctaveSelect.value);
  state.synth.wave = synthWaveSelect.value;
  state.synth.cutoff = Number(synthCutoffInput.value);
  state.synth.volume = Number(synthVolumeInput.value) / 100;
  if (state.synthFilter) {
    state.synthFilter.frequency.value = state.synth.cutoff;
  }
  if (state.synthGain) {
    state.synthGain.gain.value = state.synth.volume;
  }
  updateSynthLabels();
  buildSynthNotes();
  renderSynthGrid();
}

function playSynthNote(freq, time, duration) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = state.synth.wave;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.6, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(gain).connect(state.synthFilter || getOutputNode());
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

function playSynthStep(stepIndex, time) {
  const duration = getStepInterval() * 0.9;
  state.synth.grid.forEach((row, rowIndex) => {
    if (row[stepIndex]) {
      const note = state.synth.notes[rowIndex];
      if (note) {
        playSynthNote(note.frequency, time, duration);
      }
    }
  });
}

function playSampleStep(stepIndex, time) {
  const notes = buildSampleNotes();
  state.sample.grid.forEach((row, rowIndex) => {
    if (row[stepIndex]) {
      const note = notes[rowIndex];
      if (note) {
        playSampleNote(note.semitone, time);
      }
    }
  });
}

function playPadStep(stepIndex) {
  state.sample.padGrid.forEach((row, rowIndex) => {
    if (row[stepIndex]) {
      playSampleSlice(rowIndex);
    }
  });
}
function applySwingPreset(preset) {
  const presetsMap = {
    straight: { swing: 0, hat: 0, snare: 0 },
    "swing-54": { swing: 54, hat: 0.5, snare: -0.5 },
    "swing-58": { swing: 58, hat: 1, snare: -0.5 },
    "swing-62": { swing: 62, hat: 1.5, snare: -0.5 },
  };
  const setting = presetsMap[preset] || presetsMap.straight;
  swingInput.value = String(setting.swing);
  updateSwingLabel();
  state.timingBias.hat = setting.hat;
  state.timingBias.snare = setting.snare;
}

function initAudio() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    initMasterChain();
    initSynthChain();
  }
}

function initSynthChain() {
  if (state.synthFilter) return;
  const ctx = state.audioCtx;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = state.synth.cutoff;
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.value = state.synth.volume;

  filter.connect(gain).connect(getOutputNode());
  state.synthFilter = filter;
  state.synthGain = gain;
}

function initMasterChain() {
  if (state.masterInput) return;
  const ctx = state.audioCtx;
  const masterInput = ctx.createGain();
  masterInput.gain.value = 0.95;

  const drive = ctx.createWaveShaper();
  drive.curve = makeDistortionCurve(8);
  drive.oversample = "4x";

  const eqLow = ctx.createBiquadFilter();
  eqLow.type = "lowshelf";
  eqLow.frequency.value = 140;
  eqLow.gain.value = 0;

  const eqMid = ctx.createBiquadFilter();
  eqMid.type = "peaking";
  eqMid.frequency.value = 1000;
  eqMid.Q.value = 0.9;
  eqMid.gain.value = 0;

  const eqHigh = ctx.createBiquadFilter();
  eqHigh.type = "highshelf";
  eqHigh.frequency.value = 5200;
  eqHigh.gain.value = 0;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 12000;
  filter.Q.value = 0.6;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 20;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.2;

  masterInput
    .connect(drive)
    .connect(eqLow)
    .connect(eqMid)
    .connect(eqHigh)
    .connect(filter)
    .connect(compressor)
    .connect(ctx.destination);

  state.masterInput = masterInput;
  state.masterDrive = drive;
  state.masterEqLow = eqLow;
  state.masterEqMid = eqMid;
  state.masterEqHigh = eqHigh;
  state.masterFilter = filter;
  state.masterCompressor = compressor;
}

function makeDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

function getOutputNode() {
  return state.masterInput || state.audioCtx.destination;
}

function startLofiTexture() {
  if (state.noiseSource || !state.audioCtx) return;
  const buffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 1, state.audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = state.audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = state.audioCtx.createGain();
  gain.gain.value = 0.04;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1200;
  source.connect(filter).connect(gain).connect(getOutputNode());
  source.start();
  state.noiseSource = source;
}

function stopLofiTexture() {
  if (!state.noiseSource) return;
  try {
    state.noiseSource.stop();
  } catch (error) {
    console.warn("Noise stop failed.", error);
  }
  state.noiseSource = null;
}

async function ensureAudioReady() {
  initAudio();
  if (state.audioCtx.state === "suspended") {
    await state.audioCtx.resume();
  }
}

function playKick(time, level = 1) {
  if (drumKit === "lofi") {
    playKickLofi(time, level);
    return;
  }
  if (drumKit === "jazzy") {
    playKickJazzy(time, level);
    return;
  }
  if (drumKit === "moody") {
    playKickMoody(time, level);
    return;
  }
  if (drumKit === "crisp") {
    playKickCrisp(time, level);
    return;
  }
  playKickClassic(time, level);
}

function playSnare(time, level = 1) {
  if (drumKit === "lofi") {
    playSnareLofi(time, level);
    return;
  }
  if (drumKit === "jazzy") {
    playSnareJazzy(time, level);
    return;
  }
  if (drumKit === "moody") {
    playSnareMoody(time, level);
    return;
  }
  if (drumKit === "crisp") {
    playSnareCrisp(time, level);
    return;
  }
  playSnareClassic(time, level);
}

function playHat(time, level = 1) {
  if (drumKit === "lofi") {
    playHatLofi(time, level);
    return;
  }
  if (drumKit === "jazzy") {
    playHatJazzy(time, level);
    return;
  }
  if (drumKit === "moody") {
    playHatMoody(time, level);
    return;
  }
  if (drumKit === "crisp") {
    playHatCrisp(time, level);
    return;
  }
  playHatClassic(time, level);
}

function playClap(time, level = 1) {
  if (drumKit === "lofi") {
    playClapLofi(time, level);
    return;
  }
  if (drumKit === "jazzy") {
    playClapJazzy(time, level);
    return;
  }
  if (drumKit === "moody") {
    playClapMoody(time, level);
    return;
  }
  if (drumKit === "crisp") {
    playClapCrisp(time, level);
    return;
  }
  playClapClassic(time, level);
}

function playTransient(time, frequency, level, duration) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + duration);
}

function playKickClassic(time, level) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, time);
  osc.frequency.exponentialRampToValueAtTime(50, time + 0.15);
  gain.gain.setValueAtTime(0.9 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + 0.25);
  playTransient(time, 1400, 0.18 * level, 0.015);
}

function playKickCrisp(time, level) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(65, time + 0.12);
  gain.gain.setValueAtTime(0.8 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + 0.22);
  playTransient(time, 2200, 0.22 * level, 0.01);
}

function playSnareClassic(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.2, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = state.audioCtx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1200;
  const noiseGain = state.audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.6 * level, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
  noise.connect(noiseFilter).connect(noiseGain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.2);
  playTransient(time, 2200, 0.12 * level, 0.01);
}

function playSnareCrisp(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.12, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = state.audioCtx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1800;
  noiseFilter.Q.value = 0.7;
  const noiseGain = state.audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.55 * level, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  noise.connect(noiseFilter).connect(noiseGain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.12);
  playTransient(time, 3200, 0.1 * level, 0.008);
}

function playHatClassic(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.05, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 5000;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.3 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.06);
}

function playHatCrisp(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.04, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.26 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.05);
}

function playClapClassic(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.15, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.5 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
  noise.connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.15);
}

function playClapCrisp(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.1, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.45 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.12);
  playTransient(time + 0.012, 2400, 0.08 * level, 0.01);
}

function playKickMoody(time, level) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.2);
  gain.gain.setValueAtTime(0.85 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + 0.3);
}

function playSnareMoody(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.22, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.9;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.55 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.22);
}

function playHatMoody(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.06, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3800;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.24 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.08);
}

function playClapMoody(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.18, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.4 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.16);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.18);
}

function playKickJazzy(time, level) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(105, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.22);
  gain.gain.setValueAtTime(0.75 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + 0.28);
}

function playSnareJazzy(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.2, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1600;
  filter.Q.value = 0.6;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.5 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.2);
}

function playHatJazzy(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.07, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3200;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.22 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.09);
}

function playClapJazzy(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.16, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2200;
  filter.Q.value = 0.5;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.42 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.16);
}

function playKickLofi(time, level) {
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(95, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.25);
  gain.gain.setValueAtTime(0.8 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(gain).connect(getOutputNode());
  osc.start(time);
  osc.stop(time + 0.32);
}

function playSnareLofi(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.24, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100;
  filter.Q.value = 0.9;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.5 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.25);
}

function playHatLofi(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.07, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3000;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.2 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.09);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.1);
}

function playClapLofi(time, level) {
  const noiseBuffer = state.audioCtx.createBuffer(1, state.audioCtx.sampleRate * 0.2, state.audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < output.length; i += 1) {
    output[i] = Math.random() * 2 - 1;
  }
  const noise = state.audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  const filter = state.audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  const gain = state.audioCtx.createGain();
  gain.gain.setValueAtTime(0.38 * level, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
  noise.connect(filter).connect(gain).connect(getOutputNode());
  noise.start(time);
  noise.stop(time + 0.2);
}

function playStep(stepIndex) {
  const time = state.audioCtx.currentTime;
  const swingAmount = (Number(swingInput.value) / 100) * (getStepInterval() / 2);
  const offset = stepIndex % 2 === 1 ? swingAmount : 0;
  const scheduledTime = time + offset;

  tracks.forEach((track) => {
    if (state.pattern[track.id][stepIndex]) {
      const timingOffset = getTimingOffset(track.id, stepIndex);
      const jitter = getTimingJitter(track.id);
      const velocity = getHumanizedLevel(track.id, getVelocityLevel(track.id, stepIndex));
      const timeWithOffset = scheduledTime + timingOffset + jitter;
      if (track.id === "kick") playKick(timeWithOffset, velocity);
      if (track.id === "snare") playSnare(timeWithOffset, velocity);
      if (track.id === "hat") playHat(timeWithOffset, velocity);
      if (track.id === "clap") playClap(timeWithOffset, velocity);
    }
  });

  playSynthStep(stepIndex, scheduledTime + getStepInterval() * 0.02);
  playSampleStep(stepIndex, scheduledTime + getStepInterval() * 0.02);
  playPadStep(stepIndex);
  highlightStep(stepIndex);
}

function highlightStep(stepIndex) {
  const steps = document.querySelectorAll(".step");
  steps.forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.toggle("playing", stepNumber === stepIndex);
  });

  const synthSteps = document.querySelectorAll(".synth-step");
  synthSteps.forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.toggle("playing", stepNumber === stepIndex);
  });

  const sampleSteps = document.querySelectorAll(".sample-seq-step");
  sampleSteps.forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.toggle("playing", stepNumber === stepIndex);
  });

  const padSteps = document.querySelectorAll(".pad-seq-step");
  padSteps.forEach((step) => {
    const stepNumber = Number(step.dataset.step);
    step.classList.toggle("playing", stepNumber === stepIndex);
  });
}

function clearHighlight() {
  document.querySelectorAll(".step").forEach((step) => step.classList.remove("playing"));
  document.querySelectorAll(".synth-step").forEach((step) => step.classList.remove("playing"));
  document.querySelectorAll(".sample-seq-step").forEach((step) => step.classList.remove("playing"));
  document.querySelectorAll(".pad-seq-step").forEach((step) => step.classList.remove("playing"));
}

function getStepInterval() {
  const bpm = Number(tempoInput.value);
  return (60 / bpm) / 4;
}

function getTimingOffset(trackId, stepIndex) {
  const value = state.timing[trackId]?.[stepIndex] ?? 0;
  const bias = state.timingBias[trackId] ?? 0;
  const maxShift = getStepInterval() * 0.2;
  return ((value + bias) / 2) * maxShift;
}

function getVelocityLevel(trackId, stepIndex) {
  const value = state.velocity[trackId]?.[stepIndex] ?? 4;
  const levels = [0.35, 0.5, 0.7, 0.85, 1];
  return levels[value] ?? 1;
}

function getTimingJitter(trackId) {
  const jitterMap = {
    kick: 0.02,
    snare: 0.04,
    hat: 0.06,
    clap: 0.05,
  };
  const intensity = jitterMap[trackId] ?? 0.03;
  return (Math.random() - 0.5) * getStepInterval() * intensity;
}

function getHumanizedLevel(trackId, baseLevel) {
  const varianceMap = {
    kick: 0.05,
    snare: 0.08,
    hat: 0.12,
    clap: 0.1,
  };
  const variance = varianceMap[trackId] ?? 0.07;
  const jitter = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(0.1, baseLevel * jitter);
}

async function startPlayback() {
  if (state.isPlaying) return;
  await ensureAudioReady();
  state.isPlaying = true;
  state.currentStep = 0;
  if (noiseToggle.checked) {
    startLofiTexture();
  }
  const intervalMs = getStepInterval() * 1000;
  state.intervalId = setInterval(() => {
    playStep(state.currentStep);
    state.currentStep = (state.currentStep + 1) % state.steps;
  }, intervalMs);
}

function stopPlayback() {
  if (!state.isPlaying) return;
  clearInterval(state.intervalId);
  state.intervalId = null;
  state.isPlaying = false;
  clearHighlight();
  stopLofiTexture();
}

async function exportLoop() {
  if (typeof MediaRecorder === "undefined") {
    window.alert("Export is not supported in this browser.");
    return;
  }
  await ensureAudioReady();
  const bpm = Number(tempoInput.value);
  const durationSeconds = (60 / bpm) * 64;
  const mediaDest = state.audioCtx.createMediaStreamDestination();
  if (state.masterCompressor) {
    state.masterCompressor.connect(mediaDest);
  }
  const chunks = [];
  const options = MediaRecorder.isTypeSupported("audio/webm")
    ? { mimeType: "audio/webm" }
    : undefined;
  const recorder = new MediaRecorder(mediaDest.stream, options);
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ext = recorder.mimeType?.includes("ogg") ? "ogg" : "webm";
    link.href = url;
    link.download = `scrollbeat-16-bars.${ext}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (state.masterCompressor) {
      try {
        state.masterCompressor.disconnect(mediaDest);
      } catch (error) {
        console.warn("Recorder disconnect failed.", error);
      }
    }
  };

  const wasPlaying = state.isPlaying;
  if (wasPlaying) {
    stopPlayback();
  }
  startPlayback();
  recorder.start();
  setTimeout(() => {
    recorder.stop();
    stopPlayback();
    if (wasPlaying) {
      startPlayback();
    }
  }, durationSeconds * 1000);
}

function setEditMode(nextMode) {
  editMode = nextMode;
  modeToggleBtn.classList.toggle("active", editMode === "toggle");
  modeTimingBtn.classList.toggle("active", editMode === "timing");
  modeVelocityBtn.classList.toggle("active", editMode === "velocity");
  refreshStepMarks();
}

function bindEvents() {
  playBtn.addEventListener("click", startPlayback);
  stopBtn.addEventListener("click", stopPlayback);
  tempoInput.addEventListener("input", updateTempoLabel);
  swingInput.addEventListener("input", updateSwingLabel);
  swingPresetSelect.addEventListener("change", (event) => {
    applySwingPreset(event.target.value);
  });
  noiseToggle.addEventListener("change", () => {
    if (!state.audioCtx) return;
    if (noiseToggle.checked && state.isPlaying) {
      startLofiTexture();
    } else {
      stopLofiTexture();
    }
  });
  drumKitSelect.addEventListener("change", (event) => {
    drumKit = event.target.value;
  });
  if (masterLowInput) masterLowInput.addEventListener("input", applyMasterEq);
  if (masterMidInput) masterMidInput.addEventListener("input", applyMasterEq);
  if (masterHighInput) masterHighInput.addEventListener("input", applyMasterEq);
  if (sampleFileInput) {
    sampleFileInput.addEventListener("change", handleSampleUpload);
    sampleFileInput.addEventListener("input", handleSampleUpload);
    sampleFileInput.onchange = handleSampleUpload;
  }
  if (samplePitchInput) samplePitchInput.addEventListener("input", handleSampleControlsChange);
  if (sampleToneInput) sampleToneInput.addEventListener("input", handleSampleControlsChange);
  if (sampleVolumeInput) sampleVolumeInput.addEventListener("input", handleSampleControlsChange);
  if (sampleRootSelect) sampleRootSelect.addEventListener("change", handleSampleControlsChange);
  if (sampleScaleSelect) sampleScaleSelect.addEventListener("change", handleSampleControlsChange);
  if (sampleOctaveSelect) sampleOctaveSelect.addEventListener("change", handleSampleControlsChange);
  if (trimStartInput) trimStartInput.addEventListener("input", handleSampleTrimChange);
  if (trimEndInput) trimEndInput.addEventListener("input", handleSampleTrimChange);
  if (playSampleBtn) {
    playSampleBtn.addEventListener("click", () => {
      if (state.sample.source) {
        try {
          state.sample.source.stop();
        } catch (error) {
          console.warn("Sample stop failed.", error);
        }
        state.sample.source = null;
        return;
      }
      playSampleNote(0);
    });
  }
  if (auditionSampleBtn) {
    auditionSampleBtn.addEventListener("click", () => {
      if (state.sample.source) {
        try {
          state.sample.source.stop();
        } catch (error) {
          console.warn("Sample stop failed.", error);
        }
        state.sample.source = null;
        return;
      }
      playSampleNote(0);
    });
  }
  if (clearSampleBtn) clearSampleBtn.addEventListener("click", handleSampleClear);
  if (dropZones[0] && sampleFileInput) {
    setupDropZone(dropZones[0], sampleFileInput, handleSampleUpload);
  }
  if (browseSampleBtn && sampleFileInput) {
    browseSampleBtn.addEventListener("click", () => sampleFileInput.click());
  }
  synthRootSelect.addEventListener("change", applySynthSettings);
  synthScaleSelect.addEventListener("change", applySynthSettings);
  synthOctaveSelect.addEventListener("change", applySynthSettings);
  synthWaveSelect.addEventListener("change", applySynthSettings);
  synthCutoffInput.addEventListener("input", applySynthSettings);
  synthVolumeInput.addEventListener("input", applySynthSettings);
  modeToggleBtn.addEventListener("click", () => setEditMode("toggle"));
  modeTimingBtn.addEventListener("click", () => setEditMode("timing"));
  modeVelocityBtn.addEventListener("click", () => setEditMode("velocity"));
  if (exportBtn) exportBtn.addEventListener("click", exportLoop);
}

initPattern();
initSynthGrid();
initSampleGrid();
initPadGrid();
renderSequencer();
updateTempoLabel();
swingPresetSelect.value = "swing-58";
applySwingPreset("swing-58");
drumKitSelect.value = "classic";
drumKit = "classic";
applySynthSettings();
handleSampleControlsChange();
drawSampleWaveform();
renderSamplePads();
renderPadSequencer();
updateSampleStatus("Sampler ready. Click Browse or drop a file.");
updateMasterEqLabels();
setEditMode("toggle");
bindEvents();
