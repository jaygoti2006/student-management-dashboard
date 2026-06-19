const apiKey = "ec26da232a357c213c670da196f859837ef7401791ec1954544a75920744e93a";
const baseURL = "https://api.countrystatecity.in/v1";

const curr = {
    page: 1
};

const sectionContainer = document.querySelector(".section-container");
const progress = document.querySelector(".progress");
const progressFill = document.querySelector(".progress-fill");
const badges = [];
const sections = [];
const sectionFields = [];
progress.querySelectorAll(".badge").forEach((el) => { badges.push(el); });
sectionContainer.querySelectorAll(".sec").forEach((el) => { sections.push(el) });

const addressFields = ["address", "country", "state", "city", "pincode"];
const currAddress = [], permAddress = [];
addressFields.forEach((s) => {
    currAddress.push(sections[1].querySelectorAll("." + s)[0]);
    permAddress.push(sections[1].querySelectorAll("." + s)[1]);
});

const formTemps = [];
sections.forEach((el) => {
    if (el.querySelector(".form-template")) {
        formTemps.push(el.querySelector(".form-template").content.firstElementChild.cloneNode(true));
    } else formTemps.push(null);
    const t = [];
    el.querySelectorAll("input,select").forEach((el1) => t.push(el1));
    sectionFields.push(t);
});

const session = (sessionStorage.getItem("student") === null) ? null : JSON.parse(sessionStorage.getItem("student"));


function createOption(value, content) {
    const t = document.createElement("option");
    t.setAttribute("value", value);
    t.textContent = content;
    return t;
}

async function getCountries() {
    try {
        const res = await fetch(baseURL + "/countries", {
            method: "GET",
            headers: {
                "X-CSCAPI-KEY": apiKey
            }
        })
        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            console.error(res.status);
            return Promise.reject("error during fetch");
        }
    } catch (e) {
        console.error(e);
        return Promise.reject("error during fetch");
    }
}

async function getStates(ciso2) {
    try {
        const res = await fetch(`${baseURL}/countries/${ciso2}/states`, {
            method: "GET",
            headers: {
                "X-CSCAPI-KEY": apiKey
            }
        })
        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            console.error(res.status);
            return Promise.reject("error during fetch");
        }
    } catch (e) {
        console.error(e);
        return Promise.reject("error during fetch");
    }
}

async function getCities(ciso2, siso2) {
    try {
        const res = await fetch(`${baseURL}/countries/${ciso2}/states/${siso2}/cities`, {
            method: "GET",
            headers: {
                "X-CSCAPI-KEY": apiKey
            }
        })
        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            console.error(res.status);
            return Promise.reject("error during fetch");
        }
    } catch (e) {
        console.error(e);
        return Promise.reject("error during fetch");
    }
}

function updateCities(el, s, ciso2, siso2, flag) {
    el.querySelectorAll("option[value]:not([value=''])").forEach((child) => { child.remove() });
    if (s === "") {
        el.value = "";
        return;
    }

    getCities(ciso2, siso2).then((data) => {
        data.forEach((city) => {
            const t = createOption(city.name, city.name);
            el.append(t);
        });
        if (session !== null && flag) {
            if (el.closest(".curr")) currAddress[3].value = session.address.currentAddress.city;
            else permAddress[3].value = session.address.permanentAddress.city;
        }
    });
}

function updateStates(el, c, ciso2, flag) {
    el.querySelectorAll("option[value]:not([value=''])").forEach((child) => { child.remove() });
    if (el.closest(".curr")) updateCities(currAddress[3], "", null, null);
    else updateCities(permAddress[3], "", null, null);
    if (c === "") {
        el.value = "";
        return;
    }

    getStates(ciso2).then((data) => {
        data.forEach((state) => {
            const t = createOption(state.name, state.name);
            t.setAttribute("data-ciso2", ciso2);
            t.setAttribute("data-siso2", state.iso2);
            el.append(t);
        });
        if (session !== null && flag) {
            if (el.closest(".curr")) {
                currAddress[2].value = session.address.currentAddress.state;
                updateCities(currAddress[3], currAddress[2].value, currAddress[2].selectedOptions[0].getAttribute("data-ciso2"), currAddress[2].selectedOptions[0].getAttribute("data-siso2"), true);
            } else {
                permAddress[2].value = session.address.permanentAddress.state;
                updateCities(permAddress[3], permAddress[2].value, permAddress[2].selectedOptions[0].getAttribute("data-ciso2"), permAddress[2].selectedOptions[0].getAttribute("data-siso2"), true);
            }
        }
    });
}

getCountries().then((data) => {
    sections[1].querySelectorAll(".country").forEach((el) => {
        data.forEach((c) => {
            const t = createOption(c.name, c.name);
            t.setAttribute("data-ciso2", c.iso2);
            el.append(t);
        });
    });
    if (session !== null) {
        currAddress[1].value = session.address.currentAddress.country;
        updateStates(currAddress[2], currAddress[1].value, currAddress[1].selectedOptions[0].getAttribute("data-ciso2"), true);

        permAddress[1].value = session.address.permanentAddress.country;
        updateStates(permAddress[2], permAddress[1].value, permAddress[1].selectedOptions[0].getAttribute("data-ciso2"), true);
    }
});

