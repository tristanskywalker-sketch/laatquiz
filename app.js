(() => {
  'use strict';
  const STORAGE_KEY = 'laatquiz_state_v1';
  const RECENT_KEY = 'laatquiz_recent_v1';
  const app = document.getElementById('app');
  const categoryDefs = [
    {id:'country', name:'Country', note:'Nashville & klassikere', sign:'✦', tint:'amber'},
    {id:'pop', name:'Pop', note:'Hits alle kjenner', sign:'♫', tint:'pink'},
    {id:'rock', name:'Rock', note:'Gitarer & legender', sign:'⚡', tint:'blue'},
    {id:'80', name:'80-tallet', note:'Synth & store refreng', sign:'80', tint:'purple'},
    {id:'90', name:'90-tallet', note:'Nostalgi på fullt', sign:'90', tint:'orange'},
    {id:'norsk', name:'Norsk musikk', note:'Fra a-ha til Karpe', sign:'NO', tint:'mint'},
    {id:'alle', name:'Litt av alt', note:'Alle kategorier', sign:'✳', tint:'lime'},
  ];

  const initial = {screen:'setup', category:'country', count:10, quizIds:[], active:-1, visited:[], revealed:[], finished:false};
  let state = loadState();
  let toastTimer;

  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* privat nettlesermodus */ }
  }
  function loadState() {
    const saved = read(STORAGE_KEY, null);
    if (!saved || !['setup','quiz'].includes(saved.screen) || !Array.isArray(saved.quizIds) ||
        saved.quizIds.some(id => !SONGS.find(song => song.id === id))) return {...initial};
    return {...initial, ...saved};
  }
  const save = () => write(STORAGE_KEY, state);
  const html = (s) => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const pad = n => String(n).padStart(2,'0');
  const spotifyUrl = song => song.spotifyId
    ? `https://open.spotify.com/track/${encodeURIComponent(song.spotifyId)}`
    : `https://open.spotify.com/search/${encodeURIComponent(song.artist + ' ' + song.title)}`;
  const poolFor = category => SONGS.filter(s => category === 'alle' ||
    (category === '80' && s.year >= 1980 && s.year <= 1989) ||
    (category === '90' && s.year >= 1990 && s.year <= 1999) ||
    s.genres.includes(category));
  const currentSongs = () => state.quizIds.map(id => SONGS.find(s => s.id === id));
  const cat = () => categoryDefs.find(c => c.id === state.category) || categoryDefs[0];
  const icon = (name, size=20) => {
    const paths = {
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
      back:'<path d="m15 18-6-6 6-6"/>',
      play:'<path d="m8 5 12 7-12 7V5Z" stroke-linejoin="round"/>',
      shuffle:'<path d="m18 14 4 4-4 4m-8-8 4 4h8M2 4h5c5 0 5 14 10 14h5m-4-16 4 4-4 4M2 18h5c2 0 3-2 4-4m5-8h6"/>',
      check:'<path d="m5 12 5 5L20 7"/>',
      external:'<path d="M14 4h6v6m0-6-9 9M20 14v6H4V4h6"/>',
      eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/>',
      refresh:'<path d="M20 7v5h-5M4 17v-5h5m-4.5-2A8 8 0 0 1 18 6l2 1M4 17l2 1a8 8 0 0 0 13.5-3"/>',
      music:'<path d="M9 18V5l12-2v13M9 9l12-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="18" cy="16" rx="3" ry="2"/>',
      close:'<path d="M5 5l14 14M19 5 5 19"/>',
      list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/>',
    };
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.music}</svg>`;
  };
  function shuffle(items) {
    const copy = [...items];
    for (let i=copy.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
    return copy;
  }
  function chooseSongs(pool,count,recent=[],exclude=[]) {
    const eligible=pool.filter(s=>!exclude.includes(s.id));
    const fresh=shuffle(eligible.filter(s=>!recent.includes(s.id)));
    const older=shuffle(eligible.filter(s=>recent.includes(s.id)));
    const selected=[], artists=new Set();
    for (const item of [...fresh,...older]) {
      if (selected.length === count) break;
      if (!artists.has(item.artist.toLocaleLowerCase('nb'))) {
        selected.push(item);
        artists.add(item.artist.toLocaleLowerCase('nb'));
      }
    }
    for (const item of [...fresh,...older]) {
      if (selected.length === count) break;
      if (!selected.includes(item)) selected.push(item);
    }
    return selected;
  }
  function newQuiz() {
    const pool=poolFor(state.category), total=Math.min(state.count,pool.length);
    if (total < 1) return;
    const recent = read(RECENT_KEY, []);
    const selected = chooseSongs(pool,total,recent);
    write(RECENT_KEY, [...selected.map(s=>s.id),...recent].slice(0,55));
    state = {...state, screen:'quiz', quizIds:selected.map(s=>s.id), active:-1, visited:[], revealed:[], finished:false};
    save(); render(); window.scrollTo(0,0);
  }
  function select(index) {
    if (!Number.isInteger(index) || index<0 || index>=state.quizIds.length) return;
    state.active=index; state.finished=false;
    if (!state.visited.includes(index)) state.visited.push(index);
    save();
    // Render etter at nettleseren har håndtert den vanlige Spotify-lenken.
    setTimeout(() => { render(); },0);
  }
  function replaceSong() {
    if (state.active<0) return;
    const options = poolFor(state.category).filter(s=>!state.quizIds.includes(s.id));
    if (!options.length) { showToast('Ingen flere låter i denne kategorien.'); return; }
    const recent=read(RECENT_KEY,[]);
    const replacement=chooseSongs(options,1,recent)[0];
    if (!replacement) return;
    const oldId=state.quizIds[state.active];
    state.quizIds[state.active]=replacement.id;
    state.revealed=state.revealed.filter(i=>i!==state.active);
    state.visited=state.visited.filter(i=>i!==state.active);
    save();render();showToast('Ny låt er valgt. Trykk «Åpne låten».');
  }
  function showToast(message) {
    let toast=document.getElementById('toast');
    if (!toast) {toast=document.createElement('div');toast.id='toast';toast.className='toast';document.body.appendChild(toast);}
    toast.textContent=message;toast.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3100);
  }
  function renderSetup() {
    const cards=categoryDefs.map(c=>{
      const active=state.category===c.id;
      return `<button type="button" class="genre-card genre-${c.tint} ${active?'selected':''}" data-action="category" data-value="${c.id}" aria-pressed="${active}">
        <span class="genre-card-top"><span class="genre-mark">${c.sign}</span><span class="genre-indicator">${active?icon('check',14):''}</span></span>
        <span class="genre-name">${c.name}</span><span class="genre-note">${c.note}</span>
      </button>`;
    }).join('');
    app.innerHTML=`<section class="setup-intro"><div class="intro-copy"><p class="eyebrow"><span class="eyebrow-line"></span> DIN NESTE MUSIKKQUIZ STARTER HER</p>
      <h1>God musikk.<br><span>Gode spørsmål.</span></h1>
      <p class="intro-desc">Velg stemningen, trekk låter og hold hele quizen fra mobilen. Du spiller musikken – resten fikser vi.</p>
      <div class="intro-stats"><span>${SONGS.length} låter i banken</span><i></i><span>2 poeng per låt</span></div></div>
      <div class="hero-art" aria-hidden="true"><div class="vinyl-ring"><div class="vinyl-disc"><div class="vinyl-label"><div class="vinyl-hole"></div></div></div></div><div class="hero-spark spark-one">✳</div><div class="hero-spark spark-two">✦</div></div></section>
      <section class="setup-panel"><div class="section-heading"><div><span class="section-kicker">STEG 01</span><h2>Velg kategori</h2></div><span class="tiny-info">${categoryDefs.length} alternativer</span></div>
      <div class="genre-grid">${cards}</div>
      <div class="setup-divider"></div>
      <div class="section-heading count-heading"><div><span class="section-kicker">STEG 02</span><h2>Antall spørsmål</h2></div></div>
      <div class="count-options" role="group" aria-label="Velg antall spørsmål">${[5,10,15].map(n=>`<button type="button" data-action="count" data-value="${n}" class="count-option ${state.count===n?'active':''}" aria-pressed="${state.count===n}">${n}<span>spørsmål</span></button>`).join('')}</div>
      <button type="button" class="cta-button" data-action="create">Lag min quiz <span>${icon('arrow',22)}</span></button>
      <p class="setup-footnote">${icon('music',16)} 2 poeng per låt: artist + tilleggsspørsmål. Låtene åpnes via vanlige Spotify-lenker.</p></section>
      <section class="how-panel"><div class="how-icon">${icon('music',22)}</div><div><h3>Slik fungerer det</h3><p>Spill sangen, la deltakerne gjette artisten (1 poeng), og les opp tilleggsspørsmålet (1 poeng). Du styrer begge fasitsvarene fra mobilen.</p></div></section>`;
  }
  function renderQuiz() {
    const songs=currentSongs(), total=songs.length, opened=state.visited.length;
    const selected = state.active>=0 ? songs[state.active] : null;
    const nav=songs.map((s,i)=>{
      const seen=state.visited.includes(i),active=state.active===i;
      return `<a href="${spotifyUrl(s)}" target="laatquizSpotify" data-action="open-question" data-index="${i}" class="question-tab ${seen?'done':''} ${active?'active':''}" aria-label="Spørsmål ${i+1}: Åpne låt i Spotify" ${active?'aria-current="step"':''}><span>${pad(i+1)}</span>${seen?'<i aria-hidden="true"></i>':''}</a>`;
    }).join('');
    let content;
    if (state.finished) {
      content=`<div class="end-card"><div class="end-icon">✳</div><p class="section-kicker">FERDIG!</p><h2>For en låtliste.</h2><p>Du har kommet til slutten av quizen. Kjør en runde til med nye spørsmål, eller gå tilbake og åpne en av låtene på nytt.</p><button type="button" class="cta-button" data-action="create">Lag ny quiz ${icon('arrow',22)}</button><button type="button" class="text-button" data-action="finish-back">Tilbake til spørsmålene</button></div>`;
    } else if (!selected) {
      content=`<div class="empty-card"><div class="empty-disc">${icon('play',33)}</div><span class="section-kicker">KLAR FOR FØRSTE LÅT?</span><h2>Velg et nummer<br>for å starte.</h2><p>Når du trykker på et spørsmål, åpnes sangen i Spotify. Gå deretter tilbake hit for å lese spørsmålet.</p><a href="${spotifyUrl(songs[0])}" target="laatquizSpotify" class="cta-button" data-action="open-question" data-index="0">Åpne spørsmål 01 ${icon('arrow',22)}</a></div>`;
    } else {
      const revealed=state.revealed.includes(state.active);
      content=`<article class="song-panel"><div class="song-accent"></div><div class="song-head"><span class="eyebrow-label">NÅ SPILLER VI</span><span class="song-index">${pad(state.active+1)} <span>/ ${pad(total)}</span></span></div>
        <div class="song-main"><div class="song-illustration" aria-hidden="true"><div class="mini-vinyl"><div></div></div><span>${icon('music',23)}</span></div><div class="song-details">${revealed
          ? `<span class="song-caption">LÅTEN VI SPILTE</span><h2>${html(selected.title)}</h2><p>${html(selected.artist)}</p><span class="year-label">${selected.year}</span>`
          : `<span class="song-caption">LÅT ${pad(state.active+1)} · 2 POENG</span><h2>Hemmelig artist</h2><p>Artist og sangtittel er skjult frem til fasiten vises.</p>`}</div></div>
        <a class="play-link" href="${spotifyUrl(selected)}" target="laatquizSpotify" data-action="open-question" data-index="${state.active}"><span class="play-link-icon">${icon('play',20)}</span><span>${selected.spotifyId?'Åpne låten i Spotify':'Finn låten i Spotify'}</span>${icon('external',18)}</a>
        ${!selected.spotifyId?'<p class="search-note">Denne låten bruker Spotify-søk. Velg riktig innspilling i trefflisten.</p>':''}
      </article>
      <article class="question-card"><div class="question-card-top"><span class="eyebrow-label">TO MULIGE POENG</span><span class="question-bubble">2</span></div>
        <div class="quiz-question-one"><span class="question-step-label">1 POENG · ARTIST</span><h3>Hvilken artist eller gruppe hører vi?</h3></div>
        <div class="quiz-question-two"><span class="question-step-label">1 POENG · TILLEGGS­SPØRSMÅL</span><h2>${html(selected.question)}</h2></div>
        <div class="answer-wrap ${revealed?'visible':''}">${revealed?`<p class="answer-label">${icon('check',18)} FASIT · MAKS 2 POENG</p><p class="answer-text"><span>Artist / gruppe</span>${html(selected.artist)}</p><p class="answer-text answer-extra"><span>Tilleggsspørsmål</span>${html(selected.answer)}</p>`:''}</div>
        <button type="button" class="answer-button" data-action="answer" aria-expanded="${revealed}">${icon(revealed?'close':'eye',19)} ${revealed?'Skjul fasit':'Vis begge svarene'}</button></article>
      <div class="quiz-actions"><button type="button" class="secondary-button" data-action="replace">${icon('shuffle',17)} Bytt låt</button>${state.active<total-1
        ?`<a href="${spotifyUrl(songs[state.active+1])}" target="laatquizSpotify" class="next-button" data-action="open-question" data-index="${state.active+1}">Neste spørsmål ${icon('arrow',18)}</a>`
        :`<button type="button" class="next-button" data-action="finish">Avslutt quiz ${icon('check',18)}</button>`}</div>`;
    }
    app.innerHTML=`<section class="quiz-layout"><div class="quiz-topline"><button type="button" class="back-button" data-action="home">${icon('back',17)} Oppsett</button><span class="quiz-top-chip">${html(cat().name)}</span></div>
      <div class="quiz-title-row"><div><p class="section-kicker">DIN MUSIKKQUIZ · MAKS ${total*2} POENG</p><h1>La musikken spille<span class="title-period">.</span></h1></div><button type="button" class="circle-button" data-action="restart" aria-label="Lag en helt ny quiz" title="Ny tilfeldig quiz">${icon('refresh',21)}</button></div>
      <div class="progress-block"><div class="progress-caption"><span>${opened} av ${total} spørsmål åpnet</span><strong>${Math.round(opened/total*100)} %</strong></div><div class="progress-track" role="progressbar" aria-label="Fremdrift" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${opened}"><span style="width:${opened/total*100}%"></span></div></div>
      <div class="question-nav-head"><span>VELG SPØRSMÅL</span><span>${icon('list',16)} Trykk for å åpne låt</span></div>
      <nav class="question-nav" aria-label="Quiz-spørsmål">${nav}</nav>
      <div class="question-stage">${content}</div>
      <p class="quiz-bottom-tip">Spotify: På laptop gjenbrukes normalt samme Spotify-fane. På mobil kan lenkene åpne Spotify-appen. Gå tilbake til LåtQuiz for å lese spørsmålet.</p></section>`;
  }
  function render() {
    if (state.screen==='quiz' && state.quizIds.length) renderQuiz(); else renderSetup();
  }
  function goHome() {
    if (state.screen==='quiz' && state.visited.length && !confirm('Gå tilbake til oppsett? Quizen blir liggende lagret til du lager en ny.')) return;
    state.screen='setup'; save();render();window.scrollTo(0,0);
  }

  document.addEventListener('click', event => {
    const target=event.target.closest('[data-action]');
    if (!target) return;
    const action=target.dataset.action;
    if (action==='open-question') {select(Number(target.dataset.index));return;}
    event.preventDefault();
    switch(action) {
      case 'category': state.category=target.dataset.value;save();render();break;
      case 'count': state.count=Number(target.dataset.value);save();render();break;
      case 'create': newQuiz();break;
      case 'restart': if(confirm('Generere en ny quiz med nye sanger og spørsmål?')) newQuiz();break;
      case 'home': goHome();break;
      case 'answer': {
        const index=state.active;
        state.revealed=state.revealed.includes(index)?state.revealed.filter(i=>i!==index):[...state.revealed,index];
        save();render();break;
      }
      case 'replace':replaceSong();break;
      case 'finish':state.finished=true;save();render();window.scrollTo({top:0,behavior:'smooth'});break;
      case 'finish-back':state.finished=false;save();render();break;
    }
  });
  document.getElementById('brand-link').addEventListener('click', event => {event.preventDefault();goHome();});
  render();
})();
