const FRONTEND_URL = "https://portfolio-frontend-lime-nine.vercel.app";
const API_URL = "https://portfolio-backend-twnd.onrender.com";

const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("button");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    button.innerText = "Sending...";
    button.disabled = true;

    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();

        if (data.status === "success") {
            showPopup("Message sent successfully!", "success");
            form.reset();
        } else {
            showPopup("Failed to send message", "error");
        }
    } catch {
        showPopup("Server not reachable", "error");
    }

    button.innerText = "Send Message";
    button.disabled = false;
});


function showPopup(text, type) {
    const popup = document.createElement("div");
    popup.className = `popup ${type}`;
    popup.innerText = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}


function downloadCV() {
    const link = document.createElement("a");
    link.href = "cv.pdf";
    link.download = "Kelvin_Patrick_Mwazembe_CV.pdf";
    link.click();
}


/* =========================
   BACKEND STATUS (live)
   Priority: /api/status → /api/profile → / (fallback)
========================= */
async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
}

function setBackendUI(state, mainText, portfolioName, profileLine, mode) {
    const box = document.getElementById("backendStatus");
    const mainEl = document.getElementById("backendStatusText");
    const portfolioEl = document.getElementById("backendPortfolioName");
    const profileEl = document.getElementById("backendProfileLine");

    box.classList.remove("checking", "online", "offline", "fallback");
    box.classList.add(state);

    mainEl.textContent = mainText;
    portfolioEl.textContent = portfolioName || "";
    profileEl.textContent = profileLine || "";

    portfolioEl.classList.toggle("visible", Boolean(portfolioName));
    profileEl.classList.toggle("visible", Boolean(profileLine));

    if (mode === "status") {
        box.setAttribute("title", "Connected via /api/status");
    } else if (mode === "fallback") {
        box.setAttribute("title", "Connected via root / (fallback)");
    } else if (mode === "offline") {
        box.setAttribute("title", "Backend unreachable");
    }
}

async function checkBackendStatus() {
    setBackendUI("checking", "Connecting to backend…", "", "", "checking");

    try {
        const statusData = await fetchJson(`${API_URL}/api/status`);
        if (statusData && (statusData.status === "online" || statusData.message)) {
            const main = statusData.message || "Backend online";
            const portfolio = statusData.portfolio || "";

            setBackendUI("online", main, portfolio, "", "status");

            try {
                const profileData = await fetchJson(`${API_URL}/api/profile`);
                if (profileData && profileData.profile_line) {
                    setBackendUI(
                        "online",
                        main,
                        portfolio,
                        profileData.profile_line,
                        "status"
                    );
                }
            } catch {
                /* profile optional until backend redeployed */
            }
            return;
        }
    } catch {
        /* try fallback */
    }

    try {
        const rootData = await fetchJson(`${API_URL}/`);
        if (rootData) {
            const welcome =
                rootData.message ||
                "Welcome to Kelvin Patrick Mwazembe Portfolio API";
            const portfolio = rootData.portfolio || PORTFOLIO_FALLBACK_NAME;
            setBackendUI("fallback", welcome, portfolio, "", "fallback");
            return;
        }
    } catch {
        /* offline */
    }

    setBackendUI(
        "offline",
        "Backend offline — contact form may not work",
        "",
        "",
        "offline"
    );
}

const PORTFOLIO_FALLBACK_NAME = "Kelvin Patrick Mwazembe Portfolio";


/* =========================
   SCROLL ANIMATIONS
========================= */
function initScrollAnimations() {
    const elements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    const cards = document.querySelectorAll(
        ".about-card, .skill-detail-card, .project-card, .qualification-item"
    );
    cards.forEach((card, i) => {
        card.classList.add("stagger-item");
        card.style.setProperty("--stagger", `${(i % 6) * 0.08}s`);
    });

    const cardObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        },
        { threshold: 0.1 }
    );

    cards.forEach((card) => cardObserver.observe(card));
}


function initSiteLinks() {
    const liveSite = document.getElementById("footerLiveSite");
    const adminLink = document.getElementById("footerAdminLink");
    const apiLink = document.getElementById("footerApiLink");

    if (liveSite) {
        liveSite.href = FRONTEND_URL;
    }
    if (adminLink) {
        adminLink.href = `${API_URL}/messages`;
    }
    if (apiLink) {
        apiLink.href = API_URL;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    initSiteLinks();
    checkBackendStatus();
    initScrollAnimations();

    setInterval(checkBackendStatus, 60000);
});
