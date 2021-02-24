import { symlink } from 'fs-extra';
import * as _ from 'lodash'
// npm install --save @types/lodash
// npm install lodash

var JOKER='J\nO\nK\nE\nR'
export var pukeData={
    value:['3','4','5','6','7','8','9','10','J','Q','K','A','2','g','G'],
    grade(val){
        return this.value.indexOf(val)
    }
}

export function ShuffleCards(){
    var unshuffledCards=[];
    pukeData.value.map(value=>{
        ['fk','hx','ht','mh'].map(type=>{
            if(value!='g' && value!='G')
            unshuffledCards.push({value,type,grade:pukeData.grade(value),
                color:(type=='fk'||type=='hx')?'RED':'BLACK',
                text:value
            })
        })
    })
    unshuffledCards.push({value:'g',text:JOKER,type:null,grade:13,color:'BLACK'});
    unshuffledCards.push({value:'G',text:JOKER,type:null,grade:14,color:'RED'  });
    var shuffledCards = _.shuffle(unshuffledCards)
    return shuffledCards
}

export function sortCards(cards){
    return cards.sort((a,b)=>{
        return a.grade==b.grade?(['fk','hx','ht','mh'].indexOf(a.type)-['fk','hx','ht','mh'].indexOf(b.type)):(b.grade-a.grade)
    })
}

export function outCardCheck(cardValues){
    var continuousCnt=[[5,6,7,8,9,10,11,12],[3,4,5,6,7,8,9,10],[2,3,4,5]]
    function isContinuous(arrIdx){
        var arr=sameCntArrs[arrIdx]
        var lastGrade=pukeData.grade(arr[0])-1
        return !arr.map(val=>{
            var res=lastGrade+1==pukeData.grade(val) && pukeData.grade(val)<=pukeData.grade('A')
            lastGrade=pukeData.grade(val)
            return res
        }).includes(false) && continuousCnt[arrIdx].includes(arr.length)
    }
    var sameCntArrs=[[],[],[],[]]//one-four
    cardValues.map(value=>{
        var includeIdx=0
        sameCntArrs.map((arr,idx)=>{  if(arr.includes(value)) includeIdx+=idx+1;})
        _.pull(sameCntArrs[includeIdx-1],value)
        sameCntArrs[includeIdx].push(value)
    })
    sameCntArrs.map(arr=>{ 
        arr.sort((a,b)=>{ return pukeData.grade(a)-pukeData.grade(b) } )
    })
    var styleCode=0
    sameCntArrs.map((arr,idx)=>{ styleCode += arr.length*Math.pow(13,idx) })
    
    if(styleCode==2 && pukeData.grade(sameCntArrs[0][0])>12 && pukeData.grade(sameCntArrs[0][1])>12)
    return { type:'炸弹', grade:pukeData.grade(sameCntArrs[0][0]) }
    var styleDic={
        1:   { type:'单张',   grade:pukeData.grade(sameCntArrs[0][0]) },
        13:  { type:'对子',   grade:pukeData.grade(sameCntArrs[1][0]) },
        169: { type:'三张',   grade:pukeData.grade(sameCntArrs[2][0]) },
        170: { type:'三带一', grade:pukeData.grade(sameCntArrs[2][0]) },
        182: { type:'三带二', grade:pukeData.grade(sameCntArrs[2][0]) },
        340: { type:'飞机',   grade:pukeData.grade(sameCntArrs[2][0]) },
        351: { type:'飞机',   grade:pukeData.grade(sameCntArrs[2][0]) },
        2197:{ type:'炸弹',   grade:pukeData.grade(sameCntArrs[3][0]) },
    }
    for(var i=0;i<=2;i++) 
        for(var j=0;j<continuousCnt[i].length;j++)
            styleDic[Math.pow(13,i)*continuousCnt[i][j]]={ type:['顺子','连对','连三'][i], grade:pukeData.grade(sameCntArrs[i][0]), count:sameCntArrs[i].length }
    
    var res=styleDic[styleCode]
    if(res && ['顺子','连对','连三',].includes(res.type)) {
        if(isContinuous(['顺子','连对','连三',].indexOf(res.type)))
            return res
        else return null
    }
    else return res
}

export function beatify(outCard){
    var dic={}
    outCard.map(card=>{
        if(!Object.keys(dic).includes(card.info.value)) dic[card.info.value]=[card]
        else dic[card.info.value].push(card)
    })
    var keys=Object.keys(dic)
    keys.sort((a,b)=>{
        return dic[b].length-dic[a].length
    })
    var tmp=[]
    keys.map(key=>{
        tmp.concat(dic[key])
    })
    outCard=tmp;
}