const API_URL = "https://portfolio-backend-twnd.onrender.com";

const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("button");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // loading state
    button.innerText = "Sending...";
    button.disabled = true;

    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();

        if (data.status === "success") {
            showPopup("Message sent successfully 🚀", "success");
            form.reset();
        } else {
            showPopup("Failed to send message", "error");
        }

    } catch (err) {
        showPopup("Server not reachable", "error");
    }

    button.innerText = "Send Message";
    button.disabled = false;
});


/* =========================
   POPUP FUNCTION
========================= */
function showPopup(text, type) {
    const popup = document.createElement("div");
    popup.className = `popup ${type}`;
    popup.innerText = text;

    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}


/* =========================
   DOWNLOAD CV FUNCTION
========================= */
function downloadCV() {
    const link = document.createElement("a");
    link.href = "cv.pdf"; // put your CV file in project folder
    link.download = "Kelvin_Patrick_Mwazembe_CV.pdf";
    link.click();
}