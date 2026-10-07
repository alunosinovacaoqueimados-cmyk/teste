let database = null;

let selectedEstablishment = null;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;


/* =========================================
   CARREGAR JSON
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("data/dados.json");

        if (!response.ok) {
            throw new Error("Não foi possível carregar os dados.");
        }

        database = await response.json();

        renderCategories();
        renderEstablishments();
        renderServices();
        renderProfessionals();

        setupSearch();

    } catch (error) {

        console.error(error);

        showToast(
            "Não foi possível carregar os dados. Verifique se o projeto está sendo executado por um servidor local."
        );
    }

});


/* =========================================
   CATEGORIAS
========================================= */

function renderCategories() {

    const container = document.getElementById("categoriesContainer");

    container.innerHTML = database.categorias.map(category => {

        return `
            <div class="category" onclick="filterCategory('${category.nome}')">

                <div class="category-image">
                    <img
                        src="${category.imagem}"
                        alt="${category.nome}"
                    >
                </div>

                <h3>${category.nome}</h3>

            </div>
        `;

    }).join("");

}


/* =========================================
   ESTABELECIMENTOS
========================================= */

function renderEstablishments(list = database.estabelecimentos) {

    const container = document.getElementById("establishmentsContainer");

    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <strong>Nenhum estabelecimento encontrado.</strong>
                Tente buscar outro nome ou serviço.
            </div>
        `;

        return;
    }

    container.innerHTML = list.map(establishment => {

        return `

            <article class="establishment-card">

                <div class="establishment-image">

                    <img
                        src="${establishment.imagem}"
                        alt="${establishment.nome}"
                    >

                    ${
                        establishment.destaque
                        ?
                        `<span class="badge">DESTAQUE</span>`
                        :
                        ""
                    }

                    <button
                        class="favorite"
                        onclick="toggleFavorite(event, ${establishment.id})"
                        aria-label="Favoritar"
                    >
                        ♡
                    </button>

                </div>

                <div class="establishment-info">

                    <h3>${establishment.nome}</h3>

                    <p class="establishment-type">
                        ${establishment.tipo}
                    </p>

                    <div class="rating-row">

                        <span class="rating">
                            ${establishment.nota}
                        </span>

                        <span class="rating-stars">
                            ★★★★★
                        </span>

                        <span class="reviews">
                            (${establishment.avaliacoes})
                        </span>

                    </div>

                    <p class="card-location">
                        ${establishment.distancia} • ${establishment.bairro}
                    </p>

                    <div class="card-footer">

                        <div class="from-price">
                            A partir de
                            <strong>
                                R$ ${formatMoney(establishment.precoMinimo)}
                            </strong>
                        </div>

                        <button
                            class="schedule-button"
                            onclick="openEstablishment(${establishment.id})"
                        >
                            Ver serviços
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


/* =========================================
   SERVIÇOS
========================================= */

function renderServices() {

    const container = document.getElementById("servicesContainer");

    container.innerHTML = database.servicos.map(service => {

        return `

            <article
                class="service-card"
                onclick="findService('${service.nome}')"
            >

                <div class="service-card-image">

                    <img
                        src="${service.imagem}"
                        alt="${service.nome}"
                    >

                </div>

                <span class="service-category">
                    ${service.categoria}
                </span>

                <h3>${service.nome}</h3>

                <p>${service.descricao}</p>

                <div class="service-price">

                    <strong>
                        A partir de R$ ${formatMoney(service.preco)}
                    </strong>

                    <span class="service-time">
                        ${service.duracao}
                    </span>

                </div>

            </article>

        `;

    }).join("");
}


/* =========================================
   PROFISSIONAIS
========================================= */

function renderProfessionals() {

    const container = document.getElementById("professionalsContainer");

    container.innerHTML = database.profissionais.map(professional => {

        return `

            <article class="professional">

                <div class="professional-image">

                    <img
                        src="${professional.imagem}"
                        alt="${professional.nome}"
                    >

                </div>

                <div class="professional-info">

                    <h3>${professional.nome}</h3>

                    <p>
                        ${professional.especialidade}
                    </p>

                    <div class="professional-rating">
                        ★ ${professional.nota}
                    </div>

                </div>

            </article>

        `;

    }).join("");
}


/* =========================================
   ABRIR ESTABELECIMENTO
========================================= */

function openEstablishment(id) {

    const establishment = database.estabelecimentos.find(
        item => item.id === id
    );

    if (!establishment) return;

    selectedEstablishment = establishment;

    const services = database.servicos.filter(service =>
        establishment.servicos.includes(service.id)
    );

    const content = document.getElementById("establishmentDetails");

    content.innerHTML = `

        <div class="modal-cover">

            <img
                src="${establishment.imagem}"
                alt="${establishment.nome}"
            >

        </div>

        <div class="modal-establishment">

            <h2>${establishment.nome}</h2>

            <p class="modal-establishment-type">
                ${establishment.tipo}
            </p>

            <div class="modal-meta">

                <span>
                    ★ ${establishment.nota}
                </span>

                <span>
                    ${establishment.avaliacoes} avaliações
                </span>

                <span>
                    ${establishment.distancia}
                </span>

            </div>

            <p class="card-location">
                ${establishment.endereco}
            </p>

            <div class="modal-services">

                <h3>
                    Serviços disponíveis
                </h3>

                ${
                    services.map(service => `

                        <div class="modal-service">

                            <div>

                                <strong>
                                    ${service.nome}
                                </strong>

                                <small>
                                    ${service.duracao} •
                                    R$ ${formatMoney(service.preco)}
                                </small>

                            </div>

                            <button
                                onclick="openBooking(
                                    ${establishment.id},
                                    ${service.id}
                                )"
                            >
                                Agendar
                            </button>

                        </div>

                    `).join("")
                }

            </div>

        </div>

    `;

    openModal("establishmentModal");
}