function validate(el) {
    if (el.classList.contains("required") && el.value.trim() === "") {
        el.closest("div").querySelector(".error").classList.remove("hidden");
        el.closest("div").querySelector(".error-message").textContent = "Field can't be empty!";
        return false;
    }

    if (el.tagName === "INPUT" && el.classList.contains("email")) {
        if (!/^.+\@.+\..+$/.test(el.value) && el.value !== "") {
            el.closest("div").querySelector(".error").classList.remove("hidden");
            el.closest("div").querySelector(".error-message").textContent = "Email not valid!";
            return false;
        }
    }

    if (el.tagName === "INPUT" && el.classList.contains("mobile")) {
        if (!/^\d{10}$/.test(el.value) && el.value !== "") {
            el.closest("div").querySelector(".error").classList.remove("hidden");
            el.closest("div").querySelector(".error-message").textContent = "Mobile not valid!";
            return false;
        }
    }

    if (el.tagName === "INPUT" && el.classList.contains("pincode")) {
        if (!/^\d{6}$/.test(el.value) && el.value !== "") {
            el.closest("div").querySelector(".error").classList.remove("hidden");
            el.closest("div").querySelector(".error-message").textContent = "Pincode not valid!";
            return false;
        }
    }

    if (el.tagName === "INPUT" && (el.classList.contains("income") || el.classList.contains("fees") || el.classList.contains("doc-number") || el.classList.contains("admission-number"))) {
        if (!/^\d*$/.test(el.value) && el.value !== "") {
            el.closest("div").querySelector(".error").classList.remove("hidden");
            let message;
            if(el.classList.contains("income")) message="Income not valid!";
            else if(el.classList.contains("fees")) message="Fees not valid!";
            else if(el.classList.contains("doc-number")) message="Document Number not valid!";
            else message="Admission No not valid!";
            el.closest("div").querySelector(".error-message").textContent = message;
            return false;
        }
    }

    return true;
}

function validateAll() {
    let ok = true;
    if (curr.page === 4 || curr.page === 5 || curr.page === 6) {
        const t = new Map();
        sections[curr.page - 1].querySelectorAll(".primary").forEach((el) => {
            const s = el.value.toLowerCase();
            if (t.has(s)) t.set(s, t.get(s) + 1);
            else t.set(s, 1);
        });
        for (let [key, value] of t) if (key != "guardian" && value > 1) ok = false;
        if (!ok) {
            sections[curr.page - 1].querySelectorAll(".primary").forEach((el) => {
                el.closest("div").querySelector(".error").classList.remove("hidden");
                el.closest("div").querySelector(".error-message").textContent = "Repeated entries!";
            });
        }
    } else if (curr.page === 2) {
        let ok1 = false;
        permAddress.forEach((el) => {
            if (el.value.trim() !== "") ok1 = true;
        });
        if (ok1) {
            let ok2 = true;
            permAddress.forEach((el) => {
                if (el.value.trim() === "") {
                    ok2 = false;
                    el.closest("div").querySelector(".error").classList.remove("hidden");
                    el.closest("div").querySelector(".error-message").textContent = "Feild can't be empty!";
                }
            });
            if (!ok2) ok = false;
        }
    }
    sections[curr.page - 1].querySelectorAll("input,select").forEach((el) => {
        if (!validate(el)) ok = false;
    });

    return ok;
}

function createStudent() {
    const personalInfo = {}, address = {
        currentAddress: {},
        permanentAddress: {}
    }, academicInfo = {}, parents = [], courses = [], documents = [];
    const student = {};
    sectionFields[0].forEach((el) => personalInfo[el.name] = el.value);
    currAddress.forEach((el) => address.currentAddress[el.name] = el.value);
    permAddress.forEach((el) => address.permanentAddress[el.name] = el.value);
    sectionFields[2].forEach((el) => academicInfo[el.name] = el.value);
    [...sections[3].querySelector(".form-container").children].forEach((el) => {
        const t = {};
        el.querySelectorAll("input,select").forEach((el1) => t[el1.name] = el1.value);
        parents.push(t);
    });
    [...sections[4].querySelector(".form-container").children].forEach((el) => {
        const t = {};
        el.querySelectorAll("input,select").forEach((el1) => t[el1.name] = el1.value);
        courses.push(t);
    });
    [...sections[5].querySelector(".form-container").children].forEach((el) => {
        const t = {};
        el.querySelectorAll("input,select").forEach((el1) => t[el1.name] = el1.value);
        documents.push(t);
    });

    student.personalInfo = personalInfo;
    student.academicInfo = academicInfo;
    student.address = address;
    student.parents = parents;
    student.courses = courses;
    student.documents = documents;

    return student;
}

function addRecordLocal(addno) {
    const student = createStudent();
    if (sections[0].querySelector("input[name='profilePhoto']").files[0]) {
        const reader = new FileReader();

        reader.addEventListener("load", function (e) {
            student.personalInfo.profilePhoto = reader.result;
            localStorage.setItem("addno" + addno, JSON.stringify(student));
            alert("added successfully");
        });

        reader.readAsDataURL(sections[0].querySelector("input[name='profilePhoto']").files[0]);
    }
    else {
        localStorage.setItem("addno" + addno, JSON.stringify(student));
        alert("added successfully");
    }
}

