const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

const els = {
    input: document.getElementById("search-input"),
    button: document.getElementById("search-btn"),
    meals: document.getElementById("meals"),
    heading: document.getElementById("result-heading"),
    error: document.getElementById("error-container"),
    details: document.getElementById("meal-details"),
    detailsContent: document.querySelector(".meal-details-content"),
    back: document.getElementById("back-btn"),
};

const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

function showError(message) {
    els.error.textContent = message;
    show(els.error);
}

function clearResults() {
    [els.error, els.heading, els.meals, els.details].forEach(hide);
    els.meals.innerHTML = "";
}

async function searchMeals() {
    const term = els.input.value.trim();
    if (!term) return showError("Please enter a search term.");

    clearResults();
    els.heading.textContent = `Searching for "${term}"...`;
    show(els.heading);

    try {
        const response = await fetch(`${BASE_URL}search.php?s=${encodeURIComponent(term)}`);
        const data = await response.json();

        if (!data.meals) {
            hide(els.heading);
            return showError(`No recipes found for "${term}". Try another search term!`);
        }

        els.heading.textContent = `Search results for "${term}":`;
        els.meals.innerHTML = data.meals.map(mealCard).join("");
        show(els.meals);
        els.input.value = "";
    } catch {
        hide(els.heading);
        showError("Something went wrong. Please try again later.");
    }
}

const mealCard = (meal) => `
    <div class="meal" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
            <h3 class="meal-title">${meal.strMeal}</h3>
            ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
    </div>`;

async function openMeal(id) {
    try {
        const response = await fetch(`${BASE_URL}lookup.php?i=${id}`);
        const data = await response.json();
        if (!data.meals) return;

        els.detailsContent.innerHTML = renderDetails(data.meals[0]);
        show(els.details);
        els.details.scrollIntoView({ behavior: "smooth" });
    } catch {
        showError("Could not load recipe details. Please try again later.");
    }
}

function getIngredients(meal) {
    return Array.from({ length: 20 }, (_, i) => i + 1)
        .map((n) => ({
            name: (meal[`strIngredient${n}`] || "").trim(),
            measure: (meal[`strMeasure${n}`] || "").trim(),
        }))
        .filter((item) => item.name);
}

const renderDetails = (meal) => `
    <img class="meal-details-img" src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h2 class="meal-details-title">${meal.strMeal}</h2>
    <div class="meal-details-category"><span>${meal.strCategory || "Uncategorized"}</span></div>
    <div class="meal-details-instructions">
        <h3>Instructions</h3>
        <p>${meal.strInstructions || "No instructions provided."}</p>
    </div>
    <div class="meal-details-ingredients">
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
            ${getIngredients(meal)
                .map((item) => `<li><i class="fas fa-check-circle"></i> ${item.measure} ${item.name}</li>`)
                .join("")}
        </ul>
    </div>
    ${meal.strYoutube
        ? `<a class="youtube-link" href="${meal.strYoutube}" target="_blank" rel="noopener">
               <i class="fab fa-youtube"></i> Watch Video
           </a>`
        : ""}`;

els.button.addEventListener("click", searchMeals);
els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchMeals();
});
els.meals.addEventListener("click", (e) => {
    const card = e.target.closest(".meal");
    if (card) openMeal(card.dataset.id);
});
els.back.addEventListener("click", () => hide(els.details));