/* =========================================
   AGENDAMENTO
========================================= */

function openBooking(establishmentId, serviceId) {

    selectedEstablishment = database.estabelecimentos.find(
        item => item.id === establishmentId
    );

    selectedService = database.servicos.find(
        item => item.id === serviceId
    );

    selectedDate = null;
    selectedTime = null;

    closeModal("establishmentModal");

    const dates = generateDates();

    const content = document.getElementById("bookingContent");

    content.innerHTML = `

        <h2>Agendar serviço</h2>

        <div class="booking-establishment">

            <strong>
                ${selectedService.nome}
            </strong>

            <span>
                ${selectedEstablishment.nome}
            </span>

        </div>


        <div class="booking-step">

            <h3>
                1. Escolha a data
            </h3>

            <div class="date-list">

                ${dates.map((date, index) => `

                    <button
                        class="date-button ${index === 0 ? "selected" : ""}"
                        onclick="selectDate(this, '${date.iso}')"
                    >

                        <strong>
                            ${date.day}
                        </strong>

                        <small>
                            ${date.week}
                        </small>

                    </button>

                `).join("")}

            </div>

        </div>


        <div class="booking-step">

            <h3>
                2. Escolha o horário
            </h3>

            <div class="time-list">

                ${selectedEstablishment.horarios.map((time, index) => `

                    <button
                        class="time-button"
                        onclick="selectTime(this, '${time}')"
                    >
                        ${time}
                    </button>

                `).join("")}

            </div>

        </div>


        <div class="booking-step">

            <h3>
                3. Profissional
            </h3>

            <select
                id="professionalSelect"
                class="professional-select"
                style="
                    width:100%;
                    padding:12px;
                    border:1px solid #ebe4e7;
                    border-radius:8px;
                    background:white;
                "
            >

                <option value="">
                    Escolher profissional
                </option>

                ${
                    selectedEstablishment.profissionais.map(professionalId => {

                        const professional =
                            database.profissionais.find(
                                p => p.id === professionalId
                            );

                        return `
                            <option value="${professional.id}">
                                ${professional.nome}
                            </option>
                        `;

                    }).join("")
                }

            </select>

        </div>


        <div class="booking-summary">

            <div class="booking-summary-row">

                <span>Serviço</span>

                <strong>
                    ${selectedService.nome}
                </strong>

            </div>

            <div class="booking-summary-row">

                <span>Duração</span>

                <span>
                    ${selectedService.duracao}
                </span>

            </div>

            <div class="booking-summary-row total">

                <span>Total</span>

                <span>
                    R$ ${formatMoney(selectedService.preco)}
                </span>

            </div>

        </div>


        <button
            class="primary-button"
            onclick="confirmBooking()"
        >
            Confirmar agendamento
        </button>

    `;

    selectedDate = dates[0].iso;

    openModal("bookingModal");
}


