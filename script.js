document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const unitNumber = urlParams.get('unit');

    if (unitNumber) {
        document.title = `Unità ${unitNumber} - Lezioni di Giapponese`;
        document.getElementById('unit-title').textContent = `Unità ${unitNumber}`;
        loadUnitData(unitNumber);
    }
});

async function loadUnitData(unitNumber) {
    try {
        const response = await fetch('data.json'); // Assicurati che il percorso sia corretto
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const unitData = data.find(unit => unit.unit == unitNumber);

        if (unitData) {
            renderUnitContent(unitData);
        } else {
            document.getElementById('unit-content').innerHTML = '<p>Unità non trovata.</p>';
        }

    } catch (error) {
        console.error("Errore nel caricamento del JSON:", error);
        document.getElementById('unit-content').innerHTML = '<p>Errore nel caricamento dei dati dell\'unità. Controlla la console per maggiori dettagli.</p>';
    }
}

function renderUnitContent(unitData) {
    const unitContentDiv = document.getElementById('unit-content');
    unitContentDiv.innerHTML = `<h2>Unità ${unitData.unit}</h2>`; // Ripristina il titolo dell'unità

    unitData.sections.forEach(section => {
        const sectionDiv = document.
            createElement('div');
        sectionDiv.classList.add('section');
        
        let sectionHtml = `<h3>Sezione ${section.section_number.replace('section ', '')}</h3>`; // Estrae solo il numero della sezione
        
        // Aggiungi il player audio
        if (section.audio_track_name) {
            sectionHtml += `
                <audio controls>
                    <source src="audio/${section.audio_track_name}.mp3" type="audio/mpeg">
                    Il tuo browser non supporta l'elemento audio.
                </audio>
            `;
        }

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
                        <p class="chinese">${dialogue.translations.chinese.replace(/\n/g, '<br>')}</p>
                        <p class="korean">${dialogue.translations.korean.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            `;
        });
        sectionHtml += `</div>`; // Chiudi dialogue-list
        sectionDiv.innerHTML = sectionHtml;
        unitContentDiv.appendChild(sectionDiv);
    });
}