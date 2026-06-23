const apiKey = "ec26da232a357c213c670da196f859837ef7401791ec1954544a75920744e93a";
const baseURL = "https://api.countrystatecity.in/v1";

const curr = {
    page: 1
};

const date = new Date();
document.querySelector("input[name='admissionDate']").setAttribute("max", date.toISOString().split('T')[0]);

date.setFullYear(date.getFullYear() - 5);
document.querySelector("input[name='dateOfBirth']").setAttribute("max", date.toISOString().split('T')[0]);

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

const errorContainerTemp = document.querySelector("#error-template").content.firstElementChild.cloneNode(true);

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
    const addCountryCode=(el) => {
        data.forEach((c)=>{
            const t=createOption(c.phonecode,"+"+c.phonecode+` (${c.name})`);
            el.append(t);
        });
        el.value="91";
    };
    document.querySelectorAll(".country-code").forEach(addCountryCode);
    formTemps[3].querySelectorAll(".country-code").forEach(addCountryCode);
    if (session !== null) {
        currAddress[1].value = session.address.currentAddress.country;
        updateStates(currAddress[2], currAddress[1].value, currAddress[1].selectedOptions[0].getAttribute("data-ciso2"), true);

        permAddress[1].value = session.address.permanentAddress.country;
        updateStates(permAddress[2], permAddress[1].value, permAddress[1].selectedOptions[0].getAttribute("data-ciso2"), true);

        sections[0].querySelectorAll(".country-code").forEach((el)=>{
            el.value=session.personalInfo[el.name];
        });

        [...sections[3].querySelector(".form-container").children].forEach((el,idx)=>{
            el.querySelector("[name='mobileCountryCode']").value=session.parents[idx].mobileCountryCode;
        });
    }
});

function showError(el, message) {
    if (el.closest("div").querySelector(".error")) {
        el.closest("div").querySelector(".error-message").textContent = message;
    } else {
        const t = errorContainerTemp.cloneNode(true);
        t.querySelector(".error-message").textContent = message;
        el.closest("div").append(t);
    }
}

const validators = {
    required: (el) => {
        if (el.value.trim() === "") {
            showError(el, "Field can't be empty!");
            return false;
        }
        return true;
    },
    name: (el) => {
        if (!/^[A-Za-z ]*$/.test(el.value)) {
            showError(el, "Invalid Name!");
            return false;
        }
        return true;
    },
    email: (el) => {
        if (!/^.+\@.+\..+$/.test(el.value) && el.value !== "") {
            showError(el, "Invalid Email!");
            return false;
        }
        return true;
    },
    mobile: (el) => {
        if (!/^\d{10}$/.test(el.value) && el.value !== "") {
            showError(el, "Invalid Mobile!");
            return false;
        }
        return true;
    },
    pincode: (el) => {
        if (!/^\d{6}$/.test(el.value) && el.value !== "") {
            showError(el, "Invalid Pincode!");
            return false;
        }
        return true;
    },
    number: (el) => {
        if (!/^\d*$/.test(el.value) && el.value !== "") {
            let message;
            if (el.classList.contains("income")) message = "Invalid Income!";
            else if (el.classList.contains("fees")) message = "Invalid Fees!";
            else if (el.classList.contains("doc-number")) message = "Invalid Document Number!";
            else if (el.classList.contains("roll-number")) message = "Invalid Roll Number!";
            else message = "Invalid Admission No!";
            showError(el, message);
            return false;
        }
        return true;
    },
    date: (el) => {
        if (!el.checkValidity()) {
            let message;
            if (el.name === "admissionDate") message = "Enter valid date that agrees with DOB!";
            else if (el.name === "dateOfBirth") message = "Invalid DOB!";
            showError(el, message);
            return false;
        }
        return true;
    }
};

