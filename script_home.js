import * as XLSX from "./node_modules/xlsx/xlsx.mjs";

const rowTemp = document.querySelector(".row-temp").content.firstElementChild.cloneNode(true);
const rowContainer = document.querySelector("tbody");
const menu = document.querySelector(".menu");
const filters = document.querySelector(".filters").querySelectorAll("[data-name]");
const currMin = document.querySelector(".current-min"), currMax = document.querySelector(".current-max"), total = document.querySelector(".total");
const currPage = document.querySelector(".current-page"), totalPage = document.querySelector(".total-page");
const modal = document.querySelector(".modal");
const pageNav = document.querySelector(".page-navigation");
const emptyInfo = document.querySelector(".empty-info");

const curr = {
    order: 0,
    sortBy: "admission-number",
    class: "all",
    gender: "all",
    feeStatus: "all",
    search: "",
    entries: Number(document.querySelector("#rows-per-page").value),
    page: 1,
    delTarget: null
}

const keys = Object.keys(localStorage).filter((el) => el.startsWith("addno"));
const students = [];
for (const key of keys) {
    const t = JSON.parse(localStorage[key]);
    students.push(
        {
            admissionNo: t.academicInfo.admissionNo,
            name: t.personalInfo.firstName + " " + t.personalInfo.middleName + ((t.personalInfo.middleName) ? " " : "") + t.personalInfo.lastName,
            class: t.academicInfo.class,
            division: t.academicInfo.division,
            rollNumber: t.academicInfo.rollNumber,
            gender: t.personalInfo.gender,
            mobile: t.personalInfo.mobile,
            feeStatus: t.academicInfo.feeStatus
        }
    );
}

const data = [];

function valid(s) {
    if (curr.search.trim() !== "" && !s.admissionNo.includes(curr.search.trim().toLowerCase()) && !s.name.toLowerCase().includes(curr.search.trim().toLowerCase()) && !s.mobile.includes(curr.search.trim())) return false;
    if (curr.gender !== "all" && s.gender !== curr.gender) return false;
    if (curr.class !== "all" && s.class !== curr.class) return false;
    if (curr.feeStatus !== "all" && s.feeStatus !== curr.feeStatus) return false;

    return true;
}

function updateData() {
    data.length = 0;
    for (const el of students) {
        if (valid(el)) data.push(el);
    }

    if (curr.sortBy === "admission-number") {
        data.sort((a, b) => Number(a.admissionNo) - Number(b.admissionNo));
    } else {
        data.sort((a, b) => {
            if (b.name < a.name) return 1;
            else if (b.name > a.name) return -1;
            else return 0;
        });
    }

    if (curr.order === 1) data.reverse();

    total.textContent = data.length;
    totalPage.textContent = Math.ceil(data.length / curr.entries);
    curr.page = 1;
}
updateData();

function createRow(s) {
    const row = rowTemp.cloneNode(true);
    for (let c of row.children) {
        if (c.hasAttribute("data-name")) {
            if (c.getAttribute("data-name") !== "feeStatus") c.textContent = s[c.getAttribute("data-name")];
            else {
                c.firstElementChild.textContent = s.feeStatus;
                c.firstElementChild.classList.add(s.feeStatus);
            }
        }
    }

    row.querySelector(".edit-btn").closest("a").href += "&id=" + s.admissionNo;
    row.querySelector(".info-btn").closest("a").href += "id=" + s.admissionNo;
    return row;
}

function loadData() {
    rowContainer.replaceChildren();
    for (let i = (curr.page - 1) * curr.entries; i < Math.min(curr.page * curr.entries, data.length); i++) {
        rowContainer.append(createRow(data[i]));
    }
    currMin.textContent = Math.min((curr.page - 1) * curr.entries + 1, data.length);
    currMax.textContent = Math.min(curr.page * curr.entries, data.length);

    if (data.length !== 0) currPage.textContent = curr.page;
    else currPage.textContent = 0;

    if (curr.page === 1) pageNav.querySelector(".previous").classList.add("disabled");
    else pageNav.querySelector(".previous").classList.remove("disabled");
    if (curr.page * curr.entries >= data.length) pageNav.querySelector(".next").classList.add("disabled");
    else pageNav.querySelector(".next").classList.remove("disabled");

    if(data.length===0) emptyInfo.classList.remove("hidden");
    else emptyInfo.classList.add("hidden");
}
loadData();

