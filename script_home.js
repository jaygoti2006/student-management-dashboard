const classFilterInput=document.querySelector("#class");
const sortOrderToggle=document.querySelector(".sort-order");

const curr={
    order: 0
}

sortOrderToggle.addEventListener("click",function(e){
    if(curr.order===0){
        curr.order=1;
        sortOrderToggle.querySelector(".asce").classList.add("hidden");
        sortOrderToggle.querySelector(".desc").classList.remove("hidden");
    }else{
        curr.order=0;
        sortOrderToggle.querySelector(".desc").classList.add("hidden");
        sortOrderToggle.querySelector(".asce").classList.remove("hidden");
    }
});