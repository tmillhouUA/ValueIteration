//Visualization Settings

let width = 1600
let height = 900
let graphBorder = 150
let fps = 2

let gamma = .9

let rewardMap = [[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
                 [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
                 [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
                 [  -1,  -1,  -1,-100,-100,-100,  -1,  -1,  -1],
                 [  -1,  -1,  -1,-100,-100,-100,  -1,  -1,  -1],
                 [  -1,  -1,  -1,-100,-100,-100,  -1,  -1,  -1],
                 [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
                 [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
                 [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1, 100]]

console.log(rewardMap)

function getReward(s, map=rewardMap){return map[s[1]][s[0]]}


let maxY = rewardMap.length 
let maxX = rewardMap[0].length

let valueMap = []

for(let j=0;j<maxY;j++){
    valueMap[j] = []
    for(let i=0;i<maxX;i++){ 
        if(Math.abs(getReward([i,j]))==100){
            //console.log([i,j])        
            valueMap[j][i] = getReward([i,j])
        }
        else{
            valueMap[j][i] = 100*(Math.random()*2-1)
        }
    }}

function getValue(s, map=valueMap){return map[s[1]][s[0]]}

console.log(valueMap)

let initState = [0,0]

let actions = ["UP","DOWN","LEFT","RIGHT"]


function transitionFunction(action, state, map=rewardMap, randomize = .25){

    if(Math.abs(getReward(state))==100){
        return [[state,1,0]]    
    }
    else{

        let maxY = map.length 
        let maxX = map[0].length

        let sNext = JSON.parse(JSON.stringify(state))

        
        actionDist = []

        for(let a=0; a<actions.length;a++){
            sNext = JSON.parse(JSON.stringify(state)) 
            if(actions[a]=="UP"){                           
                sNext[1]-- 
            }
            else if(actions[a]=="DOWN"){
                sNext[1]++
            }
            else if(actions[a]=="RIGHT"){
                sNext[0]++
            }
            else if(actions[a]=="LEFT"){
                sNext[0]--
            }
            else{throw new Error('NOT A VALID ACTION')}

            sNext[0] = Math.min(sNext[0],maxX-1)
            sNext[0] = Math.max(sNext[0],0)
            sNext[1] = Math.min(sNext[1],maxY-1)
            sNext[1] = Math.max(sNext[1],0)
            
            let pState = .1
            if(actions[a]==action){
                pState = .7
            }
            rNext = getReward(sNext)
            actionDist.push([sNext,pState,rNext])
            
        }        
        
        return actionDist
    }
}

function computeActMaxQ(state, map=valueMap){
    let values = []
    
    for(let a=0; a<actions.length;a++){                                
        transProbs = transitionFunction(actions[a],state)
        let expectation = 0
        for(let s=0; s<transProbs.length;s++){ 
            expectation += (transProbs[s][2]+gamma*getValue(transProbs[s][0])) * transProbs[s][1] 
        }
        values.push(expectation)                
    }
   
    let value = Math.max(...values)

    return actions[values.indexOf(value)]
}

console.log(transitionFunction("RIGHT", [2,3]))
console.log(transitionFunction("DOWN", [8,7]))

//Create SVG
let svg = d3.select('#viz').append('svg').attr("width",width+200).attr("height",height)

//Basic layout elements
svg.append("text").text("Avoid The Sarlacc").attr("dominant-baseline","middle").attr("text-anchor","middle")
                    .attr("x",650).attr("y",75).attr("font-family", "monospace").attr("font-size",graphBorder/4).attr("fill","rgb(50,50,50)")   


svg.append("text").text("Estimated Value").attr("dominant-baseline","middle").attr("text-anchor","middle")
                    .attr("x",350).attr("y",150).attr("font-family", "monospace").attr("font-size",graphBorder/4).attr("fill","rgb(50,50,50)") 
                    
svg.append("text").text("Actual Rewards").attr("dominant-baseline","middle").attr("text-anchor","middle")
                    .attr("x",950).attr("y",150).attr("font-family", "monospace").attr("font-size",graphBorder/4).attr("fill","rgb(50,50,50)")   
  
                    
learnButton = svg.append("rect").attr("x",250).attr("y",725)
.attr("height", 50).attr("width",200).attr("rx",5)
.attr("fill",`rgba(0,0,0,.25)`).attr("stroke", "rgb(50,50,50)").on("click",learn)

svg.append("text").text("Value Iterate").attr("dominant-baseline","middle").attr("text-anchor","middle")
                    .attr("x",350).attr("y",750).attr("font-family", "monospace").attr("font-size",20).attr("fill","rgb(50,50,50)").on("click",learn)

moveButton = svg.append("rect").attr("x",850).attr("y",725)
                    .attr("height", 50).attr("width",200).attr("rx",5)
                    .attr("fill",`rgba(0,0,0,.25)`).attr("stroke", "rgb(50,50,50)").on("click",move)
                    
svg.append("text").text("Move").attr("dominant-baseline","middle").attr("text-anchor","middle")
                                        .attr("x",950).attr("y",750).attr("font-family", "monospace").attr("font-size",20).attr("fill","rgb(50,50,50)").on("click",move)
let score = svg.append("text").text("Score: 0").attr("dominant-baseline","middle").attr("text-anchor","middle")
.attr("x",950).attr("y",800).attr("font-family", "monospace").attr("font-size",20).attr("fill","rgb(50,50,50)").on("click",move)                    
  
//Build map of current V estimate
let glyphMap = []
for(let j=0;j<maxY;j++){
    glyphMap[j] = []
    for(let i=0;i<maxX;i++){ 
        let value = JSON.parse(JSON.stringify(valueMap[j][i]))
        value = Math.max(-50,value)
        value = Math.min(50,value)        
        shade = 255 * ((value+50)/100)
        glyphMap[j][i] = svg.append("rect").attr("x",100+i*(500/maxX)).attr("y",200+j*(500/maxY))
                        .attr("height", 500/maxY).attr("width",500/maxX)
                        .attr("fill",`rgba(${255-shade},${shade},0,.75)`).attr("stroke", "rgb(50,50,50)")
}}

//Build labels for current V estimate
let labelMap = []
for(let j=0;j<maxY;j++){
    labelMap[j] = []
    for(let i=0;i<maxX;i++){ 
        let value = JSON.parse(JSON.stringify(valueMap[j][i]))        
        labelMap[j][i] = svg.append("text").text(parseInt(value)).attr("dominant-baseline","middle").attr("text-anchor","middle")
        .attr("x",100+(i+.5)*(500/maxX)).attr("y",200+(j+.5)*(500/maxY)).attr("font-family", "monospace").attr("font-size",20).attr("fill","rgb(50,50,50)")   
}}


//Build ground truth reward map
let glyphMapGT =[]
for(let j=0;j<maxY;j++){
    glyphMapGT[j] = []
    for(let i=0;i<maxX;i++){ 
        let value = JSON.parse(JSON.stringify(rewardMap[j][i]))
        value = Math.max(-50,value)
        value = Math.min(100,value)       
        shade = 255 * ((value+50)/150)
        glyphMapGT[j][i] = svg.append("rect").attr("x",700+i*(500/maxX)).attr("y",200+j*(500/maxY))
                        .attr("height", 500/maxY).attr("width",500/maxX)
                        .attr("fill",`rgba(${255-shade},${shade},0,.75)`).attr("stroke", "rgb(50,50,50)")
}}

//Add characters 


let boba = svg.append('image').attr('href', "../PolicyIteration/boba.png").attr("x",705+8*(500/maxX)).attr("y",205+8*(500/maxY)).attr("height",500/maxY -10).attr("width",500/maxX -10);

let bobaV = svg.append('image').attr('href', "../PolicyIteration/boba.png").attr("x",105+8*(500/maxX)).attr("y",205+8*(500/maxY)).attr("height",500/maxY -10).attr("width",500/maxX -10);

let sarlacc = svg.append('image').attr('href', "../PolicyIteration/sarlacc.png").attr("x",705+3*(500/maxX)).attr("y",205+3*(500/maxY)).attr("height",3*(500/maxY) -10).attr("width",3*(500/maxX) -10);

let sarlaccV = svg.append('image').attr('href', "../PolicyIteration/sarlacc.png").attr("x",105+3*(500/maxX)).attr("y",205+3*(500/maxY)).attr("height",3*(500/maxY) -10).attr("width",3*(500/maxX) -10);

let lukeScore = 0
let lukePos = [0,0]
let luke = svg.append('image').attr('href', "../PolicyIteration/luke.png").attr("x",705).attr("y",205).attr("height",500/maxY -10).attr("width",500/maxX -10);

function updateValues(V=valueMap){

    for(let j=0;j<maxY;j++){
        for(let i=0;i<maxX;i++){
            values = []

            //Get expected values of actions
            for(let a=0; a<actions.length;a++){                                
                transProbs = transitionFunction(actions[a],[i,j])
                let expectation = 0
                for(let s=0; s<transProbs.length;s++){ 
                    expectation += transProbs[s][1]*(transProbs[s][2]+gamma*getValue(transProbs[s][0]))
                }
                values.push(expectation)                
            }

            //Assume we do the max expected value action
            let value = Math.max(...values)
            V[j][i] = value
            
            //Update color and value label
            value = Math.min(100,value)
            value = Math.max(-50,value)    
            shade = 255 * ((value+50)/150)
            
            if(Math.abs(getReward([i,j]))!=100){   

                glyphMap[j][i].attr("x",100+i*(500/maxX)).attr("y",200+j*(500/maxY))
                                .attr("height", 500/maxY).attr("width",500/maxX)
                                .attr("fill",`rgba(${255-shade},${shade},0,.75)`).attr("stroke", "rgb(50,50,50)")
            }
            labelMap[j][i].text(parseInt(V[j][i]))
            
    }}
}

function move(V=valueMap){
    
    bestAction = computeActMaxQ(lukePos,V)
    
    transProbs = transitionFunction(bestAction,lukePos,V)

    //Make cumulative distribution
    cumulativeP = 0
    for(let i=0;i<transProbs.length;i++){
        cumulativeP +=transProbs[i][1]
        transProbs[i][1] = cumulativeP

    }
    
    //Take action, take chances
    dieRoll = Math.random()
    
    for(let i=0;i<transProbs.length;i++){
        if(dieRoll<transProbs[i][1]){
            lukeScore += transProbs[i][2]
            if(Math.abs(transProbs[i][2])!=0){
                lukePos = transProbs[i][0]}      
            else{
                lukePos = [0,0]
                lukeScore = 0
            }
            console.log(lukePos)
            break
        }
    }

    luke.attr('href', "../PolicyIteration/luke.png").attr("x",705 + lukePos[0]*(500/maxX)).attr("y",205 + lukePos[1]*(500/maxY))
    score.text(`Score: ${lukeScore}`) 
    console.log(transProbs)
}

learning = 0
function learn(){
    if(!learning){
        learnAnimation = setInterval(function (){updateValues(V=valueMap)},150)
        learnButton.attr("fill","rgba(0,128,0,.25)")
        learning = 1
    }else{
        clearInterval(learnAnimation)
        learnButton.attr("fill","rgba(0,0,0,.25)")
        learning = 0 
    }
}

//valueMap =updateValues(V=valueMap)
//while(true){valueMap =updateValues(V=valueMap)}


