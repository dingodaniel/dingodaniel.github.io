document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const unitNumber = urlParams.get('unit');

    // Variabili per la gestione dell'audio globale
    let currentUnitData = null;
    let currentSectionIndex = -1;
    const globalAudioPlayer = document.getElementById('global-audio-player');
    const currentSectionTitle = document.getElementById('current-section-title');
    const prevAudioBtn = document.getElementById('prev-audio');
    const nextAudioBtn = document.getElementById('next-audio');

    // Listener per i pulsanti Precedente/Successivo
    prevAudioBtn.addEventListener('click', () => playPrevSection());
    nextAudioBtn.addEventListener('click', () => playNextSection());

    // Funzione per riprodurre una sezione specifica
    function playSection(sectionIndex) {
        if (!currentUnitData || sectionIndex < 0 || sectionIndex >= currentUnitData.sections.length) {
            return;
        }
        currentSectionIndex = sectionIndex;
        const section = currentUnitData.sections[currentSectionIndex];
        
        // Verifica se la traccia audio è disponibile (nome non nullo o vuoto)
        if (section.audio_track_name) {
            globalAudioPlayer.src = `audio/${section.audio_track_name}.mp3`;
            globalAudioPlayer.load(); // Carica la nuova sorgente
            globalAudioPlayer.play();
            currentSectionTitle.textContent = `Sezione Corrente: ${section.section_number.replace('section ', 'Sezione ')}`;
        } else {
            globalAudioPlayer.src = ''; // Nessun audio per questa sezione
            globalAudioPlayer.pause(); // Metti in pausa se non c'è audio
            currentSectionTitle.textContent = `Sezione Corrente: ${section.section_number.replace('section ', 'Sezione ')} (Nessun audio)`;
        }
        updateAudioControls(); // Aggiorna lo stato dei pulsanti
    }

    // Funzioni per la navigazione
    function playPrevSection() {
        if (currentSectionIndex > 0) {
            playSection(currentSectionIndex - 1);
        }
    }

    function playNextSection() {
        if (currentUnitData && currentSectionIndex < currentUnitData.sections.length - 1) {
            playSection(currentSectionIndex + 1);
        }
    }

    // Aggiorna lo stato dei pulsanti di navigazione audio
    function updateAudioControls() {
        prevAudioBtn.disabled = currentSectionIndex <= 0;
        nextAudioBtn.disabled = !currentUnitData || currentSectionIndex >= currentUnitData.sections.length - 1;
    }

    // Carica i dati dell'unità dal JSON
    async function loadUnitData(unitNumber) {
        try {
            const response = await fetch('data/data.json'); // Assicurati che il percorso sia corretto (data/data.json o data/json.txt)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const unitData = data.find(unit => unit.unit == unitNumber);

            if (unitData) {
                currentUnitData = unitData; // Salva i dati dell'unità per la navigazione audio
                renderUnitContent(unitData);
                // Inizializza il player con la prima sezione dell'unità caricata
                if (unitData.sections.length > 0) {
                    playSection(0);
                }
            } else {
                document.getElementById('unit-content').innerHTML = '<p>Unità non trovata.</p>';
            }

        } catch (error) {
            console.error("Errore nel caricamento del JSON:", error);
            document.getElementById('unit-content').innerHTML = '<p>Errore nel caricamento dei dati dell\'unità. Controlla la console per maggiori dettagli.</p>';
        }
    }

    // Rende il contenuto dell'unità nella pagina
    function renderUnitContent(unitData) {
        const unitContentDiv = document.getElementById('unit-content');
        unitContentDiv.innerHTML = `<h2>Unità ${unitData.unit}</h2>`;

        unitData.sections.forEach((section, index) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.classList.add('section');
            
            // QUESTA PARTE È STATA RIMOssa o commentata:
            // if (section.audio_track_name) {
            //     sectionHtml += `
            //         <audio controls>
            //             <source src="audio/${section.audio_track_name}.mp3" type="audio/mpeg">
            //             Il tuo browser non supporta l'elemento audio.
            //         </audio>
            //     `;
            // }
            // Invece, ora il player è globale e si controlla tramite JS.
            // Aggiungiamo un link al titolo della sezione per riprodurre l'audio nel player globale.
            let sectionHtml = `<h3><a href="#" data-section-index="${index}">${section.section_number.replace('section ', 'Sezione ')}</a></h3>`;

            sectionHtml += `<div class="dialogue-list">`;
            
            section.dialogues.forEach(dialogue => {
                let context = dialogue.context ? `<span class="context">(${dialogue.context})</span>` : '';
                let location = dialogue.location ? `<p class="location">${dialogue.location}</p>` : '';

                sectionHtml += `
                    <div class="dialogue-item">
                        <p class="dialogue-number">${dialogue.dialogue_number} ${context}</p>
                        ${location}
                        <p class="japanese-dialogue">${dialogue.japanese_dialogue.replace(/\n/g, '<br>')}</p>
                        <div class="translations">
                            <p class="english">${dialogue.translations.english.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                `;
            });
            sectionHtml += `</div>`; // Chiudi dialogue-list
            sectionDiv.innerHTML = sectionHtml;
            unitContentDiv.appendChild(sectionDiv);
        });

        // Aggiungi event listeners ai titoli delle sezioni per riprodurre l'audio
        document.querySelectorAll('.section h3 a').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Impedisce il comportamento di default del link
                const sectionIndex = parseInt(event.target.dataset.sectionIndex);
                playSection(sectionIndex);
            });
        });
    }

    // Inizializza il caricamento dei dati quando la pagina è pronta
    if (unitNumber) {
        loadUnitData(unitNumber);
    }
});