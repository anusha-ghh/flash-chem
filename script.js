// let DOM load - login form
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login_form");

    // login form
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            // check for input
            const user = document.getElementById("username").value;
            const pass = document.getElementById("password").value;

            // credentials
            if (user === "asiatic" && pass === "amulet") {
                window.location.href = "usersets.html"; // move to next page
                localStorage.setItem("loggedIn", "true");
            } else {
                alert("Invalid username or password!"); // show error message
            }
        });
    }

    // add flashcards
    const setForm = document.getElementById("new-set-form");
    const setListContainer = document.getElementById("set-list");

    const startScreen = document.getElementById("start-screen");
    const setFormSection = document.getElementById("set-form-section");
    const showSetFormBtn = document.getElementById("show-set-form");

    // add a new set button
    showSetFormBtn.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        setFormSection.classList.remove("hidden");
    });

    if (setForm && setListContainer) {
        // redirect to log in if not logged in
        if (localStorage.getItem("loggedIn") !== "true") {
            window.location.href = "login.html";
        }

        setForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // check for input
            const setName = document.getElementById("set-name").value.trim();
            if (!setName) return;

            currentSetName = setName;
            //currentSetNameDisplay.textContent = `Add cards to "${setName}"`;

            // go through local storage and check if set alr exists
            const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
            if (allSets[setName]) {
                alert("Set already exists!");
                return;
            }

            // otherwise, add set
            allSets[setName] = [];
            localStorage.setItem("flashcardSets", JSON.stringify(allSets));
            document.getElementById("set-name").value = "";

            // hide form, show card form
            setFormSection.classList.add("hidden");
            cardFormSection.classList.remove("hidden");

            renderSetList();
        });

        renderSetList();
    }

    let currentCardIndex = 0;

    // show sets
    function renderSetList() {
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const setNames = Object.keys(allSets);

        setListContainer.innerHTML = "";

        // empty - no flashcard sets
        if (setNames.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "You haven't created any flashcard sets yet.";
            setListContainer.appendChild(emptyMsg);
            return;
        }

        // show flashcard sets
        setNames.forEach(setName => {
            const box = document.createElement("div");
            box.className = "set-box";

            // inner HTML with delete icon
            box.innerHTML = `
      <span class="set-name">${setName}</span>
      <button class="delete-set">🗑️</button>
      <button class="rename">EDIT</button>
    `;

            // click to select set
            box.querySelector(".set-name").addEventListener("click", () => {
                selectSet(setName);
                startScreen.classList.add("hidden");
            });

            // click to delete set
            box.querySelector(".delete-set").addEventListener("click", (e) => {
                e.stopPropagation();
                const proceed = confirm(`Delete the set "${setName}"?`);

                // go ahead
                if (proceed) {
                    // delete
                    const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
                    delete allSets[setName];
                    localStorage.setItem("flashcardSets", JSON.stringify(allSets));
                    renderSetList();
                }
            })


            setListContainer.appendChild(box);
        });
    }

    const cardFormSection = document.getElementById("card-form-section");
    const currentSetNameDisplay = document.getElementById("current-set-name");
    const cardList = document.getElementById("card-list");
    const addCardForm = document.getElementById("add-card-form");

    let currentSetName = null;

    // "Add Flashcard" button toggle
    const toggleAddFormBtn = document.getElementById("toggle-add-form");
    toggleAddFormBtn.addEventListener("click", () => {
        addCardForm.classList.toggle("hidden");
    });

    // find and show a set
    function selectSet(setName) {
        currentSetName = setName;
        currentCardIndex = 0;
        //currentSetNameDisplay.textContent = `Add cards to "${setName}"`;
        cardFormSection.classList.remove("hidden");
        renderCardList();
    }

    // show list of cards
    function renderCardList() {
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const cards = allSets[currentSetName] || [];

        cardList.innerHTML = "";

        if (cards.length === 0) {
            cardList.textContent = "No cards in this set yet.";
            return;
        }

        // clamp currentCardIndex between 0 and cards.length - 1
        if (currentCardIndex < 0) currentCardIndex = 0;
        if (currentCardIndex >= cards.length) currentCardIndex = cards.length - 1;

        const { question, answer } = cards[currentCardIndex];

        // create a single card element
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
      <button class="edit-card">Edit</button>
      <button class="delete-card">Delete</button>
    </div>
  </div>
`;

        // flip card on click
        li.querySelector(".card-inner").addEventListener("click", () => {
            li.querySelector(".card-inner").classList.toggle("flipped");
        });

        // previous button
        li.querySelector(".prev-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex > 0) {
                currentCardIndex--;
                renderCardList();
            }
        });

        // next button
        li.querySelector(".next-card").addEventListener("click", (e) => {
            e.stopPropagation();
            if (currentCardIndex < cards.length - 1) {
                currentCardIndex++;
                renderCardList();
            }
        });

        // edit button
        li.querySelector(".edit-card").addEventListener("click", (e) => {
            e.stopPropagation();

            // load
            const cards = JSON.parse(localStorage.getItem("flashcardSets"))[currentSetName];
            const card = cards[currentCardIndex];
            document.getElementById("editQuestion").value = card.question;
            document.getElementById("editAnswer").value = card.answer;

            // pop up window
            const popup = document.getElementById("editPopup");
            popup.classList.remove("hidden");

            // "save" clicked
            document.getElementById("saveEdit").onclick = () => {
                card.question = document.getElementById("editQuestion").value.trim();
                card.answer = document.getElementById("editAnswer").value.trim();

                // save to storage
                localStorage.setItem("flashcardSets", JSON.stringify({ ...allSets, [currentSetName]: cards }));
                popup.classList.add("hidden");
                renderCardList();
            };

            // "cancel" clicked
            document.getElementById("cancelEdit").onclick = () => {
                popup.classList.add("hidden");
            };
        })

        // delete button
        li.querySelector(".delete-card").addEventListener("click", (e) => {
            e.stopPropagation();
            const proceed = confirm("Are you sure you want to delete this card?");
            if (proceed) {
                cards.splice(currentCardIndex, 1);
                localStorage.setItem("flashcardSets", JSON.stringify(allSets));

                // adjust index
                if (currentCardIndex >= cards.length) {
                    currentCardIndex = Math.max(cards.length - 1, 0);
                }

                renderCardList();
            }
        })

        cardList.appendChild(li);
    }

    // add a card
    addCardForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // check for input
        const cardQuestion = document.getElementById("card-question").value.trim();
        const cardAnswer = document.getElementById("card-answer").value.trim();
        if (!cardQuestion || !cardAnswer) return;

        // current date and next review date
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        // add to set
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        allSets[currentSetName].push({
            question: cardQuestion,
            answer: cardAnswer,
            lastReviewed: now.toISOString(),
            nextReview: tomorrow.toISOString(),
            easeFactor: 0,
            consecutiveMistakes: 0,
            timesReviewed: 1
        });
        localStorage.setItem("flashcardSets", JSON.stringify(allSets));

        // reset and rerender
        document.getElementById("card-question").value = "";
        document.getElementById("card-answer").value = "";
        renderCardList();
    });
});
