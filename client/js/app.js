const appEl = document.getElementById("app");

document.getElementById("nav-manage").addEventListener("click", () => renderManage());
document.getElementById("nav-study").addEventListener("click", () => renderStudy());

let studyQueue = [];
let studyIndex = 0;
let reveal = false;

function escapeHtml(s) {
	return String(s || "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

async function renderManage() {
	appEl.innerHTML = `
		<h3>Manage Cards</h3>
		<div class="card">
			<h4>Create a new card</h4>
			<label>Question</label>
			<textarea id="new-question" rows="2" placeholder="Enter question..."></textarea>
			<label>Answer</label>
			<textarea id="new-answer" rows="2" placeholder="Enter answer..."></textarea>
			<label>Tags (optional)</label>
			<input id="new-tags" placeholder="e.g. math, sql" />
			<button id="btn-create">Create</button>
			<div id="create-msg" class="muted"></div>
		</div>

		<h4>All cards</h4>
		<div id="cards-list" class="muted">Loading...</div>
	`;

	document.getElementById("btn-create").addEventListener("click", async () => {
		const question = document.getElementById("new-question").value.trim();
		const answer = document.getElementById("new-answer").value.trim();
		const tags = document.getElementById("new-tags").value.trim();

		const msg = document.getElementById("create-msg");
		msg.textContent = "";

		if (!question || !answer) {
			msg.textContent = "Question and answer are required.";
			return;
		}

		try {
			await createCard({ question, answer, tags: tags || null });
			document.getElementById("new-question").value = "";
			document.getElementById("new-answer").value = "";
			document.getElementById("new-tags").value = "";
			msg.textContent = "Created.";
			await loadAndRenderCardsList();
		} catch (e) {
			msg.textContent = e.message;
		}
	});

	await loadAndRenderCardsList();
}

async function loadAndRenderCardsList() {
	const listEl = document.getElementById("cards-list");
	try {
		const cards = await getCards();
		if (!cards.length) {
			listEl.innerHTML = "No cards yet.";
			return;
		}

		listEl.innerHTML = cards
			.map(
				(c) => `
			<div class="card" data-id="${c.id}">
				<div class="muted">ID: ${c.id} ${c.tags ? `• Tags: ${escapeHtml(c.tags)}` : ""}</div>
				<div><strong>Q:</strong> ${escapeHtml(c.question)}</div>
				<div><strong>A:</strong> ${escapeHtml(c.answer)}</div>
				<div style="margin-top:10px; display:flex; gap:8px;">
					<button class="btn-edit">Edit</button>
					<button class="btn-delete">Delete</button>
				</div>
				<div class="edit-area" style="display:none; margin-top:12px;">
					<div class="row">
						<div>
							<label>Question</label>
							<textarea class="edit-question" rows="2"></textarea>
						</div>
						<div>
							<label>Answer</label>
							<textarea class="edit-answer" rows="2"></textarea>
						</div>
					</div>
					<label>Tags</label>
					<input class="edit-tags" />
					<button class="btn-save">Save</button>
					<button class="btn-cancel">Cancel</button>
					<div class="muted edit-msg"></div>
				</div>
			</div>
			`
			)
			.join("");

		listEl.querySelectorAll(".btn-delete").forEach((btn) => {
			btn.addEventListener("click", async (e) => {
				const cardEl = e.target.closest(".card");
				const id = Number(cardEl.dataset.id);
				if (!confirm("Delete this card?")) return;
				await deleteCard(id);
				await loadAndRenderCardsList();
			});
		});

		listEl.querySelectorAll(".btn-edit").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const cardEl = e.target.closest(".card");
				const editArea = cardEl.querySelector(".edit-area");
				const q = cardEl.querySelector(".edit-question");
				const a = cardEl.querySelector(".edit-answer");
				const t = cardEl.querySelector(".edit-tags");

				const qText = cardEl.querySelector("div:nth-of-type(2)").textContent.replace("Q: ", "");
				const aText = cardEl.querySelector("div:nth-of-type(3)").textContent.replace("A: ", "");

				q.value = qText;
				a.value = aText;
				t.value = "";

				editArea.style.display = "block";
			});
		});

		listEl.querySelectorAll(".btn-cancel").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const cardEl = e.target.closest(".card");
				cardEl.querySelector(".edit-area").style.display = "none";
			});
		});

		listEl.querySelectorAll(".btn-save").forEach((btn) => {
			btn.addEventListener("click", async (e) => {
				const cardEl = e.target.closest(".card");
				const id = Number(cardEl.dataset.id);
				const q = cardEl.querySelector(".edit-question").value.trim();
				const a = cardEl.querySelector(".edit-answer").value.trim();
				const t = cardEl.querySelector(".edit-tags").value.trim();
				const msg = cardEl.querySelector(".edit-msg");
				msg.textContent = "";

				if (!q || !a) {
					msg.textContent = "Question and answer are required.";
					return;
				}

				try {
					await updateCard(id, { question: q, answer: a, tags: t || null });
					await loadAndRenderCardsList();
				} catch (err) {
					msg.textContent = err.message;
				}
			});
		});
	} catch (e) {
		listEl.innerHTML = `Error: ${escapeHtml(e.message)}`;
	}
}

