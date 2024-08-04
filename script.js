"use strict";

let myname = ""
let enemy = undefined
let already_shown_youkais = []

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start").addEventListener("click", start)
})

function start() {
    myname = document.getElementById("myname").value || "妖怪はかせ"
    enemy = YOUKAIS[Math.floor(Math.random() * YOUKAIS.length)]
    document.getElementById("select").innerHTML = ""
    document.getElementById("dialog").innerHTML = ""
    add_li(0, `${myname} のところに ${enemy.name_used} がやってきた`)
    add_li(2, "ようかいしりとり しようかい？")
    add_li(1, "よーし そうかい しようかい")
    add_li(2, enemy.name_used)
    already_shown_youkais = [enemy]
    my_turn()
}

function my_turn() {
    const last_youkai = already_shown_youkais.at(-1)
    if (last_youkai.last_letter == "ン") return win(true)

    const next_youkais = get_next_youkais()
    if (next_youkais.length == 0) return lose()

    next_youkais.forEach((youkai) => {
        const button = document.createElement("button")
        button.innerText = youkai.name_used
        button.addEventListener("click", () => select(youkai))
        document.getElementById("select").appendChild(button)
    })
}

function enemy_turn() {
    const last_youkai = already_shown_youkais.at(-1)
    if (last_youkai.last_letter == "ン") return lose(true)

    let next_youkais = get_next_youkais()
    if (next_youkais.length == 0) return win()

    const next = enemy_choose_next_youkai(next_youkais)
    add_li(2, next.name_used)
    already_shown_youkais.push(next)
    my_turn()
}

function enemy_choose_next_youkai(next_youkais) {
    let next = next_youkais[Math.floor(Math.random() * next_youkais.length)]
    if (document.getElementById("easy").checked) return next

    const next_youkais2 = next_youkais.filter(y => y.last_letter != "ン")
    if (next_youkais2.length != 0)
        next = next_youkais2[Math.floor(Math.random() * next_youkais2.length)]
    if (document.getElementById("normal").checked) return next

    let max = 0
    next_youkais2.forEach(youkai => {
        const youkais = get_next_youkais(already_shown_youkais.concat(youkai))
        let count = 0
        youkais.forEach(y => { if (y.winable) count++ })
        if (max < count / youkais.length) {
            max = count / youkais.length
            next = youkai
        }
    })
    if (document.getElementById("hard").checked) return next

    const used = already_shown_youkais.flatMap(y => y.all_names)
    return foreseeing(used, already_shown_youkais.at(-1).last_letter) || next
}

function win(n = false) {
    add_li(2, `${n ? "ん！？ " : ""}まけた～`)
    add_li(0, `${enemy.name_used} は くやしそうに 帰っていった…`)
}

function lose(n = false) {
    add_li(1, `${n ? "ん！？ " : ""}まけた～`)
    add_li(0, `${myname} は 喰われた…`)
}

function get_next_youkais(youkais = already_shown_youkais) {
    const used = youkais.flatMap(y => y.all_names)
    const next_youkais = YOUKAIS_BY_FIRST_LETTER[youkais.at(-1).last_letter] || []
    return next_youkais.filter(y => used.indexOf(y.name_used) == -1)
}

function select(youkai) {
    document.getElementById("select").innerHTML = ""
    add_li(1, youkai.name_used)
    already_shown_youkais.push(youkai)
    enemy_turn()
}

function foreseeing(used, last_letter) {
    if (last_letter == "ン") return true
    let next_youkais = YOUKAIS_BY_FIRST_LETTER[last_letter] || []
    next_youkais = next_youkais.filter(y => used.indexOf(y.name_used) == -1)
    next_youkais.sort((a, b) => {
        return (YOUKAIS_BY_FIRST_LETTER[a.last_letter] || []).length <
               (YOUKAIS_BY_FIRST_LETTER[b.last_letter] || []).length ? -1 : 1
    })
    for (const youkai of next_youkais) {
        if (foreseeing(used.concat(youkai.all_names), youkai.last_letter) == false)
            return youkai
    }
    return false
}

function add_li(person, text) {
    const li = document.createElement("li")
    if (person == 0) {
        li.className = "description"
        li.innerText = text
    } else if (person == 1) {
        li.className = "you"
        li.innerText = `${myname}「${text}」`
    } else if (person == 2) {
        li.className = "enemy"
        li.innerText = `${enemy.name_used}「${text}」`
    }
    document.getElementById("dialog").appendChild(li)
    setTimeout(() => li.scrollIntoView({ behavior: "smooth", block: "center" }), 50)
}
