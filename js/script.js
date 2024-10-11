var canvas = null;
var context = null;
/*var canvasWidth = 1024;
var canvasHeight = 600*/;
let screenWidth = 1124;//option[numOption].widthScreenBlock*mapSize;// ширина экрана
let screenHeight = 768;// option[numOption].heightScreenBlock*mapSize;// высота экрана
var windowWidth = 1124;//document.documentElement.clientWidth;
var windowHeight = 768;//document.documentElement.clientHeight;
var windowWidthOld = windowWidth;
var windowHeighOld = windowHeight;
var  canvasWidth= windowWidth;
var  canvasHeight= windowHeight;
var scale = 1;
var flagScaling = false;
/*var  widthSide = screenWidth - camera.width;
var  heightSide = screenHeight - camera.height;*/
var size = 40;
var quantityColor = 4;//64
var quantityBullet = 150;
var quantityBurst = 500;
var quantityTeam = 4;
var quantityPanzer = 64;
var quantityWall = 64;
var quantityBonus = 150;


var modeGame = 'GOD';// 'GOD', 'HERO', 'EGREGOR'
var visible = true;
var numSelectPanzer = 0;
var numGenesPanzer = 0;
var distAttack = 300;
var minusEnergyMove = 2;
var startPatrons = 10;
var countBeingPanzer = 0;
var imageArr=new Map();// массив картинок
var nameImageArr = ['energy','patrons','HP'];
var countLoadImage=0;// количество загруженных картинок
var countLoopIter = 0;
var numGeneration = 1;
var sensorValue = 0;
var helperArr = [];
var progresslevel = [];
var maxLevel = 50;
var maxXPPanzer = 0;
var maxSteps = 0;
var testFlagDirParam = true;
var colorArrRGB = [];
var panzer = {
    being: true,
    x:1,
    y:1,
    width: 35,
    height: 35,
    sizeTower: 7,
    colorStart: {
        R: 255,
        G: 255,
        B: 255,
    },
    color: "white",
    angleBody: 270,
    angleTower: 270,
    dir:0,
    speed:10,
    maxHP: 1000,
    HP: 1000,
    maxEnergy: 500,
    energy: 500,
    countPatrons:startPatrons,
    damage:10,// урон
    accuracy:75,// точность 
    speedAttack: 70,
    timeAttack: 30,
    countAttack: 0,
    age: 1,
    maxAge: 200,
    towerX:null,
    towerY: null,
    towerX1: null,
    towerY1: null,
    centerX:null,
    centerY: null,
    towerLength: 10,
    level: 1,
    XP: 0,
    team: null,
    genes: null,
    selectCommand:0,
    sensor: {
        bonus: null,
      /*  wall: null,*/
        enemy: null,
    },
    state: {
        body:null,
        tower:null,
        HP:null,
        energy:null,
        patrons: null,
        attack: 0,
        collis: 0,
    },
    memory:{
        M1: 0,
        M2: 0,
        M3: 0,
        M4: 0,
        M5: 0,
        M6: 0,
        M7: 0,
        M8: 0,

/*        MC1: 0,
        MC2: 0,
        MC3: 0,
        MC4: 0,*/
    }
}
var teamMemory = {
    MC1: 0,
    MC2: 0,
    MC3: 0,
    MC4: 0,
};
var teamMemoryArr = [];
var historyCommand = [];
var maxParam = {
    maxHP:2000,
    speed:30,
    damage: 100,
    accuracy: 100,
    speedAttack: 100,
}
// обьект линия
var line={
  x:null,
  y:null,
  x1:null,
  y1:null,
  numObject:0,
};
var wall = {
    being:false,
    x:null,
    y:null,
    width: size,
    height: size,
    type: 0,
    color: 'grey',
    lineArr:[],// массив линий для определение пересечения с прямой при расчетах
}
var map = {
    x:0,
    y:0,
    width: 800*4,
    height: 600*4,
}
var camera = {
    x:0,
    y:0,
    width: 800,
    height: 600, 
}
var  widthSide = screenWidth - camera.width;
var  heightSide = screenHeight - camera.height;
var Helper = function (x,y,color){
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 35;
    this.color = color;
    this.flagDrag = false;
    this.ofsX = 0;
    this.ofsY = 0;
    this.draw=function()
    {
        context.fillStyle = this.color
        context.fillRect(this.x*scale-camera.x,this.y*scale-camera.y,
                this.width*scale,this.height*scale);
    }
    this.update=function ()
    {
        if (checkInObj(this,mouseX/scale+camera.x,mouseY/scale+camera.y)==true &&  checkMouseLeft()==true 
            && this.flagDrag==false)
        {
            this.flagDrag = true;
            this.ofsX = this.x - mouseX / scale + camera.x;
            this.ofsY = this.y - mouseY / scale + camera.y;
        }
        if (this.flagDrag==true && checkMouseLeft()==false)
        {
            this.flagDrag = false;
        }
        if (this.flagDrag==true)
        {
            this.x = mouseX / scale + camera.x+this.ofsX;
            this.y = mouseY / scale + camera.y+this.ofsY;
            if (checkPressKey('Minus') && this.width>8)
            {
                this.width--;
                this.height--;
            }
            if (checkPressKey('Equal') && this.width<80)
            {
                this.width++;
                this.height++;
            }
        }
        
    }
}
var Bullets = function () { 
   

    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        dist: 0,
        DMG:null,
        master: null,
    }
    this.speed = 20; 
    this.bulletArr = [];
    this.init=function()
    {
        for (let i = 0; i < quantityBullet;i++)
        {
            let bullet = JSON.parse(JSON.stringify(this.bullet));
            bullet.being = false;
            this.bulletArr.push(bullet);
        }
    }
    this.drawBullets=function(context)
    {
        let countTrue = 0;
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                context.beginPath();
                context.fillStyle = "#FFFF00";
	            context.arc(this.bulletArr[i].x*scale-camera.x,this.bulletArr[i].y*scale-camera.y, 
                                        2*scale, 2*Math.PI, false);
	            context.fill();
	            context.lineWidth = 1;
	            context.strokeStyle = 'red';
	            context.stroke();
                countTrue++;
            }
        }
        //context.fillText(countTrue+'',20,50);
    }
    this.shot=function(x,y,angle,DMG,master)
    {
        for (let i = 0; i < quantityBullet;i++)
        if (this.bulletArr[i].being==false)
        {
            let bullet = JSON.parse(JSON.stringify(this.bullet));
            bullet.being = true;
            bullet.x = x;
            bullet.y = y;
            bullet.angle = angle;
            bullet.DMG = DMG;
            bullet.master = master;
            bullet.dist = 0;
            this.bulletArr[i] = bullet;
            break;
        }
        //this.bulletArr.push(bullet);
    }
    this.update=function()
    {
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            
            if (this.bulletArr[i].being==true)
            for (let j = 0; j < this.speed;j++)
            {
                if (this.bulletArr[i].being==true)
                {
                    let dx = 0;
                    let dy = 0;
                    let speed2 =(this.bulletArr[i].dist == 0) ?  this.speed : /*this.speed*/ 1;
                    dy = /*this.speed*/speed2* Math.sin(pi*(this.bulletArr[i].angle) / 180) ;
                    dx = /*this.speed*/speed2 * Math.cos(pi * (this.bulletArr[i].angle ) / 180) ;
                    this.bulletArr[i].x += dx;
                    this.bulletArr[i].y += dy;
                    this.collisionBullet(wallArr,i);
                    this.bulletArr[i].dist += Math.sqrt(dx * dx + dy * dy);
                    if (this.bulletArr[i].dist > distAttack) this.kill(i);
                }
            }
        }
    }
    this.kill =function(num)
    {
        if (this.bulletArr[num].being==true)
        {
            this.bulletArr[num].being = false;
        }
    }
    this.checkCollision=function(bullet,arr)
    {
        for (let i = 0; i < arr.length;i++)
        {

            let obj = arr[i];
                
            if (bullet.being==true)
            if (bullet.x>obj.x && bullet.x<obj.x+obj.width &&
                bullet.y>obj.y && bullet.y<obj.y+obj.height)
            {
                return i;
               /* burst.start(bullet.x,bullet.y);;
                this.kill(i);*/
                //   io.sockets.emit('newBurst',{x:bullet.x,y:bullet.y});
            }
        }
        return null;
    }
    this.collisionBullet=function(walls,num=null)
    {
        if (num==null)
        {    
            for (let i = 0; i < this.bulletArr.length;i++)
            {
                if (this.checkCollision(this.bulletArr[i],walls)!=null)
                {
                    burst.start(this.bulletArr[i].x,this.bulletArr[i].y);;
                    this.kill(i);
                }
                let index = this.checkCollision(this.bulletArr[i], panzerArr);
                if (index!=null)
                if (panzerArr[index].being==true)
                {
                    

                    panzerArr[index].HP -= this.bulletArr[num].DMG;
                    burst.start(this.bulletArr[i].x,this.bulletArr[i].y);;
                    this.kill(i);
                }
            }
        }
        else if (num!=null)
        {
            if (this.checkCollision(this.bulletArr[num],walls)!=null)
            {
                burst.start(this.bulletArr[num].x,this.bulletArr[num].y);;
                this.kill(num);
            }
            let index = this.checkCollision(this.bulletArr[num], panzerArr);
            if (index!=null)
            if (panzerArr[index].being==true)
            {
                valueXP = 100;
                if (panzerArr[index].team!=panzerArr[this.bulletArr[num].master].team)
                {
                    panzerArr[this.bulletArr[num].master].XP += valueXP*3;
                    if (panzerArr[this.bulletArr[num].master].XP >=
                        progresslevel[panzerArr[this.bulletArr[num].master].level] 
                        && (panzerArr[this.bulletArr[num].master].level<maxLevel)
                        )
                    {
                        panzerArr[this.bulletArr[num].master].level++;
                        addParamPanzer(panzerArr[this.bulletArr[num].master], true);
                    }

                }
                else
                {
                    if (panzerArr[this.bulletArr[num].master].XP >= valueXP*11)
                    {
                        panzerArr[this.bulletArr[num].master].XP -= valueXP*11;

                    }
                    else
                    {
                        panzerArr[this.bulletArr[num].master].XP = 0;
                    }
                    if (panzerArr[this.bulletArr[num].master].XP <=
                        progresslevel[panzerArr[this.bulletArr[num].master].level-1])
                    {
                        if (panzerArr[this.bulletArr[num].master].level>1)
                        {
                            panzerArr[this.bulletArr[num].master].level--;
                            addParamPanzer(panzerArr[this.bulletArr[num].master], false);
                        }
                    }

                }
                panzerArr[index].HP -= this.bulletArr[num].DMG;
                burst.start(this.bulletArr[num].x,this.bulletArr[num].y);;
                this.kill(num);
            }

        }
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            bullet = this.bulletArr[i];
            if (bullet.x>map.width/*screenWidth*/ || bullet.y>map.height/*screenHeight*/
                ||  bullet.x<0 || bullet.y<0   )
            {
                this.kill(i);
            }
        }
    }
}
var Burst=function()
{
    this.burstOne = {
        being: false,
        x: null,
        y: null,
        count: 0,
        maxCount: 15,
    }
    this.burstArr = [];
    this.init=function()
    {
        for (let i = 0; i < quantityBurst;i++)
        {
            let burst = JSON.parse(JSON.stringify(this.burstOne));
            this.burstArr.push(burst);
        }
    }
    this.draw=function()
    {
        for (let i = 0; i < this.burstArr.length;i++)
        {
            let burst = this.burstArr[i];
        
            if (burst.being==true)
            {
                context.strokeStyle = 'red';
                context.lineWidth = 1;
                context.beginPath();
                context.arc(burst.x*scale-camera.x,burst.y*scale-camera.y,
                                burst.count*scale, 0,3.14*2, false);
                context.stroke()
            }
        }

    }
    this.start=function(x,y)
    {
        for (let i = 0; i < this.burstArr.length;i++ )
        {
            if (this.burstArr[i].being==false)
            {
                this.burstArr[i].x = x;
                this.burstArr[i].y = y;
                this.burstArr[i].count = 0;
                this.burstArr[i].being = true;
                break;
            }
        }
    }
    this.update=function()
    {
        for (let i = 0; i < this.burstArr.length;i++ )
        {
            if (this.burstArr[i].being==true)
            {
                this.burstArr[i].count++;
                if (this.burstArr[i].count>this.burstArr[i].maxCount)
                {
                    this.burstArr[i].being = false;
                }
            }
        }
    }
}
var Bonuses = function () {
    this.quantityBonus = quantityBonus; //150;
    this.quantityBonusMin = 10;
    this.bonus = {
        being: false,
        x:null,
        y: null,
        width: 30,
        height: 30,
        type: 0,//null
        time: 0,
        maxTime: 100,
    }
    this.timeNew = 5//250;
    this.countTimeNew = 0;
    this.bonusArr = [];
    this.init = function ()
    {
        for (let i = 0; i < this.quantityBonus;i++)
        {
            let bonusOne = JSON.parse(JSON.stringify(this.bonus));
            this.bonusArr.push(bonusOne);
            if (i<this.quantityBonusMin)  this.new();
        }
        console.log('bonuses', this.bonusArr);
    }
    this.draw = function () 
    {
        for (let i = 0; i < this.bonusArr.length;i++)
        {
            if (this.bonusArr[i].being==true)
            {
                let nameImage = null;
                switch(this.bonusArr[i].type)
                {
                    case 0: nameImage = 'patrons'; break;
                    case 1: nameImage = 'energy'; break;
                    case 2: nameImage = "HP"; break;
                }
                drawSprite(context,imageArr.get(nameImage),
                    this.bonusArr[i].x,this.bonusArr[i].y,camera,scale)

            }

        }
    }
    this.new = function ()
    {
        for (let i = 0; i < this.quantityBonus;i++)
        {
            if (this.bonusArr[i].being==false)
            {
                let x = null;
                let y = null;
                let obj = {};
                do {
                    x = randomInteger(map.x, map.x + map.width);
                    y = randomInteger(map.y, map.y + map.height);
                    obj = {
                        x:x,
                        y:y,
                        width: this.bonus.width,
                        height: this.bonus.height,
                    }
                } while (checkCollisionArr(obj,wallArr)!=-1 ||
                        checkCollisionArr(obj,panzerArr)!=-1 ||
                        checkCollisionArr(obj,this.bonusArr)!=-1);
                this.bonusArr[i].being = true;
                this.bonusArr[i].x = x;
                this.bonusArr[i].y = y;
                this.bonusArr[i].type = randomInteger(0, 2);
                break;
            }
        }
    }
    this.update=function()
    {
        this.countTimeNew++;
        if (this.countTimeNew>=this.timeNew)
        {
            this.new();
            this.countTimeNew = 0;
        }
        for (let i = 0; i < this.bonusArr.length;i++)
        {
            for (let j = 0; j < panzerArr.length;j++)
            {
                if (checkCollision(this.bonusArr[i],panzerArr[j]))
                {
                    this.bonusArr[i].being = false;
                    panzerArr[j].XP += 20;
                    switch (this.bonusArr[i].type)
                    {
                        case 0: panzerArr[j].countPatrons += 10; break;
                        case 1: panzerArr[j].energy += 200; break;
                        case 2: panzerArr[j].HP += 200; break;
                        
                    }
                    if (panzerArr[j].energy > panzerArr[j].maxEnergy) 
                    {
                        panzerArr[j].energy = panzerArr[j].maxEnergy;
                    }
                    if (panzerArr[j].HP > panzerArr[j].maxHP) 
                    {
                        panzerArr[j].HP = panzerArr[j].maxHP;
                    }
                }
            }
        }
    }
}

