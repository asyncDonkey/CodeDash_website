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
        "Yummy!", "Delicious!", "More fruits, please!", "That was refreshing!", "My favorite!"
    ];
    const sfx = {
        eat: new Audio('assets/sfx/sfx_donkey_eat.ogg'),
        digest: new Audio('assets/sfx/sfx_donkey_digest.ogg'),
        comment: new Audio('assets/sfx/sfx_donkey_comment.ogg')
    };

    // --- STATO DELL'ANIMAZIONE ---
    let state = {
        fruitEatenCount: 0,
        isMoving: false,
        isDigesting: false,
        currentFrame: 0,
        animationInterval: null,
        donkeyPos: { x: animationScreen.offsetWidth / 2, y: animationScreen.offsetHeight / 2 },
        fruitPos: { x: 0, y: 0 }
    };
    sprite.style.left = `${state.donkeyPos.x}px`;
    sprite.style.top = `${state.donkeyPos.y}px`;

    // --- FUNZIONI DI ANIMAZIONE DELLO SPRITE ---
    const setSpriteAnimation = (spriteSheet, frameCount, frameRate) => {
        clearInterval(state.animationInterval);
        sprite.style.backgroundImage = `url('assets/images/${spriteSheet}')`;
        state.animationInterval = setInterval(() => {
            state.currentFrame = (state.currentFrame + 1) % frameCount;
            sprite.style.backgroundPosition = `${-state.currentFrame * 64}px 0px`;
        }, frameRate);
    };

    const startIdleAnimation = () => setSpriteAnimation('donkey-dev-sprite.png', 5, 200);
    const startDigestionAnimation = () => setSpriteAnimation('donkey-digest-sprite.png', 9, 3000 / 9);

    // --- FUNZIONI DI GIOCO ---
    const showBubble = (message) => {
        bubble.textContent = message;
        bubble.classList.add('visible');
        sfx.comment.play();
        setTimeout(() => bubble.classList.remove('visible'), 2500);
    };

    const updateCounter = () => {
        fruitCounter.textContent = `Fruits eaten: ${state.fruitEatenCount} / 5`;
    };

    const handleDigestion = () => {
        state.isDigesting = true;
        feedButton.disabled = true;
        
        startDigestionAnimation();
        sfx.digest.play();

        setTimeout(() => {
            startIdleAnimation();
            showBubble(donkeyComments[Math.floor(Math.random() * donkeyComments.length)]);
            
            setTimeout(() => {
                state.fruitEatenCount = 0;
                updateCounter();
                state.isDigesting = false;
                feedButton.disabled = false;
            }, 2600); // Attende la fine della nuvoletta

        }, 3000); // Durata animazione digestione
    };

    // --- NUOVA FUNZIONE PER TORNARE AL CENTRO ---
    const returnToCenter = () => {
        state.isMoving = true; // L'asino si sta ancora muovendo
        const centerX = animationScreen.offsetWidth / 2;
        const centerY = animationScreen.offsetHeight / 2;

        const moveStep = () => {
            const dx = centerX - state.donkeyPos.x;
            const dy = centerY - state.donkeyPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 5) { // L'asino è arrivato al centro
                state.isMoving = false;
                sprite.classList.remove('flipped'); // Si gira in avanti

                // Ora decide cosa fare
                if (state.fruitEatenCount >= 5) {
                    handleDigestion();
                } else {
                    feedButton.disabled = false;
                }
                return; // Ferma il ciclo di movimento
            }

            // Muove l'asino
            const speed = 3;
            state.donkeyPos.x += (dx / distance) * speed;
            state.donkeyPos.y += (dy / distance) * speed;
            sprite.style.left = `${state.donkeyPos.x}px`;
            sprite.style.top = `${state.donkeyPos.y}px`;
            sprite.classList.toggle('flipped', dx < 0);

            requestAnimationFrame(moveStep);
        };
        moveStep();
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
            
            // MODIFICA: Invece di agire subito, torna al centro
            returnToCenter();

            return; // Ferma questo ciclo di movimento
        }

        // Muove l'asino
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

        // Genera un frutto
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

    // --- INIZIO ---
    startIdleAnimation();
});
