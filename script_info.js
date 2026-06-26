const params = new URLSearchParams(location.search);
const API_KEY="sk_a38007d4da3d47b54ba044c425ccd74291d4ab7b";

const student = JSON.parse(localStorage.getItem("addno" + params.get("id")));

const personalInfo = document.querySelector("[data-type='personalInfo']");
const currentAddress = document.querySelector("[data-type='currentAddress']");
const permanentAddress = document.querySelector("[data-type='permanentAddress']");
const academicInfo = document.querySelector("[data-type='academicInfo']");
const parents = document.querySelector("[data-type='parents']");
const courses = document.querySelector("[data-type= 'courses']");
const documents = document.querySelector("[data-type='documents']");
const parentTemp = document.querySelector("#parent-template").content.firstElementChild.cloneNode(true);
const courseTemp = document.querySelector("#course-template").content.firstElementChild.cloneNode(true);
const documentTemp = document.querySelector("#document-template").content.firstElementChild.cloneNode(true);
const parentContainer = document.querySelector(".parent-container");
const courseContainer = document.querySelector(".course-container");
const documentContainer = document.querySelector(".document-container");
const header=document.querySelector(".profile-header");

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAddress(a){
    return ans=`${a.address}, <br> ${a.city}, <br> ${a.state}, <br> ${a.country}. <br> ${a.pincode}`;
}

async function generatePDF(html) {
    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY
        },
        body: JSON.stringify({
            source: html
        })
    });

    if (!response.ok) {
        throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "student.pdf";
    a.click();

    URL.revokeObjectURL(url);
}

if (student.personalInfo.profilePhoto) document.querySelector(".profile-photo").src = student.personalInfo.profilePhoto;

header.querySelector(".full-name").textContent = student.personalInfo.firstName + " " + student.personalInfo.middleName + ((student.personalInfo.middleName) ? " " : "") + student.personalInfo.lastName;
header.querySelector(".email") .textContent = student.personalInfo.email;
header.querySelector(".mobile") .textContent = `+${student.personalInfo.mobileCountryCode} ${student.personalInfo.mobile}`;
header.querySelector(".class").textContent = student.academicInfo.class;
header.querySelector(".division").textContent = student.academicInfo.division;
header.querySelector(".gender").textContent = capitalize(student.personalInfo.gender);
header.querySelector(".dob").textContent = (new Date(student.personalInfo.dateOfBirth)).toLocaleDateString("en-US",{
    month: 'long',
    year: 'numeric',
    day: 'numeric'
});

document.querySelector(`.${student.personalInfo.gender}`).classList.remove("hidden");

personalInfo.querySelectorAll("[data-type]").forEach((el) => {
    const d = el.getAttribute("data-type");
    if (d.endsWith("CountryCode") && student.personalInfo[d]!=="") student.personalInfo[d] = "+" + student.personalInfo[d];
    el.textContent = student.personalInfo[d];
});

currentAddress.innerHTML=getAddress(student.address.currentAddress);

permanentAddress.innerHTML=getAddress(student.address.permanentAddress);

academicInfo.querySelectorAll("[data-type]").forEach((el) => {
    el.textContent = student.academicInfo[el.getAttribute("data-type")];
});

student.parents.forEach((el, idx) => {
    const t = parentTemp.cloneNode(true);
    t.querySelector(".heading").textContent = capitalize(el.relation);
    t.querySelectorAll("[data-type]").forEach((el1) => {
        el1.textContent = el[el1.getAttribute("data-type")];
    });
    parentContainer.append(t);
});

student.courses.forEach((el, idx) => {
    const t = courseTemp.cloneNode(true);
    t.firstElementChild.textContent=idx+1;
    t.querySelectorAll("[data-type]").forEach((el1) => {
        const d = el1.getAttribute("data-type");
        if (d.endsWith("CountryCode")) el[d] = "+" + el[d];
        el1.textContent = el[d];
    });
    courseContainer.append(t);
});

student.documents.forEach((el, idx) => {
    const t = documentTemp.cloneNode(true);
    t.firstElementChild.textContent=idx+1;
    t.querySelectorAll("[data-type]").forEach((el1) => {
        el1.textContent = el[el1.getAttribute("data-type")];
    });
    documentContainer.append(t);
});

document.querySelector(".export-pdf").addEventListener("click",function(e){
    generatePDF(`<html>${document.querySelector(".main").outerHTML}</html>`);
});