var Genes = function () {
    this.quantityCommand = 48;
    this.selectCommand = 0;
    this.sensor = {
        bonus: null,
   /*     wall: null,*/
        enemy: null,
    }
    this.state = {
        body: null,
        tower: null,
        HP:null,
        energy:null,
        patrons: null,
        attack: 0,
        collis:0,
    }
    this.memory={
        M1: 0,
        M2: 0,
        M3: 0,
        M4: 0,
        M5: 0,
        M6: 0,
        M7: 0,
        M8: 0,
    },
    this.teamMemory={
        MC1: 0,
        MC2: 0,
        MC3: 0,
        MC4: 0,
    }

    this.typeDataValue = [
        {
            name: 'numMin1Max7',
            valueMin: 1,
            valueMax: 7,
        },
        {
            name: 'numMin0Max1',
            valueMin: 0,
            valueMax: 1,
        },
        {
            name: 'numQuanCommand',
            valueMin: 1,
            valueMax: this.quantityCommand - 1,
        },
        {
            name: 'memory',
            values: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'MC1', 'MC2', 'MC3', 'MC4',],
            valueMin: null,
            valueMax: null,
        },
        {
            name: 'comparison',
            values: ["==","!=",">","<",">=","<=",],
            valueMin: null,
            valueMax: null,
        },
        {
            name: 'arithmetic',
            values:["+","-","*","/",],
            valueMin: null,
            valueMax: null,
        },
        {
            name: 'sensor',
            values:['bonus','enemy',],
            valueMin: null,
            valueMax: null,
        },
        {
            name: 'state',
            values:['body','tower','HP','energy','patrons','attack','collis',],
            valueMin: null,
            valueMax: null,
        },
        {
            name: 'integer',
            //values:['bonus','enemy',],
            valueMin: -1000,
            valueMax:  1000,
        },
        {
            name: 'null',
            values:[null],
            valueMin: null,
            valueMax:  null,
        },


    ],
    this.commandDescr = [
        {
            name: 'exec',
            valueArr:[
                {
                    type:['numMin1Max7',]
                },
            ],
            countValue: null,
            
        },
        {
            name: 'goto',
            valueArr:[
                {
                    type:['numQuanCommand',]
                },
            ],
            countValue: null,  
        },
        {
            name: 'mov',
            valueArr:[
                {
                    type:['memory',]
                },
                {
                    type:['memory','sensor','state','integer','null']
                    //type:['sensor','state']


                },
            ],
            countValue: 2,  
        },
        {
            name: 'cmp',
            valueArr:[
                {
                    type:['memory','sensor','state','integer','null']
                },
                {
                    type:['comparison',]
                },
                {
                    type:['memory','sensor','state','integer','null']
                },
                {
                    type:['numQuanCommand']
                },
                {
                    type:['numQuanCommand']
                },
            ],
            countValue: 5,  
        },
        {
            name: 'calc',
            valueArr:[
                {
                    type:['memory']
                },
                {
                    type:['memory','sensor','state','integer','null']
                },
                {
                    type:['arithmetic',]
                },
                {
                    type:['memory','sensor','state','integer','null']
                },
            ],
            countValue: 4,  
        },


    ];
    for (let i = 0; i < this.commandDescr.length;i++)
    {
        this.commandDescr[i].countValue = this.commandDescr[i].valueArr.length;
    }
    this.command = {
        name: '',
        values: [],
    };
    this.commandArr = [];
    this.commandArrTwo = [];
    this.initCommandOne = function ()
    {
        let R1 = randomInteger(0,this.commandDescr.length-1);    
        let randArr = [];
        for (let j = 0; j < this.commandDescr[R1].countValue;j++)
        {
            let min = null;
            let max = null;
            let valueStr = null;
            let flagBreak = false;
            for (let k = 0; k < this.typeDataValue.length;k++)
            {
                let R2=randomInteger(0,this.commandDescr[R1].valueArr[j].type.length)
                for (let k1 = 0; k1 < this.commandDescr[R1].valueArr[j].type.length;k1++)
                if (this.typeDataValue[k].name==this.commandDescr[R1].valueArr[j].type[k1])
                {   
                    //let R2 = randomInteger(0,this.commandDescr[R1].valueArr[j].type.length);

                    //alert(123);
                    min = this.typeDataValue[k].valueMin;
                    max = this.typeDataValue[k].valueMax;
                    if (this.typeDataValue[k].values!=undefined)
                    {
                        let R3 = randomInteger(0,this.typeDataValue[k].values.length-1);
                        valueStr = this.typeDataValue[k].values[R3];
                        if (k1==R2)
                        {
                            flagBreak = true;
                            break;
                        }

                    }
                       
               
                }
                if (flagBreak == true) break;
            }
            //alert(min+' '+ max);
            if (min==null && max==null)
            {
                randArr.push(valueStr);

            }
            else
            {
                randArr.push(randomInteger(min,max));
            }
               
        }
        //alert(randArr[0]);
        //console.log(randArr);
        let commandOne = JSON.parse(JSON.stringify(this.command));
        commandOne.name = this.commandDescr[R1].name;
        for (let k = 0; k < randArr.length;k++)
        {
            commandOne.values[k] = randArr[k];

        }
        return commandOne;
    }
    this.initCommandRand = function()
    {
        for (let i = 0; i < this.quantityCommand;i++)
        {
            this.commandArr.push(this.initCommandOne());
        }
        console.log(this.commandArr);
        if (this.commandArrTwo.length<=0)
        {
            this.commandArrTwo = JSON.parse(JSON.stringify(this.commandArr));
        }
    }
    this.changeGenes=function (genes,count1,count2)
    {
      
        let commandArr2 = JSON.parse(JSON.stringify(genes));
        console.log('GENES', genes);
        for (let i = 0; i < count1;i++)
        {
            let R = randomInteger(0, this.quantityCommand-1);
            let newCommand = this.initCommandOne();
            commandArr2[R] = newCommand;
            console.log('R=' + R);
        }
        genes = JSON.parse(JSON.stringify(commandArr2));
        for (let i = 0; i < count2;i++)
        {
            let R = randomInteger(0, this.quantityCommand-1);
            //console.log('R=' + R);
            let name = genes[R].name// this.commandArr[R].name;
            let flagBreak = false;
            for (let j = 0; j < this.commandDescr.length;j++)
            {
                if (name==this.commandDescr[j].name)
                {
                    //for (let k = 0; k < this.commandDescr[j].valueArr.length;k++)
                    let k = randomInteger(0, this.commandDescr[j].countValue-1);
                    {

                        let typeArr = this.commandDescr[j].valueArr[k].type;
                        let R2 =randomInteger(0,typeArr.length-1);
                        {
                            for (let k1 = 0; k1 < this.typeDataValue.length;k1++)
                            {       
                                
                                if (typeArr[R2]==this.typeDataValue[k1].name)
                                {
                                    let values = this.typeDataValue[k1].values;
                                    let min= this.typeDataValue[k1].valueMin;
                                    let max = this.typeDataValue[k1].valueMax;
                                    let result = null;                                   
                                    if (min===null && max===null)
                                    {
                                        let R3 = randomInteger(0, values.length - 1);
                                        result = values[R3];                                      
                                    }
                                    else 
                                    {
                                        result = randomInteger(min, max);
                                    }
                                    console.log('VALUE', result);
                                    commandArr2[R].values[k] = result;
                              
                                    flagBreak = true; 
                                    break;   
                                }
                            }

                            if (flagBreak == true) break;
                        }
                        if (flagBreak == true) break;
                    }
                }
                if (flagBreak == true) break;
            }
           
        }
        return commandArr2;
    }
    this.draw = function (context,xx=820,genesArr=null) 
    {
        let x = xx;
        y = 10;
        let widthCom = 200;
        context.fillStyle = 'blue';
        context.fillRect(x,y,widthCom,580);
        context.fillStyle = 'white';
        context.font = '10px Arial';
        if (historyCommand.length>0)
        {
            for (let i = 0; i < historyCommand.length;i++)
            {
                let value = historyCommand[i];
                /*console.log('history ',historyCommand);*/
                context.fillStyle = '#008800 ';
                context.fillRect(x,y+value*12+3,widthCom,12);
                context.fillStyle = 'white';
                context.fillText(i,x+widthCom-10,y+value*12+12);
                if (i==historyCommand.length-1)
                {
                    context.fillStyle = '#964b00 ';
                    context.fillRect(x,y+value*12+4,widthCom,12);
                }
            }
        }
        
        let addX = 50;
        let commandArr = null;
        if (genesArr==null || genesArr.length==0)
        {
             commandArr = JSON.parse(JSON.stringify(this.commandArr));
        }
        else
        {
             commandArr = JSON.parse(JSON.stringify(genesArr));
        }
        for (let i = 0; i < this.commandArr.length;i++)
        {

            
            
            context.fillStyle = 'white';
            context.fillText(i,x+3,y+i*12+12);
            if (x!=820 && genesArr!=null && genesArr.length>0)
            {
                if (this.commandArr[i].name==genesArr[i].name)
                {
                    context.fillStyle = 'white';

                }
                else
                {
                    context.fillStyle = 'red';
                }

            }
            context.fillText(commandArr[i].name,x+20,y+i*12+12);
            let oldX = addX;
            for (let j = 0; j < commandArr[i].values.length;j++)
            {
                
                if (x!=820 && genesArr!=null && genesArr.length>0)
                {
                    if (this.commandArr[i].values[j]==genesArr[i].values[j])
                    {
                        context.fillStyle = 'white';

                    }
                    else
                    {
                        context.fillStyle = 'red';
                    }
                }                    
                context.fillText(commandArr[i].values[j],x+oldX/*+addX+j*addX*/,y+i*12+12);
                oldX += context.measureText(commandArr[i].values[j]).width + 10;

            }
        }
        if (genesArr==null)
        {

            let index = 0;
            addX = 45/*+widthCom*/;
            let multY = 18;
            colorText = 'white';
            y += 10;
            x += 85+widthCom/2;
            context.font = '14px Arial';
            context.fillStyle = 'white';
            context.fillText("Sensor",x+addX,y);
            context.font = '12px Arial';
            for (prop in this.sensor)
            {
                context.fillStyle = "blue";
                context.fillRect(x + /*85 +*/ addX * 2-4, y + index * multY + multY/3+1, 30, 15);
                context.fillStyle = colorText;
                context.fillText(prop,x+/*85+*/addX,y+index*multY+multY);

                context.fillText(this.sensor[prop],x+/*85+*/addX*2,y+index*multY+multY);
                index++;
            }
            y += multY * 4;
            index = 0;
            context.font = '14px Arial';
            context.fillStyle = 'white';
            context.fillText("State",x+addX,y);
            context.font = '12px Arial';
            for (prop in this.state)
            {
                context.fillStyle = "blue";
                context.fillRect(x + /*85 +*/ addX * 2-4, y + index * multY + multY/3+1, 30, 15);
                context.fillStyle = colorText;
                context.fillText(prop,x+/*85+*/addX,y+index*multY+multY);

                context.fillText(this.state[prop],x+/*85+*/addX*2,y+index*multY+multY);
                index++;
            }
            index = 0;
            y += multY * 8;
            for (prop in this.memory)
            {
                context.fillStyle = "blue";
                context.fillRect(x + /*85 +*/ addX * 2-4, y + index * multY + multY/3+1, 30, 15);
                context.fillStyle = colorText;
                context.fillText(prop,x+/*85+*/addX,y+index*multY+multY);

                context.fillText(this.memory[prop],x+/*85+*/addX*2,y+index*multY+multY);
                index++;
                if (index == 8) y += 20;
            }
            for (prop in this.teamMemory)
            {
                context.fillStyle = "blue";
                context.fillRect(x + /*85 +*/ addX * 2-4, y + index * multY + multY/3+1, 30, 15);
                context.fillStyle = colorText;
                context.fillText(prop,x+/*85+*/addX,y+index*multY+multY);

                context.fillText(this.teamMemory[prop],x+/*85+*/addX*2,y+index*multY+multY);
                index++;
                if (index == 8) y += 20;
            }
        }
    }
    this.setData=function(data,sensor,state,memory,teamMemory)
    {
     //   console.log(data);
        this.commandArr = [];
        for (let i = 0;i< data.commandArr.length;i++)
        {
            this.commandArr.push(data.commandArr[i]);
        }
        this.sensor =JSON.parse(JSON.stringify(sensor))
        this.state =JSON.parse(JSON.stringify(state))
        this.memory =JSON.parse(JSON.stringify(memory))
        this.teamMemory = JSON.parse(JSON.stringify(teamMemory));
    }
    this.setSelectCommand=function(value)
    {
        this.selectCommand = value;
    }

}
var colorArr = [];
var panzerArr = [];
var wallArr = [];

