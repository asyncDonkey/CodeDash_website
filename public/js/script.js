document.addEventListener('DOMContentLoaded', () => {

    // --- IMPOSTAZIONI DELLO SPRITE ---
    const spriteElement = document.getElementById('sprite1');
    const bubbleElement = document.getElementById('bubble1');
    
    // Controlla se gli elementi esistono prima di procedere
    if (!spriteElement || !bubbleElement) {
        console.error("Elementi dello sprite non trovati!");
        return;
    }

    // Parametri dell'animazione
    const frameCount = 5; // Numero di frame nel tuo spritesheet
    const frameWidth = 64; // Larghezza di un singolo frame
    const animationSpeed = 150; // Millisecondi tra un frame e l'altro

    // Parametri del movimento
    let position = 0;
    let direction = 1; // 1 = destra, -1 = sinistra
    const movementSpeed = 1.5;

    // Messaggi per la nuvoletta
    const messages = [
        "please try the game: there are no ADS!",
        "the game is totally free and funny!",
        "CodeDash!",
        "i have to Dash!"
    ];

    let currentFrame = 0;

    // --- FUNZIONE PER ANIMARE I FRAME DELLO SPRITE ---
    setInterval(() => {
        currentFrame = (currentFrame + 1) % frameCount;
        const backgroundPositionX = -currentFrame * frameWidth;
        spriteElement.style.backgroundPosition = `${backgroundPositionX}px 0px`;
    }, animationSpeed);


    // --- FUNZIONE PER IL MOVIMENTO ORIZZONTALE ---
    function moveSprite() {
        const containerWidth = spriteElement.parentElement.offsetWidth;
        const spriteWidth = spriteElement.offsetWidth;

        position += movementSpeed * direction;

        // Inverti la direzione quando tocca i bordi
        if (position > containerWidth - spriteWidth || position < 0) {
            direction *= -1;
        }

        spriteElement.style.left = `${position}px`;
        
        // Continua il ciclo di animazione del movimento
        requestAnimationFrame(moveSprite);
    }

    // --- FUNZIONE PER GESTIRE LE NUVOLETTE ---
    function manageSpeechBubble() {
        // Nascondi sempre la nuvoletta all'inizio
        bubbleElement.classList.remove('visible');

        // Decidi casualmente se mostrare una nuvoletta
        const shouldShow = Math.random() < 0.2; // 20% di probabilità di mostrare la nuvoletta ogni tot secondi

        if (shouldShow) {
            // Scegli un messaggio casuale
            const randomIndex = Math.floor(Math.random() * messages.length);
            bubbleElement.textContent = messages[randomIndex];
            bubbleElement.classList.add('visible');

            // Nascondi la nuvoletta dopo qualche secondo
            setTimeout(() => {
                bubbleElement.classList.remove('visible');
            }, 4000); // La nuvoletta resta visibile per 4 secondi
        }
        
        // Riprova dopo un intervallo di tempo casuale
        const nextCheck = Math.random() * 5000 + 4000; // Tra 4 e 9 secondi
        setTimeout(manageSpeechBubble, nextCheck);
    }


    // --- AVVIO DELLE ANIMAZIONI ---
    moveSprite(); // Avvia il movimento
    setTimeout(manageSpeechBubble, 2000); // Avvia le nuvolette dopo 2 secondi

});