function exportAsExcel() {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
    );
    XLSX.writeFile(
        workbook,
        "students.xlsx"
    );
}

function exportAsCSV() {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.writeFile(
        {
            SheetNames: ["Students"],
            Sheets: {
                Students: worksheet
            }
        },
        "students.csv"
    );
}

modal.addEventListener("click", function (e) {
    if (e.target.closest(".modal-cancel-btn")) {
        curr.delTarget = null;
        modal.classList.add("hidden");
    } else if (e.target.closest(".modal-del-btn")) {
        const t = curr.delTarget;
        const id = t.querySelector("[data-name='admissionNo']").textContent;
        localStorage.removeItem("addno" + id);
        let i = 0;
        for (i = 0; i < students.length; i++) {
            if (students[i].admissionNo === id) break;
        }
        students.splice(i, 1);
        for (i = 0; i < keys.length; i++) {
            if (keys[i] === "addno" + id) break;
        }
        keys.splice(i, 1);
        for (i = 0; i < data.length; i++) {
            if (data[i].admissionNo === id) break;
        }
        data.splice(i, 1);
        t.remove();
        if (curr.page * curr.entries - 1 < data.length) rowContainer.append(createRow(data[curr.page * curr.entries - 1]));
        else if ((curr.page - 1) * curr.entries < data.length) currMax.textContent = data.length;
        else if ((curr.page - 1) * curr.entries >= data.length) {
            if (curr.page !== 1) {
                curr.page--;
                loadData();
            } else {
                currMin.textContent = 0;
                currMax.textContent = 0;
            }
        }
        total.textContent = data.length;
        curr.delTarget = null;
        modal.classList.add("hidden");
    }
});

menu.addEventListener("input", function (e) {
    curr[e.target.getAttribute("data-name")] = e.target.value;
    updateData();
    loadData();
});

menu.addEventListener("click", function (e) {
    if (e.target.closest(".sort-toggle")) {
        if (curr.order === 0) {
            curr.order = 1;
            e.target.closest(".sort-toggle").querySelector(".asce").classList.add("hidden");
            e.target.closest(".sort-toggle").querySelector(".desc").classList.remove("hidden");
        } else {
            curr.order = 0;
            e.target.closest(".sort-toggle").querySelector(".desc").classList.add("hidden");
            e.target.closest(".sort-toggle").querySelector(".asce").classList.remove("hidden");
        }
        data.reverse();
        loadData();
    } else if (e.target.closest(".add-btn")) {
        sessionStorage.clear();
    } else if (e.target.closest(".reset-btn")) {
        filters.forEach((el) => { el.value = "all"; });
        curr.class = "all";
        curr.feeStatus = "all";
        curr.gender = "all";
        updateData();
        loadData();
    } else if (e.target.closest(".export-excel")) exportAsExcel();
    else if (e.target.closest(".export-csv")) exportAsCSV();
});

pageNav.addEventListener("click", function (e) {
    if (e.target.closest(".previous")) {
        if (curr.page === 1) return;
        curr.page--;
        loadData();
    } else if (e.target.closest(".next")) {
        if (curr.page * curr.entries < data.length) {
            curr.page++;
            loadData();
        }
    }
});

rowContainer.addEventListener("click", function (e) {
    if (e.target.closest(".del-btn")) {
        curr.delTarget = e.target.closest(".record");
        modal.classList.remove("hidden");
    } else if (e.target.closest(".edit-btn")) {
        sessionStorage.clear();
    } else if (e.target.closest(".info-btn")) {

    }
});