function updateDateTime() {
    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.querySelector('#time').textContent = now;
}
setInterval(updateDateTime, 1000);

const windows = document.querySelectorAll(".window"); 

function onMouseDrag(event, element) {
    let leftValue = parseInt(window.getComputedStyle(element).left);
    let topValue = parseInt(window.getComputedStyle(element).top);
    var moveX = (leftValue + event.movementX < 0)? 0 : ((leftValue + event.movementX + element.offsetWidth > innerWidth)? innerWidth - element.offsetWidth : leftValue + event.movementX);
    element.style.left = `${moveX}px`;

    var moveY = (topValue + event.movementY < 0)? 0 : topValue + event.movementY;
    if (moveY + element.offsetHeight > innerHeight - innerHeight*(4.85/100)) {
        moveY = (innerHeight - innerHeight*(4.85/100)) - element.offsetHeight;
    }
    //var moveY = (topValue + event.movementY < 0)? 0 : topValue + event.movementY;
    // var moveY = (topValue + event.movementY > innerHeight)? innerHeight : topValue + event.movementY;
    element.style.top = `${moveY}px`;


}

windows.forEach((element) => {
    element.addEventListener("mousedown", (e) => {
        const onMove = (event) => onMouseDrag(event, element); 

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMove);
        }, { once: true });
    });
});