window.addEventListener('load', function () {
    preload();
    create();
    this.setTimeout(function(){
        update();
    },1)
    setInterval(function () {
       
        
        drawAll();
    },16);
});
function loadImageArr()// загрузить массив изображений
{
    // заполняем массив изображений именами
    for (let value of nameImageArr  )
    {
        let image=new Image();
        image.src="img/"+value+".png";        imageArr.set(value,image);
    }
    // проверяем загружены ли все изображения
    for (let pair of imageArr  )
    {
             imageArr.get(pair[0]).onload = function() {
                   countLoadImage++;
                   //console.log(imageArr);
                   console.log(countLoadImage);
                   if (countLoadImage==imageArr.size) 
                   {
                       imageLoad=true;
                    //  console.log(imageArr);
                   } // если загруженны все ищображения
             }
             imageArr.get(pair[0]).onerror = function() {   
                   alert("во время загрузки произошла ошибка");
                   //alert(pair[0].name);
                   
             }
     }  
}
function preload() 
{
    loadImageArr();
}
function create()
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    initKeyboardAndMouse(['KeyA', 'KeyW', 'KeyS', 'KeyD',"NumpadSubtract",'NumpadAdd','Minus','Equal',
                           'Space','Digit1','Digit2','Digit3','Digit4','Digit5','KeyQ','KeyH','KeyP',]);
    srand(2);
    updateSize();