async function renderStudy() {
	appEl.innerHTML = `
		<h3>Study</h3>
		<div class="card">
			<button id="btn-load">Load cards into study queue</button>
			<button id="btn-next">Next card</button>
			<button id="btn-check">Reveal + check my answer</button>
			<button id="btn-clear">Clear my answer</button>
			<div class="muted" id="study-meta"></div>
		</div>

		<div class="row">
			<div class="card">
				<div><strong>All questions (click to jump):</strong></div>
				<div id="study-list" class="muted" style="margin-top: 10px; max-height: 260px; overflow-y: auto; padding-right: 6px;"></div>
			</div>

			<div class="card">
				<div><strong>Question:</strong></div>
				<div id="study-q" style="margin: 8px 0 14px;"></div>

				<label><strong>Type your answer:</strong></label>
				<textarea id="study-input" rows="2" placeholder="Type your answer..."></textarea>
				<div class="muted" id="study-result"></div>

				<div style="margin-top: 10px;"><strong>Correct answer:</strong></div>
				<div id="study-a" style="margin-top: 8px;"></div>
			</div>
		</div>
	`;

	document.getElementById("btn-load").addEventListener("click", async () => {
		const cards = await getCards();
		studyQueue = cards;
		studyIndex = 0;
		reveal = false;
		document.getElementById("study-input").value = "";
		document.getElementById("study-result").textContent = "";
		renderStudyList();
		renderStudyCard();
	});

	document.getElementById("btn-next").addEventListener("click", () => {
		if (!studyQueue.length) return;

		// If the answer was revealed (i.e., you already attempted this card),
		// remove it from the current study queue so it "disappears after use".
		if (reveal) {
			studyQueue.splice(studyIndex, 1);
			if (!studyQueue.length) {
				reveal = false;
				document.getElementById("study-input").value = "";
				document.getElementById("study-result").textContent = "";
				renderStudyList();
				renderStudyCard();
				return;
			}
			// keep index in range after removal
			if (studyIndex >= studyQueue.length) studyIndex = 0;
		} else {
			// If you haven't revealed yet, Next just moves forward.
			studyIndex = (studyIndex + 1) % studyQueue.length;
		}

		reveal = false;
		document.getElementById("study-input").value = "";
		document.getElementById("study-result").textContent = "";
		renderStudyList();
		renderStudyCard();
	});

	document.getElementById("btn-clear").addEventListener("click", () => {
		const input = document.getElementById("study-input");
		const result = document.getElementById("study-result");
		input.value = "";
		result.textContent = "";
	});

	document.getElementById("btn-check").addEventListener("click", () => {
		reveal = true;
		renderStudyCard(true);
	});

	renderStudyList();
	renderStudyCard();
}

function renderStudyList() {
	const listEl = document.getElementById("study-list");
	if (!listEl) return;

	if (!studyQueue.length) {
		listEl.textContent = "No cards loaded.";
		return;
	}

	listEl.innerHTML = studyQueue
		.map((c, idx) => {
			const active = idx === studyIndex;
			const label = c.question && c.question.length > 60 ? c.question.slice(0, 60) + "…" : c.question;
			return `
				<div>
					<button class="study-jump" data-idx="${idx}" style="text-align:left; width:100%; ${active ? "font-weight:700;" : ""}">
						${escapeHtml(label || "(no question)")}
					</button>
				</div>
			`;
		})
		.join("");

	listEl.querySelectorAll(".study-jump").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			const idx = Number(e.currentTarget.dataset.idx);
			studyIndex = idx;
			reveal = false;
			document.getElementById("study-input").value = "";
			document.getElementById("study-result").textContent = "";
			renderStudyList();
			renderStudyCard();
		});
	});
}

function normalizeAnswer(s) {
	return String(s || "")
		.trim()
		.toLowerCase()
		.replaceAll(/\s+/g, " ");
}

function renderStudyCard(checkNow = false) {
	const meta = document.getElementById("study-meta");
	const qEl = document.getElementById("study-q");
	const aEl = document.getElementById("study-a");
	const inputEl = document.getElementById("study-input");
	const resultEl = document.getElementById("study-result");

	if (!meta || !qEl || !aEl || !inputEl || !resultEl) return;

	if (!studyQueue.length) {
		meta.textContent = "Click “Load cards into study queue” to begin.";
		qEl.textContent = "";
		aEl.textContent = "";
		resultEl.textContent = "";
		return;
	}

	const c = studyQueue[studyIndex];
	meta.textContent = `Card ${studyIndex + 1} of ${studyQueue.length}`;
	qEl.textContent = c.question;

	if (!reveal) {
		aEl.textContent = "(hidden)";
		resultEl.textContent = "";
		return;
	}

	// reveal correct answer
	aEl.textContent = c.answer;

	// optionally check user's answer
	if (checkNow) {
		const user = normalizeAnswer(inputEl.value);
		const correct = normalizeAnswer(c.answer);

		if (!user) {
			resultEl.textContent = "Type your answer first, then press “Reveal + check my answer”.";
		} else if (user === correct) {
			resultEl.textContent = "Correct ✅";
		} else {
			resultEl.textContent = "Not quite — compare with the correct answer below.";
		}
	}
}

renderManage();