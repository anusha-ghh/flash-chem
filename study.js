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
            </div>
        `;

        li.querySelector(".card-inner").addEventListener("click", () => {
            li.querySelector(".card-inner").classList.toggle("flipped");
        });

        li.querySelector(".prev-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex > 0) {
                currentCardIndex--;
                renderCard();
            }
        });

        li.querySelector(".next-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCard();
            }
        });

        cardList.appendChild(li);
    }

    renderSetList();
});