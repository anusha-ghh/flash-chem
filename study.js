document.addEventListener("DOMContentLoaded", () => {
    const setListContainer = document.getElementById("set-list");
    const startScreen = document.getElementById("start-screen");
    const cardFormSection = document.getElementById("card-form-section");
    const cardList = document.getElementById("card-list");

    let currentSetName = null;
    let currentCardIndex = 0;

    // render the list of flashcard sets
    function renderSetList() {
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const setNames = Object.keys(allSets);

        setListContainer.innerHTML = "";

        if (setNames.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "You haven't created any flashcard sets yet.";
            setListContainer.appendChild(emptyMsg);
            return;
        }

        setNames.forEach(setName => {
            const box = document.createElement("div");
            box.className = "set-box";
            box.textContent = setName;

            box.addEventListener("click", () => {
                selectSet(setName);
                startScreen.classList.add("hidden");
            });

            setListContainer.appendChild(box);
        });
    }

    // Show selected flashcard set
    function selectSet(setName) {
        currentSetName = setName;
        currentCardIndex = 0;
        cardFormSection.classList.remove("hidden");
        renderCard();
    }


    // Next review date
    function nextReview(currentCard) {
        // date
        const now = new Date();

        // daily
        if (currentCard.easeFactor === 0) {
            return now + 1;
        }
        else if (currentCard.easeFactor === 1) {
            return now + 3;
        }
        else if (currentCard.easeFactor === 2) {
            return now + 7;
        }
        else if (currentCard.easeFactor === 3) {
            return now + 14;
        }
        else if (currentCard.easeFactor === 4) {
            return now + 30;
        }
        return currentCard;
    }

    // Render one flashcard at a time
    function renderCard() {
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const cards = allSets[currentSetName] || [];

        cardList.innerHTML = "";

        if (cards.length === 0) {
            cardList.textContent = "No cards in this set yet.";
            return;
        }

        // date
        new Date();

        if (currentCardIndex < 0) currentCardIndex = 0;
        if (currentCardIndex >= cards.length) currentCardIndex = cards.length - 1;

        // only show ones due for review
        while (currentCardIndex < cards.length) {
            const nextDate = new Date(cards[currentCardIndex].nextReview);
            const today = new Date();

            // due, stop loop
            if (nextDate <= today) break;

            // skip to next card
            currentCardIndex++;
        }

        // no due cards left
        if (currentCardIndex >= cards.length) {
            cardList.textContent = "🎉 All cards reviewed for today!";
            return;
        }

        const { question, answer } = cards[currentCardIndex];

        const li = document.createElement("li");
        li.className = "card-item";

        li.innerHTML = `
            <div class="card-layout">
                <div class="card-row">
                    <div class="card-nav-left">
                        <button class="prev-card">←</button>
                    </div>
                    <div class="card-inner">
                        <div class="card-front">${question}</div>
                        <div class="card-back">${answer}</div>
                    </div>
                    <div class="card-nav-right">
                        <button class="next-card">→</button>
                    </div>
                </div>
                    <div class="card-buttons">
      <button class="correct-answer">Correct</button>
      <button class="wrong-answer">Incorrect</button>
    </div>
            </div>
        `;

        const current = cards[currentCardIndex];

        li.querySelector(".card-inner").addEventListener("click", () => {
            li.querySelector(".card-inner").classList.toggle("flipped");
        });

        // previous button
        li.querySelector(".prev-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex > 0) {
                currentCardIndex--;
                renderCard();
            }
        });

        // next button
        li.querySelector(".next-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
        });

        // correct button
        li.querySelector(".correct-answer").addEventListener("click", (e) => {
            e.stopPropagation();

            current.lastReviewed = now;
            current.timesReviewed++;
            current.consecutiveMistakes = 0;
            current.easeFactor += 1;
            current.nextReview = nextReview(current);

            // next card
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
            localStorage.setItem("flashcardSets", JSON.stringify(allSets));
        });

        // incorrect button
        li.querySelector(".wrong-answer").addEventListener("click", (e) => {
            e.stopPropagation();

            // revert to daily or one previous depending on consecutive mistakes
            current.lastReviewed = now;
            current.timesReviewed++;
            current.consecutiveMistakes++;
            if (current.consecutiveMistakes === 2) {
                current.easeFactor = 0;
            } else {
                current.easeFactor -= 1;
            }
            current.nextReview = nextReview(current);

            // next card
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
            localStorage.setItem("flashcardSets", JSON.stringify(allSets));
        });


        cardList.appendChild(li);
    }

    renderSetList();
});