/*    canvas.setAttribute('width',canvasWidth);
    canvas.setAttribute('height',canvasHeight);
    canvas.style.setProperty('left', (window.innerWidth - canvas.width)/2 + 'px'); 
    canvas.style.setProperty('top', (window.innerHeight - canvas.height) / 2 + 'px');*/ 
    // создаем список цветов в градиенте от красновго до синего через зеленый
    for (let i = 0; i < quantityColor;i++)
    {
        let R = 0;
        let G = 0;
        let B = 0;
        let qC = quantityColor;
        let range = qC / 4;
        if (i < range)
        {
            R = 255;
            G = Math.trunc((255 / range * (i)));
        }
        if (i >= range && i<range*2)
        {
            R = Math.trunc(255-(255 / range * (i-range)));
            G=255;
        }
        if (i >= range*2 && i<range*3)
        {
            G = 255;
            B = Math.trunc((255 / range * (i-range*2)));
        }
        if (i >= range*3 && i<range*4)
        {
            G = Math.trunc((255-255 / range * (i-range*3)));
            B=255;
        }
        let color = 'rgb(' + R + ',' + G + ',' + B + ')';
        let colorRGB = { R: R, G: G, B: B };
        colorArr.push(color);
        colorArrRGB.push(colorRGB);
    }
    console.log(colorArr);
    // инициализируем progressLevel
    for (let i = 1; i <= maxLevel;i++)
    {
        let x = 500;
        let y = 2;
        let levelXP=x * ( Math.pow(i,y)) - (x * i)
        progresslevel.push(levelXP);
    }
    console.log('progressLevel',progresslevel);
    // инициализируем стены
    for (let i = 0; i < quantityWall;i++)
    {
        let wallOne=JSON.parse(JSON.stringify(wall));
        let x = randomInteger(0,Math.trunc(map.width / wallOne.width)-1);
        let y = randomInteger(0,Math.trunc(map.height / wallOne.width)-1);;
        wallOne.being = true;
        wallOne.x = x * wallOne.width;
        wallOne.y = y * wallOne.width;
        wallOne.lineArr = calcLineArr(wallOne);
        wallArr.push(wallOne);

    }
    console.log(wallArr);
    // инициализиуем танки
    for (let i = 0; i < quantityPanzer;i++)
    {
        let panzerOne = JSON.parse(JSON.stringify(panzer));
        let flag = false;
      /*  do {
            let x = randomInteger(0,Math.trunc(map.width / wall.width)-1);
            let y = randomInteger(0,Math.trunc(map.height / wall.width)-1);;
            panzerOne.x = x * wall.width;
            panzerOne.y = y * wall.width;
 
        } while (collisionPanzerWall(panzerOne) == true ||
            collisionPanzerToPanzer(panzerOne,null) == true);*/
        let XY= calcNewCoordPanzer();
        panzerOne.x = XY.x;
        panzerOne.y = XY.y;
        let index = i % quantityColor;
        panzerOne.color= colorArr[index];
        panzer.colorStart = colorArrRGB[index];
        panzerOne.team = i % quantityTeam;
        panzerOne.maxHP = panzerOne.HP = randomInteger(10, 20) * maxParam.maxHP/100;
        panzerOne.speed =randomInteger(10, 20) * maxParam.speed/100;
        panzerOne.damage = randomInteger(10, 20) * maxParam.damage/100
        panzerOne.accuracy = randomInteger(60, 80) * maxParam.accuracy/100;
        panzerOne.speedAttack = randomInteger(10, 20) * maxParam.speedAttack/100;
        panzerOne.timeAttack = maxParam.speedAttack - panzerOne.speedAttack;
        gs = new Genes();
        gs.initCommandRand();
        panzerOne.genes = {
            commandArr:gs.commandArr,
            memory: gs.memory,
        }
        //console.log(panzerOne);
        panzerArr.push(panzerOne);
        updateStatePanzer(panzerArr[i]);
    }
    console.log(panzerArr);
    bullets = new Bullets();
    bullets.init();
    burst = new Burst();
    burst.init();
    bonuses = new Bonuses();
    bonuses.init();
    genes = new Genes();
    genes.initCommandRand();
    helperArr[0] = new Helper(100,100,'green');
    helperArr[1] = new Helper(150,150,'blue');
    helperArr[2] = new Helper(200,200,'red');
    for (let i = 0; i < quantityTeam;i++)
    {
        teamMemoryArr.push(teamMemory);
    }
    console.log('teamMemory',teamMemoryArr);
    for (let i = 0; i < panzerArr.length;i++ )
    {
        console.log('memoryPanzer['+i+'] ',panzerArr[i].memory);
    }
    //alert(55);
    //console.log(wallArr);
}
function calcNewCoordPanzer()
{
    let panzerOne = JSON.parse(JSON.stringify(panzer));
    do {
            let x = randomInteger(0,Math.trunc(map.width / wall.width)-1);
            let y = randomInteger(0,Math.trunc(map.height / wall.width)-1);;
            panzerOne.x = x * wall.width;
            panzerOne.y = y * wall.width;
 
    } while (collisionPanzerWall(panzerOne) == true ||
        collisionPanzerToPanzer(panzerOne,null) == true);
    return {x:panzerOne.x, y: panzerOne.y};
}
window.onresize = function()
{
    updateSize()
}
function updateSize()
{
    windowWidth=document.documentElement.clientWidth;
    windowHeight=document.documentElement.clientHeight;
    let mult =1;
    if (windowWidth>=windowHeight)
    {
        canvasWidth = /*canvas.width = */windowHeight*screenWidth/screenHeight;
        canvasHeight = /*canvas.height = */windowHeight;
        if (canvasWidth>windowWidth)
        {
            mult = windowWidth/canvasWidth;
           // canvas.width =
                canvasWidth *= mult;
            //canvas.height =
                canvasHeight *= mult;
        }
        canvasWidthMore = true;
    }
    else
    {
        canvasWidthMore = false;
        canvasWidth = /*canvas.width*/  windowWidth;
        canvasHeight= /*canvas.height*/  windowWidth*screenHeight/screenWidth;
    }
    
    canvas.setAttribute('width',canvasWidth);
    canvas.setAttribute('height',canvasHeight);
    canvas.style.setProperty('left', (window.innerWidth - canvas.width)/2 + 'px'); 
    canvas.style.setProperty('top', (window.innerHeight - canvas.height) / 2 + 'px'); 
    if (canvasWidthMore==true)
    {
        context.scale(windowHeight / screenHeight * mult, windowHeight / screenHeight * mult);   
        mouseMultX = windowHeight / screenHeight * mult;
        mouseMultY = windowHeight / screenHeight * mult;
    }
    else
    {
       context.scale(windowWidth/screenWidth,windowWidth/screenWidth);
        mouseMultX = windowWidth / screenWidth;
        mouseMultY = windowWidth / screenWidth;
    }
    //setOffsetMousePosXY((window.innerWidth - canvas.width)/2,
    //                        (window.innerHeight - canvas.height)/2);
    //camera.width = canvasWidth;
    //camera.height = canvasHeight;
}
function drawAll() 
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, screenWidth,screenHeight/*canvas.width, canvas.height*/);
    //context.save();
    if (visible==true)
    {

        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
                if (numSelectPanzer==i)
                {
                    drawPanzer(panzerArr[i],true);

                }
                else
                {
                    drawPanzer(panzerArr[i]);
                }
            }
        }
        for (let i = 0; i < quantityWall;i++)
        {
            drawWall(wallArr[i]);
        }
        bonuses.draw();
        bullets.drawBullets(context);
        burst.draw();
        context.fillStyle = 'red';
        context.fillText(Math.trunc(mouseX)+' '+Math.trunc(mouseY), 1,20);
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {

                let width = size;
                if (panzerArr[i].HP>0)
                {

                    context.fillStyle = "green";
                    context.fillRect(panzerArr[i].x*scale-camera.x-2*scale,
                            panzerArr[i].y*scale-camera.y-5*scale,
                            width*panzerArr[i].HP/panzerArr[i].maxHP*scale,4*scale);
                }
                if (panzerArr[i].energy>0)
                {
                    context.fillStyle = "blue";
                    context.fillRect(panzerArr[i].x*scale-camera.x-2*scale,
                                panzerArr[i].y*scale-camera.y-10*scale,
                                width*panzerArr[i].energy/panzerArr[i].maxEnergy*scale,4*scale);
                }
            }
        }
      /*  if (flagScaling==true)
        {
            context.scale(0.5,0.5);
            flagScaling = false;

        }*/
       // context.restore();
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (visibleEnemy(numSelectPanzer,i)==true &&
                panzerArr[numSelectPanzer].team!=panzerArr[i].team)
            {
                context.beginPath();
                context.strokeStyle = "green";
                context.lineWidth = 1;
                context.moveTo(panzerArr[numSelectPanzer].centerX*scale-camera.x,
                                panzerArr[numSelectPanzer].centerY*scale-camera.y);
                context.lineTo(panzerArr[i].centerX*scale-camera.x,panzerArr[i].centerY*scale-camera.y);
                context.stroke(); 
            }
        }
    
        for (let i = 0; i < helperArr.length;i++)
        {
            helperArr[i].draw();
        }
    }
  /*  context.fillStyle = 'green';
    context.fillRect(helper.x-camera.x,helper.y-camera.y,helper.width,helper.height);*/
    context.fillStyle = 'gray';
    context.fillRect(camera.width,1,widthSide,screenHeight);
    context.fillRect(1,camera.height,screenWidth,heightSide);


    if (visible==true)
    {

        /* DRAW GENES*/
        genes.draw(context);
    }
    //genes.draw(context,1120,genes.commandArrTwo);


    context.font='20px Arial';
    addY = 23;
    startY = 620;
    context.fillStyle = 'blue';
    context.fillText("numGeneration: "+numGeneration, 1,startY);

    context.fillStyle = 'red';
    context.fillText("Steps: "+countLoopIter, 1,startY+addY);
    
    context.fillStyle = 'red';
    context.fillText("MAX Steps: "+maxSteps, 1,startY+addY*2);

    //context.font='25px Arial';
    context.fillStyle = 'blue';
    context.fillText("numGenesPanzer: "+numGenesPanzer, 1,startY+addY*3);
   
    //context.font='25px Arial';
    context.fillStyle = 'green';
    context.fillText("Living panzer: "+countBeingPanzer, 1,startY+addY*4);

    //context.font='25px Arial';
    context.fillStyle = 'blue';
    context.fillText("max XP: "+maxXPPanzer, 1,startY+addY*5);
   
    /*context.font='25px Arial';
    context.fillStyle = 'green';
    context.fillText("Sensor: "+sensorValue, 1,690);*/
    /*рисуем уровень и параметры танка*/
    if (visible==true)
    {

        let numP = 0;
        if (modeGame=='HERO')
        {
            numP = numSelectPanzer;
        }
        else if (modeGame=='GOD')
        {
            numP = numGenesPanzer;
        }
        levelNextXP = progresslevel[panzerArr[numP].level];
        context.font='25px Arial';
        context.fillStyle = 'white';
        context.fillText("Level: "+panzerArr[numP].level+" "
                    +"Evolutionary meat: "+panzerArr[numP].XP+" from: "+levelNextXP, 300,630);
drawParamPanzer(300, 650, numP);
    }
   
    
}
function drawWall(wall)
{
    context.fillStyle = wall.color;
    context.fillRect(wall.x*scale-camera.x, wall.y*scale-camera.y, 
                (wall.width+1)*scale, (wall.height+1)*scale);
}
function drawPanzer(panzer,select=false)
{
    var multSide=0.15;


    if (select) 
    {
        context.strokeStyle = 'white';
    }
    else
    {
        context.strokeStyle=panzer.color;
    }
    
    // врашаем тело танка
    context.save();
  
    context.translate(panzer.x*scale + panzer.width / 2*scale-camera.x, 
                panzer.y*scale + panzer.height / 2*scale-camera.y); // translate to rectangle center



    context.rotate((Math.PI / 180) * (panzer.angleBody+90)/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

    context.translate(-(panzer.x*scale + panzer.width / 2*scale-camera.x),
                -(panzer.y*scale + panzer.height / 2*scale-camera.y)); // translate back

    context.lineWidth = 1;
    //рисуем тело танка
    context.strokeRect(panzer.x*scale-camera.x, panzer.y*scale-camera.y,
            panzer.width*multSide*scale, panzer.height*scale);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x*scale-camera.x+addX*scale, panzer.y*scale-camera.y, 
            panzer.width*multSide*scale, panzer.height*scale);
    context.strokeRect(panzer.x*scale-camera.x+panzer.width*multSide*scale,
                    panzer.y*scale-camera.y+panzer.height*multSide*scale,
                    (panzer.width-panzer.width*multSide*2)*scale,
                    (panzer.height-panzer.height*multSide*2)*scale);

    // рисуем кружок башни
    context.beginPath();
    context.arc(panzer.x*scale-camera.x + panzer.width / 2*scale,
                panzer.y*scale-camera.y + panzer.height / 2*scale,
                panzer.sizeTower*scale, 0,3.14*2, false);
    context.stroke();

    context.restore();
    
    // рисуем пушку
    context.beginPath();
    context.lineWidth = 3;
    context.moveTo(panzer.towerX*scale-camera.x,panzer.towerY*scale-camera.y);
    context.lineTo(panzer.towerX1*scale-camera.x,panzer.towerY1*scale-camera.y);
    context.stroke();  
}
function drawSprite(context,image,x,y,camera,scale)// функция вывода спрайта на экран
{
    if(!context || !image) return;
    context.save();
    context.scale(scale,scale);
    context.drawImage(image,x/**scale*/-camera.x/scale,y/**scale*/-camera.y/scale);
    context.restore();
}
function drawParamPanzer(x,y,numP)
{
    let count = 0;
    let addY = 20;
    for (param in maxParam)
    {
        context.font='15px Arial';
        context.fillStyle = 'black';
        context.fillText(param+'',x,y+count*addY+10);
        for (param2 in panzerArr[numP])
        {
            if (param==param2)
            {

                drawBarParam(x+100, y + count* addY, panzerArr[numP][param2], maxParam[param]);
            }
        }
        count++;
    }
}
function drawBarParam(x,y,value,max)
{
    let width = 300;
    context.fillStyle = "red";
    context.fillRect(x, y, width, 10);
    context.fillStyle = "green";
    context.fillRect(x, y, width*value/max, 10);

}
function cameraMove()
{
    let speedMoveCamera = 10;
    if (checkPressKey('KeyW'))
    {
        if (camera.y>0) 
        {
            camera.y-=speedMoveCamera;
        }
        else
        {
            camera.y = 0;
        }
    }
    if (checkPressKey('KeyD')) 
    {
       if (camera.x+camera.width<map.x+map.width)
       {
           camera.x+=speedMoveCamera;   
       }
       else
       {
           camera.x = map.x + map.width - camera.width;
       }
    }
    if (checkPressKey('KeyS')) 
    {
       if (camera.y+camera.height<map.y+map.height)
       {
           camera.y+=speedMoveCamera;
       }
       else
       {
           camera.y = map.y + map.height - camera.height;
       }
    }
    if (checkPressKey('KeyA')) 
    {
    //    camera.x-=speedMoveCamera;
        if (camera.x>0) 
        {
            camera.x-=speedMoveCamera;
        }
        else
        {
            camera.x = 0;
        }
    }
}
function cameraFocusXY(x,y,map)// следить камерой за определеной точкой
{
    camera.focusX=x;
    camera.focusY=y;
    camera.x = x - camera.width / 2;
    camera.y = y - camera.height / 2;
    if (x<map.x+(camera.width/2)/scale) camera.x=map.x;
    else if (x>map.x+(map.width-camera.width/2/scale)) 
    {
            
        camera.x=map.x+map.width-camera.width/scale;
        //alert("123");
    }
    if (y<map.y+(camera.height/2)/scale) camera.y=map.y;
    else if (y>map.x+map.height-camera.height/2/scale) camera.y=map.y+map.height-camera.height/scale;;
    if (camera.height/scale > screenHeight)
    {
        camera.y=0;
    }
    if (camera.width/scale > screenWidth)
    {
        camera.x=0;
        ///   console.log(camera.width/2/scale+"   "+screenWidth);
    }
}
function addParamPanzer(panzer,plus=true,numParam=null)
{
    function cmpParam(flagArr,param1,param2,num)
    {
        if (param1==param2)
        {
            flagArr[num] = true;
            return true;
        }
        return false;
    }

    let flagArr = [false,false,false,false,false];
    let flag = false;
    let flag2 = false;
    do {

        flag = false;
        flag2 = false;
        let R = randomInteger(0, 4);
        if (numParam != null) R = numParam;
        let count = 0;
        for (let i = 0; i <= 4;i++)
        {
            if (flagArr[i]==true)
            {
                count++;
            }
        }
        if (count >= 5) flag = true;
        if (flag == true) break;
        if (R == 0)
        {
            if (cmpParam(flagArr, panzer.maxHP, maxParam.maxHP, R) == true) 
            {
                flag2 = true;
                continue;
            }
            plus == true ? panzer.maxHP *= 1.1 : panzer.maxHP /= 1.1;
            if (panzer.maxHP > maxParam.maxHP) panzer.maxHP = maxParam.maxHP;
            panzer.HP = panzer.maxHP;
        }
        if (R == 1) 
        {
            if (cmpParam(flagArr, panzer.speed, maxParam.speed, R) == true) 
            {
                flag2 = true;
                continue;
            }
            plus == true ? panzer.speed *= 1.1 : panzer.speed /= 1.1;
            if (panzer.speed > maxParam.speed) panzer.speed = maxParam.speed;
        }
        if (R == 2) 
        {
            if (cmpParam(flagArr, panzer.damage, maxParam.damage, R) == true) 
            {
                flag2 = true;
                continue;
            }
            plus == true ? panzer.damage *= 1.1 : panzer.damage /= 1.1;
            if (panzer.damage > maxParam.damage) panzer.damage = maxParam.damage;
        }
        if (R == 3) 
        {
            if (cmpParam(flagArr, panzer.accuracy, maxParam.accuracy, R) == true) 
            {
                flag2 = true;
                continue;
            }
            plus == true ? panzer.accuracy *= 1.05 : panzer.accuracy /= 1.05;
            if (panzer.accuracy > maxParam.accuracy) panzer.accuracy = maxParam.accuracy;
        }
        if (R == 4) 
        {
            if (cmpParam(flagArr, panzer.speedAttack, maxParam.speedAttack, R) == true) 
            {
                flag2 = true;
                continue;
            }
            plus == true ? panzer.speedAttack *= 1.1 : panzer.speedAttack /= 1.1;
            if (panzer.speedAttack > maxParam.speedAttack) panzer.speedAttack = maxParam.speedAttack;
            panzer.timeAttack = maxParam.speedAttack - panzer.speedAttack;
        }
   
    } while (flag2==true && numParam==null)

}
function update() 
{
  

    if (modeGame == 'GOD') cameraMove();
    if (keyUpDuration('KeyH',100)==true)
    {
        modeGame = modeGame == 'GOD' ? 'HERO' : "GOD";
    }
    if (keyUpDuration('KeyP',100)==true)
    {
        visible = !visible;
    }
    if (keyUpDuration('Space',100)/*checkPressKey('Space')==true*/)
    {
        panzerArr[numGenesPanzer].genes.commandArr = JSON.parse(JSON.stringify(genes.commandArrTwo));
        //genes.commandArrTwo = panzerArr[numGenesPanzer].genes.commandArr;
        genes.commandArrTwo = genes.changeGenes(genes.commandArrTwo, 10, 100);
    }
    if (keyUpDuration('NumpadSubtract',100)==true)
    {
        scale*=0.75;
    }
    if (keyUpDuration('NumpadAdd',100)==true)
    {
        scale*=1.333;
       // alert(scale);
    }
/*    if (checkPressKey('KeyQ')==true || keyUpDuration('KeyQ',100)==true)
    {
*//*        testFlagDirParam = !testFlagDirParam;
        alert('flag='+testFlagDirParam);*//*
        panzerArr[numSelectPanzer].level++;
        addParamPanzer(panzerArr[numSelectPanzer], testFlagDirParam);
    }
    for (let i = 1; i <= 5;i++)
    {
        if (keyUpDuration('Digit'+i,1000)==true)
        {

            panzerArr[numSelectPanzer].level++;
            addParamPanzer(panzerArr[numSelectPanzer], testFlagDirParam, i - 1);
        }
    }*/
    for (let k = 0; k < (visible == true ? 1 : 20);k++)
    {

        countBeingPanzer = 0;   

        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true)
            {
                countBeingPanzer++;
                if (numSelectPanzer==i && modeGame=='HERO')
                {
                    controlHumanPanzer(panzerArr[i],i);
                }
                else
                {
                    completeGenesPanzer(panzerArr[i],i);
                
                }

                let barrierArr=updateBarrierVisible();
                updateSensorPanzer(panzerArr[i],i,barrierArr)
                let collision = [false, false, false];
                panzerArr[i].state.collis = 0;
                collision[0] = collisionPanzerWall(panzerArr[i]);
                collision[1] = collisionRectangleMap(panzerArr[i]);
                collision[2] = collisionPanzerToPanzer(panzerArr[i],i)
                for (let j = 0; j < collision.length; j++)
                {
                    if (collision[j] == true)
                    {
                        panzerArr[i].state.collis = 1;
                        break;
                    }
                }

                updateStatePanzer(panzerArr[i]);
                if (modeGame=='HERO')
                {

                    cameraFocusXY(panzerArr[numSelectPanzer].x, 
                                panzerArr[numSelectPanzer].y, map);
                }

            }
        
        }

        killedPanzers();
        bullets.update();
        bullets.collisionBullet(wallArr);
        burst.update();
        bonuses.update();

        nextGeneration();

        maxXPPanzer = 0;
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (panzerArr[i].being==true && maxXPPanzer<=panzerArr[i].XP)
            {

                maxXPPanzer = panzerArr[i].XP;
            }
        }
        if (countBeingPanzer>0)countLoopIter++;
    }
    if (modeGame=='GOD' )
    {
        let flag = false;
        if (mouseLeftClick()==true)
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (checkInObj(panzerArr[i],mouseX/scale+camera.x,mouseY/scale+camera.y))
            {
                numGenesPanzer = i;
                flag = true;
            }
        }
        genes.setData(panzerArr[numGenesPanzer].genes,
                    panzerArr[numGenesPanzer].sensor,
                    panzerArr[numGenesPanzer].state,
                    panzerArr[numGenesPanzer].memory,
                    teamMemoryArr[panzerArr[numGenesPanzer].team]);
        if (flag==true)
        {

            genes.commandArrTwo = JSON.parse(JSON.stringify(genes.commandArr));
        }

        genes.setSelectCommand(panzerArr[numGenesPanzer].selectCommand);

    }
    if (modeGame=='HERO')
    {
        {
            numGenesPanzer = numSelectPanzer;
            genes.setData(panzerArr[numSelectPanzer].genes,
                panzerArr[numSelectPanzer].sensor,
                panzerArr[numSelectPanzer].state,
                panzerArr[numSelectPanzer].memory,
                teamMemoryArr[panzerArr[numSelectPanzer].team]);
        }
        

    }
   
    
        
    /*
     ВНИМАНИЕ НЕОБХОДИМО В PANZERARR2 ДОБАВЛЯТЬ ТОЛЬКО ТАНКИ С BEING TRUE !!!
    */
    //let panzerArr2 = JSON.parse(JSON.stringify(panzerArr));

    //panzerArr2.splice(numSelectPanzer, 1);