function addRecordSession() {
    sessionStorage.setItem("student", JSON.stringify(createStudent()));
}

function loadFromSession() {
    if (session !== null) {
        for (let el of sectionFields[0]) {
            if (el.getAttribute("type") !== "file") el.value = session.personalInfo[el.getAttribute("name")];
        }
        for (let el of currAddress) {
            if (el.tagName !== "SELECT") el.value = session.address.currentAddress[el.getAttribute("name")];
        }
        for (let el of permAddress) {
            if (el.tagName !== "SELECT") el.value = session.address.permanentAddress[el.getAttribute("name")];
        }
        for (let el of sectionFields[2]) {
            el.value = session.academicInfo[el.getAttribute("name")];
        }
        for (let el of session.parents) {
            const t = formTemps[3].cloneNode(true);
            t.querySelectorAll("input,select").forEach((el1) => {
                el1.value = el[el1.getAttribute("name")];
            });
            sections[3].querySelector(".form-container").append(t);
        }
        for (let el of session.courses) {
            const t = formTemps[4].cloneNode(true);
            t.querySelectorAll("input,select").forEach((el1) => {
                el1.value = el[el1.getAttribute("name")];
            });
            sections[4].querySelector(".form-container").append(t);
        }
        for (let el of session.documents) {
            const t = formTemps[5].cloneNode(true);
            t.querySelectorAll("input,select").forEach((el1) => {
                el1.value = el[el1.getAttribute("name")];
            });
            sections[5].querySelector(".form-container").append(t);
        }
    }
}
loadFromSession();



sectionContainer.addEventListener("input", function (e) {
    e.target.closest("div").querySelector(".error").classList.add("hidden");
    if (e.target.closest(".country")) {
        const t = e.target.closest(".country");
        if (e.target.closest(".curr")) updateStates(currAddress[2], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), false);
        else updateStates(permAddress[2], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), false);
    } else if (e.target.closest(".state")) {
        const t = e.target.closest(".state");
        if (e.target.closest(".curr")) updateCities(currAddress[3], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), t.selectedOptions[0].getAttribute("data-siso2"), false);
        else updateCities(permAddress[3], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), t.selectedOptions[0].getAttribute("data-siso2"), false);
    } else if(e.target.closest(".profile-photo")) {
        const file=e.target.closest(".profile-photo").files[0];
        if(file.size > 10*1024) {
            e.target.closest(".profile-photo").value="";
            const t=e.target.closest(".profile-photo").closest("div");
            t.querySelector(".error").classList.remove("hidden");
            t.querySelector(".error-message").textContent = "File size should be less than 10KB!";
        }
    }
});

sectionContainer.addEventListener("click", function (e) {
    if (e.target.closest(".next")) {
        if (validateAll()) {
            sections[curr.page - 1].classList.add("hidden");
            badges[curr.page - 1].classList.remove("badge-current");
            badges[curr.page - 1].classList.add("badge-complete");
            curr.page++;
            sections[curr.page - 1].classList.remove("hidden");
            progressFill.style.width = (curr.page * 100 / 6) + "%";
            badges[curr.page - 1].classList.remove("badge-upcoming");
            badges[curr.page - 1].classList.add("badge-current");
        }
    } else if (e.target.closest(".previous")) {
        sections[curr.page - 1].classList.add("hidden");
        badges[curr.page - 1].classList.remove("badge-current");
        badges[curr.page - 1].classList.add("badge-upcoming");
        curr.page--;
        sections[curr.page - 1].classList.remove("hidden");
        progressFill.style.width = (curr.page * 100 / 6) + "%";
        badges[curr.page - 1].classList.remove("badge-complete");
        badges[curr.page - 1].classList.add("badge-current");
    } else if (e.target.closest(".same-address-btn")) {
        for (let i = 0; i < currAddress.length; i++) {
            if (permAddress[i].tagName === "SELECT") {
                if (permAddress[i].querySelector(`option[value='${currAddress[i].value}']`)) permAddress[i].value = currAddress[i].value;
                else {
                    permAddress[i].append(createOption(currAddress[i].value, currAddress[i].querySelector(`option[value='${currAddress[i].value}']`).textContent));
                    permAddress[i].value = currAddress[i].value;
                }
            } else permAddress[i].value = currAddress[i].value;
        }
    } else if (e.target.closest(".add-btn")) sections[curr.page - 1].querySelector(".form-container").append(formTemps[curr.page - 1].cloneNode(true));
    else if (e.target.closest(".del-btn")) e.target.closest("form").remove();
    else if (e.target.closest(".submit")) {
        if (validateAll()) {
            if (localStorage.getItem("addno" + document.querySelector(".admission-number").value) === null) addRecordLocal(document.querySelector(".admission-number").value);
            else alert("admission number already exist");
        }
    }
});

window.addEventListener("beforeunload", function (e) {
    addRecordSession();
});