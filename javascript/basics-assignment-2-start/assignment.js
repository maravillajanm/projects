const task3Element = document.getElementById('task-3');
function greetUser () {
    alert("Hi John, Papa")
}
function greetUser2 (userName) {
    alert ("Hi " + userName);
}
function greetUser3 (sentOne, sentTwo, sentThree) {
    return sentOne + sentTwo + sentThree;
}

greetUser();
greetUser2("Yes Papa");
task3Element.addEventListener ("click", greetUser)
alert (greetUser3("Test ", "Test2 ", "Test3"))