/*    let panzerArr2 = [];
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true && i!=numSelectPanzer)
        {
            panzerArr2.push(panzerArr[i]);
        }
    }
    let barrierArr = wallArr.concat([helperArr[1]]);
    barrierArr = barrierArr.concat(panzerArr2);*/
    //sensorValue = checkObjVisible(helperArr[0], helperArr[2],barrierArr);
    for (let i = 0; i < helperArr.length;i++)
    {
        helperArr[i].update();

    }
    setTimeout(update, visible == true ? 16 : 1);
    //console.log(mouseX, mouseY);
}
function updateStatePanzer(panzer)
{
    let centerX = (panzer.x + panzer.width / 2)//*scale
    let centerY = (panzer.y + panzer.height / 2)//*scale;
    panzer.centerX = centerX;
    panzer.centerY = centerY;
    panzer.towerY = (centerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower)//*scale;
    panzer.towerX = (centerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower)//*scale;
    panzer.towerY1 = panzer.towerY +( Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.towerLength)//*scale;
    panzer.towerX1 = panzer.towerX +( Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.towerLength)//*scale;
    panzer.state.body = panzer.angleBody/90;
    panzer.state.tower =Math.trunc( panzer.angleTower);
    panzer.state.HP = Math.trunc(panzer.HP/panzer.maxHP*100);
    panzer.state.energy= Math.trunc(panzer.energy/panzer.maxEnergy*100);
    panzer.state.patrons = panzer.countPatrons;
    if (panzer.age<panzer.maxAge) panzer.age++;
    panzer.color = changeColor(panzer.colorStart, panzer.age, panzer.maxAge);

}
function changeColor(color,time,maxTime)
{
    let mult = 0.75;
    let R = color.R-(color.R *(time / maxTime)*mult);
    let G = color.G-(color.G *(time / maxTime)*mult);
    let B = color.B-(color.B *(time / maxTime)*mult);
    return  'rgb(' + R + ',' + G + ',' + B + ')';
}
function killedPanzers()
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].HP<=0 || panzerArr[i].energy<=0 && panzerArr[i].being==true)
        {
            panzerArr[i].being = false;
        }
    }
}
function nextGeneration()
{
    let maxXP = 0;
    let numPanzMaxXp = null;
    let AlivePanzer = 8;
    let panzerArr2 = JSON.parse(JSON.stringify(panzerArr));
    if (countBeingPanzer<=AlivePanzer)
    {
        for (let i = 0; i < panzerArr2.length;i++)
        {
            if (panzerArr2[i].being==true)
            {
                
                if (maxXP<=panzerArr2[i].XP)
                {
                    maxXP = panzerArr2[i].XP;
                    numPanzMaxXp = i;
                }
            }
        }
        let flagNull = false;
        if (numPanzMaxXp==null)
        {
            flagNull = true;
            for (let i = 0; i < panzerArr2.length;i++)
            {
                
                if (maxXP<=panzerArr2[i].XP)
                {
                    numPanzMaxXp = i;
                    maxXP = panzerArr2[i].XP;
                }
            }
        }
        //console.log('NUMMAXXP',numPanzMaxXp);
        let panzerArrTemp = [];
        if (flagNull == false)
        {

            for (let i = 0; i < panzerArr2.length;i++)
            {
                if (panzerArr2[i].being==true)
                {
                    panzerArrTemp.push(panzerArr2[i]);
                }
            }
        }
        else
        {
            for (let i = 0; i < AlivePanzer;i++)
            {
                //if (panzerArr2[i].being==true)
                {
                    panzerArrTemp.push(panzerArr2[i]);
                }
            }

        }
        /*for (let i = 0; i < panzerArrTemp.length;i++)
        {
            panzerArrTemp[i].being = true;
            panzerArrTemp[i].energy = panzerArrTemp[i].maxEnergy;
            panzerArrTemp[i].HP=panzerArrTemp[i].maxHP;
        }*/
        //console.log('panzerArrTEMP 1',panzerArrTemp);
        for (let i = panzerArrTemp.length; i < AlivePanzer;i++)
        {
            console.log('One panzer',panzerArr2[numPanzMaxXp]);
            panzerArrTemp.push(panzerArr2[numPanzMaxXp]);
        }
       // console.log('panzerArrTEMP 2',panzerArrTemp);
        panzerArr = [];
        //console.log('panzerArr empty',panzerArr);
        for (let i = 0; i < quantityPanzer;i++)
        {
            let panzerOne = JSON.parse(JSON.stringify(panzerArrTemp[i % AlivePanzer]));
         
      
            panzerOne.being = true;
            let XY= calcNewCoordPanzer();
              
            panzerOne.x = XY.x;
            panzerOne.y = XY.y;
      
            if (i%AlivePanzer>AlivePanzer*0.66)
            {

                panzerOne.genes.commandArr = genes.changeGenes(panzerOne.genes.commandArr,3,5);
            }
            panzerOne.selectCommand = 0;
            panzerOne.team = i % 4;
            panzerOne.color =colorArr[panzerOne.team];
            panzerOne.colorStart = colorArrRGB[panzerOne.team];
            panzerOne.countPatrons = startPatrons;
            panzerOne.energy = panzerOne.maxEnergy;
            panzerOne.HP=panzerOne.maxHP;
            updateStatePanzer(panzerOne);
            panzerArr.push(panzerOne);
        }
        console.log('panzerArr',panzerArr)
        //alert(545);
        numGeneration++;
        if (maxSteps < countLoopIter) maxSteps = countLoopIter;
        countLoopIter = 0;
    }
}
function updateBarrierVisible()// обновить список барьеров
{
    let panzerArr2 = [];
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true && 
                (
                    (i!=numSelectPanzer && modeGame=="HERO") ||        
                    (i!=numGenesPanzer && modeGame=="GOD")
                )
            )
        {
            panzerArr2.push(panzerArr[i]);
        }
    }
    let barrierArr = wallArr.concat([helperArr[1]]);
    barrierArr = barrierArr.concat(panzerArr2);
    return barrierArr;
}
function updateSensorPanzer(panzer,numP,barrierArr) // обновить сенсоры танка
{
 
    for (let i = 0; i < bonuses.bonusArr.length;i++)
    {
        let bonus = bonuses.bonusArr[i];
        panzer.sensor.bonus = checkObjVisible(panzer, bonus,barrierArr);
        if (panzer.sensor.bonus!=null)
        {
            break;
        }
    }
    /*console.log(panzer.sensor.bonus);*/
    minDist = 1000000;
    flagVis = false;
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (visibleEnemy(numP,i)==true &&
            panzerArr[numP].team!=panzerArr[i].team)
        {
            dist = calcDist(panzerArr[numP].centerX, panzerArr[numP].centerY,
                panzerArr[i].centerX, panzerArr[i].centerY);
            flagVis = true;
            if (dist<minDist)
            {
                panzer.sensor.enemy = angleIm(panzerArr[numP].centerX, panzerArr[numP].centerY,
                            panzerArr[i].centerX, panzerArr[i].centerY);
                panzer.sensor.enemy = Math.round(panzer.sensor.enemy);
            }
        }
    }
    if (flagVis==false)
    {
        panzer.sensor.enemy = null;
    }

    
    
}
function visibleEnemy(numP1,numP2) // видит ли танк врага
{
    /*for (let i = 0; i < panzerArr.length;i++)
    {*/
    maxDist = 300;
    dist = calcDist(panzerArr[numP1].centerX,panzerArr[numP1].centerY,
                    panzerArr[numP2].centerX,panzerArr[numP2].centerY);
    if (numP1 != numP2 && dist<maxDist && 
        panzerArr[numP1].being==true &&
        panzerArr[numP2].being==true &&
        crossingTwoPoint(panzerArr[numP1].centerX,panzerArr[numP1].centerY,
            panzerArr[numP2].centerX,panzerArr[numP2].centerY,wallArr)==false)
    {
        return true;
    }
    //}
    return false;

}
function checkObjVisible(panzer,obj,barrierArr)// может ли танк подьехать к обьекту по прямой
{
    let dist = 350;
    if (panzer.x<obj.x+obj.width && panzer.x+panzer.width>obj.x)
    {
        if (panzer.y>obj.y && panzer.y-obj.y<dist)
        {
            if (checkBarrierVisible(panzer,obj,barrierArr,1)==false)
            return 3;
        }
        else if (panzer.y<obj.y && obj.y - panzer.y<dist)
        {
            if (checkBarrierVisible(panzer,obj,barrierArr,3)==false)
            return 1;
        }
    }
    if (panzer.y<obj.y+obj.height && panzer.y+panzer.height>obj.y)
    {
        if (panzer.x>obj.x && panzer.x-obj.x<dist)
        {
            if (checkBarrierVisible(panzer,obj,barrierArr,4)==false)
            return 2;
        }
        else if (panzer.x<obj.x && obj.x-panzer.x<dist)
        {
            if (checkBarrierVisible(panzer,obj,barrierArr,2)==false)
            return 0;
        }
    }
   
    return null;
}
// проверка не будет ли столкновения если ехать по прямой Side.
function checkBarrierVisible(objStart,objFinish,arrBarrier,side)
{
    let addXY ={x:0,y:0};
    let dist = 0;
    if (side == 1) { dist = objStart.y - objFinish.y; addXY.y=-1}
    if (side == 2) { dist = objFinish.x - objStart.x; addXY.x=1 }

    if (side == 3) { dist = objFinish.y - objStart.y; addXY.y=1 }
    if (side == 4) { dist = objStart.x - objFinish.x; addXY.x=-1}
    let objIter = JSON.parse(JSON.stringify(objStart));
    for (let i = 0; i < dist;i++)
    {
        objIter.x += addXY.x;
        objIter.y += addXY.y;
        for (let j = 0; j < arrBarrier.length;j++)
        {
            if (checkCollision(arrBarrier[j], objIter) == true) return true;
        }
    }
    return false;
}
function controlHumanPanzer(panzer,numP)// управление танком героя
{
    let minusEnergy = minusEnergyMove / 10;;
    if (checkPressKey('KeyW') == true && panzer.dir!=0 )
    {
        panzer.dir = 0; 
        panzer.angleTower = panzer.angleBody = 270;
        panzer.energy -= minusEnergy;
    }
    if (checkPressKey('KeyD') == true && panzer.dir!=1)
    {
        panzer.dir=1;
        panzer.angleTower = panzer.angleBody = 0;
        panzer.energy -= minusEnergy;
    }
    if (checkPressKey('KeyS') == true && panzer.dir!=2) 
    {
        panzer.dir=2;
        panzer.angleTower = panzer.angleBody = 90;
        panzer.energy -= minusEnergy;
    }

    if (checkPressKey('KeyA') == true && panzer.dir!=3 ) 
    {
        panzer.dir=3;
        panzer.angleTower = panzer.angleBody = 180;
        panzer.energy -= minusEnergy;
    }

    minusEnergy = minusEnergyMove;
    if (checkPressKey('KeyW') == true && panzer.dir==0) 
    {
        panzer.y-=panzer.speed;
        panzer.energy -= minusEnergy;
    }
    else if (checkPressKey('KeyD') == true && panzer.dir==1) 
    {
        panzer.x+=panzer.speed;
        panzer.energy -= minusEnergy;
    }
    else if (checkPressKey('KeyS') == true && panzer.dir==2) 
    {
        panzer.y+=panzer.speed;
        panzer.energy -= minusEnergy;
    }
    else if (checkPressKey('KeyA') == true && panzer.dir==3) 
    {
        panzer.x-=panzer.speed;
        panzer.energy -= minusEnergy;
    }
/*    rotateXY=mathTowerRotateXY(panzerArr[num].x+panzerArr[num].mixTowerPosX,
                    panzerArr[num].y+panzerArr[num].mixTowerPosY);*/
    var rotateXY={
        x: panzer.x + panzer.width / 2,
        y: panzer.y + panzer.height / 2,
    }
    let angleAim=angleIm(rotateXY.x,rotateXY.y,mouseX+camera.x,mouseY+camera.y);
    // плавно поварачиваем башню танка                             
    panzer.angleTower=movingToAngle(panzer.angleTower,angleAim,100);
    //console.log(panzer.angleTower);
    if (panzer.countAttack<panzer.countAttack+20)
    {
        panzer.countAttack++;
    }
    if (panzer.countAttack > panzer.timeAttack) 
    {
        panzer.state.attack = 1;
    }
    else
    {
        panzer.state.attack = 0;
    }
    if (checkMouseLeft() && panzer.countAttack>panzer.timeAttack && panzer.countPatrons>0)
    {
        panzer.countAttack = 0;
        bullets.shot(panzer.towerX1,panzer.towerY1,
                panzer.angleTower+mixingShot(panzer.accuracy),100,numP);
        panzer.countPatrons--;
    }  
    panzer.energy -= minusEnergyMove/40;
}
function completeGenesPanzer(panzer,numP)// исполнение генов танка
{
    let select = panzer.selectCommand;
    //console.log(panzer.selectCommand);
    if (numP==numGenesPanzer) historyCommand = [];
    let count = 0;
    for (let i = 0; i < new Genes().quantityCommand;i++)
    {
        if (numP==numGenesPanzer)  historyCommand.push(select);
        count++;
        if (panzer.genes.commandArr[select].name=='exec')
        {
            let value = panzer.genes.commandArr[select].values[0];
            let minusEnergy = minusEnergyMove / 10;
            if (value==1 && panzer.dir!=0)
            {
                panzer.dir=0;
                panzer.angleTower = panzer.angleBody = 270;
                panzer.energy -= minusEnergy;
            }
            if (value==2 && panzer.dir!=1) 
            {
                panzer.dir=1; 
                panzer.angleTower = panzer.angleBody = 0;
                panzer.energy -= minusEnergy;
            }
            if (value==3 && panzer.dir!=2) 
            {
                panzer.dir=2;
                panzer.angleTower = panzer.angleBody = 90;
                panzer.energy -= minusEnergy;
            }
            if (value==4 && panzer.dir!=3) 
            {
                panzer.dir=3; 
                panzer.angleTower = panzer.angleBody = 180;
                panzer.energy -= minusEnergy;
            }
            minusEnergy = minusEnergyMove;
            if (value==1 && panzer.dir==0){ panzer.y-=panzer.speed; panzer.energy -= minusEnergy;}
            else if (value==2 && panzer.dir==1) {panzer.x+=panzer.speed; panzer.energy -= minusEnergy;}
            else if (value==3 && panzer.dir==2) {panzer.y+=panzer.speed; panzer.energy -= minusEnergy;}
            else if (value==4 && panzer.dir==3) {panzer.x-=panzer.speed; panzer.energy -= minusEnergy;}
        
            if (value==5)
            {
                panzer.angleTower += 10;
                panzer.energy -= minusEnergy/2;
            }

            if (value==6)
            {
                panzer.angleTower -= 10;
                panzer.energy -= minusEnergy/2;
            }

            if (panzer.countAttack<panzer.countAttack+10) 
            {
                panzer.countAttack++;
            }
            if (value==7)
            {
                if (panzer.countAttack>=panzer.timeAttack && panzer.countPatrons>0)
                {
                    bullets.shot(panzer.towerX1,panzer.towerY1,
                                panzer.angleTower+mixingShot(panzer.accuracy),30,numP);
                    panzer.countAttack = 0;
                    panzer.countPatrons--;
                }
                panzer.energy -= minusEnergy / 1.8;
            }
            select++;// переход на следуюшию команду
/*            select %= new Genes().quantityCommand; 
            panzer.selectCommand = select;*/
            break;;
        }
        else if (panzer.genes.commandArr[select].name=='goto')
        {
            let value = panzer.genes.commandArr[select].values[0];
           // historyCommand.push(select);
            select += value;
        }
        else if (panzer.genes.commandArr[select].name=='mov')
        {
            let value0 = panzer.genes.commandArr[select].values[0];
            let value1 = panzer.genes.commandArr[select].values[1];
            let flagTeamMemory = false;
            for (attr in panzer.memory)
            {
                if (value0==attr)
                {
                    flagTeamMemory = true;
                    let value = valueParamPanzerGens(value1, panzer);
                    if (value!==false)

                    {
                        panzer.memory[value0] = value;
                    }
                    else
                    {
                        panzer.memory[value0] = value1;
                    }
                
                }
            }
            if (flagTeamMemory==false)
            {
                for (attr in teamMemoryArr[panzer.team])
                {
                    if (value0==attr)
                    {
                        let value = valueParamPanzerGens(value1, panzer);
                        if (value!==false)

                        {
                            teamMemoryArr[panzer.team][value0] = value;//valueParamPanzerGens(value1, panzer);

                        }
                        else
                        {
                            teamMemoryArr[panzer.team][value0] = value1;
                        }
                        //break;
                    }
                }

            }
            //historyCommand.push(select);
            select ++;
        }
        else if (panzer.genes.commandArr[select].name=='cmp')
        {
            let value1 = panzer.genes.commandArr[select].values[0];
            let valueCmp = panzer.genes.commandArr[select].values[1];
            let value2 = panzer.genes.commandArr[select].values[2];
            let valueJmp1 = panzer.genes.commandArr[select].values[3];
            let valueJmp2 = panzer.genes.commandArr[select].values[4];
           // historyCommand.push(select);
            if (valueCmp=="==")
            {
                if (value1==value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }

            }
            if (valueCmp=="!=")
            {
                if (value1!=value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }
            }
            if (valueCmp=='<')
            {
                if (value1<value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }

            }
            if (valueCmp==">")
            {
                if (value1>value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }

            }
            if (valueCmp=="<=")
            {
                if (value1<=value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }

            }
            if (valueCmp==">=")
            {
                if (value1>=value2)
                {
                    select += valueJmp1;
                }
                else
                {
                    select += valueJmp2;
                }

            }
        }
        else if (panzer.genes.commandArr[select].name=='calc')
        {
            let valueMemory = panzer.genes.commandArr[select].values[0];
            let arg1 = panzer.genes.commandArr[select].values[1];
            let simbol = panzer.genes.commandArr[select].values[2];
            let arg2 = panzer.genes.commandArr[select].values[3];
            let flagTeamMemory = false;
            function calcResult(arg1,arg2)
            {
                let res1 = valueParamPanzerGens(arg1, panzer);
                let res2 = valueParamPanzerGens(arg2, panzer);
                let resArg1 = null;
                let resArg2 = null;
                if (res1!==false)

                {
                    resArg1 = res1;
                }
                else
                {
                    resArg1 = arg1;
                }
                if (res2!==false)

                {
                    resArg2 = res2;
                }
                else
                {
                    resArg2 = arg2;
                }
                return calc2Arg(simbol,resArg1,resArg2);
                //panzer.memory[valueMemory] = calc2Arg(simbol,resArg1,resArg2);
            }
      
            for (attr in panzer.memory)
            {
                if (valueMemory==attr)
                {
                    flagTeamMemory = true;
                    panzer.memory[valueMemory] = calcResult(arg1, arg2);

                }
            }
            if (flagTeamMemory==false)
            {
                for (attr in teamMemoryArr[panzer.team])
                {
                    if (valueMemory==attr)
                    {
                        teamMemoryArr[panzer.team][valueMemory] = calcResult(arg1,arg2);
                    }
                }
            
            }
            //historyCommand.push(select);
            select ++;
        }

        select %= new Genes().quantityCommand; 
        panzer.selectCommand = select;
        panzer.energy -= minusEnergyMove / 6;;
    }  
    select %= new Genes().quantityCommand; 
    panzer.selectCommand = select;
 
    /*console.log('count: '+count);*/
    //console.log('history: ' +historyCommand);
    if (panzer.countAttack<panzer.countAttack+20)
    {
        panzer.countAttack++;
    }
    if (panzer.countAttack > panzer.timeAttack) 
    {
        panzer.state.attack = 1;
    }
    else
    {
        panzer.state.attack = 0;
    }
}
function calc2Arg(simbol,arg1,arg2)
{
    if (simbol=='+')
    {
        /*if (arg1 == null) return arg2;
        if (arg2 == null) return arg1;*/
        return arg1 + arg2;
    }
    if (simbol=='-')
    {
        /*if (arg1 == null) return arg2;
        if (arg2 == null) return arg1;*/
        return arg1 - arg2;
    }
    if (simbol=='*')
    {
        /*if (arg1 == null) return arg2;
        if (arg2 == null) return arg1;*/
        return arg1 * arg2;
    }
    if (simbol=='/')
    {
        /*if (arg1 == null) return arg2;
        if (arg2 == null) return arg1;*/
        if (arg2 == 0) return 0;
        return arg1 / arg2;
    }
}
function valueParamPanzerGens(key,panzer)
{
    let valueArr = panzer.sensor;
    valueArr = { ...valueArr, ...panzer.state };
    valueArr = { ...valueArr, ...panzer.memory };
    valueArr = { ...valueArr, ...teamMemoryArr[panzer.team] };
    if (keyUpDuration('KeyQ', 100)) console.log("team="+panzer.team,valueArr,teamMemoryArr);
    for (attr in valueArr)
    {

        if (key===attr)
        {
          //  console.log('key: '+key,"attr: "+attr,'valueArr[attr]: '+valueArr[attr] )
            return valueArr[attr];
        }
    }
    return false;
}
function collisionPanzerWall(panzer) // проверка столкновения танка со стеной
{
    for (let i = 0; i < wallArr.length;i++)
    {
        if (panzer.x+panzer.width>wallArr[i].x && 
            panzer.x<wallArr[i].x+wallArr[i].width &&
            panzer.y+panzer.height>wallArr[i].y && 
            panzer.y<wallArr[i].y+wallArr[i].height 
            )
        {
            if ( panzer.dir==0)
            {
                panzer.y = wallArr[i].y + wallArr[i].height + 2;
                return true;
            }
            if ( panzer.dir==2)
            {
                panzer.y = wallArr[i].y - panzer.height - 2;
                return true;;
            }

            
           
            if (panzer.dir==3)
            {
                panzer.x = wallArr[i].x + wallArr[i].width + 1;
                return true;;
            }
            if  (panzer.dir==1)
            {
                panzer.x = wallArr[i].x - panzer.width - 1;
                return true;;
            }

           
        }

    }
    return false;   
}
function collisionRectangleMap(panzer) // проверка столкновения с краям карты
{
    if (panzer.x<map.x)
    {
        panzer.x = map.x+1;
        return true;
    }
    if (panzer.x+panzer.width>map.x+map.width)
    {
        panzer.x = map.x+map.width-panzer.width-1;
        return true;
    }

    if (panzer.y<map.y)
    {
        panzer.y = map.y+1;
        return true;
    }
    if (panzer.y+panzer.height>map.y+map.height)
    {
        panzer.y = map.y+map.height-panzer.height-1;
        return true;
    }
    return false;
}
function collisionPanzerToPanzer(panzer,num)// проверка столкновения танка с танком
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (num!==i && panzerArr[i].being==true)
        {
            //console.log(panzerArr[i]);
            if (panzer.x+panzer.width>panzerArr[i].x &&
                panzer.x<panzerArr[i].x+panzerArr[i].width &&
                panzer.y+panzer.height>panzerArr[i].y &&
                panzer.y<panzerArr[i].y+panzerArr[i].height )
            {
                if ( panzer.dir==0)
                {
                    panzer.y = panzerArr[i].y + panzerArr[i].height + 2;
                    return true;
                }
                if ( panzer.dir==2)
                {
                    panzer.y = panzerArr[i].y - panzer.height - 2;
                    return true;;
                }

            
           
                if (panzer.dir==3)
                {
                    panzer.x = panzerArr[i].x + panzerArr[i].width + 1;
                    return true;;
                }
                if  (panzer.dir==1)
                {
                    panzer.x = panzerArr[i].x - panzer.width - 1;
                    return true;;
                }
            }
        }
    }
    return false;
}
/*
 6.09.2024 остановился на том что бы обновлялся сенсор бонуса у выбраннного танка
 */
