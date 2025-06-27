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

    // add a new set event button
    showSetFormBtn.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        setFormSection.classList.remove("hidden");
    });

    if (setForm && setListContainer) {
        // redirect to log in
        if (localStorage.getItem("loggedIn") !== "true") {
            window.location.href = "login.html";
        }

        setForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // check for input
            const setName = document.getElementById("set-name").value.trim();
            if (!setName) return;

            currentSetName = setName;
            currentSetNameDisplay.textContent = `Add cards to "${setName}"`;

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

            // after successfully creating a new set
            setFormSection.classList.add("hidden");
            cardFormSection.classList.remove("hidden");


            renderSetList();
        });

        renderSetList();
    }


    // show sets
    function renderSetList() {
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const setNames = Object.keys(allSets);

        setListContainer.innerHTML = "";

        // empty, no flashcard sets created
        if (setNames.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "You haven't created any flashcard sets yet.";
            emptyMsg.style.color = "gray";
            setListContainer.appendChild(emptyMsg);
            return;
        }

        // show flashcard sets
        setNames.forEach(setName => {
            const box = document.createElement("div");
            box.className = "set-box";
            box.textContent = setName;

            box.addEventListener("click", () => {
                selectSet(setName);
            });

            setListContainer.appendChild(box);
        });
    }


    const cardFormSection = document.getElementById("card-form-section");
    const currentSetNameDisplay = document.getElementById("current-set-name");
    const cardList = document.getElementById("card-list");
    const addCardForm = document.getElementById("add-card-form");

    let currentSetName = null;

    // "Add Flashcard" button is clicked
    const toggleAddFormBtn = document.getElementById("toggle-add-form");
    toggleAddFormBtn.addEventListener("click", () => {
        addCardForm.classList.toggle("hidden");
    });


    // find set
    function selectSet(setName) {
        currentSetName = setName;
        currentSetNameDisplay.textContent = `Add cards to "${setName}"`;
        cardFormSection.classList.remove("hidden");
        renderCardList();
    }

    // show list of cards
    function renderCardList() {
        // find set
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        const cards = allSets[currentSetName] || [];
        cardList.innerHTML = "";

        // show card loop
        cards.forEach(({ question, answer }, index) => {
            const li = document.createElement("li");
            li.textContent = `Q: ${question} — A: ${answer}`;
            cardList.appendChild(li);
        });
    }

    // add a card
    addCardForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // check for input
        const cardQuestion = document.getElementById("card-question").value.trim();
        const cardAnswer = document.getElementById("card-answer").value.trim();
        if (!cardQuestion || !cardAnswer) return;

        // add flashcard tp set
        const allSets = JSON.parse(localStorage.getItem("flashcardSets")) || {};
        allSets[currentSetName].push({
            question: cardQuestion,
            answer: cardAnswer
        });
        localStorage.setItem("flashcardSets", JSON.stringify(allSets));

        // reset
        document.getElementById("card-question").value = "";
        document.getElementById("card-answer").value = "";
        renderCardList();
    });
});
