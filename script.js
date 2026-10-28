
/* MA WISHLIST — NOËL 2026 */

// Connexion Supabase
const SUPABASE_URL =
  "https://udwztgdvuujgevlluwbg.supabase.co";

const SUPABASE_KEY =
  "sb_publishable__Uyb-9FwXd11Ev6uDDVUzg_dVLsGCjN";

// Les 17 cadeaux seront lus depuis Supabase
const API = `${SUPABASE_URL}/rest/v1`;

const grid = document.getElementById("grid");
const statusElement = document.getElementById("status");

function message(texte) {
  statusElement.textContent = texte;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error("Erreur de connexion");
  }

  if (response.status === 204) return null;

  return response.json();
}

// Charger les cadeaux
async function chargerCadeaux() {
  try {
    message("Chargement des cadeaux...");

    const cadeaux = await apiRequest(
      "/cadeaux?select=id,nom,offert&order=id.asc"
    );

    afficherCadeaux(cadeaux);

    message("");
  } catch (erreur) {
    message("Impossible de charger les cadeaux.");
    console.error(erreur);
  }
}

// Afficher les cartes
function afficherCadeaux(cadeaux) {
  grid.replaceChildren();

  cadeaux.forEach(cadeau => {
    const carte = document.createElement("article");
    carte.className = "gift";

    const photo = document.createElement("div");
    photo.className = "photo";

    const image = document.createElement("img");
    image.src = `images/cadeau-${cadeau.id}.jpg`;
    image.alt = cadeau.nom;
    image.loading = "lazy";

    photo.appendChild(image);

    const nom = document.createElement("div");
    nom.className = "name";
    nom.textContent = cadeau.nom;

    const bouton = document.createElement("button");
    bouton.className = "reserve";
    bouton.type = "button";

    bouton.textContent = cadeau.offert
      ? "✓ Déjà offert"
      : "♡ Je l'offre";

    bouton.disabled = cadeau.offert;

    if (!cadeau.offert) {
      bouton.addEventListener("click", () => {
        reserverCadeau(cadeau.id, bouton);
      });
    }

    carte.append(photo, nom, bouton);
    grid.appendChild(carte);
  });
}

// Réserver un cadeau
async function reserverCadeau(id, bouton) {
  const confirmation = confirm(
    "Tu souhaites réserver ce cadeau ?"
  );

  if (!confirmation) return;

  bouton.disabled = true;
  bouton.textContent = "Réservation...";

  try {
    await apiRequest("/rpc/reserver_cadeau", {
      method: "POST",
      body: JSON.stringify({
        p_id: id
      })
    });

    await chargerCadeaux();
  } catch (erreur) {
    alert("La réservation n'a pas fonctionné.");
    await chargerCadeaux();
  }
}

// Actualiser les réservations
chargerCadeaux();

setInterval(chargerCadeaux, 30000);
