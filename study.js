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
        const now = new Date();

        let daysToAdd = 1;
        if (currentCard.easeFactor === 1) {
            daysToAdd = 3;
        } else if (currentCard.easeFactor === 2) {
            daysToAdd = 7;
        } else if (currentCard.easeFactor === 3) {
            daysToAdd = 14;
        } else if (currentCard.easeFactor === 4) {
            daysToAdd = 30;
        }

        now.setDate(now.getDate() + daysToAdd);
        return now.toISOString();
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

            current.lastReviewed = new Date().toISOString();
            current.timesReviewed = (current.timesReviewed || 0) + 1;
            current.consecutiveMistakes = 0;
            current.easeFactor = (current.easeFactor || 0) + 1;
            current.nextReview = nextReview(current);

            // save updated data
            allSets[currentSetName][currentCardIndex] = current;
            localStorage.setItem("flashcardSets", JSON.stringify(allSets));

            // next card
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
        });

        // incorrect button
        li.querySelector(".wrong-answer").addEventListener("click", (e) => {
            e.stopPropagation();

            // revert to daily or one previous depending on consecutive mistakes
            current.lastReviewed = new Date().toISOString();
            current.timesReviewed = (current.timesReviewed || 0) + 1;
            current.consecutiveMistakes = (current.consecutiveMistakes || 0) + 1;
            if (current.consecutiveMistakes === 2) {
                current.easeFactor = 0;
            } else {
                current.easeFactor = Math.max((current.easeFactor || 1) - 1, 0);
            }
            current.nextReview = nextReview(current);

            // save updated data
            allSets[currentSetName][currentCardIndex] = current;
            localStorage.setItem("flashcardSets", JSON.stringify(allSets));

            // next card
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
        });


        cardList.appendChild(li);
    }

    // quiz function
    // pre-exam intervals

    renderSetList();
});