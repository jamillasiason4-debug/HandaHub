document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const checklist = [
    "Drinking water",
    "Ready-to-eat food",
    "First-aid kit",
    "Personal medicines",
    "Flashlight",
    "Extra batteries",
    "Power bank",
    "Battery-powered radio",
    "Whistle",
    "Important documents in a waterproof bag",
    "Extra clothes and hygiene supplies",
    "Cash and emergency contact list"
  ];

  const storageKey = "handahub-data-v1";

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");

      return {
        checked: Array.isArray(saved.checked) ? saved.checked : [],
        centers: Array.isArray(saved.centers) ? saved.centers : [],
        contacts: Array.isArray(saved.contacts) ? saved.contacts : []
      };
    } catch {
      return { checked: [], centers: [], contacts: [] };
    }
  }

  let data = loadData();

  function saveData() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch {
      alert("Your browser could not save the changes. Check your browser storage settings.");
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function makeId() {
    return Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9);
  }

  function renderChecklist() {
    $("checklistItems").innerHTML = checklist.map((item, index) => `
      <label class="check-item">
        <input type="checkbox" data-check="${index}"
          ${data.checked.includes(index) ? "checked" : ""}>
        <span>${escapeHTML(item)}</span>
      </label>
    `).join("");

    const count = data.checked.length;
    const percentage = Math.round(count / checklist.length * 100);

    $("completed").textContent = `${count}/${checklist.length}`;
    $("progress").textContent = `${percentage}%`;
    $("progressBar").style.width = `${percentage}%`;
    $("progressText").textContent =
      `${count} of ${checklist.length} items prepared`;
  }

  $("checklistItems").addEventListener("change", (event) => {
    const input = event.target;

    if (!input.matches("[data-check]")) return;

    const index = Number(input.dataset.check);
    const previous = [...data.checked];

    if (input.checked && !data.checked.includes(index)) {
      data.checked.push(index);
    } else {
      data.checked = data.checked.filter((item) => item !== index);
    }

    if (!saveData()) {
      data.checked = previous;
    }

    renderChecklist();
  });

$("resetChecklist").addEventListener("click", () => {
  const answer = confirm(
    "Are you sure you want to reset all checklist items?"
  );

  if (!answer) return;

  const previous = [...data.checked];
  data.checked = [];

  if (saveData()) {
    renderChecklist();
    alert("Checklist has been reset successfully!");
  } else {
    data.checked = previous;
    renderChecklist();
  }
});
  function renderCenters() {
    const search = $("centerSearch").value.trim().toLowerCase();

    const results = data.centers.filter((center) =>
      `${center.name} ${center.address}`.toLowerCase().includes(search)
    );

    if (!results.length) {
      $("centerList").innerHTML =
        '<p class="empty-message">No evacuation centers found. Add verified community information above.</p>';
      return;
    }

    $("centerList").innerHTML = results.map((center) => `
      <article class="record-card">
        <div>
          <h3>📍 ${escapeHTML(center.name)}</h3>
          <p>${escapeHTML(center.address)}</p>
          <p>Capacity: ${escapeHTML(center.capacity)} people</p>
        </div>
        <button class="delete-btn" data-delete-center="${center.id}">
          Delete
        </button>
      </article>
    `).join("");
  }

  $("centerForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("centerName").value.trim();
    const address = $("centerAddress").value.trim();
    const capacity = Number($("centerCapacity").value);

    if (!name || !address || !Number.isInteger(capacity) || capacity < 1) {
      alert("Please enter a valid center name, address, and capacity.");
      return;
    }

    data.centers.push({ id: makeId(), name, address, capacity });

    if (saveData()) {
      $("centerForm").reset();
      renderCenters();
    } else {
      data.centers.pop();
    }
  });

  $("centerSearch").addEventListener("input", renderCenters);

  $("centerList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-center]");
    if (!button) return;

    if (!confirm("Delete this evacuation center?")) return;

    const previous = data.centers;
    data.centers = data.centers.filter(
      (center) => center.id !== button.dataset.deleteCenter
    );

    if (saveData()) {
      renderCenters();
    } else {
      data.centers = previous;
    }
  });

  function renderContacts() {
    const search = $("contactSearch").value.trim().toLowerCase();

    const results = data.contacts.filter((contact) =>
      `${contact.name} ${contact.number} ${contact.note}`
        .toLowerCase().includes(search)
    );

    if (!results.length) {
      $("contactList").innerHTML =
        '<p class="empty-message">No contacts found. Add verified emergency contact information above.</p>';
      return;
    }

    $("contactList").innerHTML = results.map((contact) => `
      <article class="record-card">
        <div>
          <h3>☎️ ${escapeHTML(contact.name)}</h3>
          <p>Phone: ${escapeHTML(contact.number)}</p>
          ${contact.note ? `<p>${escapeHTML(contact.note)}</p>` : ""}
        </div>
        <button class="delete-btn" data-delete-contact="${contact.id}">
          Delete
        </button>
      </article>
    `).join("");
  }

  $("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("contactName").value.trim();
    const number = $("contactNumber").value.trim();
    const note = $("contactNote").value.trim();

    if (!name || !number) {
      alert("Please enter a name and phone number.");
      return;
    }

    data.contacts.push({ id: makeId(), name, number, note });

    if (saveData()) {
      $("contactForm").reset();
      renderContacts();
    } else {
      data.contacts.pop();
    }
  });

  $("contactSearch").addEventListener("input", renderContacts);

  $("contactList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-contact]");
    if (!button) return;

    if (!confirm("Delete this contact?")) return;

    const previous = data.contacts;
    data.contacts = data.contacts.filter(
      (contact) => contact.id !== button.dataset.deleteContact
    );

    if (saveData()) {
      renderContacts();
    } else {
      data.contacts = previous;
    }
  });

  $("menuBtn").addEventListener("click", () => {
    $("nav").classList.toggle("open");
  });

  $("nav").addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      $("nav").classList.remove("open");
    }
  });

  renderChecklist();
  renderCenters();
  renderContacts();
});