/* =========================================
   DATAS
========================================= */

function generateDates() {

    const dates = [];

    const week = [
        "DOM",
        "SEG",
        "TER",
        "QUA",
        "QUI",
        "SEX",
        "SÁB"
    ];

    const month = [
        "JAN",
        "FEV",
        "MAR",
        "ABR",
        "MAI",
        "JUN",
        "JUL",
        "AGO",
        "SET",
        "OUT",
        "NOV",
        "DEZ"
    ];

    for (let i = 0; i < 7; i++) {

        const date = new Date();

        date.setDate(date.getDate() + i);

        dates.push({

            iso: date.toISOString().split("T")[0],

            day:
                String(date.getDate()).padStart(2, "0")
                + " "
                + month[date.getMonth()],

            week: week[date.getDay()]

        });

    }

    return dates;
}


/* =========================================
   SELECIONAR DATA
========================================= */

function selectDate(button, date) {

    document.querySelectorAll(".date-button").forEach(item => {
        item.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedDate = date;
}


/* =========================================
   SELECIONAR HORÁRIO
========================================= */

function selectTime(button, time) {

    document.querySelectorAll(".time-button").forEach(item => {
        item.classList.remove("selected");
    });

    button.classList.add("selected");

    selectedTime = time;
}


/* =========================================
   CONFIRMAR AGENDAMENTO
========================================= */

function confirmBooking() {

    const professionalSelect =
        document.getElementById("professionalSelect");

    const professionalId =
        professionalSelect ? professionalSelect.value : "";

    if (!selectedDate) {

        showToast("Escolha uma data.");

        return;
    }

    if (!selectedTime) {

        showToast("Escolha um horário.");

        return;
    }

    if (!professionalId) {

        showToast("Escolha um profissional.");

        return;
    }

    const professional =
        database.profissionais.find(
            item => item.id == professionalId
        );

    const appointments =
        JSON.parse(
            localStorage.getItem("beautygo_agendamentos")
        ) || [];

    const appointment = {

        id: Date.now(),

        estabelecimento:
            selectedEstablishment.nome,

        estabelecimentoId:
            selectedEstablishment.id,

        servico:
            selectedService.nome,

        servicoId:
            selectedService.id,

        profissional:
            professional.nome,

        profissionalId:
            professional.id,

        data:
            selectedDate,

        horario:
            selectedTime,

        valor:
            selectedService.preco,

        status:
            "Confirmado"

    };

    appointments.push(appointment);

    localStorage.setItem(
        "beautygo_agendamentos",
        JSON.stringify(appointments)
    );

    closeModal("bookingModal");

    showToast(
        "Agendamento confirmado com sucesso."
    );
}


/* =========================================
   MEUS AGENDAMENTOS
========================================= */

function openAppointments() {

    const appointments =
        JSON.parse(
            localStorage.getItem("beautygo_agendamentos")
        ) || [];

    const container =
        document.getElementById("appointmentsList");

    if (!appointments.length) {

        container.innerHTML = `

            <div class="empty-state">

                <strong>
                    Você ainda não possui agendamentos.
                </strong>

                Encontre um estabelecimento e agende
                seu próximo atendimento.

            </div>

        `;

    } else {

        container.innerHTML =
            appointments
                .slice()
                .reverse()
                .map(appointment => `

                    <div class="appointment-card">

                        <strong>
                            ${appointment.servico}
                        </strong>

                        <p>
                            ${appointment.estabelecimento}
                        </p>

                        <p>
                            Profissional:
                            ${appointment.profissional}
                        </p>

                        <p>
                            ${formatDate(appointment.data)}
                            às
                            ${appointment.horario}
                        </p>

                        <span class="appointment-status">
                            ${appointment.status}
                        </span>

                    </div>

                `).join("");

    }

    openModal("appointmentsModal");
}


/* =========================================
   PERFIL
========================================= */

function openProfile() {

    openModal("profileModal");

}


/* =========================================
   MODAL EMPRESA
========================================= */

function openBusinessModal() {

    openModal("businessModal");

}


function submitBusiness(event) {

    event.preventDefault();

    closeModal("businessModal");

    showToast(
        "Cadastro enviado. Nossa equipe entrará em contato."
    );

}


/* =========================================
   FAVORITOS
========================================= */

function toggleFavorite(event, id) {

    event.stopPropagation();

    const button = event.currentTarget;

    button.classList.toggle("active");

    if (button.classList.contains("active")) {

        button.innerHTML = "♥";

        showToast("Adicionado aos favoritos.");

    } else {

        button.innerHTML = "♡";

        showToast("Removido dos favoritos.");

    }

}


/* =========================================
   PESQUISA
========================================= */

function setupSearch() {

    const input =
        document.getElementById("searchInput");

    const heroInput =
        document.getElementById("heroSearch");


    input.addEventListener("input", () => {

        searchEstablishments(input.value);

    });


    heroInput.addEventListener("keydown", event => {

        if (event.key === "Enter") {

            searchEstablishments(heroInput.value);

            document
                .getElementById("establishmentsContainer")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }

    });

}


function performSearch() {

    const value =
        document.getElementById("heroSearch").value;

    searchEstablishments(value);

    document
        .getElementById("establishmentsContainer")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function searchEstablishments(value) {

    value = value.trim().toLowerCase();

    if (!value) {

        renderEstablishments();

        return;
    }

    const results =
        database.estabelecimentos.filter(establishment => {

            const text = `

                ${establishment.nome}
                ${establishment.tipo}
                ${establishment.bairro}
                ${establishment.endereco}

            `.toLowerCase();

            const serviceMatch =
                establishment.servicos.some(serviceId => {

                    const service =
                        database.servicos.find(
                            item => item.id === serviceId
                        );

                    return service &&
                        service.nome
                            .toLowerCase()
                            .includes(value);

                });

            return text.includes(value) || serviceMatch;

        });

    renderEstablishments(results);

}


function findService(serviceName) {

    document.getElementById("heroSearch").value =
        serviceName;

    searchEstablishments(serviceName);

    document
        .getElementById("establishmentsContainer")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================
   FILTRO CATEGORIA
========================================= */

function filterCategory(category) {

    const results =
        database.estabelecimentos.filter(
            establishment =>
                establishment.categorias.includes(category)
        );

    renderEstablishments(results);

    document
        .getElementById("establishmentsContainer")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================
   VER TODOS
========================================= */

function showAllEstablishments() {

    renderEstablishments();

}


function showAllCategories() {

    showToast("Todas as categorias já estão disponíveis.");

}


/* =========================================
   MODAL
========================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("active");

    document.body.style.overflow = "";

}


document.querySelectorAll(".modal-overlay").forEach(overlay => {

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {

            overlay.classList.remove("active");

            document.body.style.overflow = "";

        }

    });

});


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================
   FORMATAÇÃO
========================================= */

function formatMoney(value) {

    return Number(value)
        .toFixed(2)
        .replace(".", ",");

}


function formatDate(dateString) {

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}