const classFilterInput = document.querySelector("#class");
const genderFilterInput = document.querySelector("#gender");
const feeStatusFilterInput = document.querySelector("#feeStatus");
const searchInput = document.querySelector(".search-input");
const rowTemp = document.querySelector(".row-temp").content.firstElementChild.cloneNode(true);
const rowContainer = document.querySelector("tbody");
const menu = document.querySelector(".menu");
const currMin = document.querySelector(".current-min"),currMax=document.querySelector(".current-max"),total=document.querySelector(".total");

const curr = {
    order: 0,
    sortBy: "admission-number",
    class: "all",
    gender: "all",
    feeStatus: "all",
    search: "",
    entries: 10,
    page: 1
}

const keys = Object.keys(localStorage);
const students = [];
for (const key of keys) {
    const t = JSON.parse(localStorage[key]);
    students.push(
        {
            admissionNo: t.academicInfo.admissionNo,
            name: t.personalInfo.firstName + " " + t.personalInfo.middleName + " " + t.personalInfo.lastName,
            class: t.academicInfo.class,
            division: t.academicInfo.division,
            rollNumber: t.academicInfo.rollNumber,
            gender: t.personalInfo.gender,
            mobile: t.personalInfo.mobile,
            feeStatus: t.academicInfo.feeStatus,
            admissionDate: t.academicInfo.admissionDate
        }
    );
}

document.querySelector(".total").textContent = keys.length;
document.querySelector(".current-max").textContent = Math.min(keys.length, curr.entries);

const data = [];

function valid(s) {
    if (curr.search.trim() !== "" && !s.name.toLowerCase().startsWith(curr.search.trim().toLowerCase()) && !s.mobile.startsWith(curr.search.trim())) return false;
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

    curr.page = 1;
}
updateData();

function createRow(s) {
    const row = rowTemp.cloneNode(true);
    for (let c of row.children) {
        if (c.hasAttribute("data-name")) c.textContent = s[c.getAttribute("data-name")];
    }
    return row;
}

function loadData() {
    rowContainer.replaceChildren();
    for (let i = (curr.page - 1) * curr.entries; i < Math.min(curr.page * curr.entries, data.length); i++) {
        rowContainer.append(createRow(data[i]));
    }
    currMin.textContent=(curr.page-1)*curr.entries+1;
    currMax.textContent=Math.min(curr.page * curr.entries, data.length);
}
loadData();

document.querySelector(".options").addEventListener("input", function (e) {
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
        curr.page = 1;
        loadData();
    }else if(e.target.closest(".search-btn")) {
        curr.search=searchInput.value;
        updateData();
        loadData();
    }else if(e.target.closest(".previous")) {
        if(curr.page===1) return;
        curr.page--;
        loadData();
    }else if(e.target.closest(".next")){
        if((curr.page-1)*curr.entries<data.length) {
            curr.page++;
            loadData();
        }
    }
});

rowContainer.addEventListener("click",function(e){
    if(e.target.closest(".del-btn")){
        const t=e.target.closest(".record");
        const id=t.querySelector("[data-name='admissionNo']").textContent;
        localStorage.removeItem("addno"+id);
        let i=0;
        for(i=0;i<students.length;i++){
            if(students[i].admissionNo===id) break;
        }
        students.splice(i,1);
        for(i=0;i<keys.length;i++){
            if(keys[i]==="addno"+id) break;
        }
        keys.splice(i,1);
        for(i=0;i<data.length;i++){
            if(data[i].admissionNo===id) break;
        }
        data.splice(i,1);
        t.remove();
        if(curr.page*curr.entries-1<data.length) rowContainer.append(createRow(data[curr.page*curr.entries-1]));
        else if((curr.page-1)*curr.entries<data.length) currMax.textContent=data.length;
        else if((curr.page-1)*curr.entries>=data.length) {
            if(curr.page!==1){
                curr.page--;
                loadData();
            }else {
                currMin.textContent=0;
                currMax.textContent=0;
            }
        }
        total.textContent=data.length;
    }
});