function validate(el) {
    if (el.getAttribute("data-validation-type")) {
        const types = el.getAttribute("data-validation-type").split(" ");
        for (const type of types) {
            if (!validators[type](el)) return false;
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
                showError(el, "Repeated entries!");
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
                    showError(el, "Feild can't be empty!");
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
    student["admittedToAnother"] = 0;
    if (sections[5].querySelector("[name='admittedToAnother']").checked) student["admittedToAnother"] = 1;

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

function updateFromDOB() {
    const d = document.querySelector("[name='dateOfBirth']");
    if (d.checkValidity() && d.value !== "") {
        const t = (new Date()).getFullYear() - (new Date(d.value)).getFullYear() - 4;
        sections[2].querySelector("[name='class']").querySelectorAll("option[value]:not([value=''])").forEach((child) => { child.remove() });
        const date = new Date(d.value);
        date.setFullYear(date.getFullYear() + 5);

        sections[2].querySelector("[name='admissionDate']").setAttribute("min", date.toISOString().split('T')[0]);
        for (let i = 1; i <= Math.min(12, t); i++) sections[2].querySelector("[name='class']").append(createOption(String(i), "Class " + i));
    }
}

function loadFromSession() {
    if (session !== null) {
        for (let el of sectionFields[0]) {
            if (el.getAttribute("type") !== "file") el.value = session.personalInfo[el.getAttribute("name")];
        }
        updateFromDOB();
        for (let el of currAddress) {
            if (el.tagName !== "SELECT") el.value = session.address.currentAddress[el.getAttribute("name")];
        }
        for (let el of permAddress) {
            if (el.tagName !== "SELECT") el.value = session.address.permanentAddress[el.getAttribute("name")];
        }
        for (let el of sectionFields[2]) {
            el.value = session.academicInfo[el.getAttribute("name")];
        }
        session.parents.forEach((el, idx) => {
            if (idx !== 0) {
                const t = formTemps[3].cloneNode(true);
                t.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });

                sections[3].querySelector(".form-container").append(t);
            } else {
                sections[3].querySelector(".form-container").firstElementChild.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });
            }
        });
        session.courses.forEach((el, idx) => {
            if (idx !== 0) {
                const t = formTemps[4].cloneNode(true);
                t.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });
                sections[4].querySelector(".form-container").append(t);
            } else {
                sections[4].querySelector(".form-container").firstElementChild.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });
            }
        });
        session.documents.forEach((el, idx) => {
            if (idx !== 0) {
                const t = formTemps[5].cloneNode(true);
                if (el.documentName === "leaving-certificate") {
                    t.setAttribute("data-lc", "yes");
                    t.querySelector("[name='documentName']").replaceChildren();
                    t.querySelector("[name='documentName']").append(createOption("leaving-certificate", "Leaving Certificate"));
                }
                t.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });
                sections[5].querySelector(".form-container").append(t);
            } else {
                sections[5].querySelector(".form-container").firstElementChild.querySelectorAll("input,select").forEach((el1) => {
                    el1.value = el[el1.getAttribute("name")];
                });
            }
        });
        if (session.admittedToAnother) {
            sections[5].querySelector("[name='admittedToAnother']").setAttribute("checked", "");
            sections[5].querySelector("[data-lc]").querySelector(".del-btn").remove();
        }
    }
}
loadFromSession();



sectionContainer.addEventListener("focusout", function (e) {
    validate(e.target);
});

sectionContainer.addEventListener("input", function (e) {
    if (e.target.closest("div").querySelector(".error")) e.target.closest("div").querySelector(".error").remove();
    if (e.target.closest(".country")) {
        const t = e.target.closest(".country");
        if (e.target.closest(".curr")) updateStates(currAddress[2], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), false);
        else updateStates(permAddress[2], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), false);
    } else if (e.target.closest(".state")) {
        const t = e.target.closest(".state");
        if (e.target.closest(".curr")) updateCities(currAddress[3], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), t.selectedOptions[0].getAttribute("data-siso2"), false);
        else updateCities(permAddress[3], t.value, t.selectedOptions[0].getAttribute("data-ciso2"), t.selectedOptions[0].getAttribute("data-siso2"), false);
    } else if (e.target.closest(".profile-photo")) {
        const file = e.target.closest(".profile-photo").files[0];
        if (file.size > 10 * 1024) {
            e.target.closest(".profile-photo").value = "";
            const t = e.target.closest(".profile-photo").closest("div");
            t.querySelector(".error").classList.remove("hidden");
            t.querySelector(".error-message").textContent = "File size should be less than 10KB!";
        }
    } else if (e.target.closest("[name='dateOfBirth']")) updateFromDOB();
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
    } else if (e.target.closest(".add-btn")) {
        const t=formTemps[curr.page - 1].cloneNode(true);
        if(t.querySelector(".country-code")) t.querySelector(".country-code").value="91";
        sections[curr.page - 1].querySelector(".form-container").append(t);
    }
    else if (e.target.closest(".del-btn")) e.target.closest("form").remove();
    else if (e.target.closest("[name='admittedToAnother']")) {
        if (e.target.closest("[name='admittedToAnother']").checked) {
            const t = formTemps[5].cloneNode(true);
            t.querySelector(".del-btn").remove();
            t.querySelector("[name='documentName']").replaceChildren();
            t.querySelector("[name='documentName']").append(createOption("leaving-certificate", "Leaving Certificate"));
            t.setAttribute("data-lc", "yes");
            sections[5].querySelector(".form-container").append(t);
        } else sections[5].querySelector("[data-lc]").remove();
    } else if (e.target.closest(".submit")) {
        if (validateAll()) {
            if (localStorage.getItem("addno" + document.querySelector(".admission-number").value) === null) addRecordLocal(document.querySelector(".admission-number").value);
            else alert("admission number already exist");
        }
    }
});

sectionContainer.addEventListener("keydown", function (e) {
    if (!("0".charCodeAt(0) <= e.key.charCodeAt(0) && e.key.charCodeAt(0) <= "9".charCodeAt(0)) && e.key!=="Backspace" && e.key!=="Tab") {
        if (e.target.getAttribute("data-validation-type")) {
            const types = e.target.getAttribute("data-validation-type").split(" ");
            if (types.includes("number") || types.includes("mobile")) e.preventDefault();
        }
    }
});

window.addEventListener("beforeunload", function (e) {
    addRecordSession();
});