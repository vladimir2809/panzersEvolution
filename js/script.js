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
var quantityColor = 64;
var quantityBullet = 150;
var quantityBurst = 500;
var quantityPanzer = 64;
var quantityWall = 64;

var modeGame = 'GOD';// 'GOD', 'HERO', 'EGREGOR'
var numSelectPanzer = 0;
var distAttack = 300;
var minusEnergyMove = 2;
var panzer = {
    being: true,
    x:1,
    y:1,
    width: 35,
    height: 35,
    sizeTower: 7,
    color: 'white',
    angleBody: 0,
    angleTower: 0,
    dir:0,
    speed:10,
    maxHP: 1000,
    HP: 1000,
    maxEnergy: 1000,
    energy: 1000,
    towerX:null,
    towerY: null,
    towerX1: null,
    towerY1: null,
    towerLength: 10,
    timeAttack: 30,
    countAttack: 0,

    genes: null,
    selectCommand:0,
}
var wall = {
    x:null,
    y:null,
    width: size,
    height: size,
    type: 0,
    color: 'grey',
}
var map = {
    x:0,
    y:0,
    width: 800*2,
    height: 600*2,
}
var camera = {
    x:0,
    y:0,
    width: 800,
    height: 600, 
}
var  widthSide = screenWidth - camera.width;
var  heightSide = screenHeight - camera.height;
var Bullets = function () { 
   

    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        dist: 0,
        DMG:null,
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
	            context.arc(this.bulletArr[i].x-camera.x,this.bulletArr[i].y-camera.y, 2, 2*Math.PI, false);
	            context.fill();
	            context.lineWidth = 1;
	            context.strokeStyle = 'red';
	            context.stroke();
                countTrue++;
            }
        }
        context.fillText(countTrue+'',20,50);
    }
    this.shot=function(x,y,angle,DMG)
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
                    this.collisionWalls(wallArr,i);
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
    this.collisionWalls=function(walls,num=null)
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
                context.arc(burst.x-camera.x,burst.y-camera.y, burst.count, 0,3.14*2, false);
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
var Genes = function () {
    this.quantityCommand = 48;
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
    /*    {
            name: 'rot',
            valueArr:[
                {
                    type:'numMin0Max1',
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
        },*/
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
            console.log(randArr);
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
        let addX = 34;
        for (let i = 0; i < this.commandArr.length;i++)
        {
            context.fillText(this.commandArr[i].name,x+3,y+i*12+12);
            for (let j = 0; j < this.commandArr[i].values.length;j++)
            {
                context.fillText(this.commandArr[i].values[j],x+addX+j*addX,y+i*12+12);

            }
        }
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
function preload() 
{
    
}
function create()
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    initKeyboardAndMouse(['KeyA', 'KeyW', 'KeyS', 'KeyD',"NumpadSubtract"]);
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
    // инициализируем стены
    for (let i = 0; i < quantityWall;i++)
    {
        let wallOne=JSON.parse(JSON.stringify(wall));
        let x = randomInteger(0,Math.trunc(map.width / wallOne.width)-1);
        let y = randomInteger(0,Math.trunc(map.height / wallOne.width)-1);;
        wallOne.x = x * wallOne.width;
        wallOne.y = y * wallOne.width;
        wallArr.push(wallOne);
    }
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
        gs = new Genes();
        gs.initCommandRand();
        panzerOne.genes = gs.commandArr;
        //console.log(panzerOne);
        panzerArr.push(panzerOne);
        updateStatePanzer(panzerArr[i]);
    }
    console.log(panzerArr);
    bullets = new Bullets();
    bullets.init();
    burst = new Burst();
    burst.init();
    genes = new Genes();
    genes.initCommandRand();
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
    bullets.drawBullets(context);
    burst.draw();
    context.fillStyle = 'red';
    context.fillText(mouseX+' '+mouseY, 1,20);
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        {

            let width = size;
            if (panzerArr[i].HP>0)
            {

                context.fillStyle = "green";
                context.fillRect(panzerArr[i].x-camera.x-2,panzerArr[i].y-camera.y-5,
                        width*panzerArr[i].HP/panzerArr[i].maxHP,4);
            }
            if (panzerArr[i].energy>0)
            {
                context.fillStyle = "blue";
                context.fillRect(panzerArr[i].x-camera.x-2,panzerArr[i].y-camera.y-10,
                            width*panzerArr[i].energy/panzerArr[i].maxEnergy,4);
            }
        }
    }
  /*  if (flagScaling==true)
    {
        context.scale(0.5,0.5);
        flagScaling = false;

    }*/
   // context.restore();
    context.fillStyle = 'gray';
    context.fillRect(camera.width,1,widthSide,screenHeight);
    context.fillRect(1,camera.height,screenWidth,heightSide);
    genes.draw(context);
    
}
function drawWall(wall)
{
    context.fillStyle = wall.color;
    context.fillRect(wall.x-camera.x, wall.y-camera.y, wall.width+1, wall.height+1);
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
  
    context.translate(panzer.x + panzer.width / 2-camera.x, 
                panzer.y + panzer.height / 2-camera.y); // translate to rectangle center



    context.rotate((Math.PI / 180) * (panzer.angleBody+90)/*Math.trunc(panzer.angleBody/90)*90*/); // rotate

    context.translate(-(panzer.x + panzer.width / 2-camera.x),
                -(panzer.y + panzer.height / 2-camera.y)); // translate back

    context.lineWidth = 1;
    //рисуем тело танка
    context.strokeRect(panzer.x-camera.x, panzer.y-camera.y, panzer.width*multSide, panzer.height);
    let addX = panzer.width - panzer.width * multSide;
    context.strokeRect(panzer.x-camera.x+addX, panzer.y-camera.y, panzer.width*multSide, panzer.height);
    context.strokeRect(panzer.x-camera.x+panzer.width*multSide, panzer.y-camera.y+panzer.height*multSide,
                    panzer.width-panzer.width*multSide*2, panzer.height-panzer.height*multSide*2);

    // рисуем кружок башни
    context.beginPath();
    context.arc(panzer.x-camera.x + panzer.width / 2, panzer.y-camera.y + panzer.height / 2, panzer.sizeTower, 0,3.14*2, false);
    context.stroke();

    context.restore();
    
    // рисуем пушку
    context.beginPath();
    context.lineWidth = 3;
    context.moveTo(panzer.towerX-camera.x,panzer.towerY-camera.y);
    context.lineTo(panzer.towerX1-camera.x,panzer.towerY1-camera.y);
    context.stroke();  
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
function update() 
{
    if (keyUpDuration('NumpadSubtract',100)==true)
    {
        scale*=0.75;
    }
    if (modeGame == 'GOD') cameraMove();
    for (let i = 0; i < panzerArr.length;i++)
    {
        if (panzerArr[i].being==true)
        {

            if (numSelectPanzer==i && modeGame=='HERO')
            {
                controlHumanPanzer(panzerArr[i]);
     
          
            }
            else
            {
                completeGenesPanzer(panzerArr[i]);
            }
        
            collisionPanzerWall(panzerArr[i]);
            collisionRectangleMap(panzerArr[i]);
            collisionPanzerToPanzer(panzerArr[i],i)
        
            updateStatePanzer(panzerArr[i]);
        }
        
    }
    killedPanzers();
    bullets.update();
    bullets.collisionWalls(wallArr);
    burst.update();
    //console.log(mouseX, mouseY);
}
function updateStatePanzer(panzer)
{
    let centerX = panzer.x + panzer.width / 2;
    let centerY = panzer.y + panzer.height / 2;
    panzer.towerY = centerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerX = centerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.sizeTower;
    panzer.towerY1 = panzer.towerY + Math.sin((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;
    panzer.towerX1 = panzer.towerX + Math.cos((Math.PI / 180) * panzer.angleTower) * panzer.towerLength;
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
function controlHumanPanzer(panzer)
{
    let minusEnergy = minusEnergyMove / 10;;
    if (checkPressKey('KeyW') == true && panzer.dir!=0)
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

    if (checkPressKey('KeyA') == true && panzer.dir!=3) 
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
    let angleAim=angleIm(rotateXY.x,rotateXY.y,mouseX,mouseY);
    // плавно поварачиваем башню танка                             
    panzer.angleTower=movingToAngle(panzer.angleTower,angleAim,100);
    //console.log(panzer.angleTower);
    if (panzer.countAttack<panzer.countAttack+20)
    {
        panzer.countAttack++;
    }
    if (checkMouseLeft() && panzer.countAttack>panzer.timeAttack)
    {
        panzer.countAttack = 0;
        bullets.shot(panzer.towerX1,panzer.towerY1,panzer.angleTower,100);
    }  
    panzer.energy -= minusEnergyMove/40;
}
function completeGenesPanzer(panzer)
{
    let select = panzer.selectCommand;
    //console.log(panzer.selectCommand);
    if (panzer.genes[select].name=='move')
    {
        value = panzer.genes[select].values[0];
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
            if (panzer.countAttack>=panzer.timeAttack)
            {
                bullets.shot(panzer.towerX1,panzer.towerY1,panzer.angleTower,30);
                panzer.countAttack = 0;
            }
        }
    }
    select++;//     quantityCommand
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