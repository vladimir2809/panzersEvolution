var canvas = null;
var context = null;
/*var canvasWidth = 1024;
var canvasHeight = 600*/;
let screenWidth = 1024;//option[numOption].widthScreenBlock*mapSize;// ширина экрана
let screenHeight = 768;// option[numOption].heightScreenBlock*mapSize;// высота экрана
var windowWidth = 1024;//document.documentElement.clientWidth;
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

var modeGame = 'HERO';// 'GOD', 'HERO', 'EGREGOR'
var numSelectPanzer = 0;
var numGenesPanzer = 0;
var distAttack = 300;
var minusEnergyMove = 2;
var imageArr=new Map();// массив картинок
var nameImageArr = ['energy','patrons','HP'];
var countLoadImage=0;// количество загруженных картинок
var countLoopIter = 0;
var sensorValue = 0;
var helperArr = [];
var progresslevel = [];
var maxLevel = 25;
var testFlagDirParam = true;
var panzer = {
    being: true,
    x:1,
    y:1,
    width: 35,
    height: 35,
    sizeTower: 7,
    color: 'white',
    angleBody: 270,
    angleTower: 270,
    dir:0,
    speed:10,
    maxHP: 1000,
    HP: 1000,
    maxEnergy: 5000,
    energy: 5000,
    countPatrons:10,
    damage:10,// урон
    accuracy:75,// точность 
    speedAttack: 70,
    timeAttack: 30,
    countAttack: 0,
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
        collis: 0,
    }
}
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
                        progresslevel[panzerArr[this.bulletArr[num].master].level])
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
                        panzerArr[this.bulletArr[num].master].level--;
                        addParamPanzer(panzerArr[this.bulletArr[num].master], false);
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
        collis:0,
    }
    this.memory={
        M1: 0,
        M2: 0,
        M3: 0,
        M4: 0,

        MC1: 0,
        MC2: 0,
        MC3: 0,
        MC4: 0,
    }

    this.typeDataValue = [
        {
            name: 'numMin0Max7',
            valueMin: 0,
            valueMax: 7,
        },
        {
            name: 'numMin0Max1',
            valueMin: 0,
            valueMax: 1,
        },
        {
            name: 'numQuanCommand',
            valueMin: 0,
            valueMax: this.quantityCommand,
        },

    ],
    this.commandDescr = [
        {
            name: 'move',
            valueArr:[
                {
                    type:'numMin0Max7',
                },
            ],
            countValue: null,
            
        },
        {
            name: 'goto',
            valueArr:[
                {
                    type:'numQuanCommand',
                },
            ],
            countValue: null,  
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

    this.initCommandRand = function()
    {
        for (let i = 0; i < this.quantityCommand;i++)
        {
            let R1 = randomInteger(0,this.commandDescr.length-1);
            let randArr = [];
            for (let j = 0; j < this.commandDescr[R1].countValue;j++)
            {
                let min = null;
                let max = null;
                for (let k = 0; k < this.typeDataValue.length;k++)
                {
                    if (this.typeDataValue[k].name==this.commandDescr[R1].valueArr[j].type)
                    {
                        //alert(123);
                        min = this.typeDataValue[k].valueMin;
                        max = this.typeDataValue[k].valueMax;
                    }
                }
                //alert(min+' '+ max);
                randArr.push(randomInteger(min,max));
               
            }
            //alert(randArr[0]);
            //console.log(randArr);
            let commandOne = JSON.parse(JSON.stringify(this.command));
            commandOne.name = this.commandDescr[R1].name;
            for (let k = 0; k < randArr.length;k++)
            {
                commandOne.values[k] = randArr[k];

            }
            this.commandArr.push(commandOne);
        }
        console.log(this.commandArr);
    }
    this.draw = function (context) 
    {
        let x = 820;
        y = 10;
        context.fillStyle = 'blue';
        context.fillRect(x,y,100,580);
        context.fillStyle = 'white';
        context.font = '10px Arial';
        let addX = 30;
        for (let i = 0; i < this.commandArr.length;i++)
        {

            if (i==this.selectCommand)
            {
                context.fillStyle = '#964b00 ';
                context.fillRect(x,y+i*12+4,100,12);
            }
            context.fillStyle = 'white';
            context.fillText(this.commandArr[i].name,x+3,y+i*12+12);
            for (let j = 0; j < this.commandArr[i].values.length;j++)
            {
                context.fillText(this.commandArr[i].values[j],x+addX+j*addX,y+i*12+12);

            }
        }
        
        let index = 0;
        addX = 45;
        let multY = 18;
        colorText = 'white';
        y += 10;
        x += 85;
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
        y += multY * 7;
        for (prop in this.memory)
        {
            context.fillStyle = "blue";
            context.fillRect(x + /*85 +*/ addX * 2-4, y + index * multY + multY/3+1, 30, 15);
            context.fillStyle = colorText;
            context.fillText(prop,x+/*85+*/addX,y+index*multY+multY);

            context.fillText(this.memory[prop],x+/*85+*/addX*2,y+index*multY+multY);
            index++;
            if (index == 4) y += 20;
        }
    }
    this.setData=function(data,sensor,state)
    {
     //   console.log(data);
        this.commandArr = [];
        for (let i = 0;i< data.commandArr.length;i++)
        {
            this.commandArr.push(data.commandArr[i]);
        }
        this.sensor =JSON.parse(JSON.stringify(sensor))
        this.state =JSON.parse(JSON.stringify(state))
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
    setInterval(function () {
        drawAll();
        update();
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
                            'Digit1','Digit2','Digit3','Digit4','Digit5','KeyQ',]);
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
        colorArr.push(color);
    }
    console.log(colorArr);
    // инициализируем progressLevel
    for (let i = 1; i < maxLevel;i++)
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
        do {
            let x = randomInteger(0,Math.trunc(map.width / wall.width)-1);
            let y = randomInteger(0,Math.trunc(map.height / wall.width)-1);;
            panzerOne.x = x * wall.width;
            panzerOne.y = y * wall.width;
 
        } while (collisionPanzerWall(panzerOne) == true ||
            collisionPanzerToPanzer(panzerOne,null) == true);
        let index = i % quantityColor;
        panzerOne.color = colorArr[index];
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
    //console.log(wallArr);
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
        if (visibleEnemy(numSelectPanzer,i)!=true)
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
  /*  context.fillStyle = 'green';
    context.fillRect(helper.x-camera.x,helper.y-camera.y,helper.width,helper.height);*/
    context.fillStyle = 'gray';
    context.fillRect(camera.width,1,widthSide,screenHeight);
    context.fillRect(1,camera.height,screenWidth,heightSide);
    genes.draw(context);

    context.font='25px Arial';
    context.fillStyle = 'red';
    context.fillText("Steps: "+countLoopIter, 1,620);

    context.font='25px Arial';
    context.fillStyle = 'blue';
    context.fillText("numGenesPanzer: "+numGenesPanzer, 1,650);
   
    context.font='25px Arial';
    context.fillStyle = 'green';
    context.fillText("Sensor: "+sensorValue, 1,690);


   
    context.font='25px Arial';
    context.fillStyle = 'green';
    context.fillText("Sensor: "+sensorValue, 1,690);
    /*рисуем уровень и параметры танка*/
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
    drawParamPanzer(300,650,numP)
   
    
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
    let R = randomInteger(0, 4);
    if (numParam != null) R = numParam;
    if (R==0)
    {
        plus == true ? panzer.maxHP *= 1.1 : panzer.maxHP /= 1.1;
        if (panzer.maxHP > maxParam.maxHP) panzer.maxHP = maxParam.maxHP;
        panzer.HP = panzer.maxHP;
    }
    if (R==1)
    {
        plus == true ? panzer.speed *= 1.1 : panzer.speed /= 1.1;
        if (panzer.speed > maxParam.speed) panzer.speed = maxParam.speed;
    }
    if (R==2)
    {
        plus == true ? panzer.damage *= 1.1 : panzer.damage /= 1.1;
        if (panzer.damage > maxParam.damage) panzer.damage = maxParam.damage;
    }
    if (R==3)
    {
        plus == true ? panzer.accuracy *= 1.05 : panzer.accuracy /= 1.05;
        if (panzer.accuracy > maxParam.accuracy) panzer.accuracy = maxParam.accuracy;
    }
    if (R==4)
    {
        plus == true ? panzer.speedAttack *= 1.1 : panzer.speedAttack /= 1.1;
        if (panzer.speedAttack > maxParam.speedAttack) panzer.speedAttack = maxParam.speedAttack;
        panzer.timeAttack = maxParam.speedAttack - panzer.speedAttack;
    }

}
function update() 
{
  
    let countBeingPanzer = 0;
    if (modeGame == 'GOD') cameraMove();
    if (keyUpDuration('KeyQ',1000)==true)
    {
        testFlagDirParam = !testFlagDirParam;
        alert('flag='+testFlagDirParam);
    }
    for (let i = 1; i <= 5;i++)
    {
        if (keyUpDuration('Digit'+i,1000)==true)
        {
            addParamPanzer(panzerArr[numSelectPanzer], testFlagDirParam, i - 1);
        }
    }
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        {

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
            countBeingPanzer++;

        }
        
    }

    killedPanzers();
    bullets.update();
    bullets.collisionBullet(wallArr);
    burst.update();
    bonuses.update();
    if (modeGame=='GOD' )
    {
        if (mouseLeftClick()==true)
        for (let i = 0; i < panzerArr.length;i++)
        {
            if (checkInObj(panzerArr[i],mouseX/scale+camera.x,mouseY/scale+camera.y))
            {
                numGenesPanzer = i;
               
            }
        }
        genes.setData(panzerArr[numGenesPanzer].genes,
                    panzerArr[numGenesPanzer].sensor,
                    panzerArr[numGenesPanzer].state);
        genes.setSelectCommand(panzerArr[numGenesPanzer].selectCommand);

    }
    if (modeGame=='HERO')
    {
        {
            numGenesPanzer = numSelectPanzer;
            genes.setData(panzerArr[numSelectPanzer].genes,
                panzerArr[numSelectPanzer].sensor,
                panzerArr[numSelectPanzer].state);
        }
        

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
    
    
    if (countBeingPanzer>0)countLoopIter++;
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
}
function killedPanzers()
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].HP<=0 || panzerArr[i].energy<=0)
        {
            panzerArr[i].being = false;
        }
    }
}

