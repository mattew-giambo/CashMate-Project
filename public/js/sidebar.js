/* Script per sidebar 
querySelector è un metodo dell'oggetto document che consente di selezionare il primo elemento del DOM che
corrisponde a un selettore CSS, restituisce il primo nodo del DOM che corrisponde al selettore fornito.

classList è una proprietà disponibile su tutti gli elementi del DOM. Fornisce un'interfaccia per accedere, 
aggiungere, rimuovere o verificare le classi CSS associate a un elemento HTML, restituisce un oggetto 
che rappresenta l'elenco delle classi dell'elemento. 

il metodo toggle(className) aggiunge la classe specificata se non è presente, oppure la rimuove se è già presente

style è una proprietà disponibile su ogni elemento HTML che consente di accedere e modificare gli stili 
CSS in linea, ossia quelli applicati direttamente all'elemento via style="...", non accede agli stili 
definiti nei fogli CSS esterni o interni, ma solo quelli in linea.

innerText è una proprietà che permette di leggere o modificare il contenuto testuale visibile di un elemento 
HTML, escludendo i tag HTML.

<sidebar.style.height = `${sidebar.scrollHeight}px`;> significa "imposta l'altezza visibile del blocco sidebar
uguale alla sua altezza totale interna", la proprietà scrollHeight dice "qual è l'altezza totale del contenuto
dentro sidebar?" anche se una parte del contenuto non è visibile perchè magari è collassato o ha overflow: hidden,
scrollHeight dà l'altezza completa. Ricorda: i backtick permettono di inserire una variabile dentro una stringa,
${...} significa "inserisci qui il valore della variabile"*/


const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");

let collapsedSidebarHeight = "70px"; // altezza nei dispositivi mobili
let fullSidebarHeight = "calc(100vh - 32px)"; // Height in larger screen

sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
});

function toggleMenu (isMenuActive){
    if(isMenuActive){
        sidebar.style.height = `${sidebar.scrollHeight}px`;
        menuToggler.querySelector("span").innerText = "close"; // font di google corrispondente alla X
    }
    else{
        sidebar.style.height = collapsedSidebarHeight;
        menuToggler.querySelector("span").innerText = "menu";
    }                
} // sidebar.scrollHeight è l'altezza in px necessaria per visionare tutto il contenuto della sidebar

menuToggler.addEventListener("click", () => { // evento sui dispositivi mobili
    toggleMenu(sidebar.classList.toggle("menu-active"));
});