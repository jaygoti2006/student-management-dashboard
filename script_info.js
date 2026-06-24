const params = new URLSearchParams(location.search);

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

if(student.personalInfo.profilePhoto) document.querySelector(".profile-photo").src=student.personalInfo.profilePhoto;

document.querySelector(".full-name").textContent=student.personalInfo.firstName + " " + student.personalInfo.middleName + ((student.personalInfo.middleName) ? " " : "") + student.personalInfo.lastName;

personalInfo.querySelectorAll("[data-type]").forEach((el) => {
    const d=el.getAttribute("data-type");
    if (d.endsWith("CountryCode")) student.personalInfo[d] = "+" + student.personalInfo[d];
    el.textContent = student.personalInfo[d];
});

currentAddress.querySelectorAll("[data-type]").forEach((el) => {
    el.textContent = student.address.currentAddress[el.getAttribute("data-type")];
});

permanentAddress.querySelectorAll("[data-type]").forEach((el) => {
    el.textContent = student.address.permanentAddress[el.getAttribute("data-type")];
});

academicInfo.querySelectorAll("[data-type]").forEach((el) => {
    el.textContent = student.academicInfo[el.getAttribute("data-type")];
});

student.parents.forEach((el,idx) => {
    const t = parentTemp.cloneNode(true);
    t.querySelector(".heading").textContent="Parent"+(idx+1);
    t.querySelectorAll("[data-type]").forEach((el1) => {
        el1.textContent = el[el1.getAttribute("data-type")];
    });
    parentContainer.append(t);
});

student.courses.forEach((el,idx) => {
    const t = courseTemp.cloneNode(true);
    t.querySelector(".heading").textContent="Course"+(idx+1);
    t.querySelectorAll("[data-type]").forEach((el1) => {
        const d=el1.getAttribute("data-type");
        if (d.endsWith("CountryCode")) el[d] = "+" + el[d];
        el1.textContent = el[d];
    });
    courseContainer.append(t);
});

student.documents.forEach((el,idx) => {
    const t = documentTemp.cloneNode(true);
    t.querySelector(".heading").textContent="Document"+(idx+1);
    t.querySelectorAll("[data-type]").forEach((el1) => {
        el1.textContent = el[el1.getAttribute("data-type")];
    });
    documentContainer.append(t);
});