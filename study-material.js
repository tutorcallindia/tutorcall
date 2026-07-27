/* =====================================
   STUDY MATERIAL DATA
===================================== */
const classList = {
    ICSE: [
        "Kindergarten", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
    ],

    CBSE: [
        "Kindergarten", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
        "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12",
        "NEET", "JEE"
    ]
};

const subjectList = {
    "Class 1": ["English", "Maths", "EVS"],
    "Class 2": ["English", "Maths", "EVS"],
    "Class 3": ["English", "Maths", "Science", "Social Studies"],
    "Class 4": ["English", "Maths", "Science", "Social Studies"],
    "Class 5": ["English", "Maths", "Science", "Social Studies"],

    "Class 6": ["English", "Maths", "Science", "SST", "Computer"],
    "Class 7": ["English", "Maths", "Science", "SST", "Computer"],
    "Class 8": ["English", "Maths", "Science", "SST", "Computer"],

    "Class 9": ["English", "Maths", "Science", "SST"],
    "Class 10": ["English", "Maths", "Science", "SST"],

    "Class 11": ["Physics", "Chemistry", "Maths", "Biology", "Commerce", "Humanities"],
    "Class 12": ["Physics", "Chemistry", "Maths", "Biology", "Commerce", "Humanities"],

    "NEET": ["Physics", "Chemistry", "Biology"],
    "JEE": ["Physics", "Chemistry", "Maths"]
};


/* =====================================
   BOARD CLICK → SELECT CLASS FILLS
===================================== */
const boardButtons = document.querySelectorAll(".sm-board");
const classSelect = document.getElementById("smClassSelect");
const selectedBoardText = document.getElementById("smSelectedBoard");
const subjectsWrap = document.getElementById("smSubjectsWrap");
const emptyMsg = document.getElementById("smEmptyInfo");

let selectedBoard = null;

/* BOARD CLICK HANDLER */
boardButtons.forEach(btn => {
    btn.addEventListener("click", () => {

        // ACTIVE UI
        boardButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // SAVE BOARD
        selectedBoard = btn.dataset.board;
        selectedBoardText.innerText = selectedBoard;

        // FILL CLASSES
        fillClasses(selectedBoard);

        // CLEAR SUBJECTS
        subjectsWrap.innerHTML = `
            <div id="smEmptyInfo" class="sm-empty">
                Now choose class to load subjects.
            </div>
        `;
    });
});


/* =====================================
   FILL CLASS DROPDOWN WHEN BOARD SELECTED
===================================== */
function fillClasses(board) {
    classSelect.innerHTML = `<option value="">— Select Class —</option>`;

    classList[board].forEach(cls => {
        let opt = document.createElement("option");
        opt.value = cls;
        opt.textContent = cls;
        classSelect.appendChild(opt);
    });
}


/* =====================================
   CLASS CHANGE → LOAD SUBJECTS
===================================== */
classSelect.addEventListener("change", function () {
    let cls = classSelect.value;

    if (!cls) {
        subjectsWrap.innerHTML = `
            <div id="smEmptyInfo" class="sm-empty">
                Choose a board and class to load subjects.
            </div>`;
        return;
    }

    loadSubjects(cls);
});


/* =====================================
   LOAD SUBJECT CARDS
===================================== */
function loadSubjects(cls) {
    subjectsWrap.innerHTML = "";

    if (!subjectList[cls]) {
        subjectsWrap.innerHTML = `<div class="sm-empty">No subjects found.</div>`;
        return;
    }

    subjectList[cls].forEach(sub => {
        subjectsWrap.innerHTML += `
            <div class="sm-subject-card">
                <div>
                    <strong>${sub}</strong>
                    <div style="font-size:13px;color:#666">${cls} - ${selectedBoard}</div>
                </div>

                <div class="sm-buttons">
                   <button class="notes-btn"
onclick="openOtp('${sub} Notes')">
Notes
</button>

<button class="video-btn"
onclick="openOtp('${sub} Videos')">
Videos
</button>

<button class="practice-btn"
onclick="openOtp('${sub} Practice')">
Practice
</button>
                </div>
            </div>
        `;
    });
}


/* =====================================
   OTP POPUP (USE EXISTING OTP)
===================================== */
function openOtp(data) {
    alert("This requires OTP verification: " + data);
}
