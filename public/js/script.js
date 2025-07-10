document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTI DEL DOM ---
    const sprite = document.getElementById('sprite1');
    const bubble = document.getElementById('bubble1');
    const animationScreen = document.getElementById('animation-screen');
    const fruitContainer = document.getElementById('fruit-container');
    const fruitImage = document.getElementById('fruit-image');
    const feedButton = document.getElementById('feed-button');
    const fruitCounter = document.getElementById('fruit-counter');

    if (!sprite || !animationScreen || !feedButton) {
        console.error("Elementi essenziali dell'animazione non trovati!");
        return;
    }

    // --- ASSETS ---
    const digitalFruits = [
        'digital_apple.png', 'digital_banana.png', 'digital_berry.png', 'digital_blueberry.png',
        'digital_cherry.png', 'digital_coconut.png', 'digital_dragonfruit.png', 'digital_grapes.png',
        'digital_kiwi.png', 'digital_lemon.png', 'digital_melon.png', 'digital_orange.png',
        'digital_papaya.png', 'digital_peach.png', 'digital_pear.png', 'digital_pineapple.png',
        'digital_strawberry.png', 'digital_watermelon.png'
    ];
    const donkeyComments = [
        "Yummy!", "Delicious!", "More fruits, please!", "Digested!", "digitalFruits!"
    ];
    const sfx = {
        eat: new Audio('assets/sfx/sfx_donkey_eat.ogg'),
        digest: new Audio('assets/sfx/sfx_donkey_digest.ogg'),
        comment: new Audio('assets/sfx/sfx_donkey_comment.ogg')
    };

    // --- STATO DELL'ANIMAZIONE ---
    const centerPos = { x: animationScreen.offsetWidth / 2, y: animationScreen.offsetHeight / 2 };
    let state = {
        fruitEatenCount: 0,
        isMoving: false,
        isDigesting: false,
        currentFrame: 0,
        animationInterval: null,
        donkeyPos: { ...centerPos },
        fruitPos: { x: 0, y: 0 }
    };
    sprite.style.left = `${state.donkeyPos.x}px`;
    sprite.style.top = `${state.donkeyPos.y}px`;

    // --- FUNZIONI DI ANIMAZIONE DELLO SPRITE ---
    const setSpriteAnimation = (spriteElement, spriteSheet, frameCount, frameRate, stateObject) => {
        clearInterval(stateObject.animationInterval);
        spriteElement.style.backgroundImage = `url('assets/images/${spriteSheet}')`;
        stateObject.animationInterval = setInterval(() => {
            stateObject.currentFrame = (stateObject.currentFrame + 1) % frameCount;
            spriteElement.style.backgroundPosition = `${-stateObject.currentFrame * 64}px 0px`;
        }, frameRate);
    };
    
    const startIdleAnimation = () => setSpriteAnimation(sprite, 'donkey-dev-sprite.png', 5, 200, state);
    const startDigestionAnimation = () => setSpriteAnimation(sprite, 'donkey-digest-sprite.png', 9, 3000 / 9, state);

    // --- FUNZIONI DI GIOCO ---
    const showBubble = (bubbleElement, message) => {
        bubbleElement.textContent = message;
        bubbleElement.classList.add('visible');
        sfx.comment.play();
        setTimeout(() => bubbleElement.classList.remove('visible'), 2500);
    };

    const updateCounter = () => {
        fruitCounter.textContent = `Fruits eaten: ${state.fruitEatenCount} / 5`;
    };

    const handleDigestion = () => {
        state.isDigesting = true;
        feedButton.disabled = true;
        
        startDigestionAnimation();
        sfx.digest.play();

        // Dopo l'animazione di digestione
        setTimeout(() => {
            startIdleAnimation();
            showBubble(bubble, donkeyComments[Math.floor(Math.random() * donkeyComments.length)]);
            
            // Dopo che il commento è sparito
            setTimeout(() => {
                state.fruitEatenCount = 0;
                updateCounter();
                state.isDigesting = false;
                feedButton.disabled = false;
            }, 2600); // Attende la fine della nuvoletta

        }, 3000); // Durata animazione digestione
    };
    
    const returnToCenter = () => {
        const dx = centerPos.x - state.donkeyPos.x;
        const dy = centerPos.y - state.donkeyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) { // L'asino è tornato al centro
            state.donkeyPos = { ...centerPos };
            sprite.style.left = `${state.donkeyPos.x}px`;
            sprite.style.top = `${state.donkeyPos.y}px`;
            state.isMoving = false;

            // Controlla se deve partire la digestione
            if (state.fruitEatenCount >= 5) {
                handleDigestion();
            } else {
                feedButton.disabled = false; // Riabilita il pulsante per il prossimo frutto
            }
            return;
        }

        const speed = 3;
        state.donkeyPos.x += (dx / distance) * speed;
        state.donkeyPos.y += (dy / distance) * speed;
        sprite.style.left = `${state.donkeyPos.x}px`;
        sprite.style.top = `${state.donkeyPos.y}px`;
        
        sprite.classList.toggle('flipped', dx < 0);
        requestAnimationFrame(returnToCenter);
    };

    const moveToFruit = () => {
        const dx = state.fruitPos.x - state.donkeyPos.x;
        const dy = state.fruitPos.y - state.donkeyPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) { // L'asino ha raggiunto il frutto
            fruitContainer.style.display = 'none';
            sfx.eat.play();
            state.fruitEatenCount++;
            updateCounter();
            returnToCenter(); // Torna al centro dopo aver mangiato
            return;
        }

        const speed = 3;
        state.donkeyPos.x += (dx / distance) * speed;
        state.donkeyPos.y += (dy / distance) * speed;
        sprite.style.left = `${state.donkeyPos.x}px`;
        sprite.style.top = `${state.donkeyPos.y}px`;

        sprite.classList.toggle('flipped', dx < 0);
        requestAnimationFrame(moveToFruit);
    };

    feedButton.addEventListener('click', () => {
        if (state.isMoving || state.isDigesting) return;

        feedButton.disabled = true;
        state.isMoving = true;

        const randomFruit = digitalFruits[Math.floor(Math.random() * digitalFruits.length)];
        fruitImage.src = `assets/images/digital_fruits/${randomFruit}`;
        
        const padding = 50;
        state.fruitPos.x = Math.random() * (animationScreen.offsetWidth - padding);
        state.fruitPos.y = Math.random() * (animationScreen.offsetHeight - padding);
        
        fruitContainer.style.left = `${state.fruitPos.x}px`;
        fruitContainer.style.top = `${state.fruitPos.y}px`;
        fruitContainer.style.display = 'block';

        moveToFruit();
    });

    // --- INIZIO GIOCO PRINCIPALE---
    startIdleAnimation();

    // --- NUOVE SEZIONI INTERATTIVE ---
    const setupInteractiveDonkey = (donkeyId, bubbleId, idleSprite, commentSprite, comments) => {
        const donkeyElement = document.getElementById(donkeyId);
        const bubbleElement = document.getElementById(bubbleId);
        
        if (!donkeyElement || !bubbleElement) {
            console.error(`Elementi per ${donkeyId} non trovati!`);
            return;
        }

        const donkeyState = {
            isCommenting: false,
            currentFrame: 0,
            animationInterval: null,
        };

        const idleFrameCount = 5;
        const commentFrameCount = 9;
        const commentDuration = 2500;

        const startIdle = () => setSpriteAnimation(donkeyElement, idleSprite, idleFrameCount, 200, donkeyState);
        const startComment = () => setSpriteAnimation(donkeyElement, commentSprite, commentFrameCount, commentDuration / commentFrameCount, donkeyState);

        donkeyElement.parentElement.addEventListener('click', () => {
            if (donkeyState.isCommenting) return;

            donkeyState.isCommenting = true;
            
            const randomComment = comments[Math.floor(Math.random() * comments.length)];
            bubbleElement.textContent = randomComment;
            bubbleElement.classList.add('visible');
            sfx.comment.play();
            startComment();

            setTimeout(() => {
                bubbleElement.classList.remove('visible');
                startIdle();
                setTimeout(() => {
                     donkeyState.isCommenting = false;
                }, 100); 
            }, commentDuration);
        });
        
        startIdle();
    };

    // Setup Mission Donkey (Chiptune)
    const missionDonkeyComments = [
        "Hand-composed OST!",
        "I love chiptune!",
        "Is that an 8-bit blip?",
        "combatCode is my fav!"
    ];
    setupInteractiveDonkey(
        'mission-donkey', 
        'mission-donkey-bubble', 
        'mission_legend_donkey_idle.png', 
        'mission_legend_donkey_comment.png', 
        missionDonkeyComments
    );

    // Setup Dev Donkey (Features)
    const devDonkeyComments = [
        "JavaScript!",
        "You can play everywhere!",
        "No internet connection req!",
        "Fast gameplay and lot's of enemies!",
        "Bosses!",
        "The engineer was good!"
    ];
    setupInteractiveDonkey(
        'dev-donkey', 
        'dev-donkey-bubble', 
        'dev_donkey_idle.png', 
        'dev_donkey_comment.png', 
        devDonkeyComments
    );
    // --- NUOVA FUNZIONE PER FRUTTI FLUTTUANTI ---
    const setupFloatingFruits = () => {
        const container = document.getElementById('floating-fruits-container');
        if (!container) return;

        // Selezioniamo 6 frutti casuali dalla lista esistente
        const shuffledFruits = [...digitalFruits].sort(() => 0.5 - Math.random());
        const fruitsToDisplay = shuffledFruits.slice(0, 6);

        const fruitElements = [];

        fruitsToDisplay.forEach(fruitName => {
            const img = document.createElement('img');
            img.src = `assets/images/digital_fruits/${fruitName}`;
            img.classList.add('floating-fruit');
            // Aggiungiamo dati custom per sfalsare l'animazione di ogni frutto
            img.dataset.offset = Math.random() * Math.PI * 2;
            container.appendChild(img);
            fruitElements.push(img);
        });

        const amplitude = 8; // Escursione del movimento (8px su e 8px giù)
        const speed = 0.01;  // MODIFICATO: Velocità dell'animazione (più basso = più lento)

        function animateFruits() {
            // Usiamo il tempo per creare un'oscillazione continua
            const time = Date.now() * speed;

            fruitElements.forEach(fruit => {
                const offset = parseFloat(fruit.dataset.offset);
                // Calcoliamo la nuova posizione Y con una sinusoide
                const y = Math.sin(time + offset) * amplitude;
                fruit.style.transform = `translateY(${y}px)`;
            });

            // Richiama il prossimo frame dell'animazione
            requestAnimationFrame(animateFruits);
        }

        // Avvia l'animazione
        animateFruits();
    };

    // Chiamiamo la nuova funzione per attivare i frutti
    setupFloatingFruits();

});