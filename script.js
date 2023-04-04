var cards = []
var odds = []
var initialCards
var tot
var average
var highest
var lowest

var totIterations
var los
var abyssRuns
var selectors

/* --abyssal dungeons--
nord vern | shandi, thirain, beatrice, king thirian, kharmine, armen, delain armen, zinnervale
rohendel  | + azena
yorn      | + balthor
feiton    | + nineveh
punika    | + dead kakul 
*/
// shandi, thirain, azena, balthor, nineveh

function awakeningsToCardNumber(s){
    let n = s.charCodeAt(0) - 48
    return (n*n+n)/2 + s.charCodeAt(2) - 48 + 1
}

function getDataAndStart(form){
    cards = [form.kadan.value, form.shandi.value, form.thirain.value, form.azena.value, form.balthorr.value, form.nineveh.value, form.wei.value]
    for (let i = 0; i < cards.length; i++)
        cards[i] = awakeningsToCardNumber(cards[i])

    //console.log(cards)
    console.log(cards, form.totI.value, form.los.value, form.startSel.value, form.endSel.value)
    clearLogs()
    start(cards, form.totI.value, form.los.value, form.startSel.value, form.endSel.value, form.abyssRuns.value)
}

async function start(_cards, _totI, _los, _startSel, _endSel, _abyssRuns){
    initialCards = []
    for (var i = 0; i < _cards.length; i++) {
        initialCards[i] = _cards[i]
    }
    totIterations = _totI  //preferably 10k or 100k
    los = _los
    if (parseInt(_startSel) > parseInt(_endSel))
        _endSel = _startSel
    abyssRuns = (_abyssRuns == "true")
    mariShop = (_abyssRuns == "false")

    for (selectors = parseInt(_startSel); selectors <= parseInt(_endSel); selectors++) {
        initialize()
        for (let i = 0; i < totIterations; i++)
            await main()
        output()
    }
}

function initialize(){
    average = 0
    highest = 0
    lowest = 10000
}

function output(){
    let s = ''
    s += '<br>Selectors: ' + selectors
    s += '<br>Average: ' + (average / totIterations)
    s += '<br>Lowest: ' + lowest
    s += '<br>Highest: ' + highest
    s += '<br><br>'

    for (let i = 0; i < odds.length; i++) {
        if(!odds[i])
            continue
        //console.log(i, '\t', decimals(odds[i]/totIterations*100,4, " %"))
        //console.log(i, '\t', odds[i])
    }

    document.getElementById("logs").innerHTML += s
}

function clearLogs(){
    document.getElementById("logs").innerHTML = ''
}

function addToCards(card){
    cards[card]++
    if (cards[card] > 16)
        cards[card] = 16
}

function abyssRun(nLos, nTrash, times){
    for (let i = 0; i < times; i++) {
        if (random(0, 19) != 0) //4% speculated odds of card drop, probably copium
            continue
        let r = random(1, nLos + nTrash)
        if (r <= nLos)
            addToCards(r)  //+1 because kadan is '0', the rest is in the same order as abyssals appearence
    }
}

async function main() {
    let tot = 0 //tot opened leg packs
    for (let i = 0; i <= 6; i++)
        cards[i] = initialCards[i]

    do{
        tot++
        if (abyssRuns) {
            abyssRun(2, 6, 2) //north vern
            abyssRun(3, 6, 2) //rohendel
            abyssRun(4, 6, 2) //yorn
            abyssRun(5, 6, 3) //feiton
            abyssRun(5, 7, 2) //punika
            abyssRun(5, 7, 3) //argos, surely same odds right
        } else if (mariShop) {
            let r = random(0, 18)
            if (r > 6)
                continue
            addToCards(r)
        }

    }while(!losCheck())

    if(tot>highest)
        highest = tot
    if(tot<lowest)
        lowest = tot

    if(!odds[tot])
        odds[tot] = 0
    odds[tot]++

    average += tot
}

function awakenings(card){
    let awakens = 0
    while(card-1 >= awakens + 1) {
        card -= awakens + 1
        awakens++
    }
    return awakens
}

function losCheck(){
    let totAwk = 0

    for (let i = 0; i < 7; i++)
        if(i != lowestLosCard())
            totAwk += awakenings(cards[i])
    //console.log(totAwk)
    return totAwk + useSelectors() >= los
}

function random(min,max){
    return Math.floor(Math.random()*(max-min+1)+min)
}

//console.log(odds)
function decimals(n, d) {
    n = parseFloat(n) || 0
    return n.toFixed(d)
}

function lowestLosCard(){
    let min = 0
    for (let i = 1; i < 7; i++)
        if (cards[min] > cards[i])
            min = i
    return min
}

function useSelectors(){
    let tSel = selectors
    let awk = 0
    let lowAwk = 1 //starts at 1 because it assumes kadan is 0
    let tcards = []
    let change
    for (let i = 0; i < cards.length; i++)
        tcards[i] = cards[i]

    do{
        change = false
        for (let i = 2; i < cards.length; i++) {
            if (i == lowestLosCard())
                continue
            if (nextAwk(tcards[lowAwk]) > nextAwk(tcards[i]))
                lowAwk = i
        }
        if (tSel >= nextAwk(tcards[lowAwk])){
            tSel -= nextAwk(tcards[lowAwk])
            tcards[lowAwk] += nextAwk(tcards[lowAwk])
            awk++
            change = true
        }
    } while (change)

    return awk
}

//how many cards needed for the next awakening
function nextAwk(card){
    let awakens = 0
    while(card-1 >= awakens + 1) {
        card -= awakens + 1
        awakens++
    }
    return awakens - card + 2
}