function updateBarrierVisible()
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
function updateSensorPanzer(panzer,numP,barrierArr)
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
        if (visibleEnemy(numP,i)==false)
        {
            dist = calcDist(panzerArr[numP].centerX, panzerArr[numP].centerY,
                panzerArr[i].centerX, panzerArr[i].centerY);
            flagVis = true;
            if (dist<minDist)
            {
                panzer.sensor.enemy = angleIm(panzerArr[numP].centerX, panzerArr[numP].centerY,
                            panzerArr[i].centerX, panzerArr[i].centerY);
            }
        }
    }
    if (flagVis==false)
    {
        panzer.sensor.enemy = null;
    }

    
    
}
function visibleEnemy(numP1,numP2)
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
        return false;
    }
    //}
    return true;

}
function checkObjVisible(panzer,obj,barrierArr)
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
function controlHumanPanzer(panzer,numP)
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
    if (checkMouseLeft() && panzer.countAttack>panzer.timeAttack && panzer.countPatrons>0)
    {
        panzer.countAttack = 0;
        bullets.shot(panzer.towerX1,panzer.towerY1,
                panzer.angleTower+mixingShot(panzer.accuracy),100,numP);
        panzer.countPatrons--;
    }  
    panzer.energy -= minusEnergyMove/40;
}
function completeGenesPanzer(panzer,numP)
{
    let select = panzer.selectCommand;
    //console.log(panzer.selectCommand);
    if (panzer.genes.commandArr[select].name=='move')
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
        }

        if (value==6)
        {
            panzer.angleTower -= 10;
        }

        if (panzer.countAttack<panzer.countAttack+10) 
        {
            panzer.countAttack++;
        }
        if (value==0)
        {
            if (panzer.countAttack>=panzer.timeAttack && panzer.countPatrons>0)
            {
                bullets.shot(panzer.towerX1,panzer.towerY1,
                            panzer.angleTower+mixingShot(panzer.accuracy),30,numP);
                panzer.countAttack = 0;
                panzer.countPatrons--;
            }
        }
        select++;// переход на следуюшию команду
    }
    else if (panzer.genes.commandArr[select].name=='goto')
    {
        let value = panzer.genes.commandArr[select].values[0];
        select += value;
    }
    
    select %= new Genes().quantityCommand;
    panzer.selectCommand = select;
    panzer.energy -= minusEnergyMove / 40;;
}

function collisionPanzerWall(panzer)
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
function collisionRectangleMap(panzer)
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
function collisionPanzerToPanzer(panzer,num)
{
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (num!=i && panzerArr[i].being==true)
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
